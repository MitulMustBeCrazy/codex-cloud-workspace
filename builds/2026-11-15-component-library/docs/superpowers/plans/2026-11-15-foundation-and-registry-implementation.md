# Personal Component Library Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Status:** DRAFT ONLY. Do not execute until the proposed design is reviewed and approved.

**Goal:** Deliver a tested, independently installable first slice of the Personal Component Library, browsable as a private preview and reusable from chat instructions without migrating Brandaily or any deck.

**Architecture:** A React/TypeScript workspace separates semantic tokens, core components, data blocks, catalog metadata and the gallery. Storybook supplies executable component stories; a shadcn-compatible registry distributes individual items. Static fixture data lives in stories, not in component implementations.

**Tech Stack:** React 19, TypeScript, Vite, pnpm workspaces, CSS custom properties, Radix only for complex accessible interactions, Storybook/Vitest, Playwright, axe accessibility, GitHub CI. Exact compatible package versions to be locked during implementation, not assumed in this draft.

**Spec:** docs/superpowers/specs/2026-11-15-personal-component-library-design.md (proposed dedicated repository). Source planning copy exists under builds/2026-11-15-component-library/docs/superpowers/specs/ on the prototype branch.

## Global Constraints
- Do not modify Brandaily, any published deck, or production hosting.
- React component code must not import from gallery, Storybook, Brandaily or presentation applications.
- Components must accept external props and handlers and expose visible disabled/loading/error where applicable.
- English and Bengali script must render without clipping.
- All reusable styles must use namespaced classes or scoped CSS variables, not broad h1/button/body selectors.
- Every component must support keyboard operation and reduced-motion where relevant.
- All registry items must record dependencies and license provenance.
- A component becomes released only after verified tests; demo is not released.
- Source ownership and license approval are required before importing code from third-party galleries.

## Review Focus
1. Consumer app has existing button styles; installing SurfaceCard must not change unrelated markup. Test this in Task 2.
2. Empty or very long KPI labels and Bengali text must wrap/clip safely. Test this in Task 4.
3. A keyboard user opens then closes a Dialog; focus must return to trigger and page must not stay scroll-locked. Test this in Task 3.
4. Consumer tries to install just MetricCard; registry must resolve its required token and SurfaceCard dependencies. Test this in Task 6.
5. Reduced-motion and 200% zoom users must have usable content and no essential transitions. Test this in Task 7.

---

