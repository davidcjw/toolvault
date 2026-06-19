"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { searchImages, type CommonsImage } from "@/lib/commons";

/**
 * Search freely-licensed images on Wikimedia Commons and pick one. The chosen
 * image is fetched from Commons' CORS-enabled thumbnail into a Blob, so it can
 * be composited and exported without tainting the canvas.
 */
export function ImageSearch({
  onPick,
  onClose,
}: {
  onPick: (blob: Blob) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommonsImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      setResults(await searchImages(q));
    } catch {
      setError("Search failed — please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function pick(img: CommonsImage) {
    setPicking(img.id);
    setError(null);
    try {
      const res = await fetch(img.thumbnail);
      if (!res.ok) throw new Error();
      onPick(await res.blob());
    } catch {
      setError("Couldn't load that image. Try another.");
      setPicking(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onClose}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:text-accent-strong"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <form onSubmit={run} className="flex flex-1 gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search free images — party hat, balloons, sunglasses…"
            className="flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent-strong"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-strong px-4 py-2.5 font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </form>
      </div>

      <p className="font-mono text-xs text-subtle">
        Freely-licensed images from Wikimedia Commons — license shown on each
        (most allow reuse with attribution). Your own photos never leave your device.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : results.length ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {results.map((img) => (
            <button
              key={img.id}
              onClick={() => pick(img)}
              disabled={!!picking}
              title={img.title || "Use as overlay"}
              className="group relative cursor-pointer overflow-hidden rounded-lg border border-line bg-canvas transition-colors hover:border-accent-strong disabled:cursor-wait"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.thumbnail}
                alt={img.title}
                loading="lazy"
                className="aspect-square w-full object-contain"
              />
              {img.license && (
                <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-canvas/80 px-1.5 py-0.5 text-center font-mono text-[10px] text-subtle">
                  {img.license}
                </span>
              )}
              {picking === img.id && (
                <span className="absolute inset-0 grid place-items-center bg-canvas/70">
                  <Loader2 className="h-5 w-5 animate-spin text-accent" />
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-subtle">
          {searched
            ? "No results — try another search term."
            : "Search for an overlay to add (tip: cut out the background after adding)."}
        </p>
      )}
    </div>
  );
}
