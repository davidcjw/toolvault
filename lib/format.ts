/** Pure, framework-free helpers. Kept side-effect free so they're unit-testable. */

/** Scale (w, h) to fit within optional max bounds, preserving aspect ratio.
 *  Never upscales. Missing bounds mean "no limit on that axis". */
export function computeTargetDimensions(
  w: number,
  h: number,
  maxW?: number,
  maxH?: number
): { width: number; height: number } {
  if (w <= 0 || h <= 0) return { width: 0, height: 0 };
  let scale = 1;
  if (maxW && maxW > 0) scale = Math.min(scale, maxW / w);
  if (maxH && maxH > 0) scale = Math.min(scale, maxH / h);
  scale = Math.min(scale, 1); // downscale only
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

/** Human-readable byte size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : decimals)} ${units[i]}`;
}

/** Percentage reduction from `before` to `after` (0 if it grew). */
export function reductionPercent(before: number, after: number): number {
  if (before <= 0 || after >= before) return 0;
  return Math.round((1 - after / before) * 100);
}

/** Swap a file's extension, e.g. ("cat.PNG", "webp") -> "cat.webp". */
export function changeExtension(filename: string, ext: string): string {
  const base = filename.replace(/\.[^./\\]+$/, "");
  return `${base}.${ext}`;
}

/** Immutably move an array item from one index to another. */
export function move<T>(arr: readonly T[], from: number, to: number): T[] {
  const next = arr.slice();
  if (from < 0 || from >= next.length || to < 0 || to >= next.length) {
    return next;
  }
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
