/**
 * WorldFrame — the static world-coordinate frame axes and θ arc.
 *
 * Renders only the world-frame elements from the original SketchScaffold:
 *   - Y axis + arrowhead
 *   - X axis + arrowhead
 *   - Y / X labels
 *   - θ arc at the world-frame origin (80, 320)
 *   - θ label
 *
 * Does NOT render any body-frame overlay (body-x/y axes, V, ω, reference line).
 * Intended to be used alongside <BodyFrame /> in beats that animate the robot.
 */
export function WorldFrame() {
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

      {/* Heading-angle θ arc at world-frame origin */}
      <path
        d="M 130 320 A 50 50 0 0 0 125.3 298.9 M 130.6 303.0 L 125.3 298.9 L 125.1 305.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Labels */}
      <g
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize={14}
        fill="var(--foreground)"
        stroke="none"
      >
        <text x={68} y={117}>Y</text>
        <text x={526} y={324}>X</text>
        <text x={140} y={312}>θ</text>
      </g>
    </g>
  );
}
