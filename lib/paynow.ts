/** PayNow / SGQR (EMVCo Merchant-Presented QR) payload construction.
 *  Pure + framework-free so the byte-exact output can be unit-tested. */

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) — EMVCo's checksum. */
export function crc16ccitt(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** EMVCo Tag-Length-Value field (length is the value's character count). */
function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

/** Normalise a Singapore mobile number to "+65XXXXXXXX", or null if invalid. */
export function normalizeSgMobile(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("65") && digits.length === 10) digits = digits.slice(2);
  if (digits.length === 8 && /^[89]/.test(digits)) return `+65${digits}`;
  return null;
}

export type ProxyType = "mobile" | "uen";

export type PayNowOptions = {
  proxyType: ProxyType;
  /** Normalised mobile ("+65…") or a UEN. */
  proxy: string;
  amount?: number;
  /** Whether the payer may edit the amount (ignored when no amount). */
  editable?: boolean;
  reference?: string;
  merchantName?: string;
};

/** Build a complete, CRC-terminated PayNow QR payload string. */
export function buildPayNowPayload(o: PayNowOptions): string {
  const hasAmount = o.amount != null && o.amount > 0;
  const amountFixed = hasAmount && !o.editable;

  const merchantAccount =
    tlv("00", "SG.PAYNOW") +
    tlv("01", o.proxyType === "uen" ? "2" : "0") +
    tlv("02", o.proxy) +
    tlv("03", amountFixed ? "0" : "1"); // 0 = amount locked, 1 = editable

  let payload =
    tlv("00", "01") + // payload format indicator
    tlv("01", amountFixed ? "12" : "11") + // dynamic vs static
    tlv("26", merchantAccount) +
    tlv("52", "0000") + // merchant category code
    tlv("53", "702"); // currency: SGD

  if (hasAmount) payload += tlv("54", o.amount!.toFixed(2));

  payload +=
    tlv("58", "SG") +
    tlv("59", (o.merchantName || "NA").slice(0, 25)) +
    tlv("60", "Singapore");

  if (o.reference) payload += tlv("62", tlv("01", o.reference.slice(0, 25)));

  payload += "6304"; // CRC tag + length, checksum computed over everything before it
  return payload + crc16ccitt(payload);
}
