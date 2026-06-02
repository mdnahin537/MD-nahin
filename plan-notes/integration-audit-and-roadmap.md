# RealmWright — Integration Audit & Roadmap
**By:** Claude. **Date:** 2026-06-02. **Branch:** `claude/kind-johnson-H6UrM`.
**Purpose:** Hunter asked: (1) judge the quality of each integrated feature vs the plan, (2) find any feature the dying subagents missed, (3) fix Campaign mode (low usefulness), (4) account for the GM mode he asked about. This is the living record so details don't get lost across sessions.

**Method:** Every claim below was grepped/read in the *current integrated* `src/index.html` (16,678 lines, commit `54d25c4`), not assumed. Line numbers are current-file.

---

## A. WHAT GOT INTEGRATED (commit 54d25c4) — QUALITY VERDICTS

| Feature | Plan ref | State | Quality verdict |
|---|---|---|---|
| **F1 WorldContext engine** | §2 | ✅ Done, in-place | **GOOD.** `buildContext` (`:9599`) upgraded in place: real `_smartSelectChronicle` (last-touched ∪ top-\|weight\| ∪ entity-matched ∪ recency), ledger compression (`:9654` — nothing vanishes), cache-stable serialization (sorted stat keys `:9619`, plain digits `:9612`), 5-tier via `_normalizeTier`, entity-relevance from `message`. Returns `meta` contract (`:9694`). All **27 `buildContext` call sites inherit the upgrade** — exactly the plan's "one function, every surface" thesis. `buildAIContext` (`:9711`) is the thin meta-wrapper for the chip. This is the foundation and it is solid. |
| **Caching in `_apiFetch`** | v2.1 #4 | ✅ Done | **GOOD.** `cache_control:{ephemeral}` on frozen system prefix (`:9871`) + world block (`:10173`); single cost-logging point (`:10193`). The biggest cost lever, landed. |
| **F8 accuracy chip + per-surface effort** | §9 | ✅ Done | **GOOD.** `AccuracyChip` (`:5383`) reads F1 `meta` only, color-bands by token cost, click → tier picker. Mounted on Copilot/Tonight/Solo/Arsenal/Glossary/Naming/Encounter. Per-surface effort knobs present. |
| **F7 cost system** | §8 | ⚠️ **PARTIAL** | Cost meter + **hard USD cap** present (7 refs). **MISSING: soft-threshold notification (Layer 2 "watch")** and the **onboarding flow** (simulated demo → 5 real demo calls → BYO key). 0 refs for `softThreshold`, `demoCallsRemaining`. |
| **F2 Copilot retune** | §3 | ⚠️ **PARTIAL** | auto-promote nudge ✅ (13 refs); conversation history/pin ⚠️ partial (5 refs). **MISSING: history pruning** (older turns → 1-line summary; 0 refs) and the **permission gate** ("Apply these 3 changes? / Show diff / Decline" + recommendations-only toggle; 0 refs). |

---

## B. WHAT THE SUBAGENTS MISSED (verified not-built)

| Feature | Plan ref | State | Notes |
|---|---|---|---|
| **F3 Live Mode** | §4 | ❌ **NOT BUILT** | Greenfield. 0 real refs (`PressureSlot`/`RecentPulseSlot`/`ContradictionSlot`/toggle/indicator all absent). Sub#2 died before reaching it. The plan's biggest remaining build. Local-first heuristics → slot contracts → triggers/debounce/caps → thinking indicator. |
| **F4 Arsenal curation** | §5 | ❌ **NOT DONE** | Current **59 prompts**; target **≤40, ≤8/category**. Two-mode split (manual/no-key clipboard vs API/key) needs verification too. |
| **F2 history-pruning + permission-gate** | §3 | ❌ | See A. |
| **F7 soft-notify + onboarding gate** | §8 | ❌ | See A. |

**Cache integrity:** Both subagent worktrees (`a4edcca`, `affdaa`) are clean and byte-match the salvage branches. **Nothing was orphaned** — everything the agents produced is on `salvage-f1-arsenal` / `salvage-f7f8-livemode` and is integrated. The "missing" items above were never built, not lost.

---

## C. CAMPAIGN MODE (Hunter: "not quality-full, many problems, low usefulness")

**What it is now** (`Campaign` `:11147`): a fully **manual** session board — progress clocks, scene beats (first = Strong Start), one-line NPCs, secrets bank, notes, stakes. Clean code (escaping, caret-preservation, delegated events). **Zero AI. Zero pull from world state.** You re-type by hand everything the app can already generate.

