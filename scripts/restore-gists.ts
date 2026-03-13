import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const GHOST_EXPORT = 'resources/johan-zietsman.ghost.2026-03-12-22-47-19.json';
const BLOG_DIR = 'src/content/blog';

// ─── Types ───────────────────────────────────────────────────────────

interface GistInfo {
	id: string;
	user: string;
	type: 'details' | 'inline';
	summaryText?: string;
	anchor?: string;
}

interface PostGists {
	slug: string;
	gists: GistInfo[];
}

// ─── HTML helpers ────────────────────────────────────────────────────

function decodeEntities(s: string): string {
	return s
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ');
}

function stripHtml(s: string): string {
	return s.replace(/<[^>]+>/g, '');
}

function normalizeWs(s: string): string {
	return s.replace(/\s+/g, ' ').trim();
}

function plainText(html: string): string {
	return normalizeWs(decodeEntities(stripHtml(html)));
}

// ─── Step 1: Extract gist info from Ghost JSON ──────────────────────

function extractGists(): PostGists[] {
	const data = JSON.parse(readFileSync(GHOST_EXPORT, 'utf-8'));
	const posts = data.db[0].data.posts as {
		slug: string;
		html: string | null;
		status: string;
	}[];

	const result: PostGists[] = [];

	for (const post of posts) {
		if (post.status !== 'published' || !post.html) continue;
		const html = post.html;

		const scriptRegex =
			/<script src="https:\/\/gist\.github\.com\/([^"]+)"[^>]*><\/script>/g;
		let match: RegExpExecArray | null;
		const gists: GistInfo[] = [];

		while ((match = scriptRegex.exec(html)) !== null) {
			const rawPath = match[1].replace(/\n/g, '');
			const parts = rawPath.replace(/\.js$/, '').split('/');
			const user = parts[0];
			const id = parts[1];

			// Check if inside a <details> block
			const before = html.substring(
				Math.max(0, match.index - 500),
				match.index,
			);
			const detailsIdx = before.lastIndexOf('<details');
			const detailsEndIdx = before.lastIndexOf('</details>');
			const inDetails = detailsIdx !== -1 && detailsIdx > detailsEndIdx;

			if (inDetails) {
				const summaryMatch = before
					.substring(detailsIdx)
					.match(/<summary>([\s\S]*?)<\/summary>/);
				const summaryText = summaryMatch
					? plainText(summaryMatch[1])
					: 'Unknown';
				gists.push({ id, user, type: 'details', summaryText });
			} else {
				// Get anchor text: strip all prior gist scripts, then get last text
				const allBefore = html.substring(0, match.index);
				const stripped = allBefore
					.replace(/<script[^>]*><\/script>/g, '')
					.trimEnd();
				const tail = stripped.slice(-800);
				const anchor = plainText(tail).slice(-80);
				gists.push({ id, user, type: 'inline', anchor });
			}
		}

		if (gists.length > 0) {
			result.push({ slug: post.slug, gists });
		}
	}

	return result;
}

// ─── Step 2: Insert gists into markdown files ────────────────────────

