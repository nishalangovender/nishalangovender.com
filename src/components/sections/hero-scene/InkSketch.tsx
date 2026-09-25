"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
} from "three";

import { clamp01, smoothstep } from "@/lib/math";

import { beatProgress } from "./beats";
import { PAGE_LANDING } from "./camera";
import { PAGE_HEIGHT } from "./desk-layout";
import { LAYER, fatLines, toPositions } from "./lines";
import { HINGE_X } from "./Notebook";
import { useScene, useScenePalette, type Palette } from "./scene-context";
import {
  SKETCH_BODY,
  SKETCH_LABELS,
  SKETCH_ROLES,
  SKETCH_SEGMENTS,
  PAGE,
  bodySegmentsIn,
  pageDots,
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
 * the robot outline lifts and fades in the design beat; in the return beat
 * the written sheet turns over the gutter coil (`turn` 0 → 1, a half turn)
 * and lands face-down on the stack of turned pages, uncovering a fresh page.
 */
export function inkAt(t: number): {
  drawn: number;
  labels: number;
  lift: number;
  body: number;
  turn: number;
} {
  const sketch = beatProgress(t, "sketch");
  const design = beatProgress(t, "design");
  const back = beatProgress(t, "return");
  return {
    drawn: clamp01(sketch / DRAW_SHARE),
    labels: clamp01((sketch - DRAW_SHARE) / (1 - DRAW_SHARE)),
    lift: design * LIFT,
    body: 1 - design,
    // Turns once the camera has landed back on the notebook (see camera.ts).
    turn: smoothstep(clamp01((back - PAGE_LANDING) / 0.3)),
  };
}

/** Layer heights above the page, so the turning sheet never fights the page under it. */
const SHEET_Y = 0.004;
const INK_Y = 0.007;
const LABEL_Y = 0.009;

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
 * The top sheet of the notebook and everything written on it. Beats 1–2: the
 * kinematic sketch is inked stroke by stroke and labelled; the robot's
 * outline lifts off into the wireframe while the axes, vectors and symbols
 * stay on the page. Return beat: the sheet turns over the spiral binding onto
 * the left-hand stack. At the loop seam it is back on the right, blank — the
 * same as the fresh page it uncovered, so nothing visibly vanishes.
 */
export function InkSketch() {
  const sceneRef = useScene();
  const palette = useScenePalette();

  const { page, body, labels, paper, dots, hinge } = useMemo(() => {
    const white = (n: number) => new Array(n * 6).fill(1);
    const page = fatLines(toPositions(segmentsWhere(false), INK_Y), { linewidth: 2, colors: white(PAGE_ROLES.length) });
    const body = fatLines(toPositions(segmentsWhere(true), INK_Y), { linewidth: 2, colors: white(BODY_ROLES.length) });
    const plane = new PlaneGeometry(LABEL_SIZE, LABEL_SIZE);
    const labels = SKETCH_LABELS.map((l) => {
      const mesh = new Mesh(
        plane,
        new MeshBasicMaterial({ map: glyphTexture(l.text), transparent: true, depthWrite: false }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(l.x, LABEL_Y, l.z);
      return mesh;
    });

    // The sheet itself: paper, both sides, with the page's dot grid.
    const paper = new Mesh(
      new PlaneGeometry(PAGE.width, PAGE.depth),
      new MeshBasicMaterial({ side: DoubleSide, transparent: true }),
    );
    paper.rotation.x = -Math.PI / 2;
    paper.position.y = SHEET_Y;
    const dotGeometry = new BufferGeometry();
    dotGeometry.setAttribute("position", new Float32BufferAttribute(pageDots(), 3));
    const dots = new Points(
      dotGeometry,
      new PointsMaterial({ size: 2, sizeAttenuation: false, transparent: true, depthWrite: false }),
    );
    dots.position.y = SHEET_Y;

    // Draw order inside the sheet: paper, dots, ink, symbols — the paper is
    // transparent (for the labels' blending), so it must never paint over the ink.
    paper.material.depthWrite = false;
    [paper, dots, page, body, ...labels].forEach((obj, i) => (obj.renderOrder = Math.min(i, 3)));
    const sheet = new Group();
    sheet.add(paper, dots, page, body, ...labels);
    // Hinge in the gutter, at page height; the sheet lies out to its right.
    sheet.position.x = PAGE.width / 2;
    const hinge = new Group();
    hinge.add(sheet);
    hinge.position.set(HINGE_X, PAGE_HEIGHT, 0);
    hinge.renderOrder = LAYER.ink;
    return { page, body, labels, paper, dots, hinge };
  }, []);

  useEffect(() => {
    paper.material.color.set(palette.page);
    dots.material.color.set(palette.dim);
    page.geometry.setColors(strokeColors(PAGE_ROLES, palette));
    body.geometry.setColors(strokeColors(BODY_ROLES, palette));
    labels.forEach((mesh, i) => mesh.material.color.set(roleColor(SKETCH_LABELS[i].role, palette)));
  }, [page, body, labels, paper, dots, palette]);

  useEffect(
    () => () => {
      for (const obj of [page, body, paper, dots]) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
      labels[0]?.geometry.dispose();
      for (const mesh of labels) {
        mesh.material.map?.dispose();
        mesh.material.dispose();
      }
    },
    [page, body, labels, paper, dots],
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
    // Labels are written in one after another once the strokes are done.
    labels.forEach((mesh, i) => {
      const k = clamp01(ink.labels * labels.length - i);
      mesh.visible = k > 0;
      mesh.material.opacity = k;
    });
    // A half turn about the gutter (positive about z) lifts the free right edge
    // up and over to the left, landing the sheet face-down on the turned pages.
    hinge.rotation.z = ink.turn * Math.PI;
  });

  return <primitive object={hinge} />;
}
