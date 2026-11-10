import { ImageResponse } from "next/og";

export const alt =
  "Bankybondy — creating reality together. A mutual-help network for bonds, barter and community.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #0b0e20 0%, #121736 55%, #1b2158 100%)",
          color: "#f7f8ff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 999,
            background: "rgba(79, 70, 229, 0.28)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -220,
            left: -140,
            width: 460,
            height: 460,
            borderRadius: 999,
            background: "rgba(34, 177, 207, 0.16)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 20px",
              borderRadius: 999,
              border: "3px solid rgba(99, 102, 241, 0.7)",
              background: "#0c0f22",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#22b1cf",
              }}
            />
            <div
              style={{
                width: 44,
                height: 14,
                borderRadius: 999,
                background: "#4f46e5",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#16b364",
              }}
            />
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
            Bankybondy
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -3,
              maxWidth: 900,
            }}
          >
            Creating reality together.
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: "#b9c0ea",
              maxWidth: 860,
            }}
          >
            A mutual-help network to exchange skills, projects and time with
            people who value the same things you do.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(185, 192, 234, 0.25)",
            paddingTop: 28,
            position: "relative",
            fontSize: 24,
            color: "#b9c0ea",
          }}
        >
          <div style={{ display: "flex" }}>bankybondy.com</div>
          <div style={{ display: "flex" }}>
            Bonds · Barter · Community · Audio
          </div>
        </div>
      </div>
    ),
    size,
  );
}
