# Verification Campaign — Live Progress

**Updated:** 2026-06-05
**Resume rule:** read this file + `../PLAN.md` to know exactly where we are. Each `[x]` item has a
committed deliverable. Pick up at the first `[ ]`.

## Phase 1 — Verify
- [x] 1A · Opus   · CRITICALs + secret-leak cluster      → `01-criticals.md`   — DONE 2026-06-05
      verdicts: C04-1 CONFIRMED (scope tightened), C05-1 OVERSTATED→HIGH, C09-1 CONFIRMED,
      C11-1 CONFIRMED. Secret-leak = YES (proven in Node). 0 false-positives, 0 needs-browser.
- [ ] 1B · Opus   · Money/security                        → `02-security.md`
- [ ] 1C · Sonnet · HIGH coverage gaps                    → `03-coverage.md`
- [ ] 1D · Sonnet · HIGH remainder                        → `04-high.md`
- [ ] 1E · Opus   · Gap hunt (5 risk zones)               → `05-gaps.md`
- [ ] Consolidate → `REPORT-v2.md`

## Phase 2 — Make it more useful
- [ ] 2A · Opus   · Product/UX review                     → `../improve/PRODUCT-REVIEW.md`

## Phase 3 — Desktop test script
- [ ] 3A · Sonnet · Desktop runbook                       → `../test/DESKTOP-RUNBOOK.md`

---

## Main-agent pre-verification (done 2026-06-05, before Phase 1 — hand to Agent 1A)
Spot-checked the 4 spine findings against live source:
- **C04-1** license self-revoke (L6144–6159): bug REAL (no `res.ok`, `this._data.valid=!!json.valid`
  at L6152). BUT non-JSON error → `res.json()` throws → caught at L6155 (so "empty/garbage" trigger is
  overstated). "stops AutoSave" downstream NOT shown in cited lines — trace it. "Node-proven" tag unearned.
- **C05-1** lost-write-on-close (L6727): persist() debounced 400ms. `persistNow()` (L6749) exists and is
  called on many paths (6639/6670/7026/7078/6999/16417/16858/11205). `beforeunload` (L17520) only warns on
  unsaved INPUT; `visibilitychange` (L16657) drives ambient animation — neither flushes State. Gap is real
  but severity likely OVERSTATED (~400ms window) and original finding missed the existing handlers.
- **C11-1** RelationshipWeb leak (L15394): `svg.addEventListener('click',…)` present. Enclosing function +
  whether it runs per-render + whether the svg element persists across renders = NOT confirmed. Resolve.
- **C03-4** CLAMP (L5863–5869): CONFIRMED no `visibility` clamp (only statValue/eventWeight/year/eventType).
  Real root. End-to-end leak (parse→store→render filter C06-2→toggle C10-1) only partly traced — settle it.
- Bonus: `Markdown.render` (L5873) DOES route through DOMPurify *if loaded* (L5918+); confirm whether the
  real lib loads or the fallback ships (relates to X2a-1).
