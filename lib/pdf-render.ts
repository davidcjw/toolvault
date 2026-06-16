export type RenderFormat = "image/png" | "image/jpeg";

export type RenderedPage = {
  name: string;
  blob: Blob;
  url: string;
  width: number;
  height: number;
};

/** Output filename for a rendered page, e.g. ("report", 3, "png") -> "report_p3.png". */
export function pdfPageName(base: string, page: number, ext: string): string {
  return `${base}_p${page}.${ext}`;
}

/** Render every page of a PDF to an image, entirely in the browser (pdf.js). */
export async function renderPdfToImages(
  file: File,
  opts: {
    format: RenderFormat;
    scale: number;
    quality?: number;
    onProgress?: (page: number, total: number) => void;
  }
): Promise<RenderedPage[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  const base = file.name.replace(/\.pdf$/i, "");
  const ext = opts.format === "image/png" ? "png" : "jpg";
  const pages: RenderedPage[] = [];

  try {
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const viewport = page.getViewport({ scale: opts.scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported in this browser.");
      if (opts.format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const blob = await new Promise<Blob | null>((r) =>
        canvas.toBlob(r, opts.format, opts.format === "image/jpeg" ? (opts.quality ?? 0.92) : undefined)
      );
      page.cleanup();
      if (!blob) throw new Error(`Could not render page ${n}.`);
      pages.push({
        name: pdfPageName(base, n, ext),
        blob,
        url: URL.createObjectURL(blob),
        width: canvas.width,
        height: canvas.height,
      });
      opts.onProgress?.(n, doc.numPages);
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages;
}
