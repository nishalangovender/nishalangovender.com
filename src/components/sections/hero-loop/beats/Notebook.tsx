import { NotebookPageSubstrate } from "./NotebookPageSubstrate";

/**
 * Hardbound A5 notebook held landscape (rotated sideways), folded behind
 * the binding so only the BOTTOM page is visible as a writing surface.
 *
 * Above the binding: the desk/surrounding background. The folded-back half
 * is behind the spine, out of view. The binding sits at the top of the
 * visible composition.
 *
 * Layout (640×540 viewport):
 *   Binding           (50,  92) → (598, 100)  — 548×8 horizontal (spine)
 *   Cover slab        wraps the bottom page + stack below the binding
 *   Bottom page       (50, 100) → (598, 490)  — 548×390 ≈ 1.40:1 landscape
 *   Page-stack strata surround the bottom page (left/right/below)
 */

/** Number of page-edge strata in the stack. */
const STACK_LAYERS = 5;

// Bottom page sits just below the fold (desk above). The fold line itself
// is just the stitching along the page's top edge — no separate binding
// rect. STACK_LAYERS * 2 of page-stack edge shows below the page.
const BOTTOM_PAGE = { x: 50, y: 150, w: 548, h: 340 } as const;
const BINDING = {
  x: BOTTOM_PAGE.x,
  y: BOTTOM_PAGE.y,
  w: BOTTOM_PAGE.w,
  h: 0,
} as const;
// Cover wraps the page + stack with an equal ~18px rim on all three
// visible sides (left, right, below the stack).
const COVER_RIM = 18;
const COVER = {
  x: BOTTOM_PAGE.x - COVER_RIM,
  y: BOTTOM_PAGE.y,
  w: BOTTOM_PAGE.w + COVER_RIM * 2,
  h: BOTTOM_PAGE.h + STACK_LAYERS * 2 + COVER_RIM,
} as const;

export const NOTEBOOK_LAYOUT = {
  cover: COVER,
  binding: BINDING,
  bottomPage: BOTTOM_PAGE,
} as const;

interface NotebookProps {
  /** When true (default), render a full-viewport background rect behind the
   *  notebook. Pass false when rendering the notebook as a small object on
   *  a desk (Beat 6) — the desk behind it should show through. */
  backdrop?: boolean;
}

export function Notebook({ backdrop = true }: NotebookProps = {}) {
  return (
    <g aria-hidden="true">
      {/* Desk surround — neutral background behind the notebook. */}
      {backdrop && (
        <rect
          x={0}
          y={0}
          width={640}
          height={540}
          fill="var(--background, #FAFAFA)"
        />
      )}

      {/* Hardcover slab — starts below the binding, wraps page + stack. Top
          edge is flush with the binding's bottom edge; bottom corners are
          rounded like a real hardcover. */}
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
        fill="var(--notebook-cover, #1E3A6B)"
        stroke="var(--notebook-cover-edge, #142650)"
        strokeWidth={1.2}
      />
      {/* Cover inner crease — thin darker line just inside the edge so the
          cover reads as rigid board. */}
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
        stroke="var(--notebook-cover-edge, #142650)"
        strokeWidth={0.6}
        opacity={0.45}
      />

      {/* ── PAGE-STACK (below bottom page, sides) ── Farthest-first rects
          larger than the bottom page. Each stratum's 2px rim shows around
          the page because the next (smaller) stratum covers the rest.
          Darker edge strokes so the strata read clearly as distinct pages. */}
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
              fill="var(--notebook-page, #F5EFE0)"
              stroke="var(--notebook-page-edge, rgba(60, 45, 20, 0.55))"
              strokeWidth={0.8}
              opacity={0.98 - i * 0.05}
            />
          );
        })}

      {/* Bottom page — the writing surface. Drawn on top of the stack so
          the stack's interior is covered and only the edges remain. */}
      <NotebookPageSubstrate
        x={BOTTOM_PAGE.x}
        y={BOTTOM_PAGE.y}
        width={BOTTOM_PAGE.w}
        height={BOTTOM_PAGE.h}
      />

      {/* Stitching along the fold — the only mark that signals the fold.
          Sits right on the top edge of the bottom page. */}
      <line
        x1={BOTTOM_PAGE.x + 8}
        y1={BOTTOM_PAGE.y}
        x2={BOTTOM_PAGE.x + BOTTOM_PAGE.w - 8}
        y2={BOTTOM_PAGE.y}
        stroke="var(--notebook-page-edge, rgba(60, 45, 20, 0.55))"
        strokeWidth={1.2}
        strokeDasharray="6 6"
        strokeLinecap="round"
        opacity={0.9}
      />

    </g>
  );
}
