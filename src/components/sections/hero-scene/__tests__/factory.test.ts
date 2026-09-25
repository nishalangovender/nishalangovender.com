import { describe, expect, it } from "vitest";

import { BEATS, TOTAL_DURATION } from "../beats";
import { FLOOR, OBSTACLES, clearance, costAt, factoryPoints, raycast } from "../factory";
import { MISSION, MISSION_LENGTH, missionDistance, missionPose } from "../mission";
import { buildCloud, cloudMorph } from "../PointCloud";
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
    expect(costAt(0, 0.9)).toBe(0);
    expect(costAt(rack.x, rack.y - rack.d / 2 - 0.3)).toBeGreaterThan(0);
  });

  it("raycasts to the nearest rack face", () => {
    const rack = OBSTACLES[0];
    const fromY = rack.y - rack.d / 2 - 2;
    expect(raycast(rack.x, fromY, Math.PI / 2, 20)).toBeCloseTo(2, 6);
    expect(raycast(0, 0.9, 0, 20)).toBeLessThanOrEqual(FLOOR.maxX);
  });
});

describe("mission", () => {
  it("starts on base_link, heading forward", () => {
    expect(missionPose(0)).toEqual({ x: BASE_LINK.x, y: 0, theta: 0 });
  });

  it("closes the loop and keeps the AGV clear of every obstacle", () => {
    const end = missionPose(MISSION_LENGTH - 1e-6);
    expect(end.x).toBeCloseTo(BASE_LINK.x, 2);
    expect(end.y).toBeCloseTo(0, 2);
    for (const p of MISSION) expect(clearance(p.x, p.y)).toBeGreaterThan(AGV.width / 2);
  });

  it("waits for the factory, drives through deploy and system, then stops", () => {
    expect(missionDistance(beat("deploy").start + 0.5)).toBe(0);
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
