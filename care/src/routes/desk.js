import { readCareJson } from '../lib/http.js';
import { getSession } from '../lib/auth.js';
import { json, jsonError, notFound } from '../lib/http.js';
import { deterministicDigest, deskSummary, decisionQueue, buildBriefData, renderBriefText } from '../lib/desk.js';
import { runText } from '../lib/ai.js';

const VEL_WINDOW_DAYS = 7;

// Every desk route passes through this gate. A non-owner — signed in or not —
// gets the plain public 404, so the desk is invisible, not merely locked
// (design §7). Returns the session on success, or a Response to return.
async function requireOwner(request, env) {
  const session = await getSession(request, env);
  if (!session || !session.isOwner) {
    return { ok: false, response: await notFound(env) };
  }
  return { ok: true, session };
}

async function velocityMap(env) {
  const windowStart = Math.floor(Date.now() / 1000) - VEL_WINDOW_DAYS * 86400;
  const { results } = await env.DB.prepare(
    `SELECT item_id, SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) - SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) AS vel
     FROM votes WHERE created_at >= ?1 GROUP BY item_id`
  ).bind(windowStart).all();
  const map = new Map();
  for (const r of results) map.set(r.item_id, r.vel);
  return map;
}

async function logAction(env, action, itemId, detail) {
  await env.DB.prepare('INSERT INTO owner_log (at, action, item_id, detail) VALUES (?1, ?2, ?3, ?4)')
    .bind(Math.floor(Date.now() / 1000), action, itemId || null, detail || null).run();
}

// The desk serves the owner's own email visibility etc.; never edge-cache it.
function deskJson(data, status = 200) {
  return json(data, status, { 'Cache-Control': 'private, no-store' });
}

export async function routeDeskApi(request, env, url) {
  const gate = await requireOwner(request, env);
  if (!gate.ok) return gate.response;
  const { pathname } = url;
  const method = request.method;

  const reviewMatch = pathname.match(/^\/api\/desk\/review\/(item|report|comment)\/(\d+)$/);
  if (reviewMatch && ['GET', 'POST'].includes(method)) {
    return deskReview(request, env, reviewMatch[1], Number(reviewMatch[2]));
  }

  if (pathname === '/api/desk/notifications' && ['GET', 'POST'].includes(method)) {
    if (method === 'POST') {
      await env.DB.prepare("UPDATE care_mail_outbox SET state='pending',next_attempt_at=0 WHERE state='failed'").run();
    }
    const rows = await env.DB.prepare("SELECT state,COUNT(*) AS count FROM care_mail_outbox GROUP BY state").all();
    return deskJson({ enabled: env.CARE_MAIL_ENABLED === 'true', counts: rows.results });
  }

  if (method === 'GET' && pathname === '/api/desk/summary') {
    const lastVisit = Number(url.searchParams.get('since')) || Math.floor(Date.now() / 1000) - 7 * 86400;
    const summary = await deskSummary(env, lastVisit);
    const usage = await todayUsage(env);
    const lastDigest = await env.DB.prepare('SELECT created_at FROM digests ORDER BY created_at DESC LIMIT 1').first();
    return deskJson({ summary, usage, lastDigestAt: lastDigest?.created_at || null });
  }

  if (pathname === '/api/desk/digest') {
    const vel = await velocityMap(env);
    if (method === 'POST') {
      // refresh: recompute deterministic digest + (optional) AI synthesis, cache it
      return deskJson(await computeDigest(env, vel, true));
    }
    // GET: serve cached if fresh, else compute
    return deskJson(await computeDigest(env, vel, false));
  }

  if (method === 'GET' && pathname === '/api/desk/queue') {
    const vel = await velocityMap(env);
    const queue = await decisionQueue(env, vel);
    return deskJson({ queue });
  }

  if (method === 'GET' && pathname.match(/^\/api\/desk\/item\/\d+$/)) {
    const id = Number(pathname.split('/').pop());
    return deskJson(await deskItemDetail(env, id));
  }

  // owner actions
  const actionMatch = pathname.match(/^\/api\/desk\/item\/(\d+)\/(status|note|pin|hide|merge|remove)$/);
  if (method === 'POST' && actionMatch) {
    return deskAction(request, env, Number(actionMatch[1]), actionMatch[2]);
  }

  const banMatch = pathname.match(/^\/api\/desk\/user\/([^/]+)\/ban$/);
  if (method === 'POST' && banMatch) {
    return deskBan(env, decodeURIComponent(banMatch[1]));
  }

  if (method === 'POST' && pathname === '/api/desk/brief') {
    return deskBrief(request, env);
  }

  return jsonError(404, 'Not found.');
}

