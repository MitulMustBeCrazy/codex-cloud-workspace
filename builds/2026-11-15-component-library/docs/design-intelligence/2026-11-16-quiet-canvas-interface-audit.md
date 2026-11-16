# Design Intelligence Interface Audit | Quiet Canvas Live Portal

**Date:** 2026-11-16
**Status:** Source- and CI-screenshot-backed audit; remediation PROPOSED, not implemented
**Audited release:** `e9579eba1e382014f4157774d32a252df2855fa4`
**Site:** https://pcl-component-library-review.pages.dev/
**Method:** Design Intelligence interface-critique + product-UX-workflow, Impeccable-style two-pass critique, Superpowers planning constraints

## Evidence and limits

**Rendered evidence:** Production SHA's GitHub Actions CI run [43784004495](https://github.com/MitulMustBeCrazy/codex-cloud-workspace/actions/runs/43784004495), artifact `personal-component-library-browser-review` (ID `14189637858`). Reviewed captured PNGs:
- `quiet-canvas-desktop.png` 1440x1820, `quiet-canvas-appearance.png` 1440x1820
- `quiet-canvas-mobile.png` 390x5615, `motionbrew-mobile.png` 390x6939
- `motionbrew-preview.png` 1440x1142, `deck-gallery.png` 1440x2758
- `brandaily-p0.png` 1440x2828, `p1-p2.png` 1440x2113
- `consumer-dashboard.png`, `consumer-deck.png`.

**Source evidence:** `src/QuietCanvasPortal.tsx`, `src/QuietCanvas.css`, `src/quietCanvasData.ts`, `src/lib/motionbrew/{MotionBrewGallery.tsx,motionbrew-gallery.css,preview-catalog.json,manifest.json}`, `src/lib/p0/HTMLDeckGallery.tsx`, `registry.json`, existing Playwright tests.

**Test evidence:** Production CI passed 43 source/registry, 18 component and 27 browser tests. Release checks 124 built paths. These tests do not constitute end-to-end visual or interaction certification of all 110 registry items.

**Limit:** Direct external HTTP inspection of the Pages domain failed with the available web tool. Screenshots come from the *same production SHA* and are a sound visual reference, but they capture specific test states. The mobile deck screenshot was taken immediately after closing the mobile menu; any persistent-layout conclusion requires stable-frame reproduction.

Evidence codes: **V** = seen in production CI screenshot; **C** = code-confirmed; **T** = CI/test-confirmed; **R** = test required to confirm behavior. Priority is proposed product impact, not a measured severity score. Effort S (small), M (moderate), L (large).

## What should be preserved

The live overview has a distinctive editorial identity: generous whitespace, asymmetric hero, restrained red accent, serif contrast, compact sidebar and a consistent matte canvas. Appearance controls and core routes are real and tested. The direction is coherent and should be **refined, not replaced**. Avoid noisy gradients, oversized glass cards, unnecessary motion, and wholesale redesign of the web deck showcase.

## Pass 1: Information architecture and task journey

**Primary user:** someone selecting a component or a deck treatment, then asking ChatGPT to reuse it in an isolated real app or presentation. Secondary task: track current references, experiment and save preferred examples.

Observed path: Overview → Components or MotionBrew → Inspect → Read description / load source → Copy generic prompt. For decks: Overview → HTML Deck Gallery → Open HTML deck / Copy generic prompt. No structured 'configure and preview your chosen variant' or visual transfer to consumer target. The dashboard/deck consumer pages are **developer harnesses**, not realistic end-user app integrations.

**Expected proposed path:** Explore → visually compare genuine behavior → choose target/preset → configure constrained props → save → copy exact usage/prompt → independently test isolated consumer → review evidence. Retain vendor/source documentation, avoid creating a full no-code editor.

### Ranked findings

