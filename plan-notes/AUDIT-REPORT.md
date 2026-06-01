# RealmWright v1.0 — Product Audit Report

> Product audited: `index_pp.html` (14,852 lines, 950 KB) — the frontend built per URL-2's FINAL plan.
> Method: structural grep index → 4 parallel deep subagent sweeps (security, Copilot/Solo, failure modes, feature-completeness) → my own verification of the licensing crux + reconciliation of contested findings → **live behavioral execution** in headless Chromium.
> Evidence is `file:line`. Findings marked **[EXECUTED]** were proven by running the code, not just reading it.
> Scope note: this upload is the **frontend only**. The 8 Worker `.ts` files were NOT provided, so backend behavior is 🔵 needs-Worker/live for the two ship-blockers.

---

## HEADLINE VERDICT

**The product is far more feature-complete than URL-3's review implied.** URL-3 only audited the backend/licensing layer and never reported that the core features exist — they do, and most match the plan well: front door, Solo Mode, the Copilot **tool-calling agent** (the plan's "biggest miss" — actually built and correctly scope-gated), Sample Mode (real 10–15KB scenarios), Encounter Builder, NPC plot seeds, Foundry export, schema migration, 3-variant generation, parallel Tonight, transparency log, cost meter, markdown, masked key. Play Mode correctly absent. The app **boots clean with no JS errors** and the front door renders exactly to spec. **[EXECUTED]**

**But it is not shippable as-is.** Two backend ship-blockers (from URL-3) remain valid, plus a confirmed **live security stub** (DOMPurify), a real **data-loss window**, **no AI-call timeout**, and a cluster of correctness/plan-deviation bugs. The builder's own "Ship-blockers: None" is wrong.

---

## A. SHIP-BLOCKERS (must fix before publish)

**SB-1 — Worker deploy breaks itch.io + demo.** 🔵 (Worker not in this upload, but frontend confirms the dependency.) Frontend routes through one `WORKER_URL='https://rw-license.realmwright.workers.dev'` (line 3769): `_activateItchio` POSTs to `/verify` (4916), `Demo.proxyRequest` POSTs to `/api/demo/generate` (5016). URL-3 found both are 501 stubs in the shipped Worker. If true, itch.io activation returns "Could not reach validation server" (4926) and demo returns "Demo request failed" (5029) for every user. **Fix: one merged Worker with real `/verify` + `/api/demo/generate`; deploy once; curl all 5 routes.**

**SB-2 — No paywall (missing product_id check).** `LS_PRODUCT_ID=''` (line 3768) is **empty** and used only in a blank-guard (3777). `_activateLS` (4892) checks `json.activated` but **never** verifies `product_id`/`store_id` from the response. → any Lemon Squeezy key from any product unlocks RealmWright. **Fix: Worker must reject activations where `meta.product_id` ≠ the real id; and the id must actually be set.** 🔵 needs Worker, but the empty constant is confirmed here.

---

## B. HIGH SEVERITY

**H-1 — DOMPurify is the fallback stub, confirmed live. [EXECUTED]** In the running app `DOMPurify.version === 'fallback'` (stub block lines 2395–2453; real-lib note at 2377). It's wired into only ONE path — `Markdown.render` (4704). Every other innerHTML sink relies on the quote-blind `escHtml`. The plan calls this "load-bearing for the BYO-key safety story." **Fix: paste real DOMPurify 3.4.5 (note still says 3.2.4).**

**H-2 — Systemic attribute-injection XSS via quote-blind `escHtml`.** `Utils.escHtml` (line 4638) = `_escDiv.textContent=s;return _escDiv.innerHTML` — escapes `<>&` only, **NOT `"` or `'`**. Element-context uses are safe (~115 of them), but every `attr="${escHtml(x)}"` with user/AI-controlled `x` is exploitable. Confirmed dangerous sinks: `value="${escHtml(n.capital)}"` (6556), `title="${escHtml(s.description)}"` (6596), `<option value="${E(faction/location.name)}">` (10737/10742/10805/10816), `data-qid="${it.id}"` with **no escaping at all** (8406), aria-label with title (9775), many `data-*` attribute interpolations (10248–10543). Combined with H-1, a single injection reads `State.data.meta.settings.copilotKey` / IDB `rw_secret_copilot_key` and exfiltrates via the CSP-allowed `connect-src openrouter`. **Fix: add a quote-escaping `escAttr` for all attribute interpolation + ship real DOMPurify.**

**H-3 — No timeout on any AI call.** `_apiFetch` (8869) attaches `signal` only if a caller passes one; there is no `AbortController` timer. The only timeout in the file is an 800ms Ollama probe (13724). A hung OpenRouter socket spins the loader **forever** with no recovery. The plan's "network timeout" error case is unimplemented. **Fix: AbortController with ~30s timeout on all generation calls.**

**H-4 — Orphan reaper can silently delete paying customers' devices.** 🔵 (Worker) URL-3: LS License API caps 60 req/min; the fortnightly cron validates every instance per license, and a 429/500 with a JSON body isn't a thrown error → treated as `valid:false` → healthy device reaped. The frontend `LicenseQueue` (4800-4865) is well-built, but the reaper risk lives in the Worker. **Fix: treat any non-`valid:true` (esp. 429) as skip-don't-reap.**

