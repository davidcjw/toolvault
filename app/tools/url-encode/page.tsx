import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UrlEncodeTool } from "@/components/url-encode-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("url-encode");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description },
    }
  : {};

const faqs: Faq[] = [
  { q: "What encoding does it use?", a: "It uses encodeURIComponent/decodeURIComponent, which safely escapes characters like &, ?, =, spaces and Unicode." },
  { q: "Is anything uploaded?", a: "No. It all runs in your browser." },
  { q: "Why did decoding fail?", a: "The text has an invalid percent-sequence (e.g. a lone % not followed by two hex digits)." },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <UrlEncodeTool />
    </ToolShell>
  );
}
