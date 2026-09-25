"use client";

import { useFrame } from "@react-three/fiber";

import type { Pose } from "@/lib/path-following/types";

import { showAgv, useAgvModel } from "./Agv";
import { factoryReveal } from "./FactoryFloor";
import { LEAD_IN_LENGTH, LOOP_LENGTH, loopPose, missionDistance } from "./mission";
import { useScene } from "./scene-context";

/** Fleet size, including the hero AGV. */
export const FLEET_SIZE = 3;

/**
 * How present the rest of the fleet is. The fleet is part of the factory: it
 * resolves from the scan with the racks and fades with them, so it is already
 * working when the camera pulls up — nothing pops in over the finished floor.
 */
export function fleetPresence(t: number): number {
  return factoryReveal(t);
}

/** Pose of fleet member `index` (1-based after the hero), spaced evenly round the loop from the hero. */
export function fleetPose(t: number, index: number): Pose {
  const heroOnLoop = Math.max(0, missionDistance(t) - LEAD_IN_LENGTH);
  return loopPose(heroOnLoop + (index * LOOP_LENGTH) / FLEET_SIZE);
}

function FleetAgv({ index }: { index: number }) {
  const sceneRef = useScene();
  const model = useAgvModel();

  useFrame(() => {
    const t = sceneRef.current.t;
    // Fleet AGVs are already on the factory floor: solid from the start.
    showAgv(model, fleetPose(t, index), fleetPresence(t), 1);
  });

  return <primitive object={model.group} />;
}

/**
 * Beat 5: the other AGVs on the same mission loop. Each is its own fat-line
 * model — LineSegments2 instances segments, not whole objects — so the fleet
 * costs two draw calls per AGV.
 */
export function Fleet() {
  return (
    <>
      {Array.from({ length: FLEET_SIZE - 1 }, (_, i) => (
        <FleetAgv key={i} index={i + 1} />
      ))}
    </>
  );
}
