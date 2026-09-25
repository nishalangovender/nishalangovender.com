import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Career narrative and timeline for Nishalan Govender — robotics engineer who shipped production AGV fleets, now exploring Physical AI at Ubundi.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Nishalan Govender",
    description:
      "Career narrative and timeline for Nishalan Govender — robotics engineer who shipped production AGV fleets, now exploring Physical AI at Ubundi.",
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
