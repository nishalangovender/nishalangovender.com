"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { CanvasTexture, Color, Group, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";

import { clamp01 } from "@/lib/math";

import { beatAt, beatProgress } from "./beats";
import { LAYER, fatLines, toPositions } from "./lines";
import { useScene, useScenePalette, type Palette } from "./scene-context";
import { SKETCH_LABELS, SKETCH_ROLES, SKETCH_SEGMENTS, segmentsDrawn, type SketchRole } from "./sketch";

/** Share of the sketch beat spent drawing strokes; labels are written in after. */
const DRAW_SHARE = 0.8;
/** How far the ink lifts off the page as it becomes the wireframe. */
const LIFT = 0.5;
/** Label glyph size on the page, metres. */
const LABEL_SIZE = 0.34;

/** Palette colour for each stroke role — RViz red/green for the body axes. */
export function roleColor(role: SketchRole, p: Palette): string {
  return { ink: p.accent, axisX: p.error, axisY: p.ok, motion: p.warn }[role];
}

/** Ink state at time `t`: strokes drawn, labels written, height and opacity. */
export function inkAt(t: number): { drawn: number; labels: number; lift: number; opacity: number } {
  const id = beatAt(t).id;
  if (id !== "sketch" && id !== "design") return { drawn: 0, labels: 0, lift: 0, opacity: 0 };
  const sketch = beatProgress(t, "sketch");
  const lift = beatProgress(t, "design");
  return {
    drawn: clamp01(sketch / DRAW_SHARE),
    labels: clamp01((sketch - DRAW_SHARE) / (1 - DRAW_SHARE)),
    lift: lift * LIFT,
    opacity: 1 - lift,
  };
}

/** One symbol as a white glyph on a transparent texture, tinted by the material. */
function glyphTexture(text: string): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const texture = new CanvasTexture(canvas);
  const draw = () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains-mono").trim();
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 92px ${mono || "monospace"}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 64, 68);
    texture.needsUpdate = true;
  };
  draw();
  // Redraw once the web font has loaded, in case the first pass fell back.
  void document.fonts?.ready.then(draw);
  return texture;
}

/** Beats 1–2: the kinematic sketch inked stroke by stroke, labelled, then lifted. */
export function InkSketch() {
  const sceneRef = useScene();
  const palette = useScenePalette();

  const { group, ink, labels } = useMemo(() => {
    const ink = fatLines(toPositions(SKETCH_SEGMENTS), {
      linewidth: 2,
      colors: new Array((SKETCH_SEGMENTS.length / 4) * 6).fill(1),
    });
    const plane = new PlaneGeometry(LABEL_SIZE, LABEL_SIZE);
    const labels = SKETCH_LABELS.map((l) => {
      const mesh = new Mesh(
        plane,
        new MeshBasicMaterial({ map: glyphTexture(l.text), transparent: true, depthWrite: false }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(l.x, 0.004, l.z);
      return mesh;
    });
    const group = new Group();
    group.add(ink, ...labels);
    group.renderOrder = LAYER.ink;
    return { group, ink, labels };
  }, []);

  useEffect(() => {
    ink.geometry.setColors(
      SKETCH_ROLES.flatMap((role) => {
        const c = new Color(roleColor(role, palette)).toArray();
        return [...c, ...c];
      }),
    );
    labels.forEach((mesh, i) => mesh.material.color.set(roleColor(SKETCH_LABELS[i].role, palette)));
  }, [ink, labels, palette]);

  useEffect(
    () => () => {
      ink.geometry.dispose();
      ink.material.dispose();
      labels[0]?.geometry.dispose();
      for (const mesh of labels) {
        mesh.material.map?.dispose();
        mesh.material.dispose();
      }
    },
    [ink, labels],
  );

  useFrame(() => {
    const { drawn, labels: written, lift, opacity } = inkAt(sceneRef.current.t);
    ink.geometry.instanceCount = segmentsDrawn(drawn);
    ink.material.opacity = opacity;
    // Labels are written in one after another once the strokes are done.
    labels.forEach((mesh, i) => {
      const k = clamp01(written * labels.length - i);
      mesh.visible = k > 0;
      mesh.material.opacity = k * opacity;
    });
    group.position.y = lift;
    group.visible = opacity > 0 && drawn > 0;
  });

  return <primitive object={group} />;
}
