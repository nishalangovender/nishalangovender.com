"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  timelineChapters,
  timelineYears,
  type TimelineYear,
} from "@/data/timeline";
import { smoothstep } from "@/lib/math";

// ─── Animation variants ───────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

// ─── Constants ────────────────────────────────────────────────────────

const OVERVIEW_TEXT =
  "From workshop tinkerer to mechatronics engineer — a journey shaped by curiosity, rigour, and a drive to build things that work. Whether it's autonomous vehicles, industrial automation, or the web app you're reading this on, I bring the same hands-on engineering mindset to every problem. Let's build something together.";

const DOT_LEFT = -31;
const STEM_ML = -24;
/** Extra vh of scroll after the content for the zoom-out phase. */
const ZOOM_OUT_VH = 6;

function yearToChapterIndex(year: string): number {
  const y = parseInt(year, 10);
  if (y <= 2018) return 0;
  if (y <= 2023) return 1;
  if (y <= 2025) return 2;
  return 3;
}

// ─── Build augmented mobile data ──────────────────────────────────────

function buildMobileTimeline(): TimelineYear[] {
  const years: TimelineYear[] = JSON.parse(JSON.stringify(timelineYears));

  // Anchor the start of the timeline at 2000 to match the desktop chapter
  // span (2000 – 2018). Rendered as a bare year dot + label (no bullets).
  years.unshift({ year: "2000", events: [] });

  // Floating formative-year notes → attach each to the nearest existing year
  // whose value matches or falls just below the note's `fromYear`. On desktop
  // these render as free-floating annotations between years; on mobile they
  // need a year anchor, so we route them to the chronologically-correct one.
  const formativeNotes = timelineChapters[0].notes || [];
  for (const note of formativeNotes) {
    const yearsAsc = [...years].sort(
      (a, b) => parseInt(a.year, 10) - parseInt(b.year, 10),
    );
    const anchor =
      yearsAsc.find((y) => parseInt(y.year, 10) === note.fromYear) ??
      [...yearsAsc]
        .reverse()
        .find(
          (y) =>
            parseInt(y.year, 10) <= note.fromYear && parseInt(y.year, 10) > 2000,
        );
    if (!anchor) continue;
    anchor.events.push({
      month: "",
      text: note.text,
      side: "right",
    });
  }

  const su2022 = years.find((y) => y.year === "2022");
  const y2019 = years.find((y) => y.year === "2019");
  if (su2022 && y2019) {
    const suInstitution = su2022.events.find((e) => e.side === "left");
    if (suInstitution) {
      y2019.events.unshift(suInstitution);
      su2022.events = su2022.events.filter((e) => e.side !== "left");
    }
  }

  const battChapter = timelineChapters[2];
  const y2024 = years.find((y) => y.year === "2024");
  if (y2024 && battChapter) {
    battChapter.commits
      .filter((c) => c.message && parseFloat(c.year || "0") < 2025)
      .forEach((c) => {
        c.message.split("\n").filter(Boolean).forEach((line) => {
          y2024.events.push({ month: c.displayYear || "", text: line, side: "right" });
        });
      });
  }
  const y2025 = years.find((y) => y.year === "2025");
  if (y2025 && battChapter) {
    const extraCommits = battChapter.commits.filter(
      (c) => c.message && parseFloat(c.year || "0") >= 2025,
    );
    const existingRight = y2025.events.filter((e) => e.side === "right");
    extraCommits.forEach((c) => {
      c.message.split("\n").filter(Boolean).forEach((line) => {
        if (!existingRight.some((e) => e.text === line)) {
          y2025.events.push({ month: c.displayYear || "", text: line, side: "right" });
        }
      });
    });
  }

  const freelanceChapter = timelineChapters[3];
  const y2026 = years.find((y) => y.year === "2026");
  if (y2026 && freelanceChapter) {
    freelanceChapter.commits.filter((c) => c.message).forEach((c) => {
      c.message.split("\n").filter(Boolean).forEach((line) => {
        y2026.events.push({ month: c.displayYear || "", text: line, side: "right" });
      });
    });
    const freelanceInst = y2026.events.find((e) => e.side === "left");
    if (freelanceInst && !freelanceInst.logo) {
      freelanceInst.logo = "/images/logos/ng-freelance.svg";
    }
  }

  // Keep the 2000 anchor even though it has no events — it renders as a bare
  // year dot that matches desktop's chapter span.
  return years.filter(
    (y) => y.year === "2000" || y.events.length > 0 || y.branch,
  );
}

