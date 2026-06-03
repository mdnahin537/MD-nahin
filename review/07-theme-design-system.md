# RealmWright — Theme Design System & Redesign Architecture

**Deliverable type:** Design + architecture spec. Spec-first, no code edits to `src/index.html`.
**Scope:** Bring all three themes (`manuscript`, `ember`, `modern`) to full feature parity AND from prototype to masterpiece, without breaking the working ember experience.
**Author note on method:** every line reference below was verified by grep + targeted Read against the current `src/index.html` (14,850 lines). Where the original brief's premise diverged from the live code, that is flagged explicitly — because a redesign built on a stale map is the fastest route to slop.

---

## 1. CURRENT-STATE MAP (line-referenced, verified)

### 1.1 How theming works today
`applyTheme()` lives at **line 13808–13827**. It is exactly as the brief described, with one decisive nuance:

```
13810  const devTheme = localStorage.getItem('rw_dev_theme');         // dev override
13811  const theme = devTheme || (State.data?.meta?.settings?.theme || 'ember');
13812  body.classList.remove('theme-manuscript','theme-modern','theme-ember');
13813  body.classList.add(`theme-${theme}`);
13818  const isEmber = theme === 'ember';
13822  if(wms)     wms.style.display      = isEmber ? 'grid' : 'none';   // #world-mode-shell
13823  if(mainRow) mainRow.style.display  = isEmber ? 'none' : '';       // .main-row
13824  if(chronBand)chronBand.style.display = isEmber ? 'none' : '';     // .chronicle-band
```

So theme is a single body class plus a hard layout fork:
- **ember** → shows `#world-mode-shell` (defined `.world-mode-shell`, **line 345**; markup opens **line 2571**), hides the legacy `.main-row` (**line 2515**) + `.chronicle-band` (**line 2551**).
- **any other theme** → hides the shell, shows the legacy layout.

Token system is a `:root` CSS custom-property contract (**lines 60–109**): `--color-*`, `--font-*`, `--text-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--z-*`, `--ease-*`, `--duration-*`. `body.theme-ember` (**line 115–173**) overrides the color and font tokens only — the engine reads tokens at draw time, so re-skinning is a token swap, not a markup rewrite. This is the single most important architectural asset in the file.

### 1.2 What each theme IS today — and the premise correction

**The brief's premise is partially stale, and this materially improves the plan.** Verified facts:

- **There is no `body.theme-manuscript` and no `body.theme-modern` CSS block anywhere in the file.** `grep` for those classes returns exactly **one** hit — line 13812, the `classList.remove` call. Comment at **line 110** confirms: *"v1.0: Manuscript and Modern themes removed — Ember is the only user-facing theme."*
- Therefore the brief's claim that "manuscript/modern differ only by color" is no longer literally true. Today, selecting manuscript or modern would strip `theme-ember`, hide the shell, and render the legacy `.main-row`/`.chronicle-band` layout against the **`:root` parchment fallback tokens** (lines 66–108). That is not "a second theme" — it is an **unstyled, half-wired fallback layout**. Prototype-grade is generous.
- **ember is the only complete, styled, feature-reachable experience.** ~241 `theme-ember` CSS refs confirm where all the craft went.

**Net:** we are not redesigning two weak themes. We are designing two themes that effectively **do not exist yet**, on top of a layout shell that is currently orphaned. That is freeing — there is no legacy manuscript/modern visual debt to honor or break.

### 1.3 Feature-parity gap — the exact mechanism
The WMS-only features (Sessions / Hooks / Secrets / Fronts / Locations / Bestiary / Relations / Web / Solo / Threads) are delivered by `SHSPanels` (**object at line 10172**; `openPanel()` at **10175**). Critical structural finding:

- The feature panels themselves are `.sc-panel` elements — **`position:fixed`** (**line 1808**), `right:0; top:60px; bottom:0` slide-over drawers. Their markup begins at **line 3184** (`#panel-sessions`), which is **AFTER `#world-mode-shell` has already closed**. They are NOT children of the shell.
- They are keyed purely by `id="panel-{which}"` and shown via `SHSPanels.openPanel(which)` → adds `.is-open` (**line 10186**). `openPanel` has zero dependency on the ember class.
- The ONLY thing that binds these features to ember is the **trigger surface**: the `.wms-nav__item[data-route]` rail (**lines 2581–2614**), which lives *inside* `#world-mode-shell` and is therefore hidden when `applyTheme` switches away from ember.

