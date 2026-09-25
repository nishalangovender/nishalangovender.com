/**
 * The electronics build, drawn as wireframes to match the wireframe AGV:
 * once the robot's outline has lifted off the page, its parts appear in an
 * exploded view above the open chassis — battery, motor drivers, the Pi —
 * each on a leader line to its seat, then slide down into place and the
 * cables run between them. The status LEDs light as the stack boots in the
 * code beat. Timings are pure and tested; the lines live in the base_link
 * frame (x forward, y up) inside the AGV.
 */
import { BoxGeometry, Matrix4, Mesh, MeshStandardMaterial, Object3D } from "three";
import type { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";

import { clamp01, smoothstep } from "@/lib/math";

import { beatAt, beatProgress } from "./beats";
import { edgeSegments, fatLines } from "./lines";
import { AGV, AGV_BODY_Y } from "./sketch";
import { terminalLinesAt } from "./terminal";

/** Chassis floor the parts sit on. */
const FLOOR_Y = AGV_BODY_Y + 0.02;

/** Design-beat progress: parts appear (staggered), hold exploded, collapse into place, then cabling. */
const APPEAR = { from: 0.42, each: 0.04, length: 0.1 } as const;
const COLLAPSE = { from: 0.72, to: 0.9 } as const;
const CABLES = { from: 0.88, to: 1 } as const;

interface Part {
  name: string;
  /** Seat centre in base_link, on the chassis floor. */
  x: number;
  z: number;
  size: [number, number, number];
  /** Offset from the seat in the exploded view. */
  explode: [number, number, number];
  /** Optional detail on top: [w, h, d]. */
  top?: [number, number, number];
}

/** Stacked in the exploded view: battery lowest, drivers either side above it, the Pi on top. */
export const PARTS: readonly Part[] = [
  { name: "battery", x: -0.18, z: 0, size: [0.42, 0.14, 0.46], explode: [0, 0.6, 0], top: [0.3, 0.01, 0.1] },
  { name: "driver-left", x: 0.08, z: -0.3, size: [0.16, 0.07, 0.14], explode: [0.05, 0.85, -0.3], top: [0.14, 0.012, 0.12] },
  { name: "driver-right", x: 0.08, z: 0.3, size: [0.16, 0.07, 0.14], explode: [0.05, 0.85, 0.3], top: [0.14, 0.012, 0.12] },
  { name: "pi", x: 0.4, z: -0.05, size: [0.2, 0.02, 0.14], explode: [0.25, 1.1, 0], top: [0.05, 0.015, 0.05] },
];

/** Cable runs between the parts, as [x, z] polylines at wire height, with a colour each. */
const WIRE_Y = FLOOR_Y + 0.05;
const CABLE_RUNS: readonly { color: string; points: [number, number][] }[] = [
  { color: "#c62f2f", points: [[0.03, -0.1], [0.08, -0.22]] },
  { color: "#c62f2f", points: [[0.03, 0.1], [0.08, 0.22]] },
  { color: "#e0701d", points: [[0.3, -0.05], [0.16, -0.05], [0.12, -0.23]] },
  { color: "#e0701d", points: [[0.16, -0.05], [0.16, 0.18], [0.12, 0.23]] },
];

/** Status LEDs on the rear panel, and the terminal line each one lights on: power, drives, ready. */
export const LEDS: readonly { z: number; color: string; onLine: number }[] = [
  { z: -0.1, color: "#2ee6a8", onLine: 1 },
  { z: 0, color: "#33e1ff", onLine: 5 },
  { z: 0.1, color: "#2ee6a8", onLine: 7 },
];

/**
 * Where part `k` is at loop time `t`: `shown` (0–1) as it appears, and
 * `explode` (1 fully exploded, 0 seated). Hidden in the sketch beat,
 * exploded then collapsing in the design beat, seated after.
 */
export function partPlacement(t: number, k: number): { shown: number; explode: number } {
  const id = beatAt(t).id;
  if (id === "sketch") return { shown: 0, explode: 1 };
  if (id !== "design") return { shown: 1, explode: 0 };
  const p = beatProgress(t, "design");
  return {
    shown: smoothstep(clamp01((p - APPEAR.from - k * APPEAR.each) / APPEAR.length)),
    explode: 1 - smoothstep(clamp01((p - COLLAPSE.from) / (COLLAPSE.to - COLLAPSE.from))),
  };
}

/** Share of the cabling drawn at `t`: none until the parts are in, all of it by the end of the design beat. */
export function cablesDrawn(t: number): number {
  const id = beatAt(t).id;
  if (id === "sketch") return 0;
  if (id !== "design") return 1;
  return clamp01((beatProgress(t, "design") - CABLES.from) / (CABLES.to - CABLES.from));
}

/** Whether LED `k` is lit at `t`: dark until the stack boots, then on for the rest of the loop. */
export function ledLit(t: number, k: number): boolean {
  const id = beatAt(t).id;
  if (id === "sketch" || id === "design") return false;
  const lines = terminalLinesAt(t);
  return lines === null || lines >= LEDS[k].onLine;
}

/** Wireframe edges of a part (and its top detail), centred on its seat. */
function partEdges(p: Part): number[] {
  const out = edgeSegments(new BoxGeometry(...p.size), new Matrix4());
  if (p.top) {
    const [w, h, d] = p.top;
    out.push(...edgeSegments(new BoxGeometry(w, h, d), new Matrix4().makeTranslation(0, p.size[1] / 2 + h / 2, 0)));
  }
  return out;
}

export interface Electronics {
  /** Plain Object3D, not a Group, so it keeps the AGV's draw layer. */
  root: Object3D;
  parts: LineSegments2[];
  /** Leader lines, one per part, from its seat to its exploded position. */
  leaders: LineSegments2[];
  cables: LineSegments2[];
  leds: MeshStandardMaterial[];
  /** Colours the part wireframes and leaders to match the AGV's. */
  setColors: (wire: string, leader: string) => void;
  dispose: () => void;
}

export function buildElectronics(): Electronics {
  const root = new Object3D();
  const seat = (p: Part): [number, number, number] => [p.x, FLOOR_Y + p.size[1] / 2, p.z];

  const parts = PARTS.map((p) => {
    const part = fatLines(partEdges(p), { linewidth: 1.5 });
    part.position.set(...seat(p));
    root.add(part);
    return part;
  });
  // Each leader runs from the seat along the explode offset; scaling it shrinks it as the part drops.
  const leaders = PARTS.map((p) => {
    const leader = fatLines([0, 0, 0, ...p.explode], { linewidth: 1 });
    leader.position.set(...seat(p));
    root.add(leader);
    return leader;
  });

  const cables = CABLE_RUNS.map(({ color, points }) => {
    const positions = points.slice(1).flatMap(([x, z], i) => [points[i][0], WIRE_Y, points[i][1], x, WIRE_Y, z]);
    const line = fatLines(positions, { linewidth: 2 });
    line.material.color.set(color);
    root.add(line);
    return line;
  });

  const ledGeometry = new BoxGeometry(0.02, 0.035, 0.05);
  const leds = LEDS.map(({ z }) => {
    const material = new MeshStandardMaterial({ color: "#15171a", roughness: 0.5 });
    const led = new Mesh(ledGeometry, material);
    led.position.set(AGV.offset - AGV.length / 2 - 0.01, AGV_BODY_Y + AGV.height - 0.06, z);
    root.add(led);
    return material;
  });

  const setColors = (wire: string, leader: string) => {
    for (const p of parts) p.material.color.set(wire);
    for (const l of leaders) l.material.color.set(leader);
  };
  const dispose = () => {
    for (const line of [...parts, ...leaders, ...cables]) {
      line.geometry.dispose();
      line.material.dispose();
    }
    ledGeometry.dispose();
    for (const m of leds) m.dispose();
  };
  return { root, parts, leaders, cables, leds, setColors, dispose };
}

/** Poses the electronics for loop time `t`, faded with the wireframe by `opacity`. */
export function showElectronics(e: Electronics, t: number, opacity: number) {
  PARTS.forEach((p, k) => {
    const { shown, explode } = partPlacement(t, k);
    const part = e.parts[k];
    part.visible = shown > 0 && opacity > 0;
    part.material.opacity = shown * opacity;
    part.position.set(
      p.x + p.explode[0] * explode,
      FLOOR_Y + p.size[1] / 2 + p.explode[1] * explode,
      p.z + p.explode[2] * explode,
    );
    const leader = e.leaders[k];
    leader.visible = part.visible && explode > 0.01;
    leader.scale.setScalar(Math.max(explode, 0.001));
    leader.material.opacity = shown * opacity * 0.6;
  });
  // Each run is a short wire; reveal whole runs in order.
  const shown = Math.ceil(cablesDrawn(t) * e.cables.length);
  e.cables.forEach((c, i) => {
    c.visible = i < shown && opacity > 0;
    c.material.opacity = opacity;
  });
  e.leds.forEach((m, k) => {
    const lit = ledLit(t, k);
    m.emissive.set(lit ? LEDS[k].color : "#000000");
    m.emissiveIntensity = lit ? 1.6 : 0;
    m.color.set(lit ? LEDS[k].color : "#15171a");
  });
}
