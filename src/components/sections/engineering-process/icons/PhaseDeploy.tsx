export function PhaseDeploy() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
      {/* Floor grid (background, behind AGVs) */}
      {[165, 175, 185, 195].map((y) => (
        <line
          key={y}
          x1="10"
          y1={y}
          x2="190"
          y2={y}
          stroke="var(--color-foreground)"
          strokeWidth="0.3"
          opacity="0.15"
        />
      ))}
      {/* Status: LIVE */}
      <circle
        cx="185"
        cy="30"
        r="5"
        stroke="#28C840"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      <circle cx="185" cy="30" r="2" fill="#28C840" opacity="0.6" />
      <text
        x="149"
        y="33"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="#28C840"
        opacity="0.5"
      >
        LIVE
      </text>
      {/* Fleet of AGVs - top view, centred vertically */}
      {[
        { x: 30, y: 75 },
        { x: 100, y: 55 },
        { x: 170, y: 80 },
        { x: 50, y: 140 },
        { x: 140, y: 150 },
      ].map((pos, i) => (
        <g key={i}>
          <rect
            x={pos.x - 16}
            y={pos.y - 12}
            width="32"
            height="24"
            rx="4"
            stroke={i < 3 ? "var(--color-accent)" : "currentColor"}
            strokeWidth="1.2"
            fill="none"
            opacity={i < 3 ? 0.7 : 0.4}
          />
          {/* Antenna */}
          <line
            x1={pos.x}
            y1={pos.y - 12}
            x2={pos.x}
            y2={pos.y - 20}
            stroke={i < 3 ? "var(--color-accent)" : "currentColor"}
            strokeWidth="1"
            opacity={i < 3 ? 0.6 : 0.35}
          />
          {/* Wheels */}
          <rect
            x={pos.x - 18}
            y={pos.y - 6}
            width="4"
            height="8"
            rx="1"
            stroke={i < 3 ? "var(--color-accent)" : "currentColor"}
            strokeWidth="0.6"
            fill="none"
            opacity={i < 3 ? 0.4 : 0.3}
          />
          <rect
            x={pos.x + 14}
            y={pos.y - 6}
            width="4"
            height="8"
            rx="1"
            stroke={i < 3 ? "var(--color-accent)" : "currentColor"}
            strokeWidth="0.6"
            fill="none"
            opacity={i < 3 ? 0.4 : 0.3}
          />
        </g>
      ))}
      {/* Network mesh */}
      <path
        d="M 30 75 L 100 55 L 170 80 M 100 55 L 50 140 L 140 150 L 170 80"
        stroke="var(--color-accent)"
        strokeWidth="0.5"
        strokeDasharray="4 4"
        opacity="0.35"
      />
    </svg>
  );
}
