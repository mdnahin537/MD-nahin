# C04 — Licensing / Demo / AutoSave (lines 5970–6556)

Target: `/root/.claude/uploads/c01e2694-58fb-4cef-99ea-42e4d95e9f1d/6b9eaae1-relamwrith_V7.HTML`
Modules: TERM_GM_MAP (5970), deviceFingerprint/token (5994), LicenseQueue (6026), LicenseGate (6085), DemoCounter (6187), Demo (6205), AutoSave (6251). Config: TURNSTILE_SITEKEY/`_siteKeyGuard` (4665/4669).

All module wiring verified by grep: every module is referenced/called. Pure logic (regex, retry loop, validate-flip, demo gate) extracted and run in Node — actual outputs pasted as proof.

---

### C04-1: Background validate silently revokes a paid license on any non-`{valid:true}` Worker response
- tag: BUG (also SECURITY/money) | severity: CRITICAL | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L6144–L6159 (`_backgroundValidate`), blast radius L6261, L17238–L17240
- evidence:
  ```
  const res=await fetch(WORKER_URL+'/api/license/validate',{...});
  const json=await res.json();                 // no res.ok check, no .catch
  const wasValid=this._data.valid;
  this._data.valid=!!json.valid;               // ANY response w/o valid:true => false
  await IDB.set(IDB_KEY_LICENSE,this._data);   // persisted
  if(wasValid&&!json.valid)document.dispatchEvent(new CustomEvent('license:expired'));
  ```
- observed/why: `_backgroundValidate` runs on **every** bootstrap for Lemon Squeezy licenses (L6089 → init). It never checks `res.ok` and trusts `json.valid`. Node proof:
  ```
  Worker down (throw)       : finalValid=true   (caught — OK)
  Worker 200 {valid:true}   : finalValid=true   (OK)
  Worker 200 {valid:false}  : finalValid=false  expired fired (intended)
  Worker 200 {} (empty)     : finalValid=false  expired fired  <-- BRICK
  Worker 5xx returns {error}: finalValid=false  expired fired  <-- BRICK
  ```
  So a transient 500/429/empty-body/deploy-blip — **any** parseable response that isn't exactly `{valid:true}` — flips a legitimately purchased license to invalid, **writes it to IndexedDB**, and fires `license:expired`. Result for a paying customer: a non-dismissible toast "license could not be verified, please re-activate" (L17239, duration `0`), status flips to "Demo" (L17321), and **AutoSave silently stops** (L6261 `if(!LicenseGate.isActive())return`) — they lose auto-backup without knowing. Contrast L6115/6133, which defensively use `res.json().catch(()=>({}))`; even that wouldn't save this path because `{}` still flips to false. This is the single most expensive bug in the chunk: a server hiccup revokes paid access and may panic users into re-activating (see C04-2).
- fix: Only downgrade on an *explicit* negative from a *successful* response: `if(!res.ok)return;` then `if(json.valid===false){ this._data.valid=false; ... } else if(json.valid===true){...}` — never treat missing/garbage `valid` as a revocation. Leave `_data.valid` untouched on ambiguous responses.

---

### C04-2: Double-activation risk — failed background-validate pushes user to re-activate, burning a device-cap slot
- tag: BUG | severity: HIGH | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L17238–L17240 (expired → re-activate CTA) → L17305 → L6104 `activate` → L6113 `/api/license/activate`
- evidence:
  ```
  document.addEventListener('license:expired',()=>{
    showToast('Your RealmWright license could not be verified. Please re-activate.',
      [{label:'Re-activate',handler:()=>this.openModal()}],0);
  });
  ```
- observed/why: When C04-1 wrongly fires `license:expired`, the user is told to re-activate. Re-activating calls `/api/license/activate` again with a fresh `instance_name:'RealmWright-'+Date.now()` (L6112) — a **new instance**, not a refresh of the existing one. Against a Lemon Squeezy per-device activation cap this consumes another slot for the *same* physical device. A user hitting a few server blips can exhaust their own device limit and then get a genuine "Device limit reached" (L6118), locking themselves out of the product they paid for. Activation is not idempotent per device because the client neither reuses the stored `instanceId` nor passes the device token on activate (see C04-5).
- fix: On re-activate, if `this._data.instanceId` exists, call `validate` (refresh) rather than minting a new instance; and/or have the Worker dedupe by device_token. Fixing C04-1 removes the false trigger that creates this in the first place.

---

