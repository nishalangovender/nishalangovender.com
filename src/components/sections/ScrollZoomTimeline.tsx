"use client";

import { timelineChapters, type TimelineChapter } from "@/data/timeline";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import {
  PRESENT_YEAR,
  STRIP_X_MAX,
  TimelineStripSVG,
  yearToPosition,
} from "./timeline/TimelineStrip";

// ─── Animation constants ───────────────────────────────────────────────

/** How many viewports of scroll height the section occupies */
const SCROLL_SCREENS = 6;

/** Overview paragraph typed during the final zoom-out */
const OVERVIEW_TEXT =
  "From workshop tinkerer to mechatronics engineer — a journey shaped by curiosity, rigour, and a drive to build things that work. Whether it's autonomous vehicles, industrial automation, or the web app you're reading this on, I bring the same hands-on engineering mindset to every problem. Let's build something together.";

// Chapter year boundaries
const CHAPTER_BOUNDS = [
  { from: 2000, to: 2019 },
  { from: 2019, to: 2024 },
  { from: 2024, to: 2026 },
  { from: 2026, to: PRESENT_YEAR },
];

// Padding factor — how much of the viewport the chapter fills.
// Lower = more zoomed out (more surrounding context visible).
const VIEW_PAD = 0.80;

/** Vertical offset — pushes the timeline down to clear the heading/description.
 *  Applied to both the SVG viewBox and the HTML overlays. */
const VERTICAL_SHIFT = 0.08;

// Fixed zoom level based on the formative chapter (the widest one).
// All chapters share this zoom — shorter chapters occupy less of the
// viewport but get more pixels-per-year, giving them extra breathing room.
const CHAPTER_WIDTH = yearToPosition(CHAPTER_BOUNDS[0].to) - yearToPosition(CHAPTER_BOUNDS[0].from);
const FIXED_ZOOM = VIEW_PAD / CHAPTER_WIDTH;

// Keep per-chapter arrays for compatibility with overlay code
const CHAPTER_ZOOM = CHAPTER_BOUNDS.map(() => FIXED_ZOOM);

// Per-chapter centers — midpoint of each chapter's year range on the strip
const CHAPTER_CENTERS = CHAPTER_BOUNDS.map(({ from, to }) =>
  (yearToPosition(from) + yearToPosition(to)) / 2,
);

// ─── Waypoint-based scroll interpolation ─────────────────────────────
//
// Scroll is divided into: hold → pan → hold → pan → … → hold → overview.
// Panning speed is proportional to distance so it feels even throughout.
// Each chapter gets a brief hold so the viewer can read the content.

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothstep(x: number): number {
  return x * x * (3 - 2 * x);
}

const HOLD_SCROLL = 0.08;       // scroll fraction each chapter holds
const OVERVIEW_SCROLL = 0.15;   // scroll fraction for overview zoom-out
const PAN_END = 1 - OVERVIEW_SCROLL; // end of panning region

// Build waypoints: hold-at-ch0, pan-to-ch1, hold-at-ch1, pan-to-ch2, …
interface Waypoint { t: number; center: number }

const WAYPOINTS: Waypoint[] = (() => {
  const N = CHAPTER_CENTERS.length;
  const panDists = CHAPTER_CENTERS.slice(1).map((c, i) => c - CHAPTER_CENTERS[i]);
  const totalPanDist = panDists.reduce((a, b) => a + b, 0);
  const totalPanScroll = PAN_END - N * HOLD_SCROLL;

  const wps: Waypoint[] = [];
  let t = 0;
  for (let i = 0; i < N; i++) {
    wps.push({ t, center: CHAPTER_CENTERS[i] });       // hold start
    t += HOLD_SCROLL;
    wps.push({ t, center: CHAPTER_CENTERS[i] });       // hold end
    if (i < N - 1) {
      t += (panDists[i] / totalPanDist) * totalPanScroll; // pan to next
    }
  }
  return wps;
})();

