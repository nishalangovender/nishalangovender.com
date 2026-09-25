import { PAGE, SKETCH_ROLES, SKETCH_SEGMENTS, type SketchRole } from "./sketch";

/**
 * Static notebook frame: the dot-grid page with the finished kinematic sketch.
 * Placeholder while the 3D chunk loads, and the whole hero when motion is
 * reduced or WebGL is unavailable. Drawn from the same strokes and labels as
 * the 3D ink, at 100 px per metre.
 */
const PX = 100;
const W = PAGE.width * PX;
const H = PAGE.depth * PX;
const MARGIN = 10;
const sx = (x: number) => MARGIN + W / 2 + x * PX;
const sy = (z: number) => MARGIN + H / 2 + z * PX;

const ROLE_STROKE: Record<SketchRole, string> = {
  ink: "var(--notebook-ink)",
  axisX: "var(--tty-error)",
  axisY: "var(--tty-ok)",
  motion: "var(--tty-warn)",
};

/** One SVG path per role, so each colour is a single element. */
const PATHS = (Object.keys(ROLE_STROKE) as SketchRole[]).map((role) => {
  let d = "";
  for (let i = 0; i < SKETCH_ROLES.length; i++) {
    if (SKETCH_ROLES[i] !== role) continue;
    const [x1, z1, x2, z2] = SKETCH_SEGMENTS.slice(i * 4, i * 4 + 4);
    d += `M${sx(x1).toFixed(1)} ${sy(z1).toFixed(1)}L${sx(x2).toFixed(1)} ${sy(z2).toFixed(1)}`;
  }
  return { role, d };
});

const DOTS = Array.from({ length: 41 * 31 }, (_, i) => ({
  x: MARGIN + 10 + (i % 41) * 10,
  y: MARGIN + 10 + Math.floor(i / 41) * 10,
})).filter((_, i) => i % 41 % 3 === 0 && Math.floor(i / 41) % 3 === 0);

export function HeroStatic() {
  return (
    <svg
      viewBox={`0 0 ${W + 2 * MARGIN} ${H + 2 * MARGIN}`}
      className="w-full h-full"
      role="img"
      aria-label="Notebook page with a hand-drawn kinematic sketch of a differential-drive AGV: world X and Y axes, heading θ, body x and y axes, velocity V and angular velocity ω."
    >
      <rect
        x={MARGIN}
        y={MARGIN}
        width={W}
        height={H}
        rx="6"
        fill="var(--notebook-page)"
        stroke="var(--notebook-page-edge)"
      />
      {DOTS.map((d) => (
        <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r="1.3" fill="var(--notebook-page-dot)" />
      ))}
      <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {PATHS.map(({ role, d }) => (
          <path key={role} d={d} stroke={ROLE_STROKE[role]} />
        ))}
      </g>
    </svg>
  );
}
