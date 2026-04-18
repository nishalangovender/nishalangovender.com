// src/lib/park-bot/__tests__/kinematics.test.ts
import { describe, expect, it } from "vitest";

import { computeWheelTargets, recoverTwist } from "../kinematics";
import type { KinematicMode, Twist } from "../types";

const TOL = 1e-5;
const RT_TOL = 1e-9;

function assertTargets(
  got: { deltas: readonly number[]; omegas: readonly number[] },
  deltas: readonly [number, number, number, number],
  omegas: readonly [number, number, number, number],
) {
  for (let i = 0; i < 4; i++) {
    expect(Math.abs(got.deltas[i] - deltas[i])).toBeLessThan(TOL);
    expect(Math.abs(got.omegas[i] - omegas[i])).toBeLessThan(TOL);
  }
}

describe("Ackermann", () => {
  it("straight forward", () => {
    const got = computeWheelTargets({ vx: 1, vy: 0, omega: 0 }, "ackermann");
    assertTargets(got, [0, 0, 0, 0], [20, 20, 20, 20]);
  });

  it("zero twist", () => {
    const got = computeWheelTargets({ vx: 0, vy: 0, omega: 0 }, "ackermann");
    assertTargets(got, [0, 0, 0, 0], [0, 0, 0, 0]);
  });

  it("left turn", () => {
    // Matches fixture A3 in park_bot/docs/kinematic_fixtures.md.
    const got = computeWheelTargets({ vx: 1, vy: 0, omega: 0.5 }, "ackermann");
    assertTargets(
      got,
      [0.212938, 0.183943, 0, 0],
      [18.92749, 21.86893, 18.5, 21.5],
    );
  });

  it("rejects lateral velocity", () => {
    const got = computeWheelTargets({ vx: 1, vy: 0.5, omega: 0 }, "ackermann");
    assertTargets(got, [0, 0, 0, 0], [20, 20, 20, 20]);
  });
});

describe("Crab", () => {
  it("forward", () => {
    const got = computeWheelTargets({ vx: 1, vy: 0, omega: 0 }, "crab");
    assertTargets(got, [0, 0, 0, 0], [20, 20, 20, 20]);
  });

  it("sideways left", () => {
    const got = computeWheelTargets({ vx: 0, vy: 1, omega: 0 }, "crab");
    const h = Math.PI / 2;
    assertTargets(got, [h, h, h, h], [20, 20, 20, 20]);
  });

  it("diagonal", () => {
    const got = computeWheelTargets({ vx: 1, vy: 1, omega: 0 }, "crab");
    const q = Math.PI / 4;
    assertTargets(got, [q, q, q, q], [28.28427, 28.28427, 28.28427, 28.28427]);
  });
});

describe("Counter-steer", () => {
  it("tight left", () => {
    // Matches fixture S1 in park_bot/docs/kinematic_fixtures.md.
    const got = computeWheelTargets(
      { vx: 1, vy: 0, omega: 1 },
      "counter_steer",
    );
    assertTargets(
      got,
      [0.231091, 0.172191, -0.231091, -0.172191],
      [17.46425, 23.34524, 17.46425, 23.34524],
    );
  });
});

describe("Pivot", () => {
  it("CCW", () => {
    const got = computeWheelTargets({ vx: 0, vy: 0, omega: 1 }, "pivot");
    assertTargets(
      got,
      [2.214297, 0.927295, -2.214297, -0.927295],
      [5, -5, -5, 5],
    );
  });

  it("rejects translation", () => {
    const got = computeWheelTargets({ vx: 1, vy: 1, omega: 0 }, "pivot");
    expect(got.omegas).toEqual([0, 0, 0, 0]);
  });
});

describe("Round-trip", () => {
  const cases: Array<{ twist: Twist; mode: KinematicMode }> = [
    { twist: { vx: 1, vy: 0, omega: 0 },   mode: "ackermann" },
    { twist: { vx: 1, vy: 0, omega: 0.5 }, mode: "ackermann" },
    { twist: { vx: 1, vy: 0, omega: 0 },   mode: "crab" },
    { twist: { vx: 0, vy: 1, omega: 0 },   mode: "crab" },
    { twist: { vx: 1, vy: 1, omega: 0 },   mode: "crab" },
    { twist: { vx: 1, vy: 0, omega: 1 },   mode: "counter_steer" },
    { twist: { vx: 0, vy: 0, omega: 1 },   mode: "pivot" },
  ];

  for (const { twist, mode } of cases) {
    it(`${mode}: ${JSON.stringify(twist)}`, () => {
      const targets = computeWheelTargets(twist, mode);
      const got = recoverTwist(targets, mode);
      expect(Math.abs(got.vx - twist.vx)).toBeLessThan(RT_TOL);
      expect(Math.abs(got.vy - twist.vy)).toBeLessThan(RT_TOL);
      expect(Math.abs(got.omega - twist.omega)).toBeLessThan(RT_TOL);
    });
  }
});
