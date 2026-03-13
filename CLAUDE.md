# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog (johanzietsman.com / "monkey codes") built with Astro 6, using MDX, Tailwind CSS v4, and content collections. Migrated from Ghost CMS.

## Commands

- **Dev server:** `pnpm dev` (localhost:4321)
- **Build:** `pnpm build` (outputs to `./dist/`)
- **Preview build:** `pnpm preview`
- **Migrate Ghost posts:** `npx tsx scripts/migrate-ghost.ts` (add `--drafts` to include drafts)
- **Restore gists:** `npx tsx scripts/restore-gists.ts`
- **Task runner:** Uses [Taskfile](https://taskfile.dev/) (`task dev`, `task build`, `task preview`, `task migrate`)

Package manager is **pnpm**. Requires Node >= 22.12.0.

## Architecture

- **Content collections:** Blog posts live in `src/content/blog/` as `.md`/`.mdx` files. Schema defined in `src/content.config.ts` with fields: `title`, `description`, `pubDate`, `updatedDate?`, `heroImage?`, `tags[]`, `draft` (boolean).
- **Pages:** `src/pages/` — file-based routing. Blog listing at `/blog/`, RSS at `/rss.xml`.
- **Layouts:** `BlogPost.astro` wraps individual posts.
- **Components:** `Gist.astro` for embedding GitHub gists.
- **Migration pipeline:** `scripts/migrate-ghost.ts` reads a Ghost JSON export from `resources/`, converts HTML to Markdown via Turndown, and writes content files to `src/content/blog/`.
- **Styling:** Tailwind CSS v4 via Vite plugin (not PostCSS). Styles in `src/styles/`.
- **Site config:** `astro.config.mjs` — integrations: MDX, Sitemap. Site constants in `src/consts.ts`.
