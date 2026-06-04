# C08a — Copilot AI integration (streaming, tool-calling, provider switch, key handling)

Range audited: L9346–10250 (assigned), with cross-reads into the tail of `streamOnce`,
the tool-call loop, `_apiFetch`, summarization, undo/redo/switchNation cancel sites, the
key-settings UI, `Markdown.render`, `CLAMP`/`setStat`, and `DEFAULT_SETTINGS`.

**Headline verdict:** The AI integration is unusually careful — key handling, provider
routing, scope-gating, undo-torn-write guards, and the abort path are all genuinely well
thought through. Most findings are correctness/UX edge cases, not security holes. The one
that matters most is a tool-loop completeness bug (final-round tool results dropped at the
iteration cap), plus a markdown bug that corrupts the snake_case stat names the model is
told to use.

---

### C08a-1: Tool-call loop drops the final round's tool results at MAX_ITER cap
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L10266–10299 (loop), esp. L10270–10296
- evidence:
  ```js
  let iter=0; const MAX_ITER=5;
  while(iter<MAX_ITER){
    iter++;
    const round=await streamOnce(messages);
    if(!round.toolCalls.length)break;
    messages=[...messages,{role:'assistant',...tool_calls...}];
    for(const tc of round.toolCalls){ ... messages.push({role:'tool',...}); }
    ...
  }
  if(iter>=MAX_ITER&&!errorMessage){ accumulated+='\n\n_[Tool-call loop hit 5-iteration cap.]_'; }
  ```
- observed/why: If the 5th iteration returns tool calls, those tools execute and their
  results are pushed onto `messages`, then `iter===5` makes `5<5` false and the loop exits
  **without ever sending those tool results back to the model.** The user sees the cap note
  but no final assistant synthesis of the last tool batch. Writes still apply/queue (no data
  loss), but the conversation ends mid-thought. A model that legitimately needs 5 read
  round-trips then one answer will silently truncate. The cap should leave room for one final
  no-tools synthesis turn (e.g. cap the loop at 4 tool rounds, then do one last
  `streamOnce` with `tool_choice:'none'`), or after the loop, if the last round had tools,
  do a final round-trip with tools disabled.
- fix: After the `while`, if the last round produced tool calls, run one more
  `streamOnce(messages)` with `tool_choice:'none'` so the model can answer from the results.

---

### C08a-2: Markdown italic regex corrupts snake_case stat names the model is told to emit
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5892 (`Markdown.render`, shared module) — consumed by Copilot at L9486 and L10415
- evidence (ran in Node):
  ```
  input : "food_production and raw_materials"
  output: "food<em>production and raw</em>materials"
  ```
  Regex: `s.replace(/(?:^|[^_])_([^_\n]+)_/g, ... '<em>'+c+'</em>')`
- observed/why: The system prompt + tool schemas use snake_case stat keys
  (`food_production`, `raw_materials`, `legitimacy`…). The Copilot is explicitly told stat
  names "match one in the world (e.g. legitimacy, food_production)" (L10091). When the
  assistant echoes two underscore-bearing tokens in one line, the underscores are treated as
  italic delimiters and the text between them is wrapped in `<em>` and the underscores
  vanish. Output looks broken and, worse, can make the GM misread which stat the model meant.
  This is THE most visible day-to-day defect on the Copilot surface. Root lives in the shared
  Markdown module (outside my range) but its primary victim is the Copilot stream renderer.
- fix: Only treat `_…_` as italic when bounded by whitespace/punctuation, not inside a word —
  e.g. require a non-word char (or start) before and after: `/(^|\W)_([^_\n]+)_(?=\W|$)/`.

---

### C08a-3: `_smartSelectChronicle` year-matcher mis-parses numbers and can't match negative years
- tag: BUG | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L9846–9847
- evidence (ran in Node):
  ```js
  const yRe=/\b-?\d{1,4}\b/g;
  "...Marr in 1885 and item #12345 cost 50 gold" -> [1885, 50]   // "50 gold" promoted as year 50
  "tell me about year -200"                      -> [200]         // sign dropped, wrong year
  ```
