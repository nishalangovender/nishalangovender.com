"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { phases, PHASE_DURATION } from "@/data/engineering-process";

// Auto-cycling hero-style section with large wire-art SVG icons,
// two-column layout (icon left, text right), and a horizontal progress track.
export default function EngineeringProcess() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  // Lazily initialised inside the rAF tick so the ref is not assigned an
  // impure value at render time (React purity rule).
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      if (startTimeRef.current == null) {
        startTimeRef.current = performance.now();
      }
      const elapsed = performance.now() - startTimeRef.current;
      const p = Math.min(elapsed / PHASE_DURATION, 1);
      setProgress(p);

      if (p >= 1) {
        setActiveIndex((prev) => (prev + 1) % phases.length);
        startTimeRef.current = performance.now();
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
          <Eyebrow className="mb-2">Engineering Process</Eyebrow>
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
                startTimeRef.current = performance.now();
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

        {/* ── SVG + Card layout ───────────────────────���── */}
        <div className="flex items-center gap-6">
          {/* SVG — desktop only, takes ~1/3 */}
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

          {/* White card */}
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

        {/* ── Mobile SVG — full width below the card ── */}
        <div className="sm:hidden flex justify-center mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[240px] aspect-square text-foreground/50"
            >
              <Icon />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
