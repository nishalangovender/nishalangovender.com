import Link from "next/link";
import type { ReactNode } from "react";

interface BackLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * Monospace back-link with a leading arrow. Used at the top and bottom of
 * detail pages (blog posts, project case studies, demo pages) to return to
 * the parent index.
 */
export function BackLink({ href, children, className = "" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center font-mono text-xs tracking-wider uppercase text-muted transition-colors hover:text-accent ${className}`.trim()}
    >
      &larr; {children}
    </Link>
  );
}
