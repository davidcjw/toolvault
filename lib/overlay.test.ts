import { describe, expect, it } from "vitest";
import { clamp, layerRect, makeLayer, widthFromCorner } from "./overlay";

describe("makeLayer", () => {
  it("centres a new overlay at 40% width with neutral transform", () => {
    const l = makeLayer("a", "blob:x", 0.5);
    expect(l).toMatchObject({
      id: "a",
      src: "blob:x",
      aspect: 0.5,
      cx: 0.5,
      cy: 0.5,
      w: 0.4,
      rotation: 0,
      opacity: 1,
      flipX: false,
    });
  });
});

describe("clamp", () => {
  it("bounds a value to the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe("layerRect", () => {
  it("returns a centred pixel rect, height from aspect", () => {
    const l = makeLayer("a", "x", 1); // square overlay
    const r = layerRect({ ...l, w: 0.5, cx: 0.5, cy: 0.5 }, 200, 100);
    // w = 0.5 * 200 = 100; h = 100 * 1 = 100; centred at (100, 50)
    expect(r).toEqual({ x: 50, y: 0, w: 100, h: 100 });
  });

  it("preserves the overlay's own aspect ratio", () => {
    const l = makeLayer("a", "x", 0.5); // half as tall as wide
    const r = layerRect({ ...l, w: 0.5 }, 400, 400);
    expect(r.w).toBe(200);
    expect(r.h).toBe(100);
  });
});

describe("widthFromCorner", () => {
  it("recovers full width from a corner distance (square overlay)", () => {
    // half-diagonal of a 100px square = 50*sqrt(2) ≈ 70.71
    const dist = 50 * Math.SQRT2;
    expect(widthFromCorner(dist, 1, 100)).toBeCloseTo(1, 5);
  });

  it("returns 0 for a non-positive base width", () => {
    expect(widthFromCorner(50, 1, 0)).toBe(0);
  });
});
