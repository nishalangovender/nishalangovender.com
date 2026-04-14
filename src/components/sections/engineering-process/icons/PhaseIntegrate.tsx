export function PhaseIntegrate() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
      {/* Circuit traces — horizontal bus, stretched wider */}
      <path
        d="M 5 100 L 35 100 L 50 55 L 150 55 L 165 100 L 195 100"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M 5 140 L 30 140 L 48 100 L 65 100"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M 135 100 L 152 140 L 195 140"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Vertical traces to connectors */}
      <path
        d="M 100 20 L 100 58"
        stroke="var(--color-foreground)"
        strokeWidth="1"
        opacity="0.35"
      />
      <path
        d="M 100 142 L 100 178"
        stroke="var(--color-foreground)"
        strokeWidth="1"
        opacity="0.35"
      />
      {/* IPC module — larger rectangle */}
      <rect
        x="50"
        y="60"
        width="100"
        height="80"
        rx="5"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Pin headers — top */}
      {[65, 80, 100, 120, 135].map((x) => (
        <g key={x}>
          <line
            x1={x}
            y1="60"
            x2={x}
            y2="45"
            stroke="var(--color-accent)"
            strokeWidth="1"
          />
          <line
            x1={x}
            y1="140"
            x2={x}
            y2="155"
            stroke="var(--color-accent)"
            strokeWidth="1"
          />
        </g>
      ))}
      {/* Side pins — left */}
      {[75, 88, 100, 112, 125].map((y) => (
        <line
          key={`l${y}`}
          x1="50"
          y1={y}
          x2="35"
          y2={y}
          stroke="var(--color-accent)"
          strokeWidth="1"
        />
      ))}
      {/* Side pins — right */}
      {[75, 88, 100, 112, 125].map((y) => (
        <line
          key={`r${y}`}
          x1="150"
          y1={y}
          x2="165"
          y2={y}
          stroke="var(--color-accent)"
          strokeWidth="1"
        />
      ))}
      {/* Module label */}
      <text
        x="100"
        y="96"
        fontFamily="var(--font-mono)"
        fontSize="16"
        fill="var(--color-accent)"
        opacity="0.7"
        textAnchor="middle"
      >
        IPC
      </text>
      {/* Sub-label */}
      <text
        x="100"
        y="116"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-accent)"
        opacity="0.4"
        textAnchor="middle"
      >
        INDUSTRIAL
      </text>
      {/* Solder / junction points */}
      <circle
        cx="35"
        cy="100"
        r="4"
        stroke="var(--color-accent)"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      <circle
        cx="165"
        cy="100"
        r="4"
        stroke="var(--color-accent)"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      {/* Bus labels */}
      <text
        x="5"
        y="95"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-foreground)"
        opacity="0.4"
      >
        CAN
      </text>
      <text
        x="175"
        y="95"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-foreground)"
        opacity="0.4"
      >
        ETH
      </text>
      {/* Power indicator top */}
      <text
        x="100"
        y="15"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.3"
        textAnchor="middle"
      >
        24V DC
      </text>
      {/* IO indicator bottom */}
      <text
        x="100"
        y="190"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.3"
        textAnchor="middle"
      >
        DI/DO
      </text>
    </svg>
  );
}
