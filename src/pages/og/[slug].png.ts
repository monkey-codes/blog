import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

const INTER_BOLD = await fetch(
	'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff'
).then((res) => res.arrayBuffer());

const JETBRAINS_MONO = await fetch(
	'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.woff'
).then((res) => res.arrayBuffer());

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	return posts.map((post) => ({
		params: { slug: post.id },
		props: {
			title: post.data.title,
			description: post.data.description,
			tags: post.data.tags,
			pubDate: post.data.pubDate,
		},
	}));
};

export const GET: APIRoute = async ({ props }) => {
	const { title, description, tags, pubDate } = props;

	const formattedDate = new Date(pubDate).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					height: '100%',
					backgroundColor: '#0f1117',
					padding: '60px',
				},
				children: [
					// Top bar with accent line
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								width: '100%',
								height: '4px',
								backgroundColor: '#e8943a',
								borderRadius: '2px',
								marginBottom: '48px',
							},
						},
					},
					// Title
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								fontSize: title.length > 60 ? 40 : 52,
								fontFamily: 'Inter',
								fontWeight: 700,
								color: '#e8e6e3',
								lineHeight: 1.2,
								marginBottom: '20px',
							},
							children: title,
						},
					},
					// Description
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								fontSize: 22,
								fontFamily: 'Inter',
								color: '#9b9aa0',
								lineHeight: 1.5,
								marginBottom: '32px',
							},
							children:
								description.length > 120 ? description.slice(0, 117) + '...' : description,
						},
					},
					// Spacer
					{
						type: 'div',
						props: {
							style: { display: 'flex', flex: '1' },
						},
					},
					// Tags
					...(tags.length > 0
						? [
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											flexWrap: 'wrap' as const,
											gap: '8px',
											marginBottom: '24px',
										},
										children: tags.slice(0, 4).map((tag: string) => ({
											type: 'div',
											props: {
												style: {
													display: 'flex',
													fontSize: 14,
													fontFamily: 'JetBrains Mono',
													color: '#d4893a',
													backgroundColor: 'rgba(232, 148, 58, 0.1)',
													border: '1px solid rgba(232, 148, 58, 0.2)',
													borderRadius: '6px',
													padding: '4px 12px',
												},
												children: tag,
											},
										})),
									},
								},
							]
						: []),
					// Bottom: date + site name
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								borderTop: '1px solid #2a2d3e',
								paddingTop: '20px',
							},
							children: [
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											fontSize: 16,
											fontFamily: 'JetBrains Mono',
											color: '#6b6a70',
										},
										children: formattedDate,
									},
								},
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											fontSize: 18,
											fontFamily: 'Inter',
											fontWeight: 700,
											color: '#e8943a',
										},
										children: 'johanzietsman.com',
									},
								},
							],
						},
					},
				],
			},
		},
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Inter',
					data: INTER_BOLD,
					weight: 700,
					style: 'normal',
				},
				{
					name: 'JetBrains Mono',
					data: JETBRAINS_MONO,
					weight: 400,
					style: 'normal',
				},
			],
		}
	);

	const resvg = new Resvg(svg, {
		fitTo: { mode: 'width', value: 1200 },
	});
	const png = resvg.render().asPng();

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
