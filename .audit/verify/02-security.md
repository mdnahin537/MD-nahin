# Verify 02 — Security & Money-Risk (verification of X2 / X2a / C05-6)

Verifier: senior app-sec, read-only pass over the LIVE source
`6b9eaae1-relamwrith_V7.HTML` (1.08 MB, 17,864 lines). Every claim below is quoted
from the file at the cited line, or proven with Node output pasted inline. The
Cloudflare Worker source is NOT in this file; Worker-side claims are tagged
`NEEDS-WORKER-SOURCE` and are not asserted as misconfigured.

---

### X2-3: License verdict is client-trusting — forged `{valid:true}` / local edit bypasses the paywall
- verdict: **CONFIRMED** (mechanism) but **OVERSTATED on impact / the money link is wrong**
- original grade: HIGH → **corrected: the bypass-the-app half is HIGH-confidence but LOW/MEDIUM business impact; the "burns Hunter's OpenRouter credits" half is FALSE as written.**
- proof:
  - The entire gate is a local boolean. `isActive()` reads only the persisted IDB record:
    `isActive(){return!!(this._data&&this._data.valid);}` @ L6092
    `async init(){try{const s=await IDB.get(IDB_KEY_LICENSE);this._data=s||null;}catch(e){this._data=null;} if(this._data)this._backgroundValidate(); …}` @ L6087–6091
  - The server response is trusted verbatim — no signature, nonce, or `res.ok` gate before writing the verdict:
    `const json=await res.json().catch(()=>({})); if(!json.valid){…} … this._data={key,instanceId:null,platform:'itchio',activatedAt:Date.now(),valid:true};` @ L6133–6138 (itch.io)
    `this._data.valid=!!json.valid; await IDB.set(IDB_KEY_LICENSE,this._data);` @ L6152 (background validate)
  - There is **no client-side crypto verification of any kind**: `grep -ac "crypto.subtle"` → `0`; the only `jwt/HMAC/signature` hits in the file are CSS comments and sample-realm prose, not code.
  - Node proof the IDB/DevTools edit unlocks the gate:
    ```
    --- LicenseGate.isActive (gates AutoSave + UI banner) ---
    forged IDB rw_license = {valid:true}   -> true
    forged IDB rw_license = {valid:1}       -> true
    no license at all (null)                -> false
    ```
  - **The correction (what X2-3 missed): `isActive()` gates almost nothing of value.** Its only real call sites are:
    - `tick(){ if(!LicenseGate.isActive())return; … }` @ L6261 — AutoSave file-backup (convenience, not the product).
    - `_updateStatusUI` @ L17322 / front-door Turnstile visibility @ L11273 — cosmetic "Licensed/Demo" label + banner.
  - **The actual AI value (Copilot + Tonight Mode) is gated by `Copilot.isConfigured()`, NOT the license:**
    `if(typeof Copilot!=='undefined'&&Copilot.isConfigured()){ …full Tonight Mode… }` @ L11337
    `isConfigured(){const s=State.data?.meta?.settings; if(!s)return false; if(s.copilotProvider==='ollama')return true; return !!(s.copilotKey&&s.copilotKey.length>10);}` @ L9366–9372
    Node proof:
    ```
    --- Copilot.isConfigured (gates the real AI: Tonight Mode/Copilot) ---
    ollama provider, NO key                 -> true
    openrouter + attacker BYO key           -> true
    openrouter, no key                      -> false
    ```
    So the AI features unlock on the user supplying **their own** OpenRouter key (or running Ollama) — they spend the *user's* money, never Hunter's. Forging `valid:true` does **not** grant free use of Hunter-funded AI.
- plain: Yes, anyone can flip a value in DevTools or edit the HTML and the app will say "Licensed" — that part is real and unfixable in a pure client file. But "Licensed" only turns on auto-backup and a label; the expensive AI runs on the user's own API key regardless, so a forged license does not let a freeloader spend Hunter's money. The original finding's headline that a forged license "can burn Hunter's OpenRouter credits" is wrong — that risk lives entirely in the demo proxy (next finding), which the license never gates.
- fix (real, reduced scope): if licensing is to mean anything, have the Worker return a short-TTL **HMAC/JWT-signed** verdict and verify the signature client-side before trusting `valid` (stops naive proxy-forgery, not HTML-editing). Lower priority than the original grade implies, because the paid AI is already BYO-key.

---

