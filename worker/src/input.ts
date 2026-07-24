// Shared input-field bounds for money and model-spend paths.
// Limits are measured in UTF-8 bytes, matching HTTP/KV/upstream payload cost
// rather than JavaScript UTF-16 code units.

export const MAX_PRODUCT_KEY_BYTES = 256;
export const MAX_INSTANCE_ID_BYTES = 256;

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function readTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function isWithinUtf8Limit(value: string, maxBytes: number): boolean {
  return utf8ByteLength(value) <= maxBytes;
}
