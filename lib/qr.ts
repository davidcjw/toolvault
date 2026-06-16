import QRCode from "qrcode";

export type Ecc = "L" | "M" | "Q" | "H";

export type QrOptions = {
  size: number;
  margin: number;
  dark: string;
  light: string;
  ecc: Ecc;
};

/** Render a QR code onto an existing canvas element. */
export async function qrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  o: QrOptions
): Promise<void> {
  await QRCode.toCanvas(canvas, text, {
    width: o.size,
    margin: o.margin,
    errorCorrectionLevel: o.ecc,
    color: { dark: o.dark, light: o.light },
  });
}

/** Produce a standalone SVG string for the QR code. */
export async function qrToSvg(text: string, o: QrOptions): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    width: o.size,
    margin: o.margin,
    errorCorrectionLevel: o.ecc,
    color: { dark: o.dark, light: o.light },
  });
}
