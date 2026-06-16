import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QrCodeTool } from "@/components/qr-code-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("qr-code");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description, images: [`/og?title=${encodeURIComponent(tool.name)}&cat=${tool.category}`] },
    }
  : {};

const faqs: Faq[] = [
  {
    q: "Is this QR generator really free?",
    a: "Yes — completely free, no sign-up and no watermark. The codes are generated in your browser, so there's nothing to track.",
  },
  {
    q: "Will my QR codes expire?",
    a: "Never. These are static QR codes encoded directly into the image, so they keep working forever with no subscription.",
  },
  {
    q: "Can I add my logo?",
    a: "Yes. Upload a center logo and error correction is automatically set to High so the code still scans reliably.",
  },
  {
    q: "PNG or SVG?",
    a: "PNG is best for quick sharing; SVG is a sharp vector ideal for print and large sizes. Both download instantly.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <QrCodeTool />
    </ToolShell>
  );
}
