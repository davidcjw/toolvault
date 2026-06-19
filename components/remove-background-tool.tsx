"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  Eraser,
  Loader2,
  Paintbrush,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Undo2,
  Wand2,
} from "lucide-react";
import { ImageDropzone } from "@/components/image-dropzone";
import { GooeyLoader } from "@/components/gooey-loader";
import { changeExtension } from "@/lib/format";
import { downloadBlob } from "@/lib/download";
import { removeImageBackground } from "@/lib/bgremove";
import { opaqueBounds, TRIM_ALPHA } from "@/lib/trim";
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

export function RemoveBackgroundTool() {
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ label: string; pct: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trim, setTrim] = useState(true);

  // Editor state
  const [editReady, setEditReady] = useState(false);
  const [mode, setMode] = useState<BrushMode>("erase");
  const [brushPct, setBrushPct] = useState(8);
  const [canUndo, setCanUndo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const origImgRef = useRef<HTMLImageElement | null>(null);
  const resultImgRef = useRef<HTMLImageElement | null>(null);
  const undoStack = useRef<ImageData[]>([]);
  const drawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);

  function addFiles(files: File[]) {
    const img = files.find((f) => f.type.startsWith("image/"));
    if (!img) return;
    setFile(img);
    setSrcUrl(URL.createObjectURL(img));
    setResultUrl(null);
    setEditReady(false);
    setError(null);
  }

  function reset() {
    setFile(null);
    setSrcUrl(null);
    setResultUrl(null);
    setEditReady(false);
    setError(null);
    setProgress(null);
    undoStack.current = [];
    setCanUndo(false);
  }

  async function run() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress({ label: "Loading model…", pct: 0 });
    try {
      const blob = await removeImageBackground(file, setProgress);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError((err as Error).message || "Background removal failed. Try another image.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  // Load the result + original into the editing canvas once a result exists.
  useEffect(() => {
    if (!resultUrl || !srcUrl) return;
    let cancelled = false;
    const resultImg = new Image();
    const origImg = new Image();
    let loaded = 0;
    const onReady = () => {
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      canvas.width = resultImg.naturalWidth;
      canvas.height = resultImg.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(resultImg, 0, 0);
      origImgRef.current = origImg;
      resultImgRef.current = resultImg;
      undoStack.current = [];
      setCanUndo(false);
      setEditReady(true);
    };
    const tick = () => {
      if (++loaded === 2) onReady();
    };
    resultImg.onload = tick;
    origImg.onload = tick;
    resultImg.src = resultUrl;
    origImg.src = srcUrl;
    return () => {
      cancelled = true;
    };
  }, [resultUrl, srcUrl]);

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
    const resultImg = resultImgRef.current;
    if (!canvas || !ctx || !resultImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(resultImg, 0, 0);
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
      if (!orig) return;
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
    if (!editReady) return;
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

  /** Crop the canvas to its non-transparent content, or return it unchanged. */
  function trimmedCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = src.getContext("2d");
    if (!ctx) return src;
    const box = opaqueBounds(
      ctx.getImageData(0, 0, src.width, src.height).data,
      src.width,
      src.height,
      TRIM_ALPHA,
    );
    if (!box || (box.w === src.width && box.h === src.height)) return src;
    const out = document.createElement("canvas");
    out.width = box.w;
    out.height = box.h;
    out
      .getContext("2d")
      ?.drawImage(src, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
    return out;
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    const out = trim ? trimmedCanvas(canvas) : canvas;
    out.toBlob((blob) => {
      if (blob) downloadBlob(blob, changeExtension(file.name, "png"));
    }, "image/png");
  }

  if (!file || !srcUrl) {
    return (
      <div className="space-y-4">
        <ImageDropzone
          onFiles={addFiles}
          multiple={false}
          label="Drop an image here"
          hint="People, products, objects — PNG, JPG or HEIC"
        />
        <p className="flex items-center justify-center gap-2 text-center font-mono text-xs text-subtle">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          A one-time AI model downloads to your browser. Your image is never uploaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="space-y-2">
          <figcaption className="font-mono text-xs uppercase tracking-wider text-subtle">
            Original
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={srcUrl}
            alt="Original"
            className="max-h-80 w-full rounded-xl border border-line object-contain"
          />
        </figure>
        <figure className="space-y-2">
          <figcaption className="font-mono text-xs uppercase tracking-wider text-subtle">
            Result
          </figcaption>
          <div
            className={`grid max-h-80 min-h-40 place-items-center rounded-xl border border-line p-2 ${CHECKER}`}
          >
            {resultUrl ? (
              <canvas
                ref={canvasRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                className={`max-h-72 max-w-full touch-none ${
                  editReady
                    ? mode === "erase"
                      ? "cursor-crosshair"
                      : "cursor-copy"
                    : ""
                }`}
              />
            ) : busy ? (
              <div className="w-full max-w-xs px-4 text-center">
                <GooeyLoader className="mx-auto" />
                <p className="mt-3 text-sm text-ink">{progress?.label}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${progress?.pct ?? 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="px-4 text-center text-sm text-subtle">
                Click &ldquo;Remove background&rdquo; to process.
              </p>
            )}
          </div>
        </figure>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {editReady && (
        <div className="space-y-3 rounded-xl border border-line p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-wider text-subtle">
              Touch up
            </p>
            <p className="text-xs text-subtle">
              {mode === "erase"
                ? "Paint over leftover background to erase it."
                : "Paint over the subject to bring it back."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {!resultUrl ? (
          <button
            onClick={run}
            disabled={busy}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {busy ? "Working…" : "Remove background"}
          </button>
        ) : (
          <>
            <button
              onClick={download}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent"
            >
              <Download className="h-4 w-4" /> Download PNG
            </button>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={trim}
                onChange={(e) => setTrim(e.target.checked)}
                className="accent-accent-strong"
              />
              Trim transparent edges
            </label>
          </>
        )}
        <button
          onClick={reset}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:text-accent-strong"
        >
          <RefreshCw className="h-4 w-4" /> New image
        </button>
      </div>
    </div>
  );
}
