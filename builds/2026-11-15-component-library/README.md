# Personal Component Library

An independent, reusable design-system starter built for two active needs:

1. Brandaily application interfaces, particularly dashboards, task and campaign workflows, communications and calendar.
2. HTML/web-based presentation storytelling, including motion, media, narrative layouts and reusable deck styles.

The library is intentionally distinct from Deck Studio. No code from that older product is imported.

## Status

**v0.1 prototype, source drafted, not build-verified and not deployed.**

The source currently includes:
- A responsive React + TypeScript + Vite catalog interface.
- 20 defined component families. Ten have interactive or visual demo implementations; ten are documented plans.
- Six visual style presets.
- Five slide-by-slide narrative blueprints.
- Brandaily-relevant interactive demos: checkable Today task list and calendar period selector.
- Presentation examples: chapter opener, motion headline and lightbox demo.

The media lightbox expands a **placeholder graphic**. It does not yet play files or support video/audio seeking. The period switcher demonstrates state but does not render full calendar grids. No production integration is performed.

## Local setup

From this directory:

1. Install dependencies: npm install
2. Run dev gallery: npm run dev
3. Verify type check and production bundle: npm run build
4. Preview bundled output: npm run preview

These commands are instructions for future verification; they have **not been executed** by the connected GitHub-only workflow.

## Architecture

- src/catalog.ts: metadata, design styles and slide recipes
- src/components.tsx: first reusable, themed component implementations
- src/App.tsx: searchable gallery and style/blueprint explorer
- src/styles.css: isolated neutral visual system and responsive layout
- docs/: usage and roadmap

## Rules

- Distinguish interactive demos from planned components.
- Keep components independent of Brandaily data models and presentation frameworks.
- Keep templates (narrative order) separate from styles (design tokens).
- Prefer source-owned, accessible primitives and reduced-motion options.
- Test components in both narrow mobile and wide presentation viewports.
- A future dedicated repository and private preview can be set up without modifying any production application.

## Publishing and provenance

Nothing is deployed. Sample content is fictional and illustrative.
Review licenses before importing third-party code. Design references are not automatically licensed templates.
