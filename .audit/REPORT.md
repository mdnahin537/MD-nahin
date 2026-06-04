# RealmWright V7 — Audit Report (LIVE / in progress)

Target: `6b9eaae1-relamwrith_V7.HTML` (1.08 MB, 17,864 lines). Detailed evidence per module in `.audit/findings/<chunk>.md`. This file = ranked master + progress.

## Progress (6 of ~14 modules + spot-checks done)
| Module | Status | Findings |
|--------|--------|----------|
| Phase 0 map | ✅ | `.audit/MAP.md` |
| C04 Licensing/Demo/AutoSave | ✅ | 1C 2H 4M 2L 1P |
| C05 State/Persistence | ✅ | 1C 2H 4M 2L |
| C06 Render engine (Compute/Render/Parse) | ✅ | 2H 3M 5L |
| C08a Copilot streaming/tools | ✅ | 3M 6L 3P (AI layer solid) |
| C08b Copilot canon-apply | ✅ | 2H 4M 3L |
| C10 WorldShell/GMMode/Threads | ✅ | 2H 1M 3L |
| X2a XSS spot-check (main path) | ✅ | 1M (no XSS critical) |
| C01 config/prompts · C02 solo/cost · C03 utils(rest) · C07 modals/export · C09 campaign/live · C11 panels · C12 search · C13 misc/licenseUI · C14 CSS · C15 HTML | ⏳ | re-running 2 at a time |
| X1 wiring · X2 security(full) · X3 logic-exec · X4 data-flow | ⏳ | cross-cutting, last |

**Running tally: 2 CRITICAL · 10 HIGH · 20 MEDIUM · 22 LOW · 4 POLISH** (~58 findings / 6 modules).

---

## 🔴 THE HEADLINE THEME: the "hide secrets from players" system is broken (4 findings)
This is the product's core promise for a GM tool, and it fails multiple independent ways. Treat as the #1 fix-cluster (effectively CRITICAL in product terms — a GM showing players the screen leaks spoilers):
- **C10-1 (HIGH):** the **"Show/Hide Secrets" toggle silently no-ops** — it re-renders only a `display:none` chronicle band; the visible chronicle (`WorldShell._renderChronicle`, L14271) is never re-rendered. Clicking "hide" hides nothing.
- **C08b-2 / C10-2 / C06-2 (HIGH ×3):** event `visibility` is never validated against `public|private|forecast`, and every "is it hidden?" check is a **lowercase-exact compare to `'private'`**. So anything the AI marks `secret`/`hidden` — or even `Private` with a capital P — renders to players. Confirmed at three render sites (parser, world shell, render layer).
- **Fix cluster:** add `CLAMP.visibility` (validate + lowercase on parse AND apply), and make the secret/forecast toggles call `WorldShell.render()`/`Render.all()`.

## 🔴 CRITICAL (data/money)
- **C04-1 — License self-revokes on any transient Worker error.** `_backgroundValidate` (L6144) skips `res.ok`, sets `valid=!!json.valid`; a 500/429/empty/garbage flips a *paid* license to invalid, persists it, fires `license:expired`, kills AutoSave. *Node-proven.* Fix: only downgrade on `res.ok` + explicit `json.valid===false`.
- **C05-1 — Lost write on tab close.** `persist()` debounced 400 ms (L6727), no `pagehide`/`visibilitychange` flush; edits within 400 ms of close vanish. Fix: flush via `persistNow()` on `pagehide`.

## 🟠 HIGH (remaining)
- **C04-2** — false "expired" → re-activate mints a NEW license instance (L6112), can exhaust device cap and hard-lock a paying user.
- **C04-3** — `_hdr()` never attaches `X-Device-Token` despite its comment (L6096); device identity missing on activate/validate in cookieless itch.io/`file://`.
- **C05-2** — unknown/future `schemaVersion` skips all migration (L6419) → unguarded `meta.settings.*` reads throw. *Node-proven.*
- **C05-5** — corrupt save → blank default world (L6555); no auto-recovery from the intact IDB snapshots; "Export now" exports the fresh default, not the corrupt original.
- **C06-1** — every fresh realm's headline reads "**held up by** Corruption/Opposition" — label logic backwards for negative-weight stats (L7511 Compute). *Node-proven.* First-impression breaker.
- **C08b-1** — decimal stat deltas (`+3.9`) silently dropped by the integer-anchored canon regex.

## 🟡 MEDIUM (20) — selected
- **C05-6/C04** — plaintext API key written to the AutoSave **file backup** (raw `State.data`), though everything else scrubs it.
- **C04-9** — empty `TURNSTILE_SITEKEY` silently disables the whole demo funnel (console-only warning).
- **C08a-1** — tool-call loop ends mid-thought if the 5th iteration returns tool calls (no synthesis turn).
- **C08a-2** — markdown italic regex corrupts the snake_case stat names the model is told to emit (e.g. `food_production`).
- **C08a-5** — `max_tokens:1500` silently truncates long AI answers / mid-emission tool args.
- **C08b-3** — events/characters never deduped → re-pasting AI output doubles chronicle history.
- **C05-3** — localStorage mirror writes full state every save → silent ~5 MB quota wall on big worlds.
- **C05-8** — `persistNow()` swallows IDB+localStorage failures silently on the most critical saves.
- **C06-5** — committed slider change double-renders 5 panels + fans out to 8 listeners, unbatched.
- **X2a-1** — ships with the FALLBACK sanitizer, not real DOMPurify (paste real DOMPurify before shipping).
- (+ C04-4 client-side demo cap, C04-5 itch.io never re-validated, C04-7 AutoSave cadence, C05-4 snapshot clock-skew, C06-3/4, C08a-3, C08b-4, C10-3 …)

## 🟢 LOW / POLISH (26) — see per-chunk files
Incl. **WIRING:** `storageAvailable()` (L5966) defined but never called — wire it into boot to power C05-8's "storage unavailable" warning. Dead: `deviceFingerprint`/`IDB_KEY_FINGERPRINT`. Undo stack keeps 25 full-state copies. Etc.

## ✅ Verified-good (don't re-flag)
Save-migration is lossless + idempotent for user/custom fields (Node-proven); snapshots bounded to 7 (no leak); `IDB.open()` degrades to null without crashing; **AI layer is the most defensively-coded part** — no API-key leakage, per-provider header isolation, AI writes scope-gated/queued/undoable, sound abort guard; **main XSS path is escape-first + sanitized** (no XSS critical); GM mode is cosmetic-only (clarified architecture).

## Runtime caveats (need your desktop)
No browser here, license Worker unreachable (HTTP 000), OpenRouter 403. So live demo/license enforcement, live AI streaming, and real DOM-render behavior stay `NEEDS-LIVE-VERIFY`. Everything tagged "Node-proven" was actually executed.

## Resume plan
1. Re-run remaining modules 2 at a time (each now self-commits its findings so nothing is lost), then cross-cutting X1–X4.
2. Phase 7 fix order, worst-first: the **secret-leak cluster** + **C04-1** + **C05-1** are the three to fix before anything ships.
