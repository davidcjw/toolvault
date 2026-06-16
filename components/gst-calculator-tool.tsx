"use client";

import { useState } from "react";
import { addGst, GST_RATE, removeGst } from "@/lib/gst";

const SGD = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
});

type Mode = "add" | "remove";

export function GstCalculatorTool() {
  const [mode, setMode] = useState<Mode>("add");
  const [value, setValue] = useState("100");

  const amount = Number(value) || 0;
  const result = mode === "add" ? addGst(amount) : removeGst(amount);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(
          [
            { v: "add", label: "Add GST" },
            { v: "remove", label: "Remove GST" },
          ] as const
        ).map((o) => (
          <button
            key={o.v}
            onClick={() => setMode(o.v)}
            className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              mode === o.v
                ? "border-accent bg-accent text-white"
                : "border-line bg-canvas text-muted hover:border-accent/40"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div>
        <label
          htmlFor="gst-amount"
          className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle"
        >
          {mode === "add" ? "Amount before GST (SGD)" : "Amount including GST (SGD)"}
        </label>
        <input
          id="gst-amount"
          type="number"
          min={0}
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-line bg-surface px-4 py-3 text-lg text-ink outline-none focus:border-accent"
        />
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <Stat label="Before GST" value={SGD.format(result.base)} />
        <Stat label={`GST (${Math.round(GST_RATE * 100)}%)`} value={SGD.format(result.gst)} accent />
        <Stat label="Total incl. GST" value={SGD.format(result.total)} />
      </dl>

      <p className="font-mono text-xs text-subtle">
        Singapore GST is {Math.round(GST_RATE * 100)}% (effective 1 Jan 2024). Calculated
        in your browser.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent ? "border-accent/30 bg-accent-soft" : "border-line bg-surface"
      }`}
    >
      <dt className="font-mono text-xs uppercase tracking-wider text-subtle">{label}</dt>
      <dd
        className={`mt-1 text-2xl font-bold tracking-tight tabular-nums ${
          accent ? "text-accent-strong" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
