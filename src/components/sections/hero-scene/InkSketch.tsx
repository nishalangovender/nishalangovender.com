"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  type InterleavedBufferAttribute,
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
import { curlPositions } from "./page-turn";
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
 * the written sheet curls over the spine (`turn` 0 → 1, see page-turn.ts)
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
const DOT_Y = 0.0055;
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

/** Shifts [x, y, z] positions from page-centred to spine-based x, the frame the sheet turns in. */
const fromSpine = (positions: ArrayLike<number>) =>
  Float32Array.from(positions, (v, i) => (i % 3 === 0 ? v + PAGE.width / 2 : v));

/** Paper subdivisions along and across the sheet, so it can curl smoothly. */
const PAPER_SEGMENTS = { along: 32, across: 12 } as const;

/**
 * The top sheet of the notebook and everything written on it. Beats 1–2: the
 * kinematic sketch and its symbols are inked stroke by stroke; the robot's
 * outline lifts off into the wireframe while the axes, vectors and symbols
 * stay on the page. Return beat: the sheet curls over the spine onto the
 * left-hand stack, ink and dots bending with the paper. At the loop seam it is back on the right, blank — the
 * same as the fresh page it uncovered, so nothing visibly vanishes.
 */
export function InkSketch() {
  const sceneRef = useScene();
  const turned = useRef(0);
  const { page, body, paper, dots, hinge, bases } = useMemo(() => {
    const page = fatLines(Array.from(fromSpine(toPositions(segmentsWhere(false), INK_Y))), {
      linewidth: 2,
      colors: strokeColors(PAGE_ROLES),
    });
    const body = fatLines(Array.from(fromSpine(toPositions(segmentsWhere(true), INK_Y))), {
      linewidth: 2,
      colors: strokeColors(BODY_ROLES),
    });
    // The sheet itself: lit paper matching the page beneath, both sides, with the page's dot grid.
    const paperMat = paperMaterial(PAPER.sheet);
    paperMat.side = DoubleSide;
    const paperGeometry = new PlaneGeometry(PAGE.width, PAGE.depth, PAPER_SEGMENTS.along, PAPER_SEGMENTS.across)
      .rotateX(-Math.PI / 2)
      .translate(PAGE.width / 2, SHEET_Y, 0);
    const paper = new Mesh(paperGeometry, paperMat);
    const dotGeometry = new BufferGeometry();
    const dotBase = fromSpine(pageDots().map((v, i) => (i % 3 === 1 ? DOT_Y : v)));
    dotGeometry.setAttribute("position", new Float32BufferAttribute(dotBase.slice(), 3));
    const dots = new Points(
      dotGeometry,
      new PointsMaterial({ color: PAPER.dots, size: 2, sizeAttenuation: false, transparent: true, depthWrite: false }),
    );

    // The paper is opaque and writes depth, so once the sheet curls over, the
    // ink on its face is hidden behind it; dots and ink draw after it.
    [paper, dots, page, body].forEach((obj, i) => (obj.renderOrder = Math.min(i, 2)));
    // The curl moves every vertex, so bounds computed at rest no longer hold.
    for (const obj of [paper, dots, page]) obj.frustumCulled = false;
    // Hinge on the spine, at page height; the sheet lies out to its right.
    const hinge = new Group();
    hinge.add(paper, dots, page, body);
    hinge.position.set(HINGE_X, PAGE_HEIGHT, 0);
    hinge.renderOrder = LAYER.ink;
    const bases = {
      paper: Float32Array.from(paperGeometry.attributes.position.array),
      dots: dotBase,
      ink: Float32Array.from((page.geometry.attributes.instanceStart as InterleavedBufferAttribute).data.array),
    };
    return { page, body, paper, dots, hinge, bases };
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
    if (ink.turn !== turned.current) {
      turned.current = ink.turn;
      curlSheet(ink.turn);
    }
  });

  /** Bends the paper, its dots and its ink onto the turning sheet. */
  function curlSheet(turn: number) {
    const { width, depth } = PAGE;
    const paperPos = paper.geometry.attributes.position;
    curlPositions(bases.paper, paperPos.array as Float32Array, width, depth, turn);
    paperPos.needsUpdate = true;
    paper.geometry.computeVertexNormals();
    const dotPos = dots.geometry.attributes.position;
    curlPositions(bases.dots, dotPos.array as Float32Array, width, depth, turn);
    dotPos.needsUpdate = true;
    // Segment starts and ends share one interleaved buffer laid out as [x1 y1 z1 x2 y2 z2].
    const inkData = (page.geometry.attributes.instanceStart as InterleavedBufferAttribute).data;
    curlPositions(bases.ink, inkData.array as Float32Array, width, depth, turn);
    inkData.needsUpdate = true;
  }

  return <primitive object={hinge} />;
}
