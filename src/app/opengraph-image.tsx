import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/constants";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontsDir = join(process.cwd(), "src/app/fonts");
const avatarPath = join(process.cwd(), "public/images/avatar/avatar-400.png");

export default async function OpengraphImage() {
  const name = siteConfig.name;
  const taglineLine = `${siteConfig.tagline} · ROS2, Controls, Embedded Systems`;

  const [spaceGrotesk700, spaceGrotesk400, jetBrainsMono400, avatar] =
    await Promise.all([
      readFile(join(fontsDir, "SpaceGrotesk-Bold.ttf")),
      readFile(join(fontsDir, "SpaceGrotesk-Regular.ttf")),
      readFile(join(fontsDir, "JetBrainsMono-Regular.ttf")),
      readFile(avatarPath),
    ]);

  // Satori resolves no local paths, so the portrait travels inline.
  const avatarSrc = `data:image/png;base64,${avatar.toString("base64")}`;

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
          background: "#05070D",
          backgroundImage:
            "linear-gradient(rgba(51,225,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(51,225,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          color: "#DDE7F0",
          fontFamily: "Space Grotesk",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "24px",
            color: "#33E1FF",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "JetBrains Mono",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              border: "2px solid #33E1FF",
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "48px",
          }}
        >
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
                  "linear-gradient(90deg, #33E1FF 0%, rgba(51,225,255,0) 100%)",
              }}
            />
            <div
              style={{
                fontSize: "36px",
                color: "#8A9BB0",
                maxWidth: 640,
                lineHeight: 1.3,
                fontWeight: 400,
              }}
            >
              {taglineLine}
            </div>
          </div>

          {/* Satori renders plain <img> — next/image has no place in an OG route. */}
          <img
            src={avatarSrc}
            alt=""
            width={260}
            height={260}
            style={{
              width: 260,
              height: 260,
              borderRadius: 130,
              border: "2px solid #16202B",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "JetBrains Mono",
            fontSize: "20px",
            color: "#5C6B7D",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          <span>Design · Iterate · Deploy</span>
          <span>Ubundi · Stellenbosch</span>
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
