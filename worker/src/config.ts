// Strict numeric configuration and counter parsing.
//
// Environment variables are strings and Cloudflare KV values are untrusted
// persisted data. JavaScript's parseInt('broken') -> NaN silently disables
// comparisons such as `used >= limit`, so money-path limits must never use raw
// parseInt results.

export function readBoundedInt(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const text = (raw || '').trim();
  if (!/^\d+$/.test(text)) return fallback;
  const value = Number(text);
  if (!Number.isSafeInteger(value) || value < min || value > max) return fallback;
  return value;
}

// Missing counters are zero. Malformed or unsafe persisted counters are errors,
// not zero: callers can then fail closed instead of accidentally reopening a
// quota after KV corruption or manual misconfiguration.
export function readCounter(raw: string | null): number {
  if (raw === null || raw === '') return 0;
  const text = String(raw).trim();
  if (!/^\d+$/.test(text)) throw new Error('invalid-counter');
  const value = Number(text);
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('invalid-counter');
  return value;
}
