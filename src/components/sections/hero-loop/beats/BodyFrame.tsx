/**
 * BodyFrame — the body-frame overlay for the robot kinematic diagram.
 *
 * Parameterised by position (axleX, axleY) and heading (headingDeg in screen
 * coords, where 0° = +screen-x direction). All axes, vectors, and labels are
 * computed from these values so the overlay moves with the robot during Beat 4.
 *
 * At the default values (axleX=300, axleY=218, headingDeg=-25) the rendered
 * output is geometrically identical to the body-frame elements from the
 * original SketchScaffold component.
 *
 * Includes:
 *   - Dashed reference line from world origin (80, 320) to axle (optional)
 *   - Body-x axis (forward, along heading direction), length 120
 *   - Body-y axis (left of heading in screen ≈ perpendicular-left), length 90
 *   - Velocity vector V (same direction as body-x), length 160, accent colour
 *   - ω arc (270° CCW), lower-left of robot, accent colour
 *   - x / y / V / ω labels
 */

interface BodyFrameProps {
  /** Axle (body-frame origin) position in screen coords. */
  axleX: number;
  axleY: number;
  /** Robot heading in screen degrees (0 = +screen-x direction). */
  headingDeg: number;
  /** Whether to render the dashed origin-to-axle reference line. Default true. */
  showReferenceLine?: boolean;
  /** Opacity for the reference line (fades as robot moves away). Default 1. */
  referenceLineOpacity?: number;
}

/** Compute the two arrowhead wing points for a line from (bx,by) to (tx,ty). */
function arrowWings(
  bx: number,
  by: number,
  tx: number,
  ty: number,
  back = 8,
  side = 4,
) {
  const dx = tx - bx;
  const dy = ty - by;
  const L = Math.hypot(dx, dy);
  const ux = dx / L;
  const uy = dy / L;
  const px = -uy;
  const py = ux;
  return {
    w1x: tx - back * ux + side * px,
    w1y: ty - back * uy + side * py,
    w2x: tx - back * ux - side * px,
    w2y: ty - back * uy - side * py,
  };
}

