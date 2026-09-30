import { getSession } from '../lib/auth.js';
import { json, jsonError } from '../lib/http.js';
import { checkCommentLimit } from '../lib/ratelimit.js';
import { isHeld } from '../lib/blocklist.js';

import { readCareJson, careRequestHash } from '../lib/http.js';

const BODY_MAX = 2e3;

async function savedComment(env, sub, key, hash) {
  if (!key) return null;
  const saved = await env.DB.prepare('SELECT id, held, submission_hash FROM comments WHERE user_sub=?1 AND submission_key=?2')
    .bind(sub, key).first();
  if (!saved) return null;
  if (saved.submission_hash !== hash) return jsonError(409, 'This comment changed after it was saved. Start a new comment.');
  return json({ ok: true, id: saved.id, held: !!saved.held, retried: true });
}
export async function handlePostComment(request, env, url) {
  const session = await getSession(request, env);
  if (!session) return jsonError(401, "Sign in to comment.");
  const user = await env.DB.prepare("SELECT banned FROM users WHERE sub = ?1").bind(session.sub).first();
  if (user && user.banned) return jsonError(403, "This account can no longer post to the board.");
  let payload;
  try {
    payload = await readCareJson(request);
  } catch {
    return jsonError(400, "Malformed request body.");
  }
  const itemId = Number(payload.itemId);
  const bodyText = typeof payload.body === "string" ? payload.body.trim() : "";
  if (!Number.isInteger(itemId)) return jsonError(400, "itemId is required.");
  if (!bodyText) return jsonError(400, "Comment can't be empty.");
  if (bodyText.length > BODY_MAX) return jsonError(400, `Comments are capped at ${BODY_MAX} characters.`);
  const item = await env.DB.prepare("SELECT id, merged_into, held FROM items WHERE id = ?1").bind(itemId).first();
  if (!item || item.held) return jsonError(404, "Report not found.");
  if (item.merged_into) {
    return json({ error: "That report was merged into another one.", mergedInto: item.merged_into }, 409);
  }
  let parentId = null;
  if (payload.parentId != null) {
    parentId = Number(payload.parentId);
    const parent = await env.DB.prepare("SELECT id, item_id, parent_id, held, deleted FROM comments WHERE id = ?1").bind(parentId).first();
    if (!parent || parent.held || parent.deleted || parent.item_id !== itemId) return jsonError(400, "Parent comment not found on this report.");
    if (parent.parent_id != null) return jsonError(400, "Comments can only nest one level deep.");
  }
  const key = payload.submissionKey ?? null;
  if (key !== null && (typeof key !== 'string' || !/^[A-Za-z0-9_-]{16,80}$/.test(key))) return jsonError(400, 'Comment retry key is invalid.');
  const fingerprint = key ? await careRequestHash({ itemId, body: bodyText, parentId }) : null;
  const previous = await savedComment(env, session.sub, key, fingerprint);
  if (previous) return previous;
  const limitCheck = await checkCommentLimit(env, session.sub);
  if (!limitCheck.allowed) return jsonError(429, limitCheck.message);
  const held = await isHeld(env, bodyText);
  const now = Math.floor(Date.now() / 1e3);
  const insert = env.DB.prepare(
    "INSERT INTO comments (item_id, user_sub, parent_id, body, created_at, held, submission_key, submission_hash) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) RETURNING id"
  ).bind(itemId, session.sub, parentId, bodyText, now, held ? 1 : 0, key, fingerprint);
  const statements = [insert];
  if (!held) {
    statements.push(
      env.DB.prepare("UPDATE items SET comments_count = comments_count + 1 WHERE id = ?1").bind(itemId)
    );
  }
  let saved;
  try { saved = await env.DB.batch(statements); }
  catch (error) {
    const previous = await savedComment(env, session.sub, key, fingerprint);
    if (previous) return previous;
    throw error;
  }
  const [insertResult] = saved;
  const newId = insertResult.results?.[0]?.id ?? null;
  return json({ ok: true, id: newId, held });
}

