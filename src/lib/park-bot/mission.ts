// src/lib/park-bot/mission.ts
//
// Scripted per-scenario mission plans. Not a real planner — each scenario
// encodes the commanded body twist and mode for each of its three phases,
// plus a duration. sample(t) returns the current command, phase and index.

import type {
  KinematicMode,
  MissionPhase,
  Scenario,
  Twist,
} from "./types";

interface PhaseSpec {
  duration: number;
  twist: Twist;
  mode: KinematicMode;
  phase: Exclude<MissionPhase, "idle" | "done" | "stuck">;
}

interface Plan {
  duration: number;
  sample(t: number): MissionSample;
}

export interface MissionSample {
  twist: Twist;
  activeMode: KinematicMode;
  phase: MissionPhase;
  phaseIndex: 0 | 1 | 2;
  /** true when a force-mode override makes the commanded twist physically unrealisable. */
  stuck: boolean;
}

// Recipes are hand-tuned so each scenario's integrated end-pose lands on (or
// within a few centimetres of) the target bay drawn on the canvas. Durations
// that depend on π are written as closed-form expressions rather than decimals
// so the maths stays legible — adjust vx/ω and the duration tracks automatically.
const RECIPES: Record<Scenario["id"], PhaseSpec[]> = {
  // Start (-2.5, -1.0, 0°); target (1.5, 0.8, 90°).
  // Approach: straight forward 3.0 m → (0.5, -1.0, 0°).
  // Active:   Ackermann left turn, R=1.0, CCW through 90° → (1.5, 0.0, 90°).
  // Align:    straight forward 0.8 m in heading +y → (1.5, 0.8, 90°).
  forward_bay: [
    { duration: 3.0,             twist: { vx: 1.0, vy: 0, omega: 0 },    mode: "ackermann", phase: "approach" },
    { duration: Math.PI / 1.8,   twist: { vx: 0.9, vy: 0, omega: 0.9 },  mode: "ackermann", phase: "active" },
    { duration: 2.0,             twist: { vx: 0.4, vy: 0, omega: 0 },    mode: "ackermann", phase: "align" },
  ],
  // Start (-1.5, -0.3, 0°); target (1.5, 0.8, 0°).
  // Approach: straight 1.2 m → (-0.3, -0.3, 0°).
  // Active:   crab diagonal (vx=0.5, vy=0.55) for 2.0 s → (0.7, 0.8, 0°).
  // Align:    straight 0.8 m → (1.5, 0.8, 0°).
  parallel_tight: [
    { duration: 2.0, twist: { vx: 0.6, vy: 0,    omega: 0 }, mode: "crab", phase: "approach" },
    { duration: 2.0, twist: { vx: 0.5, vy: 0.55, omega: 0 }, mode: "crab", phase: "active" },
    { duration: 2.0, twist: { vx: 0.4, vy: 0,    omega: 0 }, mode: "crab", phase: "align" },
  ],
  // Start (-2.5, -0.6, 0°); target (-2.5, 0.6, 180°).
  // Approach: straight 1.0 m → (-1.5, -0.6, 0°).
  // Active:   counter-steer CCW half-circle R=0.6 around (-1.5, 0) → (-1.5, +0.6, π).
  // Align:    straight 1.0 m in heading π (i.e. -x world) → (-2.5, 0.6, π).
  narrow_uturn: [
    { duration: 2.0,             twist: { vx: 0.5, vy: 0, omega: 0 }, mode: "counter_steer", phase: "approach" },
    { duration: Math.PI,         twist: { vx: 0.6, vy: 0, omega: 1 }, mode: "counter_steer", phase: "active" },
    { duration: 2.0,             twist: { vx: 0.5, vy: 0, omega: 0 }, mode: "counter_steer", phase: "align" },
  ],
  // Start (0, 0, 0°); target (0, 0, 180°). Pure yaw by π.
  pivot_rotate: [
    { duration: 0.6,     twist: { vx: 0, vy: 0, omega: 0 }, mode: "pivot", phase: "approach" },
    { duration: Math.PI, twist: { vx: 0, vy: 0, omega: 1 }, mode: "pivot", phase: "active" },
    { duration: 0.6,     twist: { vx: 0, vy: 0, omega: 0 }, mode: "pivot", phase: "align" },
  ],
};

// Which forced-mode combos cannot physically achieve the active-phase twist.
// When a clash occurs the HUD reports "stuck" instead of "active" from that
// point onwards — the sim loop halts motion so the trail stops at the failure.
const FORCE_MISMATCH: Array<{
  scenario: Scenario["id"];
  forced: KinematicMode;
  reason: string;
}> = [
  { scenario: "parallel_tight", forced: "ackermann",     reason: "Ackermann can't slide sideways." },
  { scenario: "parallel_tight", forced: "pivot",         reason: "Pivot can't translate." },
  { scenario: "narrow_uturn",   forced: "ackermann",     reason: "Ackermann can't make the radius." },
  { scenario: "pivot_rotate",   forced: "ackermann",     reason: "Ackermann can't rotate in place." },
  { scenario: "pivot_rotate",   forced: "crab",          reason: "Crab can't rotate." },
  { scenario: "pivot_rotate",   forced: "counter_steer", reason: "Counter-steer requires forward motion." },
];

export function planMission(
  scenario: Scenario,
  forced: KinematicMode | null,
): Plan {
  const specs = RECIPES[scenario.id];
  const totalDuration = specs.reduce((a, b) => a + b.duration, 0);
  const clash = forced
    ? FORCE_MISMATCH.find(
        (c) => c.scenario === scenario.id && c.forced === forced,
      )
    : undefined;

  return {
    duration: totalDuration,
    sample(t: number): MissionSample {
      if (t < 0) {
        return {
          twist: { vx: 0, vy: 0, omega: 0 },
          activeMode: forced ?? specs[0].mode,
          phase: "idle",
          phaseIndex: 0,
          stuck: false,
        };
      }
      if (t >= totalDuration) {
        return {
          twist: { vx: 0, vy: 0, omega: 0 },
          activeMode: forced ?? specs[specs.length - 1].mode,
          phase: clash ? "stuck" : "done",
          phaseIndex: 2,
          stuck: Boolean(clash),
        };
      }
      let acc = 0;
      for (let i = 0; i < specs.length; i++) {
        const spec = specs[i];
        if (t < acc + spec.duration) {
          const activeMode = forced ?? spec.mode;
          // Stuck latches: once the active phase clashes, the mission stays
          // stuck through align + done. Approach still runs normally so the
          // trail has something to draw before the failure.
          const isStuck = Boolean(clash) && spec.phase !== "approach";
          return {
            twist: isStuck ? { vx: 0, vy: 0, omega: 0 } : spec.twist,
            activeMode,
            phase: isStuck ? "stuck" : spec.phase,
            phaseIndex: i as 0 | 1 | 2,
            stuck: isStuck,
          };
        }
        acc += spec.duration;
      }
      return {
        twist: { vx: 0, vy: 0, omega: 0 },
        activeMode: forced ?? specs[specs.length - 1].mode,
        phase: "done",
        phaseIndex: 2,
        stuck: false,
      };
    },
  };
}
