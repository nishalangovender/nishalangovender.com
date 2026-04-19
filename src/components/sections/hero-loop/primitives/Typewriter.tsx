"use client";

interface TypewriterProps {
  text: string;
  /** Progress in [0,1] across this typewriter window. */
  progress: number;
  x: number;
  y: number;
  fontSize?: number;
}

/** Renders a prefix of `text` whose length grows with progress. Using `ceil`
 * so short labels (single-character like "V", "x", "θ") become visible as
 * soon as progress > 0 rather than only at progress === 1. */
export function Typewriter({ text, progress, x, y, fontSize = 14 }: TypewriterProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const shown = text.slice(0, Math.ceil(clamped * text.length));
  return (
    <text
      x={x}
      y={y}
      fontFamily="var(--font-jetbrains-mono), monospace"
      fontSize={fontSize}
      fill="var(--foreground)"
      stroke="none"
    >
      {shown}
    </text>
  );
}
