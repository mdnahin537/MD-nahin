# C07 — FocusTrap, Modals, FoundryExport, generatePDF/renderSessionPrepPDF `h()`

Chunk: `C07`, lines 8393–9345 of `6b9eaae1-relamwrith_V7.HTML`.
Modules: FocusTrap (8393), Modals (8419), exportJSON/handleImport (8846), FoundryExport (8882),
generatePDF (8963, injected `<style>` 8977), renderSessionPrepPDF (9205, injected `<style>` 9209),
two scoped `h()` hyperscript helpers (9024, 9239) + `htmlSpan()` (9030).

**Headline verdicts (all proven):**
- The scoped `h()` helper is **XSS-safe** — string children go through `document.createTextNode` (DOM-escaped), never `innerHTML`. The only `innerHTML` sink in the PDF path is `htmlSpan()`, and it is fed **only hardcoded strings**. Verified by source trace + the structure of all 60+ call sites in-range.
- FoundryExport page **content** is XSS-safe (all dynamic text passes through `_h`/`escHtml`). **Proven in Node** with live XSS payloads — zero raw tags survive in content.
- FoundryExport **silently drops 5 entity types** (artifacts, fronts, bestiary, relations, glossary) — biggest finding for a paid export feature.
- FoundryExport JournalEntry/page **names/titles are NOT escaped** (raw `n.name` etc.) — depends on Foundry rendering names as text; flagged NEEDS-LIVE-VERIFY.

---

### C07-1: FoundryExport silently drops artifacts, fronts, bestiary, relations & glossary
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8933–8944 (`build`), L8941 (the 7-builder array); compare nation shape L6350–6365
- evidence:
  `[this._buildRealmOverview(n),this._buildChronicle(n),this._buildFactions(n),this._buildCharacters(n),this._buildLocations(n),this._buildHooks(n),this._buildSecrets(n)].forEach(e=>{if(e)entries.push(e);});`
  A nation (per `buildNationFromSeed`, L6350–6365) carries: factions, chronicle, characters, **artifacts**, relations, hooks, secrets, **fronts**, locations, **bestiary**, **glossary**.
- observed/why: The export maps only 7 of ~11 user/AI-authored content arrays. **artifacts** (decipherable lore items), **fronts** (faction clocks/threats — core GM prep, module at L14665+), **bestiary** (monster entries — module at L14799+), **relations** (inter-nation diplomacy, L7446+), and **glossary** (which the PDF export *does* include, L9174) are silently absent from the Foundry bundle. A GM who exports "their world" loses their bestiary and active fronts with no warning. The toast even says "Exported N Foundry journal entries" — implying completeness. The header comment (L8877–8881) only mentions Actors/Scenes being deferred; it never says bestiary/fronts/artifacts are dropped. Silent omission in a paid feature is a trust break.
- fix: Add `_buildBestiary`, `_buildFronts`, `_buildArtifacts`, optionally `_buildGlossary`/`_buildRelations`, and append them in the `build()` array (mirroring the existing `_build*` pattern). At minimum, document the omission in the export toast/UI so the GM knows.

---

### C07-2: FoundryExport JournalEntry & page names/titles are not HTML-escaped
- tag: SECURITY | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L8886 (`_entry` `name` param), L8885 (`_page` `name`/`title`), and every `_build*` that passes a raw nation/entity name into the entry name — e.g. L8894 `` `${n.name} — Realm Overview` ``, L8899 `` `${n.name} — Chronicle` ``, L8889 page name `'Realm Overview'` is static but L8898/8903/8908/8914/8920/8925/8930 pass `this._h(...)` to the *page* name yet entry names use raw `n.name`.
- evidence (Node, run): with `n.name = '<script>alert(1)</script>'`:
  `Overview entry.name = "<script>alert(1)</script> — Realm Overview"`  ← raw, unescaped
  vs page content (escaped): `&lt;script&gt;...`
- observed/why: Page **content** (`text.content`) is correctly escaped via `_h`, but the JournalEntry `name`, the page `name`, and `title.show` heading are stored raw. Whether this is exploitable hinges on how Foundry V12 renders entry/page names — the sidebar typically renders them as text (safe), but some Foundry views and the page H1 may interpret HTML. Since the nation name can come from an imported file or AI output, an unescaped name is an injection vector into another app (Foundry). Cannot confirm Foundry's exact rendering here.
- fix: Wrap entry/page names in `this._h(...)` too (or strip tags) before building the bundle, e.g. `_entry(this._h(name),...)`. Cheap and removes all doubt.

---

