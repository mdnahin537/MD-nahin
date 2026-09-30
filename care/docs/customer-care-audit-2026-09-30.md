# Customer Care audit — 30 September 2026

Customer Care now keeps drafts through reloads and failed requests, saves matching reports with their details, gives accurate confirmation, and lets the owner review held content without deleting it. The review branch restores repairs that were deployed directly but missing from GitHub, then adds targeted customer experience improvements.

Scope: `mdnahin537/MD-nahin`, base `codex/care-local-identity-auth`, review branch `codex/care-audit-recovery`. The work prioritizes a smooth, practical experience. Production was not deployed or modified during this audit.

## Source and live comparison

Read `care/handoff/CODEX-HANDOFF.md` and the recovery archive beside it before product edits. Verified ZIP SHA-256 `d188c7c284397eabd3a07f3b5be4ccdb4be79718b983cc54204f2244ff673533` and extracted/tested the archive separately. The original branch at `31c95564f529860a777b2dd7243bfb0ed5515d65` lacked the deployed email/outbox module and several transactional/client repairs. Some HTML also contained garbled characters.

The public deployment identified release `2026-09-29-care-repair`; its wizard, board, and item scripts matched the archive exactly. Signed-out Desk APIs and assets returned 404. [Initial comparison evidence](audit-baseline-2026-09-30.json) and [baseline verification](https://github.com/mdnahin537/MD-nahin/actions/runs/36685673194) retain the original observations. This established the recoverable source; it did not inspect private Worker bindings or the uploaded Worker.

## Journey audit

| Step | Result and customer experience | Evidence |
|---|---|---|
| Entry | Separate bug/idea links open the intended flow. Public reading creates no identity. | Source trace; client initialization; local Worker routes |
| Device identity | Explicit same-device identity and optional recovery. An operational lookup failure offers retry and preserves the current cookie and draft. | Backend outage/rollback tests; client retry state |
| Area and questions | All taxonomy areas, including the extra idea category, are available. Bug and idea contracts validate their own fields; blank new idea requests are rejected. | Backend and client contracts |
| Matching | Choosing a match opens the detail step. Accepted bug/idea fields and context remain attached to the saved report. A late matching response cannot undo Back. | Backend, client, and native D1 tests |
| Writing and review | Reports restore from per-tab drafts for up to 24 hours. Expected/actual text, idea request/reason/success criteria, title edits, and removable context are retained. Matched ideas show the existing reference instead of an ineffective title editor. | Production client script tests |
| Save and retry | One transaction creates the item/report/vote. Repeated clicks and lost-response retries do not create duplicate reports, comments, or email events. Editing a tap answer starts a new retry key. | Backend concurrency tests; client tests; native D1 |
| Confirmation | Valid saved IDs are required before confirmation. Held content is described as saved for review. Same-tab reload restores the saved receipt. Email acceptance is a separate state. | Client and backend tests |
| Optional follow-up | Offered choices only, at most two answers, always skippable. A repeated answer is safe. D1 trigger writes no longer cause a false conflict after a successful save. | Backend tests and actual local Cloudflare runtime |
| Board | Latest search/filter response wins. Failed pagination retains rows and retries the same page. Searches treat backslash, percent, and underscore literally. Shipped/declined filtering already worked and remains covered. | Backend and production client tests |
| Votes and discussion | Repeated votes keep accurate totals. Comment/reply drafts survive failures. Held/deleted reply parents reject new replies. | Backend/client/native D1 tests |
| Changes during writing | If an owner merge or hold completes after validation, new report/comment/vote writes stop with a useful error. No newly accepted text is stranded on a merged entry. Saved comment retries still acknowledge the original moved record. | Reproduced failing tests, then passing transaction tests |
| Owner review | The owner can read the complete saved report/comment before publishing or keeping it held. Publishing updates visible counts; retaining closes the review without deleting content. | Owner-gate, rollback, and native D1 tests |
| Owner planning | Merge moves records and raw votes atomically, preserves inherited holds, and prevents cycles/type mismatches. Idea build briefs include request, reason, and success criteria. Status/note/pin controls were source-traced; no complete rendered Desk interaction test was performed. | Backend transaction tests; source review |
| Logout and recovery | Logout revokes the session and clears per-tab drafts/receipts. Recovery consumes a code only with a successfully created session. A single owner remains protected, including against owner-ban actions. | Backend and native runtime tests; client source trace |

## Email and record preservation

Restored the archive's existing Brevo transport, immutable outbox snapshots, bounded retries and leases, owner-only status, and scheduled drain. Tests cover full accepted details, Unicode, HTML escaping, fixed configured sender/destination, provider rejection, missing acceptance IDs, lease expiry, failure limits, and manual retry. A previously verified test email was still in Gmail Inbox when checked; no new mail was sent in this audit. Mock provider tests do not establish fresh inbox delivery.

No production database writes, migrations, secret rotations, owner claims, fixture cleanup, or deployment were performed. Customer data and the handoff/recovery ZIP remain unchanged. Additive migrations preserve representative customer rows, session/recovery verifiers, payloads, comments, and votes. Historical rows are not retroactively emailed. Existing seed-cleanup tests still prove that only identified demonstration fixtures are held, not deleted.

## Visual improvements

Added a coherent ink/parchment/copper palette, readable blue status text, self-hosted typography, a concise board introduction, and a small CSS faceted seal with perspective depth. Forms and cards have subtle shading. Focus is visible, touch targets are larger, narrow layouts wrap, and reduced-motion preferences disable animation and transitions. Owner tabs support arrow/Home/End navigation.

Six selected foreground/background pairs measure contrast ratios from 5.13 to 11.99; see [recorded results](audit-results-2026-09-30.json). These measurements and clean stylesheet parsing are limited checks, not a complete accessibility or visual certification. No screenshots, computer automation, rendered browser/mobile, or assistive-technology checks were performed.

## Verification

Tested code commit: `e1836027c1c6632bc0a4e198a50e22c84c253e72`. [Successful workflow](https://github.com/mdnahin537/MD-nahin/actions/runs/36723670648) with [downloadable results](https://github.com/mdnahin537/MD-nahin/actions/runs/36723670648/artifacts/11101012491).

| Check group | Passed | Scope |
|---|---:|---|
| Current backend | 26 | Actual bundled Worker with isolated SQLite/D1 adapter |
| Current client | 13 | Production scripts executed with a small DOM fixture |
| Migration/fixture preservation | 9 | Isolated Python/SQLite tests |
| Native Cloudflare runtime | 8 | Local Worker, temporary D1, dummy identity secrets, mail disabled |
| Recovery archive regression checks | 21 | Archived source tested separately |
| Public live endpoint checks | 11 | Read-only HTTP, no credentials or sessions |

Also passed: Worker dry-run build, five stylesheet parses, five client script syntax checks. Pinned Wrangler 4.144.0 replaces vulnerable tooling dependencies; `npm audit` reported zero advisories at verification time.

The concurrent-merge regression was independently reproduced in [this test run](https://github.com/mdnahin537/MD-nahin/actions/runs/36723041979), then fixed and rerun successfully. The native runtime also caught the false follow-up conflict that an earlier SQLite adapter missed; the adapter now accounts for trigger writes.

## Deployment notes and remaining limits

The reviewable source is ready for repository review; it has not replaced the live release. Apply/reconcile migrations 0006–0008 before deploying this Worker. The recovery deployment may have executed SQL outside Wrangler's migration history; inspect the actual schema/history and keep a private D1 export before migration. Do not recreate the database, replay development seeds, or rotate identity secrets. [README](../README.md) documents setup, local checks, and the distinction between a new installation and this existing deployment.

Preserve the existing D1 binding/ID, `SESSION_SECRET`, `OWNER_SETUP_TOKEN`, Brevo key, mail/contact settings, protected asset routing, and retry schedule. `keep_vars=true` preserves live settings omitted from source. Values remain outside the repository.

Private current Cloudflare configuration/uploaded Worker and fresh inbox delivery were not verified: the available tools did not provide the required private Cloudflare API execution. The supplied token was not written to code, workflow, artifacts, or repository. Browser rendering and complete manual Desk interaction remain unverified. Endpoint/runtime tests cannot promise that every real-device interaction is flawless.
