// src/components/sections/hero-loop/beats/BeatReturn.tsx
"use client";

import type { BeatProps } from "../types";

import { Notebook } from "./Notebook";

/**
 * Beat 6 (Return, 16.5–20.0s, 3.5s): pull back from the dashboard to reveal
 * the full desk composition (monitor + stand + desk + keyboard + mouse +
 * notebook-on-desk), then zoom into the angled notebook and flatten it to
 * match Beat 1's opening frame for the loop seam.
 *
 * Two phases:
 *   0.00–0.55  Pull back: monitor shrinks into upper-half; desk + peripherals
 *              + angled notebook resolve in.
 *   0.55–1.00  Zoom into notebook + flatten: notebook scales up, rotation
 *              and skew interpolate to zero, landing on Beat 1's empty-page
 *              full-viewport frame at progress=1.
 *
 * Loop seam: at progress=1 the notebook fills the viewport flat with an
 * empty page — identical to Beat 1 at progress=0.
 */

// ── Monitor geometry during Phase A ────────────────────────────────────────
// At Phase-A start: monitor fills the viewport (matches Beat 5 end) —
//   bezel x=80..560, y=40..340.
// At Phase-A end: monitor smaller, upper half of viewport —
//   bezel x=130..510, y=20..260.
const MON_START = { x: 80, y: 40, w: 480, h: 300 };
const MON_END = { x: 130, y: 20, w: 380, h: 240 };

// ── Notebook desk position (Phase A end) ──────────────────────────────────
// Small notebook on the desk to the left of the keyboard. Uses the same
// "viewed from in-front-and-slightly-above" perspective convention as the
// keyboard: vertical foreshortening (Y scale < X scale) so the notebook
// reads as lying flat on the tilted desk surface. No in-plane rotation or
// skew — keeps the perspective convention consistent across desk objects.
const NB_DESK_SCALE_X = 0.24;
const NB_DESK_SCALE_Y = 0.22; // Y/X ≈ 0.92, matches keyboard back/front ratio
const NB_DESK_CX = 90;
const NB_DESK_CY = 430;
// The notebook's internal layout centre is at (320, 270).
// Transform expansion: translate(cx cy) rotate(rot) skewY(skew) scale(s)
//                      translate(-320 -270)

