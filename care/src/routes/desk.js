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
  if (!session || session.sub !== env.OWNER_SUB) {
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
  const facts = results.map((r) => { try { const p = JSON.parse(r.payload); return { symptom: p.symptom, frequency: p.frequency, detail: p.symptom_detail, expected: p.expected, actual: p.actual }; } catch { return {}; } });
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
  return {
    item,
    reports: reports.map((r) => ({
      id: r.id, name: r.name, email: r.email, held: r.held, createdAt: r.created_at,
      payload: safeParse(r.payload),
    })),
  };
}

// ---- actions --------------------------------------------------------------
async function deskAction(request, env, itemId, action) {
  let body = {};
  try { body = await request.json(); } catch {}

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
    await env.DB.prepare('UPDATE items SET pinned = ?1 WHERE id = ?2').bind(body.pinned ? 1 : 0, itemId).run();
    await logAction(env, body.pinned ? 'pin' : 'unpin', itemId, null);
    return deskJson({ ok: true });
  }

  if (action === 'hide') {
    await env.DB.prepare('UPDATE items SET held = ?1 WHERE id = ?2').bind(body.hidden ? 1 : 0, itemId).run();
    await logAction(env, body.hidden ? 'hide' : 'unhide', itemId, null);
    return deskJson({ ok: true });
  }

  if (action === 'remove') {
    // soft-remove: hold it out of public view (kept for audit).
    await env.DB.prepare('UPDATE items SET held = 1 WHERE id = ?1').bind(itemId).run();
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
  if (!Number.isInteger(winnerId) || winnerId === loserId) return jsonError(400, 'Bad merge target.');
  const winner = await env.DB.prepare('SELECT id FROM items WHERE id = ?1').bind(winnerId).first();
  const loser = await env.DB.prepare('SELECT id, merged_into FROM items WHERE id = ?1').bind(loserId).first();
  if (!winner || !loser) return jsonError(404, 'Item not found.');
  if (loser.merged_into) return jsonError(409, 'Already merged.');

  // Move votes: insert loser's votes onto the winner, skipping any voter who
  // already voted on the winner (their existing stance wins — one vote per
  // identity). Keep created_at so velocity stays truthful.
  await env.DB.prepare(
    `INSERT OR IGNORE INTO votes (item_id, user_sub, value, created_at)
     SELECT ?1, user_sub, value, created_at FROM votes WHERE item_id = ?2`
  ).bind(winnerId, loserId).run();
  // Remove the loser's now-duplicated vote rows.
  await env.DB.prepare('DELETE FROM votes WHERE item_id = ?1').bind(loserId).run();
  // Re-point reports and comments to the winner.
  await env.DB.prepare('UPDATE reports SET item_id = ?1 WHERE item_id = ?2').bind(winnerId, loserId).run();
  await env.DB.prepare('UPDATE comments SET item_id = ?1 WHERE item_id = ?2').bind(winnerId, loserId).run();

  // Recompute the winner's denormalized counters from raw rows (no drift).
  await recomputeCounts(env, winnerId);
  // Mark the loser merged (its page 301s to the winner).
  await env.DB.prepare('UPDATE items SET merged_into = ?1, held = 0 WHERE id = ?2').bind(winnerId, loserId).run();
  await logAction(env, 'merge', loserId, 'into ' + winnerId);
  return deskJson({ ok: true, winnerId });
}

async function recomputeCounts(env, itemId) {
  const agree = await env.DB.prepare('SELECT COUNT(*) AS n FROM votes WHERE item_id = ?1 AND value = 1').bind(itemId).first();
  const disagree = await env.DB.prepare('SELECT COUNT(*) AS n FROM votes WHERE item_id = ?1 AND value = -1').bind(itemId).first();
  const reports = await env.DB.prepare('SELECT COUNT(*) AS n FROM reports WHERE item_id = ?1').bind(itemId).first();
  const comments = await env.DB.prepare('SELECT COUNT(*) AS n FROM comments WHERE item_id = ?1 AND deleted = 0').bind(itemId).first();
  await env.DB.prepare('UPDATE items SET agree_count = ?1, disagree_count = ?2, reports_count = ?3, comments_count = ?4 WHERE id = ?5')
    .bind(agree.n, disagree.n, reports.n, comments.n, itemId).run();
}

async function deskBan(env, sub) {
  await env.DB.prepare('UPDATE users SET banned = 1 WHERE sub = ?1').bind(sub).run();
  await logAction(env, 'ban', null, sub);
  return deskJson({ ok: true });
}

async function deskBrief(request, env) {
  let body = {};
  try { body = await request.json(); } catch {}
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
