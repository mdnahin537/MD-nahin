// Local Care identity auth â€” no OAuth, no external identity provider.
//
// A browser gets an opaque, random HttpOnly session cookie. The server stores
// only an HMAC verifier for that cookie. A user can explicitly create a
// one-time recovery code; the server stores only its HMAC verifier. The code
// is a bearer recovery secret, not a password and not hardware attestation.
//
// Existing Google-era users remain in the users table as legacy rows so their
// reports, votes, and comments are preserved. New sessions can only create or
// recover local identities.

import { parseCookies, serializeCookie, clearCookie } from './cookies.js';

const SESSION_TTL_SECONDS = 90 * 24 * 60 * 60;
const SESSION_COOKIE = 'rw_care_session';
const RECOVERY_CODE_LENGTH = 24;
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const AUTH_LIMITS = {
  bootstrap: { windowSeconds: 60 * 60, max: 20 },
  recovery: { windowSeconds: 60 * 60, max: 10 },
  owner: { windowSeconds: 60 * 60, max: 5 },
};

function isSecureEnv(env) {
  return env.ENVIRONMENT !== 'development';
}

function sessionCookieName(env) {
  return env.SESSION_COOKIE_NAME || SESSION_COOKIE;
}

function jsonBody(data, status = 200, extraHeaders = {}) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  for (const [name, value] of new Headers(extraHeaders).entries()) {
    headers.set(name, value);
  }
  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

function jsonError(status, message) {
  return jsonBody({ error: message }, status);
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function randomLocalSub() {
  return 'local_' + bytesToHex(randomBytes(16));
}

function randomToken() {
  const bytes = randomBytes(32);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacHex(secret, value) {
  if (typeof secret !== 'string' || !secret) throw new Error('SESSION_SECRET is not configured');
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(sig));
}

function normalizeRecoveryCode(raw) {
  return typeof raw === 'string'
    ? raw.toUpperCase().replace(/[\s-]/g, '')
    : '';
}

function formatRecoveryCode(raw) {
  return raw.match(/.{1,4}/g).join('-');
}

function randomRecoveryCode() {
  const bytes = randomBytes(RECOVERY_CODE_LENGTH);
  let code = '';
  for (const b of bytes) code += CROCKFORD[b % CROCKFORD.length];
  return code;
}

function sanitizeReturnPath(raw) {
  if (
    typeof raw !== 'string' ||
    !raw.startsWith('/') ||
    raw.startsWith('//') ||
    raw.includes('://') ||
    raw.includes('\\')
  ) {
    return '/';
  }
  return raw;
}

function isAction(request, expected) {
  return request.headers.get('X-Care-Action') === expected;
}

function clientFingerprint(request) {
  // Cloudflare supplies CF-Connecting-IP at the edge. We hash it before
  // persistence; raw IP addresses never enter D1. Local dev uses a stable
  // placeholder so the smoke path remains deterministic.
  return request.headers.get('CF-Connecting-IP') || 'local-dev';
}

async function checkAuthRateLimit(request, env, kind) {
  const cfg = AUTH_LIMITS[kind];
  if (!cfg) return true;
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / cfg.windowSeconds);
  const fingerprint = await hmacHex(env.SESSION_SECRET, clientFingerprint(request));
  const row = await env.DB.prepare(
    'SELECT count FROM care_auth_attempts WHERE kind = ?1 AND fingerprint = ?2 AND bucket = ?3'
  ).bind(kind, fingerprint, bucket).first();
  if ((row?.count || 0) >= cfg.max) return false;
  await env.DB.prepare(
    `INSERT INTO care_auth_attempts (kind, fingerprint, bucket, count)
     VALUES (?1, ?2, ?3, 1)
     ON CONFLICT(kind, fingerprint, bucket) DO UPDATE SET count = count + 1`
  ).bind(kind, fingerprint, bucket).run();
  return true;
}

function setSessionCookie(headers, token, env) {
  headers.append(
    'Set-Cookie',
    serializeCookie(sessionCookieName(env), token, {
      maxAgeSeconds: SESSION_TTL_SECONDS,
      path: '/',
      secure: isSecureEnv(env),
      sameSite: 'Lax',
    })
  );
}

