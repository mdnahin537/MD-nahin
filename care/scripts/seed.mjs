#!/usr/bin/env node
// Generates synthetic fixtures at N=10 (hand-tuned, deterministic edge cases)
// or N=5000 (randomized at scale, seeded for reproducibility) and loads them
// into the LOCAL D1 database via `wrangler d1 execute --file=`.
//
// N=10 is deliberately hand-crafted (not random) because its whole job is
// precise edge-case coverage: module gate stays CLOSED (only 6 of the 10
// qualify, design requires >=8), one net-negative item for the guardrail,
// one fresh "new"-lane item, one shipped item for the strip.
//
// N=5000 is randomized (mulberry32, seeded) with a handful of hand-placed
// "anchor" items guaranteeing the module gate OPENS, Trending has real
// candidates (vel>=3), New has real candidates, and a few net-negative
// items exist — layered under bulk realistic random fill so performance
// testing happens at true scale.
//
// Usage: node scripts/seed.mjs [10|5000]

import { writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARE_DIR = path.resolve(__dirname, '..');
const N = Number(process.argv[2]) || 10;
const NOW = Math.floor(Date.now() / 1000);
const DAY = 86400;

// ---- seeded PRNG (mulberry32) — reproducible across runs for the same N ----
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(N === 10 ? 10 : 5000);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1));

function sqlStr(v) {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}
function sqlNum(v) {
  return v === null || v === undefined ? 'NULL' : String(v);
}

const AREAS = [
  'war-room', 'chronicle', 'factions', 'characters', 'hooks-secrets', 'locations',
  'campaign', 'run-sessions', 'tonight-solo', 'ai', 'arsenal-press', 'exports-data', 'license-setup',
];
const SYMPTOMS = ['nothing_happened', 'wrong_thing', 'work_disappeared', 'display_broken', 'froze_crashed', 'slow', 'error_message', 'something_else'];
const FREQS = ['every_time', 'sometimes', 'once'];
const STATUSES_POOL = ['open', 'open', 'open', 'open', 'open', 'planned', 'planned', 'in_progress', 'shipped', 'declined'];

const statements = []; // array of complete SQL statement strings

// Returns { rows, subs } — `subs` is the authoritative list of user_sub
// values callers must use when referencing these users elsewhere (votes,
// reports, comments). Generating the sub string in exactly one place
// avoids the two ends drifting out of sync.
function addUsers(count, prefix) {
  const rows = [];
  const subs = [];
  for (let i = 0; i < count; i++) {
    const sub = `${prefix}-u${i}`;
    subs.push(sub);
    const createdAt = NOW - randInt(1, 200) * DAY;
    rows.push(`(${sqlStr(sub)}, ${sqlStr(`Seed GM ${prefix}-${i}`)}, NULL, ${sqlStr(`${prefix}${i}@example.test`)}, ${createdAt}, ${createdAt})`);
  }
  return { rows, subs };
}

function chunkedInsert(table, columns, rows, chunkSize = 400) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;
    statements.push(`INSERT INTO ${table} (${columns}) VALUES ${chunk.join(',')};`);
  }
}

function buildContract(type, area) {
  if (type === 'bug') {
    return JSON.stringify({
      type, area, part: null, symptom: pick(SYMPTOMS), symptom_detail: null,
      frequency: pick(FREQS), expected: '', actual: '', freetext: '', importance: null,
      ctx: { v: '2.3.0', schema: '2.5.0', build: 'full', mode: 'campaign', theme: 'ember', ai: 'openrouter' },
      followups: [],
    });
  }
  return JSON.stringify({
    type, area, part: null, symptom: null, symptom_detail: null, frequency: null,
    expected: null, actual: null, freetext: '', importance: pick(['nice_to_have', 'every_session', 'cant_run_without']),
    ctx: { v: '2.3.0', schema: '2.5.0', build: 'full', mode: 'world', theme: 'ember', ai: 'none' },
    followups: [], ideaKind: 'new_tool', ask: 'seeded idea ask', why: '', doneLooksLike: '',
  });
}

const userRows = [];
const itemRows = [];
const reportRows = [];
const voteRows = [];
const voteEventRows = [];
const commentRows = [];

let nextItemId = 1;
let nextReportId = 1;
let nextCommentId = 1;

function makeItem({ type, area, status, createdAt, pinned = 0, held = 0, ownerNoteAt = null }) {
  const id = nextItemId++;
  const title = `${area} — seeded ${type} #${id}`;
  itemRows.push({ id, type, area, status, createdAt, pinned, held, ownerNoteAt, title });
  return id;
}

