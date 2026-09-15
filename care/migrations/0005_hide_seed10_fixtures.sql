-- Remove the original N=10 demo fixtures from public surfaces without
-- deleting reports, votes, comments, users, or changing genuine requests.
-- scripts/seed.mjs actually creates 11 items: the final one is declined.
-- Require the original id range, generated title, and synthetic author.
-- The existing feed and item routes both exclude held items. Owner Desk
-- can restore a held item with Approve; this migration is safe to rerun.
UPDATE items
SET held = 1
WHERE held = 0
  AND id BETWEEN 1 AND 11
  AND title = area || ' — seeded ' || type || ' #' || id
  AND EXISTS (
    SELECT 1 FROM users AS author
    WHERE author.sub = items.created_by
      AND (
        (
          author.sub IN (
            'seed10-u0', 'seed10-u1', 'seed10-u2', 'seed10-u3',
            'seed10-u4', 'seed10-u5', 'seed10-u6', 'seed10-u7',
            'seed10-u8', 'seed10-u9', 'seed10-u10', 'seed10-u11',
            'seed10-u12', 'seed10-u13', 'seed10-u14', 'seed10-u15'
          )
          AND author.name = 'Seed GM seed10-' || substr(author.sub, 9)
          AND author.email = 'seed10' || substr(author.sub, 9) || '@example.test'
        )
        OR (
          -- Older seed revisions left the mock owner as created_by.
          author.sub = 'mock-owner-sub-001'
          AND author.name = 'Hunter (Owner)'
          AND author.email = 'owner@example.test'
        )
      )
  );
