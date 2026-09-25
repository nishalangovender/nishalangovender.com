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
 * The notebook lies open as a spread: the right page is the one the sketch
 * is drawn on (centred on the origin), the left is the stack of pages already
 * turned, and a spiral coil runs down the gutter between them at x = HINGE_X.
 */
export const HINGE_X = -PAGE.width / 2;
/** Centre of the left (turned) page stack. */
export const LEFT_X = HINGE_X - PAGE.width / 2;

/**
 * Spiral binding: one continuous wire coil down the gutter. Each turn stands
 * as an arch over the gutter, dropping through a punched hole in each page
 * and round under the stacks to the cover, resting on the desk. The coil
 * advances one hole pitch per turn along the gutter.
 */
export const BINDING = {
  pitch: 0.2,
  radius: 0.15,
  stepsPerTurn: 24,
} as const;

/** Coil axis: along the gutter, low enough that the coil rests on the desk. */
const AXIS_Y = DESK.height + BINDING.radius;
/** Winding angle at which the wire meets the right page's top surface. */
const TOP_ANGLE = Math.asin((PAGE_HEIGHT - AXIS_Y) / BINDING.radius);
/** The coil stops this far in from the top and bottom edges of the pages. */
const COIL_MARGIN = 0.12;
const Z0 = -PAGE.depth / 2 + COIL_MARGIN;
const TURNS = Math.floor((PAGE.depth - 2 * COIL_MARGIN) / BINDING.pitch);

/** Point on the coil after `u` radians of winding. */
function coilPoint(u: number): [number, number, number] {
  return [
    HINGE_X + BINDING.radius * Math.cos(u),
    AXIS_Y + BINDING.radius * Math.sin(u),
    Z0 + (BINDING.pitch * u) / (Math.PI * 2),
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

/** Punched holes as page (x, z): where each turn meets the page tops, one each side of the gutter. */
export function bindingHoles(): [number, number][] {
  return Array.from({ length: TURNS }, (_, k): [number, number][] => {
    const right = coilPoint(TOP_ANGLE + k * Math.PI * 2);
    const left = coilPoint(Math.PI - TOP_ANGLE + k * Math.PI * 2);
    return [
      [right[0], right[2]],
      [left[0], left[2]],
    ];
  }).flat();
}

const HOLE = { w: 0.045, d: 0.07 } as const;

/**
 * The open notebook on the desk: a cover board under both halves, the right
 * page block with the fresh dotted page, the left block of turned pages, and
 * the spiral coil in the gutter. It stays put for the whole loop — the AGV
 * drives off the right page, and the written sheet turns onto the left.
 */
export function Notebook() {
  const palette = useScenePalette();

  const parts = useMemo(() => {
    const coverW = 2 * PAGE.width + 2 * NOTEBOOK.coverMargin;
    const coverD = PAGE.depth + 2 * NOTEBOOK.coverMargin;
    const coverX = LEFT_X / 2;
    const coverY = DESK.height + NOTEBOOK.cover / 2;
    const blockY = DESK.height + NOTEBOOK.cover + NOTEBOOK.pages / 2;
    const at = (x: number, y: number) => new Matrix4().makeTranslation(x, y, 0);

    const cover = new Mesh(new BoxGeometry(coverW, NOTEBOOK.cover, coverD), new MeshBasicMaterial());
    cover.position.set(coverX, coverY, 0);
    const blockGeometry = new BoxGeometry(PAGE.width, NOTEBOOK.pages, PAGE.depth);
    const blocks = [0, LEFT_X].map((x) => {
      const block = new Mesh(blockGeometry, new MeshBasicMaterial());
      block.position.set(x, blockY, 0);
      return block;
    });
    const pageGeometry = new PlaneGeometry(PAGE.width, PAGE.depth);
    const pages = [0, LEFT_X].map((x) => {
      const page = new Mesh(pageGeometry, new MeshBasicMaterial());
      page.rotation.x = -Math.PI / 2;
      page.position.set(x, PAGE_HEIGHT + 0.001, 0);
      return page;
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(pageDots(), 3));
    const dots = new Points(
      geometry,
      new PointsMaterial({ size: 2, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    dots.position.y = PAGE_HEIGHT;

    const edges = fatLines(
      [
        ...edgeSegments(new BoxGeometry(coverW, NOTEBOOK.cover, coverD), at(coverX, coverY)),
        ...edgeSegments(new BoxGeometry(PAGE.width, NOTEBOOK.pages, PAGE.depth), at(0, blockY)),
        ...edgeSegments(new BoxGeometry(PAGE.width, NOTEBOOK.pages, PAGE.depth), at(LEFT_X, blockY)),
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
    group.add(cover, ...blocks, ...pages, dots, edges, binding, holes);
    group.renderOrder = LAYER.page;
    return { group, cover, blocks, pages, dots, edges, binding, holes };
  }, []);

  useEffect(() => {
    const { cover, blocks, pages, dots, edges, binding, holes } = parts;
    const pageColor = new Color(palette.page);
    for (const page of pages) page.material.color.copy(pageColor);
    // Page edges read slightly darker than the top sheet; the cover is a deep accent board.
    for (const block of blocks) block.material.color.copy(pageColor).lerp(new Color(palette.rule), 0.45);
    cover.material.color.set(palette.accent).lerp(new Color(palette.bg), 0.72);
    dots.material.color.set(palette.dim);
    edges.material.color.set(palette.rule);
    // Wire reads as bright metal against the cover; holes as the desk showing through.
    binding.material.color.set(palette.dim).lerp(new Color(palette.fg), 0.35);
    holes.material.color.set(palette.bg);
  }, [parts, palette]);

  useEffect(
    () => () => {
      const { cover, blocks, pages, dots, edges, binding, holes } = parts;
      for (const obj of [cover, ...blocks, ...pages, dots, edges, binding, holes]) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    },
    [parts],
  );

  return <primitive object={parts.group} />;
}
