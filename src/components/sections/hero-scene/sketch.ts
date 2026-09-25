/**
 * World geometry for the hero, in metres. The page lies on y = 0 with x to the
 * right and z towards the viewer; ROS's y axis is therefore −z here.
 *
 * The kinematic sketch is authored in the ROS map frame (x right, y up the
 * page) and flattened onto the page as [x, z = −y]. `HeroStatic` draws the
 * same strokes and labels as SVG, so the static frame and the ink match.
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

/** base_link: the drive-axle centre the body axes, velocity and AGV hang off. */
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
  castorRadius: 0.07,
  castorWidth: 0.05,
  lidarRadius: 0.1,
} as const;

/** Heading the robot is sketched at; the AGV turns to 0 once it boots. */
export const SKETCH_HEADING = (25 * Math.PI) / 180;

/** Underside of the AGV body above its contact patch. */
export const AGV_BODY_Y = AGV.wheelRadius + 0.04;
/** Lidar puck: distance ahead of base_link and height of its scan plane. */
export const AGV_LIDAR_OFFSET = AGV.offset + AGV.length / 2 - 0.2;
export const LIDAR_HEIGHT = AGV_BODY_Y + AGV.height + 0.05;

type P = [number, number];
/** Flat segment list on the page: [x1, z1, x2, z2] per segment. */
export type Segments = number[];

/** Ink colour per stroke: pencil ink, RViz body axes, and motion vectors. */
export type SketchRole = "ink" | "axisX" | "axisY" | "motion";

/** One pen stroke in the map frame (x, y up the page). */
interface Stroke {
  role: SketchRole;
  points: P[];
  dashed?: boolean;
  /** Part of the robot's outline, which lifts off into the wireframe. */
  body?: boolean;
}

const B: P = [BASE_LINK.x, -BASE_LINK.z];
const ORIGIN: P = [-1.75, -1.25];

const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const polar = (r: number, a: number): P => [r * Math.cos(a), r * Math.sin(a)];
/** Point in the robot's body frame (forward, left) at the sketched heading. */
const body = (fwd: number, left: number): P =>
  add(B, add(polar(fwd, SKETCH_HEADING), polar(left, SKETCH_HEADING + Math.PI / 2)));

function arc(c: P, r: number, from: number, to: number, steps: number): P[] {
  return Array.from({ length: steps + 1 }, (_, i) => add(c, polar(r, from + ((to - from) * i) / steps)));
}

/** Arrowhead at `to`, pointing away from `from`. */
function arrowHead(role: SketchRole, from: P, to: P, size = 0.09): Stroke {
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
  return { role, points: [add(to, polar(size, a + Math.PI * 0.85)), to, add(to, polar(size, a - Math.PI * 0.85))] };
}

/** Shaft plus arrowhead from `from` to `to`. */
function arrow(role: SketchRole, from: P, to: P): Stroke[] {
  return [{ role, points: [from, to] }, arrowHead(role, from, to)];
}

/** Rectangle in the body frame: centre `fwd` ahead, `len` long, `wid` wide. */
function bodyRect(fwd: number, left: number, len: number, wid: number): P[] {
  return [
    body(fwd - len / 2, left - wid / 2),
    body(fwd + len / 2, left - wid / 2),
    body(fwd + len / 2, left + wid / 2),
    body(fwd - len / 2, left + wid / 2),
    body(fwd - len / 2, left - wid / 2),
  ];
}

const refAngle = Math.atan2(B[1] - ORIGIN[1], B[0] - ORIGIN[0]);
const OMEGA_CENTRE = body(-0.55, 0.95);

