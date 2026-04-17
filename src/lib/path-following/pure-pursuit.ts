// src/lib/path-following/pure-pursuit.ts
import type { Pose, ReferencePoint } from "./types";

/** Speed-adaptive lookahead. L = 0.9|v| + 0.3, clamped to [0.5, 2.0]. */
export function computeLookahead(v: number): number {
  return Math.min(2.0, Math.max(0.5, 0.9 * Math.abs(v) + 0.3));
}

/**
 * Search forward along the reference from startIndex for the first sample
 * whose distance from the pose is ≥ lookahead. Falls back to the last sample.
 */
export function findTarget(
  samples: ReferencePoint[],
  pose: Pose,
  lookahead: number,
  startIndex: number,
): { target: ReferencePoint; index: number } {
  for (let i = startIndex; i < samples.length; i++) {
    const dx = samples[i].x - pose.x;
    const dy = samples[i].y - pose.y;
    if (dx * dx + dy * dy >= lookahead * lookahead) {
      return { target: samples[i], index: i };
    }
  }
  return {
    target: samples[samples.length - 1],
    index: samples.length - 1,
  };
}

/** Desired angular velocity given target and current pose (Pure Pursuit). */
export function desiredOmega(
  pose: Pose,
  target: Pose,
  v: number,
  lookahead: number,
): number {
  const dx = target.x - pose.x;
  const dy = target.y - pose.y;
  const localY =
    -Math.sin(pose.theta) * dx + Math.cos(pose.theta) * dy;
  const curvature = (2 * localY) / (lookahead * lookahead || 1e-9);
  return v * curvature;
}
