import { HW, type Vec2 } from "./types";

export function polarFromXY(p: Vec2): { theta: number; r: number } {
  return {
    theta: Math.atan2(p.y, p.x),
    r: Math.hypot(p.x, p.y),
  };
}

export function xyFromPolar({ theta, r }: { theta: number; r: number }): Vec2 {
  return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
}

export function isInsideEnvelope(p: Vec2): boolean {
  const r = Math.hypot(p.x, p.y);
  return r >= HW.R_MIN && r <= HW.R_MAX;
}

export function stepsFromTheta(theta: number): number {
  // Absolute steps — can be any real number; the firmware tracks the integer target.
  return Math.round((theta / (2 * Math.PI)) * HW.STEPPER_MICROSTEPS_PER_REV);
}

export function thetaFromSteps(steps: number): number {
  return (steps / HW.STEPPER_MICROSTEPS_PER_REV) * (2 * Math.PI);
}

export function rFromAdc(adc: number): number {
  return (adc / HW.ADC_RANGE) * HW.ADC_TRAVEL_MM;
}

export function adcFromR(r: number): number {
  return Math.round((r / HW.ADC_TRAVEL_MM) * HW.ADC_RANGE);
}
