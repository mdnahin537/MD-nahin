# URL-1 SPEC — RealmWright v1.0 Launch Framework

> Source: Claude.ai conversation (docx export, ~54K tokens, 2757 lines). Dated May 13–14.
> Nature: FOUR rounds of deep code audit of `realmwright_v16_patched.html` (single-file HTML app, ~670KB, ~11,200 lines), culminating in a LOCKED 4-week implementation framework (~11,000 words, 11 sections, 38 numbered tasks) handed to a SEPARATE "implementing AI" to build against.
> This file is the AUDIT CHECKLIST. Each item is something the built product must satisfy. Status legend for later audit: ✅ done / ⚠️ partial / ❌ missing / 🟡 changed-from-plan.

---

## 0. PROJECT IDENTITY
- **Product name:** RealmWright (LOCKED — do not relitigate).
- **What it is:** A single-file HTML app, packaged as an Electron desktop app. A **"GM Session Companion with an optional World Engine."**
- **Front door = session prep.** World engine = the reward/power layer behind progressive disclosure.
- **Target buyer:** TTRPG Game Masters (primary paying audience), plus sandbox/solo-RPG worldbuilders.
- **Base file under work:** `realmwright_v16_patched.html` (v16, audited up from v12 which scored 6.4/10; v16 scored 7.1/10).
- **Sale model:** one-time purchase, $29 desktop app, via Lemon Squeezy + Itch.io. Free web demo.

## 0.1 HARD CONSTRAINTS (Hunter's business rules)
- Halal only: no interest, no usury, no auto-renewing subscriptions. One-time perpetual license.
- Payouts: Payoneer via Bangladesh-friendly platforms only (Lemon Squeezy, Gumroad, Itch.io). NOT Stripe-dependent.
- Solo builder, limited hours, no coding background, no support staff. Minimize support-load features.
- Never expose Hunter's API key in any client code/binary.

---

## 1. THE 23 LOCKED DECISIONS (Section 1.3 of framework)

**Product & pricing**
1. Two pricing tiers ONLY: Free (web demo, 3 generations) + RealmWright ($29 desktop, one-time, 3 device activations). [NOTE: a "Studio $59" 3rd tier was proposed then CUT by Hunter. Final = 2 tiers. Price went $19→$29.]
2. Free-demo generation limit = **3**, configurable via ONE Worker constant (`FREE_TIER_LIMIT`).
3. No Studio/Pro/Plus tier in v1.0. BUT architecture must support adding tiers later via license token's `tier` field.
4. Web demo is web-only. Electron desktop is paid-only. NEVER ship an Electron build to non-licensed users.
5. Product name is RealmWright.

**Front door & modes**
6. First screen = single textarea **"What are you running tonight?"** + 3 pill/select selectors (System, Tone, Focus) + one Generate button. NO Mode Picker, NO nation setup, NO stat sliders.
7. After generation, three CTAs: **Save as Realm / Export PDF / Run another**.
8. Existing dashboard (WorldShell + contents) becomes the post-"Save as Realm" view.
9. DELETE the Mode Picker as launcher. DELETE Campaign-vs-World mode distinction. One mode: with-a-saved-Realm or without.

**Models**
10. OpenRouter dropdown = exactly 3 options, all `-latest` aliases:
    - Claude Sonnet (latest) — recommended, **default** — `anthropic/claude-sonnet-latest`
    - Claude Opus (latest) — `anthropic/claude-opus-latest`
    - Claude Haiku (latest) — `anthropic/claude-haiku-latest`
11. Ollama: NO version dropdown. App detects installed models at runtime via `GET /v1/models`. 3 error states with copy-paste fixes.
12. Users CANNOT type custom model slugs on either provider. Typo-proof.

**Architecture**
13. Hunter's API key lives ONLY in Cloudflare Worker secrets. Never client-side, never in binaries.
14. Paid users BYO OpenRouter key, OR run Ollama locally. Their requests go DIRECTLY browser→OpenRouter (not through Worker).
15. Free-tier requests: app → Cloudflare Worker → OpenRouter. Worker enforces 3-call limit via KV keyed by anon UUID in localStorage `rw_anon_id`.
16. License keys issued by Worker on Lemon Squeezy webhook. Validated via Ed25519-signed token verified OFFLINE by app.

