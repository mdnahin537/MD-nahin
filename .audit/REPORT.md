# RealmWright V7 — Audit Report (LIVE / in progress)

Target: `6b9eaae1-relamwrith_V7.HTML` (1.08 MB, 17,864 lines). Tracked in `.audit/`.
Detailed evidence per module in `.audit/findings/<chunk>.md`. This file = ranked master + progress.

## Progress
| Module | Status | Findings |
|--------|--------|----------|
| Phase 0 map | ✅ | `.audit/MAP.md` |
| C04 Licensing/Demo/AutoSave (5970–6556) | ✅ | 1C 2H 4M 2L 1P |
| C05 State/Persistence (6557–7510) | ✅ | 1C 2H 4M 2L |
| C01 config/prompts · C02 solo/cost · C03 utils/markdown · C06 render · C07 modals/export · C08a/b copilot · C09 campaign · C10 worldshell/GM · C11 panels · C12 search · C13 misc · C14 CSS · C15 HTML | ⏳ pending | blocked on subagent session-limit (resets 11pm UTC) |
| X1 wiring · X2 security · X3 logic-exec · X4 data-flow | ⏳ pending | cross-cutting, after chunks |

Tally so far: **2 CRITICAL · 4 HIGH · 9 MEDIUM · 4 LOW · 1 POLISH**.

**Security spot-check (main render path): NO XSS critical.** `Markdown.render` is escape-first + DOMPurify-sanitize; `escHtml` is complete; interpolation escaping is consistent. Detail: `.audit/findings/X2a-xss-spotcheck.md`. (Full sink sweep still pending in X2.)

---

## Ranked findings so far

### CRITICAL
- **C04-1 — License self-revocation on transient server error.** `_backgroundValidate` (L6144–6159) skips `res.ok`, sets `valid=!!json.valid`; any 500/429/empty/garbage flips a paid license to invalid, persists it, fires `license:expired`, kills AutoSave. *Proven in Node.* Fix: only downgrade on `res.ok` + explicit `json.valid===false`.
- **C05-1 — Lost write on tab close.** `State.persist()` debounced 400 ms (L6727), no `beforeunload`/`pagehide` flush; edits within 400 ms of close vanish. Fix: `pagehide`/`visibilitychange→hidden` → `persistNow()` + `persist.cancel()`.

### HIGH
- **C04-3 — `_hdr()` never attaches `X-Device-Token`** (L6096) despite its comment; device identity missing on activate/validate in the cookieless itch.io/`file://` contexts it was built for.
- **C04-2 — False "expired" → re-activate mints a NEW LS instance** (L6112), burning device-cap slots; repeated blips can hard-lock a paying user.
- **C05-2 — Unknown/future `schemaVersion` skips all migration** (L6419), boots an unmigrated shape; unguarded `meta.settings.*` reads then throw. *Proven in Node.*
- **C05-5 — Corrupt blob → blank default world** (L6555); no auto-recovery from the intact IDB snapshots; "Export now" exports the fresh default, not the corrupt original.

### MEDIUM
- **C05-6 / C04 — Plaintext API key written to the file backup.** AutoSave serializes raw `State.data` (key intact) though everything else scrubs it via `_stateForPersist`. Fix: serialize the scrubbed clone.
- **C04-9 — Empty `TURNSTILE_SITEKEY` silently disables the whole demo funnel** (console-only warning). Harden the build guard so a public build with blank keys fails visibly.
- **C05-3 — localStorage mirror writes full state every save** → silent ~5 MB quota wall on big worlds (no data loss; mirror just goes stale unannounced).
- **C05-8 — `persistNow()` swallows IDB+localStorage failures silently** on the most critical saves (onboarding/restore/cold-start); no signal if storage is unavailable.
- **C04-4 — Demo cap is client-side** (`rw_demo_uses` editable); proportionate for $29 *iff* the Worker enforces the per-IP cap — unverifiable here (Worker unreachable).
- **C04-5 — itch.io licenses never re-validated** (L6145); revoked keys keep access on-device. Decide intentionally + document.
- **C04-7 — AutoSave cadence quirks** (counts undo-pushes; ~19 edits before first backup; one-shot prompt).
- **C05-4 — Auto-snapshot uses wall-clock delta** (L7013); clock skew can suppress/spam daily snapshots. (Snapshots ARE bounded to 7 — no leak.)
- **X2a-1 — Ships with the FALLBACK sanitizer, not real DOMPurify** (L3223). Escape-first keeps the markdown path low-risk, but the hand-rolled sanitizer is weaker vs mXSS and allows `id`/`class` (DOM-clobber). Paste real DOMPurify before shipping (one-line swap already scaffolded).

### LOW / POLISH
- **C04-6 — `deviceFingerprint()` + `IDB_KEY_FINGERPRINT` are dead** (orphans).
- **C04-8 — LicenseQueue only handles `deactivate`**; other actions churn 10 retries then drop.
- **C05-7 — Migration drops a character→faction link** only if the named faction was already deleted (small edge data-loss).
- **C05-9 — Undo stack keeps 25 full-state JSON copies** — O(full-state) per edit on big worlds.
- **C04-10 — Demo error path resets Turnstile twice** (flicker).
- **WIRING — `storageAvailable()` (L5966) is a true orphan** (defined, never called). Verified. Notable: it's exactly the localStorage-capability check that C05-8's "warn when storage unavailable" fix needs — wire it into boot instead of deleting. (Note: `bindDecipherFab`/`emberDecorate`/`revealIconsWhenReady`/`_siteKeyGuard` flagged by the scan are IIFEs — NOT orphans.)

### Verified-good (don't re-flag)
Migration is lossless + idempotent for user/custom fields (Node-proven); snapshots bounded to 7; `IDB.open()` degrades to null without crashing; `_stateForPersist` correctly scrubs the key for IDB + localStorage + snapshots (just not the file backup).

---

## Runtime caveats (need a real browser / live backend — your desktop)
No browser here, license Worker unreachable (HTTP 000), OpenRouter 403. So these stay `NEEDS-LIVE-VERIFY`: the actual demo/license network enforcement, live AI streaming, and any DOM-render behavior. Pure logic was executed in Node where possible (and is the basis for every "proven" tag above).

## Resume plan
1. When the subagent limit resets, run remaining chunks C01–C03, C06–C13 + CSS/HTML, then cross-cutting X1–X4.
2. Each writes to `.audit/findings/`; this report re-ranks after each wave.
3. Optional Phase 7: apply fixes worst-first (C04-1, C05-1 are the two to fix immediately), each re-verified.
