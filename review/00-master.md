# MASTER REVIEW — RealmWright (`src/index.html`)

Multi-agent audit, 5 lenses × 2 rounds (round 1 = independent, round 2 = cross-review/debunk/consolidate).
Lenses: **L1 Security · L2 Copilot/AI · L3 Flow/State · L4 UI · L5 Logic.** Research only — no code changed.

This file is the consolidated, de-duplicated, ranked punch-list. Per-lens detail lives in `01-`…`05-`.

---

## TL;DR — what actually matters

After cross-review, ~30 raw findings collapse into **5 structural fixes** plus **2 standalone HIGH bugs** plus a short polish tail. Do the structural fixes in the order below: each later one depends on or is made safe by an earlier one.

| # | Fix | Severity | Closes |
|---|-----|----------|--------|
| 1 | **Escape quotes in `escHtml`** | CRITICAL | ~40 attribute-XSS sinks |
| 2 | **Boundary input validation (`CLAMP`)** | High | AI-tool args, import, manual forms, year/weight/stat poisoning |
| 3 | **One AI mutation pipeline through State mutators** | High | threshold bypass, dispatch gaps, dual-channel undo, dedup |
| 4 | **`State.reconcile` + render-preserve helpers** | High | stale panels, focus/scroll loss, web layout wipe, ref integrity |
| 5 | **Prompt caching + honest cost** | Med | dominant input spend, lying cost estimate |
| A | **Mid-stream undo/switch torn write** | HIGH | orphaned-stream split-brain (standalone) |
| B | **Web rebuilds on every `sc:changed`** | HIGH | layout/selection wipe + 632k ops (folds into #4) |

---

## 1. CRITICAL — `escHtml` does not escape quotes → attribute-breakout XSS
**L1 #1.** `escHtml` (`index.html:4638`) round-trips through `textContent`/`innerHTML`, which escapes only `& < >` — **not `"` or `'`.** ~40 sinks interpolate `E()` inside double-quoted attributes. Live stored-XSS path: relations-panel `value="${E(notes)}"` (`:12323`), and `notes` survives verbatim through import (`buildNationFromSeed :5138`) — so a shared `.realmwright.json` is a delivery vehicle. One origin, IndexedDB worlds + in-memory `copilotKey`, CSP allows `connect-src` to openrouter → one injection exfiltrates everything.
**Fix:** replace `escHtml` with a static `.replace()` chain that also escapes `"`→`&quot;` `'`→`&#39;` `` ` ``. One change closes every attribute sink. Strategically, migrate dynamic attributes to `setAttribute`/`dataset`/`.value`.
**Do this first — smallest change, largest blast-radius reduction. Independent of everything else.**

Related L1: fallback sanitizer hoist-bypass (`:2416`), `sanitize` ignores its config arg (`:2445`), `copilotKey` leaks to disk via autosave writer + fallback download (`:5084/:5100`) — scrub on those paths too.

## 2. HIGH — Validate all external inputs at the boundary (`CLAMP` chokepoint)
**L2 E1 + L5 CLAMP + L1 import.** No range/enum validation where untrusted data enters the domain model: AI tool args (`type`/`weight`/`status`/`delta`), imported JSON (core-stat value, chronicle year/weight), manual forms. Causes mislabel math, NaN years, out-of-range stats.
**Fix:** one `CLAMP` module — `statValue(v,stat)`, `eventWeight(w)∈[-30,30]`, `year(y,fallback)∈[1,99999]`, `eventType(t)` enum-whitelist. Wire into all 9 boundaries (import 5134/5170, AI tool `_buildProposal` 8312, AI canon `applyCandidates` 7063, manual form 13258, `rs-year` 12419, session-advance 10312, threshold stamp 6336). Prefer **reject-and-return-error** on AI tool args so the model self-corrects in-loop.
**Principle:** `State.setStat` = only sanctioned stat writer; `CLAMP.event*` = only event writer; `CLAMP.year` = only year writer.

## 3. HIGH — One AI mutation pipeline, routed through State mutators
**L2 E2 + L3 A1/A3 + L5 A-3.** Two AI apply paths (structured tools + `[CANON]` stream scan) coexist; `_applyProposal` statDelta branch (`:8386`) hand-mutates `s.value` and dispatches `['stat']` directly — **bypassing `Compute.checkThresholds`** (threshold chronicle events + front optional-stat triggers are silently dead on the AI path, `:6336-6350`). Canon scan (`:8804`) isn't gated on whether a tool fired, so a turn emitting both runs both paths.
**Fix:** pick ONE channel (recommend tools — structured, nation-pinned, self-correcting), delete/disable the other, document it authoritatively in the system prompt, gate the cross-channel scan on `!toolFired`. Route `_applyProposal` through `State.setStat`/`State.addEvent` instead of hand-mutating → thresholds, front-triggers, dispatch, dedup all come for free.
> **GOTCHA (L3 A1, load-bearing):** `State.setStat` already calls `pushUndo` (`:5542`). The caller's existing `pushUndo` (`:8290/8426`) would then **double-push** → undo needs two presses to revert one AI write. The reroute MUST drop the caller-side `pushUndo` for the statDelta case. (L2's E2 framing missed this.)

## 4. HIGH — `State.reconcile` step + render-preserve helpers
**L3 D + L4 D-R1/D-R2 + L3 C3/C4/C5.** A whole class of bugs is "state mutated, views/refs not reconciled":
- Stale SC panels after undo/switch-nation/Tonight-delete (three paths, three inconsistent close behaviors — L3 C5).
- `innerHTML` rebuilds destroy focus/scroll mid-type; relations-notes input loses caret on every keystroke (L4 C-R2).
- **Web does a full `build()` on EVERY `sc:changed`** — re-randomizes layout, wipes pan/zoom + selection, runs ~632k sim ops; line `:13000` has no field-guard unlike its siblings (L4 A-R1, **finding B below**).
- `setStat` fires a re-entrant cascade: one slider commit → up to 3 synchronous innerHTML storms over the same DOM (L3 C3).
- Escape chain ignores the top-z SC panel (L3 C4).

**Fix (composes with #3):**
1. `State.reconcile(fields)` between mutators and renderers: (a) ref-integrity sweep for entity deletes, (b) `Render.refreshOpenPanels()` single contract called by both `dispatchRender` and `Render.all()`, (c) focus/scroll preserve.
2. `rebuildPreserving(el, html)` helper wrapping every `innerHTML=` swap (captures activeElement id + selectionRange + scrollTop, restores after).
3. **Field-gate web line `:13000`** + split web refresh into cheap `_render()` (attrs only, preserves `_selected`/`_transform`) vs full `build()` (only on topology change).
4. Shared `trapFocus`/opener-restore/`inert` helper for modals, Copilot, SC panels, mobile gate.
5. Batch the `setStat` cascade: move the `checkThresholds` dispatch out of the loop, emit one union `['stat','chronicle','front']`.
> **GOTCHA (L4 C-R1):** L3's round-1 "remove the early `return` at `:12984`" fix is **incomplete** — without the preserve/restore helper + web field-gate it trades a stale-panel bug for a focus-loss + layout-destruction bug on the Ctrl+Z hot path. #4 is what makes that fix safe.

## 5. MED — Prompt caching + honest cost
**L2 E3 + D.** Product promises cost transparency but under-measures (hardcoded 2000/600 estimate) and never caches.
**Fix:** move the volatile world-state dump OUT of the system prompt into a leading message block so the frozen system+tools prefix caches across sessions; put one `cache_control` breakpoint at the end of the frozen block. Derive cost estimate from real `buildContext` + history length × depth. Cap history independent of the summarizer; bound `read_chronicle` resends. Note Opus/Haiku 4096-token min cacheable prefix (won't cache at `low` depth — no error, just `cache_creation:0`).

---

## Standalone HIGH bugs

### A — Mid-stream undo / switch-nation torn write (split-brain)
**L3 C2** (`:5466, :5628, :8611, :8762`). During an in-flight Copilot stream, Ctrl+Z / switch-nation replaces `State.data` wholesale; the stream closure holds an orphaned `n`. Finalize (`:8762`) re-resolves by `_streamingNationId` against the NEW state and writes the assistant message + tool applies into it — so the undo is partially clobbered (undone conversation reappears) or, on switch, the realm the user LEFT is silently mutated while the visible one shows nothing.
**Fix:** `undo()`, `redo()`, `switchNation()` must, if `Copilot._sending`, call `Copilot.cancel()` (aborts controller `:8859`, sets `aborted` so finalize skips) BEFORE mutating `State.data`. Finalize block should bail if `_aborted`.

### B — Web force-graph rebuilds on every `sc:changed`
**L4 A-R1.** Covered as item 3 of fix #4 above. Release any stat slider with the web panel open → graph springs to a fresh random circle, pan/zoom + selection gone, 632k ops. Field-gate `:13000` + `_render()`-only refresh.

---

## Polish tail (Low–Med)
- **Contrast (L4 D-R3, corrected):** `--color-text-faint #9a8a6b` on parchment = **2.87:1**, fails AA, used app-wide on 9–12px labels → highest-impact token fix. Web legend `#64748b` (4.21) and mobile-gate footnote `#7a7058` (3.96) also fail. **`#94a3b8` web-detail PASSES (7.81) — removed from list.**
- **SVG web invisible to AT (L4 A-R4):** `#web-svg` has no role/aria-label/title/desc; generated children no ARIA.
- **Mobile gate (L4 C-R3):** `aria-modal="true"` but background not `inert`, no autofocus, no Tab-trap.
- **CSP (L1 #6):** `script-src 'unsafe-inline'` is the real hardening blocker; `style-src 'unsafe-inline'` is forced by pervasive inline `style=` (L4 A-R2) — needs CSS-custom-prop migration before tightening.
- **persist mirror gap (L1/L3 A2):** localStorage written after IDB `.then` → crash window leaves the two at different generations. Not data-loss.

## Debunked in round 2 (do NOT spend effort here)
- **Orphan `factionId` does NOT throw (L3 B1, definitive):** there is **no faction-delete operation anywhere** in the codebase; every faction-read path is null-safe (`?.name||id`, edge-filtering, no faction render in workbench). L5 #6 downgraded to "cosmetic, currently unreachable." Real residue: *if* a delete is ever added, it must sweep `c.factionId`.
- **`prefers-reduced-motion` DOES reach JS-spawned ember particles (L4 B-R1):** animation is class-driven, matched by the reduced-motion wildcard. No bug.
- **AI faction-stance refresh works in the default ember theme (L3 B2):** WorldShell re-renders faction cards; only stale in non-ember themes. Downgraded MED→LOW.
- **`copilotAutoApply` multi-tool render-thrash (L3 B3):** requires `copilotAutoApply:true` which has no UI → unreachable in shipped config.

---

## Suggested implementation order
1. **#1 escHtml** — isolated, critical, ship immediately.
2. **#2 CLAMP** — isolated, enables #3's reject-on-bad-args.
3. **#3 pipeline unification** (with the double-undo gotcha) — depends on #2.
4. **#4 reconcile + preserve helpers** (with web field-gate, batched cascade) — makes #3's renders consistent and absorbs bug B.
5. **A torn-write guard** — small, independent, do alongside #3/#4.
6. **#5 caching** — independent, cost win.
7. Polish tail (contrast token first — highest impact, one line).
