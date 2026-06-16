import { describe, expect, it } from "vitest";
import { buildPayNowPayload, crc16ccitt, normalizeSgMobile } from "./paynow";

describe("crc16ccitt", () => {
  it("matches the standard CCITT-FALSE check vector", () => {
    expect(crc16ccitt("123456789")).toBe("29B1");
  });
});

describe("normalizeSgMobile", () => {
  it("accepts spaced, +65 and 65-prefixed forms", () => {
    expect(normalizeSgMobile("9123 4567")).toBe("+6591234567");
    expect(normalizeSgMobile("+65 8123 4567")).toBe("+6581234567");
    expect(normalizeSgMobile("6591234567")).toBe("+6591234567");
  });
  it("rejects invalid numbers", () => {
    expect(normalizeSgMobile("12345")).toBeNull();
    expect(normalizeSgMobile("71234567")).toBeNull();
  });
});

describe("buildPayNowPayload", () => {
  it("includes the PayNow GUID, SGD currency and country", () => {
    const p = buildPayNowPayload({
      proxyType: "mobile",
      proxy: "+6591234567",
      amount: 12.5,
    });
    expect(p.startsWith("000201")).toBe(true);
    expect(p).toContain("SG.PAYNOW");
    expect(p).toContain("5303702"); // currency 702
    expect(p).toContain("5802SG");
    expect(p).toContain("540512.50"); // amount tag 54, len 05, value "12.50"
  });

  it("terminates with a valid CRC over the rest of the payload", () => {
    const p = buildPayNowPayload({ proxyType: "mobile", proxy: "+6591234567" });
    expect(crc16ccitt(p.slice(0, -4))).toBe(p.slice(-4));
  });

  it("locks the amount when not editable and marks dynamic POI", () => {
    const fixed = buildPayNowPayload({
      proxyType: "uen",
      proxy: "201912345A",
      amount: 5,
      editable: false,
    });
    expect(fixed).toContain("010212"); // POI = 12 (dynamic)
    expect(fixed).toContain("0301"); // amount-editable subtag (tag 03, len 01)
    expect(fixed).not.toContain("03011"); // value is 0 (locked), not 1 (editable)
  });
});
