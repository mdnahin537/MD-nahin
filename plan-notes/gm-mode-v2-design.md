# GM Mode v2 — Design Spec (binding)
**Owner:** Hunter. **Drafter:** Claude (this session). **Date:** 2026-06-02.
**Status:** Locked spec. Launch the GM-mode rebuild agent against this once C3+C4 is integrated.
**Base SHA (will refresh at launch):** TBD post C3+C4.

---

## 0. Hunter's verbatim direction (locked)
> "GM mode will [be] in the mode option. Also it won't be like before — when [enabled], a quality-full animated bar will appear that visually looks good, and the GM would like, and is not annoying. Also make this mode actually callable GM mode, not a whole mode like Tonight mode or Campaign mode. GM mode will be in the world mode — by enabling, a bar will come that visually looks good, clean, and high-quality, not annoying. Actually worth of being called GM mode. Something elegant and simple yet very highly useful and effective and looks cool."

This is the **acceptance bar**. Every visual, animation, and interaction choice is evaluated against it.

---

## 1. Architectural rule (one sentence, binding)
**GM is a *modifier* layered onto World mode — not a destination.** Tonight is a workflow overlay. Campaign is a full-screen prep board. **World is the dashboard.** GM is an *enabled state* that appears as an elegant tool bar on top of World, and quietly disappears when off.

Implications:
- The Mode dropdown gains a fourth entry: **GM Mode** — but it's a **toggle item**, not a destination. Selecting it: turns GM on if off, off if on. Visual treatment in the dropdown reflects this (toggle pill, not a chevron).
- GM is **independent** of Tonight/Campaign/World as the *primary mode*. Going to Tonight or Campaign should not force GM off; coming back to World should preserve whatever GM state was set. (But: when going to Campaign, the existing `:15199` auto-enable is preserved — Campaign needs GM context.)
- The current Settings `#toggle-gm-mode` is **removed** from Settings UI. There's only one canonical place to toggle GM: the Mode picker. The badge stays as a quick-disable.

---

## 2. The verified bug to fix first
**File:** `src/index.html` Mode-picker handler at `:15202-15205` (around the World branch).
**Current code (paraphrased):**
```js
}else{
  // World — quiet worldbuilding on the dashboard.
  if(typeof Campaign!=='undefined')Campaign.close();
  showToast('World mode — quiet worldbuilding.',[],2200);
}
```
**Bug:** The comment at `:15160` declares "World = WorldShell with GM Mode off," but the World branch never disables GM. Result: Campaign → World leaves `gmMode=true`, toolbar visible, `world-mode-shell` pinned at `top:96px`, layout visibly stuck.

**Fix:** Decoupling GM from World/Campaign auto-toggle is the correct fix under the new architecture:
- Remove the auto-enable in the Campaign branch (`:15199`).
- Do NOT auto-disable in the World branch.
- GM is now ONLY toggled by the user via the new GM dropdown item (or the badge).
- Campaign opens regardless of GM state; if user wants GM on while in Campaign, they enable it explicitly.

This fix is verifiable: toggle GM on, switch through Tonight → Campaign → World → Tonight, GM state never changes unless user toggles it.

---

## 3. The GM bar — visual + interaction spec

### 3.1 Position & default form
- Sits **below the identity strip**, above the `main-row` — same grid slot as the current `.gm-toolbar`. **DOM stays in roughly the same place; the visual treatment is rebuilt.**
- Two states: **collapsed** (default when GM toggles on) and **expanded** (on hover/focus of any tool group).
- Collapsed height: **44px**. Not 36px — the current 36px feels cramped. The extra 8px lets the bar breathe and gives groups room to glow on hover.
- The `body.gm-mode #app` grid override updates from `36px` to `44px`, and `body.gm-mode .world-mode-shell{top:104px}` (60+44).
- When GM toggles off: **animated retract**, then the grid override is removed so `body` returns to the 3-row layout with no residue.

### 3.2 Visual treatment — theme-aware