export function BeatReturn({ progress, active }: BeatProps) {
  if (!active) return null;

  // ── Phase timing ─────────────────────────────────────────────────────────
  const pullT = easeInOutCubic(clamp01(progress / 0.55));
  const zoomT = easeInOutCubic(clamp01((progress - 0.55) / 0.45));

  // ── Desk / peripherals fade-in during Phase A ───────────────────────────
  const deskOpacity = clamp01((progress - 0.2) / 0.3);
  const peripheralsOpacity = clamp01((progress - 0.3) / 0.25);
  const notebookDeskOpacity = clamp01((progress - 0.35) / 0.25);

  // ── Monitor transform (Phase A) ─────────────────────────────────────────
  const monX = MON_START.x + (MON_END.x - MON_START.x) * pullT;
  const monY = MON_START.y + (MON_END.y - MON_START.y) * pullT;
  const monW = MON_START.w + (MON_END.w - MON_START.w) * pullT;
  const monH = MON_START.h + (MON_END.h - MON_START.h) * pullT;
  // Fade out the monitor and its dashboard during Phase B (zoom-in focuses
  // on the notebook, monitor exits to the top of the frame).
  const monFadeOut = 1 - zoomT;

  // ── Notebook transform (Phase A end → Phase B end) ──────────────────────
  // Phase A: notebook sits flat on the desk with vertical foreshortening
  // (Y scale < X scale). No rotation, no skew — matches the desk's
  // perspective convention.
  // Phase B: both X and Y scales grow to 1, centre moves to viewport
  // centre, landing on Beat 1's identity transform at progress=1.
  const nbScaleX =
    NB_DESK_SCALE_X + (1 - NB_DESK_SCALE_X) * zoomT;
  const nbScaleY =
    NB_DESK_SCALE_Y + (1 - NB_DESK_SCALE_Y) * zoomT;
  const nbCx = NB_DESK_CX + (320 - NB_DESK_CX) * zoomT;
  const nbCy = NB_DESK_CY + (270 - NB_DESK_CY) * zoomT;
  const notebookTransform =
    `translate(${nbCx} ${nbCy}) ` +
    `scale(${nbScaleX} ${nbScaleY}) ` +
    `translate(-320 -270)`;
  // Notebook is visible once it's appeared on the desk AND during the entire
  // zoom-in. So: fade-in during Phase A, fully visible through Phase B.
  const notebookOpacity = Math.max(notebookDeskOpacity, zoomT);

  return (
    <svg
      viewBox="0 0 640 540"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
    >
      <defs>
        {/* Subtle recession gradient on the desk — darker at the back edge
            (y=290, near the monitor), lighter toward the front (y=540).
            Reinforces "camera looking at the desk from slightly above" for
            the perspective convention. */}
        <linearGradient id="deskRecession" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(70, 62, 52)" />
          <stop offset="100%" stopColor="rgb(100, 92, 82)" />
        </linearGradient>
      </defs>

      {/* Wall / background behind the desk — matches Beat 5's end state
          (background colour) so the Beat 5→6 seam is invisible. */}
      <rect x={0} y={0} width={640} height={540} fill="var(--background)" />

      {/* ─── DESK SURFACE ─── Warm wood, top edge at y=290 in final frame;
          interpolates from below-viewport at start to desk-top at end. */}
      {deskOpacity > 0 && (
        <g opacity={deskOpacity * monFadeOut}>
          <rect
            x={0}
            y={290}
            width={640}
            height={250}
            fill="url(#deskRecession)"
          />
          {/* Front edge shadow */}
          <line
            x1={0}
            y1={290}
            x2={640}
            y2={290}
            stroke="rgba(0,0,0,0.35)"
            strokeWidth={1.5}
          />
          {/* Grain lines */}
          {[340, 400, 450, 500].map((gy) => (
            <line
              key={`grain-${gy}`}
              x1={0}
              y1={gy}
              x2={640}
              y2={gy}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth={0.5}
            />
          ))}
        </g>
      )}

      {/* ─── MONITOR STAND ─── */}
      {deskOpacity > 0 && zoomT < 1 && (
        <g
          opacity={deskOpacity * monFadeOut}
          fill="rgb(180, 182, 188)"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth={0.5}
        >
          {/* Arm */}
          <rect x={310} y={260} width={20} height={14} />
          {/* Base sitting on desk */}
          <rect x={240} y={274} width={160} height={16} rx={4} />
        </g>
      )}

      {/* ─── MONITOR BEZEL + DASHBOARD SNAPSHOT ─── Phase A only.
          Fades out as Phase B zoom-in begins. */}
      {monFadeOut > 0 && (
        <g opacity={monFadeOut}>
          {/* Outer bezel */}
          <rect
            x={monX}
            y={monY}
            width={monW}
            height={monH}
            rx={6}
            fill="rgb(25, 25, 27)"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={0.7}
          />
          {/* Screen — shows a settled dashboard snapshot as theme surface */}
          <rect
            x={monX + 4}
            y={monY + 4}
            width={monW - 8}
            height={monH - 8}
            fill="var(--surface)"
          />
          {/* Dashboard content — simplified title bar + minimap region +
              sidebar bars, scaled to fit the current monitor size. */}
          <DashboardSnapshot
            x={monX + 4}
            y={monY + 4}
            w={monW - 8}
            h={monH - 8}
            progress={progress}
          />
        </g>
      )}

      {/* ─── KEYBOARD ─── */}
      {peripheralsOpacity > 0 && zoomT < 1 && (
        <g opacity={peripheralsOpacity * monFadeOut}>
          {/* Base front face */}
          <rect
            x={185}
            y={400}
            width={270}
            height={10}
            fill="rgb(14, 14, 18)"
            stroke="rgba(0,0,0,0.85)"
            strokeWidth={0.8}
          />
          {/* Top plate — trapezoid angled back */}
          <path
            d="M 197 340 L 443 340 L 455 400 L 185 400 Z"
            fill="rgb(22, 22, 26)"
            stroke="rgba(0,0,0,0.7)"
            strokeWidth={1}
          />
          {/* Back-edge highlight */}
          <line
            x1={198}
            y1={341}
            x2={442}
            y2={341}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
          />
          {/* RGB underglow strip */}
          <rect
            x={199}
            y={338}
            width={242}
            height={1.5}
            fill="var(--accent)"
            opacity={0.45}
          />
          {/* Abstracted keycap grid — evenly-spaced dark trapezoids (we
              don't need per-key fidelity at this scale). */}
          {Array.from({ length: 5 }).map((_, r) => {
            const rowT = r / 4;
            const rowY = 348 + r * 10;
            const plateLeft = 197 + 3 * rowT;
            const plateRight = 443 - 3 * rowT;
            const rowW = plateRight - plateLeft;
            const keys = [14, 14, 13, 12, 8][r];
            const gap = 1.6;
            const keyW = (rowW - (keys - 1) * gap) / keys;
            return Array.from({ length: keys }).map((_, k) => {
              const kx = plateLeft + k * (keyW + gap);
              return (
                <rect
                  key={`k-${r}-${k}`}
                  x={kx}
                  y={rowY}
                  width={keyW}
                  height={7}
                  rx={1}
                  fill="rgb(54, 54, 60)"
                  stroke="rgba(0,0,0,0.55)"
                  strokeWidth={0.3}
                />
              );
            });
          })}
        </g>
      )}

      {/* ─── MOUSE ─── Right of keyboard, ergonomic shape. */}
      {peripheralsOpacity > 0 && zoomT < 1 && (
        <g opacity={peripheralsOpacity * monFadeOut}>
          {/* Body */}
          <path
            d={`
              M 496 360
              Q 482 360 476 370
              Q 470 382 470 392
              Q 470 410 478 418
              Q 486 426 498 426
              Q 512 426 519 416
              Q 525 404 525 390
              Q 525 376 519 368
              Q 510 360 498 360
              Z
            `}
            fill="rgb(60, 62, 68)"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth={0.6}
          />
          {/* Scroll wheel */}
          <rect
            x={496}
            y={368}
            width={5}
            height={8}
            rx={1.2}
            fill="rgb(30, 32, 36)"
            stroke="rgba(0,0,0,0.75)"
            strokeWidth={0.4}
          />
          {/* Button split line */}
          <line
            x1={498.5}
            y1={362}
            x2={498.5}
            y2={385}
            stroke="rgba(0,0,0,0.35)"
            strokeWidth={0.6}
          />
        </g>
      )}

      {/* ─── NOTEBOOK ON DESK ─── Small, angled, left of keyboard.
          Phase A: fades in at desk position.
          Phase B: scales up + flattens to full viewport (loop seam).
          backdrop=false: notebook renders without its own full-viewport
          background rect, so the desk shows through around it. Beat 6's
          outer <rect fill="var(--background)"> covers the post-zoom frame. */}
      {notebookOpacity > 0 && (
        <g opacity={notebookOpacity} transform={notebookTransform}>
          <Notebook backdrop={false} />
        </g>
      )}
    </svg>
  );
}

