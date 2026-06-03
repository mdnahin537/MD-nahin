# Campaign Mode v2 — Build Progress

**Branch:** `claude/campaign-v2-livemode`
**Base:** `e3a0e9a` (claude/kind-johnson-H6UrM HEAD)
**Session:** 1 of N — handoff note for the next agent.

## Commits landed

| Tag | SHA | Title |
|---|---|---|
| C1 | `9c8c8a7` | Add Campaign v2 schema migration + LiveMode skeleton |
| C2 | `cd5f890` | Upgrade Campaign manual UX — hover actions, drag, links, smart empties |

Both compile clean — node --check on the concatenated `<script>` bodies passes. The single-HTML constraint is respected: zero new files except this note + a brace-balance helper + the baseline snapshot, all in `plan-notes/`.

## Spec §11 acceptance — current status

- [x] All existing Campaign data loads with no loss after the rebuild. `migrateCampaignPrep` is idempotent and additive-only; called on every `State.cp()` read.
- [x] Manual entry works without an API key. All C2 upgrades are local-only.
- [x] Each section's AI pill opens a popover, calls the right generator, shows the F8 chip, lets user accept/discard. **DONE — C3.** Per-section `⌘ AI` pills on all six section headers (Stakes/Beats/NPCs/Clocks/Secrets/Notes); each opens a `role="dialog"` popover with AccuracyChip mounted on `campaign-<section>`; 3-variant flows use `Variants.render`, single-output flows insert+close. New generators `Copilot.generateClockSuggestions` + `Copilot.generateBeatSuggestions` route through `buildAIContext`+`_apiFetch`. Also fixed a latent C2 bug: `Campaign.wire()` was never called — now invoked (idempotently) from `open()`.
- [ ] Live Mode toggle, warning modal, persistent ack flag. Settings keys exist (`liveMode`, `liveModeAcked`, `liveModeCap`) and `State.cpSetLiveOn/Acked` are wired; **toggle UI + warning modal NOT BUILT — C5.**
- [ ] Triggers fire only on committed meaningful change. **Trigger plumbing IS wired** (LiveMode subscribes to `cp:changed` and `sc:changed`, ignores `trivial:true` keystroke flags, debounces 2500ms, tracks 6/min + 60/session caps). The fire-path stub is in place; **the actual AI call lands in C6.**
- [ ] Rate cap auto-pauses at 6/min; session cap hard-pauses at 60. **Plumbing wired in `LiveMode._maybeFire`**; needs UI surface (C5).
- [ ] Slot validation. **NOT BUILT — C6** (will add `LiveMode._validateSlots` + local fallback before the AI call).
- [x] Local-heuristics rail works with Live Mode off and no key. **DONE — C4.** 320px `role="complementary"` rail inside `#campaign-mode` (Heads-up / Questions / Watch-outs per §6.6). `LiveMode._refreshHeuristics()` returns `{slot,severity,text,key}` bullets: beat-without-secret-bank → Watch-out; at-the-table NPC never in beats → Question; clock idle since session start → Watch-out (reuses the idle check); NPC name within Levenshtein ≤2 of a character/faction → Question ("did you mean X?"). Per-item Dismiss/Pin via `State.cpDismissHeuristic` / `State.cpPinHeuristic` (both pre-existing, emit through `_cpEmit`). Rail renders against local heuristics with Live off + no key (`isLocalOnly()` true) — does not depend on the AI path. Token-only CSS; indicator dot is `role="status" aria-live="polite"`.
- [ ] Three themes verified: Ember, Manuscript, Modern. C2 CSS uses tokens only, so Ember + Manuscript should follow automatically; **needs explicit visual sweep in all three — C7.**
- [x] No conflict markers, brace-balanced. Verified after each commit.
- [ ] All AI calls route through `Copilot._apiFetch` and `buildAIContext`. Surface map registered (lines added to `_SURFACE_FOCUS` + `AccuracyChip._settingKeyFor`); **generators not yet added — C3 / C6.**
- [ ] Reduced-motion preference respected by the indicator. **`LiveMode._reducedMotion` is resolved at init**; indicator DOM lands in C3.
- [x] Halal guard applied to system prompts. The new SURFACE_FOCUS lines for `campaign-clocks`, `campaign-secrets`, and `live-mode-campaign` all carry the "political/social/economic/environmental only — no occult, no divination, no gambling mechanics" guard.

