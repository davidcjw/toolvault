import { describe, expect, it } from "vitest";
import { base64UrlToBase64, decodeBase64, encodeBase64 } from "./encoding";

describe("base64", () => {
  it("round-trips ASCII", () => {
    expect(encodeBase64("hello")).toBe("aGVsbG8=");
    expect(decodeBase64("aGVsbG8=")).toBe("hello");
  });
  it("handles unicode", () => {
    const s = "Crème — 日本語 🎉";
    expect(decodeBase64(encodeBase64(s))).toBe(s);
  });
});

describe("base64UrlToBase64", () => {
  it("restores padding and chars", () => {
    expect(base64UrlToBase64("a-_b")).toBe("a+/b");
    expect(base64UrlToBase64("YQ")).toBe("YQ==");
  });
});
