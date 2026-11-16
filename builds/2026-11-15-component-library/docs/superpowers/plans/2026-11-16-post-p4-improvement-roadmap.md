# P5–P9 Post-P4 Component Library Implementation Roadmap (Proposal)

> For agentic workers: Use superpowers:subagent-driven-development or superpowers:executing-plans, always test-first. Do not implement before the user approves the proposed design.

**Goal:** Make Quiet Canvas a trustworthy visual library that actually configures, installs and validates components and HTML web-deck stories through ordinary ChatGPT chat.

**Architecture:** One typed source catalog feeds browsing, live presets, usage snippets and independent consumer tests. Preserve the existing React 19 / TypeScript / Vite / Tailwind 4 app and its Quiet Canvas look. The public registry remains source-first; verification is item-specific.

**Spec:** docs/superpowers/specs/2026-11-16-post-p4-productization-design.md
**Baseline:** e9579eba1e382014f4157774d32a252df2855fa4, canonical Cloudflare Pages URL https://pcl-component-library-review.pages.dev/

## Global constraints

- Only isolated development branches and separate Cloudflare previews until the user explicitly approves release.
- Preserve all 110 source registry records, 100 MotionBrew sources, 10 HTML decks, 6 styles, 5 blueprints and existing navigable sections.
- Do not label successful smoke-mounting as interaction certification or imply that unreviewed third-party source is cleared for redistribution.
- Keep React Bits 39 references separate from imported sources.
- No authentication/database/full drag-and-drop editor unless separately approved.
- CI evidence and Notion updates must agree with the actual built commit.
- Avoid em dashes in user-facing UI copy.

## Review focus

1. A demo that mounts blank with missing props must not show a certified badge. Pin this in P5-T1/P6-T1.
2. Missing source-license evidence must remain unknown, not silently cleared. Pin in P5-T1.
3. Switching between registry, MotionBrew, decks and Saved cannot lose or duplicate browser-local selections. Pin in P5-T3/P6-T2.
4. GSAP/Three/Canvas demonstrations must not run all at once or autoplay audio; reduced motion must offer useful alternatives. Pin in P6-T1/P9-T1.
5. A copied install snippet must declare needed packages and styling; the independent consumer test must fail on missing dependencies. Pin in P7-T1/P7-T2.

## P5: Trust, UX and catalog integrity (priority P0)

### P5-T1 One canonical component contract

**Files:** Create src/lib/catalog/component-contract.ts, src/lib/catalog/component-index.ts and src/lib/catalog/component-contract.test.ts; update src/quietCanvasData.ts, src/lib/motionbrew/preview-catalog.json, src/lib/motionbrew/MotionBrewGallery.tsx. Create docs/library/LICENSE_AND_SOURCE_AUDIT.md.

**Interface:** ComponentContract contains id, source, sourceHash, licenseStatus, readiness, props, dependencies, presets, capabilities and evidence. validateContract(contract) returns errors and a valid boolean.

- [ ] Write failing tests for 110 unique IDs; no contradictory statuses, missing license-status field, missing readiness evidence, source-id mismatches.
- [ ] Confirm RED in CI/Node runner.
- [ ] Normalize the source index and map old manifests and registry entries without changing vendor TSX.
- [ ] Audit source copyright, attribution and permitted reuse; status may remain unknown when documentation is inconclusive.
- [ ] Render truthful readiness/license status in cards, inspector, search and installation actions. Verify full tests and commit.

**Exit:** 110 entries individually traceable; no unsupported certified status; unknown license genuinely labeled unknown.

### P5-T2 Theme, mobile and accessibility audit

**Files:** Modify src/QuietCanvas.css, src/lib/motionbrew/motionbrew-gallery.css, src/QuietCanvasPortal.tsx, src/lib/motionbrew/MotionBrewGallery.tsx; add tests/e2e/appearance-dialogs.spec.ts and docs/library/UX_AUDIT.md.

- [ ] Capture real source-based review screenshots at 320, 390, 768 and 1440 widths, Light/Dark and Soft Focus/Open Canvas; add 200% zoom, touch and Bengali-long-text cases.
- [ ] Write failing tests for return focus, keyboard trap and background inertness in registry detail, global search and appearance dialogs, not just MotionBrew.
- [ ] Implement semantic theme tokens shared by Quiet Canvas and MotionBrew, preserve existing palette choices.
- [ ] Repair only verified visual and usability defects, keeping typographic hierarchy and quiet motion.
- [ ] Run axe WCAG 2.2 AA checks, manual keyboard/screen-reader flow, no overflow, commit.

