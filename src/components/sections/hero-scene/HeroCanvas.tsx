"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { PerspectiveCamera } from "three";

import { HeroAgv } from "./Agv";
import { BEATS, parseBeatParam, parseTimeParam } from "./beats";
import { cameraAt } from "./camera";
import { Costmap } from "./Costmap";
import { Desk } from "./Desk";
import { DeskGear } from "./DeskGear";
import { DeskRig } from "./DeskRig";
import { FactoryFloor } from "./FactoryFloor";
import { Fleet } from "./Fleet";
import { InkSketch } from "./InkSketch";
import { Lidar } from "./Lidar";
import { Lights } from "./Lights";
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

/** Advances the loop clock and flies the camera along its keyframes. */
function Director() {
  const sceneRef = useScene();

  useFrame(({ camera }, delta) => {
    const s = sceneRef.current;
    const dt = Math.min(delta, MAX_DT);
    // A nav goal pauses the story; the camera holds where it is.
    if (s.live) return;
    s.t = s.freeze ?? s.t + dt;
    if (s.rejoin) {
      s.rejoin.k += dt / REJOIN_TIME;
      if (s.rejoin.k >= 1) s.rejoin = null;
    }
    if (s.hold !== null) {
      const beat = BEATS[s.hold];
      if (s.t >= beat.end) s.t = beat.start;
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
  const isDev = process.env.NODE_ENV !== "production";
  const hold = parseBeatParam(window.location.search, isDev);
  const freeze = parseTimeParam(window.location.search, isDev);
  const sceneRef = useRef<SceneState>({
    t: freeze ?? (hold === null ? 0 : BEATS[hold].start),
    hold,
    freeze,
    agv: missionPose(0),
    live: null,
    rejoin: null,
  });
  return (
    <Canvas
        // No tone mapping: TTY tokens render as the exact hex values.
        flat
        // Soft shadows on the factory floor; phones skip them to keep frame rate.
        shadows={typeof window !== "undefined" && window.innerWidth >= 768}
        // Full device resolution up to 2×, so the monitor's text stays sharp on high-DPI screens.
        dpr={[1, 2]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 40, near: 0.1, far: 100, position: cameraAt(0).position }}
        aria-hidden="true"
      >
        <SceneProvider value={sceneRef}>
          <PaletteProvider value={palette}>
            <Director />
            <Framing />
            <Lights />
            <DeskRig>
              <Desk />
              <DeskGear />
              <Notebook />
              <InkSketch />
              <Monitor />
            </DeskRig>
            <FactoryFloor />
            <Costmap />
            <PointCloud />
            <HeroAgv />
            <Fleet />
            <Lidar />
            <NavGoal />
          </PaletteProvider>
        </SceneProvider>
      </Canvas>
  );
}
