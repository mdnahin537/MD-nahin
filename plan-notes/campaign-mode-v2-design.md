# Campaign Mode v2 — Design Spec (binding)
**Owner:** Hunter. **Drafter:** Claude (this session). **Date:** 2026-06-02.
**Status:** Locked spec for the dedicated Opus 4.8 rebuild agent.
**Source of truth:** Hunter's verbatim direction (this session's answers), `ai-layer-plan-v2.md` (§F1 / §F3 / §F8 / §11), `integration-audit-and-roadmap.md`.

---

## 0. Hunter's verbatim direction (locked)
> "Make it more useful. It should have manual AND help of the AI, also connected to the main world very quality-fully, like Tonight Mode that is connected, OR better. Make the manual [feel] fun and easy and quality-full; also when needed help of AI. Also when Live Mode on, AI can directly complement on your work and ask YOU important questions about the world, sometimes many times find mistakes, many times say how to make it interesting and how to make it better, also it complement on your work. Make the whole thing beautiful and elegant."

This is the **acceptance bar**. Every screen, interaction, and copy decision is evaluated against it.

---

## 1. Product thesis (one sentence)
Campaign Mode is the **persistent session-prep board** where you keep what tonight needs, with the AI as a quiet collaborator — invisible when you're typing, present when you tap "help," and (when Live Mode is on) actively reading what you're doing to ask sharp questions, surface contradictions, and offer pushes. Manual stays first-class. AI never overrides; it offers.

---

## 2. What Campaign Mode IS / IS NOT

**IS:**
- A persistent per-realm board of clocks, beats, NPCs, secrets, notes, stakes (the current shape — keep the schema).
- Tightly connected to the world brain (factions, characters, chronicle, hooks, pressures).
- Beautiful and elegant in all three themes (Ember default, Manuscript light, Modern).
- The first surface to use F3 Live Mode commentary.

**IS NOT:**
- A clone of Tonight (which is one-shot session generation).
- A GM-tools tray (those go in WorldShell left panel — separate task).
- Replaceable by a chat interface — manual data entry must be a pleasure, not a backup.

---

## 3. Surface layout — three columns, theme-aware

Layout reuses Campaign's existing container (`campaign-mode` `:11151`); reorganize internals:

```
┌─────────────────────────────────────────────────────────────┐
│ ◄ Exit          Campaign · {RealmName}        Live Mode [○] │  ← top bar
├──────────────────────┬───────────────────┬──────────────────┤
│ STAKES               │ BEATS             │ CLOCKS           │
│ (what's at stake     │ (scenes, beat #1  │ (progress clocks,│
│  this session)       │  = Strong Start)  │  threats)        │
│                      │                   │                  │
│ NPCs                 │                   │ SECRETS          │
│ (who's at the table) │                   │ (revelations)    │
│                      │                   │                  │
│                      │ NOTES             │                  │
│                      │ (free-form GM     │                  │
│                      │  notebook)        │                  │
└──────────────────────┴───────────────────┴──────────────────┘
              ▲ Live Mode commentary rail (slides in from right when active)
```

Mobile/narrow: collapse to single-column accordion (Stakes → Beats → NPCs → Clocks → Secrets → Notes). Keep keyboard nav + ARIA from current implementation.

---

## 4. Manual UX — make it pleasurable

Current code (`:11147-11328`) is **functionally clean** (escaping, caret preservation, delegated events). Keep the engineering. Upgrade the feel.