**Exit:** All primary dialogs accessible, no serious/critical axe issues in tested flows, visually coherent mobile/dark modes.

### P5-T3 One discovery and Saved journey

**Files:** Update src/QuietCanvasPortal.tsx, src/quietCanvasData.ts, src/lib/p0/HTMLDeckGallery.tsx and src/lib/motionbrew/MotionBrewGallery.tsx. Create src/lib/collections/saved-store.ts and tests/e2e/unified-discovery.spec.ts.

- [ ] Write failing tests: save MotionBrew and deck item, see them in global Saved, maintain keyboard/search history, persist reload, migrate old saved IDs.
- [ ] Create one browser-local collection store; keep account sync out of scope.
- [ ] Consolidate component browse and workbench navigation with progressive disclosure, stable legacy routes.
- [ ] Improve global search with type/readiness/use-case facets and useful empty states; verify in mobile and desktop.
- [ ] Pass full suite and commit.

**Exit:** One coherent find-save-return journey across all collections.

## P6: Interactive component previews (priority P1)

### P6-T1 Meaningful posters, safe on-demand demos

**Files:** Create src/lib/motionbrew/preview-fixtures.ts and preview-poster-manifest.json, scripts/capture-component-previews.mjs, tests/e2e/preview-fidelity.spec.ts. Update MotionBrewGallery.tsx and CSS.

- [ ] Write failing tests for blank fixtures, required props, meaningful loaded content and correct fallback states.
- [ ] Generate deterministic real stills from actual rendered components where feasible; otherwise show explicit setup requirements. Do not pretend all 100 effects are functional.
- [ ] Add accessible source-specific preview captions and meaningful metadata on cards.
- [ ] Restrict GPU/GSAP demos to an active inspector; unmount on close, reduce motion, no autoplay sound; test on narrow devices.
- [ ] Re-capture and commit reviewed preview evidence.

**Exit:** All 100 entries show trustworthy real preview artwork or a clear requirements/fallback state.

### P6-T2 Configurable controls for sixteen flagships

**Files:** Create src/lib/playground/prop-schema.ts, presets.ts, ComponentPlayground.tsx and related tests. Update MotionBrewGallery.tsx and QuietCanvasPortal.tsx.

- [ ] Write failing tests for required/optional props, invalid values, variant switching and saved local presets.
- [ ] Type the actual source APIs of all 16 flagship candidates, replacing unsupported candidates explicitly.
- [ ] Implement Live Preview, Controls, and Usage on each flagship; support responsive widths and Light/Dark states.
- [ ] Include long/Bengali, empty and reduced-motion examples, reset and copy JSX behaviors.
- [ ] Pass individual browser tests and full suite, commit.

**Exit:** All 16 flagship items support meaningful interactive presets and safe editable controls, not merely mount smoke tests.

## P7: Reuse through independent consumers and ChatGPT (priority P1)

### P7-T1 Full consumer certification

**Files:** Modify scripts/verify-consumer-install.mjs and tests/e2e/consumer.spec.ts, add tests/consumers/fixtures.ts and docs/library/CONSUMER_CERTIFICATION.md.

- [ ] Write failing tests for callbacks, keyboard interactions, prop changes, dark styles, missing dependencies, reduced motion and long/Bengali labels in both isolated consumer apps.
- [ ] Install actual registry outputs with clean CSS and no gallery imports, run functional and accessibility tests per component.
- [ ] Resolve adapter incompatibilities or replace blocked candidates without overwriting provider source.
- [ ] Attach item-specific CI evidence, promote status only for certified components.
- [ ] Run whole suite and commit.

**Exit:** 16 independently verified, licensed-appropriately-labelled consumer components, each with source/evidence.

### P7-T2 Versioned registry and copy-to-chat usage

**Files:** Create src/lib/catalog/install-contract.ts and chat-prompt.ts with tests, update scripts/build-registry.mjs and QuietCanvasPortal.tsx; add docs/library/CHAT_FIRST_INSTALL.md.

