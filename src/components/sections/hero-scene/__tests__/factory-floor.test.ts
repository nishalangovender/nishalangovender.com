import { describe, expect, it } from "vitest";

import { BEATS, TOTAL_DURATION } from "../beats";
import { factoryReveal } from "../FactoryFloor";
import { cloudMorph } from "../PointCloud";

const beat = (id: string) => BEATS.find((b) => b.id === id)!;

describe("factory reveal", () => {
  it("is hidden until the scan has formed, then stands through the system beat", () => {
    expect(factoryReveal(beat("deploy").start + 0.1)).toBe(0);
    for (let t = beat("deploy").start; t < beat("deploy").end; t += 0.1) {
      if (factoryReveal(t) > 0) expect(cloudMorph(t)).toBeGreaterThan(0.8);
    }
    expect(factoryReveal(beat("system").start + 1)).toBe(1);
  });

  it("sinks away before the loop restarts on the notebook", () => {
    expect(factoryReveal(beat("return").end - 0.01)).toBe(0);
    expect(factoryReveal(TOTAL_DURATION - 1e-6)).toBe(0);
    expect(factoryReveal(0)).toBe(0);
  });
});
