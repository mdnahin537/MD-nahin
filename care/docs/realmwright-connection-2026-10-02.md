# Preserve RealmWright's existing Customer Care connection

Checked 2 October 2026. Keep the existing Settings → Community arrangement. Only two product buttons are needed.

## Verified source

The Care branch does not contain the product HTML. The product is available on `agent/realmwright-recovery-2026-07-24`, at commit `d910b859da71e443530b33427a6038a56f565b9c`.

- [Existing Settings buttons](https://github.com/mdnahin537/MD-nahin/blob/d910b859da71e443530b33427a6038a56f565b9c/realmwright-v7.html#L5088): **Find a problem or new idea**, **See what people are saying**.
- [Existing Community module and bindings](https://github.com/mdnahin537/MD-nahin/blob/d910b859da71e443530b33427a6038a56f565b9c/realmwright-v7.html#L28476): the report button opens `https://realmwright-care.mdnahin537.workers.dev/report/`; the board button opens the same base address with `/`.
- [Care's existing choice panel](https://github.com/mdnahin537/MD-nahin/blob/117ad17757f580589f9f42da348ed605c9de9870/care/public/js/wizard.js#L282): **Something’s broken**, **I have an idea**.

The report entry has no `?type=` parameter. After the existing local identity step, a fresh report shows that choice panel and continues through the existing questions and report form. Existing valid drafts or saved receipts resume normally.

## Existing handoff

The product appends a URL fragment, `#ctx=<base64url JSON>`, containing only app version, data schema, demo/full build, theme, mode and AI provider type. It sends no provider key, product key, private purchase link or world content in this payload. Care preserves these allowed values, adds coarse device/browser details, and shows removable context in the report form.

The two existing buttons open a new browser tab with `noopener`. The existing offline guard shows a message instead of opening a tab.

The destination is already the live Care address in the inspected product source. Publishing the reviewed Care improvements at that same address preserves this connection. No new Settings button, product authentication change or replacement database is required.

## Checks and limits

[Committed results](realmwright-connection-results-2026-10-02.json) record checks made by executing the unchanged product Community module and reviewed Care wizard with synthetic state and the existing client DOM fixture. They verify both actual button callbacks, destinations, context allowlisting, exclusion of simulated private data, new-tab protection, offline behavior, both report choices, retained context and removable context.

These are source/script checks with simulated browser APIs. They do not establish which RealmWright HTML is currently deployed or verify real Chrome rendering. No production deployment, customer record write, secret change or email send was performed. This change updates only documentation and check results.

Before publishing Care, retain the existing D1 database and owner/session secrets, reconcile the missing additive migrations, preserve Brevo and contact settings, and keep a recoverable prior Worker version as documented in [the Care README](../README.md).
