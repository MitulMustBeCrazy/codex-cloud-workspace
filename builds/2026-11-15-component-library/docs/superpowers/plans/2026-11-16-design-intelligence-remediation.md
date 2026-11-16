# Quiet Canvas Design Intelligence Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This is a **proposed plan**, not implementation authorization.

**Goal:** Repair the interface and user-journey gaps confirmed by Design Intelligence so a person can find, preview, configure, save, and safely reuse components or code-based deck templates.

**Architecture:** Preserve the live Quiet Canvas React 19 / TypeScript 5.9 / Vite 7 / Tailwind 4 implementation. Add small typed adapters over the existing 110 registry records and 100 MotionBrew sources, then progressively improve the gallery, saved collections, inspector and decks. Keep the original vendor source unchanged and gate releases through compiled static preview, CI, screenshots and explicit approval.

**Spec:** `docs/superpowers/specs/2026-11-16-post-p4-productization-design.md`
**Evidence:** `docs/design-intelligence/2026-11-16-quiet-canvas-interface-audit.md`
**Branch baseline:** `feature/pcl-p0-p2-2026-11-15`, production SHA `e9579eba1e382014f4157774d32a252df2855fa4`
**Related proposal:** `docs/superpowers/plans/2026-11-16-post-p4-improvement-roadmap.md`

## Global Constraints

- Preserve all 110 registry entries, 100 imported MotionBrew source files, 10 HTML decks, 6 visual style definitions, 5 narrative frameworks and 39 React Bits reference-only entries.
- Keep Quiet Canvas's editorial typography, restrained red accent, spacious composition and existing appearance controls. Do not redesign from scratch.
- No production Brandaily or published business deck modifications; no canonical Quiet Canvas deployment without separate authorization.
- Do all work through ordinary ChatGPT and connected GitHub/Cloudflare/Notion on isolated branches with verified Cloudflare previews. No automatic switch to Work/Codex.
- Do not promote a component above its evidence-backed state; a mounted default preview is not verified behavior.
- No unsupported claim that third-party source is commercially cleared. Unknown source-license evidence remains `unknown`.
- Never silently invent actual component preview thumbnails. Screenshot only deterministic rendering; fallback must show the reason for missing preview.
- Respect reduced-motion preference and prevent background effects/media or GPU loops from remaining active after a preview closes.
- Keep old `?view=` routes working even if navigation labels are revised.
- All UI copy must be simple and user-facing, not internal P0/P1 terminology.

## Review Focus

1. Mobile screenshot captured during sidebar close cannot be mistaken for a persistent overflow bug; settled viewport/capture behavior is tested explicitly in Task 1.
2. A blank MotionBrew default mount must not be promoted as interaction-verified, nor marked usable in a ChatGPT install prompt without evidence. Task 2 and Task 7 pin this.
3. Saved items may have old localStorage keys, duplicate IDs or corrupted data; migration must preserve valid favorites and recover gracefully. Task 5 tests this.
4. Changing preview props can crash vendor components or spawn endless animation/WebGL loops; controls validate allowed values and demos unmount on close. Tasks 7–8.
5. A card can have a visible screenshot and a working web-deck preview but unreviewed source license; release approval remains independent of visual readiness. Tasks 3 and 10.

---

## Release A: P5A, truth and first usability defects

### Task 1. Reproduce mobile deck clipping before changing CSS (DI-03)

**Files:**
- Create `tests/e2e/mobile-drawer-decks.spec.ts`.
- Modify `src/QuietCanvas.css` and/or `src/QuietCanvasPortal.tsx` **only if** a stable reproduction fails.
- Modify `tests/e2e/quiet-canvas.spec.ts` to avoid screenshots during a 200ms transition.

**Interface:** `assertStableMobileViewport(page, expectedHeading): Promise<void>`, test-only helper.

