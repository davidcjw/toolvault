import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaviconGeneratorTool } from "@/components/favicon-generator-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("favicon-generator");

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
    q: "Is my image uploaded?",
    a: "No. Every icon size is rendered in your browser with the Canvas API and bundled into a zip locally.",
  },
  {
    q: "What's in the download?",
    a: "A multi-resolution favicon.ico, PNG icons (16–512px), an apple-touch-icon, a site.webmanifest, and an HTML snippet to paste into your <head>.",
  },
  {
    q: "What image should I use?",
    a: "A square image of at least 512×512 works best. Non-square images are centre-cropped to a square automatically.",
  },
  {
    q: "Where do the files go?",
    a: "Unzip them into your site's public/root folder and paste the provided HTML snippet into your <head>.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <FaviconGeneratorTool />
    </ToolShell>
  );
}
