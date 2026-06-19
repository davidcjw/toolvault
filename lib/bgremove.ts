export type BgProgress = { label: string; pct: number };

/**
 * Remove an image's background with an in-browser AI model, returning a
 * transparent PNG blob. The model (~several MB) is downloaded once and cached
 * by the browser. Browser-only: dynamically imports `@imgly/background-removal`.
 */
export async function removeImageBackground(
  source: Blob | string,
  onProgress?: (p: BgProgress) => void,
): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(source, {
    output: { format: "image/png" },
    progress: (key: string, current: number, total: number) => {
      const pct = total ? Math.round((current / total) * 100) : 0;
      const label = key.startsWith("fetch")
        ? "Downloading model (one-time)…"
        : "Removing background…";
      onProgress?.({ label, pct });
    },
  });
}
