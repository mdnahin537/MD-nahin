# C02 — Solo / TransparencyLog / CostMeter / CostGate

Audited chunk: lines 5004–5602. Callers cross-checked across full file.
Node math tests run inline; outputs pasted as evidence.

---

### C02-1: Solo panel never refreshed on partial-render path (confirms C12-7)
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L7703–L7715 (`Render.refreshOpenPanels`), cross-ref L5214 (`Solo.renderPanel`)
- evidence:
  ```js
  // L7707-7715
  if(open==='sessions'&&want('session'))SHSPanels.renderSessions();
  else if(open==='hooks'&&want('hook'))SHSPanels.renderHooks();
  else if(open==='secrets'&&want('secret'))SHSPanels.renderSecrets();
  else if(open==='locations'&&want('location'))SHSPanels.renderLocations();
  else if(open==='bestiary'&&want('bestiary'))SHSPanels.renderBestiary();
  else if(open==='relations'&&want('relation'))SHSPanels.renderRelations();
  else if(open==='web'&&(want('character')||...))SHSPanels.renderWeb();
  else if(open==='threads')SHSPanels.renderThreads();
  // 'solo' and 'fronts' are absent
  ```
  `SHSPanels.renderSolo` exists at L13430 and correctly delegates to `Solo.renderPanel()`. Both `'solo'` and `'fronts'` are tracked in `SHSPanels._open` (L12724) and enumerated in `closeAll()` / `openPanel()` (L12728/12743), but neither panel is in the `refreshOpenPanels` else-if chain.
- observed/why: When any `sc:changed` event fires while the Solo panel is open (e.g. after a chaos-factor change persists state, or undo), `dispatchRender` calls `Render.refreshOpenPanels(fields)` which silently exits without re-rendering the Solo panel. The displayed log and chaos readout go stale. On the `Render.all()` path (undo/import/nation-switch) `refreshOpenPanels` is called with no `fields` argument — that path ALSO misses `solo`, so the full-refresh case is equally broken. `Fronts` has the same gap.
- fix: Add two branches to `refreshOpenPanels`:
  ```js
  else if(open==='solo') SHSPanels.renderSolo();
  else if(open==='fronts') SHSPanels.renderFronts();
  ```

---

### C02-2: `soloTier` effort setting stored and displayed but never consumed
- tag: WIRING | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5100, L5149, L5196 (`Solo.askOracle`, `scenePivot`, `moodShift`); L4743 (default settings); L5643 (`AccuracyChip._settingKeyFor`)
- evidence:
  ```js
  // L5100 — askOracle
  const built=PromptFill.build('so1',{...},n,{message:entry.question||'',surface:'solo'});
  // L5149 — scenePivot
  const built=PromptFill.build('so2',{...},n,{message:entry.scene||'',surface:'solo'});
  // L5196 — moodShift
  const built=PromptFill.build('so3',{...},n,{message:sceneInput||'',surface:'solo'});
  // None pass opts.tier. PromptFill.build forwards opts.tier to buildContext at L4988.
  ```
  `AccuracyChip._settingKeyFor` maps `'solo' → 'soloTier'` (L5643), and `soloTier:'mid'` is in `DEFAULT_SETTINGS` (L4743). The effort chip renders for the Solo surface and shows the selected tier — but all three Solo AI calls pass no `tier` in opts, so `buildContext` always receives `tier=undefined` and uses its default depth regardless of what the user set.
- observed/why: The effort tier control on the Solo surface is a visual lie — it has no functional effect on any of the three AI calls. User adjusts context depth believing it controls cost/quality; it does not.
- fix: In each of the three `PromptFill.build` calls, add `tier: State.data?.meta?.settings?.soloTier` to the opts object, e.g.:
  ```js
  PromptFill.build('so1',vars,n,{message:entry.question||'',surface:'solo',
    tier:State.data?.meta?.settings?.soloTier});
  ```

---

