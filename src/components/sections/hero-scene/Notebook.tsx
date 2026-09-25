"use client";

import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
} from "three";

import { DESK, NOTEBOOK, PAGE_HEIGHT } from "./desk-layout";
import { LAYER, fatLines } from "./lines";
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

/** Real-world notebook colours, the same in both themes: it is an object on the desk, not UI. */
export const PAPER = {
  sheet: "#f4efe4",
  edge: "#e2dccd",
  cover: "#2a3a4f",
  wire: "#c9ccd1",
  hole: "#3a2a1e",
  dots: "#b9b2a3",
} as const;

/** Pen colours for the sketch: blue-black ink, RViz red/green axes, orange motion. */
export const PEN = { ink: "#1f2a52", axisX: "#c62f2f", axisY: "#1c8a4a", motion: "#c77700" } as const;

/** Matte paper, lit like the rest of the desk. */
export const paperMaterial = (color: string) => new MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 });

/**
 * The open notebook on the desk: a cover board under both halves, the right
 * page block with the fresh dotted page, the left block of turned pages, and
 * the spiral coil in the gutter. It stays put for the whole loop — the AGV
 * drives off the right page, and the written sheet turns onto the left.
 */
export function Notebook() {
  const parts = useMemo(() => {
    const coverW = 2 * PAGE.width + 2 * NOTEBOOK.coverMargin;
    const coverD = PAGE.depth + 2 * NOTEBOOK.coverMargin;
    const coverX = LEFT_X / 2;
    const coverY = DESK.height + NOTEBOOK.cover / 2;
    const blockY = DESK.height + NOTEBOOK.cover + NOTEBOOK.pages / 2;

    const cover = new Mesh(
      new BoxGeometry(coverW, NOTEBOOK.cover, coverD),
      new MeshStandardMaterial({ color: PAPER.cover, roughness: 0.75, metalness: 0 }),
    );
    cover.position.set(coverX, coverY, 0);
    const blockGeometry = new BoxGeometry(PAGE.width, NOTEBOOK.pages, PAGE.depth);
    const blocks = [0, LEFT_X].map((x) => {
      const block = new Mesh(blockGeometry, paperMaterial(PAPER.edge));
      block.position.set(x, blockY, 0);
      return block;
    });
    const pageGeometry = new PlaneGeometry(PAGE.width, PAGE.depth);
    const pages = [0, LEFT_X].map((x) => {
      const page = new Mesh(pageGeometry, paperMaterial(PAPER.sheet));
      page.receiveShadow = true;
      page.rotation.x = -Math.PI / 2;
      page.position.set(x, PAGE_HEIGHT + 0.001, 0);
      return page;
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(pageDots(), 3));
    const dots = new Points(
      geometry,
      new PointsMaterial({ color: PAPER.dots, size: 2, sizeAttenuation: false, transparent: true, depthWrite: false }),
    );
    dots.position.y = PAGE_HEIGHT;

    const binding = fatLines(bindingCoil(), { linewidth: 2 });
    binding.material.color.set(PAPER.wire);
    for (const mesh of [cover, ...blocks]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }

    // Punched holes: dark slots above the top sheet, so they show on every page.
    const holeMatrices = bindingHoles().map(([x, z]) => {
      const m = new Matrix4().makeRotationX(-Math.PI / 2);
      m.setPosition(x, PAGE_HEIGHT + 0.012, z);
      return m;
    });
    const holes = new InstancedMesh(new PlaneGeometry(HOLE.w, HOLE.d), new MeshBasicMaterial({ color: PAPER.hole }), holeMatrices.length);
    holeMatrices.forEach((m, i) => holes.setMatrixAt(i, m));
    holes.instanceMatrix.needsUpdate = true;

    const group = new Group();
    group.add(cover, ...blocks, ...pages, dots, binding, holes);
    group.renderOrder = LAYER.page;
    return { group, cover, blocks, pages, dots, binding, holes };
  }, []);

  useEffect(
    () => () => {
      const { cover, blocks, pages, dots, binding, holes } = parts;
      for (const obj of [cover, ...blocks, ...pages, dots, binding, holes]) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    },
    [parts],
  );

  return <primitive object={parts.group} />;
}
