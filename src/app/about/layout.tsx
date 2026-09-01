import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Career narrative and timeline for Nishalan Govender — robotics engineer at Ubundi working across AI, Physical AI and production robotics.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Nishalan Govender",
    description:
      "Career narrative and timeline for Nishalan Govender — robotics engineer at Ubundi working across AI, Physical AI and production robotics.",
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
