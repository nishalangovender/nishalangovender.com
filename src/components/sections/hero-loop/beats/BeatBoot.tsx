"use client";

import type { BeatProps } from "../types";

import { Notebook } from "./Notebook";
import { RobotStatic } from "./RobotStatic";
import { SketchScaffold } from "./SketchScaffold";
import { Terminal } from "./Terminal";

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

  const lines = [{ prompt: promptShown, text: commandShown }];

  return (
    <svg
      viewBox="0 0 640 540"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
    >
      <Notebook />

      {/* Sketch + robot live inside the notebook page via this transform
          — matches Beat 1's sketch placement. */}
      <g transform="translate(84.4 147.6) scale(0.82)">
        {/* Analysis overlay — same as Beat 1/2 */}
        <SketchScaffold />

        {/* Robot — fully materialised, with progress-driven LEDs + LIDAR + recording indicator */}
        <RobotStatic ledsOn={ledsOn} lidarAngle={lidarAngle} cameraRecording={cameraLedOn} />
      </g>

      {/* Terminal — on the desk above the notebook, full viewport scale. */}
      <Terminal
        x={100}
        y={20}
        width={440}
        height={110}
        lines={lines}
        cursor={{ line: 0, char: charsShown }}
        cursorVisible={cursorVisible}
        opacity={terminalFade}
      />
    </svg>
  );
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
