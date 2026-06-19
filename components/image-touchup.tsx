"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eraser, Paintbrush, RotateCcw, Undo2, X } from "lucide-react";
import {
  brushRadius,
  canvasPoint,
  interpolatePoints,
  type Point,
} from "@/lib/brush";

const CHECKER =
  "[background-image:repeating-conic-gradient(var(--color-line)_0%_25%,transparent_0%_50%)] [background-size:20px_20px]";
const MAX_UNDO = 12;

type BrushMode = "erase" | "restore";

/**
 * Brush editor for an image: erase pixels to transparent or restore them from
 * the original. Commits the edited canvas as a PNG blob. Same engine the
 * Remove Background tool uses, factored out for reuse.
 */
export function ImageTouchUp({
  src,
  originalSrc,
  onApply,
  onCancel,
}: {
  src: string;
  originalSrc: string;
  onApply: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origImgRef = useRef<HTMLImageElement | null>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const undoStack = useRef<ImageData[]>([]);
  const drawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<BrushMode>("erase");
  const [brushPct, setBrushPct] = useState(8);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cur = new Image();
    const orig = new Image();
    let loaded = 0;
    const onReady = () => {
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      canvas.width = cur.naturalWidth;
      canvas.height = cur.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cur, 0, 0);
      origImgRef.current = orig;
      baseImgRef.current = cur;
      undoStack.current = [];
      setCanUndo(false);
      setReady(true);
    };
    const tick = () => {
      if (++loaded === 2) onReady();
    };
    cur.onload = tick;
    cur.onerror = tick;
    orig.onload = tick;
    orig.onerror = tick;
    cur.src = src;
    orig.src = originalSrc;
    return () => {
      cancelled = true;
    };
  }, [src, originalSrc]);

  function pushUndo() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
    setCanUndo(true);
  }

  function undo() {
    const ctx = canvasRef.current?.getContext("2d");
    const snap = undoStack.current.pop();
    if (ctx && snap) ctx.putImageData(snap, 0, 0);
    setCanUndo(undoStack.current.length > 0);
  }

  function resetEdits() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const baseImg = baseImgRef.current;
    if (!canvas || !ctx || !baseImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImg, 0, 0);
    undoStack.current = [];
    setCanUndo(false);
  }

  function dab(ctx: CanvasRenderingContext2D, p: Point, radius: number) {
    if (mode === "erase") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      const orig = origImgRef.current;
      if (!orig || !orig.naturalWidth) return; // original missing/failed to load
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(orig, 0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  function pointFrom(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return canvasPoint(e.clientX, e.clientY, rect, canvas.width, canvas.height);
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!ready) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    pushUndo();
    drawing.current = true;
    const p = pointFrom(e);
    lastPoint.current = p;
    dab(ctx, p, brushRadius(canvas.width, brushPct));
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const radius = brushRadius(canvas.width, brushPct);
    const p = pointFrom(e);
    const from = lastPoint.current ?? p;
    for (const pt of interpolatePoints(from, p, radius / 2)) dab(ctx, pt, radius);
    lastPoint.current = p;
  }

  function onPointerUp() {
    drawing.current = false;
    lastPoint.current = null;
  }

  function apply() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) onApply(blob);
    }, "image/png");
  }

  return (
    <div className="space-y-4">
      <div className={`grid place-items-center rounded-xl border border-line p-3 ${CHECKER}`}>
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className={`max-h-[70vh] max-w-full touch-none ${
            ready ? (mode === "erase" ? "cursor-crosshair" : "cursor-copy") : ""
          }`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-subtle">
          Touch up base
        </p>
        <div className="inline-flex overflow-hidden rounded-lg border border-line">
          <button
            onClick={() => setMode("erase")}
            aria-pressed={mode === "erase"}
            className={`inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "erase"
                ? "bg-accent-strong text-white"
                : "text-muted hover:text-accent-strong"
            }`}
          >
            <Eraser className="h-4 w-4" /> Erase
          </button>
          <button
            onClick={() => setMode("restore")}
            aria-pressed={mode === "restore"}
            className={`inline-flex cursor-pointer items-center gap-1.5 border-l border-line px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "restore"
                ? "bg-accent-strong text-white"
                : "text-muted hover:text-accent-strong"
            }`}
          >
            <Paintbrush className="h-4 w-4" /> Restore
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <span className="font-mono text-xs uppercase tracking-wider text-subtle">
            Brush
          </span>
          <input
            type="range"
            min={1}
            max={100}
            value={brushPct}
            onChange={(e) => setBrushPct(Number(e.target.value))}
            className="accent-accent-strong"
          />
        </label>
        <button
          onClick={undo}
          disabled={!canUndo}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Undo2 className="h-4 w-4" /> Undo
        </button>
        <button
          onClick={resetEdits}
          disabled={!canUndo}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" /> Reset edits
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={apply}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent"
        >
          <Check className="h-4 w-4" /> Apply touch-up
        </button>
        <button
          onClick={onCancel}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:text-accent-strong"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}
