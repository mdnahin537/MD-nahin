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

  // RESIDUAL RACE (documented, accepted): this is a read-modify-write on KV,
  // which is eventually consistent and exposes no compare-and-set. Under
  // concurrent load N in-flight requests for the same IP+minute can each read
  // the same `current` and each write +1 once, so the effective ceiling per IP
  // per minute is `RATE_LIMIT_PER_MIN + peak_concurrency`, not exactly the cap.
  // This is abuse prevention, not auth or spend control (the money path has its
  // own per-IP + global demo caps in demo.ts), so a few extra license-API hits
  // per minute per IP is harmless. KV is the only store the free tier gives us;
  // a Durable Object would make this exact at the cost of a paid binding.
  await env.RATELIMIT.put(key, String(current + 1), { expirationTtl: 120 });
  return { ok: true, remaining: limit - current - 1 };
}
