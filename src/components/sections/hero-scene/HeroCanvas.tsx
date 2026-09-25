"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { PerspectiveCamera } from "three";

import { HeroAgv } from "./Agv";
import { BEATS, beatAt, parseBeatParam, type BeatId } from "./beats";
import { cameraAt } from "./camera";
import { CmdVel } from "./CmdVel";
import { CodeTerminal } from "./CodeTerminal";
import { Costmap } from "./Costmap";
import { Desk } from "./Desk";
import { Fleet } from "./Fleet";
import { InkSketch } from "./InkSketch";
import { Lidar } from "./Lidar";
import { missionPose } from "./mission";
import { Monitor } from "./Monitor";
import { REJOIN_TIME } from "./nav-goal";
import { NavGoal } from "./NavGoal";
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
    const dt = Math.min(delta, MAX_DT);
    // A nav goal pauses the story; the camera holds where it is.
    if (s.live) return;
    s.t += dt;
    if (s.rejoin) {
      s.rejoin.k += dt / REJOIN_TIME;
      if (s.rejoin.k >= 1) s.rejoin = null;
    }
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

/**
 * Frames the scene clear of the headline: shifted right on wide screens, up
 * on narrow ones. The camera still aims at the same target; only the frame
 * moves. Portrait screens also zoom out, so the horizontal field of view
 * stays wide enough for the close-up beats.
 */
export function framing(width: number, height: number): { offset: [number, number]; zoom: number } {
  const aspect = width / height;
  if (aspect >= 1.1) return { offset: [-0.2 * width, 0], zoom: 1 };
  return { offset: [0, 0.2 * height], zoom: Math.min(1, Math.max(0.55, aspect / 0.85)) };
}

function Framing() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const { width, height } = useThree((s) => s.size);

  useEffect(() => {
    const { offset, zoom } = framing(width, height);
    camera.setViewOffset(width, height, offset[0], offset[1], width, height);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
    return () => camera.clearViewOffset();
  }, [camera, width, height]);

  return null;
}

export default function HeroCanvas({ active }: { active: boolean }) {
  const palette = usePalette();
  const hold = parseBeatParam(window.location.search, process.env.NODE_ENV !== "production");
  const sceneRef = useRef<SceneState>({
    t: hold === null ? 0 : BEATS[hold].start,
    hold,
    agv: missionPose(0),
    live: null,
    rejoin: null,
  });
  const [beat, setBeat] = useState<BeatId>("sketch");
  const [live, setLive] = useState(false);
  const readoutRef = useRef<HTMLSpanElement>(null);

  return (
    <>
      <Canvas
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
            <Framing />
            <Desk />
            <Notebook />
            <Costmap />
            <PointCloud />
            <InkSketch />
            <HeroAgv />
            <Fleet />
            <Monitor />
            <Lidar />
            <NavGoal readout={readoutRef} onLive={setLive} />
          </PaletteProvider>
        </SceneProvider>
      </Canvas>
      <CodeTerminal visible={beat === "code"} />
      <CmdVel visible={live || beat === "deploy"} live={live} readout={readoutRef} />
    </>
  );
}
