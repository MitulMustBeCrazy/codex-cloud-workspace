# Chat-first Usage: MotionBrew Component Library

Use this stable project context whenever selecting a component in ordinary ChatGPT.

**Repository:** `MitulMustBeCrazy/codex-cloud-workspace`
**Current A+B development branch:** `feature/pcl-gallery-and-reuse-2026-11-16`
**Root:** `builds/2026-11-15-component-library`
**Registry:** `https://pcl-gallery-reuse-review.pages.dev/r/motionbrew-<slug>.json`
**UI:** [A+B review preview](https://pcl-gallery-reuse-review.pages.dev/?view=motionbrew)
**Code:** [Flagship list](https://github.com/MitulMustBeCrazy/codex-cloud-workspace/blob/feature/pcl-gallery-and-reuse-2026-11-16/builds/2026-11-15-component-library/docs/motionbrew/FLAGSHIP_COMPONENTS.md)

## Example prompt: dashboard
> In our Personal Component Library, inspect `motionbrew-activity-grid` and its actual registry source/dependencies. Install it into a **new isolated Brandaily-like dashboard preview**, use sample activity data, preserve existing accessibility and styling conventions, and run component and mobile QA. Return the preview and file diff. Do not modify live Brandaily without explicit approval.

## Example prompt: web presentation
> In the Personal Component Library, inspect `motionbrew-blur-text` and `motionbrew-depth-carousel`. Apply them to a new isolated HTML/React strategy deck preview with clear 16:9 composition, subtle reveal timing, and reduced-motion support. Verify transitions, fallback behavior and keyboard controls. Do not alter any existing published presentation.

## Example prompt: modify a preset
> Use `motionbrew-gradient-text` with an editorial Light + Soft Focus Quiet Canvas direction. Provide a configurable control over the text and speed, and display its actual rendered result in an isolated preview. Confirm package dependencies, license attribution and accessibility before proposing release.

## Verification note
At present, 100/100 default gallery previews rendered and 16/16 flagship candidates compiled and mounted in two independent consumer contexts, as shown in [CI #118](https://github.com/MitulMustBeCrazy/codex-cloud-workspace/actions/runs/43761497671). This does not establish full interaction/API licensing certification. Treat these as preview and build evidence, not a blanket production release license.
