// src/lib/park-bot/kinematics.ts

import type { KinematicMode, Twist, WheelState } from "./types";
import { L, W, WHEEL_RADIUS as R } from "./types";

type Tuple4 = readonly [number, number, number, number];

function copysign(x: number, s: number): number {
  return s === 0 ? x : (s < 0 ? -Math.abs(x) : Math.abs(x));
}

export function computeWheelTargets(
  twist: Twist,
  mode: KinematicMode,
): WheelState {
  switch (mode) {
    case "ackermann":     return ackermann(twist.vx, twist.omega);
    case "crab":          return crab(twist.vx, twist.vy);
    case "counter_steer": return counterSteer(twist.vx, twist.omega);
    case "pivot":         return pivot(twist.omega);
  }
}

function ackermann(vx: number, omega: number): WheelState {
  if (Math.abs(omega) < 1e-9) {
    const s = vx / R;
    return {
      deltas: [0, 0, 0, 0] as Tuple4,
      omegas: [s, s, s, s] as Tuple4,
    };
  }
  const radius = vx / omega;
  const dFL = Math.atan2(L, radius - W / 2);
  const dFR = Math.atan2(L, radius + W / 2);
  const rFL = Math.hypot(L, radius - W / 2);
  const rFR = Math.hypot(L, radius + W / 2);
  const rRL = Math.abs(radius - W / 2);
  const rRR = Math.abs(radius + W / 2);
  const wFL = copysign((omega * rFL) / R, vx);
  const wFR = copysign((omega * rFR) / R, vx);
  const wRL = copysign((omega * rRL) / R, vx);
  const wRR = copysign((omega * rRR) / R, vx);
  return {
    deltas: [dFL, dFR, 0, 0] as Tuple4,
    omegas: [wFL, wFR, wRL, wRR] as Tuple4,
  };
}

function crab(vx: number, vy: number): WheelState {
  const speed = Math.hypot(vx, vy);
  const phi = speed > 0 ? Math.atan2(vy, vx) : 0;
  const w = speed / R;
  return {
    deltas: [phi, phi, phi, phi] as Tuple4,
    omegas: [w, w, w, w] as Tuple4,
  };
}

function counterSteer(vx: number, omega: number): WheelState {
  if (Math.abs(omega) < 1e-9) {
    const s = vx / R;
    return {
      deltas: [0, 0, 0, 0] as Tuple4,
      omegas: [s, s, s, s] as Tuple4,
    };
  }
  const halfL = L / 2;
  const radius = vx / omega;
  const dFL = Math.atan2(halfL, radius - W / 2);
  const dFR = Math.atan2(halfL, radius + W / 2);
  const rFL = Math.hypot(halfL, radius - W / 2);
  const rFR = Math.hypot(halfL, radius + W / 2);
  const wFL = copysign((omega * rFL) / R, vx);
  const wFR = copysign((omega * rFR) / R, vx);
  return {
    deltas: [dFL, dFR, -dFL, -dFR] as Tuple4,
    omegas: [wFL, wFR, wFL, wFR] as Tuple4,
  };
}

function pivot(omega: number): WheelState {
  const halfL = L / 2;
  const halfW = W / 2;
  const dFL = Math.atan2(halfL, -halfW);
  const dFR = Math.atan2(halfL, halfW);
  const dRL = Math.atan2(-halfL, -halfW);
  const dRR = Math.atan2(-halfL, halfW);
  const rho = Math.hypot(halfL, halfW);
  if (omega === 0) {
    return {
      deltas: [dFL, dFR, dRL, dRR] as Tuple4,
      omegas: [0, 0, 0, 0] as Tuple4,
    };
  }
  const s = (omega * rho) / R;
  return {
    deltas: [dFL, dFR, dRL, dRR] as Tuple4,
    omegas: [s, -s, -s, s] as Tuple4,
  };
}

// --- Inverse mapping (targets -> twist) ---

export function recoverTwist(
  targets: WheelState,
  mode: KinematicMode,
): Twist {
  switch (mode) {
    case "ackermann":     return recoverAckermann(targets);
    case "crab":          return recoverCrab(targets);
    case "counter_steer": return recoverCounterSteer(targets);
    case "pivot":         return recoverPivot(targets);
  }
}

function recoverAckermann({ deltas, omegas }: WheelState): Twist {
  const [dFL, , , ] = deltas;
  const [, , wRL, wRR] = omegas;
  if (Math.abs(dFL) < 1e-12) {
    return { vx: omegas[0] * R, vy: 0, omega: 0 };
  }
  const vRear = ((wRL + wRR) / 2) * R;
  const radius = L / Math.tan(dFL) + W / 2;
  return { vx: vRear, vy: 0, omega: vRear / radius };
}

function recoverCrab({ deltas, omegas }: WheelState): Twist {
  const phi = deltas[0];
  const speed = omegas[0] * R;
  return { vx: speed * Math.cos(phi), vy: speed * Math.sin(phi), omega: 0 };
}

function recoverCounterSteer({ deltas, omegas }: WheelState): Twist {
  const dFL = deltas[0];
  const wFL = omegas[0];
  if (Math.abs(dFL) < 1e-12) {
    return { vx: wFL * R, vy: 0, omega: 0 };
  }
  const halfL = L / 2;
  const radius = halfL / Math.tan(dFL) + W / 2;
  const rFL = Math.hypot(halfL, radius - W / 2);
  const vFL = wFL * R;
  const omega = vFL / rFL;
  return { vx: omega * radius, vy: 0, omega };
}

function recoverPivot({ omegas }: WheelState): Twist {
  const rho = Math.hypot(L / 2, W / 2);
  const omega = (omegas[0] * R) / rho;
  return { vx: 0, vy: 0, omega };
}
