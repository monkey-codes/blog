import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import TurndownService from 'turndown';

const GHOST_EXPORT = 'resources/johan-zietsman.ghost.2026-03-12-22-47-19.json';
const OUTPUT_DIR = 'src/content/blog';
const includeDrafts = process.argv.includes('--drafts');

interface GhostPost {
	id: string;
	title: string;
	slug: string;
	html: string | null;
	status: 'published' | 'draft';
	published_at: string | null;
	updated_at: string | null;
	custom_excerpt: string | null;
	feature_image: string | null;
}

interface GhostTag {
	id: string;
	name: string;
	slug: string;
}

interface GhostPostTag {
	post_id: string;
	tag_id: string;
	sort_order: number;
}

const data = JSON.parse(readFileSync(GHOST_EXPORT, 'utf-8'));
const db = data.db[0].data;

const posts: GhostPost[] = db.posts;
const tags: GhostTag[] = db.tags;
const postsTags: GhostPostTag[] = db.posts_tags;

// Build tag lookup
const tagById = new Map(tags.map((t) => [t.id, t]));

// Build post -> tags mapping
const postTagMap = new Map<string, string[]>();
for (const pt of postsTags.sort((a, b) => a.sort_order - b.sort_order)) {
	const tag = tagById.get(pt.tag_id);
	if (!tag) continue;
	const existing = postTagMap.get(pt.post_id) ?? [];
	existing.push(tag.name);
	postTagMap.set(pt.post_id, existing);
}

const turndown = new TurndownService({
	headingStyle: 'atx',
	codeBlockStyle: 'fenced',
});

// Preserve code blocks with language
turndown.addRule('fencedCodeBlock', {
	filter: (node) => {
		return (
			node.nodeName === 'PRE' &&
			node.firstChild !== null &&
			node.firstChild.nodeName === 'CODE'
		);
	},
	replacement: (_content, node) => {
		const code = node.firstChild as HTMLElement;
		const className = code.getAttribute('class') || '';
		const langMatch = className.match(/language-(\S+)/);
		const lang = langMatch ? langMatch[1] : '';
		const text = code.textContent || '';
		return `\n\`\`\`${lang}\n${text}\n\`\`\`\n`;
	},
});

mkdirSync(OUTPUT_DIR, { recursive: true });

let count = 0;
for (const post of posts) {
	if (post.status === 'draft' && !includeDrafts) continue;

	const isDraft = post.status === 'draft';
	const html = (post.html || '').replace(/__GHOST_URL__/g, '');
	const markdown = turndown.turndown(html);
	const postTags = postTagMap.get(post.id) ?? [];

	const pubDate = post.published_at
		? new Date(post.published_at).toISOString().split('T')[0]
		: new Date().toISOString().split('T')[0];
	const updatedDate = post.updated_at
		? new Date(post.updated_at).toISOString().split('T')[0]
		: undefined;

	const frontmatter = [
		'---',
		`title: ${JSON.stringify(post.title)}`,
		`description: ${JSON.stringify(post.custom_excerpt || '')}`,
		`pubDate: ${pubDate}`,
	];

	if (updatedDate && updatedDate !== pubDate) {
		frontmatter.push(`updatedDate: ${updatedDate}`);
	}

	if (post.feature_image) {
		const heroImage = post.feature_image.replace(/__GHOST_URL__/g, '');
		frontmatter.push(`heroImage: ${JSON.stringify(heroImage)}`);
	}

	if (postTags.length > 0) {
		frontmatter.push(`tags: ${JSON.stringify(postTags)}`);
	}

	if (isDraft) {
		frontmatter.push('draft: true');
	}

	frontmatter.push('---');

	const content = frontmatter.join('\n') + '\n\n' + markdown + '\n';
	const filename = `${post.slug}.md`;
	writeFileSync(join(OUTPUT_DIR, filename), content);
	count++;
	console.log(`${isDraft ? '[draft] ' : ''}${filename}`);
}

console.log(`\nMigrated ${count} posts to ${OUTPUT_DIR}/`);
