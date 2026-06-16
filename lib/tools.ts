import {
  AppWindow,
  Eraser,
  FileImage,
  FileStack,
  Images,
  QrCode,
  Scissors,
  ImageDown,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "Image" | "PDF" | "Generate" | "Dev";

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  /** Longer, SEO-friendly description shown on the tool page. */
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  tags: string[];
  status: "live" | "soon";
};

export const TOOLS: Tool[] = [
  {
    slug: "image-converter",
    name: "Image Converter & Compressor",
    tagline: "Convert, resize and shrink images — PNG, JPG, WebP.",
    description:
      "Convert images between PNG, JPG and WebP, resize them, and compress to a smaller file size. Everything runs in your browser, so your photos never leave your device.",
    category: "Image",
    icon: ImageDown,
    tags: ["png", "jpg", "jpeg", "webp", "compress", "resize", "convert"],
    status: "live",
  },
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    tagline: "Combine multiple PDFs into one, in any order.",
    description:
      "Combine several PDF files into a single document, reorder them by drag-free up/down controls, and download the result. Your files are merged locally and never uploaded.",
    category: "PDF",
    icon: FileStack,
    tags: ["pdf", "merge", "combine", "join"],
    status: "live",
  },

  // ── Roadmap: signals the collection, not yet built ──────────────
  {
    slug: "split-pdf",
    name: "Split PDF",
    tagline: "Extract or split pages from a PDF.",
    description: "Split a PDF into separate files or pull out specific pages.",
    category: "PDF",
    icon: Scissors,
    tags: ["pdf", "split", "extract", "pages"],
    status: "soon",
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    tagline: "Turn JPG/PNG images into a single PDF.",
    description: "Combine photos and scans into one tidy PDF document.",
    category: "PDF",
    icon: FileImage,
    tags: ["pdf", "image", "jpg", "png", "convert"],
    status: "soon",
  },
  {
    slug: "remove-background",
    name: "Remove Background",
    tagline: "Erase image backgrounds, on-device.",
    description: "Cut out the background from any image right in your browser.",
    category: "Image",
    icon: Eraser,
    tags: ["image", "background", "remove", "transparent"],
    status: "soon",
  },
  {
    slug: "screenshot-beautifier",
    name: "Screenshot Beautifier",
    tagline: "Wrap screenshots in gradients & frames.",
    description: "Make plain screenshots look polished for social and docs.",
    category: "Image",
    icon: Images,
    tags: ["screenshot", "mockup", "gradient", "frame"],
    status: "soon",
  },
  {
    slug: "qr-code",
    name: "QR Code Generator",
    tagline: "Free QR codes with custom colors & logo.",
    description: "Generate static QR codes for links, text and Wi-Fi — no signup.",
    category: "Generate",
    icon: QrCode,
    tags: ["qr", "code", "generate", "link"],
    status: "soon",
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    tagline: "Make favicons in every size from one image.",
    description: "Generate a complete favicon set and the HTML to drop it in.",
    category: "Dev",
    icon: AppWindow,
    tags: ["favicon", "icon", "ico", "developer"],
    status: "soon",
  },
];

export const CATEGORIES: ToolCategory[] = ["Image", "PDF", "Generate", "Dev"];

export function toolHref(tool: Tool): string {
  return `/tools/${tool.slug}`;
}

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export const LIVE_TOOLS = TOOLS.filter((t) => t.status === "live");
