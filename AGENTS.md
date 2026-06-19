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
- **Pure logic** → `lib/format.ts` (dimension math, byte formatting, array move),
  plus per-tool math like `lib/overlay.ts` (layer geometry + `compositeBounds`
  for the expanding export canvas) and `lib/trim.ts` (`opaqueBounds` for cropping
  transparent edges). Keep it side-effect-free and unit-tested (`*.test.ts`).
- **Stock image search** → `lib/commons.ts` + `components/image-search.tsx` let
  Image Overlay add freely-licensed overlays from Wikimedia Commons (`origin=*`
  for anonymous CORS). This is the only external network call; a client-side
  `fetch` (no key, no server route, no user files sent — still static). Picked
  images are fetched from Commons' CORS thumbnail (`upload.wikimedia.org`,
  `access-control-allow-origin: *`) into a Blob so the export canvas isn't
  tainted. (Openverse was tried first but its anonymous tier 401s from browsers.)
- **Shared image components** → `components/image-dropzone.tsx` wraps `Dropzone`
  to auto-decode HEIC→PNG (`lib/heic.ts`) for every image tool; use it instead of
  `Dropzone` for image inputs. `components/image-touchup.tsx` is the reusable
  erase/restore brush editor (used by Image Overlay's base touch-up).
- **Long-load indicator** → `components/gooey-loader.tsx` is the shared spinner
  for any wait that can take a while (AI model/wasm download, background removal,
  HEIC decode, PDF rasterize, export render). Quick sub-second button actions keep
  the inline Lucide `Loader2`.
- **Browser-only processing** → `lib/image.ts` (Canvas), `lib/pdf.ts` (pdf-lib),
  `lib/download.ts`. These touch `window`/DOM and only run client-side. Some
  modules mix pure, tested math with one browser-only render fn (e.g.
  `lib/overlay.ts`: layer geometry is unit-tested, `renderComposite` uses Canvas).
- **Tool pages** → `app/tools/<slug>/page.tsx` are **server components** that
  export `metadata` (SEO) and render `<ToolShell>` wrapping a `"use client"`
  interactive component from `components/`. Routes are static — no dynamic params.
- **Landing** → `components/landing.tsx` (`"use client"`, Motion animations);
  `app/page.tsx` is the server wrapper that adds JSON-LD.

## Design tokens

Palette and fonts are Tailwind v4 theme tokens in `app/globals.css`
(`--color-canvas`, `--color-ink`, `--color-accent`, `--color-line`, etc.). Dark
mode overrides the same custom properties via `:root[data-theme="dark"]` (manual
toggle, persisted to `localStorage`) and a `prefers-color-scheme: dark` fallback
for users who haven't chosen. The `<html data-theme>` attribute is set pre-paint
by an inline script in `app/layout.tsx`; `components/theme-toggle.tsx` flips it.
Use the utilities (`bg-canvas`, `text-ink`,
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