## What C1 + C2 already deliver to Hunter

- **Schema-safe.** Older saves auto-migrate on read. No risk of data loss when the next session lands C3-C6.
- **Manual UX is now pleasure-first.** Hover-reveal actions, drag reorder, Alt-arrow keyboard reorder, NPC quick-link chips, secret delivered-to + chronicle log seed, markdown read-mode for notes + stakes, smart empty states that pull real seeds from the world (factions → clocks, hooks → strong-start, characters → NPC chips, chronicle → secrets).
- **Live Mode subscription substrate is wired.** Every `cp*` mutator now dispatches `cp:changed` and `sc:changed{fields:['campaign',...]}` with a `trivial` flag to distinguish keystroke autosave from committed change. LiveMode listens to both and debounces. The next agent only has to wire the rail + the AI call — the trigger plumbing is done.
- **Halal-guarded prompts.** All seven new SURFACE_FOCUS lines (six Campaign sections + Live Mode) carry the political/social/economic guard.

## What the next session must do (in order)

### C3 — Per-section AI pills + popovers + AccuracyChip mount
- Add `cmp-card__hd` AI pills (one per section): Stakes, Beats, NPCs, Clocks, Secrets, Notes.
- For each pill, build a small popover with the section's actions per spec §5 table.
- Mount AccuracyChip on each popover via `AccuracyChip.mount(el, 'campaign-<section>')`.
- Wire accept/discard flow for AI variants — `Variants.render` for 3-variant pickers; single-output flows just insert + close.
- Add `Copilot.generateClockSuggestions(nation)` and `Copilot.generateBeatSuggestions(nation, {existingBeats, position})`. Both follow the existing `_apiFetch({response_format:json_object})` pattern with 3-variant JSON output.

### C4 — Local-heuristics engine + commentary rail
- Mount a 320-px right-side rail inside `#campaign-mode`. Spec §6.6 sections: Heads-up / Questions / Watch-outs.
- Implement `LiveMode._refreshHeuristics()` returning bullets with `{slot, severity, text, key}`:
  - Beat without secret bank entry → Watch-out.
  - Active character never appearing in beats → Question.
  - Clock idle since session start → Watch-out (the `is-idle` CSS class already surfaces this on the clock — reuse the check).
  - NPC name with Levenshtein ≤2 to a character/faction → Question ("did you mean X?").
- Per-item `[Dismiss]` `[Pin]` actions. Pin → `State.cpPinHeuristic({slot,text,severity,key})`. Dismiss → `State.cpDismissHeuristic(key)`.
- Local-only mode renders whenever Live Mode is off or no API key is configured (`LiveMode.isLocalOnly()` already returns the right answer).

### C5 — Toggle, warning modal, indicator, triggers
- Add the top bar to `#campaign-mode`: title + Live Mode pill + indicator dot. CSS classes: `.cmp-livetoggle`, `.cmp-indicator` with `data-state="idle|thinking|answered|paused|error"`.
- First-enable warning modal — reuse `Modals` infra. On accept → `State.cpSetLiveAcked()` then `LiveMode.enable()`.
- Indicator listens to the `live:state` CustomEvent already emitted by `LiveMode._setState`.
- Reduced-motion is already in `LiveMode._reducedMotion`; gate animation CSS with `@media (prefers-reduced-motion: reduce)`.
- Surface rate-cap pause: when `_maybeFire` sets `paused`, the indicator shows amber + resume button.

