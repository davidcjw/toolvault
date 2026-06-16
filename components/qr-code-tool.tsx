"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ImagePlus, X } from "lucide-react";
import { qrToCanvas, qrToSvg, type Ecc } from "@/lib/qr";
import { downloadBlob } from "@/lib/download";

const ECC_OPTIONS: { v: Ecc; label: string }[] = [
  { v: "L", label: "Low" },
  { v: "M", label: "Medium" },
  { v: "Q", label: "Quartile" },
  { v: "H", label: "High" },
];

export function QrCodeTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("https://toolvault.davidcjw.com");
  const [dark, setDark] = useState("#0f172a");
  const [light, setLight] = useState("#ffffff");
  const [ecc, setEcc] = useState<Ecc>("M");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  const SIZE = 512;
  const hasText = text.trim().length > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    async function render() {
      const c = canvasRef.current;
      if (!c) return;
      if (!hasText) {
        const ctx = c.getContext("2d");
        if (ctx) {
          c.width = SIZE;
          c.height = SIZE;
          ctx.clearRect(0, 0, SIZE, SIZE);
        }
        return;
      }
      await qrToCanvas(c, text, {
        size: SIZE,
        margin: 2,
        dark,
        light,
        // Force high correction when a logo covers the center.
        ecc: logoUrl ? "H" : ecc,
      });
      if (cancelled) return;

      if (logoUrl) {
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const img = new Image();
        img.src = logoUrl;
        await img.decode().catch(() => {});
        if (cancelled) return;
        const box = c.width * 0.24;
        const x = (c.width - box) / 2;
        const y = (c.height - box) / 2;
        const pad = box * 0.12;
        ctx.fillStyle = light;
        ctx.fillRect(x - pad, y - pad, box + pad * 2, box + pad * 2);
        ctx.drawImage(img, x, y, box, box);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [text, dark, light, ecc, logoUrl, hasText]);

  function setLogo(files: File[]) {
    const img = files.find((f) => f.type.startsWith("image/"));
    if (img) setLogoUrl(URL.createObjectURL(img));
  }

  function downloadPng() {
    const c = canvasRef.current;
    if (!c || !hasText) return;
    c.toBlob((b) => b && downloadBlob(b, "qr-code.png"), "image/png");
  }

  async function downloadSvg() {
    if (!hasText) return;
    const svg = await qrToSvg(text, { size: SIZE, margin: 2, dark, light, ecc });
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Controls */}
      <div className="space-y-5">
        <div>
          <label
            htmlFor="qr-text"
            className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle"
          >
            Link or text
          </label>
          <textarea
            id="qr-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="https://example.com or any text"
            className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <div className="flex gap-5">
          <div>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
              Foreground
            </span>
            <input
              type="color"
              value={dark}
              onChange={(e) => setDark(e.target.value)}
              aria-label="Foreground color"
              className="h-10 w-16 cursor-pointer rounded-lg border border-line bg-surface"
            />
          </div>
          <div>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
              Background
            </span>
            <input
              type="color"
              value={light}
              onChange={(e) => setLight(e.target.value)}
              aria-label="Background color"
              className="h-10 w-16 cursor-pointer rounded-lg border border-line bg-surface"
            />
          </div>
        </div>

        <div>
          <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
            Error correction
          </span>
          <div className="flex gap-2">
            {ECC_OPTIONS.map((o) => (
              <button
                key={o.v}
                onClick={() => setEcc(o.v)}
                disabled={!!logoUrl}
                title={logoUrl ? "Forced to High while a logo is set" : undefined}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  (logoUrl ? "H" : ecc) === o.v
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-canvas text-muted hover:border-accent/40"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
            Center logo (optional)
          </span>
          {logoUrl ? (
            <button
              onClick={() => {
                URL.revokeObjectURL(logoUrl);
                setLogoUrl(null);
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted transition-colors hover:text-destructive"
            >
              <X className="h-4 w-4" /> Remove logo
            </button>
          ) : (
            <button
              onClick={() => logoInput.current?.click()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted transition-colors hover:border-accent/40"
            >
              <ImagePlus className="h-4 w-4" /> Upload logo
            </button>
          )}
          <input
            ref={logoInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) setLogo(Array.from(e.target.files));
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col items-center gap-4">
        <div className="grid aspect-square w-full max-w-xs place-items-center rounded-2xl border border-line bg-surface p-4">
          {hasText ? (
            <canvas
              ref={canvasRef}
              className="h-full w-full rounded-lg"
              aria-label="QR code preview"
            />
          ) : (
            <p className="px-6 text-center text-sm text-subtle">
              Enter a link or text to generate your QR code.
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadPng}
            disabled={!hasText}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-4 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> PNG
          </button>
          <button
            onClick={downloadSvg}
            disabled={!hasText}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 font-semibold text-ink transition-colors hover:border-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> SVG
          </button>
        </div>
      </div>
    </div>
  );
}
