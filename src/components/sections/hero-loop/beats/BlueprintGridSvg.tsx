/**
 * Blueprint-grid pattern rendered as SVG, bounded to a region in world coords.
 * Replaces the CSS-based `.blueprint-grid` background div when placed inside
 * a panning transform — the grid stays with the sketch area and doesn't
 * intrude on other world regions (e.g. the factory interior).
 */

interface BlueprintGridSvgProps {
  /** Left edge in world coords. */
  x?: number;
  /** Top edge in world coords. */
  y?: number;
  /** Width in world coords. */
  width?: number;
  /** Height in world coords. */
  height?: number;
  /** Grid cell size. Matches the CSS .blueprint-grid 40px. */
  cell?: number;
}

export function BlueprintGridSvg({
  x = 0,
  y = 0,
  width = 640,
  height = 540,
  cell = 40,
}: BlueprintGridSvgProps) {
  return (
    <g aria-hidden="true">
      <defs>
        <pattern
          id="blueprintGridPattern"
          x={0}
          y={0}
          width={cell}
          height={cell}
          patternUnits="userSpaceOnUse"
        >
          {/* Vertical line at left edge of cell */}
          <line x1={0} y1={0} x2={0} y2={cell} stroke="var(--blueprint-line)" strokeWidth={1} />
          {/* Horizontal line at top edge of cell */}
          <line x1={0} y1={0} x2={cell} y2={0} stroke="var(--blueprint-line)" strokeWidth={1} />
        </pattern>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill="url(#blueprintGridPattern)" />
    </g>
  );
}
