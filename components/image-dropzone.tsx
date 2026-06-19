"use client";

import { useState } from "react";
import { Dropzone } from "@/components/dropzone";
import { GooeyLoader } from "@/components/gooey-loader";
import { isHeic, toImageFile } from "@/lib/heic";

type Props = {
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  hint?: string;
};

/**
 * A Dropzone that also accepts HEIC/HEIF: any dropped HEIC is decoded to PNG
 * (with a loading state) before `onFiles` is called, so every image tool can
 * accept iPhone photos without its own decode logic.
 */
export function ImageDropzone({ multiple, onFiles, label, hint }: Props) {
  const [decoding, setDecoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(files: File[]) {
    if (!files.some(isHeic)) {
      onFiles(files);
      return;
    }
    setError(null);
    setDecoding(true);
    try {
      onFiles(await Promise.all(files.map(toImageFile)));
    } catch {
      setError("Couldn't read a HEIC file. Try converting it first.");
    } finally {
      setDecoding(false);
    }
  }

  if (decoding) {
    return (
      <div className="grid place-items-center rounded-2xl border border-line bg-surface p-12 text-center">
        <GooeyLoader className="mx-auto" />
        <p className="mt-3 text-sm text-ink">Converting HEIC…</p>
      </div>
    );
  }

  return (
    <>
      <Dropzone
        accept="image/*,.heic,.heif"
        multiple={multiple}
        onFiles={handle}
        label={label}
        hint={hint}
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </>
  );
}
