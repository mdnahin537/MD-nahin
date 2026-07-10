# RealmWright V7 — Verification & Improvement Campaign

**Why this exists.** The V7 audit (`.audit/REPORT.md`) is a strong *map of leads*, not a
verified defect list. A re-check on 2026-06-05 (against the live source) found the findings
are real but systematically **over-confident** (145 of 180 stamped "HIGH" yet only 4 actually
executed), **over-severe** in spots, and at least one CRITICAL (C05-1) was **under-investigated**
(it prescribed adding tab-close handlers that already exist at L16657 / L17520). This campaign
converts leads → proof, hunts for misses, then adds the product-value lens the audit never applied.

**Hard constraint.** Sessions die at the 5h wall. → EVERY agent writes its result to disk, and the
main agent **commits + pushes immediately** after reviewing it. State lives in
`.audit/verify/PROGRESS.md`; any future session resumes by reading PROGRESS.md + this file.

**Method.** PLAN → DELEGATE → REVIEW. **One subagent at a time.** Opus 4.8 for hard/important
(logic, security, gap-hunt, product); Sonnet 4.6 for mechanical checks. Main agent reviews each
agent's output (spot-checks its line numbers against source) before launching the next.

**Source (READ ONLY, never modify):**
`/root/.claude/uploads/c01e2694-58fb-4cef-99ea-42e4d95e9f1d/6b9eaae1-relamwrith_V7.HTML`
(1.08 MB, 17,864 lines). Rubric: `.audit/BRIEF.md`. Map: `.audit/MAP.md`.

**Per-finding verdict legend:** CONFIRMED (proof) · OVERSTATED (corrected severity/confidence)
· FALSE-POSITIVE (killed, with why) · NEEDS-BROWSER (can only be settled live on desktop).

---

## Phase 1 — VERIFY (leads → proof, + hunt misses)
- **1A [Opus]** CRITICALs + secret-leak cluster, traced end-to-end → `verify/01-criticals.md`
- **1B [Opus]** Money/security (client-trusted license verdict, CORS/CSRF, DOMPurify real-vs-fallback,
  SRI, import bounds) → `verify/02-security.md`
- **1C [Sonnet]** HIGH coverage gaps (export + PDF + search dropping entity types; render-dispatch
  branches; dead search-result routes) → `verify/03-coverage.md`
- **1D [Sonnet]** HIGH remainder (theme/CSS-var breakage, listener leaks, license-recovery UX) → `verify/04-high.md`
- **1E [Opus]** GAP HUNT — fresh adversarial read of the 5 risk zones (state/persist, migrations,
  license, canon parser, render dispatch) for bugs **not** in the report → `verify/05-gaps.md`
- **Consolidate** → `verify/REPORT-v2.md` (re-graded, with proof column).

## Phase 2 — MAKE IT MORE USEFUL (the missing product lens)
- **2A [Opus]** Product/UX review: jobs-to-be-done for a GM, onboarding, friction, feature gaps,
  the 3 things that win a paying user vs. a Notion template. Not bugs. → `improve/PRODUCT-REVIEW.md`

## Phase 3 — DESKTOP TEST SCRIPT (settle the ~32 browser-only findings)
- **3A [Sonnet]** Tight 15–20 step "open the app, do this, expect that" runbook for Hunter's desktop
  (this container has no browser) → `test/DESKTOP-RUNBOOK.md`

## Honesty clause
No phase claims "zero bugs remain" — unprovable on a file this size. Phase 1's deliverable is:
every existing finding proven-or-killed, and the risk zones re-swept. That is what "confirmed" means here.
