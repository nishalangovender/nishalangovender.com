/**
 * The desk the story starts on, in the ROS map frame (x forward, y left,
 * metres; heights above the factory floor). The notebook lies on the desk,
 * the monitor stands behind it, and a ramp runs from the desk's right edge
 * down to the factory floor so the AGV can drive off the page and into the
 * factory.
 */
import { smoothstep } from "@/lib/math";
import type { Pose } from "@/lib/path-following/types";

import { AGV, PAGE } from "./sketch";

/** Desk top footprint and height — wide enough for the open notebook spread. */
export const DESK = { minX: -7.2, maxX: 3.3, minY: -2.4, maxY: 3.9, height: 2.2, thickness: 0.16 } as const;

/** Notebook build-up on the desk: cover board, then the page block. */
export const NOTEBOOK = { cover: 0.05, pages: 0.14, coverMargin: 0.14 } as const;

/** Height of the top page — where the sketch is drawn and the AGV is parked. */
export const PAGE_HEIGHT = DESK.height + NOTEBOOK.cover + NOTEBOOK.pages;

/** Ramp from the desk's right edge down to the floor, centred on the mission lane (y = 0). */
export const RAMP = { fromX: DESK.maxX, toX: DESK.maxX + 3, width: 1.8 } as const;

/** Right edges of the page block and the cover board under it: the steps down onto the desk. */
const PAGE_EDGE = PAGE.width / 2;
const COVER_EDGE = PAGE_EDGE + NOTEBOOK.coverMargin;

/**
 * Surface height at map point (x, y), with real steps: the page, the cover
 * board's rim, the desk, the ramp or the factory floor. Only the mission
 * lane (y = 0) leaves the desk down the ramp.
 */
export function surfaceHeight(x: number, y: number): number {
  if (x <= COVER_EDGE && Math.abs(y) <= PAGE.depth / 2 + NOTEBOOK.coverMargin) {
    const onPages = x <= PAGE_EDGE && Math.abs(y) <= PAGE.depth / 2;
    return onPages ? PAGE_HEIGHT : DESK.height + NOTEBOOK.cover;
  }
  if (x <= RAMP.fromX) return DESK.height;
  if (x <= RAMP.toX && Math.abs(y) <= RAMP.width / 2) {
    return DESK.height * (1 - (x - RAMP.fromX) / (RAMP.toX - RAMP.fromX));
  }
  return 0;
}

/** Where the surface changes slope or steps along the lane — a rolling wheel can rest on these corners. */
const CORNERS = [PAGE_EDGE, COVER_EDGE, RAMP.fromX, RAMP.toX];
/** Samples across a wheel's footprint, between the corners. */
const FOOTPRINT_SAMPLES = 24;

/**
 * Height of a rigid wheel's centre, radius `r`, at map point (x, y): the
 * highest the circle can sit on the surface beneath it. Over a step it rolls
 * round the edge; on the ramp it rests on the slope.
 */
export function wheelCentreHeight(x: number, y: number, r: number): number {
  const at = (sx: number) => surfaceHeight(sx, y) + Math.sqrt(Math.max(0, r * r - (x - sx) ** 2));
  let best = at(x);
  for (let i = 0; i <= FOOTPRINT_SAMPLES; i++) best = Math.max(best, at(x - r + (2 * r * i) / FOOTPRINT_SAMPLES));
  for (const c of CORNERS) {
    // A corner is where the upper surface ends; approach it from the high side.
    if (Math.abs(x - c) <= r) best = Math.max(best, at(c), at(c - 1e-6));
  }
  return best;
}

/** Bisection steps for the body pitch, and the range searched (radians, nose-down positive). */
const PITCH_STEPS = 30;
const PITCH_RANGE = [-1, 1.2] as const;

/**
 * Where the AGV body sits for a pose: the drive axle and the castor each
 * rest on the surface, so rolling off the notebook the small castor drops
 * first (the nose dips), then the drive wheels follow, and the castor tips
 * onto the ramp before them. `height` is the ground under the drive axle;
 * `pitch` is nose-down, radians.
 */
export function bodyPose({ x, y, theta }: Pose): { height: number; pitch: number } {
  const rear = wheelCentreHeight(x, y, AGV.wheelRadius);
  // In the body frame the castor axle sits `castorX` ahead of the drive axle
  // and `lift` below it. Pitched nose-down by φ, it is castorX·cos φ − lift·sin φ
  // ahead and castorX·sin φ + lift·cos φ below. The body settles at the φ
  // where the castor just touches the surface there; the gap shrinks as φ
  // grows, so bisect for it.
  const lift = AGV.wheelRadius - AGV.castorRadius;
  const gap = (phi: number) => {
    const ahead = AGV.castorX * Math.cos(phi) - lift * Math.sin(phi);
    const castor = rear - (AGV.castorX * Math.sin(phi) + lift * Math.cos(phi));
    return castor - wheelCentreHeight(x + ahead * Math.cos(theta), y + ahead * Math.sin(theta), AGV.castorRadius);
  };
  let [lo, hi]: number[] = [...PITCH_RANGE];
  for (let i = 0; i < PITCH_STEPS; i++) {
    const mid = (lo + hi) / 2;
    if (gap(mid) > 0) lo = mid;
    else hi = mid;
  }
  const pitch = (lo + hi) / 2;
  return { height: rear - AGV.wheelRadius * Math.cos(pitch), pitch };
}

/**
 * How far the AGV has materialised from wireframe into the solid robot at
 * map x: none on the desk, filling in down the ramp, solid on the floor.
 */
export function materialised(x: number): number {
  return smoothstep(Math.min(Math.max((x - RAMP.fromX) / (RAMP.toX - RAMP.fromX), 0), 1));
}
