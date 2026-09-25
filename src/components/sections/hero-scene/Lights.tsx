"use client";

import { useMemo } from "react";
import { DirectionalLight, Group, HemisphereLight } from "three";

import { DESK } from "./desk-layout";
import { FLOOR, toWorld } from "./factory";

/** Centre of everything lit: the desk on the left, the factory on the right. */
const MID_X = (DESK.minX + FLOOR.maxX) / 2;
const HALF_SPAN = (FLOOR.maxX - DESK.minX) / 2 + 1;

/**
 * One light rig for the whole scene, so the desk and the factory read as the
 * same world: a soft sky fill, plus a key light from above and to the front
 * that casts the only shadows (desktop only — see HeroCanvas).
 */
export function Lights() {
  const rig = useMemo(() => {
    const fill = new HemisphereLight("#ffffff", "#3a3a3a", 1.3);
    const key = new DirectionalLight("#ffffff", 2.4);
    key.position.set(...toWorld(MID_X + 4, -8, 16));
    key.target.position.set(...toWorld(MID_X, 0, 0));
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {
      left: -HALF_SPAN,
      right: HALF_SPAN,
      top: 10,
      bottom: -10,
      near: 1,
      far: 45,
    });
    key.shadow.bias = -0.0005;
    const group = new Group();
    group.add(fill, key, key.target);
    return group;
  }, []);

  return <primitive object={rig} />;
}
