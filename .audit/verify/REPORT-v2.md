# RealmWright V7 — Verified Defect Report (REPORT-v2)

**Supersedes the severities in `../REPORT.md`.** Every item here was re-checked against the live
source during the verification campaign (passes 1A–1E), Node-proven where the logic is pure.
Severities below are the **corrected** grades, not the original audit's.

### How to read this
- **Line numbers** cite the uploaded raw file (17,864 newline-lines). Your editor's formatted view
  (~23k lines) won't match — so every fix also quotes **searchable code**.
- **Verdict tags:** CONFIRMED · OVERSTATED (real but re-graded down) · NEEDS-WORKER-SOURCE (the
  Cloudflare Worker's code isn't in this file) · NEEDS-BROWSER (settle on desktop, Phase 3).
- **Campaign integrity:** ~24 original findings re-checked + 11 new gaps hunted. **Zero hallucinated
  findings.** ~8 were over-graded and are corrected below with proof.

---

## ★ #1 PRIORITY — THE COMPOUND LICENSE-FAILURE CHAIN (fix as one bundle)

A paying customer can lose access through **ordinary transient network errors**, with no visible
warning. Four confirmed bugs chain together:

1. **C04-1** — a server blip that returns JSON like `{error:...}` (the normal Cloudflare-Worker shape
   on 4xx/5xx) flips the license to invalid: `_backgroundValidate` L6152 `this._data.valid=!!json.valid`
   with no `res.ok` check. AutoSave then silently stops (`isActive()` gate, L6261). *(Narrower than the
   original claim: a true network outage or raw HTML 5xx is safe — `res.json()` throws and is caught.)*
