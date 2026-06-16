"use client";

import { useState } from "react";
import { FileText, Loader2, X } from "lucide-react";
import { Dropzone } from "@/components/dropzone";
import { pageCount, splitPdf } from "@/lib/pdf";
import { everyPage, parsePageRanges } from "@/lib/ranges";
import { formatBytes } from "@/lib/format";
import { downloadBlob } from "@/lib/download";
import { zipFiles } from "@/lib/zip";

type Loaded = { file: File; total: number };
type OutputMode = "separate" | "combined";

export function SplitPdfTool() {
  const [pdf, setPdf] = useState<Loaded | null>(null);
  const [ranges, setRanges] = useState("");
  const [output, setOutput] = useState<OutputMode>("separate");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addFiles(files: File[]) {
    const file = files.find(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (!file) return;
    setError(null);
    try {
      const total = await pageCount(file);
      setPdf({ file, total });
    } catch {
      setError("Could not read this PDF.");
    }
  }

  async function run(groups: number[][], combined: boolean) {
    if (!pdf) return;
    if (groups.length === 0) {
      setError("Enter at least one valid page or range.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const base = pdf.file.name.replace(/\.pdf$/i, "");
      if (combined) {
        const flat = Array.from(new Set(groups.flat())).sort((a, b) => a - b);
        const [out] = await splitPdf(pdf.file, [flat]);
        if (out) downloadBlob(out.blob, `${base}_extracted.pdf`);
      } else {
        const outputs = await splitPdf(pdf.file, groups);
        if (outputs.length === 1) {
          downloadBlob(outputs[0].blob, outputs[0].name);
        } else if (outputs.length > 1) {
          const zip = await zipFiles(outputs);
          downloadBlob(zip, `${base}_split.zip`);
        }
      }
    } catch (err) {
      setError((err as Error).message || "Could not split this PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {!pdf ? (
        <Dropzone
          accept="application/pdf"
          onFiles={addFiles}
          multiple={false}
          label="Drop a PDF here"
          hint="Then choose which pages to extract"
        />
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <FileText className="h-5 w-5 shrink-0 text-subtle" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{pdf.file.name}</p>
              <p className="font-mono text-xs text-subtle">
                {formatBytes(pdf.file.size)} · {pdf.total} pages
              </p>
            </div>
            <button
              onClick={() => setPdf(null)}
              aria-label="Remove PDF"
              className="cursor-pointer rounded-lg p-2 text-subtle transition-colors hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <label
              htmlFor="ranges"
              className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle"
            >
              Pages to extract
            </label>
            <input
              id="ranges"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              placeholder="e.g. 1-3, 5, 8-10"
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
            <p className="mt-2 text-xs text-muted">
              Each comma-separated range becomes its own PDF. Use{" "}
              <span className="font-mono">8-</span> for &ldquo;to the end&rdquo;.
            </p>

            <div className="mt-4 flex flex-wrap gap-4">
              {(
                [
                  { v: "separate", label: "One PDF per range" },
                  { v: "combined", label: "Combine into one PDF" },
                ] as const
              ).map((o) => (
                <label key={o.v} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="output"
                    checked={output === o.v}
                    onChange={() => setOutput(o.v)}
                    className="accent-[var(--color-accent)]"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => run(parsePageRanges(ranges, pdf.total), output === "combined")}
              disabled={busy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Splitting…" : "Split & download"}
            </button>
            <button
              onClick={() => run(everyPage(pdf.total), false)}
              disabled={busy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 font-semibold text-ink transition-colors hover:border-accent/40 disabled:opacity-60"
            >
              Split into single pages (.zip)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
