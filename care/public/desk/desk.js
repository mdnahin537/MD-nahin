// ★ CROWN JEWEL #3 — the Owner Desk cockpit (design §7). Ultra-dense, mono,
// keyboard-driven. The AI layers; it never replaces — every view here is the
// deterministic data, and works with zero AI. All data comes from the
// owner-gated /api/desk/* endpoints (a non-owner never reaches this page).

(function () {
  const C = window.Care;
  const $ = (id) => document.getElementById(id);

  let digest = null;   // { areas, synthesis }
  let queue = null;    // { queue: [...] }
  let selected = new Set(); // item ids ticked for a brief
  let rows = [];       // flat, keyboard-navigable list of {kind, id, el}
  let cursor = -1;

  const LAST_VISIT_KEY = 'rw_desk_last_visit';

  function toast(msg) {
    const t = $('desk-toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => (t.hidden = true), 2600);
  }

  async function api(path, opts) {
    const res = await fetch('/api/desk' + path, opts);
    if (!res.ok) {
      let msg = 'Action failed';
      try { msg = (await res.json()).error || msg; } catch {}
      throw new Error(msg);
    }
    return res.json();
  }

  // ---- header strip ----------------------------------------------------
  async function loadSummary() {
    const since = Number(localStorage.getItem(LAST_VISIT_KEY)) || Math.floor(Date.now() / 1000) - 7 * 86400;
    const data = await api('/summary?since=' + since);
    const s = data.summary;
    $('strip-summary').textContent =
      `${s.newReports} new reports · ${s.joins} joins · ${s.comments} comments · ${s.movers} movers ↑` +
      (s.holds ? ` · ${s.holds} held` : '');
    const u = data.usage;
    $('strip-gauge').innerHTML = gauge('req', u.workerRequests, u.limits.workerRequests) +
      gauge('writes', u.d1Writes, u.limits.d1Writes) + gauge('AI', u.aiCalls, u.limits.aiNeurons);
    // stamp this visit for next time
    localStorage.setItem(LAST_VISIT_KEY, String(Math.floor(Date.now() / 1000)));
  }
  function gauge(label, used, limit) {
    const pct = Math.min(100, Math.round((used / limit) * 100));
    const cls = pct > 80 ? 'hot' : pct > 50 ? 'warm' : 'ok';
    return `<span class="gauge gauge--${cls}" title="${used}/${limit}">${label} ${pct}%</span>`;
  }

  // ---- digest ------------------------------------------------------------
  // Design §7.2 target: readable in ~20-25 lines. At real scale the taxonomy
  // has more active areas than that fits, so the digest applies a floor
  // (an area with only one thread doesn't earn a full header) and a cap
  // (only the top DIGEST_AREA_CAP areas — already net-sorted server-side —
  // get shown in full). Everything past either line rolls into one
  // "+N more areas" entry that expands to the SAME per-area rendering, so
  // nothing is ever dropped — only deprioritized. Lossless: expand it and
  // every area, thread, and (via each thread's "open" link) every raw
  // report is still exactly one or two clicks away.
  const DIGEST_AREA_FLOOR = 2;
  const DIGEST_AREA_CAP = 7;

  async function loadDigest(refresh) {
    $('digest-body').innerHTML = '<div class="skeleton desk-skel"></div>';
    digest = await api('/digest', refresh ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' } : undefined);
    renderDigest();
  }
  function areaBlock(a) {
    const hdr =
      `<div class="area" data-area="${a.area}">` +
      `<button class="area__toggle" aria-expanded="false">▸</button>` +
      `<span class="area__name">${C.esc(areaLabel(a.area))}</span>` +
      `<span class="area__stat mono">${a.threads} threads · ${a.reports} reports · ${fmtNet(a.net)}</span>` +
      `</div>`;
    const threads = a.topThreads.map((t) => threadLine(t)).join('');
    return hdr + `<div class="area__threads" hidden>${threads}</div>`;
  }
  function renderDigest() {
    const allAreas = digest.areas.filter((a) => a.threads > 0);
    if (allAreas.length === 0) { $('digest-body').innerHTML = '<p class="desk-empty">No open threads yet.</p>'; return; }

    const headline = [];
    const rolledUp = [];
    for (const a of allAreas) {
      if (a.threads >= DIGEST_AREA_FLOOR && headline.length < DIGEST_AREA_CAP) headline.push(a);
      else rolledUp.push(a);
    }

    let html = headline.map(areaBlock).join('');
    if (rolledUp.length) {
      const threads = rolledUp.reduce((n, a) => n + a.threads, 0);
      const reports = rolledUp.reduce((n, a) => n + a.reports, 0);
      html +=
        `<div class="area area--rollup" data-area="__more">` +
        `<button class="area__toggle" aria-expanded="false">▸</button>` +
        `<span class="area__name">+${rolledUp.length} more area${rolledUp.length === 1 ? '' : 's'} <span class="area__rollup-hint">(lower activity)</span></span>` +
        `<span class="area__stat mono">${threads} threads · ${reports} reports</span>` +
        `</div>` +
        `<div class="area__threads" hidden>${rolledUp.map(areaBlock).join('')}</div>`;
    }
    $('digest-body').innerHTML = html;

    $('digest-body').querySelectorAll('.area__toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.area').nextElementSibling;
        const open = !wrap.hidden;
        wrap.hidden = open;
        btn.textContent = open ? '▸' : '▾';
        btn.setAttribute('aria-expanded', String(!open));
      });
    });
    wireThreadActions($('digest-body'));
    rebuildNav();
  }
  function threadLine(t) {
    const syn = digest.synthesis && digest.synthesis[t.id];
    const versions = Object.entries(t.versions || {}).map(([v, n]) => `v${v}×${n}`).join(' ');
    return (
      `<div class="thread" data-id="${t.id}" tabindex="-1">` +
      `<label class="thread__pick"><input type="checkbox" class="thread__cb" data-id="${t.id}"></label>` +
      `<span class="thread__serial mono">#${t.id}</span>` +
      `<span class="thread__title">${C.esc(t.title)}</span>` +
      `<span class="thread__stat mono">${t.reportsCount} GMs · ${fmtNet(t.net)}${t.vel >= 3 ? ' ↑vel ' + t.vel : ''}${versions ? ' · ' + versions : ''}</span>` +
      (syn ? `<div class="thread__ai">AI: ${C.esc(syn)}</div>` : '') +
      `<div class="thread__actions">` +
      statusSelect(t.id, t.status) +
      `<button class="desk-btn desk-btn--sm" data-act="brief" data-id="${t.id}">brief</button>` +
      `<a class="desk-btn desk-btn--sm" href="/item/?id=${t.id}" target="_blank">open</a>` +
      `</div>` +
      `</div>`
    );
  }
  function statusSelect(id, current) {
    const opts = ['open', 'planned', 'in_progress', 'shipped', 'declined']
      .map((s) => `<option value="${s}"${s === current ? ' selected' : ''}>${C.STATUS_LABEL[s]}</option>`).join('');
    return `<select class="status-sel" data-id="${id}">${opts}</select>`;
  }

  // ---- decision queue --------------------------------------------------
  async function loadQueue() {
    $('queue-body').innerHTML = '<div class="skeleton desk-skel"></div>';
    queue = await api('/queue');
    renderQueue();
  }
  function renderQueue() {
    const q = queue.queue;
    if (!q.length) { $('queue-body').innerHTML = '<p class="desk-empty">Nothing needs you right now. Nice.</p>'; return; }
    const groups = { merge: [], mover: [], hold: [], controversial: [], prolific: [] };
    for (const item of q) (groups[item.kind] || (groups[item.kind] = [])).push(item);

    let html = '';
    if (groups.merge.length) html += queueGroup('Merge suspects', groups.merge.map(mergeRow).join(''));
    if (groups.mover.length) html += queueGroup('Movers (not yet statused)', groups.mover.map(moverRow).join(''));
    if (groups.hold.length) html += queueGroup('Held — needs a look', groups.hold.map(holdRow).join(''));
    if (groups.controversial.length) html += queueGroup('Controversial', groups.controversial.map(controRow).join(''));
    if (groups.prolific.length) html += queueGroup('Possible spam bursts', groups.prolific.map(prolificRow).join(''));
    $('queue-body').innerHTML = html;
    wireQueueActions();
    rebuildNav();
  }
  function queueGroup(title, rowsHtml) {
    return `<div class="qgroup"><h2 class="qgroup__h">${title}</h2>${rowsHtml}</div>`;
  }
  function mergeRow(m) {
    return `<div class="qrow" data-kind="merge" data-loser="${m.loserId}" data-winner="${m.winnerId}" tabindex="-1">` +
      `<span class="qrow__body"><span class="mono">#${m.loserId}</span> looks like <span class="mono">#${m.winnerId}</span> · ${m.similarity}%<br><span class="qrow__sub">${C.esc(m.loserTitle)}</span></span>` +
      `<span class="qrow__actions"><button class="desk-btn desk-btn--sm" data-act="merge" data-loser="${m.loserId}" data-winner="${m.winnerId}">Merge →</button>` +
      `<button class="desk-btn desk-btn--sm desk-btn--ghost" data-act="dismiss">Not same</button></span></div>`;
  }
  function moverRow(m) {
    return `<div class="qrow" data-kind="mover" data-id="${m.id}" tabindex="-1">` +
      `<span class="qrow__body"><span class="mono">#${m.id}</span> ↑vel ${m.vel} · ${fmtNet(m.net)} · ${m.reportsCount} GMs<br><span class="qrow__sub">${C.esc(m.title)}</span></span>` +
      `<span class="qrow__actions">${statusSelect(m.id, 'open')}<button class="desk-btn desk-btn--sm" data-act="brief" data-id="${m.id}">brief</button></span></div>`;
  }
  function holdRow(h) {
    const label = h.target === 'item' ? `item #${h.id} — ${C.esc((h.title || '').slice(0, 60))}` : `comment on #${h.itemId}: ${C.esc((h.body || '').slice(0, 60))}`;
    return `<div class="qrow" data-kind="hold" tabindex="-1">` +
      `<span class="qrow__body">${label}</span>` +
      `<span class="qrow__actions">` +
      (h.target === 'item'
        ? `<button class="desk-btn desk-btn--sm" data-act="unhide" data-id="${h.id}">Approve</button><button class="desk-btn desk-btn--sm desk-btn--ghost" data-act="remove" data-id="${h.id}">Remove</button>`
        : `<span class="qrow__sub">review on the item page</span>`) +
      `</span></div>`;
  }
  function controRow(c) {
    return `<div class="qrow" data-kind="controversial" data-id="${c.id}" tabindex="-1">` +
      `<span class="qrow__body"><span class="mono">#${c.id}</span> ${fmtNet(c.net)} but ${c.reportsCount} GMs — read it<br><span class="qrow__sub">${C.esc(c.title)}</span></span>` +
      `<span class="qrow__actions"><a class="desk-btn desk-btn--sm" href="/item/?id=${c.id}" target="_blank">open</a></span></div>`;
  }
  function prolificRow(p) {
    return `<div class="qrow" data-kind="prolific" tabindex="-1">` +
      `<span class="qrow__body">${C.esc(p.sub)} filed ${p.count} items today</span>` +
      `<span class="qrow__actions"><button class="desk-btn desk-btn--sm desk-btn--ghost" data-act="ban" data-sub="${C.esc(p.sub)}">Ban</button></span></div>`;
  }

  // ---- actions ---------------------------------------------------------
  function wireThreadActions(root) {
    root.querySelectorAll('.status-sel').forEach((sel) => {
      sel.addEventListener('change', async () => {
        try { await api('/item/' + sel.dataset.id + '/status', postBody({ status: sel.value })); toast(`#${sel.dataset.id} → ${sel.value}`); }
        catch (e) { toast(e.message); }
      });
    });
    root.querySelectorAll('[data-act="brief"]').forEach((b) => b.addEventListener('click', () => composeBrief([Number(b.dataset.id)])));
    root.querySelectorAll('.thread__cb').forEach((cb) => cb.addEventListener('change', () => {
      const id = Number(cb.dataset.id);
      if (cb.checked) selected.add(id); else selected.delete(id);
    }));
  }
  function wireQueueActions() {
    $('queue-body').querySelectorAll('[data-act]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const act = btn.dataset.act;
        try {
          if (act === 'merge') { await api(`/item/${btn.dataset.loser}/merge`, postBody({ intoId: Number(btn.dataset.winner) })); toast('Merged'); await loadQueue(); }
          else if (act === 'dismiss') { btn.closest('.qrow').style.opacity = 0.4; btn.closest('.qrow').querySelectorAll('button').forEach((x) => x.disabled = true); }
          else if (act === 'unhide') { await api(`/item/${btn.dataset.id}/hide`, postBody({ hidden: false })); toast('Approved'); await loadQueue(); }
          else if (act === 'remove') { await api(`/item/${btn.dataset.id}/remove`, postBody({})); toast('Removed'); await loadQueue(); }
          else if (act === 'ban') { if (confirm('Ban ' + btn.dataset.sub + '?')) { await api(`/user/${encodeURIComponent(btn.dataset.sub)}/ban`, postBody({})); toast('Banned'); await loadQueue(); } }
          else if (act === 'brief') { composeBrief([Number(btn.dataset.id)]); }
        } catch (e) { toast(e.message); }
      });
    });
    $('queue-body').querySelectorAll('.status-sel').forEach((sel) => sel.addEventListener('change', async () => {
      try { await api('/item/' + sel.dataset.id + '/status', postBody({ status: sel.value })); toast(`#${sel.dataset.id} → ${sel.value}`); } catch (e) { toast(e.message); }
    }));
  }
  function postBody(obj) { return { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }

  // ---- build brief -----------------------------------------------------
  async function composeBrief(ids) {
    switchTab('brief');
    const useIds = ids && ids.length ? ids : parseIds($('brief-ids').value);
    if (!useIds.length) { $('brief-out').textContent = 'Pick at least one thread.'; return; }
    $('brief-ids').value = useIds.join(', ');
    $('brief-out').textContent = 'Composing…';
    try {
      const data = await api('/brief', postBody({ items: useIds }));
      $('brief-out').textContent = data.text;
      $('brief-copy').hidden = false;
    } catch (e) { $('brief-out').textContent = e.message; }
  }
  function parseIds(str) { return (str || '').split(/[,\s]+/).map(Number).filter(Number.isInteger); }

  // ---- keyboard navigation (§7.6) --------------------------------------
  function rebuildNav() {
    const active = document.querySelector('.desk-panel:not([hidden])');
    rows = Array.from(active.querySelectorAll('.thread, .qrow'));
    cursor = -1;
  }
  function moveCursor(delta) {
    if (!rows.length) return;
    if (cursor >= 0 && rows[cursor]) rows[cursor].classList.remove('is-cursor');
    cursor = Math.max(0, Math.min(rows.length - 1, cursor + delta));
    const el = rows[cursor];
    el.classList.add('is-cursor');
    el.scrollIntoView({ block: 'nearest' });
    el.focus();
  }
  function currentRow() { return cursor >= 0 ? rows[cursor] : null; }

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key === 'j') { moveCursor(1); e.preventDefault(); }
    else if (e.key === 'k') { moveCursor(-1); e.preventDefault(); }
    else if (e.key === '1') switchTab('digest');
    else if (e.key === '2') switchTab('queue');
    else if (e.key === '3') switchTab('brief');
    else if (e.key === 'b') { const r = currentRow(); if (r && r.dataset.id) composeBrief([Number(r.dataset.id)]); }
    else if (e.key === 's') { const r = currentRow(); const sel = r && r.querySelector('.status-sel'); if (sel) sel.focus(); }
    else if (e.key === 'm') { const r = currentRow(); const mb = r && r.querySelector('[data-act="merge"]'); if (mb) mb.click(); }
  });

  // ---- tabs ------------------------------------------------------------
  function switchTab(name) {
    document.querySelectorAll('.desk-tab').forEach((t) => t.classList.toggle('is-active', t.dataset.tab === name));
    document.querySelectorAll('.desk-panel').forEach((p) => (p.hidden = p.id !== 'tab-' + name));
    if (name === 'queue' && !queue) loadQueue();
    rebuildNav();
  }

  function areaLabel(key) {
    if (!window._tax) return key;
    const a = window._tax.areas.find((x) => x.key === key);
    return a ? a.label : key;
  }
  function fmtNet(n) { return (n >= 0 ? '+' : '') + n; }

  // ---- init ------------------------------------------------------------
  async function init() {
    window._tax = await fetch('/data/taxonomy.json').then((r) => r.json()).catch(() => null);
    document.querySelectorAll('.desk-tab').forEach((t) => t.addEventListener('click', () => switchTab(t.dataset.tab)));
    $('refresh-digest').addEventListener('click', async () => { $('refresh-digest').disabled = true; await loadDigest(true); $('refresh-digest').disabled = false; toast('Digest refreshed'); });
    $('brief-go').addEventListener('click', () => composeBrief(parseIds($('brief-ids').value)));
    $('brief-copy').addEventListener('click', () => {
      navigator.clipboard.writeText($('brief-out').textContent).then(() => toast('Copied — paste it to your build AI'));
    });
    try {
      await Promise.all([loadSummary(), loadDigest(false)]);
    } catch (e) {
      $('digest-body').innerHTML = '<p class="desk-empty">Could not load. ' + C.esc(e.message) + '</p>';
    }
  }
  init();
})();
