# Skills Page Findability & Visual Refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a searchable, browseable skill list below the Venn on `/skills`, colour-code proficiency tiers across both the list and the Venn detail panel, and refresh icon tiles so blue-brand logos no longer fade into the background.

**Architecture:** Introduce two new client components (`SkillsBrowser`, `SkillIconTile`), add three pure helpers to `src/data/skills.ts` (`profColor`, `zoneRingColor`, `zoneAnchorId`), extend `SkillsVenn` with anchor-scroll + shared icon tile + coloured proficiency bar, and add four proficiency CSS variables to `globals.css`. Zone data is not touched.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS v4, Framer Motion, react-icons.

**Reference spec:** `docs/superpowers/specs/2026-04-17-skills-page-findability-design.md`

---

## Task 1: Add proficiency CSS variables

**Files:**
- Modify: `src/app/globals.css` (light `:root`, dark `[data-theme="dark"]`, and the system-preference fallback block)

- [ ] **Step 1: Add four proficiency vars to the light `:root` block**

Open `src/app/globals.css`. Find the `:root {` block starting at line 4 and add four new variables just before the closing `}` (after `--blueprint-line: rgba(0, 102, 255, 0.06);`):

```css
  --prof-advanced: #10B981;
  --prof-proficient: #14B8A6;
  --prof-competent: #F59E0B;
  --prof-familiar: #94A3B8;
```

- [ ] **Step 2: Add the dark-mode variants to `[data-theme="dark"]`**

Find `[data-theme="dark"] {` (around line 17) and add inside the block:

```css
  --prof-advanced: #34D399;
  --prof-proficient: #2DD4BF;
  --prof-competent: #FBBF24;
  --prof-familiar: #CBD5E1;
```

- [ ] **Step 3: Mirror the same dark values in the `prefers-color-scheme: dark` fallback**

Inside `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }` (around line 30), add the same four dark values so pre-hydration users get the right colours:

```css
    --prof-advanced: #34D399;
    --prof-proficient: #2DD4BF;
    --prof-competent: #FBBF24;
    --prof-familiar: #CBD5E1;
```

- [ ] **Step 4: Verify the dev server still compiles**

Run: `npm run dev` (if not already running). Visit any page. Expected: no Tailwind/CSS errors in the terminal or browser console.

- [ ] **Step 5: Stop — hand over to Nish for local verification and commit**

Tell Nish: "Task 1 done — added four proficiency CSS variables to `globals.css` for both themes. Please verify `npm run dev` has no errors and commit with `feat: add proficiency tier CSS variables`."

---

## Task 2: Add data helpers (`profColor`, `zoneRingColor`, `zoneAnchorId`)

**Files:**
- Modify: `src/data/skills.ts` (append helpers after the existing `profLabel` function around line 98)

- [ ] **Step 1: Add `ProficiencyTier` type and `profColor` helper below `profLabel`**

In `src/data/skills.ts`, immediately after the `profLabel` function (line 98), add:

```ts
export type ProficiencyTier = "advanced" | "proficient" | "competent" | "familiar";

export function profTier(p: number): ProficiencyTier {
  if (p >= 90) return "advanced";
  if (p >= 75) return "proficient";
  if (p >= 60) return "competent";
  return "familiar";
}

/** Returns the CSS variable reference for a given proficiency's tier colour.
 *  Use as both bar fill and label text colour for consistent scanning. */
export function profColor(p: number): { varName: string; tier: ProficiencyTier } {
  const tier = profTier(p);
  return { varName: `var(--prof-${tier})`, tier };
}
```

- [ ] **Step 2: Add `zoneRingColor` helper below `profColor`**

Append:

```ts
/** Ring colour for each zone's icon tile. Mirrors the discipline palette and
 *  gives each zone a distinct visual signature. */
export function zoneRingColor(key: ZoneKey): string {
  switch (key) {
    case "software":
      return "#3B82F6";
    case "electronics":
      return "#10B981";
    case "hardware":
      return "#F59E0B";
    case "software-electronics":
      return "#14B8A6";
    case "software-hardware":
      return "#8B5CF6";
    case "electronics-hardware":
      return "#84CC16";
    case "center":
      return "var(--accent)";
  }
}
```

