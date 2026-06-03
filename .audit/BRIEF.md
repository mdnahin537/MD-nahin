# RealmWright V7 — Sub-agent Audit Brief & Rubric

**Target file (READ ONLY — never modify):**
`/root/.claude/uploads/c01e2694-58fb-4cef-99ea-42e4d95e9f1d/6b9eaae1-relamwrith_V7.HTML`

**What it is:** single-file vanilla-JS app — a fantasy TTRPG worldbuilding + Game-Master session-prep tool. Paid (device-licensed via a Cloudflare Worker + Turnstile). AI "copilot" via OpenRouter or local Ollama. Data in one IndexedDB key-value store. Architecture map: `.audit/MAP.md` (read it first).

## How to work (non-negotiable)
1. **Read ONLY your assigned line range** (use Read offset/limit). You MAY `grep`/`sed` the whole file to check whether a symbol is defined/called/referenced elsewhere — that's required for wiring checks. Do not read the whole file into context.
2. **Cite exact line numbers** for every finding. No line number = not a finding.
3. **Evidence before claims.** Quote the offending code. If you're inferring, say so and lower confidence. Never invent behavior.
4. **Run pure logic in Node when feasible.** If a function has no DOM/network dependency (parsers, math, migrations, string/template, sanitizer regex, stat calc), extract it, feed real inputs, run it with `node`, and paste the actual output as proof. This is real behavioral testing — do it wherever you can.
5. **Don't fix anything this pass. Report only.**

## Classify every finding (tag)
- `BUG` — incorrect behavior, logic error, edge case, race, crash, wrong result.
- `WIRING` — defined-but-never-called, called-but-never-defined, event bound to missing element, handler that no-ops, broken handoff (A sends data B ignores), init-order problem.
- `DEAD` — unreachable / unused code, CSS selectors with no matching DOM.
- `SECURITY` — XSS/innerHTML sink, unsafe sanitizer gap, secret/key exposure, license bypass, unsafe AI tool-call, missing validation, CSP issue.
- `PERF` — O(n²), unbounded loops, big sync writes, layout thrash, memory leak (listeners never removed), redundant re-render.
- `QUALITY` — duplication, dead complexity, "is there a better way", naming, fragility, maintainability.
- `CONFIG` — intentional placeholder awaiting Hunter's value (e.g., empty key). NOT a bug — but flag if an empty value breaks a code path with no guard.
- `UX` — confusing/broken user-facing behavior, a11y, mobile.

## Severity
`CRITICAL` (data loss, security hole, money/license bypass, app won't work) · `HIGH` (feature broken / silently fails) · `MEDIUM` (degraded / edge-case) · `LOW` (minor) · `POLISH` (cosmetic/quality).

## Confidence
`HIGH` (proven, ran it / unambiguous) · `MED` (strong inference) · `LOW` (suspicion — flag for follow-up).

## Tag if it needs a live browser/network to confirm
Add `NEEDS-LIVE-VERIFY` (we have no browser, the license Worker is unreachable, OpenRouter is 403 here).

## Output
Write findings to `.audit/findings/<your-chunk-id>.md`. One finding per block:

```
### <CHUNK>-<n>: <short title>
- tag: BUG | severity: HIGH | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: L<start>(–L<end>)
- evidence:
  `<quoted code>`
- observed/why: <what's wrong and why it matters, plain>
- fix: <concrete recommended change — 1-3 lines>
```

End the file with a `## Summary` block: counts by severity, and your top 3 findings.
Then return (as your final chat message) just: chunk id, counts by severity, and the single worst finding. Keep the chat return under 150 words — the file is the deliverable.

## Look for things nobody asked about
Hunter's instruction: find what we didn't think to ask. Beyond the rubric, surface anything that would embarrass a paid product: silent data corruption paths, migration that drops fields, listeners that leak, a feature that looks wired but no-ops, copy/UX that breaks trust, accessibility failures, anything that isn't operating at full potential.