function stripMarkdownFormatting(s: string): string {
	return s
		.replace(/\\\\/g, '\x00') // preserve escaped backslashes
		.replace(/\\([_*`[\]()#>~])/g, '$1') // unescape markdown chars
		.replace(/\x00/g, '\\') // restore escaped backslashes
		.replace(/\*\*(.+?)\*\*/g, '$1') // bold
		.replace(/\*(.+?)\*/g, '$1') // italic
		.replace(/_(.+?)_/g, '$1') // italic
		.replace(/`(.+?)`/g, '$1') // inline code
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // links
}

function findAnchorLine(
	lines: string[],
	anchor: string,
	startLine: number,
): number {
	// Try progressively shorter suffixes of the anchor
	for (let len = Math.min(anchor.length, 60); len >= 12; len -= 4) {
		const searchText = anchor.slice(-len);
		for (let i = startLine; i < lines.length; i++) {
			const linePlain = normalizeWs(
				stripMarkdownFormatting(decodeEntities(lines[i])),
			);
			if (linePlain.includes(searchText)) {
				return i;
			}
		}
	}
	return -1;
}

function normalizeForComparison(s: string): string {
	// Aggressively normalize: strip all markdown formatting, escapes, and emphasis markers
	return normalizeWs(
		s
			.replace(/\\/g, '') // remove all backslash escapes
			.replace(/[_*]/g, '') // remove emphasis markers
			.replace(/`(.+?)`/g, '$1') // inline code
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'), // links
	);
}

function findSummaryLine(
	lines: string[],
	summaryText: string,
	startLine: number,
): number {
	const normalizedSummary = normalizeForComparison(summaryText);
	for (let i = startLine; i < lines.length; i++) {
		const normalizedLine = normalizeForComparison(lines[i]);
		if (normalizedLine === normalizedSummary) return i;
		if (normalizedLine.includes(normalizedSummary)) return i;
	}
	return -1;
}

function gistTag(gist: GistInfo): string {
	if (gist.user === 'monkey-codes') {
		return `<Gist id="${gist.id}" />`;
	}
	return `<Gist id="${gist.id}" user="${gist.user}" />`;
}

function spliceLines(
	lines: string[],
	index: number,
	deleteCount: number,
	...newContent: string[]
): number {
	// Split each content string by newlines and flatten
	const newLines = newContent.flatMap((s) => s.split('\n'));
	lines.splice(index, deleteCount, ...newLines);
	return newLines.length;
}

function escapeMdxContent(lines: string[]): string[] {
	const result: string[] = [];
	let inFrontmatter = false;
	let frontmatterCount = 0;
	let inCodeBlock = false;

	for (const line of lines) {
		// Track frontmatter
		if (line.trim() === '---') {
			frontmatterCount++;
			if (frontmatterCount <= 2) {
				inFrontmatter = frontmatterCount === 1;
				result.push(line);
				continue;
			}
		}
		if (inFrontmatter) {
			result.push(line);
			continue;
		}

		// Track fenced code blocks
		if (line.startsWith('```')) {
			inCodeBlock = !inCodeBlock;
			result.push(line);
			continue;
		}
		if (inCodeBlock) {
			result.push(line);
			continue;
		}

		// Skip import lines and component tags
		if (
			line.startsWith('import ') ||
			line.trim().startsWith('<Gist ') ||
			line.trim().startsWith('<details') ||
			line.trim().startsWith('</details') ||
			line.trim().startsWith('<summary')
		) {
			result.push(line);
			continue;
		}

		// Escape { and } in regular content
		if (line.includes('{') || line.includes('}')) {
			// Escape { and } but preserve inline code backticks
			let escaped = '';
			let inInlineCode = false;
			for (let i = 0; i < line.length; i++) {
				const ch = line[i];
				if (ch === '`') {
					inInlineCode = !inInlineCode;
					escaped += ch;
				} else if (!inInlineCode && ch === '{') {
					escaped += "{'{'}";
				} else if (!inInlineCode && ch === '}') {
					escaped += "{'}'}";
				} else {
					escaped += ch;
				}
			}
			result.push(escaped);
		} else {
			result.push(line);
		}
	}

	return result;
}

function processPost(postGists: PostGists): void {
	const mdPath = join(BLOG_DIR, `${postGists.slug}.md`);
	const mdxPath = join(BLOG_DIR, `${postGists.slug}.mdx`);

	let content: string;
	try {
		content = readFileSync(mdPath, 'utf-8');
	} catch {
		console.warn(`  WARN: ${mdPath} not found, skipping`);
		return;
	}

	const lines = content.split('\n');

	// Find frontmatter end (second ---)
	let frontmatterEnd = -1;
	let dashCount = 0;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].trim() === '---') {
			dashCount++;
			if (dashCount === 2) {
				frontmatterEnd = i;
				break;
			}
		}
	}
	if (frontmatterEnd === -1) {
		console.warn(`  WARN: No frontmatter found in ${mdPath}`);
		return;
	}

	// Insert import after frontmatter
	lines.splice(
		frontmatterEnd + 1,
		0,
		"import Gist from '../../components/Gist.astro';",
	);

	let searchFrom = frontmatterEnd + 2;

	for (let gi = 0; gi < postGists.gists.length; gi++) {
		const gist = postGists.gists[gi];

		if (gist.type === 'details') {
			const summaryText = gist.summaryText!;
			const lineIdx = findSummaryLine(lines, summaryText, searchFrom);

			if (lineIdx === -1) {
				console.warn(
					`  WARN: Could not find summary "${summaryText}" in ${postGists.slug}`,
				);
				continue;
			}

			const currentLine = lines[lineIdx].trim();
			const currentLineStripped = stripMarkdownFormatting(currentLine);

			// Check if this line contains multiple summary texts
			const detailsGists: GistInfo[] = [gist];
			let nextGi = gi + 1;
			while (nextGi < postGists.gists.length) {
				const nextGist = postGists.gists[nextGi];
				if (
					nextGist.type === 'details' &&
					currentLineStripped.includes(nextGist.summaryText!)
				) {
					detailsGists.push(nextGist);
					nextGi++;
				} else {
					break;
				}
			}

			const replacement = detailsGists
				.map(
					(dg) =>
						`<details>\n<summary>${dg.summaryText}</summary>\n${gistTag(dg)}\n</details>`,
				)
				.join('\n\n');

			const inserted = spliceLines(lines, lineIdx, 1, replacement);
			searchFrom = lineIdx + inserted;
			gi = nextGi - 1;
		} else {
			// Inline gist — collect consecutive inline gists with the same anchor
			const anchor = gist.anchor!;
			const consecutiveGists: GistInfo[] = [gist];
			let nextGi = gi + 1;
			while (nextGi < postGists.gists.length) {
				const nextGist = postGists.gists[nextGi];
				if (nextGist.type === 'inline' && nextGist.anchor === anchor) {
					consecutiveGists.push(nextGist);
					nextGi++;
				} else {
					break;
				}
			}

			const lineIdx = findAnchorLine(lines, anchor, searchFrom);

			if (lineIdx === -1) {
				console.warn(
					`  WARN: Could not find anchor for gist ${gist.id} in ${postGists.slug}`,
				);
				console.warn(`         Anchor: "${anchor.slice(-40)}"`);
				gi = nextGi - 1;
				continue;
			}

			// Find end of paragraph/block element containing the anchor
			let insertAt = lineIdx + 1;
			while (
				insertAt < lines.length &&
				lines[insertAt].trim() !== '' &&
				!lines[insertAt].startsWith('#') &&
				!lines[insertAt].startsWith('```') &&
				!lines[insertAt].startsWith('*   ') &&
				!lines[insertAt].startsWith('- ') &&
				!lines[insertAt].startsWith('<')
			) {
				insertAt++;
			}

			const gistLines = consecutiveGists.map((g) => gistTag(g));
			const inserted = spliceLines(
				lines,
				insertAt,
				0,
				'',
				...gistLines,
			);
			searchFrom = insertAt + inserted;
			gi = nextGi - 1;
		}
	}

	const result = escapeMdxContent(lines).join('\n');
	writeFileSync(mdxPath, result);
	unlinkSync(mdPath);
	console.log(
		`  ✓ ${postGists.slug}.md → .mdx (${postGists.gists.length} gists)`,
	);
}

// ─── Main ────────────────────────────────────────────────────────────

const allPostGists = extractGists();
console.log(`Found ${allPostGists.length} posts with gists\n`);

for (const pg of allPostGists) {
	console.log(`Processing: ${pg.slug} (${pg.gists.length} gists)`);
	processPost(pg);
}

console.log('\nDone!');
