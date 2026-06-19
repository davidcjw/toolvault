export type CommonsImage = {
  id: string;
  title: string;
  /** upload.wikimedia.org thumbnail (CORS `*`, safe to draw to a canvas). */
  thumbnail: string;
  license: string | null;
  sourceUrl: string;
};

/**
 * Wikimedia Commons search URL for freely-licensed images. No API key; `origin=*`
 * enables anonymous CORS. Pure/testable — no fetch.
 */
export function commonsSearchUrl(query: string, limit = 24): string {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `${query} filetype:bitmap|drawing`,
    gsrnamespace: "6", // File namespace
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "400",
    format: "json",
    origin: "*",
  });
  return `https://commons.wikimedia.org/w/api.php?${params.toString()}`;
}

/** Strip HTML tags Commons embeds in some metadata values. */
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

type Page = {
  pageid: number;
  title: string;
  index: number;
  imageinfo?: {
    thumburl?: string;
    descriptionurl?: string;
    extmetadata?: { LicenseShortName?: { value?: string } };
  }[];
};

/** Search Wikimedia Commons for freely-licensed images. Browser-only (fetch). */
export async function searchImages(
  query: string,
  signal?: AbortSignal,
): Promise<CommonsImage[]> {
  const res = await fetch(commonsSearchUrl(query), { signal });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data: { query?: { pages?: Record<string, Page> } } = await res.json();
  const pages = Object.values(data.query?.pages ?? {}).sort(
    (a, b) => a.index - b.index,
  );
  return pages.flatMap((p) => {
    const info = p.imageinfo?.[0];
    if (!info?.thumburl) return [];
    const license = info.extmetadata?.LicenseShortName?.value;
    return [
      {
        id: String(p.pageid),
        title: p.title.replace(/^File:/, ""),
        thumbnail: info.thumburl,
        license: license ? stripHtml(license) : null,
        sourceUrl: info.descriptionurl ?? "",
      },
    ];
  });
}
