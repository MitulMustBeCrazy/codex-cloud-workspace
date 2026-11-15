# Prioritized roadmap

## Completed as source draft

- [x] Establish independent catalog structure
- [x] Define 20 narrowly relevant component families
- [x] Implement 10 visual/interactive demo components
- [x] Define six visual directions and five narrative blueprints
- [x] Build a responsive search and filter gallery
- [x] Add reduced-motion CSS fallbacks
- [ ] Install dependencies and run build/typecheck
- [ ] Test in mobile and desktop browsers
- [ ] Add unit, interaction, accessibility and visual regression tests

## Next: Brandaily functional priority

1. Inline entity mentions for @ person, # task, $ campaign, including search, keyboard actions and entity persistence.
2. Calendar with real year / quarter / month / week / day content and drag/drop action constraints.
3. Today task card with assignment, due time, promotion to full task, project or campaign.
4. Communication channels panel with readable threaded conversations.
5. Campaign pipeline, tasks and project boards backed by mock adapters.
6. Saved filters, data table and dashboard chart components.

## Next: presentation priority

1. Animated headline reveal with configurable preset, timing and playback controls.
2. Reusable media gallery for fixed-ratio portrait/landscape image cards.
3. Controlled audio/video player: pause other media, seek, progress, fullscreen, keyboard operation.
4. Statement, image/text split, bento, comparison and editorial data slides.
5. Click-to-expand media with correct focus restoration and accessibility.
6. Template previews showing cover, data, media, chapter and closing slides.

## Hardening and integration

- Export stable, framework-neutral design tokens.
- Document each component in Storybook with knobs and a realistic use-case demo.
- Maintain a metadata manifest (preview, code origin, license, complexity, supported modes).
- Package reusable source components in an installable shadcn-compatible registry.
- Add private preview deployment only when requested.
- Create a dedicated GitHub repository when repository creation is available in the connected setup.
- Integrate into Brandaily only on a separate preview branch; production changes require explicit approval.
