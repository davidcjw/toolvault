import { describe, expect, it } from "vitest";
import { clampPad, paddedSize } from "./padding";

describe("clampPad", () => {
  it("rounds to the nearest integer", () => {
    expect(clampPad(12.4)).toBe(12);
    expect(clampPad(12.6)).toBe(13);
  });
  it("floors negatives at zero", () => {
    expect(clampPad(-5)).toBe(0);
  });
  it("treats non-finite values as zero", () => {
    expect(clampPad(NaN)).toBe(0);
    expect(clampPad(Infinity)).toBe(0);
  });
});

describe("paddedSize", () => {
  it("adds independent per-side padding", () => {
    expect(
      paddedSize(800, 600, { top: 10, right: 20, bottom: 30, left: 40 })
    ).toEqual({ width: 860, height: 640 });
  });
  it("handles zero padding", () => {
    expect(
      paddedSize(800, 600, { top: 0, right: 0, bottom: 0, left: 0 })
    ).toEqual({ width: 800, height: 600 });
  });
  it("ignores negative padding", () => {
    expect(
      paddedSize(100, 100, { top: -10, right: 0, bottom: 0, left: 0 })
    ).toEqual({ width: 100, height: 100 });
  });
  it("never returns a zero dimension", () => {
    expect(
      paddedSize(0, 0, { top: 0, right: 0, bottom: 0, left: 0 })
    ).toEqual({ width: 1, height: 1 });
  });
});
