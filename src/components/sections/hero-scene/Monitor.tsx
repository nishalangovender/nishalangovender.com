"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  CanvasTexture,
  Group,
  LinearMipmapLinearFilter,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";

import { DASH_H, DASH_SCALE, DASH_W, drawDashboard } from "./dashboard";
import { MONITOR, toWorld } from "./factory";
import { fleetPose, FLEET_SIZE } from "./Fleet";
import { LAYER, edgeSegments, fatLines } from "./lines";
import { useScene, useScenePalette } from "./scene-context";

/** Dashboard redraw interval, seconds — a status screen, not an animation. */
const REDRAW_PERIOD = 0.25;

const at = (x: number, y: number, z: number) => new Matrix4().makeTranslation(x, y, z);

/** Wireframe bezel, stand and base in the monitor's local frame (screen centre at origin), scaled to its width. */
function monitorEdges(): number[] {
  const { width, screenHeight, height } = MONITOR;
  const u = width / 16; // one unit of bezel / stand thickness
  const standH = height - screenHeight / 2;
  return [
    ...edgeSegments(new BoxGeometry(width + u, screenHeight + u, u / 2), at(0, 0, -u / 3)),
    ...edgeSegments(new BoxGeometry(u, standH, u), at(0, -(height + screenHeight / 2) / 2, -u)),
    ...edgeSegments(new BoxGeometry(u * 6, u / 4, u * 3.5), at(0, -height + u / 8, -u)),
  ];
}

/**
 * The production monitor on the desk behind the notebook, showing the fleet
 * dashboard live. In beat 5 the camera flies into its screen; in the return
 * it pulls back across the desk to the notebook.
 */
export function Monitor() {
  const sceneRef = useScene();
  const palette = useScenePalette();

  const { group, frame, screen, texture, canvas } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = DASH_W * DASH_SCALE;
    canvas.height = DASH_H * DASH_SCALE;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearMipmapLinearFilter;
    const screen = new Mesh(
      new PlaneGeometry(MONITOR.width, MONITOR.screenHeight),
      new MeshBasicMaterial({ map: texture }),
    );
    const frame = fatLines(monitorEdges(), { linewidth: 1.5 });
    const group = new Group();
    group.add(frame, screen);
    // Screen faces down the aisle (map −y = world +z).
    group.position.set(...toWorld(MONITOR.x, MONITOR.y, MONITOR.height));
    group.renderOrder = LAYER.agv;
    return { group, frame, screen, texture, canvas };
  }, []);

  useEffect(() => {
    frame.material.color.set(palette.accent);
  }, [frame, palette]);

  // Sharpest sampling the GPU offers, for the screen seen at an angle.
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  useEffect(() => {
    texture.anisotropy = maxAnisotropy;
    texture.needsUpdate = true;
  }, [texture, maxAnisotropy]);

  useEffect(
    () => () => {
      frame.geometry.dispose();
      frame.material.dispose();
      screen.geometry.dispose();
      screen.material.dispose();
      texture.dispose();
    },
    [frame, screen, texture],
  );

  useFrame(({ clock }, delta) => {
    const { t, agv } = sceneRef.current;
    if (clock.elapsedTime % REDRAW_PERIOD >= delta) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const robots = [agv, ...Array.from({ length: FLEET_SIZE - 1 }, (_, i) => fleetPose(t, i + 1))];
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains-mono").trim() || "monospace";
    drawDashboard(ctx, t, robots, font);
    texture.needsUpdate = true;
  });

  return <primitive object={group} />;
}
