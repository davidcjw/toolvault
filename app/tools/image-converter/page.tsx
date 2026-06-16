import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageTool } from "@/components/image-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("image-converter");

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
    q: "Are my images uploaded anywhere?",
    a: "No. Conversion and compression happen entirely in your browser using the Canvas API. Your images never leave your device.",
  },
  {
    q: "Which formats are supported?",
    a: "You can convert between WebP, JPG and PNG. WebP usually gives the smallest file size at a given quality.",
  },
  {
    q: "Can I resize images too?",
    a: "Yes. Set a max width and images are scaled down proportionally. Images are never upscaled beyond their original size.",
  },
  {
    q: "Is there a file size or batch limit?",
    a: "There are no artificial limits. Because everything runs locally, very large batches are only bounded by your device's memory.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <ImageTool />
    </ToolShell>
  );
}
