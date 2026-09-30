import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
const taxonomy = JSON.parse(readFileSync(new URL('../public/data/taxonomy.json', import.meta.url)));
const source = name => readFileSync(new URL('../public/js/' + name + '.js', import.meta.url), 'utf8');

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key), key: index => [...values.keys()][index] ?? null,
    get length() { return values.size; } };
}
function dom() {
  const document = { nodes: new Map(), activeElement: null };
  class Element {
    constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.attributes = {};
      this.dataset = {}; this.listeners = {}; this.hidden = false; this.disabled = false; this.value = '';
      this.isConnected = true; this.parentElement = null; this.style = {}; this._html = ''; this._classes = new Set();
      this.classList = { add: (...items) => items.forEach(item => this._classes.add(item)),
        remove: (...items) => items.forEach(item => this._classes.delete(item)),
        contains: item => this._classes.has(item),
        toggle: (item, on) => { if (on ?? !this._classes.has(item)) this._classes.add(item); else this._classes.delete(item); } };
    }
    set className(value) { this._classes = new Set(String(value).split(/\s+/).filter(Boolean)); }
    get className() { return [...this._classes].join(' '); }
    set innerHTML(value) {
      this._html = String(value); this.children = [];
      const pattern = /<(button|input|textarea|h1|div|p|a|span|label)\b([^>]*)>/g;
      for (const match of this._html.matchAll(pattern)) {
        const child = new Element(match[1]);
        for (const attribute of match[2].matchAll(/([\w-]+)="([^"]*)"/g)) child.setAttribute(attribute[1], attribute[2]);
        this.appendChild(child);
      }
    }
    get innerHTML() { return this._html; }
    setAttribute(key, value) {
      this.attributes[key] = String(value);
      if (key === 'id') { this.id = value; document.nodes.set(value, this); }
      if (key === 'class') this.className = value;
      if (key === 'value') this.value = value;
      if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
    }
    getAttribute(key) { return this.attributes[key] ?? null; }
    removeAttribute(key) { delete this.attributes[key]; }
    appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
    prepend(child) { child.parentElement = this; this.children.unshift(child); }
    remove() { this.isConnected = false; if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); }
    get firstChild() { return this.children[0] || null; }
    addEventListener(name, callback) { const list = this.listeners[name] ||= []; list.push(callback); }
    removeEventListener(name, callback) { this.listeners[name] = (this.listeners[name] || []).filter(item => item !== callback); }
    async dispatch(name, event = {}) { await Promise.all((this.listeners[name] || []).map(callback => callback(event))); }
    async click() { if (!this.disabled) await this.dispatch('click', { target: this, preventDefault() {} }); }
    focus() { document.activeElement = this; }
    scrollIntoView() {}
    insertAdjacentHTML(position, html) { this._html += html; }
    insertAdjacentElement(position, element) { this.parentElement?.appendChild(element); }
    replaceWith(element) { const parent = this.parentElement; this.remove(); parent?.appendChild(element); }
    matches(selector) {
      if (selector.startsWith('#')) return this.id === selector.slice(1);
      if (selector.startsWith('.')) return this.classList.contains(selector.slice(1).split('[')[0]);
      if (selector.startsWith('[')) { const key = selector.slice(1).split(/[=\]]/)[0]; return this.getAttribute(key) !== null; }
      return this.tagName.toLowerCase() === selector.split('[')[0];
    }
    querySelectorAll(selector) {
      const all = [];
      const walk = element => { for (const child of element.children) { all.push(child); walk(child); } };
      walk(this); return all.filter(element => selector.split(',').some(part => element.matches(part.trim())));
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    closest(selector) { for (let item = this; item; item = item.parentElement) if (item.matches(selector)) return item; return null; }
  }
  document.createElement = tag => new Element(tag);
  document.body = new Element('body');
  document.getElementById = key => document.nodes.get(key) || null;
  document.querySelector = selector => document.body.querySelector(selector);
  document.querySelectorAll = selector => document.body.querySelectorAll(selector);
  for (const key of ['wiz-stage', 'wiz-back', 'wiz-progress', 'feed-list', 'feed-empty', 'feed-loading', 'load-more',
    'shipped', 'shipped-list', 'type-chips', 'status-chips', 'area-chips', 'sort-newest', 'search-input', 'auth-slot', 'item-root']) {
    const element = new Element(key.includes('back') || key === 'load-more' ? 'button' : 'div');
    element.setAttribute('id', key); document.body.appendChild(element);
  }
  document.body.appendChild(new Element('main'));
  return document;
}
function result(body, status = 200) { return { ok: status >= 200 && status < 300, status, json: async () => body }; }
function environment(kind, source, taxonomy, options = {}) {
  const document = dom(), sessionStorage = options.storage || storage();
  const Care = { esc: value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]), getMe: async () => ({ loggedIn: kind === 'wizard' }), renderAuthSlot() {},
    relativeTime: () => '1m ago', STATUS_LABEL: { open: 'Open' }, TAG_LABEL: {}, takePending: () => null,
    login() {}, stashPending() {}, vote: async () => ({ ok: true, body: { net: 1 } }) };
  const context = { document, sessionStorage, navigator: { userAgent: options.ua || 'Android Chrome/130', language: 'en', maxTouchPoints: 5 },
    location: { pathname: kind === 'board' ? '/' : '/report/', search: options.search || '', hash: '', replace() {}, reload() {} },
    history: { replaceState() {} }, URLSearchParams, AbortSignal, crypto: webcrypto,
    setTimeout, clearTimeout, Date, console, alert() {}, atob, btoa,
    fetch: options.fetch || (async url => url === '/data/taxonomy.json' ? result(taxonomy) : result({ question: null, items: [], shipped: [] })) };
  context.window = { Care, innerWidth: 390, setTimeout };
  const exports = kind === 'wizard' ? '{state,history,RENDER,goTo,back,goToPriorArt,submitReport,init,saveDraft,changedDraft,startAgain,ctxRows,removedCtx,collectClientCtx}' :
    kind === 'board' ? '{state,loadFeed,init,getItems:()=>loadedItems}' :
    '{init,postComment,readCommentDraft,rememberComment,load,getItem:()=>item}';
  source = source.replace(/  init\(\);\s*\}\)\(\);\s*$/, '  window.audit = ' + exports + ';\n})();');
  vm.createContext(context); vm.runInContext(source, context);
  return { api: context.window.audit, context, document, storage: sessionStorage };
}

