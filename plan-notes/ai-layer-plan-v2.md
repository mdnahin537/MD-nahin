# RealmWright AI Layer — Plan v2 (COMPLETE)
**Status:** Master plan. Supersedes v1 (`ai-layer-plan-v1.md`) and folds in the security review (`review/00-master.md`, `review/06-implementation-plan.md`).
**Verified against actual code** in `src/index.html` (16,103 lines) on 2026-06-01 — every line number below was grepped, not assumed.
**Owner:** Hunter. **Author:** Claude (this session).

---

## 0. Why v1 was wrong (so we don't repeat it)

- v1 + the reviewer said "five separate AI pipelines, fatal drift." **False.** There is already ONE shared brain: `Copilot.buildContext(nation)` at `:9213`. **14 call sites** already use it — including all three Tonight prompts (`:10021, :10088, :10139`), Arsenal (`:4687` via `_buildContext`→`Copilot.buildContext`), and every generator (hooks/NPC/stakes/glossary/names).
- So unifying is NOT a big-bang refactor. The pipe is already shared. **The water in it is thin** — that's the real work.
- Live Mode is the ONLY greenfield surface. Zero references in the file.
- The reviewer's plan (`review/`) is a **separate workstream**: security + bug fixes. Three of its fixes are **prerequisites** for features below (see §9).

**Hunter's locked principle:** ONE quality-full shared memory. Each feature is a thin branch on top (`if surface === copilot … else if live …`). Build the shared thing once, perfectly; branch per feature at the edges only. "AI that knows your world better than you — but you are the master." That quality bar is the acceptance test for every item here.

---

## 1. THE COMPLETE FEATURE INVENTORY (confirm this is all of it)

Reconstructed from the whole conversation + v1 + the review. Grouped into **5 surfaces** (where AI lives) and **3 systems** (cross-cutting). Hunter said "~7 features" — listing all 8 so we can cut/merge to your exact count.

| # | Feature | Type | Exists today? | Work |
|---|---------|------|---------------|------|
| F1 | **WorldContext engine + memory quality** | System | Yes (`:9213`, shallow) | Upgrade in place |
| F2 | **Copilot** (AI pulls) | Surface | Yes (`:9340`) | Retune to engine + history |
| F3 | **Live Mode** (AI pushes) | Surface | **No — greenfield** | Build from scratch |
| F4 | **Arsenal** (prompt vault) | Surface | Yes (`PROMPTS :4491`, 85 prompts) | Curate + two-mode split |
| F5 | **Tonight** (one-shot prep) | Surface | Yes (`:10832`) | Adapter on engine |
| F6 | **Solo** (oracle play) | Surface | Yes (`:4703`) | Adapter on engine |
| F7 | **Cost system** (meter + cap + onboarding) | System | Partial (`TransparencyLog :5096`, `Demo :5615`) | Connect + gate |
| F8 | **Effort settings + accuracy chip** | System | Partial (`copilotContextDepth`) | Per-surface knobs |

> **ACTION FOR HUNTER:** Tell me which of these 8 is NOT one of your "7," or which two I should merge. My guess: you count F7+F8 as one "control/cost" feature → 7. Confirm.

---

## 2. F1 — WorldContext engine + memory quality (THE FOUNDATION)

**What it is:** the single function that reads the world and decides what the AI sees. Today `Copilot.buildContext(nation)` (`:9213`). Every other feature rides on it. Upgrade it once → all 14 callers + Live Mode get smarter the same day.

**Current state (verified):** 4 tiers (low/med/high/full, `:9216`), slices chronicle by `slice(-N)` (`:9260`) — **dumb recency only.** Older events vanish entirely. No salience. No entity-relevance. No ledger compression. Caches system prompt but **not** the world block (`:9405`).

**Why it fails Hunter's bar:** "knows your world better than you" is impossible when event #38 silently drops below the window and the AI never learns it existed.

