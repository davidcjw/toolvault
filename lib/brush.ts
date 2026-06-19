export type Point = { x: number; y: number };

/** Map a pointer's client coords to canvas pixel coords. */
export function canvasPoint(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number,
): Point {
  const sx = rect.width ? canvasWidth / rect.width : 1;
  const sy = rect.height ? canvasHeight / rect.height : 1;
  return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
}

/** Brush radius in canvas pixels, scaled to the image so it feels consistent. */
export function brushRadius(canvasWidth: number, pct: number): number {
  return Math.max(4, (canvasWidth * pct) / 400);
}

/** Points spaced along the segment a→b (inclusive of b) for smooth dabs. */
export function interpolatePoints(a: Point, b: Point, spacing: number): Point[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (spacing <= 0 || dist === 0) return [b];
  const steps = Math.max(1, Math.floor(dist / spacing));
  const pts: Point[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    pts.push({ x: a.x + dx * t, y: a.y + dy * t });
  }
  return pts;
}
