"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { timelineChapters } from "@/data/timeline";
import { smoothstep } from "@/lib/math";

import { ChapterOverlay } from "./timeline/ChapterOverlay";
import { ReducedMotionFallback } from "./timeline/ReducedMotionFallback";
import {
  CHAPTER_CENTERS,
  FIXED_ZOOM,
  OVERVIEW_TEXT,
  PAN_END,
  SCROLL_SCREENS,
  VERTICAL_SHIFT,
  WAYPOINTS,
  computeChapterOpacity,
  interpolateScroll,
  panEndT,
  panStartT,
  presentX,
} from "./timeline/scroll-math";
import { STRIP_X_MAX, TimelineStripSVG } from "./timeline/TimelineStrip";

export default function ScrollZoomTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Refs for chapter overlay containers — updated imperatively to track SVG pan
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track viewport aspect ratio for viewBox calculation
  const aspectRef = useRef(0.6);

  // Typewriter refs — declared here so updateViewBox can see them
  const descTextRef = useRef<HTMLSpanElement>(null);
  const descCursorRef = useRef<HTMLSpanElement>(null);
  const descContainerRef = useRef<HTMLDivElement>(null);
  /** Track active chapter to detect transitions (clear old text). */
  const activeChapterRef = useRef(-1);
  /** True once the time-based ch0 intro typing finishes. */
  const introTypingDoneRef = useRef(false);

  useEffect(() => {
    const update = () => {
      const el = stickyRef.current;
      if (el) aspectRef.current = el.clientHeight / el.clientWidth;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Update SVG viewBox imperatively — no React re-renders, perfectly smooth.
  const updateViewBox = useCallback((t: number) => {
    const svg = svgRef.current;
    if (!svg) return;

    const { scale: s, center: c } = interpolateScroll(t);
    const aspect = aspectRef.current;

    const vbWidth = STRIP_X_MAX / s;
    const vbHeight = vbWidth * aspect;
    const vbX = c * STRIP_X_MAX - vbWidth / 2;
    const vbY = -vbHeight / 2 - vbHeight * VERTICAL_SHIFT;

    svg.setAttribute("viewBox", `${vbX} ${vbY} ${vbWidth} ${vbHeight}`);

    // Transition arcs — always visible inside the formative chapter.
    const arcsGroup = svg.querySelector("#strip-transition-arcs");
    if (arcsGroup) arcsGroup.setAttribute("opacity", "1");

    // Recruitment Bursary spans formative → Stellenbosch — fades in during that pan.
    const recruitmentArc = svg.querySelector("#strip-recruitment-arc");
    if (recruitmentArc) {
      const panStart = panStartT(0);
      const panEnd = panEndT(1);
      let op: number;
      if (t <= panStart) op = 0;
      else if (t >= panEnd) op = 1;
      else op = smoothstep((t - panStart) / (panEnd - panStart));
      recruitmentArc.setAttribute("opacity", String(op));
    }

    // Growing line extends from 2019 rightward as scroll advances.
    const px = presentX(t);
    const growingLine = svg.querySelector("#strip-growing-line");
    if (growingLine) growingLine.setAttribute("x2", String(px));

    // Clip rect advances with the growing line to reveal labels progressively.
    const clipRect = svg.querySelector("#present-clip-rect");
    if (clipRect) clipRect.setAttribute("width", String(px));

    // Threshold reveal for dots + year labels — snap so small elements aren't clipped.
    const revealEls = svg.querySelectorAll("[data-reveal-x]");
    revealEls.forEach((el) => {
      const rx = parseFloat(el.getAttribute("data-reveal-x") || "9999");
      el.setAttribute("opacity", px >= rx ? "1" : "0");
    });

    const futureArcs = svg.querySelector("#strip-future-arcs");
    if (futureArcs) futureArcs.setAttribute("opacity", "1");

    // Move chapter overlays in sync with the SVG pan so commits/branches/notes
    // stay anchored. scale(relZoom) keeps positioning correct during zoom-out.
    const relZoom = s / FIXED_ZOOM;
    for (let i = 0; i < CHAPTER_CENTERS.length; i++) {
      const el = overlayRefs.current[i];
      if (el) {
        const shift = (CHAPTER_CENTERS[i] - c) * s * 100;
        const presentVP =
          ((px / STRIP_X_MAX - CHAPTER_CENTERS[i]) * FIXED_ZOOM + 0.5) * 100;
        const rightClip = Math.max(0, 100 - presentVP);
        el.style.transform = `translateX(${shift}%) translateY(${VERTICAL_SHIFT * 100}%) scale(${relZoom})`;
        el.style.clipPath =
          rightClip > 0.5 ? `inset(0 ${rightClip}% 0 0)` : "none";
      }
    }

    // ── Typewriter description ──────────────────────────────────────────
    if (descTextRef.current && descCursorRef.current && descContainerRef.current) {
      descContainerRef.current.style.opacity = "1";

      if (t > PAN_END) {
        // Overview zoom-out — type the summary paragraph
        const typeProgress = Math.min(
          1,
          (t - PAN_END) / ((1 - PAN_END) * 0.85),
        );
        const charCount = Math.floor(typeProgress * OVERVIEW_TEXT.length);

        if (activeChapterRef.current !== -2) {
          activeChapterRef.current = -2;
          descTextRef.current.textContent = "";
        }

        descTextRef.current.textContent = OVERVIEW_TEXT.substring(0, charCount);
        descCursorRef.current.style.display =
          typeProgress < 1 ? "inline-block" : "none";
      } else {
        // Find active chapter — the last one whose pan-towards has started
        let active = 0;
        for (let i = CHAPTER_CENTERS.length - 1; i >= 0; i--) {
          const typeStart = i === 0 ? 0 : panStartT(i - 1);
          if (t >= typeStart) {
            active = i;
            break;
          }
        }

        // ch0's intro is time-based; skip scroll-based updates until it finishes
        const skipForIntro = active === 0 && !introTypingDoneRef.current;

        if (!skipForIntro) {
          const chapter = timelineChapters[active];
          const text = chapter.description || "";

          const typeStart = active === 0 ? 0 : panStartT(active - 1);
          const typeEnd = WAYPOINTS[active * 2].t;
          const typeRange = typeEnd - typeStart;
          const typeProgress =
            typeRange > 0
              ? Math.min(1, Math.max(0, (t - typeStart) / typeRange))
              : 1;
          const charCount = Math.floor(typeProgress * text.length);

          if (active !== activeChapterRef.current) {
            activeChapterRef.current = active;
            descTextRef.current.textContent = "";
          }

          descTextRef.current.textContent = text.substring(0, charCount);
          descCursorRef.current.style.display =
            typeProgress < 1 ? "inline-block" : "none";
        }
      }
    }
  }, []);

  // Time-based typewriter for ch0 — types on page load without scrolling.
  useEffect(() => {
    const text = timelineChapters[0].description || "";
    const duration = 6000;
    const startTime = performance.now();
    // Mark ch0 as active inside the effect — safe per react-hooks/immutability.
    const activeRef = activeChapterRef;
    activeRef.current = 0;

    let raf: number;
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const charCount = Math.floor(progress * text.length);

      if (descTextRef.current) {
        descTextRef.current.textContent = text.substring(0, charCount);
      }
      if (descCursorRef.current) {
        descCursorRef.current.style.display =
          progress < 1 ? "inline-block" : "none";
      }

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        introTypingDoneRef.current = true;
      }
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    updateViewBox(0);
    const unsub = scrollYProgress.on("change", updateViewBox);
    return unsub;
  }, [scrollYProgress, updateViewBox]);

  // Chapter opacities still use Framer Motion for the HTML overlays
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

  if (prefersReducedMotion) {
    return <ReducedMotionFallback />;
  }

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${SCROLL_SCREENS * 100}vh` }}
    >
      <div
        ref={stickyRef}
        className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden blueprint-grid"
      >
        {/* ── Sticky heading — always visible ── */}
        <div className="relative z-20 pt-8 flex justify-center">
          <div className="w-full max-w-5xl px-4">
            <Eyebrow className="mb-2">About</Eyebrow>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              The Engineer Behind the Code
            </h1>
          </div>
        </div>

        {/* ── Chapter description — typewriter effect ── */}
        <div
          ref={descContainerRef}
          className="relative z-20 mt-4 flex justify-center transition-opacity duration-300"
        >
          <div className="w-full max-w-5xl px-4">
            <p className="text-muted leading-relaxed max-w-2xl">
              <span ref={descTextRef} />
              <span
                ref={descCursorRef}
                className="inline-block w-[2px] h-[1.1em] align-text-bottom ml-[1px]"
                style={{
                  backgroundColor: "var(--color-accent)",
                  animation: "cursor-blink 0.7s step-end infinite",
                }}
              />
            </p>
          </div>
        </div>

        {/* ── Timeline strip — visible from the start ── */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          style={{ overflow: "visible" }}
        >
          <TimelineStripSVG />
        </svg>

        {/* Chapter detail overlays — fade in/out, translated to track SVG pan */}
        {timelineChapters.map((chapter, i) => (
          <motion.div
            key={chapter.id}
            ref={(el) => {
              overlayRefs.current[i] = el;
            }}
            className="absolute inset-0 will-change-transform"
            style={{ opacity: chOpacities[i] }}
          >
            <ChapterOverlay chapter={chapter} chapterIndex={i} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
