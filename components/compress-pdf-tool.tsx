"use client";

import { useState } from "react";
import { Download, FileText, Info, Loader2, X } from "lucide-react";
import { Dropzone } from "@/components/dropzone";
import { GooeyLoader } from "@/components/gooey-loader";
import { pageCount } from "@/lib/pdf";
import { compressPdf, COMPRESS_LEVELS, type CompressLevel } from "@/lib/pdf-compress";
import { formatBytes, reductionPercent } from "@/lib/format";
import { downloadBlob } from "@/lib/download";

type Loaded = { file: File; total: number };
type Result = { blob: Blob; size: number };

const LEVELS = Object.entries(COMPRESS_LEVELS) as [
  CompressLevel,
  (typeof COMPRESS_LEVELS)[CompressLevel],
][];

export function CompressPdfTool() {
  const [pdf, setPdf] = useState<Loaded | null>(null);
  const [level, setLevel] = useState<CompressLevel>("medium");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ n: number; total: number } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addFiles(files: File[]) {
    const file = files.find(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (!file) return;
    setResult(null);
    setError(null);
    try {
      setPdf({ file, total: await pageCount(file) });
    } catch {
      setError("Could not read this PDF.");
    }
  }

  async function compress() {
    if (!pdf) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress({ n: 0, total: pdf.total });
    try {
      const blob = await compressPdf(pdf.file, {
        level,
        onProgress: (n, total) => setProgress({ n, total }),
      });
      setResult({ blob, size: blob.size });
    } catch (err) {
      setError((err as Error).message || "Could not compress this PDF.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  function reset() {
    setPdf(null);
    setResult(null);
    setError(null);
  }

  const limitationNotice = (
    <div className="flex items-start gap-2.5 rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-muted">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong" aria-hidden />
      <p>
        Compression runs entirely in your browser, so it works by{" "}
        <span className="font-medium text-ink">flattening each page to an image</span>. That
        shrinks scanned &amp; image-heavy PDFs a lot, but{" "}
        <span className="font-medium text-ink">text becomes non-selectable</span> — keep the
        original if you need editable text.
      </p>
    </div>
  );

  if (!pdf) {
    return (
      <div className="space-y-4">
        <Dropzone
          accept="application/pdf"
          onFiles={addFiles}
          multiple={false}
          label="Drop a PDF here"
          hint="Best for scanned or image-heavy PDFs"
        />
        {limitationNotice}
      </div>
    );
  }

  const saved = result ? reductionPercent(pdf.file.size, result.size) : 0;
  const grew = result != null && result.size >= pdf.file.size;

  return (
    <div className="space-y-6">
      {limitationNotice}
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
        <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
          Compression level
        </span>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setLevel(key)}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                level === key
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-canvas text-muted hover:border-accent/40"
              }`}
            >
              {cfg.label}
              <span
                className={`block font-mono text-[10px] ${
                  level === key ? "text-white/80" : "text-subtle"
                }`}
              >
                {cfg.hint}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={compress}
            disabled={busy}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy
              ? progress
                ? `Compressing ${progress.n}/${progress.total}…`
                : "Compressing…"
              : "Compress PDF"}
          </button>
          {result && (
            <button
              onClick={() =>
                downloadBlob(result.blob, pdf.file.name.replace(/\.pdf$/i, "") + "_compressed.pdf")
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 font-semibold text-ink transition-colors hover:border-accent/40"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {busy && (
        <div className="grid place-items-center rounded-xl border border-line bg-surface p-8 text-center">
          <GooeyLoader className="mx-auto" />
          <p className="mt-3 text-sm text-ink">
            {progress ? `Compressing ${progress.n}/${progress.total}…` : "Compressing…"}
          </p>
        </div>
      )}

      {result && (
        <div
          className={`rounded-2xl border p-5 ${
            grew ? "border-line bg-surface" : "border-accent/30 bg-accent-soft"
          }`}
        >
          {grew ? (
            <p className="text-sm text-muted">
              This PDF is already compact — flattening didn&rsquo;t reduce its size
              ({formatBytes(result.size)}). It&rsquo;s likely text-based rather than scanned.
            </p>
          ) : (
            <p className="text-ink">
              <span className="font-mono text-sm text-subtle">
                {formatBytes(pdf.file.size)} →{" "}
              </span>
              <span className="font-mono text-lg font-bold text-accent-strong">
                {formatBytes(result.size)}
              </span>{" "}
              <span className="font-semibold text-accent-strong">−{saved}% smaller</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
