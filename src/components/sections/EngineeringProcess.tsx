"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ─── Engineering Process ────────────────────────────────────────────────────
// Auto-cycling hero-style section with large wire-art SVG icons,
// two-column layout (text left, icon right), and horizontal progress track.

const PHASE_DURATION = 4500; // ms per phase

const phases = [
  {
    number: "01",
    label: "DEFINE",
    title: "Understand the Problem",
    description:
      "Walk the shop floor, sit down with stakeholders, and unpack the brief. Every project starts with scoping the constraints, assessing feasibility, and defining what success looks like.",
    icon: PhaseDefine,
  },
  {
    number: "02",
    label: "DESIGN",
    title: "Architect the Solution",
    description:
      "Start with a blank page and map the system — black boxes, interfaces, data flows. Modular and scalable from day one, whether it's an embedded controller or a web platform.",
    icon: PhaseDesign,
  },
  {
    number: "03",
    label: "DEVELOP",
    title: "Build the Software",
    description:
      "Write clean, testable code across the stack — from low-level C++ and ROS2 nodes to Python services and React front-ends. Every module documented and ready to integrate.",
    icon: PhaseDevelop,
  },
  {
    number: "04",
    label: "INTEGRATE",
    title: "Wire It All Together",
    description:
      "Connect every layer — CAN buses to cloud dashboards, sensor pipelines to state machines, APIs to front-ends. Calibrate, validate, and make sure nothing falls through the gaps.",
    icon: PhaseIntegrate,
  },
  {
    number: "05",
    label: "DEPLOY",
    title: "Ship to Production",
    description:
      "Prove it works as a prototype, then harden it for production. Fleet management, CI/CD pipelines, monitoring, and fail-safes — built to run reliably at scale.",
    icon: PhaseDeploy,
  },
];

// ─── Wire-art phase icons (SVG, 200×200 viewBox) ───────────────────────────

function PhaseDefine() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
      {/* Magnifying glass */}
      <circle
        cx="85"
        cy="85"
        r="45"
        stroke="var(--color-foreground)"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <line
        x1="118"
        y1="118"
        x2="165"
        y2="165"
        stroke="var(--color-foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Question mark */}
      <path
        d="M 72 70 C 72 55, 98 55, 98 70 C 98 80, 85 80, 85 90"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="85" cy="102" r="2" fill="var(--color-accent)" />
      {/* Constraint boundary lines */}
      <path
        d="M 10 30 L 40 30"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.3"
        strokeDasharray="4 4"
      />
      <path
        d="M 10 170 L 40 170"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.3"
        strokeDasharray="4 4"
      />
      <path
        d="M 160 30 L 190 30"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.3"
        strokeDasharray="4 4"
      />
      <path
        d="M 160 170 L 190 170"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.3"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

