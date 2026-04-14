import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Technical skills across software, electronics and mechanical disciplines — and the mechatronics intersections where they meet.",
  alternates: { canonical: "/skills" },
  openGraph: {
    title: "Skills — Nishalan Govender",
    description:
      "Technical skills across software, electronics and mechanical disciplines — and the mechatronics intersections where they meet.",
    url: "/skills",
  },
};

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
