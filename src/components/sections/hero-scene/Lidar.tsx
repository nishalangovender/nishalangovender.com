"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, Group, Points, PointsMaterial } from "three";

import { bodyPose } from "./desk-layout";
import { raycast, toWorld } from "./factory";
import { LAYER, fatLines } from "./lines";
import { deskScale } from "./mission";
import { cloudMorph } from "./PointCloud";
import { useScene, useScenePalette } from "./scene-context";
import { AGV_LIDAR_OFFSET, LIDAR_HEIGHT } from "./sketch";

const RAYS = 180;
const MAX_RANGE = 8;
/** Sweep beam revolutions per second. */
const SWEEP_HZ = 1.5;

/** 2D laser scan from the AGV: hit points in red, plus one sweeping beam. */
export function Lidar() {
  const sceneRef = useScene();
  const palette = useScenePalette();
  const dpr = useThree((s) => s.viewport.dpr);

  const { group, hits, beam } = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(new Float32Array(RAYS * 3), 3));
    const hits = new Points(
      geometry,
      new PointsMaterial({ sizeAttenuation: false, transparent: true, depthWrite: false }),
    );
    hits.frustumCulled = false;
    const beam = fatLines([0, 0, 0, 1, 0, 0], { linewidth: 1.5 });
    beam.frustumCulled = false;
    const group = new Group();
    group.add(hits, beam);
    group.renderOrder = LAYER.scan;
    return { group, hits, beam };
  }, []);

  useEffect(() => {
    hits.material.color.set(palette.error);
    hits.material.size = 3 * dpr;
    beam.material.color.set(palette.error);
  }, [hits, beam, palette, dpr]);

  useEffect(
    () => () => {
      hits.geometry.dispose();
      hits.material.dispose();
      beam.geometry.dispose();
      beam.material.dispose();
    },
    [hits, beam],
  );

  useFrame(({ clock }) => {
    const { t, agv } = sceneRef.current;
    const k = cloudMorph(t);
    group.visible = k > 0.5;
    if (!group.visible) return;

    const ox = agv.x + AGV_LIDAR_OFFSET * Math.cos(agv.theta);
    const oy = agv.y + AGV_LIDAR_OFFSET * Math.sin(agv.theta);
    // Scan plane rides with the AGV: page, desk, ramp or factory floor.
    const scanH = bodyPose(agv, deskScale(t)).height + LIDAR_HEIGHT;
    const pos = hits.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < RAYS; i++) {
      const a = agv.theta + (i / RAYS) * Math.PI * 2;
      const r = raycast(ox, oy, a, MAX_RANGE);
      pos.set(toWorld(ox + r * Math.cos(a), oy + r * Math.sin(a), scanH), i * 3);
    }
    hits.geometry.attributes.position.needsUpdate = true;

    const a = agv.theta + clock.elapsedTime * SWEEP_HZ * Math.PI * 2;
    const r = raycast(ox, oy, a, MAX_RANGE);
    beam.geometry.setPositions([
      ...toWorld(ox, oy, scanH),
      ...toWorld(ox + r * Math.cos(a), oy + r * Math.sin(a), scanH),
    ]);
    const opacity = (k - 0.5) * 2;
    hits.material.opacity = opacity;
    beam.material.opacity = 0.6 * opacity;
  });

  return <primitive object={group} />;
}
