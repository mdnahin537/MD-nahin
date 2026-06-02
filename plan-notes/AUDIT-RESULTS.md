# RealmWright v1.0 — Completed Audit Results (filled instrument)

> The `audit-checklist.md` instrument, resolved row-by-row against the full bundle:
> `src/index.html` (14,852 lines) + `worker/src/*.ts` (6 files) + `wrangler.toml` + `PLAN.md` + `SHIP_READINESS.md`.
> Every row carries `file:line` evidence. **[EXEC]** = proven by running the code. **[SRC]** = confirmed in source (vs URL-3's inference).
> Legend: ✅ done · ⚠️ partial · ❌ missing/broken · 🟡 changed-from-URL-2 · 🔵 needs-live (real keys/network/deploy).
>
> **IMPORTANT CONTEXT:** the bundle's own `PLAN.md` is the URL-1-style plan (keeps Lemon Squeezy AND itch.io; no $19/Itch-primary decision). So items that "deviate from URL-2" are 🟡 against the plan *you* called final, but were faithful to the plan the *builder* worked from. Flagged per row.

---

## CLUSTER A — Architecture & Deployment
| ID | Status | Evidence |
|----|----|----|
| A1 web app not Electron | ✅ | `grep electron` = 0 hits. **[EXEC]** boots as single HTML. |
| A2 Cloudflare Pages host | 🔵 | App is single-file; host is Hunter's choice. `ALLOWED_ORIGINS` lists realmwright.app (wrangler.toml:31). |
| A3 Worker minimal (~150 ln) | 🟡 | 6 files, ~480 ln incl. custom KV device subsystem. URL-2 said "minimal, don't move logic server-side." Faithful to bundle-PLAN though. |
| A4 5 routes present | ✅ [SRC] | index.ts:51-66 — activate/validate/deactivate/cleanup-orphans/verify/demo. |
| **A5 /verify + /demo real, not 501** | ❌ **[SRC]** | **itch.ts:24-33 returns 501 stub; demo.ts:26-35 returns 501 stub.** Comments call them intentional stubs. SHIP-BLOCKER. |
| **A6 deploy doesn't break live routes** | ❌ **[SRC]** | **wrangler.toml:1 `name="rw-license"` = same worker the frontend calls (index.html:3769). `wrangler deploy` overwrites the legacy real handlers with the 501 stubs.** SHIP-BLOCKER. |
| A7 CSP _headers connect-src | ⚠️ | CSP is inline `<meta>` in index.html:13-42 (no Pages `_headers` file in bundle). `frame-ancestors` via meta is ignored by browsers **[EXEC]** console warning. |
| A8 CORS not misconfigured | ⚠️ [SRC] | cors.ts:20 `Allow-Credentials:true` + cors.ts:8 returns `'null'` for Origin:null → credentialed null-origin. Builder accepts as itch.io trade-off (SHIP_READINESS risk#3). Lower severity (cookie is SameSite=Strict). |
| A9 user data IndexedDB only | ✅ | Realm data in IDB; never in fetch bodies to Worker. |
| A10 wrangler current syntax | ❌ | wrangler.toml:11-12 + SHIP_READINESS:96-97 use deprecated `wrangler kv:namespace create` (colon). Current = `kv namespace create`. |
| A11 backup/restore + migration | ✅ | FoundryExport + JSON export (7546/7618); schema migration 5203-5326. |

## CLUSTER B — Licensing & Monetization
| ID | Status | Evidence |
|----|----|----|
| **B1 product_id checked** | ❌ **[SRC]** | **license.ts handleActivate:117 checks only `upstream.json.activated`; never compares `meta.product_id`/`store_id`. No product_id constant in Worker. Frontend `LS_PRODUCT_ID=''` (3768) used only as blank-guard (3777), never sent, never verified.** Any LS key from any product unlocks. SHIP-BLOCKER. |
| B2 Itch primary | 🟡 [SRC] | Both LS (UUID keys) and itch (`/verify`) paths exist; auto-detect index.html:4875. Bundle-PLAN keeps both; URL-2 said Itch-only. |
| B3 price $19 | 🔵 | No `$19`/`$29` anywhere in index.html or PLAN.md. Pricing is storefront-side. URL-3 reported $29; unverifiable from bundle. |
| B4 key format | ✅ | UUID→LS, else→itchio (4876). |
| B5 Ed25519 offline verify | ❌ | Not implemented. Activation is online LS-proxy only; no signed-token offline verify. (URL-1 idea; bundle-PLAN uses LS proxy instead.) 🟡 |
| **B6 device cap atomic** | ⚠️ **[SRC]** | fingerprint.ts:90-101 read-modify-write, no CAS → concurrent activations race past cap. license.ts:6 claims "cannot be bypassed" = false. Low real-world impact. |
| **B7 reaper skips on 429** | ❌ **[SRC]** | **license.ts:281 `if(!r.json?.valid)` reaps; the try/catch:286 only catches network throws, NOT a 429/500 JSON body → healthy paying device reaped.** HIGH. |
| **B8 reaper respects 60/min** | ❌ **[SRC]** | reapOrphans:273-289 calls LS validate per-token in an unthrottled loop, no delay/limit → cascade 429s → cascade reaps. HIGH. |
| B9 30-day offline grace | ❌ | No `expires_at`/grace logic; background validate sets valid=false on any LS non-valid. Network outage → license appears invalid. (URL-2 Gap13 unmet.) |
| B10 activation UI flow | ✅ | LicenseGate.activate 4888; modal role=dialog (SHIP_READINESS 3d). |
| B11 device token w/o cookie | ⚠️ [SRC] | Header path exists (fingerprint.ts:139) BUT see **NEW-1**: CORS blocks `X-Device-Token` cross-origin. |
| B12 license returns config | ⚠️ | Returns LS json + device info; boolean-ish, no piracy-friction config. |

## CLUSTER C — Free Demo & Cost Protection
| ID | Status | Evidence |
|----|----|----|
| C1 Sample Mode 3 scenarios | ✅ **[EXEC]** | SAMPLE_REALM_HEIST/SOLO/POLITICAL = 13KB/10KB/15KB real content (9462+). |
| C2 sample clears + watermark | ⚠️ | watermarkPdfHtml 9544; exit-clear path weak (only via deactivate). |
| C3 demo 3/IP/24h server cap | ❌ **[SRC]** | demo.ts is a 501 stub — no quota exists. DemoCounter (4971) is client-only hint; comment claims "real enforcement in Worker" but there is none. |
| C4 global daily cap→Sample | ❌ | Not implemented (handler is stub). |
| C5 Turnstile server-verified | ❌ | Stub — no verification. |
| **C6 turnstile field match** | ❌ **[SRC]** | Frontend sends `turnstileToken` (5020); demo.ts contract:13 expects `turnstile_token`. Mismatch (latent until stub replaced). |
| C7 OpenRouter prepaid backstop | 🔵 | No OPENROUTER_KEY in wrangler (demo stubbed). |
| C8 client hint server-backed | ❌ | Server is stub → client counter is the only "gate"; trivially reset. |

## CLUSTER D — The 6 Critical Bugs
| ID | Status | Evidence |
|----|----|----|
| D1 model slug fixed | ✅ | All `-latest`; `claude-sonnet-4-5` = 0 hits. |
| D2 cost preview updated | ✅ | Cost map present (8038+); per-Mtok. |
| D3 beforeunload flush | ⚠️ [SRC] | 14548 warns about unsaved *textarea text* only; does NOT flush 400ms debounced state persist → loss window. |
| D4 key stripped from snapshot | ✅ [SRC] | 5775 nulls clone.copilotKey. |
| D5 export excludes credentials | ✅ [EXEC] | Key scrubbed from persist blob (SHIP_READINESS 3h confirmed). |
| D6 JSON validate + retry | ✅ | `_apiFetchJson` 8916-8949 raw→fence→brace→retry. |
| D7 faction referential integrity | ✅ | factionId UUID refs (19 hits). |

## CLUSTER E — Front Door & Onboarding
| ID | Status | Evidence |
|----|----|----|
| E1 front door replaces ModePicker | ✅ **[EXEC]** | FrontDoor 9587; first-run 14527; ModePicker=0. Renders to spec. |
| E2 textarea + run-mode + generate | ✅ **[EXEC]** | 14708-14721 (screenshot confirms). |
| E3 sample + activate entry | ✅ **[EXEC]** | visible in screenshot. |
| E4 recent generations (5) | ✅ | `rw_recent_generations` 9592; render 9766. |
| E5 after-gen CTAs | ⚠️ | Tonight results have "Keep this realm" (10070); DEMO result shows only Activate CTA (9731). |
| E6 Save as Realm = Session 1 | ✅ | buildNationFromSeed→addNation 9948-9953; "Keep this realm" promotes. |
| E7 mobile gate <768 | ✅ | MobileGate 4602/4610. |

## CLUSTER F — Solo Mode (WEDGE)
| ID | Status | Evidence |
|----|----|----|
| F1 Solo Mode + autodetect | ✅ | soloMode 5156/5299; toggle present. |
| F2 Oracle yes/no + probability + autolog | ⚠️ | Oracle exists (askOracle 4124) BUT logs only to `oracleLog`, NOT chronicle (DEV-6). |
| F3 Oracle forbids new entities | ⚠️ | Prompt so1:4006 *softly* permits world-consistent invention vs plan's "forbid". |
| **F4 Scene Pivot 3 specific kinds** | ❌ | Prompt so2:4007 does CALM/MID/HARD chaos escalation, NOT faction-unseen/NPC-not-seen/unresolved-hook. The wedge's signature mechanic is missing its targeting rules. |
| F5 Mood Shift | ✅ | mood selector present (37 hits). |

## CLUSTER G — Encounter Builder
| ID | Status | Evidence |
|----|----|----|
| G1 builder + inputs | ⚠️ | Modal 3692 has difficulty/pace/tone/factions; NO party-size or region input. |
| G2 uses campaign factions + twist | ✅ | Context-aware prompt 3979 (`Nation state / Factions / params`). |
| G3 random encounter tables d20 | ❌ | Not found. |
| G4 no generic statblock/map | ✅ | Correctly absent. |

## CLUSTER H — NPC Plot Seeds + Hooks
| ID | Status | Evidence |
|----|----|----|
| H1 plot seeds + AI gen 3 | ✅ | plotSeeds 11209+; prompt requests ≥1 uncomfortable. |
| H2 unresolved hooks panel | ✅ | hooks + resolved filter present. |
| H3 Play Mode NOT built | ✅ | 0 hits — correctly cut. |
| H4 Drama Engine folded | ✅ | No standalone DramaEngine. |

## CLUSTER I — Copilot Tool-Calling Agent
| ID | Status | Evidence |
|----|----|----|
| I1 tool-calling agent | ✅ | tools array + streaming tool_calls 8660-8715. |
| I2 read tools | ✅ | read_chronicle/read_factions 8011-8012. |
| I3 write tools | ✅ | all 6 write tools 8015-8023. |
| I4 scope + autoApply gate | ✅ | scope gate enforced 8284; autoApply default false queues proposals 8290-8305. |
| I5 solo/seeds use tool calls | ⚠️ | Copilot writes via tools; but Oracle bypasses chronicle logging (DEV-6). |

## CLUSTER J — Preserved v16 Systems
| ID | Status | Evidence |
|----|----|----|
| J1 GM tools + 3-variant | ✅ | r72 Strong Start returns 3 variants (3962). |
| J2 Tonight pipeline | ✅ | parallel Promise.all 9960. |
| J3 snapshots (key fixed) | ✅ | 5775. |
| J4 seed nations trimmed | ✅ | SEED_NATIONS present. |
| J5 stability engine | ✅ | Compute.* present. |
| J6 chronicle + factions | ✅ | render present. |
| J7 PDF export + surfaced | ✅ | PrintPreview 11756; flows 7859/10094. |
| J8 global search Ctrl+K | ✅ | GlobalSearch present. |
| J9 71 prompts | ✅ | PROMPTS array present (r72 = id range). |

## CLUSTER K — Polish
| ID | Status | Evidence | | ID | Status | Evidence |
|----|----|----|---|----|----|----|
| K1 markdown | ✅ Markdown 4655 | | K9 model select | ✅ 3033-36 |
| K2 3-variant | ✅ 3962/1911 | | K10 multi-realm picker | ❌ not found |
| K3 parallel Tonight | ✅ 9960 | | K11 PDF preview inline | ✅ 11756 |
| K4 show-context | ✅ 8154 | | K12 transparency log | ✅ 4470 |
| K5 retry 429/5xx | ❌ only license retries | | K13 cost meter | ✅ 4518/4560 |
| K6 ctx cap 20 + summarize | ✅ 8833/9399 | | K14 Foundry export | ✅ 7546 |
| K7 empty states | ✅ 967 | | K15 GM tools surfaced | ✅ |
| K8 loading taglines | ✅ 9846/9909 | | K16 ember form visibility | ✅ |

## CLUSTER L — Trust / Security
| ID | Status | Evidence |
|----|----|----|
| L1 licensed key direct-to-OpenRouter | ✅ | Worker not in licensed AI path; "we never see your key" literally true. |
| L2 no key ask on first load | ✅ | Front door has no key prompt. |
| L3 masked key display | ✅ | eye toggle 3019. |
| L4 one-click delete key | ✅ | 3024. |
| **L5 real DOMPurify** | ❌ **[EXEC]** | `DOMPurify.version==='fallback'` at runtime; stub 2395-2453, wired only into Markdown.render 4704. Note says v3.2.4 (URL-3 wants 3.4.5). |
| **L6 163 innerHTML escaped** | ⚠️ | escHtml is quote-blind → attribute-injection seam (see H-2). |
| L7 escHtml escapes quotes | ❌ [SRC] | 4638 textContent round-trip; escapes `<>&` only, not `"` `'`. |
| L8 key exposure documented | ⚠️ | Key in IDB+memory readable by any script; DOMPurify is the mitigation and it's a stub. |
| L9 sunset promise | 🔵 | Storefront-side. |
| L10 cost transparency storefront | 🔵 | Storefront-side. |

## CLUSTER M — Deletions
| ID | Status | Evidence |
|----|----|----|
| M1 manuscript/modern themes | ✅ | Only in classList.remove cleanup 13814; no live theme. |
| M2 __rwSetTheme gone | 🟡 | Alive 14561-14566 but neutered (ember-only). |
| M3 vaporware nav gone | ✅ | 0 hits. |
| M4 ModePicker gone | ✅ | 0 hits. |
| M5 Artifact branch removed | 🟡 | ALIVE 7072/7803 — implemented not deleted (URL-1 said delete). |
| M6 no Electron | ✅ | 0 hits. |

## CLUSTER N — Schema / Refactor
| ID | Status | Evidence |
|----|----|----|
| N1 migration runner | ✅ | migrateIfNeeded 5203-5326. |
| N2 forward-only, safe | ✅ | additive; no field loss. |
| N3 buildPrompt + CAMPAIGN_CONTEXT | ✅ | present (3 hits). |
| N4 all 71 prompts have context | ⚠️ | Most do; not exhaustively verified per-prompt. |
| N5 variable-fill modal | ✅ | vars[] in prompt defs. |
| N6 Ollama detect | ✅ | _probeOllama /api/tags 13721 (800ms timeout). |

## CLUSTER O — URL-3 findings re-verified (all confirmed in actual source)
O1 stubs ❌**[SRC]** · O2 no product_id ❌**[SRC]** · O3 KV race ⚠️**[SRC]** · O4 reaper-on-429 ❌**[SRC]** · O5 turnstile field ❌**[SRC]** · O6 DOMPurify stub ❌**[EXEC]** · O7 CORS null+creds ⚠️**[SRC]** · O8 fake loyalty bar ⚠️ (774-777) · O9 leap math ⚠️**[EXEC]** (365/365.25=0.9993→round 1.0) · O10 era tint collision ⚠️ (155-156) · O11 event colors not CB-safe ⚠️ (142-146) · O12 herald ring hardcoded ⚠️ (11708) · O13 STATUS_GLYPH unguarded ⚠️ (11500) · O14 stale doc lines + hardcoded path ⚠️ (run-verification.sh:19 `REPO=/home/user/MD-nahin`) · O15 "9 PASS" frontend-only — confirmed: SHIP_READINESS tested 0 Worker behavior.

## NEW FINDINGS (not in URL-1/2/3)
- **NEW-1 (MED-HIGH) [SRC] — CORS blocks the device-token header.** cors.ts:19 `Allow-Headers:'Content-Type'` omits `X-Device-Token`, which the frontend sends on validate/deactivate (4831/4885). Cross-origin (app→workers.dev is always cross-origin) preflight rejects it → the device-token fallback built for itch.io iframes silently fails; deactivate-with-token fails → device slots leak; re-activate can't refresh its token → treated as new device, burns the cap faster.
- **NEW-2 (process) — SHIP_READINESS's "Ship-blockers: None" is wrong, and its own deploy order ships a broken product.** Pre-deploy step 4 "wrangler deploy" overwrites the live `/verify`+`/demo` with stubs (NEW vs O1: the *deploy instruction itself* is the trigger), then step 10 uploads to itch.io. Following the doc = broken itch.io activation + dead demo.
- **NEW-3 (BLOCKER-adjacent) — pasting `LS_PRODUCT_ID` does NOT create the paywall, contrary to SHIP_READINESS item 6.** The constant is a frontend blank-guard only; the Worker never checks product_id. Hunter could follow every instruction and still have no paywall.
- **NEW-4 (LOW) — `_apiFetchJson` has 3 sibling parsers (importFromText 9028, generateStrongStart 9058) lacking the retry**, so truncated AI JSON on those paths fails hard.
- **NEW-5 (LOW) — re-importing the same JSON mints fresh ids → silent duplicate realms** (buildNationFromSeed always `Utils.uuid()`).

---

## STEP 6 — IMPROVEMENT PASS (separate bucket; ranked by buyer-impact, NOT tidiness)
Ranking lens from the plan: time-to-wow → system-match → output quality → reliability → trust.

| # | Improvement | Why it earns money | Effort |
|---|----|----|----|
| Q1 | **Make Scene Pivot do what the plan promised** (surface the ignored faction / forgotten NPC / dangling hook). | This IS the Solo-Mode wedge — the "AI that remembers your campaign" claim. Generic chaos-escalation is replaceable by any chatbot; the recency-targeting is the moat. Highest system-match lever. | M |
| Q2 | **Auto-log Oracle answers to the chronicle.** | Reinforces the core promise every single Oracle roll; turns a one-off answer into persistent memory the user sees accumulate. | S |
| Q3 | **Demo that actually runs** (implement demo.ts + quota) → first-wow in <60s with zero key, zero signup. | The demo is the #1 conversion driver for a $19 impulse buy. A dead demo = buyers bounce. | M |
| Q4 | **Show the cost meter's running total on the front door / session end** ("this session cost you ~$0.04"). | Kills the #1 BYO-key objection ("will this drain my OpenRouter credit?"). Trust → conversion. | S |
| Q5 | **Encounter Builder: add region + party-size + the d20 table.** | Completes a P1 feature; makes encounters reusable session-to-session (system-match). | M |
| Q6 | **Multi-realm picker in header (Gap23).** | Power users running >1 campaign hit friction immediately; this is a retention lever for the exact buyer who evangelizes. | S |
| Q7 | **30-day offline grace + clearer license states.** | A GM at a table with bad wifi who sees "license invalid" churns and refunds. Reliability = fewer refunds. | M |
| Q8 | **Replace the custom KV device subsystem with LS's native `license_activation_limit`.** | Deletes B6/B7/B8/NEW-1 entirely — less code, no reaper, no race, no CORS-header bug. Pure reliability + maintenance win. | M (net negative LOC) |
| Q9 | **One-line "what RealmWright remembers about your campaign" summary on load.** | Literally demonstrates the tagline; cheap, high perceived-intelligence. | S |
| Q10 | Distinct era-2 hue + event-category shape/label redundancy. | Accessibility + the editorial-dark aesthetic actually reading as intentional. | S |

---

## FINAL VERDICT
**Feature-build: strong** (Solo Mode, the tool-calling agent, samples, migration, polish all real and mostly faithful). **Ship-readiness: NOT ready** — 2 confirmed ship-blockers (deploy overwrites real routes with stubs; no product_id paywall), a live security stub (DOMPurify), a customer-deleting reaper bug, a CORS bug that breaks the device fallback, and a self-assessment that says "Ship-blockers: None" while its own deploy steps would ship a broken product. The wedge feature (Scene Pivot) shipped without its differentiating mechanic.