- [ ] **Step 1:** Write failing-or-diagnostic Playwright test: 390x844, open drawer, select Deck Gallery, wait for sidebar transition/animation completion, then assert drawer right bound <=0, HTML deck gallery main header left bound >=12, `scrollX===0`, document overflow <=3px, and screenshot capture. Repeat at 320px and 200% zoom. Compare with CI screenshot `quiet-canvas-mobile.png`.
- [ ] **Step 2:** Run `npx playwright test tests/e2e/mobile-drawer-decks.spec.ts` using built preview, record either reproduced failure or explicit nonreproduction.
- [ ] **Step 3:** If reproduced, repair drawer transform, overlay and content-width CSS minimally. If not reproduced, change only screenshot timing and mark the old screenshot artifact as an in-transition capture, not a persistent defect.
- [ ] **Step 4:** Re-run tests including existing responsive cases; commit only justified fix.

**Acceptance:** Stable screenshots show no exposed sidebar behind a closed drawer, no clipped title or card text, no horizontal scroll at 320/390 and zoom.

### Task 2. Truthful source and readiness states (DI-01)

**Files:** Create `src/lib/catalog/component-contract.ts`, `src/lib/catalog/component-index.ts`, `src/lib/catalog/component-contract.test.ts`; modify `src/lib/motionbrew/preview-catalog.json`, `src/lib/motionbrew/preview-status.mjs`, `src/lib/motionbrew/MotionBrewGallery.tsx`, `src/quietCanvasData.ts`, `scripts/release-gate.mjs`.

**Interface:** `ComponentContract {id,source,sourceHash,licenseStatus,readiness,requiredProps,presets,dependencies,verificationEvidence}`; `validateContract(c):{valid:boolean,errors:string[]}`.

- [ ] **Step 1:** Write failing tests: 110 unique IDs, 100 source-backed MotionBrew entries, known default mounts cannot claim interaction-verified, verified states require item-specific evidence, unknown license cannot become cleared automatically.
- [ ] **Step 2:** Run source tests and confirm expected failure.
- [ ] **Step 3:** Normalize the registry/manifest/preview catalog into one supported schema; do not modify 100 vendor TSX originals.
- [ ] **Step 4:** Replace misleading `Preview configured` badges with concise accurate copy for default render vs actual configured demo, and show per-item evidence link where present.
- [ ] **Step 5:** Run catalog contract, gallery, source and release-integrity tests; commit.

**Acceptance:** All 110 entries have one machine-checked status model; 0 false verified claims. Release manifest still validates exact 124 routes.

### Task 3. Item-by-item source rights and provenance (DI-02)

**Files:** Create `docs/library/COMPONENT_SOURCE_RIGHTS.md`; add provenance/rights fields to contract and audited records.

- [ ] **Step 1:** Write failing validation that no source item has an absent licenseStatus field; defaults must be `unknown`.
- [ ] **Step 2:** Confirm original provider documentation/license repository or package terms for the 16 flagships; record canonical URL, source revision, attribution and reuse scope separately for code and third-party assets.
- [ ] **Step 3:** Extend audit over remaining 84 MotionBrew entries and 10 native sources, with `unknown` where evidence is unavailable. Do not invent permission.
- [ ] **Step 4:** Show `License unreviewed` in usage inspectors and prevent copy-text from claiming commercial approval.
- [ ] **Step 5:** Run source checks and commit.

**Acceptance:** 110/110 explicit rights states with supporting link or unknown; no source redistributed under an unsupported license claim.

---

## Release B: P5B, navigation, identity and accessibility

### Task 4. Refine navigation and overview copy (DI-06, DI-08)

**Files:** Modify `src/quietCanvasData.ts`, `src/QuietCanvasPortal.tsx`, `src/QuietCanvas.css`; create `tests/e2e/navigation-ux.spec.ts`.

**Interface:** `primarySections: Section[]`; `resolveLegacySection(query): SectionId`; `recentOrFeaturedContent(items,saved):... `.

