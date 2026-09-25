"use client";

import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
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

const RING_RADIUS = 0.09;
const RING_PITCH = 0.24;
const RING_STEPS = 12;

/** Spiral binding: rings standing across the far edge of the page block. */
function bindingRings(): number[] {
  const out: number[] = [];
  const z = -PAGE.depth / 2 + 0.04;
  for (let x = -PAGE.width / 2 + 0.2; x <= PAGE.width / 2 - 0.2; x += RING_PITCH) {
    for (let i = 0; i < RING_STEPS; i++) {
      const a = (i / RING_STEPS) * Math.PI * 2;
      const b = ((i + 1) / RING_STEPS) * Math.PI * 2;
      out.push(x, PAGE_HEIGHT + RING_RADIUS * Math.sin(a), z + RING_RADIUS * Math.cos(a));
      out.push(x, PAGE_HEIGHT + RING_RADIUS * Math.sin(b), z + RING_RADIUS * Math.cos(b));
    }
  }
  return out;
}

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
    const binding = fatLines(bindingRings(), { linewidth: 1.5 });

    const group = new Group();
    group.add(cover, block, page, dots, edges, binding);
    group.renderOrder = LAYER.page;
    return { group, cover, block, page, dots, edges, binding };
  }, []);

  useEffect(() => {
    const { cover, block, page, dots, edges, binding } = parts;
    const pageColor = new Color(palette.page);
    page.material.color.copy(pageColor);
    // Page edges read slightly darker than the top sheet; the cover is a deep accent board.
    block.material.color.copy(pageColor).lerp(new Color(palette.rule), 0.45);
    cover.material.color.set(palette.accent).lerp(new Color(palette.bg), 0.72);
    dots.material.color.set(palette.dim);
    edges.material.color.set(palette.rule);
    binding.material.color.set(palette.dim);
  }, [parts, palette]);

  useEffect(
    () => () => {
      const { cover, block, page, dots, edges, binding } = parts;
      for (const obj of [cover, block, page, dots, edges, binding]) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    },
    [parts],
  );

  return <primitive object={parts.group} />;
}
