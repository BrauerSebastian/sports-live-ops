import { ImageResponse } from "next/og";

export const alt = "Sports Live Ops match operations interface";
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
          background: "#08090A",
          color: "#F4F5F3",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 700 }}>
          <div style={{ width: 5, height: 28, background: "#FF625B" }} />
          Sports Live Ops
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ color: "#929DA3", fontSize: 22, fontWeight: 600 }}>MATCH OPERATIONS</div>
          <div style={{ maxWidth: 900, fontSize: 68, lineHeight: 1.02, fontWeight: 700 }}>Operate live matches from one control room.</div>
          <div style={{ color: "#C8CECB", fontSize: 26 }}>Match state, incidents, commentary, statistics and public updates.</div>
        </div>
      </div>
    ),
    size,
  );
}