- observed/why: Two issues. (1) Any 1–4 digit number in the user's message (quantities,
  prices, counts) is treated as a year and can drag unrelated chronicle events into the
  "full" context window, wasting tokens and skewing relevance. (2) For BCE-style worlds with
  negative years, the `\b` before `-` prevents the sign from matching, so `-200` parses as
  `200` and the correct event is never promoted. Pure relevance heuristic, so it degrades
  quality rather than breaking anything — but it's a real "not at full potential" miss.
- fix: Tighten to 3–4 digit years and capture the sign without a leading `\b`:
  `/(?:^|\s)(-?\d{3,4})(?:\s|$|[.,;])/g`, or only match numbers that equal an actual
  `ev.year` in the nation.

---

### C08a-4: `update_nation_stat` rejects string-typed deltas the model commonly emits
- tag: BUG | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L9693 (`_buildProposal` → update_nation_stat)
- evidence:
  ```js
  if(!args.stat||typeof args.delta!=='number')return {error:'Missing required fields: stat, delta (integer).'};
  ```
- observed/why: `args` is `JSON.parse(tc.function.arguments)`. LLMs frequently stringify
  numbers (`"delta":"-3"`). A strict `typeof !== 'number'` returns a confusing "Missing
  required fields" error even though delta was present. The model then burns another loop
  iteration retrying. Every other numeric field in this module coerces via `Number(...)`
  (see `add_chronicle_entry` weight check at L9666 which uses `Number(args.weight)`); this
  one path is inconsistent.
- fix: Coerce: `const d=Number(args.delta); if(!args.stat||!Number.isFinite(d))return {error:...}; ...delta:Math.round(d)`.

---

### C08a-5: `max_tokens:1500` truncates long answers AND mid-emission tool-call arguments
- tag: BUG | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L10188 (`const body={model,messages:msgs,stream:true,max_tokens:1500}`)
- evidence:
  ```js
  const body={model,messages:msgs,stream:true,max_tokens:1500};
  ```
  plus arg-assembly at L10281–10282:
  ```js
  try{args=tc.function.arguments?JSON.parse(tc.function.arguments):{};}
  catch(e){args={};}
  ```
- observed/why: 1500 output tokens (~1,100 words) is tight for a GM assistant asked for
  "three strong-start paragraphs" or multi-NPC casts, so answers can cut off with
  `finish_reason:'length'` and no continuation logic exists (the loop only continues on
  `toolCalls.length`). Separately, if the model is mid-emitting a tool call when it hits the
  cap, `tc.function.arguments` is a truncated, unparseable JSON fragment → `JSON.parse`
  throws → `args={}` → the tool runs with empty args → validation error. Both are silent
  quality cliffs. `finish_reason==='length'` is captured into `finishReason` but never acted
  on or surfaced to the user.
- fix: Raise to ~3000–4000 for the chat path, and when `finishReason==='length'` either
  append a visible "(response truncated — ask to continue)" note or auto-continue one turn.

---

### C08a-6: Mid-stream `data:` JSON parse errors are swallowed; only a flagged error re-throws
- tag: BUG | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L10256–10259
- evidence:
  ```js
  }catch(parseErr){
    if(errorMessage)throw parseErr;
    continue;
  }
  ```
- observed/why: Any malformed SSE `data:` line that is not a provider-error object is
  silently `continue`d. This is mostly the right call (providers send keep-alives and odd
  chunks), and the line-buffering (`buffer=lines.pop()` at L10217) correctly holds partial
  trailing lines across reads — that part is solid. But if a provider streams a genuinely
  corrupt content delta, the user loses that token with zero signal and `receivedAnything`
  may stay false, yielding a bare `_[No response]_` with no diagnostic. Low severity because
  it only bites on malformed upstream data, but worth at least a `console.debug` for support.
- fix: Keep the `continue`, but `console.debug('copilot: dropped SSE line', parseErr)` so a
  user reporting "blank replies" can be diagnosed.

---

### C08a-7: `[DONE]` sentinel handled, but a `[DONE]` with no prior `usage`/content path is fine — confirm note
- tag: QUALITY | severity: POLISH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L10224 (`if(data==='[DONE]')continue;`), finalize fallback at L10337–10343
- evidence:
  ```js
  if(data==='[DONE]')continue;   // streamOnce just skips it; loop ends on reader 'done'
  ```
