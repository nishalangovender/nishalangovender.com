"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import ProjectBadges from "@/components/ui/ProjectBadges";
import { TechPill } from "@/components/ui/TechPill";
import { splitProjectTags, type Project } from "@/data/projects";

export default function ProjectListRow({
  project,
  index = 0,
}: {
  project: Project;
  /** Position in the current list — used to stagger the fade-up on mount. */
  index?: number;
}) {
  const hasCaseStudy = Boolean(project.caseStudy);
  const caseStudyHref = `/projects/${project.slug}`;
  const { discipline, technologies } = splitProjectTags(project.tags);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: Math.min(index * 0.04, 0.3),
        layout: { duration: 0.3, ease: "easeOut" },
      }}
      className="group relative border-t border-border/60 first:border-t-0"
    >
      <div className="flex flex-col gap-4 py-5 md:flex-row md:items-start md:justify-between md:gap-8">
        {/* ── Left: discipline + title + description ────────────────────── */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-3 min-h-[1.25rem]">
            <p className="font-mono text-[10px] tracking-wider uppercase text-accent">
              {discipline ?? ""}
            </p>
            <ProjectBadges project={project} />
          </div>
          {hasCaseStudy ? (
            <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-accent md:text-lg">
              <Link
                href={caseStudyHref}
                className="before:absolute before:inset-0 before:content-['']"
              >
                {project.title}
              </Link>
            </h3>
          ) : (
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              {project.title}
            </h3>
          )}
          <p className="mt-1.5 text-sm text-muted leading-relaxed line-clamp-2 md:line-clamp-none md:max-w-2xl">
            {project.description}
          </p>
        </div>

        {/* ── Right: tech pills + links ─────────────────────────────────── */}
        <div className="flex flex-shrink-0 flex-col items-start gap-3 md:items-end">
          <div className="flex gap-1.5 overflow-hidden md:justify-end">
            {technologies.map((tag) => (
              <TechPill key={tag} size="sm">
                {tag}
              </TechPill>
            ))}
          </div>
          {(hasCaseStudy || project.link || project.github) && (
            <div className="flex items-center gap-4">
              {hasCaseStudy && (
                <Link
                  href={caseStudyHref}
                  className="font-mono text-xs text-accent hover:text-accent-dark transition-colors"
                >
                  Case Study &rarr;
                </Link>
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 font-mono text-xs text-muted hover:text-foreground transition-colors"
                >
                  Live Site
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 font-mono text-xs text-muted hover:text-foreground transition-colors"
                >
                  Source
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover accent bar — only when row is interactive */}
      {hasCaseStudy && (
        <div
          className="absolute -left-3 top-5 bottom-5 w-[2px] origin-top scale-y-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-y-100"
          aria-hidden="true"
        />
      )}
    </motion.li>
  );
}
