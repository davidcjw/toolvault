"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  Eraser,
  FlipHorizontal2,
  ImagePlus,
  Loader2,
  Maximize2,
  RefreshCw,
  RotateCw,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { Dropzone } from "@/components/dropzone";
import { GooeyLoader } from "@/components/gooey-loader";
import { ImageTouchUp } from "@/components/image-touchup";
import { downloadBlob } from "@/lib/download";
import { changeExtension } from "@/lib/format";
import { removeImageBackground } from "@/lib/bgremove";
import { convertHeic, isHeic } from "@/lib/heic";
import {
  clamp,
  compositeBounds,
  makeLayer,
  renderComposite,
  widthFromCorner,
  type Layer,
} from "@/lib/overlay";

const CHECKER =
  "[background-image:repeating-conic-gradient(var(--color-line)_0%_25%,transparent_0%_50%)] [background-size:20px_20px]";

type DragMode = "move" | "resize" | "rotate";
type Drag = {
  id: string;
  mode: DragMode;
  startX: number;
  startY: number;
  cx0: number;
  cy0: number;
};

export function ImageOverlayTool() {
  const [base, setBase] = useState<{
    src: string;
    original: string;
    name: string;
    w: number;
    h: number;
  } | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [touchUp, setTouchUp] = useState(false);
  const [trimExport, setTrimExport] = useState(true);
  const [bgBusy, setBgBusy] = useState<{ id: string; label: string; pct: number } | null>(null);
  const [bgError, setBgError] = useState<string | null>(null);
  const [decoding, setDecoding] = useState(false);
  // Rendered size of the base image, so the expanding checker frame can reserve
  // matching layout space in pixels.
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const stageRef = useRef<HTMLDivElement>(null);
  const baseImgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const idRef = useRef(0);
  const overlayInputRef = useRef<HTMLInputElement>(null);

  const selected = layers.find((l) => l.id === selectedId) ?? null;

  useEffect(() => {
    const el = baseImgRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setDims({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [base]);

  function loadDims(src: string): Promise<{ w: number; h: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = src;
    });
  }

  /** Decode HEIC to PNG; pass other images through unchanged. */
  async function toUsableBlob(file: File): Promise<Blob> {
    return isHeic(file) ? convertHeic(file, "image/png") : file;
  }

  async function addBase(files: File[]) {
    const img = files.find((f) => f.type.startsWith("image/") || isHeic(f));
    if (!img) return;
    setBgError(null);
    setDecoding(isHeic(img));
    try {
      const src = URL.createObjectURL(await toUsableBlob(img));
      const { w, h } = await loadDims(src);
      setBase({ src, original: src, name: img.name, w, h });
    } catch {
      setBgError("Couldn't read that HEIC file. Try converting it first.");
    } finally {
      setDecoding(false);
    }
  }

  async function addOverlayFiles(files: FileList | null) {
    if (!files) return;
    setBgError(null);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") && !isHeic(file)) continue;
      setDecoding(isHeic(file));
      try {
        const src = URL.createObjectURL(await toUsableBlob(file));
        const { w, h } = await loadDims(src);
        const id = `layer-${idRef.current++}`;
        setLayers((prev) => [...prev, makeLayer(id, src, w ? h / w : 1)]);
        setSelectedId(id);
      } catch {
        setBgError("Couldn't read that HEIC file. Try converting it first.");
      } finally {
        setDecoding(false);
      }
    }
    if (overlayInputRef.current) overlayInputRef.current.value = "";
  }

  function updateLayer(id: string, patch: Partial<Layer>) {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeLayer(id: string) {
    setLayers((prev) => {
      const found = prev.find((l) => l.id === id);
      if (found) URL.revokeObjectURL(found.src);
      return prev.filter((l) => l.id !== id);
    });
    setSelectedId((cur) => (cur === id ? null : cur));
  }

  async function removeBaseBg() {
    if (!base || bgBusy) return;
    setBgError(null);
    setBgBusy({ id: "base", label: "Loading model…", pct: 0 });
    try {
      const blob = await removeImageBackground(base.src, (p) =>
        setBgBusy({ id: "base", ...p }),
      );
      const url = URL.createObjectURL(blob);
      // Keep base.original alive (it may share the URL on first load) so the
      // touch-up restore brush can still load the original photo.
      if (base.src !== base.original) URL.revokeObjectURL(base.src);
      setBase({ ...base, src: url });
    } catch (err) {
      setBgError((err as Error).message || "Background removal failed. Try another image.");
    } finally {
      setBgBusy(null);
    }
  }

  async function removeBg(layer: Layer) {
    if (bgBusy) return;
    setBgError(null);
    setBgBusy({ id: layer.id, label: "Loading model…", pct: 0 });
    try {
      const blob = await removeImageBackground(layer.src, (p) =>
        setBgBusy({ id: layer.id, ...p }),
      );
      const url = URL.createObjectURL(blob);
      URL.revokeObjectURL(layer.src);
      updateLayer(layer.id, { src: url });
    } catch (err) {
      setBgError((err as Error).message || "Background removal failed. Try another image.");
    } finally {
      setBgBusy(null);
    }
  }

  function moveZ(id: string, dir: -1 | 1) {
    setLayers((prev) => {
      const i = prev.findIndex((l) => l.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function reset() {
    if (base) {
      URL.revokeObjectURL(base.src);
      if (base.original !== base.src) URL.revokeObjectURL(base.original);
    }
    layers.forEach((l) => URL.revokeObjectURL(l.src));
    setBase(null);
    setLayers([]);
    setSelectedId(null);
    setTouchUp(false);
  }

  function applyTouchUp(blob: Blob) {
    if (!base) return;
    const url = URL.createObjectURL(blob);
    if (base.src !== base.original) URL.revokeObjectURL(base.src);
    setBase({ ...base, src: url });
    setTouchUp(false);
  }

  async function exportPng() {
    if (!base) return;
    setExporting(true);
    try {
      const blob = await renderComposite(base.src, base.w, base.h, layers, trimExport);
      downloadBlob(blob, changeExtension(base.name, "png"));
    } finally {
      setExporting(false);
    }
  }

  function startDrag(e: React.PointerEvent, id: string, mode: DragMode) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    dragRef.current = {
      id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      cx0: layer.cx,
      cy0: layer.cy,
    };
    stageRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    const stage = stageRef.current?.getBoundingClientRect();
    if (!d || !stage) return;
    const layer = layers.find((l) => l.id === d.id);
    if (!layer) return;

    if (d.mode === "move") {
      const dx = (e.clientX - d.startX) / stage.width;
      const dy = (e.clientY - d.startY) / stage.height;
      updateLayer(d.id, {
        cx: clamp(d.cx0 + dx, -0.2, 1.2),
        cy: clamp(d.cy0 + dy, -0.2, 1.2),
      });
      return;
    }

    const centerX = stage.left + layer.cx * stage.width;
    const centerY = stage.top + layer.cy * stage.height;
    if (d.mode === "resize") {
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      updateLayer(d.id, {
        w: clamp(widthFromCorner(dist, layer.aspect, stage.width), 0.03, 3),
      });
    } else {
      const ang = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI + 90;
      updateLayer(d.id, { rotation: Math.round(ang) });
    }
  }

  function endDrag() {
    dragRef.current = null;
  }

  // ── Empty state: drop the base photo ─────────────────────────────
  if (!base) {
    return (
      <div className="space-y-4">
        {decoding ? (
          <div className="grid place-items-center rounded-2xl border border-line bg-surface p-12 text-center">
            <GooeyLoader className="mx-auto" />
            <p className="mt-3 text-sm text-ink">Converting HEIC…</p>
          </div>
        ) : (
          <Dropzone
            accept="image/*,.heic,.heif"
            onFiles={addBase}
            multiple={false}
            label="Drop your base image here"
            hint="The photo you want to add things onto — PNG, JPG or HEIC"
          />
        )}
        {bgError && <p className="text-center text-sm text-destructive">{bgError}</p>}
        <p className="text-center text-sm text-subtle">
          Then add overlays (a hat, logo or sticker) and drag them into place.
          Need a clean cut-out? Select an overlay and hit{" "}
          <span className="text-accent-strong">Remove background</span> — no need
          to leave this page.
        </p>
      </div>
    );
  }

  if (touchUp) {
    return (
      <ImageTouchUp
        src={base.src}
        originalSrc={base.original}
        onApply={applyTouchUp}
        onCancel={() => setTouchUp(false)}
      />
    );
  }

  // How far the composite spills past each edge of the base, as a fraction of
  // the base dimensions. Drives both the expanding checker frame and the
  // reserved margins so the on-screen canvas grows like the exported PNG.
  const cb = compositeBounds(base.w, base.h, layers);
  const overflow = {
    left: Math.max(0, -cb.x) / base.w,
    top: Math.max(0, -cb.y) / base.h,
    right: Math.max(0, cb.x + cb.w - base.w) / base.w,
    bottom: Math.max(0, cb.y + cb.h - base.h) / base.h,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => overlayInputRef.current?.click()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent-strong hover:text-accent-strong"
        >
          <ImagePlus className="h-4 w-4" /> Add overlay
        </button>
        <input
          ref={overlayInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          hidden
          onChange={(e) => addOverlayFiles(e.target.files)}
        />
        <button
          onClick={removeBaseBg}
          disabled={!!bgBusy}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent-strong hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bgBusy?.id === "base" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eraser className="h-4 w-4" />
          )}
          {bgBusy?.id === "base"
            ? `${bgBusy.label} ${bgBusy.pct}%`
            : "Remove base background"}
        </button>
        <button
          onClick={() => setTouchUp(true)}
          disabled={!!bgBusy}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent-strong hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Eraser className="h-4 w-4" /> Touch up base
        </button>
        <span className="font-mono text-xs text-subtle">
          {layers.length} overlay{layers.length === 1 ? "" : "s"}
        </span>
      </div>

      {bgError && <p className="text-sm text-destructive">{bgError}</p>}

      {/* Stage */}
      <div className="relative grid place-items-center rounded-xl border border-line p-3">
        {(bgBusy || exporting || decoding) && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-canvas/70 backdrop-blur-sm">
            <div className="text-center">
              <GooeyLoader className="mx-auto" />
              <p className="mt-3 text-sm text-ink">
                {bgBusy
                  ? `${bgBusy.label} ${bgBusy.pct}%`
                  : decoding
                    ? "Converting HEIC…"
                    : "Rendering PNG…"}
              </p>
            </div>
          </div>
        )}
        <div
          ref={stageRef}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          className="relative inline-block max-h-[70vh] max-w-full touch-none select-none"
          style={{
            marginTop: overflow.top * dims.h,
            marginBottom: overflow.bottom * dims.h,
            marginLeft: overflow.left * dims.w,
            marginRight: overflow.right * dims.w,
          }}
        >
          {/* Expanding canvas: grows past the base to match the exported PNG */}
          <div
            className={`pointer-events-none absolute rounded-lg border border-line ${CHECKER}`}
            style={{
              left: `${-overflow.left * 100}%`,
              top: `${-overflow.top * 100}%`,
              right: `${-overflow.right * 100}%`,
              bottom: `${-overflow.bottom * 100}%`,
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={baseImgRef}
            src={base.src}
            alt="Base"
            draggable={false}
            onPointerDown={() => setSelectedId(null)}
            className="relative block max-h-[70vh] max-w-full select-none"
          />

          {layers.map((layer) => {
            const isSel = layer.id === selectedId;
            return (
              <div
                key={layer.id}
                className="absolute"
                style={{
                  left: `${layer.cx * 100}%`,
                  top: `${layer.cy * 100}%`,
                  width: `${layer.w * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                  outline: isSel ? "1.5px dashed var(--color-accent)" : "none",
                  outlineOffset: 2,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={layer.src}
                  alt="Overlay"
                  draggable={false}
                  onPointerDown={(e) => startDrag(e, layer.id, "move")}
                  className="block w-full cursor-move select-none"
                  style={{
                    opacity: layer.opacity,
                    transform: layer.flipX ? "scaleX(-1)" : undefined,
                  }}
                />
                {isSel && (
                  <>
                    <button
                      aria-label="Resize"
                      onPointerDown={(e) => startDrag(e, layer.id, "resize")}
                      className="absolute bottom-0 right-0 grid h-5 w-5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize place-items-center rounded-full border border-white bg-accent-strong text-white shadow"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </button>
                    <button
                      aria-label="Rotate"
                      onPointerDown={(e) => startDrag(e, layer.id, "rotate")}
                      className="absolute left-1/2 top-0 grid h-5 w-5 -translate-x-1/2 -translate-y-[160%] cursor-grab place-items-center rounded-full border border-white bg-accent-strong text-white shadow"
                    >
                      <RotateCw className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected-layer controls */}
      {selected ? (
        <div className="space-y-3 rounded-xl border border-line p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-subtle">
              Selected overlay
            </p>
            <span className="text-xs text-subtle">Drag to move · corner to resize · top handle to rotate</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => removeBg(selected)}
              disabled={!!bgBusy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bgBusy?.id === selected.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eraser className="h-4 w-4" />
              )}
              {bgBusy?.id === selected.id
                ? `${bgBusy.label} ${bgBusy.pct}%`
                : "Remove background"}
            </button>
            <button
              onClick={() => updateLayer(selected.id, { flipX: !selected.flipX })}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-accent-strong"
            >
              <FlipHorizontal2 className="h-4 w-4" /> Flip
            </button>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="font-mono text-xs uppercase tracking-wider text-subtle">Opacity</span>
              <input
                type="range"
                min={10}
                max={100}
                value={Math.round(selected.opacity * 100)}
                onChange={(e) => updateLayer(selected.id, { opacity: Number(e.target.value) / 100 })}
                className="accent-accent-strong"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="font-mono text-xs uppercase tracking-wider text-subtle">Rotate</span>
              <input
                type="range"
                min={-180}
                max={180}
                value={selected.rotation}
                onChange={(e) => updateLayer(selected.id, { rotation: Number(e.target.value) })}
                className="accent-accent-strong"
              />
            </label>
            <button
              onClick={() => moveZ(selected.id, 1)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-accent-strong"
            >
              <ChevronUp className="h-4 w-4" /> Forward
            </button>
            <button
              onClick={() => moveZ(selected.id, -1)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-accent-strong"
            >
              <ChevronDown className="h-4 w-4" /> Back
            </button>
            <button
              onClick={() => removeLayer(selected.id)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-destructive transition-colors hover:opacity-80"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
          <p className="text-xs text-subtle">
            Remove background runs an AI model in your browser (downloaded once);
            your images are never uploaded.
          </p>
        </div>
      ) : (
        <p className="text-sm text-subtle">
          {layers.length
            ? "Tap an overlay to select and edit it."
            : "Add an overlay image to get started."}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={exportPng}
          disabled={exporting}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {exporting ? "Rendering…" : "Download PNG"}
        </button>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={trimExport}
            onChange={(e) => setTrimExport(e.target.checked)}
            className="accent-accent-strong"
          />
          Trim transparent edges
        </label>
        <button
          onClick={reset}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:text-accent-strong"
        >
          <RefreshCw className="h-4 w-4" /> Start over
        </button>
      </div>
    </div>
  );
}
