# Personal Component Library: Proposed Architecture and Design
Date: 2026-11-15
Status: DRAFT FOR REVIEW. No implementation approval implied.
Source reviewed: builds/2026-11-15-component-library on prototype/personal-component-library.

## Intent
Create an independently reusable, personally curated UI and storytelling component system. Primary consumers: Brandaily portal (dashboard, planning, collaboration) and HTML/web presentation builds (strategy, brand, launch and executive decks). Ordinary ChatGPT conversations should be able to reference stable component, template and style IDs. This is NOT a continuation or redesign of Deck Studio.

## Goals
1. Source-owned reusable components, usable without the gallery app.
2. A small, extensible catalog with working visual previews, editable properties, usage instructions, source provenance, and accessible states.
3. Shared foundations with separate Brandaily, data and presentation blocks.
4. A curated reference library for complete deck structures, slide layouts and visual systems.
5. High-quality mobile interfaces and reliable 16:9 presentation rendering.
6. Safe adoption: preview/branch first, no production Brandaily or decks modified without explicit approval.
7. Chat-first retrieval via stable IDs and repository documentation, without depending on a new visual editor.

## Non-goals
- A full slide editor, website builder, backend, campaign platform, AI-native generation engine, or another Deck Studio.
- Importing every interesting React Bits or third-party component.
- Copying copyrighted deck templates/assets without license.
- Deploying directly into live Brandaily.

## Approaches considered
A. Continue Vite gallery and expand its component file. Fast for demos, but components remain coupled and cannot safely be reused. Rejected.
B. Registry-first React/TypeScript library with independent packages, design tokens, documented Storybook stories and a lightweight curated gallery. Best reuse/QA/ownership tradeoff. RECOMMENDED, subject to user review.
C. Build a full visual editor and template marketplace. Strong browsing experience but high maintenance and duplicates old Deck Studio complexity. Defer.

## Verified v0.1 audit
- Verified README, src/catalog.ts, src/components.tsx, src/App.tsx, src/styles.css and package.json on the isolated branch.
- 20 catalog entries; 10 labeled demos, 10 planned. Demo does not mean production-ready.
- No test scripts, TypeScript-focused build only, no distributable package/registry, no evidence of browser or accessibility testing.
- Source components are defined in one file and combine presentation logic with hardcoded sample content and local state.
- TaskQueue cannot receive task props or callbacks from Brandaily; ActivityTimeline is static.
- PeriodSwitcher changes only labels, not a functional calendar.
- MetricCard takes display strings and hardcodes trend styling; ProgressMeter clamps to 0-100 although metadata advertises value/max.
- MediaLightbox only displays a placeholder; accessibility needs focus trap/restore, keyboard behavior and scroll locking.
- CSS is a large global stylesheet with some 9-11px text, no semantic design-token layer or guaranteed contrast across themes.
- Six style definitions mostly specify colors and text descriptions. Five blueprints are arrays of story beats, not runnable templates.
- No versioned component API, dependency manifest, visual tests, source licenses, responsive snapshots or installation documentation.
- Existing source is useful as catalog inspiration, not a verified foundation for production consumption.

## Recommended architecture
Repository name proposed: personal-component-library (dedicated; do not create or migrate before approval).

Packages:
- packages/tokens: semantic palettes, typography, radii, spacing, motion, density, z-index, breakpoints, localization-safe font stacks.
- packages/core: accessible stateless primitives, composable APIs, keyboard/focus states, optional Radix primitives where they reduce risk.
- packages/data: formatted numbers, KPIs, charts, status visualizations, data tables, empty/loading/error states.
- packages/brandaily: TodayTaskCard, entity composer, campaign workflow, communication views, approvals, five-view calendar; no Brandaily backend imports.
- packages/deck: semantic slide layouts, word cloud, media stage, image/gallery/player, timeline, comparison, annotation and cinematic reveals.
- packages/themes: actual style tokens and type scales; application and deck presets are separate.
- packages/recipes: slide narrative blueprints, working layouts and reusable sample content schemas.
- apps/gallery: searchable, responsive, visually curated browser; never the source of component implementations.
- .storybook: isolated examples, interactive controls, accessibility checks and component documents.
- registry: installable item definitions; keep dependencies and license manifest per item.
- tests: unit, integration, accessibility, viewport and full-slide screenshot suites.

Distribution: first use a validated shadcn-compatible source registry for selective copy-in adoption. Evaluate a versioned npm package later only if two consumers depend on centrally updated shared code. Do not import the full library into Brandaily.

## Shared interfaces and metadata
Each catalog item has stable id (e.g. data.metric-card), category, useCases, status (idea/prototype/tested/released/deprecated), sourcePath, dependencies, license, attribution, tags, configurableProps, states, accessibilityNotes, performanceTier and previewPaths.
No component is marked released until build, behavior, keyboard and screenshot gates pass.
All interactive components accept external data and events; gallery provides separate fixtures. No component uses hardcoded Brandaily fixtures.
Visual style = tokens + typography + grid + media treatment + motion profile + deck-safe contrast rules.
Narrative template = purpose + slide sequence + layout IDs + content placeholders + presenter notes, compatible style IDs and samples.
Slide layout = actual renderable component; separate from the narrative template.

