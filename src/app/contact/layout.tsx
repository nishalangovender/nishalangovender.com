import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Nishalan Govender — for collaborations and technical conversations on robotics, Physical AI and agents.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Nishalan Govender",
    description:
      "Get in touch with Nishalan Govender — for collaborations and technical conversations on robotics, Physical AI and agents.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
