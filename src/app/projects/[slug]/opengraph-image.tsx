import { ImageResponse } from "next/og";

import { getProjectBySlug, projects } from "@/data/projects";

export const alt = "Project case study — Nishalan Govender";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#0A0A0A",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          color: "#E5E5E5",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "20px",
            color: "#3B82F6",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              border: "2px solid #3B82F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
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
                "linear-gradient(90deg, #3B82F6 0%, rgba(59,130,246,0) 100%)",
            }}
          />
          {description && (
            <div
              style={{
                fontSize: "26px",
                color: "#A3A3A3",
                maxWidth: 1056,
                lineHeight: 1.35,
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
            fontFamily: "monospace",
            fontSize: "18px",
          }}
        >
          {tags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              style={{
                padding: "8px 16px",
                border: "1px solid rgba(229,229,229,0.25)",
                color: "#A3A3A3",
                borderRadius: 999,
              }}
            >
              {tag}
            </span>
          ))}
          <span
            style={{
              marginLeft: "auto",
              color: "#737373",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            nishalangovender.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
