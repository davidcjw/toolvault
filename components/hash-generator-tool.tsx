"use client";

import { useEffect, useState } from "react";
import { HASH_ALGOS, hashText, type HashAlgo } from "@/lib/hash";
import { CopyButton } from "@/components/copy-button";

export function HashGeneratorTool() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!input) {
        setHashes({});
        return;
      }
      const entries = await Promise.all(
        HASH_ALGOS.map(async (a) => [a, await hashText(input, a)] as const)
      );
      if (!cancelled) setHashes(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Text to hash"
        spellCheck={false}
        className="h-28 w-full resize-y rounded-xl border border-line bg-surface p-3 font-mono text-sm text-ink outline-none focus:border-accent"
      />
      <ul className="space-y-2">
        {HASH_ALGOS.map((algo: HashAlgo) => (
          <li key={algo} className="rounded-xl border border-line bg-surface p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent-strong">
                {algo}
              </span>
              {hashes[algo] && <CopyButton value={hashes[algo]} />}
            </div>
            <p className="break-all font-mono text-sm text-muted">
              {hashes[algo] || <span className="text-subtle">—</span>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
