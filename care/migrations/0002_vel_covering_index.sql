-- Covering index for the feed's velocity query (design §6.1):
--   SELECT item_id, SUM(...) FROM votes WHERE created_at >= ? GROUP BY item_id
-- On a mature board the votes table is unbounded and this 7-day-window
-- aggregate is the single hottest read on every feed compute. With
-- created_at leading and (item_id, value) also in the index, SQLite can
-- satisfy the whole query index-only — no row lookups — which is what
-- keeps feed compute under the §10 Phase-1 <50ms budget at scale.
CREATE INDEX IF NOT EXISTS votes_vel_covering ON votes(created_at, item_id, value);

-- The single-column votes(created_at) index is now redundant: the covering
-- index above serves every created_at range scan its prefix would have.
DROP INDEX IF EXISTS votes_by_created_at;
