import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonFormatterTool } from "@/components/json-formatter-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("json-formatter");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description, images: [`/og?title=${encodeURIComponent(tool.name)}&cat=${tool.category}`] },
    }
  : {};

const faqs: Faq[] = [
  { q: "Is my JSON sent to a server?", a: "No. Formatting and validation run entirely in your browser, so you can paste sensitive data safely." },
  { q: "Does it validate too?", a: "Yes — invalid JSON shows a clear error message instead of output." },
  { q: "Can it minify?", a: "Yes. Choose 'Minify' to strip all whitespace into a single compact line." },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <JsonFormatterTool />
    </ToolShell>
  );
}
