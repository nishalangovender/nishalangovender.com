"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  type Material,
} from "three";

import { clamp01, smoothstep } from "@/lib/math";

import { beatAt, beatProgress } from "./beats";
import { FACTORY_CENTRE, FLOOR, OBSTACLES, mulberry32, toWorld, type Rect } from "./factory";
import { LOOP } from "./mission";
import { useScene, useScenePalette } from "./scene-context";

/**
 * How much of the solid factory stands at `t`: it rises out of the finished
 * scan in the deploy beat and sinks back at the start of the return.
 */
export function factoryReveal(t: number): number {
  const id = beatAt(t).id;
  if (id === "deploy") return smoothstep(clamp01((beatProgress(t, "deploy") - 0.4) / 0.35));
  if (id === "system") return 1;
  if (id === "return") return 1 - smoothstep(clamp01(beatProgress(t, "return") / 0.35));
  return 0;
}

/** Matte industrial colours — the same in both site themes, apart from the building shell. */
const COLOURS = {
  upright: "#2f5d9e",
  beam: "#e0701d",
  pallet: "#a47a4d",
  load: "#c7a06a",
  wrapped: "#d8dce1",
  lane: "#f0c030",
  column: "#8b8f94",
  hazard: "#f0c030",
} as const;

const WALL_THICKNESS = 0.15;
const KICK_HEIGHT = 0.35;
const CAP_HEIGHT = 0.03;
const LEVELS = [0.12, 0.85];
const BAYS = 3;
const PALLET = { w: 1.1, h: 0.13, d: 0.8 } as const;
const LOAD = { w: 1.0, h: 0.5, d: 0.75 } as const;
const UPRIGHT = 0.08;

const place = (x: number, y: number, h: number) => new Matrix4().makeTranslation(...toWorld(x, y, h));

/** Instance matrices for every rack: uprights, beams, pallets and loads. */
function rackParts(racks: readonly Rect[]) {
  const rand = mulberry32(5);
  const uprights: Matrix4[] = [];
  const beams: Matrix4[] = [];
  const pallets: Matrix4[] = [];
  const loads: { m: Matrix4; wrapped: boolean }[] = [];
  for (const r of racks) {
    for (const side of [-1, 1]) {
      const y = r.y + (side * r.d) / 2;
      for (let b = 0; b <= BAYS; b++) uprights.push(place(r.x - r.w / 2 + (b * r.w) / BAYS, y, r.h / 2));
      for (const level of LEVELS) beams.push(place(r.x, y, level));
    }
    for (const level of LEVELS) {
      for (let b = 0; b < BAYS; b++) {
        const x = r.x - r.w / 2 + ((b + 0.5) * r.w) / BAYS;
        const top = level + 0.05;
        pallets.push(place(x, r.y, top + PALLET.h / 2));
        if (rand() < 0.8) loads.push({ m: place(x, r.y, top + PALLET.h + LOAD.h / 2), wrapped: rand() < 0.35 });
      }
    }
  }
  return { uprights, beams, pallets, loads };
}

