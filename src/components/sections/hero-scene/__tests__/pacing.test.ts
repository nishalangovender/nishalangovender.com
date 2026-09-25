import { describe, expect, it } from "vitest";

import { BEATS, TOTAL_DURATION } from "../beats";
import { LEAD_IN_LENGTH, missionDistance } from "../mission";
import { LINE_DELAY, TERMINAL_LINES, TYPING_START } from "../terminal";

const beat = (id: string) => BEATS.find((b) => b.id === id)!;

describe("pacing", () => {
  it("gives the loop room to breathe", () => {
    expect(TOTAL_DURATION).toBeGreaterThanOrEqual(35);
    for (const b of BEATS) expect(b.end - b.start).toBeGreaterThanOrEqual(4.5);
  });

  it("gets the AGV into the factory before the deploy beat ends", () => {
    expect(missionDistance(beat("deploy").end)).toBeGreaterThan(LEAD_IN_LENGTH);
  });

  it("finishes typing the terminal session inside the code beat", () => {
    const code = beat("code");
    expect(TYPING_START + TERMINAL_LINES.length * LINE_DELAY).toBeLessThan(code.end - code.start);
  });
});