function PhaseDesign() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
      {/* ── Diff-drive robot kinematic diagram ── */}

      {/* Chassis — top-down rounded rectangle */}
      <rect
        x="65"
        y="55"
        width="70"
        height="95"
        rx="8"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />

      {/* Left wheel */}
      <rect
        x="48"
        y="73"
        width="12"
        height="34"
        rx="3"
        stroke="var(--color-accent)"
        strokeWidth="1.3"
        fill="none"
        opacity="0.7"
      />
      {/* Right wheel */}
      <rect
        x="140"
        y="73"
        width="12"
        height="34"
        rx="3"
        stroke="var(--color-accent)"
        strokeWidth="1.3"
        fill="none"
        opacity="0.7"
      />

      {/* Axle line through wheels */}
      <line
        x1="60"
        y1="90"
        x2="140"
        y2="90"
        stroke="var(--color-foreground)"
        strokeWidth="0.6"
        opacity="0.3"
        strokeDasharray="3 3"
      />

      {/* Centre point */}
      <circle
        cx="100"
        cy="90"
        r="2.5"
        fill="var(--color-accent)"
        opacity="0.5"
      />

      {/* Caster wheel at rear */}
      <circle
        cx="100"
        cy="138"
        r="5"
        stroke="var(--color-foreground)"
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx="100" cy="138" r="1.5" fill="var(--color-foreground)" opacity="0.35" />

      {/* Left wheel velocity arrow (vL — shorter) */}
      <line
        x1="54"
        y1="70"
        x2="54"
        y2="45"
        stroke="var(--color-accent)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <polygon
        points="54,38 49,48 59,48"
        fill="var(--color-accent)"
        opacity="0.7"
      />
      <text
        x="32"
        y="46"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-accent)"
        opacity="0.6"
      >
        vL
      </text>

      {/* Right wheel velocity arrow (vR — taller, differential turning) */}
      <line
        x1="146"
        y1="70"
        x2="146"
        y2="30"
        stroke="var(--color-accent)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <polygon
        points="146,23 141,33 151,33"
        fill="var(--color-accent)"
        opacity="0.7"
      />
      <text
        x="153"
        y="38"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-accent)"
        opacity="0.6"
      >
        vR
      </text>

      {/* Turning radius — dashed line from centre to ICC */}
      <line
        x1="100"
        y1="90"
        x2="25"
        y2="90"
        stroke="var(--color-foreground)"
        strokeWidth="0.7"
        opacity="0.3"
        strokeDasharray="4 3"
      />
      {/* ICC point */}
      <circle
        cx="25"
        cy="90"
        r="2.5"
        stroke="var(--color-foreground)"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
      />
      <text
        x="12"
        y="85"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.4"
      >
        ICC
      </text>

      {/* Wheel-base dimension line with proper end ticks */}
      <line x1="54" y1="165" x2="54" y2="175" stroke="var(--color-foreground)" strokeWidth="0.7" opacity="0.35" />
      <line x1="146" y1="165" x2="146" y2="175" stroke="var(--color-foreground)" strokeWidth="0.7" opacity="0.35" />
      <line x1="54" y1="170" x2="146" y2="170" stroke="var(--color-foreground)" strokeWidth="0.7" opacity="0.35" />
      {/* Arrowhead left */}
      <polygon points="54,170 60,167.5 60,172.5" fill="var(--color-foreground)" opacity="0.35" />
      {/* Arrowhead right */}
      <polygon points="146,170 140,167.5 140,172.5" fill="var(--color-foreground)" opacity="0.35" />
      <text
        x="100"
        y="183"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.4"
        textAnchor="middle"
      >
        L
      </text>

      {/* Heading direction — dashed arrow forward from chassis top */}
      <line
        x1="100"
        y1="55"
        x2="100"
        y2="15"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.35"
        strokeDasharray="3 2"
      />
      <polygon points="100,12 96,20 104,20" fill="var(--color-foreground)" opacity="0.35" />
      <text
        x="108"
        y="16"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.4"
      >
        &#x3B8;
      </text>

      {/* Angular velocity — arc from -45° to 45° outside chassis right, centred on wheelbase (100,90) r=90 */}
      <path
        d="M 164 154 A 90 90 0 0 0 164 26"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.35"
        fill="none"
      />
      {/* Arrowhead at 45° end, pointing up-left (counterclockwise) */}
      <polygon points="158,20 166,22 162,30" fill="var(--color-foreground)" opacity="0.35" />
      <text
        x="175"
        y="93"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-foreground)"
        opacity="0.4"
      >
        &#x3C9;
      </text>
    </svg>
  );
}

function PhaseDevelop() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
      {/* Terminal window */}
      <rect
        x="20"
        y="25"
        width="160"
        height="150"
        rx="6"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        opacity="0.5"
      />
      <line
        x1="20"
        y1="45"
        x2="180"
        y2="45"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.35"
      />
      {/* Window dots */}
      <circle cx="34" cy="35" r="3" fill="#FF5F57" opacity="0.65" />
      <circle cx="46" cy="35" r="3" fill="#FEBC2E" opacity="0.65" />
      <circle cx="58" cy="35" r="3" fill="#28C840" opacity="0.65" />
      {/* Title bar text */}
      <text
        x="100"
        y="38"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.35"
        textAnchor="middle"
      >
        ~/dev/project
      </text>
      {/* Line 1: $ prompt with command */}
      <text
        x="35"
        y="65"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill="var(--color-accent)"
        opacity="0.7"
      >
        $
      </text>
      <line
        x1="45"
        y1="62"
        x2="95"
        y2="62"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Line 2: output */}
      <line
        x1="35"
        y1="78"
        x2="120"
        y2="78"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Line 3: output */}
      <line
        x1="35"
        y1="90"
        x2="100"
        y2="90"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Line 4: chevron prompt > with indented code */}
      <text
        x="35"
        y="107"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fill="var(--color-accent)"
        opacity="0.6"
      >
        &#x203A;
      </text>
      <line
        x1="45"
        y1="104"
        x2="130"
        y2="104"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Line 5: another $ command */}
      <text
        x="35"
        y="121"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill="var(--color-accent)"
        opacity="0.7"
      >
        $
      </text>
      <line
        x1="45"
        y1="118"
        x2="85"
        y2="118"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Line 6: [OK] status */}
      <text
        x="35"
        y="135"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="#28C840"
        opacity="0.5"
      >
        [OK]
      </text>
      <line
        x1="60"
        y1="132"
        x2="110"
        y2="132"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Line 7: active prompt with cursor */}
      <text
        x="35"
        y="151"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill="var(--color-accent)"
        opacity="0.7"
      >
        $
      </text>
      <rect
        x="46"
        y="144"
        width="2"
        height="10"
        fill="var(--color-accent)"
        opacity="0.6"
      />
    </svg>
  );
}

