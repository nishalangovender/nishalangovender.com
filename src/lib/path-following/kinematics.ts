// src/lib/path-following/kinematics.ts
import type { Pose } from "./types";

/**
 * Exact integration of differential-drive motion over dt with constant
 * linear velocity v and angular velocity omega. Handles omega ≈ 0 case.
 */
export function stepKinematics(
  pose: Pose & { v: number },
  v: number,
  omega: number,
  dt: number,
): Pose & { v: number } {
  const { x, y, theta } = pose;
  if (Math.abs(omega) < 1e-6) {
    return {
      x: x + v * Math.cos(theta) * dt,
      y: y + v * Math.sin(theta) * dt,
      theta,
      v,
    };
  }
  const newTheta = theta + omega * dt;
  const radius = v / omega;
  return {
    x: x + radius * (Math.sin(newTheta) - Math.sin(theta)),
    y: y - radius * (Math.cos(newTheta) - Math.cos(theta)),
    theta: wrapAngle(newTheta),
    v,
  };
}

export function wrapAngle(a: number): number {
  let out = a;
  while (out > Math.PI) out -= 2 * Math.PI;
  while (out < -Math.PI) out += 2 * Math.PI;
  return out;
}
