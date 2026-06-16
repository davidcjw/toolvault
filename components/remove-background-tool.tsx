"use client";

import { useState } from "react";
import { Download, Loader2, RefreshCw, ShieldCheck, Wand2 } from "lucide-react";
import { Dropzone } from "@/components/dropzone";
import { changeExtension } from "@/lib/format";
import { downloadBlob } from "@/lib/download";

const CHECKER =
  "[background-image:repeating-conic-gradient(var(--color-line)_0%_25%,transparent_0%_50%)] [background-size:20px_20px]";

export function RemoveBackgroundTool() {
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ label: string; pct: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: File[]) {
    const img = files.find((f) => f.type.startsWith("image/"));
    if (!img) return;
    setFile(img);
    setSrcUrl(URL.createObjectURL(img));
    setResultUrl(null);
    setResultBlob(null);
    setError(null);
  }

  function reset() {
    setFile(null);
    setSrcUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setError(null);
    setProgress(null);
  }

  async function run() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress({ label: "Loading model…", pct: 0 });
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(file, {
        output: { format: "image/png" },
        progress: (key: string, current: number, total: number) => {
          const pct = total ? Math.round((current / total) * 100) : 0;
          const label = key.startsWith("fetch")
            ? "Downloading model (one-time)…"
            : "Removing background…";
          setProgress({ label, pct });
        },
      });
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError((err as Error).message || "Background removal failed. Try another image.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  if (!file || !srcUrl) {
    return (
      <div className="space-y-4">
        <Dropzone
          accept="image/*"
          onFiles={addFiles}
          multiple={false}
          label="Drop an image here"
          hint="People, products, objects — PNG or JPG"
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
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={resultUrl} alt="Background removed" className="max-h-72 object-contain" />
            ) : busy ? (
              <div className="w-full max-w-xs px-4 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" />
                <p className="mt-2 text-sm text-ink">{progress?.label}</p>
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
          <button
            onClick={() => resultBlob && downloadBlob(resultBlob, changeExtension(file.name, "png"))}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
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
