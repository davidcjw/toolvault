import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JwtDecoderTool } from "@/components/jwt-decoder-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("jwt-decoder");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description },
    }
  : {};

const faqs: Faq[] = [
  { q: "Is my token sent anywhere?", a: "No. The JWT is decoded entirely in your browser — important, since tokens are sensitive credentials." },
  { q: "Does it verify the signature?", a: "No. Decoding only reads the header and payload; verifying the signature requires the secret or public key, which this tool never asks for." },
  { q: "What are exp / iat / nbf?", a: "Standard JWT time claims (expiry, issued-at, not-before). They're shown as human-readable UTC times." },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <JwtDecoderTool />
    </ToolShell>
  );
}
