import type { ElementType, ReactNode } from "react";

type PageSectionProps = {
  as?: ElementType;
  className?: string;
  innerClassName?: string;
  /** Max width of the inner container. Defaults to max-w-5xl. */
  maxWidth?: "max-w-3xl" | "max-w-4xl" | "max-w-5xl";
  children: ReactNode;
};

/**
 * Full-height page section with the blueprint-grid background, standard
 * vertical padding and a constrained inner container. Used as the outer
 * shell on every top-level page.
 */
export function PageSection({
  as: Tag = "section",
  className = "",
  innerClassName = "",
  maxWidth = "max-w-5xl",
  children,
}: PageSectionProps) {
  return (
    <Tag
      className={`blueprint-grid min-h-[calc(100dvh-4rem)] px-4 py-20 sm:py-24 ${className}`.trim()}
    >
      <div className={`mx-auto ${maxWidth} ${innerClassName}`.trim()}>
        {children}
      </div>
    </Tag>
  );
}
