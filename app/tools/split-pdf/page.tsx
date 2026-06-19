import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SplitPdfTool } from "@/components/split-pdf-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("split-pdf");

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
    q: "Is my PDF uploaded to a server?",
    a: "No. Pages are extracted locally in your browser, so even sensitive documents stay private.",
  },
  {
    q: "How do I choose pages?",
    a: "Enter pages and ranges separated by commas, e.g. '1-3, 5, 8-10'. Use '8-' to mean from page 8 to the end.",
  },
  {
    q: "Can I get one combined file instead of several?",
    a: "Yes. Choose 'Combine into one PDF' to extract all the selected pages into a single document.",
  },
  {
    q: "What does 'Split into single pages' do?",
    a: "It creates one PDF per page and bundles them into a .zip download — handy for breaking a document apart entirely.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <SplitPdfTool />
    </ToolShell>
  );
}
