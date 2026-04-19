import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

import { BackLink } from "@/components/ui/BackLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSection } from "@/components/ui/PageSection";
import { formatPostDate, getAllSlugs, getPostBySlug } from "@/lib/blog";

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const path = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: path },
    openGraph: {
      title: `${post.title} — Nishalan Govender`,
      description: post.description,
      url: path,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — Nishalan Govender`,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <PageSection maxWidth="max-w-3xl">
      <BackLink href="/blog">All Posts</BackLink>

      <header className="mt-8">
        <Eyebrow>Article</Eyebrow>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          {post.title}
        </h1>
        <div className="circuit-divider max-w-xs mt-6" />
        <p className="mt-6 font-mono text-xs uppercase tracking-wider text-muted">
          {formatPostDate(post.date)} · {post.readingMinutes} Min Read
          {post.updated && (
            <>
              {" "}
              · Updated {formatPostDate(post.updated)}
            </>
          )}
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
      </header>

      <article className="prose-blog mt-12">
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                [
                  rehypePrettyCode,
                  {
                    theme: { light: "github-light", dark: "github-dark" },
                    keepBackground: false,
                  },
                ],
              ],
            },
          }}
        />
      </article>

      <div className="mt-20 border-t border-border/60 pt-8">
        <BackLink href="/blog">Back To All Posts</BackLink>
      </div>
    </PageSection>
  );
}