// ---- digest with AI layer + cache ----------------------------------------
async function computeDigest(env, vel, forceRefresh) {
  const areas = await deterministicDigest(env, vel);
  // content hash over the deterministic shape — if unchanged and not forced,
  // reuse the cached AI synthesis so we never spend neurons for nothing.
  const hashSource = JSON.stringify(areas.map((a) => [a.area, a.threads, a.reports, a.net, a.topThreads.map((t) => [t.id, t.net, t.reportsCount])]));
  const contentHash = await sha256(hashSource);

  if (!forceRefresh) {
    const cached = await env.DB.prepare('SELECT body FROM digests WHERE scope = ?1 AND content_hash = ?2 ORDER BY created_at DESC LIMIT 1')
      .bind('digest', contentHash).first();
    if (cached) {
      try { return { areas, synthesis: JSON.parse(cached.body), cached: true }; } catch {}
    }
  }

  // AI synthesis: one grounded sentence per hot thread. Stubbed down locally
  // -> synthesis is empty and the deterministic digest stands alone.
  const synthesis = {};
  const hotThreads = [];
  for (const a of areas) for (const t of a.topThreads) if (t.reportsCount >= 3 || t.vel >= 3) hotThreads.push({ area: a.area, ...t });
  for (const t of hotThreads.slice(0, 12)) {
    const sentence = await synthesizeThread(env, t);
    if (sentence) synthesis[t.id] = sentence;
  }

  if (Object.keys(synthesis).length > 0) {
    await env.DB.prepare('INSERT INTO digests (scope, content_hash, body, created_at) VALUES (?1, ?2, ?3, ?4)')
      .bind('digest', contentHash, JSON.stringify(synthesis), Math.floor(Date.now() / 1000)).run();
    await bumpUsage(env, 'ai', hotThreads.length);
  }

  return { areas, synthesis, cached: false };
}

async function synthesizeThread(env, thread) {
  // Pull this thread's reports and ask for ONE quantified sentence, grounded
  // only in them. If AI is unavailable, returns null (no synthesis shown).
  const { results } = await env.DB.prepare(
    'SELECT payload FROM reports WHERE item_id = ?1 AND held = 0 LIMIT 30'
  ).bind(thread.id).all();
  const facts = results.map((r) => { try { const p = JSON.parse(r.payload); return { type: p.type, symptom: p.symptom, frequency: p.frequency, detail: p.symptom_detail, expected: p.expected, actual: p.actual, freetext: p.freetext, ideaKind: p.ideaKind, ask: p.ask, why: p.why, doneLooksLike: p.doneLooksLike, importance: p.importance, followups: p.followups }; } catch { return {}; } });
  const prompt =
    `You are summarizing ${facts.length} bug/feature reports for one thread. Write ONE sentence, max 30 words, ` +
    `quantified ("N of ${facts.length} say…"), grounded ONLY in this data, no invention:\n` +
    JSON.stringify(facts);
  return runText(env, prompt, {
    system: 'You output exactly one grounded, quantified sentence. Never invent facts not present in the data.',
    maxTokens: 80,
  });
}

// ---- item detail (owner view — includes email) ---------------------------
async function deskItemDetail(env, id) {
  const item = await env.DB.prepare('SELECT * FROM items WHERE id = ?1').bind(id).first();
  if (!item) return { error: 'not found' };
  const { results: reports } = await env.DB.prepare(
    `SELECT r.id, r.payload, r.created_at, r.held, u.name, u.email
     FROM reports r JOIN users u ON u.sub = r.user_sub WHERE r.item_id = ?1 ORDER BY r.created_at ASC`
  ).bind(id).all();
  const { results: comments } = await env.DB.prepare(
    `SELECT c.*,u.name,u.email FROM comments c LEFT JOIN users u ON u.sub=c.user_sub
      WHERE c.item_id=?1 ORDER BY c.id`).bind(id).all();
  return {
    item,
    comments,
    reports: reports.map((r) => ({
      id: r.id, name: r.name, email: r.email, held: r.held, createdAt: r.created_at,
      payload: safeParse(r.payload),
    })),
  };
}