async function createLocalUser(env, { name = 'A GM', isOwner = false } = {}) {
  const sub = randomLocalSub();
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `INSERT INTO users
      (sub, name, avatar_url, email, created_at, last_seen, auth_provider, is_owner)
     VALUES (?1, ?2, NULL, NULL, ?3, ?3, 'local', ?4)`
  ).bind(sub, name, now, isOwner ? 1 : 0).run();
  return { sub, name, avatar: null, isOwner };
}

async function createSession(env, sub) {
  const token = randomToken();
  const tokenHash = await hmacHex(env.SESSION_SECRET, token);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `INSERT INTO care_sessions
      (token_hash, user_sub, created_at, last_seen, expires_at, revoked_at)
     VALUES (?1, ?2, ?3, ?3, ?4, NULL)`
  ).bind(tokenHash, sub, now, now + SESSION_TTL_SECONDS).run();
  return token;
}

/** POST /auth/bootstrap â€” create one local identity for this browser. */
export async function handleBootstrap(request, env) {
  if (!isAction(request, 'bootstrap')) return jsonError(403, 'Unsupported sign-in request.');
  if (await getSession(request, env)) return jsonBody({ ok: true, existing: true });
  if (!(await checkAuthRateLimit(request, env, 'bootstrap'))) {
    return jsonError(429, 'Too many new-device attempts. Try again later.');
  }

  try {
    const user = await createLocalUser(env);
    const token = await createSession(env, user.sub);
    const headers = new Headers();
    setSessionCookie(headers, token, env);
    return jsonBody({ ok: true, created: true }, 200, headers);
  } catch {
    return jsonError(500, 'Could not create a Care identity. Try again shortly.');
  }
}

/** POST /auth/recovery â€” issue a new one-time recovery code for this identity. */
export async function handleIssueRecovery(request, env) {
  if (!isAction(request, 'issue-recovery')) return jsonError(403, 'Unsupported recovery request.');
  const session = await getSession(request, env);
  if (!session) return jsonError(401, 'Start Care on this device before creating recovery details.');

  const code = randomRecoveryCode();
  const hash = await hmacHex(env.SESSION_SECRET, normalizeRecoveryCode(code));
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    'UPDATE users SET recovery_hash = ?1, recovery_issued_at = ?2 WHERE sub = ?3 AND auth_provider = \'local\''
  ).bind(hash, now, session.sub).run();
  return jsonBody({ ok: true, recoveryCode: formatRecoveryCode(code) });
}

/** POST /auth/recover â€” consume a one-time recovery code on another device. */
export async function handleRecover(request, env) {
  if (!isAction(request, 'recover')) return jsonError(403, 'Unsupported recovery request.');
  if (!(await checkAuthRateLimit(request, env, 'recovery'))) {
    return jsonError(429, 'Too many recovery attempts. Try again later.');
  }

  let body;
  try { body = await request.json(); } catch { return jsonError(400, 'Malformed recovery request.'); }
  const code = normalizeRecoveryCode(body?.code);
  if (code.length !== RECOVERY_CODE_LENGTH || !/^[0-9A-HJKMNP-TV-Z]+$/.test(code)) {
    return jsonError(400, 'Enter the recovery code exactly as shown.');
  }

  const hash = await hmacHex(env.SESSION_SECRET, code);
  const user = await env.DB.prepare(
    `SELECT sub, name, avatar_url, is_owner
     FROM users WHERE recovery_hash = ?1 AND auth_provider = 'local' LIMIT 1`
  ).bind(hash).first();
  if (!user) return jsonError(401, 'That recovery code is invalid or already used.');

  // Compare-and-clear makes the code one-use even if two requests race.
  const cleared = await env.DB.prepare(
    `UPDATE users SET recovery_hash = NULL, recovery_issued_at = NULL
     WHERE sub = ?1 AND recovery_hash = ?2`
  ).bind(user.sub, hash).run();
  if (!cleared.meta || cleared.meta.changes !== 1) {
    return jsonError(401, 'That recovery code is invalid or already used.');
  }

  try {
    const token = await createSession(env, user.sub);
    const headers = new Headers();
    setSessionCookie(headers, token, env);
    return jsonBody({ ok: true, name: user.name, isOwner: user.is_owner === 1 }, 200, headers);
  } catch {
    return jsonError(500, 'Could not complete recovery. Try again shortly.');
  }
}