test('iPhone and iPad browser details describe the actual device', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/130.0.0.0 Mobile/15E148 Safari/604.1';
  const e = environment('wizard', source('wizard'), taxonomy, { ua });
  assert.equal(e.api.collectClientCtx().os, 'ios');
  assert.equal(e.api.collectClientCtx().browser, 'chrome');
});
test('Report drafts survive reload with answers, title, and context; discard clears them', async () => {
  const saved = storage();
  const first = environment('wizard', source('wizard'), taxonomy, { storage: saved });
  await first.api.init();
  Object.assign(first.api.state, { flow: 'bug', area: 'exports-data', areaLabel: 'Exports',
    symptom: 'slow', frequency: 'sometimes', expected: 'Expected বাংলা <&>', actual: 'Actual α',
    freetext: 'Long text '.repeat(100), title: 'My edited title', titleEdited: true, ctx: { schema: 4 } });
  first.api.goTo('write');
  const reloaded = environment('wizard', source('wizard'), taxonomy, { storage: saved });
  await reloaded.api.init();
  assert.equal(reloaded.api.history.at(-1), 'write');
  for (const key of ['expected', 'actual', 'freetext', 'title']) assert.equal(reloaded.api.state[key], first.api.state[key]);
  assert.equal(reloaded.api.state.ctx.schema, 4);
  reloaded.api.startAgain();
  assert.equal(saved.getItem('rw_care_report_draft_v1'), null);
});
test('Schema and language are shown with other removable context', async () => {
  const e = environment('wizard', source('wizard'), taxonomy);
  await e.api.init();
  e.api.state.ctx = { v: '3.2', schema: 4 };
  const rows = e.api.ctxRows();
  assert.ok(rows.some(row => row.key === 'schema'));
  assert.ok(rows.some(row => row.key === 'lang'));
  e.api.removedCtx.add('schema');
  assert.ok(!e.api.ctxRows().some(row => row.key === 'schema'));
});
test('Failed submission retry keeps one key and saved confirmation survives reload', async () => {
  const requests = [], saved = storage();
  let attempts = 0;
  const fetch = async (url, options) => {
    if (url === '/data/taxonomy.json') return result(taxonomy);
    if (url === '/api/report') {
      requests.push(JSON.parse(options.body));
      if (++attempts === 1) throw new Error('Isolated connection failure');
      return result({ ok: true, itemId: 17, reportId: 22 });
    }
    return result({ question: null, items: [] });
  };
  const e = environment('wizard', source('wizard'), taxonomy, { storage: saved, fetch });
  await e.api.init();
  Object.assign(e.api.state, { flow: 'bug', area: 'exports-data', areaLabel: 'Exports', symptom: 'slow', frequency: 'once', freetext: 'Keep my input' });
  e.api.goTo('write');
  await e.api.submitReport(false);
  assert.equal(e.api.state.freetext, 'Keep my input');
  await e.api.submitReport(false);
  assert.equal(requests[0].submissionKey, requests[1].submissionKey);
  assert.equal(saved.getItem('rw_care_report_draft_v1'), null);
  const fresh = environment('wizard', source('wizard'), taxonomy, { storage: saved });
  await fresh.api.init();
  assert.equal(fresh.api.history.at(-1), 'confirm');
  assert.equal(fresh.api.state.resultItemId, 17);
});
test('Double submit sends one full matching report, including idea details', async () => {
  let release, calls = 0, payload;
  const fetch = async (url, options) => {
    if (url === '/data/taxonomy.json') return result(taxonomy);
    if (url === '/api/report') {
      calls++; payload = JSON.parse(options.body);
      await new Promise(resolve => { release = resolve; });
      return result({ ok: true, itemId: 17, reportId: 22 });
    }
    return result({ question: null, items: [] });
  };
  const e = environment('wizard', source('wizard'), taxonomy, { fetch });
  await e.api.init();
  Object.assign(e.api.state, { flow: 'idea', area: 'exports-data', areaLabel: 'Exports',
    kind: 'new_tool', ask: 'Export one faction', why: 'Less prep', doneLooksLike: 'One PDF',
    joinItemId: 17, ctx: { schema: 4 } });
  e.api.goTo('ask');
  const first = e.api.submitReport(true);
  await e.api.submitReport(true);
  assert.equal(calls, 1);
  release(); await first;
  assert.equal(payload.mode, 'join');
  assert.equal(payload.ask, 'Export one faction');
  assert.equal(payload.why, 'Less prep');
  assert.equal(payload.doneLooksLike, 'One PDF');
  assert.equal(payload.ctx.schema, 4);
});
test('A late matching response cannot undo Back navigation', async () => {
  let release;
  const e = environment('wizard', source('wizard'), taxonomy, { fetch: async url => {
    if (url === '/data/taxonomy.json') return result(taxonomy);
    await new Promise(resolve => { release = resolve; });
    return result({ items: [] });
  } });
  await e.api.init();
  Object.assign(e.api.state, { flow: 'bug', area: 'exports-data', areaLabel: 'Exports', symptom: 'slow' });
  e.api.goTo('symptom'); e.api.goTo('frequency');
  const matching = e.api.goToPriorArt();
  e.api.back();
  release(); await matching;
  assert.equal(e.api.history.at(-1), 'symptom');
});
test('The latest board search wins when responses arrive in reverse order', async () => {
  const pending = [];
  const e = environment('board', source('board'), taxonomy, { fetch: async url => new Promise(resolve => pending.push({ url, resolve })) });
  e.api.state.q = 'old';
  const older = e.api.loadFeed(true);
  e.api.state.q = 'new';
  const newer = e.api.loadFeed(true);
  const item = id => ({ id, title: 'Fixture ' + id, status: 'open', area: 'exports-data', net: 0, reportsCount: 1 });
  pending[1].resolve(result({ items: [item(2)], shipped: [], hasMore: false })); await newer;
  pending[0].resolve(result({ items: [item(1)], shipped: [], hasMore: false })); await older;
  assert.deepEqual(Array.from(e.api.getItems(), item => item.id), [2]);
});
test('A failed next-page request retries the same page and keeps existing rows', async () => {
  const urls = []; let pageAttempts = 0;
  const e = environment('board', source('board'), taxonomy, { fetch: async url => {
    if (url === '/data/taxonomy.json') return result(taxonomy);
    urls.push(url);
    const page = new URL(url, 'https://care.test').searchParams.get('page');
    if (page === '1' && ++pageAttempts === 1) throw new Error('Isolated outage');
    return result({ items: [{ id: page === '1' ? 2 : 1, title: 'Fixture', status: 'open', net: 0, reportsCount: 1 }],
      shipped: [], hasMore: page !== '1' });
  } });
  await e.api.init();
  await e.document.getElementById('load-more').click();
  assert.equal(e.api.state.page, 0);
  await e.document.getElementById('retry-feed').click();
  assert.equal(e.api.state.page, 1);
  assert.equal(urls.filter(url => url.includes('page=1')).length, 2);
  assert.deepEqual(Array.from(e.api.getItems(), item => item.id), [1, 2]);
});
test('Comment retry preserves the draft key and held-save confirmation is visible', async () => {
  const requests = []; let attempts = 0;
  const e = environment('item', source('item'), taxonomy, { search: '?id=9', fetch: async (url, options) => {
    if (url === '/data/taxonomy.json') return result(taxonomy);
    if (url === '/api/item/9') return result({ id: 9, title: 'Fixture', status: 'open', area: 'exports-data', reportsCount: 1, reports: [], comments: [], net: 0 });
    if (url === '/api/comment') {
      requests.push(JSON.parse(options.body));
      if (++attempts === 1) throw new Error('Isolated outage');
      return result({ ok: true, id: 55, held: true });
    }
    return result({});
  } });
  await e.api.init();
  const container = e.document.createElement('div'); container.className = 'commentbox';
  const textarea = e.document.createElement('textarea'), button = e.document.createElement('button');
  container.appendChild(textarea); container.appendChild(button);
  textarea.value = 'Keep my comment <&>';
  await e.api.postComment(null, textarea);
  assert.equal(textarea.value, 'Keep my comment <&>');
  assert.equal(e.api.readCommentDraft(null).body, textarea.value);
  await e.api.postComment(null, textarea);
  assert.equal(requests[0].submissionKey, requests[1].submissionKey);
  assert.equal(textarea.value, '');
  assert.match(e.document.getElementById('item-root').querySelector('.thread-status').textContent, /saved.*review/);
});
test('Recovery errors are visible and repeated clicks issue one code', async () => {
  let release, calls = 0;
  const e = environment('shared', source('care'), taxonomy, { fetch: async () => {
    calls++; await new Promise(resolve => { release = resolve; });
    return result({ error: 'Isolated outage' }, 503);
  } });
  const first = e.context.window.Care.issueRecovery();
  await e.context.window.Care.issueRecovery();
  assert.equal(calls, 1);
  release(); await first;
  assert.equal(e.document.querySelector('.care-auth-error').textContent, 'Isolated outage');
});

test('Identity service failures show a retry state and preserve saved drafts', async () => {
  const saved = storage();
  saved.setItem('rw_care_report_draft_v1', 'original preserved draft');
  const shared = environment('shared', source('care'), taxonomy, { storage: saved, fetch: async () => result({ error: 'Isolated outage' }, 503) });
  const identity = await shared.context.window.Care.getMe();
  assert.equal(identity.unavailable, true);
  const slot = shared.document.getElementById('auth-slot');
  shared.context.window.Care.renderAuthSlot(slot, identity);
  assert.ok(shared.document.getElementById('retry-identity'));
  assert.ok(!shared.document.getElementById('login-btn'));
  const wizard = environment('wizard', source('wizard'), taxonomy, { storage: saved });
  wizard.context.window.Care.getMe = async () => identity;
  await wizard.api.init();
  assert.ok(wizard.document.getElementById('retry-identity'));
  assert.equal(saved.getItem('rw_care_report_draft_v1'), 'original preserved draft');
});
