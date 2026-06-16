export type FormatResult =
  | { ok: true; output: string }
  | { ok: false; error: string };

/** Pretty-print or minify JSON. `indent: "min"` minifies. */
export function formatJson(input: string, indent: number | "min" = 2): FormatResult {
  if (!input.trim()) return { ok: true, output: "" };
  try {
    const parsed = JSON.parse(input);
    const output =
      indent === "min"
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, indent);
    return { ok: true, output };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
