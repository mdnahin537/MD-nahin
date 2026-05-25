# LENS 2 — Copilot / AI Subsystem Audit

Scope: the entire Copilot/AI subsystem in `src/index.html` plus the demo proxy `worker/src/demo.ts`.
Method: read of the actual code (Copilot module 8023–9457, COPILOT_TOOLS 8008–8021, canon parser 6954–7081, canon review modal 7258–7362, demo client 4975–5031 / 9695–9736, settings UI 2994–3061, defaults 3791, key/provider UI 13716–13774, worker demo.ts in full).

Known/acknowledged: the worker reads `turnstileToken` (camelCase, with `turnstile_token` fallback), enforces per-IP + global daily KV caps, reserves slots before the upstream call, and overrides the model server-side. Licensed users call OpenRouter directly with their own key. That contract is broadly sound — findings below are where the **client** half of it, and the rest of the subsystem, are not.

---

## SOUNDNESS

### 1. Two parallel, divergent apply pipelines — tool-calls vs CANON text block — Soundness/High — `index.html:8568` (send), `8546` (system prompt), `8804` (canon detect)
**What:** The streaming `send()` enables OpenAI-style function-calling (`body.tools=COPILOT_TOOLS; tool_choice='auto'`) AND, after the stream finishes, scans the same assistant text for a `[CANON]...[/CANON]` block and opens a *second*, independent review modal. But `buildSystemPrompt()` (8546) instructs the model **only** about the CANON block. It never mentions that tools exist, what they do, or when to prefer a tool over a CANON line. The model is handed two mutation channels and told about one.
**Why it matters:** Behaviour is non-deterministic and model-dependent. A model that "sees" the tools may write a chronicle entry via `add_chronicle_entry` (→ queue/auto-apply), *or* emit a CANON `Event:` line (→ canon-review modal), *or both for the same intent* — producing duplicate writes and two competing review surfaces. The two paths also have different validation, different undo behaviour (tool path = per-tool `pushUndo`; canon path = one `pushUndo` for the batch), and different dedup (canon dedups factions by name at 7066; tool path does not). This is the single least-sound part of the subsystem.
**Better:** Pick one channel. If keeping tools, document them in the system prompt and drop CANON from streaming chat (or vice-versa). If both must coexist, the system prompt must state the rule ("use tools for structured changes; never also emit CANON"), and the post-stream canon scan should be suppressed when any tool call fired this turn.
CROSS-REF: flow/state=L3 (undo semantics differ between paths), ui=L4 (two review surfaces).

### 2. Tool-call arguments are not schema-validated before mutating state — Soundness/High — `index.html:8728`, `8309` (_buildProposal), `8246` (_executeTool)
**What:** Streamed `tool.function.arguments` is `JSON.parse`d with a bare `catch(e){args={}}` (8730). `_buildProposal` then checks only presence of required fields and types for a couple of cases. There is no enforcement of the declared JSON-Schema enums/ranges. `add_chronicle_entry` declares `type` enum (Political/Economic/…) and `weight` -30..+30, but `_buildProposal` (8312) accepts **any** string for `type` and **any** numeric `weight` (only `typeof==='number'`, no clamp). `add_npc.status` enum is likewise unenforced. `update_nation_stat` clamps the result value but not the delta.
**Why it matters:** A hallucinated `type:"Magical"` or `weight:9999` flows straight into the chronicle and into `Compute.stability`/`Compute.pressures` math (L5 territory). With `copilotAutoApply` on, this writes silently with no human gate. Garbage-in to the domain model.
**Better:** Validate args against the declared schema in `_buildProposal` (whitelist enums, clamp numeric ranges to the schema bounds) and return `{error}` on violation so the model can self-correct in the tool loop.
CROSS-REF: security=L1 (untrusted-input → state), algorithms=L5 (bad weights corrupt stability math).

### 3. `copilotScope` and `copilotAutoApply` have NO settings UI — Soundness/Medium — `index.html:3791`, `8254`, `8288`
**What:** Both keys exist in `DEFAULT_SETTINGS` and are read by the dispatcher (`scope` gates which write tools run; `autoApply:true` applies writes with **zero user confirmation**). A grep of the entire file finds no `copilot-scope` / `copilot-auto-apply` form control — only the radio for provider and the model select. There is no way for a user to turn these on through the UI.
**Why it matters:** Two outcomes. (a) The auto-apply / full-scope code paths (8288–8294, including `update_nation_stat` and `update_faction_stance`) are effectively **dead code** for normal users — meaning they are also largely *untested in production*. (b) If a user (or a future import/migration, or a hand-edited save) ever sets `copilotAutoApply:true`, the model can mutate stats, faction stances, the chronicle, NPCs and hooks **without any review modal or confirmation**, undo being the only safety net. That is a meaningful safety surface with no visible control or warning.
**Better:** Either expose both as explicit, clearly-labelled settings (with a warning on auto-apply) or remove the unused paths. If kept, auto-apply should still surface a non-blocking toast naming each applied change.
CROSS-REF: ui=L4 (missing settings control), security=L1 (silent state mutation surface).

