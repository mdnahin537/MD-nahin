# RealmWright Customer Care — Codex handoff

Prepared 30 September 2026. The email connection is completed; the new comprehensive workflow and experience audit is unfinished.

## Goal

Audit and improve the entire Customer Care journey for bug reports and feature ideas, step by step and line by line. Check errors, broken connections, misleading wording, unnecessary effort, mobile usability, and failure recovery. Prioritize correctness and quality while working efficiently. Preserve real customer records and the working email connection.

## Project and source

- Live site: https://realmwright-care.mdnahin537.workers.dev/
- GitHub repository: https://github.com/mdnahin537/MD-nahin
- Confirmed Customer Care branch: `codex/care-local-identity-auth`; project directory: `care/`.
- PR #14 was merged into that branch, NOT `main`: https://github.com/mdnahin537/MD-nahin/pull/14. It hides original synthetic board fixtures without deleting them. Its merge commit is `39b2d9424391ce496b0ac363ef512d33e0f9b1ec`.
- This handoff is committed at `care/handoff/CODEX-HANDOFF.md` on the Care branch.
- Recovery archive: `care/handoff/RealmWright-Care-repair-source.zip`, committed beside this handoff. Extract it to a separate working directory, read its README, and compare it with `care/`; do not overwrite the repository blindly.
- Archive SHA-256: `d188c7c284397eabd3a07f3b5be4ccdb4be79718b983cc54204f2244ff673533`.

The archive preserves the final directly deployed repairs. Do not assume the GitHub branch includes every repair in this archive. Compare the branch, archive, and current deployed Worker/assets before editing or deploying. Inspect repository instructions in the actual checkout.

## Completed email/repair work

The archived README and verification results record:

- Full submissions remain stored in Customer Care and a complete copy is sent to `mdnahin537@gmail.com`.
- Brevo sender verification and the `CARE_MAIL_API_KEY` Cloudflare secret are connected; `CARE_MAIL_ENABLED=true`.
- A database outbox captures submissions, comments, and follow-ups, with leases and retries. Owner-only queue status is available.
- Matching-report flow retains the user's context and allows adding details; repeated submission clicks are suppressed.
- Owner identity, logout session revocation, transactional vote counts, idea summaries, request bounds, follow-up validation, atomic report creation, and failure input retention were repaired.
- Static assets were uploaded, preserving public pages and protected Owner Desk routing.
- 21 local repair checks and 9 live checks passed in the earlier repair run. These were not rerun in this handoff session.
- One synthetic report's full email arrived in Gmail Inbox. Earlier synthetic database records were removed; original seeded fixtures remain held.

Evidence files: `README.md`, `live-checks.json`, `submission-check.json`, `email-activation.json`, `assets-deploy-result.json`, and `email-deploy-metadata.json` inside the archive.

## Independently checked in this handoff session

- Live `/api/health` returned HTTP 200 and `ok:true`, release `2026-09-29-care-repair`.
- The public Community Board and `/report/` entry page were opened in the browser.
- The earlier email with Gmail message ID `1a0f0f20b005f2d8` still has the `INBOX` label. Its subject identifies test report #14 and marker `CARE-VERIFY-23a8f90bd3c149479c90a40ff9733746`.
- GitHub repository access, the Care branch, the `care/` directory, and PR #14's actual base/merge status were verified.
- No new report, code fix, database migration, or production deployment was performed during this handoff session.

These checks do not establish that the entire workflow is flawless. The new audit stopped at the report entry screen when the user requested Codex transfer guidance.

## What Codex should do next

