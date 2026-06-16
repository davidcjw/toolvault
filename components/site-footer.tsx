import Link from "next/link";
import { LIVE_TOOLS, toolHref } from "@/lib/tools";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-ink font-mono text-xs font-bold text-canvas">
              T
            </span>
            <span className="font-bold tracking-tight text-ink">{SITE.name}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">{SITE.description}</p>
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-subtle">
            Tools
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LIVE_TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={toolHref(tool)}
                  className="text-muted transition-colors hover:text-accent"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-subtle">
            Why {SITE.name}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Runs in your browser</li>
            <li>No uploads, no sign-up</li>
            <li>No file-size limits</li>
            <li>Free to use</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-5 font-mono text-xs text-subtle">
          © {SITE.name}. Files are processed locally and never leave your device.
        </p>
      </div>
    </footer>
  );
}
