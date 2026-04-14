import type { ReactNode } from "react";

import { Eyebrow } from "./Eyebrow";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  /** Optional intro paragraph rendered below the circuit divider. */
  intro?: ReactNode;
  /** "h1" for page-level headings, "h2" for subsections. Defaults to h1. */
  as?: "h1" | "h2";
  /** Max width applied to the intro paragraph. Defaults to max-w-2xl. */
  introMaxWidth?: "max-w-xl" | "max-w-2xl";
  className?: string;
};

/**
 * Composes the site's standard section header triplet: a monospace eyebrow,
 * a bold heading, a circuit-trace divider and an optional intro paragraph.
 * Keeps page heads visually aligned without hand-rolling the scaffolding.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  as = "h1",
  introMaxWidth = "max-w-2xl",
  className = "",
}: SectionHeadingProps) {
  const Tag = as;
  const headingSize =
    as === "h1"
      ? "text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
      : "text-2xl sm:text-3xl font-bold tracking-tight";

  return (
    <div className={className}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Tag className={`mt-3 ${headingSize}`}>{title}</Tag>
      <div className="circuit-divider max-w-xs mt-6" />
      {intro && (
        <p
          className={`mt-6 text-muted text-lg leading-relaxed ${introMaxWidth}`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
