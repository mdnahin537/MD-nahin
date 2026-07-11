# Recovery Audit — "Did the account switch lose any file?"
*End-to-end forensic inventory of the whole repo across every branch and PR. 2026-06-16.*

## VERDICT

**Nothing that was pushed is lost.** Every commit the previous agents made lives in this
GitHub repo (`mdnahin537/MD-nahin`), not in the old account. The account change could not
delete it — git is distributed, and all the work was pushed. Confirmed intact:

- **13 working branches + `main`** — all present on `origin`.
- **10 pull requests (#1–#10)** — all present; their head branches all still exist.
- **341 unique file paths** across the union of all branches.
- **6 progressively-built versions of the RealmWright app** (14,479 → 17,875 lines) — all present.
- **The Cloudflare Worker backend** (license + demo money path) — present on 4 branches.

**The real danger is not loss — it is fragmentation.** No single branch contains the whole
project. The work is scattered across 6 RealmWright branches, and the newest/"active" one
(PR #9) is *missing* the Worker backend and the test harness that live on older branches.
That is how something gets "lost" later: you keep building on one branch and forget the
money-path code is on another. This document is the map that prevents that.

**One boundary I cannot cross:** I can only verify what reached `origin`. If a previous
session died mid-task *before* pushing, that local-only work is gone and unrecoverable from
here. The previous agents pushed religiously (commit messages repeatedly say "committed
immediately so a session death can't lose it"), so the risk is low — but it is not zero,
and honesty requires saying so.

---

## 1. Every branch × PR × what it holds

| PR | Branch | State | Holds (unique value) |
|----|--------|-------|----------------------|
| #10 | `realmwright-research-planning-qvq8dy` | open draft · **edited today** | CLAUDE.md context-restore section (added, then **reverted** — see §5) |
| #9 | `magical-mayer-YwP53` | open draft | **The audit/build campaign.** `realmwright-v7.html` (latest code, +P0.1–P0.4 fixes) · entire `.audit/` (43 files) · 7 foundation docs (BLUEPRINT, CEO-REVIEW, IDEAS, INDEX, POSITION, QUALITY-BAR, VALUE-LEDGER). **No worker.** |
| #8 | `loving-darwin-Hth0w` | **MERGED** | Skill system overhaul (58 skills) — now in `main` |
| #7 | `catalog-skills-QGtwz` | closed, unmerged | Superseded by #8. Branch tip = 233-file skills vendor snapshot |
| #6 | `catalog-skills-QGtwz` | **MERGED** | Skills-persist fix — now in `main` |
| #5 | `kind-johnson-H6UrM` | open draft | **The dev source-of-truth.** `src/index.html` (17,864 lines) · **`worker/` (10 files)** · `plan-notes/` (14) · `review/` (8) · SHIP_READINESS · PLAN |
| #4 | `multi-agent-workflow-Tt5Hz` | open | **Most complete Worker (12 files, +`fingerprint.ts`)** · test harness `artifacts/` (Playwright suite, screenshots) · SHIP_READINESS |
| #3 | `realmwright-v1-build-02C2x` | open draft | RealmWright **v1.0** (`index.html` 14,479 lines) · `_headers` · `worker/index.js` (old JS worker) |
| #2 | `assistant-identity-eiqJs` | open draft | MCP/session-start config · `skills/make-com/SKILL.md` |
| #1 | `setup-code-environment-8z7Kk` | **MERGED** | Initial studio environment — now in `main` |
| — | `salvage-f1-arsenal` | **no PR** | F1 WorldContext (buildAIContext, smart-select, 5-tier ledger) + partial Arsenal — `src/index.html` 16,229 lines |
| — | `salvage-f7f8-livemode` | **no PR** | F7+F8 (cost meter w/ opt-in cap, per-surface effort, accuracy chip) — `src/index.html` 16,529 lines + worker |
| — | `loving-heisenberg-zas862` | no PR | **CURRENT branch.** Base studio only — **zero RealmWright files** |
| — | `loving-darwin`, `remember-claud-md`, `setup-code-environment` | merged/old | CLAUDE.md / settings iterations — environment history |

---

## 2. RealmWright product lineage (one app, six saved states)

All six are the *same* application at increasing maturity. Sizes are exact (verified bytes/lines):

| Order | Branch | File | Lines | Adds |
|-------|--------|------|------:|------|
| 1 | `realmwright-v1-build` (#3) | `index.html` | 14,479 | v1.0 feature-complete, JS worker |
| 2 | `multi-agent-workflow` (#4) | `src/index.html` | 14,852 | pre-ship triage, TS worker, tests |
| 3 | `salvage-f1-arsenal` | `src/index.html` | 16,229 | F1 WorldContext + Arsenal |
| 4 | `salvage-f7f8-livemode` | `src/index.html` | 16,529 | F7/F8 cost-meter + effort |
| 5 | `kind-johnson` (#5) | `src/index.html` | 17,864 | Campaign v2, GM Mode v2 — **dev head** |
| 6 | `magical-mayer` (#9) | `realmwright-v7.html` | 17,875 | = #5 exported + **P0.1–P0.4 fixes** — **canonical** |

**Key fact:** `realmwright-v7.html` (PR #9) is `kind-johnson`'s `src/index.html` (17,864 = the
exact line count the audit cites everywhere) that Hunter exported to a single file, re-uploaded,
and committed to PR #9 — where it then received the first 4 trust fixes (+11 lines). Per the
previous agent's own `INDEX.md`: **`realmwright-v7.html` is THE product, canonical.**

**Git caveat:** PR #9 and the dev line (#3/#4/#5) share *no* RealmWright history — their merge
base is the base studio commit (`28ad702`). The v7 file entered git as a fresh upload, not a
branch merge. So the two lines are git-independent; reconciling them is a content merge, not a
fast-forward.

---

## 3. CRITICAL FINDING — the Worker the build plan thinks is missing already exists

PR #9's audit and `BLUEPRINT.md` repeatedly tag the licensing/demo backend **`NEEDS-WORKER-SOURCE`**
— the campaign believed the Cloudflare Worker source was unavailable (it wasn't in the v7 file).

**It was never missing.** A substantially-built Worker exists on four branches:

| Branch | Worker files | Notes |
|--------|-------------:|-------|
| `multi-agent-workflow` (#4) | **12** | Most complete: `license.ts demo.ts itch.ts ratelimit.ts cors.ts fingerprint.ts index.ts` + config. PR #4 says LS license proxy + 3-device cap + demo proxy + rate-limit are built & verified |
| `kind-johnson` (#5) | 10 | Same minus `fingerprint.ts`/`.gitignore` |
| `salvage-f7f8` | 10 | Sibling copy |
| `realmwright-v1-build` (#3) | 2 | Old `worker/index.js` (pre-TypeScript) |

Why it matters: **Phase 0's exit gate in BLUEPRINT.md requires the Worker** (activate one Gumroad
+ one itch.io + one Lemon Squeezy key — `CC-LIC` universal adapters). The plan budgets this as
work-to-do. In reality it is ~80% built on PR #4's branch. This is the single largest piece of
"stranded" work the fragmentation hid — and the clearest reason to consolidate before building further.

---

## 4. The salvage branches (highest loss-risk — no PR tracks them)

`salvage-f1-arsenal` and `salvage-f7f8-livemode` are the only branches with **no PR**, and their
tip commits are **not ancestors of `kind-johnson`** — i.e. their unique commits were not git-merged
into the dev head:

- `salvage-f1-arsenal`: `1588e3b WIP salvage: F1 WorldContext + partial Arsenal`
- `salvage-f7f8-livemode`: `f475c2d Add F7+F8: cost meter (opt-in cap), per-surface effort, accuracy chip`

`kind-johnson` *does* have a cost-meter (parallel re-implementation), so some of this may be
duplicated rather than unique — but **F1 WorldContext and Arsenal are not confirmed present in v7**
and must be diffed before these branches are ever deleted. Until that diff is done: **do not delete
the salvage branches.** They are preserved on `origin`, so nothing is lost today.

---

## 5. What happened today (the account-migration trail)

The new account (`mdnahin537`) already started this exact recovery. Session
`01KZ2MhJS5m9CdRNwpxicrxA` (today, 15:18 UTC):
1. Added a full "ACTIVE PROJECT — REALMWRIGHT" section to `CLAUDE.md` on
   `realmwright-research-planning-qvq8dy` (commit `14e621b`) — opened **PR #10**.
2. **Reverted it** 4 minutes later (commit `9324c89`) — so that orientation text is currently
   live in *no* branch's `CLAUDE.md`. Its content (PR map, the 4 ship-blockers, locked
   positioning) is sound and is folded into this document.

The account switch itself cost nothing: the old account's work was already in this repo.

---

## 6. Recommendation (decision is Hunter's)

1. **Pick one canonical branch and union everything onto it.** Recommended base: **PR #9
   `magical-mayer`** (it holds the latest code + the entire graded foundation + the build plan,
   all of which reference `realmwright-v7.html`). Bring onto it:
   - `worker/` from **PR #4** (the 12-file version) — closes `NEEDS-WORKER-SOURCE`.
   - test harness `artifacts/` from PR #4; `plan-notes/` + `review/` from PR #5 (as history).
   - a verified diff of the **salvage** branches' F1/Arsenal work into v7 before retiring them.
2. **Then resume the build** at Phase 0 (P0.1–P0.4 done; next is P0.5+ per BLUEPRINT.md).
3. **Re-add** the reverted RealmWright context section to `CLAUDE.md` so no future session cold-starts.
4. **Do not delete any branch** until its unique content is confirmed merged.

---

## Appendix — how this was verified
- `git ls-remote` / `git branch -r` → all 13 branches + main on origin; no tags/releases.
- `mcp__github__list_pull_requests (state=all)` → PRs #1–#10 enumerated; merge status from `merged_at`.
- `git cat-file -s` / `wc -l` per branch → exact product + worker sizes.
- `git merge-base --is-ancestor` → salvage branches carry unabsorbed commits; #9 vs dev line share only the base commit.
- `git ls-tree` union across all refs → 341 unique paths; worker present on 4 branches, absent on #9.
