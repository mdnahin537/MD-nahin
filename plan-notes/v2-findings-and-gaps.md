# Plan v2 — Verification Findings & Gaps (pre-subagent)
**By:** Claude (this session), 2026-06-01. Grounded in grep of `src/index.html` (16,103 lines).
**Purpose:** Correct the v2 plan's biggest error — it catalogued 5 AI surfaces; there are ~16. Hand-off basis for the Opus verification subagent.

## THE BIG MISS: "Copilot" is a container for ~13 AI generators, not one surface

Every one routes through `Copilot.buildContext` (`:9213`) + `Copilot._apiFetch` (`:9675`). They ALL already share the one brain — which is good for unification, but every one needs the F1 quality upgrade + its own surface system-prompt branch.

### Complete AI-feature inventory (verified call sites)
| Surface | Copilot method | Invoked from | In v2 plan? |
|---|---|---|---|
| Copilot chat | `send()` `:9340` | composer | ✅ F2 |
| Live Mode | — | greenfield | ✅ F3 (none in code) |
| Arsenal | `PromptFill.build` `:4681` | vault | ✅ F4 |
| Tonight: session prep | `generateSessionPrep` `:10004` | `:11132` | ✅ F5 |
| Tonight: strong start | `generateStrongStart` `:9856` | `:10953/:11132/:12081` | ⚠️ partial |
| Tonight: quick NPC | `generateQuickNPC` `:10084` | Tonight | ⚠️ partial |
| Tonight: stakes | `generateStakes` `:10135` | Tonight | ⚠️ partial |
| Solo oracle/scene/mood | `:4806/:4854/:4900` | Solo panel | ✅ F6 |
| **Import-from-text** | `importFromText` `:9791` | `:10935/:14456` | ❌ MISSED |
| **Secrets generation** | `generateSecrets` `:9880` | `:11574` | ❌ MISSED |
| **Continuity checker** | `checkContinuity` `:9759` | `:8177` | ❌ MISSED |
| **Handouts: proclamation** | `generateProclamation` `:9904` | `:13094` | ❌ MISSED |
| **Handouts: news bulletin** | `generateNewsBulletin` `:9913` | `:13098` | ❌ MISSED |
| **Handouts: in-char letter** | `generateInCharacterLetter` `:9923` | `:13104` | ❌ MISSED |
| **Bestiary creature** | `generateCreature` `:9952` | `:13249` | ❌ MISSED |
| **Relations suggest** | `suggestRelations` `:9941` | `:13352` | ❌ MISSED |
| **Decipher notes** | `decipherNotes` `:9967` | `:15689` | ❌ MISSED |
| **Glossary** | `generateGlossary` `:10158` | `:15182` (GlossaryUI) | ❌ MISSED |
| **Names** | `generateNames` `:10178` | `:15240` (NamingUI) | ❌ MISSED |
| **Encounter Builder** | `EncounterBuilder._callCopilot` `:15399` | `:15423` | ❌ MISSED |

### Non-AI modules (scope-relevant, NOT AI surfaces) — verified 0 AI calls
`Campaign` (`:10648`), `Fronts` (`:12797`), `Threads` (`:12134`). `GMMode` (`:11887`) DOES make 3 AI calls (strong start `:12081`, etc).

### All 48 top-level modules (for completeness)
PromptFill, Solo, TransparencyLog, EmptyStates, MobileGate, Utils, CLAMP, Markdown, Variants, LicenseQueue, LicenseGate, DemoCounter, Demo, AutoSave, IDB, Secrets, State, Compute, UI, Render, Interact, Parse, FocusTrap, Modals, FoundryExport, Copilot, SampleMode, FrontDoor, Campaign, Tonight, SHSPanels, GMMode, Threads, WorldShell, PrintPreview, Fronts, Handouts, Bestiary, Relations, RealmSettings, RelationshipWeb, GlobalSearch, Ambient, SnapshotManager, GlossaryUI, NamingUI, EncounterBuilder, LicenseGateUI.

## IMPLICATION FOR THE PLAN
- F1 (WorldContext upgrade) payoff is even bigger: ~16 AI features improve at once, not 5.
- `buildSystemPrompt(surface)` must branch for ~10 surface types, not 4.
- The accuracy chip (F8) must be context-aware across ALL these surfaces.
- Cost meter (F7) must aggregate spend across all of them (TransparencyLog already logs each — verify labels exist for all).
- CLAMP / mutation-pipeline security fixes touch every generator that writes back (secrets, creature→bestiary, encounter→bestiary, import→nation).

## STILL UNVERIFIED (for the subagent)
- Does each generator actually pass through `buildContext`, or do some build ad-hoc context? (Spot-checked Tonight/glossary/names = yes; NOT all 16 confirmed.)
- Caching: only Copilot.send (`:9405`) caches; do the `_apiFetch` JSON generators cache at all? (Likely NOT — they use `_apiFetch` which may lack cache_control.)
- Does `importFromText` (AI nation creation) respect CLAMP on the seed it builds?
- Per-surface effort: only Copilot has `copilotContextDepth`. The other 15 have no effort knob — confirm.
