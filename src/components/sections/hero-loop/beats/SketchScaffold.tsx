"use client";

/**
 * Shared end-state composition of Beat 1's kinematic diagram — rendered as
 * static paths (no stroke-along animation). Used by BeatLift, BeatBoot and
 * (in frozen form) BeatDrive to keep the diagram visible as background.
 *
 * Positions and labels are hand-tuned values from Beat 1's approved layout.
 * Do NOT regenerate these procedurally (see BodyFrame for the parameterised
 * equivalent used only by BeatDrive's moving overlay).
 *
 * Does NOT render the chassis + drive wheels — those are handled by the
 * consumer because the robot is the element that changes.
 */
export function SketchScaffold() {
  return (
    <g style={{ color: "var(--foreground)" }}>
      {/* World frame — Y axis */}
      <path
        d="M 80 320 L 80 115 M 76 123 L 80 115 L 84 123"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* World frame — X axis */}
      <path
        d="M 80 320 L 520 320 M 512 316 L 520 320 L 512 324"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Straight dashed θ-reference line */}
      <path
        d="M 80 320 L 300 218"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeDasharray="5 6"
        fill="none"
      />

      {/* Heading-angle θ */}
      <path
        d="M 130 320 A 50 50 0 0 0 125.3 298.9 M 130.6 303.0 L 125.3 298.9 L 125.1 305.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Body-x axis */}
      <path
        d="M 300 218 L 408.8 167.3 M 403.2 174.3 L 408.8 167.3 L 399.8 167.0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Body-y axis */}
      <path
        d="M 300 218 L 262.0 136.4 M 269.0 142.0 L 262.0 136.4 L 261.7 145.4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Velocity vector V */}
      <path
        d="M 300 218 L 445.0 150.4 M 439.4 157.4 L 445.0 150.4 L 436.1 150.1"
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Angular velocity ω */}
      <path
        d="M 122 200 A 28 28 0 1 0 150 172 M 156 169 L 150 172 L 156 175"
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Labels — hand-tuned positions (do not regenerate procedurally) */}
      <g
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize={14}
        fill="var(--foreground)"
        stroke="none"
      >
        <text x={68}  y={117}>Y</text>
        <text x={526} y={324}>X</text>
        <text x={140} y={312}>θ</text>
        <text x={415} y={183}>x</text>
        <text x={252} y={132}>y</text>
        <text x={452} y={148} fill="var(--accent)">V</text>
        <text x={180} y={185} fill="var(--accent)">ω</text>
      </g>
    </g>
  );
}
