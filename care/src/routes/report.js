import { getSession } from '../lib/auth.js';
import { json, jsonError } from '../lib/http.js';
import { isValidArea, isValidPart, loadTaxonomy } from '../lib/taxonomy.js';
import { checkReportLimit } from '../lib/ratelimit.js';
import { isHeld } from '../lib/blocklist.js';
import { buildVoteStatements } from '../lib/votes.js';
import { composeTitle } from '../lib/titles.js';

const ONE_LINE_MAX = 300;
const TEXTAREA_MAX = 2000;

function clip(str, max) {
  if (typeof str !== 'string') return '';
  const trimmed = str.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function allFreeText(body) {
  return [body.expected, body.actual, body.freetext, body.ask, body.why, body.doneLooksLike]
    .filter(Boolean)
    .join('\n');
}

/**
 * Build the §5.6 report JSON contract. Bug and idea share one envelope;
 * idea-specific fields (ideaKind/ask/why/doneLooksLike) are additions
 * beyond the design doc's bug-only worked example, kept as distinct
 * named fields rather than overloaded into bug-shaped names like
 * expected/actual — the Build Brief generator (§7.5) and any future
 * reader needs field names that mean what they say.
 */
function buildContract(body) {
  const ctx = body.ctx && typeof body.ctx === 'object' ? body.ctx : {};
  const clientCtx = body.clientCtx && typeof body.clientCtx === 'object' ? body.clientCtx : {};

  const contract = {
    type: body.type,
    area: body.area,
    part: body.part || null,
    symptom: body.type === 'bug' ? body.symptom || null : null,
    symptom_detail: body.type === 'bug' ? body.symptomDetail || null : null,
    frequency: body.type === 'bug' ? body.frequency || null : null,
    expected: body.type === 'bug' ? clip(body.expected, ONE_LINE_MAX) : null,
    actual: body.type === 'bug' ? clip(body.actual, ONE_LINE_MAX) : null,
    freetext: body.type === 'bug' ? clip(body.freetext, TEXTAREA_MAX) : '',
    importance: body.type === 'idea' ? body.importance || null : null,
    ctx: {
      v: ctx.v || null,
      schema: ctx.schema || null,
      build: ctx.build || null,
      mode: ctx.mode || null,
      theme: ctx.theme || null,
      ai: ctx.ai || null,
      os: clientCtx.os || null,
      browser: clientCtx.browser || null,
      screen: clientCtx.screen || null,
      lang: clientCtx.lang || null,
    },
    followups: [],
  };

  if (body.type === 'idea') {
    contract.ideaKind = body.ideaKind || null;
    contract.ask = clip(body.ask, ONE_LINE_MAX);
    contract.why = clip(body.why, ONE_LINE_MAX);
    contract.doneLooksLike = clip(body.doneLooksLike, ONE_LINE_MAX);
  }

  return contract;
}

export async function handlePostReport(request, env, url) {
  const session = await getSession(request, env);
  if (!session) return jsonError(401, 'Sign in to send a report.');

  const user = await env.DB.prepare('SELECT banned FROM users WHERE sub = ?1').bind(session.sub).first();
  if (user && user.banned) return jsonError(403, 'This account can no longer post to the board.');

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'Malformed request body.');
  }

  if (!['bug', 'idea'].includes(body.type)) return jsonError(400, 'type must be "bug" or "idea".');
  if (!(await isValidArea(env, body.area))) return jsonError(400, "That area isn't recognized.");
  if (!(await isValidPart(env, body.area, body.part))) return jsonError(400, "That part isn't recognized for this area.");

  const mode = body.mode === 'join' ? 'join' : 'create';
  if (mode === 'join' && !Number.isInteger(body.joinItemId)) {
    return jsonError(400, 'joinItemId is required to join an existing report.');
  }

  const limitCheck = await checkReportLimit(env, session.sub);
  if (!limitCheck.allowed) return jsonError(429, limitCheck.message);

  const contract = buildContract(body);
  const now = Math.floor(Date.now() / 1000);
  const combinedText = allFreeText(body);
  const textIsHeld = combinedText ? await isHeld(env, combinedText) : false;

  if (mode === 'join') {
    const item = await env.DB.prepare('SELECT id, type, merged_into FROM items WHERE id = ?1').bind(body.joinItemId).first();
    if (!item) return jsonError(404, "That report doesn't exist.");
    if (item.merged_into) {
      return json({ error: 'That report was merged into another one.', mergedInto: item.merged_into }, 409);
    }
    if (item.type !== body.type) return jsonError(400, "That report is a different type (bug vs. idea).");

    const { statements: voteStatements } = await buildVoteStatements(env, item.id, session.sub, 1);
    const reportInsert = env.DB.prepare(
      'INSERT INTO reports (item_id, user_sub, payload, created_at, held) VALUES (?1, ?2, ?3, ?4, ?5)'
    ).bind(item.id, session.sub, JSON.stringify(contract), now, textIsHeld ? 1 : 0);
    const countsUpdate = env.DB.prepare('UPDATE items SET reports_count = reports_count + 1 WHERE id = ?1').bind(item.id);

    await env.DB.batch([reportInsert, countsUpdate, ...voteStatements]);

    const reportIdRow = await env.DB.prepare('SELECT id FROM reports WHERE item_id = ?1 AND user_sub = ?2 ORDER BY id DESC LIMIT 1')
      .bind(item.id, session.sub)
      .first();

    return json({ ok: true, itemId: item.id, reportId: reportIdRow?.id ?? null, joined: true });
  }

  // mode === 'create'
  const taxonomy = await loadTaxonomy(env);
  const areaObj = taxonomy.areas.find((a) => a.key === body.area) ||
    (taxonomy.ideaExtraTile.key === body.area ? taxonomy.ideaExtraTile : null);
  const areaLabel = areaObj ? areaObj.label : body.area;
  const title = clip(body.title, ONE_LINE_MAX) || composeTitle({
    type: body.type,
    areaLabel,
    symptom: contract.symptom,
    frequency: contract.frequency,
    ask: contract.ask,
  });

  const itemInsert = await env.DB.prepare(
    `INSERT INTO items (type, area, part, title, status, created_at, created_by, held)
     VALUES (?1, ?2, ?3, ?4, 'open', ?5, ?6, ?7) RETURNING id`
  )
    .bind(body.type, body.area, body.part || null, title, now, session.sub, textIsHeld ? 1 : 0)
    .first();

  const itemId = itemInsert.id;
  const { statements: voteStatements } = await buildVoteStatements(env, itemId, session.sub, 1);
  const reportInsert = env.DB.prepare(
    'INSERT INTO reports (item_id, user_sub, payload, created_at, held) VALUES (?1, ?2, ?3, ?4, 0)'
  ).bind(itemId, session.sub, JSON.stringify(contract), now);
  const countsUpdate = env.DB.prepare('UPDATE items SET reports_count = reports_count + 1 WHERE id = ?1').bind(itemId);

  await env.DB.batch([reportInsert, countsUpdate, ...voteStatements]);

  return json({ ok: true, itemId, title, held: !!textIsHeld });
}

/** PATCH /api/report/:id/followup — micro-interview answers (design §5.5), author-only. */
export async function handlePatchFollowup(request, env, url, reportId) {
  const session = await getSession(request, env);
  if (!session) return jsonError(401, 'Sign in required.');

  const report = await env.DB.prepare('SELECT id, user_sub, payload FROM reports WHERE id = ?1').bind(reportId).first();
  if (!report) return jsonError(404, 'Report not found.');
  if (report.user_sub !== session.sub) return jsonError(403, 'Only the reporter can answer this.');

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'Malformed request body.');
  }
  if (typeof body.q !== 'string' || typeof body.a !== 'string') {
    return jsonError(400, 'Expected { q, a }.');
  }

  const payload = JSON.parse(report.payload);
  payload.followups = Array.isArray(payload.followups) ? payload.followups : [];
  if (payload.followups.length >= 2) {
    return jsonError(400, 'This report already has its follow-up answers.');
  }
  payload.followups.push({ q: clip(body.q, 60), a: clip(body.a, ONE_LINE_MAX) });

  await env.DB.prepare('UPDATE reports SET payload = ?1 WHERE id = ?2').bind(JSON.stringify(payload), reportId).run();
  return json({ ok: true });
}
