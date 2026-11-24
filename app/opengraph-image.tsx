import { ImageResponse } from "next/og";

export const alt = "Net Metering by BDSHOP - SREDA Approved Solar Equipment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#123B65", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80 }}>
        <div style={{ fontSize: 34, color: "#9CC6E8", letterSpacing: 4 }}>BDSHOP</div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 16 }}>Net Metering</div>
        <div style={{ fontSize: 34, marginTop: 24, color: "#DCEBF8" }}>SREDA Approved Solar Equipment Directory</div>
        <div style={{ fontSize: 26, marginTop: 40, color: "#9CC6E8" }}>Solar Modules · Single Phase Inverters · Three Phase Inverters</div>
      </div>
    ),
    size,
  );
}
