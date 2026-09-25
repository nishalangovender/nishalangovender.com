import { describe, expect, it } from "vitest";

import { BEATS, TOTAL_DURATION } from "../beats";
import { FACTORY_CENTRE, FLOOR, OBSTACLES, clearance, costAt, factoryPoints } from "../factory";
import { LEAD_IN_LENGTH, LOOP, LOOP_LENGTH, loopPose, missionDistance, missionPose } from "../mission";
import { buildCloud, cloudMorph } from "../PointCloud";
import { PAGE } from "../sketch";
import { AGV, BASE_LINK } from "../sketch";

const beat = (id: string) => BEATS.find((b) => b.id === id)!;

describe("factory", () => {
  it("samples every point inside the building", () => {
    const pts = factoryPoints(2000);
    for (let i = 0; i < pts.length; i += 3) {
      expect(pts[i]).toBeGreaterThanOrEqual(FLOOR.minX - 1e-5);
      expect(pts[i]).toBeLessThanOrEqual(FLOOR.maxX + 1e-5);
      expect(pts[i + 1]).toBeGreaterThanOrEqual(0);
      expect(-pts[i + 2]).toBeGreaterThanOrEqual(FLOOR.minY - 1e-5);
      expect(-pts[i + 2]).toBeLessThanOrEqual(FLOOR.maxY + 1e-5);
    }
  });

  it("is deterministic", () => {
    expect(factoryPoints(100)).toEqual(factoryPoints(100));
  });

  it("inflates cost around obstacles and leaves open floor free", () => {
    const rack = OBSTACLES[0];
    expect(costAt(rack.x, rack.y)).toBe(1);
    expect(costAt(FACTORY_CENTRE.x, 0.9)).toBe(0);
    expect(costAt(rack.x, rack.y - rack.d / 2 - 0.3)).toBeGreaterThan(0);
  });

});

describe("mission", () => {
  it("starts on base_link, heading forward", () => {
    expect(missionPose(0)).toEqual({ x: BASE_LINK.x, y: 0, theta: 0 });
  });

  it("drives straight off the page's right edge into the factory", () => {
    const edge = missionPose(PAGE.width / 2 - BASE_LINK.x);
    expect(edge).toEqual({ x: PAGE.width / 2, y: 0, theta: 0 });
    const entry = missionPose(LEAD_IN_LENGTH);
    expect(entry.x).toBeGreaterThan(FLOOR.minX);
    expect(clearance(entry.x, entry.y)).toBeGreaterThan(AGV.width / 2);
  });

  it("closes the loop and keeps the AGV clear of every obstacle", () => {
    const end = loopPose(LOOP_LENGTH - 1e-6);
    expect(end.x).toBeCloseTo(LOOP[0].x, 2);
    expect(end.y).toBeCloseTo(LOOP[0].y, 2);
    for (const p of LOOP) expect(clearance(p.x, p.y)).toBeGreaterThan(AGV.width / 2);
  });

  it("sets off at the start of deploy, drives through system, then stops", () => {
    expect(missionDistance(beat("deploy").start + 0.1)).toBe(0);
    expect(missionDistance(beat("deploy").end)).toBeGreaterThan(0);
    expect(missionDistance(beat("system").end)).toBeGreaterThan(missionDistance(beat("deploy").end));
    expect(missionDistance(beat("return").end - 0.01)).toBe(missionDistance(beat("system").end));
  });
});

describe("point cloud", () => {
  it("stays inside the point budget", () => {
    expect(buildCloud(12).from.length / 3).toBeLessThanOrEqual(20000);
    expect(buildCloud(6).from.length / 3).toBeLessThanOrEqual(8000);
  });

  it("is a dot grid outside the factory beats and a cloud inside them", () => {
    expect(cloudMorph(0)).toBe(0);
    expect(cloudMorph(beat("system").start + 1)).toBe(1);
    expect(cloudMorph(TOTAL_DURATION - 1e-6)).toBe(0);
  });
});