### 4. Demo client ignores the worker's `fallback` flag and HTTP status — Soundness/Medium — `index.html:9713`, `5027`
**What:** The worker returns `{ error, fallback:true }` with status 429/502/503 for "at capacity," "out of per-IP quota," and "not configured" (demo.ts 64/97/109/137/143). The client's `_runDemoGeneration` (9713) only does `if(result.error){ show error text; re-render captcha; return; }`. It never reads `result.fallback` or `result.status`. The contract's whole point — *push the user to Sample Mode when capped* — is not honoured. The user just sees the raw error string ("The free demo is at capacity for today. Try Sample Mode…") with no Sample-Mode button next to it, even though `_handleSample()` exists right below (9738).
**Why it matters:** Dead-ends a converting visitor at the exact moment the system intends to offer the free fallback. Lost demo → lost potential sale.
**Better:** When `result.fallback` is truthy, render an inline "Try Sample Mode" button (call `_handleSample`) alongside the message instead of a plain error div.
CROSS-REF: ui=L4 (conversion UX).

### 5. Demo `consume()` / counter only runs on success, but worker already spent the slot — Soundness/Low — `index.html:9719`, demo.ts:118
**What:** The worker reserves the IP+global slot *before* the upstream call (demo.ts 116–119), correct for overspend protection. The client calls `DemoCounter.consume()` only after a successful response (9719). If the upstream model call fails (502, returned with `fallback`), the worker has already burned the IP slot but the client's local counter doesn't advance — and because of finding #4 the client doesn't even surface that. Local "previews left" can disagree with the server's real remaining count. The server is authoritative (good), but the client's `remaining_today` display (9723) only updates on success, so after a failed-but-charged attempt the shown number is stale-high.
**Why it matters:** Minor user confusion; not a spend risk (server is the source of truth). Worth noting because the two counters can drift.
**Better:** Trust `remaining_today` from every response (including error responses — the worker could include it on 429/502), and treat its absence as "unknown" rather than reusing the old value.

### 6. `_apiFetchJson` retry doubles cost on malformed JSON with no user signal until total failure — Soundness/Low — `index.html:8914`, `8942`
**What:** On unparseable JSON the helper silently fires a **second** full request (8942) with a stricter suffix. Both calls bill. Only if the second also fails does the user see an error (8947). For expensive models (Opus) on large `full`-depth context this is a silent 2× spend.
**Why it matters:** Cost surprise; acceptable as a reliability tactic but invisible. The transparency log does record both (labelled "(retry)"), so it's logged but not flagged.
**Better:** Fine to keep the retry; consider a cheaper forced model for the retry, or surface "retried once" in the cost stamp.

---

## OPTIMIZATION

### 7. Full world-state context rebuilt and resent on **every** chat turn — no prompt caching, no diffing — Optimization/High — `index.html:8615`, `8455`
**What:** `send()` calls `buildContext(n)` every turn and prepends the entire system prompt + full world dump to the messages array. At `medium` depth that's ~30 chronicle events + all factions + all NPCs + hooks + pressures, regenerated and resent each message. At `full` depth it's the **entire** chronicle (`chron:Infinity`, 8461). None of OpenRouter/Anthropic prompt caching is used (no `cache_control` breakpoints), so the large, stable system+context block is re-billed at full input price on every turn of a conversation.
**Why it matters:** For Anthropic models via OpenRouter, the world-state block is the dominant input cost and it is highly cacheable (changes rarely between turns). Multi-turn conversations pay 5–20× more than necessary. This is the biggest cost lever in the whole subsystem.
**Better:** Put the system prompt + world-context as a cached prefix (Anthropic `cache_control: ephemeral` breakpoint after the context block) so repeat turns hit the cache. Even simpler: only resend full context when state actually changed since the last turn, otherwise send a short delta.
CROSS-REF: see `claude-api` skill (prompt caching is its core recommendation).

