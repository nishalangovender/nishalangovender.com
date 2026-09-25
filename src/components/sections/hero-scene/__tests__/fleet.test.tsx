import { describe, expect, it } from "vitest";

import { BEATS, TOTAL_DURATION } from "../beats";
import { FLEET_SIZE, fleetPose, fleetPresence } from "../Fleet";
import { LEAD_IN_LENGTH, LOOP_LENGTH, loopPose, missionDistance } from "../mission";

const beat = (id: string) => BEATS.find((b) => b.id === id)!;

describe("fleet", () => {
  it("appears only for the system beat and fades out in the return", () => {
    expect(fleetPresence(beat("deploy").end - 0.01)).toBe(0);
    expect(fleetPresence(beat("system").end - 0.01)).toBe(1);
    expect(fleetPresence(TOTAL_DURATION - 1e-6)).toBeCloseTo(0, 3);
  });

  it("spaces the AGVs evenly round the loop", () => {
    const t = beat("system").start + 1;
    const hero = missionDistance(t) - LEAD_IN_LENGTH;
    for (let i = 1; i < FLEET_SIZE; i++) {
      expect(fleetPose(t, i)).toEqual(loopPose(hero + (i * LOOP_LENGTH) / FLEET_SIZE));
    }
  });
});
