# C06 — Compute / UI / Render / Interact / Parse

Range audited: **7511–8392** of `6b9eaae1-relamwrith_V7.HTML`.
Modules: `Compute` (L7511), `resolveVars` (L7648), `UI` (L7682), `Render` (L7693), tooltip/toast/`attachSlider` (L8076–8169), `Interact` (L8171), `Parse` (L8256).

**Wiring note (resolves a brief assumption):** the brief asked about the `h(tag,attrs,...children)` hyperscript helper and the `rebuildPreserving`/`dispatchRender`/`onChanged` loop. **None of those live in this range.** `h()` is defined twice OUTSIDE this chunk (L9024 component-styles scope, L9239 PDF scope). The Render module audited here builds DOM via **string-template `innerHTML`**, not `h()`. `dispatchRender` is L15690, `onChanged` is the onboarding listener L15113, both outside range. I confirmed how this range's render fns are *driven* by them (grep) but deep-audit of dispatchRender belongs to the bootstrap chunk. Render-loop findings below are scoped to what this range *causes*.

**Behavioral proof:** extracted `Compute` stat math, the real `BASE_STATS` (L4753–4781), and `Parse.canonBlock`/`matchStatKey` verbatim into Node and ran them. Actual output quoted inline. Scripts: `/tmp/c06_compute_test.js`, `/tmp/c06_real_nation.js`, `/tmp/c06_parse_test.js`.

---

### C06-1: "Held up by Corruption / Opposition" — breakdown labels negative-weight stats backwards; every fresh nation shows nonsense
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L7527–7553 (`Compute.breakdown`), rendered at L7746–7748 (identity strip "held up by … / dragged down by …") and L7906–7908 (nation card)
- evidence (Node, **real default nation, all stats at their seed defaults**):
  ```
  stability: 59 status: TENSE
  breakdown.up   (UI: "held up by")    : "Corruption 2, Opposition 3, Food 60"
  breakdown.down (UI: "dragged down by"): "Urbanization 35"
  ```
  deviation ranking: Corruption dev **+6**, Opposition dev **+3**, Food dev +2.5 → top-3 "held up by".
- observed/why: The deviation rule (`dev = r*weight − 0.5*weight`) is mathematically self-consistent — a negative-weight stat (Corruption w−20) sitting *below* its midpoint produces a positive deviation because it is "dragging less than expected." But the **user-facing label is wrong English for that math.** The very first screen a paying worldbuilder sees says their realm is **"held up by Corruption 2, Opposition 3."** No one reads "held up by Corruption" as praise. The code comment (L7528–7536) explicitly claims this "correctly handles … negative-weight (Corruption, Opposition) stats" — it handles the *number* correctly and the *words* incorrectly. Because Corruption/Opposition have a tiny range (0–10) but huge weights (−20/−15), their deviation dominates the ranking, so they almost always appear in "held up by." This is the core product's headline sentence and it reads as broken.
- fix: keep the deviation math, but split the *phrasing* by stat polarity. For weight<0 stats that are over-performing, render "kept stable by low Corruption" (or move them to a separate clause), never "held up by Corruption". Simplest: in `breakdown`, prefix negative-weight names with their virtue ("low ") and/or bucket positive- vs negative-weight contributors into distinct sentences.

---

### C06-2: AI-emitted event visibility is stored un-normalized → `PRIVATE`/`Secret` events bypass the "hide secrets" filter and leak to players
- tag: BUG | severity: HIGH | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: L8305 (`visibility:p[3]||'public'` — raw), L8368 (`visibility:c.visibility||'public'` — raw, no clamp), filters at L7933 / L8005–8006 / L8041 compare exact-case `==='private'` / `==='forecast'`
- evidence (Node):
  ```
  event visibility: PRIVATE
  user wants secrets hidden (showSecrets=false)
  filter hides it? false   <-- the secret event is SHOWN to players
  ```
  Parser stores `p[3]` verbatim; there is **no visibility allow-list/clamp** (unlike `type`→`CLAMP.eventType` and `weight`→`CLAMP.eventWeight`).
