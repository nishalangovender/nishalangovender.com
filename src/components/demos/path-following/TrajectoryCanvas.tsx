// src/components/demos/path-following/TrajectoryCanvas.tsx
"use client";

import { useEffect, useRef, useState } from "react";

import type { SimFrame } from "@/lib/path-following/types";

interface Props {
  frames: SimFrame[];
  reference: { x: number; y: number }[];
  layers: {
    reference: boolean;
    truth: boolean;
    estimate: boolean;
    gps: boolean;
    outliers: boolean;
  };
  reducedMotion: boolean;
  ariaLabel: string;
}

interface Viewport {
  zoom: number;
  panX: number;
  panY: number;
}

interface ThemeColors {
  background: string;
  foreground: string;
  accent: string;
  accentDark: string;
  muted: string;
}

const WORLD_SIZE = 14; // metres — viewport side
const DEFAULT_VIEWPORT: Viewport = { zoom: 1, panX: 0, panY: 0 };
const OUTLIER_RED = "#ef4444";

function readThemeColors(): ThemeColors {
  const s = getComputedStyle(document.documentElement);
  const get = (name: string) => s.getPropertyValue(name).trim();
  return {
    background: get("--background") || "#FAFAFA",
    foreground: get("--foreground") || "#1A1A1A",
    accent: get("--accent") || "#0066FF",
    accentDark: get("--accent-dark") || "#0047B3",
    muted: get("--muted") || "#6B6B6B",
  };
}