**Build (all inside the one function + its system-prompt sibling):**
1. **Smart selection** — replace `slice(-N)` with a union: last-5-touched ∪ top-N-by-`|weight|` ∪ entity-mentioned (Copilot path only) ∪ recency filler. Dedupe, cap at tier N, sort chronological.
2. **Ledger compression** — events outside the window become 1-line rows: `#42 · 1872 · Railroad Act · Econ +12 · trade,knowledge` (~12 tok vs ~150). The AI knows #38 exists; can ask to widen. *Nothing vanishes.*
3. **5-tier scale** replacing 4: Low 5 / Mid 20 / High 50 / X-High 70 / Max full. Map old depth strings in one line so existing callers keep working.
4. **Entity-relevance pass** (Copilot only — it has a user message): scan message for year/event-name/character/faction; force-include matched records even if outside the slice.
5. **Real world-block caching** — extend `:9405` so the world-state block gets `cache_control:{ephemeral}` keyed on nation. (Coordinates with review FIX #5.)
6. **Surface branch lives in the system-prompt builder, NOT a parallel engine.** `buildSystemPrompt(surface, toolsEnabled)` — Copilot="answer/act", Tonight="generate prep", Solo="oracle narration", Live="fill slots". Same world block, different instruction header. **This is Hunter's "if copilot then X else if live then Y" — at the edge, not in the brain.**

**Output contract:** `buildAIContext({nation, tier, surface, message?}) → {worldBlock, ledger, meta}` where `meta = {eventsFull, eventsLedger, eventsTotal, approxTokens, tier, surface, autoPromoted}`. Every feature reads `meta` for the accuracy chip (F8).

**Risk:** one function changed in place; 14 callers benefit at once; `git revert` one commit restores all. No migration choreography.

---

## 3. F2 — Copilot (AI pulls)

**Current state:** full streaming + tool-calling loop (`:9340`), `buildSystemPrompt` (`:9304`), partial caching (`:9405`). Works.

**Build:**
- Point Copilot at the upgraded F1 engine; expose the 5 tiers in the composer.
- Per-message **auto-promote nudge**: if the message references an event outside the current tier window → inline *"touches Event #59 (outside Mid) — [Send] [Promote to High, this message]"*. One message only; tier unchanged.
- **Conversation history** per nation: searchable, copy/export/clear, optional pinned messages that always ride context regardless of pruning.
- **History pruning** for cost: messages older than N turns (default 12) collapse to a one-line summary before re-send. (Coordinates with review FIX #5 step 4.)
- **Permission gate** on destructive/large tool changes: *"Apply these 3 changes? [Apply / Show diff / Decline]"*. Plus a per-message "recommendations only" toggle that suppresses all tool calls.
- Re-parent the Copilot button into the active WorldShell; restyle glyph per theme.

**Depends on:** F1, and review FIX #3 (single mutation pipeline) — see §9.

---

## 4. F3 — Live Mode (AI pushes) — GREENFIELD

**What it is:** AI proactively elevates the middle-panel content when the world meaningfully changes. A toggle in the Mode popover (NOT a mode itself). Off by default.

**Build:**
1. **Toggle + one-time warning modal** ("Live AI uses your key; meaningful changes may trigger a call; pause anytime from the indicator"). Setting persists; no re-ack on re-enable.
2. **Effort scale** (context size, not thinking): Off / Low 5 / Mid 20 / High 50 / Max full. (Per F8: this knob lives where Live Mode lives.)
3. **Triggers** — fire ONLY on committed meaningful change: chronicle inscribe/edit/delete, stat threshold crossed, faction CRUD/position, character create/status, hook create/resolve, nation switch. **Never** on keystrokes, settings, theme/mode toggles, snapshots.
4. **Debounce 2500ms** (flurry → one call) + **rate cap** (default 6/min → auto-pause "too many changes, resume") + **session cap** (default 60 → hard-pause). All configurable.
5. **Slot contracts** — each middle component declares a tight shape the AI fills:
   - `PressureSlot`: 3–5 bullets ≤16 words, stat-tagged.
   - `RecentPulseSlot`: 1 paragraph ≤80 words.
   - `ContradictionSlot`: 0–3 flags ≤24 words, severity-tagged.
   - Cached per `(nation, lastChronicleHash)`. **Validation: malformed output → fall back to local computation. UI never breaks.**
6. **Local-first (free users benefit):** Step 1 improves the local heuristics for each middle component with NO AI. Step 2 lets Live Mode elevate them. Ship Step 1 first.
7. **Thinking indicator** — persistent top-left by the chronicle band. States: idle (ambient pulse) / thinking (faster structured motion) / answered (1.2s flash) / paused (amber, click-resume) / error (dim red, click-detail). Hover → status card: `Sending 20 of 47 · realm snapshot · ~1.8k tok · 4/6 this min`. Theme-matched. Professional, not childish particles.

**Depends on:** F1, F8, review FIX #3 (auto-events) + FIX #4 (render-preserve so Live updates don't wipe panels) — see §9.

**Open hole:** Live Mode has no user message → no entity-relevance pass → a contradiction in event #38 may never reach the AI at Low. **Mitigation:** Live Mode floor = Mid; Low only for hyper-frugal users with a warning.

---

## 5. F4 — Arsenal (curated prompt vault)

**Current state:** 85 prompts (`PROMPTS :4491`), tiers S++/S/A, sections start-here/main/support/reference/gm/solo. Builds via `Arsenal.build` (`:4681`) → fills `{CAMPAIGN_CONTEXT}` from `Copilot.buildContext`. Many prompts are noise.

**Build:**
1. **Curate 85 → ≤40.** A prompt earns its place only if it does something *a user wouldn't ask the AI on their own*. Cap ≤8 per category.
2. **Categories:** Start Here (3–4) / Diagnose (6–8) / Build (6–8) / Project (4–6) / Stress-Test (4–6) / **Help** (4–6, Hunter's explicit ask: "what's my most fragile thread," "what would a player exploit first," "what's my next strong start").
3. **Each prompt declares** required context shape + expected output shape; card shows a footprint line: `Sends: state + last 5 · ~1.2k tok`.
4. **Two modes that MUST NOT overlap:**
   - **Manual / no-key:** fill template → copy to clipboard → user pastes into their own ChatGPT/Claude. If `expected_output=canon-block`, a paste-back textarea + one-click "Insert into Hooks/Chronicle/Faction." Never calls the API. Never opens Copilot.
   - **API / key:** routes through Copilot's pipeline (same model, cost meter, TransparencyLog). Inherits Copilot tier; `requires_full=true` auto-overrides to Max (this message only). Never opens clipboard.

**Depends on:** F1, F2.

---

## 6. F5 — Tonight (one-shot session prep)

**Current state:** `Tonight` module (`:10832`); three AI calls already use `Copilot.buildContext` (`:10021` session-prep, `:10088` NPC propose, `:10139` dramatic stakes). Already shares the brain.

**Build:** thin. Point its three calls at the upgraded F1 engine; give it the Tonight system-prompt branch ("generate session prep: strong start, hooks, secrets, encounter"). Own effort knob where Tonight lives (F8). Largely free once F1 lands.

**Depends on:** F1.

---

## 7. F6 — Solo (oracle play for lone GMs)

**Current state:** `Solo` module (`:4703`), Mythic GME 2e Fate Chart (licensed, cited). Three buttons: askOracle (`:5009`), scenePivot (`:5029`), moodShift (`:5035`). Uses `Copilot._apiFetchJson` transport + random tables. Logs to TransparencyLog with labels (`:4805/:4853/:4899`).

**Build:** thin. Route its world-snapshot through F1; give it the Solo system-prompt branch ("oracle: random-table result + short narrative answer in the realm's voice"). Own effort knob (F8). **Halal guard:** no divination framing — keep it "the world answers," scholarly/political language, no gambling mechanics in tables.

**Depends on:** F1.

---

## 8. F7 — Cost system (meter + cap + onboarding)

Hunter's locked decisions: **no default cap; opt-in.** Three layers — ignore / watch / wall.

**Current state:** `TransparencyLog` (`:5096`) already does per-model cost math + per-call stamps (CSS at `:2877`). `Demo` module + Turnstile already wired to worker `/api/demo/generate` (`:4389, :5615-5664`). `onboardingComplete` flag exists (`:4417`).

**Build:**
1. **Always-visible passive cost meter** in the indicator — live session spend, never interrupts. (Layer 1: ignore.)
2. **Optional soft notification** at a user-chosen USD threshold. (Layer 2: watch.)
3. **Optional hard USD cap** — user-set; on hit, pause AI with resume option. No default. (Layer 3: wall.)
4. **Onboarding flow** (Hunter's decision): **simulated demo first (zero cost)** → **5 real demo calls on Hunter** (Turnstile-gated via existing Demo module; bump worker quota 3→5) → **BYO key to continue.** Worst case ~$0.80/visitor on Sonnet, less with caching.

**Depends on:** F1 (honest token counts), review FIX #5 (real cost derivation, not the hardcoded 2000/600).

---

## 9. F8 — Effort settings + accuracy chip

Hunter's locked correction: **per-surface effort, no shared tier.** Each surface owns its knob, set where the user already is. Copilot's tier in the composer; Live's in the Mode popover; Tonight's/Solo's by their buttons; Arsenal self-manages per prompt.

**Build:**
1. Each surface stores its own effort setting (extend per-nation/`settings`).
2. **Accuracy chip is context-aware** — one component, reads F1's `meta`, shows whichever surface is active: `Sending: 20 of 47 events · realm snapshot · ~1.8k tok`. Color: green ≤2k, amber 2–8k, red >8k. Click → tier picker for the active surface. Never recomputed downstream — `meta` only.

**Depends on:** F1.

---

## 10. SECURITY FOUNDATION (the reviewer's plan — PREREQUISITE, not optional)

`review/06-implementation-plan.md` has 5 structural fixes + 2 bugs. **Three of them block features above.** This is what I was missing: the feature work sits ON this foundation.

| Review fix | Blocks | Why |
|---|---|---|
| **#1 escHtml quote-escape** (CRITICAL) | everything (ship now) | ~40 attribute-XSS sinks; AI output flows into attributes |
| **#2 CLAMP validation** | F2, F3 | AI tool args (weight/year/type) poison the model without it |
| **#3 single mutation pipeline** | F2, F3 auto-events | dual-channel bypasses thresholds → auto-event emission silently dead |
| **#4 reconcile + render-preserve** | F3 Live Mode | Live updates would wipe panels/focus/web layout without it |
| **#5 caching + honest cost** | F1, F7 | the cost meter lies (hardcoded 2000/600) until this lands |
| **Bug A torn-write guard** | F2 | mid-stream undo/switch corrupts Copilot writes |

**Therefore: security fixes #1→#5 ship BEFORE or ALONGSIDE the matching features.** Not after.

---

## 11. PHASED BUILD ORDER (everything, sequenced, each step shippable)

**Phase 0 — Security foundation** (reviewer's plan): #1 escHtml → #2 CLAMP → #3 pipeline → #4 reconcile+bugA → #5 caching. Each its own commit, browser-verified.

**Phase 1 — F1 WorldContext upgrade.** Smart-select + ledger + 5 tiers + entity-relevance + world-block cache + `buildSystemPrompt(surface)`. One function, 14 callers improve at once. *Quality bar met here.*

**Phase 2 — F8 accuracy chip + per-surface effort.** Reads F1 `meta`. Cheap, high-visibility.

**Phase 3 — F2 Copilot retune.** Tiers, auto-promote, history+pin, pruning, permission gate.

**Phase 4 — F4 Arsenal curation + two-mode split.**

**Phase 5 — F5 Tonight + F6 Solo adapters.** Thin; mostly free after F1.

**Phase 6 — F3 Live Mode.** Local-first heuristics → slot contracts → triggers/debounce/caps → indicator. The big greenfield build, last, on a proven engine.

**Phase 7 — F7 cost meter + cap + onboarding gate.** Connect TransparencyLog to the indicator; wire 5-call demo → BYO key.

**Phase 8 — Polish tail** (reviewer's contrast token, ARIA, mobile gate).

Rationale: foundation first (can't build on sand), then the shared brain (every surface depends on it), then cheap shared UI, then surfaces cheapest-first, Live Mode last because it's the only thing that can't fall back to existing code.

---

## 12. HALAL & SAFETY GUARDS (every phase)

- No occult/divination/demonology generation. Solo Oracle framed as "the world answers" — scholarly/political, never fortune-telling.
- No gambling mechanics in any random table.
- API key stays in the existing `Secrets` IDB path (`:5767`), never plaintext localStorage. (Review #1 also scrubs the key-to-disk leak at `:5084/:5100`.)
- Auto-pause + session cap + opt-in hard cap protect against runaway spend.
- Payouts remain Gumroad + Payoneer. No Stripe anywhere.

---

## 13. OPEN HOLES (push on these)

- **Live Mode at Low has no entity scan** → contradictions may never surface. Floor at Mid?
- **Cache invalidation** for faction/character/hook changes (not just chronicle hash) needs a discipline.
- **Slot-violation fallback hides model-quality issues** silently → add a dev-only counter in Settings.
- **Ollama/local can't cache** → need a graceful "no caching, still affordable" path.
- **Mobile/narrow** (<768px gate) — none of this considers table-side tablet use. In or out?
- **Arsenal-API vs Copilot attention competition** — boundary rule is clean; UX must make it obvious.

---

## 14. OUT OF SCOPE (don't let it creep in)

New themes · new persistence layer · multiplayer/sync · VTT/maps/tokens · Stripe/subscriptions · any non-halal content. Plus reviewer's debunked items (faction-orphan handling, reduced-motion particles, `#94a3b8` contrast, copilotAutoApply thrash) — **do not touch.**
