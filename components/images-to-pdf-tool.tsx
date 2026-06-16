"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Trash2, X } from "lucide-react";
import { Dropzone } from "@/components/dropzone";
import { imagesToPdf, type PageMode } from "@/lib/pdf";
import { move } from "@/lib/format";
import { downloadBlob } from "@/lib/download";

type Item = { id: string; file: File; previewUrl: string };

export function ImagesToPdfTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<PageMode>("fit");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }

  function reorder(from: number, to: number) {
    setItems((prev) => move(prev, from, to));
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const t = prev.find((i) => i.id === id);
      if (t) URL.revokeObjectURL(t.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function clearAll() {
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setItems([]);
  }

  async function create() {
    if (items.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await imagesToPdf(items.map((i) => i.file), mode);
      downloadBlob(blob, "images.pdf");
    } catch (err) {
      setError((err as Error).message || "Could not create the PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <Dropzone
          accept="image/*"
          onFiles={addFiles}
          label="Drop images here"
          hint="JPG · PNG · WebP — one image per page"
        />
      ) : (
        <>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
              Page size
            </span>
            <div className="flex gap-2">
              {(
                [
                  { v: "fit", label: "Fit to image" },
                  { v: "a4", label: "A4 (centered)" },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  onClick={() => setMode(o.v)}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    mode === o.v
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-canvas text-muted hover:border-accent/40"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <ol className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft font-mono text-sm font-semibold text-accent-strong">
                  {index + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover"
                />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {item.file.name}
                </p>
                <div className="flex items-center">
                  <button
                    onClick={() => reorder(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="cursor-pointer rounded-lg p-2 text-subtle transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => reorder(index, index + 1)}
                    disabled={index === items.length - 1}
                    aria-label="Move down"
                    className="cursor-pointer rounded-lg p-2 text-subtle transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.file.name}`}
                    className="cursor-pointer rounded-lg p-2 text-subtle transition-colors hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ol>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={create}
              disabled={busy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Building…" : "Create PDF & download"}
            </button>
            <button
              onClick={clearAll}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>

          <Dropzone
            accept="image/*"
            onFiles={addFiles}
            label="Add more images"
            hint="They're added to the end"
          />
        </>
      )}
    </div>
  );
}
