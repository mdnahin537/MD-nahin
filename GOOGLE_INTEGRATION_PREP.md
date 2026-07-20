# RealmWright Google Integration — Implementation Preparation

**Status:** architecture locked; no Google credentials or user data are stored in this repository.

## Decision

Build two separate Google integrations with two separate Web OAuth client IDs in one Google Cloud project:

| Surface | Purpose | Scopes | Flow | Data location |
|---|---|---|---|---|
| RealmWright Community Care | Sign in, voting, moderation, owner desk | `openid email profile` | Server-side authorization-code flow | Care's Cloudflare D1 database |
| RealmWright GM | Optional cross-device world backup | `https://www.googleapis.com/auth/drive.appdata` only | Google Identity Services browser token model | The customer's own hidden Google Drive app-data folder |

**Never request:** `drive`, `drive.readonly`, `drive.metadata*`, Gmail, Calendar, Contacts, or any scope unrelated to the feature.

This is intentionally not a general Drive integration. `drive.appdata` is non-sensitive and restricts the product to its own hidden per-user data folder. RealmWright cannot see, search, read, modify, or share a user's normal Drive files.

## Non-negotiable platform constraint

A public production OAuth application must use a domain the owner controls. Do not build this around `*.pages.dev` or `*.workers.dev` as the permanent public OAuth identity.

Before launch, buy or use one inexpensive top-private domain and verify it in Google Search Console with the same Google account that owns the Google Cloud project. Then map Cloudflare custom subdomains:

- `https://app.<YOUR_DOMAIN>` — RealmWright GM
- `https://care.<YOUR_DOMAIN>` — Community Care
- `https://www.<YOUR_DOMAIN>` or `https://<YOUR_DOMAIN>` — public homepage and privacy policy

A custom domain is the only unavoidable owner-side cost/step. Storage is paid from each customer's own Google Drive allowance; RealmWright does not pay per-user storage.

## Google Cloud setup

Create one Google Cloud project, for example **RealmWright Production**. Keep a separate test project for localhost/staging.

1. Enable the Google Drive API.
2. Configure the external OAuth consent screen:
   - App name: **RealmWright**
   - Support email and developer contact: an address Hunter monitors
   - Homepage and privacy-policy URLs on the verified custom domain
   - Request only the three identity scopes and `drive.appdata`.
3. Create two **Web application** OAuth clients:
   - **RealmWright Care**: redirect URI exactly `https://care.<YOUR_DOMAIN>/auth/callback`.
   - **RealmWright GM**: JavaScript origin exactly `https://app.<YOUR_DOMAIN>`. It needs no client secret and no redirect URI when using the browser token model.
4. Store the Care client secret only as a Cloudflare Worker secret. Never put it in `wrangler.toml`, HTML, Git, browser storage, screenshots, or chat.
5. Put the GM client ID in product configuration. OAuth client IDs are public identifiers, not secrets.

The selected scopes are non-sensitive, so restricted-scope verification and a security assessment are avoided. This does **not** remove the need for an honest homepage, privacy policy, accurate branding, and Google API-policy compliance.

## Customer Care: current state and work

The Care branch already implements the correct server-side identity design:

- `care/src/lib/auth.js` uses only `openid email profile`.
- It protects OAuth state, exchanges the code server-side, verifies Google's signed ID token against JWKS, checks issuer and audience, then creates a signed 90-day session.
- It stores the Google subject, name, avatar URL, and email in D1 because the board needs a stable identity for voting and moderation.

Implementation work remaining:

