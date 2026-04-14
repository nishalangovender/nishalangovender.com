import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSection } from "@/components/ui/PageSection";
import { Reveal } from "@/components/ui/Reveal";
import { TechPill } from "@/components/ui/TechPill";
import { getProjectBySlug, projects } from "@/data/projects";

type RouteParams = { slug: string };

export function generateStaticParams(): RouteParams[] {
  return projects
    .filter((p) => p.caseStudy)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const path = `/projects/${project.slug}`;
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: path },
    openGraph: {
      title: `${project.title} — Nishalan Govender`,
      description: project.description,
      url: path,
      type: "article",
      tags: [...project.tags],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — Nishalan Govender`,
      description: project.description,
    },
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project || !project.caseStudy) notFound();

  const { caseStudy } = project;

  return (
    <PageSection>
      {/* ── Back link ───────────────────────────────────────────────────── */}
      <Link
        href="/projects"
        className="inline-flex items-center font-mono text-xs tracking-wider uppercase text-muted transition-colors hover:text-accent"
      >
        &larr; All Projects
      </Link>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <header className="mt-8">
        <Eyebrow>Case Study</Eyebrow>

        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          {project.title}
        </h1>

        <div className="circuit-divider max-w-xs mt-6" />

        <p className="mt-6 text-lg text-muted leading-relaxed max-w-3xl">
          {project.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <TechPill key={tag}>{tag}</TechPill>
          ))}
        </div>

        {(project.link || project.github) && (
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-accent transition-colors hover:text-accent-dark"
              >
                Live Site &rarr;
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-muted transition-colors hover:text-foreground"
              >
                Source &rarr;
              </a>
            )}
          </div>
        )}
      </header>

      {/* ── Case study sections ─────────────────────────────────────────── */}
      <div className="mt-20 space-y-16">
        <CaseStudySection label="01" title="Problem" body={caseStudy.problem} />
        <CaseStudySection
          label="02"
          title="Approach"
          body={caseStudy.approach}
        />
        <CaseStudySection
          label="03"
          title="Technical Details"
          body={caseStudy.technicalDetails}
        />
        <CaseStudySection label="04" title="Outcome" body={caseStudy.outcome} />
      </div>

      {/* ── Tech stack ──────────────────────────────────────────────────── */}
      {caseStudy.techStack.length > 0 && (
        <section className="mt-20">
          <Eyebrow size="small">Tech Stack</Eyebrow>
          <div className="mt-4 flex flex-wrap gap-2">
            {caseStudy.techStack.map((item) => (
              <TechPill key={item}>{item}</TechPill>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer nav ──────────────────────────────────────────────────── */}
      <div className="mt-20 border-t border-border/60 pt-8">
        <Link
          href="/projects"
          className="inline-flex items-center font-mono text-xs tracking-wider uppercase text-muted transition-colors hover:text-accent"
        >
          &larr; Back To All Projects
        </Link>
      </div>
    </PageSection>
  );
}

// ─── Section primitive ────────────────────────────────────────────────────────

function CaseStudySection({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  // Split on double-newlines to preserve paragraph breaks from the data layer.
  const paragraphs = body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <Reveal as="section">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-sm text-accent tracking-wider">
          {label}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {title}
        </h2>
      </div>
      <div className="mt-6 space-y-5 text-foreground leading-relaxed max-w-3xl">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </Reveal>
  );
}
