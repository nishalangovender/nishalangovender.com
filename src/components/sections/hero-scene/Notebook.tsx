"use client";

import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  type Material,
} from "three";

import { smoothstep } from "@/lib/math";

import { DESK, NOTEBOOK, PAGE_HEIGHT } from "./desk-layout";
import { LAYER, fatLines } from "./lines";
import { PAGE, pageDots } from "./sketch";

/**
 * The notebook lies open as a spread: the right page is the one the sketch
 * is drawn on (centred on the origin), the left is the stack of pages already
 * turned, and the stitched spine runs down the gutter between them at x = HINGE_X.
 */
export const HINGE_X = -PAGE.width / 2;
/** Centre of the left (turned) page stack. */
export const LEFT_X = HINGE_X - PAGE.width / 2;

/** Real-world notebook colours, the same in both themes: it is an object on the desk, not UI. */
export const PAPER = {
  sheet: "#f4efe4",
  edge: "#e2dccd",
  edgeLine: "#c9c1ae",
  cover: "#2a3a4f",
  crease: "#4a3c2a",
  thread: "#8c8373",
  ribbon: "#a8322d",
  dots: "#b9b2a3",
} as const;

/** Pen colours for the sketch: blue-black ink, RViz red/green axes, orange motion. */
export const PEN = { ink: "#1f2a52", axisX: "#c62f2f", axisY: "#1c8a4a", motion: "#c77700" } as const;

/** Matte paper, lit like the rest of the desk. */
export const paperMaterial = (color: string) => new MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 });

/** The shadow where the pages curve down into the stitched spine. */
export const GUTTER = {
  /** Half-width of the shadow either side of the spine. */
  halfWidth: 0.4,
  /** Darkness at the spine itself (0–1). */
  depth: 0.45,
  /** Stitches along the spine, and each stitch's length. */
  stitches: 9,
  stitch: 0.16,
} as const;

/** Gutter shadow darkness at distance `d` from the spine: deepest at the fold, gone by `halfWidth`. */
export function gutterShade(d: number): number {
  return GUTTER.depth * (1 - smoothstep(Math.min(1, Math.abs(d) / GUTTER.halfWidth)));
}

/** Stitch segments down the spine, evenly spaced inside the page depth, as [x, y, z] pairs. */
export function stitchSegments(): number[] {
  const out: number[] = [];
  const pitch = PAGE.depth / GUTTER.stitches;
  for (let i = 0; i < GUTTER.stitches; i++) {
    const z = -PAGE.depth / 2 + (i + 0.5) * pitch;
    out.push(HINGE_X, 0, z - GUTTER.stitch / 2, HINGE_X, 0, z + GUTTER.stitch / 2);
  }
  return out;
}

/** Horizontal alpha gradient for the gutter shadow, from the shade profile. */
function gutterTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  for (let x = 0; x < canvas.width; x++) {
    const d = ((x + 0.5) / canvas.width - 0.5) * 2 * GUTTER.halfWidth;
    const v = Math.round(255 * gutterShade(d));
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, 0, 1, 1);
  }
  return new CanvasTexture(canvas);
}

/** Stacked page edges: fine lines across a cream block, for the sides of each page block. */
function pageEdgeTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = PAPER.edge;
  ctx.fillRect(0, 0, 4, 64);
  ctx.fillStyle = PAPER.edgeLine;
  for (let y = 1; y < 64; y += 3) ctx.fillRect(0, y, 4, 1);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * The open notebook on the desk: a cloth hardcover under both halves, the
 * right page block with the fresh dotted page, the left block of turned
 * pages, the stitched spine with its shadow, and a ribbon bookmark. It stays
 * put for the whole loop — the AGV drives off the right page, and the written
 * sheet turns about the spine onto the left.
 */
