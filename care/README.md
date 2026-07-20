# RealmWright Community Care

Customer Care is a separate Cloudflare Worker that provides:

- a public board that anyone can read without an account;
- a report wizard for bugs and ideas;
- voting and comments;
- a private Owner Desk for moderation and build planning.

This version deliberately uses **no Google login, no OAuth, no passwords, and no paid authentication service**. It runs on a free Cloudflare Workers address such as:

    https://realmwright-care.<your-subdomain>.workers.dev

The Worker uses Cloudflare D1 for the board and a browser-local Care identity for actions that need attribution.

---

## Product-to-Care URL contract

The RealmWright product must not implement Google login or product authentication for Customer Care. Its three community entry points open the Care Worker directly:

    CARE_BASE_URL = https://<your-care-worker>.workers.dev

| Product entry point | Destination |
|---|---|
| Report a problem | CARE_BASE_URL + /report/ |
| Suggest an idea | CARE_BASE_URL + /report/ |
| Community | CARE_BASE_URL + / |

The report wizard asks the user to continue with a local Care identity. The product source is intentionally not changed in this branch; after the Care Worker is deployed, replace the placeholder base URL in the product integration wherever those links are wired.

---

## Authentication model

### Public reading

These routes are public and do not create an identity:

- /
- /item/?id=<number>
- /api/feed
- /api/item/<number>
- /privacy

### Local Care identity

When a user wants to report, vote, or comment:

1. Care shows a choice: use this device, or use a recovery code.
2. “Use this device” creates a random local user and an opaque random session token.
3. The token is stored in an HttpOnly, SameSite=Lax cookie.
4. D1 stores only an HMAC verifier for the token, never the token itself.
5. The user is shown publicly as a generic local name such as “A GM”.
6. No Google profile, email address, password, or OAuth grant is collected.

This is browser-profile identity, not hardware attestation. Clearing cookies or changing browser profiles requires recovery.

### Recovery

A signed-in user can click **Recovery code** in the Care header.

- Care creates one 24-character Crockford-style code and shows it once.
- The database stores only an HMAC verifier.
- The code is single-use.
- The user should copy or print it and keep it offline.
- On another device, choose **Use a recovery code** and enter it.
- Recovery creates a new local session for the same Care identity, then consumes the code.
- Generate a new code on the recovered device if another transfer is needed.

A recovery code is a bearer secret. Anyone who obtains it can recover that Care identity once. It is not a password and cannot provide hardware-level protection.

### Owner Desk

The Owner Desk does not use Google.

1. Configure the Cloudflare secret named OWNER_SETUP_TOKEN.
2. Open /auth/owner on the deployed Care Worker.
3. Enter that setup token once.
4. Care creates the one local owner user and marks it is_owner=1.
5. Save the recovery code from the Care header immediately.
6. Open /desk/ for the owner-only cockpit.

A unique database index permits only one owner. After the first claim, the setup endpoint returns “already completed” even if the secret remains configured. The Owner Desk gate checks the local is_owner flag, not an email address or a user-controlled value.

---

## Data preservation and migration

Existing Google-era rows are not deleted. Migration 0004 adds auth_provider and marks existing rows as legacy-google. Their reports, votes, comments, and board history remain visible according to the normal moderation rules.

New users are created with auth_provider=local and a local_... subject. No automatic mapping is attempted between a historical Google subject and a new local identity; doing that without proof could give one person another person’s reports or owner access.

Migration 0004 also creates:

- care_sessions — opaque session-token HMAC verifiers, expiry, and revocation;
- care_auth_attempts — HMAC’d, bucketed anti-abuse counters with no raw IP storage;
- recovery fields on users;
- the single-owner index.

Migration 0003 repairs denormalized public comment counts so held/deleted comments do not inflate them.

---

## Free Cloudflare setup

Care uses a free Cloudflare account and the free workers.dev hostname. No purchased domain is required for this Care beta.

### 1. Install and authenticate Wrangler

From the care directory:

~~~text
npm install
npx wrangler login
~~~

The browser login authorizes Wrangler to your Cloudflare account. Do not put a Cloudflare password in the repository.

### 2. Create or select the D1 database

The checked-in wrangler.toml already names the binding realmwright-care. If the database has not been created in this Cloudflare account:

~~~text
npx wrangler d1 create realmwright-care
~~~

