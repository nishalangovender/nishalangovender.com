// src/lib/path-following/controller.ts

/**
 * Path-following inner loop.
 *
 * Pure Pursuit commands the angular velocity from the geometric path-tracking
 * error, and we cruise at a constant linear velocity. We don't have an
 * independent velocity measurement — the EKF's `v` is just whatever we
 * commanded last tick — so closing a PI loop on that would just oscillate.
 * Instead, the controller passes the target velocity through directly.
 *
 * The class exists so the Simulator has a stable per-run handle with a
 * `reset()` method, and so future iterations (feed-forward, curvature-aware
 * speed limits) have a single place to live.
 */
export class PiController {
  reset(): void {
    // Stateless for now — kept on the class for the reset contract.
  }

  step(desiredV: number): { v: number } {
    return { v: desiredV };
  }
}
