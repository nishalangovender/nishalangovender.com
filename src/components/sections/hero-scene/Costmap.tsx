"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { DataTexture, LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, RGBAFormat } from "three";

import { FLOOR, costAt, toWorld } from "./factory";
import { factoryReveal } from "./FactoryFloor";
import { LAYER } from "./lines";
import { cloudMorph } from "./PointCloud";
import { useScene, useScenePalette } from "./scene-context";

/** Costmap cell size, metres. */
const RESOLUTION = 0.1;
const PEAK_OPACITY = 0.45;

/** Inflation layer as an alpha texture: amber wherever cost is above zero. */
function costTexture(): DataTexture {
  const w = Math.round((FLOOR.maxX - FLOOR.minX) / RESOLUTION);
  const h = Math.round((FLOOR.maxY - FLOOR.minY) / RESOLUTION);
  const data = new Uint8Array(w * h * 4);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const x = FLOOR.minX + (i + 0.5) * RESOLUTION;
      const y = FLOOR.minY + (j + 0.5) * RESOLUTION;
      const v = Math.round(costAt(x, y) * 255);
      data.set([v, v, v, 255], (j * w + i) * 4);
    }
  }
  const tex = new DataTexture(data, w, h, RGBAFormat);
  tex.magFilter = LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/** Nav2-style amber inflation around every rack, pillar and wall. */
export function Costmap() {
  const sceneRef = useScene();
  const palette = useScenePalette();

  const mesh = useMemo(() => {
    const mesh = new Mesh(
      new PlaneGeometry(FLOOR.maxX - FLOOR.minX, FLOOR.maxY - FLOOR.minY),
      new MeshBasicMaterial({ alphaMap: costTexture(), transparent: true, depthWrite: false, toneMapped: false }),
    );
    // Texture rows run along +y (map) = −z (world): lay the plane flat, facing up.
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = LAYER.costmap;
    mesh.position.set(...toWorld((FLOOR.minX + FLOOR.maxX) / 2, (FLOOR.minY + FLOOR.maxY) / 2, 0.004));
    return mesh;
  }, []);

  useEffect(() => {
    mesh.material.color.set(palette.warn);
  }, [mesh, palette]);

  useEffect(
    () => () => {
      mesh.geometry.dispose();
      mesh.material.alphaMap?.dispose();
      mesh.material.dispose();
    },
    [mesh],
  );

  useFrame(() => {
    const k = cloudMorph(sceneRef.current.t);
    mesh.visible = k > 0;
    // Fainter once the solid factory stands: an overlay, not the floor.
    mesh.material.opacity = PEAK_OPACITY * k * (1 - 0.5 * factoryReveal(sceneRef.current.t));
  });

  return <primitive object={mesh} />;
}
