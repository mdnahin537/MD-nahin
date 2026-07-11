import { getSession } from '../lib/auth.js';
import { json, jsonError } from '../lib/http.js';
import { checkVoteLimit } from '../lib/ratelimit.js';
import { castVote } from '../lib/votes.js';

/** PUT /api/vote/:item  { value: 1 | -1 | 0 } — 0 un-votes. Idempotent by design. */
export async function handlePutVote(request, env, url, itemId) {
  const session = await getSession(request, env);
  if (!session) return jsonError(401, 'Sign in to agree or disagree.');

  const user = await env.DB.prepare('SELECT banned FROM users WHERE sub = ?1').bind(session.sub).first();
  if (user && user.banned) return jsonError(403, 'This account can no longer post to the board.');

  const item = await env.DB.prepare('SELECT id, merged_into FROM items WHERE id = ?1').bind(itemId).first();
  if (!item) return jsonError(404, 'Report not found.');
  if (item.merged_into) {
    return json({ error: 'That report was merged into another one.', mergedInto: item.merged_into }, 409);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'Malformed request body.');
  }
  if (![1, -1, 0].includes(body.value)) return jsonError(400, 'value must be 1, -1, or 0.');

  const limitCheck = await checkVoteLimit(env, session.sub);
  if (!limitCheck.allowed) return jsonError(429, limitCheck.message);

  const result = await castVote(env, itemId, session.sub, body.value);
  return json({ ok: true, ...result });
}