export function TrajectoryCanvas({
  frames,
  reference,
  layers,
  reducedMotion,
  ariaLabel,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);
  const [themeVersion, setThemeVersion] = useState(0);

  // Re-read theme colours when <html data-theme> toggles
  useEffect(() => {
    const obs = new MutationObserver(() => setThemeVersion((v) => v + 1));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    // Also watch system preference changes for the fallback case
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setThemeVersion((v) => v + 1);
    mq.addEventListener("change", handler);
    return () => {
      obs.disconnect();
      mq.removeEventListener("change", handler);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const colors = readThemeColors();
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const baseScale = Math.min(w, h) / WORLD_SIZE;
      const scale = baseScale * viewport.zoom;
      const cx = w / 2 + viewport.panX;
      const cy = h / 2 + viewport.panY;

      const worldToScreen = (x: number, y: number): [number, number] => [
        cx + x * scale,
        cy - y * scale,
      ];

      // Transparent canvas — the site's blueprint-grid wrapper shows through.
      ctx.clearRect(0, 0, w, h);

      // Reference
      if (layers.reference && reference.length) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        const [x0, y0] = worldToScreen(reference[0].x, reference[0].y);
        ctx.moveTo(x0, y0);
        for (let i = 1; i < reference.length; i++) {
          const [x, y] = worldToScreen(reference[i].x, reference[i].y);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (!frames.length) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // Truth trail — foreground colour (black in light mode, white in dark)
      if (layers.truth) {
        drawTrail(
          ctx,
          frames.map((f) => f.truth),
          worldToScreen,
          colors.foreground,
          2,
          reducedMotion,
        );
      }

      // Estimate trail — accent-dark (lighter/muted variant of accent)
      if (layers.estimate) {
        drawTrail(
          ctx,
          frames.map((f) => f.estimate),
          worldToScreen,
          colors.accentDark,
          1.5,
          reducedMotion,
        );
      }

      // GPS + outliers
      if (layers.gps || layers.outliers) {
        for (const f of frames) {
          if (!f.lastGpsFix) continue;
          const [x, y] = worldToScreen(f.lastGpsFix.x, f.lastGpsFix.y);
          if (f.lastGpsFix.rejected) {
            if (!layers.outliers) continue;
            ctx.strokeStyle = OUTLIER_RED;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x - 4, y - 4);
            ctx.lineTo(x + 4, y + 4);
            ctx.moveTo(x + 4, y - 4);
            ctx.lineTo(x - 4, y + 4);
            ctx.stroke();
          } else if (layers.gps) {
            ctx.fillStyle = withAlpha(colors.muted, 0.6);
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Robot sprite — diff-drive: body, two wheels, caster
      const last = frames[frames.length - 1];
      const [vx, vy] = worldToScreen(last.truth.x, last.truth.y);
      drawRobot(ctx, vx, vy, last.truth.theta, colors);

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [frames, reference, layers, reducedMotion, viewport, themeVersion]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      className="h-full w-full block"
      onWheel={(e) => {
        e.preventDefault();
        setViewport((v) => ({
          ...v,
          zoom: Math.max(0.5, Math.min(4, v.zoom * (e.deltaY < 0 ? 1.1 : 0.9))),
        }));
      }}
      onDoubleClick={() => setViewport(DEFAULT_VIEWPORT)}
    >
      {/* Fallback content for browsers without canvas support. */}
      <p className="p-4 text-sm text-muted">
        Your browser doesn&apos;t support the live simulation canvas. The case
        study describes the same system and its numerical results.
      </p>
    </canvas>
  );
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  worldToScreen: (x: number, y: number) => [number, number],
  color: string,
  lineWidth: number,
  reducedMotion: boolean,
): void {
  if (!points.length) return;
  if (reducedMotion) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    const [x0, y0] = worldToScreen(points[0].x, points[0].y);
    ctx.moveTo(x0, y0);
    for (let i = 1; i < points.length; i++) {
      const [x, y] = worldToScreen(points[i].x, points[i].y);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    return;
  }
  // Fade polyline — opacity ramps 0.2 → 1.0 across the buffer
  const segs = 20;
  const per = Math.max(1, Math.floor(points.length / segs));
  for (let s = 0; s < segs; s++) {
    const start = s * per;
    const end = Math.min((s + 1) * per + 1, points.length);
    if (end - start < 2) continue;
    const alpha = 0.2 + 0.8 * (s / (segs - 1));
    ctx.strokeStyle = withAlpha(color, alpha);
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    const [x0, y0] = worldToScreen(points[start].x, points[start].y);
    ctx.moveTo(x0, y0);
    for (let i = start + 1; i < end; i++) {
      const [x, y] = worldToScreen(points[i].x, points[i].y);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

/**
 * Draw a small top-down diff-drive robot at (vx, vy) oriented by theta.
 * Body is a rounded rectangle; two wheels straddle the body; a small
 * caster sits at the rear. Scale is fixed in screen pixels — we don't
 * want the robot to grow when the user zooms in.
 */
function drawRobot(
  ctx: CanvasRenderingContext2D,
  vx: number,
  vy: number,
  theta: number,
  colors: ThemeColors,
): void {
  ctx.save();
  ctx.translate(vx, vy);
  ctx.rotate(-theta);

  // Body: rounded rectangle, 14×10 px, facing +x
  const bodyW = 14;
  const bodyH = 10;
  const radius = 2;
  ctx.fillStyle = colors.accent;
  roundedRect(ctx, -bodyW / 2, -bodyH / 2, bodyW, bodyH, radius);
  ctx.fill();

  // Heading indicator: small triangle on the front edge
  ctx.fillStyle = colors.background;
  ctx.beginPath();
  ctx.moveTo(bodyW / 2 - 2, -2.5);
  ctx.lineTo(bodyW / 2 + 1, 0);
  ctx.lineTo(bodyW / 2 - 2, 2.5);
  ctx.closePath();
  ctx.fill();

  // Wheels: two bars on either side
  ctx.fillStyle = colors.foreground;
  ctx.fillRect(-3, -bodyH / 2 - 2, 6, 2); // top wheel
  ctx.fillRect(-3, bodyH / 2, 6, 2);      // bottom wheel

  // Rear caster: small circle at the back
  ctx.fillStyle = colors.muted;
  ctx.beginPath();
  ctx.arc(-bodyW / 2 + 1.5, 0, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Return a color string with alpha baked in. Accepts:
 * - `#RRGGBB` or `#RGB`
 * - `rgb(r, g, b)` / `rgba(r, g, b, a)` (we override alpha)
 * - Anything else → returns input unchanged (safe fallback for CSS keywords).
 */
function withAlpha(color: string, alpha: number): string {
  const c = color.trim();
  if (c.startsWith("#")) {
    const hex = c.slice(1);
    let r: number, g: number, b: number;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return c;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (c.startsWith("rgb")) {
    const nums = c.match(/[\d.]+/g);
    if (nums && nums.length >= 3) {
      return `rgba(${nums[0]}, ${nums[1]}, ${nums[2]}, ${alpha})`;
    }
  }
  return c;
}