**Required upgrades:**
1. **Inline edit affordance.** Each row's icon buttons (▲ ▼ ✕) currently always visible. Move them to **hover-reveal** on desktop, tap-to-reveal on touch (a "⋯" pill). Cleaner default state.
2. **Drag-to-reorder** for beats (currently only ▲ ▼). Use HTML5 native DnD, keyboard-accessible alternative (Alt+↑/↓). Preserve aria-grabbed semantics.
3. **NPC quick-link to characters.** If an NPC name matches a character in the realm, show a faction-color tag and let click open the character panel. If no match, show "+ link to character" affordance.
4. **Beats: "Played" timestamp.** When a beat is checked, record `playedAt:Date.now()` (extend State.cpToggleBeat). Display "played 14m ago" on hover.
5. **Secrets: "Delivered to" line.** When marked delivered, show optional textarea "to whom / how" — becomes the chronicle entry seed if user later clicks "log to chronicle."
6. **Stakes & Notes: markdown rendering** in read mode (existing `Markdown` module `:` — confirm name in code). Click to edit; preserved caret on re-render is already implemented and must stay.
7. **Empty states must teach.** Current copy is OK but generic. Each empty state shows ONE example button — e.g. *"No clocks yet. [+ Add 'Cult of the Pale Sun' (faction → 6-tick clock)]"* generates a clock seeded from a high-tension faction. Same pattern for NPCs (seeded from active characters), secrets (seeded from a chronicle event), beats (seeded from a hook).

**Beauty bar:** each card has theme-correct depth (Ember dark felt, Manuscript paper, Modern flat). No grey-on-grey AI-slop palette. Spacing breathes — at least 16px row gutter, 24px section gutter. Use existing CSS tokens; don't invent.

---

## 5. AI-on-demand (manual + AI co-edit)

Every section gets a **"⌘ AI" pill** in its header that opens a small popover. NO auto-generation; user always invokes. All calls route through `Copilot._apiFetch` (which is already cached) using the F1 `buildAIContext({nation, tier:'mid', surface:'campaign', message})` brain.

**Per-section AI actions:**

| Section | Pill actions | Output goes to |
|---|---|---|
| **Stakes** | "Read the realm" → generates the stakes paragraph (reuses `Copilot.generateStakes`). | `cp.stakes` field; user can accept/discard. |
| **Beats** | "Strong Start from world" → generates 3 variants for beat #1 (reuses `Copilot.generateStrongStart`). "Suggest next beat" → generates 3 variants based on current beats + chronicle. | Insert as new beat at position. |
| **NPCs** | "Pull NPCs for tonight" → finds 3 active characters from the realm most relevant to current stakes + beats (no API call, local pick). "Cast a fresh NPC" → reuses `Copilot.generateQuickNPC` 3-variant. | Adds to `cp.npcs`. |
| **Clocks** | "Suggest clocks from world" → AI proposes 3 clocks seeded from highest-pressure factions/hooks, with size + name + first segment justification. | Adds to `cp.clocks`. |
| **Secrets** | "Generate 5 secrets" → reuses `Copilot.generateSecrets`. | Appends to `cp.secrets`. |
| **Notes** | "Summarize the realm in 4 lines" / "What did I forget to think about?" → free-text generation. | Inserts at caret. |

**Constraint:** every AI action shows the F8 `AccuracyChip` next to its pill (`Sending: N events · ~Xk tok`). Cost is honest. Hunter sees what he's spending.

**Halal guard:** no occult/divination framing in any generated copy. Stakes/secrets stay political, social, environmental.

---

## 6. Live Mode — the F3 implementation, scoped to Campaign first

This is where Campaign earns its keep. Implement the **full F3 architecture** from `ai-layer-plan-v2.md §4`, with Campaign as the first subscriber. Other surfaces can subscribe later.

### 6.1 Toggle & onboarding
- Top-right pill in the Campaign top bar: `Live Mode [○]` / `Live Mode [●]`.
- First enable → one-time warning modal: *"Live AI uses your key. Meaningful changes may trigger a call. Pause anytime from the indicator."* Persist `cp.liveModeAcknowledged`.
- Default: **Off**. When on, default tier = **Mid** (10–30 events). Floor = Mid (see §13 of plan: Live at Low has no entity scan; mitigation is Mid floor).

