"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, FileText, Loader2, Trash2, X } from "lucide-react";
import { Dropzone } from "@/components/dropzone";
import { mergePdfs, pageCount } from "@/lib/pdf";
import { formatBytes, move } from "@/lib/format";
import { downloadBlob } from "@/lib/download";

type Item = {
  id: string;
  file: File;
  pages?: number;
};

export function PdfMergeTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addFiles(files: File[]) {
    const pdfs = files.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    const newItems: Item[] = pdfs.map((file) => ({
      id: crypto.randomUUID(),
      file,
    }));
    setItems((prev) => [...prev, ...newItems]);

    // Best-effort page counts (non-blocking).
    for (const it of newItems) {
      try {
        const pages = await pageCount(it.file);
        setItems((prev) =>
          prev.map((i) => (i.id === it.id ? { ...i, pages } : i))
        );
      } catch {
        /* leave page count undefined */
      }
    }
  }

  function reorder(from: number, to: number) {
    setItems((prev) => move(prev, from, to));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function merge() {
    if (items.length < 2) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await mergePdfs(items.map((i) => i.file));
      downloadBlob(blob, "merged.pdf");
    } catch (err) {
      setError((err as Error).message || "Could not merge these PDFs.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <Dropzone
          accept="application/pdf"
          onFiles={addFiles}
          label="Drop PDF files here"
          hint="Add two or more to merge"
        />
      ) : (
        <>
          <ol className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft font-mono text-sm font-semibold text-accent-strong">
                  {index + 1}
                </span>
                <FileText className="h-5 w-5 shrink-0 text-subtle" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {item.file.name}
                  </p>
                  <p className="font-mono text-xs text-subtle">
                    {formatBytes(item.file.size)}
                    {item.pages != null && ` · ${item.pages} page${item.pages > 1 ? "s" : ""}`}
                  </p>
                </div>
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
              onClick={merge}
              disabled={busy || items.length < 2}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Merging…" : "Merge & download"}
            </button>
            <button
              onClick={() => setItems([])}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
            {items.length < 2 && (
              <span className="text-sm text-subtle">Add at least two PDFs.</span>
            )}
          </div>

          <Dropzone
            accept="application/pdf"
            onFiles={addFiles}
            label="Add more PDFs"
            hint="They merge in the order shown"
          />
        </>
      )}
    </div>
  );
}
