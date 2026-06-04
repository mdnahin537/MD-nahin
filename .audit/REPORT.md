# RealmWright V7 — Audit Report (LIVE / in progress)

Target: `6b9eaae1-relamwrith_V7.HTML` (1.08 MB, 17,864 lines). Per-module evidence in `.audit/findings/<chunk>.md`. This file = ranked master.

## Progress: 11 of ~15 modules + XSS spot-check done
**Done:** C04 licensing · C05 state · C06 render · C07 modals/export/`h()` · C08a copilot-stream · C08b copilot-canon · C09 campaign/modes · C10 worldshell/GM · C11 content-panels · C12 search/render-loop · C13 misc/license-UI · X2a XSS spot-check.
**Pending (blocked on subagent limit, resets 4:20pm UTC):** C01 config/AI-prompts · C02 solo/cost · C03 utils(rest) · C14 CSS · C15 HTML · X1 wiring-graph · X2 security(full) · X3 logic-exec · X4 data-flow.

**Running tally ≈ 4 CRITICAL · 22 HIGH · 33 MEDIUM · ~38 LOW · ~8 POLISH** (~105 findings / 11 modules).

---

## 🔴 FIX BEFORE SHIPPING — the 4 CRITICALs
1. **C04-1 License self-revokes on any transient server error** (L6144). `_backgroundValidate` skips `res.ok`; a 500/429/empty/garbage flips a *paid* license to invalid, persists it, stops AutoSave. *Node-proven.*
2. **C05-1 Lost write on tab close** (L6727). `persist()` debounced 400 ms, no flush on `pagehide` — edits in the last 400 ms before close vanish.
3. **C09-1 `firstRunComplete` is never set to true** — every launch (incl. paying users) shows the **demo pitch**; the welcome-back path (L17502) is permanently dead.
4. **C11-1 RelationshipWeb listener leak → runaway freeze** (`_render` re-binds the SVG click every drag frame; clicks fan out to hundreds of handlers). *Node-confirmed.*

## 🔴 PRODUCT-CRITICAL CLUSTER — "hide secrets from players" is broken (4 findings)
Core promise of a GM tool; fails several independent ways. Effectively critical.
- **C10-1 (HIGH)** the **Show/Hide-Secrets toggle silently no-ops** (re-renders a `display:none` band, not the visible chronicle).
- **C08b-2 / C10-2 / C06-2 (HIGH ×3)** event `visibility` is never enum-validated; "is hidden?" is a *lowercase-exact* compare to `'private'`, so `secret`/`hidden`/even `Private` leak to players. Confirmed at parser, world-shell, and render layers.
- **Fix cluster:** add `CLAMP.visibility` (validate+lowercase on parse and apply); make secret/forecast toggles call `Render.all()`.

## 🟠 HIGH themes (22 total — grouped)
- **Exports & search silently drop half the world:** Foundry export *and* Story-Bible PDF omit Fronts/Bestiary/Relations/Glossary/Artifacts (C07-1, C11-3); GlobalSearch omits Fronts/Relations/Artifacts/Glossary (C12-1). Same second-class entities everywhere.
- **Dead / unfinished controls:** search results for character/faction/event are **dead links** → nonexistent panels (C12-2, Node-proven); `LiveMode._maybeFire()` is a **stub** — toggle shows "live" but never calls AI (C09); `LicenseGateUI.bind()` wires 3 null elements (C13).
- **Stale-after-write render gaps:** AI `factionStance` writes but `dispatchRender` has no `faction` branch (C12-4); Relations notes silently dropped on blur w/o posture (C11-5).
- **Listener leaks (freeze risk):** C11-1 (critical), `AccuracyChip.mount` leaks 2 doc-listeners per modal open (C12-3).
- **License recovery UX dead:** false-expiry re-activate mints a NEW instance → device-cap lockout (C04-2); the `license:expired` toast uses `duration=0` → **invisible** (C13-2) — so the user gets *no* warning at all; `_hdr()` never sends `X-Device-Token` despite its comment (C04-3).
- **Data integrity:** unknown/future `schemaVersion` skips migration → unguarded reads throw (C05-2, Node-proven); corrupt save → blank world, no snapshot auto-recovery (C05-5); decimal stat deltas dropped by integer regex (C08b-1).
- **First impression:** every fresh realm headline reads "**held up by** Corruption/Opposition" (negative-stat label backwards) (C06-1, Node-proven).

## 🟡 MEDIUM (33) — selected
API key written to AutoSave **file backup** raw (C05-6); empty `TURNSTILE_SITEKEY` silently kills the demo funnel (C04-9); copilot tool-loop ends mid-thought at iter cap (C08a-1); markdown italic regex mangles snake_case stat names (C08a-2); `max_tokens:1500` truncates long answers (C08a-5); no dedup → re-paste doubles chronicle (C08b-3); localStorage mirror full-state quota wall (C05-3); `persistNow()` swallows storage failures silently (C05-8); ships with **fallback** sanitizer not real DOMPurify (X2a-1); unbatched slider re-render fan-out (C06-5); double-renders / ungated `sc:changed` re-renders (C12-5/6/7). (+ ~20 more in per-chunk files.)

## 🟢 LOW / POLISH (~46) — see per-chunk files
Incl. orphan `storageAvailable()` (wire into boot for C05-8's warning); dead `deviceFingerprint`; 25-deep full-state undo copies; per-rAF `.bind` allocations; Tonight orphan-world accumulation; assorted null-guards.

## ✅ Verified-GOOD (don't re-flag)
Save-migration lossless + idempotent (Node-proven); snapshots bounded to 7; `IDB.open()` degrades to null w/o crash; **AI layer is the most defensively-coded part** — no API-key leakage, per-provider header isolation, AI writes scope-gated/queued/undoable, sound abort guard; **both render primitives are XSS-safe** — `Markdown.render` (escape-first + sanitize) and `h()` (`createTextNode`); FoundryExport content escaped; modals/focus-trap don't leak; GM mode is cosmetic-only (architecture clarified).

## Runtime caveats
No browser here, Worker unreachable (000), OpenRouter 403 → live demo/license/AI/DOM stay `NEEDS-LIVE-VERIFY`. Everything tagged "Node-proven" was actually executed.

## Resume plan (when subagent limit resets)
Run C01, C02, C03(rest), C14 CSS, C15 HTML, then cross-cutting X1 wiring / X2 security / X3 logic-exec / X4 data-flow. Then Phase 7 fixes, worst-first: **the 4 CRITICALs + the secret-leak cluster** before anything ships.
