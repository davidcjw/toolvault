import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageOverlayTool } from "@/components/image-overlay-tool";
import { ToolShell, type Faq } from "@/components/tool-shell";
import { getTool, toolHref } from "@/lib/tools";

const tool = getTool("image-overlay");

export const metadata: Metadata = tool
  ? {
      title: `${tool.name} — Free & Private`,
      description: tool.description,
      alternates: { canonical: toolHref(tool) },
      openGraph: {
        title: tool.name,
        description: tool.description,
        images: [`/og?title=${encodeURIComponent(tool.name)}&cat=${tool.category}`],
      },
    }
  : {};

const faqs: Faq[] = [
  {
    q: "How do I put one image on top of another?",
    a: "Drop your base photo, click “Add overlay” to bring in a second image (like a hat or logo), then drag it into place. Use the corner handle to resize and the top handle to rotate.",
  },
  {
    q: "How do I get a clean cut-out without a background box?",
    a: "Select an overlay and click “Remove background” — an AI model runs right here in your browser to cut it out into a transparent PNG. No need to use a separate tool first.",
  },
  {
    q: "Can I add more than one overlay?",
    a: "Yes. Add as many overlays as you like — each can be moved, resized, rotated, flipped and reordered with Forward/Back to control which sits on top.",
  },
  {
    q: "What resolution is the download?",
    a: "The PNG is rendered at your base image’s full native resolution, regardless of how it’s scaled to fit on screen while editing.",
  },
  {
    q: "Are my images uploaded?",
    a: "No. Everything is composited locally in your browser with the Canvas API — your images never leave your device.",
  },
];

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool} faqs={faqs}>
      <ImageOverlayTool />
    </ToolShell>
  );
}
