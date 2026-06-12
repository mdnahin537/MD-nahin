# Index — where everything lives, and its honest grade

**For any agent joining this project, read in this order:** `CLAUDE.md` (how we operate) →
this file → `QUALITY-BAR.md` (what A+ means and how it's earned) → `POSITION.md` (what the
product truly is, read firsthand from source). Grades below follow the QUALITY-BAR rubrics;
**A+ ✅ appears only after an independent check**, never on the producer's word.

## The product

- **`realmwright-v7.html`** — THE product. 1.08 MB, 17,864 lines, single self-contained
  HTML app (vanilla JS, IndexedDB, no framework). Canonical copy lives in this repo;
  the original chat upload is only a fallback. Two verified criticals are open
  (license self-revoke at L6144; secret-leak via missing visibility clamp at L5863) and
  licensing currently targets Lemon Squeezy + itch.io, **not Gumroad** (must change).

## The vision (the build's north star)

Without AI: a genuinely **$49-grade** GM tool — deep, offline, deterministic prep.
With AI: a **$229-grade** tool — every feature AI-elevated plus AI-only extras.
Sold at **$19 one-time**: the value-to-price gap is the weapon. Own-your-data, offline,
single-file, BYO-key or local AI. Halal throughout. Payouts: Gumroad + Payoneer only.

## Ledger

| Artifact | What it is | Grade | Status |
|---|---|---|---|
| `POSITION.md` | Firsthand product truth, line-cited | **A+ ✅** | All 6 Rubric-P gates pass; 32-claim verification table, 5 Node-proven, independent check 2026-06-10. **The product source-of-truth.** *(Amended 2026-06-11: +2 CEO-found criticals — AutoSave key-leak L6302/L6318, evictable storage — a P1 coverage hole the CEO review closed.)* |
| `IDEAS.md` | Strategic counsel + ranked 8-idea portfolio | **A+ ✅** | All 8 ideas pass I1-I7 + portfolio gate; independent check 2026-06-11. **Keystone: the "living world" is NOT autonomous yet — the World Turn (idea #1) must be built to make the pitch true.** |
| `CEO-REVIEW.md` | CEO S+ review — observation, verdict, elevated ideas, rulings, roadmap | **S+ ✅** | A+ verifiable + S+ insight; independent check 2026-06-11 confirmed the 3 new criticals firsthand (AutoSave key-leak, evictable storage, honor-ware inversion). **The strategic direction.** |
| `.audit/research/MARKET-RESEARCH-V2.md` | The A+ market/customer research | **A+ ✅** | Passed all 10 Rubric-R gates incl. independent spot-check (2026-06-10). **The research foundation.** |
| `.audit/improve/MARKET-RESEARCH.md` | First web-sourced research | B+ | **Superseded by V2** — historical input only |
| `.audit/improve/PRODUCT-REVIEW.md` | First product review | C | Two false premises (Tonight "viewer"; "unowned wedge"). Use only with POSITION corrections |
| `.audit/REPORT.md` + `.audit/findings/` | Bug audit (19 passes) | C+ | **Lead list only** — every claim must be re-verified against source before use (it was wrong on the flagship) |
| `.audit/research/EXTERNAL-DOSSIER.md` | Externally commissioned dossier | D | **Quarantined** — fabricated citations; do not cite |
| `.audit/research/DEEP-RESEARCH-BRIEF.md` | The commissioning doc for external research | B | Historical record |
| `QUALITY-BAR.md` | The rubrics + the A+ loop | — | The bar itself |
| `.audit/verify/`, `.audit/test/DESKTOP-RUNBOOK.md` | Verification evidence + manual test script | B− | Useful evidence trail; same re-verify rule as the audit |

## Working state

- Branch: `claude/magical-mayer-YwP53` (all work committed + pushed here) · Draft PR: #9.
- Everything in this repo is accessible to every subagent at `/home/user/MD-nahin/`.
- Rule of the project: **trust the source file over any summary of it.** Each summary layer
  so far introduced errors; POSITION.md exists to kill that failure mode.
