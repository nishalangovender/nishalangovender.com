import type { PathKind, ReferencePoint } from "./types";

const TWO_PI = Math.PI * 2;
const PERIOD = 20; // seconds — one full traversal
const A = 5;       // metres — lemniscate semi-width
const R = 4;       // metres — circle radius

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
    case "figure-eight": {
      // Lissajous (1, 2) — horizontal figure eight
      const x = A * Math.sin(phase);
      const y = A * Math.sin(2 * phase) / 2;
      const dx = A * Math.cos(phase);
      const dy = A * Math.cos(2 * phase);
      const ddx = -A * Math.sin(phase);
      const ddy = -2 * A * Math.sin(2 * phase);
      const theta = Math.atan2(dy, dx);
      const speedSq = dx * dx + dy * dy;
      const kappa = (dx * ddy - dy * ddx) / (speedSq ** 1.5 || 1e-9);
      return { x, y, theta, kappa, t };
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
