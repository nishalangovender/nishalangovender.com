"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { phases, PHASE_DURATION } from "@/data/engineering-process";

/** nish-os status glyphs: done, running, planned. */
const GLYPH = { done: "▮", active: "▶", todo: "·" } as const;

// A numbered terminal list: one row per phase, the active row expanded with
// its sentence and a progress rule. The rule is a single transform tween per
// phase, so the only React update per phase is the timer that advances it.
export default function EngineeringProcess() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(
      () => setActiveIndex((i) => (i + 1) % phases.length),
      PHASE_DURATION,
    );
    return () => window.clearTimeout(id);
  }, [activeIndex, reduceMotion]);

  const Icon = phases[activeIndex].icon;

  return (
    <section className="relative py-24 px-4 flex items-center justify-center blueprint-grid">
      <div className="relative z-10 mx-auto max-w-5xl w-full">
        <div className="mb-12">
          <Eyebrow className="mb-2">Engineering Process</Eyebrow>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How I Work
          </h2>
        </div>

        <div className="flex items-center gap-8">
          <div className="pane flex-[2] min-w-0 rounded-lg border border-border font-mono text-sm">
            {/* nish-os head line: uppercase chrome, count on the right. */}
            <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs uppercase tracking-wider">
              <span className="text-accent">Pipeline</span>
              <span className="text-muted">{phases.length} Phases</span>
            </div>

            <ol className="py-2">
              {phases.map((phase, i) => {
                const active = i === activeIndex;
                const glyph =
                  i < activeIndex ? GLYPH.done : active ? GLYPH.active : GLYPH.todo;
                return (
                  <li key={phase.number}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      aria-current={active ? "step" : undefined}
                      className={`w-full grid grid-cols-[2ch_2ch_9ch_1fr] gap-x-3 px-4 py-2 text-left transition-colors ${
                        active ? "text-foreground" : "text-muted hover:text-foreground"
                      }`}
                    >
                      <span className="text-muted-dim">{phase.number}</span>
                      <span className={active ? "text-accent" : ""}>{glyph}</span>
                      <span className={active ? "text-accent" : ""}>{phase.label}</span>
                      <span className="font-sans truncate">{phase.title}</span>
                    </button>

                    {active && (
                      <div className="pr-4 pb-3 pl-[calc(1rem+4ch+1.5rem)] sm:pl-[calc(1rem+13ch+2.25rem)]">
                        <p className="font-sans text-muted leading-relaxed">
                          {phase.description}
                        </p>
                        <div className="mt-3 h-px bg-border overflow-hidden">
                          <motion.div
                            key={activeIndex}
                            className="h-full bg-accent origin-left"
                            initial={{ scaleX: reduceMotion ? 1 : 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: PHASE_DURATION / 1000, ease: "linear" }}
                          />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

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
        </div>
      </div>
    </section>
  );
}
