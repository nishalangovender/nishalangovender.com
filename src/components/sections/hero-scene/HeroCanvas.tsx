"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

import { HeroAgv } from "./Agv";
import { BEATS, beatAt, parseBeatParam, type BeatId } from "./beats";
import { cameraAt } from "./camera";
import { CodeTerminal } from "./CodeTerminal";
import { Costmap } from "./Costmap";
import { InkSketch } from "./InkSketch";
import { Lidar } from "./Lidar";
import { missionPose } from "./mission";
import { Notebook } from "./Notebook";
import { PointCloud } from "./PointCloud";
import {
  PaletteProvider,
  SceneProvider,
  usePalette,
  useScene,
  type SceneState,
} from "./scene-context";

/** Largest frame step, so a tab returning from the background does not jump. */
const MAX_DT = 0.1;

/**
 * Advances the loop clock and flies the camera along its keyframes. Reports
 * beat changes (six per loop) so DOM overlays can follow without per-frame state.
 */
function Director({ onBeat }: { onBeat: (id: BeatId) => void }) {
  const sceneRef = useScene();
  const beatRef = useRef<BeatId | null>(null);

  useFrame(({ camera }, delta) => {
    const s = sceneRef.current;
    s.t += Math.min(delta, MAX_DT);
    if (s.hold !== null) {
      const beat = BEATS[s.hold];
      if (s.t >= beat.end) s.t = beat.start;
    }
    const { id } = beatAt(s.t);
    if (id !== beatRef.current) {
      beatRef.current = id;
      onBeat(id);
    }
    const pose = cameraAt(s.t);
    camera.position.set(...pose.position);
    camera.lookAt(...pose.target);
  });

  return null;
}

export default function HeroCanvas({ active }: { active: boolean }) {
  const palette = usePalette();
  const hold = parseBeatParam(window.location.search, process.env.NODE_ENV !== "production");
  const sceneRef = useRef<SceneState>({
    t: hold === null ? 0 : BEATS[hold].start,
    hold,
    agv: missionPose(0),
  });
  const [beat, setBeat] = useState<BeatId>("sketch");

  return (
    <>
      <Canvas
        className="[mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_100%)]"
        // No tone mapping: TTY tokens render as the exact hex values.
        flat
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 40, near: 0.1, far: 100, position: cameraAt(0).position }}
        aria-hidden="true"
      >
        <SceneProvider value={sceneRef}>
          <PaletteProvider value={palette}>
            <Director onBeat={setBeat} />
            <Notebook />
            <Costmap />
            <PointCloud />
            <InkSketch />
            <HeroAgv />
            <Lidar />
          </PaletteProvider>
        </SceneProvider>
      </Canvas>
      <CodeTerminal visible={beat === "code"} />
    </>
  );
}
