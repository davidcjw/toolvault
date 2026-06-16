export const FAVICON_SIZES = [16, 32, 48, 180, 192, 512] as const;
export const ICO_SIZES = [16, 32, 48] as const;

/** The <head> snippet users paste into their site. */
export const FAVICON_HTML = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

export function webManifest(name: string): string {
  return JSON.stringify(
    {
      name,
      short_name: name,
      icons: [
        { src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
    },
    null,
    2
  );
}

/** The download filename for a generated PNG of a given size. */
export function pngName(size: number): string {
  if (size === 180) return "apple-touch-icon.png";
  if (size === 192 || size === 512) return `web-app-manifest-${size}x${size}.png`;
  return `favicon-${size}x${size}.png`;
}

/** Pack PNG buffers into a single multi-resolution .ico file. */
export function pngsToIco(images: { size: number; png: Uint8Array }[]): Uint8Array {
  const count = images.length;
  const headerSize = 6 + count * 16;
  const total = headerSize + images.reduce((s, i) => s + i.png.length, 0);
  const buf = new Uint8Array(total);
  const view = new DataView(buf.buffer);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, count, true);

  let offset = headerSize;
  images.forEach((img, i) => {
    const entry = 6 + i * 16;
    buf[entry] = img.size >= 256 ? 0 : img.size; // width (0 = 256)
    buf[entry + 1] = img.size >= 256 ? 0 : img.size; // height
    buf[entry + 2] = 0; // color palette
    buf[entry + 3] = 0; // reserved
    view.setUint16(entry + 4, 1, true); // color planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, img.png.length, true); // size of data
    view.setUint32(entry + 12, offset, true); // offset of data
    buf.set(img.png, offset);
    offset += img.png.length;
  });

  return buf;
}
