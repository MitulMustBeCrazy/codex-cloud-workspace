# MotionBrew: Complete Provider Import

Updated: 2026-11-15
Status: **Source imported and build verified**, user-facing individual component quality certification pending.

## Provenance
- Provider: https://motion-brew.com
- Connector used: MotionBrew `list_components`, `get_component(files="single")`, `get_install_plan`, `get_setup`.
- Total components in provider catalog at sync: **100**.
- Every component's original, provider-supplied single-file React TypeScript source is preserved in `src/lib/motionbrew/components/<slug>.tsx`.
- Source attribution and included third-party MIT notices are retained. Do not remove them.
- Provider metadata for all 100: `src/lib/motionbrew/manifest.json`.

## Installation and dependencies
This library's preview project uses React 19, Motion, GSAP, @gsap/react, Three.js, clsx, tailwind-merge, lucide-react, Tailwind CSS v4 and @tailwindcss/vite.

Files were imported as original source into an isolated development branch. The source is kept separate from native project components. The gallery only loads one component on demand, so large 3D or infinite animations do not run across 100 cards simultaneously.

Standalone consumer installation:
1. Add React 18/19 and Tailwind CSS v4 (the component files contain Tailwind classes).
2. Choose one registry item from `/r/motionbrew-<slug>.json`.
3. Install npm dependencies declared in that item, and copy its files to a supported React source folder.
4. Configure the required props/media assets. Consult each component's official `https://motion-brew.com/components/<slug>` documentation.
5. Preserve license/attribution notices in source.

The registry contains **110 items** total: 10 original library items and 100 MotionBrew component entries.

## Gallery UX
- Tab: `MotionBrew 100`.
- Search by name, slug, description, engine, category, or trigger.
- Filters for five use-case categories and animation engine.
- Responsive card browser shows source provenance, trigger and engine.
- Inspector offers original documentation, imported source link, copyable chat-reference ID, favorites within the session and opt-in live preview.
- Preview is intentionally not auto-mounted on the grid. Complex components may need required props or assets to render fully, in which case the error boundary provides a setup message.
- Stable chat reference: `motionbrew-<slug>`.

## Quality gates
- CI verifies 100 unique slugs, 100 existing source files, 100 matching registry entries, provider attribution and client directives.
- TypeScript checks library integration code; upstream vendor files are excluded from unused-variable lint-level warnings without editing their original code. Vite still transpiles and bundles all 100 files as lazy chunks.
- Playwright verifies 100 cards, gallery search, category/engine filtering, BlurText live example, narrow viewport and severe axe accessibility findings.
- Existing Brandaily, web deck and P1/P2 tests still run.

## Limitations
- A successful build validates full-source compilation, not correctness of all 100 interactive behaviors in every consumer context.
- Many provider components rely on external images, specific props, user input or 3D/browser capabilities; not all have universal default demos.
- Some effects may carry significant GPU or bundle cost when activated. Keep native app integration selective.
- Tailwind CSS v4 changes build/runtime styling requirements. Use scoped integration review before any Brandaily adoption.
- Imported original source files are made available in this developer's library; confirm third-party licensing requirements before distributing the collection beyond intended use.

## Safety and deployment
- Developer source branch: `feature/pcl-motionbrew-100-2026-11-15`.
- Draft PR #2 targets the prior P0/P2 preview branch, NOT Brandaily production.
- Only merge into isolated preview branch after full CI passes.
- Preserve the original P0/P2 components and all ten HTML presentation templates.
- Update the project Notion session log with commit, CI evidence and deploy URL.
