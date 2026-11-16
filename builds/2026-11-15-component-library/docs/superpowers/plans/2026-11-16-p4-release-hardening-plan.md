# P4 Release Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development task-by-task with test-driven development.

**Goal:** Release-ready QA and accessibility for the A+B Quiet Canvas preview, preserving the original live app.

**Architecture:** Keep all library source and vendor modules unchanged. Add a focused, testable Inspector keyboard utility and a build-time verification script that reads source manifests and output assets. Make the new CI checks mandatory and produce traceable release evidence.

**Tech Stack:** React 19, TypeScript, Vite, Node 22 tests, Playwright + axe, GitHub Actions, Cloudflare Pages.
**Spec:** `docs/superpowers/specs/2026-11-16-p4-release-hardening.md`

## Global Constraints
- Work on isolated `feature/pcl-p4-release-hardening-2026-11-16`.
- All 100 vendor source files remain immutable.
- No production Brandaily/business deck or canonical Quiet Canvas deployment modifications.
- Truthful lifecycle statuses: `fixture-ready` is not `demo-verified` or `consumer-verified`.
- Any released asset path must be backed by actual build output.

## Review Focus
- Keyboard and focus behavior across selected item changes, Escape, backdrop and close button.
- Nested component inputs, including focusable items loaded dynamically into the inspector.
- Missing or misnamed registry JSON and HTML decks, even if SPA fallback returns HTML.
- Small mobile viewports and reduced-motion previews.
- CI exit code must reflect required QA; skip/retry not falsely interpreted as certification.

### Task 1: Inspector keyboard focus
**Files:** `src/lib/motionbrew/MotionBrewGallery.tsx`, `tests/e2e/motionbrew.spec.ts`
- [ ] Write failing Playwright test for focus on open, Tab cycle and restore on Escape/Close/backdrop.
- [ ] Confirm RED against current branch CI.
- [ ] Implement focus return, initial focus, dialog-contained Tab handling and unmount state.
- [ ] Verify Chromium tests and source tests, commit.

### Task 2: Release manifest and validator
**Files:** `scripts/release-gate.mjs`, `scripts/release-gate.test.mjs`, `package.json`
- [ ] Write failing tests for manifest inventory, malformed lifecycle, missing or empty `dist` assets.
- [ ] Confirm RED, then implement `verifyRelease({root,dist}):Promise<ReleaseReport>` and CLI `--write`.
- [ ] Ensure `dist/release-manifest.json` includes source counts, counts by readiness, available routes and commit SHA when provided; never asserts full certification.
- [ ] Build, run unit and release validator, commit.

### Task 3: CI and review routes
**Files:** `.github/workflows/component-library-p0.yml`, `tests/e2e/quiet-canvas.spec.ts`
- [ ] Add failure-first checks for registry/deck/consumer routes and mobile compact states.
- [ ] Gate publish build artifact on successful `npm run test:release`.
- [ ] Run full CI and correct regressions with evidence, commit.

### Task 4: Release documentation + Notion
**Files:** `docs/motionbrew/P4_RELEASE_CHECKLIST.md`, `docs/SESSION_PROTOCOL.md`
- [ ] Record test evidence, known coverage gaps, Cloudflare branch, rollback steps.
- [ ] Update Notion session and project tracker.
- [ ] Verify Cloudflare isolated P4 preview and inspect commit mapping. Never merge into canonical site without authorization.