- [ ] Write failing tests for immutable source SHA, version/props, undeclared packages and blocked readiness/licensing states.
- [ ] Generate precise install instructions, JSX snippets, dependency and token requirements from the same contract.
- [ ] Check real shadcn-compatible installation rather than asserting JSON compatibility alone.
- [ ] Test two chat-driven isolated pilots: Brandaily-like Today workflow and HTML deck headline reveal.
- [ ] Return preview URLs and verified diffs, never change business production without approval.

**Exit:** A selected component/preset in normal ChatGPT chat becomes a reproducible independent preview.

## P8: Turn deck references into runnable assets (priority P2)

### P8-T1 Ten decks, six styles, five blueprints

**Files:** Modify src/lib/p0/HTMLDeckGallery.tsx, templates/pitch-inspired/deck-recipes.mjs and scripts/sync-decks.mjs; add src/lib/presentation/deck-preset.ts, tests/e2e/deck-library.spec.ts and docs/library/DECK_ASSET_POLICY.md.

- [ ] Write failing tests for deck thumbnails, keyboard/reveal behavior, mobile viewing and media fallback.
- [ ] Capture real ten-deck stills from HTML source; link open presentation and source artifacts.
- [ ] Connect existing six styles and five narratives to safe editable deck recipe presets, not descriptive-only cards.
- [ ] Add licensed multimedia-ready placeholders, silent autoplay defaults, layer/audio policy, responsive 16:9 stage controls.
- [ ] Verify all ten existing deck outputs remain functional and commit.

**Exit:** Ten usable deck examples with real thumbnails and configurable content/style/storytelling presets.

## P9: Performance, regression and release operations (priority P2)

### P9-T1 Measured performance and visual checks

**Files:** Create scripts/size-report.mjs, tests/e2e/visual-baseline.spec.ts and docs/library/PERFORMANCE_BUDGETS.md. Modify CI and Playwright config.

- [ ] Measure and document initial bundles, on-demand chunks, GPU cost and Core Web Vitals on representative mobile and desktop profiles.
- [ ] Agree quantitative budgets from measured baseline, then enforce reasonable CI regression limits.
- [ ] Add stable screenshot diffs across actual props/themes and smoke-test all output assets and reduced-motion modes.
- [ ] Optimize only measured hotspots; verify normal interactions and check cleanup.
- [ ] Commit evidence and repeat CI.

**Exit:** Inspectable performance trend and visual regression report, with no undisclosed always-running effects.

### P9-T2 Safe release governance and long-tail curation

**Files:** Update .github/workflows/component-library-p0.yml, docs/SESSION_PROTOCOL.md, docs/motionbrew/P4_RELEASE_CHECKLIST.md; create docs/library/RELEASE_PLAYBOOK.md and CATALOG_CURATING.md.

- [ ] Document a stable release branch proposal, branch protections, staged Cloudflare project, rollback and explicit release approvals.
- [ ] Dry-run branch promotion in a temporary preview; only change production mapping after approval.
- [ ] Synchronize verifiable readiness evidence to the existing Notion hub, idempotently.
- [ ] Rank the remaining 84 MotionBrew entries by actual demand, licensing, complexity and performance; certify in bounded batches.
- [ ] Keep 39 React Bits entries references only until rights and import requirements are approved.

**Exit:** Repeatable release process, credible catalog governance and selective growth without weakening app performance.

## Dependencies and rollout

- P5-T1 canonical schema precedes P6 preview/prop contracts and P7 install claims.
- P5-T2 mobile/theme QA and P5-T3 discovery can proceed in parallel after catalog schema is locked.
- P6-T1 posters precede P6-T2 controls; P7-T1 certification depends on correct P6 fixtures.
- P7-T2 chat installation depends on P7-T1 proven consumer contracts.
- P8 deck recipes can overlap with later P7 once the P6 preset contract is stable.
- P9 safety/performance verification runs throughout, with the dedicated stable release branch step at the final approval gate.

**User acceptance walkthrough:** Find a component on a mobile device; view a genuine preview; change and save a safe preset; copy a pinned chat prompt; use the component in a new dashboard and HTML deck preview; inspect matching evidence, license and dependencies; review ten deck examples with media and narrative presets; deploy only after explicit approval.

**Status:** Draft for approval. No component code, preview deployments or production apps were changed by creating this plan.
