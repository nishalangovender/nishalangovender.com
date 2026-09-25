"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, type RefObject } from "react";
import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";

import { LIVE_BEATS, beatAt, loopTime } from "./beats";
import { FLY_IN_START } from "./camera";
import { FLOOR, toWorld } from "./factory";
import { LAYER, fatLines } from "./lines";
import { isGoalValid, setGoal, shouldResume, stepNav } from "./nav-goal";
import { cloudMorph } from "./PointCloud";
import { useScene, useScenePalette } from "./scene-context";

const RING_SEGMENTS = 32;
const RING_RADIUS = 0.3;
/** /cmd_vel readout refresh interval, seconds. */
const READOUT_PERIOD = 0.1;

/**
 * Goals are accepted in the live beats while the floor is in view: once the
 * factory has fully formed, until the camera heads for the monitor.
 */
export function acceptsGoals(t: number): boolean {
  return LIVE_BEATS.includes(beatAt(t).id) && cloudMorph(t) >= 1 && loopTime(t) < FLY_IN_START;
}

function ring(): number[] {
  const out: number[] = [];
  for (let i = 0; i < RING_SEGMENTS; i++) {
    const a = (i / RING_SEGMENTS) * Math.PI * 2;
    const b = ((i + 1) / RING_SEGMENTS) * Math.PI * 2;
    out.push(Math.cos(a) * RING_RADIUS, 0.01, Math.sin(a) * RING_RADIUS);
    out.push(Math.cos(b) * RING_RADIUS, 0.01, Math.sin(b) * RING_RADIUS);
  }
  return out;
}

/**
 * Click or tap the floor during the deploy and system beats to send the AGV
 * a nav goal: the loop pauses, pure pursuit drives there, and `/cmd_vel`
 * prints below. The loop resumes after the AGV has sat idle.
 */
export function NavGoal({
  readout,
  onLive,
}: {
  readout: RefObject<HTMLSpanElement | null>;
  onLive: (live: boolean) => void;
}) {
  const sceneRef = useScene();
  const palette = useScenePalette();

  const { floor, marker, goalRing, pathLine } = useMemo(() => {
    const floor = new Mesh(
      new PlaneGeometry(FLOOR.maxX - FLOOR.minX, FLOOR.maxY - FLOOR.minY),
      new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(...toWorld((FLOOR.minX + FLOOR.maxX) / 2, (FLOOR.minY + FLOOR.maxY) / 2));
    const goalRing = fatLines(ring(), { linewidth: 2 });
    const pathLine = fatLines([0, 0, 0, 1, 0, 0], { linewidth: 1.5 });
    pathLine.frustumCulled = false;
    const marker = new Group();
    marker.add(goalRing, pathLine);
    marker.renderOrder = LAYER.scan;
    return { floor, marker, goalRing, pathLine };
  }, []);

  useEffect(() => {
    goalRing.material.color.set(palette.accent);
    pathLine.material.color.set(palette.accent);
  }, [goalRing, pathLine, palette]);

  useEffect(
    () => () => {
      floor.geometry.dispose();
      floor.material.dispose();
      for (const line of [goalRing, pathLine]) {
        line.geometry.dispose();
        line.material.dispose();
      }
    },
    [floor, goalRing, pathLine],
  );

  function onPointerDown(e: ThreeEvent<PointerEvent>) {
    const scene = sceneRef.current;
    if (!scene.live && !acceptsGoals(scene.t)) return;
    const x = e.point.x;
    const y = -e.point.z;
    if (!isGoalValid(x, y)) return;
    e.stopPropagation();
    if (!scene.live) onLive(true);
    scene.live = setGoal(scene.agv, x, y);
    scene.rejoin = null;
  }

  useFrame(({ clock }, delta) => {
    const scene = sceneRef.current;
    const live = scene.live;
    if (live) {
      scene.live = stepNav(live, Math.min(delta, 0.1));
      if (shouldResume(scene.live)) {
        scene.rejoin = { from: scene.live.pose, k: 0 };
        scene.live = null;
        onLive(false);
      }
    }

    const goal = scene.live?.path.at(-1);
    marker.visible = Boolean(goal);
    if (goal) {
      goalRing.position.set(...toWorld(goal.x, goal.y));
      pathLine.geometry.setPositions([
        ...toWorld(scene.agv.x, scene.agv.y, 0.01),
        ...toWorld(goal.x, goal.y, 0.01),
      ]);
    }

    const el = readout.current;
    if (el && scene.live && clock.elapsedTime % READOUT_PERIOD < delta) {
      const { v, omega } = scene.live.cmd;
      el.textContent = `linear.x: ${v.toFixed(2)}  angular.z: ${omega.toFixed(2)}`;
    }
  });

  return (
    <>
      <primitive object={floor} onPointerDown={onPointerDown} />
      <primitive object={marker} />
    </>
  );
}
