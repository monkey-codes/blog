---
title: "Specs Are Grown, Not Written — And Other Lessons from an AI Skills Audit"
description: "A self-assessment of the 7 skills every AI-augmented developer needs, from specification precision to token economics."
pubDate: 2026-03-27
tags: ["development", "ai"]
---

The skills that make an engineer marketable in 2026 aren't the ones I've been building for the last decade. They're adjacent — things like writing specs tight enough for a non-human to execute, evaluating output you didn't write at a pace you can't match, and knowing when an agent is quietly drifting off course. Most of us haven't deliberately practiced any of this.

I came across a [YouTube video](https://www.youtube.com/watch?v=4cuT-LKcmWs) that frames seven concrete skills for working effectively with AI. Rather than just nodding along, I decided to stress-test my own understanding. I had an AI interview me relentlessly on each skill — asking me to explain concepts in my own words, probing for real examples, and calling out gaps in my thinking.

Here's what I learned, and where I failed.

## Specification Precision

Humans read between the lines. They infer things without it being written down or stated explicitly. AI doesn't do that. If you leave too many gaps in the specification, it will make guesses to fill them — and those guesses lead to slop.

I learned this firsthand with a resume agent I built. It answers questions about my resume on my personal site. Without explicit instruction to be brief, it produced inappropriately long answers to simple questions. The output was technically correct — the spec had a gap in _how_ to respond, not _what_ to respond about.

There's a distinction between hard constraints and soft preferences that matters here. A hard constraint for my resume agent: never divulge my salary range. That would weaken my negotiation position for a new role. No context makes that acceptable. Hard constraints tend to come from real-world consequences — financial, legal, reputational — not technical considerations.

As developers, we already practice something close to this during sprint planning. The goal of a ticket is that it contains enough information for another developer to pick up and complete, ideally without needing more context. Acceptance criteria define when the work is done. Sometimes ticket writing goes hand in hand with a kickoff — developer, QA, and product owner meet to ensure alignment. With AI, all of that has to be captured explicitly in the specification. There's no kickoff. Every clarification must be anticipated and baked in upfront.

But you can't anticipate every edge case in one shot. What I've found works is starting with Matt Pocock's [grill-me skill](https://github.com/mattpocock/skills/tree/main/grill-me). Basically, get AI to relentlessly ask questions about a new feature you want to build, and slowly build up context for a PRD. It helps that this is conversational instead of trying to engineer a giant prompt upfront. Questions from AI uncover edge cases I haven't considered. From there: create a PRD, break it into smaller issues, then use a ralph loop to get an agent to complete the issues one by one.

The single most important lesson? Iterate on the specification. Create an interim spec and go deeper with another grill-me session. I think of specs as being _grown_ through iteration and challenging requirements. A good spec is very hard to do in one shot.

## Evaluation and Quality Judgment

When humans are unsure, it surfaces in the code as smells. If you're working in a team, you're aware of conversations happening on a specific feature, discussions about uncertainties. None of this happens with an agent. It can produce a large volume of code, confidently, without any of the friction an unsure human would surface. This combined with the speed tricks a human brain into thinking that AI knows what it is doing and must be correct.

This is the _fluency heuristic_ — polished output is assumed to be correct output. With AI, it's not just fluency that deceives. It's the _absence of friction_. Human uncertainty leaves traces. AI uncertainty is invisible.

I don't do anything fundamentally different when reviewing AI-generated code. Look for smells, things that don't look right or are unexpected, then ask AI to clarify its decisions. You have to be good at reading code, because you will have to scan a lot of it. But I realize this won't scale. AI produces in an hour what a team produces in a week. The review bottleneck becomes the human. Maybe it can be paired with static analysis or other AI steps to review PRs for the boring parts, reducing the volume a human has to scan.

A domain edge case for my resume agent: the agent could fabricate skills or experience to please the user asking questions, instead of honestly stating that I have a gap in a certain area. Imagine a recruiter asks about Kubernetes and the agent invents plausible container experience. The output looks correct, the recruiter has no reason to question it, and I'd never know unless I tested for it.

To test for this, I'd ask whether I'd be a good candidate for a senior Rust developer — I have no Rust skills — and confirm the agent doesn't suggest I would be because of transferable skills from another language. The test needs a clear pass/fail rubric defined _before_ running it. Response must explicitly acknowledge the gap. Fail if it hedges with transferable skills instead of being upfront.

My strongest evaluation skill comes from years of practicing TDD. "How do I tell if this feature is working?" is the same question that drives AI evaluation. The difference is that TDD gives you exact match pass/fail. AI evaluation has to define a _range_ of acceptable outputs because of non-determinism. The thinking transfers, the implementation adapts.

My biggest gap? Monitoring. Conversations with my resume agent are logged in a table where I can review them. But there's no live monitor that alerts me when the agent strays. I have the _data_ for monitoring but not the _system_. There's a difference between "I log it" and "I'd know within an hour if something went wrong."

## Decomposition for Delegation

An agent has constraints a human team member doesn't. Context window size — it can't hold an entire project in its head the way a human builds mental models over weeks. And it can't ask for clarification. Every handoff must carry all the information the next step needs.

When breaking a PRD into issues for a ralph loop, I aim for thin vertical slices through the codebase that can be independently verified. Smells: issues that try to accomplish several things at once, or that can't be verified. Same principle as good user stories in agile, applied to agent tasks. I review the issues before they're created to catch these.

I'm still experimenting and my process is far from perfect. I have a human with AI assistance verify at the end, after the ralph loop completes. For web applications, I use the Claude Chrome extension and get the agent to test a real scenario, and keep trying until it works. There are usually integration issues to work through after the loop. Individual slices pass, but system-level integration breaks — the _cascade failure_ problem. This is exactly why intermediate checkpoints matter: catch drift before it compounds across issues.

Every sub-task you delegate to an agent falls into one of four categories: _reasoning_ (figuring something out), _retrieval_ (looking something up), _judgment_ (evaluating quality), or _orchestration_ (coordinating other steps). Classifying each step of my workflow against these was harder than I expected. Grill-me is reasoning — you have to think through the feature. PRD and issues overlap between reasoning and orchestration. The ralph loop _itself_ is the orchestrator; each individual issue within it is reasoning and retrieval. Integration testing at the end requires judgment — a human decides "does this work as a system?" Classification is rarely clean. Real workflows blend types. The value is knowing which type _dominates_ each step, because that determines whether an agent can handle it alone or needs a human.

## Failure Pattern Recognition

I was asked to describe _specification drift_ in my own words, and got it wrong. My initial answer: "when the context gets too big and AI starts ignoring parts of the specification." That's actually _context degradation_ — the agent loses the spec as the context grows and attention weakens. Specification drift is different. The agent _reinterprets_ the spec through compounding small interpretation choices over many steps. It's like playing the telephone game. Each small decision seems logical, but they compound until the agent is solving a subtly different problem. Not because it lost the spec — because it slowly wandered from it.

Context degradation is common and easy to reproduce. Just try to do everything in one giant long Claude Code session. You can feel the agent getting dumber. Specification drift is much harder to detect. I couldn't even create an example that demonstrates it. An illustrative scenario: you ask an agent to "refactor for maintainability" and it drifts from cleaner code, to an abstraction layer, to a full plugin architecture with dependency injection. Each step logical. Cumulative result way beyond intent. Context degradation is obvious — you feel it. Specification drift is invisible — each output looks correct in isolation. That's what makes drift more dangerous.

Silent failure is the scariest pattern because there's no signal at all. I've never encountered it, and I don't know how to guard against it. Three defenses: _statistical sampling_ — randomly verify a percentage of outputs deeply. _Strategic human review_ — focus on high-stakes outputs, unusual inputs, outputs near decision boundaries. _Anomaly detection_ — look for "different" not "wrong." Pattern shifts like shorter answers, new phrases, or timing changes signal something changed even if you can't tell _what_. If my resume agent silently started omitting one job, the only way to know is periodically asking questions I already know the answer to. Simple statistical sampling.

Sycophancy is the most testable failure pattern because you control the ground truth. You know what skills you don't have. Ask the agent about those skills and determine the sentiment of the response. Then adjust the system prompt and re-run the same tests. Trigger, document, fix, verify — a complete post-mortem loop. But sentiment matters, not just content. "Doesn't have Rust experience" and "hasn't worked directly with Rust but strong systems thinking suggests he could pick it up" are both technically honest. The second is still sycophantic.

## Trust Boundary and Security Design

Four variables determine how much oversight an agent needs: _cost of error_, _reversibility_, _frequency_, and _verifiability_.

For my resume agent's salary disclosure risk: cost of error is high — you lose the ability to negotiate, worth thousands of dollars. Reversibility is low — once a recruiter knows your range, they won't forget it. Verifiability is high — I can simply ask the agent salary questions and confirm its output. Frequency tripped me up. I initially didn't know how to interpret it. Frequency isn't about how often errors occur — it's about how often the _task_ runs, which determines whether human review is practical. Low traffic means manual log review is viable. High traffic means you need automated guardrails.

The worst a malicious user could do with my resume agent is a denial of service — spam it until I run out of prepaid tokens. An economic attack, not an informational one. The agent only exposes what's already public via my resume and LinkedIn. Since it uses simple prompt stuffing with no tool access, there's nothing to manipulate for unintended actions. I'd unknowingly done good trust boundary design by limiting what the agent _can do_ — no tools, no write access, no private data beyond salary. Limited blast radius by design.

To push my thinking, I worked through a higher-stakes scenario: an e-commerce refund agent with read access to orders and the ability to trigger refunds. Cost of error is high — incorrect refunds in amounts or quantity. Reversibility is low — once a refund goes through, it's hard to reverse. Frequency is high for a successful business. Verifiability is also high since refund rules are typically clear. My design: have a human verify every refund the system approves. If frequency gets too high and false positives stay low, relax the rule to only reviewing refunds above a certain amount. Start conservative, measure the error rate, relax selectively based on data. A \$5 mistake and a \$5,000 mistake warrant different levels of oversight.

## Context Architecture

Persistent context should only be rules, facts, and truths that always apply — or apply most of the time. Things that only apply under certain conditions should be left out to keep the context free for actual work. In terms of Claude, the CLAUDE.md file can contain high-level structure, common build tasks, and architectural constraints. Things like linting can live in git hooks — enforcement pushed out of context entirely, so the agent doesn't need to spend tokens on it.

For context-specific information, subfolder CLAUDE.md files apply only when working in that directory. Skills handle incremental disclosure — loaded only when needed. Three layers: persistent, scoped, and on-demand.

I proactively try to keep tasks in a session focused rather than waiting for degradation. The one exception is when I think there's overlap — then I use `compact` in Claude Code. The other habit is to continually add to CLAUDE.md as I discover things that should be remembered, or use the `#` memory function. Each session makes the persistent layer richer, so future agents start smarter. Context architecture _across time_.

A concept that caught me off guard: organizing for _retrieval_ vs _storage_. I initially assumed retrieval meant RAG or vector databases. It's simpler than that. It's about intent, not technology. Storage asks "how do I keep everything?" — dump docs into folders, humans browse. Retrieval asks "how do I get the right information to the right consumer at the right moment?" The consumer is an AI that can't browse or skim. Everything in context competes for attention. A storage approach would be one giant CLAUDE.md with everything — it's all there, but the agent drowns. What you leave out of context is as important as what you put in.

In a team setting, CLAUDE.md files become a living architectural document the team maintains together — codifying decisions so every developer's agent starts with the same understanding. Developer-specific preferences go in CLAUDE.local.md. The shared files need review, versioning, and agreement. Almost a team charter for AI collaboration.

## Cost and Token Economics

I'll be honest: I haven't actively thought about token economics. I suspect most developers think about whether something works, not whether it's economically viable at scale.

_Model routing_ is interesting — using a cheap classifier to route queries to the appropriate model tier. My initial reaction was that the extra model call to classify the request just adds cost. But the classifier can be tiny and cheap. If 70% of queries route to a model that's 10x cheaper, the savings dwarf the classification cost. "What languages does Johan know?" is a lookup — cheap model. "Would Johan fit a role balancing architecture with leadership?" requires reasoning — expensive model.

Not every optimization needs routing though. Simpler wins include caching repeated questions across users, trimming context to only the relevant resume section, and prompt caching for API discounts on repeated prefixes.

The hardest question: how do you measure whether AI productivity gains justify the cost? It's tempting to count PRs, commits, or deploys. But deploys don't necessarily add customer value or increase revenue. A bottom-up approach would estimate feature value at creation time and track tokens per commit related to that feature. Precise but high-overhead. A top-down approach compares quarter-over-quarter revenue against quarter-over-quarter token spend. Less precise but practical — if revenue grows 20% and token cost is 2% of the delta, attribution doesn't need to be exact. Most companies can't do this well yet. Recognizing the difficulty and reaching for the right framing — business value vs cost, not activity metrics — is itself the skill.

## The Scorecard

Seven skills, and I'm not strong at all of them. That's the point.

My strongest areas are _specification precision_ (I have a mature workflow and I iterate), _context architecture_ (three layers plus pushing enforcement to the environment), and _trust boundary design_ (my resume agent has limited blast radius by design, even if I didn't plan it that way).

_Decomposition_ and _evaluation_ are developing. The agile fundamentals transfer, but I'm still experimenting with where human checkpoints belong. My monitoring is the biggest practical gap — I have conversation logs but no system that would tell me something went wrong.

_Failure pattern recognition_ and _token economics_ are genuine gaps. I confused specification drift with context degradation during the interview. I've never encountered silent failure. I haven't thought about what my AI workflows actually cost.

Three misunderstandings taught me the most:

- **Specification drift vs context degradation** — losing the spec is not the same as slowly reinterpreting it. One is obvious, the other is invisible.
- **Frequency in trust boundaries** — it's about task volume, not error rate. Determines whether a human can realistically review everything.
- **Retrieval vs storage** — it's about intent, not technology. Organizing for an AI consumer that can't browse or skim.

The cross-cutting theme is that traditional engineering skills transfer — TDD maps to evaluation, sprint tickets map to specification, agile stories map to decomposition — but each has an AI-specific twist. The thinking carries over. The implementation adapts.

And across every skill, the resume agent kept coming up as a concrete test bed. A real artifact that makes the abstract tangible. If you're trying to build these skills, I'd recommend the same: pick a small, real agent you've built, and audit it against each skill. You'll find the gaps faster than reading about them.