### C04-3: `_hdr()` does NOT attach `X-Device-Token` despite its comment — device identity is missing on activate/validate in cookieless contexts
- tag: WIRING (also SECURITY) | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: yes
- where: L6096–L6103 (comment vs body); contrast L6047–L6049 (`retryPost` does it right)
- evidence:
  ```
  // ...Echoes the cached server-issued device_token as X-Device-Token so itch.io
  // iframes / file:// loads (where the HttpOnly cookie is not available) still
  // identify the same device.
  async _hdr(ct){
    const h={Accept:'application/json'};
    if(ct)h['Content-Type']=ct;
    return h;                       // <-- never reads/attaches the token
  },
  ```
  grep: `X-Device-Token` is attached only at L6049 (inside `LicenseQueue.retryPost`). `_hdr` callers — `_activateLS` (6114), `_activateItchio` (6132), `_backgroundValidate` (6149) — send no device token.
- observed/why: The comment promises the exact mechanism the architecture depends on (server-issued opaque token as device identity, L5994), specifically for itch.io iframes / `file://` where the HttpOnly cookie is blocked (L6008 acknowledges this). But the function body never calls `_readDeviceToken()` and never sets the header. So in precisely the cookieless contexts named, activate and validate carry **no device identity** — `credentials:'include'` is the only binding, and it is null there. The Worker cannot tie those calls to the right device; validate may misjudge device count, and the "source of truth" token is dead weight on the most important calls. Code does the opposite of its own documentation — a trap for the next maintainer.
- fix: Make `_hdr` async-read and attach the token, mirroring L6047–6049: `const tok=await _readDeviceToken(); if(tok)h['X-Device-Token']=tok;` (callers already `await this._hdr(...)`).

---

### C04-4: DEMO paywall is purely client-side; editing `rw_demo_uses` resets free previews
- tag: SECURITY | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: yes (Worker enforcement)
- where: L6187–L6201 (DemoCounter), gate at L11346 `DemoCounter.canUse()`, consume L11385
- evidence:
  ```
  async init(){const s=await IDB.get(IDB_KEY_DEMO_USES);this._uses=typeof s==='number'?s:0;}
  canUse(){return this.hasKey()&&this._uses<DEMO_MESSAGE_LIMIT;},   // DEMO_MESSAGE_LIMIT=5
  async consume(){this._uses++; ... await IDB.set(IDB_KEY_DEMO_USES,this._uses);},
  ```
  Node proof:
  ```
  attacker sets _uses=99    : canUse=false  left=0
  attacker sets _uses=-1000 : canUse=true   left=1005
  ```
- observed/why: `_uses` is read from IndexedDB key `rw_demo_uses`. **Realistic exploit:** open DevTools → `IDB.set('rw_demo_uses',0)` (or run `DemoCounter._uses=0` directly), and the local 5-preview cap resets indefinitely; `DemoCounter.consume()`/`canUse()` are also callable from console. The code's own comment (L6184) concedes this is "a client-side UX hint only" and claims the Worker enforces a per-IP daily cap. **That is the correct architecture for a $29 product** — full per-account server enforcement is out of scope/disproportionate. The residual risk: (a) the entire real gate is the Worker's `/api/demo/generate` per-IP KV cap, so it MUST actually reject past quota — needs live verification, since if the Worker is permissive the demo is free-for-all behind a Turnstile that bots routinely solve; (b) per-IP is trivially bypassed via VPN/mobile-data rotation. Acceptable for demo abuse, but don't represent the client counter as enforcement. Minor: negative `_uses` makes `left()` show nonsense ("1005 free previews left") if IDB is corrupted.
- fix: No client-side change needed for the cap itself. (1) Confirm the Worker hard-rejects after `DEMO_PER_IP_DAILY` and returns a clear error so the client message matches reality. (2) Clamp display: `left(){return Math.max(0,DEMO_MESSAGE_LIMIT-Math.max(0,this._uses));}`. (3) Optionally also trust `result.remaining_today` from the Worker (already returned, L11389) over the local counter.

---

### C04-5: `_backgroundValidate` only re-checks Lemon Squeezy — itch.io licenses are trusted forever locally
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L6145
- evidence:
  ```
  async _backgroundValidate(){
    if(!this._data||this._data.platform!=='lemonsqueezy')return;   // itch.io: never revalidated
  ```
