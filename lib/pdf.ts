import { PDFDocument } from "pdf-lib";

/** Merge an ordered list of PDF files into a single PDF, all in-browser. */
export async function mergePdfs(files: File[]): Promise<Blob> {
  const out = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  }

  const merged = await out.save();
  return new Blob([new Uint8Array(merged)], { type: "application/pdf" });
}

export async function pageCount(file: File): Promise<number> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}

export type PageMode = "fit" | "a4";

const A4 = { w: 595.28, h: 841.89 };

/** Convert any image File to PNG or JPEG bytes that pdf-lib can embed. */
async function toEmbeddable(
  file: File
): Promise<{ bytes: Uint8Array; type: "png" | "jpg" }> {
  if (file.type === "image/png") {
    return { bytes: new Uint8Array(await file.arrayBuffer()), type: "png" };
  }
  if (file.type === "image/jpeg") {
    return { bytes: new Uint8Array(await file.arrayBuffer()), type: "jpg" };
  }
  // WebP / others → flatten to JPEG via canvas.
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas is not supported in this browser.");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, "image/jpeg", 0.92)
  );
  if (!blob) throw new Error("Could not read this image.");
  return { bytes: new Uint8Array(await blob.arrayBuffer()), type: "jpg" };
}

/** Build a PDF from an ordered list of images, one image per page. */
export async function imagesToPdf(
  files: File[],
  mode: PageMode = "fit"
): Promise<Blob> {
  const doc = await PDFDocument.create();

  for (const file of files) {
    const { bytes, type } = await toEmbeddable(file);
    const img = type === "png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

    if (mode === "a4") {
      const page = doc.addPage([A4.w, A4.h]);
      const margin = 24;
      const scale = Math.min(
        (A4.w - margin * 2) / img.width,
        (A4.h - margin * 2) / img.height,
        1
      );
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, { x: (A4.w - w) / 2, y: (A4.h - h) / 2, width: w, height: h });
    } else {
      const page = doc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
  }

  const out = await doc.save();
  return new Blob([new Uint8Array(out)], { type: "application/pdf" });
}

export type SplitOutput = { name: string; blob: Blob };

/** Split a PDF into one new PDF per group of page numbers (1-based). */
export async function splitPdf(
  file: File,
  groups: number[][]
): Promise<SplitOutput[]> {
  const srcBytes = await file.arrayBuffer();
  const src = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
  const total = src.getPageCount();
  const base = file.name.replace(/\.pdf$/i, "");
  const results: SplitOutput[] = [];

  for (const group of groups) {
    const indices = group.map((n) => n - 1).filter((i) => i >= 0 && i < total);
    if (indices.length === 0) continue;
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, indices);
    pages.forEach((p) => out.addPage(p));
    const bytes = await out.save();
    const first = group[0];
    const last = group[group.length - 1];
    const label = first === last ? `p${first}` : `p${first}-${last}`;
    results.push({
      name: `${base}_${label}.pdf`,
      blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
    });
  }

  return results;
}