- observed/why: Not a bug — documented as a positive. `[DONE]` is correctly treated as a
  no-op (the real loop terminator is `reader.read()` returning `done`). When upstream omits a
  `usage` chunk (common on streaming), the finalize block estimates tokens via chars/4 and
  labels the cost "(~est)" (L10337–10348). Good. Calling it out so a later reviewer doesn't
  "fix" the `continue` into a `break` (which would drop a trailing usage chunk some providers
  send *after* `[DONE]`).
- fix: none — leave as-is. (Cross-check only: do not change to `break`.)

---

### C08a-8: Streaming reader has no read-timeout / idle-stall guard
- tag: BUG | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L10212–10215 (`while(true){ const {done,value}=await reader.read(); ... }`)
- evidence:
  ```js
  while(true){
    const {done,value}=await reader.read();
    if(done)break;
    buffer+=decoder.decode(value,{stream:true});
  ```
- observed/why: There is no inactivity timeout on the SSE read. If the provider connection
  hangs open but stops sending (proxy stall, dead TCP that never RSTs), `reader.read()` never
  resolves and the UI stays locked in "Stop" state indefinitely with `_sending=true`. The
  only escape is the user clicking Stop (which works — `cancel()` aborts the controller).
  Acceptable since Stop exists, but a 60–90s idle watchdog would prevent a wedged panel.
- fix: Race each `reader.read()` against a timeout, or set an overall abort timer that resets
  on each received chunk, then `this._abortController.abort()` on stall.

---

### C08a-9: `isConfigured()` key length-gate (>10) is a weak heuristic, mismatched with save-time validation
- tag: QUALITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L9371 vs L16457
- evidence:
  ```js
  return !!(s.copilotKey&&s.copilotKey.length>10);   // isConfigured
  // save-time: if(!key.startsWith('sk-or-')&&!key.startsWith('sk-')){ confirm(...) }
  ```
