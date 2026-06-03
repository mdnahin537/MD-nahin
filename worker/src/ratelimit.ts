// Per-IP rolling-minute limiter backed by Cloudflare KV.
// Cheap, eventually-consistent. Good enough to absorb obvious abuse;
// LS API itself remains the source of truth on key validity.

export interface RateLimitEnv {
  RATELIMIT: KVNamespace;
  RATE_LIMIT_PER_MIN: string;
}

export async function checkRateLimit(
  request: Request,
  env: RateLimitEnv,
  bucket: string,
): Promise<{ ok: boolean; remaining: number }> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const window = Math.floor(Date.now() / 60_000); // minute bucket
  const key = `rl:${bucket}:${ip}:${window}`;
  const limit = parseInt(env.RATE_LIMIT_PER_MIN || '30', 10);

  const current = parseInt((await env.RATELIMIT.get(key)) || '0', 10);
  if (current >= limit) return { ok: false, remaining: 0 };

  // Best-effort increment. Race conditions can let one extra request through
  // per minute per IP. Acceptable — this is abuse prevention, not auth.
  await env.RATELIMIT.put(key, String(current + 1), { expirationTtl: 120 });
  return { ok: true, remaining: limit - current - 1 };
}
