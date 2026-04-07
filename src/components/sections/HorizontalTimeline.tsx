"use client";

import { timelineChapters } from "@/data/timeline";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import TimelineStrip, {
  TimelineLabels,
  TimelineLine,
} from "./timeline/TimelineStrip";

// --- Animation constants ---
const TOTAL_PHASES = 9; // 0=start, 1=ch0, 2=trans, 3=ch1, 4=trans, 5=ch2, 6=trans, 7=ch3, 8=end
const ZOOM_IN = 3;
const ZOOM_MID = 1.6;
const STRIP_VW = 0.8; // 80vw wide

// --- Easing functions ---
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Eases between phases with a brief hold at each endpoint */
function phaseEase(progress: number): number {
  const hold = 0.12;
  if (progress <= hold) return 0;
  if (progress >= 1 - hold) return 1;
  return easeInOutCubic((progress - hold) / (1 - 2 * hold));
}

function smoothstep(x: number): number {
  return x * x * (3 - 2 * x);
}

// --- Phase targets ---
const SCALE_AT = [
  1,
  ZOOM_IN,
  ZOOM_MID,
  ZOOM_IN,
  ZOOM_MID,
  ZOOM_IN,
  ZOOM_MID,
  ZOOM_IN,
  1,
];

const CENTER_AT = (() => {
  const c = timelineChapters;
  return [
    0.5,
    c[0].stripPosition,
    (c[0].stripPosition + c[1].stripPosition) / 2,
    c[1].stripPosition,
    (c[1].stripPosition + c[2].stripPosition) / 2,
    c[2].stripPosition,
    (c[2].stripPosition + c[3].stripPosition) / 2,
    c[3].stripPosition,
    0.5,
  ];
})();

// --- Direct computation from scroll progress ---
// Using callback-form useTransform to prevent WAAPI offloading (which breaks scroll-linked opacity)

/** Interpolate scale + center from scroll progress [0,1] */
function interpolatePhase(t: number): { scale: number; center: number } {
  const raw = t * (TOTAL_PHASES - 1);
  const idx = Math.min(Math.floor(raw), SCALE_AT.length - 2);
  const e = phaseEase(raw - idx);
  return {
    scale: SCALE_AT[idx] + (SCALE_AT[idx + 1] - SCALE_AT[idx]) * e,
    center: CENTER_AT[idx] + (CENTER_AT[idx + 1] - CENTER_AT[idx]) * e,
  };
}

/** Chapter opacity — peaks at the chapter's target phase */
function computeChapterOpacity(t: number, chapterIndex: number): number {
  const targetPhase = 1 + chapterIndex * 2; // phases 1, 3, 5, 7
  const phase = t * (TOTAL_PHASES - 1);
  const dist = Math.abs(phase - targetPhase);
  const raw = Math.max(0, 1 - dist / 0.7);
  return smoothstep(raw);
}

/** Labels opacity — visible when zoomed out, hidden near chapter phases */
function computeLabelsOpacity(t: number): number {
  const phase = t * (TOTAL_PHASES - 1);
  const minDist = Math.min(
    Math.abs(phase - 1),
    Math.abs(phase - 3),
    Math.abs(phase - 5),
    Math.abs(phase - 7),
  );
  const o = Math.min(1, minDist / 0.5);
  return o * o;
}

// --- Component ---

export default function HorizontalTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [stripPx, setStripPx] = useState(800);

  useEffect(() => {
    const update = () => setStripPx(window.innerWidth * STRIP_VW);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Strip transform — callback form keeps it on main thread and scroll-linked
  const stripPxRef = useRef(stripPx);
  stripPxRef.current = stripPx;

  const scale = useTransform(scrollYProgress, (t) => interpolatePhase(t).scale);
  const translateX = useTransform(scrollYProgress, (t) => {
    const { scale: s, center: c } = interpolatePhase(t);
    return -(c - 0.5) * stripPxRef.current * s;
  });

  // Chapter content opacities — callback form prevents WAAPI offloading
  const ch0Opacity = useTransform(scrollYProgress, (t) =>
    computeChapterOpacity(t, 0),
  );
  const ch1Opacity = useTransform(scrollYProgress, (t) =>
    computeChapterOpacity(t, 1),
  );
  const ch2Opacity = useTransform(scrollYProgress, (t) =>
    computeChapterOpacity(t, 2),
  );
  const ch3Opacity = useTransform(scrollYProgress, (t) =>
    computeChapterOpacity(t, 3),
  );
  const chOpacities = [ch0Opacity, ch1Opacity, ch2Opacity, ch3Opacity];

  // Strip labels visibility
  const labelsOpacity = useTransform(scrollYProgress, (t) =>
    computeLabelsOpacity(t),
  );

  // Heading fades out quickly
  const headingOpacity = useTransform(scrollYProgress, (t) =>
    Math.max(0, 1 - t / 0.03),
  );

  if (prefersReducedMotion) {
    return (
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-sm text-accent tracking-wider uppercase mb-2">
            Git Log
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
            Timeline
          </h2>
          <div className="relative h-24">
            <TimelineStrip />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${TOTAL_PHASES * 100}vh` }}
    >
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Heading — fades out as scroll begins */}
        <motion.div
          className="absolute top-8 left-8 z-20"
          style={{ opacity: headingOpacity }}
        >
          <p className="font-mono text-sm text-accent tracking-wider uppercase mb-2">
            Git Log
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Timeline
          </h2>
        </motion.div>

        {/* Timeline strip — scales and pans with scroll */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-y-1/2 will-change-transform"
          style={{
            width: `${STRIP_VW * 100}vw`,
            marginLeft: `${-STRIP_VW * 50}vw`,
            height: "80px",
            scale,
            x: translateX,
            transformOrigin: "center center",
          }}
        >
          {/* Line + dots: always visible */}
          <TimelineLine />

          {/* Labels: fade out when zoomed in, visible when zoomed out */}
          <motion.div
            className="absolute inset-0"
            style={{ opacity: labelsOpacity }}
          >
            <TimelineLabels />
          </motion.div>
        </motion.div>

        {/* Chapter detail overlays — fixed in viewport, fade with zoom */}
        {timelineChapters.map((chapter, i) => (
          <motion.div
            key={chapter.id}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ opacity: chOpacities[i] }}
          >
            {/* Institution info — above the center line */}
            <div className="absolute top-[18%] left-0 right-0 text-center px-8">
              {chapter.logo && (
                <div className="w-14 h-14 mx-auto mb-3 rounded-sm overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={chapter.logo}
                    alt={`${chapter.title} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                {chapter.title}
              </h3>
              <p className="text-sm text-muted font-mono mt-1">
                {chapter.subtitle}
              </p>
              <p className="text-xs text-accent font-mono mt-1">
                {chapter.yearRange}
              </p>
            </div>

            {/* Commits — below the center line */}
            <div className="absolute top-[58%] left-1/2 -translate-x-1/2 space-y-2 max-w-lg">
              {chapter.commits.map((commit, j) => (
                <div key={j} className="flex items-start gap-2">
                  <span className="font-mono text-xs text-accent/70 flex-shrink-0 mt-0.5">
                    {commit.prefix}
                  </span>
                  <span className="text-sm text-foreground/60">
                    {commit.message}
                  </span>
                  {commit.year && (
                    <span className="font-mono text-[10px] text-muted/40 flex-shrink-0 mt-1 ml-auto">
                      {commit.year}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
