# RealmWright V7 — Audit Report (FINAL)

Target: `6b9eaae1-relamwrith_V7.HTML` (1.08 MB, 17,864 lines). 19 audit passes; per-pass evidence in `.audit/findings/`.

## Verdict
RealmWright V7 is **fundamentally well-engineered** — and held back from "full potential" by a small number of high-impact defects, not by rot. The security posture is strong (file-wide XSS-clean, no prototype pollution, isolated API key), the JS↔HTML wiring is clean (471/471 IDs resolve), every module is actually mounted, save-migration is lossless, and the AI layer is the most carefully built part. What's wrong is concentrated: **4 critical bugs, one systemic "secrets leak to players" cluster, and three recurring patterns** (render-dispatch gaps, listener leaks, half-finished/undiscoverable features). Fix those and this is a solid paid product.

## Coverage
19 passes: 13 JS module-chunks (C01–C13), CSS (C14), HTML/wiring (C15), XSS spot-check (X2a), consolidated security (X2), wiring-graph (X1). **X3 logic-exec** and **X4 data-flow** were folded in, not run separately — the chunk agents already executed the pure logic in Node (Compute math, migrations, canon parser, CLAMP, CostMeter, search) and traced the data-flow (state round-trip, canon→state, settings, export/search coverage). Findings below tagged **Node-proven** were actually executed.

Tally ≈ **4 CRITICAL · ~33 HIGH · ~55 MEDIUM · ~65 LOW/POLISH** (~155 findings).

---

## 🔴 FIX BEFORE SHIPPING

### The 4 CRITICALs
1. **License self-revokes on any transient server error** (C04-1, L6144). `_backgroundValidate` skips `res.ok`; a 500/429/empty/garbage response flips a *paid* license to invalid, persists it, and silently stops AutoSave. *Node-proven.* → only downgrade on `res.ok` + explicit `json.valid===false`.
2. **Lost write on tab close** (C05-1, L6727). `persist()` is debounced 400 ms with no flush; edits in the last 400 ms before closing vanish. → flush `persistNow()` on `pagehide`/`visibilitychange`.
3. **`firstRunComplete` never set true** (C09-1). Every launch — including paying users — shows the demo pitch; the "welcome back" path is permanently dead. → set it true after onboarding.
4. **RelationshipWeb listener leak → runaway freeze** (C11-1 / X1, L15394). `_render` re-binds the SVG click every drag frame; clicks fan out to hundreds of handlers. *Node-confirmed.* → bind once in `init()`.

### The secret-leak cluster (product-critical: a GM's hidden canon shows to players)
One root cause, five sites. **Fix = add `CLAMP.visibility`** (validate to `public|private|forecast`, lowercase) at parse + apply, **and** make the Show-Secrets/Forecasts toggles call `Render.all()`:
- root: `CLAMP` has no visibility enum-clamp (C03-4); the prompt spec even names values the parser ignores (C01-1).
- leaks at: parser (C08b-2), world-shell (C10-2), render (C06-2 — even `Private` with a capital P slips the lowercase-exact filter).
- the **Show-Secrets toggle itself silently no-ops** (C10-1 — re-renders a `display:none` band, not the visible chronicle).

### Money/security
- **License verdict is client-trusting** (X2-3, HIGH) — a forged `{valid:true}` or DevTools edit bypasses the paywall **and can burn your OpenRouter credits** via the demo proxy. → sign the verdict server-side; lock down the Worker's CORS/CSRF (X2-4/X2-5).
- **Ship real DOMPurify** (X2a-1) — the file ships the placeholder fallback sanitizer.

---

## 🟠 Systemic HIGH themes
- **Exports & search silently drop half the world.** Foundry export *and* Story-Bible PDF omit Fronts/Bestiary/Relations/Glossary/Artifacts (C07-1, C11-3); GlobalSearch omits Fronts/Relations/Artifacts/Glossary (C12-1). Same second-class entities everywhere.
- **Render-dispatch gaps (stale-after-change).** 8 competing `sc:changed` subscribers; `solo` and `faction` fall through all of them (C02-1, C12-4, X1); search results for character/faction/event are **dead links** to nonexistent panels (C12-2, Node-proven).
- **Unfinished/undiscoverable features.** `LiveMode._maybeFire()` is a stub — the toggle shows "live" but never calls AI (C09); Glossary/Naming/Encounter Builder are reachable only via the off-by-default GM bar (X1); `LicenseGateUI.bind()` wires 3 null elements (C13).
- **Listener leaks (freeze risk).** Exactly 3 sites: RelationshipWeb (critical), AccuracyChip.mount (C12-3/C03-3), PrintPreview keydown (X1).
- **License recovery UX is dead.** False-expiry → re-activate mints a NEW instance → device-cap lockout (C04-2); the `license:expired` toast uses `duration=0` → **invisible** (C13-2), so the user gets *no* warning at all; `_hdr()` never sends the device token despite its comment (C04-3).
- **AI canon data-loss.** Decimal stat deltas dropped (C08b-1/C01); faction `type`/`position` discarded by a 4-field-vs-2-field prompt/parser mismatch (C01-1); re-paste doubles chronicle (C08b-3); prompt-injection via un-stripped user text (C01).
- **Data integrity.** Unknown/future `schemaVersion` skips migration → unguarded reads throw (C05-2, Node-proven); corrupt save → blank world, no auto-recovery from intact snapshots (C05-5); first realm's headline reads "**held up by** Corruption" — negative-stat label backwards (C06-1, Node-proven).
- **Themes half-broken.** 9 CSS vars used but never defined; ~8 WorldShell elements styled only in Ember → Manuscript/Modern themes visibly break (C14).

## 🟡 Notable MEDIUM (selection)
API key in the AutoSave **file backup** (C05-6); empty `TURNSTILE_SITEKEY` kills the demo funnel silently (C04-9); cost rates wrong ~3–4× (C02-3/4); copilot tool-loop ends mid-thought (C08a-1); `max_tokens:1500` truncates (C08a-5); markdown italic mangles snake_case stat names (C08a-2); localStorage mirror quota wall (C05-3); `persistNow` swallows failures (C05-8); no SRI on CDN scripts (X2-2); import lacks size/schema bounds (X2-7); triple `role="main"` + a11y gaps (C15). (~55 total — see per-chunk files.)

## ✅ What's solid (verified — don't "fix")
File-wide XSS-clean (188 sinks triaged, all escaped); no prototype pollution; both render primitives safe (`Markdown.render` escape-first+sanitize, `h()` via `createTextNode`); API key isolated to openrouter.ai, scrubbed from persistence; AI writes scope-gated/queued/undoable with a sound abort guard; save-migration lossless+idempotent; snapshots bounded to 7; `IDB.open()` degrades without crashing; 471/471 id wiring resolves; every module mounted; nav 12/12 routes resolve; FocusTrap/modal listeners clean.

---

## Phase 7 — recommended fix order (worst-first)
1. **The 4 CRITICALs** + **the secret-leak cluster** (one `CLAMP.visibility` + toggle re-render closes 5 findings) + **license-verdict signing** (X2-3, protects your credits). These are the ship-blockers.
2. The HIGH themes: export/search coverage, the `solo`/`faction` dispatch branches, the dead search-result routes, the invisible license toast, real DOMPurify.
3. MEDIUM/LOW polish + a11y + theme-var completion.

Each fix is isolated and well-understood; most are a few lines. All can be patched into a copy of the file and re-verified (logic in Node here; UI on your desktop, since this container has no browser).