export function Notebook() {
  const { group, shade } = useMemo(() => {
    const coverW = 2 * PAGE.width + 2 * NOTEBOOK.coverMargin;
    const coverD = PAGE.depth + 2 * NOTEBOOK.coverMargin;
    const blockY = DESK.height + NOTEBOOK.cover + NOTEBOOK.pages / 2;
    const solid = (mesh: Mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    const cover = solid(
      new Mesh(
        new BoxGeometry(coverW, NOTEBOOK.cover, coverD),
        new MeshStandardMaterial({ color: PAPER.cover, roughness: 0.85, metalness: 0 }),
      ),
    );
    cover.position.set(LEFT_X / 2, DESK.height + NOTEBOOK.cover / 2, 0);

    const edges = new MeshStandardMaterial({ map: pageEdgeTexture(), roughness: 0.9, metalness: 0 });
    const blockGeometry = new BoxGeometry(PAGE.width, NOTEBOOK.pages, PAGE.depth);
    const pageGeometry = new PlaneGeometry(PAGE.width, PAGE.depth);
    const sheet = paperMaterial(PAPER.sheet);
    const halves = [0, LEFT_X].flatMap((x) => {
      const block = solid(new Mesh(blockGeometry, edges));
      block.position.set(x, blockY, 0);
      const page = new Mesh(pageGeometry, sheet);
      page.receiveShadow = true;
      page.rotation.x = -Math.PI / 2;
      page.position.set(x, PAGE_HEIGHT + 0.001, 0);
      return [block, page];
    });

    const dotGeometry = new BufferGeometry();
    dotGeometry.setAttribute("position", new Float32BufferAttribute(pageDots(), 3));
    const dots = new Points(
      dotGeometry,
      new PointsMaterial({ color: PAPER.dots, size: 2, sizeAttenuation: false, transparent: true, depthWrite: false }),
    );
    dots.position.y = PAGE_HEIGHT;

    // Ribbon bookmark: its tail hangs from the spine over the front edge.
    const ribbon = new Mesh(
      new PlaneGeometry(0.07, 0.36),
      new MeshStandardMaterial({ color: PAPER.ribbon, roughness: 0.6, metalness: 0 }),
    );
    ribbon.position.set(HINGE_X, PAGE_HEIGHT - 0.14, PAGE.depth / 2 + NOTEBOOK.coverMargin / 2);
    ribbon.rotation.x = -0.35;

    const group = new Group();
    group.add(cover, ...halves, dots, ribbon);
    group.renderOrder = LAYER.page;

    // The spine's shadow and stitches lie over the written sheet too, so they
    // draw in the ink layer after the sheet's paper and ink.
    const crease = new Mesh(
      new PlaneGeometry(2 * GUTTER.halfWidth, PAGE.depth),
      new MeshBasicMaterial({ color: PAPER.crease, alphaMap: gutterTexture(), transparent: true, depthWrite: false }),
    );
    crease.rotation.x = -Math.PI / 2;
    crease.position.set(HINGE_X, PAGE_HEIGHT + 0.011, 0);
    const stitches = fatLines(stitchSegments(), { linewidth: 1.5 });
    stitches.material.color.set(PAPER.thread);
    stitches.position.y = PAGE_HEIGHT + 0.012;
    crease.renderOrder = 4;
    stitches.renderOrder = 5;
    const shade = new Group();
    shade.add(crease, stitches);
    shade.renderOrder = LAYER.ink;
    return { group, shade };
  }, []);

  useEffect(
    () => () => {
      for (const root of [group, shade]) {
        root.traverse((o) => {
          const mesh = o as Partial<Mesh>;
          mesh.geometry?.dispose();
          for (const material of [mesh.material ?? []].flat() as (Material & Partial<MeshBasicMaterial>)[]) {
            material.map?.dispose();
            material.alphaMap?.dispose();
            material.dispose();
          }
        });
      }
    },
    [group, shade],
  );

  return (
    <>
      <primitive object={group} />
      <primitive object={shade} />
    </>
  );
}
