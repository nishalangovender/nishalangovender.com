"use client";

import { useFrame } from "@react-three/fiber";

import { clamp01, smoothstep } from "@/lib/math";

import { showAgv, useAgvModel } from "./Agv";
import { beatAt, beatProgress } from "./beats";
import { MISSION_LENGTH, missionDistance, missionPose } from "./mission";
import { useScene } from "./scene-context";

/** Fleet size, including the hero AGV. */
export const FLEET_SIZE = 3;

/** How visible the rest of the fleet is: revealed as the camera pulls up, gone by the return. */
export function fleetPresence(t: number): number {
  const id = beatAt(t).id;
  if (id === "system") return smoothstep(clamp01(beatProgress(t, "system") / 0.3));
  if (id === "return") return 1 - smoothstep(beatProgress(t, "return"));
  return 0;
}

/** Mission distance of fleet member `index` (1-based after the hero), spaced evenly round the loop. */
export function fleetDistance(t: number, index: number): number {
  return missionDistance(t) + (index * MISSION_LENGTH) / FLEET_SIZE;
}

function FleetAgv({ index }: { index: number }) {
  const sceneRef = useScene();
  const model = useAgvModel();

  useFrame(() => {
    const t = sceneRef.current.t;
    showAgv(model, missionPose(fleetDistance(t, index)), fleetPresence(t));
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
