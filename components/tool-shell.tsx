import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { type Tool, toolHref } from "@/lib/tools";
import { SITE } from "@/lib/site";
import { PrivacyBadge } from "@/components/privacy-badge";

export type Faq = { q: string; a: string };

const BENEFITS = [
  "Files are processed on your device — nothing is uploaded.",
  "No account, no watermark, no daily limits.",
  "Works offline once the page has loaded.",
];

export function ToolShell({
  tool,
  faqs,
  children,
}: {
  tool: Tool;
  faqs: Faq[];
  children: React.ReactNode;
}) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      description: tool.description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any (web browser)",
      url: `${SITE.url}${toolHref(tool)}`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex items-center gap-1 font-mono text-xs text-subtle">
        <Link href="/" className="hover:text-accent">
          {SITE.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/#tools" className="hover:text-accent">
          {tool.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-muted">{tool.name}</span>
      </nav>

      <header className="mt-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {tool.name}
        </h1>
        <p className="mt-2 text-lg text-muted">{tool.tagline}</p>
        <PrivacyBadge className="mt-4" />
      </header>

      <section className="mt-8">{children}</section>

      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          About this tool
        </h2>
        <p className="mt-3 text-muted">{tool.description}</p>
        <ul className="mt-4 space-y-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex gap-2 text-muted">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {b}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Frequently asked questions
        </h2>
        <dl className="mt-4 divide-y divide-line border-t border-line">
          {faqs.map((f) => (
            <div key={f.q} className="py-4">
              <dt className="font-semibold text-ink">{f.q}</dt>
              <dd className="mt-1 text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
