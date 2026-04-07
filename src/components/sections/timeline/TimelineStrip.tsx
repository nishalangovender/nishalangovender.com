"use client";

/**
 * TimelineStrip — the continuous horizontal timeline rendered as SVG.
 *
 * Dots mark *boundary transitions* between life periods — where one
 * institution ends and the next begins.  When two periods are
 * consecutive (e.g. Cordwalles ends 2013, MC starts 2014), a single
 * dot represents the transition rather than two near-identical dots.
 *
 * Institution labels sit centered between their boundary dots with a
 * curly brace spanning the period.
 *
 * Coordinate system:
 *   x = 0 → 1000  (maps to timeline position 0 → 1)
 *   y = 0          (the main line)
 *   y < 0          above the line (institution labels + braces)
 *   y > 0          below the line (year labels)
 */

// ─── Chronologically accurate positioning ──────────────────────────────
//
// 6-segment piecewise linear mapping:
//   Segment 1: 2000 → 2005  (pre-school)               — heavily compressed, 3%
//   Segment 2: 2005 → 2014  (Cordwalles)               — compressed,         7%
//   Segment 3: 2014 → 2019  (Maritzburg College)       — moderate,          17.5%
//   Segment 4: 2019 → 2024  (Stellenbosch University)  — expanded,          22.5%
//   Segment 5: 2024 → 2026  (BATTALION Technologies)   — expanded,          22.5%
//   Segment 6: 2026 → 2028  (Freelance)                — expanded,          17.5%
//
// Pre-school and Cordwalles are compressed (less relevant professionally).
// Space saved is redistributed equally to Stellenbosch and BATTALION.
// The overview (fully zoomed out) uses this mapping directly.

const YEAR_START = 2000;
const YEAR_END = 2028;
const PAD = 0.05;
const SPAN = 1 - 2 * PAD; // 0.90

const PIVOT_1 = 2005; // start of Cordwalles
const PIVOT_2 = 2014; // end of Cordwalles / start of MC
const PIVOT_3 = 2019; // end of MC / start of Stellenbosch
const PIVOT_4 = 2024; // end of Stellenbosch / start of BATTALION
const PIVOT_5 = 2026; // end of BATTALION / start of Freelance

const SHARE_1 = 0.05;   // 2000–2005: pre-school (original length)
const SHARE_2 = 0.10;   // 2005–2014: Cordwalles (slightly wider for label+logo)
const SHARE_3 = 0.14;   // 2014–2019: Maritzburg College (wider for label+logo)
const SHARE_4 = 0.21;   // 2019–2024: Stellenbosch University (expanded)
const SHARE_5 = 0.28;   // 2024–2026: BATTALION Technologies (expanded)
const SHARE_6 = SPAN - SHARE_1 - SHARE_2 - SHARE_3 - SHARE_4 - SHARE_5; // 2026–2028: Freelance (shortened, 0.12)

/** "Present" maps to this year for positioning purposes */
export const PRESENT_YEAR = 2028;

export function yearToPosition(y: number): number {
  if (y <= PIVOT_1) {
    return PAD + ((y - YEAR_START) / (PIVOT_1 - YEAR_START)) * SHARE_1;
  }
  if (y <= PIVOT_2) {
    return PAD + SHARE_1 + ((y - PIVOT_1) / (PIVOT_2 - PIVOT_1)) * SHARE_2;
  }
  if (y <= PIVOT_3) {
    return PAD + SHARE_1 + SHARE_2 + ((y - PIVOT_2) / (PIVOT_3 - PIVOT_2)) * SHARE_3;
  }
  if (y <= PIVOT_4) {
    return PAD + SHARE_1 + SHARE_2 + SHARE_3 + ((y - PIVOT_3) / (PIVOT_4 - PIVOT_3)) * SHARE_4;
  }
  if (y <= PIVOT_5) {
    return PAD + SHARE_1 + SHARE_2 + SHARE_3 + SHARE_4 + ((y - PIVOT_4) / (PIVOT_5 - PIVOT_4)) * SHARE_5;
  }
  return PAD + SHARE_1 + SHARE_2 + SHARE_3 + SHARE_4 + SHARE_5 + ((y - PIVOT_5) / (YEAR_END - PIVOT_5)) * SHARE_6;
}

