import type { MetadataRoute } from "next";
import { LIVE_TOOLS, toolHref } from "@/lib/tools";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = LIVE_TOOLS.map((tool) => ({
    url: `${SITE.url}${toolHref(tool)}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...tools,
  ];
}
