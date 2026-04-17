import { describe, expect, it } from "vitest";

import { Simulator } from "../simulation";
import { DEFAULT_CONFIG } from "../types";

describe("Simulator", () => {
  it("terminates on a clean preset with traced segments and zero ERR", () => {
    const sim = new Simulator({ ...DEFAULT_CONFIG, preset: "star", speed: 1 });
    let guard = 0;
    while (!sim.isComplete() && guard < 60_000) {
      sim.step();
      guard++;
    }
    expect(sim.isComplete()).toBe(true);
    const latest = sim.getLatestFrame();
    expect(latest).not.toBeNull();
    expect(latest!.traceSegments.length).toBeGreaterThan(0);
    expect(sim.getStats().errorsReported).toBe(0);
  });

  it("determinism: same config → same final trace length", () => {
    function run(): number {
      const sim = new Simulator({ ...DEFAULT_CONFIG, preset: "spiral" });
      let guard = 0;
      while (!sim.isComplete() && guard < 60_000) {
        sim.step();
        guard++;
      }
      return sim.getLatestFrame()!.traceSegments.length;
    }
    expect(run()).toBe(run());
  });
});
