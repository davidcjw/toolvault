"use client";

import { useMemo, useState } from "react";
import { lineDiff } from "@/lib/diff";

export function TextDiffTool() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const ops = useMemo(() => (a || b ? lineDiff(a, b) : []), [a, b]);
  const added = ops.filter((o) => o.type === "add").length;
  const removed = ops.filter((o) => o.type === "del").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          value={a}
          onChange={(e) => setA(e.target.value)}
          placeholder="Original"
          spellCheck={false}
          className="h-44 w-full resize-y rounded-xl border border-line bg-surface p-3 font-mono text-sm text-ink outline-none focus:border-accent"
        />
        <textarea
          value={b}
          onChange={(e) => setB(e.target.value)}
          placeholder="Changed"
          spellCheck={false}
          className="h-44 w-full resize-y rounded-xl border border-line bg-surface p-3 font-mono text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      {ops.length > 0 && (
        <>
          <p className="font-mono text-xs text-subtle">
            <span className="text-accent-strong">+{added} added</span> ·{" "}
            <span className="text-destructive">-{removed} removed</span>
          </p>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <pre className="font-mono text-sm leading-relaxed">
              {ops.map((op, i) => (
                <div
                  key={i}
                  className={
                    op.type === "add"
                      ? "bg-accent-soft text-accent-strong"
                      : op.type === "del"
                        ? "bg-destructive/10 text-destructive line-through decoration-1"
                        : "text-muted"
                  }
                >
                  <span className="inline-block w-6 select-none px-2 text-subtle">
                    {op.type === "add" ? "+" : op.type === "del" ? "-" : " "}
                  </span>
                  {op.text || " "}
                </div>
              ))}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
