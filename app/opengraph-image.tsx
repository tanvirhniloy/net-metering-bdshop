import { ImageResponse } from "next/og";

export const alt = "Net Metering Bangladesh - SREDA Approved Solar Equipment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#123B65", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80 }}>
        <div style={{ fontSize: 34, color: "#9CC6E8", letterSpacing: 4 }}>SREDA APPROVED</div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 16 }}>Solar Panel, Inverter List</div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#DCEBF8" }}>for Net Metering</div>
      </div>
    ),
    size,
  );
}
