// src/lib/path-following/controller.ts

const KP_V = 1.5;
const KI_V = 0.2;
const KP_OMEGA = 3.0;
const KI_OMEGA = 0.5;
const WINDUP_CLAMP = 0.5;

export class PiController {
  private integralV = 0;
  private integralOmega = 0;

  reset(): void {
    this.integralV = 0;
    this.integralOmega = 0;
  }

  step(
    desiredV: number,
    measuredV: number,
    desiredOmega: number,
    measuredOmega: number,
    dt: number,
  ): { v: number; omega: number } {
    const ev = desiredV - measuredV;
    this.integralV = clamp(
      this.integralV + ev * dt,
      -WINDUP_CLAMP,
      WINDUP_CLAMP,
    );
    const v = desiredV + KP_V * ev + KI_V * this.integralV;

    const eo = desiredOmega - measuredOmega;
    this.integralOmega = clamp(
      this.integralOmega + eo * dt,
      -WINDUP_CLAMP,
      WINDUP_CLAMP,
    );
    const omega = desiredOmega + KP_OMEGA * eo + KI_OMEGA * this.integralOmega;

    return { v, omega };
  }
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}
