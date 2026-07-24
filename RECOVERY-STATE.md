# RealmWright Recovery State

**Last updated:** 2026-07-24

This file is the durable handoff for every future session. Read it before changing RealmWright. Update it after every verified change so chat compaction or a lost agent session cannot erase the plan.

## Canonical work location

- Repository: `mdnahin537/MD-nahin`
- Recovery branch: `agent/realmwright-recovery-2026-07-24`
- Draft recovery PR: `#13`
- Recovery branch was created from pivot commit: `90c9a2f4235e38c4c50229ab160579a72ff65931`
- PR #13 base: `claude/realmwright-pivot`
- Never modify `main` or `claude/realmwright-pivot` directly.
- Never force-push the recovery branch.
- Keep one coherent fix per commit and keep PR #13 draft until full validation passes.

## Locked product direction from the July pivot

- Product name: RealmWright GM.
- Hosted free demo on Cloudflare Pages.
- Paid unlock: one-time $23 product key from itch.io or Lemon Squeezy.
- Demo capacity: 1 world, 8 NPCs, 6 locations, 3 factions, 10 chronicle entries.
- Demo AI allowance: exactly 5 one-time full Copilot uses per visitor, enforced server-side.
- Each of the five free uses may perform the same world-changing actions as paid Copilot.
- After the fifth successful AI use, Copilot is gated and the product-key unlock path is shown.
- A failed request, provider outage, validation failure, or incomplete response must not consume a free use.
- Paid users unlock unlimited product capacity and the complete ongoing Copilot experience, subject to their selected provider's limits.
- User world data remains local/owned by the user. Google Drive sync was planned but is not yet proven complete.

## User requirements added on 2026-07-24

1. The demo must actually provide the promised 5 free AI uses. It must not simply tell a demo visitor to unlock when free uses remain.
2. The five uses must be full Copilot uses, including world-changing actions. Do not make the demo read-only.
3. Confirm and harden the non-technical `Free by NVIDIA` setup:
   - user clicks one obvious button;
   - OpenRouter login/authorization opens;
   - the returned API key is captured automatically without manual copying;
   - RealmWright saves it locally and selects a genuinely free NVIDIA model;
   - the UI clearly handles cancellation, callback failure, unavailable/free-model changes, and rate limits.
4. Preserve this state file and update it after every meaningful investigation, decision, fix, or validation result.
5. Recovery must remain reversible even if a new change breaks the app.
6. Every update must remain inspectable later through PR #13 commits, diffs, CI results, and this file.

## Work completed on the recovery branch

### Commit `b957691b40f253ec498109ebfaffe983bbf1a706`

Fixed a partial Cloudflare KV reservation failure in `worker/src/demo.ts`. If the per-visitor counter writes successfully but the global counter write fails, the completed visitor reservation is now compensated before returning 503. This prevents a failed request from consuming one of the visitor's five free uses.

### Commit `eed7492558d2f1884b71fabb657e71ae809d529a`

Added `worker/test/recovery-demo.test.mjs`, a focused regression test for the partial-reservation failure.

### Commit `d2d33d8a98d3b6920d81e635b97bb596d762cb29`

Added this durable recovery handoff so a compacted/lost session cannot erase project state.

### Commit `3940583e580d131a829c84b6120038131f6b0287`

Added branch-only GitHub Actions validation and an exact-source artifact. The workflow does not deploy anything and does not modify production branches.

### Validation status

- GitHub Actions run `30112092101` completed successfully on the recovery branch.
- `npm ci` completed successfully in `worker/`.
- The complete Worker test suite completed successfully, including the recovery regression test.
- `npm run typecheck` completed successfully.
- The exact recovery source was uploaded as artifact `realmwright-recovery-source` with SHA-256 digest `2412d71a34b061848c4081ed085752d1023b4c864828fa085f5fc48a73b80aed`.
- Browser-level RealmWright validation has not yet passed; do not merge or deploy based only on Worker CI.

## Current investigation: demo AI says “unlock”

### Confirmed code-level cause from PR #12 diff

The July pivot changed `Copilot.isConfigured()` to return false whenever `LicenseGate.isActive()` is false. Therefore ordinary Copilot and AI-feature entry points intentionally show an unlock message to demo visitors.

The separate five-message demo path exists in `FrontDoor._handleGenerate()` and calls the Worker through `Demo.proxyRequest`; it is not the same path as the ordinary Copilot panel.

The client constant `TURNSTILE_SITEKEY` is still an empty deployment placeholder in the branch snapshot. When that key is empty, the front-door demo path treats the demo service as unavailable and routes the visitor toward activation. This directly explains the observed “unlock product” behavior in an unconfigured build.

### Locked correction

1. **Deployment/configuration:** the free-demo Worker, Turnstile public site key, allowed Pages origin, Worker secrets, and forced demo model must be configured before deployment. Missing configuration must produce an honest operator/configuration error, never a false claim that the visitor has exhausted the demo or must buy.
2. **Product behavior:** ordinary Copilot must accept exactly five full demo uses, not only a hidden front-door preview.
3. **World mutation:** all normal Copilot-generated actions available to paid users are available during those five uses. Existing confirmation/review safeguards must remain active; the demo must not bypass safety prompts.
4. **Counting:** decrement only after a complete, valid AI response is received and accepted into the Copilot flow. Provider or network failures must be refunded.
5. **Gate:** after the fifth successful use, block subsequent Copilot generation and present the product-key unlock route.
6. **Visibility:** show the remaining count clearly in Copilot and distinguish demo capacity from provider status.

## Free by NVIDIA investigation status

The branch contains a `Use Free by NVIDIA` button and an OpenRouter authorization/PKCE flow, but it has not yet been independently validated end to end in this recovery session.

Do not claim it works perfectly until all of these are proven:

- authorization URL and redirect URI are valid for the deployed Pages origin;
- PKCE state/verifier survives the redirect safely;
- callback exchanges the authorization code successfully;
- returned key is captured without exposing it in logs/history;
- key is stored only in the intended local secret storage and scrubbed from exports/backups;
- selected NVIDIA model is currently listed by OpenRouter and is free at request time;
- the app falls back safely if that exact model is removed, renamed, temporarily unavailable, or no longer free;
- one real browser test completes login and sends a successful message.

## Immediate next actions

1. Use the exact GitHub Actions source artifact to inspect the complete `Demo`, `DemoCounter`, `FrontDoor._handleGenerate`, `Copilot.isConfigured`, `Copilot.send`/provider fetch, world-action application, OpenRouter PKCE callback, and `freeNvidiaModelId` implementations.
2. Verify current OpenRouter OAuth/PKCE behavior and NVIDIA free-model availability against official OpenRouter sources.
3. Implement five full Copilot uses in one isolated HTML commit, preserving the original blob and producing a minimal audited diff.
4. Add deterministic tests/harnesses for counts 5 → 0, refund-on-failure, sixth-use gate, and world-action availability.
5. Implement any required Free-by-NVIDIA hardening separately.
6. Update this file and PR #13 after each commit.

## Safety rules

- Never delete user-world data or alter storage keys without a migration and restore test.
- Never commit API keys, Turnstile secrets, store secrets, or real product keys.
- Never replace the 29k-line HTML file from an incomplete/truncated copy.
- Before changing `realmwright-v7.html`, obtain the complete exact blob and retain its SHA.
- After any HTML change, compare the new branch to its previous commit and verify only intended regions changed.
- Preserve existing confirmation/review steps for AI-proposed world mutations.
- Do not merge or deploy while placeholders remain or browser validation is incomplete.
