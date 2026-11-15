# P4 Release Checklist, Quality Gates and Rollback

**Track:** Quiet Canvas Personal Component & Deck Library, combined A+B, P4 release hardening
**Prepared:** 2026-11-16
**Canonical live:** https://pcl-component-library-review.pages.dev/
**Canonical verified commit:** `6840a8a02571bd92dd74cec7e745bc2368dc4844`
**Canonical Cloudflare deployment:** `a3e5231d-8327-46ec-a9f8-2373675a8d35`
**A+B preview:** https://pcl-gallery-reuse-review.pages.dev/
**P4 code:** `feature/pcl-p4-release-hardening-2026-11-16` and PR #5
**Dedicated P4 review target:** https://pcl-p4-release-review.pages.dev/ (verify deployment/commit before confirming live)

## Required release-quality checks

- [ ] Run `npm install --no-audit --no-fund` in `builds/2026-11-15-component-library`.
- [ ] Run `npm run build`: performs typecheck, builds full registry and deck assets, both independent consumer bundles, and generates `dist/release-manifest.json`.
- [ ] Run `npm run test:release`: verifies **124 actual distribution routes**: entry page, registry index, 110 component registry entries, 10 deck HTML outputs and two consumer HTML pages.
- [ ] Run `npm test`: checks source metadata, 100 source-preserving preview records, malformed item rejection, independent consumer dependencies and release manifest truth.
- [ ] Run `npm run test:e2e` against built static Vite preview (not HMR dev server). Verify responsive 320/390/768/1440 widths and reduced motion.
- [ ] Confirm MotionBrew inspector focus enters on open, traps Tab/Shift+Tab, returns to the invoking button on all close methods, and unmounts the live preview.
- [ ] Review browser traces/screenshots and resolve failures. A passing retry is **flaky**, not proof the first attempt was healthy.
- [ ] Inspect actual `dist/release-manifest.json` for current commit, source count and accurate readiness labels.
- [ ] Confirm isolated Cloudflare P4 review deployment succeeded and maps to current reviewed commit.
- [ ] Independently check public URLs where external tooling permits; do not invent successful HTTP results.
- [ ] Record current branch and CI evidence in the Notion development session.

## Release-state truth

- **100 MotionBrew sources imported:** true, in source manifest.
- **100 provider-default gallery fixtures smoke-mounted:** previous Chromium full matrix evidence; not complete UX certification.
- **16 flagship components compiled and smoke-mounted in two independent consumers:** previous test evidence; this does not prove full API or behavior certification.
- **All 100 individually interaction-certified:** **NO**.
- **All 16 ready for unreviewed Brandaily production installation:** **NO**.
- **React Bits references licensed/imported:** **NO**, reference only.

## Rollback and safety

The P4 branch must never be merged directly into the canonical component-library branch without separate user authorization. P4 may be reviewed on an isolated Cloudflare project. No Brandaily production, City Bank presentation or unrelated application changes are permitted.

If a P4 **isolated review** deploy has regressions, stop deployment from the feature branch; use the prior known-good Cloudflare deployment of the **same isolated review project** if one exists, or disable/unpublish that preview. Preserve the canonical live project unchanged.

If a future user-approved canonical release has a regression, select the last known-good deployment in Cloudflare Pages for `pcl-component-library-review`, inspect that it maps to approved SHA `6840a8a02571bd92dd74cec7e745bc2368dc4844` (deployment `a3e5231d-8327-46ec-a9f8-2373675a8d35`), restore it using Cloudflare's deployment rollback controls, and verify the canonical hostname. Keep the source branch aligned with the restored release to prevent accidental redeploy. Never assume a provider rollback happened without checking result.

## Current known follow-ups

- Explicit per-component prop/preset editing across all 100.
- Interaction, keyboard and license review for each flagship before promotion to `consumer-verified`.
- Performance profiling on actual low-end Android devices for high-cost GPU effects.
- Eliminate any CI retry flakes; keep distinct from CI functional success.
- Reconcile historical Notion component statuses with test evidence.

## Acceptance and handoff

P4 can be marked **verified for isolated review** only if the latest full CI passes and the P4 Cloudflare deployment is successful. Canonical release requires explicit user approval after review. This file is a checklist, not evidence of completion.
