import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSection } from "@/components/ui/PageSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPostDate, getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on robotics, embedded systems, controls, and the occasional full-stack rabbit hole.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Nishalan Govender",
    description:
      "Notes on robotics, embedded systems, controls, and the occasional full-stack rabbit hole.",
    url: "/blog",
    type: "website",
  },
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <PageSection maxWidth="max-w-4xl">
      <SectionHeading
        eyebrow="Writing"
        title="Blog"
        intro="Working notes on robotics, embedded systems, controls — and the occasional full-stack rabbit hole. Written for myself first; published in case it's useful to anyone else."
      />

      <div className="mt-16">
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-border/60">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block py-8 transition-colors"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <h2 className="text-xl font-semibold text-foreground transition-colors group-hover:text-accent sm:text-2xl">
                      {post.title}
                    </h2>
                    <p className="font-mono text-xs uppercase tracking-wider text-muted whitespace-nowrap">
                      {formatPostDate(post.date)} · {post.readingMinutes} Min Read
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted sm:text-[15px]">
                    {post.description}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border/70 bg-surface px-2.5 py-1 font-mono text-[11px] text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageSection>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-border/60 bg-surface px-6 py-12 text-center">
      <Eyebrow size="small">Coming Soon</Eyebrow>
      <p className="mt-3 text-muted">
        No posts published yet. Check back soon, or follow along on{" "}
        <a
          href="https://github.com/nishalangovender"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent transition-colors hover:text-accent-dark"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
