<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Toolvault — agent guide

A collection of free file tools that run **entirely in the browser**. The core
product promise — and the privacy/SEO selling point — is that **no file is ever
uploaded**. Keep all file processing client-side. Never add a server route or
backend that receives user files.

## Before you finish

- `npm test` — Vitest unit tests for `lib/` must pass.
- `npm run lint` — must be clean.
- `npm run build` — must succeed (the site is fully static; keep it that way).
- Add/extend tests for any new pure logic in `lib/`, and update this file +
  `README.md` in the same pass.

## Architecture

- **Tool registry** → `lib/tools.ts` is the single source of truth. The homepage
  grid, footer links, `app/sitemap.ts`, and JSON-LD all derive from it. A tool is
  `status: "live"` (has a page) or `"soon"` (roadmap card, not linked).
- **Pure logic** → `lib/format.ts` (dimension math, byte formatting, array move).
  Keep it side-effect-free so it's unit-testable; tests in `lib/format.test.ts`.
- **Browser-only processing** → `lib/image.ts` (Canvas), `lib/pdf.ts` (pdf-lib),
  `lib/download.ts`. These touch `window`/DOM and only run client-side.
- **Tool pages** → `app/tools/<slug>/page.tsx` are **server components** that
  export `metadata` (SEO) and render `<ToolShell>` wrapping a `"use client"`
  interactive component from `components/`. Routes are static — no dynamic params.
- **Landing** → `components/landing.tsx` (`"use client"`, Motion animations);
  `app/page.tsx` is the server wrapper that adds JSON-LD.

## Design tokens

Palette and fonts are Tailwind v4 theme tokens in `app/globals.css`
(`--color-canvas`, `--color-ink`, `--color-accent`, `--color-line`, etc.) with a
`prefers-color-scheme: dark` override. Use the utilities (`bg-canvas`, `text-ink`,
`text-muted`, `border-line`, `bg-accent`) — don't hardcode hex in components.
Green is the single accent; use `accent-strong` for button fills (AA contrast on
white). Fonts: Hanken Grotesk (`font-sans`) + JetBrains Mono (`font-mono`, used
for labels, file sizes, tags). Icons: Lucide only, no emoji.

## Conventions

- `SITE` config (name, url, description) lives in `lib/site.ts` — update `url`
  before deploying; metadata/sitemap/robots/JSON-LD read from it.
- Respect `prefers-reduced-motion` in any new animations (see `useReducedMotion`
  usage in `landing.tsx`).
- Revoke object URLs you create (`URL.createObjectURL`) to avoid leaks.
