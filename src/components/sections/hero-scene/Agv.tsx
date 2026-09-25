"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  EdgesGeometry,
  Group,
  Matrix4,
} from "three";
import type { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";

import { smoothstep } from "@/lib/math";
import type { Pose } from "@/lib/path-following/types";

import { beatAt, beatProgress } from "./beats";
import { toWorld } from "./factory";
import { LAYER, fatLines } from "./lines";
import { missionDistance, missionPose } from "./mission";
import { useScene, useScenePalette, type Palette } from "./scene-context";
import { AGV } from "./sketch";

const BODY_Y = AGV.wheelRadius + 0.04;

/** Lidar puck: distance ahead of base_link and height of its scan plane. */
export const AGV_LIDAR_OFFSET = AGV.offset + AGV.length / 2 - 0.2;
export const LIDAR_HEIGHT = BODY_Y + AGV.height + 0.05;

function edges(geometry: BufferGeometry, matrix: Matrix4): number[] {
  geometry.applyMatrix4(matrix);
  const e = new EdgesGeometry(geometry, 20);
  const out = Array.from(e.attributes.position.array as Float32Array);
  geometry.dispose();
  e.dispose();
  return out;
}

const at = (x: number, y: number, z: number) => new Matrix4().makeTranslation(x, y, z);
const wheelAt = (z: number) =>
  at(0, AGV.wheelRadius, z).multiply(new Matrix4().makeRotationX(Math.PI / 2));

/** Wireframe edges of the AGV in its base_link frame (x forward, y up). */
export function agvEdges(): number[] {
  return [
    ...edges(new BoxGeometry(AGV.length, AGV.height, AGV.width), at(AGV.offset, BODY_Y + AGV.height / 2, 0)),
    ...edges(new CylinderGeometry(AGV.wheelRadius, AGV.wheelRadius, AGV.wheelWidth, 14), wheelAt(-AGV.track / 2)),
    ...edges(new CylinderGeometry(AGV.wheelRadius, AGV.wheelRadius, AGV.wheelWidth, 14), wheelAt(AGV.track / 2)),
    ...edges(new CylinderGeometry(0.07, 0.07, 0.05, 10), at(AGV.castorX, 0.07, 0)),
    ...edges(
      new CylinderGeometry(AGV.lidarRadius, AGV.lidarRadius, 0.1, 12),
      at(AGV_LIDAR_OFFSET, LIDAR_HEIGHT, 0),
    ),
  ];
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
}

/** One wireframe AGV with its TF axes, coloured from the palette. */
export function useAgvModel(): AgvModel {
  const palette = useScenePalette();

  const model = useMemo(() => {
    const body = fatLines(agvEdges(), { linewidth: 1.5 });
    const axes = fatLines(AXES, { linewidth: 2.5, colors: new Array(AXES.length).fill(1) });
    const group = new Group();
    group.add(body, axes);
    group.renderOrder = LAYER.agv;
    return { group, body, axes };
  }, []);

  useEffect(() => {
    model.body.material.color.set(palette.accent);
    model.axes.geometry.setColors(axisColors(palette));
  }, [model, palette]);

  useEffect(
    () => () => {
      for (const line of [model.body, model.axes]) {
        line.geometry.dispose();
        line.material.dispose();
      }
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

/** Places a model at a map-frame pose, grown and faded in by `presence` (0–1). */
export function showAgv({ group, body, axes }: AgvModel, pose: Pose, presence: number) {
  group.visible = presence > 0;
  group.position.set(...toWorld(pose.x, pose.y));
  group.rotation.y = pose.theta;
  group.scale.set(1, Math.max(presence, 0.001), 1);
  body.material.opacity = presence;
  axes.material.opacity = presence;
}

/** The AGV the story follows: parked on base_link, then out on its mission. */
export function HeroAgv() {
  const sceneRef = useScene();
  const model = useAgvModel();

  useFrame(() => {
    const scene = sceneRef.current;
    scene.agv = missionPose(missionDistance(scene.t));
    showAgv(model, scene.agv, agvPresence(scene.t));
  });

  return <primitive object={model.group} />;
}
