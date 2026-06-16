import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TextDiffTool } from "@/components/text-diff-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("text-diff");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description },
    }
  : {};

const faqs: Faq[] = [
  { q: "How does the comparison work?", a: "It computes a line-by-line diff (longest-common-subsequence) and highlights added and removed lines." },
  { q: "Is my text sent anywhere?", a: "No. The comparison runs entirely in your browser." },
  { q: "Is it word-level or line-level?", a: "Line-level — best for comparing code, config, lists and paragraphs." },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <TextDiffTool />
    </ToolShell>
  );
}