### C07-3: `Modals.open('inscribe')` fallback targets a non-existent modal (silent no-op)
- tag: WIRING | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5779 (caller) → L8421–8426 (`open` early-returns when `!modal`)
- evidence:
  `chronicle(){const btn=document.getElementById('wms-inscribe-btn')||document.getElementById('inscribe-btn');if(btn){...}else if(typeof Modals!=='undefined')Modals.open('inscribe');}`
  `grep id="modal-inscribe"` → **no matches**. `open()`: `const modal=document.getElementById(\`modal-${id}\`); ... if(!modal||!bg)return;`
- observed/why: If neither inscribe button exists, the fallback calls `Modals.open('inscribe')`, which finds no `#modal-inscribe`, returns silently, and the user's "Add first event" CTA does nothing — no toast, no error. It only triggers in a degraded DOM state (both buttons missing), so impact is low, but it's a dead/misleading fallback.
- fix: Point the fallback at a real modal (likely `'manual-event'`, the actual inscribe-event dialog) or drop the fallback.

---

### C07-4: Dynamic `modal-canon-failures` is never removed on close — lingers in DOM
- tag: PERF | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8702–8726 (`openCanonFailures`); cleanup only at L8706
- evidence:
  `document.getElementById('modal-canon-failures')?.remove();` ← runs only at the **start of the next open**, not on close. `close()` (L8796) only toggles classes; it never removes dynamically-appended modals.
- observed/why: Each `openCanonFailures` appends a fresh `<div id="modal-canon-failures">` to `<body>`; on close it's merely hidden via class removal. The node (with its `[data-close]` listeners) persists until the next open replaces it. Not a growth leak (single fixed id, replaced next time), but stale hidden DOM + listeners hang around. Same pattern is fine for static modals; only the dynamic one leaks one node.
- fix: In `close('canon-failures')` (or generically when `id` belongs to a dynamic modal), call `modal.remove()` after the close animation instead of leaving it parked.

---

### C07-5: `currentYear` / numeric fields of value 0 render as "—" in Foundry & elsewhere
- tag: BUG | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8889 (`n.currentYear||'—'`, also `n.population||'—'`)
- evidence (Node, run): nation with `currentYear:0` →
  `Current Year:</strong> —`  (the falsy `0` is replaced by the em-dash placeholder)
