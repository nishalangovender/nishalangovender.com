/**
 * The AGV's mission, map frame, metres: drive straight off the page from
 * base_link to the desk's edge and wait there while the desk shrinks away
 * beneath it, then drive on into the factory and lap a rounded loop down the
 * aisle between the rack rows.
 */
import { clamp01, smoothstep } from "@/lib/math";
import type { Pose } from "@/lib/path-following/types";

import { BEATS, loopTime } from "./beats";
import { PIVOT } from "./desk-layout";
import { FACTORY_CENTRE } from "./factory";
import { BASE_LINK } from "./sketch";

/** Cruise speed along the mission, m/s. */
export const MISSION_SPEED = 1.3;
/** Seconds into the deploy beat before the AGV moves off the page. */
export const DEPART_DELAY = 0.6;

const HALF_X = 4;
const LOOP_Y = 1.8;
const R = LOOP_Y / 2;
const STEP = 0.05;
const CX = FACTORY_CENTRE.x;

/** Where the lead-in meets the loop: the start of the loop's bottom straight. */
const LOOP_ENTRY = { x: CX - HALF_X + R, y: 0 };

function buildLoop(): Pose[] {
  const pts: Pose[] = [];
  const straight = (x0: number, x1: number, y: number, theta: number) => {
    const n = Math.max(1, Math.round(Math.abs(x1 - x0) / STEP));
    for (let i = 0; i < n; i++) pts.push({ x: x0 + ((x1 - x0) * i) / n, y, theta });
  };
  const turn = (cx: number, cy: number, from: number) => {
    const n = Math.round((Math.PI * R) / STEP);
    for (let i = 0; i < n; i++) {
      const a = from + (Math.PI * i) / n;
      pts.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), theta: a + Math.PI / 2 });
    }
  };
  straight(LOOP_ENTRY.x, CX + HALF_X - R, 0, 0);
  turn(CX + HALF_X - R, R, -Math.PI / 2);
  straight(CX + HALF_X - R, CX - HALF_X + R, LOOP_Y, Math.PI);
  turn(CX - HALF_X + R, R, Math.PI / 2);
  return pts;
}

/** The closed loop inside the factory, starting at its entry point. */
export const LOOP: readonly Pose[] = buildLoop();

/** Straight run from base_link on the page to the loop entry. */
export const LEAD_IN_LENGTH = LOOP_ENTRY.x - BASE_LINK.x;

const CUMULATIVE: number[] = LOOP.reduce<number[]>((acc, p, i) => {
  if (i === 0) return [0];
  const q = LOOP[i - 1];
  acc.push(acc[i - 1] + Math.hypot(p.x - q.x, p.y - q.y));
  return acc;
}, []);

export const LOOP_LENGTH =
  CUMULATIVE[CUMULATIVE.length - 1] +
  Math.hypot(LOOP[0].x - LOOP[LOOP.length - 1].x, LOOP[0].y - LOOP[LOOP.length - 1].y);

function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

/** Pose `d` metres round the loop (wrapping). */
export function loopPose(d: number): Pose {
  const s = ((d % LOOP_LENGTH) + LOOP_LENGTH) % LOOP_LENGTH;
  let i = CUMULATIVE.findIndex((c) => c > s) - 1;
  if (i < 0) i = CUMULATIVE.length - 1;
  const a = LOOP[i];
  const b = LOOP[(i + 1) % LOOP.length];
  const segEnd = i + 1 < CUMULATIVE.length ? CUMULATIVE[i + 1] : LOOP_LENGTH;
  const k = (s - CUMULATIVE[i]) / (segEnd - CUMULATIVE[i] || 1);
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    theta: a.theta + wrapAngle(b.theta - a.theta) * k,
  };
}

/** Pose `s` metres along the mission: the lead-in off the page, then the loop. */
export function missionPose(s: number): Pose {
  if (s < LEAD_IN_LENGTH) return { x: BASE_LINK.x + Math.max(0, s), y: 0, theta: 0 };
  return loopPose(s - LEAD_IN_LENGTH);
}

const deploy = BEATS.find((b) => b.id === "deploy")!;
const system = BEATS.find((b) => b.id === "system")!;

/** Seconds the desk takes to shrink away beneath the parked AGV, and to grow back. */
export const SHRINK_TIME = 2;
const REGROW = { after: 0.2, time: 1.8 } as const;

/** Distance along the lead-in to the pivot at the desk's edge, where the AGV waits. */
const PARK_DISTANCE = PIVOT.x - BASE_LINK.x;
/** Loop time the AGV reaches the pivot and the desk starts to shrink. */
export const SHRINK_START = deploy.start + DEPART_DELAY + PARK_DISTANCE / MISSION_SPEED;

/** Distance travelled along the mission at loop time `t`, holding at the pivot while the desk shrinks. */
export function missionDistance(t: number): number {
  const lt = loopTime(t);
  if (lt < deploy.start) return 0;
  const driven = Math.max(0, Math.min(lt, system.end) - (deploy.start + DEPART_DELAY)) * MISSION_SPEED;
  if (driven <= PARK_DISTANCE) return driven;
  return Math.max(PARK_DISTANCE, driven - SHRINK_TIME * MISSION_SPEED);
}

/**
 * The desk's scale at `t` (1 full size, 0 gone): it shrinks towards the
 * floor beneath the parked AGV, stays away while the AGV is out in the
 * factory, and grows back early in the system beat, before the camera flies
 * into the monitor on it.
 */
export function deskScale(t: number): number {
  const lt = loopTime(t);
  const regrow = system.start + REGROW.after;
  if (lt < SHRINK_START || lt >= regrow + REGROW.time) return 1;
  if (lt < regrow) return 1 - smoothstep(clamp01((lt - SHRINK_START) / SHRINK_TIME));
  return smoothstep((lt - regrow) / REGROW.time);
}

/**
 * How far the hero AGV has materialised from wireframe into the solid robot:
 * it becomes real as the desk shrinks away beneath it, and stays solid for
 * the rest of the loop.
 */
export function materialised(t: number): number {
  return smoothstep(clamp01((loopTime(t) - SHRINK_START) / SHRINK_TIME));
}
