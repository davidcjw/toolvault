import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScreenshotBeautifierTool } from "@/components/screenshot-beautifier-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("screenshot-beautifier");

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
    q: "Is my screenshot uploaded?",
    a: "No. The image is composited on a canvas in your browser and never sent anywhere.",
  },
  {
    q: "What can I customise?",
    a: "Background gradient or solid colour, padding, corner radius, drop shadow, and a macOS-style window bar.",
  },
  {
    q: "What resolution is the export?",
    a: "Full resolution — the download matches your original screenshot size plus the padding you add, so it stays crisp.",
  },
  {
    q: "What's it good for?",
    a: "Making plain screenshots look polished for social posts, slide decks, documentation and changelogs.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <ScreenshotBeautifierTool />
    </ToolShell>
  );
}
