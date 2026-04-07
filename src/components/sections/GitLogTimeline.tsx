"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { timelineChapters, type TimelineChapter, type TimelineBranch } from "@/data/timeline";

// --- Animation helpers ---

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function AnimateOnScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- Branch SVG ---

/** Renders the fork-off and merge-back lines for a branch */
function BranchLines({ branchHeight }: { branchHeight: number }) {
  // Fork curves right from the main line, runs parallel, then merges back
  const forkX = 40; // how far right the branch goes
  const curveR = 16; // radius of the curve
  const lineX = 0; // main line x position (relative)

  return (
    <svg
      className="absolute left-0 top-0 pointer-events-none"
      width={forkX + 4}
      height={branchHeight}
      style={{ overflow: "visible" }}
    >
      {/* Fork line: curves from main line to branch position */}
      <path
        d={`M ${lineX} 0 C ${lineX} ${curveR}, ${forkX} ${curveR}, ${forkX} ${curveR * 2}`}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeOpacity={0.4}
      />
      {/* Vertical branch line */}
      <line
        x1={forkX}
        y1={curveR * 2}
        x2={forkX}
        y2={branchHeight - curveR * 2}
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeOpacity={0.4}
        strokeDasharray="4 4"
      />
      {/* Merge line: curves from branch position back to main line */}
      <path
        d={`M ${forkX} ${branchHeight - curveR * 2} C ${forkX} ${branchHeight - curveR}, ${lineX} ${branchHeight - curveR}, ${lineX} ${branchHeight}`}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeOpacity={0.4}
      />
    </svg>
  );
}

// --- Commit dot ---

function CommitDot({ isFirst, isMerge }: { isFirst?: boolean; isMerge?: boolean }) {
  return (
    <div
      className={`
        relative z-10 rounded-full border-2 border-background
        ${isFirst ? "w-4 h-4 bg-accent" : isMerge ? "w-3.5 h-3.5 bg-accent/70" : "w-3 h-3 bg-accent/50"}
      `}
    />
  );
}

// --- Chapter section ---

function ChapterSection({ chapter, isLast }: { chapter: TimelineChapter; isLast: boolean }) {
  const branchRef = useRef<HTMLDivElement>(null);

  return (
    <AnimateOnScroll className="relative">
      {/* Main line segment (continues past this chapter unless last) */}
      {!isLast && (
        <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-accent/20" />
      )}
      {isLast && (
        <div className="absolute left-[11px] top-0 h-8 w-[2px] bg-accent/20" />
      )}

      {/* Chapter header: commit dot + title */}
      <motion.div variants={fadeUp} className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 mt-1.5">
          <CommitDot isFirst />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            {chapter.logo && (
              <div className="w-8 h-8 rounded-sm overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={chapter.logo}
                  alt={`${chapter.title} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                {chapter.title}
              </h3>
              <p className="text-xs text-muted font-mono">
                {chapter.subtitle}
              </p>
            </div>
          </div>
          <p className="text-xs text-accent font-mono mt-1">
            {chapter.yearRange}
          </p>
        </div>
      </motion.div>

      {/* Commits */}
      <div className="ml-[11px] pl-6 border-l-0 space-y-1.5">
        {chapter.commits.map((commit, j) => (
          <motion.div
            key={j}
            variants={fadeUp}
            className="flex items-start gap-2 relative"
          >
            {/* Small dot on the line */}
            <div className="absolute -left-[27px] top-[7px] w-2 h-2 rounded-full bg-accent/30 border border-background z-10" />
            <span className="font-mono text-[11px] text-accent/60 flex-shrink-0 mt-[1px]">
              {commit.prefix}
            </span>
            <span className="text-sm text-foreground/80 leading-snug">
              {commit.message}
            </span>
            {commit.year && (
              <span className="font-mono text-[10px] text-muted/40 flex-shrink-0 mt-[2px] ml-auto">
                {commit.year}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Branches */}
      {chapter.branches?.map((branch) => (
        <BranchSection key={branch.name} branch={branch} branchRef={branchRef} />
      ))}

      {/* Spacer */}
      {!isLast && <div className="h-10" />}
    </AnimateOnScroll>
  );
}

// --- Branch section ---

function BranchSection({
  branch,
  branchRef,
}: {
  branch: TimelineBranch;
  branchRef: React.RefObject<HTMLDivElement | null>;
}) {
  const innerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      variants={fadeUp}
      ref={innerRef}
      className="relative mt-4 ml-[11px]"
    >
      {/* Branch SVG lines */}
      <div className="absolute left-0 top-0 bottom-0">
        <BranchLines branchHeight={innerRef.current?.offsetHeight ?? 120} />
      </div>

      {/* Branch label */}
      <div className="ml-[52px] mb-2">
        <span className="inline-block font-mono text-[10px] text-accent/70 bg-accent/10 px-2 py-0.5 rounded-sm tracking-wider">
          {branch.name}
        </span>
      </div>

      {/* Branch commits */}
      <div className="ml-[52px] space-y-1.5">
        {branch.events.map((event, k) => (
          <motion.div key={k} variants={fadeUp} className="flex items-start gap-2 relative">
            {/* Dot on branch line */}
            <div className="absolute -left-[15px] top-[7px] w-2 h-2 rounded-full bg-accent/40 border border-background z-10" />
            <span className="font-mono text-[11px] text-accent/60 flex-shrink-0 mt-[1px]">
              {event.prefix}
            </span>
            <span className="text-sm text-foreground/80 leading-snug">
              {event.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Merge label */}
      <div className="ml-[11px] mt-3 flex items-center gap-2">
        <CommitDot isMerge />
        <span className="font-mono text-[10px] text-muted/60">
          merge {branch.name} → main ({branch.mergeYear})
        </span>
      </div>
    </motion.div>
  );
}

// --- Main component ---

export default function GitLogTimeline() {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="font-mono text-sm text-accent tracking-wider uppercase mb-2">
            Git Log --Graph
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Timeline
          </h2>
        </motion.div>

        {/* Git log */}
        <div className="relative">
          {timelineChapters.map((chapter, i) => (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              isLast={i === timelineChapters.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
