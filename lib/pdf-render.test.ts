import { describe, expect, it } from "vitest";
import { pdfPageName } from "./pdf-render";

describe("pdfPageName", () => {
  it("builds a per-page filename", () => {
    expect(pdfPageName("report", 3, "png")).toBe("report_p3.png");
    expect(pdfPageName("scan", 1, "jpg")).toBe("scan_p1.jpg");
  });
});
