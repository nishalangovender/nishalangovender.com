import { promises as fs } from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");
const WORDS_PER_MINUTE = 220;

export type BlogPostFrontmatter = {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  draft?: boolean;
};

export type BlogPostMeta = BlogPostFrontmatter & {
  slug: string;
  readingMinutes: number;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

async function readPostFile(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const fm = data as BlogPostFrontmatter;
    const wordCount = content.trim().split(/\s+/).length;
    const readingMinutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
    return { ...fm, slug, readingMinutes, content };
  } catch {
    return null;
  }
}

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(BLOG_DIR);
  } catch {
    return [];
  }

  const slugs = entries
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));

  const posts = await Promise.all(slugs.map((s) => readPostFile(s)));

  return posts
    .filter((p): p is BlogPost => p !== null && !p.draft)
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await readPostFile(slug);
  if (!post || post.draft) return null;
  return post;
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((p) => p.slug);
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
