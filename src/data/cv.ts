/**
 * Public profile data rendered on `/cv`.
 *
 * IMPORTANT: This is the **sanitised, public-safe** version of the CV.
 * It deliberately excludes proprietary technical details, specific tooling
 * choices, internal architecture decisions, and anything that would only
 * live in a tailored applied CV. Everything here should be safe for a
 * previous employer to read — content is kept at roughly the same level
 * as LinkedIn and the About page.
 *
 * The full CV (SA / NL / tailored variants) is gated behind the request
 * form on the `/cv` page and sent manually by Nish.
 */

export interface ExperienceEntry {
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  dates: string;
  context: string;
  highlights: string[];
}

export interface EducationEntry {
  institution: string;
  qualification: string;
  location: string;
  dates: string;
  highlights: string[];
}

export interface SkillCategory {
  label: string;
  items: string[];
}

export interface OpenSourceItem {
  title: string;
  description: string;
  href?: string;
}

export interface LanguageEntry {
  name: string;
  level: string;
}

export const profileSummary = `Mechatronics engineer with hands-on experience designing, deploying and maintaining production robotics systems in a fast-paced startup environment. Technical lead across software architecture, embedded systems, controls, DevOps infrastructure and client-facing engagement. Specialising in ROS2 robotics software, low-level C++ embedded interfaces, CI/CD pipelines and control systems. Strengths in systems-level thinking, abstracting complex layers and creatively solving black-box problems under tight deadlines. A fast learner who thrives on picking up unfamiliar technologies, applying them in production and iterating until they work — what matters is not what I already know, but how quickly I can close the gap.`;

export const experience: ExperienceEntry[] = [
  {
    role: "Mechatronics Engineer",
    company: "BATTALION Technologies",
    companyUrl: "https://www.battaliontech.co.za/",
    location: "Pinetown, South Africa",
    dates: "May 2024 – Dec 2025",
    context:
      "Industrial robotics startup delivering AGV (Automated Guided Vehicle) and fleet management systems for automotive manufacturing plants in South Africa. Joined under a senior engineer and progressively took ownership of technical decisions during my first year. After the senior engineer departed, led the company's technical practice for the remaining eight months — responsible for software architecture, embedded systems, controls, DevOps infrastructure, client-facing technical engagement, team development and vendor work.",
    highlights: [
      "Led end-to-end delivery of a production AGV and fleet management system at Toyota SA Manufacturing, with a scalable architecture designed to support further line expansion",
      "Drove technical strategy across system architecture, hardware platform choices, development tooling and project timelines as the company's technical lead",
      "Built the robotics software stack end-to-end — ROS2 architecture, state machine control (autonomous, manual and error-recovery modes), motion planning, path-following controllers and multi-sensor fusion",
      "Developed low-level C++ embedded interfaces and customised embedded Linux builds for industrial controller hardware, bridging hardware and software across the platform",
      "Designed and shipped a ReactJS operator dashboard for real-time AGV status monitoring within two weeks",
      "Defined and rolled out the team's software engineering practice: version control strategy, code review standards, Docker-based testing, CI/CD deployment pipelines and onboarding documentation",
      "Served as technical lead in client engagements with Toyota SA Manufacturing and Toyota Africa Parts Centre, and demonstrated laser-guided AGV systems at national automotive innovation events attended by Ford, VW, Isuzu and S4 Integration",
      "Mentored a junior engineer day-to-day and supported hiring, including candidate evaluation and remote mentoring of contract engineers",
    ],
  },
  {
    role: "Engineering Intern",
    company: "MellowVans",
    companyUrl: "https://www.mellowvans.com/",
    location: "Stellenbosch, South Africa",
    dates: "Nov 2022 – Dec 2022",
    context:
      "Electric vehicle startup designing last-mile EV delivery platforms. Contributed to production scaling and preparing the vehicle for the EU market.",
    highlights: [
      "Designed a mass-reduced wheel hub assembly in Autodesk Inventor using FEA for stress and fatigue life analysis, achieving a 50.2% mass reduction while meeting EU regulation",
      "Validated faulty EV PCB assemblies using oscilloscopes and multimeters; recommended cost-effective component replacements based on lead time and price",
      "Updated and streamlined the company Bill of Materials (BOM), collaborating with production staff and supplier invoices",
      "Participated in a vehicle assembly trial run to validate production scaling and refine build procedures",
    ],
  },
  {
    role: "Research Intern",
    company: "MAD Research Group & Mandela Mining Precinct",
    location: "Stellenbosch, South Africa",
    dates: "Jun 2022 – Jul 2022",
    context:
      "Under the supervision of Dr Karel Kruger (now a Professor at Cambridge University). Mechatronics, Automation and Design research at Stellenbosch University in partnership with a public-private mining innovation programme.",
    highlights: [
      "Researched and evaluated OEM and sensor technologies for the RTIMS (Real-Time Information Management Systems) project, delivering recommendations for applying Industry 4.0 principles to the South African mining sector",
      "Designed a full-scale digital twin of the Automation Lab workspace in Autodesk Inventor, validated via VR walkthrough",
    ],
  },
];

