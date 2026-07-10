# C08b — Copilot part 2: canon parsing + application (L10251–11125, plus parser/apply at L8259–8387)

Scope: the [CANON] block parser (`Parse.canonBlock` L8259), the fuzzy stat matcher (`matchStatKey` L8326), the State-mutation apply (`applyCandidates` L8348), the review/accept UI (`Modals.openCanonReview` L8595), the three entry flows (post-stream L10365; paste/sweep L15955–16001; decipher L17418), and the non-streaming fetch (`_apiFetch` L10436). Parser + matcher + apply logic extracted verbatim and run in Node against adversarial inputs (`/tmp/canon_test.js`, `/tmp/canon_test2.js`); real output quoted below.

Format constants confirmed: `SAFETY_PREAMBLE` L4794, `CANON_SUFFIX` L4795, `SWEEP_PROMPT` L4796. Parsed canon is written to State by `Parse.applyCandidates` (L8348) → `n.chronicle/factions/characters/artifacts` + `State.setStat`, gated behind the user-accept checkbox UI in `openCanonReview` (L8690-8697).

---

### C08b-1: Decimal stat deltas silently dropped — common AI output format fails to apply
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8293–8294 (regexes), effect at L8298–8300
- evidence:
  `let m=cleaned.match(/^(.+?)\s*:\s*([+-]?\d+)\s*$/); if(!m)m=cleaned.match(/^(.+?)\s+([+-]?\d+)\s*$/);`
  Node run, test 8 (`Stat: Trade +3.9`, `Stat: Corruption -2.5`):
  `cand(1): [{statName:"Legitimacy",delta:7}]  fail(2): ["unparseable stat (need name and ±N) :: Stat: Trade +3.9", "... :: Stat: Corruption -2.5"]`
- observed/why: The integer pattern is anchored to end-of-string (`\d+$`), so any decimal (`+3.9`) fails to match entirely and is pushed to `failures` — the change is dropped, not rounded. LLMs routinely emit decimal or "+3.5"-style deltas. The user sees a vague "couldn't parse" toast and the intended stat change is silently lost. This is the single most likely real-world data-loss path in the canon pipeline: a well-meaning AI proposal that the parser quietly discards.
- fix: Parse a float then round: match `([+-]?\d+(?:\.\d+)?)` and `delta=Math.round(parseFloat(m[2]))` (apply already clamps).

---

### C08b-2: AI-supplied `visibility` is never validated against the enum — secret events leak as public
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: parse L8305 (`visibility:p[3]||'public'`), apply L8368 (`visibility:c.visibility||'public'`); enum-consumers L7559/7582/7933/8005–8006/8041/8218
- evidence:
  Node test C (`Event: X | NotAType | +3 | superPublic | d`):
  `cand: [{type:"event",name:"X",evType:"NotAType",weight:3,visibility:"superPublic",description:"d"}]`
  Consumers compare against literals only, e.g. L8005-8006:
  `if(e.visibility==='private'&&!settings.showSecrets)return false; if(e.visibility==='forecast'&&!settings.showForecasts)return false;`
- observed/why: `evType` IS clamped at apply (`CLAMP.eventType`, L8368) but `visibility` is NOT — no `CLAMP.visibility` exists. The app's enum is `public|private|forecast`. If the AI writes `secret`, `hidden`, `Secret`, or any non-`private` synonym for a sensitive event, every "is it hidden?" filter falls through to *show it*. A GM accepts a CANON line believing an event is secret; it renders publicly in the chronicle, tooltips, and detail panel. Direct trust/data-integrity failure for a worldbuilding tool whose whole point is managing hidden canon.
- fix: Add `CLAMP.visibility(v){return ['public','private','forecast'].includes(v)?v:'public';}` and apply it in both parse and `applyCandidates`.

---

### C08b-3: `ev.visibility` reaches innerHTML un-escaped — latent XSS sink for AI-derived string
- tag: SECURITY | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8220–8225 (`content.innerHTML=...`), specifically L8222 and L8048
- evidence:
  `<div class="detail-panel__meta">${Utils.escHtml(ev.type)} · weight ${weightDisplay} · ${ev.visibility}${ev.source?...}`
  and tooltip L8048: ``...wt${ev.weight>0?'+':''}${ev.weight} · ${ev.visibility}``