// ---- actions --------------------------------------------------------------
async function deskAction(request, env, itemId, action) {
  let body = {};
  try { body = await readCareJson(request); } catch { return jsonError(400, 'Malformed request body.'); }

  const item = await env.DB.prepare('SELECT id, status, merged_into FROM items WHERE id = ?1').bind(itemId).first();
  if (!item) return jsonError(404, 'Item not found.');

  if (action === 'status') {
    const status = body.status;
    if (!['open', 'planned', 'in_progress', 'shipped', 'declined'].includes(status)) return jsonError(400, 'Bad status.');
    const now = Math.floor(Date.now() / 1000);
    const noteAt = body.note ? now : null;
    await env.DB.prepare('UPDATE items SET status = ?1, owner_note = COALESCE(?2, owner_note), owner_note_at = COALESCE(?3, owner_note_at) WHERE id = ?4')
      .bind(status, body.note ?? null, noteAt, itemId).run();
    await logAction(env, 'status:' + status, itemId, body.note || null);
    return deskJson({ ok: true });
  }

  if (action === 'note') {
    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare('UPDATE items SET owner_note = ?1, owner_note_at = ?2 WHERE id = ?3')
      .bind(body.note || null, body.note ? now : null, itemId).run();
    await logAction(env, 'note', itemId, body.note || null);
    return deskJson({ ok: true });
  }

  if (action === 'pin') {
    if (typeof body.pinned !== 'boolean') return jsonError(400, 'Choose pin or unpin.');
    await env.DB.prepare('UPDATE items SET pinned = ?1 WHERE id = ?2').bind(body.pinned ? 1 : 0, itemId).run();
    await logAction(env, body.pinned ? 'pin' : 'unpin', itemId, null);
    return deskJson({ ok: true });
  }

  if (action === 'hide') {
    if (typeof body.hidden !== 'boolean') return jsonError(400, 'Choose hide or publish.');
    await env.DB.prepare('UPDATE items SET held = ?1, moderation_reviewed_at = NULL WHERE id = ?2').bind(body.hidden ? 1 : 0, itemId).run();
    await logAction(env, body.hidden ? 'hide' : 'unhide', itemId, null);
    return deskJson({ ok: true });
  }

  if (action === 'remove') {
    // soft-remove: hold it out of public view (kept for audit).
    await env.DB.prepare('UPDATE items SET held = 1, moderation_reviewed_at = CAST(strftime('%s','now') AS INTEGER) WHERE id = ?1').bind(itemId).run();
    await logAction(env, 'remove', itemId, null);
    return deskJson({ ok: true });
  }

  if (action === 'merge') {
    return deskMerge(env, itemId, Number(body.intoId));
  }

  return jsonError(400, 'Unknown action.');
}