/** Convert scroll progress [0,1] → { scale, center } */
function interpolateScroll(t: number): { scale: number; center: number } {
  if (t <= PAN_END) {
    for (let i = 0; i < WAYPOINTS.length - 1; i++) {
      if (t <= WAYPOINTS[i + 1].t) {
        const w0 = WAYPOINTS[i], w1 = WAYPOINTS[i + 1];
        if (w0.t === w1.t) return { scale: FIXED_ZOOM, center: w0.center };
        const segT = (t - w0.t) / (w1.t - w0.t);
        // Ease during pans, linear during holds (same center so doesn't matter)
        const e = w0.center === w1.center ? segT : easeInOutCubic(segT);
        return {
          scale: FIXED_ZOOM,
          center: w0.center + (w1.center - w0.center) * e,
        };
      }
    }
    const last = WAYPOINTS[WAYPOINTS.length - 1];
    return { scale: FIXED_ZOOM, center: last.center };
  }
  // Overview zoom-out
  const lastCenter = WAYPOINTS[WAYPOINTS.length - 1].center;
  const zoomT = easeInOutCubic((t - PAN_END) / (1 - PAN_END));
  return {
    scale: FIXED_ZOOM + (1 - FIXED_ZOOM) * zoomT,
    center: lastCenter + (0.5 - lastCenter) * zoomT,
  };
}

/** Scroll t at the midpoint of a chapter's hold */
function chapterScrollT(chapterIndex: number): number {
  const holdStart = WAYPOINTS[chapterIndex * 2].t;
  const holdEnd = WAYPOINTS[chapterIndex * 2 + 1].t;
  return (holdStart + holdEnd) / 2;
}

/** Scroll t where the pan TOWARDS chapter i+1 begins (hold-end of chapter i) */
function panStartT(chapterIndex: number): number {
  return WAYPOINTS[chapterIndex * 2 + 1].t;
}
/** Scroll t where the pan TOWARDS chapter i ends (hold-start of chapter i) */
function panEndT(chapterIndex: number): number {
  return WAYPOINTS[chapterIndex * 2].t;
}

// ─── Present-position mapping ──────────────────────────────────────────
//
// Maps scroll progress → SVG x-coordinate of the "present" point.
// During a chapter hold the present sits at that chapter's end year;
// during pans it interpolates to the next chapter's end year.

const CHAPTER_END_X = CHAPTER_BOUNDS.map((b) => yearToPosition(b.to) * STRIP_X_MAX);

function presentX(t: number): number {
  // Overview — everything revealed
  if (t >= PAN_END) return CHAPTER_END_X[CHAPTER_END_X.length - 1];

  // During ch0 hold
  if (t <= panStartT(0)) return CHAPTER_END_X[0];

  for (let i = 0; i < CHAPTER_END_X.length - 1; i++) {
    const pStart = panStartT(i);   // hold-end of chapter i
    const pEnd = panEndT(i + 1);   // hold-start of chapter i+1

    if (t <= pEnd) {
      // In the pan from ch[i] to ch[i+1]
      const segT = (t - pStart) / (pEnd - pStart);
      const eased = easeInOutCubic(segT);
      return CHAPTER_END_X[i] + (CHAPTER_END_X[i + 1] - CHAPTER_END_X[i]) * eased;
    }

    // During ch[i+1] hold
    if (t <= panStartT(i + 1)) return CHAPTER_END_X[i + 1];
  }

  return CHAPTER_END_X[CHAPTER_END_X.length - 1];
}

/** Chapter overlay opacity — snaps to 1 when the pan towards this
 *  chapter begins, stays visible permanently (including overview).
 *  Overlays scale down during zoom-out so they stay aligned with the SVG. */
function computeChapterOpacity(t: number, chapterIndex: number): number {
  // ch0 is always visible from the start
  if (chapterIndex === 0) return 1;
  // Appear when the pan towards this chapter starts (previous hold ends)
  const panTowards = panStartT(chapterIndex - 1);
  return t >= panTowards ? 1 : 0;
}

// ─── Chapter overlay (horizontal git graph) ────────────────────────────

/** Pad from viewport edges — enough room for commit label text */
const PAD_PCT = 12;
/** How far below the main line the branch runs (px) */
const BRANCH_DROP = 60;
/** Curve radius for fork/merge bends */
const CURVE_R = 20;

/**
 * Map a year to viewport percentage for a given chapter's zoom.
 * Uses the strip's yearToPosition so commits/braces align with the
 * underlying SVG dots perfectly.
 */
function yearToViewportPct(
  year: number,
  chapterCenter: number,
  zoom: number,
): number {
  return ((yearToPosition(year) - chapterCenter) * zoom + 0.5) * 100;
}

