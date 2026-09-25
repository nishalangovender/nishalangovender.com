/**
 * How a real page turns: lifted by its near corner, it curls up and over the
 * spine, the free edge leading as it rises and trailing as it falls onto the
 * turned pages. Pure maths in the hinge frame: x across the spread (the sheet
 * lies along +x at rest, the turned stack along −x), y up, z down the spine.
 */
import { clamp01, smoothstep } from "@/lib/math";

/**
 * Share of the turn by which the far edge of the page lags the near corner.
 * Tuned by eye against a real notebook: enough to read as a corner lift,
 * not so much that the page twists.
 */
const CORNER_LEAD = 0.3;
/**
 * Peak bend along the sheet, radians between spine and free edge (~63°).
 * Tuned by eye: paper this size visibly bows mid-turn without folding.
 */
const CURL = 1.1;

/** Turn progress (0 flat on the right, 1 flat on the left) of the strip at `zn`: 0 far edge, 1 near corner. */
export function stripTurn(turn: number, zn: number): number {
  return smoothstep(clamp01((turn - CORNER_LEAD * (1 - zn)) / (1 - CORNER_LEAD)));
}

/**
 * Where the point `s` along the sheet (0 at the spine, `width` at the free
 * edge) sits once its strip has turned by `k`, with the unit normal of the
 * paper's front face there. Each strip bends at a constant rate, so it is an
 * arc: `a` is the angle at the spine, `a + b` at the free edge.
 */
export function curlPoint(s: number, width: number, k: number): { x: number; y: number; nx: number; ny: number } {
  const a = Math.PI * k;
  const b = CURL * Math.sin(2 * Math.PI * k);
  const angle = a + (b * s) / width;
  const nx = -Math.sin(angle);
  const ny = Math.cos(angle);
  if (Math.abs(b) < 1e-6) return { x: s * Math.cos(a), y: s * Math.sin(a), nx, ny };
  const r = width / b;
  return { x: r * (Math.sin(angle) - Math.sin(a)), y: r * (Math.cos(a) - Math.cos(angle)), nx, ny };
}

/**
 * Maps flat sheet positions ([x, y, z] triples, x from the spine, y a small
 * height off the paper) onto the turning sheet, writing into `out`.
 */
export function curlPositions(base: ArrayLike<number>, out: Float32Array | number[], width: number, depth: number, turn: number) {
  for (let i = 0; i < base.length; i += 3) {
    const s = base[i];
    const lift = base[i + 1];
    const z = base[i + 2];
    const { x, y, nx, ny } = curlPoint(s, width, stripTurn(turn, clamp01(z / depth + 0.5)));
    out[i] = x + nx * lift;
    out[i + 1] = y + ny * lift;
    out[i + 2] = z;
  }
}
