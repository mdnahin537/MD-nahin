# RealmWright v1.0 — Consolidated Audit Checklist

> THE AUDIT INSTRUMENT. Built from `url-1-spec.md` (original framework), `url-2-spec.md` (FINAL plan, supersedes URL-1), `url-3-spec.md` (post-build review).
> Use against the actual product: `index.html` (~14,852 lines) + `worker/src/*.ts` (8 files) + planning docs.
>
> **Method:** for each row → grep the target → read that region fresh → fill Status + Evidence. NEVER judge from memory. If no line can be cited → ❌.
>
> **STATUS: RESOLVED.** Every row was audited against the full bundle (frontend + Worker). See `AUDIT-RESULTS.md` for the filled instrument with file:line evidence, and `AUDIT-REPORT.md` for the prose findings. This file is retained as the original instrument.
>
> **Status legend:** ✅ done · ⚠️ partial · ❌ missing · 🟡 changed-from-plan · 🔵 needs-live-verification (backend/network) · ⬜ not-yet-checked
> **Severity (for bugs):** BLOCKER · HIGH · MED · LOW
> **Priority (for features, from plan's buyer-impact ranking):** P0 wedge/conversion-gate · P1 core · P2 polish · P3 nice-to-have
>
> **Source of truth on conflicts:** URL-2 FINAL > URL-1. Where the build follows URL-1 on an URL-2-overridden item → mark 🟡 and note it.

---

## LEGEND OF KEY GREP TARGETS (the index to build first)
Run these once to map the file, then reuse:
- Functions/consts: `function \w+|const \w+ =|class \w+|\w+\s*:\s*(async\s*)?function|\w+\s*(\([^)]*\)\s*)?\{`
- DOM ids: `id="[^"]+"` · CSS classes: `class="[^"]+"` · CSS vars: `--[a-z-]+:`
- Network: `fetch(` · `WORKER_URL` · `/api/` · `openrouter` · `workers.dev`
- Security sinks: `innerHTML` (expect ~163) · `escHtml` · `DOMPurify` · `Secrets.loadKey` · `copilotKey`
- Licensing: `LS_PRODUCT_ID` · `product_id` · `store_id` · `instance_id` · `activated` · `fingerprint` · `device`
- Demo/cost: `turnstileToken` vs `turnstile_token` · `DemoCounter` · `FREE_TIER` · cap/quota
- Models: `claude-sonnet-4-5` (should be GONE) · `-latest` · `claude-sonnet-latest`
- Deletions: `theme-manuscript` · `theme-modern` · `__rwSetTheme` · `ModePicker` · `data-nav="grimoire"` · `Artifact` · Electron/electron
- Schema: `schemaVersion` · `SCHEMA_VERSION` · `migrate` · `plotSeeds` · `soloMode` · `oracleLog`

---

## CLUSTER A — Architecture & Deployment
| ID | Requirement (source) | Verify via | Status | Evidence | Note |
|----|----|----|----|----|----|
| A1 | Ships as a **web app**, NOT Electron. No binaries, no electron-updater. (U2 override) | grep `electron`, look for main.js/preload | ⬜ | | U1 said Electron; U2 killed it |
| A2 | Hosted on **Cloudflare Pages** at `realmwright.pages.dev` (or app domain). Single HTML served. (U2 §2) | check deploy config, `_headers` | ⬜ | | |
| A3 | **Worker is MINIMAL** (~150 lines, license + demo proxy ONLY). No business logic moved server-side. (U2 §2.3, override) | count worker/src lines; list handlers | ⬜ | | U3: found 8 files, heavy — likely 🟡 |
| A4 | Worker has exactly: `/api/license/activate`,`/validate`,`/deactivate`,`/verify`,`/api/demo/generate` | grep routes in worker/src | ⬜ | | |
| A5 | **`/verify` and `/api/demo/generate` are REAL, not 501 stubs** (U3 SHIP-BLOCKER #1) | read itch.ts, demo.ts | ⬜ | | U3: BOTH are 501 stubs → BLOCKER |
| A6 | One merged Worker deployable to one hostname; `wrangler deploy` doesn't break live routes | read wrangler.toml `name`, WORKER_URL | ⬜ | | U3: deploying overwrites legacy → breaks |
| A7 | **CSP headers** in Pages `_headers` (connect-src limited to openrouter/workers/localhost/turnstile) (U2 Gap10) | open `_headers` file | ⬜ | | |
| A8 | CORS not misconfigured (no `Allow-Origin: null` + `Allow-Credentials: true`) (U3 #6) | read cors.ts | ⬜ | | U3: present, mostly defanged |
| A9 | User data lives in **IndexedDB only**, never transmitted (U2 §2.2) | grep IDB usage; confirm no realm-data in fetch bodies | ⬜ | | |
| A10 | Wrangler commands use current syntax `kv namespace create` (space, not colon) (U3 round2) | grep docs/README `kv:namespace` | ⬜ | | deprecated colon syntax |
| A11 | **Backup/restore JSON format** w/ version field + migration on import (U2 §2.6, Gap25) | grep `realmwright-export`, import fn | ⬜ | | |

## CLUSTER B — Licensing & Monetization
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| B1 | **`product_id` (and `store_id`) CHECKED on activation** — reject mismatches (U3 SHIP-BLOCKER #2) | grep `product_id`, `LS_PRODUCT_ID` usage | ⬜ | | U3: declared but NEVER compared → BLOCKER (no paywall) |
| B2 | Primary store = **Itch.io** with external-keys; LS not the v1.0 path (U2 §7, override) | grep `itch`, key format `RW-XXXX` | ⬜ | | U3: built LS *and* itch → 🟡 tangle |
| B3 | Price = **$19** (U2 override). $29 = stale URL-1 value | grep `19`/`29`, price strings | ⬜ | | U3: appears $29 → 🟡 |
| B4 | License key format `RW-XXXX-XXXX-XXXX-XXXX` (omit I/O/0/1) | grep key-gen | ⬜ | | |
| B5 | Ed25519-signed activation token, **offline verify** via embedded public key | grep `Ed25519`, `crypto.subtle.verify` | ⬜ | | |
| B6 | **3-device cap enforced reliably** server-side (atomic) (U2 §6.7; U3 #3) | read fingerprint.ts issueOrRefresh | ⬜ | | U3: KV race, bypassable; doc claims "cannot be bypassed" = false |
| B7 | **Orphan reaper** treats non-`valid:true` (esp. 429) as skip, not reap (U3 #4) | read reapOrphans | ⬜ | | U3: reaps healthy devices on LS 429 → HIGH |
| B8 | Respects LS License API **60 req/min** limit in cron (U3 round2) | read cron/reaper loop | ⬜ | | |
| B9 | **30-day offline grace period** (token expires_at, weekly heartbeat refresh) (U2 §6.7B, Gap13) | grep `expires_at`, heartbeat | ⬜ | | |
| B10 | License activation UI flow (paste key → activate → store token → unlock) (U2 §6.7) | grep activate handler in index.html | ⬜ | | |
| B11 | Device token works WITHOUT cross-site cookie (header path, since rw_device is 3rd-party+SameSite=Strict = dead) (U3 round2) | grep `X-Device-Token`, `rw_device`, SameSite | ⬜ | | |
| B12 | License check returns **useful config** (not just boolean) for piracy friction (U2 §2.5) | read license response shape | ⬜ | | |

## CLUSTER C — Free Demo & Cost Protection (Hunter's wallet)
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| C1 | **Sample Mode** — 3 pre-baked JSON scenarios, zero AI calls (Heist/Wandering Investigator/Saltmoot Council) (U2 §6.2) | grep `SAMPLE_REALM`, scenario consts | ⬜ | | |
| C2 | Sample Mode auto-clears user data on exit; watermark on Sample PDF | grep sample-exit, watermark | ⬜ | | |
| C3 | Free real-AI demo: **3/IP/24h** cap, server-enforced | read demo.ts quota | ⬜ | | U3: stub → 🔵 |
| C4 | **Global daily cap** (~30/day) → fallback to Sample Mode when hit | grep global counter | ⬜ | | |
| C5 | **Turnstile** verified server-side before OpenRouter call | grep turnstile in worker | ⬜ | | |
| C6 | **Field-name match:** frontend `turnstileToken` vs Worker contract (U3: mismatch camelCase vs snake_case) | grep both spellings | ⬜ | | U3: MISMATCH ~line 5018 → demo fails or runs ungated |
| C7 | OpenRouter prepaid hard cap is the backstop; counters increment BEFORE the call | read demo handler order | ⬜ | | |
| C8 | DemoCounter client-side hint is genuinely backed by server rejection (not a stub) | cross-check C3 | ⬜ | | U3: server is stub → client hint is the ONLY gate |

## CLUSTER D — The 6 Critical Bugs (Phase 1, U2 §4.1)
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| D1 | Model slug `claude-sonnet-4-5` GONE everywhere → `claude-sonnet-latest`; dropdown has 3 `-latest` options + recommended badge | grep `claude-sonnet-4-5`, `-latest` | ⬜ | | |
| D2 | Cost preview updated: Sonnet[3,15] Opus[5,25] Haiku[1,5]/Mtok | grep cost constants (~6095) | ⬜ | | |
| D3 | `beforeunload` handler flushes pending writes | grep `beforeunload` | ⬜ | | |
| D4 | API key stripped from snapshots (`copilotKey` nulled in clone) | grep snapshot serializer | ⬜ | | |
| D5 | Backup/export includes all realm data, excludes credentials | read export fn | ⬜ | | |
| D6 | JSON schema validation + 1 retry on parse failure for AI responses | grep parse/retry (~8912) | ⬜ | | U3: parser at 8912-8928 is solid ✅ likely |
| D7 | Faction referential integrity: UUID refs OR rename-cascade | grep `factionId`, rename handler | ⬜ | | |

## CLUSTER E — Front Door & Onboarding
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| E1 | Front door replaces ModePicker; first-run shows it (U2 §6.1) | grep `FrontDoor`, first-run check | ⬜ | | |
| E2 | Textarea "Tonight's session is about..." + "I'm running [Group/Solo/Just exploring]" + Generate | grep front-door markup | ⬜ | | |
| E3 | "Try a sample first" + "Activate license" entry points | grep those buttons | ⬜ | | |
| E4 | **Recent generations panel** (last 5 in IndexedDB, click-to-reopen) (U2 §6.1A, Gap8) | grep `recent_generations` | ⬜ | | |
| E5 | After-generation CTAs: Save as Realm / Export PDF / Run Another (U1 W2-T04) | grep CTA ids | ⬜ | | |
| E6 | "Save as Realm" inscribes Strong Start+hooks+secrets as Session 1 | read save-as-realm handler | ⬜ | | |
| E7 | **Mobile gate** (`innerWidth<768` → "open on desktop" + read-only sample) (U2 §6.6) | grep innerWidth/768 | ⬜ | | |

## CLUSTER F — Solo Mode (THE WEDGE — P0)
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| F1 | Solo Mode exists; auto-detects single-character realm + manual toggle (U2 §6.3) | grep `soloMode`, Solo toggle | ⬜ | | TOP audit priority |
| F2 | **Context-Aware Oracle** — yes/no + probability (5 levels), weighted d100, AI adds campaign context, auto-logs to chronicle tagged "Oracle" | grep oracle fn + prompt | ⬜ | | |
| F3 | Oracle prompt forbids inventing new entities (only references existing) | read oracle system prompt | ⬜ | | |
| F4 | **Scene Pivot Generator** — 3 pivots: 1 faction unseen 5+ sessions, 1 active NPC not seen, 1 unresolved hook (creativity-forcer) | grep scene-pivot fn + prompt | ⬜ | | |
| F5 | **Mood Shift** — tone dropdown (hopeful/dread/mystery/action/contemplative) injected into next gen | grep mood/tone selector | ⬜ | | |

## CLUSTER G — Context-Aware Encounter Builder (P1)
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| G1 | Encounter Builder under GM Tools; inputs party size/difficulty/region/lean-faction (U2 §6.4) | grep encounter builder | ⬜ | | |
| G2 | Output USES campaign factions/regions/NPCs (not generic) + a Twist | read encounter prompt | ⬜ | | the differentiator test |
| G3 | Random Encounter Tables (d20/region, faction-influenced) | grep encounter table fn | ⬜ | | |
| G4 | **NO generic stat-block generator, NO theatre-of-mind map** (explicitly cut) | grep stat-block gen | ⬜ | | if present → 🟡 over-build |

## CLUSTER H — NPC Plot Seeds + Unresolved Hooks (folded-in Drama, P1)
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| H1 | Plot Seeds field on each NPC + AI generates 3 (≥1 uncomfortable) (U2 §6.5) | grep `plotSeeds` | ⬜ | | |
| H2 | Unresolved Hooks panel (filter `resolved:false`, Suggest payoff, Mark resolved) | grep hooks panel, `resolved` | ⬜ | | |
| H3 | **Play Mode NOT built** (explicitly CUT) (U2 §4.3) | grep `PlayMode`/Play Mode | ⬜ | | if present → 🟡 built-a-cut-feature |
| H4 | **Drama Engine NOT a standalone feature** (folded into H1/H2) | grep `DramaEngine` | ⬜ | | |

## CLUSTER I — Copilot Tool-Calling Agent (Gap 1, "biggest miss" — P0/P1)
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| I1 | Copilot is a **tool-calling agent**, not just a chatbot — sends `tools` array (U2 Gap1) | grep `tools:`, tool defs | ⬜ | | |
| I2 | READ tools: read_chronicle/read_factions/read_npcs/read_realm_state | grep tool names | ⬜ | | |
| I3 | WRITE tools: add_chronicle_entry/update_faction_stance/add_npc/update_nation_stat/add_plot_seed/mark_hook_resolved | grep tool names | ⬜ | | |
| I4 | Scope settings: `copilotScope` standard vs full; `copilotAutoApply` false/true | grep `copilotScope`, `copilotAutoApply` | ⬜ | | |
| I5 | Solo Oracle/Scene Pivot/plot seeds USE tool calls (auto-log) | cross-ref F2/F4/H1 | ⬜ | | |

## CLUSTER J — Preserved v16 Systems (must still work)
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| J1 | GM tools preserved + upgraded (Quick NPC, Strong Start, Session Prep, What's at Stake) w/ context + 3-variant (U2 §4.5) | grep GM tool ids | ⬜ | | |
| J2 | Tonight Mode pipeline intact | grep `Tonight` | ⬜ | | |
| J3 | Snapshots system intact (key leak fixed = D4) | grep snapshot | ⬜ | | |
| J4 | Seed nations audited/trimmed to 3-5 archetypes | grep `SEED_NATIONS` | ⬜ | | |
| J5 | Stability/Compute engine intact (stability, breakdown, pressures, milCap) | grep `Compute.` | ⬜ | | |
| J6 | Chronicle/timeline + Factions intact | grep chronicle/faction render | ⬜ | | |
| J7 | PDF export (high-quality typeset) intact + surfaced | grep `generatePDF`, PrintPreview | ⬜ | | |
| J8 | Global search (Ctrl+K, 8 entity types) intact | grep `GlobalSearch` | ⬜ | | |
| J9 | 71 prompts preserved | grep `PROMPTS` count | ⬜ | | |

## CLUSTER K — Polish Features (P2)
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| K1 | **Markdown rendering** in chat (lib, XSS-safe, links new-tab) (U1 W3-T01, Gap20) | grep marked/markdown | ⬜ | | |
| K2 | **3-variant generation** (Strong Start, Quick NPC, Encounter, Plot Seeds, Scene Pivots) (Gap5) | grep `variants` | ⬜ | | |
| K3 | **Parallel Tonight Mode** (`Promise.all`, ~40s→~12s; retry failed sub-call) (Gap6) | grep `Promise.all` in Tonight | ⬜ | | |
| K4 | **Show-context toggle** on every AI message (Gap7) | grep show-context | ⬜ | | |
| K5 | **Retry** once on 429/5xx + retry indicator toast (U1 W3) | grep retry/backoff | ⬜ | | |
| K6 | **Conversation context cap** 20 turns + auto-summarize oldest 10 via Haiku (Gap9) | grep slice(-20), summarize | ⬜ | | |
| K7 | **Empty states** w/ copy+button on every panel (Gap19, U1 W2-T05) | grep empty-state | ⬜ | | |
| K8 | **Loading taglines** rotating during gen (Gap21, U1 W2-T08) | grep loading messages | ⬜ | | |
| K9 | **Model selection per task** (dropdown = -latest + Ollama) (Gap22) | grep model selector | ⬜ | | |
| K10 | **Multi-realm picker** in header (Gap23) | grep realm switcher | ⬜ | | |
| K11 | **PDF preview inline** in results (Gap24, U1 W2-T03) | grep preview tab/iframe | ⬜ | | |
| K12 | **"What just happened" transparency log** after every gen (U2 §6.9) | grep that panel | ⬜ | | |
| K13 | **In-app cost meter** (tokens + ~$ per gen) (Gap12, U2 §6.9A) | grep cost display | ⬜ | | |
| K14 | **Foundry VTT export** (valid JSON) (U2 §6.10) | grep foundry export | ⬜ | | |
| K15 | GM tools surfaced in Ember (WorldShell left panel, not hidden) (U1 W2-T07) | grep wms-gm-tools | ⬜ | | |
| K16 | Ember form-input visibility pass (U1 W2-T06, Spec 7.4) | grep theme-ember .form-input | ⬜ | | |

## CLUSTER L — Trust / Privacy / Security
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| L1 | Key flow: licensed users call OpenRouter DIRECT (Worker not in path) → "we never see your key" literally true (U2 §2.4) | trace fetch in licensed gen | ⬜ | | |
| L2 | Don't ask for key on first load; ask only on explicit "Connect my AI" | read key-modal trigger | ⬜ | | |
| L3 | **Masked key display** (`sk-or-v1-••••a7f3` + eye toggle) (Gap11, U2 §6.7A) | grep mask logic | ⬜ | | |
| L4 | **One-click delete key** (no multi-confirm friction) | grep delete-key | ⬜ | | |
| L5 | **Real DOMPurify v3.4.5** pasted (NOT the fallback stub) (U3 #5) | grep DOMPurify version/stub | ⬜ | | U3: currently fallback stub → HIGH (BYO-key XSS line of defense) |
| L6 | **163 innerHTML sinks** audited — all escaped (esp. attribute contexts) (U3 #9) | grep `innerHTML` + sample each | ⬜ | | XSS hides in the "most but not all" |
| L7 | `escHtml` escapes quotes (the U1 v16 bug) | read escHtml | ⬜ | | |
| L8 | Key not needlessly exposed: still in memory/IDB (inherent) — DOMPurify is the mitigation, document honestly | cross-ref L5 | ⬜ | | U3: hardening not fix |
| L9 | Sunset Promise published (storefront) | grep sunset/promise | ⬜ | | |
| L10 | Cost transparency on storefront ($19+$5=$24) | check storefront/FAQ | 🔵 | | external page |

## CLUSTER M — Deletions (these must be GONE)
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| M1 | Manuscript + Modern themes stripped (~400 lines gone) | grep `theme-manuscript`,`theme-modern` | ⬜ | | |
| M2 | `__rwSetTheme`/`__rwClearDevTheme` gone | grep those | ⬜ | | |
| M3 | 4 vaporware nav items gone (grimoire/atlas/legions/chronicle) + "coming in v1.1" toast gone | grep `data-nav=`, "v1.1" | ⬜ | | |
| M4 | ModePicker deleted | grep `ModePicker` | ⬜ | | |
| M5 | Artifact branch removed from CANON parser + CANON_SUFFIX | grep `Artifact` | ⬜ | | |
| M6 | No Electron scaffolding | grep electron | ⬜ | | |

## CLUSTER N — Schema / Refactor Foundations
| ID | Requirement | Verify | Status | Evidence | Note |
|----|----|----|----|----|----|
| N1 | Schema migration runner (migrate_v16_to_v17: plotSeeds, hooks{resolved}, soloMode, oracleLog) (Gap2) | grep `migrate`, `schemaVersion` | ⬜ | | |
| N2 | Migration is forward-only, never loses data, errors safely | read migration fn | ⬜ | | |
| N3 | Unified `buildPrompt(template_id, variables)` w/ `{CAMPAIGN_CONTEXT}` (Gap18, U1 W1-T08) | grep `buildPrompt`, `CAMPAIGN_CONTEXT` | ⬜ | | |
| N4 | All 71 prompts include `{CAMPAIGN_CONTEXT}` (Gap3) | grep placeholder across PROMPTS | ⬜ | | |
| N5 | Variable-fill modal for [SITUATION]/[STATE_A]/[STATE_B] (U1 W1-T08, W3-T08) | grep fill modal | ⬜ | | |
| N6 | Ollama runtime detection via /v1/models or /api/tags (U1 W1-T09, Gap14) | grep ollama detect | ⬜ | | |

## CLUSTER O — Confirmed Bugs from URL-3 (re-verify against actual file)
| ID | Bug | Verify | Status | Evidence | Severity |
|----|----|----|----|----|----|
| O1 | Worker /verify + /demo are 501 stubs → deploy breaks itch.io+demo | A5/A6 | ⬜ | | BLOCKER |
| O2 | No product_id check → any LS key unlocks (no paywall) | B1 | ⬜ | | BLOCKER |
| O3 | 3-device cap KV race (bypassable) | B6 | ⬜ | | MED (doc claim false) |
| O4 | Orphan reaper reaps healthy devices on LS 429 | B7/B8 | ⬜ | | HIGH |
| O5 | Turnstile field-name mismatch | C6 | ⬜ | | HIGH (wallet) |
| O6 | DOMPurify is fallback stub | L5 | ⬜ | | HIGH |
| O7 | CORS Allow-Origin null + credentials true | A8 | ⬜ | | MED |
| O8 | Fake faction "Loyalty" bar (hardcoded 85/55/38/18% per enum, no numeric value) — CSS ~774-777 | grep loyalty width CSS | ⬜ | | MED (UI lies) |
| O9 | Year-advance leap math backwards (365/365.25); hardcodes Earth calendar — ~line 10313 | read advance fn | ⬜ | | LOW-MED |
| O10 | Era tints 1&2 same hue, opacity-only diff → indistinguishable — ~155-158 | grep `--era-tint` | ⬜ | | MED (a11y) |
| O11 | Event categories not colorblind-safe (2 greens, 2 golds); no shape redundancy | grep event color map | ⬜ | | MED (a11y) |
| O12 | Herald mode-ring hardcodes hex + color-only state — ~11708 | read that line | ⬜ | | LOW |
| O13 | `STATUS_GLYPH[sc]` unguarded → "undefined" for unknown status — ~11514 | read that line | ⬜ | | LOW |
| O14 | Doc line numbers stale (claim 14,479 vs actual 14,852); verification script hardcodes sandbox paths | read docs + run-verification.sh | ⬜ | | LOW (trust) |
| O15 | "9 PASS" tested only frontend file:// — backend untested | read SHIP_READINESS.md | ⬜ | | context |

## CLUSTER P — FAILURE-MODE HUNT (new sweep — beyond URL-3)
Apply each lens systematically; log new findings here.
| ID | Lens | Where to apply | Status | Findings |
|----|----|----|----|----|
| P1 | Every `fetch` → timeout/error/retry handling present? (Gap4 error contract: 401/402/429/5xx/timeout/malformed/empty) | all fetch sites | ⬜ | |
| P2 | Every `innerHTML` (163) → escaped? attribute-context safe? | all sinks | ⬜ | |
| P3 | Every KV write → race/atomicity/1-per-sec-key limit? | worker KV ops | ⬜ | |
| P4 | Every AI-cost path → capped server-side (not client)? | demo + any proxy | ⬜ | |
| P5 | Every user/AI-input boundary → validated (enum coercion, size caps)? | import, AI parse, forms | ⬜ | |
| P6 | Every `await`/promise → unhandled rejection? | async fns | ⬜ | |
| P7 | Every "DONE WHEN" criterion in U1/U2 → actually met? | spec cross-check | ⬜ | |
| P8 | Money paths (product_id, demo quota, device cap) → server-enforced not client? | B1/C3/B6 | ⬜ | |
| P9 | Data-loss paths (beforeunload, migration, reaper, snapshot, import-overwrite) | D3/N1/B7/D4/A11 | ⬜ | |
| P10 | Race conditions in client (Tonight parallel, stream abort, debounce vs unload) | K3, stream, persist | ⬜ | |
| P11 | i18n/locale/number-format assumptions (leap year is one; others?) | date/number code | ⬜ | |
| P12 | CANON parser tolerance (formatting drift, prose lines, size cap) — U1 found weak | read parser | ⬜ | |
| P13 | Secrets in committed/shipped files (.env, keys, LS webhook secret) | grep secrets | ⬜ | |
| P14 | Dead code / contradictory config left by the URL-1↔URL-2 conflict | LS+itch both, $19/$29 both | ⬜ | |

## CLUSTER Q — IMPROVEMENT OPPORTUNITIES (separate bucket, rank by buyer-impact)
Use plan's ranking lens: (1) time-to-wow (2) system-match (3) output quality (4) first-impression coherence (5) reliability (6) perceived AI intelligence (7) discoverability (8) visual polish (9) community/shareable (10) mobile. Log opportunities here — keep STRICTLY separate from "missing from plan."
| ID | Opportunity | Buyer-impact rank | Effort | Note |
|----|----|----|----|----|
| Q1 | (to fill during audit) | | | |

---

## AUDIT EXECUTION ORDER (when product lands)
1. Build the structural index (LEGEND grep targets) → confirm line counts, file list, section map.
2. **Behavioral first-pass** with Playwright: load index.html locally, screenshot, click through front door / Solo Mode / dashboard, capture console errors, confirm what even renders.
3. Clusters in priority order: **A,B,C,D** (architecture + money + bugs = ship-critical) → **F,I** (wedge + Copilot agent = P0 features) → **E,G,H,J** (core) → **K,L,M,N** (polish/deletions/foundations).
4. **O** — re-verify each URL-3 finding against the real file (line numbers will differ).
5. **P** — failure-mode sweep.
6. **Q** — improvement pass last.
7. Produce report: (A) feature matrix, (B) bugs by severity w/ file:line+repro, (C) plan-deviations, (D) ranked improvements.

## KNOWN LIMITS
- Backend live behavior (deployed Worker, OpenRouter, Itch.io, LS) = 🔵 needs Hunter's machine + secrets + network this sandbox blocks. Worker gets deep STATIC analysis + local `wrangler` run if possible.
- External storefront/privacy/FAQ pages may not be in the code bundle → 🔵.
