import type { ReactNode } from "react";

type Variant = "neutral" | "accent" | "accentSolid" | "accentSoft";
type Size = "sm" | "md";

const base =
  "font-mono tracking-wider uppercase rounded-full";

const sizeClasses: Record<Size, string> = {
  sm: "text-[9px] px-2 py-0.5",
  md: "text-[11px] px-3 py-1",
};

const variantClasses: Record<Variant, string> = {
  neutral: "border border-border bg-surface text-muted",
  accent: "border border-accent/30 text-accent",
  accentSolid: "border border-accent bg-accent text-surface",
  accentSoft: "border border-accent/30 bg-accent-light text-accent",
};

interface BadgeProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

/**
 * Pill-shaped monospace badge used to surface project/status metadata.
 * For plain monospace labels (no pill, no background) use `<Eyebrow>` instead.
 */
export function Badge({
  variant = "neutral",
  size = "sm",
  className = "",
  children,
}: BadgeProps) {
  return (
    <span
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