- observed/why: This is a GM-prep tool whose entire value proposition is hiding secrets from players (the `showSecrets`/`showForecasts` toggles). The AI "paste canon" path lets the model write `Event: The Betrayal | Political | -12 | Private | …`. Because the filter does `e.visibility==='private'` (lowercase, exact), a stored `"Private"`/`"PRIVATE"` **never matches**, so the GM's secret is rendered in the visible chronicle, on the timeline, and in the recent-pulse — regardless of the hide-secrets setting. The GM believes it's hidden; it isn't. Confidence MED only because it requires the AI to emit non-lowercase visibility (plausible and observed from real models, but not guaranteed every time). The parser should not trust AI casing for a security-of-information control.
- fix: normalize + clamp in `canonBlock`: `const vis=String(p[3]||'public').toLowerCase(); visibility:['public','private','forecast'].includes(vis)?vis:'public'`. Apply the same in `applyCandidates` (L8368) and the tool-call path (L9667) as defense in depth.

---

### C06-3: AI-emitted event `type` is case-sensitive → lowercased/uppercased types silently collapse to "Political", losing the AI's classification
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8305 stores `evType:p[1]` raw; L8368 runs it through `CLAMP.eventType` (L5864) which does an **exact-case** `['Political',…].includes(t)`
- evidence (Node):
  ```
  CLAMP.eventType('political') => Political   (AI lowercased -> LOST)
  CLAMP.eventType('MILITARY')  => Political   (AI uppercased -> LOST)
  ```
  Parse TEST 8: `Event: Coup | political | -10 | …` → `evType:"political"` → applied as generic `Political`.
- observed/why: Models very frequently lowercase enum-ish values. A "Coup (military)" or "Famine (natural)" pasted with a lowercase type silently becomes **Political**, which then drives the wrong timeline dot color (`typeColor`, L8043) and the wrong era-naming (`_nameEra` dominant-type, L7608). Data fidelity quietly degrades on a large share of AI imports with no failure surfaced to the user.
- fix: make `CLAMP.eventType` case-insensitive: match `T.find(x=>x.toLowerCase()===String(t).toLowerCase())||'Political'`.

---

### C06-4: `chronicleBand` clears stale dots/era-bands AFTER the empty-state early return → ghost timeline when all events are hidden
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: yes (visual; no browser here)
- where: L8009 `if(!visible.length){empty.style.display='flex';return;}` returns **before** L8012 `dotArea.querySelectorAll('.cb-dot').forEach(d=>d.remove())` and L8013 `eraArea.innerHTML=''`
- evidence:
  ```
  if(!visible.length){empty.style.display='flex';return;}   // L8009 — early return
  dotArea.querySelectorAll('.cb-dot').forEach(d=>d.remove()); // L8012 — never reached
  eraArea.innerHTML='';                                       // L8013 — never reached
  ```
  DOM (L3427–3429): `chronicle-era-area` and `chronicle-dots-area` are siblings; the `.chronicle-empty` overlay (`position:absolute;inset:0`, L2237) covers only the dots area, **not** the era area.
- observed/why: If a realm has events that all become hidden by a filter toggle (e.g. every event is `private` and the user turns *off* "show secrets", or deletes down to an all-hidden set), `visible` is empty → the function returns early. The previous render's `.cb-dot`s linger under the empty overlay, and the **era-band labels in `chronicle-era-area` are never cleared and stay fully visible** next to the "No history yet" message. Looks broken/contradictory.
- fix: move the two clear lines (dots + `eraArea.innerHTML=''`) **above** the `if(!visible.length)` guard so every render starts from a clean band.

---

### C06-5: Committed slider change triggers a DOUBLE full re-render of the same five panels
- tag: PERF | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8166–8167 (`attachSlider` change handler) vs the `sc:changed`→`dispatchRender` path (L6786 dispatch in `setStat`; L15702–15705 renders the identical panels)
- evidence:
  ```
  State.setStat(nid,key,newVal);   // L8166 -> dispatch sc:changed -> dispatchRender renders the 5 panels
  setTimeout(()=>{Render.nationCard();Render.pressurePoints();Render.recentPulse();Render.arsenal();Render.chronicleBand();},50); // L8167 renders the SAME 5 again
  ```
  `dispatchRender` for `fields:['stat']` (L15702–15705) already runs exactly `nationCard, pressurePoints, recentPulse, arsenal, chronicleBand`. It is bound directly with **no rAF/debounce** (L16617).
