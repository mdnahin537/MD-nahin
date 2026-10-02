import { visibleItemGuard, changedBoardItem } from '../lib/board-writes.js';
import { getSession } from '../lib/auth.js';
import { json, jsonError } from '../lib/http.js';
import {
  isValidArea, isValidPart, loadTaxonomy,
  isValidSymptom, isValidSymptomDetail, isValidFrequency, isValidIdeaKind, isValidImportance,
} from '../lib/taxonomy.js';
import { checkReportLimit } from '../lib/ratelimit.js';
import { isHeld } from '../lib/blocklist.js';
import { buildVoteStatements } from '../lib/votes.js';
import { composeTitle } from '../lib/titles.js';
import { detectGaps, buildFollowupQuestion } from '../lib/followup.js';

import { readCareJson, careRequestHash } from '../lib/http.js';
import { careContext } from '../lib/notifications.js';

const ONE_LINE_MAX = 300;
const TEXTAREA_MAX = 2e3;
function clip(str, max) {
  if (typeof str !== "string") return "";
  const trimmed = str.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}
function allFreeText(body) {
  return [body.expected, body.actual, body.freetext, body.ask, body.why, body.doneLooksLike].filter(Boolean).join("\n");
}
function buildContract(body) {
  const ctx = body.ctx && typeof body.ctx === "object" ? body.ctx : {};
  const clientCtx = body.clientCtx && typeof body.clientCtx === "object" ? body.clientCtx : {};
  const contract = {
    type: body.type,
    area: body.area,
    part: body.part || null,
    symptom: body.type === "bug" ? body.symptom || null : null,
    symptom_detail: body.type === "bug" ? body.symptomDetail || null : null,
    frequency: body.type === "bug" ? body.frequency || null : null,
    expected: body.type === "bug" ? clip(body.expected, ONE_LINE_MAX) : null,
    actual: body.type === "bug" ? clip(body.actual, ONE_LINE_MAX) : null,
    freetext: body.type === "bug" ? clip(body.freetext, TEXTAREA_MAX) : "",
    importance: body.type === "idea" ? body.importance || null : null,
    ctx: {
      v: careContext(ctx.v),
      schema: careContext(ctx.schema),
      build: typeof ctx.build === 'string' ? careContext(ctx.build) : null,
      mode: typeof ctx.mode === 'string' ? careContext(ctx.mode) : null,
      theme: typeof ctx.theme === 'string' ? careContext(ctx.theme) : null,
      ai: typeof ctx.ai === 'string' ? careContext(ctx.ai) : null,
      os: typeof clientCtx.os === 'string' ? careContext(clientCtx.os,80) : null,
      browser: typeof clientCtx.browser === 'string' ? careContext(clientCtx.browser,80) : null,
      screen: typeof clientCtx.screen === 'string' ? careContext(clientCtx.screen,80) : null,
      lang: typeof clientCtx.lang === 'string' ? careContext(clientCtx.lang,80) : null
    },
    followups: []
  };
  if (body.type === "idea") {
    contract.ideaKind = body.ideaKind || null;
    contract.ask = clip(body.ask, ONE_LINE_MAX);
    contract.why = clip(body.why, ONE_LINE_MAX);
    contract.doneLooksLike = clip(body.doneLooksLike, ONE_LINE_MAX);
  }
  return contract;
}


async function savedSubmission(env, sub, key, hash) {
  if (!key) return null;
  const row = await env.DB.prepare(`SELECT r.id, r.item_id, r.held AS report_held, r.submission_hash,
      i.title, i.held AS item_held
    FROM reports r JOIN items i ON i.id=r.item_id
    WHERE r.user_sub=?1 AND r.submission_key=?2`).bind(sub, key).first();
  if (!row) return null;
  if (row.submission_hash !== hash) return jsonError(409, 'This draft changed after it was saved. Start a new submission.');
  return json({ ok: true, itemId: row.item_id, reportId: row.id, title: row.title,
    held: !!(row.report_held || row.item_held), retried: true });
}

