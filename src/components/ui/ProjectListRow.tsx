"use client";

import { motion } from "framer-motion";

import { TechPill } from "@/components/ui/TechPill";
import type { Project } from "@/data/projects";

export default function ProjectListRow({
  project,
  index = 0,
}: {
  project: Project;
  /** Position in the current list — used to stagger the fade-up on mount. */
  index?: number;
}) {
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
        {/* ── Left: title + description ─────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-accent md:text-lg">
              {project.title}
            </h3>
            {project.featured && (
              <span
                className="font-mono text-[9px] tracking-wider uppercase text-accent"
                aria-label="Featured project"
              >
                ★ Featured
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-muted leading-relaxed line-clamp-2 md:line-clamp-none md:max-w-2xl">
            {project.description}
          </p>
        </div>

        {/* ── Right: tags + links ───────────────────────────────────────── */}
        <div className="flex flex-shrink-0 flex-col items-start gap-3 md:items-end">
          <div className="flex flex-wrap gap-1.5 md:justify-end">
            {project.tags.map((tag) => (
              <TechPill key={tag} size="sm">
                {tag}
              </TechPill>
            ))}
          </div>
          {(project.link || project.github) && (
            <div className="flex items-center gap-4">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-accent hover:text-accent-dark transition-colors"
                >
                  View Project &rarr;
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-muted hover:text-foreground transition-colors"
                >
                  Source
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover accent bar in the left gutter (matches card's bottom bar, rotated) */}
      <div
        className="absolute -left-3 top-5 bottom-5 w-[2px] origin-top scale-y-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-y-100"
        aria-hidden="true"
      />
    </motion.li>
  );
}
