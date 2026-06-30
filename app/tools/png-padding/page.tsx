import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PngPaddingTool } from "@/components/png-padding-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("png-padding");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: { title: tool.name, description: tool.description, images: [{ url: `/og?title=${encodeURIComponent(tool.name)}&cat=${tool.category}`, width: 1200, height: 630, type: "image/png" }] },
    }
  : {};

const faqs: Faq[] = [
  {
    q: "Is my image uploaded?",
    a: "No. The image is padded on a canvas in your browser and never sent anywhere.",
  },
  {
    q: "Can I pad each side differently?",
    a: "Yes. Unlink the sides to set top, right, bottom and left independently, or keep them linked for uniform padding.",
  },
  {
    q: "Does the padding keep transparency?",
    a: "Yes. By default the added space is fully transparent, so the export stays a transparent PNG. You can switch to a solid colour if you prefer.",
  },
  {
    q: "What's it good for?",
    a: "Adding breathing room around logos and icons, making a square canvas for avatars, or giving an image a coloured border.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <PngPaddingTool />
    </ToolShell>
  );
}
