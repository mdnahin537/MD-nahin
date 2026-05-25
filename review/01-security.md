# LENS 1 — Security & Data Integrity Audit

**Target:** `/home/user/MD-nahin/src/index.html` (~14,850 lines) + `/home/user/MD-nahin/worker/src/*.ts`
**Scope:** XSS sinks, secret handling, persistence/data-loss, client→Worker trust, dangerous primitives. Research only — no code changed.

---

## Acknowledged known issues (one line each — see new findings below for what else is wrong)

- **(a) Fallback sanitizer hoists children of disallowed tags without re-cleaning** — `clean()` at `index.html:2416` does `while(child.firstChild)node.insertBefore(...)` then re-loops, but the loop index `i` already advanced past the hoisted nodes, so hoisted children are NOT re-walked. Real bypass — confirmed.
- **(b) Fallback `sanitize(dirty,_cfg)` ignores its config arg** — `index.html:2445`; the `ALLOWED_URI_REGEXP` passed by `Markdown.render` (`:4705`) is silently dropped.
- **(c) `copilotKey` lives in plaintext in memory and in the undo stack** — confirmed and expanded in Finding 2 below (it leaks to *more* places than the undo stack).

---

## NEW / DEEPER FINDINGS

### 1. `Utils.escHtml` does not escape quotes → dozens of attribute-breakout XSS sinks — **Critical** — `index.html:4638` (sink examples: `:12323`, `:11168`, `:12194`, `:10420`, `:10535`, `:6594`, `:10740`, `:13737`, `:14102`)

**What's wrong.** `escHtml(s){_escDiv.textContent=s;return _escDiv.innerHTML}`. The HTML element-content serialization algorithm escapes only `&`, `<`, `>`, and ` ` — it does **not** escape `"` or `'`. Verified at runtime: input `x" onfocus=alert(1) autofocus x` survives escHtml with the raw double-quote intact. The entire codebase treats `E()` as if it were attribute-safe and interpolates it inside double-quoted HTML attributes across ~40+ template-literal sinks.

The clearest exploitable case is `index.html:12323`:
```js
<input ... value="${E(notes)}" ...>
```
`notes` is free-text the user types into the realm-relations panel (`State.setRelation`, `:12333`). A note of `"><img src=x onerror=alert(document.domain)>` breaks out of the `value` attribute and injects a live `<img>` that fires on every re-render of the panel. The same data also arrives via **imported JSON** — `relations` is preserved verbatim in `buildNationFromSeed` (`:5138`) — so a malicious `.realmwright.json` shared between GMs is a stored-XSS delivery vehicle.

Other live vectors with attacker/AI/import-controllable text in quoted attributes: faction-name checkboxes `data-hfaction="${E(f.id||f.name)}"` (`:10420`, `:10535`), `<option value="${E(f.name)}">` (`:10740/10764/10823/14102`), bestiary `aria-label="Delete ${E(en.name)}"` (`:12194/12195`), hook `aria-label="Open hook: ${E(h.title)}"` (`:11168/11254`), stat `title="${E(s.description||'')}"` (`:6594`), and Ollama model names `value="${Utils.escHtml(m.name)}"` (`:13737`).

**Why it matters.** Single-page app, single origin, IndexedDB full of the user's worlds and (in memory) the OpenRouter API key. One successful script execution can exfiltrate `copilotKey`, the license record, and the entire world DB to an attacker server (the CSP `connect-src` allows `openrouter.ai` and the worker, and `'unsafe-inline'` means injected inline handlers run — see Finding 6). Attribute-context injection bypasses the `<>&`-only escaping entirely; the `<img onerror>` payload needs no `<script>`.