function PhaseIntegrate() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
      {/* Circuit traces — horizontal bus, stretched wider */}
      <path
        d="M 5 100 L 35 100 L 50 55 L 150 55 L 165 100 L 195 100"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M 5 140 L 30 140 L 48 100 L 65 100"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M 135 100 L 152 140 L 195 140"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Vertical traces to connectors */}
      <path
        d="M 100 20 L 100 58"
        stroke="var(--color-foreground)"
        strokeWidth="1"
        opacity="0.35"
      />
      <path
        d="M 100 142 L 100 178"
        stroke="var(--color-foreground)"
        strokeWidth="1"
        opacity="0.35"
      />
      {/* IPC module — larger rectangle */}
      <rect
        x="50"
        y="60"
        width="100"
        height="80"
        rx="5"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Pin headers — top */}
      {[65, 80, 100, 120, 135].map((x) => (
        <g key={x}>
          <line
            x1={x}
            y1="60"
            x2={x}
            y2="45"
            stroke="var(--color-accent)"
            strokeWidth="1"
          />
          <line
            x1={x}
            y1="140"
            x2={x}
            y2="155"
            stroke="var(--color-accent)"
            strokeWidth="1"
          />
        </g>
      ))}
      {/* Side pins — left */}
      {[75, 88, 100, 112, 125].map((y) => (
        <line
          key={`l${y}`}
          x1="50"
          y1={y}
          x2="35"
          y2={y}
          stroke="var(--color-accent)"
          strokeWidth="1"
        />
      ))}
      {/* Side pins — right */}
      {[75, 88, 100, 112, 125].map((y) => (
        <line
          key={`r${y}`}
          x1="150"
          y1={y}
          x2="165"
          y2={y}
          stroke="var(--color-accent)"
          strokeWidth="1"
        />
      ))}
      {/* Module label */}
      <text
        x="100"
        y="96"
        fontFamily="var(--font-mono)"
        fontSize="16"
        fill="var(--color-accent)"
        opacity="0.7"
        textAnchor="middle"
      >
        IPC
      </text>
      {/* Sub-label */}
      <text
        x="100"
        y="116"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-accent)"
        opacity="0.4"
        textAnchor="middle"
      >
        INDUSTRIAL
      </text>
      {/* Solder / junction points */}
      <circle
        cx="35"
        cy="100"
        r="4"
        stroke="var(--color-accent)"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      <circle
        cx="165"
        cy="100"
        r="4"
        stroke="var(--color-accent)"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      {/* Bus labels */}
      <text
        x="5"
        y="95"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-foreground)"
        opacity="0.4"
      >
        CAN
      </text>
      <text
        x="175"
        y="95"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-foreground)"
        opacity="0.4"
      >
        ETH
      </text>
      {/* Power indicator top */}
      <text
        x="100"
        y="15"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.3"
        textAnchor="middle"
      >
        24V DC
      </text>
      {/* IO indicator bottom */}
      <text
        x="100"
        y="190"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.3"
        textAnchor="middle"
      >
        DI/DO
      </text>
    </svg>
  );
}

