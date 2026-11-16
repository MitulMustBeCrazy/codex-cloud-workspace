# Gallery Completeness and Consumer Reuse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver both a comprehensive honest MotionBrew gallery for all 100 source components and at least 16 independently reusable, tested flagship components.

**Architecture:** Single versioned metadata and fixture catalog drives the Quiet Canvas gallery and downstream installability harness. Vendor source stays unchanged; individual effects load on demand. Test a real consumer bundle before moving `consumer-verified` status.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Motion, GSAP, Three.js, Node test runner, Playwright/axe, GitHub Actions, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-11-16-gallery-and-reuse-design.md`

## Global Constraints
- Work only in isolated branch `feature/pcl-gallery-and-reuse-2026-11-16`; never touch production Brandaily or existing business deck deployments.
- Preserve Quiet Canvas appearance options and navigation. Keep all 100 provider originals and attribution untouched.
- Do not describe `source-only` or `fixture-ready` as browser verified. Status promotion requires traceable test evidence.
- Do not import the React Bits reference-only materials.
- Always load expensive GPU/3D effects only after explicit user interaction and honor reduced motion.
- Check full existing source, browser and accessibility suites for regressions before any release.

## Review Focus
1. A source-only component with required props never displays a false live-demo badge. Pinned in Task 1 and 3.
2. A vendor component with undeclared transitive imports fails consumer verification, not silently succeeds. Pinned in Task 4.
3. Closing the inspector restores keyboard focus and stops active demo animations. Pinned in Task 3.
4. A 320px/mobile viewport maintains usable gallery filters and scroll without horizontal overflow. Pinned in Task 3 and Task 6.
5. A component is marked consumer-verified only after its independent consumer installation and interaction test passes. Pinned in Task 5.

---

### Task 1: Source-truth metadata for the full 100

**Files:**
- Create: `src/lib/motionbrew/preview-catalog.json`
- Create: `src/lib/motionbrew/preview-status.mjs`
- Test: `src/lib/motionbrew/preview-status.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `validatePreviewCatalog(catalog,manifest): {valid:boolean;errors:string[]}`
- Produces: `readinessLabel(status):string`, `readinessRank(status):number`
- `PreviewRecord`: `slug,status,fixture,needs,notes,featured,useCases,motionCost`
- Consumes: `src/lib/motionbrew/manifest.json` and immutable `src/lib/motionbrew/components/*.tsx`.

- [ ] **Step 1:** Write failing tests: exact match with 100 distinct manifest slugs; no missing/extra records; unknown states rejected; `source-only` never receives `demo-verified` label.
- [ ] **Step 2:** Run `node --test src/lib/motionbrew/preview-status.test.mjs` and record expected failure (module missing).
- [ ] **Step 3:** Implement catalog and validator; initialize every record `source-only` with clear limitations and known engine/use-case data, no invented verification evidence.
- [ ] **Step 4:** Run targeted tests green and `npm test`; commit `feat(motionbrew): define honest 100-item readiness catalog`.

### Task 2: Preview fixtures and provider prop audit

**Files:**
- Create: `src/lib/motionbrew/demo-fixtures.tsx`
- Create: `src/lib/motionbrew/fixture-types.ts`
- Create: `docs/motionbrew/PROPS_AND_ASSETS.md`
- Modify: `src/lib/motionbrew/preview-catalog.json`
- Test: `src/lib/motionbrew/demo-fixtures.test.tsx`

**Interfaces:**
- Produces: `getFixture(slug:string, presetId?:string):{props:Record<string,unknown>;label:string}|null`
- Produces: `getFixtureIds(slug:string):readonly string[]`.

- [ ] **Step 1:** Inspect all 100 provider exports and their required props/assets, document limitations; shortlist 16 for consumer verification.
- [ ] **Step 2:** Write failing tests for fixture lookup, unknown slug and required-prop completeness.
- [ ] **Step 3:** Implement explicit demo fixtures in batches (text, navigation, data, 3D, workflow). A `null` fixture means intentional setup-required, not rendering with arbitrary default props.
- [ ] **Step 4:** Update per-item catalog to `fixture-ready` only where a deterministic fixture exists. Each batch gets a focused test and commit.
- [ ] **Step 5:** Iterate until all feasible 100 have working fixture definitions or explicit item-specific blockers.

### Task 3: Quiet Canvas interactive gallery

**Files:**
- Modify: `src/lib/motionbrew/MotionBrewGallery.tsx`
- Modify: `src/lib/motionbrew/motionbrew-gallery.css`
- Modify: `src/QuietCanvas.css`
- Test: `tests/e2e/motionbrew.spec.ts`
- Create: `tests/e2e/motionbrew-preview-coverage.spec.ts`

**Interfaces:** Consumes `getFixture()`, `PreviewRecord`; exposes filter `status` and a modal with preset controls and source detail.