- [ ] **Step 1:** Write failing tests for current deep links `overview`, `components`, `motionbrew`, `decks`, `styles`, `blueprints`, `references`, `p0`, `brandaily`, `presentation`, `lab`; and for back/forward/mobile nav.
- [ ] **Step 2:** Keep five user-facing destinations (Explore, Components, Web decks, Saved, Workbench) with original collections as in-page filters/subnav and original demo routes in Workbench.
- [ ] **Step 3:** Change `Pick up where you left off` to `Featured collections` until genuine local recent activity exists. Change production sidebar `Library preview` to truthful product status.
- [ ] **Step 4:** Preserve editorial hero and padding; visually compare 1440 and 390 screenshots before accepting.
- [ ] **Step 5:** Run source and route tests; commit.

**Acceptance:** No more than five first-level choices; all 11 previous URL destinations remain reachable and functional; no fictional recents.

### Task 5. One Saved collection across library (DI-07)

**Files:** Create `src/lib/collections/saved-store.ts`, `src/lib/collections/saved-store.test.ts`; modify `src/QuietCanvasPortal.tsx`, `src/lib/motionbrew/MotionBrewGallery.tsx`, `src/lib/p0/HTMLDeckGallery.tsx`; create `tests/e2e/saved-journey.spec.ts`.

**Interface:** `SavedId = {kind:"component"|"deck",id:string}`; `loadSaved():SavedId[]`; `toggleSaved(item):SavedId[]`; `migrateLegacySaved():SavedId[]`.

- [ ] **Step 1:** Test invalid localStorage JSON, legacy saved IDs, repeated toggle, duplicates, reload and separate decks vs components.
- [ ] **Step 2:** Implement one browser-local saved model with migration and stable ID namespaces; no login/backend.
- [ ] **Step 3:** Connect registry, MotionBrew and deck favorites to same state and expose Saved in top-level navigation with filtered results.
- [ ] **Step 4:** Verify save, unsave, reload, navigation history and keyboard operations in Chrome; commit.

**Acceptance:** Saving once persists across all library views and reloads; no duplicate or silently lost saved entries.

### Task 6. Tokens, readable metadata and all-dialog accessibility (DI-10, DI-11, DI-12)

**Files:** Modify `src/QuietCanvas.css`, `src/lib/motionbrew/motionbrew-gallery.css`, `src/QuietCanvasPortal.tsx`; create `src/lib/ui/useAccessibleDialog.ts`, `tests/e2e/dialog-accessibility.spec.ts` and `tests/e2e/dark-mobile-visual.spec.ts`.

**Interface:** `useAccessibleDialog({active,restoreTo,onClose}):{dialogRef}`; semantic `--qc-*` tokens for body, secondary text, borders, surfaces and focus.

- [ ] **Step 1:** Write failing tests for focus inside and restored after closing Registry Detail, Global Search and Appearance; Tab/Shift+Tab cannot escape; scroll locks and Escape/backdrop behaviors. Preserve P4 inspector passing tests.
- [ ] **Step 2:** Introduce small accessible shared dialog helper without restructuring unrelated component tree. If using a dialog library, only add it after dependency/size review.
- [ ] **Step 3:** Use shared semantic tokens in MotionBrew shell and keep vendor demo canvases visually isolated. Correct hardcoded light/dark conflicts.
- [ ] **Step 4:** Increase tiny controls/metadata to readable scale with evidence-based spacing adjustments; test 200% zoom, mobile touch, long/Bengali labels and contrast.
- [ ] **Step 5:** Run axe and manual-keyboard script, diff Light/Dark screenshots and commit.

**Acceptance:** No serious/critical axe findings in tested flows, visible focus, correct return focus, legible small text, no theme mismatch or clipped modal controls.

---

## Release C: P6, actual previews and configurable playground

### Task 7. Replace decorative cards with genuine component posters (DI-04, DI-13)

