"use client";

import type { BeatProps } from "../types";

import { BlueprintGridSvg } from "./BlueprintGridSvg";
import { Factory } from "./Factory";
import { RobotStatic } from "./RobotStatic";
import { SketchScaffold } from "./SketchScaffold";
import { Terminal, BEAT4_OUTPUT_LINES } from "./Terminal";

/**
 * Beat 4 (9.0–13.5s): drive.
 *
 * The static sketch (world frame + kinematic diagram at rest) stays in place
 * throughout. The robot drives off along a two-segment path:
 *   1. Straight segment along its original -25° heading (accelerating in a
 *      straight line, like a real robot exiting a staging area).
 *   2. Curved segment that bends toward horizontal, ending the beat pointing
 *      roughly along the world X-axis — ready for the factory pan.
 *
 * Tangent is continuous at the join so there's no visible kink. The trail
 * fades in over the first 15% of the beat (avoiding the "trail pops into
 * existence" effect) and then reveals along the robot's path.
 *
 * From progress=0.35 a combined pan+zoom camera transform activates:
 *   - Camera zooms out (scale 1.0 → 0.35) to reveal the large warehouse.
 *   - Camera pans to keep the robot centred on screen.
 *
 * The Terminal lives in screen-space (outside the pan+zoom group) and is
 * fixed at y=410..520 in the new 640×540 viewBox.
 *
 * Sub-timing:
 *   0.00–0.35  straight segment (along -25° heading)
 *   0.35–1.00  curved segment (bends toward horizontal, extends into factory)
 *   0.00–0.15  trail fades in 0 → 0.65 opacity
 *   0.00–1.00  trail reveals as robot progresses
 *   0.00–0.50  bay closes (production robot)
 *   0.00–1.00  LIDAR sweeps (2 revolutions)
 *   0.00–1.00  camera recording LED blinks
 *   0.35–1.00  pan+zoom camera activates (zoom 1.0→0.35, track robot)
 *   0.25–0.60  factory fades in
 *   0.05–0.65  ROS 2 output lines appear below terminal command (4 lines)
 */
