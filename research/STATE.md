# Research STATE — Service Agency Models & Opportunities

Last updated: 2026-10-29

## RUN STATUS  (read first — the hourly auto-resume task acts on this block)
RUN_STATUS: RUNNING            # RUNNING | WAITING_FOR_CEO | DONE
CURRENT_STEP: Phase 1 — Opus companion attacking/finalising models (brief: research/briefs/phase1-companion.md)
CURRENT_AGENT: phase1-companion (opus, xhigh) — launched 2026-10-29 ~08:45Z, runs in background (agent id kept in session scratchpad agents.txt)
RESUME_INSTRUCTIONS: FIRST check the agent is really stopped: call ListAgents; if the companion (or any agent of this session) is listed as running/busy, do NOTHING. Only if it is not running: if research/models.md top line is not "STATUS: FINAL" or research/method.md is missing/not FINAL, the companion did not finish. First try SendMessage to the companion's agent id (see Agent log) saying "continue from your checkpoint". If it no longer answers, relaunch a new opus companion (effort xhigh) with: "Read research/briefs/phase1-companion.md and follow it. You are RESUMING: read research/models.md and research/method.md as they stand and continue from their STATUS line." If the companion ended with NEEDS_HELP: <path>, launch that helper (model/effort from the brief's first line), then SendMessage the result path to the companion.

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

## Environment limits found 2026-10-29
- Web SEARCH works. Web page FETCH is blocked for all normal sites (Upwork, Wikipedia, YouTube, news) — network policy "limited".
- youtube-transcript.ai blocked too. Fix = CEO changes the environment's Network access to Full (asked 2026-10-29).
- Until fixed: research uses search results only; every claim from a search summary is marked SEARCH-SUMMARY (not opened).

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
- 2026-10-29 Manager Phase 1 research + draft v1 of 13 models — done (research/models.md DRAFT, research/notes/phase1-research.md).
- 2026-10-29 Haiku tool test — done (no nested agents; fetch blocked; search OK).
- 2026-10-29 Haiku fetch test — done (4/4 fetches failed, DNS).