**Files:** Create `src/lib/motionbrew/preview-fixtures.ts`, `src/lib/motionbrew/poster-index.json`, `scripts/capture-component-posters.mjs`, `tests/e2e/component-poster.spec.ts`; modify `MotionBrewGallery.tsx`, its CSS and CI asset build.

**Interface:** `PreviewFixture {slug,props,assetRequirements,posterPath,posterEvidence,previewState}`; `getPreviewFixture(slug)`.

- [ ] **Step 1:** Failing tests: screenshot path exists for ready poster, missing required props/asset renders setup placeholder, poster is actual output not name artwork, no eager animation on 100 cards.
- [ ] **Step 2:** Capture deterministic actual preview screenshots first for 16 flagship items, including render-with-props cases. Backfill other 84 in safe batches.
- [ ] **Step 3:** Redesign card hierarchy: genuine poster → short title → purpose → interaction type → truthful readiness, with clear empty and error states.
- [ ] **Step 4:** On mobile, collapse advanced filters behind a drawer, keep search and active chips visible, allow one-tap clear. Do not virtualize until measured.
- [ ] **Step 5:** Verify desktop/mobile snapshot and loading/performance, commit.

**Acceptance:** 16 real component posters verified, remaining items visually honest; no simultaneous 100 live effects; mobile filter controls remain compact.

### Task 8. Inspector with controls and animation lifecycle (DI-05)

**Files:** Create `src/lib/playground/prop-schema.ts`, `src/lib/playground/ComponentPlayground.tsx`, `src/lib/playground/presets.ts`, tests `prop-schema.test.ts` and `tests/e2e/component-playground.spec.ts`; modify MotionBrew inspector only.

**Interface:** `PropControl {name,type,defaultValue,allowedValues?,min?,max?,required?}`; `getControls(slug)`; `resetPreview(slug,presetId)`.

- [ ] **Step 1:** Failing tests for invalid props, text/number/color/select edits, reset, preset change, replay, reduced-motion fallback and closing inspector releasing active mounts.
- [ ] **Step 2:** Define vetted props and meaningful defaults for 16 flagships from actual TSX export contracts. No free-form arbitrary JSON injected into components.
- [ ] **Step 3:** Add Preview / Configure / Usage with desktop split and mobile tabs, a persistent source/provenance footer and visible Copy JSX/pinned prompt controls.
- [ ] **Step 4:** Ensure only one GPU/GSAP animation active; replay must remount/rewind cleanly without stacking listeners.
- [ ] **Step 5:** Test long/Bengali text, device size, Light/Dark, empty/loading/error and keyboard states; commit.

**Acceptance:** All 16 can be meaningfully demonstrated and configured, with tested replay/reset and reproducible usage preset.

---

## Release D: P7–P8, reusable applications and presentations

### Task 9. Real consumer story, not the QA harness (DI-15)

**Files:** Modify `scripts/verify-consumer-install.mjs`, `tests/e2e/consumer.spec.ts`; create `src/lib/consumer-examples/BrandailyExample.tsx`, `DeckExample.tsx`, `docs/library/CHAT_INSTALL_CONTRACT.md`.

- [ ] **Step 1:** Failing tests for exact dependencies, CSS isolation, required props, keyboard callbacks, animations, responsive layout and missing license/ready contract conditions.
- [ ] **Step 2:** Keep technical harness URLs for automated tests, but label them explicitly as testing tools.
- [ ] **Step 3:** Add two clearly differentiated illustrative, real-source examples using pinned registry components, one dashboard and one 16:9 deck. Use isolated local demo data only.
- [ ] **Step 4:** Generate copyable ChatGPT prompts with SHA/registry ID/preset and 'preview only' safeguards; verify examples against clean consumers.
- [ ] **Step 5:** Do not promote consumer-ready status until item-specific behavior and rights reviews pass; commit.

**Acceptance:** At least two realistic, tested visual applications independent of test harness UI; 16 candidates have traceable certification progress.

### Task 10. Deck gallery with actual HTML composition (DI-09)

