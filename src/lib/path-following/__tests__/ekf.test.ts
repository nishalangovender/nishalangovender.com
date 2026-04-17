import { describe, expect, it } from "vitest";
import { Ekf } from "../ekf";

describe("Ekf", () => {
  it("gyro bias estimate converges toward the true bias", () => {
    const ekf = new Ekf({ useCurvatureAdaptive: true, useMahalanobis: true });
    const trueBias = 0.03;
    const dt = 0.02;
    for (let step = 0; step < 2000; step++) {
      const t = step * dt;
      ekf.predict(1.0, 0.0, dt);
      if (step % 50 === 0) {
        ekf.updateGps(step * dt * 1.0, 0, 0.5, 0);
      }
      if (step % 3 === 0) {
        ekf.updateImu(trueBias, 0.01, 0);
      }
    }
    const estBias = ekf.state[4];
    expect(Math.abs(estBias - trueBias)).toBeLessThan(0.02);
  });

  it("rejects wildly implausible GPS fixes when Mahalanobis enabled", () => {
    const ekf = new Ekf({ useCurvatureAdaptive: false, useMahalanobis: true });
    for (let s = 0; s < 50; s++) {
      ekf.predict(0, 0, 0.02);
      if (s % 5 === 0) ekf.updateGps(0, 0, 0.5, 0);
    }
    const rejected = ekf.updateGps(1000, 1000, 0.5, 0);
    expect(rejected).toBe(true);
  });
});
