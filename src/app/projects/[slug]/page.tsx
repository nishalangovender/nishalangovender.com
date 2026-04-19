import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/ui/BackLink";
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
      <BackLink href="/projects">All Projects</BackLink>

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

      {/* ── Interactive demo CTA ─────────────────────────────────────── */}
      {project.interactiveDemoHref && (
        <section className="mt-12 rounded-lg border border-accent/30 bg-accent-light/60 p-6">
          <Eyebrow size="small">Interactive Demo</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Try the live simulation
          </h2>
          <p className="mt-2 text-muted max-w-2xl">
            The real EKF and Pure Pursuit controllers ported to TypeScript.
            Dial sensor noise, flip filter modes, and watch tracking change
            in real time.
          </p>
          <Link
            href={project.interactiveDemoHref}
            className="inline-flex items-center mt-4 rounded-md bg-accent px-4 py-2 font-mono text-xs tracking-wider uppercase text-surface hover:bg-accent-dark"
          >
            Open Demo →
          </Link>
        </section>
      )}

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
        <BackLink href="/projects">Back To All Projects</BackLink>
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
