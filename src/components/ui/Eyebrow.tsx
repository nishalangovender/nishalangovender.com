import type { ElementType, ReactNode } from "react";

type EyebrowProps = {
  as?: ElementType;
  /**
   * "default" = text-sm (page headers), "small" = text-xs (section labels),
   * "xsmall" = text-[11px] (in-section category labels, card meta).
   */
  size?: "default" | "small" | "xsmall";
  /** Optional colour override — defaults to accent. */
  tone?: "accent" | "muted";
  className?: string;
  children: ReactNode;
};

const SIZES = {
  default: "text-sm",
  small: "text-xs",
  xsmall: "text-[11px]",
} as const;

const TONES = {
  accent: "text-accent",
  muted: "text-muted",
} as const;

/**
 * Monospace, uppercase, tracked label used above page and section headings.
 * Single source of truth for the eyebrow visual — do not hand-roll the class
 * string elsewhere.
 */
export function Eyebrow({
  as: Tag = "p",
  size = "default",
  tone = "accent",
  className = "",
  children,
}: EyebrowProps) {
  return (
    <Tag
      className={`font-mono tracking-wider uppercase ${SIZES[size]} ${TONES[tone]} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
