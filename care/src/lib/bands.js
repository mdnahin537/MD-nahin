// Score bands (design §6.1) — the stability device. An item must DOUBLE
// its net to change band, so a single vote almost never reorders the feed.
//
// band(net) =  0                        if net == 0
//              floor(log2(net)) + 1     if net >= 1   (1->1, 2-3->2, 4-7->3, 8-15->4)
//             -(floor(log2(-net)) + 1)  if net <= -1  (-1->-1, -2..-3->-2)
//
// floor(log2(n)) is computed integer-exactly via Math.clz32 rather than
// Math.log2, because Math.log2(8) can return 2.9999999 on some engines and
// silently drop a power-of-two item into the wrong band — exactly the kind
// of off-by-one that would violate the band-stability guarantee.

export function floorLog2(n) {
  // n >= 1 assumed. 31 - clz32(n) is the index of the highest set bit.
  return 31 - Math.clz32(n);
}

export function band(net) {
  if (net === 0) return 0;
  if (net >= 1) return floorLog2(net) + 1;
  return -(floorLog2(-net) + 1);
}