// ─── Boundary dots (transition points between periods) ─────────────────
//
// Each dot represents a meaningful transition on the timeline.
// Consecutive end/start years (e.g. 2013→2014) become a single dot
// at the start of the new period.
//
// 2000        timeline origin
// 2005        Cordwalles begins
// 2014        Cordwalles → Maritzburg College
// 2019        Maritzburg College → Stellenbosch University
// 2024        Stellenbosch → BATTALION
// 2026        BATTALION → Freelance
// Present     timeline continues…

interface BoundaryDot {
  year: number;
  display: string;
}

const boundaryDots: BoundaryDot[] = [
  { year: 2000, display: "2000" },
  { year: 2005, display: "2005" },
  { year: 2014, display: "2014" },
  { year: 2019, display: "2019" },
  { year: 2024, display: "2024" },
  { year: 2026, display: "2026" },
  { year: PRESENT_YEAR, display: "Present" },
];

// ─── Institution periods (span between boundary dots) ──────────────────
// Exported so chapter overlays can render braces when zoomed in.
export interface InstitutionPeriod {
  label: string;
  subtitle?: string; // certification / role shown below label when zoomed
  fromYear: number;  // boundary dot where this period starts
  toYear: number;    // boundary dot where this period ends
  logo?: string;     // institution crest/logo
}

export const institutions: InstitutionPeriod[] = [
  { label: "Cordwalles", subtitle: "Preparatory School", fromYear: 2005, toYear: 2014, logo: "/images/logos/cordwalles.png" },
  { label: "Maritzburg College", subtitle: "National Senior Certificate", fromYear: 2014, toYear: 2019, logo: "/images/logos/maritzburg-college.png" },
  { label: "Stellenbosch University", subtitle: "Bachelor of Engineering in Mechatronics", fromYear: 2019, toYear: 2024, logo: "/images/logos/stellenbosch-university.jpg" },
  { label: "BATTALION Technologies", subtitle: "Mechatronics Engineer", fromYear: 2024, toYear: 2026, logo: "/images/logos/battalion-technologies.jpeg" },
  { label: "Freelance", subtitle: "Mechatronics Engineer", fromYear: 2026, toYear: PRESENT_YEAR, logo: "/images/logos/ng-freelance.svg" },
];

// ─── Transition arcs (scholarships/bursaries bridging institutions) ───
// These render as curved arcs below the main line, showing how one
// institution led to the next via an award or scholarship.
export interface TransitionArc {
  label: string;
  boundaryYear: number; // the boundary dot the arc bridges over
}

export const transitionArcs: TransitionArc[] = [
  { label: "Cordwalles Closed Scholarship", boundaryYear: 2014 },   // Cordwalles → MC
  { label: "Recruitment Bursary", boundaryYear: 2019 },              // MC → Stellenbosch
];

/** SVG coordinate constants */
export const STRIP_X_MAX = 1000;
const DOT_R = 3;
const LABEL_FONT = 9;
const YEAR_FONT = 8;
const LOGO_SIZE = 8;
const LOGO_R = 1.5;   // border-radius for logo rounded rect
const LABEL_Y = -30;  // institution labels above the line (raised to clear commit date labels)
const YEAR_Y = 24;    // year labels below the line
const ARC_DROP = 30;  // how far below the line the arcs dip (below year labels)

/**
 * All strip content as SVG <g> — line, boundary dots, year labels,
 * and institution names centered between their boundary dots.
 * Curly braces are NOT rendered here — they only appear when zoomed in
 * (rendered by the chapter overlays).
 */
