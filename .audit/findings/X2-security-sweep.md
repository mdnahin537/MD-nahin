# X2 — Consolidated Security Sweep (whole-file, OWASP/STRIDE lens)

Target: `6b9eaae1-relamwrith_V7.HTML` (1.08 MB, 17,864 lines). This is the WHOLE-FILE synthesis
on top of the per-module security points already found (X2a, C01, C04-*, C05-6, C08a). It does **not**
re-report those; it (a) closes out the full innerHTML-sink sweep the spot-check deferred, (b) proves the
import / prototype-pollution / AI-tool-call questions in Node, and (c) adds the cross-cutting findings
nobody filed yet (SRI, CSP blast-radius, license forge-`valid:true`).

**Headline:** the render, import, and AI-tool layers are genuinely well-defended — the full sink sweep
found **zero unescaped user/AI/imported HTML sink**. The residual security debt is *structural*, not a
live XSS hole: a hand-rolled fallback sanitizer is shipped instead of real DOMPurify, there is no SRI on
the two CDN `<script>`/font loads, the CSP is intentionally weakened by `'unsafe-inline'`, and the entire
license check is client-trusting (forgeable `valid:true`). Severity is dominated by the licensing/money
angle, which is already partly covered by C04-*.

---

## METHODOLOGY (what was actually run)

- Enumerated **all 188** matches of `innerHTML|outerHTML|insertAdjacentHTML|document.write|.html(|eval(|new Function|setHTML`.
- Wrote a Python scanner over every HTML sink to extract each `${…}` interpolation and flag any not wrapped
  in `E(`/`Utils.escHtml(`/`escHtml(`/`Markdown.render(`/`this._h(`. **20 lines** flagged; all 20 manually
  triaged to safe (numbers, ternaries selecting `' selected'`, or vars pre-built with `escHtml`).
- Reduced to **raw member-access** interpolations (`${x.y}`) in sinks: only 9, all numeric or proven-static
  (see X2-1).
- Reduced to **raw id/name/title attribute** interpolations in sinks: **0**.
- Ran `node` to prove: escHtml neutralizes element- and attribute-breakout payloads; spread/`{...}` merge in
  `buildNationFromSeed` + `migrateIfNeeded` does **not** pollute `Object.prototype`.
- Confirmed **no** `eval`, `new Function`, `document.write`, or string-arg `setTimeout/setInterval` anywhere.
- Read the license protocol (5 `credentials:'include'` POSTs), the AI fetch headers, `Secrets`, the demo
  proxy, and `_executeTool`.

---

## ✅ CLEARED BY THIS SWEEP (whole-file evidence — do not re-flag as XSS)

- **Every HTML sink that emits user/AI/imported data escapes it.** The render code is disciplined: ids go
  through `const id=E(...)` before interpolation; entity names/descriptions go through `E()`/`Utils.escHtml`;
  assistant text goes through `Markdown.render` (escape-first + sanitize); user text uses `textContent`.
  The campaign-prep render (clocks/beats/npcs/secrets, L11585–11667), the snapshot-diff (L16820/16828 —
  items pre-escaped at source L7063/7064), the Foundry export (`_h()` on every field), and the relationship-web
  detail (L15410–15416, all `E()`) are all clean.
- **No prototype pollution** in the import/migrate/canon paths — they use spread (`{...f}`, `{...DEFAULT,...attacker}`)
  and static property assignment only; no recursive bracket-assignment deep-merge. Proven in Node (below).
- **No dynamic code execution** — zero `eval`/`new Function`/`document.write`.
- **AI tool-calling is safe** — `_executeTool` (L9599) is a hardcoded `if(name===…)` whitelist of 4 read +
  6 write tools; writes are scope-gated (`scope!=='full'` blocks), proposal-built, CLAMP-validated, undoable.
  No model-supplied string maps to an arbitrary function.
- **OpenRouter key isolation holds at whole-file scope** — the `Bearer ${copilotKey}` header is sent **only**
  to the hardcoded `https://openrouter.ai/...` URL (L10117/10449); the Ollama branch sends no auth header;
  `_stateForPersist` (L6604) strips `copilotKey` from every IDB/localStorage sink; `exportJSON` excludes
  `meta` entirely. (The one real leak — AutoSave file backup — is already C05-6.)

---

## FINDINGS

### X2-1: Full innerHTML-sink sweep — no unescaped user/AI/imported sink (the priority question, answered)
- tag: SECURITY | severity: POLISH (informational — confirms safety) | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: 188 sinks file-wide; raw member-access interpolations at L5453, L7796, L8575, L8717, L9774, L14291
- evidence (the only 9 raw `${x.y}` interpolations in any sink, all numeric/static):
  `L5453 ${e.time} ${e.label} ${e.inputTokens} ${e.outputTokens}` · `L7796 ${chars.length}` ·
  `L8575 ${e.year}` · `L8717 ${failures.length}` · `L9774 ${queue.length}` · `L14291 ${nat.currentYear}`