- [ ] **Step 3: Add `zoneAnchorId` helper**

Append:

```ts
/** Stable DOM anchor id for a zone section in the SkillsBrowser. */
export function zoneAnchorId(key: ZoneKey): string {
  return `zone-${key}`;
}
```

- [ ] **Step 4: Verify TypeScript still type-checks**

Run: `npx tsc --noEmit`
Expected: exit code 0, no errors.

- [ ] **Step 5: Stop — hand over to Nish for local verification and commit**

Tell Nish: "Task 2 done — added `profTier`, `profColor`, `zoneRingColor`, `zoneAnchorId` helpers to `src/data/skills.ts`. Please run `npm run dev` and commit with `feat: add proficiency and zone colour helpers`."

---

## Task 3: Create shared `SkillIconTile` component

**Files:**
- Create: `src/components/ui/SkillIconTile.tsx`

- [ ] **Step 1: Create the file with the full component**

Write to `src/components/ui/SkillIconTile.tsx`:

```tsx
import type { IconType } from "react-icons";

import type { Skill, ZoneKey } from "@/data/skills";
import { zoneRingColor } from "@/data/skills";

type Size = "sm" | "md";

interface SkillIconTileProps {
  skill: Skill;
  zoneKey: ZoneKey;
  size?: Size;
}

const sizeStyles: Record<Size, { tile: string; icon: string }> = {
  sm: { tile: "w-7 h-7", icon: "w-3.5 h-3.5" },
  md: { tile: "w-9 h-9", icon: "w-[18px] h-[18px]" },
};

/** Neutral tile with a zone-tinted ring.
 *  - Tile background: --surface (white / near-black) so blue-brand logos pop.
 *  - Ring: 1.5px, colour derived from the skill's zone.
 *  - Brand-coloured icons render at full saturation; others inherit --foreground.
 */
export function SkillIconTile({
  skill,
  zoneKey,
  size = "md",
}: SkillIconTileProps) {
  const Icon: IconType = skill.icon;
  const { tile, icon } = sizeStyles[size];
  const ring = zoneRingColor(zoneKey);

  return (
    <div
      className={`flex items-center justify-center rounded-md bg-surface flex-shrink-0 ${tile}`}
      style={{
        boxShadow: `inset 0 0 0 1.5px ${ring}`,
      }}
    >
      <Icon
        className={icon}
        style={{ color: skill.color ?? "var(--foreground)" }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 3: Stop — hand over to Nish for local verification and commit**

Tell Nish: "Task 3 done — created `SkillIconTile` shared component. Not yet wired in. Please run `npm run dev` to confirm no errors and commit with `feat: add shared SkillIconTile component`."

---

## Task 4: Update `SkillsVenn` to use the shared tile and coloured proficiency

**Files:**
- Modify: `src/components/ui/SkillsVenn.tsx`

- [ ] **Step 1: Add the new imports**

At the top of `src/components/ui/SkillsVenn.tsx`, update the imports. Replace the existing import block at lines 1-8 with:

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type KeyboardEvent } from "react";

import { SkillIconTile } from "@/components/ui/SkillIconTile";
import type { Skill, ZoneData, ZoneKey } from "@/data/skills";
import { profColor, profLabel, zoneAnchorId, zones } from "@/data/skills";
```

- [ ] **Step 2: Update `SkillRow` to use the shared tile + tier colour**

Find the `SkillRow` function (around line 293). Replace its entire body with:

