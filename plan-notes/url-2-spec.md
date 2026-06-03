# URL-2 SPEC — RealmWright v1.0 FINAL Build Plan (supersedes URL-1)

> Source: Claude.ai conversation (docx, ~55K tokens, 2247 lines). Dated May 14–18. Built ON TOP of URL-1's framework + the v16 HTML artifact.
> Nature: Hunter asked Claude to **audit the URL-1 framework** (`REALMWRIGHT_v1_FRAMEWORK.md`). Through several rounds + Hunter's hard budget pushback + two external AI audits (ChatGPT + a market doc), the plan PIVOTED significantly and ended in a **"COMPLETE BUILD PLAN"** (Sections 1–11) that **explicitly supersedes URL-1 where they conflict**, followed by a **25-gap analysis** adding missing specs.
> CRITICAL FRAMING (Hunter's words): "this conversation is based on file-1's given artifact. It was reviewed — some things got changed because they had flaws/reasons, others stay same as file 1." → So this file = the SOURCE OF TRUTH. URL-1 remains valid ONLY for tasks not overridden here.

> Audit legend: ✅ done / ⚠️ partial / ❌ missing / 🟡 changed-from-plan.

---

## 0. WHAT CHANGED vs URL-1 (the override table — read this first)

| URL-1 said | URL-2 FINAL decision |
|---|---|
| **Electron desktop app**, 3-platform builds (.exe/.dmg/.AppImage) | **CUT ENTIRELY.** Ship as a **hosted web app on Cloudflare Pages** (`realmwright.pages.dev`). No binaries. |
| Code signing (Windows OV / Apple Developer) | **CUT.** Not needed for a web app. |
| Worker proxies ALL free-tier AI (W1-T10/T11) | Worker shrinks to **~150 lines: license activation + free-demo proxy ONLY.** Deferred to Phase 4. |
| Lemon Squeezy = primary store | **Itch.io = primary** (Itch.io Payouts mode → Payoneer, W-8BEN tax interview). Lemon Squeezy = silent backup, NOT used in v1.0. |
| **$29** one-time (was $19, Hunter chose $29) | **$19 flat launch**, raise to **$29** publicly after ~50 sales. No promo countdown, no tiers. |
| Free demo = 3 AI generations via Worker proxy | **Three-state demo:** (1) **Sample Mode** pre-baked, zero-cost; (2) **3 free real-AI gens** per IP/day, global cap ~30/day; (3) full unlock = BYO key direct to OpenRouter. |
| 2 pricing tiers (free + paid) | Same 2 tiers, but paid is web-app license not desktop. |
| Auto-update (electron-updater) | **CUT.** Web app updates via Pages redeploy. |
| "defer to v1.1" list | **NO v1.1 ever** (Hunter's rule — only bug fixes for 12 months, no new features). Each deferred item → built in v1.0, CUT forever, or shipped as a **free post-launch update** (World Depth Kit only). |
| License via Lemon Squeezy webhook | License via **Itch.io external keys** — pre-generate ~500 keys, upload to Cloudflare KV + Itch.io. No webhooks. |

**SAME as URL-1 (carried forward unchanged):**
- The 6 critical bug fixes (model slug, beforeunload, API key in snapshots, broken backup, structured-output enforcement, faction referential integrity).
- Strip Manuscript/Modern themes; strip 4 vaporware nav items (Grimoire/Atlas/Legions/Chronicle).
- Front door replaces ModePicker. "Save as Realm" CTA flow.
- Ember-only theme. Empty states. PDF preview inline. GM tools in WorldShell. Loading taglines. System/model selector.
- Markdown rendering, 3-variant generation, parallel Tonight, show-context toggle, retry, conversation cap.
- `-latest` OpenRouter aliases (verified real: sonnet→4.6, opus→4.7). Ollama detection.
- The two differentiators concept — but REPOSITIONED (see §3).

---

## 1. PRODUCT IDENTITY (FINAL)
- **RealmWright** — AI-powered session prep + worldbuilding tool for TTRPG GMs **and solo players**.
- **THE single differentiator: "The AI that remembers your campaign."** Copilot has access to the user's factions, chronicle, NPCs, world state — unlike ChatGPT/generic tools that forget.
- **Primary target: Solo TTRPG players** (most acute memory pain, fastest-growing, easiest reach via r/Solo_Roleplaying, self-select for API-key comfort).
- Secondary: DMs wanting context-aware encounter prep; Worldbuilders escaping World Anvil's $132/yr; political-intrigue GMs (existing nation/faction strength).
- **NOT:** a virtual tabletop (Foundry/Roll20 own at-table), a generic encounter generator, or an AI-DM replacement. **RealmWright ends when the session starts.**
- Pricing: **$19 flat** launch on Itch.io → $29 after ~50 sales.

## 2. ARCHITECTURE (FINAL — overrides URL-1 §6)
- **Hosting:** Cloudflare Pages (free, no card) → `realmwright.pages.dev`. Serves the single HTML file. Bandwidth unlimited.
- **Server logic:** ONE Cloudflare Worker (~150 lines, free tier, no card). TWO jobs only:
  - **License ops (~50 lines):** `POST /api/license/activate` (key→KV check→Ed25519-signed token bound to device fingerprint), `POST /api/license/verify` (weekly heartbeat).
  - **Free-demo proxy (~80 lines):** `POST /api/demo/generate` (Turnstile verify → per-IP + global daily quota → forward to OpenRouter with Hunter's key).
  - Worker is **NEVER in the path** for licensed users' AI calls or campaign data.
- **User data:** Browser **IndexedDB** only. Lives on device. Never transmitted.
- **AI calls (licensed):** Browser → OpenRouter directly, with USER's key. Worker not involved.
- **AI calls (free demo):** Browser → Worker (Hunter's key) → OpenRouter. Capped.
- **Steady-state Worker load:** ~100-500 req/day vs 100k/day free ceiling. Scales to 50k+ users free.

### 2.4 TRUST CONTRACT (three literal, verifiable claims)
1. "Your OpenRouter API key goes from your browser directly to OpenRouter. Never touches our servers." (True for licensed users — verifiable in Network tab.)
2. "Your campaigns live on your computer. They never leave your device." (No transmission code path.)
3. "We see only your license key once (activate) + a weekly heartbeat. That's the complete list."

### 2.5 PIRACY RESISTANCE
- HTML NOT on GitHub (reversed from an earlier open-source idea — ChatGPT audit correctly killed it). NOT a downloadable file. Served from Pages only.
- **License check returns useful runtime config (not just a boolean)** — stripping it breaks features, not just the gate.
- HTML minified for production (not heavily obfuscated — trust messaging stays honest).
- Accept 95-98% piracy resistance as sufficient at $19.

### 2.1A CSP headers (Gap 10) — Cloudflare Pages `_headers`:
`connect-src 'self' https://*.openrouter.ai https://*.workers.dev http://localhost:11434 http://127.0.0.1:11434 https://challenges.cloudflare.com; script-src 'self' https://challenges.cloudflare.com; ...` + X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy.

### 2.6 Backup file format (Gap 25): `{"format":"realmwright-export","version":"1.0","exported_at":...,"realms":[...],"meta":{"schemaVersion":17,"appVersion":"1.0.x"}}`. Import verifies format, runs migrations, merges (ID-conflict → ask rename/skip), never silently overwrites.

## 3. POSITIONING (FINAL)
- **Hero tagline: "RealmWright — The AI that remembers your campaign."**
- Sub-pitches (3 storefront tabs/sections):
  - **Solo Players:** "An oracle that knows your stakes. NPCs that remember meeting you. Scenes that build on what you've established."
  - **Dungeon Masters:** "Encounters that use your factions. Loot that connects to your chronicle. The opposite of generic."
  - **Worldbuilders:** "$19 one-time. No subscription. Your worlds stay on your hard drive forever."
- Differentiator REPOSITIONED: PDF demoted from hero to "what's in the box." Real pillars = **(a) "the world that remembers"** + **(b) data sovereignty / offline / one-time / no-cloud.**
- Market targeting: lead with Solo GMs; skip Dungeon-Crawler-only segment and anti-AI subreddits (r/DnD, r/rpg). Reach via r/Solo_Roleplaying (2-wk lurk first), r/worldbuilding, Bluesky #TTRPG, one GM-YouTuber cold email.

---

## 4. V1.0 SCOPE

### 4.1 SIX CRITICAL BUGS (Phase 1 — same as URL-1 W1)
1. **Broken model slug** `anthropic/claude-sonnet-4-5` (404) → `anthropic/claude-sonnet-latest`. Locations: lines 2621, 3265, 6095, 6100, 6116, 6376, 6580. Update DEFAULT_SETTINGS. Add haiku-latest + opus-latest to dropdown.
2. **API key in snapshots** → strip `meta.settings.copilotKey` from snapshot/export serializer.
3. **No data-loss protection** → `beforeunload` handler for pending unsaved work.
4. **Broken backup routine** → ensure JSON export includes all realm data, excludes credentials.
5. **Missing structured-output enforcement** → JSON schema validation + 1 retry on parse failure.
6. **Faction referential integrity** → UUID-based references OR rename-cascade.

### 4.2 NEW FEATURES IN v1.0
- **6.1 Front door** (replaces ModePicker @ line 7026; first-run check @ line 10937). Textarea "Tonight's session is about..." + "I'm running... [Group play][Solo play][Just exploring]" + Generate + "Try a sample first" + "Activate license". **6.1A Recent generations panel** (last 5 packs in IndexedDB, click-to-reopen, cleared on Sample Mode exit).
- **6.2 Sample Mode** — 3 pre-baked JSON scenarios embedded as JS constants, zero AI calls: **"The Heist"** (DM), **"The Wandering Investigator"** (Solo), **"The Saltmoot Council"** (political). Watermark on Sample PDF. Auto-clears on exit. Authored w/ ~$2 OpenRouter credit.
- **6.3 Solo Mode (THE WEDGE)** — auto-detect single-character realm or toggle. Three tools:
  - **Context-Aware Oracle:** yes/no + probability (Very Likely→Very Unlikely), weighted d100, AI adds 2-3 sentences of campaign context, auto-logs to chronicle tagged "Oracle". (Prompt must NOT invent new entities.)
  - **Scene Pivot Generator (creativity-forcer):** 3 pivots — one faction unseen 5+ sessions, one active NPC not seen recently, one unresolved hook. Roll d3 or pick.
  - **Mood Shift:** tone dropdown (hopeful/dread/mystery/action/contemplative) added to next gen's system prompt.
- **6.4 Context-Aware Encounter Builder** — under GM Tools. Inputs: party size 1-6, difficulty (Easy/Hard/Deadly/Story), region, optional "lean toward [faction]". Output uses campaign factions/regions/NPCs + a Twist. **+ Random Encounter Tables** (d20 per region, faction-influenced). **CUT:** generic stat-block generator + theatre-of-mind map descriptions.
- **6.5 NPC plot seeds + Unresolved Hooks panel** (replaces cut "Drama Engine"). Plot Seeds field per NPC (AI generates 3, ≥1 uncomfortable). Unresolved Hooks panel (filter `resolved:false`, "Suggest payoff", "Mark resolved").
- **6.6 Mobile gate** — `window.innerWidth < 768` → "built for desktop" screen + [Continue anyway] + [Try a sample (read-only)].
- **6.7 License activation flow** — device fingerprint (hash of browser+screen+timezone), `POST /api/license/activate`, store token in localStorage, offline Ed25519 verify, weekly heartbeat. **6.7A** masked key display (`sk-or-v1-••••a7f3` + eye toggle) + one-click delete. **6.7B** 30-day offline grace period (token `expires_at`=30d; heartbeat refreshes; if expired+offline → non-blocking banner). **6.7C** Ollama auto-detect via `http://localhost:11434/api/tags`, silent-fail, settings toggle.
- **6.8 Free demo backend** — Turnstile + per-IP cap (3/24h) + global daily cap (~30/day=$2.10 worst case) + OpenRouter prepaid hard cap. Increment counters BEFORE the AI call. Fallback to Sample Mode when capped.
- **6.9 "What just happened" transparency log** — after every gen, plain-language: request target, balance charged, "we didn't keep your prompt", "data didn't leave browser". Variants for Sample/Demo/Licensed. **6.9A in-app cost meter:** `~$0.04 from your OpenRouter balance / 1,800 in / 2,100 out`.
- **6.10 Foundry VTT export** — Foundry-compatible JSON for realms + sessions. ~2-3 days.

### 4.3 CUT FROM v1.0 (do not build)
Electron wrapper; native binaries; code signing; auto-update; **Play Mode** (at-table companion — RealmWright is prep-only); standalone Drama Engine (folds into 6.5); visual relationship graph; conversation threading; voice input; Roll20 export; community-submitted templates; generic stat-block generator; theatre-of-mind map descriptions; cross-nation search (Ctrl+K exists); Manuscript + Modern themes (strip dead code).

### 4.4 DEFERRED to FREE post-launch update (~2-4 wks after first sale)
**World Depth Kit** — ~10 prompts under existing UI: Cultural Quirks, Religion Builder, Language Family, Geography Detail, Trade & Economy, Historical Echo. Each outputs a "Plot Hook from this". Honors "no v1.1" (free expansion, not new paid version).

### 4.5 PRESERVE from v16 (must stay)
- **GM Mode tools** (Quick NPC, Strong Start, Session Prep, What's at Stake) — keep + upgrade w/ 3-variant + context-awareness. These form the Tonight Mode pipeline.
- **Snapshots system** (just fix the API-key leak).
- **Seed nations** (SEED_NATIONS @ 3573) — audit/trim to 3-5 evocative archetypes. NOT the same as Sample Mode realms.

---

## 5. THE 25 GAPS (added in the final gap-analysis pass — all are REQUIRED unless noted)
1. **Copilot tool-calling architecture (biggest miss).** Copilot is a tool-calling AGENT, not just a chatbot. Tools: `read_chronicle/read_factions/read_npcs/read_realm_state` + `add_chronicle_entry/update_faction_stance/add_npc/update_nation_stat/add_plot_seed/mark_hook_resolved`. Scope settings: `copilotScope: 'standard'` (read all, write chronicle+plot seeds only) vs `'full'` (write everything); `copilotAutoApply: false/true`. Solo Oracle/Scene Pivot/Encounter/plot seeds should USE tool calls.
2. **Schema migration system.** `migrate_v16_to_v17`: NPC `plotSeeds:[]`, chronicle `hooks:[{text,resolved:false}]`, `meta.soloMode`, `meta.oracleLog:[]`. Forward-only, never lose data.
3. **Prompt context injection.** Audit all 71 prompts → add `{CAMPAIGN_CONTEXT}` (realm summary + recent 5 chronicle + factions + relevant NPCs) via the unified prompt-fill.
4. **Error handling for AI failures.** Explicit user-friendly messages for timeout/429/401/402/5xx/malformed-JSON/empty + Turnstile/cap failures. Keep user input intact on retry.
5. **3-variant generation** (Strong Start, Quick NPC, Encounter, Plot Seeds, Scene Pivots) — single API call returns `{variants:[3]}`, ≥1 uncomfortable.
6. **Parallel Tonight Mode** — 4 calls in `Promise.all` (~40s→~12s). Retry only the failed sub-call.
7. **Show-context toggle** — collapsible panel shows exact text sent to AI.
8. **Recent generations panel** (see 6.1A).
9. **Conversation context management** — 20-turn window; summarize oldest 10 into a "memory" via cheap Haiku call; summary stored in realm data.
10. **CSP headers** (see 2.1A).
11. **Masked key + one-click delete** (6.7A).
12. **Real-time cost meter** (6.9A).
13. **License offline grace period** (6.7B).
14. **Ollama detection** (6.7C).
15. **Preserve GM Mode tools** + context-aware upgrades (4.5).
16. **Preserve snapshots** (fix key leak).
17. **Audit/trim seed nations** (4.5).
18. **Unified prompt-fill mechanism** `buildPrompt(template_id, variables)` — centralizes context injection, var substitution, length caps, format directives. ~1 day, saves days.
19. **Empty states** for Chronicle/Factions/NPCs/Sessions/Encounters (icon + copy + primary action).
20. **Markdown rendering** — one lightweight lib (Marked.js), strip dangerous HTML, links new-tab.
21. **Loading taglines** ("Consulting your chronicle...", "Cross-referencing factions...").
22. **Model selection per task** — Tonight/Encounter→Sonnet; summarization→Haiku; Oracle→user choice; dropdown = -latest aliases + detected Ollama.
23. **Multi-realm picker** — header dropdown, list IndexedDB realms w/ last-modified + Δ unsaved indicator, "+ New Realm".
24. **PDF preview inline** — "Preview" tab, iframe, watermark if Sample Mode, Download button.
25. **Backup/restore format** (see 2.6).

---

## 6. BUILD SEQUENCE (FINAL, ~7 wks active / 11-13 calendar wks)
- **Phase 1 — Foundation (~2.5 wks):** 6 critical bugs + strip themes/vaporware + **unified prompt-fill refactor (Gap 18)** + **schema migration (Gap 2)** + test BYO-key end-to-end.
- **Phase 2 — Front door + Sample Mode (2 wks):** front door, delete ModePicker, 3 Sample scenarios, mobile gate, "what just happened" log, + all URL-1 W2 tasks (PDF preview, CTAs, empty states, Ember form fixes, GM tools in WorldShell, loading screen, system selector).
- **Phase 3 — Solo Mode + Encounters + NPC + Foundry (~2.5 wks):** 6.3, 6.4, 6.5, 6.10 + URL-1 W3 (markdown, 3-variants, parallel Tonight, show-context, retry, context cap).
- **Phase 4 — Licensing infra (1 wk):** deploy Pages + Worker (~150 lines) + Turnstile + generate 500 keys→KV+Itch.io + license activation flow + free demo backend + OpenRouter prepaid + Sample watermark.
- **Phase 5 — Launch prep (1 wk):** Itch.io seller (tax interview, Payoneer) + product page + privacy/terms + 90s demo video + support email/canned responses + Reddit post drafted.
- **Post-launch:** World Depth Kit free update.

## 7. DISTRIBUTION
- **Itch.io primary**, Payouts mode → Payoneer, W-8BEN, 10% revenue share, **external keys** (pre-gen 500 `RW-XXXX-XXXX-XXXX-XXXX`, omit I/O/0/1, upload to KV + Itch.io, regenerate when <50 left). Net per $19 sale ~$16.25. 7-day hold + Payoneer.
- Storefront on Itch.io page: hero+video, what-it-does, what-you-get, **cost transparency** ($19 + ~$5 OpenRouter = $24 to start; ~70 sessions per $5), privacy claims, **Sunset Promise**, sys reqs, FAQ.

## 8. KEY TRUST/MARKETING COPY (exact text specified in source §8.1–8.5)
- Key entry modal: "🔒 Stored only in this browser / 🚫 Never sent to RealmWright servers / 🔓 Delete anytime" + "Test it yourself: delete your key, then generate — the app asks again because we don't have it." + Ollama footnote (16GB+ RAM, CLI comfort).
- **Sunset Promise:** "If we ever shut down... I commit to publishing the complete server code + self-hosting guide so anyone who paid can keep using their copy. Your $19 is for the tool, not our goodwill. — Hunter."
- First Reddit post (r/Solo_Roleplaying): "I built a worldbuilding tool that solves the ChatGPT memory problem."

## 9. LAUNCH CHECKLIST (run before live)
6 bugs fixed; -latest aliases everywhere; no key/no campaign-data leaves browser (Network-tab verified); mobile gate <768px; front door <2s on 4G; 3 Sample scenarios work keyless; Solo Mode auto-activates; Encounter references factions; NPC plot seeds tied to chronicle; license activation + 3-device limit; free demo + Turnstile + caps; OpenRouter prepaid hard cap; "what happened" log; PDF watermark(Sample)/clean(licensed); Foundry JSON valid; Itch.io approved + tax + Payoneer; 500 keys in KV+Itch.io; product page + privacy/terms + sunset promise; support email + canned; demo video; Cloudflare Web Analytics; **schema migration on v16 backup; empty states; markdown; 3-variant; parallel Tonight <15s; show-context; auto-summarize at 20 turns; CSP verified; masked key+delete; cost meter; 30-day offline grace; Ollama detect; recent-gens panel; all 71 prompts have {CAMPAIGN_CONTEXT}; backup re-import no loss; Copilot tool calls write to chronicle/plot seeds; AI error messages friendly; seed nations trimmed; multi-realm picker.**

## 10. ESCALATION / PRINCIPLES FOR BUILDER AI
- Wedge is **Solo Mode** — don't compromise.
- **Worker stays minimal** — don't move logic to it.
- **Copilot context-awareness is THE differentiator** — every feature reinforces "the AI knows the campaign."
- Halal: content-neutral tool, no interest/debt/manipulation.
- Hunter available for PRODUCT decisions, NOT technical ones (don't ask "library X or Y" — decide).

## 11. STILL-OPEN (only Hunter can decide — were unanswered at end of URL-2)
1. Exact 3 Sample Mode scenarios (Heist / Wandering Investigator / Saltmoot Council — approve or swap).
2. Starter realm templates: pre-built worlds vs just prompts.
3. **Copilot scope default: 'standard' vs 'full'.** Affects demo impressiveness vs first-timer caution.

---
## 12. AUDIT NOTES — what to scrutinize in the product (given URL-2 is the real plan)
- Did the builder ship a **web app** (Pages) or accidentally keep Electron scaffolding? (URL-1 said Electron; URL-2 killed it.)
- Is the **Worker minimal** (license + demo only) or bloated?
- Is **Solo Mode** present with all 3 tools (Oracle/Scene Pivot/Mood Shift)? This is the wedge — top audit priority.
- Is the **Copilot a tool-calling agent** (Gap 1) with read/write tools + scope settings?
- **Sample Mode** with 3 pre-baked scenarios? Mobile gate? "What just happened" log?
- **Context-aware Encounter Builder** (uses real factions, NOT generic)?
- **NPC plot seeds + Unresolved Hooks** (the folded-in Drama)?
- **Foundry export?** Schema migration? Unified `buildPrompt`? All 71 prompts context-injected?
- Pricing/storefront: $19, Itch.io, external-keys, sunset promise, cost transparency?
- Was **Play Mode** wrongly built (it was explicitly CUT)?
- Trust copy + masked key + one-click delete + CSP headers + cost meter?
- Did they preserve GM tools / snapshots / seed nations?
- URL-3 is "about the product" — likely the audit/build of what the implementing AI produced against THIS plan.
