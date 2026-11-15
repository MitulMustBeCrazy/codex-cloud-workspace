# Architecture and composition contract

The design system has four catalogs:

- **primitives**: spacing, typography, colors, controls, cards, state indicators;
- **application**: tasks, campaign trackers, calendar, activity, channels, search and data analysis;
- **storytelling**: chapter opener, text reveal, hero statements, bento, image/text split and media;
- **deck references**: visual style tokens and reusable narrative slide order.

## Composition rules

A presentation is assembled as:

**Blueprint + Visual Style + Individual Components + Project Content/Assets**

A Brandaily page is assembled as:

**Application Shell + Functional Components + Brandaily Theme + Live Data**

An individual component owns behavior and accessibility. A style owns color, typography, radius, spacing, visual tone and motion defaults. A blueprint owns narrative order and slide layout recommendations.

## Component metadata contract

- id and name
- area (Core, Brandaily, Data, Presentation, Motion, Media)
- status (demo vs planned vs production-ready in future)
- description and recommended usage
- configurable props/controls
- source link, package/dependency footprint, license and attribution (future)
- required states and accessibility behavior (future)
- responsive constraints, media behavior and reduced-motion variant (future)

## Brandaily integration notes

Do not read from or write to production Brandaily during library development. Later, create a dedicated adapter for people, tasks, campaigns, projects, calendar and channel data. The @, # and $ inline entity grammar should be handled by a tested parser/editor, not regex replacement.

## Deck integration notes

Allow flexible viewport aspect ratios but optimize for 16:9 at presentation size. Components must support 16:9, portrait media, fullscreen, keyboard navigation, one-media-at-a-time playback and reduced-motion preference. Source components must remain usable without a deck editor.

## Engineering direction

Recommended future stack: React, TypeScript, Tailwind/shadcn-owned source primitives, Motion for React selectively, Storybook for isolation/documentation and automated accessibility/visual checks. Keep initial Vite prototype minimal; add dependencies when an actual component requires them.
