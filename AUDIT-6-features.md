# RealmWright — Audit of 6 Export/Mode Features

Branch: `claude/magical-mayer-YwP53` (PR #9) · File: `realmwright-v7.html` (~26k lines)
Example world for exercising: **Solis Prime** (front door → "🌍 Load an example world").
Status legend: ✅ verified in browser · 🔬 code-traced (not yet browser-verified) · ⏳ pending

Last updated: (in progress)

---

## 0. KNOWN BUG — Print/PDF output is BLANK (proof-of-loop, blocks features 2 & 4)

**Severity: BLOCKER.**

### Root cause (code-traced, ROOT-CAUSED)
There are TWO mutually-incompatible "hide everything but me" print strategies fighting:

1. **Global CSS** (line 3850, always live in `<head>`):
   `@media print{ body>*:not(.print-preview){display:none!important} ... }`
   → at print time, hide every direct child of `<body>` that is NOT `.print-preview`.

2. **Per-render inline CSS**, injected into `#print-container` by all 3 PDF renderers
   (Story Bible `generatePDF` L12753; Session Prep `renderSessionPrepPDF` L12985;
   Press recap via `PrintContainer.present` L18694):
   `@media print{ body>*:not(#print-container){display:none!important} #print-container{display:block!important} }`

The current architecture renders content into `#print-container`, then **clones that node
(including the injected `<style>`) into a `.print-preview` wrapper** via `PrintPreview.open()`
(L22461) and calls `window.print()`. Two failures compound:

- The cloned `<style>` block applies **document-wide** (style tags are not scoped to DOM
  position). Its rule `body>*:not(#print-container){display:none!important}` **hides the
  `.print-preview` wrapper itself** (it is a `body>*` and is not `#print-container`).
- Immediately after cloning, the code runs `pc.innerHTML=''` — so `#print-container` is now
  empty anyway. Nothing printable survives → **BLANK page/PDF**, even though the on-screen
  preview modal looks correct.

The inline `body>*:not(#print-container)` / `#print-container{display:block!important}` lines
are **dead legacy** from the abandoned direct-`window.print()` approach. With the
`PrintPreview`-clone approach they are not merely redundant — they actively blank the output.

### Affected features
- **Feature 2** "Export as Story Bible (PDF)" — YES (uses `generatePDF`).
- **Feature 4** "Generate GM Session Prep (PDF)" — YES (uses `renderSessionPrepPDF`).
- Press "Previously on…" recap — YES (uses `PrintContainer.present`).
- Handout print, Locations/Timeline print (other paths) — to be checked for the same class.

### Fix
Strip the `body>*:not(#print-container){...}` and `#print-container{display:block!important}`
rules from the three inline `@media print` blocks (keep `@page`). Let the single global
`.print-preview` rule govern print visibility. Optionally strip the `<style>` from the clone.

**Status: root cause confirmed by code trace; browser reproduction + fix verification pending.**

---

## FEATURE-BY-FEATURE (filled in as traced)

### 1. "Export as JSON"  — handler L24005 → `exportJSON('single')`
- CLAIMS: dump the world as JSON.
- ACTUAL: ⏳
- GAP / ROOT CAUSE / SEVERITY / FIX: ⏳

### 2. "Export as Story Bible (PDF)" — handler L24006 → `Modals.open('export-opts')` → `generatePDF`
- CLAIMS: formatted GM PDF of the world.
- ACTUAL: ⏳ (blocked by blank-PDF bug above)
- GAP / ROOT CAUSE / SEVERITY / FIX: ⏳

### 3. "Export to Foundry VTT" — handler L24007 → `FoundryExport.download('active')`
- CLAIMS: output a format Foundry VTT can import.
- ACTUAL: ⏳ (needs Foundry format research)
- GAP / ROOT CAUSE / SEVERITY / FIX: ⏳

### 4. "⌘ Generate GM Session Prep (PDF)" — handler L24009 → AI call → `renderSessionPrepPDF`
- CLAIMS: AI-generated session-prep document.
- ACTUAL: ⏳ (blocked by blank-PDF bug; prompt quality TBD)
- GAP / ROOT CAUSE / SEVERITY / FIX: ⏳

### 5. Mode "Tonight" — "One line. One world. One session, ready to run." (L26043)
- CLAIMS: one line → ready-to-run one-shot.
- ACTUAL: ⏳
- GAP / ROOT CAUSE / SEVERITY / FIX: ⏳

### 6. Mode "Campaign"
- CLAIMS: campaign management, end-to-end.
- ACTUAL: ⏳
- GAP / ROOT CAUSE / SEVERITY / FIX: ⏳

---

## RANKED FINDINGS (by GM impact) — filled at end
(pending)
