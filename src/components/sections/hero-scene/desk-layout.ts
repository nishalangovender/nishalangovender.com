/**
 * The desk the story starts on, in the ROS map frame (x forward, y left,
 * metres; heights above the factory floor). The notebook lies on the desk,
 * the monitor stands behind it, and a ramp runs from the desk's right edge
 * down to the factory floor so the AGV can drive off the page and into the
 * factory.
 */
import { smoothstep } from "@/lib/math";

import { PAGE } from "./sketch";

/** Desk top footprint and height — wide enough for the open notebook spread. */
export const DESK = { minX: -7.2, maxX: 3.3, minY: -2.4, maxY: 3.9, height: 2.2, thickness: 0.16 } as const;

/** Notebook build-up on the desk: cover board, then the page block. */
export const NOTEBOOK = { cover: 0.05, pages: 0.14, coverMargin: 0.14 } as const;

/** Height of the top page — where the sketch is drawn and the AGV is parked. */
export const PAGE_HEIGHT = DESK.height + NOTEBOOK.cover + NOTEBOOK.pages;

/** Ramp from the desk's right edge down to the floor, centred on the mission lane (y = 0). */
export const RAMP = { fromX: DESK.maxX, toX: DESK.maxX + 3, width: 1.8 } as const;

/** Distance over which the AGV rolls off the page edge onto the desk. */
const STEP_OFF = 0.3;

/**
 * Surface height under the AGV at map point (x, y): the page, the desk, the
 * ramp or the factory floor. Only the mission lane (y = 0) leaves the desk.
 */
export function groundHeight(x: number, y: number): number {
  const onPage = Math.abs(y) <= PAGE.depth / 2;
  const pageEdge = PAGE.width / 2;
  if (onPage && x <= pageEdge) return PAGE_HEIGHT;
  if (onPage && x <= pageEdge + STEP_OFF) {
    return PAGE_HEIGHT - (PAGE_HEIGHT - DESK.height) * smoothstep((x - pageEdge) / STEP_OFF);
  }
  if (x <= RAMP.fromX) return DESK.height;
  if (x <= RAMP.toX && Math.abs(y) <= RAMP.width / 2) {
    return DESK.height * (1 - (x - RAMP.fromX) / (RAMP.toX - RAMP.fromX));
  }
  return 0;
}

/**
 * How far the AGV has materialised from wireframe into the solid robot at
 * map x: none on the desk, filling in down the ramp, solid on the floor.
 */
export function materialised(x: number): number {
  return smoothstep(Math.min(Math.max((x - RAMP.fromX) / (RAMP.toX - RAMP.fromX), 0), 1));
}

/** Distance over which the AGV tips onto and off the ramp. */
const TIP = 0.4;

/** Nose-down pitch of the AGV on the ramp, radians (0 on flat ground), eased at both ends. */
export function groundPitch(x: number, y: number): number {
  if (Math.abs(y) > RAMP.width / 2) return 0;
  const slope = Math.atan2(DESK.height, RAMP.toX - RAMP.fromX);
  const inFrom = smoothstep(Math.min(Math.max((x - RAMP.fromX + TIP / 2) / TIP, 0), 1));
  const outTo = 1 - smoothstep(Math.min(Math.max((x - RAMP.toX + TIP / 2) / TIP, 0), 1));
  return slope * Math.min(inFrom, outTo);
}
