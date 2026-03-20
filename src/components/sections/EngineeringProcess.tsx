"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

import { fadeUp } from "@/lib/animations";

const phases = [
  {
    number: "01",
    label: "DEFINE",
    title: "Understand the problem",
    description:
      "Every project starts with a systems-level question. What are the constraints? What does success look like?",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <circle cx="20" cy="20" r="12" />
        <line x1="28.5" y1="28.5" x2="40" y2="40" strokeLinecap="round" />
        <circle cx="20" cy="20" r="4" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    number: "02",
    label: "DESIGN",
    title: "Sketch the solution",
    description:
      "Pen on paper, then digital. Mechanical layouts, kinematics, circuit schematics — architecture before code.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <rect x="6" y="6" width="28" height="36" rx="2" />
        <line x1="12" y1="14" x2="28" y2="14" strokeDasharray="3 2" />
        <line x1="12" y1="22" x2="24" y2="22" strokeDasharray="3 2" />
        <line x1="12" y1="30" x2="20" y2="30" strokeDasharray="3 2" />
        <line x1="36" y1="42" x2="44" y2="34" strokeLinecap="round" />
        <line x1="36" y1="42" x2="38" y2="36" strokeLinecap="round" />
        <line x1="36" y1="42" x2="42" y2="40" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "03",
    label: "DEVELOP",
    title: "Build the software",
    description:
      "ROS2 nodes, C++ drivers, Python orchestration, React dashboards. Modular, testable, documented.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <rect x="4" y="8" width="40" height="32" rx="3" />
        <line x1="4" y1="16" x2="44" y2="16" />
        <polyline points="14,26 20,30 14,34" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="24" y1="34" x2="34" y2="34" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "04",
    label: "INTEGRATE",
    title: "Wire it all together",
    description:
      "Hardware meets software. CAN buses, sensor fusion, firmware flashed, actuators calibrated.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <rect x="14" y="14" width="20" height="20" rx="2" />
        <line x1="24" y1="4" x2="24" y2="14" strokeLinecap="round" />
        <line x1="24" y1="34" x2="24" y2="44" strokeLinecap="round" />
        <line x1="4" y1="24" x2="14" y2="24" strokeLinecap="round" />
        <line x1="34" y1="24" x2="44" y2="24" strokeLinecap="round" />
        <line x1="10" y1="10" x2="14" y2="14" strokeLinecap="round" />
        <line x1="34" y1="34" x2="38" y2="38" strokeLinecap="round" />
        <line x1="34" y1="14" x2="38" y2="10" strokeLinecap="round" />
        <line x1="14" y1="34" x2="10" y2="38" strokeLinecap="round" />
        <circle cx="24" cy="24" r="4" />
      </svg>
    ),
  },
  {
    number: "05",
    label: "DEPLOY",
    title: "Ship to production",
    description:
      "From lab prototype to factory floor. Fleet management, monitoring, fail-safes — running 24/7.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <rect x="6" y="28" width="12" height="8" rx="2" />
        <rect x="30" y="28" width="12" height="8" rx="2" />
        <rect x="18" y="12" width="12" height="8" rx="2" />
        <line x1="12" y1="28" x2="12" y2="24" strokeLinecap="round" />
        <line x1="12" y1="24" x2="24" y2="24" strokeLinecap="round" />
        <line x1="24" y1="24" x2="24" y2="20" strokeLinecap="round" />
        <line x1="36" y1="28" x2="36" y2="24" strokeLinecap="round" />
        <line x1="36" y1="24" x2="24" y2="24" strokeLinecap="round" />
        <circle cx="12" cy="40" r="2" />
        <circle cx="36" cy="40" r="2" />
        <circle cx="24" cy="8" r="2" strokeDasharray="2 1" />
      </svg>
    ),
  },
];

const CYCLE_DURATION = 4000;

export default function EngineeringProcess() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % phases.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(advance, CYCLE_DURATION);
    return () => clearInterval(interval);
  }, [advance]);

  useEffect(() => {
    const tick = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / (CYCLE_DURATION / 50), 100));
    }, 50);
    return () => clearInterval(tick);
  }, [activeIndex]);

  const active = phases[activeIndex];

  return (
    <section className="py-24 px-4 blueprint-grid">
      <motion.div
        className="max-w-5xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
      >
        <div className="mb-12">
          <p className="font-mono text-sm text-accent tracking-wider uppercase mb-2">
            Engineering Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How I work
          </h2>
        </div>

        {/* Phase selector strip */}
        <div className="flex gap-1 mb-8">
          {phases.map((phase, i) => (
            <button
              key={phase.number}
              onClick={() => {
                setActiveIndex(i);
                setProgress(0);
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
                    style={{ width: `${progress}%` }}
                  />
                )}
                {i < activeIndex && (
                  <div className="h-full bg-accent w-full" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Active phase detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-6 p-6 rounded-lg border border-border bg-surface"
          >
            <div className="text-accent shrink-0 hidden sm:block">
              {active.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{active.title}</h3>
              <p className="text-muted leading-relaxed">
                {active.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
