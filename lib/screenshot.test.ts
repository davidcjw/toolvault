import { describe, expect, it } from "vitest";
import { GRADIENTS, outputSize } from "./screenshot";

describe("outputSize", () => {
  it("adds uniform padding around the image", () => {
    expect(outputSize(800, 600, 64)).toEqual({ width: 928, height: 728 });
  });
  it("accounts for an optional top bar", () => {
    expect(outputSize(800, 600, 64, 34)).toEqual({ width: 928, height: 762 });
  });
  it("never returns a zero dimension", () => {
    expect(outputSize(0, 0, 0)).toEqual({ width: 1, height: 1 });
  });
});

describe("GRADIENTS", () => {
  it("each preset has an id, name and two stops", () => {
    expect(GRADIENTS.length).toBeGreaterThan(0);
    for (const g of GRADIENTS) {
      expect(g.id).toBeTruthy();
      expect(g.name).toBeTruthy();
      expect(g.stops).toHaveLength(2);
    }
  });
});
