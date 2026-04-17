// src/lib/path-following/sensors.ts

/** mulberry32 — tiny seedable 32-bit PRNG returning [0, 1). */
export function createRng(seed: number): () => number {
  let s = seed | 0;
  return function rng() {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller — unit Gaussian sample from a uniform RNG. */
export function gaussian(rng: () => number): number {
  const u1 = Math.max(rng(), 1e-10);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export interface SensorSuiteConfig {
  seed: number;
  gpsNoiseSigma: number;
  imuNoiseSigma: number;
}

export interface SensorOutput {
  gps: { x: number; y: number } | null;
  imu: { omega: number } | null;
}

/**
 * Drives the sensor streams at their native rates.
 *
 * The outer simulation runs at 50 Hz (dt = 0.02 s). GPS fires every 50 ticks
 * (1 Hz) — including the first tick. IMU fires every 5 half-ticks — i.e.
 * 20 Hz — which we implement by advancing a counter by 2 per tick and
 * triggering when the counter crosses a multiple of 5. Integer arithmetic,
 * zero float drift.
 */
export class SensorSuite {
  private rng: () => number;
  private tick = 0;
  private imuHalfTick = 0;

  constructor(private cfg: SensorSuiteConfig) {
    this.rng = createRng(cfg.seed);
  }

  reset(): void {
    this.rng = createRng(this.cfg.seed);
    this.tick = 0;
    this.imuHalfTick = 0;
  }

  sample(
    truth: { x: number; y: number; v: number; theta: number },
    t: number,
    dt: number,
    angularVelocityTruth = 0,
  ): SensorOutput {
    // GPS: 1 Hz — every 50 ticks at 50 Hz.
    const gpsTrigger = this.tick % 50 === 0;

    // IMU: 20 Hz — every 2.5 ticks at 50 Hz. Track a half-tick counter
    // (ticks × 2) and trigger whenever it crosses a multiple of 5.
    const imuBefore = Math.floor(this.imuHalfTick / 5);
    this.imuHalfTick += 2;
    const imuAfter = Math.floor(this.imuHalfTick / 5);
    const imuTrigger = imuAfter > imuBefore;

    this.tick++;

    let gps: SensorOutput["gps"] = null;
    if (gpsTrigger) {
      gps = {
        x: truth.x + gaussian(this.rng) * this.cfg.gpsNoiseSigma,
        y: truth.y + gaussian(this.rng) * this.cfg.gpsNoiseSigma,
      };
    }

    let imu: SensorOutput["imu"] = null;
    if (imuTrigger) {
      imu = {
        omega:
          angularVelocityTruth + gaussian(this.rng) * this.cfg.imuNoiseSigma,
      };
    }

    return { gps, imu };
  }
}