export function BeatDrive({ progress, active }: BeatProps) {
  if (!active) return null;

  // Path in WORLD coords (all geometry lives in the panning world).
  // P0 matches Beat 3's end-state exactly.
  const P0 = { x: 318, y: 210 };

  // Heading for the straight segment (matches end of Beat 3)
  const START_HEADING_RAD = (-25 * Math.PI) / 180;

  // End of straight segment / start of curve. 80 units along -25° heading.
  const STRAIGHT_LEN = 80;
  const M = {
    x: P0.x + STRAIGHT_LEN * Math.cos(START_HEADING_RAD),
    y: P0.y + STRAIGHT_LEN * Math.sin(START_HEADING_RAD),
  };

  // Control point for the curve — along the same -25° tangent from M so the
  // join is smooth. Placing it 40 units forward along the heading.
  const CTRL_OFFSET = 40;
  const C = {
    x: M.x + CTRL_OFFSET * Math.cos(START_HEADING_RAD),
    y: M.y + CTRL_OFFSET * Math.sin(START_HEADING_RAD),
  };

  // End of curve — robot drives well into the factory lane (world y=165 is the lane centre-line).
  const E = { x: 820, y: 165 };

  // Split progress between the two segments.
  //   0.00–0.35 maps to straight 0→1
  //   0.35–1.00 maps to curve 0→1
  const SPLIT = 0.35;

  const tEased = easeInOutCubic(progress);
  let currX: number;
  let currY: number;
  let headingDeg: number;
  if (tEased <= SPLIT) {
    // Straight segment
    const seg = tEased / SPLIT;
    currX = P0.x + (M.x - P0.x) * seg;
    currY = P0.y + (M.y - P0.y) * seg;
    headingDeg = -25;
  } else {
    // Curved segment (quadratic Bezier M → C → E)
    const seg = (tEased - SPLIT) / (1 - SPLIT);
    const omt = 1 - seg;
    currX = omt * omt * M.x + 2 * omt * seg * C.x + seg * seg * E.x;
    currY = omt * omt * M.y + 2 * omt * seg * C.y + seg * seg * E.y;
    // Tangent of the quadratic bezier
    const tanX = 2 * omt * (C.x - M.x) + 2 * seg * (E.x - C.x);
    const tanY = 2 * omt * (C.y - M.y) + 2 * seg * (E.y - C.y);
    headingDeg = (Math.atan2(tanY, tanX) * 180) / Math.PI;
  }

  // Trail path: straight from P0 to M, then quadratic curve M→C→E.
  const pathD = `M ${P0.x} ${P0.y} L ${M.x} ${M.y} Q ${C.x} ${C.y} ${E.x} ${E.y}`;
  const approxLen =
    Math.hypot(M.x - P0.x, M.y - P0.y) + bezierLength(M, C, E);
  const trailOffset = approxLen * (1 - tEased);

  // Fade the trail in over the first 15% of the beat so it doesn't pop in
  const trailFadeIn = Math.min(1, progress / 0.15);
  const trailOpacity = 0.65 * trailFadeIn;

  // LIDAR: 720 deg/s — matches Beat 3's post-boot sweep rate for continuity.
  // Beat 4 is 4.5s → 720 × 4.5 = 3240° = 9 revolutions.
  const lidarAngle = progress * 3240;

  // Bay closes LATE — prototype drives off the page first, then transforms
  // into a production robot once it's well inside the warehouse.
  // Stays fully open until progress 0.55, closes 0.55→0.95.
  const bayOpen = 1 - Math.max(0, Math.min(1, (progress - 0.55) / 0.4));

  // Camera recording blink
  const cameraLedOn = Math.floor(progress * 30) % 2 === 0;

  // Factory fade-in: progress 0.25 → 0.60
  const factoryOpacity = Math.min(1, Math.max(0, (progress - 0.25) / 0.35));

  // Terminal: command line always visible, output lines appear progressively
  const terminalLines = [
    { prompt: "$ ", text: "ros2 launch nish_bot bringup.launch.py" },
    ...(progress >= 0.05 ? [BEAT4_OUTPUT_LINES[0]] : []),
    ...(progress >= 0.25 ? [BEAT4_OUTPUT_LINES[1]] : []),
    ...(progress >= 0.45 ? [BEAT4_OUTPUT_LINES[2]] : []),
    ...(progress >= 0.65 ? [BEAT4_OUTPUT_LINES[3]] : []),
  ];

  // Terminal stays fixed below the kinematic diagram area (y=366, same as
  // Beat 3). Lives in the world frame; pans and scales with the sketch.
  const terminalY = 366;

  // --- Combined pan+zoom camera transform ---
  // Starts at progress=0.35 (matches SPLIT). Before that, identity.
  // Camera zooms out 1.0 → 0.35 as the warehouse is revealed.
  // Robot is kept at roughly (robotScreenX, robotScreenY) on screen.
  //
  // Sanity check at progress=0 (before SPLIT):
  //   viewProgress=0, viewEased=0, zoomScale=1.0
  //   robotScreenX=318, robotScreenY=210, currX=318, currY=210 (P0)
  //   transform = "translate(318 210) scale(1) translate(-318 -210)" → identity ✓
  //
  // Sanity check at progress=1:
  //   viewProgress=1, viewEased=1, zoomScale=0.35
  //   robotScreenX=320, robotScreenY=260, currX=820, currY=165 (E)
  //   transform maps world (820, 165):
  //     screen = (320 + 0.35*(820-820), 260 + 0.35*(165-165)) = (320, 260) ✓
  const viewProgress = Math.max(0, (progress - 0.35) / 0.65);
  const viewEased = easeInOutCubic(viewProgress);
  const zoomScale = 1.0 - 0.65 * viewEased;
  const robotScreenX = 318 + (320 - 318) * viewEased;
  const robotScreenY = 210 + (260 - 210) * viewEased;
  const cameraTransform = `translate(${robotScreenX} ${robotScreenY}) scale(${zoomScale}) translate(${-currX} ${-currY})`;

  return (
    <svg
      viewBox="0 0 640 540"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
    >
      {/* Pan+zoom group — world-space content tracks the robot and zooms out. */}
      <g transform={cameraTransform}>
        {/* Sketch bundle — blueprint grid + kinematic diagram + terminal.
            Stay visible throughout; pan and scale with the world so they end
            up small and left-of-robot at end-state. */}
        <BlueprintGridSvg x={0} y={0} width={640} height={540} />
        <SketchScaffold />
        <Terminal
          x={80}
          y={terminalY}
          width={440}
          height={110}
          lines={terminalLines}
          opacity={1}
        />

        {/* Factory — large warehouse placed off the right edge of the sketch world.
            Defaults: x=640, y=-250, width=1600, height=900. */}
        <Factory opacity={factoryOpacity} />

        {/* Trail behind the robot — fades in, then reveals along the path */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeDashoffset={trailOffset}
          pathLength={approxLen}
          opacity={trailOpacity}
        />

        {/* Robot — bay closes as it drives. All coords are world coords. */}
        <RobotStatic
          ledsOn={true}
          lidarAngle={lidarAngle}
          cameraRecording={cameraLedOn}
          centerX={currX}
          centerY={currY}
          yawDeg={headingDeg}
          bayOpen={bayOpen}
        />
      </g>
    </svg>
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Approximate quadratic Bezier arc length by sampling. */
function bezierLength(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
): number {
  const N = 20;
  let len = 0;
  let prev = p0;
  for (let i = 1; i <= N; i++) {
    const tt = i / N;
    const omt = 1 - tt;
    const pt = {
      x: omt * omt * p0.x + 2 * omt * tt * p1.x + tt * tt * p2.x,
      y: omt * omt * p0.y + 2 * omt * tt * p1.y + tt * tt * p2.y,
    };
    len += Math.hypot(pt.x - prev.x, pt.y - prev.y);
    prev = pt;
  }
  return len;
}
