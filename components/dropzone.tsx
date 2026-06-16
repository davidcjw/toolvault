"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

type DropzoneProps = {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  hint?: string;
  label?: string;
};

export function Dropzone({
  accept,
  multiple = true,
  onFiles,
  hint,
  label = "Drop files here",
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function emit(list: FileList | null) {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        emit(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={label}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
        dragging
          ? "border-accent bg-accent-soft"
          : "border-line bg-surface hover:border-accent/50 hover:bg-accent-soft/40"
      }`}
    >
      <span
        className={`grid h-12 w-12 place-items-center rounded-full transition-colors ${
          dragging ? "bg-accent text-white" : "bg-canvas text-accent"
        }`}
      >
        <UploadCloud className="h-6 w-6" aria-hidden />
      </span>
      <div>
        <p className="font-semibold text-ink">{label}</p>
        <p className="text-sm text-muted">
          or <span className="text-accent-strong underline">browse</span>
        </p>
      </div>
      {hint ? <p className="font-mono text-xs text-subtle">{hint}</p> : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          emit(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
