// Owner Desk logic (design §7). The rule everywhere here: DETERMINISTIC
// FIRST. Every view is fully computed from SQL with zero AI; the AI layer
// only adds one synthesis sentence on top and can always be absent. This is
// why the desk "still works with zero AI" — AI makes it sing, never speaks
// for it.

import { band } from './bands.js';
import { trigramSimilarity } from './trigram.js';

const LIVE = "('open','planned','in_progress')";

// ---- §7.2 The Digest (deterministic) --------------------------------------
// Grouped by taxonomy area — grouping is free and exact because intake is
// structured. Returns area rows (counts + net) each with their top thread(s),
// every top thread carrying serial / GM count / net / velocity / version
// spread. Collapsed this is one line per active area (<= ~13 lines); expand
// reveals threads, expand again reveals raw reports (lossless chain).
export async function deterministicDigest(env, velByItem) {
  // Area rollups in one query.
  const { results: areaRows } = await env.DB.prepare(
    `SELECT area,
            COUNT(*) AS threads,
            SUM(reports_count) AS reports,
            SUM(net) AS net_sum
     FROM items
     WHERE held = 0 AND merged_into IS NULL AND status != 'declined'
     GROUP BY area
     ORDER BY net_sum DESC`
  ).all();

  // Top threads per area (up to 2), by net then reports.
  const { results: topThreads } = await env.DB.prepare(
    `SELECT id, area, part, title, status, net, reports_count, created_at
     FROM items
     WHERE held = 0 AND merged_into IS NULL AND status != 'declined'
     ORDER BY area ASC, net DESC, reports_count DESC, id ASC`
  ).all();

  const byArea = new Map();
  for (const t of topThreads) {
    if (!byArea.has(t.area)) byArea.set(t.area, []);
    const list = byArea.get(t.area);
    if (list.length < 2) {
      list.push({
        id: t.id, title: t.title, status: t.status, net: t.net,
        reportsCount: t.reports_count, vel: velByItem.get(t.id) || 0,
        band: band(t.net),
      });
    }
  }

  // Version spread for each surfaced top thread (from its reports' payloads).
  const surfacedIds = [];
  for (const list of byArea.values()) for (const t of list) surfacedIds.push(t.id);
  const versionSpread = await versionSpreadFor(env, surfacedIds);

  return areaRows.map((a) => ({
    area: a.area,
    threads: a.threads,
    reports: a.reports,
    net: a.net_sum,
    topThreads: (byArea.get(a.area) || []).map((t) => ({ ...t, versions: versionSpread.get(t.id) || {} })),
  }));
}

// Tally ctx.v across each item's reports. One query for all surfaced items.
async function versionSpreadFor(env, itemIds) {
  const map = new Map();
  if (itemIds.length === 0) return map;
  const ph = itemIds.map((_, i) => `?${i + 1}`).join(',');
  const { results } = await env.DB.prepare(
    `SELECT item_id, payload FROM reports WHERE item_id IN (${ph}) AND held = 0`
  ).bind(...itemIds).all();
  for (const r of results) {
    let v = null;
    try { v = (JSON.parse(r.payload).ctx || {}).v || null; } catch {}
    const key = v || 'unknown';
    if (!map.has(r.item_id)) map.set(r.item_id, {});
    const t = map.get(r.item_id);
    t[key] = (t[key] || 0) + 1;
  }
  return map;
}

// ---- §7.1 Header strip summary (deterministic) ----------------------------
export async function deskSummary(env, sinceEpoch) {
  const since = sinceEpoch || 0;
  const [newReports, joins, comments, holds, heldComments, movers] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) AS n FROM reports WHERE created_at >= ?1').bind(since).first(),
    // joins = reports on items that already existed before the report (rough: reports beyond the first per item in window)
    env.DB.prepare('SELECT COUNT(*) AS n FROM reports r WHERE r.created_at >= ?1 AND r.item_id IN (SELECT item_id FROM reports GROUP BY item_id HAVING COUNT(*) > 1)').bind(since).first(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM comments WHERE created_at >= ?1 AND deleted = 0').bind(since).first(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM items WHERE held = 1').first(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM comments WHERE held = 1 AND deleted = 0').first(),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM items WHERE held = 0 AND merged_into IS NULL AND status IN ${LIVE} AND net >= 4`).first(),
  ]);
  return {
    newReports: newReports.n,
    joins: joins.n,
    comments: comments.n,
    holds: holds.n + heldComments.n,
    movers: movers.n,
  };
}

