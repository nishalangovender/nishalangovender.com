"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { BoxGeometry, Color, Group, Mesh, MeshStandardMaterial, type Material } from "three";

import { DESK } from "./desk-layout";
import { toWorld } from "./factory";
import { LAYER } from "./lines";
import { deskScale } from "./mission";
import { useScene } from "./scene-context";

const LEG = 0.22;

/** Lit, matte materials — the same realism as the factory floor. */
const MATERIALS = {
  top: { color: "#6b4a31", roughness: 0.7, metalness: 0 },
  leg: { color: "#34373c", roughness: 0.45, metalness: 0.6 },
} as const;

const WALNUT = new Color(MATERIALS.top.color);
/** Polished concrete, as the factory floor: the desk top turns to it as it shrinks away. */
const CONCRETE = new Color("#8d8d88");

/** A walnut desk on metal legs; its top turns to factory concrete as the desk shrinks away. */
export function Desk() {
  const sceneRef = useScene();
  const { group, top } = useMemo(() => {
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

    group.renderOrder = LAYER.page;
    return { group, top: mat.top };
  }, []);

  useFrame(() => {
    top.color.copy(WALNUT).lerp(CONCRETE, 1 - deskScale(sceneRef.current.t));
  });

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
