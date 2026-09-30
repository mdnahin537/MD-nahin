import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import worker from '../test-results/bundle/index.js';

globalThis.crypto ??= webcrypto;
globalThis.caches = { default: { match: async () => null, put: async () => {} } };
const origin = 'https://care.test';
const now = () => Math.floor(Date.now() / 1000);
function fixture({ beforeStatement } = {}) {
  const sqlite = new DatabaseSync(':memory:');
  for (const name of readdirSync(new URL('../migrations/', import.meta.url)).sort()) {
    sqlite.exec(readFileSync(new URL('../migrations/' + name, import.meta.url), 'utf8'));
  }
  function statement(sql, args = []) {
    function run() {
      beforeStatement?.(sql, args);
      const values = Object.fromEntries(args.map((v, i) => [String(i + 1), v]));
      const results = sqlite.prepare(sql).all(values);
      return { results, meta: { changes: sqlite.prepare('SELECT changes() AS n').get().n } };
    }
    return { sql, args, execute: run, bind: (...values) => statement(sql, values),
      first: async () => run().results[0] || null, all: async () => run(), run: async () => run() };
  }
  const DB = { prepare: statement, async batch(statements) {
    sqlite.exec('BEGIN');
    try {
      const result = statements.map(statement => statement.execute());
      sqlite.exec('COMMIT'); return result;
    } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  }};
  const env = { DB, SESSION_SECRET: 'isolated-test-secret', OWNER_SETUP_TOKEN: 'isolated-owner-token',
    ENVIRONMENT: 'development', FEATURE_MICRO_INTERVIEW: 'true', CARE_MAIL_ENABLED: 'false',
    ASSETS: { async fetch(request) {
      const path = new URL(request.url).pathname;
      const relative = path.endsWith('/') ? path + 'index.html' : path;
      try { return new Response(readFileSync(new URL('../public' + relative, import.meta.url))); }
      catch { return new Response('Not found', { status: 404 }); }
    }} };
  let cookie = '';
  const tasks = [];
  async function call(path, body, action, method = body === undefined ? 'GET' : 'POST') {
    const headers = { Origin: origin, Cookie: cookie };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (action) headers['X-Care-Action'] = action;
    const response = await worker.fetch(new Request(origin + path, {
      method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    }), env, { waitUntil: promise => tasks.push(promise) });
    const setCookie = response.headers.get('Set-Cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    return response;
  }
  return { sqlite, env, call, getCookie: () => cookie, setCookie: value => { cookie = value; },
    settle: async () => { await Promise.allSettled(tasks); },
    scheduled: async () => { await worker.scheduled({}, env, { waitUntil: promise => tasks.push(promise) }); await Promise.allSettled(tasks); },
    close: async () => { await Promise.allSettled(tasks); sqlite.close(); } };
}
const bug = { type: 'bug', area: 'exports-data', symptom: 'slow', frequency: 'sometimes',
  expected: 'Expected α', actual: 'Actual β', freetext: 'Original <&> বাংলা',
  ctx: { v: '3.2', schema: 4 }, clientCtx: { os: 'android', browser: 'chrome' } };
async function signedIn(f) {
  assert.equal((await f.call('/auth/bootstrap', {}, 'bootstrap')).status, 200);
}
function seedItem(f, title, status = 'open', held = 0) {
  return Number(f.sqlite.prepare("INSERT INTO items(type,area,title,status,created_at,created_by,held) VALUES ('bug','exports-data',?,?,?,?,?) RETURNING id")
    .get(title, status, now(), f.sqlite.prepare('SELECT sub FROM users LIMIT 1').get().sub, held).id);
}
test('Recovery survives a session-write failure and still works only once', async () => {
  const f = fixture(); try {
    await signedIn(f);
    f.sqlite.exec('UPDATE users SET is_owner=1');
    const { recoveryCode } = await (await f.call('/auth/recovery', {}, 'issue-recovery')).json();
    f.sqlite.exec("CREATE TRIGGER fail_session BEFORE INSERT ON care_sessions BEGIN SELECT RAISE(ABORT,'isolated failure'); END;");
    assert.equal((await f.call('/auth/recover', { code: recoveryCode }, 'recover')).status, 500);
    f.sqlite.exec('DROP TRIGGER fail_session');
    assert.equal((await f.call('/auth/recover', { code: recoveryCode }, 'recover')).status, 200);
    assert.equal((await (await f.call('/api/me')).json()).isOwner, true);
    assert.equal((await f.call('/auth/recover', { code: recoveryCode }, 'recover')).status, 401);
  } finally { await f.close(); }
});
test('Failed owner setup leaves no owner behind; one successful owner stays protected', async () => {
  const f = fixture(); try {
    f.sqlite.exec("CREATE TRIGGER fail_session BEFORE INSERT ON care_sessions BEGIN SELECT RAISE(ABORT,'isolated failure'); END;");
    await f.call('/auth/owner/claim', { token: 'isolated-owner-token' }, 'owner-claim');
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM users WHERE is_owner=1').get().n, 0);
    f.sqlite.exec('DROP TRIGGER fail_session');
    assert.equal((await f.call('/auth/owner/claim', { token: 'isolated-owner-token' }, 'owner-claim')).status, 200);
    assert.equal((await f.call('/auth/owner/claim', { token: 'isolated-owner-token' }, 'owner-claim')).status, 409);
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM users WHERE is_owner=1').get().n, 1);
  } finally { await f.close(); }
});
test('Hidden items and hidden/deleted reply parents reject public writes', async () => {
  const f = fixture(); try {
    await signedIn(f);
    const hidden = seedItem(f, 'Held fixture', 'open', 1);
    assert.equal((await f.call('/api/vote/' + hidden, { value: 1 }, null, 'PUT')).status, 404);
    assert.equal((await f.call('/api/comment', { itemId: hidden, body: 'Invisible target' })).status, 404);
    const visible = seedItem(f, 'Visible fixture');
    const user = f.sqlite.prepare('SELECT sub FROM users LIMIT 1').get().sub;
    const parent = Number(f.sqlite.prepare("INSERT INTO comments(item_id,user_sub,body,created_at,held) VALUES (?,?,'held parent',?,1) RETURNING id").get(visible, user, now()).id);
    assert.equal((await f.call('/api/comment', { itemId: visible, body: 'Reply', parentId: parent })).status, 400);
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM votes').get().n, 0);
  } finally { await f.close(); }
});
test('New ideas require a useful request on the server', async () => {
  const f = fixture(); try {
    await signedIn(f);
    const response = await f.call('/api/report', { type: 'idea', area: 'exports-data', ideaKind: 'new_tool', ask: '  ' });
    assert.equal(response.status, 400);
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM items').get().n, 0);
  } finally { await f.close(); }
});
test('Literal backslash, percent and underscore searches find only their matching titles', async () => {
  const f = fixture(); try {
    await signedIn(f);
    const id = seedItem(f, 'C:\\maps 50%_ready');
    seedItem(f, 'C:maps 50Xaready');
    for (const query of ['C:\\maps', '50%_ready']) {
      const data = await (await f.call('/api/feed?q=' + encodeURIComponent(query))).json();
      assert.deepEqual(data.items.map(item => item.id), [id]);
    }
  } finally { await f.close(); }
});
test('Shipped and declined filters show all matching records, including beyond the strip', async () => {
  const f = fixture(); try {
    await signedIn(f);
    for (let i = 0; i < 7; i++) seedItem(f, 'Shipped ' + i, 'shipped');
    const declined = seedItem(f, 'Declined fixture', 'declined');
    const shipped = await (await f.call('/api/feed?status=shipped')).json();
    assert.equal(shipped.totalCount, 7);
    assert.equal(shipped.items.length, 7);
    const rejected = await (await f.call('/api/feed?status=declined')).json();
    assert.deepEqual(rejected.items.map(item => item.id), [declined]);
  } finally { await f.close(); }
});
test('Signed-out identity results cannot be cached across sign-in', async () => {
  const f = fixture(); try {
    const response = await f.call('/api/me');
    assert.match(response.headers.get('Cache-Control') || '', /no-store/);
    assert.equal(response.headers.get('Vary'), 'Cookie');
  } finally { await f.close(); }
});
test('Retries save one report and one email event; changed reuse is rejected', async () => {
  const f = fixture(); try {
    await signedIn(f);
    const body = { ...bug, submissionKey: 'isolated-submission-0001' };
    const first = await (await f.call('/api/report', body)).json();
    const repeatedResponse = await f.call('/api/report', body);
    assert.equal(repeatedResponse.status, 200);
    const repeated = await repeatedResponse.json();
    assert.equal(repeated.reportId, first.reportId);
    assert.equal(repeated.itemId, first.itemId);
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM reports').get().n, 1);
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM care_mail_outbox').get().n, 1);
    assert.equal((await f.call('/api/report', { ...body, freetext: 'Changed draft' })).status, 409);
    const item = await (await f.call('/api/item/' + first.itemId)).json();
    assert.equal(item.reports[0].freetext, bug.freetext);
  } finally { await f.close(); }
});

async function owner(f) { await signedIn(f); f.sqlite.exec('UPDATE users SET is_owner=1'); }
test('A failed session lookup preserves an existing identity and cookie', async () => {
  let failRead = false;
  const f = fixture({ beforeStatement: sql => {
    if (failRead && sql.includes('FROM care_sessions s')) { failRead = false; throw new Error('Isolated read failure'); }
  } });
  try {
    await owner(f);
    const original = await (await f.call('/api/me')).json();
    const originalCookie = f.getCookie();
    failRead = true;
    const response = await f.call('/auth/bootstrap', {}, 'bootstrap');
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Set-Cookie'), null);
    assert.equal(f.getCookie(), originalCookie);
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM users').get().n, 1);
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM care_sessions').get().n, 1);
    failRead = true;
    const unavailable = await f.call('/api/me');
    assert.equal(unavailable.status, 503);
    assert.match(unavailable.headers.get('Cache-Control'), /no-store/);
    const restored = await (await f.call('/api/me')).json();
    assert.deepEqual(restored, original);
  } finally { await f.close(); }
});
test('Concurrent recovery attempts obey the same atomic allowance', async () => {
  const f = fixture(); try {
    const responses = await Promise.all(Array.from({ length: 16 }, () =>
      f.call('/auth/recover', { code: 'C'.repeat(24) }, 'recover')));
    assert.equal(responses.filter(r => r.status === 401).length, 10);
    assert.equal(responses.filter(r => r.status === 429).length, 6);
    assert.equal(f.sqlite.prepare("SELECT count FROM care_auth_attempts WHERE kind='recovery'").get().count, 10);
  } finally { await f.close(); }
});
test('A failed merge rolls back records, votes, counters and owner log', async () => {
  const f = fixture(); try {
    await owner(f);
    const loser = await (await f.call('/api/report', { ...bug, title: 'Source' })).json();
    const winner = await (await f.call('/api/report', { ...bug, title: 'Destination' })).json();
    await f.call('/api/comment', { itemId: loser.itemId, body: 'Original comment' });
    const tables = ['items', 'reports', 'comments', 'votes', 'owner_log', 'care_mail_outbox'];
    const snapshot = () => Object.fromEntries(tables.map(table => [table, f.sqlite.prepare('SELECT * FROM ' + table + ' ORDER BY 1').all()]));
    const before = snapshot();
    f.sqlite.exec("CREATE TRIGGER stop_merge BEFORE UPDATE OF item_id ON comments BEGIN SELECT RAISE(ABORT,'isolated merge failure'); END;");
    const failed = await f.call('/api/desk/item/' + loser.itemId + '/merge', { intoId: winner.itemId });
    assert.equal(failed.status, 500);
    assert.deepEqual(snapshot(), before);
    f.sqlite.exec('DROP TRIGGER stop_merge');
    assert.equal((await f.call('/api/desk/item/' + loser.itemId + '/merge', { intoId: winner.itemId })).status, 200);
    assert.equal((await f.call('/api/desk/item/' + winner.itemId + '/merge', { intoId: loser.itemId })).status, 409);
    assert.equal(f.sqlite.prepare('SELECT merged_into FROM items WHERE id=?').get(winner.itemId).merged_into, null);
  } finally { await f.close(); }
});
test('Merging a held item preserves the hold on every moved report and comment', async () => {
  const f = fixture(); try {
    await owner(f);
    const loser = await (await f.call('/api/report', { ...bug, title: 'Held source', freetext: 'Hidden inherited detail' })).json();
    const winner = await (await f.call('/api/report', { ...bug, title: 'Visible destination' })).json();
    await f.call('/api/comment', { itemId: loser.itemId, body: 'Hidden inherited comment' });
    f.sqlite.prepare('UPDATE items SET held=1 WHERE id=?').run(loser.itemId);
    const mail = f.sqlite.prepare('SELECT snapshot FROM care_mail_outbox WHERE event_key=?').get('report:' + loser.reportId).snapshot;
    assert.equal((await f.call('/api/desk/item/' + loser.itemId + '/merge', { intoId: winner.itemId })).status, 200);
    const item = await (await f.call('/api/item/' + winner.itemId)).json();
    assert.equal(item.reports.length, 1);
    assert.equal(item.comments.length, 0);
    const counts = f.sqlite.prepare('SELECT reports_count,comments_count FROM items WHERE id=?').get(winner.itemId);
    assert.deepEqual({ ...counts }, { reports_count: 1, comments_count: 0 });
    assert.equal(f.sqlite.prepare('SELECT held FROM reports WHERE id=?').get(loser.reportId).held, 1);
    assert.equal(f.sqlite.prepare('SELECT snapshot FROM care_mail_outbox WHERE event_key=?').get('report:' + loser.reportId).snapshot, mail);
  } finally { await f.close(); }
});
test('Comment retries and concurrent report retries save one original record each', async () => {
  const f = fixture(); try {
    await signedIn(f);
    const reportBody = { ...bug, submissionKey: 'concurrent-report-fixture-1' };
    const responses = await Promise.all([f.call('/api/report', reportBody), f.call('/api/report', reportBody)]);
    const reports = await Promise.all(responses.map(r => r.json()));
    assert.equal(reports[0].reportId, reports[1].reportId);
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM items').get().n, 1);
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM reports').get().n, 1);
    const commentBody = { itemId: reports[0].itemId, body: 'Keep all of this <&> বাংলা', submissionKey: 'concurrent-comment-fixture-1' };
    const commentResponses = await Promise.all([f.call('/api/comment', commentBody), f.call('/api/comment', commentBody)]);
    const comments = await Promise.all(commentResponses.map(r => r.json()));
    assert.equal(comments[0].id, comments[1].id);
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM comments').get().n, 1);
    assert.equal(f.sqlite.prepare('SELECT comments_count FROM items').get().comments_count, 1);
    assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM care_mail_outbox').get().n, 2);
    assert.equal((await f.call('/api/comment', { ...commentBody, body: 'Changed after save' })).status, 409);
  } finally { await f.close(); }
});
