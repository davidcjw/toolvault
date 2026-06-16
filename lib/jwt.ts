import { base64UrlToBase64, decodeBase64 } from "./encoding";

export type DecodedJwt = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
};

/** Decode (NOT verify) a JWT into its header and payload. */
export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("A JWT must have 3 dot-separated parts.");
  }
  const parseSegment = (seg: string, name: string) => {
    try {
      return JSON.parse(decodeBase64(base64UrlToBase64(seg)));
    } catch {
      throw new Error(`Could not decode the ${name} — is this a valid JWT?`);
    }
  };
  return {
    header: parseSegment(parts[0], "header"),
    payload: parseSegment(parts[1], "payload"),
    signature: parts[2],
  };
}

/** Format a numeric JWT timestamp (seconds) as an ISO string, or null. */
export function jwtTimestamp(value: unknown): string | null {
  if (typeof value !== "number") return null;
  const d = new Date(value * 1000);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
