"use client";

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

import { LAYER } from "./lines";
import { useScenePalette } from "./scene-context";
import { PAGE, pageDots } from "./sketch";

/**
 * The notebook on the desk: paper plus its dot grid. It stays put for the
 * whole loop — the AGV drives off it, and the camera comes back to it.
 */
export function Notebook() {
  const palette = useScenePalette();

  const { page, dots } = useMemo(() => {
    const page = new Mesh(new PlaneGeometry(PAGE.width, PAGE.depth), new MeshBasicMaterial());
    page.rotation.x = -Math.PI / 2;
    page.renderOrder = LAYER.page;
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(pageDots(), 3));
    const dots = new Points(
      geometry,
      new PointsMaterial({ size: 2, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    dots.renderOrder = LAYER.page;
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

  return (
    <>
      <primitive object={page} />
      <primitive object={dots} />
    </>
  );
}
