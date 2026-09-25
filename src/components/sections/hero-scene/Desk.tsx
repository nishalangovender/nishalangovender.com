"use client";

import { useEffect, useMemo } from "react";
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, type Material } from "three";

import { DESK, RAMP } from "./desk-layout";
import { toWorld } from "./factory";
import { LAYER } from "./lines";

const LEG = 0.22;
const RAMP_THICKNESS = 0.08;
const STRIPE = 0.08;

/** Lit, matte materials — the same realism as the factory floor. */
const MATERIALS = {
  top: { color: "#6b4a31", roughness: 0.7, metalness: 0 },
  leg: { color: "#34373c", roughness: 0.45, metalness: 0.6 },
  ramp: { color: "#9aa0a7", roughness: 0.5, metalness: 0.5 },
  hazard: { color: "#f0c030", roughness: 0.6, metalness: 0 },
} as const;

/** A walnut desk on metal legs, and an aluminium ramp with hazard edges down to the factory floor. */
export function Desk() {
  const group = useMemo(() => {
    const mat = Object.fromEntries(
      Object.entries(MATERIALS).map(([k, v]) => [k, new MeshStandardMaterial(v)]),
    ) as Record<keyof typeof MATERIALS, MeshStandardMaterial>;
    const add = (parent: Group, mesh: Mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    const group = new Group();
    const w = DESK.maxX - DESK.minX;
    const d = DESK.maxY - DESK.minY;
    const [cx, , cz] = toWorld((DESK.minX + DESK.maxX) / 2, (DESK.minY + DESK.maxY) / 2);
    add(group, new Mesh(new BoxGeometry(w, DESK.thickness, d), mat.top)).position.set(cx, DESK.height - DESK.thickness / 2, cz);

    const legH = DESK.height - DESK.thickness;
    for (const [x, y] of [
      [DESK.minX + LEG, DESK.minY + LEG],
      [DESK.maxX - LEG, DESK.minY + LEG],
      [DESK.minX + LEG, DESK.maxY - LEG],
      [DESK.maxX - LEG, DESK.maxY - LEG],
    ]) {
      const [lx, , lz] = toWorld(x, y);
      add(group, new Mesh(new BoxGeometry(LEG, legH, LEG), mat.leg)).position.set(lx, legH / 2, lz);
    }

    // Ramp: a thin plate tilted down from the desk edge to the floor, with hazard stripes along both edges.
    const run = RAMP.toX - RAMP.fromX;
    const length = Math.hypot(run, DESK.height);
    const ramp = new Group();
    ramp.position.set((RAMP.fromX + RAMP.toX) / 2, DESK.height / 2 - RAMP_THICKNESS / 2, 0);
    ramp.rotation.z = -Math.atan2(DESK.height, run);
    add(ramp, new Mesh(new BoxGeometry(length, RAMP_THICKNESS, RAMP.width), mat.ramp));
    for (const side of [-1, 1]) {
      add(ramp, new Mesh(new BoxGeometry(length, 0.01, STRIPE), mat.hazard)).position.set(
        0,
        RAMP_THICKNESS / 2 + 0.005,
        side * (RAMP.width / 2 - STRIPE / 2),
      );
    }
    group.add(ramp);
    group.renderOrder = LAYER.page;
    return group;
  }, []);

  useEffect(
    () => () => {
      group.traverse((o) => {
        const mesh = o as Mesh;
        mesh.geometry?.dispose();
        (mesh.material as Material | undefined)?.dispose();
      });
    },
    [group],
  );

  return <primitive object={group} />;
}
