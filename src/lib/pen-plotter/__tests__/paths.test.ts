import { describe, expect, it } from "vitest";

import { getPreset, interpolatePolyline } from "../paths";
import { HW } from "../types";

describe("paths: presets", () => {
  it.each(["star", "spiral", "rose", "rounded-rect"] as const)(
    "preset %s produces a non-empty polyline inside the envelope",
    (id) => {
      const poly = getPreset(id);
      expect(poly.length).toBeGreaterThan(8);
      for (const p of poly) {
        const r = Math.hypot(p.x, p.y);
        expect(r).toBeGreaterThanOrEqual(HW.R_MIN);
        expect(r).toBeLessThanOrEqual(HW.R_MAX);
      }
    },
  );
});

describe("paths: interpolatePolyline", () => {
  it("subdivides long segments to respect step size", () => {
    const poly = [
      { x: 50, y: 0 },
      { x: 100, y: 0 },
    ];
    const out = interpolatePolyline(poly, 10);
    // 50 mm / 10 mm → 5 sub-segments → 6 points
    expect(out).toHaveLength(6);
    expect(out[0]).toEqual({ x: 50, y: 0 });
    expect(out[out.length - 1]).toEqual({ x: 100, y: 0 });
  });

  it("leaves short segments alone", () => {
    const poly = [
      { x: 50, y: 0 },
      { x: 51, y: 0 },
    ];
    expect(interpolatePolyline(poly, 10)).toEqual(poly);
  });

  it("handles empty and single-point inputs", () => {
    expect(interpolatePolyline([], 10)).toEqual([]);
    expect(interpolatePolyline([{ x: 1, y: 1 }], 10)).toEqual([{ x: 1, y: 1 }]);
  });
});
