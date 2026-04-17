// src/lib/path-following/ekf.ts
import { wrapAngle } from "./kinematics";

/**
 * 5-state EKF: [p_x, p_y, θ, v, gyro_bias]
 * Dense matrix math — 5×5 is small enough that readability wins over
 * hand-unrolled loops.
 */

const N = 5;

export interface EkfConfig {
  useCurvatureAdaptive: boolean;
  useMahalanobis: boolean;
}

// χ²(2 dof, 95%) — rejection threshold on GPS innovation
const CHI2_95_2DOF = 5.991;

export class Ekf {
  /** State vector, row-major mutable. */
  state = new Float64Array(N);
  /** Covariance, row-major N×N. */
  P = identity(N);

  constructor(private cfg: EkfConfig) {
    // initial covariance — small but non-zero
    for (let i = 0; i < N; i++) this.P[i * N + i] = 0.5;
  }

  /** Live mode-flag update. Used for mid-run toggles (κ-adapt, outlier reject). */
  setConfig(next: Partial<EkfConfig>): void {
    this.cfg = { ...this.cfg, ...next };
  }

  /** Detect numerical blow-up — returns true if any variance is NaN or huge. */
  hasDiverged(): boolean {
    for (let i = 0; i < N; i++) {
      const v = this.P[i * N + i];
      if (!Number.isFinite(v) || v > 1e6) return true;
    }
    return false;
  }

  reset(initial: number[]): void {
    for (let i = 0; i < N; i++) this.state[i] = initial[i] ?? 0;
    this.P = identity(N);
    for (let i = 0; i < N; i++) this.P[i * N + i] = 0.5;
  }

  /**
   * Predict — noisy constant-velocity model with control (v, ω).
   * Curvature κ only affects Q scaling, not the dynamics.
   */
  predict(v: number, omega: number, dt: number, kappa = 0): void {
    const theta = this.state[2];

    // x' = f(x, u)
    this.state[0] += v * Math.cos(theta) * dt;
    this.state[1] += v * Math.sin(theta) * dt;
    this.state[2] = wrapAngle(this.state[2] + omega * dt);
    this.state[3] = v;
    // gyro bias is a slow random walk — no deterministic update

    // F = df/dx
    const F = identity(N);
    F[0 * N + 2] = -v * Math.sin(theta) * dt;
    F[0 * N + 3] = Math.cos(theta) * dt;
    F[1 * N + 2] = v * Math.cos(theta) * dt;
    F[1 * N + 3] = Math.sin(theta) * dt;

    // Q — process noise
    const qPos = 0.01 * dt;
    const qTheta =
      (this.cfg.useCurvatureAdaptive ? 1 + 7 * Math.abs(kappa) : 1) *
      0.005 *
      dt;
    const qV = 0.1 * dt;
    const qBias = 1e-6 * dt;
    const Q = new Float64Array(N * N);
    Q[0 * N + 0] = qPos;
    Q[1 * N + 1] = qPos;
    Q[2 * N + 2] = qTheta;
    Q[3 * N + 3] = qV;
    Q[4 * N + 4] = qBias;

    // P = F P Fᵀ + Q
    this.P = addMat(matmul(F, matmul(this.P, transpose(F))), Q);
  }

  /**
   * GPS update. Returns `true` when Mahalanobis rejection kicks in.
   */
  updateGps(zx: number, zy: number, sigma: number, kappa = 0): boolean {
    const H = new Float64Array(2 * N);
    H[0 * N + 0] = 1;
    H[1 * N + 1] = 1;

    const R = new Float64Array(4);
    R[0] = sigma * sigma;
    R[3] = sigma * sigma;

    const y = new Float64Array(2);
    y[0] = zx - this.state[0];
    y[1] = zy - this.state[1];

    const S = addMat2(matmul2x5x5x2(H, this.P), R);
    const Sinv = invert2x2(S);

    if (this.cfg.useMahalanobis) {
      const thresh =
        CHI2_95_2DOF * (1 + 1.5 * Math.abs(kappa));
      const m = y[0] * (Sinv[0] * y[0] + Sinv[1] * y[1])
              + y[1] * (Sinv[2] * y[0] + Sinv[3] * y[1]);
      if (m > thresh) return true;
    }

    // K = P Hᵀ S⁻¹  (N×2)
    const PHt = matmulNxNxNx2(this.P, transposeHx(H));
    const K = matmulNx2x2x2(PHt, Sinv);

    // x' = x + K y
    for (let i = 0; i < N; i++) {
      this.state[i] += K[i * 2 + 0] * y[0] + K[i * 2 + 1] * y[1];
    }
    this.state[2] = wrapAngle(this.state[2]);

    // P' = (I - K H) P
    const KH = matmulNx2x2xN(K, H);
    const IminusKH = subMat(identity(N), KH);
    this.P = matmul(IminusKH, this.P);
    return false;
  }

