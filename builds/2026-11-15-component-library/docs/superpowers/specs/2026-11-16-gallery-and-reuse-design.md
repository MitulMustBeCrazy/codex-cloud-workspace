# Quiet Canvas A+B: Gallery Completeness and Consumer Reuse

**Date:** 2026-11-16
**Status:** Approved direction: user selected *both* Gallery-first (A) and Reuse-first (B). Technical sequencing and gate definitions in this document are implementation decisions, not independently approved product requirements.
**Source:** Current deployed Quiet Canvas portal (commit `6840a8a02571bd92dd74cec7e745bc2368dc4844`), existing MotionBrew import documentation, and Superpowers roadmap in the Notion development hub.

## Product intent
Turn the Personal Component & Deck Library into both (A) a compelling, dependable visual gallery for the full 100-component MotionBrew collection and (B) a practical set of components that ChatGPT can safely reuse in Brandaily-like products and web decks. A component card is useful only when its preview honestly describes what is working and its install instructions are reproducible.

## Existing state
- Canonical app: React 19 + TypeScript + Vite + Tailwind 4, hosted at `https://pcl-component-library-review.pages.dev/`.
- MotionBrew: 100 original vendor source files; metadata imported in `src/lib/motionbrew/manifest.json`; gallery has lazy on-demand rendering but only 13 sample prop presets; blank/default props for others are not evidence that previews function.
- Registry: 110 source entries generated with embedded files; 100 MotionBrew entries. Current registry install claims need a real external consumer.
- Available tested browser behavior: 17 Chromium scenarios, including one working `blur-text` preview; 65 tests overall.
- Quiet Canvas presentation system: independent Light/Dark, Soft Focus/Open Canvas and color accent. Preserve this across all new sections.
- Current Notion statuses contain historical inconsistencies, so do not infer consumer-ready status from a prior green gallery build.

## Goals
1. All 100 MotionBrew cards have a useful visual treatment, a preview availability status, required assets/props documented, and an explicit ability to try a component without a 100-animation performance penalty.
2. **Configurable live demos for every feasible item.** Never label a component `demo-verified` until it renders successfully with a deterministic fixture in Chromium. For restricted 3D/browser/asset cases, show a precise setup/compatibility state and keep source accessible.
3. Curate **16 flagship components** spanning text/motion, navigation, data, workflow and presentations, then install and test them in two clean consumer contexts (dashboard and web deck).
4. Make each flagship discoverable through a stable identifier `motionbrew-<slug>`, documented props/dependencies and one-click copyable code/prompt/registry reference.
5. Keep rendering lazy/on-demand, honor reduced-motion preferences, prevent cross-demo side effects, and test at narrow/mobile and 16:9 deck contexts.
6. Preserve the portal's current shipped sections and avoid touching production Brandaily or published business decks.

## Non-goals
- Building a full visual editor or persistable application builder.
- Certifying all 100 components for production without individual evidence.
- Importing React Bits reference-only source or claiming third-party license ownership.
- Adding an account system or server database to store favorites; browser-local storage remains sufficient.
- Deploying to Brandaily production or other user products without separate authorization.

## Approaches and tradeoffs
- **A, gallery-first (selected):** extensive visual previews and sample data, highest discovery value, but runtime demos alone cannot ensure downstream installability.
- **B, reuse-first (selected):** independent consumer contract, reliable installation and tests, but would leave much of the 100-component gallery unpolished on its own.
- **Combined A+B (chosen):** a single metadata/fixture system drives the gallery and reproducible consumer checks. Phase 1 focuses on shared truth; Phase 2 configures all previews; Phase 3 certifies the flagship set; Phase 4 release polish. Heavy 3D effects remain opt-in.

## Technical design

