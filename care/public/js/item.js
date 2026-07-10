// The item page (design §6.5): the thread header, the "N GMs report this"
// roll-up of joined reports, the owner note (the only official voice),
// agree/disagree with login-on-first-tap, and one-level threaded comments.

(function () {
  const C = window.Care;
  const root = document.getElementById('item-root');
  let me = { loggedIn: false };
  let taxonomy = null;
  let item = null;

  const itemId = Number(new URLSearchParams(location.search).get('id'));

  function areaLabel(key) {
    if (!taxonomy) return key;
    const a = taxonomy.areas.find((x) => x.key === key);
    if (a) return a.label;
    if (taxonomy.ideaExtraTile.key === key) return taxonomy.ideaExtraTile.label;
    return key;
  }

  function tagStamp(tag) {
    if (!tag) return '';
    return '<span class="tag tag-' + tag + '">' + C.TAG_LABEL[tag] + '</span>';
  }
  function statusChip(status) {
    return '<span class="chip status-' + status + '">' + C.STATUS_LABEL[status] + '</span>';
  }

  function ctxLine(r) {
    const bits = [];
    if (r.version) bits.push('v' + r.version);
    if (r.os) bits.push(cap(r.os));
    if (r.browser) bits.push(cap(r.browser));
    return bits.join(' · ');
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function reportBlock(r) {
    const details = [];
    if (r.symptom) details.push('<span class="rep__sym">' + C.esc(prettySymptom(r.symptom)) + (r.frequency ? ' · ' + C.esc(prettyFreq(r.frequency)) : '') + '</span>');
    if (r.expected) details.push('<div class="rep__field"><span class="rep__label">Expected</span> ' + C.esc(r.expected) + '</div>');
    if (r.actual) details.push('<div class="rep__field"><span class="rep__label">Actual</span> ' + C.esc(r.actual) + '</div>');
    if (r.ask) details.push('<div class="rep__field"><span class="rep__label">The ask</span> ' + C.esc(r.ask) + '</div>');
    if (r.why) details.push('<div class="rep__field"><span class="rep__label">Why</span> ' + C.esc(r.why) + '</div>');
    if (r.doneLooksLike) details.push('<div class="rep__field"><span class="rep__label">Done looks like</span> ' + C.esc(r.doneLooksLike) + '</div>');
    if (r.importance) details.push('<div class="rep__imp">' + C.esc(prettyImportance(r.importance)) + '</div>');
    if (r.freetext) details.push('<div class="rep__free">' + C.esc(r.freetext) + '</div>');

    const ctx = ctxLine(r);
    return (
      '<li class="rep">' +
      '<div class="rep__head">' +
      (r.avatar ? '<img class="avatar" src="' + C.esc(r.avatar) + '" alt="" width="24" height="24">' : '<span class="avatar avatar--blank" aria-hidden="true"></span>') +
      '<span class="rep__name">' + C.esc(r.reporterName) + '</span>' +
      (ctx ? '<span class="rep__ctx mono">' + C.esc(ctx) + '</span>' : '') +
      '<span class="rep__when">' + C.relativeTime(r.createdAt) + '</span>' +
      '</div>' +
      (details.length ? '<div class="rep__details">' + details.join('') + '</div>' : '') +
      '</li>'
    );
  }

  function commentNode(c) {
    const replies = (c.replies || []).map((r) =>
      '<li class="cmt cmt--reply">' + commentInner(r) + '</li>'
    ).join('');
    return (
      '<li class="cmt">' + commentInner(c) +
      (replies ? '<ul class="cmt__replies">' + replies + '</ul>' : '') +
      '<button class="linkbtn cmt__reply-btn" data-parent="' + c.id + '">Reply</button>' +
      '<div class="cmt__reply-box" hidden data-for="' + c.id + '"></div>' +
      '</li>'
    );
  }
  function commentInner(c) {
    return (
      '<div class="cmt__head">' +
      (c.avatar ? '<img class="avatar" src="' + C.esc(c.avatar) + '" alt="" width="22" height="22">' : '<span class="avatar avatar--blank" aria-hidden="true"></span>') +
      '<span class="cmt__name">' + C.esc(c.authorName) + '</span>' +
      '<span class="cmt__when">' + C.relativeTime(c.createdAt) + '</span>' +
      '</div>' +
      '<div class="cmt__body">' + C.esc(c.body) + '</div>'
    );
  }

  function render() {
    const gms = item.reportsCount === 1 ? '1 GM reports this' : item.reportsCount + ' GMs report this';
    const commentsFlat = item.comments || [];

    root.innerHTML =
      '<article class="thread">' +
      '<div class="thread__top">' +
      '<span class="thread__serial mono">#' + item.id + '</span>' +
      '<div class="thread__meta">' + tagStamp(item.tag) + statusChip(item.status) +
      '<span class="thread__area">' + C.esc(areaLabel(item.area)) + '</span></div>' +
      '</div>' +
      '<h1 class="thread__title">' + C.esc(item.title) + '</h1>' +
      voteBar() +
      (item.ownerNote ? ownerNoteBlock() : '') +
      '<section class="rollup">' +
      '<h2 class="rollup__heading">' + gms + '</h2>' +
      '<ul class="rollup__list">' + (item.reports || []).map(reportBlock).join('') + '</ul>' +
      '</section>' +
      '<section class="comments">' +
      '<h2 class="comments__heading">' + (item.commentsCount || 0) + ' ' + (item.commentsCount === 1 ? 'comment' : 'comments') + '</h2>' +
      (me.loggedIn ? topCommentBox() : '<p class="comments__signin"><button class="linkbtn" id="comment-signin">Sign in to comment</button></p>') +
      '<ul class="comments__list">' + commentsFlat.map(commentNode).join('') + '</ul>' +
      '</section>' +
      '</article>';

    wireEvents();
  }

  function voteBar() {
    const mine = item.myVote || 0;
    return (
      '<div class="votebar" data-item="' + item.id + '">' +
      '<button class="votebar__btn' + (mine === 1 ? ' is-on is-up' : '') + '" data-val="1" aria-pressed="' + (mine === 1) + '">▲ Agree</button>' +
      '<span class="votebar__net mono">' + item.net + '</span>' +
      '<button class="votebar__btn' + (mine === -1 ? ' is-on is-down' : '') + '" data-val="-1" aria-pressed="' + (mine === -1) + '">▼ Disagree</button>' +
      '<span class="votebar__hint">Agree pushes it up Hunter’s list.</span>' +
      '</div>'
    );
  }
  function ownerNoteBlock() {
    return '<div class="ownernote"><span class="ownernote__tag">From Hunter</span><p>' + C.esc(item.ownerNote) + '</p></div>';
  }
  function topCommentBox() {
    return (
      '<div class="commentbox">' +
      '<textarea id="new-comment" class="commentbox__input" rows="2" placeholder="Add a comment… (links show as plain text)" maxlength="2000"></textarea>' +
      '<button class="btn btn-primary" id="post-comment">Post comment</button>' +
      '</div>'
    );
  }

  // ---- events ----------------------------------------------------------
  function wireEvents() {
    const votebar = root.querySelector('.votebar');
    if (votebar) votebar.addEventListener('click', onVoteClick);

    const signin = document.getElementById('comment-signin');
    if (signin) signin.addEventListener('click', () => C.login());

    const postBtn = document.getElementById('post-comment');
    if (postBtn) postBtn.addEventListener('click', () => postComment(null, document.getElementById('new-comment')));

    root.querySelectorAll('.cmt__reply-btn').forEach((btn) => {
      btn.addEventListener('click', () => toggleReplyBox(Number(btn.dataset.parent)));
    });
  }

  async function onVoteClick(e) {
    const btn = e.target.closest('.votebar__btn');
    if (!btn) return;
    const val = Number(btn.dataset.val);
    if (!me.loggedIn) {
      C.stashPending({ kind: 'vote', itemId: item.id, value: val });
      C.login();
      return;
    }
    const wrap = btn.closest('.votebar');
    const currentlyOn = btn.classList.contains('is-on');
    const newValue = currentlyOn ? 0 : val;
    applyVote(wrap, newValue);
    const res = await C.vote(item.id, newValue);
    if (!res.ok) {
      applyVote(wrap, currentlyOn ? val : 0);
      if (res.status === 429) alert(res.body.error || 'You have hit today’s limit.');
    }
  }
  function applyVote(wrap, newValue) {
    const up = wrap.querySelector('[data-val="1"]');
    const down = wrap.querySelector('[data-val="-1"]');
    const netEl = wrap.querySelector('.votebar__net');
    const prev = up.classList.contains('is-on') ? 1 : down.classList.contains('is-on') ? -1 : 0;
    if (prev === newValue) return;
    let net = parseInt(netEl.textContent, 10) || 0;
    if (prev === 1) net -= 1; if (prev === -1) net += 1;
    if (newValue === 1) net += 1; if (newValue === -1) net -= 1;
    netEl.textContent = net;
    up.classList.toggle('is-on', newValue === 1);
    up.classList.toggle('is-up', newValue === 1);
    down.classList.toggle('is-on', newValue === -1);
    down.classList.toggle('is-down', newValue === -1);
    up.setAttribute('aria-pressed', String(newValue === 1));
    down.setAttribute('aria-pressed', String(newValue === -1));
  }

  function toggleReplyBox(parentId) {
    const box = root.querySelector('.cmt__reply-box[data-for="' + parentId + '"]');
    if (!box) return;
    if (!me.loggedIn) { C.login(); return; }
    if (box.hidden) {
      box.hidden = false;
      box.innerHTML =
        '<textarea class="commentbox__input" rows="2" placeholder="Reply…" maxlength="2000"></textarea>' +
        '<button class="btn btn-primary btn--sm">Reply</button>';
      const btn = box.querySelector('button');
      btn.addEventListener('click', () => postComment(parentId, box.querySelector('textarea')));
      box.querySelector('textarea').focus();
    } else {
      box.hidden = true;
      box.innerHTML = '';
    }
  }

  async function postComment(parentId, textarea) {
    const body = (textarea.value || '').trim();
    if (!body) return;
    const btn = textarea.parentElement.querySelector('button');
    if (btn) btn.disabled = true;
    const res = await fetch('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, body, parentId: parentId || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (btn) btn.disabled = false;
      alert(data.error || 'Could not post your comment.');
      return;
    }
    // reload the thread to show the new comment (and correct held-state handling server-side)
    await load();
  }

  // ---- pretty labels (map contract keys to human text) -----------------
  function prettySymptom(k) {
    return ({
      nothing_happened: 'Nothing happened on click', wrong_thing: 'Did the wrong thing',
      work_disappeared: 'Work disappeared / didn’t save', display_broken: 'Display looks broken',
      froze_crashed: 'Froze or crashed', slow: 'Slow', error_message: 'An error appeared',
      something_else: 'Something else', ai_wrong_answer: 'AI answer was wrong', ai_call_failed: 'AI call failed',
      wont_import: 'File wouldn’t import', pdf_missing_content: 'PDF missing content', license_wont_activate: 'License won’t activate',
    })[k] || k;
  }
  function prettyFreq(k) { return ({ every_time: 'every time', sometimes: 'sometimes', once: 'happened once' })[k] || k; }
  function prettyImportance(k) {
    return ({ nice_to_have: 'Nice to have', every_session: 'Would use every session', cant_run_without: 'Can’t run their game without it' })[k] || k;
  }

  // ---- load ------------------------------------------------------------
  // `cache: no-store` so a fresh reload after voting/commenting always shows
  // the new state, never a stale browser-cached copy (belt-and-suspenders on
  // top of the server's Vary: Cookie).
  async function load() {
    const res = await fetch('/api/item/' + itemId, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (res.status === 409) {
      const body = await res.json().catch(() => ({}));
      if (body.mergedInto) { location.replace('/item/?id=' + body.mergedInto); return; }
    }
    if (!res.ok) {
      root.innerHTML = '<div class="empty-state"><h2>That report isn’t here</h2><p>It may have been removed or merged.</p><a class="btn btn-primary" href="/">Back to the board</a></div>';
      return;
    }
    item = await res.json();
    document.title = '#' + item.id + ' · ' + item.title + ' — RealmWright';
    render();
  }

  async function init() {
    if (!Number.isInteger(itemId)) {
      root.innerHTML = '<div class="empty-state"><h2>No report selected</h2><a class="btn btn-primary" href="/">Back to the board</a></div>';
      return;
    }
    const [meRes, taxRes] = await Promise.all([
      C.getMe(),
      fetch('/data/taxonomy.json').then((r) => r.json()).catch(() => null),
    ]);
    me = meRes; taxonomy = taxRes;
    C.renderAuthSlot(document.getElementById('auth-slot'), me);
    await load();
    // replay a pending vote from a pre-login tap
    const pending = C.takePending();
    if (pending && pending.kind === 'vote' && me.loggedIn && item) {
      await C.vote(pending.itemId, pending.value);
      await load();
    }
  }

  init();
})();
