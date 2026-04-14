import type { ReactNode } from "react";

type TechPillProps = {
  /** "default" = card pills (text-[10px]), "sm" = list row pills (text-[9px]). */
  size?: "default" | "sm";
  className?: string;
  children: ReactNode;
};

const SIZES = {
  default: "text-[10px] px-2.5 py-0.5",
  sm: "text-[9px] px-2 py-0.5",
} as const;

/**
 * Small monospace uppercase tag pill — used for project tags, CV skill tags
 * and anything else where a tight technical label sits alongside content.
 * Visually identical across ProjectCard and ProjectListRow except for size.
 */
export function TechPill({
  size = "default",
  className = "",
  children,
}: TechPillProps) {
  return (
    <span
      className={`font-mono tracking-wider uppercase rounded-full bg-accent-light text-accent ${SIZES[size]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