// ---- §7.3 Decision queue (deterministic; AI only tiebreaks merges) ---------
export async function decisionQueue(env, velByItem) {
  const queue = [];

  // 1. Merge suspects — same (area, part), similar titles. Compare within
  //    each (area, part) bucket so this stays cheap.
  const { results: liveItems } = await env.DB.prepare(
    `SELECT id, area, part, title, net, reports_count
     FROM items WHERE held = 0 AND merged_into IS NULL AND status != 'declined'
     ORDER BY area, part, id`
  ).all();
  const buckets = new Map();
  for (const it of liveItems) {
    const key = it.area + '|' + (it.part || '');
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(it);
  }
  const mergeSuspects = [];
  for (const list of buckets.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const sim = trigramSimilarity(list[i].title, list[j].title);
        if (sim >= 0.5) {
          const a = list[i], b = list[j];
          // winner = more reports, then higher net, then older serial
          const winner = pickWinner(a, b);
          const loser = winner === a ? b : a;
          mergeSuspects.push({
            kind: 'merge',
            winnerId: winner.id, winnerTitle: winner.title,
            loserId: loser.id, loserTitle: loser.title,
            similarity: Math.round(sim * 100),
          });
        }
      }
    }
  }
  // cap and add
  for (const m of mergeSuspects.slice(0, 5)) queue.push(m);

  // 2. Movers — high velocity, not yet statused (still 'open').
  const { results: moverRows } = await env.DB.prepare(
    `SELECT id, title, net, reports_count FROM items
     WHERE held = 0 AND merged_into IS NULL AND status = 'open' AND net >= 0
     ORDER BY id`
  ).all();
  const movers = moverRows
    .map((m) => ({ ...m, vel: velByItem.get(m.id) || 0 }))
    .filter((m) => m.vel >= 3)
    .sort((a, b) => b.vel - a.vel)
    .slice(0, 5)
    .map((m) => ({ kind: 'mover', id: m.id, title: m.title, net: m.net, vel: m.vel, reportsCount: m.reports_count }));
  for (const m of movers) queue.push(m);

  // 3. Holds — blocklist-flagged items and comments.
  const { results: heldItems } = await env.DB.prepare(
    `SELECT id, title, created_by FROM items WHERE held = 1 ORDER BY id DESC LIMIT 5`
  ).all();
  for (const h of heldItems) queue.push({ kind: 'hold', target: 'item', id: h.id, title: h.title });
  const { results: heldComments } = await env.DB.prepare(
    `SELECT c.id, c.item_id, c.body FROM comments c WHERE c.held = 1 AND c.deleted = 0 ORDER BY c.id DESC LIMIT 5`
  ).all();
  for (const h of heldComments) queue.push({ kind: 'hold', target: 'comment', id: h.id, itemId: h.item_id, body: h.body.slice(0, 120) });

  // 4. Anomalies — net-negative but many reports (controversial), and single
  //    users filing many items today (possible spam).
  const { results: controversial } = await env.DB.prepare(
    `SELECT id, title, net, reports_count FROM items
     WHERE held = 0 AND merged_into IS NULL AND net < 0 AND reports_count >= 3
     ORDER BY reports_count DESC LIMIT 3`
  ).all();
  for (const c of controversial) queue.push({ kind: 'controversial', id: c.id, title: c.title, net: c.net, reportsCount: c.reports_count });

  const dayAgo = Math.floor(Date.now() / 1000) - 86400;
  const { results: prolific } = await env.DB.prepare(
    `SELECT created_by AS sub, COUNT(*) AS n FROM items WHERE created_at >= ?1 GROUP BY created_by HAVING n >= 4 ORDER BY n DESC LIMIT 3`
  ).bind(dayAgo).all();
  for (const p of prolific) queue.push({ kind: 'prolific', sub: p.sub, count: p.n });

  return queue;
}

function pickWinner(a, b) {
  if (b.reports_count !== a.reports_count) return b.reports_count > a.reports_count ? b : a;
  if (b.net !== a.net) return b.net > a.net ? b : a;
  return a.id < b.id ? a : b;
}

