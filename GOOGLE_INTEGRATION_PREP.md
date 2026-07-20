# RealmWright Google Integration — Revised Implementation Preparation

**Status:** revised after product-identity requirement and a strict **zero-paid-domain** constraint. No Google credentials or user data are stored in this repository.

## Executive decision

RealmWright needs Google in two separate roles:

1. **Identity and entitlement**: a GM signs in before redeeming a product key. The first valid redemption is permanently bound to that Google identity. The same identity unlocks the purchase on the GM's other devices.
2. **Optional private backup**: only after the GM explicitly chooses **Connect Google Drive**, the product requests access to a hidden, app-specific Drive folder.

This separation prevents an unjustified Drive permission prompt at sign-in. A customer can own and use RealmWright without enabling Drive backup.

## OAuth client layout

Use two separate Web OAuth client IDs in one Google Cloud project, plus a separate project for development/testing.

| Surface | Purpose | Permissions | Flow | Secret? |
|---|---|---|---|---|
| RealmWright Community Care | Community account, voting, moderation, owner desk | `openid email profile` only | Server-side authorization-code flow | Yes: Care Worker only |
| RealmWright GM | Product sign-in, account-bound entitlement, then optional private backup | Identity first: `openid email profile`. Drive later: `https://www.googleapis.com/auth/drive.appdata` only | Google Identity Services in the browser; the product sends an ID token to the entitlement Worker | No: browser client ID is public |

**Never request:** `drive`, `drive.readonly`, `drive.metadata*`, Gmail, Calendar, Contacts, or any permission unrelated to the feature.

The RealmWright GM client is **not** Drive-only. Its identity function is required for cross-device entitlement. Its Drive function is optional and requested incrementally.

## The product-key design

A purchase key must be treated as a **one-time claim code**, not as the long-term login credential.

1. The GM signs in with Google.
2. The product sends the Google ID token and the entered purchase key to the RealmWright entitlement Worker over HTTPS.
3. The Worker verifies the Google token signature, issuer, audience, expiry, and immutable Google subject (`sub`). It verifies the purchase with the payment/licensing provider.
4. In one atomic database transaction, the Worker binds the license ID to that `sub` and marks the claim code redeemed.
5. Every other device signs in with the same Google account. The Worker validates its ID token and returns a short-lived signed entitlement because the stored `sub` matches.
6. A second Google account cannot redeem that already-claimed key.

Use the immutable Google `sub` as the account anchor, **never email address**. An email address can change; the `sub` is the stable identity value.

The Worker must store only the minimum needed: provider license ID, Google `sub`, redemption time, revocation/refund state, and an HMAC/hash representation of any claim code. The raw key must not be stored in browser code, logs, analytics, screenshots, or support tickets.

### Hard limits that must be stated honestly

- A browser-only product cannot make license enforcement unbreakable. A determined owner can modify local code. A Worker can make ordinary copying and key-sharing difficult, but not mathematically impossible.
- Offline use needs a signed entitlement with a defined grace period (for example 30 days), then an online check. Do not pretend that an offline HTML file can securely enforce a permanent paid license.
- Use the same Google account on all devices. If the GM loses that Google account, recovery is a support-policy problem. Build a manual, auditable ownership-transfer process; never auto-transfer based only on an email message.
- A normal web page is not a supported PlayStation product. Desktop, laptop, tablet, and mobile browser/PWA are the v1 target. A TV/console implementation would be a separate client with a limited-input-device authorization flow and backend secret; do not promise it now.

## Private Google Drive backup

`drive.appdata` is non-sensitive and uses a special hidden per-user folder. RealmWright cannot browse, search, read, change, or share the customer's normal Drive files. The user's backup consumes the user's own Google storage allowance.

The product must request this permission only from a clear user action such as **Connect Google Drive** or **Sync now**. Sign-in by itself must not ask for Drive access.

### Storage shape

Use the user's hidden `appDataFolder`:

- One current snapshot: `realmwright-state-v1.json`
- One metadata file: `realmwright-meta-v1.json`
- Metadata: schema version, save time, file ID, Drive file version, and content digest. No API key, OAuth token, cookie, or customer content.

Before every upload, fetch the current remote metadata. If its version differs from the last remote version seen by that device, do not overwrite it. Download it and show a human choice:

- **Use newer cloud world**
- **Keep this device and create a conflict copy**
- **Cancel**

Do not implement silent last-write-wins.

### Data safety rules

1. Serialize only `_stateForPersist()`; it is the existing secret-scrub path. Never upload raw `State.data`.
2. Keep local IndexedDB, local snapshots, JSON export/import, and on-disk backup. Drive is an optional extra copy, never the sole copy.
3. Do not sync sample/demo worlds.
4. Give visible actions: **Sign in**, **Redeem key**, **Connect Google Drive**, **Sync now**, **Restore from Google Drive**, and **Disconnect Google Drive**.
5. Disconnect removes local sync metadata and revokes Google consent when possible. It must never delete the customer's Drive backup without a separate, explicit confirmation.
6. V1 is not end-to-end encrypted. State that truth clearly. A future passphrase-encrypted backup is possible, but forgotten passphrases make worlds unrecoverable.
7. Browser Drive access tokens are short-lived. Sync may continue while the product is open and the token is valid; when expired, require a user click to obtain another token. No silent, always-on background sync promise.

## The no-paid-domain reality

Cloudflare's free `<project>.pages.dev` and `<worker>.workers.dev` addresses are useful free hosting addresses. They are **not domains that RealmWright owns**. Cloudflare controls the parent domain, and RealmWright cannot create the root DNS record needed to verify `pages.dev` or `workers.dev` in Google Search Console.

