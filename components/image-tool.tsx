"use client";

import { useState } from "react";
import { Download, Loader2, Trash2, X } from "lucide-react";
import { Dropzone } from "@/components/dropzone";
import {
  FORMAT_OPTIONS,
  extFor,
  processImage,
  type OutputFormat,
} from "@/lib/image";
import {
  changeExtension,
  formatBytes,
  reductionPercent,
} from "@/lib/format";
import { downloadBlob } from "@/lib/download";

type Item = {
  id: string;
  file: File;
  previewUrl: string;
  status: "idle" | "working" | "done" | "error";
  result?: { blob: Blob; size: number; width: number; height: number };
  error?: string;
};

export function ImageTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const isLossy = format !== "image/png";

  function addFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "idle" as const,
      })),
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function clearAll() {
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setItems([]);
  }

  async function run() {
    if (items.length === 0) return;
    setBusy(true);
    const max = maxWidth ? Number(maxWidth) : undefined;

    for (const item of items) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "working" } : i))
      );
      try {
        const { blob, width, height } = await processImage(item.file, {
          format,
          quality,
          maxWidth: max && max > 0 ? max : undefined,
        });
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "done",
                  result: { blob, size: blob.size, width, height },
                }
              : i
          )
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "error", error: (err as Error).message }
              : i
          )
        );
      }
    }
    setBusy(false);
  }

  function save(item: Item) {
    if (!item.result) return;
    downloadBlob(item.result.blob, changeExtension(item.file.name, extFor(format)));
  }

  function saveAll() {
    items.forEach((i) => i.result && save(i));
  }

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <Dropzone
          accept="image/*"
          onFiles={addFiles}
          label="Drop images here"
          hint="PNG · JPG · WebP — batch supported"
        />
      ) : (
        <>
          {/* Options */}
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
                  Convert to
                </label>
                <div className="flex gap-2">
                  {FORMAT_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFormat(f.value)}
                      className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        format === f.value
                          ? "border-accent bg-accent text-white"
                          : "border-line bg-canvas text-muted hover:border-accent/40"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {isLossy && (
                <div className="min-w-44">
                  <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
                    Quality · {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-[var(--color-accent)]"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
                  Max width (px)
                </label>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value)}
                  placeholder="original"
                  className="w-32 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={run}
                disabled={busy}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? "Processing…" : `Convert ${items.length} image${items.length > 1 ? "s" : ""}`}
              </button>
              {doneCount > 0 && (
                <button
                  onClick={saveAll}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 font-semibold text-ink transition-colors hover:border-accent/40"
                >
                  <Download className="h-4 w-4" />
                  Download all
                </button>
              )}
              <button
                onClick={clearAll}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          {/* Results */}
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-line bg-surface p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {item.file.name}
                  </p>
                  <p className="font-mono text-xs text-subtle">
                    {item.status === "done" && item.result ? (
                      <>
                        {formatBytes(item.file.size)} →{" "}
                        <span className="text-accent-strong">
                          {formatBytes(item.result.size)}
                        </span>{" "}
                        · {item.result.width}×{item.result.height}
                        {reductionPercent(item.file.size, item.result.size) > 0 && (
                          <span className="text-accent-strong">
                            {" "}
                            (−{reductionPercent(item.file.size, item.result.size)}%)
                          </span>
                        )}
                      </>
                    ) : item.status === "error" ? (
                      <span className="text-destructive">{item.error}</span>
                    ) : (
                      formatBytes(item.file.size)
                    )}
                  </p>
                </div>

                {item.status === "working" && (
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                )}
                {item.status === "done" && (
                  <button
                    onClick={() => save(item)}
                    aria-label={`Download ${item.file.name}`}
                    className="cursor-pointer rounded-lg border border-line p-2 text-accent-strong transition-colors hover:bg-accent-soft"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.file.name}`}
                  className="cursor-pointer rounded-lg p-2 text-subtle transition-colors hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <Dropzone
            accept="image/*"
            onFiles={addFiles}
            label="Add more images"
            hint="PNG · JPG · WebP"
          />
        </>
      )}
    </div>
  );
}
