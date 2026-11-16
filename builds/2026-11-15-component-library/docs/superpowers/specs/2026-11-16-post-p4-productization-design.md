# Post-P4 Component Library: Productization Design Proposal

**Date:** 2026-11-16
**Status:** PROPOSED, NOT APPROVED FOR IMPLEMENTATION
**Live reference:** https://pcl-component-library-review.pages.dev/
**Source baseline:** `feature/pcl-p0-p2-2026-11-15`, deployed commit `e9579eba1e382014f4157774d32a252df2855fa4`.
**User request:** Superpowers audit of what should be updated, improved, modified and added after the A+B and P4 release.

## Intent and decision frame

Quiet Canvas is a personal, chat-first library of reusable product components and web-storytelling systems. It must let a person *discover a useful component, see the actual behavior, configure a variant, obtain the exact install or chat-use contract, and use it in a safe preview* rather than merely browse a list of sources. It is separate from old Deck Studio and from production Brandaily.

Three development approaches are possible:

1. **Visual-first:** redesign gallery, photos and motion before adding certified usage. Attractive and motivating, but would preserve false expectations about component readiness.
2. **Productization-first with visual delivery in parallel (RECOMMENDED):** normalize metadata and readiness, validate licensing, build curated preview fixtures, add visual discovery, certify consumer integrations, then deepen deck toolkit. Higher reuse value, avoids committing to a full editor, preserves existing shipping velocity.
3. **Full no-code editor:** drag/drop screen/deck assembly with accounts and synced projects. High scope, duplicates prior editor concepts and requires persistence/auth infrastructure before core component reusability is validated.

**Recommendation only:** Option 2, with continued chat-first execution, source files and Notion knowledge, preview-first release gates. Request the user's approval before making product changes.

## Evidence from repository and latest published CI

- The canonical Cloudflare project deployed `e9579eba...` successfully. GitHub CI `43784004495` passed 43 source/integrity, 18 component and 27 Chromium tests (88 total). The build release gate covers 124 output routes.
- `registry.json`: 110 source entries, including 100 `motionbrew-*` and 10 native `pcl-*`.
- `src/lib/motionbrew/preview-catalog.json`: 100 components tagged `fixture-ready`; 0 `demo-verified` and 0 `consumer-verified`. All share fixture `provider-defaults` and a generic note; only one record has a nonempty `needs` array. This measures a smoke mount, not real behavior.
- `src/lib/motionbrew/MotionBrewGallery.tsx`: 11 explicit slug-specific sample-props entries; other 89 mount with empty props. The 100 cards use text-based stylized artwork, not component-generated thumbnails. All real component code loads lazily only on inspection. The separate gallery favorite state is component-local.
- `src/lib/motionbrew/manifest.json`: all 100 have documentation links, none declares a license field. The 110 root registry entries also lack explicit `license` metadata. **No statement is made about legal permission or restriction; that must be established from originals.**
- `src/QuietCanvas.css` has light/dark appearance handling, but `src/lib/motionbrew/motionbrew-gallery.css` uses hard-coded colors with no theme selector. Thus dark-mode consistency requires manual visual verification and likely theme token integration.
- `src/QuietCanvasPortal.tsx`: 11 sidebar sections; registry saved IDs and appearance persist in browser localStorage, but MotionBrew favorites and HTML deck favorites are stored separately in ephemeral component state. Global search is simple substring matching and caps its first results to 12. The overview's 'work' artwork uses fixed sample data rather than recent local activity.
- `src/lib/p0/HTMLDeckGallery.tsx`: ten actual HTML deck examples with template cards and copy-prompt action, but gallery-level favorites are only per session; no in-portal editable slide/asset controls. Six visual style definitions and five blueprint narratives are browsing references, not directly configurable runnable deck presets.
- `docs/motionbrew/FLAGSHIP_COMPONENTS.md` and `tests/e2e/consumer.spec.ts`: 16 flagship component sources compile and mount in separate dashboard and deck contexts. They are NOT individually behavior-certified.
- P4 added keyboard containment to MotionBrew inspector. The global search and appearance dialogs are implemented separately; full focus trap, return focus and screen reader behavior of *all* dialogs must be independently audited.
- Current CI indicates route availability, smoke mounts, limited accessibility and responsive coverage. It does **not** prove subjective mobile polish, browser compatibility across all 100 vendor effects, external assets, production-level performance or licensing.

**Inspection limitation:** Live public site could not be fetched by the assistant's web/container runtime, so source-and-CI conclusions above are grounded, but visual defects have to be confirmed in a hosted screenshot/browser pass before being called fixed.

## Product requirements

### 1. Clear and truthful readiness

One catalog record per item, not conflicting labels in `manifest.json`, preview catalog and UI.

- `source-imported`: source and provenance available.
- `preview-configured`: deterministic props, assets and poster/stage provided.
- `preview-tested`: specific behavior and visual screenshot tested in browser with evidence.
- `consumer-tested`: installed in independent consumer, behavior verified under its actual styles.
- `release-approved`: licensed/approved for specific usage; not inferred from earlier steps.

Use a separate `licenseStatus` (`cleared` / `restricted` / `unknown`) rather than conflating it with engineering readiness. New installation controls must reflect these states without making legal claims.

