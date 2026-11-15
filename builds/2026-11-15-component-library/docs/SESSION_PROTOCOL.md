# Chat-first development protocol: Personal Component & Deck Library

Notion project tracker: https://app.notion.com/p/419a73a0b5f9810b9170fa023fc6f23b
Notion parent: Development HQ | ChatDev OS
GitHub repository: MitulMustBeCrazy/codex-cloud-workspace
Development branch: prototype/personal-component-library
Project root: builds/2026-11-15-component-library

## Start of every working session
1. Read this file, the Notion project tracker and latest Session record.
2. Recheck live branch/source and open P0 tasks. Never infer repo or deployment state from memory.
3. Choose one concrete component/deck feature, identify tests, work only in an isolated development branch or safe preview.
4. Read source design specification under docs/superpowers/specs and foundation plan under docs/superpowers/plans.
5. Prefer chat tools for all work; do not switch to Work or Codex without the user's request.
6. Do not modify Brandaily production, published presentations, or any production site without explicit approval.

## During the session
- Log changes in GitHub, keeping component code independently usable from the gallery.
- For imported creative references, keep source/template ID, original author, license and why an original adaptation was chosen.
- Never claim exact Pitch visual recreation based on text-only metadata.
- Add source, tests, usage and failure states. Verify a commit before recording it as implemented.
- P0 release gate: TypeScript build + isolated component behavioral tests + keyboard/accessibility checks + visual browser review.

## End of each session
1. Fetch current Notion tracker; identify matching record by name and update instead of duplicating it.
2. Add one dated Session record with commit SHAs, actual tests run, failed checks, remaining blockers and next tasks.
3. Update each touched component/template item: status, source URL, and evidence URL.
4. Mark Verified only after appropriate tests actually pass. 'Committed' is not 'built'; 'mock-exercised' is not 'browser-tested'.
5. Keep UI preview independent of Brandaily; request separate approval before production integration.

## Accepted scope
- Dashboard/UI primitives and Brandaily-specific workflow components.
- Standalone responsive HTML and React web deck components.
- Curated original visual styles and Pitch-inspired **structural** deck templates, with staged reveals.
- Registry/library that can be invoked via stable IDs in ordinary ChatGPT chats.

## Current P0 source
- src/lib/p0/: TodayTaskCard, MetricCard, ProgressMeter and P0Showcase.
- templates/pitch-inspired/: original Editorial, Board Report, KPI Report mini-decks, deck-core.js/CSS and test harness.
- .github/workflows/component-library-p0.yml: CI definition, status requires run verification.

## Active A+B milestone (2026-11-16)
- Combined gallery-first and reuse-first work has its own isolated GitHub branch: `feature/pcl-gallery-and-reuse-2026-11-16`.
- Draft PR: https://github.com/MitulMustBeCrazy/codex-cloud-workspace/pull/4
- Development preview project: https://pcl-gallery-reuse-review.pages.dev/ (verify hosting status before calling live).
- Current canonical Quiet Canvas portal: https://pcl-component-library-review.pages.dev/ (unchanged until approved).
- Source-truth preview readiness catalog: `src/lib/motionbrew/preview-catalog.json`; default all 100 are `source-only` until evidence supports promotion.
- 16 selected registry imports are independently built in dashboard and deck consumer Vite roots; browser validation and full 100-preview fixture coverage remain open.
- Full design and implementation plan: `docs/superpowers/specs/2026-11-16-gallery-and-reuse-design.md` and `docs/superpowers/plans/2026-11-16-gallery-and-reuse-implementation.md`.
