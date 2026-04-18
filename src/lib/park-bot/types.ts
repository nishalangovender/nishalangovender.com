// src/lib/park-bot/types.ts

export type KinematicMode =
  | "ackermann"
  | "crab"
  | "counter_steer"
  | "pivot";

export interface Twist {
  vx: number;     // m/s, body forward
  vy: number;     // m/s, body left
  omega: number;  // rad/s, +CCW about z
}

export interface WheelState {
  /** Steering angles in radians: [FL, FR, RL, RR]. */
  deltas: readonly [number, number, number, number];
  /** Wheel angular velocities in rad/s: [FL, FR, RL, RR]. */
  omegas: readonly [number, number, number, number];
}

export interface Pose {
  x: number;      // metres
  y: number;      // metres
  theta: number;  // radians, +CCW from +x̂
}

export type MissionPhase =
  | "idle"
  | "approach"
  | "active"
  | "align"
  | "done"
  | "stuck";

export interface ScenarioBounds {
  width: number;   // metres
  height: number;  // metres
}

export interface ObstacleBox {
  /** Lower-left corner in world coords. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Scenario {
  id: "forward_bay" | "parallel_tight" | "narrow_uturn" | "pivot_rotate";
  title: string;
  hint: string;
  recommendedMode: KinematicMode;
  start: Pose;
  target: Pose;
  bounds: ScenarioBounds;
  obstacles: readonly ObstacleBox[];
  /** Three-step narrative shown in the HUD ticker. */
  phases: readonly [string, string, string];
}

export interface SimFrame {
  t: number;           // seconds
  pose: Pose;
  wheels: WheelState;
  activeMode: KinematicMode;
  phase: MissionPhase;
  phaseIndex: 0 | 1 | 2;
  trail: readonly Pose[];
  stuck: boolean;      // true if a force-mode mismatch has blocked progress
}

export interface SimConfig {
  scenarioId: Scenario["id"];
  forcedMode: KinematicMode | null;   // null = mission picks
  dt: number;                         // integrator step in seconds
}

export const DEFAULT_CONFIG: SimConfig = {
  scenarioId: "forward_bay",
  forcedMode: null,
  dt: 1 / 60,
};

// Vehicle params — must match park_bot/park_bot/kinematics.py.
export const L = 0.40;
export const W = 0.30;
export const WHEEL_RADIUS = 0.05;
