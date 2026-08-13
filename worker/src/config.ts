// Strict numeric configuration and counter parsing.
//
// Environment variables are strings and Cloudflare KV values are untrusted.
// A NaN limit silently disables comparisons, so spend and device limits must
// never depend on raw parseInt results.

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

// Missing counters are zero. Malformed persisted counters are errors so callers
// can fail closed instead of reopening a quota after KV corruption.
export function readCounter(raw: string | null): number {
  if (raw === null || raw === '') return 0;
  const text = String(raw).trim();
  if (!/^\d+$/.test(text)) throw new Error('invalid-counter');
  const value = Number(text);
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('invalid-counter');
  return value;
}
