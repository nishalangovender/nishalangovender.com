// src/lib/park-bot/__tests__/scenarios.test.ts
import { describe, expect, it } from "vitest";

import { SCENARIOS, getScenario } from "../scenarios";

describe("scenarios", () => {
  it("has four scenarios with unique ids", () => {
    const ids = SCENARIOS.map((s) => s.id);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
  });

  it("each scenario has exactly three phase labels", () => {
    for (const s of SCENARIOS) {
      expect(s.phases).toHaveLength(3);
    }
  });

  it("recommended modes cover all four primitives", () => {
    const modes = new Set(SCENARIOS.map((s) => s.recommendedMode));
    expect(modes).toEqual(new Set(["ackermann", "crab", "counter_steer", "pivot"]));
  });

  it("targets all sit within scenario bounds", () => {
    for (const s of SCENARIOS) {
      expect(s.target.x).toBeGreaterThanOrEqual(-s.bounds.width / 2);
      expect(s.target.x).toBeLessThanOrEqual(s.bounds.width / 2);
      expect(s.target.y).toBeGreaterThanOrEqual(-s.bounds.height / 2);
      expect(s.target.y).toBeLessThanOrEqual(s.bounds.height / 2);
    }
  });

  it("getScenario returns the right scenario", () => {
    expect(getScenario("forward_bay").recommendedMode).toBe("ackermann");
    expect(getScenario("parallel_tight").recommendedMode).toBe("crab");
  });
});
