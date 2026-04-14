import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Career narrative and timeline for Nishalan Govender — mechatronics engineer working on production robotics, embedded systems and controls.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Nishalan Govender",
    description:
      "Career narrative and timeline for Nishalan Govender — mechatronics engineer working on production robotics, embedded systems and controls.",
    url: "/about",
    type: "profile",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
