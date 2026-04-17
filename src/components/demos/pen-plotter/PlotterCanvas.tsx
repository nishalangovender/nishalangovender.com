"use client";

import { useEffect, useRef } from "react";

import { HW } from "@/lib/pen-plotter/types";
import type { SimFrame, Vec2 } from "@/lib/pen-plotter/types";

interface Props {
  latest: SimFrame | null;
  showEnvelope: boolean;
  onDrawClick?: (p: Vec2) => void;  // used later in Task 17
  drawMode?: boolean;
  drawnPolyline?: ReadonlyArray<Vec2>;
  ariaLabel?: string;
}

// Workspace mm range we render: x in [-40, 310], y in [-160, 160].
const WORLD = { x0: -40, x1: 310, y0: -160, y1: 160 };

export function PlotterCanvas({
  latest,
  showEnvelope,
  onDrawClick,
  drawMode = false,
  drawnPolyline,
  ariaLabel,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = parent?.clientWidth ?? 800;
    const h = parent?.clientHeight ?? 500;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Map world mm → screen px preserving aspect.
    const sx = w / (WORLD.x1 - WORLD.x0);
    const sy = h / (WORLD.y1 - WORLD.y0);
    const s = Math.min(sx, sy);
    const ox = (w - (WORLD.x1 - WORLD.x0) * s) / 2;
    const oy = (h - (WORLD.y1 - WORLD.y0) * s) / 2;
    const worldToScreen = (p: Vec2): Vec2 => ({
      x: ox + (p.x - WORLD.x0) * s,
      y: oy + (WORLD.y1 - p.y) * s, // flip y so +y is up
    });

    // Clear with paper colour.
    ctx.fillStyle = "#f8f7f2";
    ctx.fillRect(0, 0, w, h);

    // Envelope overlay.
    if (showEnvelope) {
      const c = worldToScreen({ x: 0, y: 0 });
      ctx.save();
      ctx.strokeStyle = "rgba(0, 102, 255, 0.35)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c.x, c.y, HW.R_MAX * s, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c.x, c.y, HW.R_MIN * s, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    // Trace.
    if (latest) {
      ctx.save();
      ctx.strokeStyle = "#0066FF";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const seg of latest.traceSegments) {
        const a = worldToScreen(seg.a);
        const b = worldToScreen(seg.b);
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Click-draw preview polyline.
    if (drawMode && drawnPolyline && drawnPolyline.length > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(26, 26, 26, 0.5)";
      ctx.fillStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      for (let i = 0; i < drawnPolyline.length; i++) {
        const p = worldToScreen(drawnPolyline[i]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      for (const pt of drawnPolyline) {
        const p = worldToScreen(pt);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.restore();
    }

    // Mechanism.
    const pivot = worldToScreen({ x: 0, y: 0 });
    ctx.save();
    ctx.strokeStyle = "#1a1a1a";
    ctx.fillStyle = "#141414";
    ctx.lineWidth = 1.5;
    // Pivot hub.
    ctx.beginPath();
    ctx.arc(pivot.x, pivot.y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    // Arm + carriage (drawn from pivot in direction of current theta, length = r + 20 mm padding).
    if (latest) {
      const theta = latest.theta;
      const r = Math.max(latest.r, HW.R_MIN);
      const armLenMm = r + 20;
      const armEnd = worldToScreen({ x: Math.cos(theta) * armLenMm, y: Math.sin(theta) * armLenMm });
      ctx.save();
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(pivot.x, pivot.y);
      ctx.lineTo(armEnd.x, armEnd.y);
      ctx.stroke();
      ctx.restore();

      // Pen carriage.
      const tip = worldToScreen(latest.tip);
      ctx.save();
      ctx.strokeStyle = "#1a1a1a";
      ctx.fillStyle = latest.firmware.pen === "DOWN" ? "#0066FF" : "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      if (latest.firmware.pen === "DOWN") {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0, 102, 255, 0.35)";
        ctx.arc(tip.x, tip.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }, [latest, showEnvelope, drawMode, drawnPolyline]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel ?? "Pen plotter simulation"}
      className="block w-full h-full cursor-crosshair"
      onClick={(ev) => {
        if (!drawMode || !onDrawClick) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const cx = ev.clientX - rect.left;
        const cy = ev.clientY - rect.top;
        const sx = canvas.clientWidth / (WORLD.x1 - WORLD.x0);
        const sy = canvas.clientHeight / (WORLD.y1 - WORLD.y0);
        const s = Math.min(sx, sy);
        const ox = (canvas.clientWidth - (WORLD.x1 - WORLD.x0) * s) / 2;
        const oy = (canvas.clientHeight - (WORLD.y1 - WORLD.y0) * s) / 2;
        const worldX = (cx - ox) / s + WORLD.x0;
        const worldY = WORLD.y1 - (cy - oy) / s;
        onDrawClick({ x: worldX, y: worldY });
      }}
    />
  );
}