1. Read this handoff and the archive README. Establish the actual source version and deployed configuration; reconcile differences without overwriting newer work.
2. Trace bug and idea flows separately: entry, local identity, category/subcategory, questions, required/optional fields, duplicate matching, extra details, review, submission, saved record, email event, confirmation, tracking, and follow-up.
3. Inspect each visible instruction, label, button, error, and success message. Check that wording matches actual behavior. The entry currently says reports are public and no email address is required; verify visibility/moderation and same-device identity behavior before changing those claims.
4. Test back/forward navigation, editing prior answers, failed requests, slow requests, retries, double taps, refresh, long text, special characters, accessibility, keyboard focus, and narrow mobile layouts. Check whether drafts survive the situations users reasonably expect.
5. Check board filters/search/pagination, item links, report joining, voting, comments, follow-up prompts, status changes, Owner Desk access, and logout. Separate customer confirmation from email-provider acceptance and actual mailbox receipt.
6. Reproduce each material issue before fixing it. Make targeted source changes and meaningful tests for the behavior affected. Use isolated synthetic data; preserve existing customer records and held fixtures.
7. Review deploy scripts and the current live version before any production write. Preserve all bindings/secrets, database content, retry schedule, full asset inventory, protected paths, and working email delivery. Maintain a recoverable previous version.
8. Return findings ordered by impact, reviewable changes, checks performed, and explicit remaining limitations. Use plain language for the nontechnical owner. Never call the experience perfect merely because endpoint tests pass.

## Code, deployment, and access notes

- Main archive files: `worker.mjs`, `worker-base.mjs`, `notifications.mjs`, `assets-fixed/`, `wizard-fixed.js`, `board-fixed.js`, `item-fixed.js`, `migration.sql`, `test.cjs`, `test-client.cjs`, and `build.py`.
- Existing local checks documented in the archive: `node test.cjs` and `node test-client.cjs`. Verify runtime requirements from the actual files before executing.
- Current archive deployment entry is `deploy-assets.py`. Historical `deploy.py` must not be blindly rerun. `api.py` reads a Cloudflare token from `/tmp/care-token`; this temporary file is NOT part of the archive and is not guaranteed to exist in a new task.
- Saved archive deployment result is `fcf8d4c08e7c43569a169e7f7a85a676`, modified `2026-09-30T06:17:54.075524Z`. Treat it as historical evidence; query the current deployment before relying on it.
- The archive contains no secret values. GitHub access does not grant Cloudflare or Gmail access.
- Use the new environment's supported connection/secret flow for required Cloudflare access. Existing Brevo Worker secrets should be inherited; a fresh Brevo key is not ordinarily needed just to preserve the integration.
- Gmail receipt verification needs Gmail access in that task or verification by the owner. Brevo acceptance alone is not proof of inbox delivery.
- Public site checks can run without account credentials. Private deployment, database, and Owner Desk checks require separately authorized access.

## Practical Codex setup

Use the same ChatGPT account. Create or select a Codex Cloud environment on the web, connect GitHub if prompted, and select `mdnahin537/MD-nahin`. The handoff and recovery archive are already in this repository; no separate attachment is required when the correct branch is checked out. Select the Care branch above and verify the checkout. Configure only the network destinations and service access the work needs. Publish the prepared environment before starting a task from it. A new task does not automatically receive this session's scratch files, browser sessions, or temporary credentials.

Official references checked on 30 September 2026:

- https://learn.chatgpt.com/docs/environments/cloud-environments
- https://learn.chatgpt.com/docs/environments/modes
- https://learn.chatgpt.com/docs/cloud
- https://learn.chatgpt.com/docs/pricing
- https://learn.chatgpt.com/docs/changelog

The 29 September changelog lists GPT-6.1 Sol in Codex and ChatGPT Work, subject to plan/client/workspace availability. Codex is included in Plus, and Work/Codex share usage limits. Changing interfaces does not guarantee a stronger model or a fresh allowance.

## Owner instructions for this next task

- Do not take screenshots or use computer-use/browser automation. Inspect source, APIs and nonvisual tests. State any visual/mobile behavior that remains unverified.
- Explain material problems and the repair plan in short, plain language directly to the owner. The owner is not a coder.
- Save useful source changes and test evidence in a reviewable repository branch and commit/push them, or open a pull request. Temporary files and uncommitted task state are not a GitHub backup. Never commit tokens, keys, session cookies or private customer data.
- GitHub access does not automatically supply Cloudflare or Gmail credentials. Ask for required access only when needed for a concrete remaining check. The working Brevo secret is already installed in the Cloudflare Worker; preserve it.
