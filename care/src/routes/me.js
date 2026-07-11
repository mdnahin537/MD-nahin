import { getSession } from '../lib/auth.js';
import { json } from '../lib/http.js';

/** GET /api/me — session probe. Used by the board/wizard to know login state without a redirect. */
export async function handleGetMe(request, env, url) {
  const session = await getSession(request, env);
  if (!session) return json({ loggedIn: false });
  return json({
    loggedIn: true,
    name: session.name,
    avatar: session.avatar,
    isOwner: session.sub === env.OWNER_SUB,
  });
}

// Stay comfortably under D1's 100-bound-parameter cap per query — one slot
// is reserved for user_sub, so the item-id list must leave headroom.
const MAX_VOTE_IDS = 90;

/**
 * GET /api/me/votes?ids=1,2,3 — the viewer's own vote value for a bounded
 * set of items, resolved via a SEPARATE authenticated call from the public
 * feed. The board (design §6.3) is edge-cached 60s and shared across every
 * anonymous reader; baking a per-user vote into that response would either
 * leak one user's ballot to everyone sharing the cache entry, or force the
 * feed to stop being cacheable at all. This response is never written to
 * `caches.default` and is marked non-cacheable, so it can carry per-user
 * data safely. Mirrors how the item page (`routes/item.js`) resolves
 * `myVote`, just batched for many items at once.
 *
 * Each vote carries its own `createdAt` so the client can tell whether the
 * (possibly up-to-60s-stale) cached feed snapshot it already rendered was
 * generated BEFORE or AFTER this vote — i.e. whether the snapshot's net
 * already counts it. See board.js's syncMyVotes for the read side.
 */
export async function handleGetMyVotes(request, env, url) {
  const headers = { 'Cache-Control': 'private, no-store' };
  const session = await getSession(request, env);
  if (!session) return json({ votes: {} }, 200, headers);

  const ids = [...new Set(
    (url.searchParams.get('ids') || '')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isInteger(n) && n > 0)
  )].slice(0, MAX_VOTE_IDS);

  if (ids.length === 0) return json({ votes: {} }, 200, headers);

  const placeholders = ids.map((_, i) => `?${i + 2}`).join(',');
  const { results } = await env.DB.prepare(
    `SELECT item_id, value, created_at FROM votes WHERE user_sub = ?1 AND item_id IN (${placeholders})`
  ).bind(session.sub, ...ids).all();

  const votes = {};
  for (const row of results) votes[row.item_id] = { value: row.value, createdAt: row.created_at };
  return json({ votes }, 200, headers);
}
