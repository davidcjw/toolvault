import { describe, expect, it } from "vitest";
import { everyPage, parsePageRanges } from "./ranges";

describe("parsePageRanges", () => {
  it("parses single pages and ranges into groups", () => {
    expect(parsePageRanges("1-3, 5", 10)).toEqual([[1, 2, 3], [5]]);
  });

  it("normalises reversed bounds", () => {
    expect(parsePageRanges("3-1", 10)).toEqual([[1, 2, 3]]);
  });

  it("supports open-ended ranges", () => {
    expect(parsePageRanges("8-", 10)).toEqual([[8, 9, 10]]);
    expect(parsePageRanges("-3", 10)).toEqual([[1, 2, 3]]);
  });

  it("clamps to the document size and drops out-of-range singles", () => {
    expect(parsePageRanges("9-20", 10)).toEqual([[9, 10]]);
    expect(parsePageRanges("99", 10)).toEqual([]);
  });

  it("ignores junk tokens", () => {
    expect(parsePageRanges("abc, 2, , -", 10)).toEqual([[2]]);
  });

  it("returns nothing when the document is empty", () => {
    expect(parsePageRanges("1-3", 0)).toEqual([]);
  });
});

describe("everyPage", () => {
  it("creates one group per page", () => {
    expect(everyPage(3)).toEqual([[1], [2], [3]]);
    expect(everyPage(0)).toEqual([]);
  });
});