---

## C. MEDIUM SEVERITY

**M-1 — Data-loss window: `beforeunload` doesn't flush persist.** The handler (14548) only warns about unsaved *textarea text*; it does **not** flush the 400ms debounced state write (`persist`, 5494). Close within 400ms of a stat edit → edit lost. (URL-1 W1-T02 intended a flush.) **Fix: call `State.persistNow()` in the unload handler.**

**M-2 — Imported core stats are not range-clamped.** `buildNationFromSeed` clamps custom stats (5190) but takes core stats raw (5172). An imported/AI `legitimacy:9999` flows into `Compute.stability` → garbage percentages. `handleImport` (7524) validates only object shape, not ranges/enums. **Fix: clamp core stats; validate on import.**

**M-3 — `importFromText` skips era-enum validation.** (9042) validates only `name`+`stats`; an AI `era:"Mythic"` (off the 8-value list) silently falls back, breaking era-keyed logic. **Fix: coerce to nearest valid enum or reject.**

**M-4 — Demo Turnstile field-name mismatch.** Frontend sends `turnstileToken` (camelCase, 5020); URL-3 read the Worker contract as `turnstile_token` (snake_case). → demo silently fails the captcha, or runs ungated against Hunter's key. 🔵 confirm Worker side. **Fix: align field names.**

**M-5 — Device cap bypassable (KV race).** 🔵 (Worker) Cloudflare KV has no atomic CAS; parallel activations all pass `<3`. Doc claims "cannot be bypassed" = false. **Fix: use Lemon Squeezy's native `license_activation_limit` instead of the KV device subsystem.**

**M-6 — Fake faction "Loyalty" bar.** CSS (774-777) hardcodes fill width per status enum: ally 85% / neutral 55% / wary 38% / hostile 18%. No numeric loyalty value exists in the data model — every "ally" shows identical 85%. A gauge that isn't measuring anything. **Fix: make it data-driven or stop drawing it as a percentage.**

**M-7 — Event-category colors not colorblind-safe.** Two greens (social `#6db89e` L144 / diplomatic `#80a868` L145) and two golds (economic `#a89030` L142 / natural `#b89058` L146); no shape redundancy for event categories (the B4 fix added glyphs only to faction loyalty). Red-green colorblind collapses each pair. **Fix: extend shape/label redundancy to event categories.**

**M-8 — Era-tint collision.** Ember `--era-tint-1: rgba(255,185,100,0.06)` (155) and `--era-tint-2: rgba(255,185,100,0.10)` (156) are the **same hue**, differing only in opacity → adjacent chronicle eras visually indistinguishable. (Eras 3,4 use distinct hues, fine.) **Fix: give era-2 a distinct hue.**

**M-9 — `_apiFetch` has no retry on 429/5xx.** Only the license queue retries; AI calls surface a transient 503 as a hard error. (URL-1 W3 specified one retry + backoff.) **Fix: one retry on 429/5xx.**

**M-10 — `persistNow` swallows total save failure.** (5520) `try{IDB.set}catch(e){}` + localStorage both empty-catch with no UI signal; if both fail (quota/private mode) the user believes work saved. **Fix: surface a failure toast.**

---

## D. PLAN DEVIATIONS (built ≠ planned)

- **DEV-1 — Both Lemon Squeezy AND itch.io implemented.** Platform auto-detect by key format (4875-4877): UUID→LS, else→itchio. URL-2 FINAL said **Itch.io primary, LS not used in v1.0.** This dual path is the root cause of SB-1. 🟡
- **DEV-2 — Price.** No `$19`/`$29` string in the HTML (pricing lives on the storefront, not the app), so unverifiable here. URL-3 reported the build at **$29**; URL-2 locked **$19**. 🔵 confirm on storefront.
- **DEV-3 — Worker is heavy (8 files + KV device subsystem).** URL-2 said keep it minimal, "don't move logic to the Worker." 🟡
- **DEV-4 — Artifact CANON branch kept, not deleted.** Live at 7072 (`else if(c.type==='artifact'){n.artifacts.push(...)}`), rendered at 7803. URL-1 W1-T07 said **delete** it; the builder implemented artifacts instead. 🟡 (arguably an improvement, but contradicts the locked decision.)
- **DEV-5 — Scene Pivot generator doesn't match its signature spec.** The wedge feature's creativity-forcer: prompt `so2` (4007) does CALM/MID/HARD chaos escalation, NOT the planned three kinds (faction unseen 5+ sessions / active NPC not seen recently / unresolved hook). The targeting rules that make it special are **absent**, and it only feeds the last-5 chronicle (no faction/NPC/hook recency data). ⚠️ This dilutes the wedge.
- **DEV-6 — Oracle results don't auto-log to chronicle.** `askOracle` writes only to `n.oracleLog` (4124/4189), never `n.chronicle`. Plan said oracle answers auto-log to chronicle tagged "Oracle". ⚠️
- **DEV-7 — Oracle prompt only *softly* discourages inventing entities** (so1, 4006: "invent only what the world permits") vs plan's "forbid inventing new entities." Minor.
- **DEV-8 — Encounter Builder missing party-size + region inputs and the d20 random-encounter table.** Has difficulty/pace/tone/factions and a context-aware prompt (3979), but G3 table is absent. ⚠️ partial.
- **DEV-9 — Multi-realm picker (Gap 23) missing** from the header. ⚠️
- **DEV-10 — `__rwSetTheme`/`__rwClearDevTheme` survive** (14561-14566) — neutered (only 'ember') but URL-1 said delete. Minor 🟡.
- **DEV-11 — Front-door DEMO result shows only an "Activate" CTA**, not Save-as-Realm/Export-PDF/Run-Another. (The full CTAs DO exist in Tonight Mode results — "Keep this realm" at 10070 — so the conversion mechanic is present for licensed users.) ⚠️ demo-path only.

