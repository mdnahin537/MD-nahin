# Hide the original public demo data

Migration `0005_hide_seed10_fixtures.sql` uses the existing moderation flag.
It changes visibility only. Reports, comments, votes, identities, statuses,
and item IDs are preserved. No application redeploy is needed for that flag:
the current feed and individual-item routes already exclude held items.

The predicate requires IDs 1–11, the exact generated title, and the matching
synthetic author ID/name/email. The N=10 generator creates eleven items,
including its final declined fixture. Similar genuine reports are excluded.
Reports or comments attached to a fixture remain available to the owner.

## Apply to the correct account

Run from `care/` using an authenticated Cloudflare account. Verify the
configured D1 database is `realmwright-care` and its ID is
`4d9ddc05-5e6f-4a56-b657-31a52ed99209` before a remote write.

1. Export a backup with `npx wrangler d1 export realmwright-care --remote --output care-before-cleanup.sql`.
2. Review pending migrations with `npx wrangler d1 migrations list realmwright-care --remote`.
3. If 0005 is the only pending migration, run `npm run migrate:remote`.
   Review any earlier pending migrations separately; do not apply unrelated changes blindly.
4. Confirm the matching items now have `held=1`; confirm genuine item counts
   and all report/comment/vote rows are unchanged.
5. Verify the public board, Shipped and Declined filters, search, and direct
   item links. The board response uses a 60-second cache plus a 120-second
   stale-while-revalidate window, so old cards can remain briefly.

If a supposed fixture fails the strict predicate, inspect its provenance
before changing the predicate. Never broaden this to deleting all items or
hiding every title containing the word "seeded".

## Restore and test

Owner Desk → Held → Approve restores an individual item through the existing
moderation workflow. No deleted records need reconstruction.

Run `python3 -m unittest discover -s tests -p 'test_seed_cleanup.py' -v`.
Tests exercise the actual migration against the original SQLite schema,
including preservation of a real comment/report attached to a fixture,
similar real requests, older seed authors, reruns, and restoration.

The migration does not prevent deliberately running `seed:local` afterward;
that command remains explicitly local. Do not copy local seed SQL into a
production database.
