"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { BoxGeometry, CanvasTexture, Group, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";

import { DASH_H, DASH_W, drawDashboard } from "./dashboard";
import { MONITOR, toWorld } from "./factory";
import { fleetDistance, FLEET_SIZE } from "./Fleet";
import { LAYER, edgeSegments, fatLines } from "./lines";
import { missionPose } from "./mission";
import { cloudMorph } from "./PointCloud";
import { useScene, useScenePalette } from "./scene-context";

/** Dashboard redraw interval, seconds — a status screen, not an animation. */
const REDRAW_PERIOD = 0.25;

const at = (x: number, y: number, z: number) => new Matrix4().makeTranslation(x, y, z);

/** Wireframe bezel, stand and base, in the monitor's local frame (screen centre at origin). */
function monitorEdges(): number[] {
  const { width, screenHeight, height } = MONITOR;
  return [
    ...edgeSegments(new BoxGeometry(width + 0.1, screenHeight + 0.1, 0.06), at(0, 0, -0.04)),
    ...edgeSegments(new BoxGeometry(0.08, height - screenHeight / 2, 0.08), at(0, -(height + screenHeight / 2) / 2, -0.08)),
    ...edgeSegments(new BoxGeometry(0.6, 0.04, 0.4), at(0, -height + 0.02, -0.08)),
  ];
}

/**
 * Beat 5's destination: a monitor between the rack rows showing the fleet
 * dashboard live. Appears with the factory; the camera flies into its screen.
 */
export function Monitor() {
  const sceneRef = useScene();
  const palette = useScenePalette();

  const { group, frame, screen, texture, canvas } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = DASH_W;
    canvas.height = DASH_H;
    const texture = new CanvasTexture(canvas);
    const screen = new Mesh(
      new PlaneGeometry(MONITOR.width, MONITOR.screenHeight),
      new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
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
    const k = cloudMorph(t);
    group.visible = k > 0;
    if (!group.visible) return;
    frame.material.opacity = k;
    screen.material.opacity = k;

    if (clock.elapsedTime % REDRAW_PERIOD >= delta) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const robots = [agv, ...Array.from({ length: FLEET_SIZE - 1 }, (_, i) => missionPose(fleetDistance(t, i + 1)))];
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains-mono").trim() || "monospace";
    drawDashboard(ctx, t, robots, palette, font);
    texture.needsUpdate = true;
  });

  return <primitive object={group} />;
}