- observed/why: `value||'—'` treats the legitimate value `0` as "missing". A fantasy calendar can have Year 0 (or population 0 for a ruin). The Realm Overview then shows "—" instead of "0", a small data-fidelity bug. (Note: `_buildChronicle` L8898 correctly uses `ev.weight==null?0:ev.weight` for weight — so the author knows the pattern; year/population just weren't given the same guard.)
- fix: Use `n.currentYear==null?'—':n.currentYear` (and same for population), matching the chronicle-weight guard already in the file.

---

### C07-6: Modal-open writes to fixed element IDs with no existence guard (per-modal init)
- tag: BUG | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L8437–8461 (`open` "Special init"), esp. L8439–8447 (`manual-event`), L8458 (`custom-stat`)
- evidence:
  `document.getElementById('ev-year').value=n.currentYear;` … `document.getElementById('ev-weight-display').textContent=0;` (no `?.`, no null-check — unlike the *later* lines 8449–8451 which DO guard with `if(evType)`)
  Same in `custom-stat`: `document.getElementById('cs-name').value='';document.getElementById('cs-min').value=0;...` — all unguarded.
- observed/why: The first block of `manual-event` init (8439–8447) and the entire `custom-stat` init (8458) dereference `.value`/`.textContent` on `getElementById` results with no null check. If any of those static IDs is ever renamed/removed (or a modal's HTML is partially edited), this throws `Cannot set properties of null` and aborts `open()` *after* the modal has already been shown and focus-trapped — leaving a half-initialized, possibly un-closable-feeling dialog. The author clearly knows the safer pattern (the B37 lines right below at 8449–8451 use `if(evType)`), so this is inconsistent hardening. Low likelihood today (IDs exist), hence MED/confidence MED.
- fix: Guard each access (`const el=document.getElementById('ev-year'); if(el)el.value=...`) or wrap the special-init block in try/catch so a missing field can't strand an open modal.

---

### C07-7: PDF/SessionPrep `h()` and `htmlSpan()` — verified safe (NOT a finding, documented for the record)
- tag: QUALITY | severity: POLISH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: `h()` L9024–9029 & L9239–9244 (identical twins); `htmlSpan()` L9030
- evidence:
  `children.forEach(c=>{if(c==null)return;if(typeof c==='string')el.appendChild(document.createTextNode(c));else el.appendChild(c);});`
  `function htmlSpan(html){const s=document.createElement('span');s.innerHTML=html;return s;}`
  Every `htmlSpan(...)` call in range uses a **hardcoded literal**: L9032 `'<span class="ornament">§</span>'`, L9065 `` `<span class="stat-bar-bg"><span class="stat-bar" style="width:${pct}%"></span></span>` `` (only interpolant is a computed integer `pct`). No user/AI string ever reaches `innerHTML`.
- observed/why: This is the OTHER render primitive the brief asked to verify independently of the markdown path. Confirmed: user/AI text (`n.name`, `ev.description`, `c.drive`, `prep.tensions`, `nation.notes`, etc.) is passed as **string children** to `h()` and therefore text-escaped by `createTextNode`. The XSS surface is closed on this path. Attribute values set via `setAttribute`/`style.cssText` (L9026/9241) also come only from literals or computed numbers in-range.
  The one quality note: `h()`, `htmlSpan()`, `polar`, `section` are **duplicated verbatim** across generatePDF and renderSessionPrepPDF (and the app-render `h` elsewhere). If the safe pattern ever needs a fix, it must be changed in 2–3 places. Not a bug; maintainability risk.
- fix: (Optional) hoist a single shared `h`/`htmlSpan` to module scope and reuse; keeps the escaping guarantee in exactly one place.

---

### C07-8: Two large injected `<style>` blocks are scoped — no leak, but each is re-injected on every export
- tag: QUALITY | severity: POLISH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8977–9021 (Story-Bible print CSS) and L9209–9236 (Session-Prep print CSS), both via `pc.innerHTML=\`<style>…\``
- evidence: Every rule is prefixed `#print-container …` and the `@media print` block hides `body>*:not(#print-container)`. Both styles target the SAME container `#print-container` (L8974/9206) and are written by overwriting `pc.innerHTML`, so only one set is ever live at a time.
- observed/why: No scope leak into the main app (all selectors are `#print-container`-anchored; `@media print` confines page rules). The two blocks DO partially overlap (both define `#print-container h2`, footer, etc.) with different values — but since each export overwrites the container wholesale, they never coexist, so no specificity collision. Minor: the full CSS string is re-parsed and re-inserted on every PDF generation (cheap, one-shot, acceptable). After printing, `pc.innerHTML=''` (L9196/9199/9333/9336) clears it.
- fix: None required. (Optional) move the static print CSS into the document `<style>` once (scoped to `#print-container`) instead of re-injecting per export.

---

### C07-9: FoundryExport `_id16` IDs are random-per-call — re-export changes all IDs (re-import duplicates)
- tag: QUALITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: yes
- where: L8883 (`_id16`), used in `_page` (8885) and `_entry` (8886); `exportedAt` baked per-entry at L8886
- evidence:
  `_id16(){…crypto.getRandomValues(buf);for(let i=0;i<16;i++)s+=chars[buf[i]%chars.length];return s;}` — fresh random 16-char id on **every** build; nothing derived from the entity's stable `id`.
- observed/why: Every export generates brand-new Foundry `_id`s. A GM who exports, imports to Foundry, then re-exports after edits and re-imports will get **duplicate** JournalEntries in Foundry (Foundry keys on `_id`; new ids = new docs), rather than updates. Collision risk within one export is negligible (62^16 space). The issue is *stability* across exports, not uniqueness. Minor for a v1 one-way export, but worth noting as the feature matures.
- fix: Derive `_id` deterministically from the entity's own `id` (hash → 16 base62 chars) so re-exports map onto the same Foundry docs. Acceptable to defer; document the "re-import creates duplicates" behavior.

---

## Summary

**Counts by severity:** CRITICAL 0 · HIGH 1 · MEDIUM 2 · LOW 4 · POLISH 2  (9 findings)

Positive verifications (proven, not findings): the scoped `h()` render primitive is XSS-safe (string children → `createTextNode`; `htmlSpan` fed only literals); FoundryExport page **content** is XSS-safe under live payloads (Node-tested); empty/large/missing-active worlds are handled cleanly (`build()` throws "No realms to export." / "No active realm." — Node-tested); FocusTrap adds/removes its keydown listener correctly with no leak across repeated opens; global Escape (L15927) and backdrop-click (L15924) both close modals; `showToast` uses `textContent` (toast is injection-safe) and the 3-arg call at L8957 is correct.

**Top 3:**
1. **C07-1 (HIGH)** — Foundry export silently drops artifacts, fronts, bestiary, relations & glossary; a GM loses real prep with a "complete export" toast. (L8941)
2. **C07-2 (MED)** — Exported JournalEntry/page **names** are not HTML-escaped (only content is); possible injection into Foundry, pending live confirmation of Foundry name rendering. (L8886/8894)
3. **C07-6 (MED)** — `manual-event`/`custom-stat` modal init dereferences fixed element IDs with no null guard *after* the modal is already shown; a renamed/removed field would strand an open dialog. (L8439–8458)
