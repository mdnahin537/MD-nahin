# Audit chunk plan (line ranges → sub-agent)

## JS deep-dive
| id | range | modules | model |
|----|-------|---------|-------|
| C01 | 4652–5003 | consts, SEED_NATIONS, PROMPTS, PressureRules, prompt templates, PromptFill | sonnet |
| C02 | 5004–5602 | Solo, TransparencyLog, CostMeter, CostGate | sonnet |
| C03 | 5603–5969 | EffortPicker, AccuracyChip, EmptyStates, MobileGate, Utils, CLAMP, Markdown, Variants | opus |
| C04 | 5970–6556 | TERM_GM_MAP, LicenseQueue, LicenseGate, DemoCounter, Demo, AutoSave | opus |
| C05 | 6557–7510 | IDB, Secrets, STORAGE_KEY, State (core persistence) | opus |
| C06 | 7511–8392 | Compute, UI, Render, Interact, Parse (render engine) | opus |
| C07 | 8393–9345 | FocusTrap, Modals, FoundryExport | sonnet |
| C08a | 9346–10250 | COPILOT_TOOLS, Copilot (part 1: streaming/tools) | opus |
| C08b | 10251–11125 | Copilot (part 2: completion/canon parse/apply) | opus |
| C09 | 11126–12722 | SampleMode, FrontDoor, Campaign, LiveMode, Tonight | sonnet |
| C10 | 12723–14390 | SHSPanels, GMMode, Threads, WorldShell | sonnet |
| C11 | 14391–15483 | PrintPreview, Fronts, Handouts, Bestiary, Relations, RealmSettings, RelationshipWeb | sonnet |
| C12 | 15484–16645 | GlobalSearch | sonnet |
| C13 | 16646–17575 | Ambient, SnapshotManager, GlossaryUI, NamingUI, EncounterBuilder, LicenseGateUI | sonnet |

## Non-JS
| id | range | scope | model |
|----|-------|-------|-------|
| C14 | 54–3199 | CSS stylesheet — slop, dead selectors, responsive, consistency | sonnet |
| C15 | 3200–4651 + 17576–17863 | body HTML, inline sanitizer script (3222–3282), trailing templates | sonnet |

## Cross-cutting (re-read targeted areas)
| id | scope | model |
|----|-------|-------|
| X1 | wiring graph: orphans, dangling refs, listener leaks, render-call graph, module init order | opus |
| X2 | security deep-dive: sanitizer, all innerHTML sinks, license/Worker protocol, key storage, AI tool-calling safety, empty Turnstile key, CSP | opus |
| X3 | logic execution in Node: buildNationFromSeed, migrateIfNeeded, migrateCampaignPrep, resolveVars, Markdown, canon parser, stat math | sonnet |
| X4 | data-flow/state integrity: round-trip, schema 2.5.0 migration, every DEFAULT_SETTINGS field read+written, snapshots | opus |

Waves: 1=[C04,C05,C06,C08a,X2] · 2=[C03,C08b,C01,C02,C07] · 3=[C09,C10,C11,C12,C13] · 4=[C14,C15,X1,X3,X4]
