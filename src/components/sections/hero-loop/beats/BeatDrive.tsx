"use client";

import type { BeatProps } from "../types";

import { Factory } from "./Factory";
import { Notebook } from "./Notebook";
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

  // End of curve — robot drives deep into the factory lane to push the
  // notebook + terminal off the left edge of the frame by beat end,
  // creating a clear "prototype → production" separation between the
  // notebook zone and the warehouse zone.
  const E = { x: 1800, y: 150 };

  // Split progress between the two segments.
  //   0.00–0.35 maps to straight 0→1
  //   0.35–1.00 maps to curve 0→1
  const SPLIT = 0.35;

  // Linear progress (constant velocity) — continuous motion across the
  // Beat 4 → Beat 5 seam. Beat 5's hero-robot drift also uses linear
  // motion so velocity is continuous.
  const tEased = progress;
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

  // Terminal sits on the desk above the notebook (same as Beat 3), full
  // viewport scale, outside the camera transform. Stays fully visible for
  // the whole beat.

  // --- Page xform (matches Beats 1–3: sketch sits on the notebook page) ---
  const PAGE_SX = 0.82;
  const PAGE_TX = 84.4;
  const PAGE_TY = 147.6;
  const pageX = (w: number) => PAGE_TX + PAGE_SX * w;
  const pageY = (w: number) => PAGE_TY + PAGE_SX * w;

  // --- Combined pan+zoom camera transform (applied AFTER the page xform) ---
  // At progress ≤ SPLIT (0.35): camera identity — the robot sits on the page
  // at the same screen position as the end of Beat 3 (pageX(P0.x), pageY(P0.y)).
  // At progress = 1: the scene has zoomed out so the warehouse fills most of
  // the frame, with the robot kept near screen (320, 260) for the Beat 5
  // handoff. Effective compound zoom at end = 0.43 * 0.82 ≈ 0.35 (matches
  // the pre-notebook behaviour).
  const viewProgress = Math.max(0, (progress - 0.35) / 0.65);
  const viewEased = easeInOutCubic(viewProgress);
  const zoomScale = 1.0 - (1.0 - 0.43) * viewEased;
  const robotStartScreenX = pageX(P0.x);
  const robotStartScreenY = pageY(P0.y);
  const robotEndScreenX = 320;
  const robotEndScreenY = 260;
  const robotScreenX =
    robotStartScreenX + (robotEndScreenX - robotStartScreenX) * viewEased;
  const robotScreenY =
    robotStartScreenY + (robotEndScreenY - robotStartScreenY) * viewEased;
  // Current robot position in PAGE coords (after the page xform).
  const currPageX = pageX(currX);
  const currPageY = pageY(currY);
  const cameraTransform = `translate(${robotScreenX} ${robotScreenY}) scale(${zoomScale}) translate(${-currPageX} ${-currPageY})`;

  return (
    <svg
      viewBox="0 0 640 540"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
    >
      {/* Camera group — entire scene pans/zooms as the warehouse reveals. */}
      <g transform={cameraTransform}>
        {/* Notebook sits inside the camera so it pans/scales with the
            scene. At progress ≤ SPLIT it fills the viewport; by end it
            has shrunk to the left-of-warehouse area. */}
        <Notebook />

        {/* Terminal — on the desk above the notebook. Inside the camera so
            it pans/zooms with the scene, keeping the desk composition intact
            as the view pulls back to the warehouse. */}
        <Terminal
          x={100}
          y={20}
          width={440}
          height={110}
          lines={terminalLines}
          opacity={1}
        />

        {/* All world-coord content lives inside the page xform so the
            sketch, robot, factory, and trail sit on/past the notebook page. */}
        <g transform={`translate(${PAGE_TX} ${PAGE_TY}) scale(${PAGE_SX})`}>
          <SketchScaffold />

          {/* Factory — large warehouse placed off the right edge of the
              sketch world (past the page's right edge, post-page-xform). */}
          <Factory opacity={factoryOpacity} />

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
      </g>

    </svg>
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

