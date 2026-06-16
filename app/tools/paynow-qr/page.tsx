import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PayNowQrTool } from "@/components/paynow-qr-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("paynow-qr");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free PayNow QR Code`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description },
    }
  : {};

const faqs: Faq[] = [
  {
    q: "Is this PayNow QR generator free?",
    a: "Yes — completely free, no sign-up and no monthly fee. Many providers charge for QR codes; here the code is generated in your browser and never expires.",
  },
  {
    q: "Can I set a fixed amount?",
    a: "Yes. Enter an amount to lock it, or leave it blank so the payer types the amount themselves. You can also add a reference like an invoice number.",
  },
  {
    q: "Is it safe — where does my number go?",
    a: "The QR is built entirely in your browser using the standard SGQR PayNow format. Your mobile number or UEN is never sent to any server.",
  },
  {
    q: "How do people pay?",
    a: "They scan the QR with any Singapore banking app (DBS, OCBC, UOB, etc.) and pay you directly via PayNow.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <PayNowQrTool />
    </ToolShell>
  );
}
