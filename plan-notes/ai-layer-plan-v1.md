# RealmWright AI Layer — Plan v1
**Status:** Draft for adversarial review (Opus 4.8, max effort).
**Author scope:** Synthesis of the conversation between Hunter (owner) and Claude (current session).
**Goal:** A single coherent AI layer across Live Mode, Copilot, and Arsenal — cost-controlled, halal, no Stripe, single-file app.

---

## 0. Owner constraints (immutable; from CLAUDE.md and this thread)
- Halal only. No occult/demonic/idolatry/divination/gambling imagery or features.
- Payouts: Gumroad + Payoneer only. **No Stripe-dependent flow.**
- Single-file product: `src/index.html` (~15,800 lines). No build step. Vanilla JS + CSS variables.
- BYO API key (OpenRouter / Ollama / etc.) — user owns the spend.
- Owner is the GM tool builder; primary user is a tabletop Game Master.

## 1. The product shape (owner's framing, captured exactly)

The product has **ONE AI engine with THREE surfaces**, plus a no-key escape hatch:

1. **Live Mode** — AI *pushes* to the GM. Toggle from the Mode option (not itself a mode). Always-on while enabled. Fires automatically on changes. Output replaces the (currently shallow) middle-panel content with high-quality content.
2. **Copilot** — GM *pulls* from AI. Conversational. Full system access. Can change anything; asks permission / recommends. Permanently visible in the main panel.
3. **Arsenal** — Curated prompt vault. The differentiator: things a user wouldn't think to ask the AI on their own. Two modes (no-key clipboard / key-routed via Copilot) that **MUST NOT** overlap.

All three pull from a **single structured-context engine** with **five user-controlled tiers** that cap how much chronicle history travels with each call.

## 2. The single source of truth: structured-context engine

### 2.1 Tier scale (locked by owner)
| Tier | Chronicle events | Notes |
|---|---|---|
| Low | 5 | Live AI only — not offered for Copilot |
| Mid | 20 | Copilot baseline |
| High | 50 | Default for thoughtful chat |
| X-High | 70 | Heavy reasoning |
| Max | Full history | Power user / one-off |

The world snapshot (active nation: stats, factions, characters, hooks, locations, secrets per visibility) **always** rides along — tiers cap the chronicle slice only. This matches the existing `Copilot.buildContext(nation)` shape (file: `src/index.html:9213`).

### 2.2 Smart selection (not "the last N")
Picking N=20 chronicle entries naïvely loses the most-relevant ones. Selection is a union, deduped, capped at N, ordered chronologically:
- The last 5 events the user touched (created/edited).
- The N-highest `|weight|` events (significance bias).
- Any event whose name, year, or `relatedStats` is mentioned in the user's current message (Copilot only — Live Mode has no message).
- Filler from most-recent backwards until N is reached.

Visibility filter respected: a private event is included only if `settings.showSecrets` is true OR the current Mode is Campaign/GM.

### 2.3 Older history isn't gone — it's compressed
Events outside the full-text window are still sent as **one-line ledger lines**:
`#42 · 1872 · Railroad Act · Economic +12 · trade,knowledge`
~12-15 tokens each vs ~120-180 for full prose. Most "old event" questions resolve from the ledger; the AI can ask the user to widen the window if it needs the full text.

### 2.4 Auto-promote on cross-window reference (Copilot only)
Before sending, lightweight pre-flight scan of the user message:
- If it references a year, event title, or entity name **outside** the current tier's full window
- → inline nudge: *"Your question touches Event #59 — outside Mid window. [Send] [Promote to High for this message]"*
- One click, ONE message only — tier does not change.

### 2.5 Output shape of the engine
A single function `buildAIContext({nation, tier, message?, mode}) → {prompt, meta}` where:
- `prompt` is the structured digest (sections: `STATE`, `STATS_SNAPSHOT`, `CHRONICLE_FULL[]`, `CHRONICLE_LEDGER[]`, `FACTIONS`, `CHARACTERS`, `HOOKS`, `LOCATIONS`, `SECRETS`).
- `meta` = `{eventsFull, eventsLedger, eventsTotal, approxTokens, tier, autoPromoted}`.

