import { getSession } from '../lib/auth.js';
import { json } from '../lib/http.js';


export async function handleGetMe(request, env, url) {
  const session = await getSession(request, env);
  if (!session) return json({ loggedIn: false }, 200, { "Cache-Control": "private, no-store", Vary: "Cookie" });
  return json({
    loggedIn: true,
    name: session.name,
    avatar: session.avatar,
    isOwner: session.isOwner
  }, 200, { "Cache-Control": "private, no-store", Vary: "Cookie" });
}
const MAX_VOTE_IDS = 90;
export async function handleGetMyVotes(request, env, url) {
  const headers = { "Cache-Control": "private, no-store" };
  const session = await getSession(request, env);
  if (!session) return json({ votes: {} }, 200, headers);
  const ids = [...new Set(
    (url.searchParams.get("ids") || "").split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isInteger(n) && n > 0)
  )].slice(0, MAX_VOTE_IDS);
  if (ids.length === 0) return json({ votes: {} }, 200, headers);
  const placeholders = ids.map((_, i) => `?${i + 2}`).join(",");
  const { results } = await env.DB.prepare(
    `SELECT i.id AS item_id, COALESCE(v.value,0) AS value, v.created_at, i.net
     FROM items i LEFT JOIN votes v ON v.item_id=i.id AND v.user_sub=?1
     WHERE i.id IN (${placeholders}) AND i.held=0 AND i.merged_into IS NULL`
  ).bind(session.sub, ...ids).all();
  const votes = {};
  for (const row of results) votes[row.item_id] = { value: row.value, createdAt: row.created_at, net: row.net };
  return json({ votes }, 200, headers);
}