function addFoundingReportAndVote(itemId, userSub, createdAt, voteValue = 1) {
  const contract = buildContract(itemRows.find((i) => i.id === itemId).type, itemRows.find((i) => i.id === itemId).area);
  reportRows.push({ id: nextReportId++, itemId, userSub, payload: contract, createdAt, held: 0 });
  if (voteValue !== 0) {
    voteRows.push({ itemId, userSub, value: voteValue, createdAt });
    voteEventRows.push({ itemId, userSub, value: voteValue, createdAt });
  }
}

function addVote(itemId, userSub, value, createdAt) {
  voteRows.push({ itemId, userSub, value, createdAt });
  voteEventRows.push({ itemId, userSub, value, createdAt });
}

// =====================================================================
// N = 10 : hand-crafted deterministic edge cases
// =====================================================================
if (N === 10) {
  const { rows: seed10UserRows, subs: users } = addUsers(16, 'seed10');
  userRows.push(...seed10UserRows);

  // 6 qualifying items (net 1..3) -- deliberately FEWER than 8, so the
  // module gate stays CLOSED (design: "a 10-item board must not crown itself").
  for (let i = 0; i < 6; i++) {
    const createdAt = NOW - randInt(10, 60) * DAY;
    const id = makeItem({ type: 'bug', area: pick(AREAS), status: 'open', createdAt });
    addFoundingReportAndVote(id, users[i], createdAt, 1);
    const extraAgrees = i; // 0..5 extra agrees -> net grows 1..6 across these six
    for (let v = 0; v < extraAgrees; v++) addVote(id, users[(i + v + 1) % users.length], 1, createdAt + v * DAY);
  }

  // 1 item net = 0 (an even split)
  {
    const createdAt = NOW - 40 * DAY;
    const id = makeItem({ type: 'idea', area: pick(AREAS), status: 'open', createdAt });
    addFoundingReportAndVote(id, users[6], createdAt, 1);
    addVote(id, users[7], -1, createdAt + DAY);
  }

  // 1 net-negative item (tests the guardrail)
  {
    const createdAt = NOW - 30 * DAY;
    const id = makeItem({ type: 'idea', area: pick(AREAS), status: 'open', createdAt });
    addFoundingReportAndVote(id, users[8], createdAt, 1);
    addVote(id, users[9], -1, createdAt + DAY);
    addVote(id, users[10], -1, createdAt + 2 * DAY);
  }

  // 1 fresh "new"-lane item: age <=21d, total<5, net>=0, status open
  {
    const createdAt = NOW - 2 * DAY;
    const id = makeItem({ type: 'bug', area: pick(AREAS), status: 'open', createdAt });
    addFoundingReportAndVote(id, users[11], createdAt, 1);
  }

  // 1 shipped item (for the shipped strip)
  {
    const createdAt = NOW - 50 * DAY;
    const id = makeItem({ type: 'bug', area: pick(AREAS), status: 'shipped', createdAt, ownerNoteAt: NOW - 3 * DAY });
    addFoundingReportAndVote(id, users[12], createdAt, 1);
  }

  // 1 declined item (never promoted, only visible via explicit filter)
  {
    const createdAt = NOW - 20 * DAY;
    const id = makeItem({ type: 'idea', area: pick(AREAS), status: 'declined', createdAt });
    addFoundingReportAndVote(id, users[13], createdAt, 1);
  }

  console.log(`N=10 fixture: ${itemRows.length} items built (6 qualifying <8 gate, 1 net=0, 1 net<0, 1 new, 1 shipped, 1 declined).`);
}

