# Writing Style Guide

Conventions and patterns extracted from existing blog posts. Follow these when writing or editing posts.

## Voice & Tone

- **Professional yet conversational** — technical authority without being dry or academic
- **First person used freely** — "I wanted to explore", "I found", "I recommend"
- **Self-deprecating humor** — "This Code Monkey's attempt", "I'm a complete rails noob"; the "monkey codes" brand identity shows through
- **Confident but humble** — admits limitations openly ("this solution has a few weaknesses", "Due to the primitive implementation...")
- **Contractions used** — "it's", "that's", "don't" — keeps it approachable
- **No filler or fluff** — every sentence advances understanding
- **Encouraging** — "Hopefully it clarifies", "Ideally you will want to"

## Sentence & Paragraph Style

- **Moderate sentence length** (12–20 words average), mixing short punchy sentences with longer explanatory ones
- **Paragraphs are 2–4 sentences** before a new concept or heading
- **Active voice dominates** — "we can see...", "the tree will...", "Spring Boot provides..."
- **Dashes and parentheses** for inline clarification rather than footnotes
- **Technical terms italicized on first use** — `_Spring contexts_`, `_pure function_`, `_Virtual Hosts_`
- **Bold used sparingly** — reserved for structural emphasis like `**LIFO**`, `**Automated**`

## Post Structure (Canonical Pattern)

1. **Opening** — direct, problem-focused. Establishes what the post covers and why it matters. No lengthy philosophical preambles. Techniques vary:
   - Problem statement: "Lack of package design can lead to..."
   - Direct hook/question: "Unsure how to share authentication state between stateless microservices?"
   - Casual declaration: "I finally got around to doing it and I'm delighted with the outcome"
   - Motivational quote (rare): blockquote with attribution

2. **Conceptual explanation** — defines key terms, establishes context before diving into implementation. Layered approach: basic concepts first, then complexity.

3. **Practical implementation** — step-by-step with code examples. Setup/prerequisites included. Progressive complexity.

4. **Conclusion** — brief recap of key takeaways + GitHub source code link. Sometimes includes:
   - Forward reference to a follow-up post
   - Inspirational quote (e.g., Martin Fowler)
   - Practical advice or trade-off acknowledgment
   - "References" section with external links

## Heading Conventions

- **H2 (`##`)** for primary sections — typically 3–7 per post
- **H3 (`###`)** for subsections — rarely goes deeper
- **Headings are descriptive noun/gerund phrases**, not questions
  - Good: "Building the Distribution", "Overall System Architecture"
  - Avoid: "How does the distribution work?"
- Occasional creative headings: "Unusual Suspects", "Uninvited Guests At The Party"

## Code & Technical Content

- **Gist embeds** (`<Gist id="..." />`) for all non-trivial code — keeps markdown clean
- **Inline backticks** for code references in prose
- **Shell commands** shown with `$ ` prompt prefix in code blocks
- **3–8 code examples per post** typically
- **Purpose-driven snippets** — each demonstrates a specific concept, not exhaustive
- **Shows both good and bad patterns** when illustrating design principles
- **Collapsible sections** via `<details>/<summary>` for supplementary code
- **Specific versions, paths, and filenames** always included — detail-oriented

## Visual Elements

- **Architecture/system diagrams** before complex explanations (hosted on Cloudinary CDN)
- **2–4 images per post** — never excessive
- **Bullet lists** for alternatives, requirements, benefits, enumeration
- **Numbered lists** for procedures or sequential steps
- **Mathematical notation** (LaTeX) in algorithm posts: `$$O(n^2)$$`
- **GIF animations** for algorithm visualizations (interview prep posts)
- **Tables** used minimally — prose or bullet lists preferred

## Audience Assumptions

- **Intermediate-to-advanced developers** — does not explain git, command line, basic programming
- **Technology-specific context assumed** — Spring familiarity in Spring posts, REST API concepts, etc.
- **Defines domain concepts on first use** — but briefly, not tutorial-level
- **Includes setup steps** even for experienced readers (completeness)
- **Warns about common pitfalls** — "Identifying the right device is critical as you could destroy the VM"

## Frontmatter Conventions

```yaml
title: "Title in Quotation Marks"
description: "Brief, single-line summary"
pubDate: "YYYY-MM-DD"
updatedDate: "YYYY-MM-DD"  # optional
heroImage: "#..."           # often commented out
tags: [development, Spring, Docker]  # 1-4 tags, technology/category focused
draft: false                # boolean
```

- **Tags are technology/tool names** — `Spring`, `Docker`, `Rails`, `Algorithms`, `DevOps`
- **No thematic tags** like "tutorial" or "beginner"
- **Descriptions are single sentences** summarizing the post's value

## Post Types & Variations

| Type | Characteristics |
|------|----------------|
| **How-to/Tutorial** | Step-by-step, setup-first, complete working example, GitHub link |
| **Architecture/Design** | Diagrams prominent, system-level thinking, trade-off discussion |
| **Algorithm/CS Fundamentals** | Mathematical notation, complexity analysis, pseudocode before code |
| **Interview Prep (series)** | More structured, learning objectives, GIF animations, cross-references |
| **Exploration/Experiment** | More personal tone, "I wanted to see...", candid about results |

## Signature Patterns

- Nearly every post ends with **"The code can be found on [GitHub](...)"**
- **Cross-post references** link to related posts in the blog
- Posts are **self-contained** — include all setup steps rather than "see part 1"
- **"Code monkey"** identity woven into naming and self-reference
- **Blockquotes with attribution** for opening/closing quotes (used sparingly)
- **Practical reflection** in conclusions — acknowledges learning curves and trade-offs

## What to Avoid

- Long theoretical introductions before getting to the point
- Over-explaining basic concepts the audience already knows
- Excessive humor or personality that overshadows content
- Dense walls of inline code (use Gist embeds instead)
- Tags that describe format rather than technology
- Emojis (none used across any posts)
- Marketing language or clickbait phrasing
