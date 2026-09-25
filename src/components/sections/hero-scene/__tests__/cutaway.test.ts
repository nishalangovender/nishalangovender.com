import { describe, expect, it } from "vitest";

import { FLOOR, OBSTACLES } from "../factory";
import { LEAD_IN_LENGTH, LOOP, missionPose } from "../mission";
import { AGV_BODY_Y } from "../sketch";

/** Tallest thing allowed between the camera and the AGV: a little over the robot itself. */
const SIGHT_LINE = 1.6;

describe("cutaway factory", () => {
  it("cuts the walls away at knee height", () => {
    expect(FLOOR.wallHeight).toBeLessThanOrEqual(1);
  });

  it("keeps racking low enough to see into the aisle", () => {
    for (const rack of OBSTACLES.filter((o) => o.w > 1)) expect(rack.h).toBeLessThanOrEqual(SIGHT_LINE);
    expect(SIGHT_LINE).toBeGreaterThan(AGV_BODY_Y);
  });

  it("keeps tall columns well clear of the entrance lane and the loop", () => {
    const lane = Array.from({ length: 50 }, (_, i) => missionPose((i / 49) * LEAD_IN_LENGTH));
    for (const column of OBSTACLES.filter((o) => o.h > SIGHT_LINE)) {
      for (const p of [...lane, ...LOOP]) {
        expect(Math.hypot(p.x - column.x, p.y - column.y)).toBeGreaterThan(2);
      }
    }
  });
});
