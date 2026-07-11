// The public board (design §6, §8). Renders the Top-10 module (dominant
// anchor), shipped strip, and the woven feed with serials/tags/status chips;
// filters, search, sort toggle, pagination; inline agree/disagree with
// login-on-first-tap and post-login replay at the same scroll position.

(function () {
  const C = window.Care;
  const feedList = document.getElementById('feed-list');
  const feedEmpty = document.getElementById('feed-empty');
  const feedLoading = document.getElementById('feed-loading');
  const loadMoreBtn = document.getElementById('load-more');
  const moduleSection = document.getElementById('module');
  const moduleList = document.getElementById('module-list');
  const shippedSection = document.getElementById('shipped');
  const shippedList = document.getElementById('shipped-list');

  let me = { loggedIn: false };
  let state = { area: '', type: '', status: '', q: '', sort: 'woven', page: 0 };
  let taxonomy = null;
  let loadedItems = []; // accumulated across pages

  // ---- URL <-> state ---------------------------------------------------
  function readStateFromUrl() {
    const p = new URLSearchParams(location.search);
    state.area = p.get('area') || '';
    state.type = p.get('type') || '';
    state.status = p.get('status') || '';
    state.q = p.get('q') || '';
    state.sort = p.get('sort') === 'newest' ? 'newest' : 'woven';
    state.page = 0;
  }
  function writeStateToUrl() {
    const p = new URLSearchParams();
    if (state.area) p.set('area', state.area);
    if (state.type) p.set('type', state.type);
    if (state.status) p.set('status', state.status);
    if (state.q) p.set('q', state.q);
    if (state.sort === 'newest') p.set('sort', 'newest');
    const qs = p.toString();
    history.replaceState(null, '', qs ? '?' + qs : location.pathname);
  }

  function feedUrl(page) {
    const p = new URLSearchParams();
    if (state.area) p.set('area', state.area);
    if (state.type) p.set('type', state.type);
    if (state.status) p.set('status', state.status);
    if (state.q) p.set('q', state.q);
    if (state.sort === 'newest') p.set('sort', 'newest');
    p.set('page', String(page));
    return '/api/feed?' + p.toString();
  }

  // ---- rendering -------------------------------------------------------
  function itemHref(id) { return '/item/?id=' + id; }

  function tagStamp(tag) {
    if (!tag) return '';
    return '<span class="tag tag-' + tag + '">' + C.TAG_LABEL[tag] + '</span>';
  }
  function statusChip(status) {
    if (status === 'open') return ''; // "open" is the default; no chip needed
    return '<span class="chip status-' + status + '">' + C.STATUS_LABEL[status] + '</span>';
  }

  function voteControls(item) {
    const mine = item._myVote || 0;
    return (
      '<div class="vote" data-item="' + item.id + '">' +
      '<button class="vote__btn vote__up' + (mine === 1 ? ' is-on' : '') + '" data-val="1" aria-pressed="' + (mine === 1) + '" title="Agree — I want this too">' +
      '<span aria-hidden="true">▲</span></button>' +
      '<span class="vote__net mono" aria-label="' + item.net + ' net agreement">' + item.net + '</span>' +
      '<button class="vote__btn vote__down' + (mine === -1 ? ' is-on' : '') + '" data-val="-1" aria-pressed="' + (mine === -1) + '" title="Disagree">' +
      '<span aria-hidden="true">▼</span></button>' +
      '</div>'
    );
  }

  function areaLabel(key) {
    if (!taxonomy) return key;
    const a = taxonomy.areas.find((x) => x.key === key);
    if (a) return a.label;
    if (taxonomy.ideaExtraTile.key === key) return taxonomy.ideaExtraTile.label;
    return key;
  }

  function feedRow(item) {
    const gms = item.reportsCount === 1 ? '1 GM' : item.reportsCount + ' GMs';
    return (
      '<article class="row" id="item-' + item.id + '">' +
      voteControls(item) +
      '<a class="row__main" href="' + itemHref(item.id) + '">' +
      '<span class="row__serial mono">#' + item.id + '</span>' +
      '<span class="row__body">' +
      '<span class="row__title">' + C.esc(item.title) + '</span>' +
      '<span class="row__meta">' +
      tagStamp(item.tag) + statusChip(item.status) +
      '<span class="row__area">' + C.esc(areaLabel(item.area)) + '</span>' +
      '<span class="row__dot">·</span>' +
      '<span class="row__reports">' + gms + '</span>' +
      (item.commentsCount ? '<span class="row__dot">·</span><span class="row__comments">' + item.commentsCount + ' comment' + (item.commentsCount === 1 ? '' : 's') + '</span>' : '') +
      '</span>' +
      (item.ownerNote ? '<span class="row__ownernote">' + C.esc(item.ownerNote) + '</span>' : '') +
      '</span>' +
      '</a>' +
      '</article>'
    );
  }

  function moduleRow(item, position) {
    const gms = item.reportsCount === 1 ? '1 GM' : item.reportsCount + ' GMs';
    return (
      '<li class="podium">' +
      voteControls(item) +
      '<a class="podium__main" href="' + itemHref(item.id) + '">' +
      '<span class="podium__rank mono">' + position + '</span>' +
      '<span class="podium__body">' +
      '<span class="podium__title">' + C.esc(item.title) + '</span>' +
      '<span class="podium__meta"><span class="podium__serial mono">#' + item.id + '</span>' +
      tagStamp(item.tag) + statusChip(item.status) +
      '<span class="row__dot">·</span><span>' + gms + '</span></span>' +
      (item.ownerNote ? '<span class="row__ownernote">' + C.esc(item.ownerNote) + '</span>' : '') +
      '</span>' +
      '</a>' +
      '</li>'
    );
  }

  function shippedCard(item) {
    return (
      '<a class="shipcard" href="' + itemHref(item.id) + '">' +
      '<span class="shipcard__serial mono">#' + item.id + '</span>' +
      '<span class="shipcard__title">' + C.esc(item.title) + '</span>' +
      (item.ownerNote ? '<span class="shipcard__note">' + C.esc(item.ownerNote) + '</span>' : '') +
      '</a>'
    );
  }

  function emptyStateHtml() {
    if (state.q || state.area || state.type || state.status) {
      return '<h2>Nothing matches that yet</h2><p>Try clearing a filter, or be the first to report it.</p>' +
        '<a class="btn btn-primary" href="/report/">Report a problem or idea</a>';
    }
    return '<h2>Be the first to shape what gets built next</h2>' +
      '<p>This board is brand new. Report a bug or ask for a feature and it starts right here.</p>' +
      '<a class="btn btn-primary" href="/report/">Report a problem or idea</a>';
  }

  // ---- data ------------------------------------------------------------
  async function loadFeed(reset) {
    if (reset) {
      state.page = 0;
      loadedItems = [];
      feedList.innerHTML = '';
      feedEmpty.hidden = true;
    }
    feedLoading.hidden = false;
    loadMoreBtn.hidden = true;

    let data;
    try {
      const res = await fetch(feedUrl(state.page), { headers: { Accept: 'application/json' } });
      data = await res.json();
    } catch {
      feedLoading.hidden = true;
      feedEmpty.hidden = false;
      feedEmpty.innerHTML = '<h2>The board is catching its breath</h2><p>Live data will be back shortly.</p>';
      return;
    }
    feedLoading.hidden = true;

    // /api/feed never carries per-user data (it's the shared edge cache) —
    // the viewer's own vote is reflected afterwards by syncMyVotes() below.
    if (state.page === 0) {
      renderModule(data);
      renderShipped(data);
    }

    for (const it of data.items) loadedItems.push(it);
    if (state.page === 0 && data.items.length === 0) {
      feedEmpty.hidden = false;
      feedEmpty.innerHTML = emptyStateHtml();
    } else {
      feedList.insertAdjacentHTML('beforeend', data.items.map(feedRow).join(''));
    }
    loadMoreBtn.hidden = !data.hasMore;

    // Reflect the viewer's own vote (button highlighted, no arithmetic —
    // the net shown already includes it) on exactly the rows THIS call
    // just rendered — never the whole accumulated `loadedItems` list, so
    // the id list stays small regardless of how many pages are loaded.
    // Module only (re)renders on page 0; shipped cards carry no vote UI.
    const newIds = data.items.map((it) => it.id);
    if (state.page === 0) newIds.push(...data.module.map((it) => it.id));
    await syncMyVotes(newIds, data.generatedAt);
  }

  function renderModule(data) {
    if (!data.moduleShown || !data.module.length) {
      moduleSection.hidden = true;
      return;
    }
    moduleSection.hidden = false;
    moduleList.innerHTML = data.module.map((it, i) => moduleRow(it, i + 1)).join('');
  }
  function renderShipped(data) {
    if (!data.shipped || !data.shipped.length) {
      shippedSection.hidden = true;
      return;
    }
    shippedSection.hidden = false;
    shippedList.innerHTML = data.shipped.map(shippedCard).join('');
  }

  // ---- voting (optimistic + login-on-first-tap) ------------------------
  async function handleVoteClick(e) {
    const btn = e.target.closest('.vote__btn');
    if (!btn) return;
    e.preventDefault();
    const wrap = btn.closest('.vote');
    const itemId = Number(wrap.dataset.item);
    const val = Number(btn.dataset.val);

    if (!me.loggedIn) {
      // Save intent, then send to Google returning to this exact spot.
      C.stashPending({ kind: 'vote', itemId, value: val, scrollTo: 'item-' + itemId });
      C.login(location.pathname + location.search + '#item-' + itemId);
      return;
    }

    // Determine the toggle: pressing the on-button again clears the vote.
    const currentlyOn = btn.classList.contains('is-on');
    const newValue = currentlyOn ? 0 : val;
    applyVoteToDom(wrap, newValue);

    const result = await C.vote(itemId, newValue);
    if (!result.ok) {
      // revert on failure
      applyVoteToDom(wrap, currentlyOn ? val : (val === 1 ? 0 : 0));
      if (result.status === 429) alert(result.body.error || 'You have hit today’s limit.');
    } else if (typeof result.body.agreeDelta === 'number') {
      // trust the server-confirmed net if we can recompute; otherwise leave optimistic value
    }
  }

  function applyVoteToDom(wrap, newValue) {
    const up = wrap.querySelector('.vote__up');
    const down = wrap.querySelector('.vote__down');
    const netEl = wrap.querySelector('.vote__net');
    const prev = up.classList.contains('is-on') ? 1 : down.classList.contains('is-on') ? -1 : 0;
    if (prev === newValue) return;
    let net = parseInt(netEl.textContent, 10) || 0;
    // remove previous contribution
    if (prev === 1) net -= 1;
    if (prev === -1) net += 1;
    // add new
    if (newValue === 1) net += 1;
    if (newValue === -1) net -= 1;
    netEl.textContent = net;
    up.classList.toggle('is-on', newValue === 1);
    down.classList.toggle('is-on', newValue === -1);
    up.setAttribute('aria-pressed', String(newValue === 1));
    down.setAttribute('aria-pressed', String(newValue === -1));
  }

  // Toggle button state only — no net arithmetic. Used to reflect a vote
  // that the server already counted (the row's net, freshly rendered from
  // /api/feed, already includes it) — unlike applyVoteToDom, which is for
  // a change that hasn't been counted yet.
  function markVoteState(wrap, value) {
    const up = wrap.querySelector('.vote__up');
    const down = wrap.querySelector('.vote__down');
    up.classList.toggle('is-on', value === 1);
    down.classList.toggle('is-on', value === -1);
    up.setAttribute('aria-pressed', String(value === 1));
    down.setAttribute('aria-pressed', String(value === -1));
  }

  // Fetch the signed-in viewer's own votes for `ids` via a separate
  // authenticated call (⚠ never fold this into /api/feed — that response is
  // shared-cached across every anonymous reader; see src/routes/me.js) and
  // paint them onto the DOM. Failure just leaves the board at its correct
  // (unhighlighted) public state — never blocks or breaks rendering.
  //
  // `feedGeneratedAt` is the cached feed snapshot's own timestamp. The feed
  // is edge-cached up to 60s (design §6.3/§6.4 — deliberate, for stability
  // and cost), so a vote cast inside that window can be NEWER than the net
  // currently on screen. If so its contribution isn't counted yet and must
  // be added (applyVoteToDom's delta math); if the vote predates the
  // snapshot, the net already includes it and only the button should change
  // (markVoteState) — adding the delta again would double-count.
  async function syncMyVotes(ids, feedGeneratedAt) {
    if (!me.loggedIn || !ids.length) return;
    try {
      const res = await fetch('/api/me/votes?ids=' + ids.join(','), { headers: { Accept: 'application/json' } });
      if (!res.ok) return;
      const data = await res.json();
      const votes = data.votes || {};
      document.querySelectorAll('.vote[data-item]').forEach((wrap) => {
        const id = wrap.dataset.item;
        const v = votes[id];
        if (!v) return;
        if (typeof feedGeneratedAt === 'number' && v.createdAt > feedGeneratedAt) {
          applyVoteToDom(wrap, v.value);
        } else {
          markVoteState(wrap, v.value);
        }
      });
    } catch {
      // network hiccup — board stays fully usable, just unhighlighted
    }
  }

  async function replayPendingIfAny() {
    const pending = C.takePending();
    if (!pending || pending.kind !== 'vote') return;
    if (me.loggedIn) {
      // loadFeed(true) already awaited syncMyVotes, so the DOM's current
      // button state is the viewer's PRE-replay vote (whatever it was
      // before this pending tap) — applyVoteToDom's delta math is only
      // correct if it reads that as "prev". Casting first, then applying,
      // keeps that ordering intact.
      const result = await C.vote(pending.itemId, pending.value);
      if (result.ok) {
        const wrap = document.querySelector('.vote[data-item="' + pending.itemId + '"]');
        if (wrap) applyVoteToDom(wrap, pending.value);
      }
    }
    if (pending.scrollTo) {
      const el = document.getElementById(pending.scrollTo);
      if (el) el.scrollIntoView({ block: 'center' });
    }
  }

  // ---- filter chips ----------------------------------------------------
  function buildChips() {
    // Type
    const typeChips = document.getElementById('type-chips');
    typeChips.innerHTML = chipBtn('All', state.type === '', 'type', '') +
      chipBtn('Bugs', state.type === 'bug', 'type', 'bug') +
      chipBtn('Ideas', state.type === 'idea', 'type', 'idea');

    // Status
    const statusChips = document.getElementById('status-chips');
    statusChips.innerHTML =
      chipBtn('Any status', state.status === '', 'status', '') +
      chipBtn('Planned', state.status === 'planned', 'status', 'planned') +
      chipBtn('Shipped', state.status === 'shipped', 'status', 'shipped') +
      chipBtn('Declined', state.status === 'declined', 'status', 'declined');

    // Area (from taxonomy)
    const areaChips = document.getElementById('area-chips');
    let html = chipBtn('All areas', state.area === '', 'area', '');
    if (taxonomy) {
      for (const a of taxonomy.areas) {
        if (a.key === 'other') continue;
        html += chipBtn(a.label, state.area === a.key, 'area', a.key);
      }
    }
    areaChips.innerHTML = html;
  }
  function chipBtn(label, active, dim, val) {
    return '<button class="filter-chip' + (active ? ' is-active' : '') + '" data-dim="' + dim + '" data-val="' + C.esc(val) + '">' + C.esc(label) + '</button>';
  }

  function onChipClick(e) {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    state[chip.dataset.dim] = chip.dataset.val;
    writeStateToUrl();
    buildChips();
    loadFeed(true);
  }

  // ---- init ------------------------------------------------------------
  let searchTimer = null;

  async function init() {
    readStateFromUrl();
    // auth + taxonomy in parallel
    const [meRes, taxRes] = await Promise.all([
      C.getMe(),
      fetch('/data/taxonomy.json').then((r) => r.json()).catch(() => null),
    ]);
    me = meRes;
    taxonomy = taxRes;
    C.renderAuthSlot(document.getElementById('auth-slot'), me);

    buildChips();

    // sync sort toggle + search input to state
    document.getElementById('sort-newest').checked = state.sort === 'newest';
    document.getElementById('search-input').value = state.q;

    await loadFeed(true);
    await replayPendingIfAny();

    // events
    document.getElementById('type-chips').addEventListener('click', onChipClick);
    document.getElementById('status-chips').addEventListener('click', onChipClick);
    document.getElementById('area-chips').addEventListener('click', onChipClick);
    document.getElementById('sort-newest').addEventListener('change', (e) => {
      state.sort = e.target.checked ? 'newest' : 'woven';
      writeStateToUrl();
      loadFeed(true);
    });
    document.getElementById('search-input').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      const v = e.target.value.trim();
      searchTimer = setTimeout(() => {
        state.q = v;
        writeStateToUrl();
        loadFeed(true);
      }, 250);
    });
    loadMoreBtn.addEventListener('click', () => {
      state.page += 1;
      loadFeed(false);
    });
    // event delegation for votes across module + feed
    document.querySelector('main').addEventListener('click', handleVoteClick);
  }

  init();
})();