1. Deploy Care on the custom `care.<YOUR_DOMAIN>` hostname.
2. Add the Care OAuth client ID to `GOOGLE_CLIENT_ID`.
3. Set `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, and `OWNER_SUB` as Cloudflare secrets.
4. Update the Care privacy page to disclose Google identity data processing and the public contact email.
5. Test sign-in, sign-out, report submission, voting, owner-only desk access, and a non-owner 404.

Care must never request the Drive scope.

## RealmWright GM: cloud-backup design

### Why this model

The product is a self-contained browser app. The Google Identity Services token model lets a customer authorize Drive directly in their own browser. No RealmWright server receives their Drive access token, refresh token, world data, or Google password.

A token is short-lived. During a session, auto-sync can run while the token is valid. When it expires, the product must show **Sync to Google Drive** and obtain a new token from that user click. It must never pretend that permanent silent background sync is possible without storing a user refresh token on an owner-controlled backend.

### Storage shape

Use the user's hidden `appDataFolder`:

- One current snapshot: `realmwright-state-v1.json`
- One small metadata file: `realmwright-meta-v1.json`
- Metadata contains schema version, saved time, file ID, Drive file version, and a content digest. It contains no API key and no customer content.

Before every upload, fetch metadata for the current remote file. If its Drive version differs from the last version seen on this device, do **not** overwrite it. Download it and show a human choice:

- **Use newer cloud world**
- **Keep this device and create a conflict copy**
- **Cancel**

Do not implement last-write-wins without an explicit conflict choice.

### Data safety rules

1. Serialize only `_stateForPersist()`; that is the product's existing secret-scrub path. Never upload `State.data` raw.
2. Keep the existing local IndexedDB, local snapshots, JSON export/import, and on-disk backup. Google Drive is an optional additional safety layer, not the sole copy.
3. Do not sync sample/demo worlds.
4. Give the user visible actions: **Connect Google Drive**, **Sync now**, **Restore from Google Drive**, and **Disconnect Google Drive**.
5. On Disconnect, revoke Google consent when possible and delete only local Drive-sync metadata; never delete the customer's Drive backup without a separate, explicit confirmation.
6. State the truth in product copy: the file is hidden from normal Drive UI and inaccessible to other Drive apps, but v1 is **not end-to-end encrypted**. Do not claim “zero cloud” or “end-to-end encrypted.”
7. A later optional end-to-end encrypted backup may be added with a user-held passphrase, but it is not part of v1 because forgotten passwords would make worlds unrecoverable.

### Product implementation tasks

1. Add `GoogleDriveSync` as a self-contained module in `realmwright-v7.html`.
2. Load Google Identity Services only when a user opens the Drive-backup control:
   `https://accounts.google.com/gsi/client`.
3. Extend the product CSP for Google Identity Services and the Drive API:
   - `script-src https://accounts.google.com/gsi/client`
   - `connect-src https://accounts.google.com/gsi/ https://www.googleapis.com`
   - `frame-src https://accounts.google.com/gsi/`
   - `style-src https://accounts.google.com/gsi/style`
4. Request only `drive.appdata` through `google.accounts.oauth2.initTokenClient()`, only after the user clicks Connect/Sync.
5. Call Drive REST APIs from the browser using the short-lived access token. No product client secret exists.
6. Store only Drive file metadata and the last-seen remote version in IndexedDB.
7. Extend the existing Settings > Backups status chip rather than creating a second competing backup surface.
8. Add deterministic tests for serialization, first upload, restore, token expiry, revoked access, offline use, upload failure, and two-device conflict detection.
9. Run a real-browser acceptance test on Chrome, Edge, Firefox, and Safari. Google Drive sync must degrade cleanly; local export/import must always remain available.

## Launch gates

Do not enable the customer-facing Drive button until all gates pass:

- OAuth consent screen requests exactly the planned scopes.
- A Drive permission review confirms RealmWright cannot see normal Drive files.
- A backup contains no OpenRouter key, license secret, cookie, token, or OAuth data.
- A second device restores the same world without manual file transfer.
- A newer remote version cannot be overwritten silently.
- Revoking Google access leaves the local world usable and produces a clear reconnect action.
- Care sign-in works independently when Drive is disabled.
- The public privacy policy exactly matches the product behavior.

## Owner actions that cannot be automated

- Purchase/control a production domain and add the required DNS records.
- Verify that domain in Google Search Console using the Google Cloud project-owner account.
- Create the Google Cloud project, OAuth clients, consent-screen branding, and policy URLs.
- Place the Care secret values in Cloudflare.
- Personally approve the final OAuth consent and production deployment.

Everything else can be implemented, tested, and reviewed in the codebase once the custom domain and the two client IDs are available.

## Sources

- Google Drive app-data folder and `drive.appdata` scope: https://developers.google.com/workspace/drive/api/guides/appdata
- Drive scope classification: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Browser token model: https://developers.google.com/identity/oauth2/web/guides/use-token-model
- Google Identity Services CSP: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
- Google OAuth production-domain policy: https://developers.google.com/identity/protocols/oauth2/policies
