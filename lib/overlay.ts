import { opaqueBounds, TRIM_ALPHA } from "./trim";

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

/** Axis-aligned bounding rect of a (possibly rotated) layer, in base pixels. */
export function layerBounds(layer: Layer, baseW: number, baseH: number): Rect {
  const r = layerRect(layer, baseW, baseH);
  const rad = (layer.rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const bw = r.w * cos + r.h * sin;
  const bh = r.w * sin + r.h * cos;
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
}

/**
 * Union of the base rect and every layer's bounds — the size the exported
 * canvas needs so nothing is clipped. Equals the base rect when all overlays
 * sit within it.
 */
export function compositeBounds(
  baseW: number,
  baseH: number,
  layers: Layer[],
): Rect {
  let minX = 0;
  let minY = 0;
  let maxX = baseW;
  let maxY = baseH;
  for (const layer of layers) {
    const b = layerBounds(layer, baseW, baseH);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.w);
    maxY = Math.max(maxY, b.y + b.h);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
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
  trim = false,
): Promise<Blob> {
  // Expand the canvas to the union of the base and any overlap that spills
  // past its edges, so nothing gets clipped. `bounds.x`/`.y` are <= 0 when
  // content sits above/left of the base; everything is offset by -x/-y.
  const bounds = compositeBounds(baseW, baseH, layers);
  let canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(bounds.w));
  canvas.height = Math.max(1, Math.ceil(bounds.h));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const base = await loadImage(baseSrc);
  ctx.drawImage(base, -bounds.x, -bounds.y, baseW, baseH);

  for (const layer of layers) {
    const img = await loadImage(layer.src);
    const r = layerRect(layer, baseW, baseH);
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.translate(r.x + r.w / 2 - bounds.x, r.y + r.h / 2 - bounds.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    if (layer.flipX) ctx.scale(-1, 1);
    ctx.drawImage(img, -r.w / 2, -r.h / 2, r.w, r.h);
    ctx.restore();
  }

  if (trim) {
    const box = opaqueBounds(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data,
      canvas.width,
      canvas.height,
      TRIM_ALPHA,
    );
    if (box && (box.w !== canvas.width || box.h !== canvas.height)) {
      const cropped = document.createElement("canvas");
      cropped.width = box.w;
      cropped.height = box.h;
      cropped
        .getContext("2d")
        ?.drawImage(canvas, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
      canvas = cropped;
    }
  }

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (out) => (out ? resolve(out) : reject(new Error("Export failed"))),
      "image/png",
    ),
  );
}
