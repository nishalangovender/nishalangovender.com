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
  /**
   * When present, the project has a live interactive demo and the card
   * surfaces a link badge pointing here. Overrides the "planned" badge.
   */
  interactiveDemoHref?: string;
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
    caseStudy: {
      problem:
        "Off-the-shelf productivity tools (Notion, Todoist, Apple Notes, a calendar, a gym app, a meal tracker) each solve one slice of life and none of them talk to each other. The same human — me — was fragmented across a dozen apps with no single place to see what mattered, and no way for an AI assistant to reason over the whole picture.\n\nNishOS is the replacement: one Postgres schema modelling tasks, projects, goals, career pipeline, fitness, nutrition, scheduling and a markdown knowledge wiki, with a Next.js frontend and deep MCP integration so Claude Code can read and write the whole system directly.",
      approach:
        "Treat personal data like a real product with a real schema. The PARA framework (Projects / Areas / Resources / Archive) shapes the taxonomy; every domain (career, fitness, nutrition, scheduling, knowledge) is modelled as first-class tables with foreign keys into a shared hierarchy of areas and goals.\n\nThe knowledge layer is a hybrid: local markdown files under `~/nish-os/wiki/` as the LLM's working copy, with a Supabase mirror as the durable system of record. Wikilinks (`[[slug]]`) and entity references (`{{entity_type:name}}`) resolve into a polymorphic knowledge graph via an `entity_links` table, so a note can link to a project, a career application or another note with equal ease.\n\nClaude Code talks to NishOS through the Supabase MCP — every query, schema change and data mutation goes through the same typed interface — which turns routine productivity work into conversational workflows.",
      technicalDetails:
        "Supabase (Postgres, Auth, RLS, Storage) as the backend. Schema spans 30+ tables: areas with self-referential hierarchy, goals → projects → tasks, career_companies → career_applications → career_interviews, time_blocks with Google Calendar sync, workout_sessions / workout_sets / personal_records, nutrition_entries / nutrition_targets, notes / resources / entity_links / ingestion_log. Every table has RLS enforcing user_id scoping, and most carry tsvector columns for full-text search.\n\nFrontend is Next.js 15 (App Router) with server components for read views and client components for interactive editors. TanStack Query handles data fetching and optimistic updates; tailwind for styling; Framer Motion for transitions. Weekly templates auto-populate time blocks; workout sessions roll up into personal records automatically; nutrition entries link back to the time block they were logged against.\n\nThe MCP layer exposes the entire database to Claude Code — ingest workflows write a markdown file locally, upsert a `notes` row, and create `entity_links` for every wikilink in a single session. An append-only `ingestion_log` table keeps a chronological record of every AI-driven operation.",
      outcome:
        "Live at app.nishalangovender.com and replacing Notion, Apple Notes, Capacities and Obsidian as the canonical system. Handles day-to-day task management, weekly reviews, the entire Netherlands/Germany job-search pipeline, workout logging, nutrition tracking and a growing personal knowledge wiki — all with a single AI assistant fluent in every domain.\n\nA sanitised interactive demo is planned for Milestone 5 so visitors to this portfolio can click through the task/project/goal hierarchy, the weekly planner and the knowledge wiki without needing a login.",
      techStack: [
        "Next.js 15",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Supabase",
        "PostgreSQL",
        "Row-Level Security",
        "MCP",
        "Claude Code",
        "TanStack Query",
        "Framer Motion",
        "Vercel",
      ],
    },
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
    caseStudy: {
      problem:
        "Conventional autonomous parking research focuses almost entirely on Ackermann-steered passenger cars. Four-wheel steering (4WS) platforms have a fundamentally different kinematic envelope — they can crab sideways, pivot on the spot and cover parking manoeuvres that a two-wheel-steered car physically cannot — but there was very little open-source work showing how to drive one through the full autonomy stack.\n\nFor my final-year Mechatronics thesis at Stellenbosch University I set out to close that gap: model a 4WS vehicle, simulate it inside the ROS2 / Gazebo stack, and make it autonomously park into a target spot using standard robotics building blocks (SLAM, a costmap, a path planner and a path-following controller).",
      approach:
        "I built the project bottom-up in ROS2 so that every layer could be swapped or tuned in isolation. Starting from the vehicle itself — forward and inverse kinematics for a 4WS platform — then a URDF and Gazebo model, then the perception and planning stack on top.\n\nThe autonomy stack is standard ROS2: LiDAR-based SLAM to build and localise against a map of the parking environment, AMCL for on-line localisation, A* as the global planner, NAV2's Regulated Pure Pursuit (RPP) controller for path following, and a mission layer that sequences approach, manoeuvre and final alignment. 4WS-specific behaviours — crab steering, in-place rotation — are exposed as primitives that the mission layer can call when the standard path doesn't fit the envelope.",
      technicalDetails:
        "Modelled the 4WS vehicle with both forward kinematics (wheel angles + speeds → body velocity) and inverse kinematics (desired body twist → per-wheel commands), with the two front and two rear steering angles treated as independent inputs. The model supports the three canonical 4WS modes: conventional, crab and counter-steer.\n\nThe ROS2 graph runs sensor ingest (2D LiDAR, odometry), a slam_toolbox node producing a 2D occupancy grid, AMCL against that map, the NAV2 stack (costmap_2d, A* planner, RPP controller) and a custom mission node that picks between standard NAV2 goals and 4WS primitives based on the target pose relative to the vehicle. Gazebo provides the physics, sensors and world; RViz visualises the live plan, costmap, and trajectory.\n\nCode and launch files are open-sourced on GitHub with a minimal reproduction path — clone, build the workspace, and a single launch file brings the simulator, map, localisation and planner up together.",
      outcome:
        "The thesis was awarded Cum Laude. The final system parks a simulated 4WS vehicle into pre-defined parking spots using a mix of NAV2-driven trajectories and 4WS-native manoeuvres, with live visualisation of the plan, costmap and vehicle pose in RViz.\n\nJust as importantly, it became the project where I got fluent in the ROS2 / NAV2 stack — which directly set up the production robotics work I took on straight afterwards at BATTALION Technologies. An improved version with a before/after comparison is planned as the interactive demo for Milestone 5.",
      techStack: [
        "ROS2",
        "Gazebo",
        "RViz",
        "Python",
        "C++",
        "NAV2",
        "SLAM Toolbox",
        "AMCL",
        "A* Planner",
        "Regulated Pure Pursuit",
        "URDF",
      ],
    },
  },
  {
    slug: "path-following",
    title: "Path Following Control System",
    description:
      "Developed an autonomous path-following system for a differential-drive wagon tracking predefined trajectories using noisy GPS/IMU sensor fusion via Extended Kalman Filter, achieving 325mm per-sample tracking error.",
    tags: ["Python", "EKF", "Control Theory", "Sensor Fusion"],
    featured: true,
    interactiveDemoPlanned: true,
    interactiveDemoHref: "/projects/path-following/demo",
    caseStudy: {
      problem:
        "Make a differential-drive wagon autonomously track a parametric reference trajectory within a fixed time budget, using only noisy GPS (1 Hz) and IMU (20 Hz) as sensors. The GPS alone is too low-rate and too noisy to drive a controller; the IMU alone drifts; and the reference path varies sharply in curvature, so any controller tuned for straight-line tracking falls apart on the tight sections.",
      approach:
        "Layered the problem into four clean stages: sensor fusion, path following, motor control, and kinematics. Each stage has a single responsibility and can be tuned, swapped or unit-tested on its own — which made it possible to characterise the system's failure modes precisely rather than just tweaking gains until it looked right.\n\nState estimation uses an Extended Kalman Filter with a 5-state vector [pₓ, pᵧ, θ, v, gyro_bias], fusing the two sensor streams and estimating the gyro bias online. Path following is Pure Pursuit with a velocity-adaptive lookahead; motor control is a PI loop with anti-windup; kinematics is standard differential drive.",
      technicalDetails:
        "The EKF adapts its own trust in each sensor based on path curvature — scaling heading uncertainty up ~8× through high-curvature sections so the filter trusts GPS position fixes more than the drifting gyro estimate. Mahalanobis outlier rejection drops obviously-bad GPS updates, with its threshold also scaled by curvature (2.5× at κ = 1.0 rad/m) to stay tolerant during hard turns.\n\nThe Pure Pursuit lookahead is L = 0.9|v| + 0.3, clamped to [0.5 m, 2.0 m] — long lookahead at speed for smoothness, short lookahead at low speed for tight tracking. A time-parameterised reference trajectory (Lemniscate of Gerono) guarantees mission completion within the 20-second budget. The inner loop runs velocity and angular-velocity PI control with integral anti-windup clamped at ±0.5.\n\nTo validate the system I built a statistical test harness: 98 automated runs across randomised sensor noise, with full per-run metrics (tracking error, completion time, outlier counts) and a parameter sweep framework for gain tuning.",
      outcome:
        "Mean tracking error of 6.53 m ± 2.2 m L2 over 98 runs, with 94.9% of runs under 10 m and 0% failure rate. Best single run was 3.69 m — close to the theoretical lower bound given GPS noise of ±0.5 m. Per-sample tracking error landed around 325 mm.\n\nThe layered structure and the test harness are also what make this the most interesting project to open source — each layer is swappable, which is exactly the playground the Milestone 5 interactive demo is built around (pick a controller, dial the noise, choose a path, watch the trajectory).",
      techStack: [
        "Python",
        "NumPy",
        "SciPy",
        "Matplotlib",
        "Pandas",
        "EKF",
        "Pure Pursuit",
        "PI Control",
        "WebSocket",
      ],
    },
  },
  {
    slug: "pen-plotter",
    title: "Pen Plotter Control System",
    description:
      "Built an automated pen plotter for whiteboard drawing: RP2040 firmware controlling stepper motors and actuator hardware, with a Python GUI for interactive path planning, Bezier curves, and SVG file import.",
    tags: ["C++", "Python", "RP2040", "Embedded"],
    featured: true,
    interactiveDemoPlanned: true,
    interactiveDemoHref: "/projects/pen-plotter/demo",
    caseStudy: {
      problem:
        "Two-day take-home technical challenge: bring up a custom pen-plotter from bare hardware to something you can draw arbitrary shapes on. The hardware is a polar plotter — an RP2040 driving a rotating arm via a high-reduction stepper, and a linear actuator extending a pen along that arm — so every Cartesian point the user wants has to be converted into a (θ, r) pair and tracked accurately against ADC feedback.\n\nThe challenge was explicitly end-to-end: firmware, kinematics, a user-facing tool, and a calibration procedure, all delivered within the 48-hour window.",
      approach:
        "Split the system cleanly across the USB boundary. The RP2040 owns the hardware — stepper driver, ADC, pen actuator, closed-loop position control — and speaks a small command/response serial protocol (HOME, ROTATE <steps>, LINEAR <adc_target>, GET_POS). Everything above that lives in Python: kinematics, path planning, a matplotlib-based GUI with a click-to-draw interface, and a calibration routine.\n\nThat split meant the firmware stayed deterministic and easy to debug in isolation, while the application layer could iterate quickly on features (Bezier curves, SVG import, live plot) without reflashing the board.",
      technicalDetails:
        "Firmware runs on the RP2040 with a TMC5160 stepper driver over SPI, an ADS1015 ADC for actuator feedback, and a PCA9685 PWM driver for the pen. Motor resolution is 200 steps × 256 microsteps × a 20:1 gearbox — just over one million microsteps per revolution, which is what the θ-axis precision rides on. The linear axis uses closed-loop ADC control (0–834 counts over ~300 mm travel) with ±10 count tolerance and a 20-second safety timeout.\n\nOn the Python side, the kinematics layer converts (x, y) to (θ, r) via θ = atan2(y, x), r = √(x² + y²), interpolates along each segment at a configurable step size, and streams commands to the board. The GUI validates points against the workspace envelope before sending, shows a live plot of the arm position as commands execute, and supports Bezier and SVG inputs for more than just straight lines.",
      outcome:
        "Delivered a working end-to-end system within the 2-day window. Calibrated tracking tolerance landed at ±10 ADC counts — roughly ±3.6 mm on the linear axis — with sub-millimetre repeatability on rectangular test patterns. The live actuator visualisation made it obvious when a command had completed vs. when the hardware was still moving, which tightened the feedback loop during iteration.\n\nThe codebase is also the cleanest candidate in the portfolio for an in-browser simulation: the firmware's command protocol is small enough to reimplement in JavaScript and drive a visual RP2040 mock, which is the Milestone 5 interactive demo.",
      techStack: [
        "Arduino / RP2040",
        "C++",
        "Python 3",
        "matplotlib",
        "pyserial",
        "NumPy",
        "TMC5160",
        "ADS1015",
        "PCA9685",
      ],
    },
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
    caseStudy: {
      problem:
        "A 20+ year family workshop business was running on handwritten invoices, scattered client records, and ad-hoc WhatsApp messages. Every quote, invoice and service reminder was manual, and there was no single place to look up what a given vehicle had previously had done to it.\n\nThe brief was to replace all of that with a single system that did two jobs well: a public marketing site that made the business look as serious online as it is in person, and a private invoicing app that the owner could actually enjoy using day-to-day.",
      approach:
        "Built two coupled deliverables on one stack. The public marketing site is a Next.js App Router build optimised for local search and mobile — services, contact, opening hours, simple to maintain. The invoicing app is a separate authenticated area on the same domain, backed by Supabase (Postgres + auth + row-level security), with a dashboard for clients, vehicles, invoices and the service catalogue.\n\nEverything that would historically have been a WhatsApp message — quote requests, service reminders, payment follow-ups — flows through structured records, so the owner gets a real history per client and per vehicle instead of a chat scrollback.",
      technicalDetails:
        "Next.js 15 (App Router) frontend with server components for the marketing pages and client components only where interactivity is needed (the admin dashboard, forms). Tailwind for styling, light/dark theme. Supabase handles auth, data and storage; Postgres schema covers clients, vehicles (with full service history), invoices, line items and the service catalogue, with RLS policies gating access to the owner's account.\n\nInvoice rendering is PDF-on-demand from the structured records, which means the same data drives the dashboard, the emailed invoice and the client's history view. Payment integration is scoped through PayFast (South African gateway). Deployed on Vercel with preview environments per branch.",
      outcome:
        "Live in production at mergensworkshop.co.za and actively used by the business. The owner has a real system of record instead of paper trails, vehicle history is one click away during a service, and invoicing that used to be a chore is now a couple of clicks.\n\nThe app is behind login, so an interactive mock of both the owner and client views is planned as the Milestone 5 demo — so visitors to this site can click through a sanitised version of the dashboard without credentials.",
      techStack: [
        "Next.js 15",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Supabase",
        "PostgreSQL",
        "Row-Level Security",
        "Vercel",
        "PayFast",
      ],
    },
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
    caseStudy: {
      problem:
        "Third-year Mechatronics design project: conceive, build and demonstrate a full mechatronic system from scratch, as a team of four, inside a single semester. We chose a ping-pong ball launcher — simple on the surface, but it forced us to integrate actuation, sensing, motion control, PLC logic and a user interface into one working machine.",
      approach:
        "Led the team as project lead — splitting the work into mechanical, pneumatic, electrical and software streams and keeping the integration plan tight. The control architecture is a Siemens S7 PLC (programmed in TIA Portal) orchestrating pneumatic feeding and release, a motor-driven launching mechanism with PID-tuned motion control, and an HMI for operator control.\n\nThe PLC decomposes into clean states (idle, arming, aiming, launching, reset) with interlocks between pneumatics and motion so the hardware can't hurt itself or anyone near it.",
      technicalDetails:
        "Siemens S7 PLC programmed in Ladder / Structured Text via TIA Portal, driving pneumatic cylinders for ball feed and release and a motor-driven launcher whose velocity is closed-loop PID-controlled against a tuned setpoint. Discrete I/O for sensors and E-stops; analogue I/O for the motor loop. HMI screens for setup, jog, and automatic modes.\n\nTuning the PID was the bulk of the software effort — the launcher had to hit a repeatable exit velocity, which meant characterising the plant, tuning gains empirically, and adding safety limits on the setpoint so nothing could over-speed on a bad command.",
      outcome:
        "Delivered a working, demonstrable machine at end-of-semester: reliable feed, repeatable launch, safe operator interface. The lasting takeaways were less about ping-pong balls and more about leading a small multi-disciplinary team through a real mechatronic integration — which is exactly what the later AGV work scaled up.",
      techStack: [
        "Siemens S7 PLC",
        "TIA Portal",
        "Ladder Logic",
        "Structured Text",
        "Pneumatics",
        "PID Control",
        "HMI",
      ],
    },
  },
  {
    slug: "multi-functional-light",
    title: "Multi-Functional Light Source",
    description:
      "STM32-controlled multi-functional light source with white LED flashlight/emergency modes and RGB mood lighting. Buttons, slider, and trackpad input with UART communication and a custom PCB in KiCAD.",
    tags: ["STM32", "Embedded", "I2C", "PWM", "KiCAD"],
    featured: false,
    caseStudy: {
      problem:
        "Second-year embedded systems project: design, build and program a useful consumer-style device end-to-end. Goal wasn't just to get an LED blinking on a devkit — it was to take a full product from schematic to PCB to firmware, with a real user interface and multiple operating modes.",
      approach:
        "Designed a multi-mode lamp: a white-LED flashlight and emergency-strobe mode for utility, plus an RGB channel for mood lighting. Interaction uses three input modalities — tactile buttons for mode switching, a slider for brightness, and a capacitive trackpad for colour selection in RGB mode — all feeding into an STM32 acting as the brain.\n\nThe whole thing runs on a custom PCB designed in KiCAD so the project covered schematic capture, layout, manufacture and bring-up — not just software.",
      technicalDetails:
        "STM32 microcontroller reading buttons (GPIO), slider (ADC) and trackpad (I2C) on its input side; driving RGB and white LED channels via PWM on its output side; and speaking UART to a host for debug and command input. Custom two-layer PCB designed in KiCAD with power regulation, LED current-limiting, decoupling and header breakouts for reprogramming.\n\nFirmware written in C against the STM32 HAL. State machine manages mode transitions; PWM duty cycles drive brightness and colour; I2C polling reads the trackpad; UART commands provide a serial console for testing.",
      outcome:
        "Hand-assembled the PCB, flashed and debugged the firmware, and demonstrated all three modes (flashlight, emergency, RGB mood) working from the same hardware. The project was the first time I had sole ownership of a PCB from schematic to solder joint — the workflow carries through to the embedded Linux board-bring-up work I did later at BATTALION.",
      techStack: [
        "STM32",
        "C",
        "STM32 HAL",
        "KiCAD",
        "I2C",
        "PWM",
        "UART",
        "ADC",
        "PCB Design",
      ],
    },
  },
  {
    slug: "mellowvans-wheel-hub",
    title: "EV Wheel Hub Optimisation",
    description:
      "Redesigned a wheel hub for MellowVans' electric delivery vehicle, achieving 50.2% mass reduction through FEA and fatigue analysis in Autodesk Inventor for EU compliance.",
    tags: ["CAD", "FEA", "Mechanical Design"],
    featured: false,
    caseStudy: {
      problem:
        "MellowVans, a South African EV startup, was preparing their last-mile delivery platform for the EU market. The existing wheel hub was over-specced for the new regulatory envelope — overweight meant worse range, higher cost, and regulatory friction. The brief during my internship was to redesign the hub for significant mass reduction while still passing stress and fatigue requirements.",
      approach:
        "Treated the redesign as a constrained optimisation rather than a blank-sheet exercise. Kept the hub's mounting interfaces fixed so the part dropped into the existing assembly, then iterated the geometry — pocketing, rib placement, wall thicknesses — with FEA feedback after each revision.\n\nEvery iteration ran static stress and fatigue-life analyses in Autodesk Inventor against the EU-mandated load cases, so the design converged on the lightest geometry that still met the margin.",
      technicalDetails:
        "CAD and simulation in Autodesk Inventor. Static FEA under the EU load cases to confirm peak stress stayed within yield margins; fatigue analysis to confirm life under cyclic loading; mesh refinement around stress concentrators (fillets, bolt holes) to make sure the numbers were real and not artefacts.\n\nAlongside the hub work I was running circuit validation on the vehicle's fuse boxes with a multimeter and oscilloscope in KiCAD schematics, and rebuilding the company's BOM in Excel against supplier invoices.",
      outcome:
        "Final hub design achieved a **50.2% mass reduction** from the original while meeting all EU stress and fatigue requirements. The redesigned part dropped straight into the existing vehicle assembly — no downstream rework. I also participated in a full-vehicle assembly trial that fed insights back into the scaled production SOPs.",
      techStack: [
        "Autodesk Inventor",
        "FEA",
        "Fatigue Analysis",
        "KiCAD",
        "Excel / BOM",
      ],
    },
  },
  {
    slug: "automation-lab",
    title: "Automation Lab Digital Twin",
    description:
      "Built a CAD digital twin of Stellenbosch University's new automation lab incorporating robot and human models, then assessed machine positioning using VR for safety evaluation.",
    tags: ["Digital Twin", "CAD", "VR", "Industry 4.0"],
    featured: false,
    caseStudy: {
      problem:
        "Stellenbosch University's Mechanical and Mechatronic Engineering Department was kitting out a new Automation Lab and wanted to validate the layout — robot arms, human workstations, safety envelopes — before committing to physical installation. Rearranging industrial robots after the fact is expensive; checking the same decisions in a digital twin is cheap.\n\nThe secondary brief was around Industry 4.0 sensor research for the RTIMS (Real-Time Information Management Systems) project at the Mandela Mining Precinct, under Dr Karel Kruger (now Professor at Cambridge).",
      approach:
        "Modelled the full lab in Autodesk Inventor at true scale — room, fixtures, robot arms, tables and human reference figures — then exported into a VR environment so a person could walk through the proposed layout and evaluate reachability, safety envelopes and workflow at eye level. Much cheaper than moving a six-axis arm across a room.\n\nIn parallel, compiled and delivered an OEM/sensor technology evaluation report for RTIMS, surveying industrial sensors relevant to mining and recommending how to apply Industry 4.0 principles to the local sector.",
      technicalDetails:
        "Full-scale 3D CAD in Autodesk Inventor covering the lab geometry, robotic arms and human figures. Assembly constraints modelled the real installation so robot reach envelopes could be checked against workstations and walkways.\n\nThe Inventor model was exported to a VR walkthrough so safety assessment happened in first-person rather than on a screen — the user stood next to each machine in the virtual space and confirmed (or flagged) sight-lines, reach, and clearance.",
      outcome:
        "Delivered a validated digital twin that the department used to finalise the lab layout before physical installation, plus a written Industry 4.0 sensor report recommending OEM technologies for the mining-sector RTIMS project. Also assisted a master's student's experimental work during the same internship.\n\nWorking under Dr Kruger on this project was my first exposure to applied robotics research — a through-line that eventually led to contributing to NAV2 and joining the SMACC2 research group.",
      techStack: [
        "Autodesk Inventor",
        "CAD",
        "Digital Twin",
        "VR",
        "Industry 4.0",
      ],
    },
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
