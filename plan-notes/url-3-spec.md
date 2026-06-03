# URL-3 SPEC — Review of the BUILT product (post-build audit)

> Source: Claude.ai conversation (docx, ~5K tokens, 91 lines). Dated May 24 (today). The "medium" conversation.
> Nature: Hunter uploaded `realmwrightshipready.zip` — the product **built by another AI per URL-2's plan** — and asked Claude to "ultrathink on it." Claude audited `index.html` (**14,852 lines**), **8 Worker files**, and both planning docs (SHIP_READINESS.md, PLAN.md). Two audit rounds (2nd after web research).
> This is NOT the plan — it's a REVIEW of the deliverable. It is one auditor's slice (heavily backend/licensing/visual-bug focused). It does NOT verify feature completeness against URL-1/URL-2 — that's the gap I must fill when I get the product itself.

---

## 0. WHAT THE BUILT PRODUCT IS (observed facts from the review)
- **`index.html` = 14,852 lines** (v16 was ~11,200 → grew ~3,600 lines; consistent with added features). Single-file frontend.
- **8 Worker files** under `worker/src/`: includes `license.ts`, `itch.ts`, `demo.ts`, `fingerprint.ts`, `ratelimit.ts`, `cors.ts` (+2). NOT the "~150 line minimal Worker" URL-2 mandated.
- Planning docs shipped in the zip: **SHIP_READINESS.md** (claims "9/10 PASS", "Ship-blockers found: None") and **PLAN.md**.
- An `artifacts/run-verification.sh` script + Playwright-based verification harness.
- `WORKER_URL = 'https://rw-license.realmwright.workers.dev'` — single hostname for all backend routes.

## 0.1 ⚠️ PLAN-DEVIATIONS visible in the build (cross-ref to my URL-1/URL-2 specs)
These confirm the failure mode I predicted — the builder followed URL-1 where URL-2 had overridden it:
- **Lemon Squeezy is implemented** (`LS_PRODUCT_ID`, LS activate/validate/deactivate routes). But URL-2 FINAL said **Itch.io primary, Lemon Squeezy NOT used in v1.0.** The build has BOTH LS and itch.io (`/verify`) license paths — a direct echo of the unresolved URL-1↔URL-2 conflict.
- **Price appears to be $29** (review repeatedly says "$29 one-time product" / "your $29 app for free"). URL-2 FINAL said **$19 flat.** $29 was URL-1's number → builder used the superseded price.
- **Worker is heavy** (8 files, custom KV device-cap subsystem, fingerprinting). URL-2 said keep it MINIMAL (~150 lines, license + demo only) and explicitly warned "don't move logic to the Worker." The build reinvented device-limiting in KV instead of using the platform's native limit.
- **Electron:** review doesn't mention any Electron/binary — appears to be the web app (good, matches URL-2).

---

## 1. THE TWO HARD SHIP-BLOCKERS (review's headline findings)

### Ship-blocker #1 — Deploying the documented Worker KILLS demo + itch.io
- Frontend routes 5 things through the single `WORKER_URL`: `/api/license/activate`, `/validate`, `/deactivate` (Lemon Squeezy), `/verify` (itch.io), `/api/demo/generate` (free demo).
- In the shipped Worker, **`itch.ts` `/verify` and `demo.ts` `/api/demo/generate` are STUBS returning HTTP 501** ("not implemented in this build"). README hand-waves "the legacy Worker (Phase 5A) serves these in production."
- But: one Cloudflare hostname = one Worker. `wrangler.toml name="rw-license"` deploys to the SAME hostname the frontend points at. `npx wrangler deploy` (per the checklist) **overwrites** the legacy Worker. → itch.io customers: `/verify`→501→"Could not reach validation server" (primary channel dead, refunds). Free demo: 501→"Demo request failed" (onboarding hook dead). If legacy Worker is on a *different* host, the single `WORKER_URL` can't reach both → license routes 404.
- **"There is no version of 'deploy as instructed' that works."** Fix = merge real `/verify` + `/api/demo/generate` (OpenRouter key, Turnstile, per-IP quota) into one Worker, deploy once, test all 5 routes.

### Ship-blocker #2 — NO PAYWALL: missing product_id check
- LS docs: "verify that store_id, product_id... match... If you don't, someone using a license key from another Lemon Squeezy product could use it to get access to your product."
- `LS_PRODUCT_ID` appears in exactly 3 places: declaration + twice in a "is this field blank" startup guard. **It is NEVER compared against the activation response.** Neither frontend nor Worker checks `product_id`/`store_id`.
- → ANY Lemon Squeezy license key (from any of thousands of LS products) returns `activated:true`, Worker mints a device token, app unlocks. **A pirate buys any $1 LS product and gets RealmWright free.** "Monetization has a hole the size of the entire LS marketplace."
- Fix (in Worker, ~small): after `upstream.json.activated`, read `meta.product_id`/`store_id`, reject if ≠ hardcoded value (the dead `LS_PRODUCT_ID` constant).
- **SHIP_READINESS.md "Ship-blockers found: None" is FALSE — there are two.**

