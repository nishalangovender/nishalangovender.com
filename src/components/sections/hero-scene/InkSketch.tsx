"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { CanvasTexture, Color, Group, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";

import { clamp01, smoothstep } from "@/lib/math";

import { beatProgress } from "./beats";
import { LAYER, fatLines, toPositions } from "./lines";
import { useScene, useScenePalette, type Palette } from "./scene-context";
import {
  SKETCH_BODY,
  SKETCH_LABELS,
  SKETCH_ROLES,
  SKETCH_SEGMENTS,
  bodySegmentsIn,
  segmentsDrawn,
  type SketchRole,
} from "./sketch";

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

/**
 * Ink state at time `t`: strokes drawn and labels written in the sketch beat;
 * the robot outline lifts and fades in the design beat; the annotations stay
 * on the page until the return beat clears it for the next loop.
 */
export function inkAt(t: number): { drawn: number; labels: number; lift: number; body: number; page: number } {
  const sketch = beatProgress(t, "sketch");
  const design = beatProgress(t, "design");
  return {
    drawn: clamp01(sketch / DRAW_SHARE),
    labels: clamp01((sketch - DRAW_SHARE) / (1 - DRAW_SHARE)),
    lift: design * LIFT,
    body: 1 - design,
    page: 1 - smoothstep(beatProgress(t, "return")),
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

function strokeColors(roles: readonly SketchRole[], p: Palette): number[] {
  return roles.flatMap((role) => {
    const c = new Color(roleColor(role, p)).toArray();
    return [...c, ...c];
  });
}

const PAGE_ROLES = SKETCH_ROLES.filter((_, i) => !SKETCH_BODY[i]);
const BODY_ROLES = SKETCH_ROLES.filter((_, i) => SKETCH_BODY[i]);
const segmentsWhere = (keep: boolean) =>
  SKETCH_SEGMENTS.filter((_, i) => SKETCH_BODY[Math.floor(i / 4)] === keep);

/**
 * Beats 1–2: the kinematic sketch inked stroke by stroke and labelled; the
 * robot's outline then lifts off into the wireframe while the axes, vectors
 * and symbols stay written on the page.
 */
export function InkSketch() {
  const sceneRef = useScene();
  const palette = useScenePalette();

  const { page, body, labels, group } = useMemo(() => {
    const white = (n: number) => new Array(n * 6).fill(1);
    const page = fatLines(toPositions(segmentsWhere(false)), { linewidth: 2, colors: white(PAGE_ROLES.length) });
    const body = fatLines(toPositions(segmentsWhere(true)), { linewidth: 2, colors: white(BODY_ROLES.length) });
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
    group.add(page, body, ...labels);
    group.renderOrder = LAYER.ink;
    return { page, body, labels, group };
  }, []);

  useEffect(() => {
    page.geometry.setColors(strokeColors(PAGE_ROLES, palette));
    body.geometry.setColors(strokeColors(BODY_ROLES, palette));
    labels.forEach((mesh, i) => mesh.material.color.set(roleColor(SKETCH_LABELS[i].role, palette)));
  }, [page, body, labels, palette]);

  useEffect(
    () => () => {
      for (const line of [page, body]) {
        line.geometry.dispose();
        line.material.dispose();
      }
      labels[0]?.geometry.dispose();
      for (const mesh of labels) {
        mesh.material.map?.dispose();
        mesh.material.dispose();
      }
    },
    [page, body, labels],
  );

  useFrame(() => {
    const ink = inkAt(sceneRef.current.t);
    const drawn = segmentsDrawn(ink.drawn);
    const bodyDrawn = bodySegmentsIn(drawn);
    body.geometry.instanceCount = bodyDrawn;
    page.geometry.instanceCount = drawn - bodyDrawn;
    body.position.y = ink.lift;
    body.material.opacity = ink.body;
    body.visible = ink.body > 0;
    page.material.opacity = ink.page;
    // Labels are written in one after another once the strokes are done.
    labels.forEach((mesh, i) => {
      const k = clamp01(ink.labels * labels.length - i);
      mesh.visible = k > 0;
      mesh.material.opacity = k * ink.page;
    });
    group.visible = drawn > 0 && ink.page > 0;
  });

  return <primitive object={group} />;
}