### C02-3: TransparencyLog `_RATES` uses cached/wrong rate for `claude-haiku-latest`
- tag: BUG | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L5404–L5412 (`TransparencyLog._RATES`); L3909 (UI option label); L9378 (Copilot estimate table)
- evidence:
  ```js
  // L5405 — TransparencyLog (used for actual session cost tracking)
  'anthropic/claude-haiku-latest':[0.25,1.25],
  // L9378 — Copilot._perMessageCostEstimate (used for settings UI hint)
  'anthropic/claude-haiku-latest':[1,5],
  // L3909 — UI model option label
  "Claude Haiku (latest) — Fast & Cheap (~$1 / $5 per Mtok)"
  ```
  Node test output:
  ```
  TransparencyLog haiku: $0.25/$1.25 per million (cached rate used as standard → undercount)
  Copilot estimate haiku: $1/$5 per million (Haiku 3 rate, stale for haiku-latest = Haiku 3.5)
  If using cached rates for standard calls: undercounts by ~69% on input tokens
  ```
  Published OpenRouter standard rate for `claude-haiku-3-5` as of mid-2025 is approximately $0.80/M input / $4.00/M output (uncached). The `TransparencyLog._RATES` value of `$0.25/$1.25` matches the cached-token price, not the standard price — meaning every Haiku call is tracked at ~3x less than its actual cost for uncached tokens. The Copilot estimate table uses `$1/$5` (Haiku 3 rates, stale). The two tables are also inconsistent with each other and with the UI label.
- observed/why: Users relying on the session cost meter to track spend will see significant undercounting when using Haiku. The cap/warn thresholds become unreliable. `NEEDS-LIVE-VERIFY` to confirm current OR pricing.
- fix: Align both rate tables and the UI label to OpenRouter's current standard (uncached) rates for `claude-haiku-latest`. Note that `_RATES` is also used in `Copilot._perMessageCostEstimate` at L9377 separately — there are two divergent tables that should be a single shared constant.

---

### C02-4: `google/gemini-2.5-flash` rate inflated ~4x vs published price
- tag: BUG | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L5410 (`TransparencyLog._RATES`); L3914 (UI label); L9383 (Copilot estimate)
- evidence:
  ```js
  // L5410
  'google/gemini-2.5-flash':[0.30,2.50],
  // L3914 — UI option label
  "Gemini 2.5 Flash — Fast (~$0.30 / $2.50 per Mtok)"
  ```
  Node test:
  ```
  google/gemini-2.5-flash: app=[0.3,2.5] ref=[0.15,0.6] → MISMATCH
  ```
  Published OpenRouter standard rate for `google/gemini-2.5-flash` is approximately $0.15/M input / $0.60/M output (non-thinking mode, ≤200k context). The app uses $0.30/$2.50 — the output rate is ~4× too high. This means Gemini Flash calls appear far more expensive than they are, potentially deterring users from selecting the cheapest capable model.
- observed/why: Users see inflated cost stamps for Gemini Flash and may avoid it or hit their cost cap prematurely. The CostGate cap would trigger too early.
- fix: Update both `TransparencyLog._RATES` and the `Copilot._perMessageCostEstimate` table to `[0.15, 0.60]` for `google/gemini-2.5-flash`. Verify against current OpenRouter pricing before shipping. Add a comment with the date rates were last checked.

---

### C02-5: Two separate hardcoded rate tables that must be kept in sync
- tag: QUALITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5404–L5412 (`TransparencyLog._RATES`); L9377–L9384 (`Copilot._perMessageCostEstimate` inner `rates` object)
- evidence:
  ```js
  // Table 1 — TransparencyLog._RATES at L5404
  'anthropic/claude-haiku-latest':[0.25,1.25],
  'anthropic/claude-sonnet-latest':[3.00,15.00],
  // Table 2 — Copilot estimate at L9378
  'anthropic/claude-haiku-latest':[1,5],
  'anthropic/claude-sonnet-latest':[3,15],
  ```
  The tables are parallel but diverge (haiku), and every price change must be applied in two places. Findings C02-3 and C02-4 are partly caused by this duplication.
