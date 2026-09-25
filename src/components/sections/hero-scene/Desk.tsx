"use client";

import { useEffect, useMemo } from "react";
import { BoxGeometry, Color, Group, Matrix4, Mesh, MeshBasicMaterial } from "three";

import { DESK, RAMP } from "./desk-layout";
import { toWorld } from "./factory";
import { LAYER, edgeSegments, fatLines } from "./lines";
import { useScenePalette } from "./scene-context";

const at = (x: number, y: number, z: number) => new Matrix4().makeTranslation(x, y, z);

const LEG = 0.22;
const RAMP_THICKNESS = 0.08;

/** The desk slab and its legs, plus the ramp down to the factory floor. */
export function Desk() {
  const palette = useScenePalette();

  const { group, top, ramp, edges } = useMemo(() => {
    const w = DESK.maxX - DESK.minX;
    const d = DESK.maxY - DESK.minY;
    const [cx, , cz] = toWorld((DESK.minX + DESK.maxX) / 2, (DESK.minY + DESK.maxY) / 2);
    const topY = DESK.height - DESK.thickness / 2;

    const top = new Mesh(new BoxGeometry(w, DESK.thickness, d), new MeshBasicMaterial());
    top.position.set(cx, topY, cz);

    // Ramp: a thin slab tilted down from the desk edge to the floor.
    const run = RAMP.toX - RAMP.fromX;
    const length = Math.hypot(run, DESK.height);
    const ramp = new Mesh(new BoxGeometry(length, RAMP_THICKNESS, RAMP.width), new MeshBasicMaterial());
    ramp.position.set((RAMP.fromX + RAMP.toX) / 2, DESK.height / 2 - RAMP_THICKNESS / 2, 0);
    ramp.rotation.z = -Math.atan2(DESK.height, run);

    const legH = DESK.height - DESK.thickness;
    const legs = [
      [DESK.minX + LEG, DESK.minY + LEG],
      [DESK.maxX - LEG, DESK.minY + LEG],
      [DESK.minX + LEG, DESK.maxY - LEG],
      [DESK.maxX - LEG, DESK.maxY - LEG],
    ].flatMap(([x, y]) => {
      const [lx, , lz] = toWorld(x, y);
      return edgeSegments(new BoxGeometry(LEG, legH, LEG), at(lx, legH / 2, lz));
    });
    const slabEdges = edgeSegments(new BoxGeometry(w, DESK.thickness, d), at(cx, topY, cz));
    const edges = fatLines([...slabEdges, ...legs], { linewidth: 1.5 });

    const group = new Group();
    group.add(top, ramp, edges);
    group.renderOrder = LAYER.page;
    return { group, top, ramp, edges };
  }, []);

  useEffect(() => {
    // The desk sits one step brighter than the page background; the ramp a step more.
    const surface = new Color(palette.surface);
    top.material.color.copy(surface);
    ramp.material.color.copy(surface).lerp(new Color(palette.rule), 0.5);
    edges.material.color.set(palette.rule);
  }, [top, ramp, edges, palette]);

  useEffect(
    () => () => {
      for (const mesh of [top, ramp]) {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
      edges.geometry.dispose();
      edges.material.dispose();
    },
    [top, ramp, edges],
  );

  return <primitive object={group} />;
}