// Merge loser (itemId) INTO winner (intoId). Advisor 2b: the raw vote ROWS
// must move, not just the counters — otherwise the winner's 7-day velocity
// (computed from votes.created_at) undercounts every voter who came in via the
// loser. We union voters (winner's own vote wins on conflict, preserving the
// PK one-vote rule), re-point reports, then RECOMPUTE the winner's denormalized
// counts from the now-merged raw rows so counters and rows can't drift.
async function deskMerge(env, loserId, winnerId) {
  if (!Number.isSafeInteger(winnerId) || winnerId <= 0 || winnerId === loserId) return jsonError(400, 'Bad merge target.');
  const winner = await env.DB.prepare('SELECT id, type, merged_into FROM items WHERE id = ?1').bind(winnerId).first();
  const loser = await env.DB.prepare('SELECT id, type, merged_into FROM items WHERE id = ?1').bind(loserId).first();
  if (!winner || !loser) return jsonError(404, 'Item not found.');
  if (winner.merged_into || loser.merged_into) return jsonError(409, 'Choose two unmerged items.');
  if (winner.type !== loser.type) return jsonError(400, 'Merge bug reports with bugs, and ideas with ideas.');

  // Each write checks the pair inside one D1 transaction. A concurrent merge
  // that wins before this batch makes every statement a no-op.
  const guard = `EXISTS (SELECT 1 FROM items src JOIN items dst ON dst.id = ?1
    WHERE src.id = ?2 AND src.merged_into IS NULL AND dst.merged_into IS NULL AND src.type = dst.type)`;
  const statement = sql => env.DB.prepare(sql).bind(winnerId, loserId);
  const results = await env.DB.batch([
    statement(`INSERT OR IGNORE INTO votes (item_id, user_sub, value, created_at)
      SELECT ?1, user_sub, value, created_at FROM votes WHERE item_id = ?2 AND ${guard}`),
    statement(`DELETE FROM votes WHERE item_id = ?2 AND ${guard}`),
    statement(`UPDATE reports SET item_id = ?1,
      held = CASE WHEN (SELECT held FROM items WHERE id = ?2) = 1 THEN 1 ELSE held END
      WHERE item_id = ?2 AND ${guard}`),
    statement(`UPDATE comments SET item_id = ?1,
      held = CASE WHEN (SELECT held FROM items WHERE id = ?2) = 1 THEN 1 ELSE held END
      WHERE item_id = ?2 AND ${guard}`),
    statement(`UPDATE items SET
      agree_count = (SELECT COUNT(*) FROM votes WHERE item_id = ?1 AND value = 1),
      disagree_count = (SELECT COUNT(*) FROM votes WHERE item_id = ?1 AND value = -1),
      reports_count = (SELECT COUNT(*) FROM reports WHERE item_id = ?1 AND held = 0),
      comments_count = (SELECT COUNT(*) FROM comments WHERE item_id = ?1 AND held = 0 AND deleted = 0)
      WHERE id = ?1 AND ${guard}`),
    statement(`INSERT INTO owner_log (at, action, item_id, detail)
      SELECT CAST(strftime('%s','now') AS INTEGER), 'merge', ?2, 'into ' || ?1 WHERE ${guard}`),
    statement(`UPDATE items SET merged_into = ?1, held = 0, agree_count = 0, disagree_count = 0,
      reports_count = 0, comments_count = 0 WHERE id = ?2 AND ${guard} RETURNING id`),
  ]);
  if (!results.at(-1).results.length) return jsonError(409, 'These items changed. Reload before merging.');
  return deskJson({ ok: true, winnerId });
}

async function deskBan(env, sub) {
  const user = await env.DB.prepare('SELECT is_owner FROM users WHERE sub=?1').bind(sub).first();
  if (!user) return jsonError(404, 'Contributor not found.');
  if (user.is_owner) return jsonError(403, 'The owner identity is protected.');
  await env.DB.prepare('UPDATE users SET banned = 1 WHERE sub = ?1 AND is_owner=0').bind(sub).run();
  await logAction(env, 'ban', null, sub);
  return deskJson({ ok: true });
}

async function deskBrief(request, env) {
  let body = {};
  try { body = await readCareJson(request); } catch {}
  const ids = Array.isArray(body.items) ? body.items.map(Number).filter(Number.isInteger) : [];
  if (ids.length === 0) return jsonError(400, 'Provide items:[...].');

  const briefs = [];
  for (const id of ids.slice(0, 5)) {
    const data = await buildBriefData(env, id);
    if (!data) continue;
    // merged children of this winner (for the board-links line)
    const { results: merged } = await env.DB.prepare('SELECT id FROM items WHERE merged_into = ?1').bind(id).all();
    briefs.push(renderBriefText(data, merged.map((m) => m.id)));
  }
  const text = briefs.join('\n\n———\n\n');
  return deskJson({ text });
}