- observed/why: Silent drift between tables corrupts both the session cost log and the per-message estimate displayed in settings. Already observed for haiku and flash.
- fix: Hoist to a single `const MODEL_RATES = {...}` constant shared by both consumers.

---

### C02-6: `TransparencyLog` footer shows rolling-buffer total; diverges from `CostMeter` after 50 calls
- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5447–L5451 (`TransparencyLog.render`); L5422 (`_entries.length = this._MAX`); L5543 (`CostMeter._usd +=`)
- evidence:
  ```js
  // L5422: buffer capped at 50
  if(this._entries.length>this._MAX)this._entries.length=this._MAX;
  // L5447–L5451: footer totals are summed from _entries (rolling 50)
  const totalCost=this._entries.reduce((s,e)=>s+e.cost,0);
  // L5543: CostMeter accumulates unboundedly
  this._usd+=Number(rec.cost)||0;
  ```
  The comment at L5424 acknowledges this design. After more than 50 calls in a session, the transparency log footer shows a lower total than the CostMeter chip, with no explanation to the user.
- observed/why: A user with a $1.00 cap who has made 60 calls will see the footer report less than $1.00 while the chip correctly reports above cap. Confusing; erodes trust in the cost system.
- fix: Add a footnote to the footer when entries have been truncated: e.g. `"showing last 50 of N calls · session total: $X.XX"` where session total comes from `CostMeter._usd`.

---

### C02-7: Unknown model silently tracked at `$0.000` — indistinguishable from zero-cost call
- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5428–L5431 (`TransparencyLog._calcCost`); L5433–L5438 (`_fmtUSD`)
- evidence:
  ```js
  _calcCost(model,inTok,outTok){
    const rates=this._RATES[model];
    if(!rates)return 0;   // unknown model → cost = 0
    ...
  }
  ```
  Node test:
  ```
  Unknown model cost display: $0.000
  ```
  `_fmtUSD(0)` returns `'$0.000'`, which is identical to a genuinely-free call. If a user selects a model not in `_RATES` (e.g. a custom OpenRouter model slug), all calls show `$0.000` and the CostMeter chip never advances. There is no visual indicator that the model is untracked.
- observed/why: Users believe the model is free; cost cap never fires even if they are spending significant money.
- fix: Return a sentinel (`null` or `-1`) from `_calcCost` for unknown models, and display `"$?.?? (rate unknown)"` in the UI. CostGate should not rely on cost for unknown models.

---

### C02-8: `costWarnUSD > costCapUSD` not validated — warn can never fire
- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L16312–L16317 (cost guardrails save handler)
- evidence:
  ```js
  // L16312-16317 — no cross-validation
  const warn=w===''?null:Math.max(0,Number(w));
  const cap=c===''?null:Math.max(0,Number(c));
  if(warn!=null&&!Number.isFinite(warn)){showToast('Warn value must be a number.');return;}
  if(cap!=null&&!Number.isFinite(cap)){showToast('Cap value must be a number.');return;}
  State.setSetting('costWarnUSD',warn);
  State.setSetting('costCapUSD',cap);
  ```
  Node simulation:
  ```
  Scenario: warn=$0.50, cap=$0.10, 5 calls of $0.04 each
    CAP paused at $0.12
    Call blocked by cap …
  Final: warnFired=false
  → Cap paused at $0.12, warn ($0.50) never fires.
  ```
- observed/why: User sets warn=$0.50, cap=$0.10 believing they will get a warning before the cap. The cap fires first and the warn never fires. No error or hint is shown.
- fix: Add validation: `if(warn!=null && cap!=null && warn>=cap){ showToast('Warning threshold must be below the cap.'); return; }`

---