## Priority inventory
Foundations, first: Surface, Button/IconButton, Input, Select/Combobox, Tabs, Dialog/Lightbox, Popover, Menu, Tooltip, Checkbox, StatusBadge, Skeleton/Empty/Error, Toast, KeyboardFocus, Typography, ThemeProvider.
Brandaily P0: Today task card (delegation and promotion actions), inline @ person/# task/$ campaign mentions, command/search, saved filters, campaign health/status, activity stream, approvals, five-view calendar, communication channel panel.
Data P0: KPI/ComparisonCard, TrendSparkline, Progress/Goal, Chart wrapper, FilterBar, DataTable. Later: funnel, waterfall, heatmap, cohort, budget tracker.
Deck P0: SlideFrame 16:9, HeroStatement, ChapterOpener, SplitStory, FullBleedMedia, ImageSequence, Gallery/Lightbox, VideoStage, AudioPlayer, NumberReveal, Quote, Comparison, Timeline, WordCloud (collision-safe), Appendix. Later: artist cards, animation choreography, background particles and sophisticated transitions.

## Brandaily acceptance rules
- Today task must support external task data, check/uncheck, assign, priority, due date, promote to task/project/campaign, keyboard and optimistic error states.
- Inline mentions must retain entity IDs while displaying inline text. Type @, # and $; no separate tagging dropdown required. Provide mention suggestions adjacent to the caret; handle paste, composition and missing entities.
- Calendar must implement year, quarter, month, week and day view switching, timezone-safe display, date navigation, and events across midnight.
- All data panels support empty/loading/error and permission-denied states; communication module remains a distinct application section.
- Backend adapters, authorization, notification dispatch, persistence and Brandaily integration remain in Brandaily, not the generic library.

## Presentation acceptance rules
- Responsive 16:9 canvas, fit/contain versus crop selection per asset, safe areas and slide overflow detection.
- Exact full-screen media behavior, one playing media item at a time, seek/pause/resume, Escape close, audio-only image-overlay mode, predictable click behavior and focus restoration.
- Remote YouTube embeds treated separately from native media and cannot promise forced caption settings across all environments.
- Motion profiles Quiet/Living/Impact/Media, reduced-motion substitutes, no accidental autoplay or over-animated dashboards.
- Typography constraints and screenshot QA enforce consistent title, label, body and caption scales. Test Bengali script wrapping and fallback fonts.
- Word clouds must respect bounds and avoid overlap at common viewport sizes.
- Each deck preset has a functional mini-deck with 5+ illustrative slides, not a static color tile; narrative and styling can be mixed.

## Design-style and reference catalog
Start with six proposed house style packs: Editorial Minimal, Cinematic Dark, Institutional Premium, Bold Monotype, Data First, Human Narrative.
Each style requires: palette, headings/body fonts and fallbacks, type scale, 16:9 grid, margins, image treatment, chart palette, motion profile, 5 representative layout examples, dark/light behavior and screenshot fixtures.
Start with five editable narrative recipes: Board & MD Strategy, Brand Campaign Pitch, Sonic/AV Identity, Product Relaunch, Marketing Performance.
Curated inspiration references are metadata and links, not unlicensed source copies. Each records origin URL, author/license, screenshot permission, tags, best-for, and adoption status. Candidate references: reveal.js, Slidev theme gallery, selected compatible React/Bits components and licensed templates.

## Quality gates
- TypeScript build and lint pass; no CSS leakage into consuming apps.
- Storybook tests: default, loading, empty, error, long text, keyboard, focus and reduced-motion.
- Accessibility target WCAG 2.2 AA where applicable, automated axe checks plus manual keyboard review.
- Visual screenshots at 360px, 768px, 1440px and 1920x1080/16:9. Include Bengali, high zoom, captions and portrait-media cases.
- Critical flows: media lifecycle, entity mention copy/paste, calendar timezone transitions, task promotion and no overlapping overlays.
- Dependency/license review and performance budget before release.
- No modifications to production without explicit user authorization.

## Scope and delivery sequence
Phase 0: establish dedicated repo architecture, registry, tokens, Storybook, CI and import validation (no Brandaily modifications).
Phase 1: produce first ten or fewer genuinely reusable primitives and one shared KPI/card component; complete tests and previews.
Phase 2: Brandaily P0 composite blocks and connected prototype using fixture data.
Phase 3: slide layouts/media system; one real mini-deck in each style.
Phase 4: reference collection, theme/recipe search, source provenance and natural-language IDs for chat-based reuse.
Phase 5: optional Brandaily integration and presentation consumption through isolated project branches and explicit acceptance.

## Open design decisions before code implementation
- Dedicated repository visibility (recommend private until rights/fixtures are reviewed).
- Whether existing Brandaily frontend is React-compatible; inspect its live codebase before integration.
- Whether registry selective copy-in alone is enough initially (recommended) or package distribution is needed.
- Exact preferred public/private gallery hosting once preview can be tested.
The above are proposed defaults, NOT user-approved decisions.