2. **C13-2** — the "license expired / re-activate" toast is **invisible**: `showToast(...,0)` → L8126
   `setTimeout(remove, 0)` strips it before the 240 ms fade-in renders. *(Corrects 1A, which mislabeled
   it "non-dismissible." It's invisible — worse.)* Same `,0)` at L6298/L6305.
3. **C04-3** — `_hdr()` (L6099–6103) returns only `{Accept, Content-Type}` and **never sends
   `X-Device-Token`**, directly contradicting its own comment (L6096–6098).
4. **C04-2** — re-activation mints a **fresh** device instance every time (`_activateLS` L6112,
   `instance_name:'RealmWright-'+Date.now()`, no `instance_id`), unlike `_backgroundValidate` (L6147)
   which correctly reuses it. Repeated re-activations burn the device cap → "Device limit reached."
   *(Recoverable via support/deactivate, not a silent permanent brick — but still a lockout path.)*

**Fix bundle:** (a) `if(!res.ok)return;` + treat only an explicit `json.valid===false` as a revoke;
(b) give the expiry toast a real duration; (c) make `_hdr()` attach the cached device token;
(d) make `activate` reuse the stored `instance_id`/device token instead of minting a new instance.

---

## CRITICAL (verified)

| ID | What | Proof | Note |
|----|------|-------|------|
| **C04-1** | License self-revokes on a JSON error reply | L6150–6154 | scope corrected (see #1) |
| **Secret-leak** | A GM's hidden (private/forecast) events render to players | Node-proven end-to-end | two compounding bugs ↓ |

**Secret-leak = two confirmed bugs that compound:**
- **C03-4 (root)** — `CLAMP` (L5863) has no `visibility` clamp, so AI-written `visibility` is stored
  raw (L8305/L8368/L9667); the player-facing filters (L7933/L8005/**L14277**) match only the exact
  lowercase `'private'`/`'forecast'`, so `"Private"` or `"secret"` **renders to players**.
- **C10-1** — the "Show Secrets" toggle doesn't refresh the default timeline (`setSetting` L7000
  doesn't re-render WorldShell), so the safety control is dead on demand.
- *Honest caveat:* the **code defect** is certain; how often it bites depends on the AI emitting an
  off-spec label. It's a safety net with holes, not a guaranteed-every-time leak. Manual entry is
  **safe** (constrained `<select>`, L3685).

---

## HIGH (verified)

| ID | What | Proof |
|----|------|-------|
| **C09-1** | FrontDoor modal opens on **every** launch (flag never set true) | L6418/L6452/L17498 — grep-dispositive |
| **C11-1** | RelationshipWeb stacks a bg-click listener every render | L15394 on the persistent `#web-svg` |
| **C07-1 / C12-1** | **Fronts & Relations** dropped from export, PDF *and* search | L8941 builder list; search index L15576 |
| **C05-6** | OpenRouter API key written **plaintext** to the file backup | `AutoSave._write` L6302 raw-dumps `State.data` |
| **C14-2** | 9 CSS custom properties used but never defined | grep: uses≥1, defs=0 (table in `04a-themes.md`) |
| **C14-5** | WorldShell structural elements styled only in Ember → break on Manuscript/Modern | L900–982 all `body.theme-ember`-scoped |
| **C12-3** | `AccuracyChip.mount` leaks 2 document listeners per call | L5715 / caller L17381 (no guard) |
| **C11-2** | PrintPreview keydown listener leaks on close / re-open | L14430–14437 (`close()` never removes) |
| **GAP-4** | Migration omits `meta.workflowState` → TypeError on "Fill & Copy" for old saves | L6442–6454 vs unguarded L6997/6998 |
| **GAP-1** | Snapshot restore wipes the runtime API key (recoverable on reload) | L7016 nulls, L7074 doesn't re-hydrate |
| **C05-1** | Trailing ≤400 ms of edits lost on tab close | persist debounce L6748, no flush handler |
| **X2a-1** | The shipped sanitizer is the home-grown **fallback**, not real DOMPurify | L3223–3281 `version:'fallback'`; comment L3220 |

*(C05-1 was downgraded from CRITICAL — only the last ≤400 ms is at risk, not "everything since last save.")*

---

## MEDIUM (verified)

- **GAP-8 + GAP-9 (one root)** — the canon-apply loop has **no `catch`** (L8355) and unguarded derefs
  (`f.name` L8371, `stat.displayName` L8335); a malformed/imported entity crashes the paste mid-batch
  and `persist()` (L8378) is skipped. *(GAP-8 re-graded from HIGH: seed factions are named, so it's
  reachable via import, not "first paste for everyone.")*
- **GAP-2** — `commitRestore` doesn't bump `_idbGeneration` → an in-flight pre-restore write can
  clobber the localStorage mirror (L7075 vs the `resetAll` guard L7088).
- **GAP-6** — license in-memory state isn't atomic with its IDB write; a failed persist leaves
  `isActive()` lying for the session (L6124/L6173).
- **GAP-10** — canon can't match stats named ≤2 chars (AP/HP/XP); the delta is silently dropped (L8329).
- **C08b-3** — `ev.visibility` reaches `innerHTML` un-escaped (L8222/L8048); low-risk (needs user-accept),
  removed entirely by fixing C03-4.

---

## OVERSTATED / CORRECTED — the audit's calibration errors (now fixed)

| Original claim | Reality (verified) |
|---|---|
| C05-1 "CRITICAL: lost work on close" | HIGH — only the last ≤400 ms |
| X2-3 "forged license burns your OpenRouter credits" | **FALSE** — AI uses the *user's own* key (`isConfigured` L10102, not `isActive`) |
| C04-1 bricks on "500/429/empty/garbage" | only a *parseable JSON* reply without `valid:true`; network/HTML 5xx are safe |
| C12-4 "factions stale after edit" | only on the retired `rw_legacy_layout` debug path |
| C11-3 "PDF drops 5 entity types" | drops 3 — Artifacts & Glossary **are** in the PDF |
| GAP-8 "breaks the first paste for everyone" | reachable only via malformed import |
| 1A "expiry toast is non-dismissible" | it's **invisible** (C13-2) |
| C14-1 / C14-3 / C14-14 (HIGH/MED) | each self-walked-back in its own finding text → LOW/latent |

---

## NEEDS-WORKER-SOURCE (cannot verify from this file)
- **Demo per-IP cap** — the *only* thing protecting Hunter's OpenRouter/API spend. Confirm the Worker
  enforces it before public launch.
- Worker CORS / CSRF policy (X2-4/X2-5).

## NEEDS-BROWSER → Phase 3 desktop runbook
Exact visual breakage of Manuscript/Modern (C14-5/C14-8), cumulative listener-leak slowdown, the
secret-leak on a real player view, the invisible toast.

---

## Meta-conclusion — the honest answer to "is the audit trustworthy, is anything left?"

1. **Trustworthy on substance, not on calibration.** Across the whole campaign, **zero findings were
   hallucinated** — every bug is real. The audit's weakness was *severity inflation* (145/180 stamped
   HIGH while only 4 were executed); ~8 are corrected above.
2. **No hidden catastrophe.** After an adversarial gap-hunt of the five riskiest zones, **no new
   CRITICAL** surfaced and the render-dispatch path is provably clean. The original audit did cover
   the worst zones.
3. **The real ship-blockers are few and fixable:** the license-failure chain (#1), the secret-leak,
   the Fronts/Relations coverage hole, and shipping real DOMPurify. Fix those and RealmWright is in
   solid shape to sell.
