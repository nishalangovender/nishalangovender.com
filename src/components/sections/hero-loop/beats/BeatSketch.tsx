"use client";

import { StrokePath } from "../primitives/StrokePath";
import { Typewriter } from "../primitives/Typewriter";
import type { BeatProps } from "../types";

import { BlueprintGridSvg } from "./BlueprintGridSvg";

/**
 * Beat 1 (0.0–2.0s): top-down differential-drive kinematic diagram rendered
 * as if drawn by hand — one stroke at a time, with pen-lift gaps between
 * strokes and easeOut velocity on each stroke.
 *
 * Geometry:
 *   World origin         (80, 320)
 *   Axle (body origin)   (300, 218)    — visual centre of the world-frame plot
 *   Robot centre         (318, 210)    — axle + 20 forward along heading
 *   Chassis              120 × 70 sharp-cornered, rotated -25° screen
 *   Drive wheels         34 × 14 rounded, body-frame x = −20 (rearward)
 *   Body-x axis          length 120, from axle
 *   Body-y axis          length 90, from axle
 *   Velocity V           length 160, from axle along heading
 *   ω arc                lower-left, +CCW per right-hand rule
 *
 * Stroke schedule (progress-within-beat [0..1]):
 *
 *   Reference frame first, then the robot, then the analysis vectors:
 *
 *   0.00–0.10  Y axis
 *   0.11–0.20  X axis
 *   0.22–0.35  chassis
 *   0.36–0.42  top wheel
 *   0.43–0.49  bottom wheel
 *   0.50–0.62  dashed θ-reference line
 *   0.63–0.70  θ arc + arrowhead
 *   0.71–0.77  body-x axis
 *   0.78–0.83  body-y axis
 *   0.84–0.89  V vector
 *   0.90–0.95  ω arc
 *   0.96–1.00  labels (all at once, very short window)
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
      <BlueprintGridSvg />
      {/* World frame — Y axis */}
      <StrokePath
        d="M 80 320 L 80 115 M 76 123 L 80 115 L 84 123"
        progress={stroke(p, 0.00, 0.10)}
      />
      {/* World frame — X axis */}
      <StrokePath
        d="M 80 320 L 520 320 M 512 316 L 520 320 L 512 324"
        progress={stroke(p, 0.11, 0.20)}
      />

      {/* Robot — rounded corners, rotated -25° around the robot centre */}
      <g transform="rotate(-25 318 210)">
        {/* Chassis — sharp corners for engineering-sketch honesty */}
        <StrokePath
          d="M 258 175 h 120 v 70 h -120 Z"
          progress={stroke(p, 0.22, 0.35)}
        />
        {/* Top drive wheel */}
        <StrokePath
          d="M 284 161 h 28 q 3 0 3 3 v 8 q 0 3 -3 3 h -28 q -3 0 -3 -3 v -8 q 0 -3 3 -3 Z"
          progress={stroke(p, 0.36, 0.42)}
        />
        {/* Bottom drive wheel */}
        <StrokePath
          d="M 284 245 h 28 q 3 0 3 3 v 8 q 0 3 -3 3 h -28 q -3 0 -3 -3 v -8 q 0 -3 3 -3 Z"
          progress={stroke(p, 0.43, 0.49)}
        />
      </g>

      {/* Straight dashed θ-reference line from origin to axle */}
      <path
        d="M 80 320 L 300 218"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeDasharray="5 6"
        strokeDashoffset={260 * (1 - stroke(p, 0.50, 0.62))}
        fill="none"
        opacity={stroke(p, 0.50, 0.62)}
      />

      {/* Heading-angle θ — arc at origin with arrowhead */}
      <StrokePath
        d="M 130 320 A 50 50 0 0 0 125.3 298.9 M 130.6 303.0 L 125.3 298.9 L 125.1 305.6"
        progress={stroke(p, 0.63, 0.70)}
      />

      {/* Body frame — x axis (forward from axle, length 120) */}
      <StrokePath
        d="M 300 218 L 408.8 167.3 M 403.2 174.3 L 408.8 167.3 L 399.8 167.0"
        progress={stroke(p, 0.71, 0.77)}
      />
      {/* Body frame — y axis (lateral left from axle, length 90) */}
      <StrokePath
        d="M 300 218 L 262.0 136.4 M 269.0 142.0 L 262.0 136.4 L 261.7 145.4"
        progress={stroke(p, 0.78, 0.83)}
      />

      {/* Velocity vector V — accent, from axle along heading, length 160 */}
      <StrokePath
        d="M 300 218 L 445.0 150.4 M 439.4 157.4 L 445.0 150.4 L 436.1 150.1"
        progress={stroke(p, 0.84, 0.89)}
        stroke="var(--accent)"
      />

      {/* Angular velocity ω — accent, lower-left, 270° CCW with +CCW arrowhead */}
      <StrokePath
        d="M 122 200 A 28 28 0 1 0 150 172 M 156 169 L 150 172 L 156 175"
        progress={stroke(p, 0.90, 0.95)}
        stroke="var(--accent)"
      />

      {/* Labels — staggered slightly inside the tail window */}
      <Typewriter text="Y" progress={stroke(p, 0.96, 0.98)} x={68}  y={117} />
      <Typewriter text="X" progress={stroke(p, 0.96, 0.98)} x={526} y={324} />
      <Typewriter text="θ" progress={stroke(p, 0.97, 0.99)} x={140} y={312} />
      <Typewriter text="x" progress={stroke(p, 0.97, 0.99)} x={415} y={183} />
      <Typewriter text="y" progress={stroke(p, 0.97, 0.99)} x={252} y={132} />
      <Typewriter text="V" progress={stroke(p, 0.98, 1.00)} x={452} y={148} />
      <Typewriter text="ω" progress={stroke(p, 0.98, 1.00)} x={180} y={185} />
    </svg>
  );
}

/**
 * Map overall beat progress `p` to a per-stroke eased progress in [0,1].
 * Before `start` → 0; after `end` → 1; inside the window → easeOut cubic.
 * The cubic easeOut (1 - (1-t)^3) decelerates: a pen lifts, reaches target.
 */
function stroke(p: number, start: number, end: number): number {
  if (p <= start) return 0;
  if (p >= end) return 1;
  const t = (p - start) / (end - start);
  return 1 - Math.pow(1 - t, 3);
}