### 8. `costEstimateLabel` is hardcoded to "2000 input + 600 output" and ignores depth/provider — Optimization/Medium — `index.html:8035`, `8051`
**What:** The per-message cost shown to the user is a fixed `(2000/1e6)*in + (600/1e6)*out`. But actual input scales massively with `copilotContextDepth` (low ~10 events vs full = entire chronicle, easily 10k+ tokens) and with conversation length (full history resent, finding #7). The label also returns "— ¢" for Ollama and for any unknown model, which is fine, but for OpenRouter it badly under-reports at high/full depth.
**Why it matters:** Cost transparency is a stated product value (TransparencyLog exists). A user on `full` depth + Opus sees "≈9¢" but pays multiples of that. Misleading.
**Better:** Estimate input tokens from the actual `buildContext(n).length/4` plus history length, scaled by depth; recompute on depth change.

### 9. `max_tokens` for streaming chat fixed at 1500; demo and helpers vary widely with no shared config — Optimization/Low — `index.html:8637`, demo.ts:121
**What:** Streaming chat hardcodes `max_tokens:1500` (8637). Non-stream helpers range 300–3000 scattered as literals (8974, 9022, 9054, 9259, 9435…). The worker caps at `DEMO_MAX_TOKENS||1200`. There's no single knob; tuning output cost means hunting literals.
**Why it matters:** Maintainability + cost tuning friction. 1500 output tokens with tools enabled on every turn is also generous for a chat reply.
**Better:** Centralise per-task max_tokens in a small config map.

### 10. Tool loop refetches with growing message array; tool results not size-bounded — Optimization/Medium — `index.html:8719`, `8265`
**What:** The tool-calling loop (up to 5 iterations) resends the **entire** messages array each round, now also carrying assistant tool_call turns + `role:'tool'` results. `read_chronicle` can return up to 100 full entries (8258) as JSON stuffed into a tool message (8735) that is then resent on every subsequent round. Combined with finding #7 (no caching), a single complex question can balloon input tokens across 5 round-trips.
**Why it matters:** A "summarise everything and propose changes" prompt that triggers `read_chronicle(limit=100)` then 2–3 follow-up rounds can cost many multiples of a simple turn, invisibly.
**Better:** Cap `read_chronicle` payload more aggressively for the model (it already has the context dump), and apply prompt caching to the stable prefix so only the growing tail is re-billed.

### 11. Ollama path silently disables tools and JSON-mode but UI gives no hint — Optimization/UX/Low — `index.html:8597`, `8888`
**What:** `toolsEnabled=provider!=='ollama'&&!!copilotKey` (8597) — Ollama users get no tool-calling at all, and `_apiFetch` rewrites `response_format:json_object`→`format:'json'` (8888). Functionally reasonable (local models are unreliable at OpenAI tool-calls), but the UI never tells the Ollama user that the review-queue / proposal features are off. They'll wonder why the Copilot "can't" create anything.
**Better:** Show a one-line note in the panel when provider=ollama: "Local model — chat only; proposals via CANON block."

---

## SMALLER NOTES (correct-but-worth-knowing)
- **Nation-pinning is handled well** (8246–8250): tools resolve against `_streamingNationId`, not the active nation — a real prior bug (P1.8) that is now fixed. Good.
- **Abort/cancel is sound** (8628, 8858): single AbortController, "Stop" button, aborted streams skip canon parsing (8804). Good.
- **Streaming usage fallback** (8776–8783): when upstream omits `usage`, it estimates chars/4 and labels "(~est)". Reasonable.
- **Summarization** (9398): 20-turn trigger, idle-guarded, re-verifies indices before splicing, forces JSON. Solid; only nit is it uses the user's selected model (not forced Haiku despite the comment at 9429 saying "Force Haiku-tier" — it does **not** actually force Haiku; `_apiFetchJson` uses `settings.copilotModel`). Comment is misleading and the cost-saving intent is unimplemented.
- **isConfigured** (8028): correctly gates Ollama (no key needed) vs OpenRouter (`key.length>10`). Fine. The `>10` check is crude but harmless.
- **Key storage**: `copilotKey` lives in settings/IDB (`rw_secret_copilot_key`, 5359) and is sent only to OpenRouter (8588) — no leak into prompts or the demo path. Confirmed sound (defer depth to L1).
- **Demo client passes `model`** (5020) which the worker deliberately ignores (demo.ts 131). Harmless but dead arg.

---

## TOP 3 — MUST FIX
1. **Unify the apply pipeline (finding #1).** Tools + CANON both mutate state but the system prompt documents only CANON → duplicate/competing writes, two review modals, inconsistent undo. Pick one channel and tell the model about it.
2. **Validate tool args against their declared schema before mutating (finding #2).** Enforce enums and numeric ranges (`type`, `weight`, `status`) in `_buildProposal`; reject out-of-range so the model self-corrects. Untrusted model output currently reaches the domain model raw.
3. **Honour the demo `fallback` contract (finding #4).** Client ignores `result.fallback`/status; capped visitors hit a dead-end error instead of the Sample-Mode offer the worker explicitly signals. Direct conversion loss.

## TOP 3 — OPTIMIZATIONS
1. **Add prompt caching to the world-state prefix (finding #7).** The full context is resent and re-billed every turn with no `cache_control`. Single biggest cost lever; multi-turn chats overpay 5–20×.
2. **Make the cost estimate reflect real depth/history (finding #8).** Hardcoded 2000/600 badly under-reports at high/full depth — undermines the product's transparency promise.
3. **Bound tool-loop payloads + actually force Haiku for summarization (findings #10 + summarization note).** Cap `read_chronicle` resends and implement the documented-but-unimplemented Haiku cost saver in `_runSummarization`.
