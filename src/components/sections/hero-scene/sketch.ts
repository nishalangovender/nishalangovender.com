/**
 * World geometry for the hero, in metres. The page lies on y = 0 with x to the
 * right and z towards the viewer; ROS's y axis is therefore −z here.
 *
 * The kinematic sketch matches `HeroStatic` at 100 px per metre, with the
 * page centre at SVG (220, 170).
 */

export const PAGE = { width: 4.2, depth: 3.2 } as const;

/** Dot pitch on the page, in metres. */
const DOT_PITCH = 0.1;

/** Page dot-grid positions as flat [x, y, z], row by row, just above y = 0. */
export function pageDots(): number[] {
  const cols = Math.round(PAGE.width / DOT_PITCH) - 1;
  const rows = Math.round(PAGE.depth / DOT_PITCH) - 1;
  const out: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push(-PAGE.width / 2 + (c + 1) * DOT_PITCH, 0.001, -PAGE.depth / 2 + (r + 1) * DOT_PITCH);
    }
  }
  return out;
}

/** base_link: the drive-axle centre the TF axes and turning arc hang off. */
export const BASE_LINK = { x: -0.13, z: 0 } as const;

/** Chassis footprint relative to base_link, and wheel/castor placement. */
export const AGV = {
  length: 1.4,
  width: 1.0,
  height: 0.32,
  /** Chassis centre ahead of base_link. */
  offset: 0.23,
  wheelRadius: 0.22,
  wheelWidth: 0.14,
  /** Wheel centres at ±track/2 across. */
  track: 1.18,
  castorX: 0.75,
  lidarRadius: 0.1,
} as const;

type P = [number, number];
/** Flat segment list: [x1, z1, x2, z2] per segment. */
export type Segments = number[];

function polyline(points: P[], closed = false): Segments {
  const out: Segments = [];
  const n = closed ? points.length : points.length - 1;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    out.push(a[0], a[1], b[0], b[1]);
  }
  return out;
}

function rect(cx: number, cz: number, w: number, d: number): Segments {
  const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
  return polyline([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], true);
}

function arc(cx: number, cz: number, r: number, from: number, to: number, steps: number): P[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps;
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  });
}

/** Keeps every other segment, so a polyline reads as a dashed pencil line. */
function dashed(segments: Segments): Segments {
  return segments.filter((_, i) => Math.floor(i / 4) % 2 === 0);
}

const bx = BASE_LINK.x;
const wheelZ = AGV.track / 2;

/** Ink strokes in drawing order: chassis, wheels, castor, turning arc, ICR line. */
export const SKETCH_SEGMENTS: Segments = [
  ...rect(bx + AGV.offset, 0, AGV.length, AGV.width),
  ...rect(bx, -wheelZ, AGV.wheelRadius * 2, AGV.wheelWidth),
  ...rect(bx, wheelZ, AGV.wheelRadius * 2, AGV.wheelWidth),
  ...polyline(arc(bx + AGV.castorX, 0, 0.07, 0, Math.PI * 2, 12), true),
  ...dashed(polyline(arc(bx, 0, 1, -Math.PI / 2, 0, 16))),
  ...dashed(polyline([[bx, -0.45], [bx, -0.67], [bx, -0.89], [bx, -1.1]])),
];

/** TF axes at base_link: x (red) forward, y (green) to the left. */
export const SKETCH_AXES: Segments = [bx, 0, bx + 0.5, 0, bx, 0, bx, -0.4];