### 6.2 Triggers (fire ONLY on committed meaningful change)
- Campaign edits: clock-segment-fill, beat-text-commit-on-blur, NPC field commit, secret commit, stakes commit, notes commit (debounced 2500ms).
- World edits *visible from Campaign context*: chronicle inscribe/edit, faction CRUD, character status change, hook resolved.
- **NEVER** on keystrokes, settings toggles, theme changes, snapshot/restore.

### 6.3 Rate control (all configurable in Settings → Live Mode)
- Debounce 2500ms (flurry → one call).
- Rate cap **6/min** → auto-pause "too many changes, resume?".
- Session cap **60** → hard-pause with toast.

### 6.4 Slot contracts (validated; malformed = fall back to local)
The AI fills these three slots in the Live Mode commentary rail:

```
PressureSlot:        3–5 bullets ≤16 words, stat-tagged.
                     "Capital famine clock at 4/6 — beat #2 ignores it. Connect?"

QuestionSlot:        1–3 questions ≤22 words.
                     "Lord Vasco appears in NPCs but not in beats. Is he present?"

ContradictionSlot:   0–3 flags ≤24 words, severity-tagged (info/warn/error).
                     "WARN: Secret #2 names 'Black Order' — no such faction in realm."
```

**Cached per** `(nationId, lastCampaignHash, lastChronicleHash)`. **Validation:** if the model returns malformed JSON, fall back to local heuristics (length of beats, count of unresolved hooks, faction-NPC overlap). UI never breaks; the rail just shows the local notes silently.

### 6.5 Thinking indicator
Persistent in the Campaign top bar (NOT the global app top-left, since Campaign is a focused workspace). States:
- **idle** — soft ambient pulse, theme-matched.
- **thinking** — structured motion, slightly faster (respect `prefers-reduced-motion`).
- **answered** — 1.2s flash on the rail.
- **paused** — amber dot, click → resume.
- **error** — dim red, click → detail toast.

Hover → status card: `Sending 22 of 47 events · realm snapshot · ~1.9k tok · 4/6 this min`. Theme-matched. Professional, no childish particles.

### 6.6 The commentary rail (the actual surface)
Slides in from the right when Live Mode is on. ~320px wide. Sections:
- **Heads-up** (top): the freshest PressureSlot bullet.
- **Questions** (middle): expandable.
- **Watch-outs** (bottom): expandable.

