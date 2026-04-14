// ─── Scroll-zoom interpolation maths ───────────────────────────────────
// Pure functions and precomputed constants used by the ScrollZoomTimeline
// viewBox controller. Keeping this separate from React state and refs so
// the maths is independently testable and easy to tweak.

import {
  PRESENT_YEAR,
  STRIP_X_MAX,
  yearToPosition,
} from "./TimelineStrip";

/** How many viewports of scroll height the section occupies. */
export const SCROLL_SCREENS = 6;

/** Overview paragraph typed during the final zoom-out. */
export const OVERVIEW_TEXT =
  "From workshop tinkerer to mechatronics engineer — a journey shaped by curiosity, rigour, and a drive to build things that work. Whether it's autonomous vehicles, industrial automation, or the web app you're reading this on, I bring the same hands-on engineering mindset to every problem. Let's build something together.";

/** Year boundaries used for chapter centering. */
export const CHAPTER_BOUNDS: { from: number; to: number }[] = [
  { from: 2000, to: 2019 },
  { from: 2019, to: 2024 },
  { from: 2024, to: 2026 },
  { from: 2026, to: PRESENT_YEAR },
];

/** How much of the viewport a chapter fills. Lower = more zoomed out. */
const VIEW_PAD = 0.8;

/** Vertical offset applied to both SVG viewBox and HTML overlays. */
export const VERTICAL_SHIFT = 0.08;

const CHAPTER_WIDTH =
  yearToPosition(CHAPTER_BOUNDS[0].to) -
  yearToPosition(CHAPTER_BOUNDS[0].from);

/** All chapters share this zoom — shorter chapters just get more pixels-per-year. */
export const FIXED_ZOOM = VIEW_PAD / CHAPTER_WIDTH;

/** Per-chapter centres — midpoint of each chapter's year range on the strip. */
export const CHAPTER_CENTERS = CHAPTER_BOUNDS.map(
  ({ from, to }) => (yearToPosition(from) + yearToPosition(to)) / 2,
);

const CHAPTER_END_X = CHAPTER_BOUNDS.map(
  (b) => yearToPosition(b.to) * STRIP_X_MAX,
);

// ─── Easing helpers ─────────────────────────────────────────────────────

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothstep(x: number): number {
  return x * x * (3 - 2 * x);
}

// ─── Waypoint-based scroll interpolation ────────────────────────────────
//
// Scroll is divided into: hold → pan → hold → pan → … → hold → overview.
// Panning speed is proportional to distance so it feels even throughout.

export const HOLD_SCROLL = 0.08;
export const OVERVIEW_SCROLL = 0.15;
export const PAN_END = 1 - OVERVIEW_SCROLL;

interface Waypoint {
  t: number;
  center: number;
}

export const WAYPOINTS: Waypoint[] = (() => {
  const N = CHAPTER_CENTERS.length;
  const panDists = CHAPTER_CENTERS.slice(1).map(
    (c, i) => c - CHAPTER_CENTERS[i],
  );
  const totalPanDist = panDists.reduce((a, b) => a + b, 0);
  const totalPanScroll = PAN_END - N * HOLD_SCROLL;

  const wps: Waypoint[] = [];
  let t = 0;
  for (let i = 0; i < N; i++) {
    wps.push({ t, center: CHAPTER_CENTERS[i] });
    t += HOLD_SCROLL;
    wps.push({ t, center: CHAPTER_CENTERS[i] });
    if (i < N - 1) {
      t += (panDists[i] / totalPanDist) * totalPanScroll;
    }
  }
  return wps;
})();

/** Convert scroll progress [0, 1] → { scale, center }. */
export function interpolateScroll(t: number): {
  scale: number;
  center: number;
} {
  if (t <= PAN_END) {
    for (let i = 0; i < WAYPOINTS.length - 1; i++) {
      if (t <= WAYPOINTS[i + 1].t) {
        const w0 = WAYPOINTS[i];
        const w1 = WAYPOINTS[i + 1];
        if (w0.t === w1.t) return { scale: FIXED_ZOOM, center: w0.center };
        const segT = (t - w0.t) / (w1.t - w0.t);
        const e =
          w0.center === w1.center ? segT : easeInOutCubic(segT);
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

/** Scroll t where the pan towards chapter i+1 begins (hold-end of chapter i). */
export function panStartT(chapterIndex: number): number {
  return WAYPOINTS[chapterIndex * 2 + 1].t;
}

/** Scroll t where the pan towards chapter i ends (hold-start of chapter i). */
export function panEndT(chapterIndex: number): number {
  return WAYPOINTS[chapterIndex * 2].t;
}

/**
 * Map scroll progress → SVG x-coordinate of the "present" point.
 * Holds at chapter-end years and interpolates during pans.
 */
export function presentX(t: number): number {
  if (t >= PAN_END) return CHAPTER_END_X[CHAPTER_END_X.length - 1];
  if (t <= panStartT(0)) return CHAPTER_END_X[0];

  for (let i = 0; i < CHAPTER_END_X.length - 1; i++) {
    const pStart = panStartT(i);
    const pEnd = panEndT(i + 1);

    if (t <= pEnd) {
      const segT = (t - pStart) / (pEnd - pStart);
      const eased = easeInOutCubic(segT);
      return CHAPTER_END_X[i] + (CHAPTER_END_X[i + 1] - CHAPTER_END_X[i]) * eased;
    }
    if (t <= panStartT(i + 1)) return CHAPTER_END_X[i + 1];
  }

  return CHAPTER_END_X[CHAPTER_END_X.length - 1];
}

/**
 * Chapter overlay opacity — snaps to 1 when the pan towards this chapter
 * begins, stays visible permanently (including during the overview zoom-out).
 */
export function computeChapterOpacity(
  t: number,
  chapterIndex: number,
): number {
  if (chapterIndex === 0) return 1;
  const panTowards = panStartT(chapterIndex - 1);
  return t >= panTowards ? 1 : 0;
}
