/**
 * AGV wheel layout and rolling kinematics, in the base_link frame (x
 * forward, y up, z = −ROS y). Pure maths: how far each wheel rolls between
 * two poses, so both the wireframe and the solid robot spin them the same.
 */
import type { Pose } from "@/lib/path-following/types";

import { AGV } from "./sketch";

export type WheelId = "left" | "right" | "castor";

export interface Wheel {
  id: WheelId;
  /** Axle centre in the base_link frame. */
  x: number;
  y: number;
  z: number;
  radius: number;
  width: number;
}

/** Drive wheels either side of base_link (ROS left is −z), castor ahead. */
export const WHEELS: readonly Wheel[] = [
  { id: "left", x: 0, y: AGV.wheelRadius, z: -AGV.track / 2, radius: AGV.wheelRadius, width: AGV.wheelWidth },
  { id: "right", x: 0, y: AGV.wheelRadius, z: AGV.track / 2, radius: AGV.wheelRadius, width: AGV.wheelWidth },
  { id: "castor", x: AGV.castorX, y: AGV.castorRadius, z: 0, radius: AGV.castorRadius, width: AGV.castorWidth },
];

/** A pose jump bigger than this is a teleport (loop seam, rejoin), not driving: no spin. */
const MAX_STEP = 0.5;

/**
 * Distance each wheel's rim rolls between two poses: the forward travel,
 * plus or minus the turn for the drive wheels (differential drive).
 */
export function wheelTravel(prev: Pose, next: Pose): Record<WheelId, number> {
  const dx = next.x - prev.x;
  const dy = next.y - prev.y;
  const forward = dx * Math.cos(prev.theta) + dy * Math.sin(prev.theta);
  const turn = Math.atan2(Math.sin(next.theta - prev.theta), Math.cos(next.theta - prev.theta));
  if (Math.hypot(dx, dy) > MAX_STEP || Math.abs(turn) > MAX_STEP) return { left: 0, right: 0, castor: 0 };
  const half = AGV.track / 2;
  return { left: forward - turn * half, right: forward + turn * half, castor: forward };
}

/** Wheel spin (about its axle, radians) for a rim travel: rolling forward turns it clockwise seen from +z. */
export function spinFor(wheel: Wheel, travel: number): number {
  return -travel / wheel.radius;
}