export function TimelineStripSVG() {
  const firstX = yearToPosition(boundaryDots[0].year) * STRIP_X_MAX;

  return (
    <g>
      {/* Formative main line (always visible — up to 2019 boundary) */}
      <line
        x1={firstX}
        y1={0}
        x2={yearToPosition(2019) * STRIP_X_MAX}
        y2={0}
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeOpacity={0.5}
      />

      {/* Growing line — rendered BEFORE dots so the 2019 dot's background
          circle paints on top, creating a natural gap on both sides.
          x2 is updated imperatively by ScrollZoomTimeline. */}
      <line
        id="strip-growing-line"
        x1={yearToPosition(2019) * STRIP_X_MAX}
        y1={0}
        x2={yearToPosition(2019) * STRIP_X_MAX}
        y2={0}
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeOpacity={0.5}
      />

      {/* Boundary dots + year labels below — formative years (≤2019).
          Rendered after both lines so background circles mask the line
          ends, creating a uniform gap around each dot. */}
      {boundaryDots.filter((dot) => dot.year <= 2019).map((dot) => {
        const cx = yearToPosition(dot.year) * STRIP_X_MAX;
        return (
          <g key={dot.display}>
            <circle cx={cx} cy={0} r={DOT_R + 1} fill="var(--color-background)" />
            <circle
              cx={cx}
              cy={0}
              r={DOT_R}
              fill="var(--color-accent)"
              stroke="var(--color-background)"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={YEAR_Y}
              textAnchor="middle"
              fill="var(--color-accent)"
              fillOpacity={0.7}
              fontFamily="var(--font-mono)"
              fontSize={YEAR_FONT}
              letterSpacing="0.05em"
            >
              {dot.display}
            </text>
          </g>
        );
      })}

      {/* Clip path whose right edge advances with the growing line.
          Used to gradually reveal institution labels and arcs by position. */}
      <defs>
        <clipPath id="present-clip">
          <rect
            id="present-clip-rect"
            x={0}
            y={-500}
            width={yearToPosition(2019) * STRIP_X_MAX}
            height={1000}
          />
        </clipPath>
      </defs>

      {/* Future boundary dots + year labels — threshold-based reveal so
          circles and year text appear fully (not clipped in half). */}
      {boundaryDots.filter((dot) => dot.year > 2019).map((dot) => {
        const cx = yearToPosition(dot.year) * STRIP_X_MAX;
        return (
          <g key={dot.display} data-reveal-x={cx} opacity={0}>
            <circle cx={cx} cy={0} r={DOT_R + 1} fill="var(--color-background)" />
            <circle cx={cx} cy={0} r={DOT_R} fill="var(--color-accent)" stroke="var(--color-background)" strokeWidth={1.5} />
            <text x={cx} y={YEAR_Y} textAnchor="middle" fill="var(--color-accent)" fillOpacity={0.7} fontFamily="var(--font-mono)" fontSize={YEAR_FONT} letterSpacing="0.05em">
              {dot.display}
            </text>
          </g>
        );
      })}

      {/* Institution labels + logos + transition arrows above the line.
          Wrapped in a single group so ScrollZoomTimeline can lift them
          together on zoom — arrows stay aligned with label text. */}
      <g id="strip-institution-labels">
        {institutions.filter((inst) => inst.fromYear < 2019).map((inst, idx) => {
          const x1 = yearToPosition(inst.fromYear) * STRIP_X_MAX;
          const x2 = yearToPosition(inst.toYear) * STRIP_X_MAX;
          const midX = (x1 + x2) / 2;
          const textHalfW = inst.label.length * (LABEL_FONT * 0.28);
          // BATTALION is all-caps so its rendered width is wider than the estimate — nudge logo left
          const upperNudge = inst.label === "BATTALION Technologies" ? 4 : 0;
          const clipId = `logo-clip-${idx}`;
          const logoX = midX - textHalfW - LOGO_SIZE - 3 - upperNudge;
          const logoY = LABEL_Y - LOGO_SIZE + 1;

          return (
            <g key={inst.label}>
              {inst.logo && (
                <>
                  <defs>
                    <clipPath id={clipId}>
                      <rect x={logoX} y={logoY} width={LOGO_SIZE} height={LOGO_SIZE} rx={LOGO_R} ry={LOGO_R} />
                    </clipPath>
                  </defs>
                  {/* Rounded border background */}
                  <rect
                    x={logoX}
                    y={logoY}
                    width={LOGO_SIZE}
                    height={LOGO_SIZE}
                    rx={LOGO_R}
                    ry={LOGO_R}
                    fill="var(--color-surface)"
                    stroke="var(--color-border)"
                    strokeWidth={0.5}
                    strokeOpacity={0.6}
                  />
                  {/* Clipped logo image */}
                  <image
                    href={inst.logo}
                    x={logoX}
                    y={logoY}
                    width={LOGO_SIZE}
                    height={LOGO_SIZE}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#${clipId})`}
                  />
                </>
              )}
              <text
                x={midX}
                y={LABEL_Y}
                textAnchor="middle"
                fill="var(--color-foreground)"
                fillOpacity={0.85}
                fontFamily="var(--font-sans)"
                fontWeight={600}
                fontSize={LABEL_FONT}
                letterSpacing="0.04em"
              >
                {inst.label}
              </text>
              {inst.subtitle && (
                <text
                  x={midX}
                  y={LABEL_Y + LABEL_FONT + 2}
                  textAnchor="middle"
                  fill="var(--color-foreground)"
                  fillOpacity={0.5}
                  fontFamily="var(--font-sans)"
                  fontWeight={400}
                  fontSize={LABEL_FONT * 0.6}
                  letterSpacing="0.02em"
                >
                  {inst.subtitle}
                </text>
              )}
            </g>
          );
        })}

        {/* Future institution labels — clipped so text emerges gradually */}
        <g clipPath="url(#present-clip)">
          {institutions.filter((inst) => inst.fromYear >= 2019).map((inst, idx) => {
            const ix1 = yearToPosition(inst.fromYear) * STRIP_X_MAX;
            const ix2 = yearToPosition(inst.toYear) * STRIP_X_MAX;
            const midX = (ix1 + ix2) / 2;
            const textHalfW = inst.label.length * (LABEL_FONT * 0.28);
            const upperNudge = inst.label === "BATTALION Technologies" ? 4 : 0;
            const clipId = `logo-clip-future-${idx}`;
            const logoX = midX - textHalfW - LOGO_SIZE - 3 - upperNudge;
            const logoY = LABEL_Y - LOGO_SIZE + 1;

            return (
              <g key={inst.label}>
                {inst.logo && (
                  <>
                    <defs>
                      <clipPath id={clipId}>
                        <rect x={logoX} y={logoY} width={LOGO_SIZE} height={LOGO_SIZE} rx={LOGO_R} ry={LOGO_R} />
                      </clipPath>
                    </defs>
                    <rect x={logoX} y={logoY} width={LOGO_SIZE} height={LOGO_SIZE} rx={LOGO_R} ry={LOGO_R} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={0.5} strokeOpacity={0.6} />
                    <image href={inst.logo} x={logoX} y={logoY} width={LOGO_SIZE} height={LOGO_SIZE} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`} />
                  </>
                )}
                <text x={midX} y={LABEL_Y} textAnchor="middle" fill="var(--color-foreground)" fillOpacity={0.85} fontFamily="var(--font-sans)" fontWeight={600} fontSize={LABEL_FONT} letterSpacing="0.04em">
                  {inst.label}
                </text>
                {inst.subtitle && (
                  <text x={midX} y={LABEL_Y + LABEL_FONT + 2} textAnchor="middle" fill="var(--color-foreground)" fillOpacity={0.5} fontFamily="var(--font-sans)" fontWeight={400} fontSize={LABEL_FONT * 0.6} letterSpacing="0.02em">
                    {inst.subtitle}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Transition arrows between institution labels — scholarships/bursaries.
            Inside the labels group so they lift together on zoom.
            Cordwalles Closed Scholarship sits in the formative chapter and is
            always visible; the Recruitment Bursary spans chapters and lives in
            its own group so ScrollZoomTimeline can fade it in chapter-by-chapter. */}
        <g id="strip-transition-arcs">
          {transitionArcs.filter((arc) => arc.boundaryYear < 2019).map((arc) => {
            const fromInst = institutions.find((i) => i.toYear === arc.boundaryYear);
            const toInst = institutions.find((i) => i.fromYear === arc.boundaryYear);
            if (!fromInst || !toInst) return null;

            // Use same text-width multiplier as logo positioning above
            const charHalfW = LABEL_FONT * 0.28;

            const fromMidX = ((yearToPosition(fromInst.fromYear) + yearToPosition(fromInst.toYear)) / 2) * STRIP_X_MAX;
            const toMidX = ((yearToPosition(toInst.fromYear) + yearToPosition(toInst.toYear)) / 2) * STRIP_X_MAX;

            const fromHalfW = fromInst.label.length * charHalfW;
            const toHalfW = toInst.label.length * charHalfW;

            // Logo sits left of the text, extending the left edge of the label group.
            const toLogoOffset = toInst.logo ? LOGO_SIZE + 3 : 0;

            // Arrow from right edge of source label to left edge of dest logo
            // Use generous padding so arrow ends aren't crowding labels
            const arrowPad = 10;
            const x1 = fromMidX + fromHalfW + arrowPad;
            const x2 = toMidX - toHalfW - toLogoOffset - arrowPad;

            // Skip if labels are too close (arrow would be tiny or negative)
            if (x2 - x1 < 4) return null;

            const midX = (x1 + x2) / 2;
            // Vertically centred with label text (LABEL_Y is the text baseline,
            // shift up ~3 SVG units to align with the visual middle of caps)
            const arrowY = LABEL_Y - 3;
            const tipLen = 3;   // open chevron arm length
            const tipH = 2;     // open chevron half-height

            // Split label into two lines so text fits within arrow width
            const words = arc.label.split(" ");
            const half = Math.ceil(words.length / 2);
            const line1 = words.slice(0, half).join(" ");
            const line2 = words.slice(half).join(" ");
            const arrowLabelSize = 3.2;
            const lineGap = arrowLabelSize + 1.5; // vertical spacing between lines

            return (
              <g key={arc.label}>
                {/* Solid thin arrow line */}
                <line
                  x1={x1}
                  y1={arrowY}
                  x2={x2}
                  y2={arrowY}
                  stroke="var(--color-muted)"
                  strokeWidth={0.7}
                  strokeOpacity={0.45}
                />
                {/* Open chevron arrowhead (lines, not filled) */}
                <path
                  d={`M ${x2 - tipLen} ${arrowY - tipH} L ${x2} ${arrowY} L ${x2 - tipLen} ${arrowY + tipH}`}
                  fill="none"
                  stroke="var(--color-muted)"
                  strokeWidth={0.7}
                  strokeOpacity={0.45}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Label above the arrow — two lines, raised higher to avoid overlap */}
                <text
                  x={midX}
                  textAnchor="middle"
                  fill="var(--color-muted)"
                  fillOpacity={0.55}
                  fontFamily="var(--font-mono)"
                  fontSize={arrowLabelSize}
                  letterSpacing="0.03em"
                >
                  <tspan x={midX} y={arrowY - lineGap - 6}>{line1}</tspan>
                  <tspan x={midX} y={arrowY - 6}>{line2}</tspan>
                </text>
              </g>
            );
          })}
        </g>

        {/* Recruitment Bursary — bridges Maritzburg College → Stellenbosch.
            Lives in its own group so ScrollZoomTimeline can hide it during the
            formative chapter and fade it in as we pan into Stellenbosch. */}
        <g id="strip-recruitment-arc" opacity={0}>
          {transitionArcs.filter((arc) => arc.boundaryYear === 2019).map((arc) => {
            const fromInst = institutions.find((i) => i.toYear === arc.boundaryYear);
            const toInst = institutions.find((i) => i.fromYear === arc.boundaryYear);
            if (!fromInst || !toInst) return null;

            const charHalfW = LABEL_FONT * 0.28;
            const fromMidX = ((yearToPosition(fromInst.fromYear) + yearToPosition(fromInst.toYear)) / 2) * STRIP_X_MAX;
            const toMidX = ((yearToPosition(toInst.fromYear) + yearToPosition(toInst.toYear)) / 2) * STRIP_X_MAX;
            const fromHalfW = fromInst.label.length * charHalfW;
            const toHalfW = toInst.label.length * charHalfW;
            const toLogoOffset = toInst.logo ? LOGO_SIZE + 3 : 0;
            const arrowPad = 10;
            const rx1 = fromMidX + fromHalfW + arrowPad;
            const rx2 = toMidX - toHalfW - toLogoOffset - arrowPad;
            if (rx2 - rx1 < 4) return null;

            const midX = (rx1 + rx2) / 2;
            const arrowY = LABEL_Y - 3;
            const tipLen = 3;
            const tipH = 2;
            const words = arc.label.split(" ");
            const half = Math.ceil(words.length / 2);
            const line1 = words.slice(0, half).join(" ");
            const line2 = words.slice(half).join(" ");
            const arrowLabelSize = 3.2;
            const lineGap = arrowLabelSize + 1.5;

            return (
              <g key={arc.label}>
                <line x1={rx1} y1={arrowY} x2={rx2} y2={arrowY} stroke="var(--color-muted)" strokeWidth={0.7} strokeOpacity={0.45} />
                <path d={`M ${rx2 - tipLen} ${arrowY - tipH} L ${rx2} ${arrowY} L ${rx2 - tipLen} ${arrowY + tipH}`} fill="none" stroke="var(--color-muted)" strokeWidth={0.7} strokeOpacity={0.45} strokeLinecap="round" strokeLinejoin="round" />
                <text x={midX} textAnchor="middle" fill="var(--color-muted)" fillOpacity={0.55} fontFamily="var(--font-mono)" fontSize={arrowLabelSize} letterSpacing="0.03em">
                  <tspan x={midX} y={arrowY - lineGap - 6}>{line1}</tspan>
                  <tspan x={midX} y={arrowY - 6}>{line2}</tspan>
                </text>
              </g>
            );
          })}
        </g>

        {/* Future transition arcs — clipped to reveal progressively.
            Also needs zoomOpacity, so given an id for imperative control. */}
        <g id="strip-future-arcs" clipPath="url(#present-clip)" opacity={0}>
          {transitionArcs.filter((arc) => arc.boundaryYear > 2019).map((arc) => {
            const fromInst = institutions.find((i) => i.toYear === arc.boundaryYear);
            const toInst = institutions.find((i) => i.fromYear === arc.boundaryYear);
            if (!fromInst || !toInst) return null;

            const charHalfW = LABEL_FONT * 0.28;
            const fromMidX = ((yearToPosition(fromInst.fromYear) + yearToPosition(fromInst.toYear)) / 2) * STRIP_X_MAX;
            const toMidX = ((yearToPosition(toInst.fromYear) + yearToPosition(toInst.toYear)) / 2) * STRIP_X_MAX;
            const fromHalfW = fromInst.label.length * charHalfW;
            const toHalfW = toInst.label.length * charHalfW;
            const toLogoOffset = toInst.logo ? LOGO_SIZE + 3 : 0;
            const arrowPad = 10;
            const ax1 = fromMidX + fromHalfW + arrowPad;
            const ax2 = toMidX - toHalfW - toLogoOffset - arrowPad;
            if (ax2 - ax1 < 4) return null;

            const midX = (ax1 + ax2) / 2;
            const arrowY = LABEL_Y - 3;
            const tipLen = 3;
            const tipH = 2;
            const words = arc.label.split(" ");
            const half = Math.ceil(words.length / 2);
            const line1 = words.slice(0, half).join(" ");
            const line2 = words.slice(half).join(" ");
            const arrowLabelSize = 3.2;
            const lineGap = arrowLabelSize + 1.5;

            return (
              <g key={arc.label}>
                <line x1={ax1} y1={arrowY} x2={ax2} y2={arrowY} stroke="var(--color-muted)" strokeWidth={0.7} strokeOpacity={0.45} />
                <path d={`M ${ax2 - tipLen} ${arrowY - tipH} L ${ax2} ${arrowY} L ${ax2 - tipLen} ${arrowY + tipH}`} fill="none" stroke="var(--color-muted)" strokeWidth={0.7} strokeOpacity={0.45} strokeLinecap="round" strokeLinejoin="round" />
                <text x={midX} textAnchor="middle" fill="var(--color-muted)" fillOpacity={0.55} fontFamily="var(--font-mono)" fontSize={arrowLabelSize} letterSpacing="0.03em">
                  <tspan x={midX} y={arrowY - lineGap - 6}>{line1}</tspan>
                  <tspan x={midX} y={arrowY - 6}>{line2}</tspan>
                </text>
              </g>
            );
          })}
        </g>
      </g>

    </g>
  );
}

/** Legacy combined strip (for static/reduced-motion use) */
export default function TimelineStrip() {
  return (
    <svg
      viewBox={`-20 -50 ${STRIP_X_MAX + 40} 100`}
      className="w-full h-full"
      style={{ overflow: "visible" }}
    >
      <TimelineStripSVG />
    </svg>
  );
}

export const TimelineLine = TimelineStripSVG;
export const TimelineLabels = () => null;
