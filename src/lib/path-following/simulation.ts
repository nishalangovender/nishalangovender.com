// src/lib/path-following/simulation.ts
import { PiController } from "./controller";
import { Ekf } from "./ekf";
import { stepKinematics } from "./kinematics";
import { densify, nearestReference, samplePath } from "./paths";
import {
  computeLookahead,
  desiredOmega,
  findTarget,
} from "./pure-pursuit";
import { SensorSuite } from "./sensors";
import type { ReferencePoint, SimConfig, SimFrame, SimStats } from "./types";

const DT = 0.02;       // 50 Hz
const TARGET_V = 1.4;  // m/s — matches the longest path perimeter in ~20 s

export class Simulator {
  private samples: ReferencePoint[];
  private ekf: Ekf;
  private ctl = new PiController();
  private sensors: SensorSuite;
  private truth: { x: number; y: number; theta: number; v: number };
  private t = 0;
  private stats: SimStats = {
    meanError: 0,
    maxError: 0,
    outliersRejected: 0,
    samplesProcessed: 0,
  };
  private errorSum = 0;
  private pursuitIndex = 0;
  private lastControl = { v: 0, omega: 0 };

  constructor(private cfg: SimConfig) {
    this.samples = densify(cfg.path, cfg.duration, 400);
    const p0 = this.samples[0];
    this.truth = { x: p0.x, y: p0.y, theta: p0.theta, v: 0 };
    this.ekf = new Ekf({
      useCurvatureAdaptive: cfg.useCurvatureAdaptiveEkf,
      useMahalanobis: cfg.useMahalanobisRejection,
    });
    this.ekf.reset([p0.x, p0.y, p0.theta, 0, 0]);
    this.sensors = new SensorSuite({
      seed: cfg.seed,
      gpsNoiseSigma: cfg.gpsNoiseSigma,
      imuNoiseSigma: cfg.imuNoiseSigma,
    });
  }

  /**
   * Live config update — for mid-run toggles. Keeps filter/controller state,
   * but flips the EKF mode flags and swaps sensor noise.
   */
  updateConfig(next: Partial<SimConfig>): void {
    this.cfg = { ...this.cfg, ...next };
    this.ekf.setConfig({
      useCurvatureAdaptive: this.cfg.useCurvatureAdaptiveEkf,
      useMahalanobis: this.cfg.useMahalanobisRejection,
    });
    this.sensors = new SensorSuite({
      seed: this.cfg.seed,
      gpsNoiseSigma: this.cfg.gpsNoiseSigma,
      imuNoiseSigma: this.cfg.imuNoiseSigma,
    });
  }

  /** True if the EKF covariance has gone non-PSD or blown up numerically. */
  hasDiverged(): boolean {
    return this.ekf.hasDiverged();
  }

  /** Reinitialise the filter at the current truth pose after divergence. */
  recoverFromDivergence(): void {
    this.ekf.reset([this.truth.x, this.truth.y, this.truth.theta, this.truth.v, 0]);
  }

  step(): SimFrame {
    const ref = samplePath(this.cfg.path, this.t);

    // 1) Truth integration using previous control
    this.truth = stepKinematics(
      this.truth,
      this.lastControl.v,
      this.lastControl.omega,
      DT,
    );

    // 2) Sensors
    const sensed = this.sensors.sample(this.truth, this.t, DT, this.lastControl.omega);

    // 3) EKF predict + updates
    this.ekf.predict(
      this.lastControl.v,
      this.lastControl.omega,
      DT,
      ref.kappa,
    );
    let rejected = false;
    if (sensed.gps) {
      rejected = this.ekf.updateGps(
        sensed.gps.x,
        sensed.gps.y,
        this.cfg.gpsNoiseSigma || 0.01,
        ref.kappa,
      );
      if (rejected) this.stats.outliersRejected++;
    }
    if (sensed.imu) {
      this.ekf.updateImu(
        sensed.imu.omega,
        this.cfg.imuNoiseSigma || 0.001,
        this.lastControl.omega,
      );
    }

    // 4) Pure pursuit on the estimate
    const pose = {
      x: this.ekf.state[0],
      y: this.ekf.state[1],
      theta: this.ekf.state[2],
    };
    const v = this.ekf.state[3];
    const L = computeLookahead(v);
    const { target, index } = findTarget(
      this.samples,
      pose,
      L,
      this.pursuitIndex,
    );
    this.pursuitIndex = index;
    const omegaDesired = desiredOmega(pose, target, TARGET_V, L);

    // 5) Constant-velocity cruise; omega from Pure Pursuit.
    const { v: vCmd } = this.ctl.step(TARGET_V);
    const control = { v: vCmd, omega: omegaDesired };
    this.lastControl = control;

    // 6) Stats
    const err = nearestReference(this.samples, this.truth.x, this.truth.y).distance;
    this.errorSum += err;
    this.stats.samplesProcessed++;
    this.stats.meanError = this.errorSum / this.stats.samplesProcessed;
    if (err > this.stats.maxError) this.stats.maxError = err;

    const frame: SimFrame = {
      t: this.t,
      reference: { x: ref.x, y: ref.y, theta: ref.theta },
      truth: { ...this.truth },
      estimate: {
        x: this.ekf.state[0],
        y: this.ekf.state[1],
        theta: this.ekf.state[2],
        v: this.ekf.state[3],
        gyroBias: this.ekf.state[4],
      },
      covariance: this.ekf.snapshotCovariance(),
      lastGpsFix: sensed.gps
        ? { x: sensed.gps.x, y: sensed.gps.y, rejected }
        : null,
      lastImuReading: sensed.imu,
      control: { v: control.v, omega: control.omega, lookahead: L },
      trackingError: err,
    };

    this.t += DT;
    return frame;
  }

  getSamples(): ReadonlyArray<ReferencePoint> {
    return this.samples;
  }

  getStats(): SimStats {
    return { ...this.stats };
  }
}