Google's production OAuth policy requires an app homepage on a verified domain under the developer's ownership, and Google restricts OAuth redirect/origin URLs to domains the developer owns or is licensed to use. Therefore there is no honest, durable, public-production route that is simultaneously:

- Google login,
- public sales to arbitrary customers,
- optional Google Drive access,
- no owned domain,
- no payment or borrowing.

Do not depend on free-subdomain providers as a loophole. They can remove the subdomain, they do not give DNS-root control, and they do not turn into a domain property RealmWright can verify.

### What is possible at zero money

**Closed beta only:** keep the external Google project in **Testing**, explicitly add each tester, keep the audience under Google's test-user limit, and accept that non-basic authorizations can expire after seven days. This is suitable for development and a small invited test group; it is not a dependable public paid-product launch.

Firebase Authentication can provide a free `<project>.firebaseapp.com` redirect for basic Google sign-in, and its social sign-in has a no-cost tier. It may be useful for a prototype. It does not give RealmWright a verified domain it owns, and it must not be sold as a guaranteed way around the public Drive/OAuth production requirement.

**If the permanent rule is “zero cost forever,” the honest v1 is local product keys plus local storage and manual JSON export/import, with no public Google identity or Drive-sync promise.**

## What Google Search Console verification means

This is a one-time developer ownership check, not a request made to customers.

With an owned domain, the project owner would:

1. Sign in to [Google Search Console](https://search.google.com/search-console/) using the same Google account that is Owner or Editor of the Google Cloud project.
2. Select **Add property** → **Domain** and enter the root domain, for example `example.com`.
3. Google supplies a TXT verification record, similar to `google-site-verification=...`.
4. Add that exact TXT record to the domain's DNS records at the registrar or DNS provider.
5. Return to Search Console and select **Verify**.

Google looks up the public DNS record. Seeing it proves the developer controls the domain. It does not cost a Google fee. It is impossible for RealmWright to complete this for `pages.dev` or `workers.dev`, because RealmWright does not control their DNS zone.

## Customer Care: current state and remaining work

The Care branch already uses the correct server-side identity approach:

- `care/src/lib/auth.js` requests only `openid email profile`.
- It protects OAuth state, exchanges the code server-side, verifies Google's signed ID token against JWKS, checks issuer and audience, then creates a signed 90-day session.
- It stores Google subject, name, avatar URL, and email in D1 for voting and moderation.

For a verified-domain production path, remaining work is:

1. Deploy Care at the approved hostname.
2. Add the Care OAuth client ID to `GOOGLE_CLIENT_ID`.
3. Set `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, and `OWNER_SUB` as Cloudflare secrets.
4. Publish a matching Care privacy page and contact email.
5. Test sign-in, sign-out, report submission, voting, owner-only access, and non-owner denial.

Care must never request Drive access.

## RealmWright GM implementation tasks

1. Add a Google Identity module for product sign-in and ID-token handling.
2. Add an entitlement Worker endpoint that verifies ID tokens, atomically redeems a key, and returns signed short-lived entitlement proofs.
3. Bind the one-time claim to Google `sub`, with refund/revocation and ownership-transfer support rules.
4. Add `GoogleDriveSync` as a self-contained module in `realmwright-v7.html`.
5. Load Google Identity Services from `https://accounts.google.com/gsi/client`.
6. Extend the CSP for GIS and the Drive API:
   - `script-src https://accounts.google.com/gsi/client`
   - `connect-src https://accounts.google.com/gsi/ https://www.googleapis.com`
   - `frame-src https://accounts.google.com/gsi/`
   - `style-src https://accounts.google.com/gsi/style`
7. Request `drive.appdata` only through a user-initiated Google Identity Services token flow.
8. Store only Drive file metadata and last-seen remote version in IndexedDB.
9. Extend the existing Settings > Backups status chip; do not create a competing backup interface.
10. Test: first redemption, second-device unlock, wrong Google account, refund/revocation, offline grace, first upload, restore, token expiry, revoked access, offline use, upload failure, and two-device conflict detection.
11. Run real browser acceptance tests on Chrome, Edge, Firefox, and Safari. Local export/import must always remain available.

## Launch gates

Do not enable customer-facing Drive or entitlement claims until all relevant gates pass:

- The OAuth screen requests exactly the planned scopes.
- Product sign-in works without a Drive request.
- The same Google account unlocks the license on a second device.
- A different Google account cannot use a redeemed key.
- No entitlement, token, API key, cookie, or license secret enters a backup.
- A Drive review proves normal Drive files are inaccessible.
- A newer remote world cannot be overwritten silently.
- Revoking Google access leaves the local world usable and shows a clear reconnect action.
- Care login works independently when Drive is disabled.
- Public privacy policy exactly matches actual data behavior.
- Production launch has a verified developer-owned domain; otherwise the release is accurately labelled closed beta.

## Sources

- Google OAuth production-domain policy: https://developers.google.com/identity/protocols/oauth2/policies
- Domain and brand verification: https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification
- Google Search Console verification steps: https://support.google.com/cloud/answer/13804266
- Google Drive app-data folder and `drive.appdata` scope: https://developers.google.com/workspace/drive/api/guides/appdata
- Browser token model and short-lived access tokens: https://developers.google.com/identity/oauth2/web/guides/use-token-model
- Google sign-in versus authorization: https://developers.google.com/identity/gsi/web/guides/overview
- Firebase Authentication Google sign-in: https://firebase.google.com/docs/auth/web/google-signin
- Firebase pricing: https://firebase.google.com/pricing
