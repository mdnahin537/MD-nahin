// Tiny cookie helpers — no dependency, this app only ever needs to read
// one or two cookies and write one or two `Set-Cookie` headers.

export function parseCookies(request) {
  const header = request.headers.get('Cookie') || '';
  const out = {};
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    try {
      out[name] = decodeURIComponent(value);
    } catch {
      // Ignore a malformed cookie instead of turning a hostile header into
      // a Worker 500; the caller will treat it as signed out.
    }
  }
  return out;
}

/**
 * Build a Set-Cookie header value. `secure` should come from the caller
 * (env.ENVIRONMENT !== 'development') so local http:// dev still works —
 * real browsers silently refuse to store `Secure` cookies over plain http.
 */
export function serializeCookie(name, value, { maxAgeSeconds, path = '/', secure = true, sameSite = 'Lax', httpOnly = true } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`];
  if (httpOnly) parts.push('HttpOnly');
  if (secure) parts.push('Secure');
  if (typeof maxAgeSeconds === 'number') parts.push(`Max-Age=${maxAgeSeconds}`);
  return parts.join('; ');
}

export function clearCookie(name, { path = '/', secure = true } = {}) {
  return serializeCookie(name, '', { path, secure, maxAgeSeconds: 0 });
}
