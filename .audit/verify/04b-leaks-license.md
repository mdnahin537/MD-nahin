# Verification: Listener Leaks + License Recovery UX (5 HIGH findings)

Source: `/root/.claude/uploads/c01e2694-58fb-4cef-99ea-42e4d95e9f1d/6b9eaae1-relamwrith_V7.HTML` (grep -a, 17,864 lines)

Status: COMPLETE (5/5 settled — all CONFIRMED)

---

### 1. AccuracyChip.mount leak (C12-3 / C03-3)
- verdict: CONFIRMED
- original grade / corrected grade: HIGH / HIGH (no change)
- proof:
  ```js
  // L5715 mount() — registers TWO permanent document listeners, every call, no guard inside mount itself:
  mount(containerEl,surface,opts={}){
    if(!containerEl)return;
    const refresh=()=>{ ... containerEl.innerHTML=this.render(meta); ... };
    containerEl._refreshAccChip=refresh;
    refresh();
    document.addEventListener('rw:effort-changed',e=>{
      if(e.detail?.key===this._settingKeyFor(surface))refresh();
    });
    document.addEventListener('sc:changed',e=>{
      const f=e.detail?.fields||[];
      if(f.includes('chronicle')||f.includes('nation'))refresh();
    });
  },

  // L17366-17381 — caller fires on EVERY sc:modal-open, for 9 mapped surfaces,
  // and replaces the element first (orphaning the old closures' containerEl):
  document.addEventListener('sc:modal-open',e=>{
    ...
    slot.innerHTML='<div class="rw-surface-meta__chip"></div>';   // L17376 — destroys old chipEl
    const chipEl=slot.querySelector('.rw-surface-meta__chip');
    if(typeof AccuracyChip!=='undefined')AccuracyChip.mount(chipEl,surface,{});  // L17381 — unguarded
  });
  ```
  Confirmed `_MODAL_SURFACE_MAP` (L17345-17365) maps 9 distinct surfaces to this path, and `sc:modal-open` is dispatched generically at L8432 every time any modal opens.
  Note: exactly ONE call site (L9558, copilot surface) guards with `if(...&&!chipEl._refreshAccChip)AccuracyChip.mount(...)`. The L17381 caller — the one driving the 9 modal surfaces — has no such guard, and `mount()` itself never checks `containerEl._refreshAccChip` before re-registering. So the finding's "no `_bound` guard, no removal" claim is accurate for the path it cites.
- plain: Every time you open one of 9 different in-app modals (bestiary, encounter, glossary, etc.), the app silently adds two more permanent listeners to the whole document that never go away — even though the chip element they were built for gets thrown away a moment later. Open modals repeatedly during a long session and the page accumulates hundreds of dead listeners doing pointless DOM writes to detached nodes.
- fix: In `mount()`, check `if(containerEl._refreshAccChip){containerEl._refreshAccChip=refresh;return;}` before adding listeners, or store/clear an `AbortController` per mount and pass `{signal}` to both `addEventListener` calls.

---

