"use client";

import { useState } from "react";
import {
  slugify,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
} from "@/lib/textcase";
import { CopyButton } from "@/components/copy-button";

const CONVERSIONS: { label: string; fn: (s: string) => string }[] = [
  { label: "Title Case", fn: toTitleCase },
  { label: "Sentence case", fn: toSentenceCase },
  { label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { label: "lowercase", fn: (s) => s.toLowerCase() },
  { label: "camelCase", fn: toCamelCase },
  { label: "snake_case", fn: toSnakeCase },
  { label: "kebab-case", fn: toKebabCase },
  { label: "CONSTANT_CASE", fn: toConstantCase },
  { label: "slug", fn: slugify },
];

export function CaseConverterTool() {
  const [input, setInput] = useState("");

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type or paste text"
        className="h-28 w-full resize-y rounded-xl border border-line bg-surface p-3 text-sm text-ink outline-none focus:border-accent"
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONVERSIONS.map(({ label, fn }) => {
          const out = input ? fn(input) : "";
          return (
            <li key={label} className="rounded-xl border border-line bg-surface p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-subtle">
                  {label}
                </span>
                {out && <CopyButton value={out} label="" />}
              </div>
              <p className="break-words font-mono text-sm text-ink">
                {out || <span className="text-subtle">—</span>}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
