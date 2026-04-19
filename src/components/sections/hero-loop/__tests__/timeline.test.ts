import { describe, expect, it } from "vitest";

import { BEATS, TOTAL_DURATION } from "../timeline";

describe("hero-loop timeline", () => {
  it("covers 0 to TOTAL_DURATION with no gaps or overlaps", () => {
    expect(BEATS[0].start).toBe(0);
    expect(BEATS[BEATS.length - 1].end).toBe(TOTAL_DURATION);
    for (let i = 1; i < BEATS.length; i += 1) {
      expect(BEATS[i].start).toBeCloseTo(BEATS[i - 1].end, 5);
    }
  });

  it("has exactly 6 beats", () => {
    expect(BEATS).toHaveLength(6);
  });

  it("totals 20 seconds", () => {
    expect(TOTAL_DURATION).toBe(20);
  });

  it("gives every beat a strictly positive duration", () => {
    for (const beat of BEATS) {
      expect(beat.end).toBeGreaterThan(beat.start);
    }
  });

  it("assigns each beat a unique id", () => {
    const ids = BEATS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
