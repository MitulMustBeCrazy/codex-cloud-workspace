# MotionBrew: Sixteen Flagship Candidates

**Status:** Build- and mount-smoke-tested, **not yet individually interaction-certified**.
**Date:** 2026-11-16
**Evidence:** [Independent consumer and full preview CI](https://github.com/MitulMustBeCrazy/codex-cloud-workspace/actions/runs/43761497671).

## How to interpret verification
- **Source imported (100/100):** Upstream source exists in this repository.
- **Preview configured (100/100):** Gallery defaults mounted without an error fallback in Chromium. Some effects need clicks, cursor movement, external media or specific props to demonstrate the full behavior.
- **Independent consumer build & mount (16/16):** Generated registry items compiled as standalone Vite dashboards and web-deck bundles; each named component was mounted in Chromium in both contexts.
- **Consumer verified:** *Not yet claimed for any component.* This requires per-component interaction, accessibility, props contract, performance, licensing and external consumer tests, not just a successful mount.

## Curated set
| Stable registry ID | Use case | Engine | Named export |
| --- | --- | --- | --- |
| `motionbrew-blur-text` | Text & Reveals | Motion | `BlurText` |
| `motionbrew-gradient-text` | Text & Reveals | Motion | `GradientText` |
| `motionbrew-flip-words` | Text & Reveals | Motion | `FlipWords` |
| `motionbrew-magnetic-button` | Immersive & Spatial | Motion | `MagneticButton` |
| `motionbrew-pill-tabs` | Navigation & Interaction | Motion | `PillTabs` |
| `motionbrew-morph-search` | Navigation & Interaction | Motion | `MorphSearch` |
| `motionbrew-search-modal` | Navigation & Interaction | Motion | `SearchModal` |
| `motionbrew-activity-grid` | Data & Analytics | Motion | `ActivityGrid` |
| `motionbrew-goal-gauge` | Data & Analytics | Motion | `GoalGauge` |
| `motionbrew-metric-split` | Data & Analytics | Motion | `MetricSplit` |
| `motionbrew-month-calendar` | Navigation & Interaction | Motion | `MonthCalendar` |
| `motionbrew-message-composer` | Cards & Workflows | Motion | `MessageComposer` |
| `motionbrew-toast-stack` | Navigation & Interaction | Motion | `ToastStack` |
| `motionbrew-depth-carousel` | Immersive & Spatial | Motion | `DepthCarousel` |
| `motionbrew-prism-carousel` | Immersive & Spatial | Motion | `PrismCarousel` |
| `motionbrew-wave-text` | Text & Reveals | Motion | `WaveText` |

## Real installation pattern

Each component is generated at `/r/motionbrew-<slug>.json`. That JSON includes source text and package dependencies. A consumer application must install dependencies, copy the file to `components/motionbrew/<slug>.tsx`, and include Tailwind CSS v4 for the components' style classes.

Example:
```tsx
import { BlurText } from "./components/motionbrew/blur-text";

export function CampaignHero() {
  return <BlurText text="Power to go beyond" by="word" />;
}
```

**Important:** This exact example uses a known supported prop shape. Other components have different required/optional props; consult original source and provider documentation before applying them.

## Independent test environments
- `/consumers/dashboard/index.html`: isolated dashboard host, 16 switchable components.
- `/consumers/deck/index.html`: isolated web-presentation host, 16 switchable components.
- Both are generated from registry JSON, not imported from the gallery's source module.
- The production site for Brandaily and existing web decks are not connected.

## Release gates remaining
1. Expose editable props and multiple documented presets per component.
2. Exercise all control/hover/keyboard behaviors with real Playwright interactions.
3. Validate optional dependency behavior, external media, and focus handling at different device widths.
4. Review source license and permitted redistributions individually before broad use.
5. Promote `consumer-verified` only when each item's test evidence passes.

The 16 flagship selection is not a claim that all items are the best fit for Brandaily. Consumers should adopt selected components after their own preview and review.
