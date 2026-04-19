// Server-safe: no "use client", no hooks, no framer-motion.
// Renders the Beat 1 end-state composition: A5 landscape notebook with a
// completed hand-drawn kinematic sketch on the bottom page. This is what
// paints on SSR, under reduced-motion, and on data-saver clients.
//
// Inlines the notebook structure (no hex-fallback tokens) so the frame is
// purely CSS-var-driven and theme-reactive. The animated loop's Notebook
// component uses hex fallbacks for defensive rendering; this static frame
// does not need them since globals.css is loaded with the page.

export function HeroLoopStatic() {
  // Notebook layout — mirrors Notebook.tsx's constants.
  const STACK_LAYERS = 5;
  const BINDING = { x: 50, y: 92, w: 548, h: 8 };
  const BOTTOM_PAGE = { x: 50, y: 100, w: 548, h: 390 };
  const COVER_RIM = 18;
  const COVER = {
    x: BOTTOM_PAGE.x - COVER_RIM,
    y: BINDING.y + BINDING.h,
    w: BOTTOM_PAGE.w + COVER_RIM * 2,
    h: BOTTOM_PAGE.h + STACK_LAYERS * 2 + COVER_RIM,
  };

  return (
    <svg
      role="img"
      aria-label="A hand-drawn kinematic diagram of a differential-drive robot sketched on the bottom page of an open engineering notebook."
      viewBox="0 0 640 540"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
    >
      <defs>
        <pattern
          id="staticNotebookDotPattern"
          x={0}
          y={0}
          width={20}
          height={20}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={10} cy={10} r={0.9} fill="var(--notebook-page-dot)" />
        </pattern>
      </defs>

      {/* Desk backdrop */}
      <rect x={0} y={0} width={640} height={540} fill="var(--background)" />

      {/* Hardcover slab — starts below the binding. Square top corners
          (fold line); rounded bottom corners. */}
      <path
        d={`
          M ${COVER.x} ${COVER.y}
          L ${COVER.x + COVER.w} ${COVER.y}
          L ${COVER.x + COVER.w} ${COVER.y + COVER.h - 6}
          Q ${COVER.x + COVER.w} ${COVER.y + COVER.h} ${COVER.x + COVER.w - 6} ${COVER.y + COVER.h}
          L ${COVER.x + 6} ${COVER.y + COVER.h}
          Q ${COVER.x} ${COVER.y + COVER.h} ${COVER.x} ${COVER.y + COVER.h - 6}
          Z
        `}
        fill="var(--notebook-cover)"
        stroke="var(--notebook-cover-edge)"
        strokeWidth={1.2}
      />
      <path
        d={`
          M ${COVER.x + 3} ${COVER.y}
          L ${COVER.x + COVER.w - 3} ${COVER.y}
          L ${COVER.x + COVER.w - 3} ${COVER.y + COVER.h - 7}
          Q ${COVER.x + COVER.w - 3} ${COVER.y + COVER.h - 3} ${COVER.x + COVER.w - 7} ${COVER.y + COVER.h - 3}
          L ${COVER.x + 7} ${COVER.y + COVER.h - 3}
          Q ${COVER.x + 3} ${COVER.y + COVER.h - 3} ${COVER.x + 3} ${COVER.y + COVER.h - 7}
          Z
        `}
        fill="none"
        stroke="var(--notebook-cover-edge)"
        strokeWidth={0.6}
        opacity={0.45}
      />

      {/* Page-stack strata — farthest-first, so each rim shows as a 2px
          slice around the bottom page. */}
      {Array.from({ length: STACK_LAYERS })
        .map((_, i) => STACK_LAYERS - 1 - i)
        .map((i) => {
          const offset = (i + 1) * 2;
          return (
            <rect
              key={`stack-${i}`}
              x={BOTTOM_PAGE.x - offset}
              y={BOTTOM_PAGE.y}
              width={BOTTOM_PAGE.w + offset * 2}
              height={BOTTOM_PAGE.h + offset}
              fill="var(--notebook-page)"
              stroke="var(--notebook-page-edge)"
              strokeWidth={0.8}
              opacity={0.98 - i * 0.05}
            />
          );
        })}

      {/* Bottom page — cream paper + dot grid */}
      <rect
        x={BOTTOM_PAGE.x}
        y={BOTTOM_PAGE.y}
        width={BOTTOM_PAGE.w}
        height={BOTTOM_PAGE.h}
        fill="var(--notebook-page)"
      />
      <rect
        x={BOTTOM_PAGE.x}
        y={BOTTOM_PAGE.y}
        width={BOTTOM_PAGE.w}
        height={BOTTOM_PAGE.h}
        fill="url(#staticNotebookDotPattern)"
      />

      {/* Stitching along the fold (top edge of bottom page). */}
      <line
        x1={BOTTOM_PAGE.x + 8}
        y1={BOTTOM_PAGE.y}
        x2={BOTTOM_PAGE.x + BOTTOM_PAGE.w - 8}
        y2={BOTTOM_PAGE.y}
        stroke="var(--notebook-page-edge)"
        strokeWidth={1.2}
        strokeDasharray="6 6"
        strokeLinecap="round"
        opacity={0.9}
      />

      {/* ── Sketch content — Beat 1 end state ──
          Transform matches Beat 1's `translate(84.4 147.6) scale(0.82)` so
          the X/Y axes snap to the dot grid. */}
      <g
        transform="translate(84.4 147.6) scale(0.82)"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* World Y axis */}
        <path
          d="M 80 320 L 80 115 M 76 123 L 80 115 L 84 123"
          vectorEffect="non-scaling-stroke"
        />
        {/* World X axis */}
        <path
          d="M 80 320 L 520 320 M 512 316 L 520 320 L 512 324"
          vectorEffect="non-scaling-stroke"
        />

        {/* Robot — rotated -25° around centre (318, 210) */}
        <g transform="rotate(-25 318 210)">
          <path
            d="M 258 175 h 120 v 70 h -120 Z"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 284 161 h 28 q 3 0 3 3 v 8 q 0 3 -3 3 h -28 q -3 0 -3 -3 v -8 q 0 -3 3 -3 Z"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 284 245 h 28 q 3 0 3 3 v 8 q 0 3 -3 3 h -28 q -3 0 -3 -3 v -8 q 0 -3 3 -3 Z"
            vectorEffect="non-scaling-stroke"
          />
        </g>

        {/* Dashed θ-reference line */}
        <path
          d="M 80 320 L 300 218"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeDasharray="5 6"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />

        {/* θ arc */}
        <path
          d="M 130 320 A 50 50 0 0 0 125.3 298.9 M 130.6 303.0 L 125.3 298.9 L 125.1 305.6"
          vectorEffect="non-scaling-stroke"
        />

        {/* Body-x axis */}
        <path
          d="M 300 218 L 408.8 167.3 M 403.2 174.3 L 408.8 167.3 L 399.8 167.0"
          vectorEffect="non-scaling-stroke"
        />
        {/* Body-y axis */}
        <path
          d="M 300 218 L 262.0 136.4 M 269.0 142.0 L 262.0 136.4 L 261.7 145.4"
          vectorEffect="non-scaling-stroke"
        />

        {/* Velocity V (accent) */}
        <path
          d="M 300 218 L 445.0 150.4 M 439.4 157.4 L 445.0 150.4 L 436.1 150.1"
          stroke="var(--accent)"
          vectorEffect="non-scaling-stroke"
        />
        {/* Angular velocity ω (accent) */}
        <path
          d="M 122 200 A 28 28 0 1 0 150 172 M 156 169 L 150 172 L 156 175"
          stroke="var(--accent)"
          vectorEffect="non-scaling-stroke"
        />

        {/* Mono labels */}
        <g
          fontFamily="var(--font-jetbrains-mono), monospace"
          fontSize={14}
          fill="var(--foreground)"
          stroke="none"
        >
          <text x={68} y={117}>Y</text>
          <text x={526} y={324}>X</text>
          <text x={140} y={312}>θ</text>
          <text x={415} y={183}>x</text>
          <text x={252} y={132}>y</text>
          <text x={452} y={148} fill="var(--accent)">V</text>
          <text x={180} y={185} fill="var(--accent)">ω</text>
        </g>
      </g>
    </svg>
  );
}
