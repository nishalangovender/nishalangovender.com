"use client";

import { timelineChapters } from "@/data/timeline";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

// ─── Animation variants ───────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Overview text (matches desktop) ──────────────────────────────────

const OVERVIEW_TEXT =
  "From workshop tinkerer to mechatronics engineer — a journey shaped by curiosity, rigour, and a drive to build things that work. Whether it's autonomous vehicles, industrial automation, or the web app you're reading this on, I bring the same hands-on engineering mindset to every problem. Let's build something together.";

// ─── Component ────────────────────────────────────────────────────────

export default function MobileTimeline() {
  const prefersReducedMotion = useReducedMotion();

  const Wrapper = prefersReducedMotion ? "div" : motion.div;
  const Item = prefersReducedMotion ? "div" : motion.div;

  return (
    <section className="py-16 px-4 blueprint-grid">
      <div className="max-w-lg mx-auto">
        {/* ── Section heading ── */}
        <div className="mb-10">
          <p className="font-mono text-sm text-accent tracking-wider uppercase mb-2">
            About
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            The Engineer Behind the Code
          </h2>
        </div>

        {/* ── Vertical timeline ── */}
        <div className="relative pl-8">
          {/* Continuous vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-accent/20" />

          {timelineChapters.map((chapter, chapterIdx) => (
            <Wrapper
              key={chapter.id}
              className="relative mb-12 last:mb-0"
              {...(!prefersReducedMotion && {
                initial: "hidden",
                whileInView: "visible",
                viewport: { once: true, margin: "-60px" },
                variants: stagger,
              })}
            >
              {/* ── Chapter dot on the line ── */}
              <div className="absolute -left-8 top-1 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-accent border-2 border-background z-10" />
              </div>

              {/* ── Chapter header ── */}
              <Item
                className="mb-3"
                {...(!prefersReducedMotion && { variants: fadeUp })}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  {chapter.logo && (
                    <div className="relative w-6 h-6 rounded overflow-hidden border border-border/60 flex-shrink-0">
                      <Image
                        src={chapter.logo}
                        alt={chapter.title}
                        fill
                        className="object-cover"
                        sizes="24px"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-bold leading-tight">
                    {chapter.title}
                  </h3>
                </div>
                <p className="font-mono text-xs text-accent/70 tracking-wider">
                  {chapter.subtitle} · {chapter.yearRange}
                </p>
              </Item>

              {/* ── Description ── */}
              {chapter.description && (
                <Item
                  className="mb-4"
                  {...(!prefersReducedMotion && { variants: fadeUp })}
                >
                  <p className="text-sm text-muted leading-relaxed">
                    {chapter.description}
                  </p>
                </Item>
              )}

              {/* ── Notes ── */}
              {chapter.notes && chapter.notes.length > 0 && (
                <Item
                  className="mb-4 space-y-2"
                  {...(!prefersReducedMotion && { variants: fadeUp })}
                >
                  {chapter.notes.map((note, nIdx) => (
                    <p
                      key={nIdx}
                      className="text-xs text-foreground/50 italic leading-relaxed pl-3 border-l-2 border-accent/15"
                    >
                      {note.text}
                    </p>
                  ))}
                </Item>
              )}

              {/* ── Commits ── */}
              {chapter.commits.filter((c) => c.message).length > 0 && (
                <Item
                  className="space-y-2"
                  {...(!prefersReducedMotion && { variants: fadeUp })}
                >
                  {chapter.commits
                    .filter((c) => c.message)
                    .map((commit, cIdx) => {
                      const dateLabel = commit.displayYear || commit.year;
                      return (
                        <div key={cIdx} className="flex gap-3 items-start">
                          {/* Mini dot */}
                          <div className="w-2 h-2 rounded-full bg-accent/50 mt-1.5 flex-shrink-0" />
                          <div className="min-w-0">
                            {dateLabel && (
                              <span className="font-mono text-[10px] text-foreground/50 block mb-0.5">
                                {dateLabel}
                              </span>
                            )}
                            {commit.message.split("\n").map((line, li) => (
                              <span
                                key={li}
                                className="text-sm text-foreground/80 leading-snug block"
                              >
                                {line}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </Item>
              )}

              {/* ── Branches ── */}
              {chapter.branches && chapter.branches.length > 0 && (
                <Item
                  className="mt-4 ml-3 pl-4 border-l-2 border-dashed border-accent/25"
                  {...(!prefersReducedMotion && { variants: fadeUp })}
                >
                  {chapter.branches.map((branch) => (
                    <div key={branch.name} className="mb-3 last:mb-0">
                      <span className="font-mono text-[10px] text-accent/50 tracking-wider bg-accent/5 px-1.5 py-0.5 rounded-sm">
                        {branch.name}
                      </span>
                      <div className="mt-2 space-y-2">
                        {branch.events.map((event, eIdx) => (
                          <div
                            key={eIdx}
                            className="flex gap-3 items-start"
                          >
                            <div className="w-2 h-2 rounded-full bg-accent/30 mt-1.5 flex-shrink-0" />
                            <div className="min-w-0">
                              {event.date && (
                                <span className="font-mono text-[10px] text-foreground/50 block mb-0.5">
                                  {event.date}
                                </span>
                              )}
                              {event.text.split("\n").map((line, li) => (
                                <span
                                  key={li}
                                  className="text-sm text-foreground/70 leading-snug block"
                                >
                                  {line}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </Item>
              )}
            </Wrapper>
          ))}

          {/* ── Overview closing ── */}
          <Wrapper
            className="relative mt-12 pt-6 border-t border-accent/10"
            {...(!prefersReducedMotion && {
              initial: "hidden",
              whileInView: "visible",
              viewport: { once: true, margin: "-40px" },
              variants: fadeUp,
            })}
          >
            <div className="absolute -left-8 top-6 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-accent/30 border-2 border-background z-10" />
            </div>
            <p className="text-sm text-muted leading-relaxed italic">
              {OVERVIEW_TEXT}
            </p>
          </Wrapper>
        </div>
      </div>
    </section>
  );
}
