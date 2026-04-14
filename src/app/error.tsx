"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSection } from "@/components/ui/PageSection";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageSection maxWidth="max-w-3xl">
      <div className="text-center">
        <Eyebrow>Error · Runtime</Eyebrow>

        <h1 className="mt-3 text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
          Something Broke
        </h1>

        <div className="circuit-divider max-w-xs mt-6 mx-auto" />

        <p className="mt-6 text-muted text-lg leading-relaxed max-w-xl mx-auto">
          An unexpected error occurred while rendering this page. Try reloading
          — if it keeps happening, please reach out so I can fix it.
        </p>

        {error.digest && (
          <p className="mt-6 font-mono text-xs text-muted">
            Reference: <span className="text-foreground/70">{error.digest}</span>
          </p>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center px-6 py-3 bg-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-surface transition-colors"
          >
            Back To Home
          </Link>
        </div>
      </div>
    </PageSection>
  );
}
