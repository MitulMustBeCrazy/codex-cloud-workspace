# City Bank Enterprise Intelligence — concept pitch

## Purpose

A concise, nine-slide web pitch for Shahriar Bhai. It proposes Enterprise Intelligence as a potential first Transformation Office project. The opportunity examples, dashboard, and nodal map are illustrative concepts for discussion.

## Status

- Stage: draft for review
- Publication: unpublished; Netlify deployment planned after content lock
- Last verified: 2026-10-14

## Contents

- `dist/index.html` — slide content and diagrams
- `dist/styles.css` — responsive presentation styling
- `dist/script.js` — slide controls, examples, dashboard, and nodal interactions
- `netlify.toml` — static publish directory for later Netlify deployment

## Setup

No installation or build dependencies.

## Run

From this directory:

```bash
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. Use arrow keys, the on-screen controls, or the slide overview. Slide 3 has selectable examples; slide 5 has decision stages; slide 6 has selectable opportunities; slide 7 has an interactive network.

## Test

```bash
node --check dist/script.js
```

Check slide navigation, the four interactive views, desktop and mobile layouts, and print layout in a browser. No build command is needed.

## Netlify after content lock

When connecting this repository to Netlify, set the **base directory** to `builds/2026-10-14-city-bank-enterprise-intelligence`. The included `netlify.toml` publishes `dist`.

## Decisions

- The deck uses static HTML, CSS, and JavaScript so it can be reviewed without a framework or credentials.
- All examples and interface content are explicitly illustrative. No City Bank project overlap, technical readiness, or financial return is claimed.
- Content follows the [shared pitch outline](https://chatgpt.com/share/6ace73c7-9180-83ec-88fc-d2180ce1625a?ogimg=blue). The separately described downloadable detailed blueprint was not accessible from that share page.

## Open items

- Confirm copy, visual direction, and proposed pilot scope with the sponsor.
- Publish through GitHub and Netlify after content lock.
