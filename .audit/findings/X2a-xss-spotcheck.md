# X2a — XSS spot-check of the main render path (main-agent, browser-independent)

Scope: the highest-value security question — does AI/user text reach the DOM unescaped? Spot-check only; the full innerHTML-sink sweep (X2) is still pending.

## Verdict: no CRITICAL XSS in the markdown path. Defense-in-depth confirmed.
- `Utils.escHtml` (L5845) escapes `& < > " ' \``  — complete.
- `Markdown.render` (L5874): escapes the *entire* input via `escHtml` FIRST (L5878), so raw HTML like `<img src=x onerror=...>` is inert before any tokenizing; markdown transforms only insert known-safe tags; then the result is passed through `DOMPurify.sanitize` with a URI allow-list (L5922). Two independent layers.
- All grepped DOM sinks (L8224, L9486, L10415, L11388, L11689, L12106, L12574, L12587, L12677, L17142, L5943) feed through `Markdown.render`; template interpolations of user data use `Utils.escHtml`/`E(...)` consistently (e.g. L7859, L12587).
- `DOMPurify.sanitize` has no direct un-escaped call sites found in this pass (only inside Markdown.render).

## X2a-1: Ships with the FALLBACK sanitizer, not real DOMPurify
- tag: SECURITY | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L3223–3281 (`/* PASTE DOMPURIFY HERE */` fallback block); comment L3224 "Replace this entire block with the official DOMPurify minified bundle before shipping."
- observed/why: The fallback (DOMParser + allow-list `clean()`) is a reasonable design and, combined with Markdown's escape-first, makes the markdown path low-risk. But as a hand-rolled sanitizer it is weaker than real DOMPurify against mutation-XSS (mXSS) and DOM quirks, and its `ALLOWED_ATTRS` permits `id` and `class` (L3233) → DOM-clobbering surface in an app that leans heavily on `getElementById`. Also: the `{ALLOWED_URI_REGEXP:...}` config Markdown passes (L5923) is **ignored** by the fallback `sanitize` (it only honors its own `SAFE_URI`), so that config is a silent no-op unless real DOMPurify is installed. Exploitability via the markdown path is low (escape-first), but any *future* code that calls `DOMPurify.sanitize()` directly on un-escaped HTML would lean entirely on this weaker fallback.
- fix: Paste the official DOMPurify minified bundle into the scaffolded block before shipping (one-line swap already designed for). If staying with the fallback, drop `id` from `ALLOWED_ATTRS` and honor the passed `ALLOWED_URI_REGEXP`.

## Still pending (needs the X2 cross-cutting pass)
Full sweep of every `innerHTML`/`outerHTML`/`insertAdjacentHTML` sink for any that bypass `escHtml`/`Markdown.render`; the AI tool-calling execution safety; the license/Worker protocol; `credentials:'include'` CSRF surface. This spot-check covered only the main markdown path.
