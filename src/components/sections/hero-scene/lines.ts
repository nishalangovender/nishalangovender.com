import { Vector2 } from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

import type { Segments } from "./sketch";

/** Lifts flat [x, z] page segments into [x, y, z] positions at height `y`. */
export function toPositions(segments: Segments, y = 0.002): number[] {
  const out: number[] = [];
  for (let i = 0; i < segments.length; i += 2) out.push(segments[i], y, segments[i + 1]);
  return out;
}

/**
 * Screen-space fat lines (`linewidth` in CSS pixels). `instanceCount` on the
 * geometry sets how many segments draw, which is how ink strokes animate.
 */
export function fatLines(
  positions: number[],
  { linewidth = 2, colors }: { linewidth?: number; colors?: number[] } = {},
): LineSegments2 {
  const geometry = new LineSegmentsGeometry().setPositions(positions);
  if (colors) geometry.setColors(colors);
  const material = new LineMaterial({
    linewidth,
    transparent: true,
    vertexColors: Boolean(colors),
    depthWrite: false,
  });
  const line = new LineSegments2(geometry, material);
  // LineMaterial needs the viewport size to turn `linewidth` into pixels.
  const size = new Vector2();
  line.onBeforeRender = (renderer) => {
    material.resolution.copy(renderer.getSize(size));
  };
  return line;
}

/** Draw order for the transparent layers, bottom to top. */
export const LAYER = { page: 0, costmap: 1, cloud: 2, ink: 3, agv: 4, scan: 5 } as const;

/** Segment count of a fat-line geometry. */
export function segmentCount(line: LineSegments2): number {
  return (line.geometry.attributes.instanceStart as unknown as { count: number }).count;
}