Every surface reads `meta` to render the same accuracy chip (§5).

### 2.6 Auto-event emission (the "reality reflection" fix)
Currently many stat shifts happen silently — the chronicle does not reflect reality, so the AI can't reason about it.
- When a stat crosses a defined `threshold` (data already exists per stat — `src/index.html:4422+`), append a chronicle event automatically with `auto:true`, weight = threshold weight, type = stat category, visibility = public.
- UI: small "auto" badge on auto-events. User can delete/edit like any event.
- Other auto-events: faction position change ("gaining" ↔ "holding" ↔ "losing"), character status change (active → dead/exiled), hook resolution.
- Debounced: a flurry of stat changes from one user action collapses to one auto-event with the dominant cause.

This is the change that makes the middle-panel content **truthful** even before any AI is enabled.

## 3. Live Mode (the AI-pushed layer)

### 3.1 Toggle, not a mode
Lives in the Mode popover alongside Atmosphere as a checkbox. Off by default. Turning it on shows a one-time warning modal:
> "Live AI uses your API key. Any meaningful change in your world may trigger a call. You can pause anytime from the indicator."
Re-acknowledgement not required on re-enable; setting persists.

### 3.2 Five-step effort scale (controls *context size sent*, not "thinking depth")
| Step | Behavior |
|---|---|
| Off | Live Mode disabled; manual world only |
| Low | 5 events sent on trigger |
| Mid | 20 events |
| High | 50 events |
| Max | full chronicle |
(No "X-High" tier for Live Mode by owner's tier scale; the four step + Off is the user-facing control.)

### 3.3 Triggers (decided by Claude per owner's instruction)
Fire ONLY on **committed, meaningful** state changes:
- Chronicle event inscribed, edited, or deleted
- Stat threshold crossed (which by §2.6 also emits an auto-event — collapse into one Live call)
- Faction created / edited / deleted / position changed
- Character created / status changed
- Hook created / resolved
- Active nation switched

Never on:
- Keystrokes inside an input
- Settings changes
- Theme/mode/UI toggles
- Atmosphere toggle
- Snapshot operations

### 3.4 Debounce + rate cap
- 2500 ms debounce: flurry of edits → one call.
- Per-minute cap: configurable (default 6 calls/min). On exceed, auto-pause and show indicator state "paused — too many changes (resume)".
- Per-session cap: configurable (default 60 calls). On exceed, hard-pause until user re-enables.

### 3.5 The middle-panel contract (the *real* deliverable)
The middle panel today contains automated summaries that "look pretty but aren't useful." Live Mode does NOT change their layout/visual — it elevates their content.
- **Step 1 (no AI):** Improve the local computation for each component (better heuristics, real stat math, faction tension scoring). This ships first; even free users benefit.
- **Step 2 (Live Mode on):** Each component declares a tight `Slot` contract — a fixed shape, capped length, structured output. The AI fills the Slot. Examples:
  - `PressureSlot`: 3-5 bullets, ≤16 words each, each tagged by stat.
  - `RecentPulseSlot`: 1-paragraph cohesive read of last N events, ≤80 words.
  - `ContradictionSlot`: 0-3 contradiction flags, each ≤24 words, severity-tagged.
- Slot fills are cached per `(nation, lastChronicleHash)` so identical state doesn't re-call.
- Validation: if AI output violates the Slot shape, fall back to local computation (no broken UI ever).

### 3.6 The "thinking" indicator (owner's spec)
- Persistent while Live Mode is on.
- Location: top-left, alongside the chronicle band ornament.
- Professional, AI-related animation (subtle pulse / orbit / data-flow — not childish particles).
- States:
  - **Idle**: gentle ambient pulse.
  - **Thinking**: clearly different motion (faster, structured).
  - **Just answered**: 1.2s confirmation flash.
  - **Paused (cap hit)**: amber tone, click-to-resume.
  - **Error**: dim red, click for detail.
- Hover/click: opens a small status card showing `Sending: 20 of 47 events · realm snapshot · ~1.8k tok · 4/6 calls this min`.
- Theme-matched.

## 4. Copilot (the AI-pulled layer)

### 4.1 Placement
Permanent, fixed location in the main panel (specifically: re-parented from legacy `.main-row` into the active WorldShell). Glyph/icon re-styles per theme.

### 4.2 Tiers (no Low)
Mid (20) baseline, High (50), X-High (70), Max (full). Per-message override available via auto-promote nudge (§2.4).

### 4.3 Full system access + permission
- Read: anything in `State`.
- Write: anything via the tool pipeline already wired (file: `src/index.html`, search `tools` definitions).
- Permission gate: any destructive or large change asks for confirmation in-chat ("Apply these 3 changes? [Apply / Show diff / Decline]").
- "Recommendations only" mode: per-message toggle that suppresses any tool call — AI proposes, user inscribes.

### 4.4 Cost optimization (the "best capacity without 10× cost" mandate)
- **Prompt caching** where the provider supports it (OpenRouter exposes Anthropic cache control). World context = stable prefix; user messages = variable suffix. Cache stable prefix → 90% discount on re-sends.
- **Single context build per turn** — the engine output is shared with any tool call follow-up; no double-build.
- **History pruning** — old assistant/user messages older than N (configurable, default 12 turns) collapsed to a one-line summary before being re-sent.
- **Cost meter** — running cost for current session displayed on the Copilot panel; tap to open TransparencyLog (already exists, `src/index.html:5096`).

### 4.5 Conversation history
- Full local history of every Copilot conversation per nation. Searchable. Copy/export/clear.
- Optional pin-message: pinned messages always ride in context regardless of pruning.

## 5. The accuracy chip (single source of truth)
Same chip rendered by all three surfaces:
```
Sending: 20 of 47 events · realm snapshot · ~1.8k tok
```
- Hover (Live Mode indicator) or always-visible (Copilot composer & Arsenal card footer).
- Updates live as chronicle grows or tier changes.
- Click → tier picker.
- Color-coded: green ≤2k, amber 2-8k, red >8k tokens estimated.
- Reads from the engine's `meta` only — never recomputed downstream.

## 6. Arsenal (curated vault)

### 6.1 Definition
85 prompts today (`PROMPTS = […]`, `src/index.html:4491`, tiers S++/S/A across sections start-here/main/support/reference/gm/solo). Many are noise. Cut and re-curate.

### 6.2 Curation principles
- A prompt earns its place if it does something **a user wouldn't ask the AI on their own** — emergent insight, structured analysis, idea seeds.
- Each prompt declares: required context shape (state only / +last5 / +full), expected output shape (free / canon-block / list).
- Each prompt shows a one-line footprint on the card: `Sends: state + last 5 · ~1.2k tok`.
- Limit per category: ≤8 prompts. Hard ceiling per Arsenal total: ≤40 prompts (down from 85). The cut isn't arbitrary; it's quality-floor.

### 6.3 Categories (proposed)
1. **Start Here** — onboarding seeds (3-4 prompts).
2. **Diagnose** — find tensions / contradictions / missing pieces (6-8).
3. **Build** — generate factions / characters / locations / hooks (6-8).
4. **Project** — model consequences forward / backward (4-6).
5. **Stress-Test** — adversarial questioning of the GM's world (4-6).
6. **Help** — "what should I do next" / "what am I missing" / craft prompts (4-6).

### 6.4 Two modes (must not overlap)
- **Manual / no-key**: click → fill template with real data → copy to clipboard. User pastes into ChatGPT/Claude/Gemini. **If** the prompt's `expected_output = canon-block`, a paste-back panel opens with a textarea labeled "Paste AI response here" and a one-click "Insert into [Hooks / Chronicle / Faction]" button. This path never makes an API call.
- **API / key mode**: routes through Copilot's pipeline (same model, cost meter, TransparencyLog). Tier inherited from Copilot's current tier; if the prompt declares `requires_full=true` and Copilot is below Max, auto-override (this message only).
- **Boundary rule:** Manual mode never opens Copilot; API mode never opens clipboard. They share NO UI.

### 6.5 Help category (owner's explicit ask)
Prompts that solve "I don't know what to do":
- "What's the most fragile thread in my realm right now?"
- "What would a player exploit first if they sat at this table tonight?"
- "What's the one event missing that would make my world believable?"
- "What's my next session's strong start, given what just happened?"
- "Help me name a prompt I want but don't know how to ask."

## 7. Halal & safety guards
- No occult-themed generation. AI output that drifts into divination/demonology is gently redirected ("This realm uses scholarly/political language — let's reframe as faction or order.").
- No gambling mechanics in any random table or Solo Oracle output.
- API key never written to plaintext localStorage where avoidable — uses existing `Secrets` IDB pathway (`src/index.html:5767`).
- Auto-pause and per-session cap protect against runaway cost.

## 8. Implementation order (phased; nothing wasted)
1. **Engine** — `buildAIContext()` with tiers, smart-select, ledger-compression, meta.
2. **Auto-event emitter** — stat-threshold + faction/character/hook events → chronicle.
3. **Accuracy chip** — single component read from `meta`; mount points in Copilot composer.
4. **Copilot retune** — switch existing `Copilot.buildContext` to call engine; expose new tiers; add per-message auto-promote nudge; re-parent button into shell.
5. **Local middle-panel improvement** — quality lift for each middle component WITHOUT AI. New heuristics.
6. **Slot contracts** — define each middle-component Slot shape + local fallback path.
7. **Live Mode** — toggle + warning + trigger + debounce + rate cap + indicator + slot fills + cache.
8. **Arsenal curation** — cut to ≤40, declare footprints, add Help category, build manual/API split, paste-back canon-block UI.
9. **Cost optimizations** — prompt caching + history pruning + dedupe.
10. **Stress test** — manual scenarios for cost-runaway, slot-violation fallback, auto-promote, tier transitions.

## 9. Open holes I (Claude) already see and want the reviewer to push harder on
- **Reality reflection vs noise:** auto-emitting events on every threshold can flood the chronicle. Need a noise filter (collapse to one event per user-action burst). I have a debounce idea but not a final policy.
- **Live Mode cache invalidation:** caching by `lastChronicleHash` is fine for chronicle changes; less clear for faction/character/hook changes. Need cache-key discipline.
- **The 59-events problem in Live Mode (no message to scan):** auto-promote relies on the user's message. Live Mode has none. Risk: a contradiction sitting in event #38 never reaches the AI on Low. Mitigation idea: Live Mode at Mid+ always; Low only for hyper-frugal users with warning.
- **Slot violation fallback could hide model quality issues.** If AI consistently fails Slot shapes, we silently never tell the user. Need a small dev-only counter visible from Settings.
- **Arsenal-API path could compete with Copilot for the user's attention.** Risk of feature confusion. The boundary in §6.4 is clean rule but UX needs to make it obvious.
- **Mobile/narrow:** existing mobile-gate blocks <768px. None of this design considers narrow-screen GM use at the table. Out of scope or worth a tablet pass?
- **Provider parity:** designed against OpenRouter (Anthropic cache control). Ollama / local doesn't cache. Need a graceful "no caching available" mode that's still affordable.
- **What about Solo mode and Tonight mode?** Tonight is in the Mode picker and is its own AI flow. Plan currently ignores it — must Tonight share the engine, or stay separate?

## 10. What is explicitly out of scope (so the reviewer doesn't add it)
- New theme work.
- New persistence layer (use existing State + IDB).
- Multiplayer / sync / collab.
- VTT / map rendering / tokens.
- Stripe / subscription billing.
- Any non-halal aesthetic or content.