- observed/why: This is the headline answer to "does user/AI/imported data reach an HTML sink without
  escaping?" — **No.** Every one of the 9 raw interpolations is either a `.length`/count, a formatted time
  (`hh:mm` built from `Date`), a year that has passed `CLAMP.year()` (returns a clamped Number 1–99999, so
  always numeric — verified at L5867 / build path L6352), or `e.label` which is **only ever** assigned one of
  six hardcoded literals (`'Solo Oracle'`, `'Scene Pivot'`, `'Mood Shift'`, `'Conversation Summary'`,
  `'Copilot Chat'`, `…+' (retry)'` / `' (~est)'` — all `_pendingLabel=` sites are static, L5106/5154/5200/
  10346/10528/11100). Nothing user/AI-controlled reaches a sink unescaped. X2a's "no CRITICAL XSS" verdict
  now holds at **whole-file** scope, not just the markdown spot-check.
- fix: none required. (Optional hardening: wrap `e.label`/`this._fmtModel(e.model)` at L5453 in `E()` so a
  future refactor that lets a dynamic label through can't regress into XSS — defense-in-depth only.)

### X2-2: No Subresource Integrity (SRI) on the Turnstile script or Google Fonts — CDN supply-chain exposure
- tag: SECURITY | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L3200 (`<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer>`),
  L52–53 (Google Fonts `<link rel="stylesheet">`), L50–51 (`preconnect`)
- evidence:
  `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`
- observed/why: The only two third-party loads in the app — Turnstile's JS and Google Fonts CSS — have **no
  `integrity=` hash and no `crossorigin`**. If `challenges.cloudflare.com` served malicious JS (CDN compromise,
  BGP/DNS hijack, or a state-level MITM on the embedding itch.io player), it would execute with full page
  privileges. The CSP whitelists that exact host in `script-src` **and** allows `'unsafe-inline'`, so a
  compromised Turnstile bundle is not contained by CSP at all — it can read the in-memory `copilotKey`, the
  license token, and the entire IndexedDB world. Turnstile's `api.js` is genuinely hard to SRI-pin (Cloudflare
  rotates it), which is exactly why it's the realistic weak link; Google Fonts CSS is also unpinnable but
  lower-impact (style only). This is the single largest *external* attack surface in an otherwise self-contained
  file.
- fix: Accept that Turnstile/Fonts can't be hash-pinned, but (a) add `crossorigin="anonymous"` to both so a
  compromised response at least can't read cross-origin data it shouldn't, and (b) treat the un-pinnable
  Turnstile load as the reason to keep the CSP `connect-src` tight (it already is) and to **not** widen
  `script-src` further. Document the residual risk in the ship checklist. Genuinely removing it means
  self-hosting the Turnstile challenge, which Cloudflare does not support — so this is a "known and minimised",
  not "fixed", item.

### X2-3: License verdict is client-trusting — a forged `{valid:true}` / local edit fully bypasses the paywall
- tag: SECURITY | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: yes (Worker behaviour) | builds on C04-1, C04-4
- where: L6124, L6138, L6152 (`this._data...valid:true` / `this._data.valid=!!json.valid`), L6134
  (`if(!json.valid)`), L9371 (`hasKey` gate), `LicenseGate.isActive()` call sites
- evidence:
  `this._data={key,instanceId:null,platform:'itchio',activatedAt:Date.now(),valid:true};` (L6138)
  `this._data.valid=!!json.valid; await IDB.set(IDB_KEY_LICENSE,this._data);` (L6152)
- observed/why: The app is a single client-side HTML file; the gate is whatever `this._data.valid` /
  `LicenseGate.isActive()` returns in the browser. Three independent, zero-skill bypasses exist: (1) edit the
  downloaded HTML so `_activateItchio`/`_backgroundValidate` hardcodes `valid:true`; (2) run a local
  intercepting proxy and answer `/verify` and `/api/license/validate` with `{"valid":true,"activated":true}`
  — the client trusts the JSON verbatim with no signature/nonce check; (3) seed IndexedDB `rw_license` with
  `{valid:true}` directly via DevTools. There is **no cryptographic binding** (no signed token verified
  client-side, no server-rendered gating) — the device-token is opaque and only checked by the Worker, which
  the bypasser simply never talks to. STRIDE: **Tampering + Elevation** (free → paid) and, because
  `_backgroundValidate` writes whatever the response says, **Spoofing** of the server. This is the economic
  core of the product and is structurally unenforceable in a pure client app. It compounds C04-1 (a transient
  500 self-revokes a *real* license) — so the honest user is punished by a server blip while the attacker
  trivially forges success.
