"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Group,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  RingGeometry,
  SRGBColorSpace,
} from "three";

import {
  DASH_H,
  DASH_SCALE,
  DASH_W,
  MARKER,
  SCREEN,
  dashboardKey,
  drawDashboard,
  minimapToScreen,
  robotMarker,
} from "./dashboard";
import { DESK } from "./desk-layout";
import { MONITOR, toWorld } from "./factory";
import { fleetPose, FLEET_SIZE } from "./Fleet";
import { LAYER } from "./lines";
import { useScene } from "./scene-context";

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
 * Robot markers for the minimap, in canvas units centred on the screen: a
 * dot with a heading tick each, and a ring round the hero. Kept as meshes
 * over the screen so they move smoothly without redrawing the texture.
 */
function robotMarkers(): { layer: Object3D; robots: Object3D[]; dispose: () => void } {
  const ok = new MeshBasicMaterial({ color: SCREEN.ok });
  const accent = new MeshBasicMaterial({ color: SCREEN.accent });
  const dot = new CircleGeometry(MARKER.dot, 20);
  const tick = new PlaneGeometry(MARKER.tick, 3).translate(MARKER.tick / 2, 0, 0);
  const ring = new RingGeometry(MARKER.ring - 1.5, MARKER.ring + 1.5, 28);
  const robots = Array.from({ length: FLEET_SIZE }, (_, i) => {
    const robot = new Object3D();
    robot.add(new Mesh(dot, ok), new Mesh(tick, ok));
    if (i === 0) robot.add(new Mesh(ring, accent));
    return robot;
  });
  const layer = new Object3D();
  layer.add(...robots);
  // Canvas units → screen units, just in front of the glass.
  layer.scale.setScalar(MONITOR.width / DASH_W);
  layer.position.z = 0.003;
  const dispose = () => {
    for (const g of [dot, tick, ring]) g.dispose();
    ok.dispose();
    accent.dispose();
  };
  return { layer, robots, dispose };
}

/**
 * The production monitor on the desk behind the notebook, showing the fleet
 * dashboard live. In beat 5 the camera flies into its screen; in the return
 * it pulls back across the desk to the notebook.
 */
export function Monitor() {
  const sceneRef = useScene();

  const { group, body, screen, texture, canvas, markers } = useMemo(() => {
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
    const markers = robotMarkers();
    const group = new Group();
    group.add(body, screen, markers.layer);
    // Screen faces down the aisle (map −y = world +z).
    group.position.set(...toWorld(MONITOR.x, MONITOR.y, DESK.height + MONITOR.height));
    group.renderOrder = LAYER.agv;
    return { group, body, screen, texture, canvas, markers };
  }, []);

  // The static screen redraws only when a value on it changes (or the web font lands).
  const drawn = useRef("");
  useEffect(() => {
    void document.fonts?.ready.then(() => (drawn.current = ""));
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
      markers.dispose();
    },
    [body, screen, texture, markers],
  );

  useFrame(() => {
    const { t, agv } = sceneRef.current;
    const poses = [agv, ...Array.from({ length: FLEET_SIZE - 1 }, (_, i) => fleetPose(t, i + 1))];
    poses.forEach((pose, i) => {
      const marker = robotMarker(pose);
      const robot = markers.robots[i];
      robot.visible = marker !== null;
      if (!marker) return;
      robot.position.set(...minimapToScreen(marker[0], marker[1], DASH_W, DASH_H), 0);
      robot.rotation.z = pose.theta;
    });

    const key = dashboardKey(t);
    if (key === drawn.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains-mono").trim() || "monospace";
    drawDashboard(ctx, t, font);
    texture.needsUpdate = true;
    drawn.current = key;
  });

  return <primitive object={group} />;
}
