// src/lib/path-following/types.ts

export type PathKind = "lemniscate" | "circle" | "figure-eight";

/** Static configuration set once per simulation run. */
export interface SimConfig {
  path: PathKind;
  duration: number;              // seconds
  gpsNoiseSigma: number;         // metres
  imuNoiseSigma: number;         // rad/s
  useCurvatureAdaptiveEkf: boolean;
  useMahalanobisRejection: boolean;
  seed: number;
}

export const DEFAULT_CONFIG: SimConfig = {
  path: "lemniscate",
  duration: 20,
  gpsNoiseSigma: 0.5,
  imuNoiseSigma: 0.01,
  useCurvatureAdaptiveEkf: true,
  useMahalanobisRejection: true,
  seed: 42,
};

export interface Pose {
  x: number;
  y: number;
  theta: number;
}

export interface ReferencePoint extends Pose {
  kappa: number;                 // signed curvature at this sample
  t: number;                     // parametric time along trajectory
}

export interface SimFrame {
  t: number;
  reference: Pose;
  truth: Pose & { v: number };
  estimate: Pose & { v: number; gyroBias: number };
  /** 5×5 flattened row-major: [p_x, p_y, θ, v, gyro_bias] */
  covariance: Float32Array;
  lastGpsFix: { x: number; y: number; rejected: boolean } | null;
  lastImuReading: { omega: number } | null;
  control: { v: number; omega: number; lookahead: number };
  trackingError: number;
}

export interface SimStats {
  meanError: number;
  maxError: number;
  outliersRejected: number;
  samplesProcessed: number;
}