- observed/why: Once an itch.io key is activated (L6130 `_activateItchio` → stored `valid:true`), it is **never** re-validated; the stored IDB record is trusted on every subsequent launch. A revoked/refunded itch.io key keeps full access on that device indefinitely. Whether that matters depends on whether itch.io keys are revocable in your model — but the asymmetry is undocumented and means itch.io and LS licenses have different revocation guarantees. Combined with C04-1, it's also ironic: the platform that *can't* be wrongly revoked (itch.io) is the safe one, while the platform that *is* re-checked (LS) is the one that bricks on a blip.
- fix: Decide intentionally. If itch.io keys are revocable, add a periodic re-verify against `/verify`; if not, add a comment stating the deliberate trust-on-first-activate policy so it isn't read as an oversight.

---

### C04-6: `deviceFingerprint()` and `IDB_KEY_FINGERPRINT` are defined but never used
- tag: DEAD | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5994–L6005 (`deviceFingerprint`), L4682 (`IDB_KEY_FINGERPRINT='rw_device_fp'`)
- evidence: grep across whole file — `deviceFingerprint(` appears only at its definition (L5999); `IDB_KEY_FINGERPRINT` appears only at its declaration (L4682). No callers.
- observed/why: The L5994 comment says the stub "is preserved only so migrated state referencing `deviceFingerprint` doesn't crash" — but nothing references it, and `IDB_KEY_FINGERPRINT` is likewise orphaned. Dead surface that implies a fingerprint subsystem that no longer exists. Low harm, but it misleads readers about how device identity works (which is actually the server token — see C04-3).
- fix: Delete `deviceFingerprint` and `IDB_KEY_FINGERPRINT`, or, if kept for legacy import shape, add a comment that it's intentionally unreferenced.

---

### C04-7: AutoSave "every 20 actions" actually counts undo-pushes, and reset state can lose data after activation
- tag: BUG | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: L6251–L6265 (`tick`, threshold 20), sole caller L6680–L6688 (`State.pushUndo`)
- evidence:
  ```
  tick(){
    if(!LicenseGate.isActive())return;
    if(State.data.meta?._sampleMode)return;
    this._counter++;
    if(this._counter%AUTO_SAVE_THRESHOLD===0)this._triggerSave();   // 20
  }
  // only caller:
  pushUndo(){ ... if(typeof AutoSave!=='undefined')AutoSave.tick(); }
  ```
- observed/why: Two data-loss windows. (1) `tick` is gated on `LicenseGate.isActive()`. While a license is (wrongly, per C04-1, or genuinely) inactive, `_counter` does **not** increment, but the modulo means once active again it can take up to 20 more undo-pushes before the first save — a fresh paying user can do ~19 meaningful edits before any auto-backup ever fires, and if the tab closes first, **everything since the last manual save is gone** (IndexedDB persists, but the File System backup the feature promises does not). (2) The counter only advances on `pushUndo`; operations that mutate `State.data` without pushing undo never count toward a backup. (3) `_promptPending` is set true on first prompt (L6269) and only cleared in `setupPicker` (L6287); if the user dismisses the toast without setting up backup, the prompt never re-appears for the rest of the session even after 40, 60, 100 actions — silent no-backup. The threshold semantics ("every 20 actions") are also a misnomer; it's "every 20 undo-eligible mutations."
- fix: (a) Trigger the first backup prompt earlier (e.g. counter===3) and re-raise periodically rather than once per session; (b) reset `_counter=0` on activation so the cadence is predictable; (c) rename/clarify the comment to "every N undo-eligible edits."

---

### C04-8: LicenseQueue only ever queues `deactivate`; activate/validate failures are not durably retried
- tag: BUG | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L6033 `push`, L6061–L6082 `drain` (only handles `action==='deactivate'`), only producer L6170
- evidence:
  ```
  for(const entry of arr){
    if(entry.action==='deactivate'&&entry.license_key&&entry.instance_id){...}
    // no branch for activate / validate
  }
  ```
  grep: `LicenseQueue.push` is called only once (L6170, in `deactivate`).
- observed/why: The Phase 1a comment (L6018–6024) frames the queue as a general "license retry queue" with backoff and startup drain. In practice it only ever carries deactivate. That's defensible (deactivate-leak is the worst case for the LS instance cap), but `drain` silently drops any entry whose `action` isn't `deactivate` — if someone later queues an activate it would attempt-count up to 10 and get discarded doing nothing (L6077). Retry loop semantics themselves are correct (Node proof: 4 total attempts with 1s/2s/4s backoff; 4xx≠408/429 short-circuits on attempt 1; success on 3rd stops). The gap is scope vs the comment, not the mechanics.
- fix: Either document that the queue is deactivate-only by design, or add explicit handling for other actions in `drain` so unknown entries are dropped immediately (with a log) instead of churning 10 attempts.