**Prompts & AI**
17. PROMPTS array is the canonical source for BOTH Fill & Copy (clipboard) AND Send via Copilot (API). One mechanism, two outputs.
18. Variables `[SITUATION]`, `[STATE_A]`, `[STATE_B]` + any undefined var → "Fill these in" modal pops before prompt runs. Same filled prompt powers both paths.
19. Strong Start, Quick NPC, and individual session hooks return **3 variants**. User picks/merges/regenerates individual variants.
20. Every AI-generated message has a **"ⓘ context" toggle** revealing system prompt + nation context that produced it.

**Reliability & polish**
21. Markdown rendering in Copilot chat via tiny INLINE safe renderer (NO external library). Handles `**bold**`, `*italic*`, `` `code` ``, `#` headers, `-` bullets, `\n\n` paragraphs. No links/images/tables.
22. Auto-retry ONCE on 429/5xx with 2-second backoff on all `_apiFetch` callers.
23. Tonight Mode steps 2 & 3 (Strong Start + Session Pack) run in `Promise.all`. Step 1 (importFromText) stays sequential (2&3 depend on its output).

---

## 2. CODEBASE MAP (v16 file structure — for reference during audit)
- SECTION 1 DOCUMENT METADATA (lines ~1–15)
- SECTION 2 EMBEDDED FONTS (~16–25)
- SECTION 3 DESIGN TOKENS / CSS vars (~26–178)
- SECTION 3.5 EMBER VISUAL UTILITIES (~179–297)
- SECTION 3.6 WORLD MODE SHELL / WorldShell layout CSS (~298–746)
- SECTION 3.7 EMBER MODAL SYSTEM + COPILOT PANEL (~747–1117)
- SECTION 4 BASE STYLES (~1118–1143)
- SECTION 5 LAYOUT STYLES (~1144–1165)
- SECTION 6 COMPONENT STYLES (~1166–1809)
- SECTION 7 MOTION & STATE STYLES (~1810–2064)
- SECTION 8 DOM STRUCTURE (~2065–3260)
- SECTION 9 DATA & STATE: SCHEMA_VERSION, CORE_STATS, PRESSURE_RULES, SEED_NATIONS, PROMPTS, Utils, IDB, State (~3261–4441)
- SECTION 10 CALCULATION ENGINE: Compute (stability, breakdown, pressures, milCap), resolveVars (~4442–4607)
- SECTION 11 RENDER/INTERACT/MODALS/PARSE/BOOTSTRAP: Render, Interact, Parse, Modals, Copilot, Tonight, GMMode, WorldShell, SHSPanels, GlobalSearch, ModePicker, listeners, bootstrap (~4608–11204)

### 2.2 PRESERVE (sound — do not refactor)
- Stability math (`Compute.stability/breakdown/pressures`)
- IDB+localStorage persistence w/ generation counter (`State.persist/persistNow`)
- Undo/redo w/ pre-drag value capture (`attachSlider`, `State.pushUndo`)
- Stream abort w/ cleanup (`Copilot.send/cancel`)
- Corrupt-storage recovery (`handleCorruptStorage`)
- Schema migration (`migrateIfNeeded`) — idempotent
- Snapshot rotation (last 7)
- Global search (`GlobalSearch`, Ctrl+K, 8 entity types)
- Slider behavior
- **PDF export (`generatePDF`, `PrintPreview.open`) — high-quality typeset; PROTECT and SURFACE MORE**
- PROMPTS array (~81 entries)
- PRESSURE_RULES
- Faction integrity migration (characters use factionId UUIDs)

### 2.4 DELETE (vestigial)
- Manuscript theme CSS (`body.theme-manuscript`)
- Modern theme CSS (`body.theme-modern`)
- `window.__rwSetTheme` and `window.__rwClearDevTheme`
- Vaporware nav items: `data-nav="grimoire"`, `"atlas"`, `"legions"`, `"chronicle"`
- The "coming in v1.1" toast handler (~line 8631)
- Legacy `claude-sonnet-4-5` fallback → replace with `claude-sonnet-latest`

