import { describe, expect, it } from "vitest";

import { BEATS } from "../beats";
import { CAMERA_KEYFRAMES, FLY_IN_START, cameraAt } from "../camera";
import { DASH_H, DASH_W, dashboardStats, toMinimap } from "../dashboard";
import { DESK } from "../desk-layout";
import { FLOOR, MONITOR } from "../factory";
import { acceptsGoals } from "../NavGoal";
import { PAGE } from "../sketch";

const system = BEATS.find((b) => b.id === "system")!;

describe("dashboard", () => {
  it("shows the five production cards", () => {
    expect(dashboardStats(0).map((s) => s.label)).toEqual(["ACTIVE", "PICKS", "UPTIME", "AVG SPD", "ALERTS"]);
  });

  it("counts picks up and reports speed once the fleet is moving", () => {
    const before = dashboardStats(0);
    const during = dashboardStats(system.end - 0.1);
    expect(Number(during[1].value)).toBeGreaterThan(Number(before[1].value));
    expect(before[3].value).toBe("0.0 m/s");
    expect(during[3].value).not.toBe("0.0 m/s");
  });

  it("fits the whole floor inside the canvas, map y up", () => {
    const [x0, y0] = toMinimap(FLOOR.minX, FLOOR.maxY);
    const [x1, y1] = toMinimap(FLOOR.maxX, FLOOR.minY);
    for (const v of [x0, x1]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(DASH_W);
    }
    for (const v of [y0, y1]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(DASH_H);
    }
    expect(y0).toBeLessThan(y1);
  });

  it("uses a 16:10 screen to match the canvas", () => {
    expect(MONITOR.width / MONITOR.screenHeight).toBeCloseTo(DASH_W / DASH_H, 3);
  });
});

describe("monitor fly-in", () => {
  it("ends the system beat looking straight at the screen", () => {
    const pose = cameraAt(system.end - 0.01);
    expect(pose.target[0]).toBeCloseTo(MONITOR.x, 3);
    expect(pose.target[1]).toBeCloseTo(DESK.height + MONITOR.height, 3);
    expect(pose.target[2]).toBeCloseTo(-MONITOR.y, 3);
    expect(pose.position[0]).toBeCloseTo(pose.target[0], 3);
    expect(pose.position[1]).toBeCloseTo(pose.target[1], 3);
  });

  it("stands the monitor on the desk behind the notebook, clear of the factory", () => {
    expect(MONITOR.x + MONITOR.width / 2).toBeLessThan(FLOOR.minX);
    expect(MONITOR.y).toBeGreaterThan(PAGE.depth / 2);
  });

  it("stops accepting nav goals once the camera heads for the monitor", () => {
    expect(acceptsGoals(FLY_IN_START - 0.1)).toBe(true);
    expect(acceptsGoals(FLY_IN_START + 0.1)).toBe(false);
    expect(CAMERA_KEYFRAMES.some((k) => k.t === FLY_IN_START)).toBe(true);
  });
});