Each item has actions: `[Dismiss]` `[Pin]` `[Log to chronicle]` (last one only if it's a chronicle-worthy observation). Pinned items survive the next refresh. The rail can be collapsed to a vertical strip (icons only) or dismissed entirely (Live Mode stays on, rail just hidden).

### 6.7 Local-first first
**SHIP STEP 1 (local-only heuristics) BEFORE the AI call lands.** Even with Live Mode off / no key configured, the rail can show:
- Beats without secrets → "Beat #3 has no secret bank to draw from."
- Active characters never appearing in beats → "Lord Vasco hasn't been in a scene."
- Clocks that haven't moved in N edits → "Famine clock idle since session start."
- NPC name typos vs character/faction names (Levenshtein ≤2).

This is Hunter's *"AI that knows your world better than you"* promise on the **free** tier. AI just upgrades the same rail.

---

## 7. Schema additions to State.cp

Extend the per-realm campaign state object. Migrate existing data losslessly (add fields with defaults, never rename existing).

```js
cp: {
  // existing
  clocks, beats, npcs, secrets, notes, stakes,
  // new
  liveModeEnabled: false,
  liveModeAcknowledged: false,
  liveModeTier: 'mid',          // off / low / mid / high / max
  liveModePinned: [],            // [{id, slot, text, ts}]
  rateCapPerMin: 6,
  sessionCap: 60,
  sessionCallCount: 0,
  beats: [{..., playedAt:null}], // add playedAt to beat schema
  secrets: [{..., deliveredTo:''}], // add deliveredTo
}
```

All migrations live in one `State.cpMigrate(realm)` function called on load, idempotent. Add unit-level test by re-loading the same realm twice and asserting no further migration.

---

## 8. Code organization

- **Campaign module** stays at `:11147`. Reorganize internally; do NOT split into multiple files (single-HTML constraint).
- **New: LiveMode module** at top level (a `const LiveMode = {…}`). Holds: toggle state, trigger registry, debounce/cap logic, slot validation, local-heuristic engine, indicator state machine, rail render. Subscribed-to by Campaign in v1; other surfaces in later phases.
- **Hook into existing autosave path.** `State.persist()` already fires on every commit; LiveMode subscribes to the persist event (extend with an event emitter if one doesn't exist; minimal change).
- **Keep `_apiFetch` caching intact** (`:10173`). LiveMode calls `Copilot._apiFetch` with explicit `surface:'live-mode-campaign'` so the cost meter labels correctly.

---

## 9. Theme rules

- Ember (default, dark felt): card surfaces `--color-surface`; AI pills use `--color-accent`; rail background slightly lifted off the main column.
- Manuscript (light cartographer's table): cards as cream paper; pills as ink; rail looks like a marginalia column.
- Modern (flat): clean borders, more whitespace; rail looks like a side panel.

All three must pass WCAG AA (text on background ≥4.5:1). No grey-on-grey. No purple-gradient-on-white.

---

## 10. Halal & safety (every screen)

- No occult/divination. AI-generated secrets/stakes/clocks stay in political/social/environmental/economic territory.
- No gambling mechanics in clock segments or any random table.
- API key path unchanged (`Secrets` IDB).
- Live Mode hard caps protect against runaway spend.

---

## 11. Acceptance criteria (the agent must verify all)

- [ ] All existing Campaign data loads with no loss after the rebuild (migration tested).
- [ ] Manual entry works without an API key. The whole board is fully usable offline.
- [ ] Each section's AI pill opens a popover, calls the right generator, shows the F8 chip, lets user accept/discard.
- [ ] Live Mode toggle, warning modal, persistent ack flag.
- [ ] Triggers fire only on committed meaningful change (manual test: type-don't-blur → no fire; blur → fire after 2.5s debounce).
- [ ] Rate cap auto-pauses at 6/min; session cap hard-pauses at 60.
- [ ] Slot validation: malformed JSON falls back to local heuristics; UI never breaks.
- [ ] Local-heuristics rail works with Live Mode off and no key configured.
- [ ] Three themes verified: Ember, Manuscript, Modern. No layout breaks. WCAG AA.
- [ ] No conflict markers, no console errors, brace-balanced.
- [ ] All AI calls route through `Copilot._apiFetch` (caching intact) and `buildAIContext` (F1 brain).
- [ ] Reduced-motion preference respected by the indicator.
- [ ] Halal guard applied to system prompts.

---

## 12. Out of scope (do NOT do these in this agent run)

- GM mode reorganization (separate task per §D of audit doc).
- Other Live Mode subscribers (Tonight, Solo, Copilot panel) — Campaign first.
- F2 Copilot retune (history pruning, permission gate).
- F4 Arsenal curation.
- F7 onboarding + soft-notify.
- New themes. Mobile-gate redesign. Sync/multiplayer.

---

## 13. Risks the agent must self-mitigate

- **Container suspend kills the agent.** Commit incremental progress at every clean milestone (don't accumulate uncommitted work for hours). Use `git commit -q` per phase.
- **Brace imbalance after the rebuild.** Run a final balance check. Diff against the launch-base.
- **Live Mode triggers too aggressively in dev.** Default `rateCapPerMin=2` for the first session if `localStorage.devMode` is set.
- **Cost surprise.** The rail must show running cost; cap must be enforceable.

---

## 14. Deliverable

One branch (`claude/campaign-v2-livemode`), N clean commits, ending with a final integration commit on top of `claude/kind-johnson-H6UrM`. PR posted as draft. Brief written summary of what shipped + what was deferred.
