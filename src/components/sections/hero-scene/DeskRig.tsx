"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";

import { PIVOT } from "./desk-layout";
import { toWorld } from "./factory";
import { deskScale } from "./mission";
import { useScene } from "./scene-context";

const [PX, , PZ] = toWorld(PIVOT.x, PIVOT.y);

/**
 * Everything on the desk, scaled as one about the floor point beneath the
 * parked AGV: as the desk shrinks away the robot is left full size on the
 * factory floor — the sketch-sized idea become real. Children keep their own
 * draw layers (each is a Group with its own renderOrder).
 */
export function DeskRig({ children }: { children: ReactNode }) {
  const sceneRef = useScene();
  const rig = useRef<Group>(null);

  useFrame(() => {
    const group = rig.current;
    if (!group) return;
    const k = deskScale(sceneRef.current.t);
    group.visible = k > 0;
    group.scale.setScalar(Math.max(k, 0.001));
    // Scale about (PX, 0, PZ): p' = pivot + k (p − pivot).
    group.position.set(PX * (1 - k), 0, PZ * (1 - k));
  });

  return <group ref={rig}>{children}</group>;
}