function ChapterOverlay({
  chapter,
  chapterIndex,
}: {
  chapter: TimelineChapter;
  chapterIndex: number;
}) {
  const zoom = CHAPTER_ZOOM[chapterIndex];
  const n = chapter.commits.length;
  const span = 100 - 2 * PAD_PCT;

  // Use chronological positioning if all commits have years,
  // otherwise fall back to even spacing. Then spread out any
  // clusters where commits share the same year.
  const allHaveYears = chapter.commits.every((c) => c.year != null);
  const rawPositions = chapter.commits.map((c, i) => {
    if (allHaveYears) {
      // Extract numeric year from strings like "Dec 2013" or "2018"
      const yearNum = parseFloat(c.year!.replace(/[^0-9.]/g, ""));
      return yearToViewportPct(yearNum, chapter.stripPosition, zoom);
    }
    return PAD_PCT + (n > 1 ? (i / (n - 1)) * span : span / 2);
  });

  // Spread clusters symmetrically around their center
  const MIN_GAP = 5; // minimum % between adjacent commits
  const positions = [...rawPositions];
  let ci = 0;
  while (ci < positions.length) {
    let cj = ci + 1;
    while (
      cj < positions.length &&
      rawPositions[cj] - rawPositions[ci] < MIN_GAP
    )
      cj++;
    const size = cj - ci;
    if (size > 1) {
      const center = (rawPositions[ci] + rawPositions[cj - 1]) / 2;
      const totalSpan = (size - 1) * MIN_GAP;
      for (let k = 0; k < size; k++) {
        positions[ci + k] = center - totalSpan / 2 + k * MIN_GAP;
      }
    }
    ci = cj;
  }

  const commitX = (i: number) => positions[i];

  const forkIdx = Math.max(1, Math.floor(n * 0.3));
  const mergeIdx = Math.min(n - 1, Math.ceil(n * 0.85));
  const forkPct = commitX(forkIdx);
  const mergePct = commitX(mergeIdx);

  // Scale dot size with zoom so dots look consistent across chapters
  const dotScale = Math.max(1, zoom / 2.2);
  const dotSize = Math.round(12 * dotScale);
  const borderW = Math.round(2 * dotScale);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* ── Floating notes (no dot) — positioned between two years ── */}
      {chapter.notes?.map((note, idx) => {
        const leftPct = yearToViewportPct(
          note.fromYear,
          chapter.stripPosition,
          zoom,
        );
        const rightPct = yearToViewportPct(
          note.toYear,
          chapter.stripPosition,
          zoom,
        );
        const widthPct = rightPct - leftPct;
        // Inset slightly so text doesn't butt up against the year dots
        const pad = widthPct * 0.25;
        return (
          <div
            key={idx}
            className="absolute flex items-center justify-center text-left"
            style={{
              left: `${leftPct + pad}%`,
              width: `${widthPct - pad * 2}%`,
              top: "calc(50% + 56px)",
            }}
          >
            <span className="text-[11px] text-foreground/60 italic leading-tight">
              {note.text}
            </span>
          </div>
        );
      })}

      {/* ── Commit dots + stem lines + labels below the strip line ── */}
      <div
        className="absolute left-0 right-0"
        style={{ top: "50%", height: `${BRANCH_DROP + 200}px` }}
      >
        {(() => {
          // Compute staggered stem heights: commits that are close horizontally
          // get progressively longer stems so their labels don't overlap.
          const STEM_BASE = 44; // aligns commit labels with note text (~56px below centre)
          const STEM_STEP = 80; // extra drop for staggered (alternating) commits
          const CLUSTER_THRESH = 12; // % threshold — commits closer than this stagger

          // Sliding-window cluster detection: each commit is compared to its
          // immediate predecessor, so chains of close commits form one cluster.
          // Within a cluster, alternate between two heights (short/long) so
          // labels don't cascade endlessly downward.
          const stemHeights: number[] = new Array(n).fill(STEM_BASE);
          let si = 0;
          while (si < n) {
            let sj = si + 1;
            while (sj < n && positions[sj] - positions[sj - 1] < CLUSTER_THRESH)
              sj++;
            const clusterSize = sj - si;
            if (clusterSize > 1) {
              for (let k = 0; k < clusterSize; k++) {
                stemHeights[si + k] = STEM_BASE + (k % 2) * STEM_STEP;
              }
            }
            si = sj;
          }

          // Compute boundary dot viewport positions for proximity checks.
          // When a commit dot is close to a boundary dot, anchor the label
          // AWAY from the boundary so text doesn't overlap with the year label.
          const boundaryPcts = [2000, 2005, 2014, 2019, 2024, 2026, 2028].map(
            (y) => yearToViewportPct(y, chapter.stripPosition, zoom),
          );

          return chapter.commits.map((commit, j) => {
            const x = commitX(j);
            const stemH = stemHeights[j];

            // Anchor labels away from nearby boundary dots or adjacent commits
            const nearLeft = x < 15;
            const nearRight = x > 85;

            const nearBoundaryRight = boundaryPcts.some(
              (bp) => bp > x && bp - x < 10,
            );
            const nearBoundaryLeft = boundaryPcts.some(
              (bp) => bp < x && x - bp < 10,
            );

            // Also check proximity to adjacent commits in the cluster
            const nextCommitClose = j < n - 1 && positions[j + 1] - x < 10;
            const prevCommitClose = j > 0 && x - positions[j - 1] < 10;

            let anchorClass: string;
            if (commit.anchor === "right") {
              anchorClass = "right-0 items-end text-right";
            } else if (commit.anchor === "left") {
              anchorClass = "left-0 items-start text-left";
            } else if (commit.anchor === "center") {
              anchorClass = "left-1/2 -translate-x-1/2 items-start text-left";
            } else if (nearLeft || nearBoundaryLeft) {
              anchorClass = "left-0 items-start text-left";
            } else if (nearRight || nearBoundaryRight || nextCommitClose) {
              anchorClass = "right-0 items-end text-right";
            } else if (prevCommitClose) {
              anchorClass = "left-0 items-start text-left";
            } else {
              anchorClass = "left-1/2 -translate-x-1/2 items-start text-left";
            }

            const dateLabel = commit.displayYear || commit.year;

            return (
              <div
                key={j}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: 0,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Date label above the dot */}
                {dateLabel && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-foreground/60 font-medium"
                    style={{ bottom: `calc(100% + 4px)` }}
                  >
                    {dateLabel}
                  </div>
                )}
                <div
                  className="rounded-full bg-accent border-background relative z-10"
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderWidth: borderW,
                    borderStyle: "solid",
                  }}
                />
                {/* Vertical stem line */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 bg-foreground/20"
                  style={{
                    top: "100%",
                    height: `${stemH}px`,
                    width: Math.max(1, dotScale),
                  }}
                />
                {/* Label below the stem */}
                <div
                  className={`absolute flex flex-col ${anchorClass}`}
                  style={{ top: `calc(100% + ${stemH + 4}px)` }}
                >
                  {commit.message.split("\n").map((line, li) => (
                    <span
                      key={li}
                      className="whitespace-nowrap text-[11px] text-foreground/80 font-medium leading-tight"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            );
          });
        })()}

        {/* ── Branches (below the strip line) ── */}
        {chapter.branches?.map((branch) => {
          const branchEvents = branch.events;
          const ne = branchEvents.length;

          // Use year-based positioning when forkYear/mergeYear are provided
          const bForkPct = branch.forkYear
            ? yearToViewportPct(
                parseFloat(branch.forkYear),
                chapter.stripPosition,
                zoom,
              )
            : forkPct;
          const bMergePct = branch.mergeYear
            ? yearToViewportPct(
                parseFloat(branch.mergeYear),
                chapter.stripPosition,
                zoom,
              )
            : mergePct;

          const branchSpan = bMergePct - bForkPct;
          // Position dots closer to fork/merge ends with padding from the curves
          const padPct = branchSpan * 0.15;
          const eventPct = (k: number) =>
            ne === 1
              ? bForkPct + branchSpan / 2
              : bForkPct + padPct + (k / (ne - 1)) * (branchSpan - 2 * padPct);

          return (
            <div key={branch.name}>
              {/* Fork dot on the main line */}
              <div
                className="absolute rounded-full bg-accent border-background z-10"
                style={{
                  left: `${bForkPct}%`,
                  top: 0,
                  transform: "translate(-50%, -50%)",
                  width: dotSize,
                  height: dotSize,
                  borderWidth: borderW,
                  borderStyle: "solid",
                }}
              />

              <svg
                className="absolute overflow-visible"
                style={{
                  left: `calc(${bForkPct}% - ${CURVE_R}px)`,
                  top: 0,
                  width: CURVE_R * 2,
                  height: BRANCH_DROP + CURVE_R,
                }}
              >
                <path
                  d={`M ${CURVE_R} 0 C ${CURVE_R} ${CURVE_R}, ${CURVE_R * 2} ${CURVE_R}, ${CURVE_R * 2} ${BRANCH_DROP}`}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  strokeOpacity={0.45}
                />
              </svg>

              <div
                className="absolute h-[2px] border-t-2 border-dashed border-accent/30"
                style={{
                  left: `calc(${bForkPct}% + ${CURVE_R}px)`,
                  right: `calc(${100 - bMergePct}% + ${CURVE_R}px)`,
                  top: BRANCH_DROP,
                }}
              />

              <svg
                className="absolute overflow-visible"
                style={{
                  left: `calc(${bMergePct}% - ${CURVE_R}px)`,
                  top: 0,
                  width: CURVE_R * 2,
                  height: BRANCH_DROP + CURVE_R,
                }}
              >
                <path
                  d={`M 0 ${BRANCH_DROP} C 0 ${CURVE_R}, ${CURVE_R} ${CURVE_R}, ${CURVE_R} 0`}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  strokeOpacity={0.45}
                />
              </svg>

              {/* Merge dot on the main line */}
              <div
                className="absolute rounded-full bg-accent border-background z-10"
                style={{
                  left: `${bMergePct}%`,
                  top: 0,
                  transform: "translate(-50%, -50%)",
                  width: dotSize,
                  height: dotSize,
                  borderWidth: borderW,
                  borderStyle: "solid",
                }}
              />

              <div
                className="absolute font-mono text-[9px] text-accent/50 bg-accent/5 px-1.5 py-0.5 rounded-sm tracking-wider whitespace-nowrap"
                style={{
                  left: `${(bForkPct + bMergePct) / 2}%`,
                  top: BRANCH_DROP - 20,
                  transform: "translateX(-50%)",
                }}
              >
                {branch.name}
              </div>

              {branchEvents.map((event, k) => {
                const x = eventPct(k);
                const labelDrop = 6;
                return (
                  <div
                    key={k}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      top: BRANCH_DROP,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {/* Date label above the dot */}
                    {event.date && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-foreground/60 font-medium"
                        style={{ bottom: `calc(100% + 4px)` }}
                      >
                        {event.date}
                      </div>
                    )}
                    <div className="w-2.5 h-2.5 rounded-full bg-accent/50 border-2 border-background relative z-10" />
                    {/* Stem line from dot to label */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-px bg-accent/20"
                      style={{ top: "100%", height: `${labelDrop}px` }}
                    />
                    {(() => {
                      // First event aligns left, last aligns right, middle centers
                      const alignClass =
                        k === 0
                          ? "left-0 items-start text-left"
                          : k === ne - 1
                            ? "right-0 items-end text-right"
                            : "left-1/2 -translate-x-1/2 items-start text-left";
                      return (
                        <div
                          className={`absolute flex flex-col ${alignClass}`}
                          style={{ top: `calc(100% + ${labelDrop + 2}px)` }}
                        >
                          {event.text.split("\n").map((line, li) => (
                            <span
                              key={li}
                              className={`whitespace-nowrap text-[11px] ${li === 0 ? "text-foreground/80 font-medium" : "text-foreground/50"} leading-tight`}
                            >
                              {line}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Reduced-motion fallback (vertical) ────────────────────────────────

function ReducedMotionFallback() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        {timelineChapters.map((chapter) => (
          <div key={chapter.id} className="mb-12">
            <h3 className="text-xl font-bold">{chapter.title}</h3>
            <p className="text-sm text-muted font-mono">
              {chapter.subtitle} · {chapter.yearRange}
            </p>
            {chapter.description && (
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {chapter.description}
              </p>
            )}
            <div className="mt-3 space-y-1">
              {chapter.commits.map((c, i) => (
                <p key={i} className="text-sm text-foreground/80">
                  <span className="font-mono text-accent/60 text-xs">
                    {c.prefix}
                  </span>{" "}
                  {c.message}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main component ────────────────────────────────────────────────────

export default function ScrollZoomTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Refs for chapter overlay containers — updated imperatively to track SVG pan
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track viewport aspect ratio for viewBox calculation
  const aspectRef = useRef(0.6); // height / width fallback
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

  // Update SVG viewBox imperatively — no React re-renders, perfectly smooth
  const updateViewBox = useCallback((t: number) => {
    const svg = svgRef.current;
    if (!svg) return;

    const { scale: s, center: c } = interpolateScroll(t);
    const aspect = aspectRef.current;

    // viewBox width narrows as zoom increases
    const vbWidth = STRIP_X_MAX / s;
    // maintain aspect ratio so nothing distorts
    const vbHeight = vbWidth * aspect;
    // center on the current chapter position
    const vbX = c * STRIP_X_MAX - vbWidth / 2;
    // center vertically on y=0 (the main line), shifted down to clear heading
    const vbY = -vbHeight / 2 - vbHeight * VERTICAL_SHIFT;

    svg.setAttribute("viewBox", `${vbX} ${vbY} ${vbWidth} ${vbHeight}`);

    // Cordwalles Closed Scholarship sits inside the formative chapter and
    // should be visible throughout — both during zoom-in and the overview.
    const arcsGroup = svg.querySelector("#strip-transition-arcs");
    if (arcsGroup) {
      arcsGroup.setAttribute("opacity", "1");
    }

    // Recruitment Bursary spans the formative → Stellenbosch boundary, so we
    // hide it on chapter 0 and fade it in as the pan towards chapter 1 begins.
    // It stays at full opacity afterwards (including the overview zoom-out).
    const recruitmentArc = svg.querySelector("#strip-recruitment-arc");
    if (recruitmentArc) {
      const panStart = panStartT(0);
      const panEnd = panEndT(1);
      let recruitmentOp: number;
      if (t <= panStart) recruitmentOp = 0;
      else if (t >= panEnd) recruitmentOp = 1;
      else recruitmentOp = smoothstep((t - panStart) / (panEnd - panStart));
      recruitmentArc.setAttribute("opacity", String(recruitmentOp));
    }

    // Growing line — extends from 2019 rightward as scroll advances.
    const px = presentX(t);
    const growingLine = svg.querySelector("#strip-growing-line");
    if (growingLine) growingLine.setAttribute("x2", String(px));

    // Clip rect — advances with the growing line to gradually reveal
    // institution labels and transition arcs (text emerges smoothly).
    const clipRect = svg.querySelector("#present-clip-rect");
    if (clipRect) clipRect.setAttribute("width", String(px));

    // Threshold-based reveal for dots + year labels — they snap to full
    // opacity so circles and small text aren't clipped in half.
    const revealEls = svg.querySelectorAll("[data-reveal-x]");
    revealEls.forEach((el) => {
      const rx = parseFloat(el.getAttribute("data-reveal-x") || "9999");
      el.setAttribute("opacity", px >= rx ? "1" : "0");
    });

    // Future arcs are revealed by the clip-path attached to the growing line,
    // so we leave them at full opacity at every zoom level (including overview).
    const futureArcs = svg.querySelector("#strip-future-arcs");
    if (futureArcs) futureArcs.setAttribute("opacity", "1");

    // Move chapter overlays (HTML) in sync with the SVG pan so commits,
    // branches, and notes appear anchored to their point on the timeline.
    // scale(relZoom) keeps overlays correctly positioned during overview
    // zoom-out — internal positions are designed for FIXED_ZOOM, so
    // scaling by s/FIXED_ZOOM compensates as the SVG zooms out.
    // clip-path clips from the right so content emerges progressively,
    // matching the growing line and institution label reveal.
    const relZoom = s / FIXED_ZOOM;
    for (let i = 0; i < CHAPTER_CENTERS.length; i++) {
      const el = overlayRefs.current[i];
      if (el) {
        const shift = (CHAPTER_CENTERS[i] - c) * s * 100;
        // Map presentX to viewport % in this overlay's local coordinate system
        const presentVP = ((px / STRIP_X_MAX - CHAPTER_CENTERS[i]) * FIXED_ZOOM + 0.5) * 100;
        const rightClip = Math.max(0, 100 - presentVP);
        el.style.transform = `translateX(${shift}%) translateY(${VERTICAL_SHIFT * 100}%) scale(${relZoom})`;
        el.style.clipPath = rightClip > 0.5 ? `inset(0 ${rightClip}% 0 0)` : "none";
      }
    }

    // ── Typewriter description ────────────────────────────────────────
    // Determine active chapter, compute typing progress, update text.
    // During overview zoom-out, type an overview summary paragraph.
    if (descTextRef.current && descCursorRef.current && descContainerRef.current) {
      descContainerRef.current.style.opacity = "1";

      if (t > PAN_END) {
        // Overview zoom-out — type the summary paragraph
        const overviewText = OVERVIEW_TEXT;
        const typeProgress = Math.min(1, (t - PAN_END) / ((1 - PAN_END) * 0.85));
        const charCount = Math.floor(typeProgress * overviewText.length);

        if (activeChapterRef.current !== -2) {
          activeChapterRef.current = -2; // sentinel for overview
          descTextRef.current.textContent = "";
        }

        descTextRef.current.textContent = overviewText.substring(0, charCount);
        descCursorRef.current.style.display = typeProgress < 1 ? "inline-block" : "none";
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

        // Skip scroll-based update for ch0 while the time-based intro
        // animation is still running — it handles its own typing.
        const skipForIntro = active === 0 && !introTypingDoneRef.current;

        if (!skipForIntro) {
          const chapter = timelineChapters[active];
          const text = chapter.description || "";

          // Typing window: from pan-towards start to hold start.
          // Typing finishes when you arrive at the chapter, leaving the
          // entire hold duration as reading time before panning away.
          const typeStart = active === 0 ? 0 : panStartT(active - 1);
          const typeEnd = WAYPOINTS[active * 2].t; // hold start of this chapter
          const typeRange = typeEnd - typeStart;
          const typeProgress = typeRange > 0
            ? Math.min(1, Math.max(0, (t - typeStart) / typeRange))
            : 1;
          const charCount = Math.floor(typeProgress * text.length);

          // On chapter transition, clear text immediately
          if (active !== activeChapterRef.current) {
            activeChapterRef.current = active;
            descTextRef.current.textContent = "";
          }

          descTextRef.current.textContent = text.substring(0, charCount);

          // Show blinking cursor while typing, hide when complete
          descCursorRef.current.style.display = typeProgress < 1 ? "inline-block" : "none";
        }
      }
    }
  }, []);

  // Time-based typewriter for ch0 — types on page load without scrolling
  useEffect(() => {
    const text = timelineChapters[0].description || "";
    const duration = 6000; // 6 seconds to type the full paragraph
    const startTime = performance.now();
    activeChapterRef.current = 0;

    let raf: number;
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const charCount = Math.floor(progress * text.length);

      if (descTextRef.current) {
        descTextRef.current.textContent = text.substring(0, charCount);
      }
      if (descCursorRef.current) {
        descCursorRef.current.style.display = progress < 1 ? "inline-block" : "none";
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

  // Subscribe to scroll progress
  useEffect(() => {
    // Set initial viewBox
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

  // ─── Typewriter description ──────────────────────────────────────────
  //
  // Instead of cross-fading, each chapter's description types out
  // character by character as you scroll through it. Typing starts when
  // the pan towards the chapter begins (or t=0 for ch0) and finishes
  // by the end of the chapter's hold. A blinking cursor shows during typing.

  const descTextRef = useRef<HTMLSpanElement>(null);
  const descCursorRef = useRef<HTMLSpanElement>(null);
  const descContainerRef = useRef<HTMLDivElement>(null);
  /** Track active chapter to detect transitions (clear old text) */
  const activeChapterRef = useRef(-1);
  /** True once the time-based ch0 intro typing finishes */
  const introTypingDoneRef = useRef(false);

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
            <p className="font-mono text-sm text-accent tracking-wider uppercase mb-2">
              About
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              The Engineer Behind the Code
            </h2>
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
        {/*
         * SVG with viewBox zoom — updated imperatively (no CSS transform),
         * so the browser re-renders at native resolution every frame.
         * Result: perfectly crisp lines, dots, and text at any zoom level.
         */}
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
            ref={(el) => { overlayRefs.current[i] = el; }}
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
