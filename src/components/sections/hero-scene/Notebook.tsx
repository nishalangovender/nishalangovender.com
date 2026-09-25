"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Mesh, MeshBasicMaterial, PlaneGeometry } from "three";

import { smoothstep } from "@/lib/math";

import { beatProgress } from "./beats";
import { LAYER } from "./lines";
import { useScene, useScenePalette } from "./scene-context";
import { PAGE } from "./sketch";

/** How visible the paper is: gone while the factory stands, back for the return. */
export function pageOpacity(t: number): number {
  const out = smoothstep(Math.min(1, beatProgress(t, "deploy") * 2.5));
  const back = smoothstep(beatProgress(t, "return"));
  return 1 - out + out * back;
}

/** The notebook's paper. Its dot grid is the point cloud, drawn by `PointCloud`. */
export function Notebook() {
  const sceneRef = useScene();
  const palette = useScenePalette();

  const page = useMemo(() => {
    const page = new Mesh(
      new PlaneGeometry(PAGE.width, PAGE.depth),
      new MeshBasicMaterial({ transparent: true, depthWrite: false }),
    );
    page.rotation.x = -Math.PI / 2;
    page.renderOrder = LAYER.page;
    return page;
  }, []);

  useEffect(() => {
    page.material.color.set(palette.page);
  }, [page, palette]);

  useEffect(
    () => () => {
      page.geometry.dispose();
      page.material.dispose();
    },
    [page],
  );

  useFrame(() => {
    page.material.opacity = pageOpacity(sceneRef.current.t);
  });

  return <primitive object={page} />;
}