- observed/why: Every sibling field here is wrapped in `Utils.escHtml`, but `ev.visibility` is interpolated raw into an `innerHTML` string. Combined with C08b-2 (visibility is attacker/AI-controlled and unvalidated), a canon event with `visibility: <img src=x onerror=...>` — accepted by the user — would inject when the detail panel or timeline tooltip renders. Lower severity because it requires user-accept of a visibly weird candidate, and the primary text sinks (`name`, `description`) correctly use `escHtml`/`Markdown.render` (which escapes + runs DOMPurify, L5878/5922). But it's an obvious escaping omission on an AI-sourced field. NOTE for the security pass.
- fix: `${Utils.escHtml(ev.visibility)}` at L8222 and L8048; fixing C08b-2 also removes the vector.

---

### C08b-4: Duplicate chronicle events are never deduped — re-running canon doubles history
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8368 (event push) vs L8371–8372 (faction dedup)
- evidence:
  `else if(c.type==='event'){const ev={...};n.chronicle.push(ev);...}` — unconditional push.
  Factions guard: `const dupe=n.factions.find(f=>f.name.toLowerCase()===c.name.toLowerCase()); if(!dupe){...}`
  Node apply test ("Event: The Founding ..." duplicating an existing event): `chronLen 1 → 2`.
- observed/why: Factions are deduplicated case-insensitively, but events (and characters, and artifacts) are not. The same applies for characters L8374 and artifacts L8375. Because the post-stream scan, the paste flow, the sweep flow, AND decipher all funnel into the same `applyCandidates`, a user who re-pastes a response, or accepts a [CANON] block twice, silently duplicates every event/character. For a canon ledger this is corruption: the chronicle is the source of truth for stability math and AI context (`[CHRONICLE_FULL]` L4969).
- fix: At minimum dedupe events on (name+year) and characters on name, mirroring the faction guard; or surface a "looks like a duplicate" flag in the review modal.

---

### C08b-5: Sweep & decipher flows apply canon to a non-active nation without the mismatch guard
- tag: BUG | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: paste flow L15960–15963 (has guard) vs sweep L15992–15995 and decipher L17444 (no guard)
- evidence:
  Paste warns: `if(pending&&pending.nationId!==State.data.meta.activeNationId){... 'Results will apply to "'+pnation.name+'"'}`
  Sweep: `const nid=State.data.meta.workflowState?.promptPending?.nationId||State.get().id; ... Modals.openCanonReview(parsed.candidates||[],nid,...)` — no active-nation comparison, no warning.
- observed/why: `applyCandidates(nid,...)` writes to whatever `nid` the pending workflow recorded. The paste handler shows a "this prompt was filled for X, you're viewing Y" warning; the sweep and decipher handlers do not. If the user switched nations between filling a prompt and processing the swept/deciphered result, canon lands on the background nation with no notice. The review modal header doesn't name the target nation either (L8595), so there's no second chance to catch it.
- fix: Hoist the paste flow's mismatch check into a shared helper and run it in the sweep and decipher paths; or render the target nation name in the `openCanonReview` header.

---

### C08b-6: Missing/malformed closing `[/CANON]` makes the parser swallow all trailing prose as canon
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8266, L8270
- evidence:
  `const endRaw=lc.indexOf('[/canon]',start); ... let block=text.slice(startEnd+1,endRaw>-1?endRaw:text.length);`
  Node test 3 (no `[/CANON]`) parses 2 candidates from the tail; test A (`[/CANON gone]` typo close) slices to end and parses everything after the open tag.
- observed/why: If the model opens `[CANON]` but the closing tag is absent or misspelled (`[/CANON ]`, `[/ CANON]`, fenced/truncated output), the parser treats the entire remainder of the response as the block. Any later line the model writes in normal prose that happens to start `Stat:`/`Event:`/`Faction:`/`Character:`/`Artifact:` becomes a real candidate. Streaming responses that get cut off at the token cap (max_tokens 1500) are exactly the case where the close tag is missing. Best case: noise candidates in the review modal; worst case: the user accepts a malformed proposal.
- fix: When `endRaw===-1`, either bail (treat as no block) or cap the slice at the first blank line / first non-canon-prefixed line after the open tag.

---

### C08b-7: No prototype-pollution via `__proto__`/`constructor` stat names — but only by luck of the lookup shape
- tag: SECURITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: parse L8297, matcher L8331–8345, apply L8358–8362
- evidence:
  Node apply test ("Stat: __proto__ +5"): `unmatched:["__proto__"] ; ({}).polluted = undefined` — no pollution.