// =====================================================================
// N = 5000 : randomized at scale, with guaranteed anchor items
// =====================================================================
if (N === 5000) {
  const USER_COUNT = 600;
  const { rows: seed5kUserRows, subs: users } = addUsers(USER_COUNT, 'seed5k');
  userRows.push(...seed5kUserRows);

  // --- Anchors: guarantee the module gate opens (>=8 qualifying), Trending
  // and New lanes have real candidates, and some net-negative items exist.
  const ANCHOR_QUALIFYING = 25; // net>=1, comfortably clears the >=8 gate
  for (let i = 0; i < ANCHOR_QUALIFYING; i++) {
    const createdAt = NOW - randInt(25, 150) * DAY;
    const id = makeItem({ type: pick(['bug', 'idea']), area: pick(AREAS), status: pick(['open', 'planned', 'in_progress']), createdAt });
    addFoundingReportAndVote(id, pick(users), createdAt, 1);
    const agreeCount = randInt(3, 60);
    for (let v = 0; v < agreeCount; v++) addVote(id, users[(i * 7 + v) % USER_COUNT], 1, createdAt + randInt(0, 100) * DAY);
  }

  const ANCHOR_TRENDING = 15; // vel>=3, net>=0, total>=5
  for (let i = 0; i < ANCHOR_TRENDING; i++) {
    const createdAt = NOW - randInt(10, 60) * DAY;
    const id = makeItem({ type: pick(['bug', 'idea']), area: pick(AREAS), status: pick(['open', 'planned', 'in_progress']), createdAt });
    addFoundingReportAndVote(id, pick(users), createdAt, 1);
    // total>=5 baseline, older votes outside the 7-day window
    for (let v = 0; v < 5; v++) addVote(id, users[(i * 11 + v + 100) % USER_COUNT], 1, createdAt + DAY);
    // burst of recent votes inside the last 7 days -> vel>=3
    const burst = randInt(4, 12);
    for (let v = 0; v < burst; v++) addVote(id, users[(i * 13 + v + 200) % USER_COUNT], 1, NOW - randInt(0, 6) * DAY);
  }

  const ANCHOR_NEW = 20; // age<=21d, total<5, net>=0, status open
  for (let i = 0; i < ANCHOR_NEW; i++) {
    const createdAt = NOW - randInt(0, 20) * DAY;
    const id = makeItem({ type: pick(['bug', 'idea']), area: pick(AREAS), status: 'open', createdAt });
    addFoundingReportAndVote(id, pick(users), createdAt, 1);
    const extra = randInt(0, 3);
    for (let v = 0; v < extra; v++) addVote(id, users[(i * 17 + v + 300) % USER_COUNT], 1, createdAt + randInt(0, 3) * DAY);
  }

  const ANCHOR_NEGATIVE = 12; // net<0, tests the guardrail at scale
  for (let i = 0; i < ANCHOR_NEGATIVE; i++) {
    const createdAt = NOW - randInt(5, 100) * DAY;
    const id = makeItem({ type: pick(['bug', 'idea']), area: pick(AREAS), status: 'open', createdAt });
    addFoundingReportAndVote(id, pick(users), createdAt, 1);
    const disagrees = randInt(2, 15);
    for (let v = 0; v < disagrees; v++) addVote(id, users[(i * 19 + v + 400) % USER_COUNT], -1, createdAt + randInt(0, 30) * DAY);
  }

  const ANCHOR_SHIPPED = 8;
  for (let i = 0; i < ANCHOR_SHIPPED; i++) {
    const createdAt = NOW - randInt(60, 150) * DAY;
    const id = makeItem({ type: 'bug', area: pick(AREAS), status: 'shipped', createdAt, ownerNoteAt: NOW - randInt(1, 14) * DAY });
    addFoundingReportAndVote(id, pick(users), createdAt, 1);
  }

  const ANCHOR_PINNED = 2;
  for (let i = 0; i < ANCHOR_PINNED; i++) {
    const createdAt = NOW - randInt(30, 90) * DAY;
    const id = makeItem({ type: 'idea', area: pick(AREAS), status: 'open', createdAt, pinned: 1 });
    addFoundingReportAndVote(id, pick(users), createdAt, 1);
  }

  const ANCHOR_HELD = 5;
  for (let i = 0; i < ANCHOR_HELD; i++) {
    const createdAt = NOW - randInt(1, 30) * DAY;
    const id = makeItem({ type: 'bug', area: pick(AREAS), status: 'open', createdAt, held: 1 });
    addFoundingReportAndVote(id, pick(users), createdAt, 1);
  }

  // --- Bulk realistic random fill for the remainder ---
  const remaining = N - itemRows.length;
  for (let i = 0; i < remaining; i++) {
    const createdAt = NOW - randInt(0, 180) * DAY;
    const status = pick(STATUSES_POOL);
    const id = makeItem({ type: pick(['bug', 'idea']), area: pick(AREAS), status, createdAt });
    const author = pick(users);
    addFoundingReportAndVote(id, author, createdAt, 1);
    // power-law-ish voter count: squaring random skews small, long tail of popular items
    const voterCount = Math.floor(rand() * rand() * 40);
    for (let v = 0; v < voterCount; v++) {
      const voter = users[(i * 3 + v * 31 + 7) % USER_COUNT];
      if (voter === author) continue;
      const value = rand() < 0.85 ? 1 : -1; // most votes are agrees
      addVote(id, voter, value, createdAt + randInt(0, 150) * DAY);
    }
    // occasional extra "join" report (a second GM filing the same item)
    if (rand() < 0.25) {
      const joiner = pick(users);
      reportRows.push({ id: nextReportId++, itemId: id, userSub: joiner, payload: buildContract(itemRows.find((x) => x.id === id).type, itemRows.find((x) => x.id === id).area), createdAt: createdAt + randInt(1, 20) * DAY, held: 0 });
    }
    // occasional comment thread
    if (rand() < 0.15) {
      const c1 = nextCommentId++;
      commentRows.push({ id: c1, itemId: id, userSub: pick(users), parentId: null, body: 'Seeded top-level comment.', createdAt: createdAt + randInt(1, 30) * DAY, held: 0 });
      if (rand() < 0.4) {
        commentRows.push({ id: nextCommentId++, itemId: id, userSub: pick(users), parentId: c1, body: 'Seeded reply.', createdAt: createdAt + randInt(1, 31) * DAY, held: 0 });
      }
    }
  }

  console.log(`N=5000 fixture: ${itemRows.length} items, ${userRows.length} users, ${voteRows.length} votes, ${reportRows.length} reports, ${commentRows.length} comments.`);
}

