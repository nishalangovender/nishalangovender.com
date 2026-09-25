"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
} from "three";

import { smoothstep } from "@/lib/math";

import { beatProgress } from "./beats";
import { LAYER } from "./lines";
import { useScene, useScenePalette } from "./scene-context";
import { PAGE, pageDots } from "./sketch";

/** How visible the paper is: gone while the factory stands, back for the return. */
export function pageOpacity(t: number): number {
  const out = smoothstep(Math.min(1, beatProgress(t, "deploy") * 2.5));
  const back = smoothstep(beatProgress(t, "return"));
  return 1 - out + out * back;
}

/** The notebook page: paper plane plus its dot grid. */
export function Notebook() {
  const sceneRef = useScene();
  const palette = useScenePalette();

  const { page, dots } = useMemo(() => {
    const page = new Mesh(
      new PlaneGeometry(PAGE.width, PAGE.depth),
      new MeshBasicMaterial({ transparent: true, depthWrite: false }),
    );
    page.rotation.x = -Math.PI / 2;
    page.renderOrder = LAYER.page;
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(pageDots(), 3));
    const dots = new Points(
      geometry,
      new PointsMaterial({ size: 2, sizeAttenuation: false, transparent: true, depthWrite: false }),
    );
    dots.renderOrder = LAYER.dots;
    return { page, dots };
  }, []);

  useEffect(() => {
    page.material.color.set(palette.page);
    dots.material.color.set(palette.dim);
  }, [page, dots, palette]);

  useEffect(
    () => () => {
      page.geometry.dispose();
      page.material.dispose();
      dots.geometry.dispose();
      dots.material.dispose();
    },
    [page, dots],
  );

  useFrame(() => {
    const o = pageOpacity(sceneRef.current.t);
    page.material.opacity = o;
    dots.material.opacity = 0.55 * o;
  });

  return (
    <>
      <primitive object={page} />
      <primitive object={dots} />
    </>
  );
}
