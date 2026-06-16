import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PdfMergeTool } from "@/components/pdf-merge-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("merge-pdf");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description },
    }
  : {};

const faqs: Faq[] = [
  {
    q: "Are my PDFs uploaded to a server?",
    a: "No. The files are merged locally in your browser. Nothing is uploaded, which keeps sensitive documents private.",
  },
  {
    q: "Can I change the order of the files?",
    a: "Yes. Use the up and down arrows to arrange the PDFs. They are combined top-to-bottom in the order shown.",
  },
  {
    q: "Is there a limit on how many PDFs I can merge?",
    a: "No fixed limit. Since merging runs on your device, the only constraint is your available memory.",
  },
  {
    q: "What about password-protected PDFs?",
    a: "Unencrypted PDFs work best. Some protected files may fail to load; remove the password first if merging fails.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <PdfMergeTool />
    </ToolShell>
  );
}