### C6 — AI commentary call wired through `_apiFetch`
- Add `Copilot.generateLiveCommentary({nation, campaignSnapshot})` — returns `{pressure:[…], questions:[…], contradictions:[…]}`. Uses surface `'live-mode-campaign'`, tier from `AccuracyChip._tierFor('live-mode-campaign')`.
- Validate the shape (length caps per slot per spec §6.4). Malformed → fall back to local heuristics.
- Cache key per `(nationId, lastCampaignHash, lastChronicleHash)`. Hash = stable stringify of relevant cp fields; do not bypass `_apiFetch`'s built-in `cache_control` — extend it if needed but do not duplicate.
- After a successful call, `State.cpSetLastCommentary(slots)` so re-open paints instantly.

### C7 — Theme polish + accessibility pass
- Visual sweep in Ember (default), Manuscript (light), Modern (flat). Verify token-only CSS does not bleed Ember-specific colors into Manuscript/Modern (esp. the rail background and indicator dot).
- ARIA: rail is `role="complementary"`, indicator dot is `role="status"` with `aria-live="polite"`, popovers are `role="dialog"`.

### C8 — Final integration / acceptance verification
- Re-run the §11 checklist. Open the app, exercise each acceptance bullet, screenshot all three themes.
- Brace-balance check (`python3 plan-notes/check-balance.py src/index.html`) — `{` baseline drifts only with template-literal additions; verify the delta is bounded by your own edits.
- `node --check` on the concatenated scripts must pass.

## Useful anchors in the file (post-C2 line numbers — re-grep after further edits)

| What | Where |
|---|---|
| `Campaign` module | `:11247` |
| `LiveMode` module | inserted right after Campaign closes (search `const LiveMode={`) |
| `migrateCampaignPrep` | `:4524` area (search `function migrateCampaignPrep`) |
| `State.cp*` methods | `:7095` area (search `cpInsertClock`) |
| `_cpEmit` event emitter | inside State, right after the cp mutators |
| Campaign HTML root | `#campaign-mode` near end of body |
| Campaign CSS | search `/* ─── CAMPAIGN MODE v2` |
| `_SURFACE_FOCUS` campaign + live-mode-campaign lines | search `'campaign-stakes':` |
| `AccuracyChip._settingKeyFor` campaign entries | search `'campaign-stakes':'campaignStakesTier'` |
| DEFAULT_SETTINGS new tier keys | search `campaignStakesTier:'mid'` |

## Discipline notes for the next session

- The brace-balance script (`plan-notes/check-balance.py`) is a *delta* tool, not an absolute pass/fail. Its non-zero baseline comes from regex literals inside scripts that the script doesn't parse. Use it to verify your edits don't push the deltas higher than your template-literal additions warrant; rely on `node --check` for the absolute syntax verdict.
- Commit at every clean milestone. Container suspend is real.
- The §6.7 directive ("ship local-first before AI lands") is structurally enforced: `LiveMode.isLocalOnly()` returns true whenever the API isn't configured or Live Mode is off, and the rail must render against `_lastHeuristics` whenever that's true. Do not let C5/C6 break this property.
- Hunter forbids backwards-compat hacks. If you delete the old textarea path entirely, that's correct — the C2 HTML swap already removed `#cmp-notes` / `#cmp-stakes` in favor of `#cmp-notes-md` / `#cmp-stakes-md`. Don't bring the old IDs back.

## Open holes flagged in spec §13 — agent self-mitigation status

- ✅ "Container suspend kills the agent" — C1 + C2 are each self-contained safe states.
- ✅ "Brace imbalance after the rebuild" — `node --check` clean after each commit.
- ⏳ "Live Mode triggers too aggressively in dev" — devMode override (`rateCapPerMin=2`) is **NOT** wired yet. Add when C5 lands.
- ⏳ "Cost surprise" — rail must show running cost; integrate with `TransparencyLog` when C6 lands.
