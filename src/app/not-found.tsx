import type { Metadata } from "next";

import { LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSection } from "@/components/ui/PageSection";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <PageSection maxWidth="max-w-3xl">
      <div className="text-center">
        <Eyebrow>Error · 404</Eyebrow>

        <h1 className="mt-3 text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
          Page Not Found
        </h1>

        <div className="circuit-divider max-w-xs mt-6 mx-auto" />

        <p className="mt-6 text-muted text-lg leading-relaxed max-w-xl mx-auto">
          The route you requested doesn&apos;t exist — it may have moved, been
          renamed, or never existed in the first place. Try one of the links
          below.
        </p>

        <pre
          aria-hidden="true"
          className="mt-12 mx-auto inline-block text-left rounded-lg border border-border bg-surface px-5 py-4 font-mono text-xs text-muted"
        >
          {`$ curl -I ${typeof window === "undefined" ? "<requested>" : window.location.pathname}\nHTTP/2 404 Not Found`}
        </pre>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <LinkButton href="/">Back To Home</LinkButton>
          <LinkButton href="/projects" variant="outline">
            View Projects
          </LinkButton>
        </div>
      </div>
    </PageSection>
  );
}
