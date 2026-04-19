/** Shared numeric helpers. Pure functions, no dependencies. */

/** Clamp `n` to the [0, 1] range. */
export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** Clamp `n` to the [min, max] range. */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Linear interpolation from `a` to `b` at `t` ∈ [0, 1]. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Smoothstep easing — `t² · (3 − 2t)`. Smooth acceleration and deceleration,
 * cheaper than the cubic variant. Commonly called `smoothstep` in shader
 * contexts.
 */
export function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}
