"use client";

import Link from "next/link";

import type { Project } from "@/data/projects";

const BADGE_BASE =
  "font-mono text-[9px] tracking-wider uppercase rounded-full px-2 py-0.5";

/**
 * Shared badge row for ProjectCard and ProjectListRow. Reserves a fixed-height
 * slot (even when empty) so every project tile has identical vertical rhythm.
 * Live Demo and Demo Coming are mutually exclusive — a live demo always wins.
 */
export default function ProjectBadges({ project }: { project: Project }) {
  const demoLink = project.interactiveDemoHref;
  const demoComing = !demoLink && project.interactiveDemoPlanned;

  return (
    <div className="flex flex-wrap items-center gap-2 min-h-[1.25rem]">
      {project.featured && (
        <span className="font-mono text-[9px] tracking-wider uppercase text-accent">
          Featured
        </span>
      )}
      {project.confidential && (
        <span
          className={`${BADGE_BASE} border border-border bg-surface text-muted`}
        >
          Confidential
        </span>
      )}
      {demoLink && (
        <Link
          href={demoLink}
          className={`${BADGE_BASE} relative z-10 border border-accent bg-accent text-surface hover:bg-accent-dark`}
        >
          Live Demo &rarr;
        </Link>
      )}
      {demoComing && (
        <span
          className={`${BADGE_BASE} border border-accent/30 bg-accent-light text-accent`}
        >
          Demo Coming
        </span>
      )}
    </div>
  );
}
