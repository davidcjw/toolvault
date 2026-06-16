import { describe, expect, it } from "vitest";
import { hashText, md5 } from "./hash";

describe("md5", () => {
  it("matches RFC 1321 test vectors", () => {
    expect(md5("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
    expect(md5("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
    expect(md5("The quick brown fox jumps over the lazy dog")).toBe(
      "9e107d9d372bb6826bd81d3542a419d6"
    );
  });
});

describe("hashText", () => {
  it("computes MD5 and SHA-256", async () => {
    expect(await hashText("abc", "MD5")).toBe("900150983cd24fb0d6963f7d28e17f72");
    expect(await hashText("abc", "SHA-256")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });
});
