"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/copy-button";

type Mode = "encode" | "decode";

export function UrlEncodeTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: null as string | null };
    try {
      return {
        output: mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input),
        error: null,
      };
    } catch {
      return { output: "", error: "Could not decode — check for stray % characters." };
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["encode", "decode"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
              mode === m
                ? "border-accent bg-accent text-white"
                : "border-line bg-canvas text-muted hover:border-accent/40"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "Text or URL to encode" : "Encoded text to decode"}
          spellCheck={false}
          className="h-44 w-full resize-y rounded-xl border border-line bg-surface p-3 font-mono text-sm text-ink outline-none focus:border-accent"
        />
        <div className="relative">
          <textarea
            readOnly
            value={output}
            placeholder="Result"
            spellCheck={false}
            className={`h-44 w-full resize-y rounded-xl border bg-canvas p-3 font-mono text-sm text-ink outline-none ${
              error ? "border-destructive" : "border-line"
            }`}
          />
          {output && <CopyButton value={output} className="absolute right-2 top-2" />}
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
