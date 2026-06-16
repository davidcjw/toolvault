"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import { qrToCanvas, qrToSvg } from "@/lib/qr";
import {
  buildPayNowPayload,
  normalizeSgMobile,
  type ProxyType,
} from "@/lib/paynow";
import { downloadBlob } from "@/lib/download";

const QR = { size: 512, margin: 2, dark: "#581c87", light: "#ffffff", ecc: "M" as const };

export function PayNowQrTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [proxyType, setProxyType] = useState<ProxyType>("mobile");
  const [mobile, setMobile] = useState("");
  const [uen, setUen] = useState("");
  const [amount, setAmount] = useState("");
  const [editable, setEditable] = useState(false);
  const [reference, setReference] = useState("");
  const [name, setName] = useState("");

  const proxy =
    proxyType === "mobile" ? normalizeSgMobile(mobile) : uen.trim() || null;
  const amt = amount ? Number(amount) : undefined;

  const payload = useMemo(() => {
    if (!proxy) return null;
    if (amt != null && (Number.isNaN(amt) || amt < 0)) return null;
    return buildPayNowPayload({
      proxyType,
      proxy,
      amount: amt && amt > 0 ? amt : undefined,
      editable,
      reference: reference.trim() || undefined,
      merchantName: name.trim() || undefined,
    });
  }, [proxy, proxyType, amt, editable, reference, name]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !payload) return;
    qrToCanvas(c, payload, QR);
  }, [payload]);

  function downloadPng() {
    const c = canvasRef.current;
    if (!c || !payload) return;
    c.toBlob((b) => b && downloadBlob(b, "paynow-qr.png"), "image/png");
  }

  async function downloadSvg() {
    if (!payload) return;
    downloadBlob(
      new Blob([await qrToSvg(payload, QR)], { type: "image/svg+xml" }),
      "paynow-qr.svg"
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Form */}
      <div className="space-y-5">
        <div>
          <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
            Receive via
          </span>
          <div className="flex gap-2">
            {(
              [
                { v: "mobile", label: "Mobile number" },
                { v: "uen", label: "UEN" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                onClick={() => setProxyType(o.v)}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  proxyType === o.v
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-canvas text-muted hover:border-accent/40"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {proxyType === "mobile" ? (
          <Field label="Mobile number">
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              inputMode="tel"
              placeholder="9123 4567"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
            {mobile && !proxy && (
              <p className="mt-1 text-xs text-destructive">
                Enter a valid SG mobile (8 digits, starts with 8 or 9).
              </p>
            )}
          </Field>
        ) : (
          <Field label="UEN">
            <input
              value={uen}
              onChange={(e) => setUen(e.target.value)}
              placeholder="201912345A"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </Field>
        )}

        <Field label="Amount (SGD) — optional">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min={0}
            step="0.01"
            placeholder="Leave blank to let payer enter"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
          {amt != null && amt > 0 && (
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={editable}
                onChange={(e) => setEditable(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              Let the payer edit this amount
            </label>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Reference — optional">
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={25}
              placeholder="Invoice #123"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </Field>
          <Field label="Your name — optional">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={25}
              placeholder="Shown to payer"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </Field>
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col items-center gap-4">
        <div className="grid aspect-square w-full max-w-xs place-items-center rounded-2xl border border-line bg-surface p-4">
          {payload ? (
            <canvas ref={canvasRef} className="h-full w-full rounded-lg" aria-label="PayNow QR" />
          ) : (
            <p className="px-6 text-center text-sm text-subtle">
              Enter a mobile number or UEN to generate your PayNow QR.
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadPng}
            disabled={!payload}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-4 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> PNG
          </button>
          <button
            onClick={downloadSvg}
            disabled={!payload}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 font-semibold text-ink transition-colors hover:border-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> SVG
          </button>
        </div>
        <p className="text-center font-mono text-xs text-subtle">
          Scan with any Singapore banking app to pay.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
        {label}
      </span>
      {children}
    </div>
  );
}
