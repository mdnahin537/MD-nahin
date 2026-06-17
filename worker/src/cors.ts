// CORS helpers. Allowlist is configured via ALLOWED_ORIGINS env var
// (comma-separated). file:// loads (itch.io desktop bundle, local open)
// send Origin: null and are explicitly allowed — but WITHOUT credentials
// (see below), since a null-origin context cannot carry the rw_device cookie
// anyway; it identifies itself via the X-Device-Token header instead.

// Resolve the Access-Control-Allow-Origin value for a request.
//   - exact allowlisted origin  -> echo it (credentialed)
//   - "null" (file://, itch bundle, sandboxed iframe) -> "null" (NON-credentialed)
//   - anything else (unknown / disallowed origin)      -> "" (browser blocks it)
//
// AUDIT FIX (LOW #13): we no longer fall back to list[0] for an unknown origin.
// The old fallback meant a disallowed origin still got a parseable ACAO, so the
// Worker would process the request and mutate KV/LS state before the browser
// discarded the response. Returning "" makes the browser block the response AND
// signals callers here to refuse the request outright (see isOriginAllowed).
export function pickOrigin(request: Request, allowed: string): string {
  const origin = request.headers.get('Origin') || '';
  const list = allowed.split(',').map((s) => s.trim()).filter(Boolean);
  if (origin === 'null') return 'null';
  if (origin && list.includes(origin)) return origin;
  return '';
}

// True when the request's origin is one we serve. Used to short-circuit
// disallowed origins BEFORE any side effect (rate-limit increment, LS call).
// An absent Origin header (same-origin fetch, server-to-server, curl) is
// allowed — only a present-but-unlisted origin is refused.
export function isOriginAllowed(request: Request, allowed: string): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true; // no Origin header — not a cross-origin browser call
  if (origin === 'null') return true; // file:// / itch bundle (non-credentialed)
  const list = allowed.split(',').map((s) => s.trim()).filter(Boolean);
  return list.includes(origin);
}

export function corsHeaders(origin: string): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    // AUDIT FIX (HIGH #2): the client sends X-Device-Token on every license
    // call; without it in the allow-list the cross-origin preflight rejects the
    // header and activation from realmwright.app fails.
    'Access-Control-Allow-Headers': 'Content-Type, X-Device-Token',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  // AUDIT FIX (MED #8): only send Allow-Credentials for a concrete allowlisted
  // origin. For "null" (sandboxed-iframe attacker pages can also be null) we do
  // NOT allow credentials, so such a context cannot make a credentialed call
  // and read the response. The null-origin client path (itch/file://) relies on
  // the X-Device-Token header, not the cookie, so nothing breaks.
  if (origin && origin !== 'null') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return headers;
}

export function preflight(request: Request, allowed: string): Response {
  const origin = pickOrigin(request, allowed);
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export function jsonResponse(
  body: unknown,
  status: number,
  request: Request,
  allowed: string,
  extraHeaders: Record<string, string> = {},
): Response {
  const origin = pickOrigin(request, allowed);
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin),
      ...extraHeaders,
    },
  });
}
