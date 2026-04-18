// src/lib/park-bot/__tests__/simulation.test.ts
import { describe, expect, it } from "vitest";

import { runSimulation } from "../simulation";

describe("simulation", () => {
  it("walks parallel_tight end to end and reaches 'done'", () => {
    const frames = runSimulation({ scenarioId: "parallel_tight", forcedMode: null, dt: 1 / 60 });
    expect(frames.length).toBeGreaterThan(60);
    const last = frames[frames.length - 1];
    expect(last.phase).toBe("done");
    // Pose moved laterally at least 0.8 m during a crab slide.
    const start = frames[0].pose;
    expect(Math.abs(last.pose.y - start.y)).toBeGreaterThan(0.8);
    expect(last.trail.length).toBe(frames.length);
  });

  it("halts the trail when forced into a stuck mismatch", () => {
    const frames = runSimulation({ scenarioId: "parallel_tight", forcedMode: "ackermann", dt: 1 / 60 });
    const stuckIdx = frames.findIndex((f) => f.phase === "stuck");
    expect(stuckIdx).toBeGreaterThan(0);
    const after = frames.slice(stuckIdx + 2);
    const first = frames[stuckIdx];
    // Pose does not meaningfully advance while stuck.
    for (const f of after) {
      expect(Math.hypot(f.pose.x - first.pose.x, f.pose.y - first.pose.y)).toBeLessThan(0.01);
    }
  });
});
