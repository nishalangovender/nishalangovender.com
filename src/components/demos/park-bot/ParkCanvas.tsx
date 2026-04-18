// src/components/demos/park-bot/ParkCanvas.tsx
"use client";

import { useEffect, useRef } from "react";

import { L, W } from "@/lib/park-bot/types";
import type { Scenario, SimFrame } from "@/lib/park-bot/types";

interface Props {
  scenario: Scenario;
  frame: SimFrame | null;
}

const COLOURS = {
  bg: "var(--surface)",
  grid: "rgba(148, 163, 184, 0.18)",
  obstacle: "rgba(115, 115, 115, 0.55)",
  targetFill: "rgba(59, 130, 246, 0.10)",
  targetStroke: "rgba(59, 130, 246, 0.75)",
  chassis: "var(--foreground)",
  wheel: "var(--foreground)",
  trail: "rgba(59, 130, 246, 0.7)",
  stuck: "rgba(239, 68, 68, 0.9)",
} as const;

export function ParkCanvas({ scenario, frame }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    // World-to-canvas scaling: fit scenario bounds with 16 px padding.
    const pad = 16;
    const sx = (cssW - 2 * pad) / scenario.bounds.width;
    const sy = (cssH - 2 * pad) / scenario.bounds.height;
    const s = Math.min(sx, sy);
    const cx = cssW / 2;
    const cy = cssH / 2;

    const worldToCanvas = (x: number, y: number) => ({
      cx: cx + x * s,
      cy: cy - y * s,
    });

    // Grid.
    ctx.strokeStyle = COLOURS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const step = 0.5; // metres
    for (let gx = -scenario.bounds.width / 2; gx <= scenario.bounds.width / 2 + 1e-6; gx += step) {
      const a = worldToCanvas(gx, -scenario.bounds.height / 2);
      const b = worldToCanvas(gx, scenario.bounds.height / 2);
      ctx.moveTo(a.cx, a.cy);
      ctx.lineTo(b.cx, b.cy);
    }
    for (let gy = -scenario.bounds.height / 2; gy <= scenario.bounds.height / 2 + 1e-6; gy += step) {
      const a = worldToCanvas(-scenario.bounds.width / 2, gy);
      const b = worldToCanvas(scenario.bounds.width / 2, gy);
      ctx.moveTo(a.cx, a.cy);
      ctx.lineTo(b.cx, b.cy);
    }
    ctx.stroke();

    // Obstacles.
    ctx.fillStyle = COLOURS.obstacle;
    for (const o of scenario.obstacles) {
      const p = worldToCanvas(o.x, o.y + o.h);
      ctx.fillRect(p.cx, p.cy, o.w * s, o.h * s);
    }

    // Target pose (filled bay + heading line).
    {
      const p = worldToCanvas(scenario.target.x, scenario.target.y);
      ctx.save();
      ctx.translate(p.cx, p.cy);
      ctx.rotate(-scenario.target.theta);
      ctx.fillStyle = COLOURS.targetFill;
      ctx.strokeStyle = COLOURS.targetStroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect((-L / 2) * s, (-W / 2) * s, L * s, W * s);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Trail.
    if (frame && frame.trail.length > 1) {
      ctx.strokeStyle = frame.stuck ? COLOURS.stuck : COLOURS.trail;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < frame.trail.length; i++) {
        const p = worldToCanvas(frame.trail[i].x, frame.trail[i].y);
        if (i === 0) ctx.moveTo(p.cx, p.cy);
        else ctx.lineTo(p.cx, p.cy);
      }
      ctx.stroke();
    }

    // Vehicle.
    const pose = frame?.pose ?? scenario.start;
    const { cx: vcx, cy: vcy } = worldToCanvas(pose.x, pose.y);
    ctx.save();
    ctx.translate(vcx, vcy);
    ctx.rotate(-pose.theta);
    ctx.strokeStyle = COLOURS.chassis;
    ctx.lineWidth = 1.5;
    ctx.strokeRect((-L / 2) * s, (-W / 2) * s, L * s, W * s);
    // Forward tick.
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo((L / 2) * s, 0);
    ctx.stroke();
    // Wheels.
    const wheelLen = 0.10 * s;
    const wheelThick = 1.8;
    ctx.lineWidth = wheelThick;
    ctx.strokeStyle = COLOURS.wheel;
    const corners: Array<[number, number, number]> = frame
      ? [
          [L / 2, W / 2, frame.wheels.deltas[0]],
          [L / 2, -W / 2, frame.wheels.deltas[1]],
          [-L / 2, W / 2, frame.wheels.deltas[2]],
          [-L / 2, -W / 2, frame.wheels.deltas[3]],
        ]
      : [
          [L / 2, W / 2, 0],
          [L / 2, -W / 2, 0],
          [-L / 2, W / 2, 0],
          [-L / 2, -W / 2, 0],
        ];
    for (const [wx, wy, delta] of corners) {
      ctx.save();
      ctx.translate(wx * s, -wy * s);
      ctx.rotate(-delta);
      ctx.beginPath();
      ctx.moveTo(-wheelLen / 2, 0);
      ctx.lineTo(wheelLen / 2, 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }, [scenario, frame]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-[420px] sm:h-[460px] md:h-[520px] rounded-md border border-border/60 bg-surface/60"
      aria-label={`Top-down view of ${scenario.title}`}
      role="img"
    />
  );
}