### 2.5 ADD (missing)
- New front-door screen (Spec 7.9)
- Ollama model detector via `/v1/models` (Spec 7.7)
- Unified prompt-fill modal (Spec 7.3)
- Cloudflare Worker (Spec 7.1)
- Lemon Squeezy integration (Spec 7.2)
- Inline markdown renderer (Spec 7.5)
- 3-variant pattern (Spec 7.6)
- System selector D&D5e/PF2e/Daggerheart/Generic/Other (Spec 7.8)
- Empty-state copy on every panel (Spec 7.10)

---

## 3. WEEK 1 — SHIPPABILITY (12 tasks)
- **W1-T01** Fix OpenRouter default model. Replace ALL `anthropic/claude-sonnet-4-5` → `anthropic/claude-sonnet-latest`. Update `DEFAULT_SETTINGS.copilotModel`, Settings dropdown (3 options), `_apiFetch` fallback, cost preview (`costEstimateLabel`: Sonnet [3,15], Opus [5,25], Haiku [1,5] per Mtok). Add "recommended" badge to Sonnet. Delete dash-versioned options. **DONE WHEN:** new install w/ valid key sends chat & gets streaming response; dropdown shows 3; badge present; realistic cost preview.
- **W1-T02** Add `beforeunload` handler that cancels debounce + `persistNow()`. **DONE WHEN:** rapid stat change + close within 400ms persists on reload.
- **W1-T03** Strip API key from snapshots. `_snapshotClone()` nulls `meta.settings.copilotKey` before IDB write. **DONE WHEN:** stored snapshots show `copilotKey: null` while live state keeps key.
- **W1-T04** Add retry to `_apiFetch` (one retry on 429/5xx, 2s backoff). Streaming `send()` also retries once before stream starts. **DONE WHEN:** injected 429-then-success fires 2nd attempt after 2s.
- **W1-T05** Delete Manuscript + Modern themes (CSS, `__rwSetTheme`/`__rwClearDevTheme`, devTheme lookup). Simplify `applyTheme()` to always Ember + show WorldShell, hide `.main-row`/`.chronicle-band`. `DEFAULT_SETTINGS.theme='ember'`. **DONE WHEN:** zero theme-manuscript/theme-modern refs; ~400 lines gone.
- **W1-T06** Delete 4 vaporware nav items + the "coming in v1.1" toast (~8628–8631). **DONE WHEN:** nav has 9 items, all open something real.
- **W1-T07** Resolve Artifact schema mismatch — DECISION: **DELETE**. Remove `case 'artifact'` from `Parse.canonBlock` (~5147–5210), `[ARTIFACTS]` from resolveVars if unused, `Artifact:` from CANON_SUFFIX (~3312) and SWEEP_PROMPT (~3313). **DONE WHEN:** zero `Artifact:` parsing refs.
- **W1-T08** Unified prompt variable fill — the `[SITUATION]` fix (see Spec 7.3). **DONE WHEN:** Fill&Copy on r72 prompts for `[SITUATION]`; r77 asks for `[STATE_A]`/`[STATE_B]` with Realm picker.
- **W1-T09** Ollama runtime model detection (Spec 7.7). **DONE WHEN:** running+llama3.1 shows it; stopped shows "not detected" w/ install cmd; running+no-models shows pull cmd.
- **W1-T10** Stand up Cloudflare Worker, 3 endpoints (Spec 7.1). **DONE WHEN:** curl `/api/free/tonight` returns pack; 4th returns 402.
- **W1-T11** Wire free-tier flow. `_apiFetch`: if openrouter provider AND no user key → `_freeTierFetch` (anon UUID `rw_anon_id`, POST to `WORKER_URL/api/free/tonight`, 402 → upgrade msg). Free tier ONLY proxies Tonight gens, NOT streaming chat. **DONE WHEN:** fresh session runs 3 Tonights, 4th shows quota msg + upgrade prompt.
- **W1-T12** Remove/fix stale comments (line ~131 typeColor false comment; line ~7451 no-op fractional-year — fix to `Math.abs(v-Math.round(v))<1e-9` or delete; KEEP "B14 fix"/"Bug 11 fix" annotations). **DONE WHEN:** no unaddressed TODO/FIXME/temporarily.