```tsx
function SkillRow({
  skill,
  zoneKey,
  index,
}: {
  skill: Skill;
  zoneKey: ZoneKey;
  index: number;
}) {
  const { varName } = profColor(skill.proficiency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="flex items-center gap-3"
    >
      <SkillIconTile skill={skill} zoneKey={zoneKey} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-foreground font-medium truncate">
            {skill.name}
          </span>
          <span
            className="font-mono text-[10px] ml-2 flex-shrink-0"
            style={{ color: varName }}
          >
            {profLabel(skill.proficiency)}
          </span>
        </div>

        <div className="h-[3px] w-full bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: varName }}
            initial={{ width: 0 }}
            animate={{ width: `${skill.proficiency}%` }}
            transition={{
              delay: index * 0.05 + 0.15,
              duration: 0.5,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Pass `zoneKey` from the panel into `SkillRow`**

Find the map call in the detail panel (around line 262-264):

```tsx
{zoneMap[active].skills.map((skill, i) => (
  <SkillRow key={skill.name} skill={skill} index={i} />
))}
```

Replace with:

```tsx
{zoneMap[active].skills.map((skill, i) => (
  <SkillRow key={skill.name} skill={skill} zoneKey={active} index={i} />
))}
```

- [ ] **Step 4: Add "Browse All Skills ↓" link to the empty-state panel**

Find the empty-state motion.div (around line 268-284). Replace the `<p>` line with both the paragraph and the link:

```tsx
<p className="mt-3 text-base text-foreground leading-relaxed">
  Hover or tap a region to explore. The overlaps are where
  disciplines converge — and the centre, where all three meet,
  is mechatronics.
</p>
<a
  href="#skills-browser"
  className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.15em] uppercase text-accent hover:text-accent-dark transition-colors"
>
  Browse All Skills
  <span aria-hidden>↓</span>
</a>
```

- [ ] **Step 5: Make zone clicks smooth-scroll to the matching list section**

Find the `toggle` function (around line 116-118):

```tsx
function toggle(zone: ZoneKey) {
  setActive((current) => (current === zone ? null : zone));
}
```

Replace with:

```tsx
function toggle(zone: ZoneKey) {
  setActive((current) => {
    const next = current === zone ? null : zone;
    if (next !== null && typeof window !== "undefined") {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const el = document.getElementById(zoneAnchorId(next));
      el?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }
    return next;
  });
}
```

- [ ] **Step 6: Verify TypeScript and dev build**

Run: `npx tsc --noEmit`
Expected: exit code 0.

Then visit `/skills` in `npm run dev`. Expected: Venn detail panel shows the new neutral tiles with coloured rings, proficiency bars use green/teal/amber/slate tier colours. Empty state shows the "Browse All Skills ↓" link (anchor won't resolve until Task 6 — link just jumps to top for now, which is fine).

- [ ] **Step 7: Stop — hand over to Nish**

Tell Nish: "Task 4 done — `SkillsVenn` now uses the shared icon tile, tier-coloured proficiency bars, the 'Browse All Skills' link, and anchor-scrolls on zone click (anchor targets land in Task 6). Please verify visually and commit with `feat: refresh Venn detail panel with tier colours and shared icon tile`."

---

## Task 5: Create `SkillsBrowser` component

**Files:**
- Create: `src/components/ui/SkillsBrowser.tsx`

- [ ] **Step 1: Create the file with the full component**

Write to `src/components/ui/SkillsBrowser.tsx`:

```tsx
"use client";

