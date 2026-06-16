"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { CopyButton } from "@/components/copy-button";

function makeUuids(n: number): string[] {
  return Array.from({ length: n }, () => crypto.randomUUID());
}

export function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>(() => makeUuids(5));

  const generate = () => setUuids(makeUuids(Math.min(100, Math.max(1, count))));
  const joined = uuids.join("\n");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="uuid-count"
            className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle"
          >
            How many (1–100)
          </label>
          <input
            id="uuid-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-28 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <button
          onClick={generate}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" /> Generate
        </button>
        <CopyButton value={joined} label="Copy all" className="px-3 py-2.5 text-sm" />
      </div>

      <ul className="space-y-1.5">
        {uuids.map((u, i) => (
          <li
            key={`${u}-${i}`}
            className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2"
          >
            <span className="break-all font-mono text-sm text-ink">{u}</span>
            <CopyButton value={u} label="" />
          </li>
        ))}
      </ul>
      <p className="font-mono text-xs text-subtle">Version 4 (random) UUIDs, generated on-device.</p>
    </div>
  );
}
