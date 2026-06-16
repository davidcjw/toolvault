/** Singapore GST. Rate is 9% (effective 1 Jan 2024). */
export const GST_RATE = 0.09;

export type GstResult = { base: number; gst: number; total: number };

/** Add GST on top of a GST-exclusive amount. */
export function addGst(base: number, rate = GST_RATE): GstResult {
  const safe = Math.max(0, base);
  const gst = safe * rate;
  return { base: safe, gst, total: safe + gst };
}

/** Back out GST from a GST-inclusive amount. */
export function removeGst(total: number, rate = GST_RATE): GstResult {
  const safe = Math.max(0, total);
  const base = safe / (1 + rate);
  return { base, gst: safe - base, total: safe };
}