export const education: EducationEntry[] = [
  {
    institution: "Stellenbosch University",
    qualification: "BEng Mechatronics",
    location: "Stellenbosch, South Africa",
    dates: "2019 – 2023",
    highlights: [
      "Senior Merit Award (Top 5% in the Engineering Faculty)",
      "Golden Key Honour Society",
      "7 Dean's Merits",
      "Cum Laude final-year project",
      "Recruitment and ISFAP Bursaries",
    ],
  },
  {
    institution: "Maritzburg College",
    qualification: "National Senior Certificate",
    location: "Pietermaritzburg, South Africa",
    dates: "2014 – 2018",
    highlights: [
      "8 Distinctions (90% aggregate)",
      "Prefect and Head of Academics",
      "Head of Peer Tutoring",
      "Provincial Debating Captain, Vice-Chair of Hindu Society",
      "Academic Scholarship",
    ],
  },
];

/**
 * High-level skill categories. Intentionally coarser than the tailored CV —
 * no specific vendor tools, no named internal frameworks, nothing that could
 * be cross-referenced against production systems.
 */
/**
 * Flat CV-friendly groupings that reconcile with `src/data/skills.ts`.
 * Every item below appears in the Venn on /skills — the CV is just a
 * flatter, recruiter-scannable view of the same skill set.
 */
export const skillCategories: SkillCategory[] = [
  {
    label: "Robotics & Controls",
    items: [
      "ROS2",
      "NAV2",
      "SLAM",
      "SMACC2",
      "Fleet Architecture",
      "Sensor Fusion",
      "Kinematics",
      "Motion & Path Planning",
      "Control Systems (PID, State-Space, MPC, Adaptive)",
      "Path-Following Control",
      "Open-RMF",
      "Zenoh / DDS",
    ],
  },
  {
    label: "Embedded & Firmware",
    items: [
      "C / C++",
      "Embedded Linux",
      "Firmware Development",
      "Device Tree",
      "BSP / Board Bring-Up",
      "Bootloaders / U-Boot",
      "Cross-Compilation Toolchains",
      "Real-Time Linux (PREEMPT_RT)",
      "STM32",
      "ESP32",
      "RP2040",
      "Arduino",
      "RPi / Jetson",
    ],
  },
  {
    label: "Electronics & Hardware",
    items: [
      "CAN Bus / CANOpen",
      "I2C / SPI / UART",
      "Motor Controllers",
      "Steppers / Servos / DC Motors",
      "Encoders",
      "LiDAR / IMU",
      "Sensor Calibration",
      "KiCAD",
      "PCB & Circuit Design",
      "Oscilloscopes / Logic Analysers",
      "Soldering / Rework",
    ],
  },
  {
    label: "Industrial Automation",
    items: [
      "PLCs / Siemens TIA",
      "Safety Systems / E-Stops",
      "Pneumatics",
      "Field Deployment & Commissioning",
    ],
  },
  {
    label: "Software & DevOps",
    items: [
      "Python",
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "PostgreSQL",
      "Supabase",
      "REST API",
      "Testing Frameworks",
      "Git / GitHub",
      "Docker / CI-CD",
      "Linux",
      "Bash / Shell",
    ],
  },
  {
    label: "Simulation, CAD & Mechanical",
    items: [
      "URDF",
      "TF",
      "RViz",
      "Gazebo",
      "Foxglove",
      "MATLAB / Simulink",
      "Digital Twins",
      "CAD (Inventor / Fusion 360)",
      "Mechanical Design",
      "FEA & Fatigue Analysis",
      "3D Printing",
      "Technical Drawing / GD&T",
      "Design for Manufacturing",
      "Bill of Materials (BOM)",
    ],
  },
];

export const courses: string[] = [
  "Laser-Guided AGV Training (2025)",
  "IoT Short Course — Prof. Andrea Vitaletti, Sapienza University (2023)",
];

export const languages: LanguageEntry[] = [
  { name: "English", level: "Native" },
  { name: "Afrikaans", level: "Fluent" },
];

export const openSource: OpenSourceItem[] = [
  {
    title: "NAV2 Contributor",
    description:
      "Contributing to the ROS2 Navigation stack used widely across the robotics community.",
    href: "https://github.com/ros-navigation/navigation2",
  },
  {
    title: "SMACC2 Research Group Member",
    description:
      "Research group member at RobosoftAI / NVIDIA, working on state machine architectures for robotics.",
    href: "https://robosoft.ai/",
  },
];
