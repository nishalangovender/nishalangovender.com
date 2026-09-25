import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { getProjectBySlug, projects } from "@/data/projects";

export const alt = "Project case study — Nishalan Govender";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontsDir = join(process.cwd(), "src/app/fonts");

export function generateStaticParams() {
  return projects.filter((p) => p.caseStudy).map((p) => ({ slug: p.slug }));
}

export default async function ProjectOgImage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProjectBySlug(params.slug);
  const title = project?.title ?? "Project Case Study";
  const description = project?.description ?? "";
  const tags = project?.tags ?? [];

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
          padding: "72px",
          background: "#040405",
          backgroundImage:
            "linear-gradient(rgba(51,225,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(51,225,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          color: "#EEF4F9",
          fontFamily: "Space Grotesk",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "20px",
            color: "#33E1FF",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "JetBrains Mono",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              border: "2px solid #33E1FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: 0,
            }}
          >
            NG
          </div>
          Case Study
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: title.length > 32 ? "64px" : "80px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 1056,
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: 240,
              height: 2,
              background:
                "linear-gradient(90deg, #33E1FF 0%, rgba(51,225,255,0) 100%)",
            }}
          />
          {description && (
            <div
              style={{
                fontSize: "26px",
                color: "#8598AB",
                maxWidth: 1056,
                lineHeight: 1.35,
                fontWeight: 400,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            fontFamily: "JetBrains Mono",
            fontSize: "18px",
          }}
        >
          {tags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              style={{
                padding: "8px 16px",
                border: "1px solid rgba(238,244,249,0.25)",
                color: "#8598AB",
                borderRadius: 999,
              }}
            >
              {tag}
            </span>
          ))}
          <span
            style={{
              marginLeft: "auto",
              color: "#657382",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            nishalangovender.com
          </span>
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
