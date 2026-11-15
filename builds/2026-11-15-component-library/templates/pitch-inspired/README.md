# Pitch-inspired original HTML slide templates

These three standalone HTML mini-decks are **original implementations** informed by Pitch gallery template structures, not exact visual reproductions or copies of Pitch proprietary artwork.

## Reference research
- Pitch Editorial template id `1f2eb97c-6b38-47d9-a1d3-a9a50379b8d8`: cover, chapter, narrative, quote and media patterns.
- Pitch Board Report template id `0ffe143c-961e-46d6-b7c4-cc19e6f7aa11`: leadership overview, metrics, chart, discussion.
- Pitch KPI Report template id `5b47b996-10b2-433d-91f3-93d28b149594`: segmented marketing/product KPIs, comparative charts, conclusions.
- Also reviewed Pitch Film Pitch Deck, Marketing Campaign and Strategic Plan for future recipes.
- Catalog: https://pitch.com/templates

The connected Pitch interface reveals slide text and chart data, but not exact native design attributes or slide pixels. Public preview images were not sufficient to certify a faithful visual recreation. Do not describe these HTML files as Pixel-perfect Pitch clones.

## Opening
Open any of `editorial.html`, `board-report.html`, or `kpi-report.html` in a browser. Keep `deck-core.css` and `deck-core.js` beside them. No build and no network are needed.

## Enhanced HTML behavior
- 16:9 layout with responsive fit-to-window display and print styles.
- Arrow keys, Space and PageDown advance reveals one by one; left/up goes back.
- Home/End jump to first and last; touch swipes move between steps.
- Auto pace advances every 1250–1900 ms depending on template. Press Auto pace to start, Pause or Escape to stop.
- Animated rise-and-blur entrance; chart bars grow when a chart step is revealed.
- Reduced-motion support and text fallback in no-JS environments are planned QA items.
- Each template uses entirely illustrative placeholder claims and data, never real City Bank metrics.

## Next
Browser QA at desktop/mobile and actual content-overflow test, media stage and a reusable deck-JSON generator must pass before marking production-ready.
