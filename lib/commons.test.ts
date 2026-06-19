import { describe, expect, it } from "vitest";
import { commonsSearchUrl, stripHtml } from "./commons";

describe("commonsSearchUrl", () => {
  it("queries the File namespace with an image filetype filter", () => {
    const url = new URL(commonsSearchUrl("party hat"));
    expect(url.origin + url.pathname).toBe("https://commons.wikimedia.org/w/api.php");
    expect(url.searchParams.get("gsrsearch")).toBe("party hat filetype:bitmap|drawing");
    expect(url.searchParams.get("gsrnamespace")).toBe("6");
    expect(url.searchParams.get("origin")).toBe("*");
    expect(url.searchParams.get("format")).toBe("json");
  });

  it("respects a custom limit", () => {
    const url = new URL(commonsSearchUrl("balloons", 10));
    expect(url.searchParams.get("gsrlimit")).toBe("10");
  });
});

describe("stripHtml", () => {
  it("removes tags and trims", () => {
    expect(stripHtml('<a href="x">CC BY-SA 3.0</a>')).toBe("CC BY-SA 3.0");
    expect(stripHtml("Public domain")).toBe("Public domain");
  });
});
