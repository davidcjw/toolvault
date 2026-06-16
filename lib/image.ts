import { computeTargetDimensions } from "./format";

export type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

export const FORMAT_OPTIONS: { value: OutputFormat; label: string; ext: string }[] = [
  { value: "image/webp", label: "WebP", ext: "webp" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
];

export function extFor(format: OutputFormat): string {
  return FORMAT_OPTIONS.find((f) => f.value === format)?.ext ?? "img";
}

export type ProcessOptions = {
  format: OutputFormat;
  /** 0–1, ignored for PNG. */
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
};

export type ProcessResult = {
  blob: Blob;
  width: number;
  height: number;
};

/** Decode, optionally downscale, and re-encode an image entirely in-browser. */
export async function processImage(
  file: File,
  opts: ProcessOptions
): Promise<ProcessResult> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = computeTargetDimensions(
    bitmap.width,
    bitmap.height,
    opts.maxWidth,
    opts.maxHeight
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas is not supported in this browser.");
  }

  // JPEG has no alpha channel — flatten onto white to avoid black fills.
  if (opts.format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(
      resolve,
      opts.format,
      opts.format === "image/png" ? undefined : opts.quality
    )
  );
  if (!blob) throw new Error("Could not encode this image.");

  return { blob, width, height };
}
