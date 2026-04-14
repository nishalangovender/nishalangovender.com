// ─── Project Data ───────────────────────────────────────────────────────────
// Single source of truth for every project. Consumed by the projects grid
// page and the dynamic case study route at /projects/[slug].
//
// Case study content is optional — it's populated in later commits of
// Milestone 2. Until then, a project still appears in the grid but the
// detail page gracefully falls back to the card-level description.

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * A fully written case study. All fields are plain text (multi-paragraph
 * prose is fine — use double newlines to separate paragraphs). The detail
 * page at /projects/[slug] renders each field as its own section.
 */
export interface CaseStudy {
  /** The problem or opportunity that motivated the project. */
  problem: string;
  /** How the project was approached — design decisions and architecture. */
  approach: string;
  /** Deeper implementation notes — algorithms, hardware, tradeoffs. */
  technicalDetails: string;
  /** Measurable outcomes and results. */
  outcome: string;
  /**
   * Full technical stack displayed on the case study page. Distinct from
   * `Project.tags`, which is used to drive the projects grid filter and
   * should stay broad (e.g. "Robotics", "Embedded", "Web").
   */
  techStack: string[];
}

export interface Project {
  /** URL slug — used for /projects/[slug] routing. */
  slug: string;
  title: string;
  /** Short summary shown on the projects grid card. */
  description: string;
  /** Broad filter tags used by the projects grid filter UI. */
  tags: string[];
  /** Optional hero image path relative to /public (e.g. "/projects/foo.png"). */
  image?: string;
  /** Optional external link (live demo, paper, blog post). */
  link?: string;
  /** Optional GitHub repository URL. */
  github?: string;
  /** Flagship projects surface first on the grid and homepage. */
  featured: boolean;
  /**
   * Confidential client work that cannot have a detail page or imagery.
   * Renders as a non-clickable card with a "Confidential" badge.
   */
  confidential?: boolean;
  /**
   * Marks a project that has an interactive demo planned for Milestone 5.
   * Surfaces a subtle badge on the card while the demo is still pending.
   */
  interactiveDemoPlanned?: boolean;
  /** Full case study content. Undefined until the case study is written. */
  caseStudy?: CaseStudy;
}

// ─── Projects ───────────────────────────────────────────────────────────────
// Content source: docs/content.md § Projects
// Order matters — featured projects first, then the optional backlog.

