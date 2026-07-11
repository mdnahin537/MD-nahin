// Content check (design §3.4): a match sets held=1 — never rejects, just
// queues the report/comment in the Owner Desk for a human look.
//
// The list lives at src/data/blocklist.json — deliberately NOT under
// public/, which Cloudflare serves as static assets to anyone (confirmed
// live: /data/blocklist.json was publicly fetchable, handing spammers the
// exact phrases/patterns to avoid). Importing it here bundles it straight
// into the Worker instead, so it's never reachable as a URL. Editing it is
// still a one-line, no-logic-change edit for Hunter (see the list's own
// note) — just in a source file instead of a public one; `npm run deploy`
// picks it up like any other code change.
import blocklist from '../data/blocklist.json';

function normalize(text) {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Returns true if `text` trips the blocklist (should be held for owner review). */
export async function isHeld(env, text) {
  if (!text) return false;
  const normalized = normalize(text);

  for (const phrase of blocklist.phrases || []) {
    if (normalized.includes(phrase.toLowerCase())) return true;
  }
  for (const patternSrc of blocklist.patterns || []) {
    try {
      if (new RegExp(patternSrc, 'i').test(text)) return true;
    } catch {
      // malformed pattern in the JSON — skip rather than fail the whole request
    }
  }
  return false;
}
