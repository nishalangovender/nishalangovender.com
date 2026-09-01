export const siteConfig = {
  name: "Nishalan Govender",
  title: "Nishalan Govender — Mechatronics Engineer",
  shortTitle: "Nishalan Govender",
  tagline: "Mechatronics Engineer",
  description:
    "Robotics engineer working across AI and Physical AI — LLMs and agents, vision-language-action models, and end-to-end production robotics systems. Based in South Africa.",
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
    "Physical AI",
    "Vision-Language-Action Models",
    "World Action Models",
    "LLM Agents",
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
