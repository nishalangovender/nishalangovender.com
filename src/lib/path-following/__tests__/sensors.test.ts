import { describe, expect, it } from "vitest";

import { createRng, SensorSuite } from "../sensors";

describe("createRng", () => {
  it("is deterministic given same seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = createRng(42);
    const b = createRng(43);
    expect(a()).not.toEqual(b());
  });
});

describe("SensorSuite", () => {
  it("emits GPS fixes at 1 Hz (once per second simulated)", () => {
    const suite = new SensorSuite({ seed: 42, gpsNoiseSigma: 0, imuNoiseSigma: 0 });
    let count = 0;
    for (let step = 0; step < 100; step++) { // 2 s of ticks at 50 Hz
      const out = suite.sample({ x: 0, y: 0, theta: 0, v: 1 }, step * 0.02, 0.02);
      if (out.gps) count++;
    }
    // At 50 Hz for 2 s, first GPS at t=0, then t=1 — so 2 fixes expected
    expect(count).toBe(2);
  });

  it("emits IMU samples at 20 Hz", () => {
    const suite = new SensorSuite({ seed: 42, gpsNoiseSigma: 0, imuNoiseSigma: 0 });
    let count = 0;
    for (let step = 0; step < 100; step++) {
      const out = suite.sample({ x: 0, y: 0, theta: 0, v: 1 }, step * 0.02, 0.02);
      if (out.imu) count++;
    }
    // 50 Hz ticks, IMU every 2.5 ticks — so 40 samples over 2 s
    expect(count).toBe(40);
  });
});