// =====================================================================
// Emit SQL
// =====================================================================
statements.push('DELETE FROM comments;');
statements.push('DELETE FROM vote_events;');
statements.push('DELETE FROM votes;');
statements.push('DELETE FROM reports;');
statements.push('DELETE FROM items;');
statements.push('DELETE FROM users;');
statements.push('DELETE FROM digests;');
statements.push('DELETE FROM owner_log;');
statements.push("DELETE FROM sqlite_sequence WHERE name IN ('items','reports','comments');");

// Owner account, always present so /desk testing has a real owner user row.
statements.push(
  `INSERT INTO users (sub, name, avatar_url, email, created_at, last_seen) VALUES ('mock-owner-sub-001','Hunter (Owner)',NULL,'owner@example.test',${NOW - 200 * DAY},${NOW});`
);

chunkedInsert('users', 'sub, name, avatar_url, email, created_at, last_seen', userRows);

// items — recompute counts from the vote rows we generated so counts and
// actual vote rows never drift apart.
const agreeCountByItem = new Map();
const disagreeCountByItem = new Map();
for (const v of voteRows) {
  const map = v.value === 1 ? agreeCountByItem : disagreeCountByItem;
  map.set(v.itemId, (map.get(v.itemId) || 0) + 1);
}
const reportsCountByItem = new Map();
for (const r of reportRows) reportsCountByItem.set(r.itemId, (reportsCountByItem.get(r.itemId) || 0) + 1);
const commentsCountByItem = new Map();
for (const c of commentRows) commentsCountByItem.set(c.itemId, (commentsCountByItem.get(c.itemId) || 0) + 1);

const itemInsertRows = itemRows.map((it) => {
  const agree = agreeCountByItem.get(it.id) || 0;
  const disagree = disagreeCountByItem.get(it.id) || 0;
  const reports = reportsCountByItem.get(it.id) || 0;
  const comments = commentsCountByItem.get(it.id) || 0;
  return `(${it.id}, ${sqlStr(it.type)}, ${sqlStr(it.area)}, NULL, ${sqlStr(it.title)}, ${sqlStr(it.status)}, ${it.createdAt}, ${sqlStr('mock-owner-sub-001')}, ${it.pinned}, ${it.held}, NULL, ${agree}, ${disagree}, ${reports}, ${comments}, NULL, ${sqlNum(it.ownerNoteAt)})`;
});
chunkedInsert(
  'items',
  'id, type, area, part, title, status, created_at, created_by, pinned, held, merged_into, agree_count, disagree_count, reports_count, comments_count, owner_note, owner_note_at',
  itemInsertRows
);

chunkedInsert(
  'reports',
  'id, item_id, user_sub, payload, created_at, held',
  reportRows.map((r) => `(${r.id}, ${r.itemId}, ${sqlStr(r.userSub)}, ${sqlStr(r.payload)}, ${r.createdAt}, ${r.held})`)
);

// votes: dedupe to one row per (item_id,user_sub) — last write wins, mirrors
// the PK constraint the real API enforces via upsert.
const voteMap = new Map();
for (const v of voteRows) voteMap.set(`${v.itemId}:${v.userSub}`, v);
chunkedInsert(
  'votes',
  'item_id, user_sub, value, created_at',
  Array.from(voteMap.values()).map((v) => `(${v.itemId}, ${sqlStr(v.userSub)}, ${v.value}, ${v.createdAt})`)
);

chunkedInsert(
  'vote_events',
  'item_id, user_sub, value, created_at',
  voteEventRows.map((v) => `(${v.itemId}, ${sqlStr(v.userSub)}, ${v.value}, ${v.createdAt})`)
);

chunkedInsert(
  'comments',
  'id, item_id, user_sub, parent_id, body, created_at, held',
  commentRows.map((c) => `(${c.id}, ${c.itemId}, ${sqlStr(c.userSub)}, ${sqlNum(c.parentId)}, ${sqlStr(c.body)}, ${c.createdAt}, ${c.held})`)
);

const outDir = path.join(CARE_DIR, '.wrangler');
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `seed-${N}.sql`);
writeFileSync(outFile, statements.join('\n'));
console.log(`Wrote ${statements.length} SQL statements to ${outFile}`);

console.log('Applying to local D1 via wrangler...');
execSync(`npx wrangler d1 execute realmwright-care --local --file="${outFile}"`, {
  cwd: CARE_DIR,
  stdio: 'inherit',
});
console.log('Done.');
