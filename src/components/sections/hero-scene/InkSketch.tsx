"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  PlaneGeometry,
  Points,
  PointsMaterial,
} from "three";

import { clamp01, smoothstep } from "@/lib/math";

import { beatProgress } from "./beats";
import { PAGE_LANDING } from "./camera";
import { PAGE_HEIGHT } from "./desk-layout";
import { LAYER, fatLines, toPositions } from "./lines";
import { HINGE_X, PAPER, PEN, paperMaterial } from "./Notebook";
import { useScene } from "./scene-context";
import {
  SKETCH_BODY,
  SKETCH_ROLES,
  SKETCH_SEGMENTS,
  PAGE,
  bodySegmentsIn,
  pageDots,
  segmentsDrawn,
  type SketchRole,
} from "./sketch";

/** Share of the sketch beat spent writing; the finished page holds for the rest. */
const DRAW_SHARE = 0.92;
/** How far the ink lifts off the page as it becomes the wireframe. */
const LIFT = 0.5;

/** Pen colour for each stroke role — RViz red/green for the body axes. */
export function roleColor(role: SketchRole): string {
  return PEN[role];
}

/**
 * Ink state at time `t`: the diagram and its symbols written in the sketch beat;
 * the robot outline lifts and fades in the design beat; in the return beat
 * the written sheet turns over the gutter coil (`turn` 0 → 1, a half turn)
 * and lands face-down on the stack of turned pages, uncovering a fresh page.
 */
export function inkAt(t: number): {
  drawn: number;
  lift: number;
  body: number;
  turn: number;
} {
  const sketch = beatProgress(t, "sketch");
  const design = beatProgress(t, "design");
  const back = beatProgress(t, "return");
  return {
    drawn: clamp01(sketch / DRAW_SHARE),
    lift: design * LIFT,
    body: 1 - design,
    // Turns once the camera has landed back on the notebook (see camera.ts).
    turn: smoothstep(clamp01((back - PAGE_LANDING) / 0.3)),
  };
}

/** Layer heights above the page, so the turning sheet never fights the page under it. */
const SHEET_Y = 0.004;
const INK_Y = 0.007;

function strokeColors(roles: readonly SketchRole[]): number[] {
  return roles.flatMap((role) => {
    const c = new Color(roleColor(role)).toArray();
    return [...c, ...c];
  });
}

const PAGE_ROLES = SKETCH_ROLES.filter((_, i) => !SKETCH_BODY[i]);
const BODY_ROLES = SKETCH_ROLES.filter((_, i) => SKETCH_BODY[i]);
const segmentsWhere = (keep: boolean) =>
  SKETCH_SEGMENTS.filter((_, i) => SKETCH_BODY[Math.floor(i / 4)] === keep);

/**
 * The top sheet of the notebook and everything written on it. Beats 1–2: the
 * kinematic sketch and its symbols are inked stroke by stroke; the robot's
 * outline lifts off into the wireframe while the axes, vectors and symbols
 * stay on the page. Return beat: the sheet turns about the spine onto
 * the left-hand stack. At the loop seam it is back on the right, blank — the
 * same as the fresh page it uncovered, so nothing visibly vanishes.
 */
export function InkSketch() {
  const sceneRef = useScene();
  const { page, body, paper, dots, hinge } = useMemo(() => {
    const page = fatLines(toPositions(segmentsWhere(false), INK_Y), { linewidth: 2, colors: strokeColors(PAGE_ROLES) });
    const body = fatLines(toPositions(segmentsWhere(true), INK_Y), { linewidth: 2, colors: strokeColors(BODY_ROLES) });
    // The sheet itself: lit paper matching the page beneath, both sides, with the page's dot grid.
    const paperMat = paperMaterial(PAPER.sheet);
    Object.assign(paperMat, { side: DoubleSide, transparent: true });
    const paper = new Mesh(new PlaneGeometry(PAGE.width, PAGE.depth), paperMat);
    paper.rotation.x = -Math.PI / 2;
    paper.position.y = SHEET_Y;
    const dotGeometry = new BufferGeometry();
    dotGeometry.setAttribute("position", new Float32BufferAttribute(pageDots(), 3));
    const dots = new Points(
      dotGeometry,
      new PointsMaterial({ color: PAPER.dots, size: 2, sizeAttenuation: false, transparent: true, depthWrite: false }),
    );
    dots.position.y = SHEET_Y;

    // Draw order inside the sheet: paper, dots, then ink. The paper is
    // transparent so it sorts with the ink, and must never paint over it.
    paper.material.depthWrite = false;
    [paper, dots, page, body].forEach((obj, i) => (obj.renderOrder = Math.min(i, 2)));
    const sheet = new Group();
    sheet.add(paper, dots, page, body);
    // Hinge in the gutter, at page height; the sheet lies out to its right.
    sheet.position.x = PAGE.width / 2;
    const hinge = new Group();
    hinge.add(sheet);
    hinge.position.set(HINGE_X, PAGE_HEIGHT, 0);
    hinge.renderOrder = LAYER.ink;
    return { page, body, paper, dots, hinge };
  }, []);

  useEffect(
    () => () => {
      for (const obj of [page, body, paper, dots]) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    },
    [page, body, paper, dots],
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
    // A half turn about the gutter (positive about z) lifts the free right edge
    // up and over to the left, landing the sheet face-down on the turned pages.
    hinge.rotation.z = ink.turn * Math.PI;
  });

  return <primitive object={hinge} />;
}
