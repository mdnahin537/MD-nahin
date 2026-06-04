# C13 Findings — Ambient / SnapshotManager / GlossaryUI / NamingUI / EncounterBuilder / LicenseGateUI

Chunk: lines 16646–17575 · Auditor: C13 sub-agent

---

### C13-1: LicenseGateUI.bind() wires dead-on-arrival — la-submit, la-key-input, license-deactivate-btn
- tag: WIRING | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L17221–L17234
- evidence:
  ```js
  // bind() runs at bootstrap before _updateModalStatus() is ever called.
  // The modal body/footer are EMPTY (P1.11 comment: "static template intentionally has empty body/footer").
  const deactivateBtn=document.getElementById('license-deactivate-btn'); // → null
  if(deactivateBtn)deactivateBtn.addEventListener('click',()=>this._deactivate()); // dead
  const submitBtn=document.getElementById('la-submit');   // → null (footer is empty)
  if(submitBtn)submitBtn.addEventListener('click',()=>this._submit()); // dead
  const keyInput=document.getElementById('la-key-input'); // → null (body is empty)
  if(keyInput){ keyInput.addEventListener('input', ...); keyInput.addEventListener('keydown', ...); } // dead
  ```
- observed/why: All three elements (`#la-submit`, `#la-key-input`, `#license-deactivate-btn`) are dynamically injected by `_updateModalStatus()` each time the modal opens. They do not exist in the DOM at `bind()` time. The working event-listener paths are in `_updateModalStatus()` at L17270 (deactivate), L17282–17283 (input/keydown on body), and L17292–17293 (submit in footer). The `bind()` attempts are completely inert. The comment "Wire deactivate in settings" at L17220 is misleading — there is no static `#license-deactivate-btn` in the settings panel DOM at all. Deactivation is only available inside the license modal.
- fix: Remove the dead wires at L17221–17234. Optionally add a settings-panel deactivate affordance if that was the original intent; wire it to a static element in `modal-settings`.

---

### C13-2: license:expired toast uses duration=0 — effectively invisible to user
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L17239 (also L6298, L6305 same pattern)
- evidence:
  ```js
  // L17239:
  showToast('Your RealmWright license could not be verified. Please re-activate.',
    [{label:'Re-activate',handler:()=>this.openModal()}], 0);  // duration = 0

  // showToast() at L8125–8126:
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('is-visible'), duration); // setTimeout(fn, 0)
  ```
  CSS toast transition (L2316): `transition: opacity 240ms ease-out, transform 240ms ease-out`
- observed/why: `duration=0` schedules `classList.remove('is-visible')` on the very next event-loop tick (~4ms). The CSS fade-in takes 240ms (`--duration-default`). By the time the fade-in has barely started, the remove fires and the fade-out begins. The toast never reaches visible opacity — it flickers near-zero opacity and is imperceptible. This is the **primary** user-facing channel informing a licensee that their license expired. If they miss it (guaranteed), they lose the Re-activate CTA and are left in a degraded state with no explanation. The same broken pattern appears at L6298 (auto-backup permission) and L6305 (auto-backup paused), both also permanent-action toasts.
- fix: Change all three `showToast(..., 0)` calls to use a large explicit duration (e.g. `12000`) or `-1` if you add a special "never auto-dismiss" path to `showToast`. The license:expired one is the most critical.

---

### C13-3: license:expired event does not update open modal — stale Licensed UI
- tag: BUG | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L17238–17241
- evidence:
  ```js
  document.addEventListener('license:expired', () => {
    showToast('...', [{label:'Re-activate', handler:()=>this.openModal()}], 0);
    this._updateStatusUI();   // ← updates nav indicators only
    // _updateModalStatus() NOT called
  });
  ```
- observed/why: `_updateStatusUI()` updates `.license-status-indicator` and `.license-gate-banner` nodes. It does NOT update the modal body. If the user has the license-activate modal open (e.g., reviewing their license info) when `_backgroundValidate()` fires and returns `valid:false`, the modal will continue showing the "✓ Licensed" card. The Close button will be there instead of the activation form. The user cannot re-activate without closing and reopening the modal. Given that `_backgroundValidate()` is fire-and-forget on boot (L17339 calls `LicenseGate.init()` which calls `_backgroundValidate()`), this is a realistic timing scenario on slow connections.
- fix: Add `if(Modals._current==='license-activate') this._updateModalStatus();` inside the `license:expired` handler.

---