/** Pen strokes in drawing order, as in the notebook original. */
export const SKETCH_STROKES: readonly Stroke[] = [
  // World frame
  ...arrow("ink", ORIGIN, [ORIGIN[0], 1.3]),
  ...arrow("ink", ORIGIN, [1.85, ORIGIN[1]]),
  // Robot: chassis, drive wheels, castor wheel
  { role: "ink", body: true, points: bodyRect(AGV.offset, 0, AGV.length, AGV.width) },
  { role: "ink", body: true, points: bodyRect(0, -AGV.track / 2, AGV.wheelRadius * 2, AGV.wheelWidth) },
  { role: "ink", body: true, points: bodyRect(0, AGV.track / 2, AGV.wheelRadius * 2, AGV.wheelWidth) },
  { role: "ink", body: true, points: bodyRect(AGV.castorX, 0, AGV.castorRadius * 2, AGV.castorWidth) },
  // θ: dashed reference from the origin to base_link, and its angle
  { role: "ink", points: [ORIGIN, add(ORIGIN, polar(0.75, refAngle)), add(ORIGIN, polar(1.5, refAngle)), B], dashed: true },
  { role: "ink", points: arc(ORIGIN, 0.42, 0, refAngle, 8) },
  // Body frame
  ...arrow("axisX", B, body(0.62, 0)),
  ...arrow("axisY", B, body(0, 0.5)),
  // Motion: velocity along the heading, ω about the body
  ...arrow("motion", body(0.62, 0), body(1.2, 0)),
  { role: "motion", points: arc(OMEGA_CENTRE, 0.18, -Math.PI * 0.2, Math.PI * 1.45, 14) },
  arrowHead("motion", add(OMEGA_CENTRE, polar(0.18, Math.PI * 1.35)), add(OMEGA_CENTRE, polar(0.18, Math.PI * 1.45)), 0.07),
];

function toSegments(stroke: Stroke): Segments {
  const out: Segments = [];
  for (let i = 0; i < stroke.points.length - 1; i++) {
    if (stroke.dashed && i % 2 === 1) continue;
    const [ax, ay] = stroke.points[i];
    const [bx, by] = stroke.points[i + 1];
    out.push(ax, -ay, bx, -by);
  }
  return out;
}

/** All strokes flattened onto the page, in drawing order. */
export const SKETCH_SEGMENTS: Segments = SKETCH_STROKES.flatMap(toSegments);

/** Cumulative segment count at the end of each stroke. */
const STROKE_ENDS: number[] = SKETCH_STROKES.reduce<number[]>((acc, s) => {
  acc.push((acc.at(-1) ?? 0) + toSegments(s).length / 4);
  return acc;
}, []);

/**
 * Segments inked once `f` (0–1) of the drawing is done. Every stroke gets the
 * same share of time, so a many-segment arc takes no longer than a straight line.
 */
export function segmentsDrawn(f: number): number {
  const k = Math.min(Math.max(f, 0), 1) * STROKE_ENDS.length;
  const i = Math.min(Math.floor(k), STROKE_ENDS.length - 1);
  const start = i === 0 ? 0 : STROKE_ENDS[i - 1];
  return k >= STROKE_ENDS.length ? STROKE_ENDS[i] : Math.round(start + (STROKE_ENDS[i] - start) * (k - i));
}

/** Whether each segment in `SKETCH_SEGMENTS` is robot outline (lifts) or annotation (stays on the page). */
export const SKETCH_BODY: readonly boolean[] = SKETCH_STROKES.flatMap((s) =>
  Array<boolean>(toSegments(s).length / 4).fill(Boolean(s.body)),
);

/** How many of the first `n` drawn segments belong to the robot outline. */
export function bodySegmentsIn(n: number): number {
  let count = 0;
  for (let i = 0; i < Math.min(n, SKETCH_BODY.length); i++) if (SKETCH_BODY[i]) count++;
  return count;
}

/** Role of each segment in `SKETCH_SEGMENTS`, for colouring. */
export const SKETCH_ROLES: readonly SketchRole[] = SKETCH_STROKES.flatMap((s) =>
  Array<SketchRole>(toSegments(s).length / 4).fill(s.role),
);

export interface SketchLabel {
  text: string;
  role: SketchRole;
  /** Page position (x, z). */
  x: number;
  z: number;
}

const label = (text: string, role: SketchRole, p: P): SketchLabel => ({ text, role, x: p[0], z: -p[1] });

/** Symbols written in once the strokes are done. */
export const SKETCH_LABELS: readonly SketchLabel[] = [
  label("Y", "ink", [ORIGIN[0] - 0.12, 1.3]),
  label("X", "ink", [1.95, ORIGIN[1]]),
  label("θ", "ink", add(ORIGIN, polar(0.58, refAngle / 2))),
  label("x", "axisX", body(0.62, 0.14)),
  label("y", "axisY", body(-0.14, 0.5)),
  label("V", "motion", body(1.3, 0.12)),
  label("ω", "motion", add(OMEGA_CENTRE, [0, 0.3])),
];
