/**
 * Camera path for the hero loop, as keyframes on the loop clock. Each segment
 * eases with smoothstep, and the last keyframe equals the first, so the loop
 * has no seam.
 */
import { smoothstep } from "@/lib/math";

import { BEATS, TOTAL_DURATION, loopTime, type BeatId } from "./beats";
import { DESK, PAGE_HEIGHT, PIVOT } from "./desk-layout";
import { FACTORY_CENTRE, MONITOR, toWorld } from "./factory";
import { SHRINK_START, SHRINK_TIME, missionDistance, missionPose } from "./mission";

export type Vec3 = [number, number, number];

export interface CameraPose {
  position: Vec3;
  target: Vec3;
}

/** A keyframe pose: fixed, or following something that moves (evaluated at the loop time). */
type PoseAt = CameraPose | ((t: number) => CameraPose);

/**
 * Chase camera on the hero AGV: behind, to the left and above it, fixed in
 * world orientation (it does not swing with the robot on the loop's turns).
 */
function chaseHero(t: number): CameraPose {
  const { x, y } = missionPose(missionDistance(t));
  const [ax, , az] = toWorld(x, y);
  return { position: [ax - 4.6, 3.4, az + 5.2], target: [ax + 1.2, 0.4, az - 0.4] };
}

/** The factory floor's centre in world space, and a pose offset from it. */
const centre = toWorld(FACTORY_CENTRE.x, FACTORY_CENTRE.y);
const aroundCentre = (dx: number, y: number, dz: number): CameraPose => ({
  position: [centre[0] + dx, y, centre[2] + dz],
  target: centre,
});

/**
 * Distance from the screen for the close-up: the screen spans about half the
 * hero width, so it sits clear of the headline on desktop and fits the width
 * on phones.
 */
const SCREEN_DISTANCE = MONITOR.width * 1.7;
const screen = toWorld(MONITOR.x, MONITOR.y, DESK.height + MONITOR.height);
const h = PAGE_HEIGHT;

const POSES = {
  // Desk-top poses sit above the page, which is raised on the desk.
  page: { position: [0, h + 4.4, 2.8], target: [0, h, 0.15] },
  design: { position: [2.6, h + 2.4, 2.9], target: [0, h + 0.35, 0] },
  // Pulled back so the booting AGV and the monitor's terminal share the frame.
  code: { position: [1.6, h + 2.6, 7.2], target: [0, h + 1.4, -1.2] },
  // Behind the AGV parked at the desk's edge, then low behind it on the floor
  // once the desk has shrunk away, looking on towards the factory.
  deskEdge: { position: [PIVOT.x - 3.6, DESK.height + 2.4, 3.4], target: [PIVOT.x + 1.2, DESK.height + 0.2, 0] },
  floorLevel: { position: [PIVOT.x - 3.2, 1.5, 2.6], target: [PIVOT.x + 3, 0.5, -0.2] },
  system: aroundCentre(0, 17, 6),
  monitor: { position: [screen[0], screen[1], screen[2] + SCREEN_DISTANCE], target: screen },
} satisfies Record<string, CameraPose>;

const start = (id: BeatId) => BEATS.find((b) => b.id === id)!.start;
const end = (id: BeatId) => BEATS.find((b) => b.id === id)!.end;

/** Share of the return beat spent pulling back to the notebook; the page turns after it. */
export const PAGE_LANDING = 0.6;

/** When the camera leaves the fleet overview for the monitor, and arrives. */
export const FLY_IN_START = start("system") + 2.4;
const FLY_IN_END = start("system") + 5.6;

export const CAMERA_KEYFRAMES: readonly { t: number; pose: PoseAt }[] = [
  { t: 0, pose: POSES.page },
  { t: end("sketch"), pose: POSES.page },
  { t: end("design"), pose: POSES.design },
  // Settle on the terminal early, so every line types in frame.
  { t: start("code") + 1.5, pose: POSES.code },
  { t: end("code"), pose: POSES.code },
  { t: SHRINK_START, pose: POSES.deskEdge },
  { t: SHRINK_START + SHRINK_TIME, pose: POSES.floorLevel },
  // Follow the AGV the story started with as it drives into the factory.
  { t: SHRINK_START + SHRINK_TIME + 1.6, pose: chaseHero },
  { t: end("deploy"), pose: chaseHero },
  { t: FLY_IN_START, pose: POSES.system },
  { t: FLY_IN_END, pose: POSES.monitor },
  { t: end("system"), pose: POSES.monitor },
  { t: start("return") + PAGE_LANDING * (end("return") - start("return")), pose: POSES.page },
  { t: TOTAL_DURATION, pose: POSES.page },
];

function lerp3(a: Vec3, b: Vec3, k: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

/** Camera pose at loop time `t`. */
export function cameraAt(t: number): CameraPose {
  const lt = loopTime(t);
  const at = (pose: PoseAt) => (typeof pose === "function" ? pose(lt) : pose);
  const i = CAMERA_KEYFRAMES.findIndex((k) => k.t > lt);
  if (i <= 0) return at(CAMERA_KEYFRAMES[0].pose);
  const a = at(CAMERA_KEYFRAMES[i - 1].pose);
  const b = at(CAMERA_KEYFRAMES[i].pose);
  const k = smoothstep((lt - CAMERA_KEYFRAMES[i - 1].t) / (CAMERA_KEYFRAMES[i].t - CAMERA_KEYFRAMES[i - 1].t));
  return {
    position: lerp3(a.position, b.position, k),
    target: lerp3(a.target, b.target, k),
  };
}