### C02-9: `CostGate._ensure()` only called once at bootstrap; late re-definition of `Copilot._apiFetch` would bypass the gate
- tag: WIRING | severity: LOW | confidence: LOW | NEEDS-LIVE-VERIFY: no
- where: L5577–L5597 (`CostGate._ensure`); L17352 (bootstrap call)
- evidence:
  ```js
  // L5582-5584
  const orig=Copilot._apiFetch.bind(Copilot);
  Copilot._apiFetch=function(...args){
    if(Copilot._costPaused)return Promise.reject(...);
    return orig(...args);
  };
  ```
  `_costGateWired` prevents double-wrapping, so a second `_ensure()` call is idempotent — correct. However, if any code path re-assigns `Copilot._apiFetch` after bootstrap (e.g. a future hot-reload or dynamic plugin), the gate closure is orphaned and the new `_apiFetch` is unwrapped. No such re-assignment exists in the current file, so risk is LOW.
- observed/why: Fragile pattern — the gate is a post-hoc monkey-patch rather than being built into `_apiFetch`. Low risk now, but a maintenance trap.
- fix: Incorporate the `_costPaused` check directly inside `Copilot._apiFetch` and `_apiFetchJson` rather than wrapping from outside.

---

### C02-10: Solo oracle log entries never include a cost stamp
- tag: UX | severity: POLISH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5356–L5388 (`Solo._renderLogEntry`); compare L12574 (Tonight), L17148 (Encounter)
- evidence:
  ```js
  // Tonight (L12574) — has cost stamp
  html+=`...<div class="tonight-strong-start">${Markdown.render(txt)}</div>
         ${TransparencyLog.costStampHtml()}</div>`;
  // Encounter (L17148) — has cost stamp
  ${TransparencyLog.costStampHtml()}
  // Solo oracle entry (L5362–5368) — no cost stamp anywhere
  inner=`<div class="solo-log-entry__question">${E(entry.question||'')}</div>
  ...
  ${entry.narrative?`<div class="solo-roll-narrative"...>${E(entry.narrative)}</div>`:''}`;
  ```
- observed/why: Tonight and Encounter render a per-call cost stamp inline with their AI output. Solo oracle, scene pivot, and mood shift log entries do not, even when an API call was made. Inconsistent product behaviour — solo users get no indication of per-call cost at the point of use.
- fix: After each AI-sourced log entry renders, append `TransparencyLog.costStampHtml()`. This requires capturing the stamp immediately after the API call (before `_logEntry` clears/overwrites state), or storing a `costStamp` on the entry like the Copilot chat path does (L10354).

---

### C02-11: `Solo.bind()` only wires the close button; initial render is never triggered
- tag: WIRING | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5391–L5397 (`Solo.bind`); L17347 (bootstrap); L12726 (`SHSPanels.openPanel`)
- evidence:
  ```js
  // L5391-5397
  bind(){
    const closeBtn=document.getElementById('panel-solo-close');
    if(closeBtn&&!closeBtn._soloBound){
      closeBtn.addEventListener('click',()=>SHSPanels.closeAll());
      closeBtn._soloBound=true;
    }
  },
  ```
  `Solo.bind()` is called at bootstrap (L17347). It does NOT call `Solo.renderPanel()`. The solo panel's `<div id="solo-body">` contains only a static HTML comment at load time. The first render only fires when the user navigates to Solo via `SHSPanels.openPanel('solo')` (L12739 dispatches `renderSolo()`). This is by design and not broken on its own — but combined with C02-1 (stale panel on sc:changed), a user who has the panel open and navigates away and back will see the previous render, not a fresh one, if `openPanel` re-use logic caches the `_open` state.
  
  Additional: `bind()` is called at L17347 *before* `CostGate._ensure()` at L17352. This ordering is safe because `Solo.bind()` only attaches a close listener and does not call any Copilot API path.