// ── Dashboard snapshot (static, non-interactive) ────────────────────────────

interface DashboardSnapshotProps {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Beat 6 progress — drives the robot-dot drift so the dashboard stays
   *  "live" as the camera pulls back to the desk. Phase matches Beat 5. */
  progress: number;
}

/** Settled dashboard snapshot — matches Beat 5's end-state layout at
 *  monitor-fills-viewport size (472×292). Rendered inside a group that
 *  scales Beat 5's native coords to fit the current monitor dimensions. */
function DashboardSnapshot({ x, y, w, h, progress }: DashboardSnapshotProps) {
  // Beat 5's native screen dimensions
  const NATIVE_W = 472;
  const NATIVE_H = 292;
  const sx = w / NATIVE_W;
  const sy = h / NATIVE_H;
  // Use uniform min-scale to keep proportions; then centre within the box.
  const s = Math.min(sx, sy);
  const drawnW = NATIVE_W * s;
  const drawnH = NATIVE_H * s;
  const offX = x + (w - drawnW) / 2;
  const offY = y + (h - drawnH) / 2;

  // Beat 5 native coords (0..472 × 0..292 within the screen)
  const TITLE_H = 28;
  // Minimap and sidebar originally at screen coords (92, 80) and (326, 80).
  // The native screen origin is (84, 44) in BeatDashboard; here we shift so
  // (84, 44) maps to (0, 0) within this component's coord system.
  const MM_X = 92 - 84;
  const MM_Y = 80 - 44;
  const MM_W = 226;
  const MM_H = 250;
  const SB_X = 326 - 84;
  const SB_Y = 80 - 44;
  const SB_W = 226;
  const CARD_H = 46;
  const CARD_GAP = 4;

  const stats = [
    { label: "ACTIVE", value: "12", alert: false },
    { label: "PICKS", value: "847", alert: false },
    { label: "UPTIME", value: "99.4%", alert: false },
    { label: "AVG SPD", value: "0.6 m/s", alert: false },
    { label: "ALERTS", value: "1", alert: true },
  ];

  // [x, y, colour, battery 0..1] — matches Beat 5's robots array.
  const robots: [number, number, string, number][] = [
    [MM_X + 35, MM_Y + 65, "rgb(80, 220, 110)", 0.85],
    [MM_X + 160, MM_Y + 55, "rgb(80, 220, 110)", 0.72],
    [MM_X + 80, MM_Y + 130, "rgb(230, 160, 40)", 0.35],
    [MM_X + 180, MM_Y + 170, "rgb(80, 220, 110)", 0.9],
    [MM_X + 55, MM_Y + 200, "rgb(220, 80, 70)", 0.12],
    [MM_X + 190, MM_Y + 215, "rgb(80, 220, 110)", 0.68],
  ];

  return (
    <g transform={`translate(${offX} ${offY}) scale(${s})`}>
      {/* Title bar */}
      <rect x={0} y={0} width={NATIVE_W} height={TITLE_H} fill="var(--background)" />
      <line
        x1={0}
        y1={TITLE_H}
        x2={NATIVE_W}
        y2={TITLE_H}
        stroke="var(--border)"
        strokeWidth={0.6}
      />
      <text
        x={12}
        y={17}
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize={9}
        fontWeight={600}
        fill="var(--foreground)"
        stroke="none"
        letterSpacing={0.8}
      >
        NB-FLEET MONITOR
      </text>
      <circle cx={NATIVE_W - 58} cy={14} r={2.4} fill="rgb(80, 220, 110)" />
      <text
        x={NATIVE_W - 52}
        y={17}
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize={8}
        fill="var(--muted)"
        stroke="none"
        letterSpacing={0.6}
      >
        NOMINAL
      </text>

      {/* Minimap */}
      <rect
        x={MM_X}
        y={MM_Y}
        width={MM_W}
        height={MM_H}
        fill="var(--background)"
        stroke="var(--border)"
        strokeWidth={0.6}
      />
      {/* Minimap grid */}
      <g stroke="var(--border)" strokeWidth={0.5} opacity={0.5}>
        {Array.from({ length: 7 }).map((_, i) => {
          const gx = MM_X + ((i + 1) * MM_W) / 8;
          return <line key={`v-${i}`} x1={gx} y1={MM_Y} x2={gx} y2={MM_Y + MM_H} />;
        })}
        {Array.from({ length: 9 }).map((_, i) => {
          const gy = MM_Y + ((i + 1) * MM_H) / 10;
          return <line key={`h-${i}`} x1={MM_X} y1={gy} x2={MM_X + MM_W} y2={gy} />;
        })}
      </g>
      {/* Robot dots with drift + battery indicator — keeps the dashboard
          "live" as the camera pulls back. Phase matches Beat 5 so the
          Beat 5→6 seam is seamless. */}
      {robots.map(([rx, ry, col, battery], i) => {
        const { dx, dy } = dotOffset(progress, i);
        const cx = rx + dx;
        const cy = ry + dy;
        const fillW = battery * 9;
        return (
          <g key={`r-${i}`}>
            <circle cx={cx} cy={cy} r={8} fill={col} opacity={0.22} />
            <circle cx={cx} cy={cy} r={4.5} fill={col} />
            {/* Battery body */}
            <rect
              x={cx - 6}
              y={cy - 14}
              width={12}
              height={5.5}
              rx={1.2}
              stroke="var(--muted)"
              strokeWidth={0.5}
              fill="var(--background)"
            />
            {/* Terminal nub */}
            <rect
              x={cx + 6}
              y={cy - 13}
              width={1.2}
              height={3.5}
              fill="var(--muted)"
            />
            {/* Fill level */}
            <rect
              x={cx - 5}
              y={cy - 13}
              width={fillW}
              height={3.5}
              fill={col}
            />
          </g>
        );
      })}
      {/* Tracked-robot accent ring — drifts with robots[0]. */}
      {(() => {
        const { dx, dy } = dotOffset(progress, 0);
        return (
          <circle
            cx={robots[0][0] + dx}
            cy={robots[0][1] + dy}
            r={9}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.2}
            strokeDasharray="2.5 2.5"
          />
        );
      })()}

      {/* Sidebar stat cards */}
      {stats.map((stat, i) => {
        const y0 = SB_Y + i * (CARD_H + CARD_GAP);
        const isAlert = stat.alert;
        const valueColor = isAlert ? "rgb(230, 160, 40)" : "var(--foreground)";
        return (
          <g key={`c-${i}`}>
            <rect
              x={SB_X}
              y={y0}
              width={SB_W}
              height={CARD_H}
              fill="var(--background)"
              stroke="var(--border)"
              strokeWidth={0.6}
            />
            <text
              x={SB_X + 10}
              y={y0 + 14}
              fontFamily="var(--font-jetbrains-mono), monospace"
              fontSize={8}
              fill="var(--muted)"
              stroke="none"
              letterSpacing={0.8}
            >
              {stat.label}
            </text>
            {isAlert && (
              <circle cx={SB_X + 12} cy={y0 + 30} r={2.2} fill="rgb(230, 160, 40)" />
            )}
            <text
              x={isAlert ? SB_X + 20 : SB_X + 10}
              y={y0 + 34}
              fontFamily="var(--font-jetbrains-mono), monospace"
              fontSize={15}
              fontWeight={700}
              fill={valueColor}
              stroke="none"
            >
              {stat.value}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Robot-dot drift offset for the dashboard — matches Beat 5's formula so
 *  the Beat 5→6 seam has continuous dot motion. */
function dotOffset(progress: number, i: number): { dx: number; dy: number } {
  const phase = (i * 1.37) % (Math.PI * 2);
  const dx = Math.cos(progress * Math.PI * 2 + phase) * (i === 0 ? 3 : 4);
  const dy = Math.sin(progress * Math.PI * 2 + phase * 1.7) * (i === 0 ? 2 : 3);
  return { dx, dy };
}
