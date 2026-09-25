import { describe, expect, it } from "vitest";

import { DESK, PAGE_HEIGHT, RAMP, groundHeight, groundPitch } from "../desk-layout";
import { FLOOR, MONITOR } from "../factory";
import { LEAD_IN_LENGTH, missionPose } from "../mission";
import { PAGE } from "../sketch";

describe("desk", () => {
  it("raises the page above the desk, and the desk above the floor", () => {
    expect(PAGE_HEIGHT).toBeGreaterThan(DESK.height);
    expect(groundHeight(0, 0)).toBe(PAGE_HEIGHT);
    expect(groundHeight(DESK.maxX - 0.1, 0)).toBe(DESK.height);
    expect(groundHeight(FLOOR.minX + 1, 0)).toBe(0);
  });

  it("holds the notebook and the monitor, clear of the factory", () => {
    expect(DESK.minX).toBeLessThan(-PAGE.width / 2);
    expect(DESK.maxX).toBeGreaterThan(PAGE.width / 2);
    expect(DESK.maxY).toBeGreaterThan(MONITOR.y);
    expect(RAMP.toX).toBeLessThan(FLOOR.minX);
  });

  it("slopes the ramp down smoothly, with no jumps along the lane", () => {
    let prev = groundHeight(0, 0);
    for (let x = 0; x <= FLOOR.minX; x += 0.05) {
      const h = groundHeight(x, 0);
      expect(h).toBeLessThanOrEqual(prev + 1e-9);
      expect(prev - h).toBeLessThan(0.1);
      prev = h;
    }
    expect(groundPitch((RAMP.fromX + RAMP.toX) / 2, 0)).toBeGreaterThan(0);
    expect(groundPitch(0, 0)).toBe(0);
    expect(groundPitch(FLOOR.minX + 1, 0)).toBe(0);
  });

  it("sends the mission lead-in down the ramp into the factory", () => {
    expect(missionPose(LEAD_IN_LENGTH).x).toBeGreaterThan(RAMP.toX);
  });
});
