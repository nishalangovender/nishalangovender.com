import { describe, expect, it } from "vitest";

import { curlPoint, curlPositions, stripTurn } from "../page-turn";

const W = 4.2;
const D = 3.2;

describe("page turn", () => {
  it("lies flat on the right before, and flat on the left after", () => {
    for (const s of [0, 1, W]) {
      expect(curlPoint(s, W, 0).x).toBeCloseTo(s, 9);
      expect(curlPoint(s, W, 0).y).toBeCloseTo(0, 9);
      expect(curlPoint(s, W, 1).x).toBeCloseTo(-s, 9);
      expect(curlPoint(s, W, 1).y).toBeCloseTo(0, 9);
    }
  });

  it("keeps the paper's length as it curls", () => {
    for (const k of [0.2, 0.5, 0.8]) {
      let length = 0;
      let prev = curlPoint(0, W, k);
      for (let i = 1; i <= 200; i++) {
        const p = curlPoint((i / 200) * W, W, k);
        length += Math.hypot(p.x - prev.x, p.y - prev.y);
        prev = p;
      }
      expect(length).toBeCloseTo(W, 3);
    }
  });

  it("curls the free edge up ahead of the spine as it lifts, and trails it as it falls", () => {
    const rising = curlPoint(W, W, 0.25);
    const falling = curlPoint(W, W, 0.75);
    // Rising: the edge has turned further than a flat board would.
    expect(Math.atan2(rising.y, rising.x)).toBeGreaterThan(Math.PI * 0.25);
    // Falling: the edge lags a flat board, still up in the air.
    expect(Math.atan2(falling.y, falling.x)).toBeLessThan(Math.PI * 0.75);
    expect(falling.y).toBeGreaterThan(0);
  });

  it("lifts the near corner first; the far edge follows", () => {
    expect(stripTurn(0.2, 1)).toBeGreaterThan(stripTurn(0.2, 0));
    expect(stripTurn(0, 1)).toBe(0);
    expect(stripTurn(1, 0)).toBe(1);
  });

  it("maps sheet positions onto the curl, lifted along the paper's normal", () => {
    const base = [W, 0.01, 0, 0, 0.01, D / 2];
    const out = new Float32Array(6);
    curlPositions(base, out, W, D, 1);
    expect(out[0]).toBeCloseTo(-W, 4);
    // Face down on the left: the lift now points down.
    expect(out[1]).toBeCloseTo(-0.01, 4);
    expect(out[5]).toBeCloseTo(D / 2, 6);
  });
});
