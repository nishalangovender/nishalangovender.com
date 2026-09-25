/**
 * The AGV's mission, map frame, metres: drive straight off the page from
 * base_link, across the desk and into the factory, then lap a rounded loop
 * down the aisle between the rack rows.
 */
import type { Pose } from "@/lib/path-following/types";

import { BEATS, loopTime } from "./beats";
import { FACTORY_CENTRE } from "./factory";
import { BASE_LINK } from "./sketch";

/** Cruise speed along the mission, m/s. */
export const MISSION_SPEED = 1.4;
/** Seconds into the deploy beat before the AGV moves off the page. */
export const DEPART_DELAY = 0.2;

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

/** Distance travelled along the mission at loop time `t`. */
export function missionDistance(t: number): number {
  const lt = loopTime(t);
  const moving = Math.min(lt, system.end) - (deploy.start + DEPART_DELAY);
  return lt < deploy.start ? 0 : Math.max(0, moving) * MISSION_SPEED;
}
