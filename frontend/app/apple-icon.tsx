import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 110,
            transform: "rotate(-15deg)",
          }}
        >
          🧭
        </div>
      </div>
    ),
    { ...size }
  );
}
