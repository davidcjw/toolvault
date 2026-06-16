import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UuidGeneratorTool } from "@/components/uuid-generator-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("uuid-generator");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description },
    }
  : {};

const faqs: Faq[] = [
  { q: "What kind of UUIDs are these?", a: "Version 4 (random) UUIDs, generated with the browser's crypto.randomUUID()." },
  { q: "Are they unique?", a: "v4 UUIDs draw on 122 random bits, so collisions are astronomically unlikely." },
  { q: "Can I generate many at once?", a: "Yes — request up to 100 and copy them all in one click." },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <UuidGeneratorTool />
    </ToolShell>
  );
}
