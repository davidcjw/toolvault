import { describe, expect, it } from "vitest";
import { brushRadius, canvasPoint, interpolatePoints } from "./brush";

describe("canvasPoint", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };

  it("maps to canvas pixels using the display scale", () => {
    // Display 200x100 box rendering a 400x200 buffer → 2x scale.
    expect(canvasPoint(150, 100, rect, 400, 200)).toEqual({ x: 100, y: 100 });
  });

  it("returns origin at the rect's top-left corner", () => {
    expect(canvasPoint(100, 50, rect, 400, 200)).toEqual({ x: 0, y: 0 });
  });

  it("falls back to 1:1 when the rect has no size", () => {
    const empty = { left: 0, top: 0, width: 0, height: 0 };
    expect(canvasPoint(10, 20, empty, 400, 200)).toEqual({ x: 10, y: 20 });
  });
});

describe("brushRadius", () => {
  it("scales with image width", () => {
    expect(brushRadius(1000, 8)).toBe(20);
    expect(brushRadius(4000, 8)).toBe(80);
  });

  it("never drops below a usable minimum", () => {
    expect(brushRadius(100, 1)).toBe(4);
  });
});

describe("interpolatePoints", () => {
  it("fills evenly spaced points between two coords", () => {
    const pts = interpolatePoints({ x: 0, y: 0 }, { x: 10, y: 0 }, 5);
    expect(pts).toEqual([
      { x: 5, y: 0 },
      { x: 10, y: 0 },
    ]);
  });

  it("returns just the endpoint when the points coincide", () => {
    expect(interpolatePoints({ x: 3, y: 3 }, { x: 3, y: 3 }, 5)).toEqual([
      { x: 3, y: 3 },
    ]);
  });

  it("returns just the endpoint when spacing is non-positive", () => {
    expect(interpolatePoints({ x: 0, y: 0 }, { x: 9, y: 0 }, 0)).toEqual([
      { x: 9, y: 0 },
    ]);
  });

  it("always includes the endpoint", () => {
    const pts = interpolatePoints({ x: 0, y: 0 }, { x: 7, y: 0 }, 5);
    expect(pts[pts.length - 1]).toEqual({ x: 7, y: 0 });
  });
});
