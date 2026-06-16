/** Parse a page-range string into groups of 1-based page numbers.
 *  Each comma-separated token becomes its own group. Supports:
 *    "5"    → [5]
 *    "1-3"  → [1,2,3]   (reversed bounds are normalised)
 *    "7-"   → 7..total
 *    "-3"   → 1..3
 *  Out-of-range pages are clamped/dropped; invalid tokens are ignored.
 *  Pure + side-effect free for unit testing. */
export function parsePageRanges(input: string, total: number): number[][] {
  const groups: number[][] = [];
  if (total <= 0) return groups;

  for (const raw of input.split(",")) {
    const s = raw.trim();
    if (!s) continue;

    const range = s.match(/^(\d*)\s*-\s*(\d*)$/);
    if (range && (range[1] || range[2])) {
      let a = range[1] ? parseInt(range[1], 10) : 1;
      let b = range[2] ? parseInt(range[2], 10) : total;
      if (a > b) [a, b] = [b, a];
      const group: number[] = [];
      for (let p = Math.max(1, a); p <= Math.min(total, b); p++) group.push(p);
      if (group.length) groups.push(group);
      continue;
    }

    if (/^\d+$/.test(s)) {
      const p = parseInt(s, 10);
      if (p >= 1 && p <= total) groups.push([p]);
    }
  }

  return groups;
}

/** One group per page: [[1],[2],...,[total]]. */
export function everyPage(total: number): number[][] {
  return Array.from({ length: Math.max(0, total) }, (_, i) => [i + 1]);
}
