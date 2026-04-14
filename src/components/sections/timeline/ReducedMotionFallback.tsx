import { timelineChapters } from "@/data/timeline";

/** Vertical fallback shown when the user prefers reduced motion. */
export function ReducedMotionFallback() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        {timelineChapters.map((chapter) => (
          <div key={chapter.id} className="mb-12">
            <h3 className="text-xl font-bold">{chapter.title}</h3>
            <p className="text-sm text-muted font-mono">
              {chapter.subtitle} · {chapter.yearRange}
            </p>
            {chapter.description && (
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {chapter.description}
              </p>
            )}
            <div className="mt-3 space-y-1">
              {chapter.commits.map((c, i) => (
                <p key={i} className="text-sm text-foreground/80">
                  <span className="font-mono text-accent/60 text-xs">
                    {c.prefix}
                  </span>{" "}
                  {c.message}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
