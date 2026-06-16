import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PdfToImageTool } from "@/components/pdf-to-image-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("pdf-to-image");

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
    q: "Is my PDF uploaded anywhere?",
    a: "No. Pages are rendered to images directly in your browser using pdf.js, so the file never leaves your device.",
  },
  {
    q: "PNG or JPG?",
    a: "PNG keeps text and lines razor-sharp (larger files); JPG is smaller and best for image-heavy or photo pages.",
  },
  {
    q: "What does the resolution setting do?",
    a: "It scales the render. 1× is screen size (72 dpi), 2× and 3× produce sharper, larger images suitable for printing or zooming.",
  },
  {
    q: "Can I get all pages at once?",
    a: "Yes. Download pages individually, or grab everything as a single .zip.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <PdfToImageTool />
    </ToolShell>
  );
}
