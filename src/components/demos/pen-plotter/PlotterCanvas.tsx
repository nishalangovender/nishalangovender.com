"use client";

import { useEffect, useRef, useState } from "react";

import { HW } from "@/lib/pen-plotter/types";
import type { SimFrame, Vec2 } from "@/lib/pen-plotter/types";

interface Props {
  latest: SimFrame | null;
  showEnvelope: boolean;
  onDrawClick?: (p: Vec2) => void;
  drawMode?: boolean;
  drawnPolyline?: ReadonlyArray<Vec2>;
  outOfEnvelopeFlash?: number;
  ariaLabel?: string;
}

// Workspace mm range we render: x in [-40, 310], y in [-160, 160].
const WORLD = { x0: -40, x1: 310, y0: -160, y1: 160 };

// Parse a hex "#RRGGBB" or "rgb(R G B)" / "rgb(R, G, B)" colour into rgba(..., alpha).
function withAlpha(colour: string, alpha: number): string {
  const trimmed = colour.trim();
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const match = trimmed.match(/rgb\(([^)]+)\)/);
  if (match) {
    const parts = match[1].split(/[\s,]+/).filter(Boolean);
    return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
  }
  return trimmed; // fallback — return as-is
}

export function PlotterCanvas({
  latest,
  showEnvelope,
  onDrawClick,
  drawMode = false,
  drawnPolyline,
  outOfEnvelopeFlash,
  ariaLabel,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashExpiryRef = useRef<number>(0);
  const [flashTick, setFlashTick] = useState(0);
  const [themeTick, setThemeTick] = useState(0);

  // Re-render the canvas whenever the theme attribute flips.
  useEffect(() => {
    const mo = new MutationObserver(() => setThemeTick((n) => n + 1));
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (outOfEnvelopeFlash === undefined) return;
    flashExpiryRef.current = performance.now() + 400;
    const tOn = setTimeout(() => setFlashTick((n) => n + 1), 0);
    const tOff = setTimeout(() => setFlashTick((n) => n + 1), 400);
    return () => {
      clearTimeout(tOn);
      clearTimeout(tOff);
    };
  }, [outOfEnvelopeFlash]);

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

    // Resolve theme-aware colours from CSS variables.
    const styles = window.getComputedStyle(canvas);
    const fg = styles.getPropertyValue("--foreground").trim() || "#1a1a1a";
    const accent = styles.getPropertyValue("--accent").trim() || "#0066FF";
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const paper = isDark ? "#1f1f1f" : "#f8f7f2";

    // Clear with paper colour.
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, w, h);

    // Subtle xy axes through the origin — orient the viewer without competing
    // with the trace or mechanism. Drawn first so envelope rings and trace
    // always render on top.
    {
      const origin = worldToScreen({ x: 0, y: 0 });
      const xMin = worldToScreen({ x: WORLD.x0, y: 0 });
      const xMax = worldToScreen({ x: WORLD.x1, y: 0 });
      const yMin = worldToScreen({ x: 0, y: WORLD.y0 });
      const yMax = worldToScreen({ x: 0, y: WORLD.y1 });
      ctx.save();
      ctx.strokeStyle = "rgba(100, 100, 100, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xMin.x, origin.y);
      ctx.lineTo(xMax.x, origin.y);
      ctx.moveTo(origin.x, yMin.y);
      ctx.lineTo(origin.x, yMax.y);
      ctx.stroke();
      // Axis labels — placed just inside the positive end of each axis, away
      // from the pivot hub.
      ctx.fillStyle = "rgba(100, 100, 100, 0.7)";
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText("+x", xMax.x - 6, origin.y - 4);
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("+y", origin.x + 4, yMax.y + 6);
      ctx.restore();
    }

    // Envelope overlay.
    if (showEnvelope) {
      const c = worldToScreen({ x: 0, y: 0 });
      ctx.save();
      ctx.strokeStyle = withAlpha(accent, 0.35);
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

    // Out-of-envelope flash — red rings at R_MIN / R_MAX.
    const flashActive = performance.now() < flashExpiryRef.current;
    if (flashActive) {
      const c = worldToScreen({ x: 0, y: 0 });
      ctx.save();
      ctx.strokeStyle = "rgba(220, 38, 38, 0.75)";
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.5;
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
      ctx.strokeStyle = accent;
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
      ctx.strokeStyle = withAlpha(fg, 0.55);
      ctx.fillStyle = withAlpha(fg, 0.55);
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
    ctx.strokeStyle = fg;
    ctx.fillStyle = fg;
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
      ctx.strokeStyle = fg;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(pivot.x, pivot.y);
      ctx.lineTo(armEnd.x, armEnd.y);
      ctx.stroke();
      ctx.restore();

      // Pen carriage.
      const tip = worldToScreen(latest.tip);
      ctx.save();
      ctx.strokeStyle = fg;
      ctx.fillStyle = latest.firmware.pen === "DOWN" ? accent : "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      if (latest.firmware.pen === "DOWN") {
        ctx.beginPath();
        ctx.strokeStyle = withAlpha(accent, 0.35);
        ctx.arc(tip.x, tip.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }, [latest, showEnvelope, drawMode, drawnPolyline, flashTick, themeTick]);

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
