/**
 * The AGV's mission: a rounded loop down the aisle between the rack rows,
 * starting on base_link where the sketch left it. Map frame, metres.
 */
import type { Pose } from "@/lib/path-following/types";

import { BEATS, loopTime } from "./beats";
import { BASE_LINK } from "./sketch";

/** Cruise speed along the mission, m/s. */
export const MISSION_SPEED = 1.1;
/** Seconds into the deploy beat before the AGV moves — the factory forms first. */
export const DEPART_DELAY = 1.2;

const HALF_X = 4;
const LOOP_Y = 1.8;
const R = LOOP_Y / 2;
const STEP = 0.05;

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
  const x0 = BASE_LINK.x;
  straight(x0, HALF_X - R, 0, 0);
  turn(HALF_X - R, R, -Math.PI / 2);
  straight(HALF_X - R, -HALF_X + R, LOOP_Y, Math.PI);
  turn(-HALF_X + R, R, Math.PI / 2);
  straight(-HALF_X + R, x0, 0, 0);
  return pts;
}

export const MISSION: readonly Pose[] = buildLoop();

const CUMULATIVE: number[] = MISSION.reduce<number[]>((acc, p, i) => {
  if (i === 0) return [0];
  const q = MISSION[i - 1];
  acc.push(acc[i - 1] + Math.hypot(p.x - q.x, p.y - q.y));
  return acc;
}, []);

export const MISSION_LENGTH =
  CUMULATIVE[CUMULATIVE.length - 1] +
  Math.hypot(MISSION[0].x - MISSION[MISSION.length - 1].x, MISSION[0].y - MISSION[MISSION.length - 1].y);

function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

/** Pose `s` metres along the loop (wrapping). */
export function missionPose(s: number): Pose {
  const d = ((s % MISSION_LENGTH) + MISSION_LENGTH) % MISSION_LENGTH;
  let i = CUMULATIVE.findIndex((c) => c > d) - 1;
  if (i < 0) i = CUMULATIVE.length - 1;
  const a = MISSION[i];
  const b = MISSION[(i + 1) % MISSION.length];
  const segEnd = i + 1 < CUMULATIVE.length ? CUMULATIVE[i + 1] : MISSION_LENGTH;
  const k = (d - CUMULATIVE[i]) / (segEnd - CUMULATIVE[i] || 1);
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    theta: a.theta + wrapAngle(b.theta - a.theta) * k,
  };
}

const deploy = BEATS.find((b) => b.id === "deploy")!;
const system = BEATS.find((b) => b.id === "system")!;

/** Distance travelled along the mission at loop time `t`. */
export function missionDistance(t: number): number {
  const lt = loopTime(t);
  const moving = Math.min(lt, system.end) - (deploy.start + DEPART_DELAY);
  return lt < deploy.start ? 0 : Math.max(0, moving) * MISSION_SPEED;
}
