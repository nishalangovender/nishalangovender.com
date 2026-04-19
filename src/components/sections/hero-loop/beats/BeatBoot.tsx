"use client";

import type { BeatProps } from "../types";

import { RobotStatic } from "./RobotStatic";
import { SketchScaffold } from "./SketchScaffold";

/**
 * Beat 3 (6.5–9.0s): boot sequence.
 *
 * The robot sits as materialised at end of Beat 2. A terminal card appears
 * centred along the bottom (below the diagram); the ros2 launch command
 * types; LEDs switch from unlit to lit blue; LIDAR begins a rotational sweep.
 *
 * Sub-timing (progress within 2.5s beat):
 *   0.00–0.10  terminal card fades in
 *   0.10–0.65  "ros2 launch nish_bot bringup.launch.py" types char-by-char
 *   0.65–0.80  LEDs switch from unlit to lit (both eyes pop on simultaneously)
 *   0.50–1.00  LIDAR rotation sweep (starts just after typing finishes, makes
 *              ~2.5 revolutions across the remaining 1.25s so the scan is
 *              clearly visible — an external accent beam extends past the
 *              chassis as the scan ray)
 *   0.70–1.00  camera recording LED blinks red
 *   0.80–1.00  steady lit robot with ongoing LIDAR sweep
 */
export function BeatBoot({ progress, active }: BeatProps) {
  if (!active) return null;

  const terminalFade = clamp01(progress / 0.10);
  const typeProgress = clamp01((progress - 0.10) / 0.55);
  const ledsOn = progress >= 0.65;
  // Start earlier, run longer, ~2.5 revolutions across the window for visible motion
  const lidarAngle = progress >= 0.50 ? ((progress - 0.50) / 0.50) * 900 : 0;
  // Camera recording LED: starts after boot sequence, blinks at ~3 Hz
  const cameraRecording = progress >= 0.70;
  const cameraLedOn = cameraRecording && Math.floor(progress * 30) % 2 === 0;

  const PROMPT = "$ ";
  const COMMAND = "ros2 launch nish_bot bringup.launch.py";
  const CMD = PROMPT + COMMAND;
  const charsShown = Math.ceil(typeProgress * CMD.length);
  const promptShown = CMD.slice(0, Math.min(charsShown, PROMPT.length));
  const commandShown = charsShown > PROMPT.length ? CMD.slice(PROMPT.length, charsShown) : "";
  const cursorVisible = typeProgress < 1 || Math.floor(progress * 10) % 2 === 0;

  return (
    <svg
      viewBox="0 0 640 400"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
    >
      {/* Analysis overlay — same as Beat 1/2 */}
      <SketchScaffold />

      {/* Robot — fully materialised, with progress-driven LEDs + LIDAR + recording indicator */}
      <RobotStatic ledsOn={ledsOn} lidarAngle={lidarAngle} cameraRecording={cameraLedOn} />

      {/* Terminal card — spans the same width as the world-frame axes (x=80..520) */}
      <g opacity={terminalFade}>
        {/* Card background */}
        <rect
          x={80}
          y={348}
          width={440}
          height={46}
          rx={4}
          fill="rgb(15, 15, 15)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
        />
        {/* Traffic-light dots (macOS terminal style) */}
        <circle cx={94} cy={359} r={3} fill="rgb(220, 95, 85)" />
        <circle cx={104} cy={359} r={3} fill="rgb(230, 190, 80)" />
        <circle cx={114} cy={359} r={3} fill="rgb(120, 200, 110)" />
        {/* Title bar separator */}
        <line x1={80} y1={367} x2={520} y2={367} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />

        {/* Typed command — prompt in green, command in light grey */}
        <text
          y={384}
          fontFamily="var(--font-jetbrains-mono), monospace"
          fontSize={11}
          stroke="none"
        >
          <tspan x={90} fill="rgb(120, 200, 110)">{promptShown}</tspan>
          <tspan fill="rgb(220, 220, 220)">{commandShown}</tspan>
        </text>

        {/* Blinking cursor */}
        {cursorVisible && (
          <rect
            x={90 + charsShown * 6.6}
            y={375}
            width={5}
            height={11}
            fill="rgb(220, 220, 220)"
          />
        )}
      </g>
    </svg>
  );
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
