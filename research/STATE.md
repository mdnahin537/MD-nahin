# Research STATE — Service Agency Models & Opportunities

Last updated: 2026-10-29

## RUN STATUS  (read first — the hourly auto-resume task acts on this block)
RUN_STATUS: RUNNING            # RUNNING | WAITING_FOR_CEO | DONE
CURRENT_STEP: Payments check (Sonnet) running; then Phase 2 per-model companions in this order: M4, M2, M6, M8, M7, M5, M3, M1
CURRENT_AGENT: payments-check (sonnet, xhigh) — brief research/briefs/payments-check.md — output research/notes/payments.md
RESUME_INSTRUCTIONS: FIRST check with ListAgents that no agent of this session is running; if one is, do NOTHING. If research/notes/payments.md is missing/incomplete, relaunch the payments-check agent from its brief. Then start Phase 2 with the next model in the order whose file research/opportunities/M#-*.md is missing or not marked STATUS: FINAL (brief: research/briefs/phase2-common.md + the model's section). One companion at a time.

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
- Payments: Payoneer works. PayPal: CEO heard Bangladesh allowed PayPal via bank link in 2026 — UNVERIFIED, Sonnet check queued.
- Warm contacts abroad: none.
- Shothik kit files: not available; use brief summary.
- Usage plan: Claude Pro. Expect several 5-hour windows; hourly auto-resume task restarts unfinished work after limits reset.

## Environment facts (checked 2026-10-29, from code.claude.com docs + tests)
- Network: CEO set Network access = Full. Page fetch WORKS from Bash/curl (tested 200 on docs + Wikipedia).
- YouTube: youtube-transcript.ai needs a free API key (10 requests/day). Python youtube-transcript-api is blocked by YouTube from cloud IPs. Asked CEO to add key as env var YT_TRANSCRIPT_KEY (applies to a NEW session). Until then: no transcripts; use search.
- Nested agents: Claude Code default allows 3 layers (docs: sub-agents "Let subagents spawn their own subagents"), BUT this cloud environment sets CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1 (nesting off). Fix = add "CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH": "3" to .claude/settings.json env (settings env overrides the process env in cloud sessions; reapplied when the file changes). Manager's edit was BLOCKED by the auto-mode safety classifier → waiting for CEO's explicit OK or his own edit. Until then: relay pattern (manager launches helpers).
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
- 2026-10-29 Phase 1 Opus companion — DONE. 8 final models (research/models.md FINAL) + Path Test v2 & Reply Playbook (research/method.md FINAL). Manager review: accepted; note 'VERIFIED' there often = two search summaries; Phase 2 must open primary pages. ~267k tokens, 58 tool calls, 23 min.
- 2026-10-29 Manager Phase 1 research + draft v1 of 13 models — done (research/models.md DRAFT, research/notes/phase1-research.md).
- 2026-10-29 Haiku tool test — done (no nested agents; fetch blocked; search OK).
- 2026-10-29 Haiku fetch test — done (4/4 fetches failed, DNS).