async function deskReview(request, env, target, id) {
  const table = { item: 'items', report: 'reports', comment: 'comments' }[target];
  const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id=?1`).bind(id).first();
  if (!row || (target === 'comment' && row.deleted)) return jsonError(404, 'Saved content not found.');
  const itemId = target === 'item' ? row.id : row.item_id;
  const item = await env.DB.prepare('SELECT id,title,held,merged_into FROM items WHERE id=?1').bind(itemId).first();
  if (request.method === 'GET') {
    const details = target === 'item' ? await deskItemDetail(env, id)
      : { record: { ...row, ...(target === 'report' ? { payload: safeParse(row.payload) } : {}) }, item };
    return deskJson({ target, ...details });
  }
  let body;
  try { body = await readCareJson(request); } catch { return jsonError(400, 'Malformed review request.'); }
  if (typeof body.publish !== 'boolean') return jsonError(400, 'Choose publish or keep held.');
  if (item?.merged_into) return jsonError(409, 'Review the destination after this merge.');
  if (body.publish && target !== 'item' && item?.held) return jsonError(409, 'Publish the parent item before publishing its details.');
  const now = Math.floor(Date.now()/1000);
  const held = body.publish ? 0 : 1;
  const publishGuard = !body.publish ? '' : target === 'item' ? ' AND merged_into IS NULL'
    : ` AND EXISTS(SELECT 1 FROM items i WHERE i.id=${table}.item_id AND i.held=0 AND i.merged_into IS NULL)` +
      (target === 'comment' ? ` AND NOT EXISTS(SELECT 1 FROM comments parent WHERE parent.id=comments.parent_id AND (parent.held=1 OR parent.deleted=1))` : '');
  const update = env.DB.prepare(`UPDATE ${table} SET held=?2,moderation_reviewed_at=?3
    WHERE id=?1 AND held=?4 AND moderation_reviewed_at IS ?5${publishGuard}` +
    (target === 'item' ? '' : ' AND item_id=?6'))
    .bind(...[id,held,now,row.held,row.moderation_reviewed_at,...(target === 'item' ? [] : [itemId])]);
  const [saved] = await env.DB.batch([
    update,
    env.DB.prepare(`INSERT INTO owner_log(at,action,item_id,detail)
      SELECT ?1,?2,?3,?4 WHERE changes()=1`)
      .bind(now,body.publish?'publish:'+target:'retain:'+target,itemId,String(id)),
    env.DB.prepare(`UPDATE items SET
      reports_count=(SELECT COUNT(*) FROM reports WHERE item_id=?1 AND held=0),
      comments_count=(SELECT COUNT(*) FROM comments WHERE item_id=?1 AND held=0 AND deleted=0)
      WHERE id=?1`).bind(itemId),
  ]);
  if (saved.meta.changes !== 1) return jsonError(409, 'This content changed or its parent is held. Reload before reviewing.');
  return deskJson({ ok: true, published: body.publish, itemId });
}

// ---- usage counters (free-tier gauge, §7.1) -------------------------------
function utcDay() {
  return new Date().toISOString().slice(0, 10);
}
async function todayUsage(env) {
  const row = await env.DB.prepare('SELECT worker_requests, d1_writes, ai_neurons_calls FROM usage_counters WHERE day = ?1').bind(utcDay()).first();
  return {
    day: utcDay(),
    workerRequests: row?.worker_requests || 0,
    d1Writes: row?.d1_writes || 0,
    aiCalls: row?.ai_neurons_calls || 0,
    limits: { workerRequests: 100000, d1Writes: 100000, aiNeurons: 10000 },
  };
}
async function bumpUsage(env, kind, n) {
  const col = kind === 'ai' ? 'ai_neurons_calls' : kind === 'write' ? 'd1_writes' : 'worker_requests';
  await env.DB.prepare(
    `INSERT INTO usage_counters (day, ${col}) VALUES (?1, ?2)
     ON CONFLICT(day) DO UPDATE SET ${col} = ${col} + ?2`
  ).bind(utcDay(), n).run();
}

// ---- serve the gated desk shell (HTML/JS/CSS under /desk/) ----------------
export async function serveDeskShell(request, env, url) {
  const gate = await requireOwner(request, env);
  if (!gate.ok) return gate.response;
  let assetPath = url.pathname === '/desk' || url.pathname === '/desk/' ? '/desk/index.html' : url.pathname;
  const res = await env.ASSETS.fetch(new Request('https://internal' + assetPath));
  // Re-wrap so the desk pages are never cached anywhere.
  const headers = new Headers(res.headers);
  headers.set('Cache-Control', 'private, no-store');
  return new Response(res.body, { status: res.status, headers });
}

function safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
