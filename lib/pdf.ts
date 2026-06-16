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
  // Copy into a fresh Uint8Array so the Blob gets a plain ArrayBuffer.
  return new Blob([new Uint8Array(merged)], { type: "application/pdf" });
}

export async function pageCount(file: File): Promise<number> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}
