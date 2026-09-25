"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  CanvasTexture,
  Group,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";

import { DASH_H, DASH_SCALE, DASH_W, drawDashboard } from "./dashboard";
import { DESK } from "./desk-layout";
import { MONITOR, toWorld } from "./factory";
import { fleetPose, FLEET_SIZE } from "./Fleet";
import { LAYER } from "./lines";
import { useScene } from "./scene-context";

/** Dashboard redraw interval, seconds — a status screen, not an animation. */
const REDRAW_PERIOD = 0.25;

/** Wireframe bezel, stand and base in the monitor's local frame (screen centre at origin), scaled to its width. */
/** A black bezel on a dark metal stand and base, in the monitor's local frame (screen centre at origin). */
function monitorBody(): Group {
  const { width, screenHeight, height } = MONITOR;
  const u = width / 16; // one unit of bezel / stand thickness
  const standH = height - screenHeight / 2;
  const bezel = new MeshStandardMaterial({ color: "#0d0e10", roughness: 0.45, metalness: 0.2 });
  const metal = new MeshStandardMaterial({ color: "#2b2e33", roughness: 0.4, metalness: 0.7 });
  const body = new Group();
  const part = (geometry: BoxGeometry, material: MeshStandardMaterial, x: number, y: number, z: number) => {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    body.add(mesh);
  };
  // Bezel sits just behind the screen plane, so the screen reads as inset glass.
  part(new BoxGeometry(width + u, screenHeight + u, u / 2), bezel, 0, 0, -u / 4 - 0.005);
  part(new BoxGeometry(u, standH, u), metal, 0, -(height + screenHeight / 2) / 2, -u);
  part(new BoxGeometry(u * 6, u / 4, u * 3.5), metal, 0, -height + u / 8, -u);
  return body;
}

/**
 * The production monitor on the desk behind the notebook, showing the fleet
 * dashboard live. In beat 5 the camera flies into its screen; in the return
 * it pulls back across the desk to the notebook.
 */
export function Monitor() {
  const sceneRef = useScene();

  const { group, body, screen, texture, canvas } = useMemo(() => {
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
    const body = monitorBody();
    const group = new Group();
    group.add(body, screen);
    // Screen faces down the aisle (map −y = world +z).
    group.position.set(...toWorld(MONITOR.x, MONITOR.y, DESK.height + MONITOR.height));
    group.renderOrder = LAYER.agv;
    return { group, body, screen, texture, canvas };
  }, []);

  // Sharpest sampling the GPU offers, for the screen seen at an angle.
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  useEffect(() => {
    texture.anisotropy = maxAnisotropy;
    texture.needsUpdate = true;
  }, [texture, maxAnisotropy]);

  useEffect(
    () => () => {
      body.traverse((o) => {
        const mesh = o as Mesh;
        mesh.geometry?.dispose();
        (mesh.material as MeshStandardMaterial | undefined)?.dispose();
      });
      screen.geometry.dispose();
      screen.material.dispose();
      texture.dispose();
    },
    [body, screen, texture],
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
