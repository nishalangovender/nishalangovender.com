/**
 * The production dashboard shown on the factory monitor: the screen a
 * production manager watches. Stats and minimap maths are pure; the static
 * screen (title, map, cards) goes to a 2D canvas that the monitor uses as a
 * texture, redrawn only when a value changes. The robots move over it as
 * meshes, so they glide every frame without re-uploading the texture.
 */
import type { Pose } from "@/lib/path-following/types";

import { FLOOR, OBSTACLES } from "./factory";
import { FLEET_SIZE } from "./Fleet";
import { LOOP, MISSION_SPEED, missionDistance } from "./mission";

/** Layout size in canvas units (16:10, matching the monitor screen). */
export const DASH_W = 1024;
export const DASH_H = 640;
/** The canvas is drawn at twice the layout size so text stays sharp up close. */
export const DASH_SCALE = 2;

/**
 * A monitor is dark in both site themes, so the dashboard always draws in
 * the nish-os dark TTY values, on a near-black screen.
 */
export const SCREEN = {
  bg: "#020203",
  surface: "#0b0c0f",
  rule: "#2a2e36",
  fg: "#eef4f9",
  dim: "#8598ab",
  accent: "#33e1ff",
  ok: "#2ee6a8",
  warn: "#ffb339",
} as const;

const TITLE_H = 64;
const PAD = 24;
const MAP = { x: PAD, y: TITLE_H + PAD, w: 600 - PAD, h: DASH_H - TITLE_H - 2 * PAD };
const SIDE = { x: 624, y: TITLE_H + PAD, w: DASH_W - 624 - PAD };
const CARD_H = 92;
const CARD_GAP = 12;

/** Picks logged before the loop starts, so the counter reads like a shift in progress. */
const PICKS_BASE = 846;
/** Metres driven per pick. */
const METRES_PER_PICK = 1.5;

export interface DashboardStat {
  label: string;
  value: string;
  tone: "fg" | "ok" | "warn";
}

/** The sidebar cards at loop time `t`. */
export function dashboardStats(t: number): DashboardStat[] {
  const driven = missionDistance(t);
  const moving = driven > 0;
  return [
    { label: "Active Robots", value: `${FLEET_SIZE}/${FLEET_SIZE}`, tone: "ok" },
    { label: "Picks", value: String(PICKS_BASE + Math.floor(driven / METRES_PER_PICK)), tone: "fg" },
    { label: "Uptime", value: "99.999%", tone: "fg" },
    { label: "Avg Speed", value: `${(moving ? MISSION_SPEED : 0).toFixed(1)} m/s`, tone: "fg" },
    { label: "Alerts", value: "0", tone: "ok" },
  ];
}

/** Everything the static screen shows at `t`: redraw the canvas only when this changes. */
export function dashboardKey(t: number): string {
  return dashboardStats(t)
    .map((s) => s.value)
    .join("|");
}

/** Map-frame point → minimap pixel, keeping the floor's aspect ratio. */
export function toMinimap(x: number, y: number): [number, number] {
  const fw = FLOOR.maxX - FLOOR.minX;
  const fh = FLOOR.maxY - FLOOR.minY;
  const s = Math.min(MAP.w / fw, MAP.h / fh);
  const ox = MAP.x + (MAP.w - fw * s) / 2;
  const oy = MAP.y + (MAP.h - fh * s) / 2;
  return [ox + (x - FLOOR.minX) * s, oy + (FLOOR.maxY - y) * s];
}

/**
 * Minimap pixel → monitor screen-local position (screen centre at the
 * origin, y up), for a screen `width` × `height` in world units.
 */
export function minimapToScreen(px: number, py: number, width: number, height: number): [number, number] {
  return [(px / DASH_W - 0.5) * width, (0.5 - py / DASH_H) * height];
}

/** Where robot `r` shows on the minimap, or null while it is still crossing the desk. */
export function robotMarker(r: Pose): [number, number] | null {
  return r.x < FLOOR.minX ? null : toMinimap(r.x, r.y);
}

/** Robot marker sizes in canvas units: dot radius, heading tick length, hero ring radius. */
export const MARKER = { dot: 9, tick: 20, ring: 17 } as const;

/** Draws the static dashboard at loop time `t`: title bar, floor map and stat cards. */
export function drawDashboard(ctx: CanvasRenderingContext2D, t: number, font: string) {
  const p = SCREEN;
  ctx.setTransform(DASH_SCALE, 0, 0, DASH_SCALE, 0, 0);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, DASH_W, DASH_H);

  // Title bar
  ctx.fillStyle = p.surface;
  ctx.fillRect(0, 0, DASH_W, TITLE_H);
  ctx.textBaseline = "middle";
  ctx.font = `700 30px ${font}`;
  ctx.fillStyle = p.fg;
  ctx.fillText("Fleet Overview", PAD, TITLE_H / 2);
  ctx.textAlign = "right";
  ctx.font = `600 24px ${font}`;
  ctx.fillStyle = p.ok;
  ctx.fillText("● Live", DASH_W - PAD, TITLE_H / 2);
  ctx.textAlign = "left";

  // Minimap: floor, obstacles, mission loop, robots
  const [fx0, fy0] = toMinimap(FLOOR.minX, FLOOR.maxY);
  const [fx1, fy1] = toMinimap(FLOOR.maxX, FLOOR.minY);
  ctx.strokeStyle = p.rule;
  ctx.lineWidth = 3;
  ctx.strokeRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
  ctx.fillStyle = p.rule;
  for (const o of OBSTACLES) {
    const [x0, y0] = toMinimap(o.x - o.w / 2, o.y + o.d / 2);
    const [x1, y1] = toMinimap(o.x + o.w / 2, o.y - o.d / 2);
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  ctx.strokeStyle = p.dim;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  LOOP.forEach((m, i) => {
    const [x, y] = toMinimap(m.x, m.y);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // Sidebar stat cards
  dashboardStats(t).forEach((stat, i) => {
    const y = SIDE.y + i * (CARD_H + CARD_GAP);
    ctx.fillStyle = p.surface;
    ctx.fillRect(SIDE.x, y, SIDE.w, CARD_H);
    ctx.strokeStyle = p.rule;
    ctx.lineWidth = 2;
    ctx.strokeRect(SIDE.x, y, SIDE.w, CARD_H);
    ctx.font = `600 22px ${font}`;
    ctx.fillStyle = p.dim;
    ctx.fillText(stat.label, SIDE.x + 18, y + 28);
    ctx.font = `700 42px ${font}`;
    ctx.fillStyle = stat.tone === "fg" ? p.fg : p[stat.tone];
    ctx.fillText(stat.value, SIDE.x + 18, y + 64);
  });
}