---

## 2. SERIOUS ISSUES (not blockers, but docs oversell them)
3. **3-device cap is bypassable.** `fingerprint.ts issueOrRefresh` does read→check `<cap`→push→write. Cloudflare KV has no atomic CAS + eventual consistency (+1 write/sec/key ceiling). Parallel activations all read "2", all pass, all write → 4-10 devices on a 3-device license. PLAN.md P1.3 "cap enforced server-side" is false; doc claims "cannot be bypassed" — false. Correct primitive = Durable Object (round-1) OR **delete KV device system entirely, use Lemon Squeezy's native `license_activation_limit`** (round-2, better — LS enforces atomically for free; the KV system doesn't even survive a storage wipe since token lives in same IndexedDB).
4. **Orphan reaper deletes legitimate devices** (HIGH severity). `reapOrphans` calls LS validate per instance; catch only catches thrown network errors — an LS HTTP 500/429 with JSON body isn't thrown, so `valid` falsy → healthy device reaped. LS License API caps **60 req/min**; past ~20 licenses the fortnightly cron blows the ceiling → 429 → mass false reaps + starves real users' activations. Silent scheduled data-loss. Fix: treat any non-`valid:true` as "skip, don't reap."
5. **"OpenRouter key out of localStorage" is hardening, not a fix.** P1.13 real (no more `JSON.parse(localStorage)` leak) but key still hydrated into `State.data.meta.settings.copilotKey` in memory + IndexedDB, readable by any script. XSS calls `Secrets.loadKey()`. DOMPurify is the real defense — currently a **fallback stub** (must paste real v3.4.5 build; 3.4.4 had mutation-XSS fix). Doc treats S8 "resolved"; it's mitigated.
6. **CORS misconfig.** `cors.ts` returns `Access-Control-Allow-Origin: null` + `Allow-Credentials: true` (flagged by every scanner). Mostly defanged (rw_device is SameSite=Strict; itch.io uses header-token path) but `pickOrigin` fallback returns first allowed origin on mismatch → Worker answers any non-browser client. "Worker is locked down" is not true.

## 3. DOCUMENT-INTEGRITY PROBLEMS
7. **Line numbers all wrong.** Docs say file is "14,479 lines"; it's **14,852** (373 longer). All "~line X" refs shifted (e.g., LS_PRODUCT_ID "~3610" is really 3768). Undermines trust in every line-referenced claim.
8. **Verification script can't run on Hunter's machine.** `artifacts/run-verification.sh` hardcodes `REPO="/home/user/MD-nahin"` + Playwright path `/opt/node22/...` (build-sandbox paths). Checklist step 9 fails immediately. Undocumented.
9. **"9 PASS" tested mostly the frontend in file:// mode.** Worker's only gate was `tsc --noEmit` (types compile, not behavior). Zero behavioral backend tests. License/demo/itch flow all in "Hunter does it manually" pile (H2, H3). The reassuring score covers the least-risky half; the risky half is untested.

