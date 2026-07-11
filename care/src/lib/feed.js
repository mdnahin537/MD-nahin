// ★ CROWN JEWEL #2 — feed assembly (design §6.3), implemented EXACTLY.
// Pure function: takes the visible-item set + per-item velocity, returns the
// module, shipped strip, and the fully-ordered main feed. No I/O here — the
// route (routes/feed.js) does the D1 reads and the edge caching; keeping the
// algorithm pure makes it unit-testable in isolation, which is how the
// §10 Phase-1 acceptance properties get proven.

import { band } from './bands.js';

const LIVE_STATUSES = new Set(['open', 'planned', 'in_progress']);
const MODULE_GATE = 8; // module hidden unless >= 8 items qualify (§6.3.1)
const MODULE_SIZE = 10;
const NEW_MAX_AGE_DAYS = 21;
const NEW_MAX_TOTAL = 5; // total < 5
const TRENDING_MIN_VEL = 3;
const TRENDING_MIN_TOTAL = 5;
const SHIPPED_STRIP_SIZE = 5;

// Slot cycle [T, R, N, T] = (Top, tRending, New, Top). Fallback chains: a
// lane that's exhausted at its slot falls through to the next lane(s). Because
// the TOP lane is the superset of ALL visible items, the T fallback always
// yields the next unplaced item while any remain, so the deeper fallbacks
// (past one level) are effectively unreachable — but they're listed in full
// so the weave is correct even if that invariant ever changes.
const SLOT_PATTERN = ['T', 'R', 'N', 'T'];
const FALLBACK = { T: ['T', 'R', 'N'], R: ['R', 'T', 'N'], N: ['N', 'T', 'R'] };

/**
 * @param {Array} items  each: { id, type, area, part, title, status,
 *   created_at, pinned, held, agree_count, disagree_count, reports_count,
 *   comments_count, net, total, owner_note, owner_note_at }
 *   — caller passes ONLY visible items (held=0, merged_into IS NULL,
 *   status != 'declined'); this function does not re-filter visibility.
 * @param {Map<number,number>} velByItem  item_id -> velocity (default 0)
 * @param {number} nowSeconds
 * @returns {{ module, moduleShown, shipped, feed }} feed = full ordered
 *   main-feed array (module items excluded), guardrail already applied.
 */
export function assembleFeed(items, velByItem, nowSeconds) {
  const DAY = 86400;

  // Decorate each item with computed band / vel / lane-eligibility once.
  const decorated = items.map((it) => {
    const net = it.net;
    const total = it.total;
    const vel = velByItem.get(it.id) || 0;
    const ageDays = (nowSeconds - it.created_at) / DAY;
    const newEligible = ageDays <= NEW_MAX_AGE_DAYS && total < NEW_MAX_TOTAL && net >= 0 && it.status === 'open';
    const trendingEligible = vel >= TRENDING_MIN_VEL && net >= 0 && total >= TRENDING_MIN_TOTAL && LIVE_STATUSES.has(it.status);
    return { ...it, _band: band(net), _vel: vel, _newEligible: newEligible, _trendingEligible: trendingEligible };
  });

  // ---- 1. TOP-10 MODULE ------------------------------------------------
  const qualifying = decorated.filter((it) => it.net >= 1 && LIVE_STATUSES.has(it.status));
  const moduleShown = qualifying.length >= MODULE_GATE;

  let moduleItems = [];
  if (moduleShown) {
    // Pinned items take the first slots — but ONLY pins that are themselves
    // qualifying (net>=1, live status). The module is exempt from the net<0
    // guardrail, so allowing a pinned net<=0 item into a module slot would
    // render it above every net>=0 item — the exact inversion the guardrail
    // exists to prevent. A pin on a non-qualifying item is simply ignored for
    // the module (the item still appears normally in the woven feed). No
    // pinned_at column exists, so pinned order is serial ASC (stable, human);
    // if pins ever exceed 10 they truncate by serial ASC via the slice below.
    const qualifyingIds = new Set(qualifying.map((it) => it.id));
    const pinned = decorated
      .filter((it) => it.pinned && qualifyingIds.has(it.id))
      .sort((a, b) => a.id - b.id);
    const pinnedIds = new Set(pinned.map((it) => it.id));
    const qualifyingNonPinned = qualifying
      .filter((it) => !pinnedIds.has(it.id))
      .sort(cmpModule);
    moduleItems = [...pinned, ...qualifyingNonPinned].slice(0, MODULE_SIZE);
  }
  const moduleIdSet = new Set(moduleItems.map((it) => it.id));

  // ---- 2. SHIPPED STRIP ------------------------------------------------
  const shipped = decorated
    .filter((it) => it.status === 'shipped')
    .sort((a, b) => (b.owner_note_at || 0) - (a.owner_note_at || 0) || a.id - b.id)
    .slice(0, SHIPPED_STRIP_SIZE);

  // ---- 3. MAIN FEED (weave) -------------------------------------------
  // Lane fixed orders. TOP = all visible items, band DESC / R DESC / serial ASC.
  const topOrder = [...decorated].sort(cmpTop);
  const trendingOrder = decorated.filter((it) => it._trendingEligible).sort(cmpTrending);
  const newOrder = decorated.filter((it) => it._newEligible).sort(cmpNew);

  const lanes = { T: topOrder, R: trendingOrder, N: newOrder };
  const cursors = { T: 0, R: 0, N: 0 };
  const placed = new Set(moduleIdSet); // module items are excluded from the feed
  const feed = [];
  const targetCount = decorated.length - moduleItems.length;

  let slotIndex = 0;
  let safety = decorated.length * 4 + 8; // hard stop against any pathological loop
  while (feed.length < targetCount && safety-- > 0) {
    const letter = SLOT_PATTERN[slotIndex % SLOT_PATTERN.length];
    slotIndex++;
    let picked = null;
    for (const laneKey of FALLBACK[letter]) {
      const lane = lanes[laneKey];
      let c = cursors[laneKey];
      while (c < lane.length && placed.has(lane[c].id)) c++;
      cursors[laneKey] = c;
      if (c < lane.length) {
        picked = lane[c];
        cursors[laneKey] = c + 1;
        break;
      }
    }
    if (!picked) break;
    placed.add(picked.id);
    feed.push(picked);
  }

  // ---- 4. HARD GUARDRAIL (pass #1, on the full woven order) ------------
  // Given correct band computation + monotonic cursors, net<0 items already
  // fall after all net>=0 items in the woven order (a net<0 item is only ever
  // reachable via the TOP lane, and only once every net>=0 item is placed).
  // So `violations` here should be 0; a nonzero count is a real signal.
  const { items: guardedFeed, violations } = guardrail(feed);
  if (violations > 0) {
    console.warn(`[feed guardrail] pass #1 fixed ${violations} net<0-before-net>=0 orderings — unexpected`);
  }

  return { module: moduleItems, moduleShown, shipped, feed: guardedFeed };
}

