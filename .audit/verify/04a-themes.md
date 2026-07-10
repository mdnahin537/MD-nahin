# Phase 1D-a — Themes / CSS (C14): VERIFICATION

Verifier: main agent, inline, grep-proven. Scope: the two load-bearing HIGH claims in C14
verified rigorously; the self-walked-back HIGH/MEDIUM items re-graded from the finding's own
text; remaining LOW/polish items noted (not each re-executed).

### C14-2: Undefined CSS custom properties (used but never defined)
- verdict: CONFIRMED (list corrected)
- original grade: HIGH / HIGH
- corrected grade: HIGH / HIGH — real; affects ALL themes (defined nowhere), not just non-Ember.
- proof (uses = `var(--X)` line-count; defs = `--X:` line-count):
  | var | uses | defs | verdict |
  |---|---|---|---|
  | --color-surface-1 | 2 | 0 | undefined |
  | --color-border | 2 | 0 | undefined |
  | --color-text-body | 3 | 0 | undefined |
  | --text-heading-sm | 1 | 0 | undefined |
  | --text-heading | 1 | 0 | undefined |
  | --text-label-md | 3 | 0 | undefined |
  | --text-body-md | 3 | 0 | undefined |
  | --color-surface-raised | 1 | 0 | undefined |
  | --color-text-heading | 1 | 0 | undefined |
  | --color-success | 0 | 0 | NOT a defect — 0 var() uses (finding over-included it) |
  | --text-body-lg | 1 | 1 | defined (control — method validated) |
  | --color-text-primary | 17 | 4 | defined (control — method validated) |
- plain: 9 CSS variables are referenced but defined nowhere, so elements using them (Encounter
  Builder fields, handout body text, snapshot backgrounds, campaign-mode/front-card headings)
  render with no background/border/intended size — in EVERY theme. `--color-success` was wrongly
  listed (only an inline HTML fallback, 0 `var()` uses).
- fix: add the 9 vars to `:root` with the finding's suggested values.

### C14-5: WorldShell structural elements styled only under body.theme-ember
- verdict: CONFIRMED
- corrected grade: HIGH for non-Ember users (visible layout regression); confidence HIGH on the
  code, NEEDS-BROWSER for exact pixels.
- proof: every CSS rule for these selectors is prefixed `body.theme-ember`, with no base or
  manuscript/modern rule:
  - `.wms-pc-eyebrow` @ L900; `.wms-fc-avatar` @ L931/935; `.wms-fc-loyalty*` @ L939–946
    (incl. loyalty-track/fill that DRAW the bars); `.wms-ae-title-row` @ L962; `.wms-chr-label-row` @ L979.
  JS renders these classes in all themes → in Manuscript/Modern they have no geometry: invisible
  loyalty bars, unlaid-out eyebrow/title rows.
- fix: add unscoped base rules (sizing/flex/positioning); keep `body.theme-ember .wms-*` for color/glow only.

### C14-1 / C14-3 / C14-14: OVERSTATED (the finding walks each back itself)
- C14-1 (HIGH "140px phantom grid row"): finding text says it is "not a layout hole in practice"
  (shell is `position:absolute`, escapes the grid). → OVERSTATED: latent/edge, LOW–MEDIUM.
- C14-3 (MEDIUM "ember-glow-pulse fires off-Ember"): finding confirms the rule is ember-scoped so
  "no animation fires" elsewhere — only residue is dead class names. → OVERSTATED → LOW/QUALITY.
- C14-14 (HIGH "light-on-light in Modern"): finding says "the actual visual output is intended and
  correct" — only a latent trap for future components. → OVERSTATED: not a live bug.

### Remaining C14 items (not individually re-executed)
C14-8 (hardcoded dark colors on web/search panels → wrong in non-Ember), C14-13 (`*{color:inherit}`
suppressing semantic status colors in Manuscript), C14-7/9/10/11/12/15/16 (MEDIUM/LOW polish):
plausible and consistent with the two confirmed roots, but verified only by reading the finding's
evidence, not re-grepped. Treat as likely-real polish; confirm visually in the desktop pass (Phase 3).

## Summary
- CONFIRMED: 2 load-bearing (C14-2 the 9 undefined vars; C14-5 ember-only structural elements)
- OVERSTATED: 3 (C14-1, C14-3, C14-14 — each self-walked-back in the finding)
- Correction: `--color-success` is not a real undefined-var defect (0 `var()` uses).
- **Do themes other than Ember break? YES.** Worse: C14-2 leaves some components unstyled in
  *every* theme. Non-Ember specifically loses WorldShell structural styling (C14-5) and gets wrong
  hardcoded dark surfaces on the web/search panels (C14-8).
