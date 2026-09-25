import { describe, expect, it } from "vitest";

import { GUTTER, HINGE_X, gutterShade, stitchSegments } from "../Notebook";
import { PAGE } from "../sketch";

describe("stitched spine", () => {
  it("shades the gutter deepest at the fold, fading to nothing across the pages", () => {
    expect(gutterShade(0)).toBeCloseTo(GUTTER.depth);
    expect(gutterShade(GUTTER.halfWidth / 2)).toBeLessThan(GUTTER.depth);
    expect(gutterShade(GUTTER.halfWidth / 2)).toBe(gutterShade(-GUTTER.halfWidth / 2));
    expect(gutterShade(GUTTER.halfWidth)).toBe(0);
    expect(gutterShade(1)).toBe(0);
  });

  it("stitches down the spine, inside the page", () => {
    const seg = stitchSegments();
    const xs = seg.filter((_, i) => i % 3 === 0);
    const zs = seg.filter((_, i) => i % 3 === 2);
    expect(seg.length).toBe(GUTTER.stitches * 6);
    expect(new Set(xs)).toEqual(new Set([HINGE_X]));
    expect(Math.min(...zs)).toBeGreaterThan(-PAGE.depth / 2);
    expect(Math.max(...zs)).toBeLessThan(PAGE.depth / 2);
  });
});
