import {
  AppWindow,
  Banknote,
  Calculator,
  Eraser,
  FileDown,
  FileImage,
  FileStack,
  Images,
  QrCode,
  Scissors,
  ImageDown,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "Image" | "PDF" | "Generate" | "Dev" | "Singapore";

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
    description:
      "Extract specific pages or page ranges from a PDF, combine them into one file, or split a document into single pages. Runs entirely in your browser — your PDF is never uploaded.",
    category: "PDF",
    icon: Scissors,
    tags: ["pdf", "split", "extract", "pages"],
    status: "live",
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    tagline: "Turn JPG/PNG images into a single PDF.",
    description:
      "Combine photos and scans into one tidy PDF document, in any order, with fit-to-image or A4 pages. Everything runs locally in your browser — your images never leave your device.",
    category: "PDF",
    icon: FileImage,
    tags: ["pdf", "image", "jpg", "png", "convert"],
    status: "live",
  },
  {
    slug: "pdf-to-image",
    name: "PDF to Image",
    tagline: "Convert PDF pages to PNG or JPG.",
    description:
      "Turn each page of a PDF into a PNG or JPG image at your chosen resolution, then download them individually or as a zip. Rendered in your browser with pdf.js — your PDF is never uploaded.",
    category: "PDF",
    icon: FileDown,
    tags: ["pdf", "image", "png", "jpg", "convert", "render"],
    status: "live",
  },
  {
    slug: "remove-background",
    name: "Remove Background",
    tagline: "Erase image backgrounds, on-device.",
    description:
      "Cut out the background from any image and get a transparent PNG. An AI model runs directly in your browser — your image is never uploaded; only the model is downloaded once.",
    category: "Image",
    icon: Eraser,
    tags: ["image", "background", "remove", "transparent"],
    status: "live",
  },
  {
    slug: "screenshot-beautifier",
    name: "Screenshot Beautifier",
    tagline: "Wrap screenshots in gradients & frames.",
    description:
      "Make plain screenshots look polished with gradient or solid backgrounds, padding, rounded corners, a drop shadow and a macOS-style window bar. Composited in your browser at full resolution — nothing is uploaded.",
    category: "Image",
    icon: Images,
    tags: ["screenshot", "mockup", "gradient", "frame"],
    status: "live",
  },
  {
    slug: "qr-code",
    name: "QR Code Generator",
    tagline: "Free QR codes with custom colors & logo.",
    description:
      "Generate static QR codes for links, text and more, with custom colours and an optional center logo. Download as PNG or SVG. Codes never expire and are created entirely in your browser.",
    category: "Generate",
    icon: QrCode,
    tags: ["qr", "code", "generate", "link"],
    status: "live",
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    tagline: "Make favicons in every size from one image.",
    description:
      "Turn one image into a complete favicon pack — a multi-resolution favicon.ico, PNG icons, apple-touch-icon, a web manifest and the HTML snippet to paste in. Generated in your browser and bundled as a zip; nothing is uploaded.",
    category: "Dev",
    icon: AppWindow,
    tags: ["favicon", "icon", "ico", "developer"],
    status: "live",
  },

  // ── Singapore ───────────────────────────────────────────────────
  {
    slug: "paynow-qr",
    name: "PayNow QR Generator",
    tagline: "Free PayNow QR from a mobile number or UEN.",
    description:
      "Generate a PayNow QR code for a Singapore mobile number or UEN, with an optional fixed amount and reference. Builds the standard SGQR payload in your browser and downloads as PNG or SVG — free, no sign-up, codes never expire.",
    category: "Singapore",
    icon: Banknote,
    tags: ["paynow", "qr", "sgqr", "singapore", "payment", "uen"],
    status: "live",
  },
  {
    slug: "gst-calculator",
    name: "GST Calculator",
    tagline: "Add or remove Singapore GST (9%).",
    description:
      "Add 9% GST to a price, or work out the GST already included in a total. Singapore rates, calculated instantly in your browser.",
    category: "Singapore",
    icon: Calculator,
    tags: ["gst", "tax", "singapore", "calculator", "9%"],
    status: "live",
  },
];

export const CATEGORIES: ToolCategory[] = [
  "Image",
  "PDF",
  "Generate",
  "Dev",
  "Singapore",
];

export function toolHref(tool: Tool): string {
  return `/tools/${tool.slug}`;
}

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export const LIVE_TOOLS = TOOLS.filter((t) => t.status === "live");
