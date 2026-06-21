import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type Tool, toolHref } from "@/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const isLive = tool.status === "live";

  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span
          className={`grid h-11 w-11 place-items-center rounded-2xl border transition-colors ${
            isLive
              ? "border-accent/30 bg-accent-soft text-accent-strong group-hover:bg-accent group-hover:text-white"
              : "border-line bg-canvas text-subtle"
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        {isLive ? (
          <ArrowUpRight className="h-5 w-5 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        ) : (
          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-subtle">
            soon
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold tracking-tight text-ink">{tool.name}</h3>
        </div>
        <p className="mt-1 text-sm text-muted">{tool.tagline}</p>
      </div>

      <span className="mt-4 inline-block font-mono text-[11px] uppercase tracking-wider text-subtle">
        {tool.category}
      </span>
    </>
  );

  const base =
    "group relative flex h-full flex-col rounded-3xl border border-line bg-surface p-5";

  if (!isLive) {
    return (
      <div className={`${base} opacity-70`} aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={toolHref(tool)}
      className={`${base} transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_16px_36px_-16px_rgba(241,107,70,0.45)]`}
    >
      {inner}
    </Link>
  );
}
