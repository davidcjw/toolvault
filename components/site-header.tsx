import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import { SITE } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";

function GithubMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
      <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.52.56.83 1.28.83 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
    </svg>
  );
}

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
          <a
            href={SITE.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Star ${SITE.name} on GitHub`}
            className="group flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-accent/40"
          >
            <GithubMark className="h-4 w-4" />
            <span className="hidden sm:inline">Star</span>
            <Star className="h-3.5 w-3.5 text-amber-500 transition-transform group-hover:scale-110 group-hover:fill-amber-400" aria-hidden />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
