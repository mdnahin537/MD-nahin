// CORS helpers. Allowlist is configured via ALLOWED_ORIGINS env var
// (comma-separated). file:// loads (itch.io desktop bundle, local open)
// send Origin: null and are explicitly allowed.

export function pickOrigin(request: Request, allowed: string): string {
  const origin = request.headers.get('Origin') || '';
  const list = allowed.split(',').map((s) => s.trim()).filter(Boolean);
  if (origin === 'null') return 'null';
  if (origin && list.includes(origin)) return origin;
  // Fall back to first allowed entry so the browser still parses a value;
  // request will still be blocked by the browser if origin truly mismatches.
  return list[0] || '';
}

export function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
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
