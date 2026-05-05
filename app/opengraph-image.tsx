import { ImageResponse } from "next/og";

export const alt = "Castory — AI Podcast Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          position: "relative",
          border: "12px solid #ff6b35",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "#ff6b35",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
              color: "#0a0a0a",
              letterSpacing: -1,
            }}
          >
            C
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: -1,
            }}
          >
            Castory
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 124,
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: -3.5,
              lineHeight: 1.0,
            }}
          >
            AI Podcasts
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 500,
              color: "#ff6b35",
              marginTop: 12,
              fontStyle: "italic",
            }}
          >
            in minutes
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#888",
              fontFamily: "monospace",
            }}
          >
            Script · Voice · Cover Art
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#888",
              fontFamily: "monospace",
            }}
          >
            castory-ai.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
