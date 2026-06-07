# Verification Campaign — Live Progress

**Updated:** 2026-06-05
**Resume rule:** read this file + `../PLAN.md` to know exactly where we are. Each `[x]` item has a
committed deliverable. Pick up at the first `[ ]`.

## Phase 1 — Verify
- [x] 1A · Opus   · CRITICALs + secret-leak cluster      → `01-criticals.md`   — DONE 2026-06-05
      verdicts: C04-1 CONFIRMED (scope tightened), C05-1 OVERSTATED→HIGH, C09-1 CONFIRMED,
      C11-1 CONFIRMED. Secret-leak = YES (proven in Node). 0 false-positives, 0 needs-browser.
- [x] 1B · Opus   · Money/security                        → `02-security.md`   — DONE 2026-06-05
      verdicts: X2-3 OVERSTATED (AI uses the USER's own key; license gates only auto-backup +
      a label — forged license can't burn Hunter's credits); C05-6 CONFIRMED (API key plaintext
      in the file backup — AutoSave._write L6302 raw-dumps State.data); X2a-1/X2-2/X2-7 CONFIRMED.
      Worker-side CORS/CSRF + demo cap = NEEDS-WORKER-SOURCE. 0 false-positives.
- [x] 1C · Sonnet · HIGH coverage gaps                    → `03-coverage.md`   — DONE 2026-06-05
      verdicts: C07-1 CONFIRMED (export drops Fronts/Bestiary/Relations/Glossary/Artifacts — no
      builders, L8941); C12-1 CONFIRMED (search omits Fronts/Relations/Artifacts/Glossary; Bestiary
      IS indexed L15576); C12-2 CONFIRMED (dead links: war-room/chronicle panels absent); C02-1
      CONFIRMED (solo stale). OVERSTATED: C12-4 (factions stale only on retired rw_legacy_layout).
      PARTIAL: C11-3 (PDF missing only Fronts/Bestiary/Relations — Artifacts+Glossary ARE in PDF).
      Second-class EVERYWHERE: Fronts, Relations. 0 false-positives.
- [~] 1D · SPLIT — first combined agent died at the token limit and wrote nothing (lesson:
      all agents now write incrementally). Re-fired as two lean tasks:
      [x] 1D-a · main agent (inline grep) · themes/CSS (C14) → `04a-themes.md` — DONE 2026-06-05
            C14-2 CONFIRMED (9 undefined vars; `--color-success` dropped — 0 var() uses);
            C14-5 CONFIRMED (ember-only structural elements break Manuscript/Modern);
            C14-1/C14-3/C14-14 OVERSTATED (each self-walked-back in the finding text).
      [x] 1D-b · Sonnet · leaks + license-UX → `04b-leaks-license.md` — DONE 2026-06-05
            5/5 CONFIRMED HIGH. Reviewed against source: C04-3 verified (hdr contradicts its comment);
            C04-2 prose tempered (visible "Device limit reached" + deactivate path — not silent/
            permanent); C13-2 CORRECTS 1A (expiry toast is INVISIBLE, not "non-dismissible").
            COMPOUND CHAIN C04-1 → C13-2 → C04-2/C04-3 = the audit's #1 business-critical issue.
- [x] 1E · Opus   · Gap hunt (5 risk zones)               → `05-gaps.md`   — DONE 2026-06-05
      11 new GAPs. Reviewed/corrected: GAP-4 HIGH (migration omits workflowState → TypeError for
      upgraders); GAP-8 RE-GRADED HIGH→MEDIUM (seeds ARE named; reachable only via malformed import);
      GAP-8+GAP-9 = one root (catch-less canon-apply loop); GAP-1 HIGH-but-recoverable-on-reload.
      Render zone swept CLEAN (full field→handler map). 0 new CRITICAL. No hidden catastrophe.
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
