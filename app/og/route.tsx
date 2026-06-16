import { ImageResponse } from "next/og";

export const runtime = "edge";

const KEYHOLE = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='#0f172a'/><g fill='#22c55e'><circle cx='16' cy='13' r='4.4'/><path d='M13.5 15 L18.5 15 L19.6 23.4 Q19.7 24 19.1 24 L12.9 24 Q12.3 24 12.4 23.4 Z'/></g></svg>`;

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Free, private browser tools";
  const cat = searchParams.get("cat");

  const mark = `data:image/svg+xml;base64,${btoa(KEYHOLE)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #0b1220 0%, #111a2b 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark} width={84} height={84} alt="" />
            <span style={{ fontSize: 40, fontWeight: 700 }}>Toolvault</span>
          </div>
          {cat ? (
            <span
              style={{
                display: "flex",
                fontSize: 26,
                color: "#22c55e",
                border: "2px solid rgba(34,197,94,0.4)",
                borderRadius: 999,
                padding: "8px 22px",
              }}
            >
              {cat}
            </span>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
          <span style={{ color: "#22c55e" }}>Free</span>
          <span style={{ color: "#64748b" }}>·</span>
          <span>runs in your browser</span>
          <span style={{ color: "#64748b" }}>·</span>
          <span style={{ color: "#22c55e" }}>nothing uploaded</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
