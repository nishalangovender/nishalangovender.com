import { describe, expect, it } from "vitest";

import { framing } from "../HeroCanvas";

describe("hero framing", () => {
  it("shifts the scene right of the headline on wide screens", () => {
    const { offset, zoom } = framing(1440, 836);
    expect(offset[0]).toBeLessThan(0);
    expect(offset[1]).toBe(0);
    expect(zoom).toBe(1);
  });

  it("shifts the scene up and widens the view on phones", () => {
    const { offset, zoom } = framing(390, 780);
    expect(offset[0]).toBe(0);
    expect(offset[1]).toBeGreaterThan(0);
    expect(zoom).toBeLessThan(1);
    expect(zoom).toBeGreaterThanOrEqual(0.55);
  });
});
