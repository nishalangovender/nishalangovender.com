import { easeOutCubic } from "./easing";

/**
 * Map an overall progress value `p` to a per-step progress in [0, 1] over
 * the window [start, end], eased.
 *
 *   p <= start → 0
 *   p >= end   → 1
 *   otherwise  → easing((p − start) / (end − start))
 *
 * Used throughout the hero-loop beats to sequence strokes and transitions
 * within a beat's progress timeline.
 */
export function progressInWindow(
  p: number,
  start: number,
  end: number,
  easing: (t: number) => number = easeOutCubic,
): number {
  if (p <= start) return 0;
  if (p >= end) return 1;
  return easing((p - start) / (end - start));
}
