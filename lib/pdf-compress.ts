import { PDFDocument } from "pdf-lib";

export type CompressLevel = "strong" | "medium" | "light";

/** Render scale (≈ DPI/72) and JPEG quality per level. */
export const COMPRESS_LEVELS: Record<
  CompressLevel,
  { label: string; hint: string; scale: number; quality: number }
> = {
  strong: { label: "Strong", hint: "smallest · ~72 dpi", scale: 1, quality: 0.5 },
  medium: { label: "Balanced", hint: "good for most · ~108 dpi", scale: 1.5, quality: 0.62 },
  light: { label: "Light", hint: "best quality · ~144 dpi", scale: 2, quality: 0.78 },
};

/** Compress a PDF by flattening each page to a JPEG and rebuilding the document.
 *  Best for scanned / image-heavy PDFs; page text becomes non-selectable. */
export async function compressPdf(
  file: File,
  opts: { level: CompressLevel; onProgress?: (page: number, total: number) => void }
): Promise<Blob> {
  const { scale, quality } = COMPRESS_LEVELS[opts.level];

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  const out = await PDFDocument.create();

  try {
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const points = page.getViewport({ scale: 1 }); // page size in PDF points
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported in this browser.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      page.cleanup();

      const blob = await new Promise<Blob | null>((r) =>
        canvas.toBlob(r, "image/jpeg", quality)
      );
      if (!blob) throw new Error(`Could not render page ${n}.`);

      const jpg = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      const p = out.addPage([points.width, points.height]);
      p.drawImage(jpg, { x: 0, y: 0, width: points.width, height: points.height });

      opts.onProgress?.(n, doc.numPages);
    }
  } finally {
    await loadingTask.destroy();
  }

  const bytes = await out.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}
