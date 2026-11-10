import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

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
          background: "#12162b",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "18px 26px",
            borderRadius: 999,
            border: "4px solid rgba(99, 102, 241, 0.7)",
            background: "#0c0f22",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#22b1cf",
            }}
          />
          <div
            style={{
              width: 54,
              height: 18,
              borderRadius: 999,
              background: "#4f46e5",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#16b364",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
