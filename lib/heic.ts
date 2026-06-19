export type HeicFormat = "image/jpeg" | "image/png";

/**
 * True when a file looks like HEIC/HEIF. The browser often reports an empty or
 * unreliable MIME type for these, so we also check the file extension.
 */
export function isHeic(file: { name?: string; type?: string }): boolean {
  const type = (file.type ?? "").toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  const name = (file.name ?? "").toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

/** File extension for a target format (without the dot). */
export function formatExt(format: HeicFormat): string {
  return format === "image/png" ? "png" : "jpg";
}

/**
 * Decode a HEIC/HEIF blob to a JPEG or PNG blob. Browser-only: dynamically
 * imports `heic-to` (libheif wasm) so the decoder only loads when used.
 */
export async function convertHeic(
  blob: Blob,
  format: HeicFormat,
  quality = 0.9,
): Promise<Blob> {
  // heic-to's Next build bundles a modern libheif (broader iPhone HEIC/HEVC
  // support than heic2any) with the wasm inlined, so there's no asset to serve.
  const { heicTo } = await import("heic-to/next");
  return heicTo({ blob, type: format, quality });
}

/**
 * Normalize an image File for browser processing: decode HEIC/HEIF to a PNG
 * File (keeping a sensible name), pass everything else through unchanged.
 */
export async function toImageFile(file: File): Promise<File> {
  if (!isHeic(file)) return file;
  const png = await convertHeic(file, "image/png");
  const name = file.name.replace(/\.(heic|heif)$/i, "") + ".png";
  return new File([png], name, { type: "image/png" });
}
