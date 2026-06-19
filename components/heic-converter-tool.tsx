"use client";

import { useState } from "react";
import { Download, FileImage, Loader2, RefreshCw } from "lucide-react";
import { Dropzone } from "@/components/dropzone";
import { GooeyLoader } from "@/components/gooey-loader";
import { downloadBlob } from "@/lib/download";
import { changeExtension, formatBytes } from "@/lib/format";
import { zipFiles } from "@/lib/zip";
import { convertHeic, formatExt, isHeic, type HeicFormat } from "@/lib/heic";

type Result = { name: string; blob: Blob; url: string };

export function HeicConverterTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<HeicFormat>("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [results, setResults] = useState<Result[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = progress !== null;

  function clearResults() {
    setResults((prev) => {
      prev.forEach((r) => URL.revokeObjectURL(r.url));
      return [];
    });
  }

  function addFiles(incoming: File[]) {
    const heic = incoming.filter(isHeic);
    if (heic.length === 0) {
      setError("Those don't look like HEIC/HEIF files — pick photos ending in .heic or .heif.");
      return;
    }
    setError(incoming.length > heic.length ? "Skipped files that aren't HEIC/HEIF." : null);
    clearResults();
    setFiles((prev) => [...prev, ...heic]);
  }

  async function convertAll() {
    if (!files.length) return;
    setError(null);
    clearResults();
    setProgress({ done: 0, total: files.length });
    const out: Result[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const blob = await convertHeic(files[i], format, quality);
        out.push({
          name: changeExtension(files[i].name, formatExt(format)),
          blob,
          url: URL.createObjectURL(blob),
        });
        setProgress({ done: i + 1, total: files.length });
      }
      setResults(out);
    } catch (err) {
      out.forEach((r) => URL.revokeObjectURL(r.url));
      setError(
        (err as Error).message ||
          "Conversion failed. The file may be corrupt or an unsupported HEIC variant.",
      );
    } finally {
      setProgress(null);
    }
  }

  async function downloadZip() {
    const blob = await zipFiles(results.map((r) => ({ name: r.name, blob: r.blob })));
    downloadBlob(blob, "heic-converted.zip");
  }

  function reset() {
    clearResults();
    setFiles([]);
    setError(null);
    setProgress(null);
  }

  if (!files.length) {
    return (
      <div className="space-y-4">
        <Dropzone
          accept=".heic,.heif,image/heic,image/heif"
          onFiles={addFiles}
          label="Drop HEIC photos here"
          hint="iPhone .heic / .heif — convert to JPG or PNG"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-center font-mono text-xs text-subtle">
          Decoded in your browser with libheif — your photos are never uploaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex overflow-hidden rounded-lg border border-line">
          {(["image/jpeg", "image/png"] as HeicFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              aria-pressed={format === f}
              className={`cursor-pointer px-3 py-1.5 text-sm font-medium transition-colors ${
                format === f ? "bg-accent-strong text-white" : "text-muted hover:text-accent-strong"
              }`}
            >
              {f === "image/jpeg" ? "JPG" : "PNG"}
            </button>
          ))}
        </div>
        {format === "image/jpeg" && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="font-mono text-xs uppercase tracking-wider text-subtle">Quality</span>
            <input
              type="range"
              min={50}
              max={100}
              value={Math.round(quality * 100)}
              onChange={(e) => setQuality(Number(e.target.value) / 100)}
              className="accent-accent-strong"
            />
            <span className="font-mono text-xs text-subtle">{Math.round(quality * 100)}</span>
          </label>
        )}
      </div>

      {/* Queue */}
      <ul className="divide-y divide-line rounded-xl border border-line">
        {files.map((f, i) => (
          <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <FileImage className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
            <span className="truncate text-ink">{f.name}</span>
            <span className="ml-auto shrink-0 font-mono text-xs text-subtle">
              {formatBytes(f.size)}
            </span>
          </li>
        ))}
      </ul>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Loading */}
      {busy && (
        <div className="grid place-items-center rounded-xl border border-line bg-surface p-8 text-center">
          <GooeyLoader className="mx-auto" />
          <p className="mt-3 text-sm text-ink">
            Converting {progress.done}/{progress.total}…
          </p>
          <p className="mt-1 text-xs text-subtle">
            The first conversion downloads the decoder (one-time); it&rsquo;s cached after that.
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-subtle">
              {results.length} converted
            </p>
            {results.length > 1 && (
              <button
                onClick={downloadZip}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-accent-strong hover:underline"
              >
                <Download className="h-4 w-4" /> Download all (zip)
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((r) => (
              <div key={r.name} className="flex items-center gap-3 rounded-xl border border-line p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.url}
                  alt={r.name}
                  className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{r.name}</span>
                <button
                  onClick={() => downloadBlob(r.blob, r.name)}
                  aria-label={`Download ${r.name}`}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent-strong px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={convertAll}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileImage className="h-4 w-4" />}
          {busy
            ? `Converting ${progress.done}/${progress.total}…`
            : `Convert ${files.length} file${files.length === 1 ? "" : "s"}`}
        </button>
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
