export function PhaseDevelop() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
      {/* Terminal window */}
      <rect
        x="20"
        y="25"
        width="160"
        height="150"
        rx="6"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        opacity="0.5"
      />
      <line
        x1="20"
        y1="45"
        x2="180"
        y2="45"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.35"
      />
      {/* Window dots */}
      <circle cx="34" cy="35" r="3" fill="#FF5F57" opacity="0.65" />
      <circle cx="46" cy="35" r="3" fill="#FEBC2E" opacity="0.65" />
      <circle cx="58" cy="35" r="3" fill="#28C840" opacity="0.65" />
      {/* Title bar text */}
      <text
        x="100"
        y="38"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.35"
        textAnchor="middle"
      >
        ~/dev/project
      </text>
      {/* Line 1: $ prompt with command */}
      <text
        x="35"
        y="65"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill="var(--color-accent)"
        opacity="0.7"
      >
        $
      </text>
      <line
        x1="45"
        y1="62"
        x2="95"
        y2="62"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Line 2: output */}
      <line
        x1="35"
        y1="78"
        x2="120"
        y2="78"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Line 3: output */}
      <line
        x1="35"
        y1="90"
        x2="100"
        y2="90"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Line 4: chevron prompt > with indented code */}
      <text
        x="35"
        y="107"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fill="var(--color-accent)"
        opacity="0.6"
      >
        &#x203A;
      </text>
      <line
        x1="45"
        y1="104"
        x2="130"
        y2="104"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Line 5: another $ command */}
      <text
        x="35"
        y="121"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill="var(--color-accent)"
        opacity="0.7"
      >
        $
      </text>
      <line
        x1="45"
        y1="118"
        x2="85"
        y2="118"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Line 6: [OK] status */}
      <text
        x="35"
        y="135"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="#28C840"
        opacity="0.5"
      >
        [OK]
      </text>
      <line
        x1="60"
        y1="132"
        x2="110"
        y2="132"
        stroke="var(--color-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Line 7: active prompt with cursor */}
      <text
        x="35"
        y="151"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill="var(--color-accent)"
        opacity="0.7"
      >
        $
      </text>
      <rect
        x="46"
        y="144"
        width="2"
        height="10"
        fill="var(--color-accent)"
        opacity="0.6"
      />
    </svg>
  );
}
