import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseConverterTool } from "@/components/case-converter-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("case-converter");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description, images: [`/og?title=${encodeURIComponent(tool.name)}&cat=${tool.category}`] },
    }
  : {};

const faqs: Faq[] = [
  { q: "Which cases are supported?", a: "Title, Sentence, UPPER, lower, camelCase, snake_case, kebab-case, CONSTANT_CASE and URL slug — shown all at once." },
  { q: "Does it understand existing camelCase?", a: "Yes. It splits camelCase and ACRONYMWord boundaries, so getHTTPResponse becomes get_http_response and similar." },
  { q: "Is my text uploaded?", a: "No — every conversion happens in your browser." },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <CaseConverterTool />
    </ToolShell>
  );
}
