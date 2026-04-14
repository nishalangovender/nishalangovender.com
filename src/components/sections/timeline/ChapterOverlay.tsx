"use client";

import type { TimelineChapter } from "@/data/timeline";

import { FIXED_ZOOM } from "./scroll-math";
import { yearToPosition } from "./TimelineStrip";

/** Pad from viewport edges — enough room for commit label text */
const PAD_PCT = 12;
/** How far below the main line the branch runs (px) */
const BRANCH_DROP = 60;
/** Curve radius for fork/merge bends */
const CURVE_R = 20;

/**
 * Map a year to viewport percentage for a given chapter's zoom.
 * Uses the strip's yearToPosition so commits/braces align with the
 * underlying SVG dots perfectly.
 */
function yearToViewportPct(
  year: number,
  chapterCenter: number,
  zoom: number,
): number {
  return ((yearToPosition(year) - chapterCenter) * zoom + 0.5) * 100;
}

export function ChapterOverlay({
  chapter,
}: {
  chapter: TimelineChapter;
  chapterIndex: number;
}) {
  const zoom = FIXED_ZOOM;
  const n = chapter.commits.length;
  const span = 100 - 2 * PAD_PCT;

  // Use chronological positioning if all commits have years,
  // otherwise fall back to even spacing. Then spread out any
  // clusters where commits share the same year.
  const allHaveYears = chapter.commits.every((c) => c.year != null);
  const rawPositions = chapter.commits.map((c, i) => {
    if (allHaveYears) {
      const yearNum = parseFloat(c.year!.replace(/[^0-9.]/g, ""));
      return yearToViewportPct(yearNum, chapter.stripPosition, zoom);
    }
    return PAD_PCT + (n > 1 ? (i / (n - 1)) * span : span / 2);
  });

  // Spread clusters symmetrically around their centre
  const MIN_GAP = 5;
  const positions = [...rawPositions];
  let ci = 0;
  while (ci < positions.length) {
    let cj = ci + 1;
    while (
      cj < positions.length &&
      rawPositions[cj] - rawPositions[ci] < MIN_GAP
    )
      cj++;
    const size = cj - ci;
    if (size > 1) {
      const center = (rawPositions[ci] + rawPositions[cj - 1]) / 2;
      const totalSpan = (size - 1) * MIN_GAP;
      for (let k = 0; k < size; k++) {
        positions[ci + k] = center - totalSpan / 2 + k * MIN_GAP;
      }
    }
    ci = cj;
  }

  const commitX = (i: number) => positions[i];

  const forkIdx = Math.max(1, Math.floor(n * 0.3));
  const mergeIdx = Math.min(n - 1, Math.ceil(n * 0.85));
  const forkPct = commitX(forkIdx);
  const mergePct = commitX(mergeIdx);

  // Scale dot size with zoom so dots look consistent across chapters
  const dotScale = Math.max(1, zoom / 2.2);
  const dotSize = Math.round(12 * dotScale);
  const borderW = Math.round(2 * dotScale);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* ── Floating notes (no dot) — positioned between two years ── */}
      {chapter.notes?.map((note, idx) => {
        const leftPct = yearToViewportPct(
          note.fromYear,
          chapter.stripPosition,
          zoom,
        );
        const rightPct = yearToViewportPct(
          note.toYear,
          chapter.stripPosition,
          zoom,
        );
        const widthPct = rightPct - leftPct;
        const pad = widthPct * 0.25;
        return (
          <div
            key={idx}
            className="absolute flex items-center justify-center text-left"
            style={{
              left: `${leftPct + pad}%`,
              width: `${widthPct - pad * 2}%`,
              top: "calc(50% + 56px)",
            }}
          >
            <span className="text-[11px] text-foreground/60 italic leading-tight">
              {note.text}
            </span>
          </div>
        );
      })}

      {/* ── Commit dots + stem lines + labels below the strip line ── */}
      <div
        className="absolute left-0 right-0"
        style={{ top: "50%", height: `${BRANCH_DROP + 200}px` }}
      >
        {(() => {
          const STEM_BASE = 44;
          const STEM_STEP = 80;
          const CLUSTER_THRESH = 12;

          const stemHeights: number[] = new Array(n).fill(STEM_BASE);
          let si = 0;
          while (si < n) {
            let sj = si + 1;
            while (sj < n && positions[sj] - positions[sj - 1] < CLUSTER_THRESH)
              sj++;
            const clusterSize = sj - si;
            if (clusterSize > 1) {
              for (let k = 0; k < clusterSize; k++) {
                stemHeights[si + k] = STEM_BASE + (k % 2) * STEM_STEP;
              }
            }
            si = sj;
          }

          const boundaryPcts = [2000, 2005, 2014, 2019, 2024, 2026, 2028].map(
            (y) => yearToViewportPct(y, chapter.stripPosition, zoom),
          );

          return chapter.commits.map((commit, j) => {
            const x = commitX(j);
            const stemH = stemHeights[j];

            const nearLeft = x < 15;
            const nearRight = x > 85;

            const nearBoundaryRight = boundaryPcts.some(
              (bp) => bp > x && bp - x < 10,
            );
            const nearBoundaryLeft = boundaryPcts.some(
              (bp) => bp < x && x - bp < 10,
            );

            const nextCommitClose = j < n - 1 && positions[j + 1] - x < 10;
            const prevCommitClose = j > 0 && x - positions[j - 1] < 10;

            let anchorClass: string;
            if (commit.anchor === "right") {
              anchorClass = "right-0 items-end text-right";
            } else if (commit.anchor === "left") {
              anchorClass = "left-0 items-start text-left";
            } else if (commit.anchor === "center") {
              anchorClass = "left-1/2 -translate-x-1/2 items-start text-left";
            } else if (nearLeft || nearBoundaryLeft) {
              anchorClass = "left-0 items-start text-left";
            } else if (nearRight || nearBoundaryRight || nextCommitClose) {
              anchorClass = "right-0 items-end text-right";
            } else if (prevCommitClose) {
              anchorClass = "left-0 items-start text-left";
            } else {
              anchorClass = "left-1/2 -translate-x-1/2 items-start text-left";
            }

            const dateLabel = commit.displayYear || commit.year;

            return (
              <div
                key={j}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: 0,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {dateLabel && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-foreground/60 font-medium"
                    style={{ bottom: `calc(100% + 4px)` }}
                  >
                    {dateLabel}
                  </div>
                )}
                <div
                  className="rounded-full bg-accent border-background relative z-10"
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderWidth: borderW,
                    borderStyle: "solid",
                  }}
                />
                <div
                  className="absolute left-1/2 -translate-x-1/2 bg-foreground/20"
                  style={{
                    top: "100%",
                    height: `${stemH}px`,
                    width: Math.max(1, dotScale),
                  }}
                />
                <div
                  className={`absolute flex flex-col ${anchorClass}`}
                  style={{ top: `calc(100% + ${stemH + 4}px)` }}
                >
                  {commit.message.split("\n").map((line, li) => (
                    <span
                      key={li}
                      className="whitespace-nowrap text-[11px] text-foreground/80 font-medium leading-tight"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            );
          });
        })()}

        {/* ── Branches (below the strip line) ── */}
        {chapter.branches?.map((branch) => {
          const branchEvents = branch.events;
          const ne = branchEvents.length;

          const bForkPct = branch.forkYear
            ? yearToViewportPct(
                parseFloat(branch.forkYear),
                chapter.stripPosition,
                zoom,
              )
            : forkPct;
          const bMergePct = branch.mergeYear
            ? yearToViewportPct(
                parseFloat(branch.mergeYear),
                chapter.stripPosition,
                zoom,
              )
            : mergePct;

          const branchSpan = bMergePct - bForkPct;
          const padPct = branchSpan * 0.15;
          const eventPct = (k: number) =>
            ne === 1
              ? bForkPct + branchSpan / 2
              : bForkPct + padPct + (k / (ne - 1)) * (branchSpan - 2 * padPct);

          return (
            <div key={branch.name}>
              <div
                className="absolute rounded-full bg-accent border-background z-10"
                style={{
                  left: `${bForkPct}%`,
                  top: 0,
                  transform: "translate(-50%, -50%)",
                  width: dotSize,
                  height: dotSize,
                  borderWidth: borderW,
                  borderStyle: "solid",
                }}
              />

              <svg
                className="absolute overflow-visible"
                style={{
                  left: `calc(${bForkPct}% - ${CURVE_R}px)`,
                  top: 0,
                  width: CURVE_R * 2,
                  height: BRANCH_DROP + CURVE_R,
                }}
              >
                <path
                  d={`M ${CURVE_R} 0 C ${CURVE_R} ${CURVE_R}, ${CURVE_R * 2} ${CURVE_R}, ${CURVE_R * 2} ${BRANCH_DROP}`}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  strokeOpacity={0.45}
                />
              </svg>

              <div
                className="absolute h-[2px] border-t-2 border-dashed border-accent/30"
                style={{
                  left: `calc(${bForkPct}% + ${CURVE_R}px)`,
                  right: `calc(${100 - bMergePct}% + ${CURVE_R}px)`,
                  top: BRANCH_DROP,
                }}
              />

              <svg
                className="absolute overflow-visible"
                style={{
                  left: `calc(${bMergePct}% - ${CURVE_R}px)`,
                  top: 0,
                  width: CURVE_R * 2,
                  height: BRANCH_DROP + CURVE_R,
                }}
              >
                <path
                  d={`M 0 ${BRANCH_DROP} C 0 ${CURVE_R}, ${CURVE_R} ${CURVE_R}, ${CURVE_R} 0`}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  strokeOpacity={0.45}
                />
              </svg>

              <div
                className="absolute rounded-full bg-accent border-background z-10"
                style={{
                  left: `${bMergePct}%`,
                  top: 0,
                  transform: "translate(-50%, -50%)",
                  width: dotSize,
                  height: dotSize,
                  borderWidth: borderW,
                  borderStyle: "solid",
                }}
              />

              <div
                className="absolute font-mono text-[9px] text-accent/50 bg-accent/5 px-1.5 py-0.5 rounded-sm tracking-wider whitespace-nowrap"
                style={{
                  left: `${(bForkPct + bMergePct) / 2}%`,
                  top: BRANCH_DROP - 20,
                  transform: "translateX(-50%)",
                }}
              >
                {branch.name}
              </div>

              {branchEvents.map((event, k) => {
                const x = eventPct(k);
                const labelDrop = 6;
                return (
                  <div
                    key={k}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      top: BRANCH_DROP,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {event.date && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-foreground/60 font-medium"
                        style={{ bottom: `calc(100% + 4px)` }}
                      >
                        {event.date}
                      </div>
                    )}
                    <div className="w-2.5 h-2.5 rounded-full bg-accent/50 border-2 border-background relative z-10" />
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-px bg-accent/20"
                      style={{ top: "100%", height: `${labelDrop}px` }}
                    />
                    {(() => {
                      const alignClass =
                        k === 0
                          ? "left-0 items-start text-left"
                          : k === ne - 1
                            ? "right-0 items-end text-right"
                            : "left-1/2 -translate-x-1/2 items-start text-left";
                      return (
                        <div
                          className={`absolute flex flex-col ${alignClass}`}
                          style={{ top: `calc(100% + ${labelDrop + 2}px)` }}
                        >
                          {event.text.split("\n").map((line, li) => (
                            <span
                              key={li}
                              className={`whitespace-nowrap text-[11px] ${li === 0 ? "text-foreground/80 font-medium" : "text-foreground/50"} leading-tight`}
                            >
                              {line}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
