// src/lib/park-bot/simulation.ts
//
// Fixed-timestep kinematic integrator. Produces a SimFrame array for a
// given config — used both by Vitest (offline) and by useSimulation (live).

import { computeWheelTargets } from "./kinematics";
import { planMission } from "./mission";
import { getScenario } from "./scenarios";
import type { Pose, SimConfig, SimFrame, Twist } from "./types";

export function runSimulation(config: SimConfig): SimFrame[] {
  const scenario = getScenario(config.scenarioId);
  const mission = planMission(scenario, config.forcedMode);
  const frames: SimFrame[] = [];
  const trail: Pose[] = [];
  let pose: Pose = { ...scenario.start };

  const endT = mission.duration + 0.15;
  for (let t = 0; t <= endT + 1e-9; t += config.dt) {
    const sample = mission.sample(t);
    pose = integrate(pose, sample.twist, config.dt);
    trail.push(pose);
    const wheels = computeWheelTargets(sample.twist, sample.activeMode);
    frames.push({
      t,
      pose,
      wheels,
      activeMode: sample.activeMode,
      phase: sample.phase,
      phaseIndex: sample.phaseIndex,
      trail: [...trail],
      stuck: sample.stuck,
    });
  }
  return frames;
}

function integrate(pose: Pose, twist: Twist, dt: number): Pose {
  const cos = Math.cos(pose.theta);
  const sin = Math.sin(pose.theta);
  const dx = (twist.vx * cos - twist.vy * sin) * dt;
  const dy = (twist.vx * sin + twist.vy * cos) * dt;
  return {
    x: pose.x + dx,
    y: pose.y + dy,
    theta: pose.theta + twist.omega * dt,
  };
}