**Files:** Modify `src/lib/p0/HTMLDeckGallery.tsx`, `templates/pitch-inspired/deck-recipes.mjs`, `scripts/sync-decks.mjs`; create `scripts/capture-deck-posters.mjs`, `tests/e2e/deck-gallery-visual.spec.ts`.

- [ ] **Step 1:** Failing tests for ten screenshot assets, actual linked deck structure, stable 16:9 preview and intact keyboard navigation.
- [ ] **Step 2:** Capture representative real cover/slide screenshot from each source deck. Replace generic title art where a reliable screenshot is available.
- [ ] **Step 3:** Add 'Preview presentation' and 'Use recipe' action with exact source/preset and safe media/animation requirements. Connect six styles and five blueprints to existing recipes progressively.
- [ ] **Step 4:** Test mobile card flow, readability, media fallback, reduced-motion and source rights; commit.

**Acceptance:** Ten visually differentiated authentic deck previews, every source URL still works, and reusable recipe copy is concrete.

---

## Release E: P9, measured quality and release discipline

### Task 11. Visual, performance and regression governance (DI-16)

**Files:** Create `tests/e2e/visual-baseline.spec.ts`, `scripts/preview-performance-report.mjs`, `docs/library/UX_PERFORMANCE_BUDGETS.md`; modify `.github/workflows/component-library-p0.yml` and `docs/SESSION_PROTOCOL.md`.

- [ ] **Step 1:** Define screenshot fixture states: desktop 1440, tablet 768, mobile 390/320; light/dark, modal open/closed, saved, search, 200% zoom and reduced motion.
- [ ] **Step 2:** Measure first meaningful content, JS/CSS size and responsiveness in actual builds before setting thresholds. Record baseline vs optimized values.
- [ ] **Step 3:** Add stable screenshots/visual diffs and measured budgets to CI, limit retries hiding failures, and link item-specific evidence to source commit.
- [ ] **Step 4:** Stage separate Cloudflare preview, verify full 124-route release integrity plus new assets and dark/mobile QA, update Notion with evidence. Keep canonical live branch unchanged until approval.
- [ ] **Step 5:** Write rollback steps and test route aliases, source ID persistence and rights-status correctness; commit.

**Acceptance:** Source-to-visual-to-consumer evidence is traceable; no unresolved critical/serious accessibility, mobile layout, asset, or source-rights blockers.

## Release sequence and effort classes

| Release | Focus | Relative effort | Dependencies | Promotion gate |
|---|---|---|---|---|
| A (P5A) | Truth, rights, mobile repro | M | Current P4 baseline | Evidence labels truthful, conditional mobile finding resolved |
| B (P5B) | Navigation, Saved, themes/dialogs | M/L | Canonical catalog schema | All old routes work, saved persists, accessible mobile/dark |
| C (P6) | Real posters + 16 configurable previews | L | A+B | Real preview assets, replay/props, honest setup fallbacks |
| D (P7/P8) | Consumer apps + deck gallery | L | C | Verified real examples and ten differentiated decks |
| E (P9) | Visual/perf regression + release system | M | Progressive | Quality evidence, rollback, user-approved live promotion |

The first two releases should be completed before additional third-party component imports. The plan is intentionally incremental to keep the app reviewable and to avoid mixing QA with a large visual redesign.

## Self-review

- Every Design Intelligence finding DI-01..DI-16 is covered in a numbered task, with mobile screenshot uncertainty explicitly gated by reproduction.
- Source truth precedes visual certification; previews precede consumption; deck story changes reuse the same preset model.
- Each task specifies files, failing tests, expected behavioral outcome and commit/verification.
- No task requires modifying production Brandaily, importing unlicensed React Bits source or building a full visual editor.
- Distinguish **planned**, **implemented**, **tested** and **released** in GitHub, Cloudflare and Notion.

**Plan status:** Proposed and saved; implementation has not started. User approval of the UX remediations and chosen approach is needed before engineering changes.