export const projects: Project[] = [
  {
    slug: "toyota-agv-fleet",
    title: "AGV Fleet System — Toyota SA Manufacturing",
    description:
      "Designed and deployed an end-to-end AGV and fleet management system at Toyota SA Manufacturing, with a scalable architecture designed to support further line expansion. Built the full software stack including kinematic modelling, SMACC2 state machines, embedded Linux customisation, low-level C++ CANOpen drivers, IMU/LiDAR fusion, and Zenoh-based fleet communication.",
    tags: ["Robotics", "ROS2", "C++", "CANOpen", "Zenoh"],
    featured: true,
    caseStudy: {
      problem:
        "A South African automotive manufacturer needed a production AGV fleet to move parts across multiple assembly lines, on an accelerated delivery schedule. The system had to run reliably on a factory floor shared with human operators, integrate cleanly with existing plant infrastructure, and be extensible so that additional lines could be brought online without rewriting the software stack.\n\nI joined BATTALION Technologies under a senior engineer and progressively took ownership of technical decisions during my first year. After the senior engineer departed, I led the company's technical practice for the remaining eight months — responsible for the architecture, the embedded stack, controls, DevOps, client engagement and team development carrying this deployment to production.",
      approach:
        "The brief was less about a single AGV and more about a fleet-capable platform — so the guiding principle from day one was that the software had to be modular, configurable, and reusable across hardware variants rather than hand-tuned to one chassis.\n\nI architected the full stack around ROS2 as the runtime backbone, with SMACC2 state machines coordinating autonomous, manual and error-recovery modes, and Zenoh handling real-time coordination between vehicles and the fleet layer. Configuration was lifted out of code so that the same stack could be reconfigured for different AGV variants without touching the application logic.\n\nAlongside the robotics stack I defined the team's engineering practice — version control strategy, code review standards, containerised testing and CI/CD — so that the growing codebase stayed reliable as multiple engineers and contractors contributed in parallel.",
      technicalDetails:
        "The stack spanned kernel to cloud. At the embedded layer I customised Linux builds for industrial controller hardware and wrote low-level C++ drivers for motor controllers and sensors over CANOpen, including protocol work against limited vendor documentation. Sensor fusion combined 2D/3D LiDAR, magnetic line sensors and IMU data for accurate localisation and navigation.\n\nHigher up, the motion stack included forward and inverse kinematics, path-following controllers and motion planning; SMACC2 orchestrated the behaviour modes and error-recovery flows. Zenoh provided the real-time communication fabric between vehicles and the fleet coordinator. For the operator side I designed and shipped a ReactJS dashboard in two weeks — real-time fleet status, position, battery and sensor health — to give plant operators visibility into what the fleet was doing.\n\nOn the tooling side I built internal CLI utilities to automate system bring-up and to bridge mechanical CAD outputs into the ROS2 simulation environment, closing the loop between the mechanical team and the software stack.",
      outcome:
        "Delivered an end-to-end production AGV and fleet management system at Toyota SA Manufacturing on an accelerated schedule, with an architecture designed to scale across further assembly lines. In parallel I maintained and upgraded a legacy AGV deployment at a Toyota parts distribution centre, including on-site debugging under production pressure, a full operating system and firmware migration across the deployed fleet, and network infrastructure upgrades to improve fleet communication reliability.\n\nBeyond the deployment itself, I represented the company as its technical face — presenting to senior management at Toyota and demonstrating laser-guided AGV systems at national automotive innovation events attended by Ford, VW and Isuzu — and mentored a junior engineer plus remote contract engineers through the build-out.",
      techStack: [
        "ROS2",
        "SMACC2",
        "Zenoh",
        "C++",
        "Python",
        "CANOpen",
        "Embedded Linux",
        "LiDAR",
        "IMU",
        "Sensor Fusion",
        "ReactJS",
        "Docker",
        "GitHub Actions",
      ],
    },
  },
  {
    slug: "agv-operator-dashboard",
    title: "AGV Operator Dashboard",
    description:
      "Delivered a ReactJS operator dashboard in two weeks for an automotive AGV deployment, displaying real-time position, battery status, sensor health and fault diagnostics. Confidential client work — no detail page or imagery publicly available.",
    tags: ["ReactJS", "Full-Stack", "Real-Time"],
    featured: false,
    confidential: true,
  },
  {
    slug: "nishos",
    title: "NishOS — Personal Productivity System",
    description:
      "A full personal productivity system built on Supabase: tasks, projects, goals, fitness, nutrition, scheduling, and a markdown wiki — all synced to a Next.js app. Deep MCP integration with Claude Code for agentic workflows.",
    tags: ["Next.js", "Supabase", "PostgreSQL", "Full-Stack", "MCP"],
    link: "https://app.nishalangovender.com",
    featured: true,
    interactiveDemoPlanned: true,
  },
  {
    slug: "park-bot",
    title: "Automatic Parking — 4WS Vehicle",
    description:
      "Final-year thesis (Cum Laude): implemented an autonomous parking system for a four-wheel steering vehicle in ROS2/Gazebo with forward and inverse kinematic modelling, LiDAR-SLAM, NAV2 with RPP controller, A* path planning, and AMCL.",
    tags: ["ROS2", "Gazebo", "SLAM", "NAV2", "Python"],
    github: "https://github.com/nishalangovender/park_bot",
    featured: true,
    interactiveDemoPlanned: true,
  },
  {
    slug: "path-following",
    title: "Path Following Control System",
    description:
      "Developed an autonomous path-following system for a differential-drive wagon tracking predefined trajectories using noisy GPS/IMU sensor fusion via Extended Kalman Filter, achieving 325mm per-sample tracking error.",
    tags: ["Python", "EKF", "Control Theory", "Sensor Fusion"],
    featured: true,
    interactiveDemoPlanned: true,
  },
  {
    slug: "pen-plotter",
    title: "Pen Plotter Control System",
    description:
      "Built an automated pen plotter for whiteboard drawing: RP2040 firmware controlling stepper motors and actuator hardware, with a Python GUI for interactive path planning, Bezier curves, and SVG file import.",
    tags: ["C++", "Python", "RP2040", "Embedded"],
    featured: true,
    interactiveDemoPlanned: true,
  },
  {
    slug: "mergens-workshop",
    title: "Mergen's Workshop — Business Website & Invoicing",
    description:
      "Built the public business website and a private invoicing system for a family workshop business. Next.js marketing site with a Supabase-backed invoicing app for quotes, invoices, and client records.",
    tags: ["Next.js", "Supabase", "Full-Stack", "Web"],
    link: "https://mergensworkshop.co.za",
    featured: true,
    interactiveDemoPlanned: true,
  },
  {
    slug: "nishalangovender-com",
    title: "nishalangovender.com — Personal Portfolio",
    description:
      "This site. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion and MDX. Engineering-aesthetic design with blueprint grid, circuit-trace dividers, and a git-graph career timeline.",
    tags: ["Next.js", "React", "Tailwind", "TypeScript", "Web"],
    link: "https://nishalangovender.com",
    featured: false,
  },
  {
    slug: "smartshooter",
    title: "The SmartShooter",
    description:
      "PLC-controlled mechatronic system (ping pong ball launcher) with pneumatics and PID-tuned motion control. Led a team of four through design, build, and test using Siemens TIA.",
    tags: ["PLC", "Siemens TIA", "PID", "Mechatronics"],
    featured: false,
  },
  {
    slug: "multi-functional-light",
    title: "Multi-Functional Light Source",
    description:
      "STM32-controlled multi-functional light source with white LED flashlight/emergency modes and RGB mood lighting. Buttons, slider, and trackpad input with UART communication and a custom PCB in KiCAD.",
    tags: ["STM32", "Embedded", "I2C", "PWM", "KiCAD"],
    featured: false,
  },
  {
    slug: "mellowvans-wheel-hub",
    title: "EV Wheel Hub Optimisation",
    description:
      "Redesigned a wheel hub for MellowVans' electric delivery vehicle, achieving 50.2% mass reduction through FEA and fatigue analysis in Autodesk Inventor for EU compliance.",
    tags: ["CAD", "FEA", "Mechanical Design"],
    featured: false,
  },
  {
    slug: "automation-lab",
    title: "Automation Lab Digital Twin",
    description:
      "Built a CAD digital twin of Stellenbosch University's new automation lab incorporating robot and human models, then assessed machine positioning using VR for safety evaluation.",
    tags: ["Digital Twin", "CAD", "VR", "Industry 4.0"],
    featured: false,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Look up a project by its URL slug. Used by the /projects/[slug] route. */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Featured projects, in grid order. */
export const featuredProjects: Project[] = projects.filter((p) => p.featured);

/**
 * Every unique tag across all projects, for use as filter options on the
 * projects grid page. Order follows first-seen across the `projects` array
 * so flagship tags (Robotics, ROS2, etc.) appear first.
 */
export const allTags: string[] = Array.from(
  new Set(projects.flatMap((p) => p.tags)),
);
