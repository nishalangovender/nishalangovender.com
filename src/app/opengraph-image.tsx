import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/constants";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontsDir = join(process.cwd(), "src/app/fonts");

export default async function OpengraphImage() {
  const name = siteConfig.name;
  const taglineLine = `${siteConfig.tagline} · Robotics, Embedded Systems, Controls`;

  const [spaceGrotesk700, spaceGrotesk400, jetBrainsMono400] = await Promise.all([
    readFile(join(fontsDir, "SpaceGrotesk-Bold.ttf")),
    readFile(join(fontsDir, "SpaceGrotesk-Regular.ttf")),
    readFile(join(fontsDir, "JetBrainsMono-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0A0A0A",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          color: "#E5E5E5",
          fontFamily: "Space Grotesk",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "24px",
            color: "#3B82F6",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "JetBrains Mono",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              border: "2px solid #3B82F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: 0,
            }}
          >
            NG
          </div>
          nishalangovender.com
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {name}
          </div>
          <div
            style={{
              width: 280,
              height: 2,
              background:
                "linear-gradient(90deg, #3B82F6 0%, rgba(59,130,246,0) 100%)",
            }}
          />
          <div
            style={{
              fontSize: "36px",
              color: "#A3A3A3",
              maxWidth: 980,
              lineHeight: 1.3,
              fontWeight: 400,
            }}
          >
            {taglineLine}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "JetBrains Mono",
            fontSize: "20px",
            color: "#737373",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          <span>Design · Iterate · Deploy</span>
          <span>Available For Hire</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: spaceGrotesk700,
          style: "normal",
          weight: 700,
        },
        {
          name: "Space Grotesk",
          data: spaceGrotesk400,
          style: "normal",
          weight: 400,
        },
        {
          name: "JetBrains Mono",
          data: jetBrainsMono400,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