- observed/why: A `__proto__`/`constructor`/`prototype` stat name is parsed into a candidate, but `matchStatKey` iterates `Object.keys(n.stats)` and compares values, so a dangerous key never matches a real stat and lands in `unmatched` (no write). This is currently SAFE. Flagged LOW only because the safety is incidental: it holds because stat application goes through a key allow-list (`matchStatKey`), not because the parser rejects the name. Any future code that does `n.stats[c.statName]=...` directly (bypassing the matcher) would be immediately exploitable. Document the invariant.
- fix: None required now; add a guard `if(['__proto__','constructor','prototype'].includes(want))return null;` at the top of `matchStatKey` to make the safety explicit and future-proof.

---

### C08b-8: Non-streaming fetch — network-level failures surface raw `Failed to fetch` to the user
- tag: QUALITY | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L10478–10486
- evidence:
  `const resp=await fetch(url,fetchOpts); if(!resp.ok){... 401/402/429 mapped ...}` — only HTTP-status errors get friendly messages.
- observed/why: HTTP errors are handled well (401→"Invalid API key", 402→"Out of credits", 429→"Rate limited", JSON-parse of the error body is try-wrapped). But a true network failure (offline, DNS, CORS, Ollama not running) makes `fetch` reject before `resp` exists, throwing the raw `TypeError: Failed to fetch`. That string propagates to each generator's caller and is shown verbatim (e.g. decipher L17454 `'Decipher failed: '+err.message`). Not silent, just an unbranded/confusing message — especially for the local-Ollama provider where "not running" is the common case. Note: the Ollama branch (L10440) builds a `localhost` URL with no key check, so a down server is the expected failure here.
- fix: Wrap the `fetch` call in try/catch and rethrow a friendly "Couldn't reach the AI provider — check your connection (or that Ollama is running)." on a network-level reject.

---

### C08b-9: `_apiFetchJson` retry is silent and uncosted-distinct; deep malformed-JSON path OK
- tag: QUALITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L10506–10539
- evidence:
  Three-pass `tryParse` (as-is → strip fences → slice first `{`..last `}`), then one retry with a strict suffix, then `throw new Error('...malformed JSON twice...')`.
- observed/why: This path is actually robust — good defensive parsing and a clear terminal error. Minor: the retry doubles token spend with only a `(retry)` label appended to the transparency log; a user watching cost sees two charges for one logical call with no explanation. Several sibling one-shot generators (`importFromText` L8619, `generateSecrets` L8673, `generateSessionPrep` L8864) re-implement the same fence-strip/brace-slice inline instead of reusing `_apiFetchJson` — duplication, and they lack the one-retry that `_apiFetchJson` has, so they fail harder on first malformed JSON.
- fix: Route the inline-JSON generators through `_apiFetchJson` to gain the retry + dedupe ~5 copies of the brace-slice block.

---

## Summary

Counts by severity:
- CRITICAL: 0
- HIGH: 2 (C08b-1 decimal stat drop; C08b-2 unvalidated visibility leaks secrets)
- MEDIUM: 4 (C08b-3 visibility XSS sink; C08b-4 event/char dup corruption; C08b-5 sweep/decipher wrong-nation; C08b-6 unclosed-block prose swallow)
- LOW: 3 (C08b-7 proto-pollution safe-by-luck; C08b-8 raw network error; C08b-9 JSON retry/dup)

Overall the canon pipeline is defensively built: HTML is escaped at the primary sinks (`escHtml`, `Markdown.render`→DOMPurify L5922), stat deltas are clamped (L8361), the fuzzy matcher refuses ambiguous matches, factions dedupe, prototype pollution doesn't land, and the user must accept each candidate. The real risks are **silent data loss/corruption**, not crashes: decimal deltas dropped, secret-visibility events leaking public, and duplicate events accumulating in the canonical ledger.

Top 3:
1. **C08b-2 (HIGH):** AI `visibility` is never clamped to `public|private|forecast`; a secret-intended event renders publicly because every filter compares against the literal `'private'`. Trust-breaking for a hidden-canon tool. (L8368)
2. **C08b-1 (HIGH):** Decimal stat deltas (`+3.9`) silently fail the integer-anchored regex and are dropped, not rounded — the most common silent loss of an accepted AI change. (L8293-8300)
3. **C08b-4 (MEDIUM):** Events/characters/artifacts have no dedup (factions do); re-pasting or re-accepting a [CANON] block doubles chronicle history that feeds stability math and AI context. (L8368)
