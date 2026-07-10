-- RealmWright Care — initial schema (design doc §4).
-- Base tables/columns are exactly as specified. A few small, justified
-- additions are marked with "-- ADDED:" comments explaining why.

CREATE TABLE users (
  sub TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT,
  created_at INTEGER NOT NULL,
  last_seen INTEGER,
  banned INTEGER DEFAULT 0
);

CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,          -- the public serial ("#41")
  type TEXT NOT NULL CHECK(type IN ('bug','idea')),
  area TEXT NOT NULL,
  part TEXT,                                     -- taxonomy keys (§5.4)
  title TEXT NOT NULL,                           -- auto-composed, user-editable
  status TEXT NOT NULL DEFAULT 'open'
    CHECK(status IN ('open','planned','in_progress','shipped','declined')),
  created_at INTEGER NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(sub),
  pinned INTEGER DEFAULT 0,
  held INTEGER DEFAULT 0,
  merged_into INTEGER,                           -- non-NULL => hidden, redirect to target
  agree_count INTEGER DEFAULT 0,
  disagree_count INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  owner_note TEXT,
  owner_note_at INTEGER,
  -- ADDED: generated+indexed net/total. §6.1 defines net = A-D, total = A+D and
  -- every feed/lane rule (§6.2, §6.3) filters/sorts on them. Storing them as
  -- SQLite generated columns (recomputed automatically from agree/disagree_count
  -- whenever a row is written, zero extra app code) lets the feed query use a
  -- plain indexed WHERE/ORDER BY instead of recomputing an expression per row —
  -- this is what keeps §10 Phase 1's "<50ms compute at N=5,000" acceptance cheap.
  net INTEGER GENERATED ALWAYS AS (agree_count - disagree_count) STORED,
  total INTEGER GENERATED ALWAYS AS (agree_count + disagree_count) STORED
);

CREATE INDEX items_visibility ON items(held, merged_into, status);
CREATE INDEX items_area ON items(area);
CREATE INDEX items_net ON items(net);
CREATE INDEX items_total ON items(total);
CREATE INDEX items_created_at ON items(created_at);

CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id),
  user_sub TEXT NOT NULL REFERENCES users(sub),
  payload TEXT NOT NULL,                         -- the JSON contract in §5.6
  created_at INTEGER NOT NULL,
  -- ADDED: per-report hold flag. items.held gates whether a NEW item is public
  -- at all; but a JOIN onto an already-visible item whose freetext trips the
  -- blocklist must not retroactively hide every other GM's clean report on that
  -- item — only that one report's content queues for owner review (§3.4's
  -- "held items just sit" applied correctly to the join case).
  held INTEGER DEFAULT 0
);
CREATE INDEX reports_by_item ON reports(item_id);
CREATE INDEX reports_by_user_day ON reports(user_sub, created_at);

CREATE TABLE votes (
  item_id INTEGER NOT NULL,
  user_sub TEXT NOT NULL,
  value INTEGER NOT NULL CHECK(value IN (1,-1)),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (item_id, user_sub)
);
CREATE INDEX votes_by_time ON votes(item_id, created_at);
-- ADDED: supports the vel = agrees-disagrees in the last 7 days computation
-- (§6.1) as a single "WHERE created_at >= ? GROUP BY item_id" scan across all
-- items, rather than one query per item.
CREATE INDEX votes_by_created_at ON votes(created_at);

-- ADDED: append-only vote-change log, separate from the mutate-in-place
-- `votes` table (which only ever holds a user's CURRENT stance and loses
-- history on un-vote/delete). §3.4 requires a per-UTC-day COUNT of "vote
-- changes" for rate limiting (200/day) — that count is not recoverable from
-- `votes` alone once a change is undone, so a minimal log table is the
-- faithful implementation of "enforced by one COUNT query at write time."
CREATE TABLE vote_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  user_sub TEXT NOT NULL,
  value INTEGER NOT NULL,                        -- 1, -1, or 0 (0 = un-vote)
  created_at INTEGER NOT NULL
);
CREATE INDEX vote_events_by_user_day ON vote_events(user_sub, created_at);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id),
  user_sub TEXT NOT NULL,
  parent_id INTEGER,                             -- one nesting level max
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  held INTEGER DEFAULT 0,
  deleted INTEGER DEFAULT 0
);
CREATE INDEX comments_by_item ON comments(item_id);
CREATE INDEX comments_by_user_day ON comments(user_sub, created_at);

CREATE TABLE digests (                            -- Owner Desk AI cache (§7)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX digests_by_scope ON digests(scope, created_at);

CREATE TABLE owner_log (                          -- audit of owner actions
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER,
  action TEXT,
  item_id INTEGER,
  detail TEXT
);

-- ADDED: a tiny self-counter for the free-tier gauge (§7.1). Cloudflare's
-- GraphQL analytics API needs an API token + extra plumbing just to read
-- your own account back; a one-row-per-UTC-day counter incremented in the
-- same batch() as writes is simpler, needs no extra credentials, and is
-- accurate for the three numbers the header strip actually shows.
CREATE TABLE usage_counters (
  day TEXT PRIMARY KEY,                          -- 'YYYY-MM-DD' (UTC)
  worker_requests INTEGER DEFAULT 0,
  d1_writes INTEGER DEFAULT 0,
  ai_neurons_calls INTEGER DEFAULT 0
);