---

### C04-9: `_siteKeyGuard` only warns; empty `TURNSTILE_SITEKEY` silently disables the entire demo with no UI signal
- tag: CONFIG (boundary) | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L4665 (`TURNSTILE_SITEKEY=''`), L4669–L4676 (`_siteKeyGuard`), consumers L6194/6211, gate L11276/11346/11350
- evidence:
  ```
  const TURNSTILE_SITEKEY='';
  (function _siteKeyGuard(){
    if(location.protocol==='file:')return;
    if(!LS_PRODUCT_ID||!TURNSTILE_SITEKEY){
      console.error('[RealmWright] Missing site keys — license/demo disabled...');  // console only
    }
  })();
  ...
  hasKey(){return !!TURNSTILE_SITEKEY;},     // '' => false => demo entirely off
  ```
- observed/why: As shipped, `TURNSTILE_SITEKEY` is empty (intentional placeholder — CONFIG, not a bug per the rubric). Traced behavior with empty key: `DemoCounter.hasKey()` is false → `canUse()` false → `renderTurnstile` returns false → the front-door demo path never appears; `_handleGenerate` falls to the `else` branch (L11354) and routes everyone to Activate. **Activation itself still works** (it doesn't depend on the sitekey — `_activateLS`/`_activateItchio` never reference it), so an empty key does NOT brick activation. The flag: the only signal that the demo is dead is a single `console.error` that no end user sees, and it's suppressed on `file://` (the itch.io desktop bundle case). If Hunter ships a public build with the key still blank, the "free preview" funnel — the main top-of-funnel conversion mechanism for a $29 product — is silently absent and nobody is alerted. The guard exists but is too quiet to prevent the costliest config mistake.
- fix: This is a fill-in-the-value config. Harden the guard so a *public* build with blank keys fails visibly (e.g., disable the "Generate session" button with a build-error tooltip, or show a dev-only banner) instead of only `console.error`. Keep `file://` silent.

---

### C04-10: Demo error path resets Turnstile twice; minor wasted work / possible fl/CLS flicker
- tag: QUALITY | severity: POLISH | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L11380–L11382 vs L6242–L6244
- evidence:
  ```
  // Demo.proxyRequest, on every return path:
  this._turnstileToken=null;
  if(this._turnstileWidgetId!==null&&window.turnstile){...turnstile.reset(...);}
  ...
  // caller _runDemoGeneration, on error:
  Demo.renderTurnstile('fd-turnstile');   // resets AGAIN (render path re-resets existing widget)
  ```
- observed/why: `proxyRequest` already resets the widget before returning; on the error branch the caller calls `renderTurnstile` which (L6215) resets it a second time, and the success branch schedules another `renderTurnstile` 200ms later (L11401). Harmless functionally but redundant; double-reset can cause a brief captcha flicker. Not load-bearing.
- fix: Remove the extra `Demo.renderTurnstile('fd-turnstile')` in the error branch, or stop resetting inside `proxyRequest` and let the caller own widget lifecycle.

---

## Summary

Counts by severity:
- CRITICAL: 1 (C04-1)
- HIGH: 2 (C04-2, C04-3)
- MEDIUM: 4 (C04-4, C04-5, C04-7, C04-9)
- LOW: 2 (C04-6, C04-8)
- POLISH: 1 (C04-10)

Top 3:
1. **C04-1 (CRITICAL):** `_backgroundValidate` revokes a paid license on *any* Worker response that isn't exactly `{valid:true}` (500/429/empty/garbage) — no `res.ok` check — persists `valid:false`, fires `license:expired`, and silently kills AutoSave. A transient server blip locks out paying customers. Proven in Node.
2. **C04-3 (HIGH):** `_hdr()` does the opposite of its own comment — it never attaches `X-Device-Token`. The whole server-token device-identity scheme is bypassed on activate/validate in exactly the cookieless itch.io/`file://` contexts it was built for. Only the deactivate queue sends the token.
3. **C04-2 (HIGH):** The false "expired" state pushes users to re-activate, which mints a *new* LS instance (new `instance_name`, no instanceId reuse, no device token) — repeated blips can exhaust their own device cap and hard-lock them.

Note: DEMO client-side bypass (C04-4) is real but proportionate for a $29 product *provided the Worker actually enforces the per-IP cap* — that enforcement is unverifiable here (Worker unreachable, HTTP 000) and must be confirmed live.
