/**
 * Neat handwriting for the notebook sketch: the diagram's symbols as
 * single-stroke pen glyphs, and a gentle pen wobble for every stroke, so the
 * page reads as drawn by hand rather than plotted. Pure maths on page points
 * (x right, y up the page, metres).
 */

export type P = [number, number];

/** Glyph cap height as a share of the requested size; lowercase sits at x-height. */
const X_HEIGHT = 0.62;
/** Forward slant of the hand: x shifts by this much per unit of height. */
const SLANT = 0.14;

const ellipse = (cx: number, cy: number, rx: number, ry: number, steps: number, from = Math.PI / 2): P[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + (i / steps) * Math.PI * 2;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });

/** Catmull-Rom through `points`, so a few hand-placed points read as a smooth pen curve. */
export function smoothCurve(points: P[], perSpan = 4): P[] {
  const out: P[] = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const [p1, p2] = [points[i], points[i + 1]];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    for (let k = 1; k <= perSpan; k++) {
      const t = k / perSpan;
      const t2 = t * t;
      const t3 = t2 * t;
      const at = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([at(p0[0], p1[0], p2[0], p3[0]), at(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  return out;
}

/**
 * Pen strokes for each symbol in a unit box (baseline y = 0, cap height 1),
 * with the glyph's advance width. Written the way a neat hand writes them.
 */
const GLYPHS: Record<string, { width: number; strokes: P[][] }> = {
  X: { width: 0.7, strokes: [[[0, 1], [0.7, 0]], [[0.7, 1], [0, 0]]] },
  Y: { width: 0.7, strokes: [[[0, 1], [0.35, 0.5]], [[0.7, 1], [0.35, 0.5], [0.35, 0]]] },
  V: { width: 0.7, strokes: [[[0, 1], [0.35, 0], [0.7, 1]]] },
  x: { width: 0.5, strokes: [[[0, X_HEIGHT], [0.5, 0]], [[0.5, X_HEIGHT], [0, 0]]] },
  y: {
    width: 0.5,
    strokes: [
      [[0, X_HEIGHT], [0.25, 0.08]],
      smoothCurve([[0.5, X_HEIGHT], [0.3, 0.05], [0.16, -0.3], [0.02, -0.38]]),
    ],
  },
  θ: { width: 0.56, strokes: [ellipse(0.28, 0.5, 0.27, 0.5, 28), [[0.03, 0.5], [0.53, 0.5]]] },
  ω: {
    width: 0.8,
    strokes: [
      smoothCurve([
        [0.08, X_HEIGHT - 0.04],
        [0.02, 0.24],
        [0.12, 0.02],
        [0.27, 0.03],
        [0.4, 0.34],
        [0.53, 0.03],
        [0.68, 0.02],
        [0.78, 0.24],
        [0.72, X_HEIGHT - 0.04],
      ]),
    ],
  },
};

/** Pen strokes writing `text` (one known symbol) centred on `at`, `size` metres tall. */
export function writeGlyph(text: string, at: P, size: number): P[][] {
  const glyph = GLYPHS[text];
  if (!glyph) throw new Error(`No handwritten glyph for "${text}"`);
  const lowercase = text === text.toLowerCase() && text !== text.toUpperCase();
  const midY = lowercase ? X_HEIGHT / 2 : 0.5;
  return glyph.strokes.map((stroke) =>
    stroke.map(([u, v]): P => [at[0] + (u - glyph.width / 2 + (v - midY) * SLANT) * size, at[1] + (v - midY) * size]),
  );
}

/** Longest straight run before a stroke is split so the wobble can bend it. */
const WOBBLE_STEP = 0.08;
/** Peak sideways drift of the pen, metres. */
const WOBBLE = 0.0045;

/**
 * A hand-drawn version of a stroke: long runs are split and nudged sideways
 * by a smooth, seeded drift that fades to zero at both ends, so strokes still
 * meet where they should (axes at the origin, arrowheads on their shafts).
 */
export function penWobble(points: P[], seed: number): P[] {
  const dense: P[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / WOBBLE_STEP));
    for (let k = 1; k <= n; k++) dense.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  const lengths = [0];
  for (let i = 1; i < dense.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  }
  const total = lengths.at(-1) || 1;
  return dense.map((p, i) => {
    const prev = dense[Math.max(i - 1, 0)];
    const next = dense[Math.min(i + 1, dense.length - 1)];
    const len = Math.hypot(next[0] - prev[0], next[1] - prev[1]) || 1;
    const [nx, ny] = [-(next[1] - prev[1]) / len, (next[0] - prev[0]) / len];
    const s = lengths[i];
    const drift = WOBBLE * Math.sin((Math.PI * s) / total) * (Math.sin(s * 4 + seed) + 0.35 * Math.sin(s * 11 + seed * 2.3));
    return [p[0] + nx * drift, p[1] + ny * drift];
  });
}
