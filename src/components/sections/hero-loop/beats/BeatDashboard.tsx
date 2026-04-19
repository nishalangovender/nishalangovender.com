// src/components/sections/hero-loop/beats/BeatDashboard.tsx
"use client";

import type { BeatProps } from "../types";

import { Factory } from "./Factory";
import { RobotStatic } from "./RobotStatic";

/**
 * Beat 5 (Dashboard, 13.5–16.5s): camera retreats from the warehouse; the
 * warehouse compresses into a monitor screen and the fleet-dashboard chrome
 * resolves *around* the compressing view. The hero robot lands exactly on
 * the highlighted tracked-robot dot so the seam reads as "that was this dot
 * the whole time".
 *
 * Beat 6 handles the further pullback to desk + peripherals. Beat 5 ends
 * on the assembled dashboard filling the monitor screen.
 *
 * Motion continuity: Beat 4 uses easeInOutCubic which decelerates to rest at
 * its end. Beat 5 uses easeInOutCubic on its camera/compression + a small
 * sustained forward drift so the hero robot keeps moving across the seam.
 *
 * Timing (3s beat):
 *   0.00–0.55  camera pullback; warehouse compresses into monitor screen
 *   0.00–0.55  hero robot drifts forward while compressing toward highlight
 *   0.20–0.45  monitor bezel fades in around the compressing view
 *   0.30–0.55  warehouse cross-fades to schematic dashboard content
 *   0.30–0.55  dashboard surface + minimap chrome fade in inside screen
 *   0.40–0.80  sidebar stat cards slide in from the right, staggered
 *   0.55–0.80  title bar slides down from the top of the screen
 *   0.80–1.00  settled full-screen dashboard
 */