function PhaseDeploy() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
      {/* Floor grid (background, behind AGVs) */}
      {[165, 175, 185, 195].map((y) => (
        <line
          key={y}
          x1="10"
          y1={y}
          x2="190"
          y2={y}
          stroke="var(--color-foreground)"
          strokeWidth="0.3"
          opacity="0.15"
        />
      ))}
      {/* Status: LIVE */}
      <circle
        cx="185"
        cy="30"
        r="5"
        stroke="#28C840"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      <circle cx="185" cy="30" r="2" fill="#28C840" opacity="0.6" />
      <text
        x="149"
        y="33"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="#28C840"
        opacity="0.5"
      >
        LIVE
      </text>
      {/* Fleet of AGVs - top view, centred vertically */}
      {[
        { x: 30, y: 75 },
        { x: 100, y: 55 },
        { x: 170, y: 80 },
        { x: 50, y: 140 },
        { x: 140, y: 150 },
      ].map((pos, i) => (
        <g key={i}>
          <rect
            x={pos.x - 16}
            y={pos.y - 12}
            width="32"
            height="24"
            rx="4"
            stroke={i < 3 ? "var(--color-accent)" : "currentColor"}
            strokeWidth="1.2"
            fill="none"
            opacity={i < 3 ? 0.7 : 0.4}
          />
          {/* Antenna */}
          <line
            x1={pos.x}
            y1={pos.y - 12}
            x2={pos.x}
            y2={pos.y - 20}
            stroke={i < 3 ? "var(--color-accent)" : "currentColor"}
            strokeWidth="1"
            opacity={i < 3 ? 0.6 : 0.35}
          />
          {/* Wheels */}
          <rect
            x={pos.x - 18}
            y={pos.y - 6}
            width="4"
            height="8"
            rx="1"
            stroke={i < 3 ? "var(--color-accent)" : "currentColor"}
            strokeWidth="0.6"
            fill="none"
            opacity={i < 3 ? 0.4 : 0.3}
          />
          <rect
            x={pos.x + 14}
            y={pos.y - 6}
            width="4"
            height="8"
            rx="1"
            stroke={i < 3 ? "var(--color-accent)" : "currentColor"}
            strokeWidth="0.6"
            fill="none"
            opacity={i < 3 ? 0.4 : 0.3}
          />
        </g>
      ))}
      {/* Network mesh */}
      <path
        d="M 30 75 L 100 55 L 170 80 M 100 55 L 50 140 L 140 150 L 170 80"
        stroke="var(--color-accent)"
        strokeWidth="0.5"
        strokeDasharray="4 4"
        opacity="0.35"
      />
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function EngineeringProcess() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(Date.now());

  // Smooth rAF-based progress + auto-advance
  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / PHASE_DURATION, 1);
      setProgress(p);

      if (p >= 1) {
        setActiveIndex((prev) => (prev + 1) % phases.length);
        startTimeRef.current = Date.now();
        setProgress(0);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const activePhase = phases[activeIndex];
  const Icon = activePhase.icon;

  return (
    <section className="relative py-24 px-4 flex items-center justify-center overflow-hidden blueprint-grid">
      {/* Background accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 65% 50%, rgba(0, 102, 255, 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl w-full">
        {/* Section header */}
        <div className="mb-12">
          <p className="font-mono text-sm text-accent tracking-wider uppercase mb-2">
            Engineering Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How I Work
          </h2>
        </div>

        {/* ── Phase selector strip ────────────────────────── */}
        <div className="flex gap-1 mb-4">
          {phases.map((phase, i) => (
            <button
              key={phase.number}
              onClick={() => {
                setActiveIndex(i);
                setProgress(0);
                startTimeRef.current = Date.now();
              }}
              className={`flex-1 relative py-3 text-center transition-colors ${
                i === activeIndex
                  ? "text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <span className="font-mono text-xs block">{phase.number}</span>
              <span className="font-mono text-xs sm:text-sm font-medium block">
                {phase.label}
              </span>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border">
                {i === activeIndex && (
                  <motion.div
                    className="h-full bg-accent"
                    style={{ width: `${progress * 100}%` }}
                  />
                )}
                {i < activeIndex && <div className="h-full bg-accent w-full" />}
              </div>
            </button>
          ))}
        </div>

        {/* ── SVG (1/3) + Card (2/3) side by side ────────── */}
        <div className="flex items-center gap-6">
          {/* SVG — takes ~1/3, on the grid background */}
          <div className="hidden sm:flex flex-[1] justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[200px] aspect-square text-foreground/50"
              >
                <Icon />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* White card — takes ~2/3 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="flex-[2] min-w-0 p-6 rounded-lg border border-border bg-surface"
            >
              <h3 className="text-xl font-semibold mb-2">
                {activePhase.title}
              </h3>
              <p className="text-muted leading-relaxed">
                {activePhase.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
