import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Base64Tool } from "@/components/base64-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("base64");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description },
    }
  : {};

const faqs: Faq[] = [
  { q: "Is my text uploaded?", a: "No. Encoding and decoding happen in your browser — nothing is sent anywhere." },
  { q: "Does it support emoji and other languages?", a: "Yes. It uses UTF-8, so Unicode text round-trips correctly." },
  { q: "Why did decoding fail?", a: "The input isn't valid Base64. Check for stray spaces or missing characters." },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <Base64Tool />
    </ToolShell>
  );
}
