---
title: "Continuous Integration, Delivery and Deployment"
description: "An overview of continuous integration, delivery and deployment principles including deployment pipelines, feature flags, database migrations and testing strategy."
pubDate: 2018-07-13
tags: ["DevOps", "development"]
---

The goal of any software delivery process should be low cycle time and high quality. Building, deploying, testing and releasing software should be automated and easily repeatable — an engineering discipline, not an art. Releases should happen frequently because smaller deltas between them reduce risk and make rollback straightforward. Every change to executable code, configuration, host environment or data should trigger a feedback process. The mantra "if it hurts, do it more often" captures this well: deployment shouldn't be a disruptive event, it should be commonplace.

## Defining Continuous Integration, Delivery and Deployment

These three terms get used interchangeably, but they represent distinct practices along a spectrum.

*Continuous Integration* is the foundation. Developers commit to the mainline at least once a day, triggering an automated build and test cycle. A solid CI practice means the team has a reliable battery of tests that give them confidence in the build, and broken builds get fixed within ten to twenty minutes.

*Continuous Delivery* extends CI by taking every change through a series of progressively harder tests — compilation, unit tests, integration tests, load tests — across environments that increasingly resemble production. This series of tests is called a _deployment pipeline_. The goal is to be confident that any change passing through the pipeline is ready for production.

*Continuous Deployment* goes one step further: every change that passes the pipeline gets deployed to production automatically, sometimes many times per day. The distinction matters. Continuous Delivery is about getting to the point where you _can_ deploy continuously but may choose not to. That's a business decision, not a technical one.

## The Deployment Pipeline

The deployment pipeline is the backbone of continuous delivery. A typical pipeline looks something like this: a Git commit triggers compilation and unit tests, then packaging and deployment, followed by acceptance tests, deployment to QA, and finally deployment to production.

Every build is a potential release. There are no more "snapshots" that eventually get promoted — every commit that enters the pipeline is a release candidate. This mindset shift eliminates manual bottlenecks like manual QA regression testing. The pipeline should automate as much as possible, and most importantly, it should include automated tests you can trust. This isn't about coverage percentages — it's about confidence.

Smoke tests should run immediately after each deployment. CI systems can intelligently skip stages when several commits queue up, processing only the latest. Rollback should use the same deployment mechanism as a regular release — just deploy the previous version. There's no need for separate rollback scripts.

The single most important metric to track is _cycle time_: how long it takes for a one-line code change to reach production.

## Feature Flags and Dark Releases

Software deploys and software launches are two different things. _Feature flags_ — sometimes called feature toggles or config flags — allow incomplete or experimental features to be deployed to production while remaining hidden from users. This is branching in code rather than branching in version control.

Flags can be granular. A new feature might be visible only to internal staff, or enabled for one percent of traffic as a _dark release_. This approach gives teams a way to gather data cheaply, test with real traffic, and kill things that don't work — all without coordinating big-bang releases.

## Database Migrations

Database schema changes are one of the trickier parts of continuous deployment. Etsy, for example, doesn't continuously deploy schema changes — they handle them on specific days because of the higher risk involved. There are sensible strategies to reduce that risk.

Prefer adding columns and tables over altering existing ones, since additive changes are cheaper to revert. Applications should carry configuration flags that support multiple schema versions simultaneously. A safe migration sequence looks like this: add the new schema version, write to both old and new versions, backfill historical data, switch reads to the new version, and finally cut off writes to the old version. Maintaining separate flags for reading and writing to old and new schemas gives fine-grained control over each step.

## Testing Strategy

A useful way to think about testing is a quadrant model with two axes: business-facing versus technology-facing tests, and tests that support programming versus tests that critique the project. Unit and integration tests support programming and are technology-facing. Acceptance tests are business-facing and verify that the system does what stakeholders expect. Exploratory testing and usability testing critique the project from a business perspective.

Automated acceptance tests should follow a clear sequence: configure the environment, deploy the binary, run a smoke test, then run the full acceptance test suite. Including one or two high-level end-to-end smoke tests that cover the highest-value functionality gives quick confidence that the deployment is sound.

## Configuration Management

Configuration should live in a separate repository from application code because the two change at different rates. During deployment, configuration should be tested — ping the services and endpoints the application depends on to verify connectivity. Any version of the application should be able to pass through the pipeline with its corresponding configuration.

## Practical Tips

A few patterns I've found useful when adopting CI/CD practices:

Developers should work in local environments rather than shared development servers. Nobody should commit on a broken build. For slow builds, consider temporarily breaking the build on slow tests — this focuses the team on fixing them rather than ignoring them. _Ratcheting_ is an effective technique: compare warnings, checkstyle violations and test execution times against the previous build, and fail when things get worse.

Treat build and deployment scripts with the same respect as production code. They should be modularised, well-factored, and owned by developers. Test targets should run to completion and then exit with a failure code rather than failing fast — this gives you a complete picture of what's broken.

When managing components and dependencies, prefer incremental changes behind feature toggles over long-lived branches. _Branch by abstraction_ is a powerful technique: create an abstraction layer pointing to the current implementation, develop the new implementation behind it, switch over, then remove the old implementation and the abstraction layer. For systems with multiple component pipelines, an integration pipeline should validate the components together — a component is only truly green when the integration pipeline passes.

## Lessons from Etsy

Etsy's approach to product development embodies many of these principles in practice. Their philosophy treats the first iteration of any feature as an experiment. They gather data cheaply using opt-in prototypes, staff dogfooding, and one-percent rollouts. Features that don't work get killed quickly, and successful ones get re-architected after the team sees what actually works in production.

Their environment progression — development, pre-production connected to the same external services as production, then production itself — minimises surprises during deployment. Real-time metrics and dashboards cover the full stack: network, servers, application and business metrics. They apply the _OODA loop_ (Observe, Orient, Decide, Act) to their operational feedback cycle.

One principle from Etsy that I find particularly valuable: optimise for quickly detecting when you're wrong, not for being right. Combined with code review before commit and a solid automated test suite, this creates a culture where rapid iteration is safe.

## Wrapping Up

Continuous integration, delivery and deployment aren't just tooling concerns — they're engineering disciplines that shape how teams think about releasing software. The ingredients are straightforward: automation, configuration management, collaboration between development and operations, and a test suite you genuinely trust. Getting the practices right takes effort, but the payoff — lower risk, real progress measured by deployed software, and faster feedback from users — makes it worthwhile.
