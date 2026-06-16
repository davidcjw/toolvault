import { describe, expect, it } from "vitest";
import { lineDiff } from "./diff";

describe("lineDiff", () => {
  it("detects a changed line as del + add", () => {
    expect(lineDiff("a\nb\nc", "a\nx\nc")).toEqual([
      { type: "eq", text: "a" },
      { type: "del", text: "b" },
      { type: "add", text: "x" },
      { type: "eq", text: "c" },
    ]);
  });

  it("handles pure additions", () => {
    expect(lineDiff("a", "a\nb")).toEqual([
      { type: "eq", text: "a" },
      { type: "add", text: "b" },
    ]);
  });

  it("reports all-equal when identical", () => {
    const ops = lineDiff("x\ny", "x\ny");
    expect(ops.every((o) => o.type === "eq")).toBe(true);
  });
});
