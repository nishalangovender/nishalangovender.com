export const siteConfig = {
  name: "Nishalan Govender",
  title: "Nishalan Govender — Robotics Engineer",
  shortTitle: "Nishalan Govender",
  tagline: "Robotics Engineer",
  /** Current role title — CV, about header and JSON-LD `jobTitle`. */
  role: "Lead Robotics Engineer",
  description:
    "Robotics engineer who shipped production AGV fleets into Toyota South Africa — ROS2, controls, embedded C++. Now exploring Physical AI at Ubundi.",
  url: "https://nishalangovender.com",
  email: "nish@nishalangovender.com",
  locale: "en_ZA",
  keywords: [
    "Nishalan Govender",
    "Robotics Engineer",
    "Robotics Software Engineer",
    "ROS2",
    "AGV",
    "Autonomous Systems",
    "Controls Engineer",
    "Embedded Systems",
    "C++",
    "Mechatronics Engineer",
    "Physical AI",
    "South Africa",
  ],
  socials: {
    github: "https://github.com/nishalangovender",
    githubWork: "https://github.com/ubunish",
    linkedin: "https://linkedin.com/in/nishalangovender",
    company: "https://ubundi.com",
  },
  formspreeId: process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "",
} as const;

/**
 * Primary navigation. `/blog` is deliberately absent — the route is live and
 * listed in the sitemap, but it stays out of the nav until there are enough
 * posts to be worth a click.
 */
export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Skills", href: "/skills" },
  { label: "Projects", href: "/projects" },
  { label: "CV", href: "/cv" },
  { label: "Contact", href: "/contact" },
] as const;