export function BodyFrame({
  axleX,
  axleY,
  headingDeg,
  showReferenceLine = true,
  referenceLineOpacity = 1,
}: BodyFrameProps) {
  const h = (headingDeg * Math.PI) / 180;
  const cosH = Math.cos(h);
  const sinH = Math.sin(h);

  // ── Body-x axis ── (forward along heading, length 120)
  // Direction in screen: (cosH, sinH)
  const bxTipX = axleX + 120 * cosH;
  const bxTipY = axleY + 120 * sinH;
  const bxW = arrowWings(axleX, axleY, bxTipX, bxTipY);
  const bxD = `M ${axleX} ${axleY} L ${bxTipX} ${bxTipY} M ${bxW.w1x} ${bxW.w1y} L ${bxTipX} ${bxTipY} L ${bxW.w2x} ${bxW.w2y}`;

  // ── Body-y axis ── (perpendicular-left to heading in screen, length 90)
  // Screen perpendicular-left of (cosH, sinH): rotate 90° CCW on screen (since SVG y-inverted,
  // 90° CCW on screen = rotate vector (cos,sin) → (sin, -cos)).
  // Verified: at h=-25°, direction = (sin(-25°), -cos(-25°)) = (-0.4226, -0.9063)
  // tip = (300 + 90*(-0.4226), 218 + 90*(-0.9063)) = (262.0, 136.4) ✓
  const byDirX = sinH;
  const byDirY = -cosH;
  const byTipX = axleX + 90 * byDirX;
  const byTipY = axleY + 90 * byDirY;
  const byW = arrowWings(axleX, axleY, byTipX, byTipY);
  const byD = `M ${axleX} ${axleY} L ${byTipX} ${byTipY} M ${byW.w1x} ${byW.w1y} L ${byTipX} ${byTipY} L ${byW.w2x} ${byW.w2y}`;

  // ── Velocity vector V ── (same direction as body-x, length 160, accent)
  // Verified: at h=-25°, tip = (300 + 160*0.9063, 218 + 160*(-0.4226)) = (445.0, 150.4) ✓
  const vTipX = axleX + 160 * cosH;
  const vTipY = axleY + 160 * sinH;
  const vW = arrowWings(axleX, axleY, vTipX, vTipY);
  const vD = `M ${axleX} ${axleY} L ${vTipX} ${vTipY} M ${vW.w1x} ${vW.w1y} L ${vTipX} ${vTipY} L ${vW.w2x} ${vW.w2y}`;

  // ── ω arc ── 270° CCW arc, centred lower-left relative to axle
  const omegaCX = axleX - 150;
  const omegaCY = axleY - 30;
  const omegaR = 28;
  // 270° arc: start at top of circle (omegaCX, omegaCY - omegaR), sweep CCW to right
  // "M start A r r 0 largeArcFlag sweepFlag end"
  // For a 270° CCW arc (sweep-flag=0 in SVG = CCW): start (cx, cy-r) → end (cx+r, cy)
  // large-arc-flag = 1 (because 270° > 180°)
  const omegaStartX = omegaCX;
  const omegaStartY = omegaCY - omegaR;
  const omegaEndX = omegaCX + omegaR;
  const omegaEndY = omegaCY;
  // Arrowhead at the end of the arc — tangent direction at (cx+r, cy) for CCW arc is (0, 1)
  // (moving downward at that point on a CCW circle). Use arrowWings with a short "stem" along tangent.
  const omegaArrowD = `M ${omegaEndX - 8} ${omegaEndY} L ${omegaEndX} ${omegaEndY} L ${omegaEndX - 4} ${omegaEndY - 7} M ${omegaEndX} ${omegaEndY} L ${omegaEndX - 4} ${omegaEndY + 7}`;
  const omegaArcD = `M ${omegaStartX} ${omegaStartY} A ${omegaR} ${omegaR} 0 1 0 ${omegaEndX} ${omegaEndY}`;

  // ── Label positions ──
  // "x" near body-x tip
  const xLabelX = bxTipX + 6;
  const xLabelY = bxTipY - 4;
  // "y" near body-y tip
  const yLabelX = byTipX - 10;
  const yLabelY = byTipY;
  // "V" near V tip
  const vLabelX = vTipX + 7;
  const vLabelY = vTipY - 4;
  // "ω" fixed relative to ω arc
  const omegaLabelX = axleX - 120;
  const omegaLabelY = axleY - 25;

  const strokeProps = {
    fill: "none" as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <g style={{ color: "var(--foreground)" }}>
      {/* Dashed reference line from world origin to axle */}
      {showReferenceLine && (
        <path
          d={`M 80 320 L ${axleX} ${axleY}`}
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeDasharray="5 6"
          fill="none"
          opacity={referenceLineOpacity}
        />
      )}

      {/* Body-x axis */}
      <path
        d={bxD}
        stroke="currentColor"
        strokeWidth={1.75}
        {...strokeProps}
      />

      {/* Body-y axis */}
      <path
        d={byD}
        stroke="currentColor"
        strokeWidth={1.75}
        {...strokeProps}
      />

      {/* Velocity vector V */}
      <path
        d={vD}
        stroke="var(--accent)"
        strokeWidth={1.75}
        {...strokeProps}
      />

      {/* Angular velocity ω arc */}
      <path
        d={omegaArcD}
        stroke="var(--accent)"
        strokeWidth={1.75}
        {...strokeProps}
      />
      <path
        d={omegaArrowD}
        stroke="var(--accent)"
        strokeWidth={1.75}
        {...strokeProps}
      />

      {/* Labels */}
      <g
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize={14}
        stroke="none"
      >
        <text x={xLabelX} y={xLabelY} fill="var(--foreground)">x</text>
        <text x={yLabelX} y={yLabelY} fill="var(--foreground)">y</text>
        <text x={vLabelX} y={vLabelY} fill="var(--accent)">V</text>
        <text x={omegaLabelX} y={omegaLabelY} fill="var(--accent)">ω</text>
      </g>
    </g>
  );
}