  /**
   * IMU update — measures ω_meas = ω_true + bias + noise.
   * Here ω_true is predicted from current control, not the state.
   * Uses a scalar update: z = bias + ε; h(x) = bias.
   */
  updateImu(imuOmega: number, sigma: number, commandedOmega: number): void {
    const residual = imuOmega - commandedOmega - this.state[4];
    const H = new Float64Array(N);
    H[4] = 1;
    // S = H P Hᵀ + R
    let S = 0;
    for (let i = 0; i < N; i++) S += H[i] * this.P[4 * N + i];
    S += sigma * sigma;
    const Sinv = 1 / S;
    // K = P Hᵀ S⁻¹
    const K = new Float64Array(N);
    for (let i = 0; i < N; i++) K[i] = this.P[i * N + 4] * Sinv;
    // x' = x + K residual
    for (let i = 0; i < N; i++) this.state[i] += K[i] * residual;
    this.state[2] = wrapAngle(this.state[2]);
    // P' = (I - K H) P
    const IminusKH = identity(N);
    for (let i = 0; i < N; i++) IminusKH[i * N + 4] -= K[i];
    this.P = matmul(IminusKH, this.P);
  }

  snapshotCovariance(): Float32Array {
    const out = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) out[i] = this.P[i];
    return out;
  }
}

// ── minimal matrix helpers (row-major Float64Array) ──────────────────────────

function identity(n: number): Float64Array {
  const m = new Float64Array(n * n);
  for (let i = 0; i < n; i++) m[i * n + i] = 1;
  return m;
}

function transpose(m: Float64Array): Float64Array {
  const out = new Float64Array(N * N);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) out[j * N + i] = m[i * N + j];
  return out;
}

function matmul(a: Float64Array, b: Float64Array): Float64Array {
  const out = new Float64Array(N * N);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      let s = 0;
      for (let k = 0; k < N; k++) s += a[i * N + k] * b[k * N + j];
      out[i * N + j] = s;
    }
  return out;
}

function addMat(a: Float64Array, b: Float64Array): Float64Array {
  const out = new Float64Array(N * N);
  for (let i = 0; i < N * N; i++) out[i] = a[i] + b[i];
  return out;
}

function subMat(a: Float64Array, b: Float64Array): Float64Array {
  const out = new Float64Array(N * N);
  for (let i = 0; i < N * N; i++) out[i] = a[i] - b[i];
  return out;
}

// H is 2×N stored row-major. H P Hᵀ → 2×2 stored row-major.
function matmul2x5x5x2(H: Float64Array, P: Float64Array): Float64Array {
  const HP = new Float64Array(2 * N);
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < N; j++) {
      let s = 0;
      for (let k = 0; k < N; k++) s += H[i * N + k] * P[k * N + j];
      HP[i * N + j] = s;
    }
  const out = new Float64Array(4);
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      let s = 0;
      for (let k = 0; k < N; k++) s += HP[i * N + k] * H[j * N + k];
      out[i * 2 + j] = s;
    }
  return out;
}

function addMat2(a: Float64Array, b: Float64Array): Float64Array {
  const out = new Float64Array(4);
  for (let i = 0; i < 4; i++) out[i] = a[i] + b[i];
  return out;
}

function invert2x2(m: Float64Array): Float64Array {
  const det = m[0] * m[3] - m[1] * m[2];
  const inv = 1 / (det || 1e-12);
  return new Float64Array([
    m[3] * inv,
    -m[1] * inv,
    -m[2] * inv,
    m[0] * inv,
  ]);
}

// Transpose a 2×N H into N×2.
function transposeHx(H: Float64Array): Float64Array {
  const out = new Float64Array(N * 2);
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < N; j++) out[j * 2 + i] = H[i * N + j];
  return out;
}

// N×N times N×2 → N×2
function matmulNxNxNx2(A: Float64Array, B: Float64Array): Float64Array {
  const out = new Float64Array(N * 2);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < 2; j++) {
      let s = 0;
      for (let k = 0; k < N; k++) s += A[i * N + k] * B[k * 2 + j];
      out[i * 2 + j] = s;
    }
  return out;
}

// N×2 times 2×2 → N×2
function matmulNx2x2x2(A: Float64Array, B: Float64Array): Float64Array {
  const out = new Float64Array(N * 2);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < 2; j++) {
      let s = 0;
      for (let k = 0; k < 2; k++) s += A[i * 2 + k] * B[k * 2 + j];
      out[i * 2 + j] = s;
    }
  return out;
}

// N×2 times 2×N → N×N
function matmulNx2x2xN(A: Float64Array, B: Float64Array): Float64Array {
  const out = new Float64Array(N * N);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      let s = 0;
      for (let k = 0; k < 2; k++) s += A[i * 2 + k] * B[k * N + j];
      out[i * N + j] = s;
    }
  return out;
}
