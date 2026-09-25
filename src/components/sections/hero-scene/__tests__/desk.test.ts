import { describe, expect, it } from "vitest";

import { DESK, PAGE_HEIGHT, RAMP, bodyPose, surfaceHeight, wheelCentreHeight } from "../desk-layout";
import { FLOOR, MONITOR } from "../factory";
import { LEAD_IN_LENGTH, missionPose } from "../mission";
import { AGV, PAGE } from "../sketch";

describe("desk", () => {
  it("raises the page above the desk, and the desk above the floor", () => {
    expect(PAGE_HEIGHT).toBeGreaterThan(DESK.height);
    expect(surfaceHeight(0, 0)).toBe(PAGE_HEIGHT);
    expect(surfaceHeight(DESK.maxX - 0.1, 0)).toBe(DESK.height);
    expect(surfaceHeight(FLOOR.minX + 1, 0)).toBe(0);
  });

  it("holds the notebook and the monitor, clear of the factory", () => {
    expect(DESK.minX).toBeLessThan(-PAGE.width / 2);
    expect(DESK.maxX).toBeGreaterThan(PAGE.width / 2);
    expect(DESK.maxY).toBeGreaterThan(MONITOR.y);
    expect(RAMP.toX).toBeLessThan(FLOOR.minX);
  });

  it("slopes the ramp down from the desk to the floor", () => {
    expect(surfaceHeight(RAMP.fromX, 0)).toBe(DESK.height);
    expect(surfaceHeight((RAMP.fromX + RAMP.toX) / 2, 0)).toBeCloseTo(DESK.height / 2);
    expect(surfaceHeight(RAMP.fromX + 0.5, RAMP.width)).toBe(0);
  });

  it("sends the mission lead-in down the ramp into the factory", () => {
    expect(missionPose(LEAD_IN_LENGTH).x).toBeGreaterThan(RAMP.toX);
  });
});

describe("AGV on its wheels", () => {
  const pose = (x: number) => ({ x, y: 0, theta: 0 });
  const edge = PAGE.width / 2;
  /** Drive wheels on the desk, castor not yet at the ramp. */
  const onDesk = RAMP.fromX - AGV.castorX - 0.1;
  const slope = Math.atan2(DESK.height, RAMP.toX - RAMP.fromX);

  it("sits level on the page and on the desk", () => {
    expect(bodyPose(pose(0)).pitch).toBeCloseTo(0, 9);
    expect(bodyPose(pose(0)).height).toBeCloseTo(PAGE_HEIGHT, 9);
    expect(bodyPose(pose(onDesk)).pitch).toBeCloseTo(0, 9);
    expect(bodyPose(pose(onDesk)).height).toBeCloseTo(DESK.height, 9);
  });

  it("rolls a wheel round a step edge instead of dropping through it", () => {
    const r = AGV.wheelRadius;
    expect(wheelCentreHeight(edge, 0, r)).toBeCloseTo(PAGE_HEIGHT + r, 6);
    const past = wheelCentreHeight(edge + r / 2, 0, r);
    expect(past).toBeLessThan(PAGE_HEIGHT + r);
    expect(past).toBeGreaterThan(surfaceHeight(edge + r / 2, 0) + r);
  });

  it("dips nose-down as the castor drops off the notebook, then levels once the drive wheels follow", () => {
    const castorOff = bodyPose(pose(edge + 0.3 - AGV.castorX));
    expect(castorOff.pitch).toBeGreaterThan(0.15);
    expect(bodyPose(pose(onDesk)).pitch).toBeCloseTo(0, 6);
  });

  it("tips castor-first onto the ramp and rides it at the ramp's slope", () => {
    expect(bodyPose(pose(RAMP.fromX - AGV.castorX / 2)).pitch).toBeGreaterThan(0);
    expect(bodyPose(pose((RAMP.fromX + RAMP.toX) / 2 - AGV.castorX / 2)).pitch).toBeCloseTo(slope, 2);
    expect(bodyPose(pose(FLOOR.minX + 1)).pitch).toBeCloseTo(0, 9);
  });

  it("never jumps in height along the lane", () => {
    let prev = bodyPose(pose(0)).height;
    for (let x = 0; x <= FLOOR.minX; x += 0.02) {
      const { height } = bodyPose(pose(x));
      expect(Math.abs(height - prev)).toBeLessThan(0.05);
      prev = height;
    }
  });
});