// ---- §7.5 Build Brief (deterministic body; AI polishes wording only) ------
// Composed entirely from the structured §5.6 payloads — never from vibes.
export async function buildBriefData(env, itemId) {
  const item = await env.DB.prepare(
    `SELECT id, type, area, part, title, status, net, reports_count FROM items WHERE id = ?1`
  ).bind(itemId).first();
  if (!item) return null;

  const { results: reports } = await env.DB.prepare(
    `SELECT payload, created_at FROM reports WHERE item_id = ?1 AND held = 0 ORDER BY created_at ASC`
  ).bind(itemId).all();
  const parsed = reports.map((r) => { try { return JSON.parse(r.payload); } catch { return {}; } });

  // Symptom matrix
  const symptomTally = {};
  const freqTally = {};
  const detailTally = {};
  const importanceTally = {};
  const versions = {};
  const osTally = {};
  const browserTally = {};
  const builds = {};
  const expectedActual = [];
  const quotes = [];
  const followupTally = {};

  for (const p of parsed) {
    if (p.symptom) symptomTally[p.symptom] = (symptomTally[p.symptom] || 0) + 1;
    if (p.frequency) freqTally[p.frequency] = (freqTally[p.frequency] || 0) + 1;
    if (p.symptom_detail) detailTally[p.symptom_detail] = (detailTally[p.symptom_detail] || 0) + 1;
    if (p.importance) importanceTally[p.importance] = (importanceTally[p.importance] || 0) + 1;
    const ctx = p.ctx || {};
    if (ctx.v) versions[ctx.v] = (versions[ctx.v] || 0) + 1;
    if (ctx.os) osTally[ctx.os] = (osTally[ctx.os] || 0) + 1;
    if (ctx.browser) browserTally[ctx.browser] = (browserTally[ctx.browser] || 0) + 1;
    if (ctx.build) builds[ctx.build] = (builds[ctx.build] || 0) + 1;
    if (p.expected || p.actual) expectedActual.push({ expected: p.expected || '', actual: p.actual || '' });
    if (p.freetext) quotes.push(p.freetext);
    if (p.ask) quotes.push(p.ask);
    for (const f of p.followups || []) {
      const k = f.q + '=' + f.a;
      followupTally[k] = (followupTally[k] || 0) + 1;
    }
  }

  return {
    id: item.id, type: item.type, area: item.area, part: item.part,
    title: item.title, status: item.status, net: item.net, reportsCount: item.reports_count,
    reportCount: parsed.length,
    symptomTally, freqTally, detailTally, importanceTally,
    versions, osTally, browserTally, builds,
    expectedActual: expectedActual.slice(0, 8),
    quotes: quotes.slice(0, 6),
    followupTally,
  };
}

// Render the brief as the copy-paste text block (§7.5). Pure/deterministic;
// the route may optionally pass it through AI for a tighter "repro candidates"
// section, but this text alone is a complete, useful handoff.
export function renderBriefText(d, mergedIds) {
  const L = [];
  // "value ×N", biggest first — reads cleanly and unambiguously.
  const tally = (obj, prefix = '') => {
    const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    return entries.map(([k, n]) => `${prefix}${k} ×${n}`).join(', ') || '—';
  };
  L.push(`BUILD BRIEF — #${d.id} ${areaTitle(d.area)}: ${d.title}`);
  const impStr = tally(d.importanceTally);
  L.push(`Demand: ${d.reportsCount} GMs · ${d.net >= 0 ? '+' : ''}${d.net} net${Object.keys(d.importanceTally).length ? ' · importance: ' + impStr : ''}`);
  if (d.type === 'bug') {
    L.push(`Symptom matrix: ${tally(d.symptomTally)}; ${tally(d.freqTally)}${Object.keys(d.detailTally).length ? '; detail: ' + tally(d.detailTally) : ''}.`);
  }
  const envBits = [];
  if (Object.keys(d.versions).length) envBits.push(tally(d.versions, 'v'));
  const osBrowser = tally(d.osTally);
  if (Object.keys(d.osTally).length) envBits.push(osBrowser);
  if (Object.keys(d.browserTally).length) envBits.push(tally(d.browserTally));
  if (Object.keys(d.builds).length) envBits.push(tally(d.builds) + ' build');
  L.push(`Environment: ${envBits.join(' · ') || '—'}.`);
  if (d.expectedActual.length) {
    L.push('Expected vs actual (verbatim): ' + d.expectedActual.map((e) => `"${e.expected}" → "${e.actual}"`).join('; ') + '.');
  }
  if (Object.keys(d.followupTally).length) {
    L.push('Follow-up answers: ' + Object.entries(d.followupTally).map(([k, n]) => `${n}× ${k}`).join(', ') + '.');
  }
  if (d.quotes.length) {
    L.push('GM quotes worth keeping: ' + d.quotes.map((q) => `"${q}"`).join(' | '));
  }
  // Drafted acceptance from the symptom + detail shape.
  L.push('Acceptance (drafted from reports): ' + draftAcceptance(d));
  const links = [`/item/?id=${d.id}`].concat((mergedIds || []).map((m) => `merged #${m}`));
  L.push('Board links: ' + links.join(' + '));
  return L.join('\n');
}

function draftAcceptance(d) {
  if (d.type === 'idea') {
    return `the tool does what was asked, verified by a GM who requested it.`;
  }
  const parts = [];
  const topDetail = Object.entries(d.detailTally).sort((a, b) => b[1] - a[1])[0];
  if (d.symptomTally.work_disappeared) parts.push('the affected work survives the reported action');
  if (topDetail) parts.push(`survives "${topDetail[0]}"`);
  const platforms = Object.keys(d.osTally);
  if (platforms.length) parts.push(`verified on ${platforms.join(', ')}`);
  if (parts.length === 0) parts.push('the reported symptom no longer occurs on the reported platforms');
  return parts.join('; ') + '.';
}

function areaTitle(area) {
  return String(area || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
