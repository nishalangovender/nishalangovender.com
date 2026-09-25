/**
 * Click-to-drive: a nav goal on the factory floor, followed with the same
 * pure pursuit as the path-following demo. Pure maths on the map frame, so the
 * whole interaction is unit-tested without a canvas.
 */
import { clamp } from "@/lib/math";
import { computeLookahead, desiredOmega, findTarget } from "@/lib/path-following/pure-pursuit";
import type { Pose, ReferencePoint } from "@/lib/path-following/types";

import { clearance } from "./factory";
import { AGV } from "./sketch";

/** Seconds without a goal before the loop takes the scene back. */
export const IDLE_RESUME = 6;
/** Seconds the AGV takes to glide back onto its mission when the loop resumes. */
export const REJOIN_TIME = 1;
export const GOAL_TOLERANCE = 0.15;
const CRUISE = 0.9;
const MAX_OMEGA = 1.6;
const PATH_STEP = 0.05;
/** Heading error above which the AGV turns on the spot first (Nav2 RPP's rotate-to-heading). */
const ROTATE_THRESHOLD = Math.PI / 3;

export interface NavState {
  pose: Pose;
  /** Straight-line plan to the goal; empty once arrived. */
  path: ReferencePoint[];
  /** Progress index along `path`, so the lookahead never searches backwards. */
  index: number;
  cmd: { v: number; omega: number };
  /** Seconds since the last goal was reached (or set, if none reached yet). */
  idle: number;
}

/** A goal is valid only where the AGV's footprint clears every obstacle. */
export function isGoalValid(x: number, y: number): boolean {
  return clearance(x, y) > AGV.width / 2;
}

/** Straight-line plan from the pose to (x, y), sampled for pure pursuit. */
export function planTo(pose: Pose, x: number, y: number): ReferencePoint[] {
  const dx = x - pose.x;
  const dy = y - pose.y;
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / PATH_STEP));
  const theta = Math.atan2(dy, dx);
  return Array.from({ length: n + 1 }, (_, i) => ({
    x: pose.x + (dx * i) / n,
    y: pose.y + (dy * i) / n,
    theta,
    kappa: 0,
    t: i,
  }));
}

/** Starts (or retargets) live mode with a goal at (x, y). */
export function setGoal(pose: Pose, x: number, y: number): NavState {
  return { pose, path: planTo(pose, x, y), index: 0, cmd: { v: 0, omega: 0 }, idle: 0 };
}

/**
 * One control step: rotate on the spot while facing well away from the goal,
 * otherwise pure pursuit; unicycle integration; stop on arrival.
 */
export function stepNav(state: NavState, dt: number): NavState {
  const { pose, path } = state;
  if (path.length === 0) return { ...state, cmd: { v: 0, omega: 0 }, idle: state.idle + dt };

  const goal = path[path.length - 1];
  const dist = Math.hypot(goal.x - pose.x, goal.y - pose.y);
  if (dist < GOAL_TOLERANCE) return { ...state, path: [], index: 0, cmd: { v: 0, omega: 0 }, idle: 0 };

  const heading = Math.atan2(goal.y - pose.y, goal.x - pose.x);
  const error = Math.atan2(Math.sin(heading - pose.theta), Math.cos(heading - pose.theta));
  let v = 0;
  let omega: number;
  let index = state.index;
  if (Math.abs(error) > ROTATE_THRESHOLD) {
    omega = clamp(2 * error, -MAX_OMEGA, MAX_OMEGA);
  } else {
    v = Math.min(CRUISE, dist * 1.2);
    const lookahead = computeLookahead(v);
    const found = findTarget(path, pose, lookahead, state.index);
    index = found.index;
    omega = clamp(desiredOmega(pose, found.target, v, lookahead), -MAX_OMEGA, MAX_OMEGA);
  }
  const theta = pose.theta + omega * dt;
  return {
    pose: { x: pose.x + v * Math.cos(theta) * dt, y: pose.y + v * Math.sin(theta) * dt, theta },
    path,
    index,
    cmd: { v, omega },
    idle: 0,
  };
}

/** True once live mode has sat idle long enough to hand back to the loop. */
export function shouldResume(state: NavState): boolean {
  return state.path.length === 0 && state.idle >= IDLE_RESUME;
}

/** Pose `k` (0–1) of the way from `a` to `b`, turning the short way round. */
export function blendPose(a: Pose, b: Pose, k: number): Pose {
  const dTheta = Math.atan2(Math.sin(b.theta - a.theta), Math.cos(b.theta - a.theta));
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, theta: a.theta + dTheta * k };
}
