import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImagesToPdfTool } from "@/components/images-to-pdf-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("images-to-pdf");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description, images: [{ url: `/og?title=${encodeURIComponent(tool.name)}&cat=${tool.category}`, width: 1200, height: 630, type: "image/png" }] },
    }
  : {};

const faqs: Faq[] = [
  {
    q: "Are my images uploaded anywhere?",
    a: "No. The PDF is built in your browser with pdf-lib. Your images never leave your device.",
  },
  {
    q: "Which image formats can I use?",
    a: "JPG, PNG and WebP. WebP and other formats are converted to JPEG locally before being placed in the PDF.",
  },
  {
    q: "Can I set the page order?",
    a: "Yes. Use the up and down arrows to arrange images — each becomes one page, top to bottom.",
  },
  {
    q: "What's the difference between 'Fit to image' and 'A4'?",
    a: "'Fit to image' makes each page exactly the image's size. 'A4' centers each image on a standard A4 page with a small margin.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <ImagesToPdfTool />
    </ToolShell>
  );
}
