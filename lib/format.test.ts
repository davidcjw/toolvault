import { describe, expect, it } from "vitest";
import {
  changeExtension,
  computeTargetDimensions,
  formatBytes,
  move,
  reductionPercent,
} from "./format";

describe("computeTargetDimensions", () => {
  it("returns source size when no bounds given", () => {
    expect(computeTargetDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("never upscales", () => {
    expect(computeTargetDimensions(400, 300, 4000, 3000)).toEqual({
      width: 400,
      height: 300,
    });
  });

  it("preserves aspect ratio when constrained by width", () => {
    expect(computeTargetDimensions(2000, 1000, 1000)).toEqual({
      width: 1000,
      height: 500,
    });
  });

  it("uses the tighter of the two bounds", () => {
    // width bound -> 0.5, height bound -> 0.25; height wins
    expect(computeTargetDimensions(2000, 2000, 1000, 500)).toEqual({
      width: 500,
      height: 500,
    });
  });

  it("guards against zero input", () => {
    expect(computeTargetDimensions(0, 0)).toEqual({ width: 0, height: 0 });
  });
});

describe("formatBytes", () => {
  it("formats across units", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});

describe("reductionPercent", () => {
  it("computes savings", () => {
    expect(reductionPercent(1000, 250)).toBe(75);
  });
  it("returns 0 when output is larger or invalid", () => {
    expect(reductionPercent(1000, 1200)).toBe(0);
    expect(reductionPercent(0, 100)).toBe(0);
  });
});

describe("changeExtension", () => {
  it("swaps the final extension only", () => {
    expect(changeExtension("cat.PNG", "webp")).toBe("cat.webp");
    expect(changeExtension("my.photo.jpeg", "png")).toBe("my.photo.png");
    expect(changeExtension("noext", "pdf")).toBe("noext.pdf");
  });
});

describe("move", () => {
  it("reorders items immutably", () => {
    const src = ["a", "b", "c"];
    expect(move(src, 0, 2)).toEqual(["b", "c", "a"]);
    expect(src).toEqual(["a", "b", "c"]); // unchanged
  });
  it("ignores out-of-range indices", () => {
    expect(move(["a", "b"], -1, 5)).toEqual(["a", "b"]);
  });
});
