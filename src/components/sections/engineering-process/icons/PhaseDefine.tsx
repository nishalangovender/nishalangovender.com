export function PhaseDefine() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
      {/* Magnifying glass */}
      <circle
        cx="85"
        cy="85"
        r="45"
        stroke="var(--color-foreground)"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <line
        x1="118"
        y1="118"
        x2="165"
        y2="165"
        stroke="var(--color-foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Question mark */}
      <path
        d="M 72 70 C 72 55, 98 55, 98 70 C 98 80, 85 80, 85 90"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="85" cy="102" r="2" fill="var(--color-accent)" />
      {/* Constraint boundary lines */}
      <path
        d="M 10 30 L 40 30"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.3"
        strokeDasharray="4 4"
      />
      <path
        d="M 10 170 L 40 170"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.3"
        strokeDasharray="4 4"
      />
      <path
        d="M 160 30 L 190 30"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.3"
        strokeDasharray="4 4"
      />
      <path
        d="M 160 170 L 190 170"
        stroke="var(--color-foreground)"
        strokeWidth="0.8"
        opacity="0.3"
        strokeDasharray="4 4"
      />
    </svg>
  );
}