**W1 acceptance:** 9 checks (free demo 3-then-quota; BYO key chat works/no slug error; rapid-close persists; snapshots lack key; Ollama detect/errors; no v1.1 toast; r72 fill works; 4 nav items gone & rest work; no Manuscript/Modern refs).

## 4. WEEK 2 — CONVERSION (10 tasks)
- **W2-T01** Build new front-door screen (Spec 7.9). **DONE WHEN:** first open shows front door not Mode Picker; Generate runs Tonight w/ system/tone/focus.
- **W2-T02** Delete Mode Picker (DOM `mode-picker`, JS `ModePicker`). First-run check: `if (!firstRunComplete) FrontDoor.open()`. **DONE WHEN:** no ModePicker refs; front door first-run only; returning users w/ ≥1 realm see dashboard.
- **W2-T03** Show PDF preview INLINE in Tonight results (`_renderResults` ~7196). iframe srcdoc / styled div. + "Download as PDF" button. **DONE WHEN:** results show summary + polished PDF preview + download btn.
- **W2-T04** Tonight results CTAs: Save as Realm / Export PDF / Run Another. Save as Realm = modal asks Realm name (pre-filled from AI nation name), persists nation, inscribes Strong Start + hooks + secrets as Session 1, opens dashboard. **DONE WHEN:** all 3 CTAs work end-to-end.
- **W2-T05** Empty-state copy on every panel (Spec 7.10). **DONE WHEN:** every empty state has copy + button.
- **W2-T06** Ember theme form input pass (Spec 7.4). **DONE WHEN:** every form input visible w/ focus state; nothing vanishes.
- **W2-T07** Restore GM tools in Ember. DECISION: add "GM Tools" section to WorldShell left panel (`wms-lp`), shown when GM Mode on. Move 9 GM actions (Strong Start, Quick NPC, What's at Stake, Session Prep, Proclamation, News, Letter, Glossary, Names). Delete old `.gm-toolbar` DOM + the `display:none !important` rule (~335). **DONE WHEN:** GM Mode reveals GM Tools section; all 9 buttons work.
- **W2-T08** Loading screen tells differentiation story — rotating taglines every 5s (PDF / world-remembers / latest Sonnet). **DONE WHEN:** loading cycles taglines.
- **W2-T09** System selector wired to prompts (Spec 7.8). Save system on Realm. **DONE WHEN:** D&D5e→CR/AC/HP NPCs; Daggerheart→Difficulty+tactic; Generic→no stat blocks.
- **W2-T10** Simplify `applyTheme` (WorldShell only; move `.chronicle-band` DOM into a WorldShell row). **DONE WHEN:** WorldShell only layout; old `.main-row` permanently hidden.

## 5. WEEK 3 — PROFESSIONAL FEEL (8 tasks)
- **W3-T01** Inline markdown renderer for chat (Spec 7.5). AI messages → markdown; user messages → plain text. **DONE WHEN:** bold/italic/headers/bullets render; no XSS; no library.
- **W3-T02** 3-variant Strong Start (Spec 7.6). **DONE WHEN:** 3 stacked cards w/ Pick/Regenerate; pick inserts active.
- **W3-T03** 3-variant Quick NPC. **DONE WHEN:** 3 NPC cards; pick adds to characters, others discarded.
- **W3-T04** Parallelize Tonight steps 2&3 via `Promise.all` (`Tonight._run` ~7140). **DONE WHEN:** ~30% faster; both outputs arrive together.
- **W3-T05** "Show context" toggle on chat messages (`<details>` w/ system + world context). `Copilot.send` must store `_systemPrompt` + `_userContext`. **DONE WHEN:** every assistant msg has working toggle.
- **W3-T06** Retry indicator UI — toast "Connection hiccup — retrying in 2s". **DONE WHEN:** simulated 429 shows toast then succeeds.
- **W3-T07** Conversation context cap: `messages=[systemMsg, ...slice(-20)]`. Old turns stay in UI scrollback. **DONE WHEN:** 50+ turn convo sends only ~20 turns.
- **W3-T08** `[STATE_A]`/`[STATE_B]` Realm picker (dropdowns of existing Realms, see Spec 7.3). **DONE WHEN:** r77 opens 2 Realm dropdowns.

## 6. WEEK 4 — SELLABLE (8 tasks)
- **W4-T01** Lemon Squeezy product setup (Spec 7.2). **DONE WHEN:** test purchase fires webhook → Worker generates key → emails buyer.
- **W4-T02** License activation flow in app. Settings "License" section, paste key, POST `/api/license/activate` w/ `machineId` (localStorage `rw_machine_id`), store `rw_license_token`, set `licenseTier`. **DONE WHEN:** valid key activates; 4th machine rejected "max activations reached".
- **W4-T03** License-token verification on startup — Ed25519 verify via embedded public key (Web Crypto `crypto.subtle.verify`), set `licenseValid`. **DONE WHEN:** licensed user no watermark; tampered token fails → free-tier fallback.
- **W4-T04** Storefront page (separate `storefront.html`): hero 30s loop video, what-you-get 3 cols, $29 pricing w/ 3 checkmarks, try-free link, demo video, FAQ (max 6), footer. **DONE WHEN:** live, Buy→Lemon Squeezy, Try Demo→web demo.
- **W4-T05** Web demo deployment (Cloudflare Pages/Netlify). Confirm WORKER_URL, free-tier-only. **DONE WHEN:** anyone runs 3 gens no signup, sees upgrade CTA after 4th.
- **W4-T06** Watermark on free-tier PDFs ("Made with RealmWright — get the full version at realmwright.app"). **DONE WHEN:** free PDFs have footer; licensed don't.
- **W4-T07** Build Electron desktop app. No asar encryption (accepted crackable). Sign if budget. Embed WORKER_URL. Auto-update via electron-updater if feasible. Outputs: .exe / .dmg / .AppImage. **DONE WHEN:** 3-platform builds exist; one tested install activates a license.
- **W4-T08** Launch checklist (Lemon Squeezy live, Worker tested, web demo live+rate-limit-tested, signed desktop builds on LS+Itch, storefront live, ≥5 starter templates [defer ok], privacy+terms pages, 30-day refund policy, r/DMAcademy + r/Solo_Roleplaying posts drafted, 1 GM YouTuber contacted).

---

## 7. CROSS-CUTTING SPECS (key implementation details)
- **7.1 Cloudflare Worker:** Workers + KV (free tier). Constants `FREE_TIER_LIMIT=3`, `MAX_ACTIVATIONS=3`. KV namespaces FREE_TIER, LICENSES. Secrets: OPENROUTER_KEY, LICENSE_SIGNING_KEY (Ed25519 priv), LEMONSQUEEZY_WEBHOOK_SECRET. Endpoints: `/api/free/tonight` (quota-check, increment BEFORE call to prevent abort-abuse, 90-day KV TTL, proxies to OpenRouter w/ `anthropic/claude-sonnet-latest`, max_tokens 1800), `/api/license/activate` (re-activation returns existing token; >3 → 403), `/api/license/verify`, `/api/webhook/lemonsqueezy` (HMAC-SHA256 sig verify, order_created → generateLicenseKey `RW-XXXX-XXXX-XXXX-XXXX` omitting I/O/0/1). License token = base64url(JSON payload) + '.' + base64url(Ed25519 sig). Free up to 100k req/day.
- **7.2 Lemon Squeezy:** Single Payment $29, note Variant ID → `VARIANT_TO_TIER`, webhook `order_created`, order email includes `{{custom.license_key}}`, 30-day refund. Itch.io secondary channel.
- **7.3 Unified prompt mechanism:** AUTO_VARS = STATE, CHRONICLE_LAST_5, CHRONICLE_FULL, FACTIONS, CHARACTERS, NATION_NAME, ERA, STATUS, YEAR, GOVERNMENT. `detectRequiredVars()` (regex `\[([A-Z_]+)\]` minus auto). `isRealmVar` = STATE_A/B/C → dropdown of nations. `runPrompt(pid, destination)` ('auto'/'api'/'clipboard'): fill modal → resolveVars → substitute user vars → `SAFETY_PREAMBLE + filledTpl + CANON_SUFFIX` → API (`Copilot.sendUserText`) or clipboard. Replace `Interact.fillAndCopy` with `runPrompt(pid,'clipboard')`; add "Send via Copilot" btn = `runPrompt(pid,'api')`.
- **7.4 Ember theme overrides:** scoped CSS for `.form-input/select/textarea` (bg rgba(255,185,100,0.04), border 0.22, focus ember #ffb964), `.btn--primary/secondary/tertiary`, card surfaces (#1a130c), hairline borders, checkboxes (accent ember).
- **7.5 Inline markdown renderer:** `renderMarkdown(text)` — escape HTML FIRST, then fenced code, inline code, headers ###/##/#, bold ** __, italic * _, lists -/*, paragraphs on \n\n. Only inserts allowlisted tags (no script/a/img/attrs) → XSS-safe. Applied to assistant messages only.
- **7.6 3-variant pattern:** system prompt requests `{"variants":[...]}` JSON, `response_format:{type:'json_object'}`, count=3. UI: 3 variant cards w/ Pick + Regenerate (regen calls count:1 for that slot). Applied to Strong Start, Quick NPC, individual hooks.
- **7.7 Ollama detection:** `detectOllamaModels()` GET `{baseUrl}/v1/models` (default http://localhost:11434), returns status ok/no_models/not_running. Best-model heuristic: llama3.1 > llama3 > qwen2.5 > mistral > else. Save disabled if not ok.
- **7.8 System-aware prompts:** `SYSTEM_PREPENDS` for dnd5e (CR/AC/HP/DC), pf2e (Level/AC/HP/saves), daggerheart (Difficulty/trait/tactic, Hope/Fear), generic (no stats), other (light). Stored `DEFAULT_SETTINGS.gameSystem='generic'`; realm-level `nation.gameSystem` overrides.
- **7.9 Front door:** fixed fullscreen z-9000, `⌘` mark, title, tagline "What are you running tonight?", textarea, 3 selectors (System=select dnd5e/pf2e/daggerheart/generic[selected]/other; Tone pills gritty/heroic[sel]/weird/dark; Focus pills balanced[sel]/mystery/faction/character/military), Generate button, "I already have a Realm" link. `FrontDoor.open/close/_wireEvents/_generate` → saves gameSystem, sets firstRunComplete, calls `Tonight.openWith(situation,{focus,tone,length})`.
- **7.10 Empty-state copy bank:** specific copy + button for Hooks, Secrets, Fronts, Locations, Bestiary, Characters, Sessions, Relations, Chronicle, Factions (full text in source lines 2647–2686).

## 8. DEFER LIST (NOT in v1.0 — do not build)
8-prompt refactor; faction→factionId UUID migration for hooks; full conversation context auto-mgmt (cap at 20 is enough); undo memory structural diffs; mobile responsive layout; community starter templates (v1.1, ship after launch); conversation threading; cross-nation search; voice; visual relationship graph; Foundry/Roll20 export; fractional-year no-op; typeColor stale comment.

## 10. ESCALATION PROTOCOL
- Proceed w/o asking: naming, equivalent implementations, minor CSS, error wording, internal data structures, anything in the doc.
- Ask Hunter: contradicting a locked decision; spending money; changing positioning; new third-party service; a bug in the framework itself.

## 11. THE TWO TRUE DIFFERENTIATORS (the whole commercial bet)
1. **Printable PDF session pack** — polished, typeset, table-ready. Surface relentlessly (inline preview, storefront hero, default next step).
2. **The return-path loop** — stats feed AI → AI canon writes back to stats → world breathes. Make visible (dashboard "AI is aware of these pressures", loading tagline, demo video).
> If a feature doesn't reinforce one of these two, stop and ask if it belongs in v1.0.

---

## 12. KEY AUDIT FINDINGS FROM v16 (the "why" behind tasks — useful for product audit)
**Release-blockers found in v16:**
- Default OpenRouter slug `anthropic/claude-sonnet-4-5` returns 404 (OpenRouter uses dots, e.g. claude-sonnet-4.5). Hits 100% of users.
- Opus pricing wrong by 3x ([15,75] vs actual [5,25]).
- CANON parser accepts `Artifact:` but system prompt never emits it (dead branch).

**Security:**
- Plain-text API key in `State.data.meta.settings.copilotKey`, mirrored to IDB + localStorage. Snapshots (7 retained) each contain a copy → rotating key leaves old copies.
- `Utils.escHtml` (~3454) does textContent→innerHTML; does NOT escape quotes → XSS in attribute contexts. 116 innerHTML usages. `handleImport` (~5687) has no schema validation.

**UX/product problems (the core insight across 4 audits):**
- The "modes" are theatre: Tonight=real, Campaign=just sets gmMode=true, World=same dashboard. In Ember (default) gmMode does nothing visible (gm-toolbar display:none). 3 modes = really 2 = really 1.
- 4 vaporware nav items (Grimoire/Atlas/Legions/Chronicle) only show "coming in v1.1" toast.
- Pressures feed AI context but UI gives no signal they do anything ("AI is aware of this" hint missing).
- No user-facing theme picker; themes only switchable via console `window.__rwSetTheme`.
- Copilot is a slide-out panel, not a mode — but users expect to find it.
- 3 right-edge surfaces fight for space: Arsenal (in-flow 296px), Copilot (fixed z-11 420px), sc-panels (fixed z-7000 480px) — they hide each other. Fix: Strategist nav drives CENTER column, not overlays.
- Ember theme half-done: form inputs invisible against body bg; CSS var names lie (--color-parchment is near-black in Ember). Overrides only scoped to `.modal`.
- 8 GM tools invisible in default Ember theme. Chronicle band (signature visual) hidden in Ember.
- No mobile layout (WorldShell min ~836px).
- ~80–100 interactive surfaces visible in first 3 seconds = cognitive overload. Target ~7±2.

**The fundamental positioning insight (M1):** RealmWright = two products fighting in one app. (A) artist's worldbuilding sandbox (nation stat sliders: Legitimacy, Corruption, Opposition, Food Production, Trade, Raw Materials, Manpower, Knowledge, Cohesion, Urbanization) vs (B) GM session-prep tool (Tonight Mode, generators). Nation-stat abstraction does NOT match what 80% of GMs want for tonight's session. RESOLUTION: lead with session tool (front door), world engine = power feature behind one click.

**5 conversion gates identified:** (1) time-to-first-wow broken [10min + signup] → free-tier worker; (2) system match → selector; (3) PDF output excellent but invisible → surface; (4) first-impression 80 surfaces → front door; (5) price-to-value illegible.

**Anti-piracy decision (rejected & chosen):**
- [REJECTED] IP-binding scheme (Hunter's original idea) — locks out legit users (dynamic IPs, CGNAT in Bangladesh, VPNs, travel, mobile). ~27% false-positive rate cited. IP signal too noisy.
- [REJECTED] HTML obfuscation/asar encryption — crackable in ~15min; not worth 40hrs.
- [CHOSEN] License key + 3-activation limit (Ed25519 signed token, offline verify, no IP/HWID), + make legit version genuinely better (free messages, updates, Discord, templates, cloud backup), + watermark on free tier. Accept ~20–40% piracy as marketing channel.

## 13. OPEN/DECIDED ITEMS & HUNTER'S SPECIFIC NOTES
- Price: $29 (Hunter chose over suggested $19). LOCKED.
- Tiers: settled on 2 (free + $29). Studio $59 proposed then cut.
- Free demo = uses Hunter's API key for 3 Tonight generations (Hunter clarified "demo people can use my api key to see how well the product is" — NOT pricing tiers).
- Ollama concern (Hunter): "if user picks wrong Ollama model/version & it fails, they'll blame RealmWright." Solution: detect via `/v1/models`, never let user type a slug → product can't be blamed.
- Prompts must be BOTH copy-pasteable AND API-callable.
- Sonnet "most updated version" should be default + recommended → `anthropic/claude-sonnet-latest`.
- Two Worker prerequisites Hunter must do: Cloudflare signup + `wrangler login`; Lemon Squeezy signup. Back up the Ed25519 private key (losing it makes all licenses unverifiable).

---
## NEXT (for the product audit)
When the product file arrives, verify against: all 23 locked decisions, the 38 W#-T## tasks' DONE-WHEN criteria, the 10 specs, the 2 differentiators being surfaced, and the DELETE list actually being removed. URL-3 is described as "about the product" — likely the build/audit of what the implementing AI produced.