**Ember (default):**
- Background: `linear-gradient(180deg, rgba(13,27,42,0.92) 0%, rgba(8,16,26,0.96) 100%)` — felt darkness with depth.
- Border-bottom: 0.5px gold (`var(--color-gold)`) with `box-shadow: 0 1px 0 0 rgba(201,169,97,0.18)` for the subtle highlight line below.
- A **single soft glow** at center: `radial-gradient(ellipse at center, rgba(201,169,97,0.06) 0%, transparent 60%)` — atmospheric, not loud.
- Tool buttons: borderless in collapsed state, just the icon + 1ch label. On group hover, the active group's button-cluster gains a hairline gold border that fades in over 180ms.
- Typography: `var(--font-mono)` 11px uppercase tracking 0.08em for the group labels — feels like a console, not a webform.

**Manuscript:**
- Background: `var(--color-parchment-warm)` with a subtle deckle-edge texture (CSS only — no images). Use `box-shadow: inset 0 -1px 0 0 var(--color-border-default)` as the bottom rule.
- Buttons: inkwell black on parchment. Group hover: a thin sepia rule underlines the active cluster.
- Typography: serif italic for labels — feels like marginalia.

**Modern (flat):**
- Background: `#161b22` with a single accent line bottom (`rgba(94,200,216,0.32)`).
- Buttons: flat outlined `#384250`; hover state flips to `rgba(94,200,216,0.10)` background.
- Typography: clean sans, 11px uppercase tracking 0.06em.

**All themes:** Crisp, professional, no glitter. Reads like a tool the user respects.

### 3.3 Tool grouping — the 10 tools become 4 groups
Current bar is a flat row of 10 buttons; visually chaotic. Group them:

| Group | Tools | Icon |
|---|---|---|
| **Start tonight** | Strong Start, Session Prep, What's at Stake | flame mark (✸) |
| **People** | Quick NPC, Names | persona mark (◐) |
| **Handouts** | Proclamation, News, Letter | scroll mark (📜) |
| **Reference** | Glossary, Encounter | book mark (✦) |

- Collapsed state: shows **4 group chips** with icon + group label, plus a "Powered by your Copilot" hint at the right.
- Hover/focus a group → that chip expands inline, revealing its 2–3 tools as buttons. Adjacent groups gently dim (opacity 0.55).
- Tap on touch: same expand, with explicit close target.
- One group expanded at a time. ESC collapses.

### 3.4 Motion — purposeful, minimal
- **Entrance** (GM on): bar slides down from below identity strip over **220ms** with `cubic-bezier(.2,.7,.2,1)`. Tools fade in 80ms later, stagger 24ms across the 4 groups.
- **Exit** (GM off): reverse — tools fade out (110ms), bar retracts (180ms). Layout reflows to 3-row grid only AFTER retract completes.
- **Group expand**: 160ms width transition + 80ms opacity for tools inside.
- **Reduced motion** (`prefers-reduced-motion: reduce`): all transitions become 0ms snaps. Bar simply appears/disappears. No layout jump.
- **No bounce, no rubber-band, no parallax, no particles, no shimmer.** Hunter's words: "not annoying."

### 3.5 Mode-picker integration
The Mode dropdown gains a fourth row, separated by a hairline rule from Tonight/Campaign/World:

```
┌─────────────────────────────┐
│ ● Tonight                   │
│ ○ Campaign                  │
│ ○ World                     │
├─────────────────────────────┤
│ GM Mode             [ on  ] │  ← toggle, not a destination
└─────────────────────────────┘
```

- Top three: current radio behavior, `aria-current="true"` on the active one.
- GM row: `role="menuitemcheckbox" aria-checked="true|false"`. The pill on the right reflects state.
- Click GM row: toggles `gmMode`; does NOT close the dropdown immediately (let the user see the state flip). Auto-close after 600ms or on outside-click.

### 3.6 Accessibility
- The bar is `role="toolbar" aria-label="Game Master tools" aria-expanded={collapsed|expanded}`.
- Each group chip is a `button` with `aria-haspopup="true" aria-expanded={false|true}` and `aria-controls="<group-id>"`.
- Inner tool buttons are real `<button>`s, keyboard-tabbable left→right inside the active group, ESC returns focus to the group chip.
- Focus ring is **visible** — never `outline:none` without a replacement. 2px solid `var(--color-gold)` (or theme accent) at 2px offset.
- Tab order when GM on: identity strip → bar group chips → main content. When GM off: bar is `display:none` (correctly out of tab order).
- Reduced-motion fully honored as in §3.4.

