import { Landing } from "@/components/landing";
import { LIVE_TOOLS, toolHref } from "@/lib/tools";
import { SITE } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  hasPart: LIVE_TOOLS.map((t) => ({
    "@type": "WebApplication",
    name: t.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: `${SITE.url}${toolHref(t)}`,
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing />
    </>
  );
}
