// Trigram similarity for the merge-suspects queue (design §7.3). Cheap,
// deterministic, no model needed for the common case — two reports about the
// same thing, in the same (area, part), usually share most character
// trigrams of their titles. AI is only a tiebreak when this is ambiguous.

function trigrams(str) {
  const s = '  ' + (str || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() + '  ';
  const set = new Set();
  for (let i = 0; i < s.length - 2; i++) set.add(s.slice(i, i + 3));
  return set;
}

/** Jaccard similarity of two strings' trigram sets, 0..1. */
export function trigramSimilarity(a, b) {
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const g of ta) if (tb.has(g)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}
