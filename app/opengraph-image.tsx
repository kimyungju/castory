import { ImageResponse } from "next/og";

export const alt = "Castory — AI Podcast Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SUBSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,—·-':/";

async function loadGoogleFont(
  family: string,
  weight: number,
  italic = false,
): Promise<ArrayBuffer> {
  const fam = family.replace(/ /g, "+");
  const variant = italic ? `${weight}italic` : `${weight}`;
  const url = `https://fonts.googleapis.com/css?family=${fam}:${variant}&text=${encodeURIComponent(SUBSET)}`;
  const css = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8",
    },
  }).then((r) => r.text());
  const match = css.match(/src:\s*url\((.+?)\)/);
  if (!match) throw new Error(`Failed to load font: ${family} ${variant}`);
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

export default async function OpengraphImage() {
  const [syneBold, crimsonItalic] = await Promise.all([
    loadGoogleFont("Syne", 800),
    loadGoogleFont("Crimson Pro", 600, true),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          padding: "76px 80px",
          position: "relative",
          fontFamily: "Syne, sans-serif",
          border: "12px solid #ff6b35",
          boxSizing: "border-box",
        }}
      >
        {/* TOP: brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: "#ff6b35",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 800,
              color: "#0a0a0a",
              letterSpacing: -1,
              boxShadow: "8px 8px 0 rgba(0, 0, 0, 0.5)",
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

        {/* HERO */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: -3,
              lineHeight: 1.0,
            }}
          >
            Make a podcast
          </div>
          <div
            style={{
              fontSize: 60,
              color: "#ff6b35",
              fontStyle: "italic",
              fontFamily: "Crimson Pro, serif",
              fontWeight: 600,
              marginTop: 6,
              lineHeight: 1.0,
            }}
          >
            in minutes.
          </div>
          <div
            style={{
              width: 80,
              height: 5,
              background: "#ff6b35",
              marginTop: 28,
            }}
          />
          <div
            style={{
              fontSize: 22,
              color: "#a0a0a0",
              marginTop: 22,
              maxWidth: 760,
              lineHeight: 1.45,
              fontFamily: "sans-serif",
              fontWeight: 400,
            }}
          >
            Pick a topic. We generate the script, voice, and cover art with GPT-4.1-mini, TTS-1, and DALL-E 3.
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: "#666",
              fontFamily: "monospace",
              letterSpacing: 1,
            }}
          >
            Script · Voice · Cover Art
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#666",
              fontFamily: "monospace",
            }}
          >
            castory-ai.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Syne",
          data: syneBold,
          weight: 800,
          style: "normal",
        },
        {
          name: "Crimson Pro",
          data: crimsonItalic,
          weight: 600,
          style: "italic",
        },
      ],
    },
  );
}
