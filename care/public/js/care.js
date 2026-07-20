// Shared client helpers for every Care page — no framework, no build step.
// Care identity is local to this browser profile. No OAuth or external login.
// Recovery is an explicit one-time code the user can copy/print for another
// device or for cookie loss; it is never stored in localStorage.

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

  async function postAuth(path, action, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Care-Action': action },
      body: body ? JSON.stringify(body) : '{}',
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body: data };
  }

  function overlay(title, inner) {
    const existing = document.getElementById('care-auth-overlay');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.id = 'care-auth-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', title);
    el.style.cssText = 'position:fixed;inset:0;z-index:1000;background:rgba(20,16,12,.72);display:grid;place-items:center;padding:1rem;';
    el.innerHTML =
      '<div style="background:#fffaf2;color:#241505;max-width:30rem;width:100%;padding:1.4rem;border:1px solid #d9c7ad;box-shadow:0 1rem 3rem rgba(0,0,0,.25)">' +
      '<h2 style="margin:0 0 .7rem;font:600 1.35rem/1.2 Georgia,serif">' + esc(title) + '</h2>' +
      '<div id="care-auth-panel">' + inner + '</div>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function closeOverlay() {
    const el = document.getElementById('care-auth-overlay');
    if (el) el.remove();
  }

  function showError(panel, message) {
    const old = panel.querySelector('.care-auth-error');
    if (old) old.remove();
    const el = document.createElement('p');
    el.className = 'care-auth-error';
    el.setAttribute('role', 'alert');
    el.style.cssText = 'color:#9b2c24;margin:.8rem 0 0;';
    el.textContent = message;
    panel.appendChild(el);
  }

  function showRecoveryPrompt(target, panel) {
    panel.innerHTML =
      '<p>Enter the one-time recovery code you saved from another device.</p>' +
      '<label style="display:block;margin:.8rem 0">Recovery code' +
      '<input id="care-recovery-input" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" style="display:block;width:100%;box-sizing:border-box;padding:.65rem;margin-top:.35rem;font:1rem monospace" required></label>' +
      '<div style="display:flex;gap:.6rem;flex-wrap:wrap">' +
      '<button class="btn btn-primary" id="care-recover-submit">Recover this device</button>' +
      '<button class="linkbtn" id="care-recover-back" type="button">Back</button>' +
      '</div>';
    const input = panel.querySelector('#care-recovery-input');
    panel.querySelector('#care-recover-back').addEventListener('click', () => showIdentityChooser(target));
    panel.querySelector('#care-recover-submit').addEventListener('click', async () => {
      const btn = panel.querySelector('#care-recover-submit');
      btn.disabled = true;
      const result = await postAuth('/auth/recover', 'recover', { code: input.value });
      if (!result.ok) {
        btn.disabled = false;
        showError(panel, result.body.error || 'Recovery did not complete.');
        return;
      }
      closeOverlay();
      location.href = target;
    });
    input.focus();
  }

  function showIdentityChooser(target) {
    const el = overlay('Continue to RealmWright Care',
      '<p>Care uses a private local identity for this browser. No Google account, password, or paid service is required.</p>' +
      '<div style="display:grid;gap:.6rem;margin-top:1rem">' +
      '<button class="btn btn-primary" id="care-use-device">Use this device</button>' +
      '<button class="btn" id="care-use-recovery">Use a recovery code</button>' +
      '<button class="linkbtn" id="care-auth-cancel" type="button">Cancel</button>' +
      '</div>');
    const panel = el.querySelector('#care-auth-panel');
    el.querySelector('#care-auth-cancel').addEventListener('click', closeOverlay);
    el.querySelector('#care-use-recovery').addEventListener('click', () => showRecoveryPrompt(target, panel));
    el.querySelector('#care-use-device').addEventListener('click', async () => {
      const btn = el.querySelector('#care-use-device');
      btn.disabled = true;
      const result = await postAuth('/auth/bootstrap', 'bootstrap');
      if (!result.ok) {
        btn.disabled = false;
        showError(panel, result.body.error || 'This device could not be registered.');
        return;
      }
      closeOverlay();
      location.href = target;
    });
  }

  // Called by public-board votes and the report wizard. It deliberately opens
  // a choice instead of silently creating a second identity on a new device.
  function login(returnTo) {
    const target = returnTo || (location.pathname + location.search + location.hash);
    showIdentityChooser(target);
  }

  async function logout() {
    location.href = '/auth/logout?return=' + encodeURIComponent(location.pathname + location.search);
  }

  async function issueRecovery() {
    const result = await postAuth('/auth/recovery', 'issue-recovery');
    if (!result.ok) {
      const panel = document.querySelector('#care-auth-panel');
      if (panel) showError(panel, result.body.error || 'Could not create a recovery code.');
      return;
    }
    const code = result.body.recoveryCode || '';
    const el = overlay('Save your Care recovery code',
      '<p>This code works once on another device or after cookie loss. It is shown only now. Store it offline; anyone who has it can access this Care identity.</p>' +
      '<p style="font:600 1.35rem monospace;letter-spacing:.08em;word-break:break-all;background:#f1e6d4;padding:.8rem" id="care-recovery-code">' + esc(code) + '</p>' +
      '<div style="display:flex;gap:.6rem;flex-wrap:wrap">' +
      '<button class="btn btn-primary" id="care-copy-recovery">Copy code</button>' +
      '<button class="linkbtn" id="care-close-recovery" type="button">Done</button>' +
      '</div><p id="care-recovery-status" role="status"></p>');
    el.querySelector('#care-close-recovery').addEventListener('click', closeOverlay);
    el.querySelector('#care-copy-recovery').addEventListener('click', async () => {
      const status = el.querySelector('#care-recovery-status');
      try {
        await navigator.clipboard.writeText(code);
        status.textContent = 'Copied. Keep it somewhere safe.';
      } catch {
        status.textContent = 'Copy was blocked; select the code and save it manually.';
      }
    });
  }

  function renderAuthSlot(el, me) {
    if (me.loggedIn) {
      el.innerHTML =
        (me.avatar ? '<img class="avatar" src="' + esc(me.avatar) + '" alt="" width="28" height="28">' : '') +
        '<span class="masthead__name">' + esc(me.name || 'A GM') + '</span>' +
        (me.isOwner ? '<a class="masthead__desk" href="/desk/">Desk</a>' : '') +
        '<button class="linkbtn" id="recovery-btn">Recovery code</button>' +
        '<button class="linkbtn" id="logout-btn">Sign out</button>';
      const recovery = el.querySelector('#recovery-btn');
      if (recovery) recovery.addEventListener('click', issueRecovery);
      const logoutBtn = el.querySelector('#logout-btn');
      if (logoutBtn) logoutBtn.addEventListener('click', logout);
    } else {
      el.innerHTML = '<button class="linkbtn" id="login-btn">Continue</button>';
      const btn = el.querySelector('#login-btn');
      if (btn) btn.addEventListener('click', () => login());
    }
  }

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

  return {
    esc, getMe, login, logout, issueRecovery, stashPending, takePending, vote,
    relativeTime, renderAuthSlot, STATUS_LABEL, TAG_LABEL,
  };
})();
