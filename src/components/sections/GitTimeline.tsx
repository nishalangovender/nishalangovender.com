"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { fadeUp, staggerContainer } from "@/lib/animations";
import { timelineYears, TimelineEvent, TimelineBranch } from "@/data/timeline";

/**
 * Tenure periods — years where you were at one place.
 * Line segments between two dots that both fall within the same period are bold.
 */
const tenurePeriods = [
  { start: 2026, end: 2026 }, // Freelance
  { start: 2024, end: 2025 }, // BATTALION
  { start: 2019, end: 2023 }, // Stellenbosch
  { start: 2014, end: 2018 }, // Maritzburg College
  { start: 2005, end: 2013 }, // Cordwalles
];

function yearToNumber(year: string): number {
  return parseInt(year);
}

function isWithinTenure(yearA: string, yearB: string): boolean {
  const a = yearToNumber(yearA);
  const b = yearToNumber(yearB);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return tenurePeriods.some(
    (period) => lo >= period.start && hi <= period.end
  );
}

function getYearGap(index: number): number {
  if (index === 0) return 0;
  const currentYear = yearToNumber(timelineYears[index].year);
  const previousYear = yearToNumber(timelineYears[index - 1].year);
  const rawGap = Math.abs(currentYear - previousYear);
  const gap = Math.min(rawGap, 4);
  return Math.max(gap, 1) * 24;
}

function EventContent({ event, showMonth = true }: { event: TimelineEvent; showMonth?: boolean }) {
  const isInstitution = event.logo || event.isTitle;

  return (
    <div className={`flex items-start gap-3 min-w-0 ${event.logo ? "mt-1" : ""}`}>
      {showMonth && event.month && (
        <span className="font-mono text-xs text-muted flex-shrink-0 w-20 mt-0.5">
          {event.month}
        </span>
      )}
      {showMonth && !event.month && <span className="flex-shrink-0 w-20" />}
      {event.logo && (
        <Image
          src={event.logo}
          alt={`${event.text} logo`}
          width={28}
          height={28}
          className="rounded-sm object-contain flex-shrink-0 mt-0.5"
        />
      )}
      {isInstitution ? (
        <div>
          <span className="text-base sm:text-lg font-semibold text-foreground">
            {event.text}
          </span>
          {event.subtitle && (
            <p className="text-sm text-muted">{event.subtitle}</p>
          )}
        </div>
      ) : (
        <span className="text-sm text-muted break-words">{event.text}</span>
      )}
    </div>
  );
}

