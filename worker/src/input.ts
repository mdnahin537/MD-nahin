// Shared input bounds for spend and licensing paths. Limits are measured in
// UTF-8 bytes, matching HTTP, KV, and upstream payload cost.

export const MAX_PRODUCT_KEY_BYTES = 256;
export const MAX_INSTANCE_ID_BYTES = 256;
export const MAX_REQUEST_BODY_BYTES = 32 * 1024;

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

export class BodyTooLargeError extends Error {
  constructor() {
    super('request-body-too-large');
    this.name = 'BodyTooLargeError';
  }
}

// Content-Length is rejected early when present, but the stream counter is
// authoritative for chunked, missing, or dishonest lengths.
export async function readBoundedRequestText(
  request: Request,
  maxBytes = MAX_REQUEST_BODY_BYTES,
): Promise<string> {
  const declared = request.headers.get('Content-Length');
  if (declared) {
    const size = Number(declared);
    if (Number.isFinite(size) && size > maxBytes) throw new BodyTooLargeError();
  }

  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        try { await reader.cancel(); } catch { /* preserve the size error */ }
        throw new BodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const joined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(joined);
}