**Why it feels low-value — confirmed by the spec itself:**
- `url-1-spec.md:206`: *"The 'modes' are theatre: Tonight=real, Campaign=just sets gmMode=true, World=same dashboard… 3 modes = really 2 = really 1."*
- `url-1-spec.md:38`: *"DELETE Campaign-vs-World mode distinction."*
- It **duplicates** Tonight (AI session-prep generator) and GMMode (AI quick tools) in *purpose* but shares **nothing** with them. GMMode generates an NPC → goes to "characters," not the Campaign board. Generates a Strong Start → goes to a modal, not beat #1. The product thesis is "AI that knows your world," and this is the one surface that ignores it.

**Three options (decision needed — see §E):**
- **(a) Delete** the Campaign-vs-World distinction (spec's original call). Lowest effort; removes redundancy.
- **(b) Wire it to the brain** *(recommended)*: keep the persistent board, make the AI fill it. Strong Start → beat #1; Quick NPC → Campaign NPC list; Generate Secrets → secrets bank; auto-suggest clocks from factions/pressures. Turns dead data-entry into "the board the AI preps for you." Highest value.
- **(c) Merge** Campaign + GMMode + Tonight into one coherent "Run Tonight" surface.

---

## D. GM MODE — decoded from prior session + specs (Hunter: "go find it, don't make me repeat")

Hunter's verbatim grievances: *"GM mode is not in the mode setting and when it turns off the place it stays — I don't like it."* Cross-referenced against `PLAN.md:106-111` (P1.9 grid override) and `url-1-spec.md:142` (W2-T07 — the resolved decision).

**Three concrete problems to fix:**
1. **Wrong toggle location.** GM Mode is a Settings toggle (`toggle-gm-mode` `:12421`). It should be a first-class item in the **Mode picker** (alongside Tonight/Campaign/World) since it's a session-running surface, not a preference.
2. **Layout doesn't clean up on toggle-off.** `body.gm-mode #app` adds a 4th grid row (`PLAN.md:108-110`) and `body.gm-mode .world-mode-shell{top:96px;}` shifts the shell (60px identity + 36px toolbar). When GM toggles off, ember theme still has `.gm-toolbar` CSS quirks (review/04-ui.md:177 documents the 36px offset hangover). Visual hole.
3. **9 tools scattered.** Spec W2-T07's decision: **add a "GM Tools" section in WorldShell left panel** (`wms-lp`), shown only when GM Mode is on. Move 9 actions there: Strong Start, Quick NPC, What's at Stake, Session Prep, **Proclamation, News, Letter, Glossary, Names**. **Delete** the old `.gm-toolbar` DOM + the `display:none !important` rule (~CSS line 335). Today only 4 of 9 are in the GMMode toolbar; the other 5 live scattered in Handouts/Glossary/Naming panels.

**Current GM build (commit 54d25c4):** `GMMode` `:12389` exposes 4 AI tools via toolbar. Toggle in Settings + badge below wordmark. Each tool routes through `Copilot.generate*` → F1 brain. 3-variant pickers on Quick NPC + Strong Start. **Solid foundation, wrong placement.**

**Plan (separate agent task, AFTER Campaign rebuild):**
- Move GM toggle into the Mode picker popover.
- Build the WorldShell-left-panel "GM Tools" section (`wms-gm-tools`) per W2-T07.
- Migrate 5 scattered tools (Proclamation/News/Letter/Glossary/Names) into the panel — they keep their existing generators, just gain a GM-Tools button entry.
- Kill `.gm-toolbar` DOM + the `display:none` rule.
- Verify ember/manuscript/modern themes all toggle cleanly with no layout artifact (resolves P1.9 properly).

---

## E. DECISIONS NEEDED FROM HUNTER (before autonomous execution)

1. **Campaign mode direction** — (a) delete, (b) wire-to-AI *(recommended)*, or (c) merge into one GM surface?
2. **"GM mode I asked about"** — does it mean the **9-tool GM Tools consolidation** above, or something else specific?
3. **Priority order** of the remaining work (Campaign fix, GM consolidation, F3 Live Mode, F4 Arsenal curation, F2 pruning+permission-gate, F7 soft-notify+onboarding).

---

## F. RECOMMENDED EXECUTION ORDER (my call, pending §E)
1. **Campaign → wire to AI** (option b). Highest felt-value per hour; directly answers Hunter's complaint; reuses existing generators.
2. **GM Tools consolidation** (the 5 missing tools into the toolbar). Cheap; completes a thing he asked for.
3. **F4 Arsenal curation** to ≤40. Cheap, high polish.
4. **F2 permission-gate + history-pruning.** Safety + cost.
5. **F7 soft-notify + onboarding gate.** Conversion-critical for the $29 product.
6. **F3 Live Mode.** Biggest build; last, on the proven engine — exactly the plan's sequencing.

---

## G. STATUS LOG (append per session)
- 2026-06-02: Integrated F1 + F7/F8 + caching (commit 54d25c4). Audited all of the above. Document created. Awaiting §E decisions.
