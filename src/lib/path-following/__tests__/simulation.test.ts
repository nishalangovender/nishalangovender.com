import { describe, expect, it } from "vitest";

import { Simulator } from "../simulation";
import { DEFAULT_CONFIG } from "../types";

describe("Simulator", () => {
  it("is deterministic given the same config", () => {
    const a = new Simulator(DEFAULT_CONFIG);
    const b = new Simulator(DEFAULT_CONFIG);
    for (let i = 0; i < 500; i++) {
      const fa = a.step();
      const fb = b.step();
      expect(fa.truth.x).toBeCloseTo(fb.truth.x, 12);
      expect(fa.estimate.x).toBeCloseTo(fb.estimate.x, 12);
    }
  });

  it("keeps mean tracking error within a sensible envelope on defaults", () => {
    const sim = new Simulator(DEFAULT_CONFIG);
    for (let i = 0; i < 1000; i++) sim.step();
    const stats = sim.getStats();
    // Loose envelope — the point is that the controller actually tracks,
    // not to pin down a specific error to 3 decimals.
    expect(stats.meanError).toBeLessThan(3.0);
  });
});