### Source metadata as truth
Store `src/lib/motionbrew/preview-catalog.json` with one record per slug. Schema:
- `slug` string matching vendor import, `status`: `source-only` | `fixture-ready` | `demo-verified` | `consumer-verified`.
- `fixture`: named demo preset id; `needs`: array of dependency/asset/interaction requirements; `notes`: literal textual setup guidance.
- `featured`: boolean, `useCases`: string[] for dashboard/presentation relevance, `motionCost`: low/medium/high/unknown.
All vendor source and attribution stay unchanged. Do not manufacture validation states from static inspection.

### Demo fixtures and gallery
Use `src/lib/motionbrew/demo-fixtures.tsx` with explicit, typed presets for curated components. Prefer no required dependencies beyond those already installed. A fallback renders a clear `Not configured` state, *not* a blank/error component mounted with arbitrary props.
- Gallery cards: type, trigger, engine, preview-readiness badge and use-case labels. Search and readiness filter.
- Inspector: on-demand preview, preset selector and supported prop controls, source provenance, copyable registry URL and chat prompt, mobile-friendly layout, close/Escape/focus restoration.
- Live previews are isolated enough to avoid canvas/webgl/audio/autoplay overlap; limit to one active instance; use CSS placeholders for costly 3D until clicked.
- All 100 items are visible; a source-only card counts as available source, not a working preview.

### Reuse fixtures
Create `tests/consumers/dashboard` and `tests/consumers/deck` as disposable Vite consumer apps or a deterministic harness that installs registry item files into clean generated roots with independent CSS. The test must exercise compiled actual exported components, not simply assert a registry JSON exists. It must detect global CSS leakage, missing source and undeclared dependencies.

Curated flagship set, provisional until source inspection: `blur-text`, `gradient-text`, `flip-words`, `magnetic-button`, `pill-tabs`, `morph-search`, `search-modal`, `activity-grid`, `goal-gauge`, `metric-split`, `month-calendar`, `message-composer`, `toast-stack`, `depth-carousel`, `prism-carousel`, `wave-text`. If a candidate has inaccessible props, assets, or license restrictions, replace it transparently with an equivalent supported component while preserving 16 verified flagship slots.

### Chat-first usage
Per-item usage documentation should include source ID, exact version/hash, source license/attribution, installed packages, required props, example JSX, visual variants, reduced-motion note and status/evidence link.
A user can copy an implementation prompt with stable registry URL and a specified use context without changing production directly.

## Rollout and release gates
1. **Inventory and truth:** all 100 records present, schema validated, no unexpected claim of `consumer-verified`.
2. **Gallery:** all 100 inspectable; configured demo fixtures show actual content; unconfigured show explicit setup instructions; keyboard and axe checks.
3. **Consumer reuse:** 16 selected candidates independently install, compile and operate in dashboard and deck fixtures. Status promotion must be tied to fresh CI evidence.
4. **Preview:** isolated branch/Cloudflare deployment plus source, browser, accessibility, responsive, reduced-motion, performance, and HTML deck regression tests. Verify public deployment before providing URL as live.
5. **Release:** only update the existing component-library portal after quality gates. Brandaily and any business deck production remain untouched until separate explicit approvals.

## Five risks to test
- A required-prop vendor component accidentally gets labeled live after rendering fallback text.
- Registry installs with hidden local imports or global Tailwind dependency and fails in independent consumer.
- Canvas/GSAP/Three demo keeps running after inspector closes, degrading phone performance.
- Focus is lost after a modal closes; live demo and gallery do not respect reduced motion.
- 100-card search on a 320 px screen overflows, rerenders all animations or blocks keyboard navigation.

## Acceptance criteria
- Accurate 100/100 inventory, no false `verified` state.
- Useful, configured demonstrations for the feasible vendor components, with blockers documented individually for any that cannot be configured.
- Sixteen flagship components with real consumer build and integration tests; no promotion without evidence.
- Stable IDs and copyable prompts suitable for regular ChatGPT use.
- User has a reviewable isolated preview and can compare against the unchanged live release before rollout.
