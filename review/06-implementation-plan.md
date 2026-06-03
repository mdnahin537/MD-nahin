# IMPLEMENTATION PLAN — execution-ready checklist

Companion to `00-master.md`. This is the per-fix surgical spec so an agent with **no whole-file context** (the file is 950 KB ≈ 237K tokens — it will NOT fit in a 200K window) can execute by jumping to exact line numbers.

**Hard constraints for any executing agent:**
- The target file `src/index.html` is ONE 14,850-line file. Never read it whole — `Read` only the cited line ranges, `Edit` in place.
- There is **NO test suite, NO build, NO `package.json`.** Nothing catches regressions automatically. Every fix's "verify" step is a **manual browser check** — open `src/index.html` in a browser, no server needed.
- Commit each fix as its own commit on `claude/kind-johnson-H6UrM` (PR #5). Do NOT batch fixes into one commit.
- Line numbers below are from the audit snapshot; re-grep the cited symbol before editing in case earlier edits shifted lines.

**Model assignment (per Hunter's decision):** Sonnet 4.6 executes #1 + #2 (isolated, exact-line). Opus drives #3 + #4 + A + #5 (architectural / regression-prone).

---

## FIX #1 — escHtml quote escaping  ·  CRITICAL  ·  **Sonnet**

**File/line:** `src/index.html:4638`
**Current:**
```js
escHtml(s){_escDiv.textContent=s;return _escDiv.innerHTML},
```
**Replace with** (static replace chain — also escapes `"` `'` `` ` ``, and is faster than the DOM round-trip):
```js
escHtml(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/`/g,'&#96;')},
```
Note: `&` MUST be first in the chain. `_escDiv` (`:4635`) becomes unused — leave it or delete it; harmless either way.

**Why:** old version escaped only `& < >`; ~40 sinks interpolate `E()` inside double-quoted attributes. Live stored-XSS: relations notes `value="${E(notes)}"` (`:12323`), survives import (`:5138`).

**Verify (browser):**
1. Open the app, create/open a realm, open the realm-relations panel.
2. In a relation note type: `"><img src=x onerror=alert(1)>` and commit.
3. PASS = the literal text shows in the field, no alert, no broken layout. FAIL = alert fires or an `<img>` breakout appears.
4. Sanity: normal notes with apostrophes (`it's`) still display correctly (as `it's`, not `it&#39;s` — it's inside an attribute so the entity is correct; confirm the rendered field shows the apostrophe).

---

## FIX #2 — CLAMP boundary-validation module  ·  HIGH  ·  **Sonnet**

**Step A — add the module.** Place it right after the `Utils` object (after `:4634` block, before first use). Uses `Utils.clamp` and the existing `EVENT_TYPES` enum (re-grep to confirm its name/location first).
```js
const CLAMP = {
  statValue(v, stat){ const n=Number(v); return Number.isFinite(n)?Utils.clamp(n,stat.min,stat.max):(stat.default??stat.min??0); },
  eventWeight(w){ const n=Number(w); return Number.isFinite(n)?Utils.clamp(Math.round(n),-30,30):0; },
  year(y, fallback){ const n=Math.floor(Number(y)); return Number.isFinite(n)?Utils.clamp(n,1,99999):fallback; },
  eventType(t){ return EVENT_TYPES.includes(t)?t:'Political'; },
};
```

**Step B — wire into all 9 boundaries** (re-grep each line; map the value through CLAMP):
1. Import core stat — `:5170` → `value = CLAMP.statValue(seedStats[c.key].value, c);`
2. Import chronicle — `:5134` → add `weight:CLAMP.eventWeight(e.weight), year:CLAMP.year(e.year,n.currentYear), type:CLAMP.eventType(e.type)` to the mapped object (after the spread, so they override).
3. AI tool `_buildProposal` add_chronicle_entry — `:8312` → wrap `weight`/`type`. **Preferred:** reject-and-return-error on out-of-range so the model self-corrects in-loop (coordinate with #3's pipeline owner).
4. AI canon `applyCandidates` — `:7063` → same `CLAMP.eventWeight`/`CLAMP.eventType`.
5. Manual event form — `:13258` → `weight:CLAMP.eventWeight(...)`.
6. `rs-year` — `:12419` → `n.currentYear = CLAMP.year(yr, n.currentYear);`
7. Session-advance — `:10312` → `n.currentYear = CLAMP.year(Math.round(cy+yearDelta), n.currentYear);`
8. Threshold stamp — `:6336` → `year: Math.floor(n.currentYear)`.
9. (statDelta apply `:8386` is handled by FIX #3 — do not duplicate here.)

**Verify (browser):** import a hand-edited JSON with `weight: 9999`, `year: -5`, `type: "Bogus"` → values clamp to 30 / 1 / "Political". Manual event form with weight 9999 → clamps to 30.

---

## FIX #3 — One AI mutation pipeline through State mutators  ·  HIGH  ·  **Opus**

**Lines:** statDelta apply `:8386`; caller `pushUndo` `:8290` and `:8426`; canon scan gate `:8804`; `checkThresholds` `:6336-6350`; `State.setStat` (note its internal `pushUndo` at `:5542`).

**Steps:**
1. Decide the kept channel (recommend **tools**; disable the `[CANON]` stream scan). Document the choice authoritatively in the system prompt so the model stops emitting the dead channel.
2. Gate the post-stream canon scan (`:8804`) on `!toolFiredThisTurn` so a turn emitting both doesn't double-apply.
3. In `_applyProposal` statDelta branch (`:8386`), replace the hand-mutation (`s.value=…` + manual `['stat']` dispatch at `:8387`) with `State.setStat(n.id, p.data.stat, p.data.newValue)`. This makes thresholds + front-triggers + dispatch + dedup fire for free.

> **⚠️ GOTCHA — double-undo (Flow A1).** `State.setStat` ALREADY calls `pushUndo` (`:5542`). The caller still pushes its own undo at `:8290/:8426`. After rerouting, the statDelta case must NOT also push at the caller — otherwise undo needs two presses to revert one AI stat write. Drop/skip the caller-side `pushUndo` for the statDelta path specifically. (Round-1's E2 framing missed this — do not skip it.)

**Verify (browser):** (a) Ask the AI to change a stat across a threshold boundary → a threshold chronicle event appears and any front optional-stat-trigger fires (previously silent). (b) One Ctrl+Z fully reverts that AI stat write (not two presses). (c) A turn with both a tool call and a `[CANON]` block applies only once.

---

## FIX #4 — State.reconcile + render-preserve helpers  ·  HIGH  ·  **Opus**
*(absorbs standalone bug B — the web rebuild)*

**Lines:** dispatchRender early return `:12984`; SHSPanels refresh block `:12993-13002`; web line `:13000`; `Render.all()` `:6401`; `setStat` cascade `:5545→6339→6350→5546`; Escape chain `:13147-13152`; nation-change close paths `:5638 (switchNation)`, `:9885/:9989 (Tonight)`; web `build()` `:12502` / `_render()` `:12630`.

**Steps:**
1. **`rebuildPreserving(el, html)` helper** — capture `document.activeElement` id + `selectionStart/End` + `el.scrollTop`, set `innerHTML`, restore. Use it to wrap every panel `innerHTML=` swap in the render layer (relations is the worst offender — loses caret per keystroke).
2. **Field-gate web line `:13000`** like its siblings (`if(fields.includes('relation')||'character'||'faction'||'location')`). Split refresh: cheap `_render()` (attrs only, **preserve `_selected` + `_transform`**) for value changes; full `build()` (re-sim) ONLY when node/edge topology changed. This kills bug B (slider release re-randomizing the graph + 632k ops).
3. **`Render.refreshOpenPanels()`** — extract the `:12993-13002` block into one helper called by BOTH `dispatchRender` and `Render.all()`. On a `nation`-field change, also `SHSPanels.closeAll()` + close detail panel (panels are per-nation). Wire into all three nation-change paths (`:5638`, `:9885`, `:9989`) so close behavior is consistent.
4. **Batch the setStat cascade:** move the `checkThresholds` dispatch out of the loop (`:6339`) so `setStat` emits ONE union `['stat','chronicle','front']` after it returns — eliminates the 2–3 synchronous innerHTML storms per slider commit and the chronicle-before-stat ordering inversion.
5. **Escape chain (`:13147`):** prepend an SC-panel check as the FIRST branch (`if(SHSPanels._open){SHSPanels.closeAll?.();return;}`) — topmost surface closes first.
6. **`trapFocus`/opener-restore/`inert`** shared helper applied at modal/Copilot/SC-panel/mobile-gate open/close (copy the working trap at `:9654`).

> **⚠️ This is what makes L3's round-1 "remove the early return at `:12984`" fix SAFE.** Removing that return without steps 1–2 trades a stale-panel bug for focus-loss + layout-destruction on the Ctrl+Z hot path (L4 C-R1). Do step 1+2 first, then remove the return.

**Verify (browser):** (a) Open web panel, pan/zoom + select a node, release a stat slider → graph keeps position + selection (no re-randomize). (b) Type in a relations note, trigger a stat change elsewhere → caret stays put. (c) Ctrl+Z with a panel open → panel stays open, scrolled where it was. (d) Switch nation with Sessions panel open → panel closes (no previous realm's data). (e) Escape with SC panel + Copilot both open → SC panel closes first.

---

## STANDALONE BUG A — Mid-stream undo/switch torn write  ·  HIGH  ·  **Opus**

**Lines:** `undo()` `:5466`, `redo()`, `switchNation()` `:5628`; `Copilot.cancel()` `:8859`; stream finalize `:8762-8772`; `Copilot._sending` flag.

**Steps:** At the TOP of `undo()`, `redo()`, and `switchNation()`, before any `State.data` mutation:
```js
if(typeof Copilot!=='undefined' && Copilot._sending) Copilot.cancel();
```
Then in the finalize block (`:8762`), bail early if `this._aborted` (don't re-resolve by `_streamingNationId` and write into the post-undo/switched state).

**Verify (browser):** start a Copilot message; mid-stream press Ctrl+Z → stream aborts cleanly, the undone conversation does NOT reappear, no message written. Repeat with switch-nation → the realm you left is not silently mutated.

---

## FIX #5 — Prompt caching + honest cost  ·  MED  ·  **Opus**

**Lines:** system prompt assembly `:8616`; usage capture `:8680`; cost estimate (hardcoded 2000/600 — re-grep).

**Steps:**
1. Move the volatile `buildContext(n)` world-state dump OUT of the system prompt into a leading user/message block, leaving the system prompt (role + CANON/tool protocol) frozen.
2. Put one `cache_control:{type:'ephemeral'}` breakpoint at the end of the frozen system+tools block.
3. Derive the cost estimate from real `buildContext().length/4 + history chars/4` × depth, not the 2000/600 constant.
4. Cap history length independent of the summarizer; bound `read_chronicle` resends.

**Notes:** Opus/Haiku require a **4096-token** minimum cacheable prefix (won't cache at `low` depth — `cache_creation_input_tokens:0`, no error). Verify via `usage.cache_read_input_tokens` (`:8680`): two same-world turns should show a cache read. If zero, a silent invalidator (non-deterministic `Object.values`/`Set` ordering in `buildContext`) is at work.

---

## POLISH TAIL — Low–Med (any model, after the above)
- **Contrast token (highest impact, ~1 line):** lift `--color-text-faint #9a8a6b` (2.87:1 on parchment) to ≥`#7d6f52`-class. Also web legend `#64748b` (4.21) and mobile-gate footnote `#7a7058` (3.96). Leave `#94a3b8` (passes, 7.81).
- SVG web ARIA: add `role="img"` + `aria-label` + `<title>/<desc>` to `#web-svg` (`:3443`).
- Mobile gate: `inert` the `#app` background on show, autofocus the continue button, trap Tab (reuse FIX #4 step 6 helper).
- CSP hardening (`:43`): blocked by `script-src 'unsafe-inline'` (real) and `style-src 'unsafe-inline'` (forced by pervasive inline `style=`). Defer — needs CSS-custom-prop migration first.

## DO NOT TOUCH (debunked round 2)
- Faction-orphan ref handling — no faction-delete exists; all reads null-safe. No work needed.
- Reduced-motion on particles — already works.
- `#94a3b8` contrast — passes, don't change.
- `copilotAutoApply` thrash — unreachable (no UI).

---

## Sequencing with checkpoints
1. **#1** (Sonnet) → browser-verify XSS → commit.
2. **#2** (Sonnet) → browser-verify clamps → commit.
3. **#3** (Opus) → verify thresholds + single-undo → commit.
4. **#4 + bug A** (Opus) → verify web/focus/escape/torn-write → commit.
5. **#5** (Opus) → verify cache read → commit.
6. **Polish tail** → commit.
Each step is independently shippable; stop at any checkpoint without leaving the file broken.
