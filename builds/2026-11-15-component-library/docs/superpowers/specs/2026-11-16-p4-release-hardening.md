# P4: Quiet Canvas Release Hardening

**Date:** 2026-11-16
**Authorization:** User requested P4 implementation after A+B gallery/reuse work. P4 means the *Phase 4 release-polish and verification gate* in the combined A+B design, not a new unrelated product.
**Base:** `feature/pcl-gallery-and-reuse-2026-11-16`; draft PR #4 remains open.

## Intent
Make the existing 100-source MotionBrew gallery and 16-component isolated dashboard/deck consumer demonstrations safer to review and reproducible to release, while keeping the canonical Quiet Canvas portal and Brandaily production unchanged.

## Features
1. **Inspector accessibility:** on open, keyboard focus moves into the inspector; Tab/Shift+Tab cannot move to background controls, Escape/backdrop/Close restores focus to the originating item. Exactly one lazily mounted preview per selected component, and closing it removes it from the DOM. Reduced-motion mode remains supported.
2. **Accurate release provenance:** generate a machine-readable release report from source records, documenting 100 provider imports, readiness breakdown, 16 flags, and actual commit/build id where available. Reject contradictory readiness entries and missing registry/deck assets at build time. Evidence must remain truthful: source/previews are not blanket certified.
3. **Release route coverage:** test the compiled distribution for landing page, all 100 registry JSON files, ten deck outputs, and the two standalone consumers. Fail a release if URLs are absent or content is empty/wrong; do not confuse browser SPA fallback with a valid asset.
4. **Browser reliability:** test 320/390/768/1440 widths, focus restoration, reduced motion, and all existing routes, without flaky test-artifact-triggered hot reload. Keep heavy on-demand preview behavior.
5. **Quality record:** create inspectable release checklist, test report and rollback procedure in source and Notion. Cloudflare Pages P4 branch is a review-only target. Do not merge into canonical component-library portal or modify Brandaily/deck production without explicit approval.

## Non-goals
- Claim 100 fully interaction certified.
- Claim 16 consumer certified beyond actual build/mount evidence.
- Rebuild MotionBrew vendor internals or redistribute new third-party sources.
- Add unnecessary persistence/editor/server.

## Acceptance criteria
- New test proving Inspector keyboard trap/focus restore fails at baseline and passes afterward.
- Package build produces verified `dist/release-manifest.json` and release checker verifies expected assets and source truth.
- Complete CI runs build, source tests, browser tests and release checker, with zero *unresolved* failures; call out any retries and warnings.
- An isolated Cloudflare Pages P4 preview, with provider-confirmed successful deployment and actual URL.
- Source docs and Notion status accurately distinguish implemented from pending, and production remains untouched.

## Risks
- React on-demand preview controls may create their own portals. Scope trap only to inspector root and restore focus without stealing it when child dialogs operate.
- Existing Canvas/Three animations might not cleanup after remount; tests should check DOM unmount and regression behavior.
- Test artifact writes under Vite dev root can trigger HMR; QA should avoid cross-test contamination.
- Cloudflare source branch and commit must be checked before claiming a link is updated.
