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

## Resume App

A separate React SPA lives in `resume/` — an interactive resume that communicates with a Supabase backend. It is built with Vite + React 19 + Tailwind CSS v4 and shares the blog's color theme (defined independently in `resume/src/index.css`). Key details:

- **Dev server:** `task resume:dev`
- **Build:** `task resume:build` — outputs to `public/resume/`, which is gitignored
- **Full build:** `task build:all` — builds resume then blog
- **Base path:** `/resume/` — links must use `/resume/index.html` (GitHub Pages doesn't resolve trailing-slash index files)
- **Theme colors** are duplicated between `src/styles/global.css` and `resume/src/index.css` — keep them in sync
- **CTA color:** `--color-cta: #22c55e` (green) used for the "Ask AI About Me" button in the blog header

## Writing Style

When writing or editing blog posts, follow the conventions in [WRITING_GUIDE.md](WRITING_GUIDE.md).
