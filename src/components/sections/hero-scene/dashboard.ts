/**
 * The production dashboard shown on the factory monitor: the screen a
 * production manager watches. Stats and minimap maths are pure; drawing goes
 * to a 2D canvas that the monitor uses as a texture.
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
const SCREEN = {
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
    { label: "ACTIVE", value: `${FLEET_SIZE}/${FLEET_SIZE}`, tone: "ok" },
    { label: "PICKS", value: String(PICKS_BASE + Math.floor(driven / METRES_PER_PICK)), tone: "fg" },
    { label: "UPTIME", value: "99.4%", tone: "fg" },
    { label: "AVG SPD", value: `${(moving ? MISSION_SPEED : 0).toFixed(1)} m/s`, tone: "fg" },
    { label: "ALERTS", value: "0", tone: "ok" },
  ];
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

/** Draws the dashboard for the given robot poses (hero first). */
export function drawDashboard(ctx: CanvasRenderingContext2D, t: number, robots: Pose[], font: string) {
  const p = SCREEN;
  ctx.setTransform(DASH_SCALE, 0, 0, DASH_SCALE, 0, 0);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, DASH_W, DASH_H);

  // Title bar
  ctx.fillStyle = p.surface;
  ctx.fillRect(0, 0, DASH_W, TITLE_H);
  ctx.textBaseline = "middle";
  ctx.font = `700 32px ${font}`;
  ctx.fillStyle = p.accent;
  ctx.fillText("❯ nish_bot", PAD, TITLE_H / 2);
  ctx.fillStyle = p.dim;
  ctx.fillText("· fleet", PAD + 200, TITLE_H / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = p.ok;
  ctx.fillText("● LIVE", DASH_W - PAD, TITLE_H / 2);
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
  robots.forEach((r, i) => {
    // Still crossing the desk: not on the factory map yet.
    if (r.x < FLOOR.minX) return;
    const [x, y] = toMinimap(r.x, r.y);
    ctx.fillStyle = p.ok;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = p.ok;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 20 * Math.cos(r.theta), y - 20 * Math.sin(r.theta));
    ctx.stroke();
    if (i === 0) {
      // The hero AGV the story followed.
      ctx.strokeStyle = p.accent;
      ctx.beginPath();
      ctx.arc(x, y, 17, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

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