/** POST /auth/owner/claim â€” one-time owner bootstrap using a Cloudflare secret. */
export async function handleOwnerClaim(request, env) {
  if (!isAction(request, 'owner-claim')) return jsonError(403, 'Unsupported owner setup request.');
  if (!(await checkAuthRateLimit(request, env, 'owner'))) {
    return jsonError(429, 'Too many owner setup attempts. Try again later.');
  }
  const setupToken = typeof env.OWNER_SETUP_TOKEN === 'string' ? env.OWNER_SETUP_TOKEN : '';
  if (!setupToken) return jsonError(503, 'Owner setup is not configured.');

  let body;
  try { body = await request.json(); } catch { return jsonError(400, 'Malformed owner setup request.'); }
  const provided = typeof body?.token === 'string' ? body.token : '';
  if (!provided || provided !== setupToken) return jsonError(401, 'Owner setup token was not accepted.');

  if (await env.DB.prepare('SELECT sub FROM users WHERE is_owner = 1 LIMIT 1').first()) {
    return jsonError(409, 'Owner setup has already been completed.');
  }

  try {
    const user = await createLocalUser(env, { name: 'Owner', isOwner: true });
    const token = await createSession(env, user.sub);
    const headers = new Headers();
    setSessionCookie(headers, token, env);
    return jsonBody({ ok: true, owner: true }, 200, headers);
  } catch {
    // The partial unique owner index turns simultaneous claims into a safe
    // failure; never issue a session unless the owner row was committed.
    return jsonError(409, 'Owner setup has already been completed.');
  }
}

/** GET /auth/owner â€” small setup page; the secret never appears in the URL. */
export function ownerSetupPage() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>RealmWright Care owner setup</title>
  <style>body{font:16px system-ui;max-width:32rem;margin:4rem auto;padding:1rem}
  input,button{font:inherit;padding:.7rem;width:100%;box-sizing:border-box}
  button{margin-top:.75rem;cursor:pointer}.error{color:#a20;margin-top:1rem}</style></head>
  <body><h1>Owner setup</h1>
  <p>This is a one-time setup page. Paste the Cloudflare owner setup token,
  then store your recovery code when Care provides it.</p>
  <form id="owner-form"><label>Setup token
  <input id="owner-token" type="password" autocomplete="off" required></label>
  <button>Claim Owner Desk</button><p id="owner-status" class="error" role="status"></p></form>
  <script>
  document.getElementById('owner-form').addEventListener('submit', async (e) => {
    e.preventDefault(); const out = document.getElementById('owner-status');
    const token = document.getElementById('owner-token').value;
    const res = await fetch('/auth/owner/claim', { method: 'POST',
      headers: {'Content-Type':'application/json','X-Care-Action':'owner-claim'},
      body: JSON.stringify({token}) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { out.textContent = data.error || 'Setup failed.'; return; }
    location.href = '/desk/';
  });
  </script></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

/** GET /auth/logout â€” clear the browser session. */
export function handleLogout(request, env, url) {
  const returnPath = sanitizeReturnPath(url.searchParams.get('return') || '/');
  const headers = new Headers({ Location: returnPath });
  headers.append('Set-Cookie', clearCookie(sessionCookieName(env), { secure: isSecureEnv(env) }));
  return new Response(null, { status: 302, headers });
}

/** Read and verify the opaque session cookie. */
export async function getSession(request, env) {
  try {
    const cookies = parseCookies(request);
    const token = cookies[sessionCookieName(env)];
    if (!token) return null;
    const tokenHash = await hmacHex(env.SESSION_SECRET, token);
    const now = Math.floor(Date.now() / 1000);
    const row = await env.DB.prepare(
      `SELECT s.user_sub AS sub, u.name, u.avatar_url, u.is_owner, u.auth_provider
       FROM care_sessions s JOIN users u ON u.sub = s.user_sub
       WHERE s.token_hash = ?1 AND s.revoked_at IS NULL AND s.expires_at > ?2`
    ).bind(tokenHash, now).first();
    if (!row) return null;
    return {
      sub: row.sub,
      name: row.name || 'A GM',
      avatar: row.avatar_url || null,
      isOwner: row.is_owner === 1,
      authProvider: row.auth_provider || 'legacy-google',
    };
  } catch {
    return null;
  }
}

export function isSecureCookieEnv(env) {
  return isSecureEnv(env);
}