- observed/why: Not a standalone bug, but confirms that Solo relies entirely on `openPanel` triggering `renderSolo` for its first paint, and on `refreshOpenPanels` for subsequent refreshes — the latter of which is broken (C02-1). Together these two issues mean the solo panel can show stale state indefinitely.
- fix: Covered by C02-1 fix. No separate fix needed here.

---

### C02-12: `TransparencyLog.costStampHtml()` reads `lastCost()` which is the most-recent entry — race condition for rapid sequential calls
- tag: BUG | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: L5477–L5481 (`lastCost`); L5484–L5495 (`costStampHtml`); L12574, L17148 (callers)
- evidence:
  ```js
  lastCost(){
    const e=this._entries[0];  // always the most recent push
    ...
  },
  costStampHtml(opts){
    ...
    const c=this.lastCost();   // called after the AI call returns
    ...
  }
  ```
  `costStampHtml` is called synchronously in the render code immediately after the awaited API call resolves. If two AI calls fire concurrently (e.g. user spam-clicks), `_entries[0]` may belong to the second call by the time the first call's render runs. Tonight's Strong Start and Retry path (L12677) share the same render point but operate serially, so this is low risk in practice. Solo calls are also serial (each awaits). Risk is real only if two surfaces fire simultaneously.
- observed/why: Wrong cost shown in inline stamp for the first of two near-simultaneous calls.
- fix: Capture the cost stamp immediately after `TransparencyLog.push()` returns (before any further async work), store it in a local variable, and use the stored value in the render. The Copilot chat path already does this correctly at L10354 (`lastMsg._costStamp = TransparencyLog.costStampHtml()`).

---

## Node test summary (CostMeter math)

```
=== Per-call cost estimates ===
Oracle (haiku, small): inTok=200 outTok=80 → $0.00015
Oracle (sonnet, small): inTok=200 outTok=80 → $0.0018
Scene Pivot (sonnet, med): inTok=500 outTok=120 → $0.0033
Mood Shift (sonnet, small): inTok=150 outTok=60 → $0.0014
Oracle (opus, small): inTok=200 outTok=80 → $0.0090
GPT-4o-mini, small: inTok=200 outTok=80 → $0.00008
Unknown model: → $0.000  ← silent zero

=== Session total sim (sonnet, 30 calls) ===
30 calls total: $0.059

=== Threshold boundary checks ===
usd=0.1, warn=0.1, cap=0.2 → warnFires=true, capFires=false   ← exact-match warn OK
usd=0.2, warn=0.1, cap=0.2 → warnFires=true, capFires=true    ← exact-match cap OK
(>= comparisons are correct; no off-by-one)
```

Core `_calcCost` arithmetic (`/1_000_000`) is correct. `_fmtUSD` tier boundaries are correct. Threshold comparisons (`>=`) are correct. Problems are in the **rate values themselves** (C02-3, C02-4) and in table duplication (C02-5).

---

## Summary

| Severity | Count | Finding IDs |
|----------|-------|-------------|
| HIGH | 1 | C02-1 |
| MEDIUM | 4 | C02-2, C02-3, C02-4, C02-11 |
| LOW | 5 | C02-5, C02-6, C02-7, C02-8, C02-9 |
| POLISH | 2 | C02-10, C02-12 |

**Top 3:**

1. **C02-1 (HIGH)**: Solo panel (and Fronts) never refreshed on partial-render path — confirmed gap in `Render.refreshOpenPanels`. The oracle log goes stale after any state change while the panel is open. Direct confirmation of sibling finding C12-7.

2. **C02-2 (MEDIUM)**: `soloTier` effort setting is a visual no-op — the effort chip renders for Solo and the setting is persisted, but none of the three Solo AI calls pass `tier` to `PromptFill.build`, so `buildContext` always uses its default depth regardless of the user's selection.

3. **C02-3/C02-4 (MEDIUM)**: Rate table inaccuracies — Haiku `_RATES` uses cached-token pricing as if it were standard pricing (probable ~3× undercount); Gemini Flash output rate is ~4× too high. Two separate divergent rate tables compound the problem.