- observed/why: Every slider release rebuilds nation card + arsenal + the whole chronicle band **twice** (once synchronously via dispatch, once 50 ms later). `chronicleBand` recreates one `<div>` per event with **3 listeners each** (mouseenter/mouseleave/click, L8048–8050); the app itself warns at 400 events (L7938), so that's ~1200 listener attach/detach per render — doubled. Plus `setStat` fires **8 separate `sc:changed` listeners** (L5728, 12173, 14658, 14923, 15010, 15113, 16617, 17572), several of which re-render WorldShell/SHSPanels. The explicit `setTimeout` re-render is fully redundant with dispatchRender and should be deleted.
- fix: delete the L8167 `setTimeout(...)` block entirely — `setStat`'s `sc:changed` already drives the same renders. If a micro-delay is wanted, batch dispatchRender behind one `requestAnimationFrame` instead.

---

### C06-6: Stability/breakdown recomputed on EVERY `input` event mid-drag (no throttle) — O(stats) per pixel of drag
- tag: PERF | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8151 `el.addEventListener('input',()=>{update(parseInt(el.value,10));})` → `update` (L8133–8141) runs `Compute.stability` + `Compute.breakdown` (full `Object.values(n.stats)` passes) and writes 4 DOM nodes on every input tick
- evidence:
  `el.addEventListener('input',()=>{update(parseInt(el.value,10));});` → inside `update`: `const stab=Compute.stability(nat);…const bk=Compute.breakdown(nat);`
- observed/why: A single slider drag fires `input` dozens–hundreds of times; each recomputes stability and the full breakdown sentence and mutates `breakdown-sentence`/`status-label`. Cheap per call (≤~20 stats) but it is layout-touching work on the drag hot path. Not a correctness issue and not the double-render of C06-5 (this is intra-drag); flagged for completeness on "large worlds / every keystroke."
- fix: the numeric readout (`sv-`, `sf-`) must stay live, but recompute stability/breakdown on `change` (drag end) or throttle to rAF; the identity-strip sentence doesn't need per-pixel updates.

---

### C06-7: `openDetailPanel` action handlers close over a state snapshot captured at open time (stale `n`/`ev`)
- tag: BUG | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L8212 `const n=State.get();const ev=n.chronicle.find(...)`; handlers L8238–8240 reuse captured `n`/`ev` (Edit/Delete/Promote)
- evidence:
  `document.getElementById('dp-delete')?.addEventListener('click',()=>{… State.removeEvent(n.id,eid); …});` — `n` is the snapshot from panel-open.
- observed/why: If the active nation or this event mutates while the detail panel stays open (e.g. an AI "apply canon" run, or another tab path), the Edit/Promote handlers operate on a stale object. Nation-switch *does* close the panel (L15698 in dispatchRender), which covers the worst case (operating on the wrong realm). Residual risk: same-nation mutations (delete-then-edit, AI rewrite) act on a stale `ev`. Most handlers elsewhere in this range correctly re-fetch via `State.get()` *inside* the handler (e.g. L7830, L7838, L8249); this one doesn't.
- fix: inside each handler re-resolve `const n=State.get(); const ev=n.chronicle.find(e=>e.id===eid); if(!ev)return;` rather than relying on the open-time capture.

---

### C06-8: `matchStatKey` ≥3-char gate + tier-4 directionality silently drops valid AI stat deltas for short/compound names
- tag: BUG | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8329 `if(want.length<3)return null;`, L8341–8345 tier-4 substring (input must be contained IN stat name)
- evidence (Node `matchStatKey` runs):
  ```
  matchStatKey("Mil")               -> null   (3 chars but matches nothing; fine)
  matchStatKey("manpower and trade")-> null   (compound -> unmatched, by design)
  matchStatKey("trade route")       -> null
  ```
  and Parse TEST 9: `Stat: Legitimacy plus 5` → statName `"Legitimacy plus"` → `matchStatKey` returns null → delta silently lost.
- observed/why: The conservative matcher is mostly *correct* (it surfaces unmatched names as a toast at L8383 rather than guessing wrong — good). The edge is that odd-but-real AI phrasings ("Legitimacy plus 5", a 2-letter custom stat key) produce an unmatched stat that the user sees only as a transient 5 s toast (L8384). For a custom stat named e.g. "AI" or "QA" (<3 chars), AI deltas can never apply. Minor; documented so it isn't mistaken for a bigger parser hole. The parser otherwise handled fences, bullets, unicode dashes, "(from X to Y)" asides, last-occurrence `[CANON]` selection, and unclosed blocks correctly (TESTs 1,2,6,7).
- fix: lower the gate to allow exact key/displayName matches of any length (keep ≥3 only for the *fuzzy* substring tier); optionally strip trailing filler words ("plus", "points", "increased by") before matching.

