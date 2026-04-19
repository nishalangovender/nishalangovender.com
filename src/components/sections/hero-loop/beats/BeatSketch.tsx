"use client";

import { StrokePath } from "../primitives/StrokePath";
import { Typewriter } from "../primitives/Typewriter";
import type { BeatProps } from "../types";

import { Notebook } from "./Notebook";

/**
 * Beat 1 (0.0–3.5s): a hardbound A5 notebook held landscape sits in the
 * viewport. The kinematic diagram draws itself on the bottom page — one
 * stroke at a time, with pen-lift gaps between strokes and easeOut velocity
 * on each stroke.
 *
 * The sketch's internal geometry (axes, chassis, vectors, labels) is the
 * same as the original full-viewport layout, transformed onto the bottom
 * page via a single wrapper group (non-scaling-stroke keeps line weight
 * visually identical). Transform is tuned so the world-frame X and Y
 * axes land exactly on the page's 20px dot-grid rows:
 *   X axis (world y=320) → screen y=410 (dot row)
 *   Y axis (world x=80)  → screen x=150 (dot column)
 * Transform: translate(84.4 147.6) scale(0.82).
 *
 * Stroke schedule unchanged from the pre-notebook version.
 */
export function BeatSketch({ progress, active }: BeatProps) {
  if (!active) return null;

  const p = progress;

  return (
    <svg
      viewBox="0 0 640 540"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
    >
      <Notebook />

      {/* Sketch content — transformed onto the bottom page. */}
      <g transform="translate(84.4 147.6) scale(0.82)">
        {/* World frame — Y axis */}
        <StrokePath
          d="M 80 320 L 80 115 M 76 123 L 80 115 L 84 123"
          progress={stroke(p, 0.0, 0.1)}
          vectorEffect="non-scaling-stroke"
        />
        {/* World frame — X axis */}
        <StrokePath
          d="M 80 320 L 520 320 M 512 316 L 520 320 L 512 324"
          progress={stroke(p, 0.11, 0.2)}
          vectorEffect="non-scaling-stroke"
        />

        {/* Robot — rounded corners, rotated -25° around the robot centre */}
        <g transform="rotate(-25 318 210)">
          {/* Chassis */}
          <StrokePath
            d="M 258 175 h 120 v 70 h -120 Z"
            progress={stroke(p, 0.22, 0.35)}
            vectorEffect="non-scaling-stroke"
          />
          {/* Top drive wheel */}
          <StrokePath
            d="M 284 161 h 28 q 3 0 3 3 v 8 q 0 3 -3 3 h -28 q -3 0 -3 -3 v -8 q 0 -3 3 -3 Z"
            progress={stroke(p, 0.36, 0.42)}
            vectorEffect="non-scaling-stroke"
          />
          {/* Bottom drive wheel */}
          <StrokePath
            d="M 284 245 h 28 q 3 0 3 3 v 8 q 0 3 -3 3 h -28 q -3 0 -3 -3 v -8 q 0 -3 3 -3 Z"
            progress={stroke(p, 0.43, 0.49)}
            vectorEffect="non-scaling-stroke"
          />
        </g>

        {/* Straight dashed θ-reference line from origin to axle */}
        <path
          d="M 80 320 L 300 218"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeDasharray="5 6"
          strokeDashoffset={260 * (1 - stroke(p, 0.5, 0.62))}
          fill="none"
          opacity={stroke(p, 0.5, 0.62)}
          vectorEffect="non-scaling-stroke"
        />

        {/* Heading-angle θ — arc at origin with arrowhead */}
        <StrokePath
          d="M 130 320 A 50 50 0 0 0 125.3 298.9 M 130.6 303.0 L 125.3 298.9 L 125.1 305.6"
          progress={stroke(p, 0.63, 0.7)}
          vectorEffect="non-scaling-stroke"
        />

        {/* Body frame — x axis */}
        <StrokePath
          d="M 300 218 L 408.8 167.3 M 403.2 174.3 L 408.8 167.3 L 399.8 167.0"
          progress={stroke(p, 0.71, 0.77)}
          vectorEffect="non-scaling-stroke"
        />
        {/* Body frame — y axis */}
        <StrokePath
          d="M 300 218 L 262.0 136.4 M 269.0 142.0 L 262.0 136.4 L 261.7 145.4"
          progress={stroke(p, 0.78, 0.83)}
          vectorEffect="non-scaling-stroke"
        />

        {/* Velocity vector V */}
        <StrokePath
          d="M 300 218 L 445.0 150.4 M 439.4 157.4 L 445.0 150.4 L 436.1 150.1"
          progress={stroke(p, 0.84, 0.89)}
          stroke="var(--accent)"
          vectorEffect="non-scaling-stroke"
        />

        {/* Angular velocity ω */}
        <StrokePath
          d="M 122 200 A 28 28 0 1 0 150 172 M 156 169 L 150 172 L 156 175"
          progress={stroke(p, 0.9, 0.95)}
          stroke="var(--accent)"
          vectorEffect="non-scaling-stroke"
        />

        {/* Labels */}
        <Typewriter text="Y" progress={stroke(p, 0.96, 0.98)} x={68}  y={117} />
        <Typewriter text="X" progress={stroke(p, 0.96, 0.98)} x={526} y={324} />
        <Typewriter text="θ" progress={stroke(p, 0.97, 0.99)} x={140} y={312} />
        <Typewriter text="x" progress={stroke(p, 0.97, 0.99)} x={415} y={183} />
        <Typewriter text="y" progress={stroke(p, 0.97, 0.99)} x={252} y={132} />
        <Typewriter text="V" progress={stroke(p, 0.98, 1.0)} x={452} y={148} />
        <Typewriter text="ω" progress={stroke(p, 0.98, 1.0)} x={180} y={185} />
      </g>
    </svg>
  );
}

/**
 * Map overall beat progress `p` to a per-stroke eased progress in [0,1].
 * Before `start` → 0; after `end` → 1; inside the window → easeOut cubic.
 */
function stroke(p: number, start: number, end: number): number {
  if (p <= start) return 0;
  if (p >= end) return 1;
  const t = (p - start) / (end - start);
  return 1 - Math.pow(1 - t, 3);
}
