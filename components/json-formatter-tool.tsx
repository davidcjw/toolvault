"use client";

import { useMemo, useState } from "react";
import { formatJson } from "@/lib/jsonformat";
import { CopyButton } from "@/components/copy-button";

type Indent = "2" | "4" | "min";

export function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<Indent>("2");

  const result = useMemo(
    () => formatJson(input, indent === "min" ? "min" : Number(indent)),
    [input, indent]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-subtle">Indent</span>
        {(["2", "4", "min"] as const).map((o) => (
          <button
            key={o}
            onClick={() => setIndent(o)}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              indent === o
                ? "border-accent bg-accent text-white"
                : "border-line bg-canvas text-muted hover:border-accent/40"
            }`}
          >
            {o === "min" ? "Minify" : `${o} spaces`}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"paste":"your JSON here"}'
          spellCheck={false}
          className="h-72 w-full resize-y rounded-xl border border-line bg-surface p-3 font-mono text-sm text-ink outline-none focus:border-accent"
        />
        <div className="relative">
          <textarea
            readOnly
            value={result.ok ? result.output : ""}
            placeholder="Formatted output"
            spellCheck={false}
            className={`h-72 w-full resize-y rounded-xl border bg-canvas p-3 font-mono text-sm text-ink outline-none ${
              result.ok ? "border-line" : "border-destructive"
            }`}
          />
          {result.ok && result.output && (
            <CopyButton value={result.output} className="absolute right-2 top-2" />
          )}
        </div>
      </div>

      {!result.ok && <p className="text-sm text-destructive">Invalid JSON: {result.error}</p>}
    </div>
  );
}
