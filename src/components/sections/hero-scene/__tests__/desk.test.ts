import { describe, expect, it } from "vitest";

import { BEATS } from "../beats";
import { FLY_IN_START } from "../camera";
import { DESK, PAGE_HEIGHT, PIVOT, bodyPose, surfaceHeight, wheelCentreHeight } from "../desk-layout";
import { FLOOR, MONITOR } from "../factory";
import {
  LEAD_IN_LENGTH,
  SHRINK_START,
  SHRINK_TIME,
  deskScale,
  materialised,
  missionDistance,
  missionPose,
} from "../mission";
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
    expect(DESK.maxX).toBeLessThan(FLOOR.minX);
  });

  it("drops straight from the desk's edge to the floor: no ramp", () => {
    expect(surfaceHeight(DESK.maxX, 0)).toBe(DESK.height);
    expect(surfaceHeight(DESK.maxX + 0.01, 0)).toBe(0);
  });

  it("sends the mission lead-in off the desk into the factory", () => {
    expect(missionPose(LEAD_IN_LENGTH).x).toBeGreaterThan(FLOOR.minX);
  });
});

describe("desk shrinks away beneath the AGV", () => {
  const deploy = BEATS.find((b) => b.id === "deploy")!;
  const system = BEATS.find((b) => b.id === "system")!;
  const parked = PIVOT.x - missionPose(0).x;

  it("parks the AGV at the desk's edge, wheels on the bare desk, while the desk shrinks", () => {
    expect(PIVOT.x + AGV.castorX + AGV.castorRadius).toBeLessThan(DESK.maxX);
    expect(PIVOT.x - AGV.wheelRadius).toBeGreaterThan(PAGE.width / 2 + 0.14);
    expect(SHRINK_START).toBeGreaterThan(deploy.start);
    expect(missionDistance(SHRINK_START)).toBeCloseTo(parked, 6);
    expect(missionDistance(SHRINK_START + SHRINK_TIME / 2)).toBeCloseTo(parked, 6);
    expect(missionDistance(SHRINK_START + SHRINK_TIME + 1)).toBeGreaterThan(parked);
  });

  it("is full size until the AGV parks, gone once it has, and back before the camera flies into the monitor", () => {
    expect(deskScale(SHRINK_START - 0.01)).toBe(1);
    const mid = deskScale(SHRINK_START + SHRINK_TIME / 2);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    expect(deskScale(SHRINK_START + SHRINK_TIME)).toBe(0);
    expect(deskScale(deploy.end - 0.01)).toBe(0);
    expect(deskScale(FLY_IN_START)).toBe(1);
    expect(deskScale(system.end - 0.01)).toBe(1);
  });

  it("lowers the parked AGV to the floor with the desk, level", () => {
    const pose = { x: PIVOT.x, y: 0, theta: 0 };
    expect(bodyPose(pose, 1).height).toBeCloseTo(DESK.height, 6);
    expect(bodyPose(pose, 0.5).height).toBeCloseTo(DESK.height / 2, 6);
    expect(bodyPose(pose, 0.5).pitch).toBeCloseTo(0, 6);
    expect(bodyPose(pose, 0).height).toBeCloseTo(0, 6);
  });

  it("turns the wireframe into the solid robot as the desk shrinks away, and keeps it solid", () => {
    expect(materialised(SHRINK_START - 0.01)).toBe(0);
    expect(materialised(SHRINK_START + SHRINK_TIME)).toBe(1);
    expect(materialised(system.end - 0.01)).toBe(1);
  });
});

describe("AGV on its wheels", () => {
  const pose = (x: number) => ({ x, y: 0, theta: 0 });
  const edge = PAGE.width / 2;
  /** Drive wheels and castor both on the desk. */
  const onDesk = PIVOT.x;

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

  it("never jumps in height while driving on the notebook and desk", () => {
    let prev = bodyPose(pose(0)).height;
    for (let x = 0; x <= PIVOT.x; x += 0.02) {
      const { height } = bodyPose(pose(x));
      expect(Math.abs(height - prev)).toBeLessThan(0.05);
      prev = height;
    }
  });
});
