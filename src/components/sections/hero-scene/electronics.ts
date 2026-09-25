/**
 * The electronics build: once the robot's outline has lifted off the page,
 * its parts drop into the open wireframe chassis one at a time — battery,
 * motor drivers, the Pi — and the cables run between them. The status LEDs
 * light as the stack boots in the code beat. Timings are pure and tested;
 * the meshes live in the base_link frame (x forward, y up) inside the AGV.
 */
import { BoxGeometry, Mesh, MeshStandardMaterial, Object3D, type BufferGeometry } from "three";
import type { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";

import { clamp01, smoothstep } from "@/lib/math";

import { beatAt, beatProgress } from "./beats";
import { fatLines } from "./lines";
import { AGV, AGV_BODY_Y } from "./sketch";
import { terminalLinesAt } from "./terminal";

/** Chassis floor the parts sit on, and how far above it each one drops from. */
const FLOOR_Y = AGV_BODY_Y + 0.02;
const DROP_HEIGHT = 0.7;

/** Design-beat progress at which the first part starts to drop, the gap between parts, and each drop's length. */
const FIRST_DROP = 0.45;
const DROP_GAP = 0.1;
const DROP_TIME = 0.2;
/** Design-beat progress over which the cables run once the parts are in. */
const CABLES = { from: 0.85, to: 1 } as const;

interface Part {
  name: string;
  /** Centre in base_link, sitting on the chassis floor. */
  x: number;
  z: number;
  size: [number, number, number];
  color: string;
  /** Optional detail on top: [w, h, d, colour] centred on the part. */
  top?: [number, number, number, string];
}

/** Drop order: the heavy battery first, then the drivers either side, then the Pi. */
export const PARTS: readonly Part[] = [
  { name: "battery", x: -0.18, z: 0, size: [0.42, 0.14, 0.46], color: "#2a5bb8", top: [0.3, 0.01, 0.1, "#e6e9ee"] },
  { name: "driver-left", x: 0.08, z: -0.3, size: [0.16, 0.07, 0.14], color: "#1b1d21", top: [0.14, 0.012, 0.12, "#9aa0a7"] },
  { name: "driver-right", x: 0.08, z: 0.3, size: [0.16, 0.07, 0.14], color: "#1b1d21", top: [0.14, 0.012, 0.12, "#9aa0a7"] },
  { name: "pi", x: 0.4, z: -0.05, size: [0.2, 0.02, 0.14], color: "#1e6b3a", top: [0.05, 0.015, 0.05, "#15171a"] },
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
 * Where part `k` is at loop time `t`: `drop` is its height above its seat
 * (0 once seated), `scale` grows it in as it starts to fall. Hidden (scale 0)
 * in the sketch beat, dropping in the design beat, seated after.
 */
export function partDrop(t: number, k: number): { drop: number; scale: number } {
  const id = beatAt(t).id;
  if (id === "sketch") return { drop: DROP_HEIGHT, scale: 0 };
  if (id !== "design") return { drop: 0, scale: 1 };
  const k01 = clamp01((beatProgress(t, "design") - (FIRST_DROP + k * DROP_GAP)) / DROP_TIME);
  // Falls with gravity's ease-in, then settles.
  return { drop: DROP_HEIGHT * (1 - k01 * k01), scale: smoothstep(clamp01(k01 / 0.3)) };
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

export interface Electronics {
  /** Plain Object3D, not a Group, so it keeps the AGV's draw layer. */
  root: Object3D;
  parts: Object3D[];
  cables: LineSegments2[];
  leds: MeshStandardMaterial[];
  dispose: () => void;
}

export function buildElectronics(): Electronics {
  const geometries: BufferGeometry[] = [];
  const materials: MeshStandardMaterial[] = [];
  const box = (w: number, h: number, d: number, color: string) => {
    const geometry = new BoxGeometry(w, h, d);
    const material = new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.2 });
    geometries.push(geometry);
    materials.push(material);
    return new Mesh(geometry, material);
  };

  const root = new Object3D();
  const parts = PARTS.map((p) => {
    const part = new Object3D();
    part.position.set(p.x, FLOOR_Y + p.size[1] / 2, p.z);
    part.add(box(...p.size, p.color));
    if (p.top) {
      const [w, h, d, color] = p.top;
      const top = box(w, h, d, color);
      top.position.y = p.size[1] / 2 + h / 2;
      part.add(top);
    }
    root.add(part);
    return part;
  });

  const cables = CABLE_RUNS.map(({ color, points }) => {
    const positions = points.slice(1).flatMap(([x, z], i) => [points[i][0], WIRE_Y, points[i][1], x, WIRE_Y, z]);
    const line = fatLines(positions, { linewidth: 2 });
    line.material.color.set(color);
    line.material.transparent = false;
    root.add(line);
    return line;
  });

  const leds = LEDS.map(({ z }) => {
    const led = box(0.02, 0.035, 0.05, "#15171a");
    led.position.set(AGV.offset - AGV.length / 2 - 0.01, AGV_BODY_Y + AGV.height - 0.06, z);
    root.add(led);
    return led.material as MeshStandardMaterial;
  });

  const dispose = () => {
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
    for (const c of cables) {
      c.geometry.dispose();
      c.material.dispose();
    }
  };
  return { root, parts, cables, leds, dispose };
}

/** Poses the electronics for loop time `t`. */
export function showElectronics(e: Electronics, t: number) {
  e.parts.forEach((part, k) => {
    const { drop, scale } = partDrop(t, k);
    part.visible = scale > 0;
    part.scale.setScalar(Math.max(scale, 0.001));
    part.position.y = FLOOR_Y + PARTS[k].size[1] / 2 + drop;
  });
  // Each run is a short wire; reveal whole runs in order.
  const shown = Math.ceil(cablesDrawn(t) * e.cables.length);
  e.cables.forEach((c, i) => (c.visible = i < shown));
  e.leds.forEach((m, k) => {
    const lit = ledLit(t, k);
    m.emissive.set(lit ? LEDS[k].color : "#000000");
    m.emissiveIntensity = lit ? 1.6 : 0;
    m.color.set(lit ? LEDS[k].color : "#15171a");
  });
}
