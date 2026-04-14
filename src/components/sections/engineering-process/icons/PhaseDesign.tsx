export function PhaseDesign() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
      {/* ── Diff-drive robot kinematic diagram ── */}

      {/* Chassis — top-down rounded rectangle */}
      <rect
        x="65"
        y="55"
        width="70"
        height="95"
        rx="8"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />

      {/* Left wheel */}
      <rect
        x="48"
        y="73"
        width="12"
        height="34"
        rx="3"
        stroke="var(--color-accent)"
        strokeWidth="1.3"
        fill="none"
        opacity="0.7"
      />
      {/* Right wheel */}
      <rect
        x="140"
        y="73"
        width="12"
        height="34"
        rx="3"
        stroke="var(--color-accent)"
        strokeWidth="1.3"
        fill="none"
        opacity="0.7"
      />

      {/* Axle line through wheels */}
      <line
        x1="60"
        y1="90"
        x2="140"
        y2="90"
        stroke="var(--color-foreground)"
        strokeWidth="0.6"
        opacity="0.3"
        strokeDasharray="3 3"
      />

      {/* Centre point */}
      <circle
        cx="100"
        cy="90"
        r="2.5"
        fill="var(--color-accent)"
        opacity="0.5"
      />

      {/* Caster wheel at rear */}
      <circle
        cx="100"
        cy="138"
        r="5"
        stroke="var(--color-foreground)"
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx="100" cy="138" r="1.5" fill="var(--color-foreground)" opacity="0.35" />

      {/* Left wheel velocity arrow (vL — shorter) */}
      <line
        x1="54"
        y1="70"
        x2="54"
        y2="45"
        stroke="var(--color-accent)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <polygon
        points="54,38 49,48 59,48"
        fill="var(--color-accent)"
        opacity="0.7"
      />
      <text
        x="32"
        y="46"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-accent)"
        opacity="0.6"
      >
        vL
      </text>

      {/* Right wheel velocity arrow (vR — taller, differential turning) */}
      <line
        x1="146"
        y1="70"
        x2="146"
        y2="30"
        stroke="var(--color-accent)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <polygon
        points="146,23 141,33 151,33"
        fill="var(--color-accent)"
        opacity="0.7"
      />
      <text
        x="153"
        y="38"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-accent)"
        opacity="0.6"
      >
        vR
      </text>

      {/* Turning radius — dashed line from centre to ICC */}
      <line
        x1="100"
        y1="90"
        x2="25"
        y2="90"
        stroke="var(--color-foreground)"
        strokeWidth="0.7"
        opacity="0.3"
        strokeDasharray="4 3"
      />
      {/* ICC point */}
      <circle
        cx="25"
        cy="90"
        r="2.5"
        stroke="var(--color-foreground)"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
      />
      <text
        x="12"
        y="85"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.4"
      >
        ICC
      </text>

      {/* Wheel-base dimension line with proper end ticks */}
      <line x1="54" y1="165" x2="54" y2="175" stroke="var(--color-foreground)" strokeWidth="0.7" opacity="0.35" />
      <line x1="146" y1="165" x2="146" y2="175" stroke="var(--color-foreground)" strokeWidth="0.7" opacity="0.35" />
      <line x1="54" y1="170" x2="146" y2="170" stroke="var(--color-foreground)" strokeWidth="0.7" opacity="0.35" />
      {/* Arrowhead left */}
      <polygon points="54,170 60,167.5 60,172.5" fill="var(--color-foreground)" opacity="0.35" />
      {/* Arrowhead right */}
      <polygon points="146,170 140,167.5 140,172.5" fill="var(--color-foreground)" opacity="0.35" />
      <text
        x="100"
        y="183"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.4"
        textAnchor="middle"
      >
        L
      </text>

      {/* Heading direction — dashed arrow forward from chassis top */}
      <line
        x1="100"
        y1="55"
        x2="100"
        y2="15"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.35"
        strokeDasharray="3 2"
      />
      <polygon points="100,12 96,20 104,20" fill="var(--color-foreground)" opacity="0.35" />
      <text
        x="108"
        y="16"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="var(--color-foreground)"
        opacity="0.4"
      >
        &#x3B8;
      </text>

      {/* Angular velocity — arc from -45° to 45° outside chassis right, centred on wheelbase (100,90) r=90 */}
      <path
        d="M 164 154 A 90 90 0 0 0 164 26"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.35"
        fill="none"
      />
      {/* Arrowhead at 45° end, pointing up-left (counterclockwise) */}
      <polygon points="158,20 166,22 162,30" fill="var(--color-foreground)" opacity="0.35" />
      <text
        x="175"
        y="93"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--color-foreground)"
        opacity="0.4"
      >
        &#x3C9;
      </text>
    </svg>
  );
}