/**
 * Pull every net<0 item out and append it after ALL net>=0 items, ordered
 * among themselves band DESC, serial ASC (design §6.3.4). Net-negative can
 * never occupy a high-visibility slot.
 *
 * Applied in two places (design brief's "guardrail sweep applied TWICE"):
 * pass #1 on the full woven order, pass #2 per paginated page. Pass #1 is
 * where real work can happen; pass #2 on an already-partitioned slice is
 * provably a no-op in correct operation. Rather than a silent re-sort that
 * could MASK an upstream ordering bug, `assertOnly:true` makes pass #2 verify
 * the invariant and report (via the returned `violations` count / a console
 * warning) if it ever finds net<0 above net>=0 — surfacing the bug — while
 * still correcting the output so the user never sees a wrong order.
 *
 * @returns {{ items, violations }}
 */
export function guardrail(orderedItems, { assertOnly = false } = {}) {
  const nonNeg = [];
  const neg = [];
  let violations = 0;
  let seenNeg = false;
  for (const it of orderedItems) {
    if (it.net < 0) {
      neg.push(it);
      seenNeg = true;
    } else {
      if (seenNeg) violations++; // a net>=0 item appeared AFTER a net<0 one
      nonNeg.push(it);
    }
  }
  if (assertOnly && violations > 0) {
    console.warn(`[feed guardrail] pass #2 found ${violations} net<0-before-net>=0 violations — upstream ordering bug`);
  }
  neg.sort((a, b) => b._band - a._band || a.id - b.id);
  return { items: [...nonNeg, ...neg], violations };
}

/** Thin wrapper: returns just the ordered array (the common case). */
export function applyGuardrail(orderedItems) {
  return guardrail(orderedItems).items;
}

/**
 * The precedence tag for a card (design §6.3): Trending > New > Top
 * (in module, or band >= 3 i.e. net >= 4). Long-tail items get no tag —
 * the serial is already their identity, and tagging a net -5 item "Top"
 * would be a lie.
 */
export function tagFor(item, inModule) {
  if (item._trendingEligible) return 'trending';
  if (item._newEligible) return 'new';
  if (inModule || item._band >= 3) return 'top';
  return null;
}

// ---- comparators -----------------------------------------------------
// Every comparator ends in serial ASC so identical server state always
// yields identical output (full determinism, even on same-second ties).

function cmpModule(a, b) {
  // module: EXACT net DESC (not band), then R DESC, then serial ASC.
  return b.net - a.net || b.reports_count - a.reports_count || a.id - b.id;
}
function cmpTop(a, b) {
  return b._band - a._band || b.reports_count - a.reports_count || a.id - b.id;
}
function cmpTrending(a, b) {
  // vel DESC, serial DESC (design §6.2) — then serial ASC can't also apply;
  // the design's own tiebreak is serial DESC, which is itself total, so no
  // further tiebreak is needed (id is unique).
  return b._vel - a._vel || b.id - a.id;
}
function cmpNew(a, b) {
  // newest first; serial DESC breaks identical-second ties deterministically
  // (a higher serial was inserted later, so it is genuinely "newer").
  return b.created_at - a.created_at || b.id - a.id;
}
