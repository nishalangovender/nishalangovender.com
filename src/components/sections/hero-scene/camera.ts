/**
 * Camera path for the hero loop, as keyframes on the loop clock. Each segment
 * eases with smoothstep, and the last keyframe equals the first, so the loop
 * has no seam.
 */
import { smoothstep } from "@/lib/math";

import { BEATS, TOTAL_DURATION, loopTime, type BeatId } from "./beats";
import { DESK, PAGE_HEIGHT } from "./desk-layout";
import { FACTORY_CENTRE, MONITOR, toWorld } from "./factory";

export type Vec3 = [number, number, number];

export interface CameraPose {
  position: Vec3;
  target: Vec3;
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
  code: { position: [2.1, h + 2.0, 2.3], target: [0, h + 0.35, 0] },
  factory: aroundCentre(7.5, 8, 10.5),
  factoryTrack: aroundCentre(-6.5, 7.5, 10),
  system: aroundCentre(0, 17, 6),
  monitor: { position: [screen[0], screen[1], screen[2] + SCREEN_DISTANCE], target: screen },
} satisfies Record<string, CameraPose>;

const start = (id: BeatId) => BEATS.find((b) => b.id === id)!.start;
const end = (id: BeatId) => BEATS.find((b) => b.id === id)!.end;

/** Share of the return beat spent pulling back to the notebook; the page turns after it. */
export const PAGE_LANDING = 0.6;

/** When the camera leaves the fleet overview for the monitor, and arrives. */
export const FLY_IN_START = start("system") + 1.3;
const FLY_IN_END = start("system") + 3.6;

export const CAMERA_KEYFRAMES: readonly { t: number; pose: CameraPose }[] = [
  { t: 0, pose: POSES.page },
  { t: end("sketch"), pose: POSES.page },
  { t: end("design"), pose: POSES.design },
  { t: end("code"), pose: POSES.code },
  { t: start("deploy") + 2.4, pose: POSES.factory },
  { t: end("deploy"), pose: POSES.factoryTrack },
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
  const i = CAMERA_KEYFRAMES.findIndex((k) => k.t > lt);
  if (i <= 0) return CAMERA_KEYFRAMES[0].pose;
  const a = CAMERA_KEYFRAMES[i - 1];
  const b = CAMERA_KEYFRAMES[i];
  const k = smoothstep((lt - a.t) / (b.t - a.t));
  return {
    position: lerp3(a.pose.position, b.pose.position, k),
    target: lerp3(a.pose.target, b.pose.target, k),
  };
}