### 2. Unified discovery and user journey

**Journey:** Discover → Inspect actual preview → Configure safe props and sample content → Save preset → Copy exact component install or chat prompt → Build isolated Brandaily-like or deck preview → Review evidence → Approve release.

Proposed navigation:
- **Explore**: Overview, All components and MotionBrew, saved/collections.
- **Build**: Component Playground, Decks + Visual Styles, Narrative Blueprints.
- **Workbench**: existing P0/Brandaily/presentation/lab demos, retained under one 'Examples' area with progressive disclosure.
Do not delete existing routes or component inventories; maintain redirects/aliases.

Unify favorites across registry, MotionBrew and decks via a common browser-local store as default. Cross-device accounts should remain opt-in and out of scope until explicitly needed.

### 3. Live preview configuration without a heavyweight new editor

Use the vendor source without changing it; create typed adapter fixtures, explicit allowed controls, presets, and light/dark or device contexts. Starting set: 16 flagship components. For remaining sources, create meaningful static capture/asset requirements and a truthful 'Setup required' state. Gallery cards should use real preview stills or known fallbacks rather than invented artwork.

Only one high-cost runtime demo may be active. Respect `prefers-reduced-motion` in both animation and event-driven JS, prevent autoplay sound, unmount on close, and control GPU cost on mobile. No drag/drop builder.

Consider Storybook's args/controls model as a design reference, not an obligatory dependency. Existing React and Vite should remain the app runtime.

### 4. Portable and verifiable consumption

Every eligible item gets a stable registry ID, explicit deps and peer deps, source/attribution/license notes, version or source SHA, props schema, safe examples, normal/dark/responsive states and a verified install recipe.

Use existing shadcn-compatible registry JSON and a small optional validated install adapter rather than inventing a proprietary package manager. Include a **copy prompt** referencing a pinned artifact and asking ChatGPT to make changes *only in a preview branch*.

Certify all 16 flagships with meaningful interaction/keyboard/empty/error/media and CSS-scoping checks. Replace any blocked or incompatible flagship transparently rather than falsifying status.

### 5. First-class code-based presentation library

Give ten existing HTML decks real screenshots, full view and source/deck recipe metadata; connect six visual directions and five narrative blueprints to runnable configuration, not only descriptions. Expose media-ready placements (image/video/audio), animation/reveal presets and sensible presentation controls. No full slide editor and no copying of unlicensed Pitch/React Bits assets.

React Bits 39 names remain reference-only until rights and provenance are checked.

### 6. Quality, design consistency and release discipline

- Define shared Quiet Canvas semantic design tokens for shell, cards, focus, demo, typography, borders and dark mode.
- Manual and automated mobile QA: 320/390/768/1440 CSS widths; 200% zoom, touch, keyboard, Bengali + long text, reduced motion, no horizontal overflow.
- WCAG 2.2 AA baseline, focus visible/not obscured, accessible dialogs and target sizes. Zero unresolved *critical or serious* axe issues; manual keyboard/screen reader smoke required.
- Quantitative performance budgets for initial page and on-demand GPU effects; target Google's Core Web Vitals thresholds using actual collected measurements, not a blanket score claim.
- Move the canonical Cloudflare project off a temporary `feature/*` production branch onto an intentional maintained release branch **after** an independently reviewed migration plan. Keep rollback SHA and staging hosts available.
- Automated screenshots/visual diffs, source/license/SBOM inventory, dependency security scans, per-release registry consistency, Notion sync with evidence.

## Recommended sequence

- **P5: Trust + UX quality gate**. Catalog truth, license/provenance, audit visual/theme/mobile, focus all dialogs, nav simplification and saved-state contract.
- **P6: Interactive preview studio**. Sixteen certified preview adapters and real static preview captures, props controls, presets, device/theme variations.
- **P7: Chat-first consumer integration**. Sixteen separately verified dashboard/deck installs, pinned reuse contracts, generated prompt/snippets and isolated adoption path.
- **P8: Presentation storytelling library**. Ten deck gallery upgrades, six runnable visual styles, five blueprint-to-deck recipes and media/reveal policies.
- **P9: Scale + operations**. Staged expansion beyond sixteen by usage, Core Web Vitals and visual QA, stable release branching, regression automation and optional synchronization.

Tasks may be parallel *within* a milestone when metadata/interfaces are stable; P6 depends on P5 schema, P7 depends on P6 verified fixture contracts, and P8 reuses the P6 control system.

## What remains undecided

- Approval of proposed **productization-first** approach and scope.
- Whether cross-device saved collections are worth introducing authentication; default NO.
- Whether user wants a visual editing UI at all; default NO, favor ChatGPT + small prop playground.
- Whether the library warrants extraction to its own repository after P7. Default keep existing repo until the install interface stabilizes.

## Definition of done for the roadmap

Not just green deployment tests. A representative user can find one of the 16 flagship components, see a meaningful preview, configure it, obtain a pinned usage prompt, run it in two independent consumer contexts, and see accurate readiness/licensing evidence. Existing 10 decks, mobile interactions, dark mode, and production release process remain intact.

**No implementation or production deployment is authorized by this design proposal alone.**