- fix: A single-file client app cannot truly enforce licensing; accept that and decide the posture
  deliberately. Minimum bar worth doing: have the Worker return a **short-TTL signed token** (e.g. JWT/HMAC)
  and verify the signature client-side before trusting `valid` — this stops the naive proxy-forgery (attacker
  can't mint a valid signature) even though it can't stop someone editing the HTML. Gate the genuinely valuable
  server-side capability (the **demo `/api/demo/generate` proxy that spends the owner's OpenRouter credits**)
  on the same signed token so a forged client can't burn the owner's money — that endpoint is the one place
  where a license bypass costs Hunter real cash.

### X2-4: `credentials:'include'` on all 5 license endpoints — CSRF surface on the state-changing ones
- tag: SECURITY | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: yes (Worker CORS/cookie policy)
- where: L6050, L6114, L6132, L6149 (activate/verify/validate), L6071/6167 (deactivate via `LicenseQueue.retryPost`)
- evidence:
  `const res=await fetch(WORKER_URL+'/api/license/activate',{method:'POST',headers:…,credentials:'include',body});`
- observed/why: Every license call sends ambient cookies cross-origin to the Worker. If the Worker
  authenticates state-changing actions (notably **deactivate**, which frees a device slot) by cookie alone and
  echoes a permissive `Access-Control-Allow-Origin` + `Allow-Credentials:true`, then any web page the user
  visits could POST `/api/license/deactivate` in the background and silently burn the victim's activation
  (DoS on a paid license, or device-cap exhaustion). The risk lives entirely in the Worker's CORS/cookie
  config, which is out of this file — but the client's unconditional `credentials:'include'` is what exposes
  it. Note the device-token path (`_persistDeviceToken`/`_readDeviceToken`) suggests token auth exists; if so,
  cookies may be unnecessary here and dropping `credentials:'include'` would shrink the surface for free.
- fix: Confirm the Worker requires the `X-Device-Token` (or a CSRF token) for deactivate/activate and does
  **not** rely on the cookie alone; restrict `Access-Control-Allow-Origin` to the itch.io/app origins (never
  `*` with credentials). If the device-token in the body/header is the real authenticator, drop
  `credentials:'include'` from these fetches entirely. (Related: C04-3 already notes `_hdr()` never actually
  sends `X-Device-Token` despite its comment — fixing that and dropping cookies is the clean end-state.)

### X2-5: Response-replay / tampering on `_backgroundValidate` has no integrity check
- tag: SECURITY | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: yes | overlaps C04-1
- where: L6148–6154
- evidence:
  `const json=await res.json(); … this._data.valid=!!json.valid; await IDB.set(IDB_KEY_LICENSE,this._data);
   if(wasValid&&!json.valid)document.dispatchEvent(new CustomEvent('license:expired'));`
- observed/why: The background re-validation trusts the response body with no nonce, timestamp, or signature.
  Two-way exposure: an **attacker** on the network (or the user's own proxy) can replay/forge `{valid:true}`
  to keep a revoked license alive indefinitely; conversely a **MITM** can inject `{valid:false}` to brick a
  paying customer's app (it persists `valid:false` to IDB and fires `license:expired`). Combined with C04-1
  (missing `res.ok` check), even an unauthenticated `500`/empty body flips the bit. There is no replay
  protection because there is no signed, time-bound assertion to replay-protect.
- fix: Same signed-token mechanism as X2-3: have the Worker sign `{valid, exp, key_hash}`; the client verifies
  signature + freshness (`exp`) before writing `_data.valid`. Until then, at minimum require `res.ok` before
  trusting the body (the C04-1 fix), so transient/forged non-200s can't flip a license either direction.

### X2-6: CSP is real and good — but `script-src 'unsafe-inline'` means it is NOT the XSS backstop; the escape layer is
- tag: SECURITY | severity: LOW (posture clarification) | confidence: HIGH | NEEDS-LIVE-VERIFY: no | relates to X2a-1
- where: L43 (the CSP `<meta http-equiv>`); author's own honest comment L22–25
- evidence:
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com` … and the comment:
  `HONEST POSTURE: unsafe-inline means an injected inline <script> would still execute. The real protection
   here is DOMPurify on every untrusted-string innerHTML sink, NOT CSP.`
- observed/why: Worth stating plainly for the synthesis: because `'unsafe-inline'` is present (forced by the
  single-file/itch.io constraint), the CSP would **not** stop a stored-XSS if one existed — injected markup's
  inline event handlers (`onerror=`, `onclick=`) execute freely. So the app's entire XSS defense rests on the
  escape-first render layer + the sanitizer. Two facts make that *currently* fine but *fragile*: (a) this
  sweep proved the escape layer is complete (X2-1), and (b) the app ships the **fallback** sanitizer, not real
  DOMPurify (X2a-1). The blast radius of any *future* unescaped sink is therefore full account/world/key
  compromise with no CSP safety net. The CSP still earns its keep — `object-src 'none'`, `base-uri 'self'`,
  tight `connect-src` (exfil containment), and `frame-ancestors` (clickjacking) are all correct and valuable.
- fix: No change to the CSP itself (the constraints are real). Treat X2a-1 as **blocking for ship**: paste the
  official DOMPurify build before publishing, because it is the *actual* last line of defense, not the CSP.
  Long-term, moving off the single-file constraint (a build step that externalises the JS) would let
  `'unsafe-inline'` be dropped and convert the CSP into a genuine backstop.

### X2-7: Import path trusts arbitrary nested structure — data-integrity / safety-net gap (not a live XSS)
- tag: SECURITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8860 `handleImport`, L8824 file-load (`JSON.parse(ev.target.result)`), L6339 `buildNationFromSeed`
- evidence:
  `function handleImport(data){ if(!data||typeof data!=='object'||Array.isArray(data)){…} if(data.nation){
   if(typeof data.nation!=='object'){…} … const nation=buildNationFromSeed(data.nation); …`
- observed/why: `handleImport` validates only the **top-level** shape (object, has `nation`/`nations`). Every
  nested field of a shared `.json` world is then trusted and stored. This is **not** a code-exec or XSS hole —
  the render layer escapes everything (X2-1) and prototype pollution is inert (X2-8) — but it is a robustness/
  trust gap for a *shareable* file format: a hostile or corrupt world can carry absurd values (e.g. a 10 MB
  `description`, a `chronicle` of 100k entries, deeply nested junk) that survive import and degrade or hang the
  app on first render (DoS-by-content), and there's no schema/size ceiling. Given the product encourages
  sharing realms, "I imported a friend's world and the app froze" is a realistic trust-breaker.
- fix: Add a bounded validation pass in `handleImport` before `buildNationFromSeed`: cap array lengths and
  string sizes, drop unknown top-level keys, and reject files above a sane byte ceiling with a clear toast.
  The CLAMP helpers already exist for the scalar fields — extend the same discipline to lengths/counts.

---

## NODE PROOFS (actually executed)

```
PROOF1 escHtml(evil) = &lt;img src=x onerror=alert(document.cookie)&gt;
  -> contains live <img>? false
PROOF2 escHtml(attr-breakout) = &quot;&gt;&lt;script&gt;steal()&lt;/script&gt;
  -> contains unescaped quote/lt? false
PROOF3a Object.prototype.polluted AFTER spread = undefined        # buildNationFromSeed factions.map({...f})
PROOF3b Object.prototype.isAdmin AFTER merge  = undefined         # {...DEFAULT_SETTINGS, ...attackerSettings}
PROOF4  (hypothetical unsafe deep-merge) Object.prototype.pwned = 1   # the pattern migrate AVOIDS — shown for contrast
```

- **PROOF1/2** — `Utils.escHtml` (exact copy of L5845) fully neutralizes both element-injection and
  attribute-breakout payloads → every escaped sink is XSS-proof.
- **PROOF3a/b** — the two mutation patterns the import path actually uses (object spread on parsed JSON, and
  `{...DEFAULT,...attacker}` settings merge) leave `Object.prototype` untouched → **no prototype pollution**.
- **PROOF4** — a recursive bracket-assignment merge *would* pollute; shown only to confirm `migrateIfNeeded`
  uses no such pattern (it uses static assignment + spread exclusively, L6419–6553).

---

## SECURITY POSTURE

**Overall: B+ / "defensively built, with structural debt at the edges."** For a no-framework single-file
app, the core is unusually disciplined — the whole-file sink sweep found **zero** unescaped user/AI/imported
HTML sink, there is no dynamic code execution, prototype pollution is provably inert, the AI tool-caller is a
hardcoded scope-gated whitelist, and the OpenRouter key is structurally stripped from every persistence/export
path and only ever sent to OpenRouter. The risk is not a live XSS — it is three things at the perimeter: a
hand-rolled fallback sanitizer shipped in place of real DOMPurify, no integrity pinning on the CDN scripts,
and a license model that is client-trusting and therefore forgeable. **Top 3 must-fixes:** (1) **Paste the
real DOMPurify build before ship (X2a-1)** — it is the *actual* last line of XSS defense since CSP runs
`'unsafe-inline'`; (2) **Make the license verdict signature-verified and gate the credit-spending demo proxy
on it (X2-3/X2-5)** — today a forged `{valid:true}` or a local HTML edit bypasses the paywall and can burn
Hunter's OpenRouter credits; (3) **Lock down the `credentials:'include'` license endpoints' CORS/CSRF on the
Worker and add `crossorigin` to the un-pinnable CDN loads (X2-4/X2-2)**. None of these are live-exploitable
XSS in the current build; all three protect the money and the blast radius if any future sink regresses.
