"use client";

import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
} from "three";

import { DESK, NOTEBOOK, PAGE_HEIGHT } from "./desk-layout";
import { LAYER, edgeSegments, fatLines } from "./lines";
import { useScenePalette } from "./scene-context";
import { PAGE, pageDots } from "./sketch";

/**
 * Spiral binding: one continuous wire coil along the bound (far) edge. Each
 * turn comes up through a punched hole a little in from the page edge, over
 * the top, round the outside of the spine and back under the cover, resting
 * on the desk. The coil advances one hole pitch per turn.
 */
export const BINDING = {
  pitch: 0.2,
  radius: 0.16,
  /** Hole centres, measured in from the page's bound edge. */
  holeInset: 0.07,
  stepsPerTurn: 24,
} as const;

const HOLE_Z = -PAGE.depth / 2 + BINDING.holeInset;
/** Coil axis: behind the holes by the inset, high enough that the coil sits on the desk. */
const AXIS = { y: DESK.height + BINDING.radius, z: HOLE_Z - BINDING.holeInset } as const;
/** Angle round the axis at which the wire passes down through a hole. */
const HOLE_ANGLE = Math.acos(BINDING.holeInset / BINDING.radius);
/** The coil stops this far in from each side edge of the page. */
const COIL_MARGIN = 0.12;
const X0 = -PAGE.width / 2 + COIL_MARGIN;
const TURNS = Math.floor((PAGE.width - 2 * COIL_MARGIN) / BINDING.pitch);

/** Point on the coil after `u` radians of winding. */
function coilPoint(u: number): [number, number, number] {
  return [
    X0 + (BINDING.pitch * u) / (Math.PI * 2),
    AXIS.y + BINDING.radius * Math.sin(u),
    AXIS.z + BINDING.radius * Math.cos(u),
  ];
}

export function bindingCoil(): number[] {
  const out: number[] = [];
  const steps = TURNS * BINDING.stepsPerTurn;
  for (let i = 0; i < steps; i++) {
    const a = (i / BINDING.stepsPerTurn) * Math.PI * 2;
    const b = ((i + 1) / BINDING.stepsPerTurn) * Math.PI * 2;
    out.push(...coilPoint(a), ...coilPoint(b));
  }
  return out;
}

/** Where the coil passes through the top page: one punched hole per turn. */
export function bindingHoles(): [number, number][] {
  return Array.from({ length: TURNS }, (_, k) => [coilPoint(HOLE_ANGLE + k * Math.PI * 2)[0], HOLE_Z]);
}

const HOLE = { w: 0.07, d: 0.045 } as const;

/**
 * The notebook on the desk: a cover board, a block of pages and a spiral
 * binding, with the dotted top page the sketch is drawn on. It stays put for
 * the whole loop — the AGV drives off it, and the camera comes back to it.
 */
export function Notebook() {
  const palette = useScenePalette();

  const parts = useMemo(() => {
    const coverW = PAGE.width + 2 * NOTEBOOK.coverMargin;
    const coverD = PAGE.depth + 2 * NOTEBOOK.coverMargin;
    const coverY = DESK.height + NOTEBOOK.cover / 2;
    const blockY = DESK.height + NOTEBOOK.cover + NOTEBOOK.pages / 2;

    const cover = new Mesh(new BoxGeometry(coverW, NOTEBOOK.cover, coverD), new MeshBasicMaterial());
    cover.position.y = coverY;
    const block = new Mesh(new BoxGeometry(PAGE.width, NOTEBOOK.pages, PAGE.depth), new MeshBasicMaterial());
    block.position.y = blockY;
    const page = new Mesh(new PlaneGeometry(PAGE.width, PAGE.depth), new MeshBasicMaterial());
    page.rotation.x = -Math.PI / 2;
    page.position.y = PAGE_HEIGHT + 0.001;

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(pageDots(), 3));
    const dots = new Points(
      geometry,
      new PointsMaterial({ size: 2, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    dots.position.y = PAGE_HEIGHT;

    const edges = fatLines(
      [
        ...edgeSegments(new BoxGeometry(coverW, NOTEBOOK.cover, coverD), new Matrix4().makeTranslation(0, coverY, 0)),
        ...edgeSegments(new BoxGeometry(PAGE.width, NOTEBOOK.pages, PAGE.depth), new Matrix4().makeTranslation(0, blockY, 0)),
      ],
      { linewidth: 1 },
    );
    const binding = fatLines(bindingCoil(), { linewidth: 1.6 });

    // Punched holes: dark slots above the top sheet, so they show on every page.
    const holeMatrices = bindingHoles().map(([x, z]) => {
      const m = new Matrix4().makeRotationX(-Math.PI / 2);
      m.setPosition(x, PAGE_HEIGHT + 0.012, z);
      return m;
    });
    const holes = new InstancedMesh(new PlaneGeometry(HOLE.w, HOLE.d), new MeshBasicMaterial(), holeMatrices.length);
    holeMatrices.forEach((m, i) => holes.setMatrixAt(i, m));
    holes.instanceMatrix.needsUpdate = true;

    const group = new Group();
    group.add(cover, block, page, dots, edges, binding, holes);
    group.renderOrder = LAYER.page;
    return { group, cover, block, page, dots, edges, binding, holes };
  }, []);

  useEffect(() => {
    const { cover, block, page, dots, edges, binding, holes } = parts;
    const pageColor = new Color(palette.page);
    page.material.color.copy(pageColor);
    // Page edges read slightly darker than the top sheet; the cover is a deep accent board.
    block.material.color.copy(pageColor).lerp(new Color(palette.rule), 0.45);
    cover.material.color.set(palette.accent).lerp(new Color(palette.bg), 0.72);
    dots.material.color.set(palette.dim);
    edges.material.color.set(palette.rule);
    // Wire reads as bright metal against the cover; holes as the desk showing through.
    binding.material.color.set(palette.dim).lerp(new Color(palette.fg), 0.35);
    holes.material.color.set(palette.bg);
  }, [parts, palette]);

  useEffect(
    () => () => {
      const { cover, block, page, dots, edges, binding, holes } = parts;
      for (const obj of [cover, block, page, dots, edges, binding, holes]) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    },
    [parts],
  );

  return <primitive object={parts.group} />;
}
