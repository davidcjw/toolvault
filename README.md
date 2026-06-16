# Toolvault — free, private browser tools

A growing collection of free file tools that run **100% in your browser**. No
uploads, no sign-up, no file-size limits. Your files stay locked on your device
and are never sent to a server.

This is both a useful product and an SEO play: every tool is its own
search-optimised landing page, and because all processing is client-side, the
whole site is statically prerendered and costs ~$0 to run.

## Live tools

| Tool | What it does |
|------|--------------|
| **Image Converter & Compressor** (`/tools/image-converter`) | Convert between WebP/JPG/PNG, resize, and compress — Canvas-based. |
| **Merge PDF** (`/tools/merge-pdf`) | Combine and reorder multiple PDFs into one — `pdf-lib`. |
| **Split PDF** (`/tools/split-pdf`) | Extract page ranges / split into single pages — `pdf-lib` + `fflate` zip. |
| **Images → PDF** (`/tools/images-to-pdf`) | Combine images into one PDF, fit-to-image or A4 — `pdf-lib`. |
| **QR Code Generator** (`/tools/qr-code`) | Custom colours + optional center logo, PNG/SVG — `qrcode`. |
| **Screenshot Beautifier** (`/tools/screenshot-beautifier`) | Gradient/solid bg, padding, radius, shadow, window bar — Canvas. |
| **Favicon Generator** (`/tools/favicon-generator`) | Full favicon pack (.ico + PNGs + manifest + HTML) zip — Canvas + `fflate`. |
| **Remove Background** (`/tools/remove-background`) | Transparent-PNG cut-outs via an in-browser AI model — `@imgly/background-removal`. |

Add more by appending to `lib/tools.ts` (set `status: "soon"` for roadmap cards).

## Tech stack

- **Next.js 16** (App Router, Turbopack) — all routes statically prerendered
- **React 19**, **TypeScript**
- **Tailwind CSS v4** with semantic design tokens in `app/globals.css`
- **Motion** (Framer Motion) for the landing animations
- **pdf-lib** (PDF), Canvas API (images) — all client-side
- **lucide-react** icons, **Hanken Grotesk** + **JetBrains Mono** fonts
- **Vitest** for unit tests

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (lib/*.test.ts)
npm run lint
npm run build
```

## Add a new tool

1. Add an entry to `TOOLS` in `lib/tools.ts` (set `status: "live"`).
2. Put pure, testable logic in `lib/` (add a `*.test.ts`); keep browser/Canvas
   calls in their own client helper.
3. Build the interactive client component in `components/<tool>-tool.tsx`.
4. Create `app/tools/<slug>/page.tsx` — a server component that exports
   `metadata` and renders `<ToolShell tool={...} faqs={...}>`.

The homepage grid, footer, sitemap and JSON-LD all read from the registry
automatically.

## Deploy (Vercel)

1. Push to GitHub and import into Vercel — no environment variables needed.
2. Update `SITE.url` in `lib/site.ts` to your production domain (used by
   metadata, `sitemap.xml`, `robots.txt`, and JSON-LD).

A favicon is included (`app/favicon.ico` + `app/icon.svg`).
