import { describe, expect, it } from "vitest";

import {
  adcFromR,
  isInsideEnvelope,
  polarFromXY,
  rFromAdc,
  stepsFromTheta,
  thetaFromSteps,
  xyFromPolar,
} from "../kinematics";
import { HW } from "../types";

describe("kinematics: (x,y) ↔ (θ, r)", () => {
  it("round-trips a 20-point grid within 1e-9", () => {
    for (let ix = 0; ix < 4; ix++) {
      for (let iy = 0; iy < 5; iy++) {
        // Stay inside the reachable envelope.
        const x = 40 + ix * 50;   // 40, 90, 140, 190
        const y = -80 + iy * 40;  // -80, -40, 0, 40, 80
        const pol = polarFromXY({ x, y });
        const back = xyFromPolar(pol);
        expect(back.x).toBeCloseTo(x, 9);
        expect(back.y).toBeCloseTo(y, 9);
      }
    }
  });
});

describe("kinematics: envelope", () => {
  it("accepts points inside", () => {
    expect(isInsideEnvelope({ x: 100, y: 0 })).toBe(true);
  });
  it("rejects points too close to pivot", () => {
    expect(isInsideEnvelope({ x: 5, y: 0 })).toBe(false);
  });
  it("rejects points beyond max reach", () => {
    expect(isInsideEnvelope({ x: 300, y: 0 })).toBe(false);
  });
  it("boundaries are inclusive", () => {
    expect(isInsideEnvelope({ x: HW.R_MIN, y: 0 })).toBe(true);
    expect(isInsideEnvelope({ x: HW.R_MAX, y: 0 })).toBe(true);
  });
});

describe("kinematics: steps ↔ radians", () => {
  it("round-trips at 0, π/4, π, 3π/2", () => {
    for (const theta of [0, Math.PI / 4, Math.PI, (3 * Math.PI) / 2]) {
      const steps = stepsFromTheta(theta);
      expect(thetaFromSteps(steps)).toBeCloseTo(theta, 9);
    }
  });
  it("one full revolution = STEPPER_MICROSTEPS_PER_REV", () => {
    expect(stepsFromTheta(2 * Math.PI)).toBe(HW.STEPPER_MICROSTEPS_PER_REV);
  });
});

describe("kinematics: adc ↔ r", () => {
  it("adc 0 maps to r = 0 mm", () => {
    expect(rFromAdc(0)).toBe(0);
  });
  it("adc ADC_RANGE maps to r = ADC_TRAVEL_MM", () => {
    expect(rFromAdc(HW.ADC_RANGE)).toBeCloseTo(HW.ADC_TRAVEL_MM, 9);
  });
  it("round-trips an in-range r", () => {
    const r = 148.2;
    const adc = adcFromR(r);
    expect(rFromAdc(adc)).toBeCloseTo(r, 2);
  });
});
