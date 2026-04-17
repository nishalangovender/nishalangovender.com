import type { PathKind, ReferencePoint } from "./types";

const TWO_PI = Math.PI * 2;
const PERIOD = 20; // seconds — one full traversal
const A = 5;       // metres — lemniscate semi-width
const R = 4;       // metres — circle radius

// Stadium: two straights of length 2·L and two semicircles of radius R.
const STADIUM_R = 2.5;
const STADIUM_L = 3;

/**
 * Sample the reference trajectory at a given parametric time t ∈ [0, duration].
 * Returns pose + signed curvature at that point. Periodic in PERIOD.
 */
export function samplePath(kind: PathKind, t: number): ReferencePoint {
  const phase = (TWO_PI * t) / PERIOD;
  switch (kind) {
    case "lemniscate": {
      // Lemniscate of Gerono: x = A sin(u), y = A sin(u) cos(u)
      const u = phase;
      const x = A * Math.sin(u);
      const y = A * Math.sin(u) * Math.cos(u);
      // Analytical heading and curvature via chain rule
      const dx = A * Math.cos(u);
      const dy = A * (Math.cos(u) ** 2 - Math.sin(u) ** 2);
      const ddx = -A * Math.sin(u);
      const ddy = -4 * A * Math.sin(u) * Math.cos(u);
      const theta = Math.atan2(dy, dx);
      const speedSq = dx * dx + dy * dy;
      const kappa = (dx * ddy - dy * ddx) / (speedSq ** 1.5 || 1e-9);
      return { x, y, theta, kappa, t };
    }
    case "circle": {
      const x = R * Math.cos(phase);
      const y = R * Math.sin(phase);
      const theta = phase + Math.PI / 2;
      return { x, y, theta, kappa: 1 / R, t };
    }
    case "stadium": {
      // Closed oval: straight → semicircle → straight → semicircle.
      // Parameterise by arc length to keep constant speed.
      const straight = 2 * STADIUM_L;
      const arc = Math.PI * STADIUM_R;
      const perimeter = 2 * (straight + arc);
      const s = ((t / PERIOD) % 1) * perimeter;

      // Segment 1: bottom straight, left → right at y = -R
      if (s < straight) {
        const x = -STADIUM_L + s;
        return { x, y: -STADIUM_R, theta: 0, kappa: 0, t };
      }
      // Segment 2: right semicircle, bottom → top
      if (s < straight + arc) {
        const a = (s - straight) / STADIUM_R - Math.PI / 2;
        return {
          x: STADIUM_L + STADIUM_R * Math.cos(a),
          y: STADIUM_R * Math.sin(a),
          theta: a + Math.PI / 2,
          kappa: 1 / STADIUM_R,
          t,
        };
      }
      // Segment 3: top straight, right → left at y = +R
      if (s < 2 * straight + arc) {
        const x = STADIUM_L - (s - straight - arc);
        return { x, y: STADIUM_R, theta: Math.PI, kappa: 0, t };
      }
      // Segment 4: left semicircle, top → bottom
      const a = (s - 2 * straight - arc) / STADIUM_R + Math.PI / 2;
      return {
        x: -STADIUM_L + STADIUM_R * Math.cos(a),
        y: STADIUM_R * Math.sin(a),
        theta: a + Math.PI / 2,
        kappa: 1 / STADIUM_R,
        t,
      };
    }
  }
}

/** Dense uniform sampling for rendering the reference line. */
export function densify(
  kind: PathKind,
  duration: number,
  samples: number,
): ReferencePoint[] {
  const out: ReferencePoint[] = [];
  for (let i = 0; i < samples; i++) {
    const t = (i / (samples - 1)) * duration;
    out.push(samplePath(kind, t));
  }
  return out;
}

/** Find nearest reference point to a query pose (brute-force over dense samples). */
export function nearestReference(
  samples: ReferencePoint[],
  x: number,
  y: number,
): { point: ReferencePoint; distance: number; index: number } {
  let best = 0;
  let bestD2 = Infinity;
  for (let i = 0; i < samples.length; i++) {
    const dx = samples[i].x - x;
    const dy = samples[i].y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) {
      bestD2 = d2;
      best = i;
    }
  }
  return {
    point: samples[best],
    distance: Math.sqrt(bestD2),
    index: best,
  };
}
