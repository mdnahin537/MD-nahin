import { json, jsonError } from '../lib/http.js';
import { getSession } from '../lib/auth.js';

const CACHE_TTL_SECONDS = 30;

/**
 * GET /api/item/:id — the item page data (design §6.5): the thread, its
 * roll-up of joined reports ("12 GMs report this"), the owner note, and the
 * threaded comments. Public read (no login to look). A merged item returns
 * its redirect target so the client can 301-equivalent to the winner.
 *
 * Reports show coarse context only (reporter name + version + OS family +
 * their expected/actual/freetext) — never email, never the raw ctx object's
 * finer fields beyond what §5.6 marks public.
 */
export async function handleGetItem(request, env, url, itemId) {
  const item = await env.DB.prepare(
    `SELECT id, type, area, part, title, status, created_at, agree_count, disagree_count,
       reports_count, comments_count, net, total, owner_note, owner_note_at, merged_into, held, pinned
     FROM items WHERE id = ?1`
  ).bind(itemId).first();

  if (!item || item.held) return jsonError(404, 'Report not found.');
  if (item.merged_into) {
    return json({ mergedInto: item.merged_into }, 409);
  }

  // Joined reports roll-up. Held reports are hidden from the public view.
  const { results: reportRows } = await env.DB.prepare(
    `SELECT r.id, r.payload, r.created_at, u.name AS reporter_name, u.avatar_url
     FROM reports r JOIN users u ON u.sub = r.user_sub
     WHERE r.item_id = ?1 AND r.held = 0
     ORDER BY r.created_at ASC, r.id ASC`
  ).bind(itemId).all();

  const reports = reportRows.map((r) => {
    let payload = {};
    try { payload = JSON.parse(r.payload); } catch {}
    const ctx = payload.ctx || {};
    return {
      reporterName: r.reporter_name || 'A GM',
      avatar: r.avatar_url || null,
      createdAt: r.created_at,
      // coarse context only
      version: ctx.v || null,
      os: ctx.os || null,
      browser: ctx.browser || null,
      symptom: payload.symptom || null,
      frequency: payload.frequency || null,
      expected: payload.expected || null,
      actual: payload.actual || null,
      freetext: payload.freetext || '',
      importance: payload.importance || null,
      ask: payload.ask || null,
      why: payload.why || null,
      doneLooksLike: payload.doneLooksLike || null,
    };
  });

  // Comments (one nesting level). Held/deleted are hidden; deleted authors
  // are already renamed "a GM" at the users layer if the account is gone.
  const { results: commentRows } = await env.DB.prepare(
    `SELECT c.id, c.parent_id, c.body, c.created_at, u.name AS author_name, u.avatar_url
     FROM comments c JOIN users u ON u.sub = c.user_sub
     WHERE c.item_id = ?1 AND c.held = 0 AND c.deleted = 0
     ORDER BY c.created_at ASC, c.id ASC`
  ).bind(itemId).all();

  const commentsById = new Map();
  const topLevel = [];
  for (const c of commentRows) {
    const node = {
      id: c.id,
      parentId: c.parent_id,
      body: c.body,
      createdAt: c.created_at,
      authorName: c.author_name || 'A GM',
      avatar: c.avatar_url || null,
      replies: [],
    };
    commentsById.set(c.id, node);
  }
  for (const node of commentsById.values()) {
    if (node.parentId && commentsById.has(node.parentId)) {
      commentsById.get(node.parentId).replies.push(node);
    } else {
      topLevel.push(node);
    }
  }

  // The viewer's own current vote, if signed in — lets the client show the
  // agree/disagree buttons pre-filled without a second request.
  let myVote = 0;
  const session = await getSession(request, env);
  if (session) {
    const v = await env.DB.prepare('SELECT value FROM votes WHERE item_id = ?1 AND user_sub = ?2')
      .bind(itemId, session.sub).first();
    if (v) myVote = v.value;
  }

  const body = {
    id: item.id,
    type: item.type,
    area: item.area,
    part: item.part,
    title: item.title,
    status: item.status,
    net: item.net,
    agreeCount: item.agree_count,
    disagreeCount: item.disagree_count,
    reportsCount: item.reports_count,
    commentsCount: item.comments_count,
    createdAt: item.created_at,
    ownerNote: item.owner_note || null,
    ownerNoteAt: item.owner_note_at || null,
    reports,
    comments: topLevel,
    myVote,
  };

  // Signed-in viewers get a per-user field (myVote), so don't shared-cache
  // those; anonymous reads are cacheable at the edge for 30s. `Vary: Cookie`
  // is essential: without it a browser that cached the anonymous response
  // would keep serving it (stale net, no myVote) to the SAME user after they
  // sign in and vote — because the URL is identical. Varying on Cookie means
  // the cookieless cached copy is not reused once the user has a session.
  const headers = session
    ? { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
    : { 'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`, Vary: 'Cookie' };
  return json(body, 200, headers);
}
