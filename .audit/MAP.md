# RealmWright V7 — Phase 0 Map (audit blueprint)

Source: `6b9eaae1-relamwrith_V7.HTML` — 1.08 MB, 17,864 lines, single self-contained file.

## File layout (line ranges)
- 1–53: head, meta, Google Fonts preload (Cinzel, Cinzel Decorative, Fraunces, Inter, JetBrains Mono, Spectral, Material Symbols)
- 54–3199: `<style>` — ~3,145 lines CSS (the "visual 12%")
- 3200: Cloudflare Turnstile script
- 3222–3282: small `<script>` — DOMParser-based HTML sanitizer (`clean`, `sanitize`)
- 3294: header `identity-strip`
- 4652–17575: MAIN `<script>` — ~12,900 lines JS (the "logic 88%"). NO section banners.
  - 8977–9020, 9209–9236: component styles injected via `pc.innerHTML`
- 17729+: trailing HTML templates (`tonight-mode`, `cmp-header`); 17863 `</body>`

## Stack / architecture
- Vanilla JS, no framework. Custom hyperscript `h(tag,attrs,...children)` for rendering.
- Custom `Router` (22 refs), `Modal`/`FocusTrap` (accessibility), `State` singleton.
- ~250 functions/handlers (49 decls + 34 named arrows + object methods), 362 addEventListener, only 4 inline onclick.
- Heavily async: 137 await, 166 try / 170 catch — but only 9 console calls (⚠ possible silent error-swallowing — verify Phase 3).

## Data model
- IndexedDB `realmwright` v1, single object store `kv` (key-value; everything serialized into one store).
- localStorage: only prefs (`rw_dev_theme`, `rw_legacy_layout`, `rw_mobile_dismissed`).
- Central state (`createDefaultState`, schemaVersion `2.5.0`):
  - `meta`: activeNationId, settings (DEFAULT_SETTINGS), workflowState, snapshots[] (version history), campaignPrep, firstRunComplete, preferredMode
  - `nations[]`: core domain entity, built via `buildNationFromSeed(SEED_NATIONS[0])`; leaders have status inPower/exiled/dead; stats via `_collectAffectedStats`
- Migrations: `migrateIfNeeded`, `migrateCampaignPrep`, `handleCorruptStorage` (corruption recovery).

## External wiring
- Backend: Cloudflare Worker `https://rw-license.realmwright.workers.dev`
  - `/api/license/activate`, `/verify`, `/api/license/validate`, `/api/demo/generate`
  - Device-bound licensing: `deviceFingerprint`, `_persistDeviceToken`, `_readDeviceToken`, `activate(key)`/`deactivate()`
  - Turnstile (bot protection) gates these.
- AI "copilot": providers = OpenRouter (default model `anthropic/claude-sonnet-latest`) AND local Ollama (`localhost:11434`, `llama3.1`).
  - Streaming chat w/ tool-calling: `streamOnce` (line 10190, COPILOT_TOOLS, tool_choice auto, max_tokens 1500)
  - Non-streaming completion: line 10478
  - Connectivity probe (800ms timeout): line 16556 (likely Ollama reachability)
  - User key stored under storage key name `rw_secret_copilot_key`.

## Module groups (for chunked deep-dive)
1. Bootstrap/lifecycle: bootstrap, startOnboarding, bindEventListeners, checkNarrow, applyMotionPref
2. State + persistence: createDefaultState, migrateIfNeeded, _stateForPersist, handleCorruptStorage, State.get/persist/_touch, IDB open
3. Domain/worldbuilding: buildNationFromSeed, SEED_NATIONS, resolveVars, _collectAffectedStats, leader status
4. Campaign prep: emptyCampaignPrep, migrateCampaignPrep, session prep
5. Rendering: h, htmlSpan, card, section, rebuildPreserving, dispatchRender, onChanged, Router
6. AI copilot: streamOnce, COPILOT_TOOLS, _applyProviderUI, provider/model UI, the 3 fetches
7. Licensing/auth: deviceFingerprint, token persist/read, activate/deactivate/verify/validate, WORKER_URL
8. Export/PDF: exportJSON, handleImport, generatePDF, renderSessionPrepPDF (scoped h/polar/section)
9. UI helpers: Modal/openModal, FocusTrap, showToast, showTooltipEl, attachSlider, theme (applyTheme, syncThemePickerUI)
10. Security: clean, sanitize (DOMPurify-like)

## Early findings (to confirm in later phases)
- Duplicate-name scan (`activate`, `h`, `polar`, `section`) → FALSE ALARM: scoped methods on different objects (FocusTrap/License/Modal; app-render vs PDF-render). Not collisions.
- ⚠ 170 catch vs 9 console → verify error handling isn't silently swallowing failures.
- ⚠ Single `kv` store holding entire state → check save granularity, large-state performance, write debouncing, corruption handling.

## Runtime testability in THIS container (web)
- No headless browser; chromium download network-blocked. License Worker unreachable (HTTP 000). OpenRouter 403.
- CAN test here: pure logic in Node (buildNationFromSeed, migrations, resolveVars, markdown→HTML, stat math, sanitizer).
- CANNOT test here: full UI/DOM, routing, license flow, live AI. → desktop (Chrome) or user-run.
