import { describe, expect, it } from "vitest";

import { AGV } from "../sketch";
import { WHEELS, spinFor, wheelTravel } from "../wheels";

const at = (x: number, y: number, theta: number) => ({ x, y, theta });

describe("wheel travel", () => {
  it("rolls every wheel the same distance driving straight", () => {
    const t = wheelTravel(at(0, 0, 0), at(0.1, 0, 0));
    expect(t.left).toBeCloseTo(0.1, 9);
    expect(t.right).toBeCloseTo(0.1, 9);
    expect(t.castor).toBeCloseTo(0.1, 9);
  });

  it("counter-rotates the drive wheels turning on the spot", () => {
    const t = wheelTravel(at(0, 0, 0), at(0, 0, 0.1));
    expect(t.left).toBeCloseTo(-0.1 * (AGV.track / 2), 9);
    expect(t.right).toBeCloseTo(0.1 * (AGV.track / 2), 9);
    expect(t.castor).toBe(0);
  });

  it("rolls backwards when reversing, and ignores teleports", () => {
    expect(wheelTravel(at(0, 0, 0), at(-0.1, 0, 0)).left).toBeCloseTo(-0.1, 9);
    expect(wheelTravel(at(0, 0, 0), at(5, 0, 0))).toEqual({ left: 0, right: 0, castor: 0 });
  });

  it("spins a wheel one radian per radius of travel, clockwise for forward", () => {
    for (const w of WHEELS) expect(spinFor(w, w.radius)).toBeCloseTo(-1, 9);
  });
});