### 2. PrintPreview keydown leak (C11-2, cited as X1 row "L14431")
- verdict: CONFIRMED
- original grade / corrected grade: HIGH / HIGH (no change) — minor citation correction: the function is `PrintPreview.open()`, not `.show()` (X1's table mislabels the method name; `.show` exists elsewhere in the file on an unrelated object, L5808). Does not change the verdict.
- proof:
  ```js
  // L14391-14439
  const PrintPreview={
    _el:null,
    open(contentNode,title='Preview'){
      this.close();                                    // L14394 — closes any prior preview first
      ...
      closeBtn.addEventListener('click',()=>this.close());   // L14418 — Close button → this.close()
      ...
      document.body.appendChild(wrap);
      this._el=wrap;
      closeBtn.focus();
      const onKey=e=>{if(e.key==='Escape'){this.close();document.removeEventListener('keydown',onKey);}};  // L14430
      document.addEventListener('keydown',onKey);                                                          // L14431
    },
    close(){
      if(this._el){this._el.remove();this._el=null;}   // L14437-14438 — NO removeEventListener here
    },
  };
  ```
- observed/why: `removeEventListener('keydown', onKey)` exists ONLY inside the `if(e.key==='Escape')` branch of `onKey` itself. `close()` — the method invoked by the visible "Close" button (L14418) and by the very first line of the next `open()` call (L14394, "close any existing preview before opening a new one") — never removes the listener. So any dismissal path other than pressing Escape (clicking Close, or simply opening a new preview over an old one) leaves a stale `keydown` listener bound to `document` forever. Each leaked closure still runs its `e.key==='Escape'` check on every keystroke for the rest of the session; opening/closing previews repeatedly accumulates one extra permanent listener per non-Escape dismissal.
- plain: Pressing Escape to close the print-preview cleans up properly; clicking the visible "Close" button (the obvious, expected way to dismiss it) does not — it leaves an invisible leftover keyboard listener running for the rest of the session, one more each time you do it.
- fix: Move `document.removeEventListener('keydown',onKey)` into `close()` (store `onKey` on `this._keyHandler` so `close()` can reach it), or attach with `{signal: this._ctrl.signal}` and `this._ctrl.abort()` inside `close()`.

---

### 3. C13-2: license:expired toast uses duration=0 — effectively invisible
- verdict: CONFIRMED
- original grade / corrected grade: HIGH / HIGH (no change)
- proof:
  ```js
  // L17238-17241 — the handler:
  document.addEventListener('license:expired',()=>{
    showToast('Your RealmWright license could not be verified. Please re-activate.',
      [{label:'Re-activate',handler:()=>this.openModal()}],0);     // <-- duration = 0
    this._updateStatusUI();
  });

  // L8098 showToast signature + L8124-8126 the timer that duration drives:
  function showToast(msg,links=[],duration=4000){
    ...
    t.classList.add('is-visible');             // L8124 — starts the 240ms fade-IN transition
    clearTimeout(_toastTimer);
    _toastTimer=setTimeout(()=>t.classList.remove('is-visible'),duration);  // L8126 — duration=0 → fires next tick
  }
  ```
  CSS confirmed: `.toast` base rule (L2312-2316) starts at `opacity:0` with
  `transition:opacity var(--duration-default) var(--ease-out),transform var(--duration-default) var(--ease-out)`,
  `.toast.is-visible{opacity:1;...}` (L2329), and `--duration-default:240ms` (L107).
  Same `,0)` pattern also confirmed at L6298 (`'Auto-backup needs permission to continue.'`) and L6305 (`'Auto-backup paused — permission revoked.'`).
- plain: `duration=0` means "start fading the toast IN, then immediately (within ~4ms) start fading it back OUT" — the 240ms fade-in animation never gets anywhere close to finishing before the fade-out reverses it. The toast effectively never becomes visible. This is the only on-screen message telling a paying customer their license failed and offering the "Re-activate" button — and it flickers and vanishes before a human can perceive it, let alone click the button. The two auto-backup permission toasts have the identical defect.
- fix: Change all three `showToast(..., 0)` calls to a real duration (e.g. `12000`), or add a `-1`/`Infinity` "sticky, dismiss-on-click-only" mode to `showToast` for permanent-action notices like license-expired.

---

### 4. C04-2: device-cap lockout — re-activation mints a NEW LemonSqueezy instance
- verdict: CONFIRMED
- original grade / corrected grade: HIGH / HIGH (no change)
- proof:
  ```js
  // L6108-6128 _activateLS — what runs when the user clicks "Re-activate" from the license:expired toast:
  async _activateLS(key){
    try{
      const body=new URLSearchParams({license_key:key,instance_name:'RealmWright-'+Date.now()});  // L6112 — fresh name EVERY call, no stored instanceId reused
      const res=await fetch(WORKER_URL+'/api/license/activate',
        {method:'POST',headers:await this._hdr('application/x-www-form-urlencoded'),credentials:'include',body});  // L6113-6114 — no instance_id param sent at all
      ...
      this._data={key,instanceId:json.instance?.id||null,platform:'lemonsqueezy',activatedAt:Date.now(),valid:true};  // L6124 — overwrites stored instanceId with whatever the server returns for the NEW instance
      ...
    }
  }
  ```
  Contrast `_backgroundValidate` (L6144-6149), which DOES send the existing id: `instance_id:this._data.instanceId||''` (L6147) — proving the client is capable of identifying an existing instance, but `_activateLS`'s `activate` call chooses not to.
  Trace confirmed: `license:expired` (L17238) → `Re-activate` button → `this.openModal()` (L17241/17246-17248) → activation flow → `activate(key)` (L6106) → `_activateLS(key)` (L6108) for `platform==='lemonsqueezy'`.
- plain: When the app wrongly tells you your license expired (a transient server hiccup can trigger this — see the related C04-1 finding) and you click "Re-activate", it doesn't try to refresh your existing activation — it asks Lemon Squeezy to register a brand-new device slot with a brand-new name (`RealmWright-<timestamp>`), every single time. Lemon Squeezy caps how many devices one license can activate. A few false "expired" alarms and a paying customer can burn through their own device limit and get permanently locked out of software they bought — by the software itself, not by anything they did wrong.
- fix: Before calling activate, check `if(this._data?.instanceId){ /* call validate/refresh instead */ }`; only mint a new `instance_name` when there is genuinely no stored instance for this device.

---

### 5. C04-3: `_hdr()` does NOT attach the device token despite its comment
- verdict: CONFIRMED
- original grade / corrected grade: HIGH / HIGH (no change)
- proof:
  ```js
  // L6095-6103 (comment immediately above _hdr, then the function body):
  // ...Echoes the cached server-issued device_token as X-Device-Token so itch.io
  // iframes / file:// loads (where the HttpOnly cookie is not available) still
  // identify the same device.
  async _hdr(ct){
    const h={Accept:'application/json'};
    if(ct)h['Content-Type']=ct;
    return h;                              // <-- returns WITHOUT ever reading or attaching a token
  },
  ```
  Grep-confirmed: `X-Device-Token` is set in exactly one place in the whole file — L6049, inside `LicenseQueue`'s `retryPost` (`if(tok)headers['X-Device-Token']=tok;` after `const tok=await _readDeviceToken();` at L6047). All three `_hdr()` callers — `_activateLS` (L6114: `headers:await this._hdr('application/x-www-form-urlencoded')`), `_activateItchio` (L6132: `headers:await this._hdr('application/json')`), `_backgroundValidate` (L6149: `headers:await this._hdr('application/x-www-form-urlencoded')`) — receive only `{Accept, Content-Type}` and send no device token. `_readDeviceToken` (defined L6014) is never called from `_hdr`.
- plain: The code has a comment promising that every license request carries a special "device fingerprint" header so the server can recognize your device even when cookies don't work (exactly the itch.io-in-an-iframe / opening-the-file-directly situations the app is built to support) — but the function backing that promise is empty; it does the opposite of what it says. In precisely the contexts where cookies are unavailable, activate and validate calls go out with no device identity at all, which directly enables/worsens the device-cap lockout in finding 4 (the server can't recognize "this is the same device retrying" because the one identifying header it was designed to look for is never sent).
- fix: In `_hdr`, call `const tok=await _readDeviceToken();` and `if(tok)h['X-Device-Token']=tok;` before returning — mirroring exactly what `LicenseQueue.retryPost` already does correctly at L6047-6049.

