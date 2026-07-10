// Content check (design §3.4): a match sets held=1 — never rejects, just
// queues the report/comment in the Owner Desk for a human look. Loads
// public/data/blocklist.json through the ASSETS binding so the list is
// editable without touching code (Hunter can add real terms pre-launch —
// see the list's own note).

let cache = null;

async function loadBlocklist(env) {
  if (cache) return cache;
  const res = await env.ASSETS.fetch(new Request('https://internal/data/blocklist.json'));
  cache = await res.json();
  return cache;
}

function normalize(text) {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Returns true if `text` trips the blocklist (should be held for owner review). */
export async function isHeld(env, text) {
  if (!text) return false;
  const list = await loadBlocklist(env);
  const normalized = normalize(text);

  for (const phrase of list.phrases || []) {
    if (normalized.includes(phrase.toLowerCase())) return true;
  }
  for (const patternSrc of list.patterns || []) {
    try {
      if (new RegExp(patternSrc, 'i').test(text)) return true;
    } catch {
      // malformed pattern in the JSON — skip rather than fail the whole request
    }
  }
  return false;
}
