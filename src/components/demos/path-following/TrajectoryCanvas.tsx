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

const WORLD_SIZE = 14; // metres — viewport side
const DEFAULT_VIEWPORT: Viewport = { zoom: 1, panX: 0, panY: 0 };

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

      // Background
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
      ctx.lineWidth = 1;
      for (let gx = -WORLD_SIZE / 2; gx <= WORLD_SIZE / 2; gx++) {
        const [sx] = worldToScreen(gx, 0);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, h);
        ctx.stroke();
      }
      for (let gy = -WORLD_SIZE / 2; gy <= WORLD_SIZE / 2; gy++) {
        const [, sy] = worldToScreen(0, gy);
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(w, sy);
        ctx.stroke();
      }

      // Reference
      if (layers.reference && reference.length) {
        ctx.strokeStyle = "#3B82F6";
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

      // Truth trail
      if (layers.truth) {
        drawTrail(ctx, frames.map((f) => f.truth), worldToScreen, "#FAFAFA", 2, reducedMotion);
      }

      // Estimate trail
      if (layers.estimate) {
        drawTrail(
          ctx,
          frames.map((f) => f.estimate),
          worldToScreen,
          "#60a5fa",
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
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x - 4, y - 4);
            ctx.lineTo(x + 4, y + 4);
            ctx.moveTo(x + 4, y - 4);
            ctx.lineTo(x - 4, y + 4);
            ctx.stroke();
          } else if (layers.gps) {
            ctx.fillStyle = "rgba(250, 250, 250, 0.5)";
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Vehicle sprite
      const last = frames[frames.length - 1];
      const [vx, vy] = worldToScreen(last.truth.x, last.truth.y);
      ctx.save();
      ctx.translate(vx, vy);
      ctx.rotate(-last.truth.theta);
      ctx.fillStyle = "#FAFAFA";
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(-5, 4);
      ctx.lineTo(-5, -4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [frames, reference, layers, reducedMotion, viewport]);

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
    ctx.strokeStyle = colorWithAlpha(color, alpha);
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

function colorWithAlpha(hex: string, alpha: number): string {
  // Accepts #RRGGBB only
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