---

## Summary

| # | Finding | Verdict | Grade |
|---|---|---|---|
| 1 | AccuracyChip.mount listener leak (C12-3) | CONFIRMED | HIGH (unchanged) |
| 2 | PrintPreview keydown listener leak (C11-2 / X1) | CONFIRMED | HIGH (unchanged) — minor: method is `.open()` not `.show()` |
| 3 | license:expired toast duration=0, invisible (C13-2) | CONFIRMED | HIGH (unchanged) |
| 4 | Re-activation mints new LS instance, burns device cap (C04-2) | CONFIRMED | HIGH (unchanged) |
| 5 | `_hdr()` never attaches X-Device-Token despite comment (C04-3) | CONFIRMED | HIGH (unchanged) |

**Counts: CONFIRMED 5, OVERSTATED 0, FALSE-POSITIVE 0, NEEDS-BROWSER 0.**

Is the license-expiry recovery experience safe for a paying customer? **No.** Every single link in the chain is broken: the one notification meant to tell the customer their license failed is functionally invisible (finding 3), the device-identity header that should let the server recognize a returning device is never sent (finding 5), and clicking "Re-activate" — the prescribed recovery action — burns a fresh device-activation slot instead of refreshing the existing one (finding 4), so a few silent server hiccups can permanently lock a paying customer out of software they own, with no visible warning along the way. Two unrelated permanent listener leaks (findings 1, 2) compound general session-health risk but are independent of the license-recovery chain.

</content>