---

## 4. State & persistence

- `gmMode: boolean` stays in `State.data.meta.settings`.
- **NEW:** `gmBarExpandedGroup: string|null` is session-scoped — does NOT persist across reloads. Default `null` (collapsed). Lives in `LiveMode`-adjacent ephemeral state or `GMMode._state` (private), not in `State.data`.
- The Settings panel's `#toggle-gm-mode` and its row are **removed** from the DOM. Search-and-delete (it's at `:3716`).

---

## 5. Code changes — exact targets

**Files affected:** `src/index.html` only. Single-HTML constraint preserved.

| What | Where | Action |
|---|---|---|
| Old `.gm-toolbar` HTML | `:3219-3232` | Replace with new grouped bar markup. |
| Old `.gm-toolbar*` CSS | `:2495-2552` (across themes) | Delete; replace with new `.gm-bar*` CSS. |
| `body.gm-mode #app` grid | `:2581-2588` | Update `36px` → `44px`, `top:96px` → `top:104px`. |
| `GMMode` module | `:12389` | Update `apply()` to drive the new bar's enter/exit animation and bind group hover/focus. Tool button click handlers preserve current targets. |
| Settings `#toggle-gm-mode` | `:3716` | Remove the row. |
| Settings open handler GM sync | `:15269` | Remove the `toggle-gm-mode` sync line. |
| Mode-picker dropdown markup | `:3197-3208` | Add the 4th GM-toggle row. |
| Mode-picker handler | `:15186-15205` | Handle new GM toggle. Remove auto-enable from Campaign branch (`:15199`). Do NOT auto-disable in World branch (the bug). |
| `sync*` for dropdown UI | `:15164-15171` | Reflect GM checked state on the new row. |
| Badge quick-disable | `:12943` | Preserve as-is. |

---

## 6. Acceptance criteria

- [ ] GM toggle exists ONLY in the Mode-picker dropdown and the badge. Settings panel no longer has it.
- [ ] Toggling GM in the picker shows/hides the new bar with the §3.4 animation.
- [ ] Mode switches (Tonight↔Campaign↔World) do NOT change GM state. GM state is independent.
- [ ] All 10 existing tools work — Quick NPC, Session Prep, Stakes, Strong Start, Proclamation, News, Letter, Glossary, Encounter, Names. No regression in their generators.
- [ ] 4 groups, hover/focus expands the active one, ESC collapses, only one expanded at a time.
- [ ] When GM toggles off, layout reverts cleanly to the 3-row grid — no 36px/44px residue, no `top:104px` hang on `world-mode-shell`.
- [ ] Three themes verified: Ember elegant-dark, Manuscript paper, Modern flat. WCAG AA on all text.
- [ ] Reduced-motion respected: snap transitions, no animation.
- [ ] Keyboard nav works through groups + inner tools; visible focus rings.
- [ ] Brace balance preserved. No conflict markers. `node --check` clean on concatenated scripts.
- [ ] Halal: no occult/divination/fortune-telling framing in any tool prompt (the existing surfaces should already be guarded; verify).

---

## 7. Out of scope (do NOT do in this agent run)
- Don't change tool prompts or generators (`generateProclamation`, etc.) — they work.
- Don't touch Campaign Mode (parallel agent owns it).
- Don't add new GM tools. The 10 are the set.
- Don't move tools into the WorldShell left panel (`wms-lp`) — Hunter chose the bar approach.
- Don't add Live Mode commentary to GM bar — that's a later phase.

---

## 8. The quality bar (Hunter's words, the final test)
*"Something elegant and simple yet very highly useful and effective and looks cool."*

Before final commit, the agent must verify: open the app in all three themes, toggle GM on/off ten times in a row, expand each group, exit cleanly. If at any point the bar **annoys** the user (jitter, layout shift, harsh animation, color clash, font feels wrong), the bar fails this spec — fix before reporting done. Take a screenshot of each theme in collapsed and expanded states for the final report.
