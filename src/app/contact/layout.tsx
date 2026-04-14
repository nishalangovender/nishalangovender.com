import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Nishalan Govender — for roles, collaborations, or technical conversations.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Nishalan Govender",
    description:
      "Get in touch with Nishalan Govender — for roles, collaborations, or technical conversations.",
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
