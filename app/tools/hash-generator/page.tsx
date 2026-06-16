import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HashGeneratorTool } from "@/components/hash-generator-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("hash-generator");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description },
    }
  : {};

const faqs: Faq[] = [
  { q: "Which algorithms are supported?", a: "MD5, SHA-1, SHA-256, SHA-384 and SHA-512. SHA hashes use the browser's Web Crypto API." },
  { q: "Is my input sent to a server?", a: "No. All hashes are computed locally in your browser." },
  { q: "Should I use MD5 for passwords?", a: "No — MD5 and SHA-1 are unsuitable for password storage. They're here for checksums and legacy comparisons." },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <HashGeneratorTool />
    </ToolShell>
  );
}
