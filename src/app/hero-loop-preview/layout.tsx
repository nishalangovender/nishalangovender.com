import { notFound } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Gates the entire /hero-loop-preview tree to development only. In a
 * production build the preview routes 404, keeping the tool handy for
 * local iteration without exposing it publicly.
 */
export default function HeroLoopPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <>{children}</>;
}

// Opt into static rendering so the gate runs at build time and these
// routes are excluded from the production bundle entirely.
export const dynamic = "force-static";