## File Map (proposed dedicated repository)
- package.json, pnpm-workspace.yaml, pnpm-lock.yaml: workspace and scripts.
- packages/tokens/src/{index.ts,theme.css}: semantic design tokens with light/dark and deck-safe values.
- packages/core/src/{index.ts,SurfaceCard.tsx,Button.tsx,StatusBadge.tsx,Dialog.tsx,Tabs.tsx}: core UI components.
- packages/data/src/{index.ts,MetricCard.tsx,ProgressMeter.tsx}: first data blocks.
- packages/catalog/src/{schema.ts,items.ts,styles.ts,recipes.ts}: typed metadata; one status source of truth.
- apps/gallery/src/{App.tsx,components/ComponentPage.tsx,components/StylePage.tsx,components/RecipePage.tsx}: browser and previews.
- .storybook/{main.ts,preview.ts}: component testing/docs.
- registry/registry.json and registry/items/*.json: registry definitions and build input.
- tests/{registry.test.ts,token-scope.test.ts,visual.spec.ts}: cross-package checks.
- .github/workflows/verify.yml: CI.
- docs/{CONTRIBUTING.md,USAGE.md,LICENSING.md}: adoption and release rules.

### Task 1: Isolated workspace, semantic tokens, deterministic build
**Files:** Create package.json, pnpm-workspace.yaml, packages/tokens/src/index.ts, packages/tokens/src/theme.css, packages/tokens/src/tokens.test.ts, .github/workflows/verify.yml.
**Interfaces:** export type ThemeId = "app-light" | "app-dark" | "deck-light" | "deck-dark"; export const themeIds: readonly ThemeId[]; export function getThemeClass(theme: ThemeId): string.
- [ ] Step 1: Write tests asserting every ThemeId resolves a class and every class defines foreground/background/accent tokens.
- [ ] Step 2: Run pnpm test -- packages/tokens/src/tokens.test.ts; expect FAIL before implementation.
- [ ] Step 3: Implement token classes scoped under .pcl-theme-* and exports; configure strict TypeScript and package scripts.
- [ ] Step 4: Run pnpm install --frozen-lockfile after lockfile generation, pnpm build, and pnpm test; expect PASS.
- [ ] Step 5: Commit "feat: establish isolated component workspace and tokens".

### Task 2: Stateless SurfaceCard and StatusBadge
**Files:** Create packages/core/src/SurfaceCard.tsx, StatusBadge.tsx, index.ts, SurfaceCard.test.tsx, StatusBadge.test.tsx, .storybook core stories.
**Interfaces:** SurfaceCardProps = React.HTMLAttributes<HTMLElement> & {as?: "div"|"section"|"article"; density?: "compact"|"regular"; tone?: "default"|"muted"}; StatusBadgeProps = {label:string; tone:"neutral"|"success"|"warning"|"danger"; icon?:React.ReactNode}.
- [ ] Step 1: Test keyboard-independent rendering, prop-controlled states, semantic labels, and no changes to an external .sample-button fixture.
- [ ] Step 2: Run pnpm test -- packages/core; expect FAIL on missing exports.
- [ ] Step 3: Implement no hardcoded content, scoped CSS, slot-like children and stable ref forwarding when required.
- [ ] Step 4: Run tests and scoped CSS consumer fixture; expect PASS.
- [ ] Step 5: Commit "feat: extract reusable card and status components".

### Task 3: Accessible Button, Tabs and Dialog
**Files:** Create packages/core/src/{Button,Tabs,Dialog}.tsx, companion tests and Storybook stories.
**Interfaces:** Button supports variant ("primary"|"secondary"|"quiet"), size ("sm"|"md"|"lg"), isLoading, disabled, onClick. Tabs controlled value/onValueChange. Dialog controlled open/onOpenChange, trigger/content slots.
- [ ] Step 1: Test click suppression while loading, arrow-key Tab switching, Escape Dialog close, initial focus, focus restore and scroll unlock.
- [ ] Step 2: Run component test suite; expect FAIL before code.
- [ ] Step 3: Implement using native HTML and optional Radix accessible primitives, not custom focus traps.
- [ ] Step 4: Run interaction tests and axe checks; expect PASS.
- [ ] Step 5: Commit "feat: accessible controls and overlays".

### Task 4: Reusable KPI/MetricCard and ProgressMeter
**Files:** Create packages/data/src/{MetricCard,ProgressMeter,index}.tsx, tests and stories.
**Interfaces:** MetricCardProps = {label:string; value:number|string; locale?:string; suffix?:string; trend?:{value:number; direction:"up"|"down"|"flat"; positiveWhen:"up"|"down"}; period?:string; loading?:boolean}; ProgressMeterProps = {label:string; value:number; max:number; formatValue?:(v:number)=>string}.
- [ ] Step 1: Test number formatting via locale, negative and zero values, trend semantics independent from arrow direction, long Bengali labels, values greater than max, and undefined trend.
- [ ] Step 2: Run pnpm test -- packages/data; expect FAIL before implementation.
- [ ] Step 3: Implement using tokens, accessible labeling and externally supplied data only.
- [ ] Step 4: Run data tests at 360px and presentation-width story render; expect PASS.
- [ ] Step 5: Commit "feat: accessible metric and goal primitives".

### Task 5: Typed catalog and Storybook documentation
**Files:** Create packages/catalog/src/{schema,items,styles,recipes}.ts, catalog.test.ts, .storybook/{main,preview}.ts, component stories and docs.
**Interfaces:** CatalogItem = {id:string; category:string; useCases:string[]; status:"idea"|"prototype"|"tested"|"released"|"deprecated"; sourcePath:string; dependencyIds:string[]; license:string; attributionUrl?:string; previewIds:string[]; tags:string[]}; resolveCatalogItem(id:string):CatalogItem|undefined.
- [ ] Step 1: Test unique IDs, no released item without story/test references and no unresolved dependency IDs.
- [ ] Step 2: Run catalog test; expect FAIL until data schema exists.
- [ ] Step 3: Migrate existing 20 catalog descriptions but preserve truthful prototype/planned statuses; author interactive Storybook stories for implemented blocks.
- [ ] Step 4: Run story build and catalog tests; expect PASS.
- [ ] Step 5: Commit "feat: typed component manifest and Storybook catalog".

### Task 6: Selective registry installation
**Files:** Create registry/registry.json, registry/items/*.json, tests/registry.test.ts, docs/USAGE.md and release script/config.
**Interfaces:** One registry item per exported component; stable names core.surface-card, core.dialog, data.metric-card, etc. Installation must declare all files, token CSS and relevant dependencies.
- [ ] Step 1: Test registry schema validity, unique names, required license metadata and dependency closure.
- [ ] Step 2: Run registry validation; expect FAIL until registry items exist.
- [ ] Step 3: Create compliant source registry and document copying/installing one component into a disposable consumer app.
- [ ] Step 4: Install data.metric-card into fixture app, build it and verify it needs no gallery package; expect PASS.
- [ ] Step 5: Commit "feat: distribute standalone components through registry".

### Task 7: Gallery, responsive preview and release gates
**Files:** Create apps/gallery/src/{App,components/ComponentPage,components/StylePage,components/RecipePage}.tsx, tests/visual.spec.ts, .github/workflows/verify.yml, docs/CONTRIBUTING.md and LICENSING.md.
**Interfaces:** Search by id/name/tags/useCase; component pages list statuses and source/usage; sample style and recipe pages are clearly marked planned until working examples ship.
- [ ] Step 1: Test search/filter semantics and the "demo vs released" state distinction.
- [ ] Step 2: Run gallery test; expect FAIL until implementation.
- [ ] Step 3: Port v0.1 gallery layout as a consumer of packages; add property controls only where source component props exist.
- [ ] Step 4: Run pnpm build, pnpm test, pnpm storybook:build, pnpm playwright test, registry validate; inspect 360/768/1440/1920 screenshots and 200% zoom.
- [ ] Step 5: Verify reduced-motion, keyboard-only and dark/light compatibility; document manual checks.
- [ ] Step 6: Commit "feat: searchable component gallery and release QA".

### Task 8: Private preview and handoff
**Files:** docs/USAGE.md, docs/RELEASE.md, preview deployment configuration (isolated only).
**Interfaces:** Preview URL returns gallery; reference IDs map to registry docs; no live Brandaily dependencies.
- [ ] Step 1: Deploy private staging using an isolated target, with no production custom-domain or project mapping changes.
- [ ] Step 2: Smoke-test registry install and gallery on deployed preview; record build SHA, live URL, and test results.
- [ ] Step 3: Publish a release report listing certified components, known gaps and future integration blockers.
- [ ] Step 4: Commit "docs: publish verified foundation release notes".

## Later independent plans, not included in this executable milestone
1. Brandaily workflows: Today task promotion, @/#/$ rich-mention editor, approval stages, communication panel, calendar five views, search/saved views, backend adapters.
2. Presentation components: slide-safe layouts, audio/video/media-stage state machine, lightbox and aspect-fit handling, dynamic word cloud, bilingual typography, chart and motion reveals.
3. Deck templates and styles: six complete style packs, five narrative recipes, 5+ slide mini-decks for each, legal/provenance references, searchable tag and prompt aliases.
4. Adoption plans: connect to Brandaily isolated preview first and a distinct sample web deck second. Explicit approval separately required for any production modifications.

## Phase-1 acceptance
- At least 5 independently installable component families (SurfaceCard, StatusBadge, Button, Dialog, MetricCard), plus working Tabs and ProgressMeter as QA permits.
- One app-light and one app-dark theme plus deck baseline tokens.
- Searchable gallery, Storybook examples and a working selective registry.
- All relevant CI checks pass on a specific commit; no source-only "ready" claims.
- A fresh consumer fixture installs a component without importing the gallery.
- No production modifications or unintended third-party licensed assets.

## Self-review
Spec coverage: Phase-1 plan deliberately covers only core foundation and validation. Brandaily blocks, multimedia and deck recipes are named as separate plans, not silently promised in Phase 1.
Interfaces: Data package only imports core and tokens; gallery imports packages, never reverse.
Failure modes: CSS leakage, long/Bengali text, focus restoration, partial registry install, reduced motion and high zoom each have an owning task and test.
Proportion: Steps identify commands, expected observable outcomes and exact source locations; implementation details remain for coding sessions.
