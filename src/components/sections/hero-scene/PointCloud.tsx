"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { BufferGeometry, Color, Float32BufferAttribute, Points, ShaderMaterial } from "three";

import { clamp01, smoothstep } from "@/lib/math";

import { beatAt, beatProgress } from "./beats";
import { factoryPoints, mulberry32 } from "./factory";
import { LAYER } from "./lines";
import { useScene, useScenePalette } from "./scene-context";
import { pageDots } from "./sketch";

/** Points per page dot: desktop stacks 12 (≈15k points), phones 6 (≈7.6k). */
const COPIES = { desktop: 12, mobile: 6 } as const;
/** Latest start of a point's morph, so the rise ripples instead of snapping. */
const MAX_DELAY = 0.35;

/** 0 = dot grid on the page, 1 = factory point cloud. */
export function cloudMorph(t: number): number {
  const id = beatAt(t).id;
  if (id === "deploy") return smoothstep(clamp01(beatProgress(t, "deploy") / 0.45));
  if (id === "system") return 1;
  if (id === "return") return 1 - smoothstep(clamp01(beatProgress(t, "return") / 0.7));
  return 0;
}

/**
 * Every page dot is `copies` stacked points; in the deploy beat they peel
 * apart and rise into a lidar map of the factory, then settle back.
 */
export function buildCloud(copies: number): { from: Float32Array; to: Float32Array; delay: Float32Array } {
  const dots = pageDots();
  const n = (dots.length / 3) * copies;
  const from = new Float32Array(n * 3);
  for (let c = 0; c < copies; c++) from.set(dots, c * dots.length);
  const rand = mulberry32(11);
  const delay = Float32Array.from({ length: n }, () => rand() * MAX_DELAY);
  return { from, to: factoryPoints(n), delay };
}

const vertexShader = /* glsl */ `
  attribute vec3 aTarget;
  attribute float aDelay;
  uniform float uMorph;
  uniform float uSize;
  varying float vK;
  varying float vH;
  void main() {
    float k = smoothstep(0.0, 1.0, clamp((uMorph - aDelay) / (1.0 - ${MAX_DELAY.toFixed(2)}), 0.0, 1.0));
    vec3 p = mix(position, aTarget, k);
    p.y += sin(k * 3.14159) * 0.6;
    vK = k;
    vH = aTarget.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uDot;
  uniform vec3 uLow;
  uniform vec3 uHigh;
  varying float vK;
  varying float vH;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    vec3 cloud = mix(uLow, uHigh, clamp(vH / 2.6, 0.0, 1.0));
    gl_FragColor = vec4(mix(uDot, cloud, vK), mix(0.55, 0.8, vK));
  }
`;

export function PointCloud() {
  const sceneRef = useScene();
  const palette = useScenePalette();
  const dpr = useThree((s) => s.viewport.dpr);

  const points = useMemo(() => {
    const mobile = window.innerWidth < 768;
    const { from, to, delay } = buildCloud(mobile ? COPIES.mobile : COPIES.desktop);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(from, 3));
    geometry.setAttribute("aTarget", new Float32BufferAttribute(to, 3));
    geometry.setAttribute("aDelay", new Float32BufferAttribute(delay, 1));
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMorph: { value: 0 },
        uSize: { value: 2 },
        uDot: { value: new Color() },
        uLow: { value: new Color() },
        uHigh: { value: new Color() },
      },
    });
    const points = new Points(geometry, material);
    // The morph moves points far from their page positions.
    points.frustumCulled = false;
    points.renderOrder = LAYER.cloud;
    return points;
  }, []);

  useEffect(() => {
    const u = points.material.uniforms;
    u.uDot.value.set(palette.dim);
    u.uLow.value.set(palette.accent);
    u.uHigh.value.set(palette.focus);
    u.uSize.value = 2 * dpr;
  }, [points, palette, dpr]);

  useEffect(
    () => () => {
      points.geometry.dispose();
      points.material.dispose();
    },
    [points],
  );

  useFrame(() => {
    points.material.uniforms.uMorph.value = cloudMorph(sceneRef.current.t);
  });

  return <primitive object={points} />;
}