const mobileYears = buildMobileTimeline();

// ─── Main component ───────────────────────────────────────────────────
//
// Architecture (mirrors desktop ScrollZoomTimeline):
//   - Tall outer <section> provides scroll distance
//   - Sticky inner container stays in viewport (below navbar)
//   - During normal scroll: timeline content scrolls via translateY
//   - During zoom-out: timeline scales down to fit viewport, overview types
//
// Scroll phases (based on outer section's scrollYProgress 0→1):
//   0.0 → contentEnd:  Timeline scrolls normally
//   contentEnd → 1.0:  Zoom-out (scale 1→minScale), overview text types

export default function MobileTimeline() {
  const prefersReducedMotion = useReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const timelineInnerRef = useRef<HTMLDivElement>(null);
  const Item = prefersReducedMotion ? "div" : motion.div;

  // Measure timeline natural height
  const [contentH, setContentH] = useState(0);
  useEffect(() => {
    const el = timelineInnerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContentH(el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const viewportH = typeof window !== "undefined" ? window.innerHeight : 844;
  const navH = 64;
  const stickyH = viewportH - navH;
  const headerH = 160; // approx sticky header
  const visibleH = stickyH - headerH;

  // The outer section height = content that scrolls + zoom-out scroll room
  const totalScrollH = contentH + ZOOM_OUT_VH * viewportH;

  // Scroll progress
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  // Fraction of scroll where content ends and zoom begins
  const contentEnd = contentH > 0 ? contentH / totalScrollH : 0.7;

  // Derive values from scroll
  const maxScroll = Math.max(0, contentH - visibleH);
  const scrollOffset = useTransform(scrollYProgress, [0, contentEnd], [0, maxScroll]);
  const zoomT = useTransform(scrollYProgress, [contentEnd, 1], [0, 1]);

  // Typewriter state
  const descTextRef = useRef<HTMLSpanElement>(null);
  const descCursorRef = useRef<HTMLSpanElement>(null);
  const activeChapterRef = useRef(-1);
  const introTypingDoneRef = useRef(false);
  // Monotonic progress per chapter — prevents the same description retyping
  // when a new year dot enters view within the same chapter.
  const chapterProgressRef = useRef<Record<number, number>>({});

  // Ch0 time-based typewriter
  useEffect(() => {
    if (prefersReducedMotion) return;
    const text = timelineChapters[0].description || "";
    const duration = 6000;
    const startTime = performance.now();
    activeChapterRef.current = 0;
    let raf: number;
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const charCount = Math.floor(progress * text.length);
      if (descTextRef.current) descTextRef.current.textContent = text.substring(0, charCount);
      if (descCursorRef.current) descCursorRef.current.style.display = progress < 1 ? "inline-block" : "none";
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        introTypingDoneRef.current = true;
        // Lock chapter 0 progress at 100% so the scroll-driven typewriter
        // never rewinds the intro text the user has already seen.
        chapterProgressRef.current[0] = 1;
      }
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  // Scroll-driven typewriter (chapter descriptions + overview)
  const updateTypewriter = useCallback((zoomProgress: number) => {
    if (prefersReducedMotion) return;

    // Zoom-out phase: type overview text
    if (zoomProgress > 0.01) {
      if (activeChapterRef.current !== -2) {
        activeChapterRef.current = -2;
        if (descTextRef.current) descTextRef.current.textContent = "";
      }
      const charCount = Math.floor(zoomProgress * OVERVIEW_TEXT.length);
      if (descTextRef.current) descTextRef.current.textContent = OVERVIEW_TEXT.substring(0, charCount);
      if (descCursorRef.current) descCursorRef.current.style.display = zoomProgress < 1 ? "inline-block" : "none";
      return;
    }

    // Reset from zoom if scrolling back up
    if (activeChapterRef.current === -2) {
      activeChapterRef.current = -1;
      if (descTextRef.current) descTextRef.current.textContent = "";
    }

    // Normal phase: type chapter description based on which year section is in view.
    // Progress is computed over the entire span of the chapter's year elements
    // (first-year top → last-year top), so moving between years inside a single
    // chapter advances the typewriter instead of restarting it.
    const yearEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-timeline-year]"),
    );
    if (yearEls.length === 0) return;

    const topmostLine = viewportH * 0.45;
    let activeYear = yearEls[0].dataset.timelineYear || "2000";
    for (let i = yearEls.length - 1; i >= 0; i--) {
      const rect = yearEls[i].getBoundingClientRect();
      if (rect.top < topmostLine) {
        activeYear = yearEls[i].dataset.timelineYear || activeYear;
        break;
      }
    }

    const chapterIdx = yearToChapterIndex(activeYear);
    if (chapterIdx === 0 && !introTypingDoneRef.current) return;

    const chapter = timelineChapters[chapterIdx];
    const text = chapter?.description || "";

    if (chapterIdx !== activeChapterRef.current) {
      activeChapterRef.current = chapterIdx;
      if (descTextRef.current) descTextRef.current.textContent = "";
    }

    // All year elements that belong to this chapter.
    const chapterYearEls = yearEls.filter(
      (el) =>
        yearToChapterIndex(el.dataset.timelineYear || "0") === chapterIdx,
    );
    if (chapterYearEls.length === 0) return;

    const firstTop = chapterYearEls[0].getBoundingClientRect().top;
    const lastTop =
      chapterYearEls[chapterYearEls.length - 1].getBoundingClientRect().top;
    // span from first year's top to last year's top, plus a small trailing
    // cushion so the final characters appear before the next chapter takes over.
    const span = Math.max(200, lastTop - firstTop + 200);
    const scrollIn = topmostLine - firstTop;
    const rawProgress = Math.min(1, Math.max(0, scrollIn / span));

    // Monotonic per-chapter progress — never rewinds on a slight scroll-up.
    const prev = chapterProgressRef.current[chapterIdx] ?? 0;
    const typeProgress = Math.max(prev, rawProgress);
    chapterProgressRef.current[chapterIdx] = typeProgress;

    const charCount = Math.floor(typeProgress * text.length);
    if (descTextRef.current)
      descTextRef.current.textContent = text.substring(0, charCount);
    if (descCursorRef.current)
      descCursorRef.current.style.display =
        typeProgress < 1 ? "inline-block" : "none";
  }, [prefersReducedMotion, viewportH]);

  // Subscribe to zoomT changes
  useEffect(() => {
    if (prefersReducedMotion) return;
    const unsub = zoomT.on("change", updateTypewriter);
    return unsub;
  }, [zoomT, updateTypewriter, prefersReducedMotion]);

  // Also update typewriter on scroll for the normal phase
  useEffect(() => {
    if (prefersReducedMotion) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          if (zoomT.get() < 0.01) updateTypewriter(0);
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [updateTypewriter, zoomT, prefersReducedMotion]);

  // Compute scale for zoom-out — clamp to a legible floor on mobile so the
  // timeline doesn't shrink to an unreadable postage stamp at the end of scroll.
  // The timeline also fades out as it shrinks, giving a "camera pulls back and
  // dissolves" effect rather than leaving a tiny illegible copy on screen.
  const MIN_SCALE_FLOOR = 0.55;
  const fitScale =
    contentH > 0 ? (visibleH - 80) / (contentH + 100) : MIN_SCALE_FLOOR;
  const minScale = Math.min(1, Math.max(MIN_SCALE_FLOOR, fitScale));
  const scale = useTransform(zoomT, [0, 1], [1, minScale]);
  const timelineOpacity = useTransform(zoomT, [0, 0.6, 1], [1, 0.85, 0.3]);

  // Translate-Y for the inner timeline. During normal scroll: translateY moves
  // content up. During zoom-out: smoothly interpolate y from -maxScroll back
  // to 0 so the view slides from Freelance up to show the full timeline as it
  // shrinks.
  const innerY = useTransform(
    [scrollOffset, zoomT] as const,
    ([offset, zt]: number[]) => {
      if (zt <= 0) return -offset;
      return -maxScroll * (1 - smoothstep(zt));
    },
  );

  // Growing accent line height, keyed to content-end so the line fills over
  // the scrolled portion only.
  const innerLineHeight = useTransform(
    scrollYProgress,
    [0, contentEnd],
    ["0%", "100%"],
  );

  // ── Reduced motion: simple scrolling page ──
  if (prefersReducedMotion) {
    return (
      <section className="py-16 px-4 blueprint-grid">
        <div className="max-w-lg mx-auto">
          <div className="mb-10">
            <Eyebrow className="mb-2">About</Eyebrow>
            <h1 className="text-3xl font-bold tracking-tight">The Engineer Behind the Code</h1>
          </div>
          <div className="relative pl-8">
            <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-accent/20" />
            <TimelineYears Item="div" />
            <div className="mt-10 pt-6 border-t border-accent/10">
              <p className="text-sm text-muted leading-relaxed italic">{OVERVIEW_TEXT}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={outerRef}
      className="relative blueprint-grid"
      style={{ height: totalScrollH > 0 ? totalScrollH : "auto" }}
    >
      {/* Sticky container — stays in viewport */}
      <div
        className="sticky top-16 overflow-hidden px-4"
        style={{ height: stickyH }}
      >
        <div className="max-w-lg mx-auto h-full flex flex-col">
          {/* ── Header ── */}
          <div className="flex-shrink-0 z-20 bg-background/95 backdrop-blur-sm pb-4 border-b border-border/30">
            <div className="pt-6">
              <Eyebrow className="mb-2">About</Eyebrow>
              <h1 className="text-3xl font-bold tracking-tight">
                The Engineer Behind the Code
              </h1>
            </div>
            <div className="mt-3 min-h-[3.5rem]">
              <p className="text-muted leading-relaxed text-sm">
                <span ref={descTextRef} />
                <span
                  ref={descCursorRef}
                  className="inline-block w-[2px] h-[1em] align-text-bottom ml-[1px]"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    animation: "cursor-blink 0.7s step-end infinite",
                  }}
                />
              </p>
            </div>
          </div>

          {/* ── Timeline — scrolls/scales within this container ── */}
          <div className="flex-1 overflow-hidden relative">
            <motion.div
              ref={timelineInnerRef}
              className="relative pl-8 will-change-transform"
              style={{
                scale,
                opacity: timelineOpacity,
                y: innerY,
                transformOrigin: "top left",
              }}
            >
              <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-accent/10" />
              <motion.div
                className="absolute left-[7px] top-0 w-[2px] bg-accent/40"
                style={{ height: innerLineHeight }}
              />
              <TimelineYears Item={Item} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Timeline year entries (shared between normal and reduced motion) ─

function TimelineYears({ Item }: { Item: typeof motion.div | "div" }) {
  const isMotion = Item !== "div";

  return (
    <>
      {mobileYears.map((yearData) => {
        const institution = yearData.events.find((e) => e.side === "left");
        const achievements = yearData.events.filter((e) => e.side === "right");

        return (
          <div
            key={yearData.year}
            data-timeline-year={yearData.year}
            className="relative mb-10 last:mb-0"
          >
            <div
              className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-accent border-2 border-background z-10"
              style={{ left: DOT_LEFT }}
            />

            <Item
              {...(isMotion && {
                initial: "hidden",
                whileInView: "visible",
                viewport: { once: true, margin: "-40px" },
                variants: fadeUp,
              })}
            >
              <p className="font-mono text-xs text-accent tracking-wider mb-2">
                {yearData.year}
              </p>

              {institution && (
                <div className="mb-3">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    {institution.logo && (
                      <div className="relative w-6 h-6 rounded overflow-hidden border border-border/60 flex-shrink-0">
                        <Image
                          src={institution.logo}
                          alt={institution.text}
                          fill
                          className="object-cover"
                          sizes="24px"
                        />
                      </div>
                    )}
                    <span className="text-base font-semibold text-foreground">
                      {institution.text}
                    </span>
                  </div>
                  {institution.subtitle && (
                    <p className="text-xs text-muted" style={{ marginLeft: institution.logo ? 34 : 0 }}>
                      {institution.subtitle}
                    </p>
                  )}
                </div>
              )}

              {achievements.length > 0 && (
                <div className="space-y-1.5">
                  {achievements.map((event, eIdx) => (
                    <div key={eIdx} className="flex items-start" style={{ marginLeft: STEM_ML }}>
                      <div className="flex items-center mt-[7px] flex-shrink-0">
                        <div style={{ width: 20 }} className="h-[1.5px] bg-accent/25" />
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/40 flex-shrink-0" />
                      </div>
                      <span className="text-sm text-foreground/80 leading-snug ml-1.5">
                        {event.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Item>

            {/* ── Branch ── */}
            {yearData.branch && (
              <Item
                className="mt-3 relative"
                {...(isMotion && {
                  initial: "hidden",
                  whileInView: "visible",
                  viewport: { once: true, margin: "-40px" },
                  variants: fadeUp,
                })}
              >
                {/* Fork curve */}
                <svg
                  width="28" height="20" viewBox="0 0 28 20"
                  className="absolute"
                  style={{ left: STEM_ML, top: 0 }}
                >
                  <path
                    d="M 0 0 C 0 14, 14 18, 28 18"
                    fill="none" stroke="var(--color-accent)"
                    strokeWidth={1.5} strokeOpacity={0.4} strokeDasharray="4 3"
                  />
                </svg>

                {/* Branch content — dashed rail runs full height from fork to merge */}
                <div className="ml-1 pt-5 pl-4 relative">
                  {/* Vertical dashed line — starts where fork curve ends (after pt-5 = 20px) */}
                  <div className="absolute left-0 bottom-0 w-0 border-l-2 border-dashed border-accent/50" style={{ top: 20 }} />
                  <span className="inline-block font-mono text-[9px] text-accent/50 tracking-wider bg-accent/5 px-1.5 py-0.5 rounded-sm mb-1">
                    {yearData.branch.name}
                  </span>
                  <div className="space-y-2">
                    {yearData.branch.events.map((event, eIdx) => (
                      <div key={eIdx} className="flex items-start">
                        <div className="flex items-center mt-[7px] flex-shrink-0">
                          <div className="w-3 h-[1.5px] bg-accent/25" />
                          <div className="w-1.5 h-1.5 rounded-full bg-accent/30 flex-shrink-0" />
                        </div>
                        <span className="text-sm text-foreground/70 leading-snug ml-1.5">
                          {event.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Merge curve */}
                <svg
                  width="28" height="20" viewBox="0 0 28 20"
                  style={{ marginLeft: STEM_ML }}
                >
                  <path
                    d="M 28 2 C 14 2, 0 6, 0 20"
                    fill="none" stroke="var(--color-accent)"
                    strokeWidth={1.5} strokeOpacity={0.4} strokeDasharray="4 3"
                  />
                </svg>
              </Item>
            )}
          </div>
        );
      })}
    </>
  );
}
