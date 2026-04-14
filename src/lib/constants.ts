export const siteConfig = {
  name: "Nishalan Govender",
  title: "Nishalan Govender — Mechatronics Engineer",
  shortTitle: "Nishalan Govender",
  tagline: "Mechatronics Engineer",
  description:
    "Mechatronics engineer specialising in end-to-end production robotics systems, low-level C++ embedded interfaces, CI/CD, and control systems. Based in South Africa, open to international work.",
  url: "https://nishalangovender.com",
  email: "nish@nishalangovender.com",
  locale: "en_ZA",
  keywords: [
    "Nishalan Govender",
    "Mechatronics Engineer",
    "Robotics Software Engineer",
    "Embedded Systems",
    "Controls Engineer",
    "ROS2",
    "C++",
    "Autonomous Systems",
    "AGV",
    "South Africa",
  ],
  socials: {
    github: "https://github.com/nishalangovender",
    linkedin: "https://linkedin.com/in/nishalangovender",
  },
  formspreeId: process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Skills", href: "/skills" },
  { label: "Projects", href: "/projects" },
  { label: "CV", href: "/cv" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;
