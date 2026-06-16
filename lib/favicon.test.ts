import { describe, expect, it } from "vitest";
import { FAVICON_HTML, pngName, pngsToIco, webManifest } from "./favicon";

describe("pngName", () => {
  it("maps sizes to conventional filenames", () => {
    expect(pngName(16)).toBe("favicon-16x16.png");
    expect(pngName(32)).toBe("favicon-32x32.png");
    expect(pngName(180)).toBe("apple-touch-icon.png");
    expect(pngName(192)).toBe("web-app-manifest-192x192.png");
    expect(pngName(512)).toBe("web-app-manifest-512x512.png");
  });
});

describe("FAVICON_HTML", () => {
  it("includes the ico, png, apple and manifest links", () => {
    expect(FAVICON_HTML).toContain('href="/favicon.ico"');
    expect(FAVICON_HTML).toContain("apple-touch-icon");
    expect(FAVICON_HTML).toContain('rel="manifest"');
  });
});

describe("webManifest", () => {
  it("is valid JSON with the two PWA icons", () => {
    const m = JSON.parse(webManifest("Demo"));
    expect(m.name).toBe("Demo");
    expect(m.icons).toHaveLength(2);
  });
});

describe("pngsToIco", () => {
  it("writes a correct ICONDIR header and entry table", () => {
    const a = new Uint8Array([1, 2, 3, 4]);
    const b = new Uint8Array([9, 9]);
    const ico = pngsToIco([
      { size: 16, png: a },
      { size: 32, png: b },
    ]);
    const view = new DataView(ico.buffer);
    expect(view.getUint16(0, true)).toBe(0); // reserved
    expect(view.getUint16(2, true)).toBe(1); // type icon
    expect(view.getUint16(4, true)).toBe(2); // count
    // first entry: width 16, data length 4, offset 6 + 2*16 = 38
    expect(ico[6]).toBe(16);
    expect(view.getUint32(6 + 8, true)).toBe(4);
    expect(view.getUint32(6 + 12, true)).toBe(38);
    // total length = header(38) + 4 + 2
    expect(ico.length).toBe(44);
  });
});
