import { describe, expect, it } from "vitest";
import { formatExt, isHeic } from "./heic";

describe("isHeic", () => {
  it("matches the HEIC/HEIF MIME types", () => {
    expect(isHeic({ type: "image/heic" })).toBe(true);
    expect(isHeic({ type: "image/heif" })).toBe(true);
  });

  it("matches by extension when the MIME type is missing", () => {
    expect(isHeic({ name: "IMG_1234.HEIC", type: "" })).toBe(true);
    expect(isHeic({ name: "photo.heif" })).toBe(true);
  });

  it("rejects non-HEIC files", () => {
    expect(isHeic({ name: "photo.jpg", type: "image/jpeg" })).toBe(false);
    expect(isHeic({ name: "doc.pdf" })).toBe(false);
    expect(isHeic({})).toBe(false);
  });
});

describe("formatExt", () => {
  it("maps output formats to extensions", () => {
    expect(formatExt("image/jpeg")).toBe("jpg");
    expect(formatExt("image/png")).toBe("png");
  });
});
