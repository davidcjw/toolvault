"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Dropzone } from "@/components/dropzone";
import { GRADIENTS, outputSize } from "@/lib/screenshot";
import { downloadBlob } from "@/lib/download";

export function ScreenshotBeautifierTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [bgType, setBgType] = useState<"gradient" | "solid">("gradient");
  const [gradientId, setGradientId] = useState(GRADIENTS[0].id);
  const [solid, setSolid] = useState("#e2e8f0");
  const [padding, setPadding] = useState(80);
  const [radius, setRadius] = useState(16);
  const [shadow, setShadow] = useState(true);
  const [frame, setFrame] = useState(true);

  function addFiles(files: File[]) {
    const img = files.find((f) => f.type.startsWith("image/"));
    if (img) setSrc(URL.createObjectURL(img));
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
      const barH = frame ? Math.max(28, Math.round(iw * 0.035)) : 0;
      const { width, height } = outputSize(iw, ih, padding, barH);
      c.width = width;
      c.height = height;

      // Background
      if (bgType === "gradient") {
        const g = GRADIENTS.find((x) => x.id === gradientId) ?? GRADIENTS[0];
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, g.stops[0]);
        grad.addColorStop(1, g.stops[1]);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = solid;
      }
      ctx.fillRect(0, 0, width, height);

      const cardX = padding;
      const cardY = padding;
      const cardW = iw;
      const cardH = ih + barH;
      const barColor = "#0f172a";

      // Card base (casts the shadow)
      ctx.save();
      if (shadow) {
        ctx.shadowColor = "rgba(15,23,42,0.35)";
        ctx.shadowBlur = Math.max(24, padding * 0.5);
        ctx.shadowOffsetY = Math.max(12, padding * 0.25);
      }
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = frame ? barColor : "#ffffff";
      ctx.fill();
      ctx.restore();

      // Window dots
      if (frame) {
        const cy = cardY + barH / 2;
        const r = Math.max(4, barH * 0.16);
        const colors = ["#ff5f57", "#febc2e", "#28c840"];
        colors.forEach((col, i) => {
          ctx.beginPath();
          ctx.fillStyle = col;
          ctx.arc(cardX + barH * 0.6 + i * r * 3, cy, r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Clip + draw the screenshot (square top corners when framed)
      ctx.save();
      ctx.beginPath();
      const tl = frame ? 0 : radius;
      ctx.roundRect(cardX, cardY + barH, iw, ih, [tl, tl, radius, radius]);
      ctx.clip();
      ctx.drawImage(img, cardX, cardY + barH, iw, ih);
      ctx.restore();
    })();

    return () => {
      cancelled = true;
    };
  }, [src, bgType, gradientId, solid, padding, radius, shadow, frame]);

  function download() {
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob((b) => b && downloadBlob(b, "screenshot.png"), "image/png");
  }

  if (!src) {
    return (
      <Dropzone
        accept="image/*"
        onFiles={addFiles}
        multiple={false}
        label="Drop a screenshot here"
        hint="PNG · JPG — styled instantly, on-device"
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {/* Preview */}
      <div className="grid place-items-center rounded-2xl border border-line bg-[repeating-conic-gradient(var(--color-line)_0%_25%,transparent_0%_50%)] bg-[length:20px_20px] p-4">
        <canvas
          ref={canvasRef}
          className="max-h-[60vh] w-auto max-w-full rounded-lg"
          aria-label="Beautified screenshot preview"
        />
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <div>
          <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
            Background
          </span>
          <div className="mb-3 flex gap-2">
            {(["gradient", "solid"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setBgType(t)}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  bgType === t
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-canvas text-muted hover:border-accent/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {bgType === "gradient" ? (
            <div className="grid grid-cols-6 gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGradientId(g.id)}
                  aria-label={g.name}
                  title={g.name}
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${g.stops[0]}, ${g.stops[1]})`,
                  }}
                  className={`h-8 w-full cursor-pointer rounded-md ring-2 transition-transform hover:scale-105 ${
                    gradientId === g.id ? "ring-accent" : "ring-transparent"
                  }`}
                />
              ))}
            </div>
          ) : (
            <input
              type="color"
              value={solid}
              onChange={(e) => setSolid(e.target.value)}
              aria-label="Background color"
              className="h-10 w-full cursor-pointer rounded-lg border border-line bg-surface"
            />
          )}
        </div>

        <Slider label={`Padding · ${padding}px`} min={0} max={200} value={padding} onChange={setPadding} />
        <Slider label={`Corner radius · ${radius}px`} min={0} max={48} value={radius} onChange={setRadius} />

        <div className="flex gap-4">
          <Toggle label="Shadow" checked={shadow} onChange={setShadow} />
          <Toggle label="Window bar" checked={frame} onChange={setFrame} />
        </div>

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
            <RefreshCw className="h-4 w-4" /> New screenshot
          </button>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-accent)]"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--color-accent)]"
      />
      {label}
    </label>
  );
}
