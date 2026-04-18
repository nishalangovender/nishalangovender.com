// src/lib/park-bot/__tests__/mission.test.ts
import { describe, expect, it } from "vitest";

import { planMission } from "../mission";
import { getScenario } from "../scenarios";
import type { KinematicMode } from "../types";

function collect(scenarioId: Parameters<typeof getScenario>[0], forced: KinematicMode | null = null) {
  const scenario = getScenario(scenarioId);
  const mission = planMission(scenario, forced);
  const samples: Array<ReturnType<typeof mission.sample>> = [];
  // Sample densely enough to cross all phase boundaries.
  for (let t = 0; t <= mission.duration + 0.5; t += 0.05) {
    samples.push(mission.sample(t));
  }
  return { scenario, mission, samples };
}

describe("mission", () => {
  it("walks every phase in order for each scenario", () => {
    for (const id of ["forward_bay", "parallel_tight", "narrow_uturn", "pivot_rotate"] as const) {
      const { samples } = collect(id);
      const seen = samples.map((s) => s.phase);
      const first = seen.indexOf("approach");
      const second = seen.indexOf("active");
      const third = seen.indexOf("align");
      const done = seen.indexOf("done");
      expect(first).toBeGreaterThanOrEqual(0);
      expect(second).toBeGreaterThan(first);
      expect(third).toBeGreaterThan(second);
      expect(done).toBeGreaterThan(third);
    }
  });

  it("uses the recommended mode when no force is applied", () => {
    const { scenario, samples } = collect("parallel_tight");
    const active = samples.filter((s) => s.phase === "active");
    expect(active.length).toBeGreaterThan(0);
    for (const s of active) {
      expect(s.activeMode).toBe(scenario.recommendedMode);
    }
  });

  it("honours a forced mode override", () => {
    const { samples } = collect("parallel_tight", "ackermann");
    const active = samples.filter((s) => s.phase === "active");
    for (const s of active) {
      expect(s.activeMode).toBe("ackermann");
    }
  });

  it("reports stuck when parallel_tight is forced to ackermann during slide-in", () => {
    const { samples } = collect("parallel_tight", "ackermann");
    expect(samples.some((s) => s.phase === "stuck")).toBe(true);
  });
});