**Better fix.** Replace `escHtml` with a serializer that also escapes `"` → `&quot;` and `'` → `&#39;` (and `` ` ``), e.g. a static `.replace()` chain instead of the DOM round-trip; that one change closes every attribute sink at once. Strategically, stop hand-building attribute strings: use `el.setAttribute(name, value)` / `dataset` / `el.value = …` (which never need escaping) for any attribute carrying dynamic data. Keep template literals only for static/text content.

**CROSS-REF:** L4 (UI) — every render function that builds attributes from entity data; L3 (state/flow) — import path (`handleImport`/`buildNationFromSeed`) is the persistence vector.

---

### 2. `copilotKey` leaks to disk via the auto-backup writer and the fallback download — **High** — `index.html:5084`, `:5100`

**What's wrong.** Secret-scrubbing is applied only on the IDB/localStorage *persist* path (`_stateForPersist`, `:5374`) and on snapshots (`:5773`). But the AutoSave file-system writer serializes the **live** state directly:
```js
await writable.write(JSON.stringify(State.data,null,2));   // :5084
const blob=new Blob([JSON.stringify(State.data,null,2)],…); // :5100 fallback download
```
Because `load()` rehydrates `State.data.meta.settings.copilotKey` from the Secrets store into memory (`:5436`), `State.data` carries the plaintext key. The auto-backup file written to the user's chosen folder (and the fallback `.json` download) therefore contains the OpenRouter key in cleartext. `exportJSON` (`:7508`) is *fine* — it only serializes `nations`, not `meta` — but the auto-backup path was missed.

**Why it matters.** The key ends up in a file on disk / in the user's Downloads folder, surviving `resetAll()` and the Secrets-store wipe. Backups get synced to Drive/Dropbox, attached to support tickets, committed to repos. This is exactly the leak the P1.13 redesign was meant to prevent, defeated on a path the author forgot to route through `_stateForPersist`.

**Better fix.** Route *every* serialization sink through a single `serializeForExternal()` that strips `copilotKey` (and any future secret). Make `_stateForPersist` the only place `State.data` is ever `JSON.stringify`'d for output; have AutoSave and both exporters call it.

**Also (confirms known issue c, deeper):** `pushUndo()` (`:5453`) does `JSON.stringify(this.data)` — the full in-memory state **with** the live key — and stores up to 25 of them in `_undoStack`. The key is therefore replicated 25× in plaintext in memory, and `undo()/redo()` (`:5466/5480`) re-inject it. Fix: snapshot `_stateForPersist()` into the undo stack, or diff-based undo, so the secret never enters the history buffer.

**CROSS-REF:** L2 (copilot) — owns the key lifecycle and the OpenRouter call that consumes it; L3 (state) — undo/redo and persist plumbing.

---

### 3. Snapshot restore silently reverts in-place edits without warning (data loss) — **High** — `index.html:5791` (`computeSnapshotDiff`), `:5831` (`commitRestore`)

**What's wrong.** The "Preview restore" diff (`computeSnapshotDiff`) compares entities **only by ID set membership** — `added = curArr.filter(x=>!snapIds.has(x.id))`, `removed = snapArr.filter(x=>!curIds.has(x.id))` (`:5818-5819`). It never compares the *contents* of entities present in both. So if since the snapshot you rewrote an event's description, renamed a faction, retuned stats, or rewrote your notes, the diff reports **zero losses**, the UI says it's safe, and `commitRestore` (`:5833`) overwrites `State.data` wholesale — silently discarding every edit to surviving entities. `commitRestore` also clears the undo stack (`:5834`), so the reverted edits are unrecoverable.

**Why it matters.** A GM restores a 2-day-old auto-snapshot to recover one deleted NPC and silently loses two sessions of edits to everything else, with the tool having told them nothing would be lost. This is the worst class of data-loss bug: invisible and irreversible.

**Better fix.** Diff entity *contents* (field-level or a stable hash per entity), and surface a third category — "modified (will revert N edits)" — in the preview. At minimum, push the current state onto the undo stack inside `commitRestore` before overwriting so a restore is reversible.

**CROSS-REF:** L3 (state/flow) — snapshot/restore is core state machinery; L4 (UI) — the preview modal must show the new "modified" category.

---

### 4. Persist path can leave a half-written / divergent localStorage mirror; `persist()` swallows IDB failures into a debounce gap — **Medium** — `index.html:5492-5513`, `:5514-5520`

**What's wrong.** `persist` is debounced 400ms (`:5513`). On the IDB success path it then mirrors to localStorage (`:5505`); on the IDB *error* path it falls fully back to localStorage (`:5510`). Two integrity problems:
1. The localStorage mirror is written *after* IDB resolves, so a crash/tab-close in the 400ms debounce window or between the two writes leaves IDB and localStorage at **different generations**. On next load, `load()` prefers IDB (`:5394`) — fine — but if IDB is later cleared/unavailable, the stale localStorage mirror (`:5398`) silently rolls the user back without any "this is old data" signal.
2. There is **no storage-quota pre-check or chunking**. Worlds with long AI conversations + 7 full-state snapshots can blow past the ~5MB localStorage cap; the mirror write is wrapped in `try/catch` and silently dropped (`:5505`), and a large IDB blob can hit `QuotaExceededError` → the `.catch` falls back to localStorage which *also* fails → only then does the user see a toast (`:5511`). There is no proactive "you're near the storage limit" warning and no eviction of the oldest snapshot under pressure.

**Why it matters.** The user believes they're auto-saved (the indicator shows "saved" after the IDB write) while the durable copy is actually stale or absent. Combined with Finding 3, restore can't reliably bail them out.

**Better fix.** Make localStorage a *pre-write* mirror (write both before flipping to "saved", or treat IDB as sole source of truth and drop the mirror). Add `navigator.storage.estimate()` checks; when near quota, evict oldest snapshots first and warn the user. Treat any persist failure as a hard "Export now" prompt rather than a silent drop.

**CROSS-REF:** L3 (state/flow).

---

### 5. Corrupt-storage recovery can itself lose data and discards the parse on a non-string blob — **Medium** — `index.html:5325`, `:5448`

**What's wrong.** `handleCorruptStorage(raw)` (`:5325`) stashes the raw blob under `realmwright_corrupt_<ts>` *in localStorage* and then starts fresh. But (1) if the corruption was a localStorage quota problem the emergency `setItem` also fails (caught and ignored), so the only copy of the user's data is lost with no backup; (2) it's only reached from `load()`'s catch (`:5448`), and when `raw` is a non-string IDB object that fails migration, it stringifies the object to store it — fine — but the original parsed structure (potentially partially recoverable) is thrown away rather than attempting field-level salvage.

**Why it matters.** A single bad migration or truncated write turns into total data loss with the "backup" being best-effort into the very store that may be full.

**Better fix.** Write the emergency backup to IDB (separate key) rather than the possibly-full localStorage, and attempt a partial-salvage migration (keep nations that parse, drop only the broken ones) before declaring total corruption. Surface a one-click export of the corrupt blob.

**CROSS-REF:** L3 (state/flow), L5 (migration logic in `migrateIfNeeded`).

---

### 6. CSP is self-defeating: `'unsafe-inline'` in `script-src` makes the whole policy a speed bump — **Medium** — `index.html:43`

**What's wrong.** The CSP (real `<meta http-equiv>`, good) includes `script-src 'self' 'unsafe-inline'`. The in-file comment is honest about this, but the consequence is severe: with `'unsafe-inline'`, **any** injected inline `<script>` or inline event handler executes. So the CSP provides essentially no XSS containment — which is exactly the layer that should mitigate Finding 1. The connect-src allowlist still lets exfiltration reach `openrouter.ai` and the worker, both attacker-usable endpoints.

**Why it matters.** The defense-in-depth story ("real protection is DOMPurify on every sink") collapses because (i) DOMPurify is the broken fallback stub, and (ii) the sinks that matter are *attribute* sinks DOMPurify never sees (they're built by string concatenation, not run through `Markdown.render`). CSP is the backstop and it's disabled.

**Better fix.** The single-inline-script constraint can be satisfied with a per-load **nonce** (`script-src 'nonce-...'`) injected at build/deploy, or by hashing the one inline block (`'sha256-...'`) — both drop `'unsafe-inline'` and would have blocked Finding 1's `<img onerror>`/handler injection. For a truly static itch.io file, at minimum drop inline-script reliance for any future dynamic code and keep `object-src 'none'` / `base-uri 'self'` (already present, good).

**CROSS-REF:** L4 (UI) — heavy inline `style=` usage forces `style-src 'unsafe-inline'`, a smaller but related issue.

---

### 7. Worker CORS reflects `Origin: null` with credentials; demo input is unbounded → cost amplification — **Medium/Low** — `worker/src/cors.ts:8`, `worker/src/demo.ts:75`

**What's wrong.**
- **CORS:** `pickOrigin` returns `'null'` for `Origin: null` (`cors.ts:8`) and `corsHeaders` sets `Access-Control-Allow-Credentials: true` (`cors.ts:20`). `Allow-Origin: null` + credentials is a known anti-pattern: *any* sandboxed iframe, `data:`/`file:` document, or attacker page in a null-origin context can make credentialed requests to the worker. For the license/demo endpoints the blast radius is limited (no sensitive GET data is returned), but it lets arbitrary origins drive activate/deactivate against a known license key and ride the device cookie.
- **Demo cost:** `handleDemoGenerate` accepts `messages` as-is with only a `length===0` check (`demo.ts:75-79`). There's no cap on message count or per-message size. Output is capped (`max_tokens`), but **input** tokens are uncapped, so each of the 3 allowed daily calls per IP can carry a multi-hundred-KB prompt — input-token cost amplification against Hunter's OpenRouter budget.

**Why it matters.** This is the one path that spends real money. The per-IP/global caps limit call *count*, not call *cost*. A handful of IPs sending maximal prompts can still run up the bill within the allowed call budget.

**Better fix.** Drop the `'null'` reflection (or stop sending `Allow-Credentials: true` for null origin; the device token is already echoed via `X-Device-Token` header, so credentialed cookies aren't strictly required cross-origin). Cap demo input: reject if `messages.length > N` or total serialized body `> ~8KB`, and truncate/validate roles server-side.

**CROSS-REF:** L2 (copilot) — owns the demo proxy contract and message shaping.

---

### 8. License gate is purely client-side (expected, but worth stating) — **Low (by design)** — `index.html:4874` `isActive()`

**What's wrong.** `LicenseGate.isActive()` returns the locally-cached `this._data.valid` flag read from IDB (`:4870`). Anyone can set that IDB record and unlock the app; the worker's product-match check (`license.ts:73`) only gates the *activation network call*, not feature access. This is inherent to a static, offline-capable HTML file — there is no server to enforce per-feature entitlement. **Not fixable client-side.** Flagging only so the team doesn't mistake the worker paywall for runtime enforcement. The genuinely protected asset is the demo OpenRouter spend (Finding 7), which *is* server-gated.

**CROSS-REF:** L3 (flow) — license:changed event drives feature visibility.

---

## Dangerous primitives — scan result

- No `eval`, `new Function`, dynamic `import()`, or `document.write` in `src/index.html`. **Good.**
- `postMessage`: none found beyond Turnstile's own iframe (third-party, in CSP `frame-src`). No app-level message listeners trusting cross-frame data. **Good.**
- `crypto.randomUUID` / `crypto.getRandomValues` used for IDs and Foundry `_id` — appropriate. **Good.**
- All `JSON.parse` on external data (`handleImport`, undo/redo, snapshot, AI responses) is wrapped in try/catch. **Good** — though import does no schema/size validation beyond shape (feeds Finding 1).

---

## TOP 3 — MUST FIX

1. **`escHtml` doesn't escape quotes → attribute-breakout XSS across the app (Finding 1).** Make escaping escape `"` and `'`, and/or set attributes via `setAttribute`/`dataset`/`.value`. This is the highest-impact, most broadly-reachable hole, exploitable via the user's own input *and* shared/imported world files.

2. **Auto-backup writes the plaintext `copilotKey` to disk (Finding 2).** Route AutoSave `_write` (`:5084`) and `_fallbackDownload` (`:5100`) — and the undo stack (`:5453`) — through `_stateForPersist()` so the OpenRouter key never leaves memory in cleartext.

3. **Snapshot restore silently reverts edits to surviving entities (Finding 3).** Make `computeSnapshotDiff` diff entity *contents*, show a "modified/will-revert" category, and push current state to undo before `commitRestore` overwrites — otherwise restore is silent, irreversible data loss.
