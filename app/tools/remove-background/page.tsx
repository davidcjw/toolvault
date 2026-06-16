import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RemoveBackgroundTool } from "@/components/remove-background-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("remove-background");

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
    q: "Is my image uploaded to a server?",
    a: "No. The AI model runs directly in your browser, so the image itself never leaves your device. Only the model files are downloaded (once).",
  },
  {
    q: "Why does the first run take a moment?",
    a: "A neural network model (a few tens of MB) is downloaded and cached the first time. After that, removals are much faster.",
  },
  {
    q: "What works best?",
    a: "Clear subjects like people, products and objects on a distinct background give the cleanest cut-outs.",
  },
  {
    q: "What format is the result?",
    a: "A transparent PNG, ready to drop onto any background.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <RemoveBackgroundTool />
    </ToolShell>
  );
}
