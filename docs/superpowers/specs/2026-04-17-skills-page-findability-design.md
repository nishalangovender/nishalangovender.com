# Skills Page Findability & Visual Refresh

**Date:** 2026-04-17
**Status:** Approved, ready for implementation
**Route:** `/skills`

## Problem

The current `/skills` page has one interaction surface: the Venn diagram. Skills are only visible after hovering/clicking a zone. This is great storytelling but bad findability — visitors searching for a specific technology (e.g. "ROS2", "KiCAD") have no way to locate it without probing zones. Two additional issues:

1. Proficiency bars are all one colour (accent blue), so there's no scannable signal for which skills are strengths vs. familiar-only.
2. Icon tiles use `bg-accent-light`, a blue background that swallows blue-brand logos (TypeScript, Docker, React, KiCAD, PostgreSQL, STM32).

## Goal

Add a browseable, searchable skill list below the Venn, colour-code proficiency tiers, and refresh the icon tile so every logo reads clearly — without undermining the Venn's role as the page's narrative hero.

## Structure & Layout

The page keeps its current hero (eyebrow, heading, intro) and Venn diagram. A new `SkillsBrowser` section is appended below, separated by a circuit divider:

```
[hero]
[SkillsVenn]  ← unchanged narrative hero

─── circuit divider ───

[SkillsBrowser]
  ├── "Browse All Skills" heading + subtitle
  ├── Search input + 4-tier colour legend
  └── 7 zone blocks (same order as the Venn data):
      • Software Engineering
      • Embedded Software
      • Electronics & Embedded
      • Simulation & Digital Twins
      • Mechatronics & Robotics
      • Electromechanical Systems
      • Mechanical Engineering
      Each block: zone heading (+ subtitle for intersections) + 2-col grid of SkillCards on md+, 1 col on mobile.
```

The Venn's empty-state panel gets a `"Browse All Skills ↓"` link that smooth-scrolls to `#skills-browser`. Clicking a Venn zone opens its detail panel (current behaviour) **and** smooth-scrolls to the matching `#zone-<key>` anchor below. Smooth-scroll falls back to instant when `prefers-reduced-motion` is set.

## Proficiency Colour System

Four discrete tiers, warm-to-cool, no red — aligned with the existing `profLabel()` thresholds:

| Tier       | Range  | Light mode | Dark mode  |
| ---------- | ------ | ---------- | ---------- |
| Advanced   | 90–100 | `#10B981`  | `#34D399`  |
| Proficient | 75–89  | `#14B8A6`  | `#2DD4BF`  |
| Competent  | 60–74  | `#F59E0B`  | `#FBBF24`  |
| Familiar   | 0–59   | `#94A3B8`  | `#CBD5E1`  |

Applied in three places:

1. Proficiency bar fill (replaces `bg-accent`)
2. Tier label text next to the bar (same colour as the bar)
3. Venn detail panel's `SkillRow` — same treatment, one consistent language across the page

Implemented via CSS variables (`--prof-advanced`, `--prof-proficient`, `--prof-competent`, `--prof-familiar`) that swap on theme. A `profColor(p)` helper exported from `src/data/skills.ts` returns `{ bar, label, tier }`.

A 4-chip legend (4 dots + tier names, JetBrains Mono labels) sits inline to the right of the search input on desktop, below it on mobile.

## Icon Tile Refresh

Replace `bg-accent-light` with a neutral tile + zone-tinted ring:

- Tile background: `bg-surface` (white in light, near-black in dark)
- Ring: 1.5px, colour derived from zone
- Brand-coloured icons render at full saturation
- Non-branded icons use `--foreground` (not `--accent`) so they stay neutral against the tinted ring

**Zone → ring colour:**

| Zone                        | Ring                      |
| --------------------------- | ------------------------- |
| Software Engineering        | `#3B82F6` (blue)          |
| Electronics & Embedded      | `#10B981` (green)         |
| Mechanical Engineering      | `#F59E0B` (amber)         |
| Embedded Software           | `#14B8A6` (teal, sw×el)   |
| Simulation & Digital Twins  | `#8B5CF6` (violet, sw×me) |
| Electromechanical Systems   | `#84CC16` (lime, el×me)   |
| Mechatronics & Robotics     | `var(--accent)` (centre)  |

**Sizing:**
- `SkillsBrowser` list: `w-9 h-9` tile, `w-4.5 h-4.5` icon
- `SkillsVenn` detail panel: `w-7 h-7` tile, `w-3.5 h-3.5` icon (unchanged sizing, only colour/ring update)

A shared `<SkillIconTile>` component is used by both surfaces so the two stay visually synced.

## Search Behaviour

Single text input above the zone blocks:

- Placeholder: `Search skills or disciplines… (e.g. "ROS", "embedded", "CAD")`
- Case-insensitive substring match
- Matches: skill name **and** zone label/subtitle (a zone-label match reveals all skills in that zone)
- Debounced to 120ms

**Display rules:**
- Non-matching skills hide (no animation on hide to avoid layout thrash)
- **All 7 zone headings stay visible** even with zero matches; they show a muted `0 matches` chip
- Empty state (zero total matches): a single centred row under the search — `No skills match "<query>". Try "ROS", "Linux", or "CAD".`
- Clear `×` button inside the input resets to full list

**A11y:**
- `aria-label="Search skills"` on the input
- Visually hidden `aria-live="polite"` region announces match count: `"12 skills match"`
- `Esc` clears when focused

No URL persistence — search state stays component-local.

## Components & File Changes

**New:**
- `src/components/ui/SkillsBrowser.tsx` — client component owning search, legend, zone sections
- `src/components/ui/SkillIconTile.tsx` — shared neutral-tile + zone-ring component

**Modified:**
- `src/data/skills.ts` — add `profColor(p)`, `zoneRingColor(key)`, `zoneAnchorId(key)` helpers. Zone data unchanged.
- `src/components/ui/SkillsVenn.tsx` —
  - `SkillRow` adopts `<SkillIconTile>` and `profColor()`
  - Empty-state panel adds `"Browse All Skills ↓"` link
  - Zone click smooth-scrolls to `#zone-<key>` on activate (not on deselect), respects reduced motion
- `src/app/skills/page.tsx` — render `<SkillsBrowser />` below `<SkillsVenn />` with a circuit divider between
- `src/app/globals.css` — add four `--prof-*` CSS vars for both themes

**Zone data is not touched.** All 75 skills stay as-is.

## A11y, Motion, Mobile

- `prefers-reduced-motion`: bar fills, fades, smooth-scroll all gate on the media query (global CSS handles most; `scrollIntoView` gates explicitly)
- AA contrast verified for all four proficiency colours against `--background` in both themes
- Mobile: search full-width, legend wraps below, zone grid collapses to 1 column below `md` (768px), tap targets ≥ 40px tall
- Keyboard: Tab order is search → zone headings (via `<h3>`) → skill rows. No new focus traps.

## Out of Scope

- Filter-by-tier chips
- Sort controls (by name / proficiency)
- URL persistence of search
- Scroll-entry animations on list items (static feels more document-like, suits browse mode)
