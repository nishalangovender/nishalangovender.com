"use client";

import Link from "next/link";

import type { Project } from "@/data/projects";

import { Badge } from "./Badge";
import { Eyebrow } from "./Eyebrow";

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
        <Eyebrow as="span" size="xxxsmall">
          Featured
        </Eyebrow>
      )}
      {project.confidential && <Badge>Confidential</Badge>}
      {demoLink && (
        <Link href={demoLink} className="relative z-10">
          <Badge
            variant="accentSolid"
            className="transition-colors hover:bg-accent-dark"
          >
            Live Demo &rarr;
          </Badge>
        </Link>
      )}
      {demoComing && <Badge variant="accentSoft">Demo Coming</Badge>}
    </div>
  );
}
