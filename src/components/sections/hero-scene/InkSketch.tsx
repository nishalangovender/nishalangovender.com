"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Color, Group } from "three";

import { clamp01 } from "@/lib/math";

import { beatAt, beatProgress } from "./beats";
import { LAYER, fatLines, segmentCount, toPositions } from "./lines";
import { useScene, useScenePalette } from "./scene-context";
import { SKETCH_AXES, SKETCH_SEGMENTS } from "./sketch";

/** Share of the sketch beat spent drawing; the rest holds the finished page. */
const DRAW_SHARE = 0.85;
/** How far the ink lifts off the page as it becomes the wireframe. */
const LIFT = 0.5;

/** Ink state at time `t`: how much is drawn, its height and opacity. */
export function inkAt(t: number): { drawn: number; lift: number; opacity: number } {
  const id = beatAt(t).id;
  if (id !== "sketch" && id !== "design") return { drawn: 0, lift: 0, opacity: 0 };
  const lift = beatProgress(t, "design");
  return {
    drawn: clamp01(beatProgress(t, "sketch") / DRAW_SHARE),
    lift: lift * LIFT,
    opacity: 1 - lift,
  };
}

/** Beat 1 and 2 ink: the kinematic sketch drawn stroke by stroke, then lifted. */
export function InkSketch() {
  const sceneRef = useScene();
  const palette = useScenePalette();

  const { group, ink, axes } = useMemo(() => {
    const ink = fatLines(toPositions(SKETCH_SEGMENTS), { linewidth: 2 });
    const axes = fatLines(toPositions(SKETCH_AXES, 0.003), { linewidth: 3, colors: new Array(12).fill(1) });
    const group = new Group();
    group.add(ink, axes);
    group.renderOrder = LAYER.ink;
    return { group, ink, axes };
  }, []);

  useEffect(() => {
    ink.material.color.set(palette.accent);
    const x = new Color(palette.error);
    const y = new Color(palette.ok);
    axes.geometry.setColors([...x.toArray(), ...x.toArray(), ...y.toArray(), ...y.toArray()]);
  }, [ink, axes, palette]);

  useEffect(
    () => () => {
      for (const line of [ink, axes]) {
        line.geometry.dispose();
        line.material.dispose();
      }
    },
    [ink, axes],
  );

  useFrame(() => {
    const { drawn, lift, opacity } = inkAt(sceneRef.current.t);
    const total = segmentCount(ink);
    ink.geometry.instanceCount = Math.round(drawn * total);
    // Axes are the last strokes, drawn once the frame is done.
    axes.geometry.instanceCount = drawn >= 1 ? 2 : 0;
    group.position.y = lift;
    ink.material.opacity = opacity;
    axes.material.opacity = opacity;
    group.visible = opacity > 0 && drawn > 0;
  });

  return <primitive object={group} />;
}
