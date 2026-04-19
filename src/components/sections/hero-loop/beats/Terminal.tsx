"use client";

export interface TerminalLine {
  prompt?: string; // e.g., "$ "; rendered in green
  text: string; // the rest of the line
  color?: string; // optional colour for `text` (defaults to light grey)
}

interface TerminalProps {
  /** Left edge in SVG user coords. */
  x: number;
  /** Top edge in SVG user coords. */
  y: number;
  /** Card width. */
  width: number;
  /** Card height. */
  height: number;
  /** All lines currently visible (including partially-typed lines). */
  lines: TerminalLine[];
  /** Cursor position — line index and character offset within that line. If undefined, no cursor. */
  cursor?: { line: number; char: number };
  /** Whether the cursor is visible this frame. */
  cursorVisible?: boolean;
  /** Overall opacity multiplier. */
  opacity?: number;
  /** Text size in px. Default 11. Smaller values let more lines fit. */
  fontSize?: number;
}

/**
 * macOS-style terminal card. Renders a title bar with traffic-light dots, then
 * a scrollback of text lines (each optionally starting with a green prompt).
 * Font: JetBrains Mono at 11px. Line height 14px.
 * Traffic-light dots fixed at the left of the title bar (y = y+12).
 * Title separator at y = y+20.
 * First text baseline at y = y+36.
 */
export function Terminal({
  x,
  y,
  width,
  height,
  lines,
  cursor,
  cursorVisible = false,
  opacity = 1,
  fontSize = 11,
}: TerminalProps) {
  // JetBrains Mono char width ≈ 0.6× font size
  const CHAR_W = fontSize * 0.6;
  const LINE_H = fontSize + 3;
  const textStartX = x + 10;
  const firstBaselineY = y + 24 + fontSize;

  // Figure out cursor screen position
  let cursorX = 0;
  let cursorY = 0;
  if (cursor) {
    cursorX = textStartX + cursor.char * CHAR_W;
    cursorY = firstBaselineY + cursor.line * LINE_H - fontSize + 1;
  }

  return (
    <g opacity={opacity}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill="rgb(15, 15, 15)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1}
      />
      {/* Traffic-light dots */}
      <circle cx={x + 14} cy={y + 12} r={3} fill="rgb(220, 95, 85)" />
      <circle cx={x + 24} cy={y + 12} r={3} fill="rgb(230, 190, 80)" />
      <circle cx={x + 34} cy={y + 12} r={3} fill="rgb(120, 200, 110)" />
      {/* Title separator */}
      <line
        x1={x}
        y1={y + 20}
        x2={x + width}
        y2={y + 20}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.5}
      />

      {/* Lines */}
      {lines.map((line, i) => {
        const baselineY = firstBaselineY + i * LINE_H;
        return (
          <text
            key={i}
            y={baselineY}
            fontFamily="var(--font-jetbrains-mono), monospace"
            fontSize={fontSize}
            stroke="none"
          >
            {line.prompt && (
              <tspan x={textStartX} fill="rgb(120, 200, 110)">
                {line.prompt}
              </tspan>
            )}
            <tspan
              x={line.prompt ? undefined : textStartX}
              fill={line.color ?? "rgb(220, 220, 220)"}
            >
              {line.text}
            </tspan>
          </text>
        );
      })}

      {/* Cursor */}
      {cursor && cursorVisible && (
        <rect
          x={cursorX}
          y={cursorY}
          width={CHAR_W * 0.75}
          height={fontSize}
          fill="rgb(220, 220, 220)"
        />
      )}
    </g>
  );
}

export const BEAT4_OUTPUT_LINES: TerminalLine[] = [
  { text: "[INFO] [controller_manager]: Loaded nish_bot_controllers" },
  { text: "[INFO] [slam_toolbox]: Initialising pose graph" },
  { text: "[INFO] [nav2_lifecycle_manager]: Activating Nav2 stack" },
  { text: "[INFO] [lidar_ros2]: /scan publishing at 10 Hz" },
];