### OpenRouter credit-burn via demo proxy (`/api/demo/generate`) — money exposure
- verdict: **CONFIRMED (client side) + NEEDS-WORKER-SOURCE (the actual cap)**
- original grade: bundled into X2-3 HIGH → **corrected: this is the ONLY real "Hunter's wallet" path; client-side protection is essentially nil → the entire defense is the Worker.**
- proof:
  - The demo path spends Hunter's key (the browser never sees it — Worker holds it):
    `// Demo proxy — calls the Worker, which holds the OpenRouter key.` @ L6203–6204
    `async proxyRequest(messages,model){ if(!this._turnstileToken){return{error:'Please complete the captcha before generating.'};} … const res=await fetch(WORKER_URL+'/api/demo/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({turnstileToken:this._turnstileToken,messages,model:model||'anthropic/claude-haiku-latest'})}); …` @ L6229–6240
  - The **only** client-side gate is possession of a Turnstile token; there is **no `LicenseGate.isActive()` check** anywhere on the demo path (`_runDemoGeneration` @ L11363, `proxyRequest` @ L6229).
  - The client-side counter is self-admittedly cosmetic:
    `// DemoCounter is now a client-side UX hint only. Real enforcement lives in the Worker (per-IP daily cap in Cloudflare KV). Resetting rw_demo_uses in DevTools is harmless…` @ L6184–6186
    `hasKey(){return !!TURNSTILE_SITEKEY;}` @ L6194 — "demo available" is gated on a sitekey being present, not on any quota the client enforces.
  - `messages` and `model` are **caller-controlled** and sent to the Worker as-is (L6235–6239). A scripted client that solves/replays Turnstile and posts large `messages` with an expensive `model` is bounded **only** by whatever the Worker enforces.
  - **NEEDS-WORKER-SOURCE:** the per-IP daily cap, the max-tokens clamp, whether the Worker pins/overrides `model` (or trusts the client's `model`), whether it validates the Turnstile token server-side and rejects replays, and whether it rate-limits by token vs IP — none of that is in this file and cannot be verified here.
- plain: This is the one place a stranger can spend Hunter's actual AI money — by hitting the demo "generate" button (or scripting it). The app itself does almost nothing to stop abuse; it just makes you pass a captcha and shows a soft "previews left" counter you can reset for free. Everything that actually protects the wallet — the daily cap, the token ceiling, forcing a cheap model — lives in the Cloudflare Worker, which isn't in this file. So Hunter's exposure cannot be quantified without reading the Worker.
- fix (real): in the Worker (not this file) — verify the Turnstile token server-side and reject reuse; cap requests per IP **and** per token per day; **hard-override `model` to a cheap one server-side** (don't trust the client's `model`); clamp `max_tokens` and message size. In this file, the client is already correctly minimal (no key exposure) — no client change buys real protection.

---

### X2-4 / X2-5: `credentials:'include'` CSRF surface + response-replay on license endpoints
- verdict: **CONFIRMED (client behaviour only) — Worker policy is NEEDS-WORKER-SOURCE**
- original grade: MEDIUM (X2-4), MEDIUM (X2-5) → **kept MEDIUM, but reframed: what the client reveals is real; the exploitability is entirely a Worker-side question and must NOT be asserted without the Worker.**
- proof:
  - `credentials:'include'` is on all state-changing/validating calls (cookies sent cross-origin to the Worker):
    `const res=await fetch(WORKER_URL+'/verify',{method:'POST',headers:await this._hdr('application/json'),credentials:'include',body:JSON.stringify({key})});` @ L6132
    activate @ L6114, validate @ L6149, retry/deactivate path @ L6050 — all `credentials:'include'`.
  - **Confirms C04-3's note that `_hdr()` does NOT send `X-Device-Token`** despite the comment: the header builder is bare, and the token is only attached on the *retry-queue* path, not on the primary activate/verify/validate fetches:
    `async _hdr(ct){const h={Accept:'application/json'}; if(ct)h['Content-Type']=ct; return h;}` @ L6099–6103 (no token)
    vs. `if(tok)headers['X-Device-Token']=tok;` only inside `LicenseQueue.retryPost` @ L6047–6049.
    So the primary calls authenticate by **cookie alone** (client side) — which is exactly what makes the Worker's CORS/cookie policy the deciding factor.
  - X2-5 replay: the background validate trusts the body with no integrity/freshness check and persists it:
    `const json=await res.json(); const wasValid=this._data.valid; this._data.valid=!!json.valid; await IDB.set(IDB_KEY_LICENSE,this._data); if(wasValid&&!json.valid)document.dispatchEvent(new CustomEvent('license:expired'));` @ L6150–6154
    Note `res.json()` here has **no `.catch()`** (unlike activate at L6133) and there is **no `res.ok` gate** → a non-200/garbage body throws into the catch (logged, license left as-is); a forged 200 `{valid:false}` would brick a paying user, a forged 200 `{valid:true}` keeps a revoked one alive. This corroborates C04-1.
- plain: Every license call sends the user's cookies to Hunter's server. If the server trusts that cookie alone and is lax about which websites may call it, a random page the user visits could silently deactivate their license. The app's code shows the risky ingredient (cookies + no CSRF token on the main calls), but whether it's actually exploitable depends 100% on the Worker's CORS/cookie settings, which aren't here. Don't claim the Worker is broken without seeing it.
- fix (real): Worker-side — restrict `Access-Control-Allow-Origin` to the itch.io/app origins (never `*` with credentials) and require a CSRF/device token (not just the cookie) on deactivate/activate. Client-side — actually send `X-Device-Token` on the primary calls and drop `credentials:'include'` once the token is the authenticator; add `res.ok` before trusting any verdict body (the C04-1 fix).

---

### X2a-1: Ships the home-rolled FALLBACK sanitizer, not real DOMPurify
- verdict: **CONFIRMED**
- original grade: MEDIUM → **kept MEDIUM** (structural debt; low live-exploit odds because the markdown path escapes input first, but it IS the last line of defense given `'unsafe-inline'` CSP).
- proof:
  - The fallback ships and tags itself: `window.DOMPurify={sanitize:sanitize,version:'fallback'};` @ L3279; scaffold `/* ── PASTE DOMPURIFY HERE — BEGIN ── */` @ L3223 with the comment "It is strictly weaker than the real DOMPurify and MUST be replaced before public release." @ L3219–3220.
  - Reachable from AI-fed HTML, but behind escape-first: `Markdown.render` runs `escHtml` over the whole input first, then routes the rendered HTML through the sanitizer **only if loaded**:
    `return (typeof DOMPurify!=='undefined'&&DOMPurify.sanitize) ? DOMPurify.sanitize(s,{ALLOWED_URI_REGEXP:/^(?:https?|mailto|tel|#|\/):/i}) : s;` @ L5922–5924
  - **Two concrete gaps vs real DOMPurify, both Node-proven:**
    ```
    PROOF A — config (_cfg / ALLOWED_URI_REGEXP) referenced in sanitize body? false
      -> Markdown passes /^(?:https?|mailto|tel|#|\/):/i but it is a dead no-op.
    PROOF B — ALLOWED_ATTRS keeps "id"? true | keeps "class"? true
    ```
    (a) The `{ALLOWED_URI_REGEXP:…}` config Markdown hands it is **silently ignored** — `sanitize(dirty,_cfg)` @ L3273 never reads `_cfg`. (b) `id` is in `ALLOWED_ATTRS` @ L3233 → DOM-clobbering surface in an app that leans on `getElementById`.
  - What it does get right (so this is MEDIUM, not HIGH): its own `SAFE_URI` blocks the dangerous schemes —
    ```
      SAFE_URI "javascript:alert(1)" -> false   SAFE_URI "vbscript:msgbox(1)" -> false
      SAFE_URI "data:text/html,<script>x" -> false   (data:image/* allowed for <img> only)
    ```
  - The residual real risk (mXSS / parser-differential bypass) is the known weakness of any hand-rolled DOMParser cleaner vs DOMPurify's mutation-aware engine — **NEEDS-BROWSER** to demonstrate a concrete payload; cannot be shown in Node (no DOM).
- plain: The app ships a do-it-yourself HTML cleaner with a sticky note saying "swap me for the real DOMPurify before launch." Today the AI text is escaped before it ever reaches the cleaner, so there's no live hole, but the cleaner is the only safety net if any future code forgets to escape — and it's weaker than the real thing (it allows `id`, and it ignores the URL-filter settings the app thinks it's applying).
- fix (real): paste the official DOMPurify 3.x minified build into the scaffolded block before ship (the one-line swap is already designed in). If staying on the fallback: drop `id` from `ALLOWED_ATTRS` (L3233) and actually honor the passed `ALLOWED_URI_REGEXP`.

---

### X2-2: No Subresource Integrity (SRI) on CDN script/font loads
- verdict: **CONFIRMED**
- original grade: MEDIUM → **kept MEDIUM** (Turnstile JS is the meaningful one; can't be hash-pinned, but the finding is accurate as stated).
- proof:
  - `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` @ L3200 — no `integrity=`, no `crossorigin`.
  - Google Fonts stylesheets @ L52–53 — no `integrity=`, no `crossorigin` on the `<link rel="stylesheet">` (the `crossorigin` at L51 is only on the gstatic `preconnect`, not the stylesheet).
  - The CSP whitelists that exact Turnstile host in `script-src` **and** carries `'unsafe-inline'`:
    `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; …` @ L43
    → a compromised Turnstile bundle executes with full page privileges and is **not** contained by CSP; it could read the in-memory `copilotKey`, the license record, and the whole IndexedDB world. This is the single largest *external* surface in an otherwise self-contained file.
- plain: The two outside files the app loads (Cloudflare's captcha script and Google Fonts) aren't integrity-checked, so if Cloudflare's CDN were compromised or hijacked, attacker JS would run with full access to everything in the page, including the API key. Turnstile genuinely can't be hash-pinned (Cloudflare rotates it), so this is "minimise and document," not "fix."
- fix (real): add `crossorigin="anonymous"` to both loads; keep `connect-src` tight; do not widen `script-src`; document the un-pinnable Turnstile load as accepted residual risk in the ship checklist.

---

### X2-7: Import path lacks size/shape bounds (data-integrity / DoS-by-content)
- verdict: **CONFIRMED**
- original grade: LOW → **kept LOW** (not XSS/code-exec — the render layer escapes everything; it's a robustness gap for a shareable file format).
- proof:
  - `handleImport` validates only the top level, then trusts every nested field:
    `function handleImport(data){ if(!data||typeof data!=='object'||Array.isArray(data)){…return;} if(data.nation){ if(typeof data.nation!=='object'){…return;} … const nation=buildNationFromSeed(data.nation); State.addNation(nation);Render.all(); … } else if(data.nations&&Array.isArray(data.nations)){ … data.nations.forEach(…) … } …}` @ L8860–8876
    No byte ceiling, no array-length caps, no string-length caps, no unknown-key stripping.
  - The file-load paths also do **not** check `f.size` before `readAsText`:
    `const r=new FileReader();r.onload=ev=>{try{const data=JSON.parse(ev.target.result);handleImport(data);}catch(e){alert('Invalid JSON file.');}}; r.readAsText(f);` @ L8824–8825 (mirrored @ L16348–16349, L16612–16613)
  - There ARE bounds, but only on individual scalar fields downstream (CLAMP in `buildNationFromSeed`) and migration is lossless (C05-7) — neither caps array counts or total payload size, so the finding stands.
- plain: When you import a shared world file, the app checks it's roughly the right shape and then trusts the rest. A hostile or corrupt file with, say, a 10 MB description or 100k chronicle entries would import and could freeze the app on first render. Not a hacking hole — a "my friend's world crashed my app" trust problem, which matters because the product encourages sharing.
- fix (real): add a bounded validation pass in `handleImport` before `buildNationFromSeed` — reject files over a sane byte ceiling, cap array lengths and string sizes, drop unknown top-level keys, with a clear toast.

---

### C05-6: API key written into the AutoSave / file-backup (not scrubbed)
- verdict: **CONFIRMED** (and the runtime presence of the key in `settings` is now proven, closing the one open question)
- original grade: MEDIUM → **kept MEDIUM** (real plaintext-key-to-disk path; offline file, not network — so MEDIUM not HIGH).
- proof:
  - Persistence sinks scrub the key via `_stateForPersist()`:
    `function _stateForPersist(){ const d=State.data; if(!d)return d; const settings=d.meta?.settings; if(!settings||settings.copilotKey==null)return d; return {...d,meta:{...d.meta,settings:{...settings,copilotKey:null}}}; }` @ L6604–6612 — used by IDB STORAGE_KEY @ L6731 and the localStorage mirror @ L6752; snapshot path also nulls it @ L7016.
  - **AutoSave does NOT** — both the file-handle write and the fallback download serialize raw `State.data`:
    `const writable=await this._handle.createWritable(); await writable.write(JSON.stringify(State.data,null,2)); await writable.close();` @ L6301–6303
    `const blob=new Blob([JSON.stringify(State.data,null,2)],{type:'application/json'});` @ L6318
  - **The open question from 1A — is `copilotKey` actually live in `settings` at runtime? — is YES.** On load the key is read from its dedicated secret store and assigned back into `settings` so OpenRouter calls work:
    `const cold=await Secrets.loadKey(); if(cold)this.data.meta.settings.copilotKey=cold;` @ L6637–6638
    `const stored=await Secrets.loadKey(); … this.data.meta.settings.copilotKey=stored;` @ L6664–6666
    Therefore `State.data.meta.settings.copilotKey` holds the plaintext key in memory, and AutoSave writes it to the `.json` backup on disk / in Downloads.
  - AutoSave only runs for `isActive()` users (L6261) — i.e. licensed users with their own key set; that is exactly the population whose key leaks.
- plain: The app works hard to keep your OpenRouter API key out of browser storage, but the auto-backup feature dumps the entire in-memory state — key included — into the `.json` file it saves to your disk. So your secret key sits in plaintext in your backup/Downloads file. The rest of the secret-handling design is undermined by this one path.
- fix (real): have AutoSave serialize `_stateForPersist()` (or a key-scrubbed clone), identical to the IDB/snapshot paths — change `JSON.stringify(State.data,…)` to `JSON.stringify(_stateForPersist(),…)` at L6302 and L6318.

---

## Summary

Counts by verdict (7 findings assessed):
- **CONFIRMED:** 4 — X2a-1 (fallback sanitizer), X2-2 (no SRI), X2-7 (import bounds), C05-6 (key in backup).
- **CONFIRMED + NEEDS-WORKER-SOURCE:** 2 — the demo credit-burn path (client side confirmed, the cap is Worker-only); X2-4/X2-5 (client behaviour confirmed, exploitability is Worker-only).
- **CONFIRMED-mechanism but OVERSTATED:** 1 — X2-3 (the bypass is real, but it unlocks near-nothing of value and does NOT burn Hunter's credits).
- **FALSE-POSITIVE:** 0. **KILLED:** 0.

Corrected grades: X2-3's *business* severity drops from HIGH toward LOW/MEDIUM (gates only auto-backup + a label; the paid AI is BYO-key). The demo credit-burn is broken out of X2-3 as the *only* genuine "Hunter's wallet" exposure and is HIGH-impact-but-unquantifiable-here. All others retained their original grades.

### Money exposure

**(a) Someone using the paid app for free:** Trivial and unfixable in a single client file — edit the HTML or set IDB `rw_license={valid:true}` in DevTools (Node-proven) and `isActive()` returns true. **But this buys almost nothing**: `isActive()` only enables the auto-backup-to-disk convenience and flips a "Licensed" label/banner (L6261, L11273, L17322). The actual product value — the AI Copilot and Tonight Mode — is gated by `Copilot.isConfigured()` (L9366), which requires the user's **own** OpenRouter key or a local Ollama instance (L11337). So a freeloader who forges the license still has to bring and pay for their own AI. The realistic worst case for free-riding is "loses the paywall on convenience features," not "gets the expensive product for free." This is the single most important correction to the prior audit: the license bypass is real but the impact was significantly overstated, and the "forged license burns Hunter's credits" claim is **wrong**.

**(b) Someone burning Hunter's OpenRouter/API credits:** The **only** path that spends Hunter's money is the demo proxy `/api/demo/generate` (L6203–6248), and the license never gates it. Client-side protection is effectively nil: the sole gate is holding a Turnstile token, the local "previews left" counter is self-described as a cosmetic hint (L6184), and the `messages`/`model` are caller-controlled and forwarded as-is (L6235–6239). Therefore **Hunter's wallet exposure reduces ENTIRELY to the Cloudflare Worker's enforcement** — the per-IP/per-token daily cap, server-side Turnstile verification + replay rejection, a server-side hard-override of `model` to a cheap one, and a `max_tokens`/message-size clamp. **None of that is in this file (NEEDS-WORKER-SOURCE).** If the Worker enforces a tight per-IP cap with a pinned cheap model, exposure is bounded to roughly (cap × cheap-model cost) per IP per day; if the Worker trusts the client's `model`/`messages` or only soft-checks Turnstile, a scripted attacker could run up real cost. **This cannot be settled without the Worker source** — it is the one finding where the whole answer lives outside this file.

Also Worker-dependent and unsettleable here: whether the `credentials:'include'` license endpoints (X2-4) are CSRF-exploitable (depends on the Worker's `Access-Control-Allow-Origin`/cookie policy) and whether forged `{valid:true}` survives a real validate call (X2-5 — depends on the Worker, though it's moot for money given (a)).
