"use client";

import { useState } from "react";
import { Download, FileText, Loader2, X } from "lucide-react";
import { Dropzone } from "@/components/dropzone";
import { GooeyLoader } from "@/components/gooey-loader";
import { pageCount } from "@/lib/pdf";
import {
  renderPdfToImages,
  type RenderedPage,
  type RenderFormat,
} from "@/lib/pdf-render";
import { formatBytes } from "@/lib/format";
import { downloadBlob } from "@/lib/download";
import { zipFiles } from "@/lib/zip";

type Loaded = { file: File; total: number };

const SCALES = [
  { v: 1, label: "1× (72 dpi)" },
  { v: 2, label: "2× (144 dpi)" },
  { v: 3, label: "3× (216 dpi)" },
];

export function PdfToImageTool() {
  const [pdf, setPdf] = useState<Loaded | null>(null);
  const [format, setFormat] = useState<RenderFormat>("image/png");
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ n: number; total: number } | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [error, setError] = useState<string | null>(null);

  function clearPages() {
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);
  }

  async function addFiles(files: File[]) {
    const file = files.find(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (!file) return;
    clearPages();
    setError(null);
    try {
      setPdf({ file, total: await pageCount(file) });
    } catch {
      setError("Could not read this PDF.");
    }
  }

  async function convert() {
    if (!pdf) return;
    setBusy(true);
    setError(null);
    clearPages();
    setProgress({ n: 0, total: pdf.total });
    try {
      const rendered = await renderPdfToImages(pdf.file, {
        format,
        scale,
        onProgress: (n, total) => setProgress({ n, total }),
      });
      setPages(rendered);
    } catch (err) {
      setError((err as Error).message || "Could not convert this PDF.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function downloadAll() {
    if (pages.length === 0) return;
    if (pages.length === 1) {
      downloadBlob(pages[0].blob, pages[0].name);
      return;
    }
    const base = pdf!.file.name.replace(/\.pdf$/i, "");
    downloadBlob(await zipFiles(pages), `${base}_images.zip`);
  }

  function reset() {
    clearPages();
    setPdf(null);
    setError(null);
  }

  if (!pdf) {
    return (
      <Dropzone
        accept="application/pdf"
        onFiles={addFiles}
        multiple={false}
        label="Drop a PDF here"
        hint="Each page becomes a PNG or JPG"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
        <FileText className="h-5 w-5 shrink-0 text-subtle" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{pdf.file.name}</p>
          <p className="font-mono text-xs text-subtle">
            {formatBytes(pdf.file.size)} · {pdf.total} pages
          </p>
        </div>
        <button
          onClick={reset}
          aria-label="Remove PDF"
          className="cursor-pointer rounded-lg p-2 text-subtle transition-colors hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
              Format
            </span>
            <div className="flex gap-2">
              {(
                [
                  { v: "image/png", label: "PNG" },
                  { v: "image/jpeg", label: "JPG" },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  onClick={() => setFormat(o.v)}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    format === o.v
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
              Resolution
            </span>
            <div className="flex gap-2">
              {SCALES.map((o) => (
                <button
                  key={o.v}
                  onClick={() => setScale(o.v)}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    scale === o.v
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-canvas text-muted hover:border-accent/40"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={convert}
            disabled={busy}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy
              ? progress
                ? `Rendering ${progress.n}/${progress.total}…`
                : "Rendering…"
              : `Convert ${pdf.total} page${pdf.total > 1 ? "s" : ""}`}
          </button>
          {pages.length > 0 && (
            <button
              onClick={downloadAll}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 font-semibold text-ink transition-colors hover:border-accent/40"
            >
              <Download className="h-4 w-4" />
              {pages.length === 1 ? "Download" : "Download all (.zip)"}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {busy && (
        <div className="grid place-items-center rounded-xl border border-line bg-surface p-8 text-center">
          <GooeyLoader className="mx-auto" />
          <p className="mt-3 text-sm text-ink">
            {progress ? `Rendering ${progress.n}/${progress.total}…` : "Rendering…"}
          </p>
        </div>
      )}

      {pages.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {pages.map((p, i) => (
            <li
              key={p.url}
              className="overflow-hidden rounded-xl border border-line bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Page ${i + 1}`} className="aspect-[3/4] w-full object-contain bg-canvas" />
              <div className="flex items-center justify-between gap-2 p-2.5">
                <span className="font-mono text-xs text-subtle">
                  p{i + 1} · {p.width}×{p.height}
                </span>
                <button
                  onClick={() => downloadBlob(p.blob, p.name)}
                  aria-label={`Download page ${i + 1}`}
                  className="cursor-pointer rounded-lg border border-line p-1.5 text-accent-strong transition-colors hover:bg-accent-soft"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