| ID | Priority | Impact | Effort | Evidence | Finding | Required fix |
|---|---|---|---|---|---|---|
| DI-01 | P0 | High, trust | M | C/T | All 100 MotionBrew entries are `fixture-ready`, but share `provider-defaults` and only 11 source-specific demo prop sets; 0 have independent behavioral certification. `Preview configured` is likely interpreted as functional. | Status taxonomy and copy must show source, default-mount, configured visual, interaction-verified and consumer-verified as distinct facts. Block promotion without evidence. |
| DI-02 | P0 | High, reuse | M | C | All 100 provider manifest records and 110 registry entries have no item-specific license metadata. Rights are neither established nor disproven. | Add licenseStatus unknown/cleared/restricted with provenance, and do not offer unreviewed production adoption as certified. |
| DI-03 | P0 verify, P1 repair | High, mobile | S/M | V/R | `quiet-canvas-mobile.png` deck gallery screenshot shows roughly 45px of left-side UI exposed and headline, search and card text clipped at x=0. Test clicks to close nav and captures screenshot immediately; could be a transition-frame artifact. | Reproduce after 250ms+ and animation-settled; measure viewport, scrollX and bounding boxes. If persistent, fix drawer/body stacking and mobile widths. Add stable-frame regression. |
| DI-04 | P1 | High, discovery | M | V/C | All MotionBrew card posters share the same matte background, decorative ring and text, even for very different effects. Users cannot judge behavior without opening each item. | Generate actual component screenshot posters for deterministic safe fixtures; use honest assets-needed placeholder and typed descriptors otherwise. |
| DI-05 | P1 | High, iteration | M/L | V/C | Inspector has preview, provider/source links, generic prompt and save, but no supported prop controls, preset picker, replay, interaction affordances or example code. `BlurText` screenshot shows a transitional blurred frame. | Inspector with Preview / Configure / Usage / Evidence; replay/reset for temporal effects, allowed prop widgets, presets and still/reduced-motion fallback. |
| DI-06 | P1 | High, learnability | M | V/C | Eleven first-level sidebar destinations, including internal `P0 showcase`, `Brandaily P0`, `Presentation P0`, `P1 + P2 Lab`, plus overlapping Components and MotionBrew. | Keep existing deep links but reduce first-level choices to Explore / Components / Web decks / Saved / Workbench, with collections and technical examples progressively disclosed. |
| DI-07 | P1 | High, return use | M | C | Registry favorites persist in `localStorage`; MotionBrew and deck favorites are separately held in component state and reset upon remount/reload. | One browser-local Saved contract across component registry, MotionBrew and deck templates, with ID migration, duplicate prevention, visible saved count, accessible toggle. |
| DI-08 | P1 | Medium/high, copy clarity | S/M | V/C | The hero says `Pick up where you left off` but always shows three static category tiles. `Library preview` remains on the released production sidebar. | Replace with actual recent/saved items or label `Featured collections`; change `Library preview` to an accurate source/quality state, no fictional personalization. |
| DI-09 | P1 | Medium/high, content quality | M | V/C | Ten deck thumbnails show a generic typographic title card rather than a screenshot of the runnable HTML mini-deck. The ten cards look too similar despite distinct narrative categories. | Generate frame-accurate actual cover/slide screenshots, show layout and motion markers, provide preview-first link and source/recipe info. |
| DI-10 | P1 | Medium, accessibility | M | C/V | Numerous 9–11px metadata and control labels appear in CSS; key small labels become hard to scan on high-density/mobile displays. The live screenshot shows microtype extensively. | Minimum legible type tokens for controls and metadata; verify contrast, line height, target dimensions, zoom and dark state; retain elegant headline typography. |
| DI-11 | P1 | Medium, theme consistency | M | C | MotionBrew CSS hardcodes its own cool gray/blue surfaces and `#fff` inspector independent of Quiet Canvas tokens. Portal overrides only some selectors. | Shared tokens and deliberate demo surface scheme, dark and accent mode parity including interactive controls, focus and scrollbar. |
| DI-12 | P1 | Medium, keyboard | M | C/T | P4 specifically certified MotionBrew inspector focus trapping. Registry detail, global search and appearance have independent dialog logic; broader focus restoration/inert behavior not certified. | One reusable accessible dialog foundation, including restore origin, Escape, focus containment, background inertness and mobile scroll lock. |
| DI-13 | P1 | Medium, mobile efficiency | S/M | V/C | Mobile MotionBrew screen has search, engine, readiness, featured and category filtering before results; 15 filtered cards occupy a 6939px screenshot. | Compact sticky search and filter button/drawer with active chips; result count and one-tap reset; progressive chunking/virtualization only if measurements support it. |
| DI-14 | P2 | Medium, continuity | M | C | Global search uses substring matching, first 12 results and inconsistent target action (deck opens a new window; component opens a separate collection; styles/blueprints navigate). | Type-scoped, keyboard-first command search, direct detail route, recently used items and consistent results, no external window surprises. |
| DI-15 | P2 | Medium, adoption | L | C/V | Standalone dashboard/deck consumer views are minimal test harnesses: rows of slug buttons and plain text, not realistic Brandaily or web-deck examples. | Keep harness hidden as QA. Add separate curated use-case previews and never confuse smoke tests with finished app integration. |
| DI-16 | P2 | Medium, ops | M | C/T | Current release checks source counts and asset existence but not per-item screenshot drift, first-input latency, actual GPU performance, full licensing or high-zoom/manual screen-reader QA. | Introduce staged visual/perf/semantics gates with measurable budgets and traceable source/version reports. |