function instanced(geometry: BoxGeometry, material: Material, matrices: Matrix4[]): InstancedMesh {
  const mesh = new InstancedMesh(geometry, material, matrices.length);
  matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Loose pallet stacks against the east wall. */
function looseStacks(): Matrix4[] {
  const out: Matrix4[] = [];
  for (const y of [FLOOR.minY + 1, FLOOR.maxY - 1]) {
    for (let k = 0; k < 4; k++) out.push(place(FLOOR.maxX - 1, y, PALLET.h / 2 + k * PALLET.h));
  }
  return out;
}

/** Yellow lane lines either side of the AGV loop, as thin strips just above the floor. */
function laneStrips(): { length: number; matrices: Matrix4[] } {
  const ys = LOOP.map((p) => p.y);
  const xs = LOOP.map((p) => p.x);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const matrices = [Math.min(...ys) - 0.75, Math.max(...ys) + 0.75].map((y) => place(cx, y, 0.006));
  return { length: Math.max(...xs) - Math.min(...xs) + 1.5, matrices };
}

/**
 * The production floor the scan resolves into: concrete floor with lane
 * lines, walls on three sides, loaded pallet racking, columns and loose
 * pallets, lit (by Lights.tsx) with soft shadows. It rises from the floor as `factoryReveal`
 * goes 0 → 1, so there is no transparency to sort.
 */
export function FactoryFloor() {
  const sceneRef = useScene();
  const palette = useScenePalette();

  const scene = useMemo(() => {
    const racks = OBSTACLES.filter((o) => o.w > 1);
    const columns = OBSTACLES.filter((o) => o.w <= 1);
    const parts = rackParts(racks);
    const std = (color: string) => new MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05 });

    const floorW = FLOOR.maxX - FLOOR.minX;
    const floorD = FLOOR.maxY - FLOOR.minY;
    const floorMat = std("#000000");
    floorMat.transparent = true;
    const floor = new Mesh(new PlaneGeometry(floorW, floorD), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(...toWorld(FACTORY_CENTRE.x, FACTORY_CENTRE.y, 0.002));
    floor.receiveShadow = true;

    const wallMat = std("#000000");
    const kickMat = std("#000000");
    const capMat = std("#000000");
    const walls = new Group();
    const wall = (x: number, y: number, w: number, d: number) => {
      const upper = new Mesh(new BoxGeometry(w, FLOOR.wallHeight - KICK_HEIGHT, d), wallMat);
      upper.position.set(...toWorld(x, y, KICK_HEIGHT + (FLOOR.wallHeight - KICK_HEIGHT) / 2));
      const kick = new Mesh(new BoxGeometry(w, KICK_HEIGHT, d), kickMat);
      kick.position.set(...toWorld(x, y, KICK_HEIGHT / 2));
      // A pale cap on the cut edge, so the low walls read as cut away, not short.
      const cap = new Mesh(new BoxGeometry(w + 0.02, CAP_HEIGHT, d + 0.02), capMat);
      cap.position.set(...toWorld(x, y, FLOOR.wallHeight + CAP_HEIGHT / 2));
      for (const m of [upper, kick]) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
      walls.add(upper, kick, cap);
    };
    // North and south walls run east–west; toWorld maps map y to −z, so their depth is along z.
    wall(FACTORY_CENTRE.x, FLOOR.maxY, floorW, WALL_THICKNESS);
    wall(FACTORY_CENTRE.x, FLOOR.minY, floorW, WALL_THICKNESS);
    wall(FLOOR.maxX, FACTORY_CENTRE.y, WALL_THICKNESS, floorD);

    const stock = new Group();
    stock.add(
      instanced(new BoxGeometry(UPRIGHT, racks[0].h, UPRIGHT), std(COLOURS.upright), parts.uprights),
      instanced(new BoxGeometry(racks[0].w, 0.1, 0.06), std(COLOURS.beam), parts.beams),
      instanced(new BoxGeometry(PALLET.w, PALLET.h, PALLET.d), std(COLOURS.pallet), [...parts.pallets, ...looseStacks()]),
      instanced(new BoxGeometry(LOAD.w, LOAD.h, LOAD.d), std(COLOURS.load), parts.loads.filter((l) => !l.wrapped).map((l) => l.m)),
      instanced(new BoxGeometry(LOAD.w, LOAD.h, LOAD.d), std(COLOURS.wrapped), parts.loads.filter((l) => l.wrapped).map((l) => l.m)),
      instanced(new BoxGeometry(columns[0].w, columns[0].h, columns[0].d), std(COLOURS.column), columns.map((c) => place(c.x, c.y, c.h / 2))),
      instanced(new BoxGeometry(columns[0].w + 0.04, 0.45, columns[0].d + 0.04), std(COLOURS.hazard), columns.map((c) => place(c.x, c.y, 0.225))),
    );

    const lane = laneStrips();
    const lanes = instanced(new BoxGeometry(lane.length, 0.004, 0.1), std(COLOURS.lane), lane.matrices);
    lanes.castShadow = false;


    const rising = new Group();
    rising.add(walls, stock);
    const group = new Group();
    // Lit by the scene-wide rig in Lights.tsx.
    group.add(floor, lanes, rising);
    return { group, floor, floorMat, wallMat, kickMat, capMat, rising, lanes };
  }, []);

  useEffect(() => {
    // Building shell follows the theme: dark concrete on the dark site, pale on the light one.
    const dark = new Color(palette.bg).getHSL({ h: 0, s: 0, l: 0 }).l < 0.5;
    scene.floorMat.color.set(dark ? "#2a2d31" : "#b9bdc2");
    scene.wallMat.color.set(dark ? "#3a3e44" : "#dde0e4");
    scene.kickMat.color.set(dark ? "#1c1e21" : "#8d9197");
    scene.capMat.color.set(dark ? "#6b7078" : "#f4f5f7");
  }, [scene, palette]);

  useEffect(
    () => () => {
      scene.group.traverse((o) => {
        const mesh = o as Mesh;
        mesh.geometry?.dispose();
        (mesh.material as Material | undefined)?.dispose();
      });
    },
    [scene],
  );

  useFrame(() => {
    const k = factoryReveal(sceneRef.current.t);
    scene.group.visible = k > 0;
    if (!scene.group.visible) return;
    scene.floorMat.opacity = k;
    scene.lanes.visible = k > 0.6;
    // Racking and walls grow up out of the floor.
    scene.rising.scale.y = Math.max(k, 0.001);
  });

  return <primitive object={scene.group} />;
}
