// src/lib/park-bot/scenarios.ts
import type { Scenario } from "./types";

export const SCENARIOS: readonly Scenario[] = [
  {
    id: "forward_bay",
    title: "Forward Bay Park",
    hint: "The baseline — steer the front wheels, drive into the bay.",
    recommendedMode: "ackermann",
    start: { x: -2.5, y: -1.0, theta: 0 },
    target: { x: 1.5, y: 0.8, theta: Math.PI / 2 },
    bounds: { width: 8, height: 5 },
    obstacles: [
      { x: 0.6, y: 1.5, w: 0.6, h: 1.4 },   // right-side parked car
      { x: 1.9, y: 1.5, w: 0.6, h: 1.4 },   // left-side parked car
    ],
    phases: ["Approach bay", "Turn in", "Settle"],
  },
  {
    id: "parallel_tight",
    title: "Tight Parallel Park",
    hint: "No room for multi-point turns — crab sideways into the slot.",
    recommendedMode: "crab",
    start: { x: -1.5, y: -0.3, theta: 0 },
    target: { x: 1.5, y: 0.8, theta: 0 },
    bounds: { width: 8, height: 5 },
    obstacles: [
      { x: 0.3, y: 1.3, w: 1.0, h: 0.5 },
      { x: 1.9, y: 1.3, w: 1.0, h: 0.5 },
      // Kerb behind the slot
      { x: 1.3, y: 1.8, w: 1.6, h: 0.1 },
    ],
    phases: ["Approach", "Slide in", "Align"],
  },
  {
    id: "narrow_uturn",
    title: "Narrow U-Turn",
    hint: "The lane is too narrow for Ackermann — counter-steer to halve the radius.",
    recommendedMode: "counter_steer",
    start: { x: -2.5, y: -0.6, theta: 0 },
    target: { x: -2.5, y: 0.6, theta: Math.PI },
    bounds: { width: 7, height: 3.5 },
    obstacles: [
      { x: -3.5, y: 1.2, w: 7, h: 0.15 },    // top wall
      { x: -3.5, y: -1.35, w: 7, h: 0.15 },  // bottom wall
    ],
    phases: ["Approach", "Pivot turn", "Exit"],
  },
  {
    id: "pivot_rotate",
    title: "Rotate In-Place",
    hint: "Nowhere to move forwards — spin the body on its centre.",
    recommendedMode: "pivot",
    start: { x: 0, y: 0, theta: 0 },
    target: { x: 0, y: 0, theta: Math.PI },
    bounds: { width: 4, height: 4 },
    obstacles: [
      { x: -1.5, y: -1.5, w: 0.4, h: 0.4 },
      { x:  1.1, y:  1.1, w: 0.4, h: 0.4 },
    ],
    phases: ["Align", "Rotate", "Hold"],
  },
];

export function getScenario(id: Scenario["id"]): Scenario {
  const s = SCENARIOS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown scenario: ${id}`);
  return s;
}
