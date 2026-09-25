import { describe, expect, it } from "vitest";

import { BEATS } from "../beats";
import { FACTORY_CENTRE, OBSTACLES } from "../factory";
import { GOAL_TOLERANCE, IDLE_RESUME, blendPose, isGoalValid, setGoal, shouldResume, stepNav } from "../nav-goal";
import { acceptsGoals } from "../NavGoal";

const DT = 1 / 60;

/** Factory centre line: goals are placed relative to it. */
const CX = FACTORY_CENTRE.x;

function drive(goal: [number, number], start = { x: CX, y: 0.9, theta: 0 }, seconds = 20) {
  let s = setGoal(start, ...goal);
  let maxV = 0;
  for (let i = 0; i < seconds / DT; i++) {
    s = stepNav(s, DT);
    maxV = Math.max(maxV, s.cmd.v);
    if (s.path.length === 0) break;
  }
  return { s, maxV };
}

describe("nav goal", () => {
  it("rejects goals inside obstacles and accepts open floor", () => {
    expect(isGoalValid(OBSTACLES[0].x, OBSTACLES[0].y)).toBe(false);
    expect(isGoalValid(CX, 0.9)).toBe(true);
  });

  it.each([
    [CX + 3, 0.9],
    [CX - 3, 0.2],
    [CX + 0.5, 1.6],
    [CX - 2, 0.9], // behind the AGV
  ] as [number, number][])("drives to (%d, %d) and stops within tolerance", (x, y) => {
    const { s, maxV } = drive([x, y]);
    expect(s.path).toHaveLength(0);
    expect(Math.hypot(s.pose.x - x, s.pose.y - y)).toBeLessThan(GOAL_TOLERANCE);
    expect(s.cmd).toEqual({ v: 0, omega: 0 });
    expect(maxV).toBeGreaterThan(0);
  });

  it("hands back to the loop after sitting idle", () => {
    let { s } = drive([CX + 3, 0.9]);
    expect(shouldResume(s)).toBe(false);
    for (let i = 0; i < IDLE_RESUME / DT + 1; i++) s = stepNav(s, DT);
    expect(shouldResume(s)).toBe(true);
  });

  it("blends poses the short way round", () => {
    const p = blendPose({ x: 0, y: 0, theta: 3 }, { x: 2, y: 2, theta: -3 }, 0.5);
    expect(p.x).toBe(1);
    expect(Math.abs(Math.abs(p.theta) - Math.PI)).toBeLessThan(0.3);
  });
});

describe("acceptsGoals", () => {
  it("opens once the factory has formed and closes outside the live beats", () => {
    const deploy = BEATS.find((b) => b.id === "deploy")!;
    const system = BEATS.find((b) => b.id === "system")!;
    expect(acceptsGoals(deploy.start + 0.5)).toBe(false);
    expect(acceptsGoals(deploy.end - 0.5)).toBe(true);
    expect(acceptsGoals(system.start + 1)).toBe(true);
    expect(acceptsGoals(0)).toBe(false);
  });
});