import { useId, useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";

import { SkillIconTile } from "@/components/ui/SkillIconTile";
import type { Skill, ZoneKey } from "@/data/skills";
import {
  profColor,
  profLabel,
  zoneAnchorId,
  zones,
} from "@/data/skills";

const TIER_LEGEND: { label: string; varName: string }[] = [
  { label: "Advanced", varName: "var(--prof-advanced)" },
  { label: "Proficient", varName: "var(--prof-proficient)" },
  { label: "Competent", varName: "var(--prof-competent)" },
  { label: "Familiar", varName: "var(--prof-familiar)" },
];

function matches(skill: Skill, zoneHaystack: string, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (zoneHaystack.includes(q)) return true;
  return skill.name.toLowerCase().includes(q);
}

export default function SkillsBrowser() {
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const searchId = useId();

  // Debounce input → query by 120ms
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setRawQuery(value);
    window.clearTimeout((handleChange as unknown as { _t?: number })._t);
    (handleChange as unknown as { _t?: number })._t = window.setTimeout(() => {
      setQuery(value.trim());
    }, 120);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setRawQuery("");
      setQuery("");
    }
  }

  function clear() {
    setRawQuery("");
    setQuery("");
  }

  // Compute filtered zones + total match count
  const { filteredZones, totalMatches } = useMemo(() => {
    let total = 0;
    const result = zones.map(({ key, data }) => {
      const zoneHaystack =
        `${data.label} ${data.subtitle ?? ""}`.toLowerCase();
      const visibleSkills = data.skills.filter((s) =>
        matches(s, zoneHaystack, query),
      );
      total += visibleSkills.length;
      return { key, data, visibleSkills };
    });
    return { filteredZones: result, totalMatches: total };
  }, [query]);

  return (
    <section id="skills-browser" aria-labelledby={`${searchId}-heading`}>
      <div className="flex flex-col gap-2">
        <h2
          id={`${searchId}-heading`}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          Browse All Skills
        </h2>
        <p className="text-muted text-base leading-relaxed max-w-2xl">
          The full toolkit, grouped by discipline. Search by skill name or
          discipline (try "ROS", "embedded", "CAD").
        </p>
      </div>

      {/* Search + Legend */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <input
            id={searchId}
            type="search"
            value={rawQuery}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder='Search skills or disciplines… (e.g. "ROS", "embedded", "CAD")'
            aria-label="Search skills"
            aria-controls={`${searchId}-results`}
            className="w-full h-11 px-4 pr-10 rounded-md bg-surface border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded text-muted hover:text-foreground transition-colors"
            >
              <span aria-hidden className="text-lg leading-none">×</span>
            </button>
          )}
        </div>

        <ul
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
          aria-label="Proficiency legend"
        >
          {TIER_LEGEND.map((t) => (
            <li key={t.label} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: t.varName }}
              />
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted">
                {t.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* A11y live region */}
      <div className="sr-only" aria-live="polite" role="status">
        {query
          ? `${totalMatches} ${totalMatches === 1 ? "skill" : "skills"} match`
          : ""}
      </div>

      {/* Zero-match message */}
      {query && totalMatches === 0 && (
        <p className="mt-10 text-center text-muted text-sm">
          No skills match “{query}”. Try “ROS”, “Linux”, or “CAD”.
        </p>
      )}

      {/* Zone sections */}
      <div id={`${searchId}-results`} className="mt-10 space-y-12">
        {filteredZones.map(({ key, data, visibleSkills }) => (
          <div
            key={key}
            id={zoneAnchorId(key)}
            className="scroll-mt-24"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {data.subtitle && (
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                  {data.subtitle}
                </span>
              )}
              <h3 className="text-xl font-bold tracking-tight">{data.label}</h3>
              {query && visibleSkills.length === 0 && (
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted">
                  0 matches
                </span>
              )}
            </div>

            {visibleSkills.length > 0 && (
              <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {visibleSkills.map((skill) => (
                  <SkillListRow key={skill.name} skill={skill} zoneKey={key} />
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SkillListRow({ skill, zoneKey }: { skill: Skill; zoneKey: ZoneKey }) {
  const { varName } = profColor(skill.proficiency);

  return (
    <li className="flex items-center gap-3">
      <SkillIconTile skill={skill} zoneKey={zoneKey} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-foreground font-medium truncate">
            {skill.name}
          </span>
          <span
            className="font-mono text-[10px] ml-2 flex-shrink-0"
            style={{ color: varName }}
          >
            {profLabel(skill.proficiency)}
          </span>
        </div>

        <div className="h-[3px] w-full bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${skill.proficiency}%`,
              backgroundColor: varName,
            }}
          />
        </div>
      </div>
    </li>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 3: Stop — hand over to Nish**

Tell Nish: "Task 5 done — created `SkillsBrowser` component. Not yet rendered on the page. Please run `npm run dev` to confirm no type errors and commit with `feat: add SkillsBrowser with search and tier legend`."

---

## Task 6: Render `SkillsBrowser` on the Skills page

**Files:**
- Modify: `src/app/skills/page.tsx`

- [ ] **Step 1: Add the import and render the new section**

Replace the entire contents of `src/app/skills/page.tsx` with:

```tsx
"use client";

import { motion } from "framer-motion";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSection } from "@/components/ui/PageSection";
import SkillsBrowser from "@/components/ui/SkillsBrowser";
import SkillsVenn from "@/components/ui/SkillsVenn";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function SkillsPage() {
  return (
    <PageSection>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <Eyebrow>Toolkit</Eyebrow>
        </motion.div>

        <motion.h1
          className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
          variants={fadeUp}
        >
          Skills & Technologies
        </motion.h1>

        <motion.div
          className="circuit-divider max-w-xs mt-6"
          variants={fadeUp}
        />

        <motion.p
          className="mt-6 text-muted text-lg leading-relaxed max-w-2xl"
          variants={fadeUp}
        >
          Mechatronics sits at the intersection of software, electronics, and
          mechanical engineering. Explore each discipline — and the overlaps
          where they meet.
        </motion.p>

        <motion.div className="mt-16" variants={fadeUp}>
          <SkillsVenn />
        </motion.div>
      </motion.div>

      <div className="circuit-divider mt-20 mb-16" />

      <SkillsBrowser />
    </PageSection>
  );
}
```

- [ ] **Step 2: Verify TypeScript and dev build**

Run: `npx tsc --noEmit`
Expected: exit code 0.

Visit `/skills` in `npm run dev`. Expected:
- Venn diagram unchanged in structure
- Circuit divider below it
- "Browse All Skills" heading, search input, legend
- 7 zone sections in 2-column grid on desktop, 1-column on mobile
- Every skill row has a neutral icon tile with the zone's coloured ring
- Proficiency bars and labels use the tier colour (green/teal/amber/slate)
- Clicking a Venn zone smooth-scrolls to that zone's heading below
- Empty-state "Browse All Skills ↓" link also scrolls to the section

- [ ] **Step 3: Manual test — search behaviour**

In the search input, test each:
- Type `ros` → only matching skills (ROS2, RViz, RPi/Jetson etc via name, plus whatever a zone-label match surfaces) remain visible; empty zones show "0 matches"
- Type `embedded` → reveals the full "Embedded Software" zone via label match plus "Electronics & Embedded"
- Type `xyzqqq` → empty-state message appears
- Press `Esc` in the input → clears
- Click the × button → clears

- [ ] **Step 4: Manual test — themes and responsive**

- Toggle dark mode → tiles become near-black, rings stay saturated, bars shift to the lighter tier palette
- Resize to mobile width → grid collapses to 1 column, legend wraps below the search input
- Enable "Reduce motion" in system settings → Venn zone clicks jump instantly (no smooth scroll), bar fills are near-instant

- [ ] **Step 5: Stop — hand over to Nish**

Tell Nish: "Task 6 done — `SkillsBrowser` is now wired into `/skills`. Please test locally (search, dark mode, mobile, reduced motion) and commit with `feat: add browseable skills list with search and tier colour coding`."

---

## Self-Review Notes

- **Spec coverage:** Structure (Task 6), Proficiency colours (Tasks 1–2, 4, 5), Icon tile (Tasks 2, 3, 4, 5), Search (Task 5), Anchor-scroll from Venn (Task 4 step 5), Empty-state "Browse All Skills" link (Task 4 step 4), Legend (Task 5), A11y live region and Esc (Task 5), Reduced motion (Task 4 step 5, global CSS already handles transitions).
- **Placeholder scan:** none.
- **Type consistency:** `SkillRow` now takes `zoneKey: ZoneKey`, call site updated (Task 4 step 3). `SkillIconTile` props used identically in Tasks 4 and 5. `profColor` returns `{ varName, tier }` and consumers only read `varName`.
