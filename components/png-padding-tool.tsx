"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Link, Link2Off, RefreshCw } from "lucide-react";
import { ImageDropzone } from "@/components/image-dropzone";
import { clampPad, paddedSize, ZERO_PADDING, type Padding } from "@/lib/padding";
import { downloadBlob } from "@/lib/download";

type Side = keyof Padding;
const SIDES: Side[] = ["top", "right", "bottom", "left"];

export function PngPaddingTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [pad, setPad] = useState<Padding>({ ...ZERO_PADDING, top: 40, right: 40, bottom: 40, left: 40 });
  const [linked, setLinked] = useState(true);
  const [transparent, setTransparent] = useState(true);
  const [color, setColor] = useState("#ffffff");
  const [out, setOut] = useState<{ width: number; height: number } | null>(null);

  function addFiles(files: File[]) {
    const img = files.find((f) => f.type.startsWith("image/"));
    if (img) setSrc(URL.createObjectURL(img));
  }

  function setSide(side: Side, value: number) {
    const v = clampPad(value);
    setPad((p) => (linked ? { top: v, right: v, bottom: v, left: v } : { ...p, [side]: v }));
  }

  useEffect(() => {
    if (!src) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    (async () => {
      const img = new Image();
      img.src = src;
      await img.decode().catch(() => {});
      if (cancelled || !canvasRef.current) return;

      const c = canvasRef.current;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const { width, height } = paddedSize(iw, ih, pad);
      c.width = width;
      c.height = height;

      ctx.clearRect(0, 0, width, height);
      if (!transparent) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, clampPad(pad.left), clampPad(pad.top), iw, ih);
      setOut({ width, height });
    })();

    return () => {
      cancelled = true;
    };
  }, [src, pad, transparent, color]);

  function download() {
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob((b) => b && downloadBlob(b, "padded.png"), "image/png");
  }

  if (!src) {
    return (
      <ImageDropzone
        onFiles={addFiles}
        multiple={false}
        label="Drop a PNG here"
        hint="PNG · JPG · HEIC — padded instantly, on-device"
      />
    );
  }

  const checker =
    "bg-[repeating-conic-gradient(var(--color-line)_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {/* Preview */}
      <div className={`grid place-items-center rounded-2xl border border-line p-4 ${checker}`}>
        <canvas
          ref={canvasRef}
          className="max-h-[60vh] w-auto max-w-full rounded-lg"
          aria-label="Padded image preview"
        />
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-subtle">
              Padding · px
            </span>
            <button
              onClick={() => setLinked((v) => !v)}
              title={linked ? "Sides linked" : "Sides independent"}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
                linked
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-canvas text-muted hover:border-accent/40"
              }`}
            >
              {linked ? <Link className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
              {linked ? "Linked" : "Per-side"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SIDES.map((side) => (
              <label key={side} className="block">
                <span className="mb-1 block font-mono text-[11px] capitalize text-muted">
                  {side}
                </span>
                <input
                  type="number"
                  min={0}
                  value={pad[side]}
                  onChange={(e) => setSide(side, Number(e.target.value))}
                  className="w-full rounded-lg border border-line bg-canvas px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
            Background
          </span>
          <div className="mb-3 flex gap-2">
            {([["transparent", true], ["solid color", false]] as const).map(([label, t]) => (
              <button
                key={label}
                onClick={() => setTransparent(t)}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  transparent === t
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-canvas text-muted hover:border-accent/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {!transparent && (
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Background color"
              className="h-10 w-full cursor-pointer rounded-lg border border-line bg-surface"
            />
          )}
        </div>

        {out && (
          <p className="font-mono text-xs text-muted">
            Output · {out.width} × {out.height} px
          </p>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={download}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-strong px-4 py-2.5 font-semibold text-white transition-colors hover:bg-accent"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
          <button
            onClick={() => setSrc(null)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-accent/40"
          >
            <RefreshCw className="h-4 w-4" /> New image
          </button>
        </div>
      </div>
    </div>
  );
}
