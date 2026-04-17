import { describe, expect, it } from "vitest";
import { computeLookahead, findTarget } from "../pure-pursuit";

describe("computeLookahead", () => {
  it("clamps below the minimum at low speed", () => {
    expect(computeLookahead(0)).toBe(0.5);
  });
  it("uses the linear formula in the mid band", () => {
    expect(computeLookahead(1)).toBeCloseTo(1.2, 5); // 0.9*1 + 0.3
  });
  it("clamps to the ceiling at high speed", () => {
    expect(computeLookahead(10)).toBe(2.0);
  });
});

describe("findTarget", () => {
  it("picks a point at roughly the lookahead distance along the path ahead", () => {
    const samples = Array.from({ length: 100 }, (_, i) => ({
      x: i * 0.1,
      y: 0,
      theta: 0,
      kappa: 0,
      t: i * 0.1,
    }));
    const result = findTarget(samples, { x: 0, y: 0, theta: 0 }, 1.0, 0);
    expect(result.target.x).toBeCloseTo(1.0, 1);
  });
});
