/** Pure text-case transforms. */

function words(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // split camelCase
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // split ACRONYMWord
    .replace(/[_\-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function toTitleCase(s: string): string {
  return words(s)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function toSentenceCase(s: string): string {
  const lower = s.toLowerCase().trim();
  return lower ? lower[0].toUpperCase() + lower.slice(1) : "";
}

export function toCamelCase(s: string): string {
  return words(s)
    .map((w, i) =>
      i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()
    )
    .join("");
}

export function toSnakeCase(s: string): string {
  return words(s)
    .map((w) => w.toLowerCase())
    .join("_");
}

export function toKebabCase(s: string): string {
  return words(s)
    .map((w) => w.toLowerCase())
    .join("-");
}

export function toConstantCase(s: string): string {
  return words(s)
    .map((w) => w.toUpperCase())
    .join("_");
}

// Combining diacritical marks U+0300–U+036F (built via RegExp to avoid literal marks in source).
const ACCENTS = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(ACCENTS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