---

## E. WHAT'S DONE WELL (verified)
- **Copilot tool-calling agent** — scope gate correctly enforced server-side in dispatch (8284: standard scope blocks `update_faction_stance`/`update_nation_stat`); `copilotAutoApply` default false correctly queues proposals for human approval (8290-8305); stream tool-call accumulator handles fragmented deltas correctly (8694-8714). This was the plan's "biggest miss" — it's actually built and safe. ✅
- **Schema migration** (5203-5326) forward-only, additive, non-destructive. ✅
- **Snapshot key-stripping** (5775) nulls `copilotKey` in clones; key also scrubbed from the persisted/exported blob. ✅
- **Model slugs** all `-latest` aliases; `claude-sonnet-4-5` fully gone. ✅
- **CANON parser** hardened for format drift (unicode dashes, parentheticals, fences, `Name +5` vs `Name: +5`) — 6969-6991. ✅ (still flags in-block prose as failures, minor.)
- **AI-JSON parser** `_apiFetchJson` (8916-8949): raw→fence-strip→brace-slice→retry. ✅ (3 sibling parsers lack the retry — minor.)
- **Sample Mode** scenarios are real content (13KB/10KB/15KB). **[EXECUTED]** ✅
- **Front door** renders exactly to spec; app boots with zero JS errors. **[EXECUTED]** ✅
- 3-variant generation, parallel Tonight (9960), transparency log + cost meter, masked key + one-click delete, Foundry export, Ollama detect, 20-turn auto-summarize, empty states, loading taglines — all present. ✅

---

## F. LOWER SEVERITY / POLISH
- L-1 `STATUS_GLYPH[sc]` unguarded (11500/11514) → renders "undefined" for unknown status. `||''` fixes.
- L-2 Year-advance hardcodes Earth's 365.25 calendar (10313) — wrong for a fictional-worldbuilding tool; comment's reasoning is backwards (math gives 0.9993, survives only via rounding). **[EXECUTED: 365/365.25=0.9993→round 1.0]**
- L-3 Herald mode-ring hardcodes hex (11708) instead of design tokens; conveys state by color alone.
- L-4 CSP `frame-ancestors` delivered via `<meta>` is ignored by browsers (**[EXECUTED]** console warning) → clickjacking directive non-functional; must be an HTTP header.
- L-5 Tool args: `delta`/`weight` unbounded (clamp saves the stored stat but proposal summaries can show nonsense). No-op writes (unchanged faction stance/stat) still create undo entries.
- L-6 Re-importing the same JSON mints fresh ids → silent duplicate realms.
- L-7 `theme-manuscript`/`theme-modern` only survive in a `classList.remove` cleanup call (13814) — effectively gone for users.

---

## G. KNOWN LIMITS OF THIS AUDIT
- **Backend (8 Worker `.ts` files) not provided.** SB-1, SB-2, H-4, M-4, M-5 are confirmed from the frontend's dependencies + URL-3's Worker read, but the live Worker behavior needs Hunter's repo + a deploy test.
- **Live AI / license / demo flows** need real OpenRouter + Turnstile + LS/itch keys (this sandbox blocks them) → 🔵.
- Storefront/privacy/FAQ pages not in this file → DEV-2 price unverified here.

## H. FIX PRIORITY (ranked)
1. SB-2 product_id check (no paywall) — Worker, small, absolute.
2. SB-1 merge Worker so `/verify`+`/demo` are real — Worker, deploy once, test 5 routes.
3. H-1 real DOMPurify 3.4.5 + H-2 `escAttr` for attribute sinks — the BYO-key safety story.
4. H-3 AI-call timeout (AbortController).
5. M-4 Turnstile field name + verify demo quota before any anon user (wallet).
6. H-4 reaper hardening / M-5 use LS native activation limit.
7. M-1 beforeunload flush; M-2/M-3 import clamping+enum validation.
8. DEV-5/DEV-6 restore Scene Pivot targeting + oracle→chronicle logging (the wedge).
9. Color/UI: M-6 loyalty bar, M-7 event colors, M-8 era tint; then L-* polish.