- [ ] **Step 1:** Write failing Playwright checks for readiness badge truth, selected inspector details, source-only setup fallback, and filter by readiness; verify failing on baseline.
- [ ] **Step 2:** Implement truthful readiness and source details, progressive lazy previews, preset controls and copyable prompts/registry links.
- [ ] **Step 3:** Add keyboard focus restore and dialog scrolling/focus controls; verify Escape, tab order and reduced motion.
- [ ] **Step 4:** Run at 320/390/768/1440 widths, WCAG axe critical/serious, and source-only/fixture-ready permutations; commit.
- [ ] **Step 5:** Generate per-fixture preview screenshots; record any required asset/compatibility blockers without silently promoting status.

### Task 4: Independent consumer-install harness

**Files:**
- Create: `scripts/verify-consumer-install.mjs`
- Create: `tests/consumers/dashboard/index.tsx`, `tests/consumers/deck/index.tsx`
- Create: `tests/consumers/consumer-install.test.mjs`
- Modify: `package.json`, `.github/workflows/component-library-p0.yml`

**Interfaces:**
- Consumes `public/r/motionbrew-<slug>.json` generated by `build:registry`.
- Produces `verifyConsumerInstall(slugs,context):Promise<InstallResult[]>`, `InstallResult={slug,context,compiled,missingImports:string[],warnings:string[]}`.

- [ ] **Step 1:** Write failing tests proving missing source and missing declared dependency are detected.
- [ ] **Step 2:** Build two independent temporary Vite roots with clean Tailwind contexts and no imports from the portal.
- [ ] **Step 3:** Verify that actual registry outputs compile in isolation without global CSS leaks, including Bengali/long labels.
- [ ] **Step 4:** CI runs both consumer builds and rejects invalid install manifests; commit.

### Task 5: Verify 16 production candidates in both consumers

**Files:**
- Modify: `src/lib/motionbrew/preview-catalog.json`
- Create: `docs/motionbrew/FLAGSHIP_COMPONENTS.md`
- Create: `tests/e2e/consumer-dashboard.spec.ts`, `tests/e2e/consumer-deck.spec.ts`
- Modify: `.github/workflows/component-library-p0.yml`

**Interfaces:** Uses `InstallResult` from Task 4. Set `consumer-verified` only with independently confirmed compilation and behavior.

- [ ] **Step 1:** Choose final 16 from inspected provider source; record exact dependency/prop API and failure states.
- [ ] **Step 2:** Write failing behavior tests for component interactions, keyboard, reduced motion and mobile.
- [ ] **Step 3:** Wire fixtures into both independent consumer apps and pass build/browser tests for each.
- [ ] **Step 4:** Promote individually verified catalog entries with evidence links. Do not promote failures or untested entries.

### Task 6: Release, accessibility, and performance checks

**Files:**
- Modify: `tests/e2e/quiet-canvas.spec.ts`, `tests/e2e/motionbrew.spec.ts`
- Create: `docs/motionbrew/QA_AND_PERFORMANCE.md`
- Modify: `.github/workflows/component-library-p0.yml`

- [ ] **Step 1:** Measure initial gallery load, animation frame pressure for high-cost demos, and number of mounted animations (only one active).
- [ ] **Step 2:** Verify hosted links `/`, `/?view=motionbrew`, `/r/index.json`, `/r/motionbrew-blur-text.json`, `/decks/pitch-inspired/board-report.html`.
- [ ] **Step 3:** Check Light/Dark and Open Canvas/Soft Focus and keyboard focus in inspector at 320 and 1440 px.
- [ ] **Step 4:** Run `npm run build && npm test && npm run test:e2e`; ensure no regression to existing 10 HTML deck previews.
- [ ] **Step 5:** Publish isolated Cloudflare preview for review; do not modify the current live component-library portal until it passes gates and release is approved.

### Task 7: Chat-first integration documentation and Notion synchronization

**Files:**
- Create: `docs/motionbrew/CHAT_PROMPT_LIBRARY.md`
- Modify: `docs/SESSION_PROTOCOL.md`
- Notion: `06 | Personal Component & Deck Library` (session and component-level items).

- [ ] **Step 1:** Produce exact component ID, registry URL, prop contract and example chat prompts for each consumer-verified flagship.
- [ ] **Step 2:** Add claim/verification definitions and source-specific licensing notes.
- [ ] **Step 3:** Reconcile stale Notion statuses against corresponding code and test evidence.
- [ ] **Step 4:** Record branch, verified CI run, live preview URL, blockers and next approval gate in Notion.

## Self-review
- Each task owns a checkable deliverable and avoids requiring unchanged vendor source to be edited.
- Catalog and preview UI share a single readiness model; consumer harness owns `consumer-verified` promotion.
- Source-only fallback explicitly remains, even in the final A gallery, when a vendor requirement cannot be satisfied legally or technically.
- `npm test` and Chromium tests must be run against fresh commit state. No production write before explicit approval.

## Current execution
This plan captures the user-selected combined A+B direction. Start with Task 1 and Task 2 design/source audit, then iterate with test evidence. Long-tail Task 2 fixtures and full Task 5 certification are separate milestones; mark incomplete work honestly.
