/**
 * Notebook-page substrate — cream paper with a faint warm dot-grid, used as
 * the background substrate for Beats 1–2 (and the opening frame of Beat 2
 * before the camera lifts off the page).
 *
 * Replaces BlueprintGridSvg on pages where the fiction is "Nish is writing
 * in his engineering notebook". Once the camera leaves the page (during Lift)
 * the substrate reverts to BlueprintGridSvg (the sketched-world background).
 */

interface NotebookPageSubstrateProps {
  /** Left edge in world coords. */
  x?: number;
  /** Top edge in world coords. */
  y?: number;
  /** Width in world coords. */
  width?: number;
  /** Height in world coords. */
  height?: number;
  /** Dot spacing. */
  cell?: number;
}

export function NotebookPageSubstrate({
  x = 0,
  y = 0,
  width = 640,
  height = 540,
  cell = 20,
}: NotebookPageSubstrateProps) {
  return (
    <g aria-hidden="true">
      <defs>
        <pattern
          id="notebookPageDotPattern"
          x={0}
          y={0}
          width={cell}
          height={cell}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={cell / 2}
            cy={cell / 2}
            r={0.9}
            fill="var(--notebook-page-dot, rgba(60, 45, 20, 0.22))"
          />
        </pattern>
      </defs>
      {/* Paper surface */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="var(--notebook-page, #F5EFE0)"
      />
      {/* Dot-grid overlay */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="url(#notebookPageDotPattern)"
      />
    </g>
  );
}