export function BeatDashboard({ progress, active }: BeatProps) {
  if (!active) return null;

  // ── Monitor screen geometry (matches original layout) ──────────────────
  const MON_X = 80;
  const MON_Y = 40;
  const MON_W = 480;
  const MON_H = 300;
  const SCR_X = 84;
  const SCR_Y = 44;
  const SCR_W = 472;
  const SCR_H = 292;

  // Dashboard inner regions (screen coords).
  //   Title bar:  SCR_Y .. SCR_Y+28 (28 tall)
  //   Minimap:    x=92..318 (226 wide),  y=80..330 (250 tall)
  //   Sidebar:    x=326..552 (226 wide), y=80..330 (250 tall), 5 cards
  const TITLE_H = 28;
  const MM_X0 = 92;
  const MM_Y0 = 80;
  const MM_W = 226;
  const MM_H = 250;
  const SB_X0 = 326;
  const SB_Y0 = 80;
  const SB_W = 226;
  const CARD_H = 46;
  const CARD_GAP = 4;

  // Highlighted robot position (schematic minimap coords). Must match the
  // pinned robots[0] below. The warehouse compression lands the hero robot
  // here so the seam reads correctly.
  const HERO_TARGET_X = MM_X0 + 35; // 127
  const HERO_TARGET_Y = MM_Y0 + 65; // 145

  // ── Beat 4 end state (continuity anchor) ───────────────────────────────
  const ROBOT_END_HEADING_DEG = 0.83;
  const headingRad = (ROBOT_END_HEADING_DEG * Math.PI) / 180;

  // ── Warehouse transform (compression + pullback combined) ──────────────
  // A single transform moves the warehouse from Beat 4's end state (hero at
  // screen (320, 260), scale 0.35) to fitting the monitor screen with the
  // hero landing on HERO_TARGET (scale 0.295).
  //
  // Uniform scale to fit 1600×900 factory into 472×292 screen:
  //   min(472/1600, 292/900) = min(0.295, 0.324) = 0.295
  const cameraT = easeInOutCubic(clamp01(progress / 0.55));
  const startScale = 0.35;
  const endScale = 0.295;
  const whScale = startScale + (endScale - startScale) * cameraT;

  // Hero robot continuity drift — keeps motion across the Beat 4→5 seam
  // without a jump-cut stop. Beat 4 decelerates via easeInOutCubic to rest
  // at t=1. Beat 5 gently re-accelerates and carries the robot forward a
  // further 140 world units over the first 70% of the beat.
  const driftT = easeInOutCubic(clamp01(progress / 0.7));
  const continueDist = 140 * driftT;
  const heroWorldX = 820 + continueDist * Math.cos(headingRad);
  const heroWorldY = 165 + continueDist * Math.sin(headingRad);

  // Hero must land at screen (320, 260) at t=0 (matches Beat 4 end) and at
  // HERO_TARGET at t=1. Linearly interpolate the anchor screen position.
  const anchorScreenX = 320 + (HERO_TARGET_X - 320) * cameraT;
  const anchorScreenY = 260 + (HERO_TARGET_Y - 260) * cameraT;
  const warehouseTransform = `translate(${anchorScreenX} ${anchorScreenY}) scale(${whScale}) translate(${-heroWorldX} ${-heroWorldY})`;

  // ── Chrome cascade opacity ─────────────────────────────────────────────
  const bezelOpacity = clamp01((progress - 0.2) / 0.25);
  const screenSurfaceOpacity = clamp01((progress - 0.3) / 0.25);
  const warehouseOpacity = 1 - clamp01((progress - 0.3) / 0.25);
  const schematicOpacity = clamp01((progress - 0.3) / 0.25);
  const minimapGridOpacity = clamp01((progress - 0.3) / 0.25);
  const minimapBorderOpacity = clamp01((progress - 0.3) / 0.2);
  const titleBarT = easeInOutCubic(clamp01((progress - 0.55) / 0.25));
  const titleBarY = SCR_Y - TITLE_H + TITLE_H * titleBarT;

  // ── Schematic robot dots ───────────────────────────────────────────────
  // robots[0] is the highlighted/tracked robot — its static centre must
  // match HERO_TARGET so the hero warehouse-robot lands on this dot.
  const robots: {
    x: number;
    y: number;
    status: "green" | "orange" | "red";
    battery: number;
  }[] = [
    { x: HERO_TARGET_X, y: HERO_TARGET_Y, status: "green", battery: 0.85 },
    { x: MM_X0 + 160, y: MM_Y0 + 55, status: "green", battery: 0.72 },
    { x: MM_X0 + 80, y: MM_Y0 + 130, status: "orange", battery: 0.35 },
    { x: MM_X0 + 180, y: MM_Y0 + 170, status: "green", battery: 0.9 },
    { x: MM_X0 + 55, y: MM_Y0 + 200, status: "red", battery: 0.12 },
    { x: MM_X0 + 190, y: MM_Y0 + 215, status: "green", battery: 0.68 },
  ];

  const statusColor = {
    green: "rgb(80, 220, 110)",
    orange: "rgb(230, 160, 40)",
    red: "rgb(220, 80, 70)",
  } as const;

  // Dot drift — each dot oscillates around its anchor to imply active
  // motion. The tracked robot (index 0) only starts drifting after the
  // warehouse hand-off at compressT ~1, so the landing is clean.
  const trackedDriftGate = clamp01((progress - 0.55) / 0.2);
  function dotOffset(i: number): { dx: number; dy: number } {
    const phase = (i * 1.37) % (Math.PI * 2);
    const amp = i === 0 ? 3 * trackedDriftGate : 4;
    const dx = Math.cos(progress * Math.PI * 2 + phase) * amp;
    const dy =
      Math.sin(progress * Math.PI * 2 + phase * 1.7) *
      (i === 0 ? 2 * trackedDriftGate : 3);
    return { dx, dy };
  }

  // ── Stat cards ─────────────────────────────────────────────────────────
  const stats = [
    { label: "ACTIVE", value: "12", alert: false },
    { label: "PICKS", value: "847", alert: false },
    { label: "UPTIME", value: "99.4%", alert: false },
    { label: "AVG SPD", value: "0.6 m/s", alert: false },
    { label: "ALERTS", value: "1", alert: true },
  ];

  return (
    <svg
      viewBox="0 0 640 540"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
    >
      <defs>
        <clipPath id="dashMonitorClip">
          <rect x={SCR_X} y={SCR_Y} width={SCR_W} height={SCR_H} />
        </clipPath>
        <clipPath id="dashMinimapClip">
          <rect x={MM_X0} y={MM_Y0} width={MM_W} height={MM_H} />
        </clipPath>
      </defs>

      {/* Background — matches blueprint substrate at t=0 */}
      <rect x={0} y={0} width={640} height={540} fill="var(--background)" />

      {/* ─── WAREHOUSE — visible until the crossfade inside the monitor. ─── */}
      {warehouseOpacity > 0 && (
        <g opacity={warehouseOpacity} transform={warehouseTransform}>
          <Factory />
          <RobotStatic
            ledsOn={true}
            lidarAngle={0}
            cameraRecording={false}
            centerX={heroWorldX}
            centerY={heroWorldY}
            yawDeg={ROBOT_END_HEADING_DEG}
            bayOpen={0}
          />
        </g>
      )}

      {/* ─── MONITOR BEZEL ─── */}
      {bezelOpacity > 0 && (
        <g opacity={bezelOpacity}>
          <rect
            x={MON_X}
            y={MON_Y}
            width={MON_W}
            height={MON_H}
            rx={6}
            fill="rgb(25, 25, 27)"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={0.7}
          />
          {/* Screen surface fades in BEHIND the warehouse so the crossfade
              reveals the dashboard body. */}
          <rect
            x={SCR_X}
            y={SCR_Y}
            width={SCR_W}
            height={SCR_H}
            fill="var(--surface)"
            opacity={screenSurfaceOpacity}
          />
        </g>
      )}

      {/* ─── DASHBOARD CONTENT (clipped to monitor screen) ─── */}
      <g clipPath="url(#dashMonitorClip)">
        {/* Minimap background tile */}
        {minimapBorderOpacity > 0 && (
          <rect
            x={MM_X0}
            y={MM_Y0}
            width={MM_W}
            height={MM_H}
            fill="var(--background)"
            opacity={screenSurfaceOpacity}
          />
        )}

        {/* Minimap grid */}
        {minimapGridOpacity > 0 && (
          <g
            clipPath="url(#dashMinimapClip)"
            stroke="var(--border)"
            strokeWidth={0.5}
            opacity={minimapGridOpacity * 0.7}
          >
            {Array.from({ length: 7 }).map((_, i) => {
              const gx = MM_X0 + ((i + 1) * MM_W) / 8;
              return (
                <line
                  key={`mmv-${i}`}
                  x1={gx}
                  y1={MM_Y0}
                  x2={gx}
                  y2={MM_Y0 + MM_H}
                />
              );
            })}
            {Array.from({ length: 9 }).map((_, i) => {
              const gy = MM_Y0 + ((i + 1) * MM_H) / 10;
              return (
                <line
                  key={`mmh-${i}`}
                  x1={MM_X0}
                  y1={gy}
                  x2={MM_X0 + MM_W}
                  y2={gy}
                />
              );
            })}
          </g>
        )}

        {/* Robot dots — fade in after the warehouse fades out */}
        {schematicOpacity > 0 && (
          <g clipPath="url(#dashMinimapClip)">
            {robots.map((robot, i) => {
              const col = statusColor[robot.status];
              const { dx, dy } = dotOffset(i);
              const cx = robot.x + dx;
              const cy = robot.y + dy;
              const fillW = robot.battery * 9;
              return (
                <g key={`robot-${i}`} opacity={schematicOpacity}>
                  <circle cx={cx} cy={cy} r={8} fill={col} opacity={0.22} />
                  <circle cx={cx} cy={cy} r={4.5} fill={col} />
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
                  <rect
                    x={cx + 6}
                    y={cy - 13}
                    width={1.2}
                    height={3.5}
                    fill="var(--muted)"
                  />
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
            {/* Tracked-robot accent ring on robots[0] — lands on hero */}
            {(() => {
              const { dx, dy } = dotOffset(0);
              return (
                <circle
                  opacity={schematicOpacity}
                  cx={robots[0].x + dx}
                  cy={robots[0].y + dy}
                  r={9}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1.2}
                  strokeDasharray="2.5 2.5"
                />
              );
            })()}
          </g>
        )}

        {/* Minimap border — crisp on top */}
        {minimapBorderOpacity > 0 && (
          <rect
            x={MM_X0}
            y={MM_Y0}
            width={MM_W}
            height={MM_H}
            fill="none"
            stroke="var(--border)"
            strokeWidth={0.6}
            opacity={minimapBorderOpacity}
          />
        )}

        {/* Sidebar stat cards — slide in from the right, staggered */}
        {stats.map((stat, i) => {
          const cardStart = 0.4 + i * 0.06;
          const cardT = easeInOutCubic(clamp01((progress - cardStart) / 0.22));
          if (cardT <= 0) return null;
          const y0 = SB_Y0 + i * (CARD_H + CARD_GAP);
          const slideOffset = (1 - cardT) * 60;
          const isAlert = stat.alert;
          const valueColor = isAlert
            ? "rgb(230, 160, 40)"
            : "var(--foreground)";
          return (
            <g
              key={`stat-${i}`}
              transform={`translate(${slideOffset} 0)`}
              opacity={cardT}
            >
              <rect
                x={SB_X0}
                y={y0}
                width={SB_W}
                height={CARD_H}
                fill="var(--background)"
                stroke="var(--border)"
                strokeWidth={0.6}
              />
              <text
                x={SB_X0 + 10}
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
                <circle
                  cx={SB_X0 + 12}
                  cy={y0 + 30}
                  r={2.2}
                  fill="rgb(230, 160, 40)"
                />
              )}
              <text
                x={isAlert ? SB_X0 + 20 : SB_X0 + 10}
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

        {/* Title bar — slides down from above screen top */}
        {titleBarT > 0 && (
          <g opacity={titleBarT}>
            <rect
              x={SCR_X}
              y={titleBarY}
              width={SCR_W}
              height={TITLE_H}
              fill="var(--background)"
            />
            <line
              x1={SCR_X}
              y1={titleBarY + TITLE_H}
              x2={SCR_X + SCR_W}
              y2={titleBarY + TITLE_H}
              stroke="var(--border)"
              strokeWidth={0.6}
            />
            <text
              x={SCR_X + 12}
              y={titleBarY + 17}
              fontFamily="var(--font-jetbrains-mono), monospace"
              fontSize={9}
              fontWeight={600}
              fill="var(--foreground)"
              stroke="none"
              letterSpacing={0.8}
            >
              NB-FLEET MONITOR
            </text>
            <circle
              cx={SCR_X + SCR_W - 58}
              cy={titleBarY + 14}
              r={2.4}
              fill="rgb(80, 220, 110)"
            />
            <text
              x={SCR_X + SCR_W - 52}
              y={titleBarY + 17}
              fontFamily="var(--font-jetbrains-mono), monospace"
              fontSize={8}
              fill="var(--muted)"
              stroke="none"
              letterSpacing={0.6}
            >
              NOMINAL
            </text>
          </g>
        )}
      </g>
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
