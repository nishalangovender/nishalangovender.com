// src/lib/park-bot/scenarios.ts
import type { Scenario } from "./types";

export const SCENARIOS: readonly Scenario[] = [
  {
    id: "forward_bay",
    title: "Forward",
    hint: "The baseline — steer the front wheels, drive into the bay.",
    recommendedMode: "ackermann",
    start: { x: -2.5, y: -1.0, theta: 0 },
    target: { x: 1.5, y: 0.8, theta: Math.PI / 2 },
    bounds: { width: 8, height: 5 },
    // Two parked cars flank the bay (target span x ∈ [1.35, 1.65], y ∈ [0.6, 1.0])
    // with ~0.1 m side clearance. Back wall closes the bay at y = 1.3.
    obstacles: [
      { x: 0.85, y: 0.6, w: 0.4, h: 0.7 },  // left-flanking parked car
      { x: 1.75, y: 0.6, w: 0.4, h: 0.7 },  // right-flanking parked car
    ],
    phases: ["Approach Bay", "Turn In", "Settle"],
  },
  {
    id: "parallel_tight",
    title: "Parallel",
    hint: "No room for multi-point turns — crab sideways into the slot.",
    recommendedMode: "crab",
    start: { x: -1.5, y: -0.3, theta: 0 },
    target: { x: 1.5, y: 0.8, theta: 0 },
    bounds: { width: 8, height: 5 },
    // Bay at theta=0 spans x ∈ [1.3, 1.7], y ∈ [0.65, 0.95]. The crab approach
    // sweeps diagonally up and right so the car ahead of the slot is held well
    // clear on the left; the car behind the slot sits tight against the bay,
    // mirroring real-world parallel parking where the gap is bounded by the
    // rear obstacle and the road ahead is open.
    obstacles: [
      { x: -0.8, y: 0.55, w: 0.8, h: 0.45 },  // car ahead of the slot
      { x:  1.8, y: 0.55, w: 0.8, h: 0.45 },  // car behind the slot
      { x: -0.8, y: 1.0,  w: 3.4, h: 0.1 },   // kerb stretching across the back
    ],
    phases: ["Approach", "Slide In", "Align"],
  },
  {
    id: "narrow_uturn",
    title: "U-Turn",
    hint: "The lane is too narrow for Ackermann — counter-steer to halve the radius.",
    recommendedMode: "counter_steer",
    start: { x: -2.5, y: -0.6, theta: 0 },
    target: { x: -2.5, y: 0.6, theta: Math.PI },
    bounds: { width: 7, height: 3.5 },
    obstacles: [
      { x: -3.5, y: 1.2, w: 7, h: 0.15 },    // top wall
      { x: -3.5, y: -1.35, w: 7, h: 0.15 },  // bottom wall
    ],
    phases: ["Approach", "Pivot Turn", "Exit"],
  },
  {
    id: "pivot_rotate",
    title: "Rotate",
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
