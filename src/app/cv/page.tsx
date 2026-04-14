import type { Metadata } from "next";

import CvRequestForm from "@/components/sections/CvRequestForm";
import {
  courses,
  education,
  experience,
  languages,
  openSource,
  profileSummary,
  skillCategories,
} from "@/data/cv";

export const metadata: Metadata = {
  title: "Profile — Nishalan Govender",
  description:
    "Public profile of Nishalan Govender — mechatronics engineer specialising in production robotics, embedded systems and controls. Request the full CV via the form.",
};

export default function CvPage() {
  return (
    <section className="blueprint-grid min-h-[calc(100dvh-4rem)] px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <p className="font-mono text-sm text-accent tracking-wider uppercase">
          At A Glance
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight leading-tight sm:text-5xl">
          Profile
        </h1>
        <div className="circuit-divider mt-6 max-w-xs" />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          A public overview of my work, education and technical background.
          For the complete CV — including tailored variants by region and
          role — use the request form below.
        </p>

        {/* ── Request Form ────────────────────────────────────────────── */}
        <div className="mt-12">
          <CvRequestForm />
        </div>

        {/* ── Summary ─────────────────────────────────────────────────── */}
        <ProfileSection label="Summary" title="Professional Summary">
          <p className="text-base leading-relaxed text-foreground/90 sm:text-[17px]">
            {profileSummary}
          </p>
        </ProfileSection>

        {/* ── Experience ──────────────────────────────────────────────── */}
        <ProfileSection label="Experience" title="Work Experience">
          <div className="space-y-12">
            {experience.map((entry) => (
              <article key={`${entry.company}-${entry.dates}`}>
                <header className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                      {entry.role}
                    </h3>
                    <p className="mt-1 text-sm text-muted sm:text-base">
                      {entry.companyUrl ? (
                        <a
                          href={entry.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent transition-colors hover:text-accent-dark"
                        >
                          {entry.company}
                        </a>
                      ) : (
                        <span className="text-foreground/80">
                          {entry.company}
                        </span>
                      )}
                      <span className="text-muted"> · {entry.location}</span>
                    </p>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted whitespace-nowrap">
                    {entry.dates}
                  </p>
                </header>

                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-[15px]">
                  {entry.context}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {entry.highlights.map((item, i) => (
                    <li
                      key={i}
                      className="relative pl-5 text-sm leading-relaxed text-foreground/90 sm:text-[15px] before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent/70"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </ProfileSection>

        {/* ── Education ───────────────────────────────────────────────── */}
        <ProfileSection label="Education" title="Education">
          <div className="space-y-10">
            {education.map((entry) => (
              <article key={entry.institution}>
                <header className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                      {entry.qualification}
                    </h3>
                    <p className="mt-1 text-sm text-muted sm:text-base">
                      <span className="text-foreground/80">
                        {entry.institution}
                      </span>
                      <span className="text-muted"> · {entry.location}</span>
                    </p>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted whitespace-nowrap">
                    {entry.dates}
                  </p>
                </header>

                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
                  {entry.highlights.map((item, i) => (
                    <li
                      key={i}
                      className="relative pl-5 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent/70"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </ProfileSection>

        {/* ── Technical Skills ────────────────────────────────────────── */}
        <ProfileSection label="Toolkit" title="Technical Skills">
          <div className="grid gap-6 sm:grid-cols-2">
            {skillCategories.map((category) => (
              <div key={category.label}>
                <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                  {category.label}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {category.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border/70 bg-surface px-2.5 py-1 font-mono text-[11px] text-foreground/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ProfileSection>

        {/* ── Courses & Languages row ─────────────────────────────────── */}
        <ProfileSection label="Training" title="Courses, Training & Languages">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                Courses & Training
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
                {courses.map((course) => (
                  <li
                    key={course}
                    className="relative pl-5 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent/70"
                  >
                    {course}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                Languages
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
                {languages.map((lang) => (
                  <li
                    key={lang.name}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <span className="text-foreground">{lang.name}</span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                      {lang.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ProfileSection>

        {/* ── Open Source ─────────────────────────────────────────────── */}
        <ProfileSection label="Community" title="Open Source & Research">
          <ul className="space-y-4">
            {openSource.map((item) => (
              <li key={item.title}>
                <p className="text-base font-semibold text-foreground">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-accent"
                    >
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted sm:text-[15px]">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </ProfileSection>
      </div>
    </section>
  );
}

/**
 * Shared section wrapper used throughout the profile: a small mono label,
 * a heading, a circuit-trace divider, and the content beneath.
 */
function ProfileSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-20">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">
        {label}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      <div className="circuit-divider mt-4 max-w-[10rem]" />
      <div className="mt-8">{children}</div>
    </section>
  );
}