function BranchVisual({ branch }: { branch: TimelineBranch }) {
  // Layout constants
  const branchOffsetX = 40; // how far right the branch sits from the main line
  const commitSpacing = 32; // vertical space between branch commits
  const forkHeight = 24; // vertical drop for the fork curve
  const mergeHeight = 24; // vertical drop for the merge curve
  const totalCommitHeight = (branch.events.length - 1) * commitSpacing;
  const svgHeight = forkHeight + totalCommitHeight + mergeHeight;

  return (
    <div className="relative mt-3 mb-1" style={{ marginLeft: "-8px" }}>
      {/* SVG for branch/merge lines */}
      <svg
        width={branchOffsetX + 8}
        height={svgHeight}
        className="absolute top-0 left-0"
        style={{ overflow: "visible" }}
      >
        {/* Fork curve: from main line (0, 0) curving right to branch start */}
        <path
          d={`M 0,0 C 0,${forkHeight * 0.6} ${branchOffsetX},${forkHeight * 0.4} ${branchOffsetX},${forkHeight}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-accent/30"
        />
        {/* Vertical branch line between commits */}
        {totalCommitHeight > 0 && (
          <line
            x1={branchOffsetX}
            y1={forkHeight}
            x2={branchOffsetX}
            y2={forkHeight + totalCommitHeight}
            stroke="currentColor"
            strokeWidth="1"
            className="text-accent/30"
          />
        )}
        {/* Merge curve: from last commit curving left back to main line */}
        <path
          d={`M ${branchOffsetX},${forkHeight + totalCommitHeight} C ${branchOffsetX},${forkHeight + totalCommitHeight + mergeHeight * 0.6} 0,${forkHeight + totalCommitHeight + mergeHeight * 0.4} 0,${svgHeight}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-accent/30"
        />
      </svg>

      {/* Branch label */}
      <div
        className="absolute font-mono text-xs text-accent/70 bg-accent/5 border border-accent/20 rounded px-2 py-0.5"
        style={{ left: branchOffsetX + 16, top: 0 }}
      >
        {branch.name}
      </div>

      {/* Branch commit dots and labels */}
      {branch.events.map((event, i) => (
        <div
          key={i}
          className="absolute flex items-center gap-2"
          style={{
            left: branchOffsetX - 5,
            top: forkHeight + i * commitSpacing - 5,
          }}
        >
          <div className="w-[10px] h-[10px] rounded-full bg-accent/40 border-2 border-background relative z-10 flex-shrink-0" />
          <span className="text-sm text-muted whitespace-nowrap ml-1">
            <span className="font-mono text-xs text-accent/60">{event.prefix}</span>{" "}
            {event.text}
          </span>
        </div>
      ))}

      {/* Spacer to reserve vertical space */}
      <div style={{ height: svgHeight }} />
    </div>
  );
}

export default function GitTimeline() {
  return (
    <section className="py-24 px-4">
      <motion.div
        className="max-w-5xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="mb-12" variants={fadeUp}>
          <p className="font-mono text-sm text-accent tracking-wider uppercase mb-2">
            Git Log
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Timeline
          </h2>
        </motion.div>

        {/* Desktop: centered timeline with left/right content */}
        <div className="hidden md:block relative">
          {timelineYears.map((yearEntry, index) => {
            const nextEntry = timelineYears[index + 1];
            const bold = nextEntry
              ? isWithinTenure(yearEntry.year, nextEntry.year)
              : false;

            const leftEvents = yearEntry.events.filter((e) => e.side === "left");
            const rightEvents = yearEntry.events.filter((e) => e.side === "right");

            return (
              <motion.div
                key={yearEntry.year}
                className="relative"
                style={{ marginTop: getYearGap(index) }}
                variants={fadeUp}
              >
                {/* Line segment downward */}
                {index < timelineYears.length - 1 && (
                  <div
                    className={`absolute top-4 -translate-x-1/2 ${
                      bold
                        ? "w-[3px] bg-accent/50"
                        : "w-px bg-border"
                    }`}
                    style={{
                      left: "calc(40% + 8px)",
                      height: "calc(100% + " + getYearGap(index + 1) + "px)",
                    }}
                  />
                )}

                {/* Row: left content | dot + year | right content */}
                <div className="flex items-start">
                  {/* Left side — institutions */}
                  <div className="w-[40%] flex justify-end pr-6">
                    {leftEvents.length > 0 && (
                      <div className="space-y-1.5">
                        {leftEvents.map((event, i) => (
                          <EventContent key={`${yearEntry.year}-l-${i}`} event={event} showMonth={false} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Center — dot */}
                  <div className="flex items-center flex-shrink-0" style={{ width: "16px" }}>
                    <div className="w-4 h-4 rounded-full bg-accent border-4 border-background relative z-10" />
                  </div>

                  {/* Right side — year label + achievements + branch */}
                  <div className="flex-1 pl-4 min-w-0">
                    <span className="font-mono text-sm font-semibold text-accent tracking-wide">
                      {yearEntry.year}
                    </span>
                    {rightEvents.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {rightEvents.map((event, i) => (
                          <EventContent key={`${yearEntry.year}-r-${i}`} event={event} showMonth={false} />
                        ))}
                      </div>
                    )}
                    {yearEntry.branch && (
                      <BranchVisual branch={yearEntry.branch} />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: single-column timeline (same as before) */}
        <div className="md:hidden relative ml-2">
          {timelineYears.map((yearEntry, index) => {
            const nextEntry = timelineYears[index + 1];
            const bold = nextEntry
              ? isWithinTenure(yearEntry.year, nextEntry.year)
              : false;

            return (
              <motion.div
                key={yearEntry.year}
                className="relative"
                style={{ marginTop: getYearGap(index) }}
                variants={fadeUp}
              >
                {/* Line segment downward */}
                {index < timelineYears.length - 1 && (
                  <div
                    className={`absolute left-[7px] top-4 ${
                      bold
                        ? "w-[3px] -ml-[1px] bg-accent/50"
                        : "w-px bg-border"
                    }`}
                    style={{
                      height: "calc(100% + " + getYearGap(index + 1) + "px)",
                    }}
                  />
                )}

                {/* Year node */}
                <div className="relative flex items-center gap-4 sm:gap-5">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-accent border-4 border-background" />
                  </div>
                  <span className="font-mono text-sm font-semibold text-accent tracking-wide">
                    {yearEntry.year}
                  </span>
                </div>

                {/* Events */}
                {yearEntry.events.length > 0 && (
                  <div className="ml-[7px] pl-7 mt-2 space-y-1.5">
                    {yearEntry.events.map((event, i) => (
                      <EventContent key={`${yearEntry.year}-m-${i}`} event={event} />
                    ))}
                  </div>
                )}

                {/* Branch */}
                {yearEntry.branch && (
                  <div className="ml-[7px] pl-7">
                    <BranchVisual branch={yearEntry.branch} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