Put the returned database ID into wrangler.toml only if this is a new account/database. The existing checked-in ID belongs to the previously prepared Care deployment; verify it before applying migrations.

### 3. Configure secrets

Set these with Wrangler or the Cloudflare dashboard. The values must never be committed:

~~~text
npx wrangler secret put SESSION_SECRET
npx wrangler secret put OWNER_SETUP_TOKEN
~~~

SESSION_SECRET signs all session, recovery, and rate-limit verifiers. Use a long random value.

OWNER_SETUP_TOKEN is the one-time owner-claim secret. Use a separate long random value. Do not reuse SESSION_SECRET.

Optional fallback AI secret:

~~~text
npx wrangler secret put OPENROUTER_KEY
~~~

The Owner Desk remains usable without OPENROUTER_KEY because deterministic summaries are the fallback.

Secret names only:

| Secret | Required | Purpose |
|---|---|---|
| SESSION_SECRET | Yes | HMACs session tokens, recovery codes, and anti-abuse fingerprints |
| OWNER_SETUP_TOKEN | Yes for first owner claim | One-time Owner Desk bootstrap |
| OPENROUTER_KEY | No | Optional AI fallback |

### 4. Apply every migration

~~~text
npm run migrate:remote
~~~

This applies migrations 0001 through 0004 in order. Do not skip 0004: the local identity session tables and owner flag are required.

### 5. Deploy

~~~text
npm run deploy
~~~

Cloudflare prints the free workers.dev URL. Use that URL as CARE_BASE_URL in the product-to-Care contract above.

### 6. Claim the Owner Desk

Open:

    https://<your-care-worker>.workers.dev/auth/owner

Enter OWNER_SETUP_TOKEN once. After success:

- save the recovery code from the Care header;
- visit /desk/;
- verify that a signed-out browser receives the normal 404;
- verify that a normal local user cannot see /desk/.

Do not share the owner setup token or recovery code.

---

## Local development

Copy care/.dev.vars.example to care/.dev.vars and keep the copy uncommitted. It contains only local dummy values.

Apply the local database and start Wrangler:

~~~text
npm install
npm run migrate:local
npm run dev
~~~

Open http://localhost:8787/.

For local owner setup, use the dummy OWNER_SETUP_TOKEN in your local .dev.vars file and open:

    http://localhost:8787/auth/owner

The local flow does not require a Google mock server. The old mock-google script was removed because Google is no longer part of the Care runtime.

---

## Abuse and request protection

- Public reads remain cacheable and unauthenticated.
- Report, vote, comment, and follow-up writes require a valid local session.
- Existing per-identity daily limits remain active.
- Bootstrap, recovery, and owner-claim attempts are bucket-rate-limited per HMAC’d Cloudflare client fingerprint.
- Raw IP addresses are not written to D1.
- Same-origin checks compare the complete origin when browsers provide an Origin header.
- SameSite=Lax and HttpOnly cookies protect ordinary browser sessions from cross-site form abuse.
- Recovery and owner setup requests also require a specific X-Care-Action header.
- No secret is sent to the product app or exposed in public HTML.

These controls reduce casual abuse and automated flooding; they are not a replacement for a paid CAPTCHA, WAF, or hardware-backed identity system.

---

## Privacy behavior

New Care identities have no email and no Google profile. Public reports, votes, comments, and the generic Care name are visible on the board.

The owner can request deletion through the configured contact address. Historical legacy rows remain preserved unless the owner removes them through the existing moderation/data process.

The public privacy page is /privacy. CONTACT_EMAIL remains a non-secret [vars] value in wrangler.toml and can be left empty during testing.

---

## Everyday commands

~~~text
npm run dev
npm run migrate:local
npm run migrate:remote
npm run deploy
~~~

Back up D1 before material schema or moderation changes:

~~~text
npx wrangler d1 export realmwright-care --remote --output backup-YYYY-MM-DD.sql
~~~

Never commit .dev.vars, secret values, recovery codes, Cloudflare tokens, or database credentials.

---

## Explicit boundaries

- Product Google login and Google Drive are intentionally frozen until a paid owned domain exists.
- Customer Care is independent and uses its own local identity; it does not unlock the RealmWright product.
- A Care identity cannot be silently converted into a product identity.
- Existing Google-era Care accounts cannot be safely recovered without their old provider; their public data remains preserved.
- Recovery codes are bearer secrets, not hardware-bound credentials.