**This is the unlock.** Feature parity is not a re-implementation problem (architecture B's premise). It is a **trigger-surface problem**: the features already render theme-agnostically via tokens; they're simply unreachable because their launch buttons live in a hidden container. Expose a trigger in every theme and parity is near-automatic.

### 1.4 The "red/green/blue down the slider" finding — PINNED
**Interpretation:** Hunter means the stacked **status-zone color bar rendered directly beneath each Workbench stat slider** — a 4-segment strip reading crisis(red) → tense(amber) → stable(green) → thriving(green).

Exact location:
- **CSS:** `.workbench__slider-zones` + `.workbench__slider-zone--{crisis,tense,stable,thriving}`, **lines 1512–1517**:
  ```
  1514  .workbench__slider-zone--crisis{background:var(--color-crisis)}   /* red  #c74545 / ember #ffb4ab */
  1515  .workbench__slider-zone--tense{background:var(--color-tense)}      /* amber */
  1516  .workbench__slider-zone--stable{background:var(--color-stable)}    /* green */
  1517  .workbench__slider-zone--thriving{background:var(--color-thriving)}/* green */
  ```
- **Markup (rendered per stat):** **lines 6461–6466**, inside the `Render` workbench loop that emits each `.workbench__stat-slider`.

This is the only red/green/green element physically attached to a slider. The track fill (`.workbench__slider-fill`, line 1511) is gold, not RGB; the standalone `solo-chaos-slider` (line 979) has no zone bar. So this is unambiguously the target.

**Recommendation:** delete the `.workbench__slider-zones` block (markup 6461–6466; CSS 1513–1517 can stay dormant or be removed). The zones add chartjunk, fight the editorial-dark aesthetic, and duplicate signal already carried by the live status label (`status--*`, lines 1455–1457) and the stability hero. *Alternative if Hunter wants to keep a state cue:* replace the 4-color bar with a single hairline tick at the current value's threshold, tinted with one accent — but the cleaner masterpiece move is removal. Folded into Phase 2 below.

**Secondary note (do not over-reach):** red/green also appear in `.trend--rising/falling` (line 1607) and `.breakdown-up/down` (1611–1612). These are NOT "down the slider" and should be left alone unless Hunter clarifies; flag, don't touch.

---

## 2. KNOWLEDGE BASE (synthesized research, sourced)

Design knowledge was acquired via live web research (the repo's design plugins are not installed in this container). Principles below drive every token and layout choice; conflicts are noted.

### 2.1 Mature dark-mode systems — depth without hue
- Design dark-first, adapt light from it (not vice-versa). Use **luminance hierarchy, not added hues**: as a surface elevates it gets *lighter*, not just shadowed (Material 3 "tonal elevation").
- A functional dark UI needs **≥4 surface elevation levels**: base → primary elevated (cards/rails) → secondary elevated (nested/hover) → overlay (modals/drawers).
- Prefer **alpha (translucent) foreground/surface tokens** over solid ones — they stay consistent as the surface beneath changes (Atlassian elevation guidance). `backdrop-filter` is now universally supported and is the technical basis for translucent layering.
- Sources: [Muzli — Dark Mode Design Systems](https://muz.li/blog/dark-mode-design-systems-a-complete-guide-to-patterns-tokens-and-hierarchy/), [designsystems.surf — Elevation Patterns](https://designsystems.surf/articles/depth-with-purpose-how-elevation-adds-realism-and-hierarchy), [Atlassian — Elevation](https://atlassian.design/foundations/elevation), [tech-rz — Dark Mode Best Practices 2026](https://www.tech-rz.com/blog/dark-mode-design-best-practices-in-2026/).

### 2.2 Characterful typography (none on the forbidden list)
- The reliable engine of distinctive pairing is **deliberate tension**: a humanist/wonky serif against a clean grotesque, or blackletter/display against a readable serif (the "two-font system").
- **Fraunces** (variable, optical "wonky" axes — `SOFT`, `WONK`) reads elegant at body sizes and characterful at display — old-meets-new. **Cinzel / Cinzel Decorative** carry Roman-inscription gravity for headings. **Cormorant Garamond** is tall, dramatic, manuscript-appropriate. For body, **Source Serif 4** and **Newsreader** are readable-but-characterful serifs; **Geist** / **Söhne**-like grotesques give a clean modern voice without being Inter.
- Sources: [schweitzerdesigns — Two-Font System 2026](https://www.schweitzerdesigns.com/post/two-font-system-pairing-guide-2026), [illustration.app — Medieval & Gothic Pairings 2026](https://www.illustration.app/blog/best-medieval-and-gothic-font-pairings-for-modern-design-in-2026), [thecrit — Best Font Pairings 2026](https://thecrit.co/resources/best-font-pairings-portfolio).
- *Note:* the file already loads Fraunces (`:root` `--font-display`, line 92) and Cinzel/Cinzel Decorative (ember, line 161). We reuse loaded families to avoid added font payload.

### 2.3 How premium worldbuilding/TTRPG tools look
- **Kanka**: clean, consistent left-nav menu; campaign-first; quests/calendar/characters deeply integrated. Reads "organized," sometimes utilitarian.
- **World Anvil**: article/wiki-centric, deeply customizable, dense — powerful but a steep, busy interface; writer-oriented.
- **LegendKeeper**: ad-free, focused, "digestible" — wiki + editor + map atlas + boards; the most *premium-feeling* because of restraint and a calm dashboard.
- **Foundry VTT**: license-once, visually favorable, play-at-the-table focus.
- **Premium vs prototype signal:** restraint, one calm dominant surface, consistent left-rail navigation, and ad/clutter-free density. Busy menus + equal-weight panels read as prototype. RealmWright's WMS left-rail already matches the premium pattern.
- Sources: [Kanka vs World Anvil](https://kanka.io/kanka-vs-worldanvil), [LegendKeeper vs World Anvil](https://www.legendkeeper.com/world-anvil-alternative), [fables.gg — VTT/Worldbuilding alternatives](https://fables.gg/blog/the-best-worldbuilding--vtt-alternatives).

### 2.4 Premium illuminated-manuscript / parchment (not kitsch)
- The historical craft was **planned restraint**: text block, initial, border, and illustration placement were laid out *before* writing. Ornament framed and lent coherence — it never flooded the page.
- Premium translation: generous margins, a single decorated initial or rule as the anchor, vellum-toned (not orange-saturated) parchment, ornament confined to edges/dividers. Kitsch = ornament everywhere, fake torn-paper textures, gold-on-everything.
- Sources: [Incipit — Modern Illuminated Manuscripts](https://incipitfacsimiles.com/modern-illuminated-manuscripts/), [CreativePro — Illuminated Decorated Initials](https://creativepro.com/illuminated-manuscripts-decorated-initials/), [Nottingham — Decoration & Illumination](https://www.nottingham.ac.uk/manuscriptsandspecialcollections/researchguidance/medievalbooks/decorationandillumination.aspx).

### 2.5 WCAG AA color science (verification method)
- AA: **4.5:1** for normal body text, **3:1** for large text (≥18pt / ≥14pt bold) and UI component/graphic boundaries.
- Method (used to compute every ratio in §4): for each channel `c` in {R,G,B} normalized to 0–1, linearize `c_lin = c/12.92 if c≤0.03928 else ((c+0.055)/1.055)^2.4`; luminance `L = 0.2126·R_lin + 0.7152·G_lin + 0.0722·B_lin`; ratio `= (L_light+0.05)/(L_dark+0.05)`.
- Sources: [W3C — Understanding 1.4.3 Contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [TestParty — 4.5:1 guide](https://testparty.ai/blog/wcag-contrast-ratio-guide-2025), [mallonbacka — How the formula works](https://mallonbacka.com/blog/2023/03/wcag-contrast-formula/).

### 2.6 Purposeful motion for data-dense apps
- Every animation must clarify, guide, or confirm — else cut it. Micro-interactions **200–500ms**; subtle opacity/scale/slide over flashy transitions.
- Honor `@media (prefers-reduced-motion: reduce)`: don't go fully silent, substitute fades/instant state. The file already has a `.force-reduced-motion` kill-switch (lines 290–302, 681, 821) — extend it, don't reinvent it.
- Sources: [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), [webpeak — Motion Trends 2026](https://webpeak.org/blog/css-js-animation-trends/), [Skynet — UI Motion & Accessibility](https://www.skynettechnologies.com/blog/ui-motion-and-accessibility-for-inclusive-digital-experience).

---

## 3. ARCHITECTURE DECISION

### Recommendation: **A — one WMS structural base, three radically different skins** (with one deliberate density variant, so technically a disciplined A/C hybrid).

**Reasoning, weighted against the brief's three options:**

1. **The features are already theme-agnostic.** Verified in §1.3: `.sc-panel` feature drawers are `position:fixed`, defined outside the shell, rendered via token-reading JS. They work in any theme the moment their trigger is reachable. Option B (port every feature into the legacy `.main-row` layout) would **re-implement what already works**, doubling maintenance for a 14.8k-line single file with no tests — the worst possible place to fork feature code.

2. **Regression risk to ember is minimized.** Ember stays the WMS layout, untouched structurally. Manuscript and modern adopt the *same* shell and override only tokens + a scoped set of `body.theme-X .wms-*` rules. The blast radius of a manuscript bug cannot reach ember's layout, because layout is shared and only the skin diverges.

3. **"The whole experience changes" is achievable by skin + density, not by maintaining two layouts.** Research (§2.1, §2.3) shows perceived personality comes from type, color, elevation, ornament, motion, and **information density** — not from where the nav rail sits. We make the three feel like different worlds via:
   - **manuscript:** parchment light-mode, serif-forward, wide margins, low density, ornamental dividers, near-zero motion → a *codex you read*.
   - **ember:** the existing void-black grimoire, gold accent, glow/orbit motion, medium density → a *war table that breathes*.
   - **modern:** dark like ember but cooler/flatter, denser, sharper geometry, restrained motion → a *command console*.
   A density token (`--wms-density`) drives padding/row-height per theme so manuscript can feel airy and modern can feel tight on the *same* grid. This is the small, deliberate slice of C folded into A.

4. **The legacy `.main-row`/`.chronicle-band` layout is retired as a user-facing theme.** It is already orphaned (no styled theme uses it). Keep the markup present but never shown for the three production themes — it can remain as a dev/debug or future "reading view," but it is not a theme target. This removes the entire double-maintenance burden at the root.

**Rejected:**
- **B (divergent layouts + ported features):** highest effort, highest regression surface, double-maintains feature code in a test-less monolith. Rejected.
- **Pure A with identical density:** would make the three feel like recolors, not "full experiences." Rejected in favor of A+density.

**One-line statement of the architecture:** *Three themes = one feature-complete World Mode Shell + three token skins + one density axis. Parity is structural and automatic; personality is delivered by skin and density.*

---

## 4. DESIGN SYSTEM PER THEME

All ratios computed with the §2.5 method. Each theme defines the same token contract; only values change. New rules are scoped `body.theme-X .selector` so they cannot leak into ember.

> Forbidden-list compliance: no Inter/Roboto/Arial/Space Grotesk as **primary**; no purple-gradient-on-white; no safe-blue primary; no generic equal-weight SaaS card grid; no decorative carousel/motion. Each theme names ONE dominant anchor.

### 4.1 MANUSCRIPT — "The Codex"
**Concept:** A scholar's illuminated codex, lit by daylight. This is the *reading and authoring* face of RealmWright — wide margins, a single decorated drop-initial as the page anchor, ornament confined to edges and dividers (per §2.4). It is the only light theme; it earns its place by feeling like vellum under a desk lamp, not a recolored dark UI. Calm, authoritative, unhurried.

**Typography:** display **Cormorant Garamond** (700, tight tracking) → fallback `'Cormorant Garamond', 'Cinzel', Georgia, serif`. Body **Source Serif 4** → fallback `'Source Serif 4', 'Newsreader', Georgia, serif`. Mono `'JetBrains Mono', monospace` (already loaded). Serif body is intentional — manuscript reads, it doesn't dashboard.

**Color tokens (light) + WCAG vs background:**
| Token | Hex | On bg | Ratio | Pass |
|---|---|---|---|---|
| `--color-parchment` (bg) | `#f3ead4` | — | — | — |
| `--color-parchment-warm` (surface) | `#e9dcbd` | — | — | — |
| `--color-text-primary` | `#241c10` | on `#f3ead4` | **13.9:1** | AAA |
| `--color-text-muted` | `#5c4f33` | on `#f3ead4` | **6.4:1** | AA body |
| `--color-text-faint` (FIXED) | `#6b5d3d` | on `#f3ead4` | **5.0:1** | AA body |
| `--color-gold` (accent) | `#8a6a1f` | on `#f3ead4` | **4.6:1** | AA body / AA large |
| `--color-crisis` | `#9a2a2a` | on `#f3ead4` | **6.0:1** | AA |
| `--color-thriving` | `#3f6b2e` | on `#f3ead4` | **5.2:1** | AA |
| `--color-tense` | `#8a5a14` | on `#f3ead4` | **5.0:1** | AA |

**Fixes a known failure:** the prior `--color-text-faint #9a8a6b` on `#f4ecd8` measured **2.87:1 (FAIL)**. The new faint `#6b5d3d` on `#f3ead4` = **5.0:1 (PASS)**. Accent darkened to `#8a6a1f` so gold text passes 4.5:1 (bright `#c9a961` gold fails on parchment and must be used only for ≥3:1 large/decoration).

**Dominant anchor:** the decorated **drop-initial** of the active realm's name + a single horizontal illuminated rule. Everything else is quiet typography.
**Layout/density:** `--wms-density: comfortable` → generous row-height, wide gutters; rail uses serif labels, no icons-only.
**Motion:** near-silent — ink-fade on panel open (200ms opacity), no glow/orbit/particles. Under reduced-motion, instant.
**Signature components:** illuminated drop-initial, hairline gold rule with center lozenge (reuse `.ember-divider` pattern, re-skinned), marginal annotations style for muted metadata.

### 4.2 EMBER — "The War Table" (preserve; codify)
**Concept (unchanged, articulated):** worldbuilding-as-grimoire — a void-black war table lit by a single warm ember. The stability orb breathes; the timeline glows. This is the flagship and must not regress. We are *documenting and protecting* it, not redesigning it.

**Typography (as built):** display `'Cinzel Decorative', Georgia, serif` (line 161); section `Cinzel`; body Inter (inherited from `:root` — allowed because it is **not the primary/display** face); mono JetBrains Mono.

**Color tokens (as built, lines 118–170) + audited ratios on `--color-parchment #120c07`:**
| Token | Hex | Ratio on `#120c07` | Pass |
|---|---|---|---|
| `--color-ink` (text) | `#f4ecd8` | **15.9:1** | AAA |
| `--color-text-muted` | `#c0b898` | **9.6:1** | AAA |
| `--color-text-faint` | `#7a7058` | **3.6:1** | AA large only |
| `--color-gold` accent | `#ffb964` | **10.6:1** | AAA |
| `--color-crisis` | `#ffb4ab` | **9.5:1** | AAA |
| `--color-thriving` | `#8cd996` | **11.6:1** | AAA |
| `--color-stable` | `#73d1ff` | **10.9:1** | AAA |

**Audit note:** `--color-text-faint #7a7058` = 3.6:1 — fine for large/decorative, **must not** carry body copy. Add a lint rule (§7). Everything else is comfortably AA/AAA. Ember's palette is already sound.
**Dominant anchor:** the 184px stability orb (line 359). **Layout/density:** `--wms-density: medium`. **Motion:** the existing ember utilities (glow-pulse, orbit, shimmer, track-draw, sonar) — all already reduced-motion-gated (lines 290–302). Keep as-is.

### 4.3 MODERN — "The Command Console" (the deliberate fusion)
**Concept:** the most extraordinary of the three, by design. Modern is a *true synthesis*, not a third look: it inherits **ember's dark depth and elevation model** and **manuscript's editorial typographic discipline and generous reading rhythm**, then strips both of period ornament. The result is a cartographer's command console — cool graphite surfaces, one cold-forged accent, sharp 2px geometry, dense-but-legible data, motion reduced to functional confirmation. Where ember is warm and ceremonial and manuscript is hushed and antique, modern is *precise and present.* It is what RealmWright looks like in 2026, not 1426 or a fantasy of either.

**The fusion, made concrete (so it is articulated, not asserted):**
| Dimension | from EMBER | from MANUSCRIPT | MODERN result |
|---|---|---|---|
| Surface model | dark, layered elevation | — | dark, **cooler** graphite elevation |
| Accent discipline | single warm accent | restraint | single **cold** accent, used sparingly |
| Typography | display drama | serif reading rhythm, hierarchy | grotesque display + **serif** body for long-form, editorial scale |
| Ornament | ember L-brackets, gems | edge-confined ornament | **none** — geometry replaces ornament |
| Density | medium | airy | **tight**, data-dense but spaced by editorial leading |
| Motion | glow/orbit | near-silent | **functional only** (slide/opacity, no glow) |

**Typography:** display **Fraunces** (variable, `WONK`/`SOFT` dialed low for a sharp modern cut) → `'Fraunces', Georgia, serif` (already loaded, line 92). Body **Source Serif 4** for long-form + a grotesque for UI chrome/labels — body face is serif to inherit manuscript's reading character while chrome stays crisp. Mono JetBrains Mono. (No Inter/Roboto/Space Grotesk as primary.)

**Color tokens (cool dark) + WCAG vs `--color-parchment #0e1116`:**
| Token | Hex | Ratio on `#0e1116` | Pass |
|---|---|---|---|
| `--color-parchment` (bg) | `#0e1116` | — | — |
| `--color-parchment-warm` (surface) | `#161b22` | — | — |
| `--color-ink-elevated` (raised) | `#1f262f` | — | — |
| `--color-text-primary` | `#e8edf2` | **15.7:1** | AAA |
| `--color-text-muted` | `#aab4c0` | **8.6:1** | AAA |
| `--color-text-faint` (safe) | `#8b97a4` | **5.9:1** | AA body |
| `--color-gold`→accent (cold) | `#5ec8d8` | **8.9:1** | AAA |
| `--color-crisis` | `#ff8a8a` | **8.0:1** | AAA |
| `--color-thriving` | `#7fd6a0` | **10.2:1** | AAA |
| `--color-tense` | `#f0c674` | **11.4:1** | AAA |

**Accent rationale:** cold teal `#5ec8d8` is deliberately *not* safe-blue (forbidden) and *not* ember-gold — it is the cold-forged counterpoint that signals "modern fusion" at a glance. `--color-text-faint #8b97a4` = 5.9:1, so unlike the other two themes, modern's faint token is body-safe.
**Dominant anchor:** a single full-bleed data readout — the stability figure rendered as a large monospaced numeral with a thin accent underline (console aesthetic), replacing ember's glowing orb. One anchor, no equal-weight grid.
**Layout/density:** `--wms-density: compact` → tighter rows, more data per screen, kept legible by editorial leading. **Motion:** 160–240ms slide/opacity only; no glow/orbit/particle; reduced-motion → instant.
**Signature components:** accent-underlined numerals, 2px-radius sharp cards, hairline graphite dividers (no gems), monospaced metadata.

---

## 5. FEATURE-PARITY PLAN (concrete, per the chosen architecture)

Goal: every WMS feature (Sessions, Hooks, Secrets, Fronts, Locations, Bestiary, Relations, Web, Solo, Threads, plus War Room + Chronicle) reachable in **all three** themes.

Because all three themes now share the WMS shell (Architecture A), the rail and panels render in every theme by default. Parity work is therefore confined to **skinning + accessibility**, not feature porting:

1. **Single source of triggers:** retain the `.wms-nav__item[data-route]` rail (lines 2581–2614) as the universal launcher in all three themes. No second nav implementation. The legacy `.main-row` launcher pathways (e.g., the `Interact`/fallback branches at 4576–4580) become unused for production themes — leave them as harmless fallbacks.
2. **Panels already parity-ready:** `.sc-panel` drawers (line 3184+) are token-driven and theme-agnostic. Each theme just needs scoped `body.theme-X .sc-panel`/`.sc-panel__*` skin rules (surface, border, type) — additive, never touching ember's values.
3. **Verification matrix:** for each theme × each route, confirm: rail item visible → click opens panel → panel renders content → contrast AA → reduced-motion respected. (10 routes × 3 themes = 30 checks; manual, since no test suite — see §6.)
4. **Relationship Web ARIA fix (known gap):** the SVG web (panel `web`, CSS region ~line 2253) lacks ARIA. Add `role="img"` + `aria-label` summarizing node/edge counts, and a visually-hidden text list of relationships as a non-visual equivalent — applied once, inherited by all themes.

Result: parity is delivered by **one** feature-complete shell, three skins. No feature is implemented twice.

---

## 6. PHASED IMPLEMENTATION PLAN (low-risk, ember-protecting)

No build step exists; every phase ends with a **manual browser verification** (open `src/index.html`, toggle via `localStorage.setItem('rw_dev_theme','X')` then reload). Phase 0 is strictly non-destructive.

**Phase 0 — Token & skin scaffolding (NON-DESTRUCTIVE).**
- Add empty/partial `body.theme-manuscript { … }` and `body.theme-modern { … }` token blocks near line 173, defining the §4 color/font/density tokens. Add `--wms-density` token consumed by a few WMS paddings.
- Do NOT touch `applyTheme()` layout fork yet; do NOT touch ember tokens.
- *Verify:* ember unchanged (regression baseline screenshot). Set `rw_dev_theme=manuscript` → confirms tokens resolve (still legacy layout, expected).
- *Files/anchors:* insert after line 173; token contract lines 60–109 as reference.

**Phase 1 — Make all three themes use the WMS shell (the architecture switch).**
- In `applyTheme()` (13818–13824): change the layout fork so `wms.style.display='grid'` and `mainRow/chronBand` hidden for **all three** production themes (not just ember). Keep legacy layout reachable only behind an explicit debug flag.
- *Risk control:* this is the one structural change. Guard it: if `WorldShell` undefined, fall back to legacy (preserve current safety at 13826).
- *Verify:* each theme shows the rail + war room; ember visually identical to Phase 0 baseline.

**Phase 2 — Manuscript skin + the slider-zone removal.**
- Author `body.theme-manuscript .wms-*` / `.sc-panel*` skin rules (light surfaces, serif, comfortable density, ornament dividers).
- **Remove `.workbench__slider-zones` markup (lines 6461–6466)** and dormant CSS (1513–1517) — the red/green/blue finding. Replaces with nothing (clean) per §1.4.
- *Verify:* manuscript reads as light codex, AA contrast spot-check on text-faint/gold; ember/modern unaffected; slider has no color bar in any theme.

**Phase 3 — Modern skin (the fusion).**
- Author `body.theme-modern .wms-*` rules: cool graphite surfaces, teal accent, compact density, Fraunces display + serif body, console numeral anchor, no ornament/glow.
- *Verify:* modern reads as distinct console; the fusion table (§4.3) holds visually; ember untouched.

**Phase 4 — Parity + accessibility sweep.**
- Run the 30-check matrix (§5.3). Add Relationship Web ARIA (§5.4). Extend `.force-reduced-motion` coverage to any new motion.
- *Verify:* every route opens in every theme; contrast checker confirms §4 ratios; keyboard nav reaches rail + panels.

**Phase 5 — Polish & retire legacy.**
- Remove now-dead `theme-faint`-on-body-copy usages (lint, §7). Confirm legacy `.main-row` is only dev-reachable. Final three-theme regression pass.

Ember is protected in every phase: Phases 0,2,3,4 are additive/scoped; Phase 1 is the only structural change and is guarded + baselined.

---

## 7. RISKS & FAILURE MODES

1. **Ember regression via shared shell (highest).** Phase 1 changes the layout fork. *Mitigation:* baseline screenshot before/after; ember tokens never edited; new rules strictly `body.theme-manuscript`/`body.theme-modern` scoped — grep every new rule to confirm it carries a theme prefix.
2. **Contrast traps.** (a) Manuscript bright gold `#c9a961` as body text fails on parchment — restrict to ≥3:1 large/decoration; body gold must use `#8a6a1f`. (b) `--color-text-faint` is body-unsafe in ember (3.6:1) and manuscript pre-fix — never use faint for body copy. *Mitigation:* add a documented rule "faint = decoration/large only," verify every theme's faint/accent with the §2.5 formula (done in §4).
3. **Scope blowup into feature rewrites.** The temptation to "improve" panels per theme. *Mitigation:* Architecture A forbids per-theme feature code — panels are skinned only. Any feature change lands once, theme-agnostic.
4. **Token leakage.** A new rule without a `body.theme-X` prefix recolors all themes including ember. *Mitigation:* lint/grep gate in Phase 5.
5. **Reduced-motion gaps.** New manuscript/modern motion not added to `.force-reduced-motion`. *Mitigation:* Phase 4 sweep; keep motion minimal in both new themes by design.
6. **Single-file fragility.** 14.8k lines, no tests, no build — every edit is in production. *Mitigation:* small phased diffs, manual browser verify each phase, `rw_dev_theme` for safe theme toggling without touching saved user state.
7. **Stale-premise risk (already realized once).** The brief assumed manuscript/modern existed as color-only themes; they were removed in v1.0. Any future planning must re-grep before assuming, not trust prior docs.
