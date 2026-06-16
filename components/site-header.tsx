import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-ink font-mono text-sm font-bold text-canvas transition-transform group-hover:-rotate-6">
            T
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">
            {SITE.name}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/#tools"
            className="text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            All tools
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs text-muted sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
            no uploads
          </span>
        </div>
      </div>
    </header>
  );
}
