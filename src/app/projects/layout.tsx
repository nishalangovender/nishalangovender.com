import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected engineering projects — autonomous vehicles, embedded controllers, full-stack systems, and the case studies behind them.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects — Nishalan Govender",
    description:
      "Selected engineering projects — autonomous vehicles, embedded controllers, full-stack systems, and the case studies behind them.",
    url: "/projects",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
