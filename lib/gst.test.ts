import { describe, expect, it } from "vitest";
import { addGst, GST_RATE, removeGst } from "./gst";

describe("addGst", () => {
  it("adds 9% GST", () => {
    expect(addGst(100)).toEqual({ base: 100, gst: 9, total: 109 });
  });
  it("clamps negatives to zero", () => {
    expect(addGst(-50)).toEqual({ base: 0, gst: 0, total: 0 });
  });
});

describe("removeGst", () => {
  it("backs GST out of an inclusive amount", () => {
    const r = removeGst(109);
    expect(r.base).toBeCloseTo(100, 6);
    expect(r.gst).toBeCloseTo(9, 6);
    expect(r.total).toBe(109);
  });
});

describe("GST_RATE", () => {
  it("is 9%", () => {
    expect(GST_RATE).toBe(0.09);
  });
});
