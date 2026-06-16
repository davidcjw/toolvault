import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompressPdfTool } from "@/components/compress-pdf-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("compress-pdf");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description, images: [`/og?title=${encodeURIComponent(tool.name)}&cat=${tool.category}`] },
    }
  : {};

const faqs: Faq[] = [
  {
    q: "Is my PDF uploaded to a server?",
    a: "No. Compression runs entirely in your browser using pdf.js and pdf-lib, so even confidential documents stay on your device.",
  },
  {
    q: "How does it shrink the file?",
    a: "Each page is rendered and re-saved as a compressed JPEG inside a new PDF. This is very effective for scanned and image-heavy PDFs.",
  },
  {
    q: "Will the text still be selectable?",
    a: "No — because pages are flattened to images, text and links become non-selectable. Keep the original if you need editable text.",
  },
  {
    q: "Why didn't my PDF get smaller?",
    a: "Text-based PDFs are already compact, so flattening them to images may not help (and can even grow them). This tool shines on scans and photo-heavy documents.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <CompressPdfTool />
    </ToolShell>
  );
}
