import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GstCalculatorTool } from "@/components/gst-calculator-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("gst-calculator");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Singapore GST (9%)`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description },
    }
  : {};

const faqs: Faq[] = [
  {
    q: "What is the GST rate in Singapore?",
    a: "GST is 9%, effective 1 January 2024 (up from 8% in 2023).",
  },
  {
    q: "How do I remove GST from a total?",
    a: "Switch to 'Remove GST' and enter the GST-inclusive amount. The tool divides by 1.09 to show the original price and the GST portion.",
  },
  {
    q: "Is my data sent anywhere?",
    a: "No. The calculation runs entirely in your browser.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <GstCalculatorTool />
    </ToolShell>
  );
}
