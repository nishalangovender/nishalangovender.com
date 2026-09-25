import { describe, expect, it } from "vitest";

import { penWobble, smoothCurve, writeGlyph } from "../handwriting";

describe("handwriting", () => {
  it("writes each diagram symbol centred on its spot at the asked size", () => {
    for (const text of ["X", "Y", "V", "x", "y", "θ", "ω"]) {
      const pts = writeGlyph(text, [1, 2], 0.24).flat();
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      expect(Math.max(...ys) - Math.min(...ys)).toBeLessThanOrEqual(0.24 * 1.05);
      expect(Math.abs((Math.max(...xs) + Math.min(...xs)) / 2 - 1)).toBeLessThan(0.08);
    }
    expect(() => writeGlyph("?", [0, 0], 1)).toThrow();
  });

  it("wobbles a stroke gently but keeps its ends where they were", () => {
    const line: [number, number][] = [
      [0, 0],
      [1, 0],
    ];
    const w = penWobble(line, 3);
    expect(w.length).toBeGreaterThan(2);
    expect(w[0]).toEqual([0, 0]);
    expect(w.at(-1)![0]).toBeCloseTo(1, 9);
    expect(w.at(-1)![1]).toBeCloseTo(0, 9);
    const drift = Math.max(...w.map((p) => Math.abs(p[1])));
    expect(drift).toBeGreaterThan(0);
    expect(drift).toBeLessThan(0.015);
  });

  it("smooths a curve through its control points", () => {
    const pts = smoothCurve([
      [0, 0],
      [1, 1],
      [2, 0],
    ]);
    expect(pts[0]).toEqual([0, 0]);
    expect(pts.at(-1)).toEqual([2, 0]);
    expect(pts.length).toBeGreaterThan(3);
  });
});
