/**
 * Static notebook frame: the dot-grid page with the kinematic sketch drawn.
 * Placeholder while the 3D chunk loads, and the whole hero when motion is
 * reduced or WebGL is unavailable.
 */
const DOTS = Array.from({ length: 13 * 10 }, (_, i) => ({
  x: 40 + (i % 13) * 30,
  y: 40 + Math.floor(i / 13) * 30,
}));

export function HeroStatic() {
  return (
    <svg
      viewBox="0 0 440 340"
      className="w-full h-full"
      role="img"
      aria-label="Notebook page with a hand-drawn kinematic sketch of a differential-drive AGV: chassis, drive wheels, castor, turning arc and TF axes."
    >
      <rect
        x="10"
        y="10"
        width="420"
        height="320"
        rx="6"
        fill="var(--notebook-page)"
        stroke="var(--notebook-page-edge)"
      />
      {DOTS.map((d) => (
        <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r="1.3" fill="var(--notebook-page-dot)" />
      ))}
      <g fill="none" stroke="var(--notebook-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* chassis, wheels, castor */}
        <rect x="160" y="120" width="140" height="100" rx="8" />
        <rect x="185" y="104" width="44" height="14" rx="3" />
        <rect x="185" y="222" width="44" height="14" rx="3" />
        <circle cx="282" cy="170" r="7" />
        {/* turning arc about the ICR */}
        <path d="M 207 70 A 100 100 0 0 1 307 170" strokeDasharray="5 6" />
        <line x1="207" y1="170" x2="207" y2="60" strokeDasharray="2 5" />
      </g>
      {/* TF axes at base_link */}
      <g strokeWidth="2.5" strokeLinecap="round">
        <line x1="207" y1="170" x2="257" y2="170" stroke="var(--tty-error)" />
        <line x1="207" y1="170" x2="207" y2="130" stroke="var(--tty-ok)" />
      </g>
    </svg>
  );
}
