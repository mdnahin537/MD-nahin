// Shared client helpers for every Care page — no framework, no build step
// (design §8). Plain ES modules would need type=module + CORS fuss for
// file://-adjacent testing, so this is a classic script exposing one global
// `Care`. Small on purpose.

window.Care = (function () {
  const PENDING_KEY = 'rw_care_pending_action';

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  async function getMe() {
    try {
      const res = await fetch('/api/me', { headers: { Accept: 'application/json' } });
      if (!res.ok) return { loggedIn: false };
      return await res.json();
    } catch {
      return { loggedIn: false };
    }
  }

  // Send the user to Google sign-in, returning them to exactly where they
  // are now (path + query + hash) so they land back on the same view.
  function login(returnTo) {
    const target = returnTo || (location.pathname + location.search + location.hash);
    location.href = '/auth/login?return=' + encodeURIComponent(target);
  }

  function logout() {
    location.href = '/auth/logout?return=' + encodeURIComponent(location.pathname + location.search);
  }

  // Stash an action the user tried while logged out, so it can be replayed
  // after they return from Google (design §2 Phase-2 acceptance: "vote tap →
  // Google → returns to same scroll position with vote cast").
  function stashPending(action) {
    try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(action)); } catch {}
  }
  function takePending() {
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(PENDING_KEY);
      return JSON.parse(raw);
    } catch { return null; }
  }

  async function vote(itemId, value) {
    const res = await fetch('/api/vote/' + itemId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    return { ok: res.ok, status: res.status, body: await res.json().catch(() => ({})) };
  }

  function relativeTime(epochSeconds) {
    const diff = Date.now() / 1000 - epochSeconds;
    const day = 86400;
    if (diff < 3600) return Math.max(1, Math.floor(diff / 60)) + 'm ago';
    if (diff < day) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 30 * day) return Math.floor(diff / day) + 'd ago';
    if (diff < 365 * day) return Math.floor(diff / (30 * day)) + 'mo ago';
    return Math.floor(diff / (365 * day)) + 'y ago';
  }

  const STATUS_LABEL = {
    open: 'Open', planned: 'Planned', in_progress: 'In progress',
    shipped: 'Shipped', declined: 'Declined',
  };
  const TAG_LABEL = { top: 'Top', trending: 'Trending', new: 'New' };

  function renderAuthSlot(el, me) {
    if (me.loggedIn) {
      el.innerHTML =
        (me.avatar ? '<img class="avatar" src="' + esc(me.avatar) + '" alt="" width="28" height="28">' : '') +
        '<span class="masthead__name">' + esc(me.name || 'You') + '</span>' +
        (me.isOwner ? '<a class="masthead__desk" href="/desk/">Desk</a>' : '') +
        '<button class="linkbtn" id="logout-btn">Sign out</button>';
      const btn = el.querySelector('#logout-btn');
      if (btn) btn.addEventListener('click', logout);
    } else {
      el.innerHTML = '<button class="linkbtn" id="login-btn">Sign in</button>';
      const btn = el.querySelector('#login-btn');
      if (btn) btn.addEventListener('click', () => login());
    }
  }

  return {
    esc, getMe, login, logout, stashPending, takePending, vote,
    relativeTime, renderAuthSlot, STATUS_LABEL, TAG_LABEL,
  };
})();
