import { zipSync } from "fflate";

/** Bundle blobs into a single .zip, all in-browser. */
export async function zipFiles(
  files: { name: string; blob: Blob }[]
): Promise<Blob> {
  const entries: Record<string, Uint8Array> = {};
  for (const f of files) {
    entries[f.name] = new Uint8Array(await f.blob.arrayBuffer());
  }
  const zipped = zipSync(entries, { level: 6 });
  return new Blob([zipped], { type: "application/zip" });
}
