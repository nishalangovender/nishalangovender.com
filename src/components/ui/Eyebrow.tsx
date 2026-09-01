import type { ElementType, ReactNode } from "react";

type EyebrowProps = {
  as?: ElementType;
  /**
   * "default" = text-sm (page headers), "small" = text-xs (section labels),
   * "xsmall" = text-[11px] (in-section category labels),
   * "xxsmall" = text-[10px] (dense UI: card meta, demo panel labels),
   * "xxxsmall" = text-[9px] (ultra-dense: inline badge-row status flags).
   */
  size?: "default" | "small" | "xsmall" | "xxsmall" | "xxxsmall";
  /** Optional colour override — defaults to accent. */
  tone?: "accent" | "muted";
  /**
   * "plain" = bare tracked label. "chip" = starship-style directory chip:
   * bordered surface pill with a trailing `❯`, for page heroes.
   */
  variant?: "plain" | "chip";
  className?: string;
  children: ReactNode;
};

const SIZES = {
  default: "text-sm",
  small: "text-xs",
  xsmall: "text-[11px]",
  xxsmall: "text-[10px]",
  xxxsmall: "text-[9px]",
} as const;

const TONES = {
  accent: "text-accent",
  muted: "text-muted",
} as const;

const CHIP_CLASSES =
  "inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1";

/**
 * Monospace, uppercase, tracked label used above page and section headings.
 * Single source of truth for the eyebrow visual — do not hand-roll the class
 * string elsewhere.
 */
export function Eyebrow({
  as: Tag = "p",
  size = "default",
  tone = "accent",
  variant = "plain",
  className = "",
  children,
}: EyebrowProps) {
  const chrome = variant === "chip" ? CHIP_CLASSES : "";

  return (
    <Tag
      className={`font-mono tracking-wider uppercase ${SIZES[size]} ${TONES[tone]} ${chrome} ${className}`.trim()}
    >
      {children}
      {variant === "chip" && (
        <span aria-hidden="true" className="text-muted-dim">
          ❯
        </span>
      )}
    </Tag>
  );
}
