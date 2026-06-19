import { describe, expect, it } from "vitest";
import { opaqueBounds } from "./trim";

/** Build an RGBA buffer of `w`x`h` with the given opaque pixels set. */
function buffer(w: number, h: number, opaque: [number, number][]): Uint8ClampedArray {
  const data = new Uint8ClampedArray(w * h * 4);
  for (const [x, y] of opaque) data[(y * w + x) * 4 + 3] = 255;
  return data;
}

describe("opaqueBounds", () => {
  it("returns null when fully transparent", () => {
    expect(opaqueBounds(buffer(4, 4, []), 4, 4)).toBeNull();
  });

  it("tightly bounds a single opaque pixel", () => {
    const box = opaqueBounds(buffer(5, 5, [[2, 3]]), 5, 5);
    expect(box).toEqual({ x: 2, y: 3, w: 1, h: 1 });
  });

  it("bounds a rectangular opaque region", () => {
    const opaque: [number, number][] = [];
    for (let x = 1; x <= 3; x++) for (let y = 2; y <= 4; y++) opaque.push([x, y]);
    expect(opaqueBounds(buffer(6, 6, opaque), 6, 6)).toEqual({ x: 1, y: 2, w: 3, h: 3 });
  });

  it("respects the alpha threshold", () => {
    const data = new Uint8ClampedArray(2 * 2 * 4);
    data[3] = 10; // pixel (0,0) faint
    expect(opaqueBounds(data, 2, 2, 0)).toEqual({ x: 0, y: 0, w: 1, h: 1 });
    expect(opaqueBounds(data, 2, 2, 20)).toBeNull();
  });
});