export async function handlePostReport(request, env, url) {
  const session = await getSession(request, env);
  if (!session) return jsonError(401, "Sign in to send a report.");
  const user = await env.DB.prepare("SELECT banned FROM users WHERE sub = ?1").bind(session.sub).first();
  if (user && user.banned) return jsonError(403, "This account can no longer post to the board.");
  let body;
  try {
    body = await readCareJson(request);
  } catch {
    return jsonError(400, "Malformed request body.");
  }
  if (!["bug", "idea"].includes(body.type)) return jsonError(400, 'type must be "bug" or "idea".');
  if (!await isValidArea(env, body.area)) return jsonError(400, "That area isn't recognized.");
  if (!await isValidPart(env, body.area, body.part)) return jsonError(400, "That part isn't recognized for this area.");
  if (body.type === "bug") {
    if (!await isValidSymptom(env, body.area, body.symptom)) return jsonError(400, "That symptom isn't recognized.");
    if (!await isValidSymptomDetail(env, body.area, body.symptom, body.symptomDetail)) return jsonError(400, "That symptom detail isn't recognized.");
    if (!await isValidFrequency(env, body.frequency)) return jsonError(400, "That frequency isn't recognized.");
  } else {
    if (!await isValidIdeaKind(env, body.ideaKind)) return jsonError(400, "That idea type isn't recognized.");
    if (!await isValidImportance(env, body.importance)) return jsonError(400, "That importance isn't recognized.");
  }
  const mode = body.mode === "join" ? "join" : "create";
  if (mode === "join" && !Number.isInteger(body.joinItemId)) {
    return jsonError(400, "joinItemId is required to join an existing report.");
  }
  const contract = buildContract(body);
  if (body.type === 'idea' && mode === 'create' && !contract.ask) {
    return jsonError(400, 'Tell Hunter what the idea should do.');
  }
  const key = body.submissionKey ?? null;
  if (key !== null && (typeof key !== 'string' || !/^[A-Za-z0-9_-]{16,80}$/.test(key))) {
    return jsonError(400, 'Submission retry key is invalid.');
  }
  const fingerprint = key ? await careRequestHash({
    mode, joinItemId: mode === 'join' ? body.joinItemId : null,
    title: clip(body.title, ONE_LINE_MAX), contract,
  }) : null;
  const previous = await savedSubmission(env, session.sub, key, fingerprint);
  if (previous) return previous;
  const limitCheck = await checkReportLimit(env, session.sub);
  if (!limitCheck.allowed) return jsonError(429, limitCheck.message);
  const now = Math.floor(Date.now() / 1e3);
  const combinedText = [clip(body.title, ONE_LINE_MAX), allFreeText(contract)].join("\n");
  const textIsHeld = combinedText ? await isHeld(env, combinedText) : false;
  if (mode === "join") {
    const item = await env.DB.prepare("SELECT id, type, area, merged_into, held FROM items WHERE id = ?1").bind(body.joinItemId).first();
    if (!item || item.held) return jsonError(404, "That report doesn't exist.");
    if (item.merged_into) {
      return json({ error: "That report was merged into another one.", mergedInto: item.merged_into }, 409);
    }
    if (item.type !== body.type || item.area !== body.area) return jsonError(400, "Choose a matching report in the same area.");
    const reportInsert2 = env.DB.prepare(
      `INSERT INTO reports (item_id, user_sub, payload, created_at, held, submission_key, submission_hash)
       SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7 WHERE ${visibleItemGuard} RETURNING id`
    ).bind(item.id, session.sub, JSON.stringify(contract), now, textIsHeld ? 1 : 0, key, fingerprint);
    const batch = [reportInsert2];
    if (!textIsHeld) {
      const { statements: voteStatements2 } = await buildVoteStatements(env, item.id, session.sub, 1);
      batch.push(
        env.DB.prepare(`UPDATE items SET reports_count = reports_count + 1 WHERE id = ?1 AND ${visibleItemGuard}`).bind(item.id),
        ...voteStatements2
      );
    }
    let saved;
    try { saved = await env.DB.batch(batch); }
    catch (error) {
      const previous = await savedSubmission(env, session.sub, key, fingerprint);
      if (previous) return previous;
      throw error;
    }
    const reportIdRow2 = saved[0].results?.[0];
    if (!reportIdRow2) return changedBoardItem(env, item.id);
    return json({ ok: true, itemId: item.id, reportId: reportIdRow2?.id ?? null, joined: true, held: !!textIsHeld });
  }
  const taxonomy = await loadTaxonomy(env);
  const areaObj = taxonomy.areas.find((a) => a.key === body.area) || (taxonomy.ideaExtraTile.key === body.area ? taxonomy.ideaExtraTile : null);
  const areaLabel = areaObj ? areaObj.label : body.area;
  const title = clip(body.title, ONE_LINE_MAX) || composeTitle({
    type: body.type,
    areaLabel,
    symptom: contract.symptom,
    frequency: contract.frequency,
    ask: contract.ask
  });
  // One transaction: a failed report cannot leave an empty public item.
  const itemInsert = env.DB.prepare(`INSERT INTO items (type,area,part,title,status,created_at,created_by,held)
    VALUES (?1,?2,?3,?4,'open',?5,?6,?7) RETURNING id`)
    .bind(body.type,body.area,body.part||null,title,now,session.sub,textIsHeld?1:0);
  const reportInsert=env.DB.prepare(`INSERT INTO reports (item_id,user_sub,payload,created_at,held,submission_key,submission_hash)
    VALUES (last_insert_rowid(),?1,?2,?3,0,?4,?5) RETURNING id,item_id`)
    .bind(session.sub,JSON.stringify(contract),now,key,fingerprint);
  const latest="(SELECT item_id FROM reports WHERE user_sub=?1 ORDER BY id DESC LIMIT 1)";
  const batch=[itemInsert,reportInsert,
    env.DB.prepare(`UPDATE items SET reports_count=1 WHERE id=${latest}`).bind(session.sub)];
  if (!textIsHeld) {
    batch.push(env.DB.prepare(`INSERT INTO votes (item_id,user_sub,value,created_at) VALUES (${latest},?1,1,?2)`).bind(session.sub,now),
      env.DB.prepare(`INSERT INTO vote_events (item_id,user_sub,value,created_at) VALUES (${latest},?1,1,?2)`).bind(session.sub,now),
      env.DB.prepare(`UPDATE items SET agree_count=1 WHERE id=${latest}`).bind(session.sub));
  }
  let saved;
  try { saved = await env.DB.batch(batch); }
  catch (error) {
    const previous = await savedSubmission(env, session.sub, key, fingerprint);
    if (previous) return previous;
    throw error;
  }
  const itemId=saved[0].results[0].id, reportId=saved[1].results[0].id;
  return json({ok:true,itemId,reportId,title,held:!!textIsHeld});
}
export async function handlePatchFollowup(request, env, url, reportId) {
  const session = await getSession(request, env);
  if (!session) return jsonError(401, "Sign in required.");
  const user = await env.DB.prepare("SELECT banned FROM users WHERE sub = ?1").bind(session.sub).first();
  if (user && user.banned) return jsonError(403, "This account can no longer post to the board.");
  const report = await env.DB.prepare("SELECT id, user_sub, payload FROM reports WHERE id = ?1").bind(reportId).first();
  if (!report) return jsonError(404, "Report not found.");
  if (report.user_sub !== session.sub) return jsonError(403, "Only the reporter can answer this.");
  let body;
  try {
    body = await readCareJson(request);
  } catch {
    return jsonError(400, "Malformed request body.");
  }
  if (typeof body.q !== "string" || typeof body.a !== "string") {
    return jsonError(400, "Expected { q, a }.");
  }
  const payload = JSON.parse(report.payload);
  payload.followups = Array.isArray(payload.followups) ? payload.followups : [];
  const same=payload.followups.find(f=>f.q===body.q);
  if (same) return same.a===body.a ? json({ok:true}) : jsonError(409,"This question already has an answer.");
  if (payload.followups.length >= 2) return jsonError(400,"This report already has its follow-up answers.");
  const question=detectGaps(payload).find(q=>q.q===body.q);
  if (!question || !question.options.some(o=>o.key===body.a)) return jsonError(400,"Choose one of the offered answers.");
  payload.followups.push({q:body.q,a:body.a});
  // D1 change metadata includes the email trigger; the returned report row is
  // the acknowledgement that this conditional update actually succeeded.
  const saved=await env.DB.prepare("UPDATE reports SET payload=?1 WHERE id=?2 AND payload=?3 RETURNING id")
    .bind(JSON.stringify(payload),reportId,report.payload).first();
  if (!saved) return jsonError(409,"Another answer was saved. Please try again.");
  return json({ok:true});
}
export async function handleGetFollowupQuestion(request, env, url, reportId) {
  const session = await getSession(request, env);
  if (!session) return jsonError(401, "Sign in required.");
  const user = await env.DB.prepare("SELECT banned FROM users WHERE sub = ?1").bind(session.sub).first();
  if (user && user.banned) return jsonError(403, "This account can no longer post to the board.");
  const report = await env.DB.prepare("SELECT user_sub, payload FROM reports WHERE id = ?1").bind(reportId).first();
  if (!report) return jsonError(404, "Report not found.");
  if (report.user_sub !== session.sub) return jsonError(403, "Only the reporter can see this.");
  let payload;
  try {
    payload = JSON.parse(report.payload);
  } catch {
    return json({ question: null });
  }
  const alreadyAsked = Array.isArray(payload.followups) ? payload.followups.map((f) => f.q) : [];
  const result = await buildFollowupQuestion(env, payload, alreadyAsked, null);
  return json(result);
}

