// ★ CROWN JEWEL #1 — the intake wizard (design §5). The interrogation is
// disguised as navigation: every tap of "Where? → Which part? → What
// happened?" IS the data, so a complete, useful bug report is ≤6 taps and
// zero keystrokes. Free text is garnish, never the payload. One decision per
// screen, Back always, Skip wherever text is involved, big tap targets.

(function () {
  const C = window.Care;
  const stage = document.getElementById('wiz-stage');
  const backBtn = document.getElementById('wiz-back');
  const progressEl = document.getElementById('wiz-progress');

  let me = { loggedIn: false };
  let taxonomy = null;

  const state = {
    flow: null, // 'bug' | 'idea'
    area: null, areaLabel: null,
    part: null, partLabel: null,
    symptom: null, symptomLabel: null, symptomDetail: null,
    frequency: null,
    kind: null,
    importance: null,
    expected: '', actual: '', freetext: '',
    ask: '', why: '', doneLooksLike: '',
    title: null, titleEdited: false,
    ctx: {}, clientCtx: {},
    joinItemId: null,
    // for the confirmation screen
    resultItemId: null, resultReportId: null,
  };

  const history = []; // screen-name stack for Back

  // ---- phase mapping for the 4-dot progress strip ----------------------
  const PHASE = {
    signin: 0, branch: 0,
    area: 1, part: 1, symptom: 1, frequency: 1, kind: 1,
    priorart: 2, write: 2, ask: 2,
    confirm: 3,
  };
  function renderProgress(screen) {
    const phase = PHASE[screen] ?? 0;
    progressEl.innerHTML = [0, 1, 2, 3]
      .map((i) => `<span class="dot${i <= phase ? ' dot--on' : ''}"></span>`)
      .join('');
  }

  // ---- context handoff (#ctx fragment) ---------------------------------
  function parseCtxFragment() {
    const hash = location.hash || '';
    const m = hash.match(/[#&]ctx=([^&]+)/);
    if (!m) return {};
    try {
      const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
      return JSON.parse(decodeURIComponent(escape(atob(b64 + pad))));
    } catch {
      try {
        // simpler decode path if the above escape() route fails
        return JSON.parse(atob(m[1].replace(/-/g, '+').replace(/_/g, '/')));
      } catch {
        return {};
      }
    }
  }
  function collectClientCtx() {
    const ua = navigator.userAgent || '';
    let os = 'other';
    if (/Windows/i.test(ua)) os = 'windows';
    else if (/Mac OS X|Macintosh/i.test(ua)) os = 'mac';
    else if (/Android/i.test(ua)) os = 'android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'ios';
    else if (/Linux/i.test(ua)) os = 'linux';
    let browser = 'other';
    if (/Edg\//i.test(ua)) browser = 'edge';
    else if (/Chrome\//i.test(ua)) browser = 'chrome';
    else if (/Firefox\//i.test(ua)) browser = 'firefox';
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'safari';
    const w = window.innerWidth;
    const screen = w < 600 ? 'phone' : w < 1024 ? 'tablet' : 'desktop';
    return { os, browser, screen, lang: (navigator.language || 'en').slice(0, 5) };
  }

  // ---- title composer (mirror of server lib/titles.js) -----------------
  const SYMPTOM_SHORT = {
    nothing_happened: "didn't respond to a click", wrong_thing: 'did the wrong thing',
    work_disappeared: "work didn't save", display_broken: 'display looks broken',
    froze_crashed: 'froze or crashed', slow: 'running slow', error_message: 'showed an error',
    something_else: 'something felt off', ai_wrong_answer: 'AI gave a bad answer', ai_call_failed: 'AI call failed',
    wont_import: "file wouldn't import", pdf_missing_content: 'PDF missing content', license_wont_activate: "license won't activate",
  };
  const FREQ_LABEL = { every_time: 'every time', sometimes: 'sometimes', once: 'once' };
  function composeTitle() {
    if (state.flow === 'bug') {
      const sym = SYMPTOM_SHORT[state.symptom] || 'something went wrong';
      const f = FREQ_LABEL[state.frequency];
      return f ? `${state.areaLabel} — ${sym} (${f})` : `${state.areaLabel} — ${sym}`;
    }
    const ask = (state.ask || '').trim();
    if (ask) return `${state.areaLabel} — ${ask.length > 70 ? ask.slice(0, 67) + '…' : ask}`;
    return `${state.areaLabel} — new idea`;
  }

  // ---- navigation ------------------------------------------------------
  function goTo(screen, { push = true } = {}) {
    if (push && history[history.length - 1] !== screen) history.push(screen);
    backBtn.hidden = history.length <= 1 || screen === 'confirm';
    renderProgress(screen);
    RENDER[screen]();
    stage.scrollTop = 0;
  }
  function back() {
    if (history.length <= 1) return;
    history.pop();
    const prev = history[history.length - 1];
    goTo(prev, { push: false });
  }
  backBtn.addEventListener('click', back);

  // ---- screen builders (return DOM string; wire after inject) ----------
  function screen(html) { stage.innerHTML = html; }

  function tileGrid(items, onPick, { extraFirst } = {}) {
    const all = extraFirst ? [extraFirst, ...items] : items;
    const grid = document.createElement('div');
    grid.className = 'tilegrid';
    for (const it of all) {
      const b = document.createElement('button');
      b.className = 'tile';
      b.innerHTML =
        `<span class="tile__icon" aria-hidden="true">${icon(it.icon)}</span>` +
        `<span class="tile__label">${C.esc(it.label)}</span>`;
      b.addEventListener('click', () => onPick(it));
      grid.appendChild(b);
    }
    return grid;
  }
  // Minimal inline icon set (no icon-font dependency) — a small glyph per area.
  function icon() { return '◆'; }

  function chipList(items, onPick) {
    const wrap = document.createElement('div');
    wrap.className = 'choicechips';
    for (const it of items) {
      const b = document.createElement('button');
      b.className = 'choicechip';
      b.textContent = it.label;
      b.addEventListener('click', () => onPick(it, b));
      wrap.appendChild(b);
    }
    return wrap;
  }

  function heading(text, sub) {
    return `<h1 class="wiz__h">${C.esc(text)}</h1>` + (sub ? `<p class="wiz__sub">${C.esc(sub)}</p>` : '');
  }
  function skipRow(label, onSkip) {
    const div = document.createElement('div');
    div.className = 'wiz__skip';
    const b = document.createElement('button');
    b.className = 'linkbtn';
    b.textContent = label || 'Skip';
    b.addEventListener('click', onSkip);
    div.appendChild(b);
    return div;
  }

  // ---- RENDERERS -------------------------------------------------------
  const RENDER = {};

  RENDER.signin = function () {
    screen(
      '<div class="wiz__screen wiz__center">' +
      '<div class="wiz__mark mono">RW</div>' +
      heading('Tell Hunter what you found', 'Sign in so your report has a name we can follow up with. Reports are public; your email never is.') +
      '<button class="btn btn-primary btn--big" id="wiz-google">Continue with Google</button>' +
      '<p class="wiz__fine">One quick step, then it’s all taps.</p>' +
      '</div>'
    );
    document.getElementById('wiz-google').addEventListener('click', () => {
      // preserve the #ctx fragment across the round trip
      C.login(location.pathname + location.search + location.hash);
    });
  };

  RENDER.branch = function () {
    screen('<div class="wiz__screen">' + heading('What brings you here?', 'One tap to start.') + '<div id="branch-slot"></div></div>');
    const grid = tileGrid(
      [
        { key: 'bug', label: 'Something’s broken', icon: 'bug' },
        { key: 'idea', label: 'I have an idea', icon: 'idea' },
      ],
      (it) => {
        state.flow = it.key;
        goTo('area');
      }
    );
    grid.classList.add('tilegrid--two');
    document.getElementById('branch-slot').appendChild(grid);
  };

  RENDER.area = function () {
    const isIdea = state.flow === 'idea';
    const title = isIdea ? 'What’s it about?' : 'Where were you?';
    const sub = isIdea ? 'Pick the closest area — or something brand new.' : 'Pick the part of RealmWright where it happened.';
    screen('<div class="wiz__screen">' + heading(title, sub) + '<div id="area-slot"></div></div>');
    const extraFirst = isIdea ? { key: taxonomy.ideaExtraTile.key, label: taxonomy.ideaExtraTile.label, icon: taxonomy.ideaExtraTile.icon } : null;
    const grid = tileGrid(taxonomy.areas, (it) => {
      state.area = it.key; state.areaLabel = it.label;
      state.part = null; state.partLabel = null;
      if (isIdea) {
        goTo('kind');
      } else if (it.key === 'other') {
        goTo('symptom'); // "not sure" skips the part step
      } else {
        goTo('part');
      }
    }, { extraFirst });
    // handle the idea "new" tile specially
    if (extraFirst) {
      grid.firstChild.addEventListener('click', () => {
        state.area = extraFirst.key; state.areaLabel = extraFirst.label; state.part = null;
        goTo('kind');
      }, true);
    }
    document.getElementById('area-slot').appendChild(grid);
  };

  RENDER.part = function () {
    const areaObj = taxonomy.areas.find((a) => a.key === state.area);
    const parts = (areaObj && areaObj.parts) || [];
    const items = parts.map((p) => ({ key: p.key, label: p.label, children: p.children }))
      .concat([{ key: null, label: 'Not sure' }]);
    screen('<div class="wiz__screen">' + heading('Which part?', 'Closest one is fine.') + '<div id="part-slot"></div></div>');
    const list = chipList(items, (it) => {
      state.part = it.key; state.partLabel = it.label;
      if (it.children && it.children.length) {
        renderSubPart(it);
      } else {
        goTo('symptom');
      }
    });
    document.getElementById('part-slot').appendChild(list);
  };
  function renderSubPart(parent) {
    screen('<div class="wiz__screen">' + heading(parent.label, 'Which one?') + '<div id="subpart-slot"></div></div>');
    const items = parent.children.map((c) => ({ key: c.key, label: c.label })).concat([{ key: parent.key, label: 'Not sure' }]);
    const list = chipList(items, (it) => {
      state.part = it.key; state.partLabel = it.label;
      goTo('symptom');
    });
    document.getElementById('subpart-slot').appendChild(list);
    // Back from a sub-part returns to the part list, not the area
    history.push('part');
    backBtn.hidden = false;
  }

  RENDER.symptom = function () {
    const universal = taxonomy.symptomsUniversal;
    const areaSpecific = (taxonomy.symptomsByArea && taxonomy.symptomsByArea[state.area]) || [];
    const items = [...universal, ...areaSpecific];
    screen('<div class="wiz__screen">' + heading('What happened?', 'The closest description.') + '<div id="sym-slot"></div></div>');
    const list = chipList(items, (it, btn) => {
      state.symptom = it.key; state.symptomLabel = it.label;
      state.symptomDetail = null;
      if (it.followups && it.followups.length) {
        revealSymptomFollowup(it, btn);
      } else {
        goTo('frequency');
      }
    });
    document.getElementById('sym-slot').appendChild(list);
  };
  function revealSymptomFollowup(sym, btn) {
    // inline follow-up row (not a new screen), per §5.2 B3
    btn.classList.add('is-active');
    const existing = document.querySelector('.symptom-followup');
    if (existing) existing.remove();
    const row = document.createElement('div');
    row.className = 'symptom-followup';
    row.innerHTML = '<p class="wiz__inline-q">When?</p>';
    const list = chipList(sym.followups.map((f) => ({ key: f.key, label: f.label })), (it) => {
      state.symptomDetail = it.key;
      goTo('frequency');
    });
    row.appendChild(list);
    btn.parentElement.insertAdjacentElement('afterend', row);
    row.scrollIntoView({ block: 'nearest' });
  }

  RENDER.frequency = function () {
    screen('<div class="wiz__screen">' + heading('How often?', 'Last one before we check for matches.') + '<div id="freq-slot"></div></div>');
    const list = chipList(taxonomy.frequency, (it) => {
      state.frequency = it.key;
      goToPriorArt();
    });
    document.getElementById('freq-slot').appendChild(list);
  };

  RENDER.kind = function () {
    screen('<div class="wiz__screen">' + heading('What kind of idea?', 'Pick one.') + '<div id="kind-slot"></div></div>');
    const list = chipList(taxonomy.ideaKinds, (it) => {
      state.kind = it.key;
      goToPriorArt();
    });
    document.getElementById('kind-slot').appendChild(list);
  };

  // ---- prior art (B5 / I3): fetch matches, offer join ------------------
  async function goToPriorArt() {
    // fetch in the background; if none, skip silently to the write/ask screen
    let matches = [];
    try {
      const p = new URLSearchParams({ type: state.flow, area: state.area });
      if (state.part) p.set('part', state.part);
      const res = await fetch('/api/related?' + p.toString());
      const data = await res.json();
      matches = data.items || [];
    } catch { matches = []; }
    if (matches.length === 0) {
      goTo(state.flow === 'bug' ? 'write' : 'ask');
      return;
    }
    state._matches = matches;
    goTo('priorart');
  }

  RENDER.priorart = function () {
    const matches = state._matches || [];
    const rows = matches.map((m) =>
      '<button class="priorart__row" data-id="' + m.id + '">' +
      '<span class="priorart__serial mono">#' + m.id + '</span>' +
      '<span class="priorart__body"><span class="priorart__title">' + C.esc(m.title) + '</span>' +
      '<span class="priorart__meta">' + (m.reportsCount === 1 ? '1 GM' : m.reportsCount + ' GMs') + ' · ' + statusLabel(m.status) + '</span></span>' +
      '<span class="priorart__join">This is mine →</span>' +
      '</button>'
    ).join('');
    screen(
      '<div class="wiz__screen">' +
      heading('GMs already reported these', 'Tap one if it’s the same — your voice adds to it.') +
      '<div class="priorart">' + rows + '</div>' +
      '<div class="wiz__actions"><button class="btn" id="mine-different">Mine is different</button></div>' +
      '</div>'
    );
    stage.querySelectorAll('.priorart__row').forEach((row) => {
      row.addEventListener('click', () => joinItem(Number(row.dataset.id)));
    });
    document.getElementById('mine-different').addEventListener('click', () => {
      goTo(state.flow === 'bug' ? 'write' : 'ask');
    });
  };

  async function joinItem(itemId) {
    state.joinItemId = itemId;
    // slim path: submit the join immediately (their taps already carry the data),
    // optional details can still be added on the confirm screen later.
    await submitReport(true);
  }

  // ---- write (B6, bug) -------------------------------------------------
  RENDER.write = function () {
    state.title = state.titleEdited ? state.title : composeTitle();
    screen(
      '<div class="wiz__screen">' +
      heading('Anything to add?', 'All optional — your taps already told the story.') +
      '<div class="writefields">' +
      field('expected', 'What did you expect?', state.expected) +
      field('actual', 'What actually happened?', state.actual) +
      textarea('freetext', 'Anything else, in your own words', state.freetext) +
      '</div>' +
      contextCard() +
      titlePreview() +
      '<div class="wiz__actions"><button class="btn btn-primary btn--big" id="send">Send report</button></div>' +
      '</div>'
    );
    wireWriteScreen();
  };

  // ---- ask (I4, idea) --------------------------------------------------
  RENDER.ask = function () {
    state.title = state.titleEdited ? state.title : composeTitle();
    screen(
      '<div class="wiz__screen">' +
      heading('What’s the idea?', 'One line is plenty. The rest is optional.') +
      '<div class="writefields">' +
      field('ask', 'What should it do?', state.ask, 'Let me export just one faction as its own PDF') +
      field('why', 'What would it let you do at your table? (optional)', state.why) +
      field('doneLooksLike', 'What does “done” look like? (optional)', state.doneLooksLike) +
      '</div>' +
      '<div class="importance"><p class="wiz__inline-q">How much would you use it?</p><div id="imp-slot"></div></div>' +
      contextCard() +
      titlePreview() +
      '<div class="wiz__actions"><button class="btn btn-primary btn--big" id="send">Send idea</button></div>' +
      '</div>'
    );
    const impList = chipList(taxonomy.importance, (it, btn) => {
      state.importance = it.key;
      impList.querySelectorAll('.choicechip').forEach((c) => c.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
    if (state.importance) {
      const idx = taxonomy.importance.findIndex((i) => i.key === state.importance);
      if (idx >= 0) impList.children[idx].classList.add('is-active');
    }
    document.getElementById('imp-slot').appendChild(impList);
    wireWriteScreen();
  };

  function field(name, label, value, placeholder) {
    return (
      '<label class="wfield"><span class="wfield__label">' + C.esc(label) + '</span>' +
      '<input class="wfield__input" data-field="' + name + '" value="' + C.esc(value || '') + '"' +
      (placeholder ? ' placeholder="' + C.esc(placeholder) + '"' : '') + ' maxlength="300"></label>'
    );
  }
  function textarea(name, label, value) {
    return (
      '<label class="wfield"><span class="wfield__label">' + C.esc(label) + '</span>' +
      '<textarea class="wfield__input wfield__area" data-field="' + name + '" rows="2" maxlength="2000">' + C.esc(value || '') + '</textarea></label>'
    );
  }

  function contextCard() {
    const rows = ctxRows();
    if (rows.length === 0) return '';
    return (
      '<div class="ctxcard" id="ctxcard">' +
      '<div class="ctxcard__head">Attached so Hunter can reproduce this</div>' +
      '<div class="ctxcard__rows">' +
      rows.map((r) => '<span class="ctxpill" data-key="' + r.key + '">' + C.esc(r.label) +
        '<button class="ctxpill__x" aria-label="Remove ' + C.esc(r.label) + '">✕</button></span>').join('') +
      '</div>' +
      '<div class="ctxcard__note">Sending to RealmWright’s community server.</div>' +
      '</div>'
    );
  }
  function ctxRows() {
    const rows = [];
    const push = (key, label) => { if (label) rows.push({ key, label }); };
    push('v', state.ctx.v && ('v' + state.ctx.v));
    push('build', state.ctx.build && (state.ctx.build === 'demo' ? 'Demo build' : 'Full build'));
    push('mode', state.ctx.mode && (cap(state.ctx.mode) + ' mode'));
    push('theme', state.ctx.theme && cap(state.ctx.theme));
    push('ai', state.ctx.ai && (state.ctx.ai === 'none' ? 'No AI' : cap(state.ctx.ai)));
    push('os', state.clientCtx.os && cap(state.clientCtx.os));
    push('browser', state.clientCtx.browser && cap(state.clientCtx.browser));
    push('screen', state.clientCtx.screen && cap(state.clientCtx.screen));
    // filter out the ones the user removed
    return rows.filter((r) => !removedCtx.has(r.key));
  }
  const removedCtx = new Set();
  function cap(s) { return s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : s; }

  function titlePreview() {
    const t = state.title || composeTitle();
    return (
      '<div class="titleprev"><span class="titleprev__label">Title (tap to edit)</span>' +
      '<input class="titleprev__input" id="title-input" value="' + C.esc(t) + '" maxlength="300"></div>'
    );
  }

  function wireWriteScreen() {
    stage.querySelectorAll('[data-field]').forEach((el) => {
      el.addEventListener('input', () => {
        state[el.dataset.field] = el.value;
        if (!state.titleEdited) {
          const ti = document.getElementById('title-input');
          if (ti) ti.value = composeTitle();
        }
      });
    });
    const ti = document.getElementById('title-input');
    if (ti) ti.addEventListener('input', () => { state.titleEdited = true; state.title = ti.value; });
    stage.querySelectorAll('.ctxpill__x').forEach((x) => {
      x.addEventListener('click', (e) => {
        e.preventDefault();
        const key = x.closest('.ctxpill').dataset.key;
        removedCtx.add(key);
        const card = document.getElementById('ctxcard');
        const fresh = document.createElement('div');
        fresh.innerHTML = contextCard();
        if (card) {
          if (fresh.firstChild) card.replaceWith(fresh.firstChild); else card.remove();
          // rewire the new card's remove buttons
          stage.querySelectorAll('.ctxpill__x').forEach((nx) => {
            nx.addEventListener('click', (ev) => {
              ev.preventDefault();
              removedCtx.add(nx.closest('.ctxpill').dataset.key);
              RENDER[state.flow === 'bug' ? 'write' : 'ask']();
            });
          });
        }
      });
    });
    const send = document.getElementById('send');
    if (send) send.addEventListener('click', () => submitReport(false));
  }

  // ---- submit ----------------------------------------------------------
  async function submitReport(isJoin) {
    const btn = document.getElementById('send');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    const filteredCtx = {};
    for (const [k, v] of Object.entries(state.ctx)) if (!removedCtx.has(k)) filteredCtx[k] = v;
    const filteredClientCtx = {};
    for (const [k, v] of Object.entries(state.clientCtx)) if (!removedCtx.has(k)) filteredClientCtx[k] = v;

    const payload = isJoin
      ? { mode: 'join', joinItemId: state.joinItemId, type: state.flow, area: state.area, part: state.part }
      : {
          mode: 'create', type: state.flow, area: state.area, part: state.part,
          symptom: state.symptom, symptomDetail: state.symptomDetail, frequency: state.frequency,
          expected: state.expected, actual: state.actual, freetext: state.freetext,
          ideaKind: state.kind, ask: state.ask, why: state.why, doneLooksLike: state.doneLooksLike,
          importance: state.importance,
          title: state.titleEdited ? state.title : undefined,
          ctx: filteredCtx, clientCtx: filteredClientCtx,
        };

    let data;
    try {
      const res = await fetch('/api/report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = state.flow === 'bug' ? 'Send report' : 'Send idea'; }
      showError(err.message);
      return;
    }
    state.resultItemId = data.itemId;
    state.resultReportId = data.reportId || null;
    goTo('confirm');
  }

  function showError(msg) {
    const el = document.createElement('div');
    el.className = 'wiz__error';
    el.textContent = msg || 'Something went wrong — please try again.';
    stage.querySelector('.wiz__screen')?.prepend(el);
  }

  // ---- confirmation + micro-interview (B7 / I5) ------------------------
  RENDER.confirm = function () {
    const id = state.resultItemId;
    screen(
      '<div class="wiz__screen wiz__center">' +
      '<div class="confirm__check" aria-hidden="true">✓</div>' +
      '<h1 class="wiz__h">Filed as <span class="mono">#' + id + '</span></h1>' +
      '<p class="wiz__sub">GMs who agree will push it up Hunter’s list.</p>' +
      '<div id="micro-slot"></div>' +
      '<div class="confirm__actions">' +
      '<a class="btn btn-primary" href="/item/?id=' + id + '">Watch #' + id + '</a>' +
      '<a class="btn" href="/">Back to the board</a>' +
      '</div>' +
      '</div>'
    );
    backBtn.hidden = true;
    maybeAskMicroInterview();
  };

  async function maybeAskMicroInterview() {
    // Both the create and the join response always include the new report's
    // id (report.js returns reportId on both paths), stashed here as
    // state.resultReportId by submitReport. If it's somehow absent, skip
    // gracefully — the confirmation is already on screen and the
    // micro-interview must never block it.
    const reportId = state.resultReportId || null;
    if (!reportId) return; // nothing to enrich; confirmation already complete
    let asked = 0;
    await askOne(reportId);

    async function askOne(reportId) {
      if (asked >= 2) return;
      let q = null;
      try {
        const res = await fetch('/api/report/' + reportId + '/followup-question');
        const data = await res.json();
        q = data.question;
      } catch { q = null; }
      if (!q) return; // AI down or no gap → nothing extra shows (instant, never blocks)
      renderMicro(q, reportId);
    }

    function renderMicro(q, reportId) {
      const slot = document.getElementById('micro-slot');
      if (!slot) return;
      const box = document.createElement('div');
      box.className = 'micro';
      box.innerHTML = '<p class="micro__q">One more tap helps Hunter fix this faster (optional):</p>' +
        '<p class="micro__prompt">' + C.esc(q.prompt) + '</p>';
      const opts = document.createElement('div');
      opts.className = 'micro__opts';
      for (const o of q.options) {
        const b = document.createElement('button');
        b.className = 'choicechip';
        b.textContent = o.label;
        b.addEventListener('click', async () => {
          asked += 1;
          opts.querySelectorAll('button').forEach((x) => (x.disabled = true));
          b.classList.add('is-active');
          try {
            await fetch('/api/report/' + reportId + '/followup', {
              method: 'PATCH', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ q: q.q, a: o.key }),
            });
          } catch {}
          box.remove();
          await askOne(reportId); // maybe one more (max 2)
        });
        opts.appendChild(b);
      }
      const skip = document.createElement('button');
      skip.className = 'linkbtn micro__skip';
      skip.textContent = 'Skip';
      skip.addEventListener('click', () => box.remove());
      box.appendChild(opts);
      box.appendChild(skip);
      slot.appendChild(box);
    }
  }

  function statusLabel(s) { return C.STATUS_LABEL[s] || s; }

  // ---- init ------------------------------------------------------------
  async function init() {
    state.ctx = parseCtxFragment();
    state.clientCtx = collectClientCtx();

    const [meRes, taxRes] = await Promise.all([
      C.getMe(),
      fetch('/data/taxonomy.json').then((r) => r.json()).catch(() => null),
    ]);
    me = meRes; taxonomy = taxRes;

    if (!taxonomy) {
      stage.innerHTML = '<div class="wiz__screen wiz__center"><p>Couldn’t load the form. <a href="/">Back to the board</a></p></div>';
      return;
    }

    if (!me.loggedIn) {
      goTo('signin');
    } else {
      goTo('branch');
    }
  }

  init();
})();