- observed/why: `isConfigured()` accepts any >10-char string as "configured", enabling Send,
  while save-time only *warns* (doesn't block) on non-`sk-` keys. A user who saved a bad
  string passes `isConfigured()`, sends, and gets a raw 401 ("Invalid API key") — handled,
  but the "Ready" dot/green state misleads them first. Minor trust/UX gap. Not security:
  the key is never leaked (verified — see note below).
- fix: Make `isConfigured()` for OpenRouter also require the `sk-`/`sk-or-` prefix so the
  status dot reflects reality.

---

### C08a-10: SECURITY — key handling and provider isolation are correct (positive finding)
- tag: SECURITY | severity: POLISH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L10112–10125, L10440–10453, L6608–6612, L7016, L8851, L16450–16607
- evidence:
  - Ollama branch sets `streamHeaders={'Content-Type':'application/json'}` only (L10114) and
    `_apiFetch` Ollama branch likewise (L10442) — **no `Authorization` header**, so the
    OpenRouter key can never leak to `localhost`.
  - OpenRouter branch puts the key only in `Authorization: Bearer ${settings.copilotKey}`
    sent to `https://openrouter.ai` (L10117–10119).
  - Key is scrubbed from the serialized blob (`_stateForPersist` L6608–6612), from exports
    (L7016), and the sync payload excludes `meta` (L8851 comment + code).
  - UI never prints the raw key to console; it is masked to bullets+last4 in Settings
    (L16508, L16583) and stored via `Secrets.saveKey`.
  - The whole file has only ~9 `console.*` calls (per MAP); none echo the key.
- observed/why: Documented as a PASS so the audit record shows this was checked, not skipped.
  No action.
- fix: none.

---

### C08a-11: SECURITY — AI tool writes to user data are gated and undoable (positive, with one caveat)
- tag: SECURITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L9596–9658 (`_executeTool`), L9634–9637 (scope gate), L9641–9656 (autoApply vs queue)
- evidence:
  ```js
  if(this._isWriteTool(name)){
    if(scope!=='full'&&COPILOT_TOOLS_STANDARD_ALLOWED.indexOf(name)<0){
      return {error:'Out of scope...'}; }
    ...
    if(autoApply){ State.pushUndo(); ...apply... }
    else { n.copilotQueue.push(...); }   // human review, default
  }
  ```
- observed/why: A model response **can** mutate user data (chronicle/NPCs/stats/faction
  stance) — but only: (a) write tools gated by `copilotScope` with `update_faction_stance`
  and `update_nation_stat` requiring explicit `full` scope; (b) `copilotAutoApply` defaults
  `false` (L4736), so by default every write is queued for human Approve/Reject (L9648–9656,
  queue UI L9757–9803); (c) auto-apply still `pushUndo`s so one Ctrl+Z reverts; (d) tools
  resolve against `_streamingNationId` (P1.8, L9599–9603) so a mid-stream nation switch can't
  redirect a write to the wrong realm. This is a solid least-privilege design.
  **Caveat (the only real risk):** with `copilotScope:'full'` AND `copilotAutoApply:true`,
  a prompt-injected or hallucinating model can silently apply `update_nation_stat` /
  `update_faction_stance` with no confirmation. Each is undoable, but a long tool loop could
  stack several writes before the GM notices. Both toggles are off by default, so this is
  opt-in self-harm, not a default hole. Worth a one-line warning in the Settings UI next to
  the auto-apply toggle.
- fix: Add a confirm/warning when enabling `copilotAutoApply` together with `full` scope;
  optionally cap auto-applied writes per turn.

---

### C08a-12: Bug-A abort/torn-write guard is correct (positive finding, verified by trace)
- tag: QUALITY | severity: POLISH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L9807, L10300–10331 (finalize guard), L10426–10431 (`cancel`), callers L6693/6709/6871
- evidence:
  ```js
  cancel(opts){ if(opts&&opts.discard)this._aborted=true; if(this._abortController)this._abortController.abort(); }
  // finalize:
  if(!this._aborted){ ...write assistant message + persist... } // skipped on discard
  ```
- observed/why: Documented as a PASS. undo/redo replace `State.data` synchronously *after*
  calling `cancel({discard:true})`; because JS is single-threaded the abort's rejection runs
  as a later microtask, so the in-flight `reader.read()` throws `AbortError` only after
  `State.data` is swapped, and the `_aborted` guard then bails on the stale assistant-message
  write — preventing the resurrected-turn torn-write the comments describe. switchNation does
  NOT replace `State.data` (only `activeNationId`), so already-auto-applied tool writes there
  correctly persist. No action.
- fix: none.

---

## Summary

Counts by severity:
- CRITICAL: 0
- HIGH: 0
- MEDIUM: 3  (C08a-1 tool-result drop at cap, C08a-2 snake_case italic corruption, C08a-5 max_tokens truncation)
- LOW: 6  (C08a-3, C08a-4, C08a-6, C08a-8, C08a-9, C08a-11 caveat)
- POLISH: 3  (C08a-7, C08a-10, C08a-12 — two are positive PASS notes)

Top 3 findings:
1. **C08a-1** — At the 5-iteration cap, the final round's tool results are executed but never
   sent back to the model, so the conversation ends with no synthesis. Loop should reserve a
   final tool-disabled turn.
2. **C08a-2** — Markdown italic regex turns `food_production and raw_materials` into
   `food<em>production and raw</em>materials`, corrupting the exact snake_case stat names the
   model is instructed to use. Most visible everyday Copilot defect.
3. **C08a-5** — `max_tokens:1500` silently truncates long GM answers and unparseable
   mid-emission tool-call arguments; `finish_reason:'length'` is captured but never surfaced
   or continued.

**Continues past L10250 (for C08b):** `streamOnce`'s body (tool-call fragment accumulation,
the parse `try/catch`, `toolCalls` filter, `return`) ends ~L10265; the tool-call loop,
finalize/abort block, `_updateStreamingMessage`, `cancel`, `_apiFetch`, `_apiFetchJson`,
`_maybeSummarize`/`_runSummarization` all live L10266–11123 — I read and covered them here,
so C08b can skip re-auditing the streaming core and focus on the 17 one-shot generators that
call `_apiFetch`/`_apiFetchJson` downstream.

**Security bottom line:** No key leakage, correct per-provider header isolation, scope-gated
+ queued + undoable AI writes, sound abort guard. The AI layer is the most defensively-coded
part of the app reviewed here. The only opt-in risk is `full` scope + auto-apply (C08a-11).
