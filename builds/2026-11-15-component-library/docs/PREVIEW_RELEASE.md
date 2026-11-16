# Isolated Review Preview

## Target
- Cloudflare Pages project: `pcl-component-library-review`
- Preview domain: https://pcl-component-library-review.pages.dev/
- GitHub source: `MitulMustBeCrazy/codex-cloud-workspace`
- Branch: `feature/pcl-p0-p2-2026-11-15`
- Build root: `builds/2026-11-15-component-library`
- Build: `npm install --no-audit --no-fund && npm run build`
- Output: `dist/`

## Review checklist
1. Open the component catalog and switch between Components, Visual Styles, Deck Blueprints, P0 Showcase, HTML Deck Gallery, Brandaily P0, Presentation P0, and P1 + P2 Lab.
2. Test task interactions, calendar Year/Quarter/Month/Week/Day views, mentions using @/#/$, campaign approvals, communication channel states, and data search/sort.
3. Open every HTML deck from the template gallery in a new tab. Navigate staged reveals with Space/arrow keys and Auto pace.
4. Inspect typography and motion across mobile and widescreen. Verify input focus, Escape behavior and reduced-motion mode.
5. Review command search and data visualizations.
6. Test registry sample installation in a disposable consumer app before applying any component to Brandaily.

## Verified before Cloudflare deployment
- GitHub Actions [run #72](https://github.com/MitulMustBeCrazy/codex-cloud-workspace/actions/runs/43703264569) passed 49 tests.
- Browser axe checks expanded to P1/P2 gallery in later development commits; confirm the latest branch's GitHub Actions and Cloudflare builds separately.

## Safety
- This is an isolated review project. It is not Brandaily production or any existing presentation deployment.
- No real Brandaily data or production APIs are connected.
- Do not integrate into production until an explicit review and authorization.
