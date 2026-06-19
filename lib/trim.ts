export type Box = { x: number; y: number; w: number; h: number };

/**
 * Default alpha cutoff (0–255) for trimming. Background-removal models leave
 * faint, near-invisible speckle around a cut-out; treating anything at or below
 * this as transparent keeps a stray pixel from defeating the crop.
 */
export const TRIM_ALPHA = 24;

/**
 * Bounding box of all pixels whose alpha is above `threshold` (0–255).
 * Returns null when every pixel is fully transparent. Pure: takes raw RGBA
 * data so it can be unit-tested without a canvas.
 */
export function opaqueBounds(
  data: Uint8ClampedArray | number[],
  width: number,
  height: number,
  threshold = 0,
): Box | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}
