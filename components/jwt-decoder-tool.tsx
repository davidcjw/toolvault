"use client";

import { useMemo, useState } from "react";
import { decodeJwt, jwtTimestamp } from "@/lib/jwt";
import { CopyButton } from "@/components/copy-button";

const TIME_CLAIMS = ["exp", "iat", "nbf"];

export function JwtDecoderTool() {
  const [token, setToken] = useState("");

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { ok: true as const, ...decodeJwt(token) };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [token]);

  return (
    <div className="space-y-4">
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste a JWT (eyJhbGci…)"
        spellCheck={false}
        className="h-28 w-full resize-y rounded-xl border border-line bg-surface p-3 font-mono text-sm break-all text-ink outline-none focus:border-accent"
      />

      {decoded && !decoded.ok && (
        <p className="text-sm text-destructive">{decoded.error}</p>
      )}

      {decoded && decoded.ok && (
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Header" json={decoded.header} />
          <Panel title="Payload" json={decoded.payload} />
          {TIME_CLAIMS.some((c) => jwtTimestamp(decoded.payload[c])) && (
            <div className="md:col-span-2 rounded-xl border border-line bg-surface p-3">
              <p className="mb-2 font-mono text-xs uppercase tracking-wider text-subtle">
                Timestamps
              </p>
              <ul className="space-y-1 text-sm">
                {TIME_CLAIMS.map((c) => {
                  const iso = jwtTimestamp(decoded.payload[c]);
                  if (!iso) return null;
                  return (
                    <li key={c} className="font-mono text-muted">
                      <span className="text-accent-strong">{c}</span> ={" "}
                      {iso.replace("T", " ").replace(".000Z", " UTC")}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <p className="md:col-span-2 font-mono text-xs text-subtle">
            Decoded locally. The signature is not verified (that needs the secret/key).
          </p>
        </div>
      )}
    </div>
  );
}

function Panel({ title, json }: { title: string; json: Record<string, unknown> }) {
  const text = JSON.stringify(json, null, 2);
  return (
    <div className="relative rounded-xl border border-line bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-wider text-subtle">{title}</p>
        <CopyButton value={text} />
      </div>
      <pre className="overflow-x-auto font-mono text-sm text-ink">{text}</pre>
    </div>
  );
}
