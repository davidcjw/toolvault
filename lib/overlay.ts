export type Layer = {
  id: string;
  src: string;
  /** naturalHeight / naturalWidth of the overlay image. */
  aspect: number;
  /** Centre x, as a fraction of the base image width. */
  cx: number;
  /** Centre y, as a fraction of the base image height. */
  cy: number;
  /** Width, as a fraction of the base image width. */
  w: number;
  /** Rotation in degrees. */
  rotation: number;
  /** Opacity, 0–1. */
  opacity: number;
  flipX: boolean;
};

export type Rect = { x: number; y: number; w: number; h: number };

/** A fresh overlay, centred at 40% of the base width. */
export function makeLayer(id: string, src: string, aspect: number): Layer {
  return {
    id,
    src,
    aspect,
    cx: 0.5,
    cy: 0.5,
    w: 0.4,
    rotation: 0,
    opacity: 1,
    flipX: false,
  };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Pixel rect (top-left + size) for a layer within a base box of the given size. */
export function layerRect(layer: Layer, baseW: number, baseH: number): Rect {
  const w = layer.w * baseW;
  const h = w * layer.aspect;
  return { x: layer.cx * baseW - w / 2, y: layer.cy * baseH - h / 2, w, h };
}

/**
 * Width fraction implied by dragging a corner `dist` pixels from the layer
 * centre. Rotation-invariant: depends only on radial distance.
 */
export function widthFromCorner(
  dist: number,
  aspect: number,
  baseW: number,
): number {
  if (baseW <= 0) return 0;
  const wpx = (2 * dist) / Math.hypot(1, aspect);
  return wpx / baseW;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/**
 * Composite the base image and every overlay onto a canvas at the base's
 * natural resolution and return a PNG blob. Browser-only.
 */
export async function renderComposite(
  baseSrc: string,
  baseW: number,
  baseH: number,
  layers: Layer[],
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = baseW;
  canvas.height = baseH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const base = await loadImage(baseSrc);
  ctx.drawImage(base, 0, 0, baseW, baseH);

  for (const layer of layers) {
    const img = await loadImage(layer.src);
    const r = layerRect(layer, baseW, baseH);
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    if (layer.flipX) ctx.scale(-1, 1);
    ctx.drawImage(img, -r.w / 2, -r.h / 2, r.w, r.h);
    ctx.restore();
  }

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
      "image/png",
    ),
  );
}