### C13-4: Welcome-back branch (L17502–17514) is permanently dead code — confirmed by C09-1
- tag: DEAD | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L17502–17514
- evidence:
  ```js
  if(!State.data.meta.firstRunComplete){
    if(typeof FrontDoor!=='undefined')FrontDoor.open(); // always taken
    Render.all();
  }else{
    Render.all();
    // Welcome back toast for returning users — NEVER REACHED
    const lastUp=State.data.meta.lastUpdatedAt;
    // ...
    if(!State.data.meta.settings.onboardingComplete){
      setTimeout(()=>startOnboarding(),500); // NEVER REACHED
    }
  }
  ```
- observed/why: `firstRunComplete` is never set to `true` anywhere in the codebase (C09-1 established this). The `else` branch at L17502 is permanently unreachable. Consequences: (1) `FrontDoor.open()` fires on every page load, even for returning users. (2) The welcome-back toast at L17508 never shows. (3) The legacy onboarding guard at L17512 never runs. This is a major UX regression for returning users — every reload shows the onboarding front door.
- fix: `firstRunComplete` must be set to `true` after the user completes onboarding (confirmed fix location is in `FrontDoor`/onboarding completion callback).

---

### C13-5: Ambient._tick allocates new bound function on every rAF iteration
- tag: PERF | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L16679
- evidence:
  ```js
  _tick(ts){
    this.raf = requestAnimationFrame(this._tick.bind(this)); // new function object each call
    if(ts - this.last < 55) return; // ~18fps gate
    ...
  }
  ```
- observed/why: `this._tick.bind(this)` creates a new `Function` object on every animation frame. At 18fps this is 18 allocations/second. Each is short-lived but increases GC minor-collection frequency over long sessions. The 18fps gate limits actual drawing work but does not eliminate the allocation.
- fix: Pre-bind once: add `this._boundTick = this._tick.bind(this)` in `_build()`, then use `requestAnimationFrame(this._boundTick)` in `_tick`.

---

### C13-6: EncounterBuilder.open() inconsistent null-guard style (minor crash risk)
- tag: QUALITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L16989–16991
- evidence:
  ```js
  document.getElementById('eb-result')?.classList.remove('is-visible');  // optional chain ✓
  document.getElementById('eb-result-body').innerHTML = '';               // NO null guard
  document.getElementById('eb-situation').value = '';                     // NO null guard
  ```
- observed/why: `#eb-result-body` and `#eb-situation` exist in the static HTML (L4632, L4638–4639) so there is no actual crash in production. However the inconsistency with L16989 (which uses `?.`) is a maintenance trap: if either element is conditionally rendered or removed by a future refactor, `open()` will throw `TypeError: Cannot set properties of null`. Compare also `_renderResult` at L17136 which guards `if(!body)return`.
- fix: Add `?.` optional chaining: `document.getElementById('eb-result-body')?.innerHTML=''; document.getElementById('eb-situation')?.value='';`

---

### C13-7: GlossaryUI — generated result not restored on modal re-open
- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L16897–16905, L16923–16930 (bind)
- evidence:
  ```js
  // bind() has no sc:modal-open listener for 'glossary'
  // gloss-output starts as display:none in HTML (L17621)
  // _lastResult is module-level and persists across opens, but renderList() is never
  // called on re-open — only after generate()
  ```
- observed/why: If a user generates a glossary, closes the modal without saving, then reopens it, `_lastResult` still holds the generated data but `gloss-output` is hidden and never re-rendered. The Save and Copy buttons would work if clicked (they check `_lastResult`) but the user can't see the entries or know they're available. The `SnapshotManager.bind()` shows the correct pattern: subscribe to `sc:modal-open` to trigger a re-render.
- fix: In `GlossaryUI.bind()`, add: `document.addEventListener('sc:modal-open', e => { if(e.detail==='glossary' && this._lastResult) this.renderList(this._lastResult); });`

---

## Summary

| Severity | Count |
|---|---|
| HIGH | 2 |
| MEDIUM | 1 |
| LOW | 3 |
| POLISH | 1 |
| **Total** | **7** |

**Top 3 findings:**

1. **C13-2 (BUG/HIGH)** — `showToast(..., 0)` on `license:expired` makes the toast invisible due to CSS transition race. The user never sees the license-expired warning or the Re-activate CTA. This is the primary failure notification for a paid feature; when it fires it is silent.

2. **C13-1 (WIRING/HIGH)** — `LicenseGateUI.bind()` wires three null elements. The feature works only because `_updateModalStatus()` dynamically rewires each open, but the dead code in `bind()` masks intent and the comment "Wire deactivate in settings" implies a missing settings-panel deactivate affordance.

3. **C13-4 (DEAD/LOW)** — `firstRunComplete` never set true (C09-1) makes FrontDoor open on every bootstrap and permanently kills the welcome-back toast and legacy onboarding path for returning users.
