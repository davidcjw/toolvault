export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const ZERO_PADDING: Padding = { top: 0, right: 0, bottom: 0, left: 0 };

/** Clamp a single padding value to a non-negative integer. */
export function clampPad(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

/** Output canvas size for an image with independent per-side padding. */
export function paddedSize(
  imgW: number,
  imgH: number,
  pad: Padding
): { width: number; height: number } {
  return {
    width: Math.max(1, Math.round(imgW + clampPad(pad.left) + clampPad(pad.right))),
    height: Math.max(1, Math.round(imgH + clampPad(pad.top) + clampPad(pad.bottom))),
  };
}
