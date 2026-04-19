// Server-safe: no "use client", no hooks, no framer-motion.
// Renders the Beat-1 end-state composition (clean kinematic sketch with
// monospace labels). This is what paints on SSR, under reduced-motion, and
// on data-saver / slow-2g clients.

export function HeroLoopStatic() {
  return (
    <svg
      role="img"
      aria-label="Hand-drawn kinematic diagram of a differential-drive robot with labelled velocity and angular velocity vectors, on a blueprint grid."
      viewBox="0 0 640 540"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Blueprint grid scaffold */}
      <g stroke="var(--blueprint-line)" strokeWidth={1}>
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 40} y1={0} x2={i * 40} y2={400} />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`h-${i}`} x1={0} y1={i * 40} x2={640} y2={i * 40} />
        ))}
      </g>

      {/* Chassis */}
      <rect x={220} y={170} width={200} height={80} rx={8} />

      {/* Wheels */}
      <circle cx={250} cy={270} r={24} />
      <circle cx={390} cy={270} r={24} />

      {/* Heading arrow (v) */}
      <g stroke="var(--accent)">
        <line x1={320} y1={210} x2={470} y2={210} />
        <polyline points="460,204 470,210 460,216" />
      </g>

      {/* Angular velocity (ω) curl */}
      <g stroke="var(--accent)">
        <path d="M 320 210 m -40 0 a 40 40 0 1 1 80 0" />
        <polyline points="395,216 400,206 408,212" />
      </g>

      {/* Mono labels */}
      <g
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize={14}
        fill="var(--foreground)"
        stroke="none"
      >
        <text x={478} y={214}>v</text>
        <text x={302} y={162}>ω</text>
        <text x={244} y={310}>θ</text>
      </g>
    </svg>
  );
}