## Pass 2: Visual system and interaction polish

### A. Overview / landing

**Before, observed:** Attractive hero and '110' count panel dominate the top, with categories below. Large whitespace is editorial, but the first action funnels everyone into broad `Components`, regardless of intended use. 'Pick up where you left off' is static.

**After, proposed:** Preserve hero headline and warm-neutral mood. Add a narrow, quiet 'What are you building?' task selector (Website / Dashboard / Presentation), integrated search field, and either real Recents/Saved or honestly named Featured Collections. Replace unqualified `110 source entries` with small factual split: 110 source entries, 100 default-mount checks, 0 individually consumer-certified. Avoid heavy KPI dashboard styling.

### B. Main navigation

**Before:** 11 sidebar buttons, 4 internal engineering phases directly visible, overlapping collection names.

**After:** Five first-level destinations, 3 groups max; progressive Workbench section contains original P0/P1/P2 examples. Keep all old `?view=...` routes via aliases so prior links and Notion references work. Use product names, not implementation phases, in navigation.

### C. MotionBrew browse

**Before:** Identical beige/tan poster rectangles with arcs and large slug text; metadata 'Preview configured' repeated. Mobile filter stack puts controls far above result content.

**After:** Poster from tested component, or a neutral `Preview requires setup` fallback with exact reason. Poster ratio stays consistent. Card hierarchy: visual > title > one-sentence purpose > interaction type > verification. Metadata labels at readable size. On mobile: search + filter control, active filters, count, compact card preview.

### D. Inspector / playground

**Before:** A modal containing preview, six independent action types and a long explanatory note. The effect may be captured mid-motion; no replay.

**After:** Live Preview | Controls | Install, with side-by-side on desktop and tabs on mobile. Preserve link to provider/source. Add pause/replay/restore defaults, viewport selector, reduced-motion sample, type-safe props and feedback. Source import is never indicated as production certification. Prevent multiple GPU components from running simultaneously.

### E. HTML deck library

**Before:** Headlines-on-colored-blocks and three-card rows. Deck content not visible on card. Action is `Open HTML deck`; copying prompt gives generic language rather than exact template/asset contracts.

**After:** Real slide/deck screenshot (possibly representative cover plus two thumbnails), a 'Preview presentation' primary action and `Use this template` copy prompt containing pinned recipe/source ID. Show layout/storytelling intent, number of slides, reveal/media behaviors and aspect-ratio. Do not clone unlicensed Pitch imagery.

### F. Dark mode, typography, focus and responsiveness

**Before:** The overview is restrained but small UI text is often 9–11px. MotionBrew uses its own hard-coded colors. Mobile deck screenshot may show transition clipping. Some dialogs have different logic.

**After:** Semantic tokens for muted text, surface, border, accent, focus and inspector; better 13–14px metadata scale where space permits, 14–16px controls and 40–44px touch targets for key operations. Test 320/390/768/1440, zoom 200%, Bengali and long labels, keyboard, reduced motion. Use WCAG 2.2 AA as minimum.

## Recommended release sequence

1. **P5A (P0):** reproduce mobile screenshot anomaly; correct misleading readiness; add source/license-status truth; establish baseline visual and accessibility test matrix.
2. **P5B (P1):** simplify navigation; unify saved collection; replace static recency wording; shared typography/tokens; universal dialog handling.
3. **P6 (P1):** real gallery poster generation, accurate fallbacks and 16 configurable component inspector demos.
4. **P7 (P1/P2):** verified installation contracts and realistic dashboard/deck *examples*, preserving harnesses for QA.
5. **P8 (P2):** actual HTML deck screenshots, templates connected to six styles and five blueprints.
6. **P9 (P2):** performance, visual snapshots, component certification waves and deployment safeguards.

## Important alternatives considered

**A. Polish-first:** fastest impressive screenshots, but unsafe readiness ambiguity and integration gap persist.

**B. Trust + UX first, then real previews (recommended):** correct sources/labels/rights and navigation before adding richer controls. Minimal rework later.

**C. Full visual builder now:** too large, creates a new editor and account/persistence requirements before small reusable components are fit for real products.

## Audit limits and release guardrail

No code changes or production changes authorized by this audit. Do not describe '100 defaults mounted' as 100 working components or 16 compiled harness mounts as production certification. The live screenshot artifact is from the production commit but not a real-time interactive browser session. Reproduce conditional screenshot findings on a settled frame before fixing them.

**Next:** See the Superpowers remediation plan `docs/superpowers/plans/2026-11-16-design-intelligence-remediation.md` for owner files, failing tests, acceptance criteria, rollout and milestone gates.
