import { ImageResponse } from "next/og";

export const alt = "Sports Live Ops — real-time sports event operations and live center";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1b2021",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, fontWeight: 800, letterSpacing: 2 }}>
          <div style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#b8f500", color: "#172000" }}>S</div>
          SPORTS LIVE OPS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ color: "#b8f500", fontSize: 24, fontWeight: 700, letterSpacing: 2 }}>LIVE EVENT OPERATIONS</div>
          <div style={{ maxWidth: 900, fontSize: 68, lineHeight: 1.02, fontWeight: 700 }}>Operate the match. Publish the moment.</div>
          <div style={{ color: "#c8d0cc", fontSize: 26 }}>Control Room + public Live Center / portfolio demonstration</div>
        </div>
      </div>
    ),
    size,
  );
}