## 4. WEB-RESEARCH CONFIRMATIONS (round 2)
- Cloudflare KV: official docs confirm "concurrent writes... overwriting one another", "not ideal for atomic operations", names Durable Objects as fix, 1-write/sec/key ceiling.
- LS License API: activate/validate/deactivate need NO API key (Worker comment correct) BUT rate-limited **60 req/min** (detonates reaper finding).
- **Wrangler syntax stale:** docs/README use `wrangler kv:namespace create` (colon) — deprecated at 3.60.0, gone in v4. Correct: `wrangler kv namespace create` (spaces). package.json pins `wrangler ^3.78.0`.
- DOMPurify: current 3.4.5 (not the "3.2.4" the inline note anchors to); 3.4.4 had mutation-XSS fix.
- **Cookie reality:** Worker on `rw-license.realmwright.workers.dev`, app on `realmwright.app` = different registrable domains → `rw_device` is third-party cookie + SameSite=Strict → browsers won't send it cross-site at all. Cookie path effectively DEAD; only X-Device-Token header (from IndexedDB) works (and IndexedDB wipes on clear-site-data).
- **Turnstile field mismatch:** frontend sends `turnstileToken` (camelCase, ~line 5018); demo.ts contract expects `turnstile_token` (snake_case). → demo silently fails captcha OR runs ungated (= uncapped OpenRouter on Hunter's key = bill risk).

## 5. PRODUCT BUGS / LOGIC / COLOR (review's deep-read findings)
- **Fake faction "Loyalty" bar.** CSS lines 774-777 hardcode fill width per status enum: ally=85%, neutral=55%, wary=38%, hostile=18%. No numeric loyalty value in the data model — it's a 4-position enum painted as a percentage gauge. Every "ally" shows identical 85%. "A UI element that lies." (Note: this is the SAME class of issue URL-1 flagged in v16 — the fractional-year no-op; the builder didn't fix the pattern.)
- **Year-advance leap-day logic backwards.** Line 10313: "1 year" passes `advanceDays=365`, divides by 365.25 = 0.9993 (not 1.0); only lands whole via aggressive round-to-2-decimals. Comment's reasoning is opposite of correct. Also hardcodes Earth's Julian calendar — wrong for a fictional-worldbuilding tool whose audience invents 300/400-day years.
- **Color — era band tints collide.** Ember theme lines 155-158: `--era-tint-1` and `--era-tint-2` same hue `rgba(255,185,100,…)`, differ only 6% vs 10% opacity on dark bg → adjacent chronicle eras indistinguishable. (Eras 3,4 blue/purple fine.)
- **Color — event categories not colorblind-safe.** 7 event types color-coded. "social" #6db89e vs "diplomatic" #80a868 = two greens; "economic" #a89030 vs "natural" #b89058 = two golds. Red-green colorblind → each pair collapses. B4 fix added shape redundancy to faction loyalty (glyph) but NOT to event categories (color-only). axe-core wouldn't catch (tests contrast, not hue-distinguishability).
- Line 11708: herald mode-ring hardcodes 4 hex (#8cd996,#ffb4ab,#ffb964,#73d1ff) instead of design tokens; conveys state by color alone.
- Line 11514: `${STATUS_GLYPH[sc]}` unguarded → renders literal "undefined" for unknown status. `|| ''` fixes. Representative of interpolation discipline across **163 innerHTML sinks** — "most escaped correctly, but most ≠ all, and that's where XSS hides."
- **GOOD:** AI-JSON parser (lines 8912-8928) is solid — raw parse → fence-strip → brace-slice → retry w/ stricter instruction. (This matches URL-1's structured-output-enforcement intent.)

## 6. RECOMMENDED FIX ORDER (review's)
1. Resolve Worker contradiction → ONE merged Worker (real `/verify` + `/api/demo/generate` + license.ts), deploy once, curl all 5 routes.
2. Verify demo quota + `turnstileToken` vs `turnstile_token` field name before any anon user (money on the line).
3. Paste real DOMPurify 3.4.5 (load-bearing for BYO-key safety).
4. Add `product_id` check in Worker (ship-blocker #2 — "without it you are giving the app away").
5. Harden orphan reaper: any non-`valid:true` (esp 429) = skip, don't reap.
6. Re-point verification script to relative paths; fix/delete wrong line numbers.
7. (Round 2) Consider deleting KV device system → use LS native activation limit.

---

## 7. CRITICAL CAVEAT FOR MY UPCOMING PRODUCT AUDIT
**This review covered ONLY a slice:** backend/licensing architecture, security, doc integrity, and a handful of visual/logic bugs. It did **NOT** verify whether the planned FEATURES were actually built:
- ❓ Solo Mode (Oracle / Scene Pivot / Mood Shift) — THE WEDGE, top priority — unverified here.
- ❓ Copilot tool-calling agent (Gap 1, "biggest miss") — unverified.
- ❓ Sample Mode (3 pre-baked scenarios) — unverified.
- ❓ Context-aware Encounter Builder — unverified.
- ❓ NPC plot seeds + Unresolved Hooks — unverified.
- ❓ Foundry VTT export — unverified.
- ❓ Front door / mobile gate / "what just happened" log / recent-gens panel — unverified.
- ❓ Schema migration, unified buildPrompt, 71-prompt context injection, 3-variant, parallel Tonight, markdown render, empty states — unverified.
- ❓ Which of the 25 gaps were addressed — unverified.

**When Hunter gives me the product (the ~1MB file), MY job is the feature-completeness audit URL-3 didn't do**: cross-check the actual `index.html` + Worker against `url-1-spec.md` and `url-2-spec.md`, line by line, marking ✅/⚠️/❌/🟡 with file:line evidence. URL-3's findings are confirmed starting points (the two ship-blockers, the LS-vs-Itch confusion, the $29-vs-$19 deviation, the fake loyalty bar, the color bugs) but the bigger question — "did it build the plan?" — is still open.
