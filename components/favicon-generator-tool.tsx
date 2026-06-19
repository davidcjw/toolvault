"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Loader2, RefreshCw } from "lucide-react";
import { ImageDropzone } from "@/components/image-dropzone";
import {
  FAVICON_HTML,
  FAVICON_SIZES,
  ICO_SIZES,
  pngName,
  pngsToIco,
  webManifest,
} from "@/lib/favicon";
import { zipFiles } from "@/lib/zip";
import { downloadBlob } from "@/lib/download";

/** Draw an image cover-cropped to a square of `size`px and return PNG bytes. */
async function squarePng(img: HTMLImageElement, size: number): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) throw new Error("Could not render the icon.");
  return new Uint8Array(await blob.arrayBuffer());
}

export function FaviconGeneratorTool() {
  const [src, setSrc] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("My Site");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  function addFiles(files: File[]) {
    const img = files.find((f) => f.type.startsWith("image/"));
    if (img) setSrc(URL.createObjectURL(img));
  }

  // Live preview of the small sizes.
  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    (async () => {
      const img = new Image();
      img.src = src;
      await img.decode().catch(() => {});
      if (cancelled) return;
      for (const size of ICO_SIZES) {
        const c = previewRefs.current[size];
        if (!c) continue;
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d");
        if (!ctx) continue;
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        ctx.drawImage(
          img,
          (img.naturalWidth - side) / 2,
          (img.naturalHeight - side) / 2,
          side,
          side,
          0,
          0,
          size,
          size
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

  async function generate() {
    if (!src) return;
    setBusy(true);
    try {
      const img = new Image();
      img.src = src;
      await img.decode();

      const pngs = await Promise.all(
        FAVICON_SIZES.map(async (size) => ({ size, png: await squarePng(img, size) }))
      );
      const ico = pngsToIco(pngs.filter((p) => ICO_SIZES.includes(p.size as 16 | 32 | 48)));

      const files = [
        { name: "favicon.ico", blob: new Blob([new Uint8Array(ico)], { type: "image/x-icon" }) },
        ...pngs.map((p) => ({
          name: pngName(p.size),
          blob: new Blob([new Uint8Array(p.png)], { type: "image/png" }),
        })),
        {
          name: "site.webmanifest",
          blob: new Blob([webManifest(siteName)], { type: "application/manifest+json" }),
        },
        {
          name: "head-snippet.html",
          blob: new Blob([FAVICON_HTML], { type: "text/html" }),
        },
      ];

      downloadBlob(await zipFiles(files), "favicons.zip");
    } finally {
      setBusy(false);
    }
  }

  function copySnippet() {
    navigator.clipboard.writeText(FAVICON_HTML).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!src) {
    return (
      <ImageDropzone
        onFiles={addFiles}
        multiple={false}
        label="Drop a square image here"
        hint="PNG, JPG or HEIC, at least 512×512 for best results"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-end gap-4">
          {ICO_SIZES.map((size) => (
            <div key={size} className="flex flex-col items-center gap-1.5">
              <canvas
                ref={(el) => {
                  previewRefs.current[size] = el;
                }}
                style={{ width: size, height: size }}
                className="rounded border border-line"
              />
              <span className="font-mono text-[10px] text-subtle">{size}px</span>
            </div>
          ))}
        </div>
        <div className="flex-1">
          <label
            htmlFor="site-name"
            className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle"
          >
            Site name (for manifest)
          </label>
          <input
            id="site-name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={generate}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {busy ? "Generating…" : "Generate favicon pack (.zip)"}
        </button>
        <button
          onClick={() => setSrc(null)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:text-accent-strong"
        >
          <RefreshCw className="h-4 w-4" /> New image
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-subtle">
            Paste into your &lt;head&gt;
          </span>
          <button
            onClick={copySnippet}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/40"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-xl border border-line bg-surface p-4 font-mono text-xs leading-relaxed text-muted">
          {FAVICON_HTML}
        </pre>
      </div>
    </div>
  );
}
