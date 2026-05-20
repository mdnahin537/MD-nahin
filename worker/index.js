/**
 * RealmWright License Proxy — Cloudflare Worker
 *
 * Deploy with: wrangler deploy
 *
 * Required environment variables (set in Cloudflare dashboard):
 *   ITCHIO_API_KEY  — your itch.io developer API key
 *   ITCHIO_GAME_ID  — your itch.io game ID (numeric)
 *
 * Endpoint:
 *   POST /verify
 *   Body: { "key": "<user-pasted-download-key>" }
 *   Returns: { "valid": true|false, "error": null|"string" }
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const url = new URL(request.url);

    if (url.pathname === '/verify') {
      let body;
      try { body = await request.json(); } catch { return json({ valid: false, error: 'Invalid JSON' }, 400); }

      const key = (body.key || '').trim();
      if (!key) return json({ valid: false, error: 'No key provided' });

      if (!env.ITCHIO_API_KEY || !env.ITCHIO_GAME_ID) {
        return json({ valid: false, error: 'Worker not configured — set ITCHIO_API_KEY and ITCHIO_GAME_ID in Cloudflare dashboard.' });
      }

      try {
        const itchUrl = `https://itch.io/api/1/${env.ITCHIO_API_KEY}/game/${env.ITCHIO_GAME_ID}/download_keys?download_key=${encodeURIComponent(key)}`;
        const res = await fetch(itchUrl, { headers: { Accept: 'application/json' } });
        const data = await res.json();
        // itch.io returns { "download_key": {...} } (singular object) on success,
        // or { "errors": ["invalid download key"] } on failure.
        // The plural "download_keys" array does NOT exist in this endpoint's response.
        const valid = !!data.download_key && !data.errors;
        return json({ valid, error: valid ? null : 'Key not found for this product.' });
      } catch (e) {
        return json({ valid: false, error: 'itch.io verification temporarily unavailable.' }, 502);
      }
    }

    return json({ error: 'Not found' }, 404);
  },
};
