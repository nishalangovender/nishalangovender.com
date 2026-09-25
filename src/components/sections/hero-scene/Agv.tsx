"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Group,
  Matrix4,
  Object3D,
  type Mesh,
} from "three";
import type { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";

import { clamp01, smoothstep } from "@/lib/math";
import type { Pose } from "@/lib/path-following/types";

import { beatAt, beatProgress } from "./beats";
import { bodyPose, materialised } from "./desk-layout";
import { buildElectronics, showElectronics } from "./electronics";
import { toWorld } from "./factory";
import { LAYER, edgeSegments, fatLines } from "./lines";
import { missionDistance, missionPose } from "./mission";
import { blendPose } from "./nav-goal";
import { useScene, useScenePalette, type Palette } from "./scene-context";
import { AGV, AGV_BODY_Y, AGV_LIDAR_OFFSET, LIDAR_HEIGHT, SKETCH_HEADING } from "./sketch";
import { buildSolidAgv, setSolidOpacity, type SolidAgv } from "./solid-agv";
import { WHEELS, spinFor, wheelTravel, type Wheel } from "./wheels";

const at = (x: number, y: number, z: number) => new Matrix4().makeTranslation(x, y, z);
const axleZ = () => new Matrix4().makeRotationX(Math.PI / 2);

/** Wireframe edges of the AGV body and lidar in its base_link frame (x forward, y up). */
export function agvEdges(): number[] {
  return [
    ...edgeSegments(new BoxGeometry(AGV.length, AGV.height, AGV.width), at(AGV.offset, AGV_BODY_Y + AGV.height / 2, 0)),
    ...edgeSegments(
      new CylinderGeometry(AGV.lidarRadius, AGV.lidarRadius, 0.1, 12),
      at(AGV_LIDAR_OFFSET, LIDAR_HEIGHT, 0),
    ),
  ];
}

/** Wireframe edges of one wheel centred on its axle (axle along z), so it can spin in place. */
export function wheelEdges(wheel: Wheel): number[] {
  const segments = wheel.id === "castor" ? 10 : 14;
  return edgeSegments(new CylinderGeometry(wheel.radius, wheel.radius, wheel.width, segments), axleZ());
}

/** RViz TF axes at base_link: x red, y green (ROS y is −z here), z blue. */
const AXES = [0, 0.01, 0, 0.5, 0.01, 0, 0, 0.01, 0, 0, 0.01, -0.5, 0, 0.01, 0, 0, 0.5, 0];

function axisColors(p: Palette): number[] {
  return [p.error, p.ok, p.focus].flatMap((hex) => {
    const c = new Color(hex).toArray();
    return [...c, ...c];
  });
}

export interface AgvModel {
  group: Group;
  body: LineSegments2;
  axes: LineSegments2;
  solid: SolidAgv;
  /** Wireframe wheels, one per WHEELS entry, each on a pivot at its axle. */
  wheelLines: LineSegments2[];
  /** Every wheel pivot (wireframe and solid) with the wheel it belongs to. */
  spinners: { pivot: Object3D; wheel: Wheel }[];
  /** Last pose shown, to roll the wheels by the distance since. */
  last: Pose | null;
}

/**
 * One AGV: the wireframe from the sketch, the solid robot it materialises
 * into, and RViz TF axes over both. Uncoloured; see useAgvModel.
 */
export function buildAgvModel(): AgvModel {
  const body = fatLines(agvEdges(), { linewidth: 1.5 });
  const axes = fatLines(AXES, { linewidth: 2.5, colors: new Array(AXES.length).fill(1) });
  const solid = buildSolidAgv();
  const wheelLines = WHEELS.map((w) => fatLines(wheelEdges(w), { linewidth: 1.5 }));
  // Object3D, not Group: a Group would reset the AGV's draw layer (see SolidAgv).
  const wirePivots = WHEELS.map((w, i) => {
    const pivot = new Object3D();
    pivot.position.set(w.x, w.y, w.z);
    pivot.add(wheelLines[i]);
    return pivot;
  });
  const spinners = [
    ...wirePivots.map((pivot, i) => ({ pivot, wheel: WHEELS[i] })),
    ...solid.wheels.map((pivot, i) => ({ pivot, wheel: WHEELS[i] })),
  ];
  const group = new Group();
  group.add(solid.group, body, ...wirePivots, axes);
  group.renderOrder = LAYER.agv;
  return { group, body, axes, solid, wheelLines, spinners, last: null };
}

/** An AGV model for the scene, with the wireframe coloured from the palette. */
export function useAgvModel(): AgvModel {
  const palette = useScenePalette();
  const model = useMemo(() => buildAgvModel(), []);

  useEffect(() => {
    model.body.material.color.set(palette.accent);
    for (const line of model.wheelLines) line.material.color.set(palette.accent);
    model.axes.geometry.setColors(axisColors(palette));
  }, [model, palette]);

  useEffect(
    () => () => {
      for (const line of [model.body, model.axes, ...model.wheelLines]) {
        line.geometry.dispose();
        line.material.dispose();
      }
      model.solid.group.traverse((o) => (o as Mesh).geometry?.dispose());
      for (const m of model.solid.materials) m.dispose();
    },
    [model],
  );

  return model;
}

/** How built the hero AGV is at `t`: rises in the design beat, sinks back in the return. */
export function agvPresence(t: number): number {
  const id = beatAt(t).id;
  if (id === "sketch") return 0;
  if (id === "design") return smoothstep(beatProgress(t, "design"));
  if (id === "return") return 1 - smoothstep(beatProgress(t, "return"));
  return 1;
}

/**
 * Mission pose at `t`, except while parked on the page: the AGV rises at the
 * sketched heading, then turns to face down the mission lane as the stack boots.
 */
export function heroPose(t: number): Pose {
  const pose = missionPose(missionDistance(t));
  const id = beatAt(t).id;
  if (id === "sketch" || id === "design") return { ...pose, theta: SKETCH_HEADING };
  if (id === "code") {
    const turn = smoothstep(clamp01((beatProgress(t, "code") - 0.4) / 0.6));
    return { ...pose, theta: SKETCH_HEADING * (1 - turn) };
  }
  return pose;
}

/**
 * Places a model at a map-frame pose, resting on its wheels on whatever it
 * is driving over (see bodyPose), grown and faded in by `presence` (0–1),
 * and crossfaded from wireframe to solid by `solidity`.
 */
export function showAgv(model: AgvModel, pose: Pose, presence: number, solidity: number) {
  const { group, body, axes, solid, wheelLines } = model;
  // Roll every wheel by how far its rim has travelled since the last frame.
  if (model.last) {
    const travel = wheelTravel(model.last, pose);
    for (const { pivot, wheel } of model.spinners) pivot.rotation.z += spinFor(wheel, travel[wheel.id]);
  }
  model.last = pose;
  group.visible = presence > 0;
  const { height, pitch } = bodyPose(pose);
  group.position.set(...toWorld(pose.x, pose.y, height));
  // Yaw about the world up axis, then pitch about the body's own left axis.
  group.rotation.set(0, pose.theta, -pitch, "YZX");
  group.scale.set(1, Math.max(presence, 0.001), 1);
  body.material.opacity = presence * (1 - solidity);
  body.visible = solidity < 1;
  for (const line of wheelLines) {
    line.material.opacity = body.material.opacity;
    line.visible = body.visible;
  }
  axes.material.opacity = presence;
  setSolidOpacity(solid, presence * solidity);
}

/** The AGV the story follows: built on the page, parked on base_link, then out on its mission. */
export function HeroAgv() {
  const sceneRef = useScene();
  const model = useAgvModel();
  const palette = useScenePalette();
  // Its wireframe electronics ride inside the chassis, fading with the wireframe as the solid body forms.
  const electronics = useMemo(() => buildElectronics(), []);
  useEffect(() => electronics.setColors(palette.accent, palette.dim), [electronics, palette]);
  useEffect(() => {
    model.group.add(electronics.root);
    return () => {
      model.group.remove(electronics.root);
      electronics.dispose();
    };
  }, [model, electronics]);

  useFrame(() => {
    const scene = sceneRef.current;
    const mission = heroPose(scene.t);
    if (scene.live) scene.agv = scene.live.pose;
    else if (scene.rejoin) scene.agv = blendPose(scene.rejoin.from, mission, smoothstep(scene.rejoin.k));
    else scene.agv = mission;
    showAgv(model, scene.agv, agvPresence(scene.t), materialised(scene.agv.x));
    showElectronics(electronics, scene.t, model.body.visible ? model.body.material.opacity : 0);
  });

  return <primitive object={model.group} />;
}
