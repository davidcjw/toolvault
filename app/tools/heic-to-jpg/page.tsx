import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeicConverterTool } from "@/components/heic-converter-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("heic-to-jpg");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: {
        title: tool.name,
        description: tool.description,
        images: [`/og?title=${encodeURIComponent(tool.name)}&cat=${tool.category}`],
      },
    }
  : {};

const faqs: Faq[] = [
  {
    q: "What is a HEIC file?",
    a: "HEIC (High Efficiency Image Container) is the format iPhones and iPads use to save photos by default. It saves space but many apps and websites can't open it, so converting to JPG or PNG makes photos universally shareable.",
  },
  {
    q: "Should I pick JPG or PNG?",
    a: "JPG is best for photos — smaller files with an adjustable quality. Choose PNG if you need lossless quality or transparency.",
  },
  {
    q: "Can I convert many photos at once?",
    a: "Yes. Drop in as many HEIC files as you like, convert them in one go, and download each individually or all together as a zip.",
  },
  {
    q: "Are my photos uploaded anywhere?",
    a: "No. The HEIC files are decoded locally in your browser with libheif (WebAssembly) — nothing is ever sent to a server.",
  },
  {
    q: "Why does the first conversion take a moment?",
    a: "The HEIC decoder (a small WebAssembly module) downloads once on first use and is then cached by your browser, so later conversions start instantly.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <HeicConverterTool />
    </ToolShell>
  );
}
