/**
 * Shared easing functions. All take and return a value in [0, 1].
 *
 * For heavier smooth-acceleration math use `smoothstep` from `@/lib/math`.
 */

/** Cubic ease-in-out — gentle at both ends. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Cubic ease-out — fast start, slow finish. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
