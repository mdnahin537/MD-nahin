# Research STATE — Service Agency Models & Opportunities

Last updated: 2026-10-30 (07:55Z: M5 done; M3 companion launched)

## RUN STATUS  (read first — the hourly auto-resume task acts on this block)
RUN_STATUS: RUNNING            # RUNNING | WAITING_FOR_CEO | DONE
CURRENT_STEP: Phase 2 — M3 Revenue Partner companion (7th of 8; order M4✔, M2✔, M6✔, M8✔, M7✔, M5✔, M3, M1)
CURRENT_AGENT: phase2-M3 (opus, xhigh, can launch own helpers) — brief research/briefs/phase2-common.md — outputs research/opportunities/M3-*.md
RESUME_INSTRUCTIONS: FIRST check with ListAgents that no agent of this session is running; if one is, do NOTHING. If the companion ended with "NEEDS_HELP: <path>", launch that helper (model/effort from the file's first line) and SendMessage the result path back to the same companion. If it stopped mid-work, SendMessage it "continue from your checkpoint"; if it no longer answers, relaunch a new opus xhigh companion for the same model telling it to resume from the existing M#-*.md files (STATUS lines). When a model's M#-summary.md is FINAL, the manager reviews it, logs it, commits, then launches the next model in the order.

## How the team runs (CEO decisions 2026-10-29)
- Manager (main session, Opus) plans, judges, relays, writes the final answer.
- Companion = Opus, effort xhigh. Leads the real work. Phase 2: ONE companion per business model, run one at a time.
- Agent = Sonnet. Helper to the companion. The companion picks its effort level.
- Sub-agent = Haiku. Narrow exact jobs. The companion picks its effort level.
- TESTED 2026-10-29: launched agents CANNOT launch agents (no Agent tool inside them).
  So the manager is the switchboard: companion writes a helper brief to research/handoffs/, pauses and reports NEEDS_HELP;
  manager launches the helper; manager sends the result path back to the same companion (SendMessage keeps its memory).
- One at a time: one companion + at most one helper running. A paused companion may keep working while its helper runs if it asks.
- Path test (9 steps, 0/1/2) is a thinking tool, not a calculator. Companions must apply judgment overrides
  ("false 0" = looks impossible but has a clever route; "false 2" = looks easy but hides a plane), with written reasons.
- Reply engineering is mandatory: every opportunity needs the best channel, contact point, timing trigger and approach to get Read + Reply + Trust, with evidence.
- Final report: top 5 + a list of new ideas.

## CEO constraints (2026-10-29)
- Cash budget: AI subscriptions only — Claude Pro $20; ChatGPT Plus $20 if needed; Gemini Pro via family plan (~700 BDT). Test kit must cost ~$0 extra cash.
- Hours: 8–35 h/week, varies. Design for the low end (8 h each).
- Coding OK if AI writes it. Rank down offers where a bug costs the client money and the team can't debug it.
- Payments: Payoneer works. PayPal NOT usable (VERIFIED 2026-10-29; manager re-opened Payoneer help a_id 12280: Bangladesh listed as unable to receive PayPal-funded payments). Payoneer minimum $20–50 per request, so a $1–10 test is impossible; first real test ≥ $20 from a genuine buyer. Annual fee $29.95 if under $6,000/yr. Details research/notes/payments.md.
- Warm contacts abroad: none.
- CEO answers 2026-10-29 (all = defaults): no regular factory/office visits (desk work first); languages good Bangla + English only; real names/faces public = yes; live US/UK-hours calls = rarely (paths must be mostly async).
- Authority: CEO gave the manager full authority for setup/config decisions of this kind (2026-10-29): "don't limit yourself" — but no hallucination, no stupid moves.
- Shothik kit files: not available; use brief summary.
- Usage plan: Claude Pro. Expect several 5-hour windows; hourly auto-resume task restarts unfinished work after limits reset.

## Environment facts (checked 2026-10-29, from code.claude.com docs + tests)
- Network: CEO set Network access = Full. Page fetch WORKS from Bash/curl (tested 200 on docs + Wikipedia).
- YouTube: youtube-transcript.ai needs a free API key (10 requests/day). Python youtube-transcript-api is blocked by YouTube from cloud IPs. Asked CEO to add key as env var YT_TRANSCRIPT_KEY (applies to a NEW session). Until then: no transcripts; use search.
- Nested agents: Claude Code default allows 3 layers (docs: sub-agents "Let subagents spawn their own subagents"), BUT this cloud environment sets CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1 (nesting off). Fix = add "CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH": "3" to .claude/settings.json env (settings env overrides the process env in cloud sessions; reapplied when the file changes). CEO approved 2026-10-29; manager set depth 3 + search cap 1000 in .claude/settings.json; live env confirmed updated. Agents launched BEFORE the change (phase2-M4) keep relay mode; agents launched after can spawn their own helpers.
- WebSearch cap: 200 searches per session by default (CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION). Same settings edit should raise it to 1000. Until then: agents prefer curl/WebFetch on known URLs over extra searches.
- Model check: explicit model "opus" on an Agent call overrides the repo's CLAUDE_CODE_SUBAGENT_MODEL=sonnet (docs, v2.1.251+; we run v2.1.312). Companions really run on Opus.
- Built-in auto-continue after usage limit EXISTS: on by default in interactive CLI sessions (v2.1.234+; re-arms max 2 times in a row) and as an "Auto-continue when limits reset" checkbox in the Desktop app (session limit only, not weekly). NOT documented for cloud (web/mobile) sessions → keep our hourly scheduled task as the safety net. Scheduled runs during a limit are rejected until the window resets.

## Auto-resume
- Hourly scheduled task fires into this session, reads RUN STATUS, resumes unfinished work. Manager sets WAITING_FOR_CEO before ending any turn that waits on the CEO, and switches the task off during long waits.

## Done
- [x] Repo checked: no earlier research files.
- [x] PayPal-in-Bangladesh first check (2026-10-28): full PayPal accounts unavailable to BD residents per nsave.com (VENDOR CLAIM); PayPal->Payoneer route reported.
- [x] Nested-agent test (Haiku, 2026-10-29): NO Agent tool inside agents.
- [x] Fetch test (2026-10-29): all page fetches fail (DNS blocked).

## Next
1. Phase 1: manager research + draft models -> research/models.md; Opus companion attacks/extends; report to CEO.
2. Payments desk (Sonnet): verify PayPal-Bangladesh 2026 status, rules, risks — after network fix.
3. Phase 2: one Opus companion per model (with Sonnet/Haiku helpers via relay) -> research/opportunities/
4. Phase 3: ranking (4+ methods) with an Opus companion -> research/ranking.md
5. Phase 4: fresh Opus critic on top 3 + Shothik -> research/critic.md
6. Phase 5: decision report (top 5 + new ideas); after CEO picks, build test kit.

## Agent log
- 2026-10-30 Phase 2 M5 companion (Opus xhigh) — DONE (limit stop ~19:xxZ 10-29; auto-resume task was paused; resumed 07:30Z 10-30). All 3 WEAK by two-key. #1 UAE e-invoice ASP bench (white-label readiness files + post-go-live rejection triage for the 80 MoF-accredited ASPs; SMEs <AED 50m must appoint ASP by 31 Mar 2027, go live 1 Jul 2027) chain 1 (Read-noticed/Trust-competence, soft, E1), two-key 1/3 (2/3 after paid pilot); many ASPs are consultancies = competitors; no posted need found. #2 UK packaging RAM evidence files via smaller compliance schemes (red-unless-evidenced; 1.2×→1.6×→2.0×) chain 1, two-key 1/3; Valpak already sells it. #3 Bangla UAE e-invoice for BD-owned SMEs two-key 0/3. Rejected waves: LDC graduation (deferral pending), EUDR (moved twice), CH accounts (moved to Apr 2028), Martyn's Law (no date), MTD, AU privacy/AML, IEEPA, SMS. Manager spot-check: MoF ASP list VERIFIED at source (82 table rows = 80 ASPs; DocFlow 181172 partners@docflow.ae; page updated 30/10/2026); Phase-2 dates AED 50m / 31 Mar 2027 / 1 Jul 2027 match KPMG + Baker McKenzie (search). AED 5,000/month fine: PRESS (BDO) only; Cabinet Decision 106 of 2025 not opened — re-check before quoting to buyers. ~404k tokens, 46 tool calls, 1 helper (cut off at 14/22 rows).
- 2026-10-29 Phase 2 M7 companion (Opus xhigh) — DONE. Top: AI red-team arena ladder (Gray Swan IPI Black window closes 2026-11-05; prize pools $40k→$171.8k→$300k; OpenTrain jailbreak contract $50–90/h lists BD) chain 1 (Reply), two-key 2/3 (3/3 if Stripe-payout rule lifted); payout rails for prizes unverified; competition odds. #2 Bangla AI eval contractor fails G3 ($6–13/h). #3 automation rescue catalog weak (n8n posts on Freelancer 134→29/mo; bids 30.5→110). #4 template/ClawHub funnel 0 (Read). Payout finding: Gumroad pays BD in BDT to local bank (VERIFIED by manager: Gumroad help 'Getting paid' table lists Bangladesh BDT); Stripe Connect cross-border payouts reach BD (search: Stripe payouts docs BD section 'cross-border payouts only'). CLAUDE.md lines 'Gumroad via Payoneer' and 'Stripe-dependent non-viable' are too broad → CEO asked (hard constraint). ~381k tokens, 3 helpers.
- 2026-10-29 16:00Z CEO insisted on a bank-mediated PayPal route (Aug–Oct 2026). Manager research: 29 Jul 2026 BB circular is REAL (bank-held Digital Value Accounts with PayPal-type CDPSP partners; bank is the handler). But NO bank launch or PayPal agreement found as of today; PayPal country list + Payoneer exclusion unchanged. Pay plan stays Payoneer/Upwork; PayPal = upside; PARTNER CHECK added (ask 3 AD banks). Details in research/notes/payments.md.
- 2026-10-29 Phase 2 M8 companion (Opus xhigh) — DONE (limit stop ~11:40Z, resumed 15:26Z). Top: Mosque Gift Aid desk via examining accountants — chain 1 (Read, soft), two-key 2/3 PASS; first target AM Accountancy (4 mosques, ~£570k donations, none claiming GA); fixed fees only (not %; never from zakat); 28 mosques + 13 middlemen named. HMRC: charity official/nominee signs; we prepare. Others: BD charity end-use desk (weak), takeaway RTW records (weak), Shothik NYC rescore 0/3 WEAK — cannot beat its weak steps as specified. Manager spot-check: RTW extension to gig/subcontractors from 2026-10-01 VERIFIED (DLA Piper, Capsticks). ~418k tokens, 2 helpers.
- 2026-10-29 15:26Z CEO relayed claim that PayPal now works in BD (Payoneer integration late 2025; bdnews24 'Oct 19, 2026'). Manager re-verified at source: bdnews24 article is dated 2017-10-19 (Xoom launch; header shows today's date); Payoneer a_id 12280 still excludes Bangladesh. Verdict unchanged: PayPal NOT usable.
- 2026-10-29 Phase 2 M6 companion (Opus xhigh) — DONE. Ground-desk claim holds only narrowly without visits. Top: Institution liaison (get BD universities/boards to answer foreign verification requests; pay local fee, chase in Bangla) chain 1 (Read), two-key 1/3 → 2/3 after 7-day test, $500–2,000/mo; threat: Background Check Group sells DU degree check $49, Zinc ~3 days. #2 employment reference desk (AI voice agents threaten), #3 counterparty quick check (weak), #4 student funds check (G4 failed: Bangladesh Bank QR mandate 2026-05-12). Facts: Qualification Check July 2026 — BD degree checks >3x, fraud signal 2.6%→9.5%; PDPA 2026 (Act 63). Manager spot-check: DU statement re intermediaries + $50 fee VERIFIED (Observer BD Apr 2026). ~470k tokens, 172 tool calls, 49 min, 2 helpers.
- 2026-10-29 Phase 2 M2 companion (Opus xhigh) — DONE (hit 5-hour limit at ~10:00Z, resumed 10:21Z via SendMessage, no work lost). Top: Release QA desk (answer posted manual-QA roles with real bugs found on buyer's live app; signed release sign-off; scale via in-person-verified Dhaka testers) chain 1 (Reply, crowded), two-key 3/3, 22 named buyers. #2 Dhaka verified bench via platform referral programmes (micro1 up to $3,000/role; Mercor 20% capped) chain 1 (Pay, soft), 27 intermediaries. #3 Bengali eval pod and #4 direct verified hire: weak by design. Licence: Overseas Employment Act 2013 covers only employment outside BD (VERIFIED by companion). Manager spot-check: Checkr 2026 Hiring Hoax 40% vs 31% VERIFIED. ~505k tokens incl. 1 helper.
- 2026-10-29 Phase 2 M4 companion (Opus xhigh) — DONE. Verdict: original product (human QA of AI voice/chat agents for small agencies) FAILS AI-substitution gate (Retell built-in testing 2025-03-14, Vapi Simulations 2026-08-18, Coval free audit; 6 forum QA offers got no buyer replies). Survivor: Bangla/Sylheti native-speaker test panel for UK AI phone receptionists (NHS GP vendors) — chain 1 (Repeat), two-key PASS, pool ~40 buyers, ceiling $300–2,500/mo; needs Sylheti panel recruit. Others: agency QA (weak), Meta AI creative watch (weak). Manager spot-check: Softomate Bengali packs £800–1,500 VERIFIED (page re-opened). ~322k tokens, 78 tool calls, 26 min, 0 helpers.
- 2026-10-29 Haiku nesting test (after settings change) — DONE: new agent HAD the Agent tool; its sub-agent returned "pong" (verified in transcript). Nested helpers work for agents launched after the change. Quirk: Haiku agent refused to use SubagentHandback; verified via transcript instead.
- 2026-10-29 Payments check (Sonnet xhigh) — DONE. PayPal not usable; Payoneer request-a-payment (ACH 1%, card ≤3.99%), Upwork, SWIFT are the routes. nsave USD 'rewards' flagged as possible interest (halal). ~214k tokens, 73 tool calls. Manager spot-check passed.
- 2026-10-29 Phase 1 Opus companion — DONE. 8 final models (research/models.md FINAL) + Path Test v2 & Reply Playbook (research/method.md FINAL). Manager review: accepted; note 'VERIFIED' there often = two search summaries; Phase 2 must open primary pages. ~267k tokens, 58 tool calls, 23 min.
- 2026-10-29 Manager Phase 1 research + draft v1 of 13 models — done (research/models.md DRAFT, research/notes/phase1-research.md).
- 2026-10-29 Haiku tool test — done (no nested agents; fetch blocked; search OK).
- 2026-10-29 Haiku fetch test — done (4/4 fetches failed, DNS).
- 2026-10-30 CEO approved (explicit: replace with date, delete old) → CLAUDE.md payout line replaced: "CURRENT AS OF 2026-10-30 … Usable: Payoneer, Upwork, platforms paying out to BD banks (Gumroad BDT). Not viable: anything needing our own Stripe or PayPal account." Old line deleted. Stripe Connect platforms that pay BD banks are now in scope → re-check M7 red-team ladder two-key at ranking.
- 2026-10-30 07:30Z Hourly auto-resume task found paused since 2026-10-29 16:49Z (not by the manager) → re-enabled; ListAgents confirmed it sees running subagents.