---

### C06-9: `resolveVars` interpolates `[STATE]`/chronicle into AI prompts with no length cap on the per-stat/faction/character lines (only CHRONICLE_FULL is capped)
- tag: PERF | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: L7648–7675; `[CHRONICLE_FULL]` is capped to 100 events (L7655) but `[FACTIONS]`/`[CHARACTERS]`/`[ARTIFACTS]`/`[STATE]` stat list are uncapped
- evidence:
  `const factions=nation.factions.length?nation.factions.map(...).join('\n'):'  (none defined)';` (no slice), likewise characters L7658, artifacts L7659.
- observed/why: The author already recognized token-cost runaway and capped `CHRONICLE_FULL` at 100 (good, with a cost note). But a world with hundreds of factions/characters/artifacts dumps all of them into every prompt that uses those tokens, with no cap — re-introducing the exact silent-token-cost problem the chronicle cap was added to prevent. Lower impact than chronicle (these lists are usually smaller) hence LOW.
- fix: apply the same most-recent/most-relevant slice (e.g. `.slice(0,50)` with a "+N more" note) to factions/characters/artifacts as was done for CHRONICLE_FULL.

---

### C06-10: Custom-stat delete uses native `confirm()` keyed by display name; deleting a stat does NOT push undo before removal in the workbench path
- tag: QUALITY | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: L7884 `…confirm(\`Delete "${State.get().stats[k]?.displayName}"?\`)){State.removeCustomStat(State.get().id,k);Render.workbench();}`
- observed/why: Two small things. (1) Native `confirm()` blocks the main thread and is unstyleable — inconsistent with the app's custom Modal system used everywhere else; on `file://` some embeddings suppress it. (2) Whether this is undoable depends entirely on `State.removeCustomStat` pushing undo internally (defined outside this range — needs confirm); the call site doesn't `pushUndo()` itself, unlike the advanced-fields handler two lines up (L7875) which explicitly does. If `removeCustomStat` doesn't snapshot, a misclick permanently drops a custom stat and all its values with no Ctrl+Z. Flagging the call-site inconsistency for the state-chunk owner to confirm.
- fix: route through the app Modal confirm for consistency; verify `removeCustomStat` pushes undo (the delete confirm text even implies recoverability nowhere — unlike the event-delete which says "You can undo with Ctrl+Z", L8239).

---

## Summary

Counts by severity:
- CRITICAL: 0
- HIGH: 2 (C06-1 backwards "held up by" labels; C06-2 secret-event filter bypass via AI casing)
- MEDIUM: 3 (C06-3 event-type case collapse; C06-4 ghost timeline; C06-5 double re-render)
- LOW: 4 (C06-6 mid-drag recompute; C06-7 stale detail-panel closure; C06-8 matchStatKey gate; C06-9 uncapped prompt lists)
- QUALITY/LOW: 1 (C06-10 native confirm + undo question on custom-stat delete)

Top 3:
1. **C06-1 (HIGH, proven on real default data):** every fresh nation's headline sentence reads "held up by Corruption 2, Opposition 3" — the breakdown math is fine but the label is backwards for negative-weight stats. Embarrassing on first launch of a paid product.
2. **C06-2 (HIGH):** AI canon blocks with `| Private |`/`PRIVATE` create "secret" events that bypass the lowercase-exact `showSecrets` filter and are shown to players — the one thing a GM-prep tool must never do. No visibility clamp exists.
3. **C06-5 (MEDIUM):** committed slider change re-renders the same 5 panels twice (redundant L8167 `setTimeout` on top of dispatchRender), and `setStat` fans out to 8 `sc:changed` listeners with no batching — the render-storm the audit flagged, worst on 400+ event worlds.

Cross-chunk notes: the `h()` helper and `dispatchRender`/`onChanged` loop are OUTSIDE this range (L9024/L9239, L15690/L15113) — render-loop deep audit belongs to the bootstrap chunk; findings here are scoped to what this range *causes*. C06-10 references `State.removeCustomStat` (state chunk) for the undo question.
