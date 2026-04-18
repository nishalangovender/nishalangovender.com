# Hero Loop (Stylised) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 12s, 7-beat stylised "technical-anime linework" loop defined in `docs/private/hero-loop-stylised-spec.md` as a code-generated component mounted alongside the existing `Hero.tsx` text block on the homepage.

**Architecture:** Route A from the spec — runtime-generated SVG linework orchestrated by a single time-based scheduler. One `HeroLoop.tsx` container owns the scheduler, reduced-motion gating, and a11y wrappers. Seven `Beat*.tsx` components each own one narrative beat and accept a `progress` (0–1) prop. Shared `primitives/` encapsulate stroke-along-path, monospace typewriter, and chromatic-offset effects so beats stay focused on composition. All colour is `var(--*)` so the theme toggle re-skins the loop live. Static reduced-motion frame is a pure SVG component rendered on server; the animated loop hydrates over it.

**Tech Stack:** Next.js 15 App Router · React 19 · TypeScript strict · Tailwind CSS v4 · Framer Motion 12 (`motion`, `useReducedMotion`, `useAnimationFrame`) · Vitest + jsdom (unit tests) · existing CSS tokens in `src/app/globals.css`.

**Spec:** `docs/private/hero-loop-stylised-spec.md` (design-only). Every task in this plan maps to one or more spec sections — see the Spec Coverage Map at the bottom.

**Escape hatches:**
- **Rive fallback** — if the end of Task 4 (Beat 1 prototype) or Task 5 (Beat 3 ink-lift) produces visibly stiff motion on Nish's review in-browser, stop and switch to Rive. See Task 13.
- **Placement fallback** — Option 6a (side panel) is the default. If it reads as "widget, not hero" on the live prototype, escalate to 6b (full-bleed + scrim) per spec §6. See Task 11.

---

## File Structure

Mirrors `src/components/demos/path-following/` (the closest precedent in the repo: focused per-concern files, a container, and a `__tests__/` folder).

### Created files

```
src/components/sections/hero-loop/
├── HeroLoop.tsx              # Client container — scheduler, reduced-motion, aria, mounts all beats
├── HeroLoopStatic.tsx        # Server-safe static frame — last-frame-of-Beat-1 sketch composition
├── timeline.ts               # BEATS[] with start/end seconds, TOTAL_DURATION, easings
├── types.ts                  # BeatProps, Seconds, BeatId
├── beats/
│   ├── BeatSketch.tsx        # Beat 1 (0.0–2.0s)
│   ├── BeatMath.tsx          # Beat 2 (2.0–3.5s)
│   ├── BeatLift.tsx          # Beat 3 (3.5–5.0s)
│   ├── BeatBoot.tsx          # Beat 4 (5.0–6.5s)
│   ├── BeatDrive.tsx         # Beat 5 (6.5–9.0s)
│   ├── BeatDashboard.tsx     # Beat 6 (9.0–10.5s)
│   └── BeatReturn.tsx        # Beat 7 (10.5–12.0s) — lands on Beat-1 composition
├── primitives/
│   ├── StrokePath.tsx        # <path> with progress-driven pathLength reveal
│   ├── Typewriter.tsx        # Mono text that reveals char-by-char
│   └── ChromaticShift.tsx    # Wrapper applying RGB-split drop-shadow at motion peaks
└── __tests__/
    ├── timeline.test.ts      # Beats are contiguous, cover 0→TOTAL_DURATION, no gaps/overlaps
    └── HeroLoopStatic.test.tsx  # Renders; has role="img" + aria-label; no framer-motion imports
```

### Modified files

- `src/components/sections/Hero.tsx` — add right-column panel containing `<HeroLoop />` at `md:`+; stack below CTAs on mobile.

### Not created

- No new CSS file. Loop uses inline `style={{ color: 'var(--foreground)' }}` / `stroke="currentColor"` / `fill="var(--accent)"` patterns already used throughout the repo. No `.module.css`, no `styled-components` — matches repo convention.

### File responsibilities (why this split)

- **`HeroLoop.tsx` stays small** because the scheduler + a11y wrapper are the only cross-cutting concerns. Every beat is its own file so an edit to (say) the dashboard never risks breaking the drive beat.
- **`primitives/`** pulls out stroke-along-path, typewriter, and chromatic-shift *once* so a bug fix in path animation fixes it in all beats.
- **`timeline.ts` is data, not logic.** It's trivial to unit-test (no React, no DOM) and makes the 12s loop shape reviewable in a single file.
- **`HeroLoopStatic.tsx` is a server component** by convention (no `"use client"` directive, no hooks). It renders the reduced-motion frame on the server as the LCP-adjacent paint.

---

## Conventions for every task

- **Reference the spec** in the commit message when the task implements a numbered section (e.g. `feat: hero-loop beat 3 ink-lift — spec §3, §2`).
- **Each task ends with a commit step.** Commit messages match repo rhythm: one-line subject, no body. Nish will do the actual `git commit` — steps show the exact command he should run, not "I commit" style.
- **Nish does NOT want Claude to commit.** Per `CLAUDE.md` §"Commit Workflow": Claude implements → stops → Nish tests → Nish commits. So in each task, the final "Run commit" step is written as an instruction the implementer surfaces to Nish.
- **Run `npm run lint` and `npm run build`** at the end of Tasks 2, 4, 10, 12. These are the heavier-surface tasks and the gates the rest of the repo uses.
- **Don't add dev dependencies** without an explicit task for it. Everything below uses only what's already in `package.json`.

---

## Task 0: Create worktree and branch

**Files:**
- Nothing tracked by git yet — this task creates the isolated workspace.

- [ ] **Step 1: Create the worktree and feature branch**

```bash
cd /Users/nishalangovender/nishalangovender.com
git worktree add -b feature/hero-loop-stylised ../nishalangovender.com-hero-loop main
cd ../nishalangovender.com-hero-loop
```

Expected: new directory `../nishalangovender.com-hero-loop` containing a checkout of `main` on branch `feature/hero-loop-stylised`.

- [ ] **Step 2: Install deps in the worktree**

```bash
npm install
```

Expected: `node_modules/` present, no new lockfile diff (fresh install of existing lock).

- [ ] **Step 3: Boot the dev server once to confirm a clean baseline**

```bash
npm run dev
```

Expected: server starts on `localhost:3000`, homepage loads, no console errors. Stop the server (`Ctrl-C`) before moving on.

- [ ] **Step 4: No commit here** — nothing to commit; worktree/branch is untracked state.

---

## Task 1: Timeline data module

Builds the time-axis of the loop before any rendering. Locked-in first so every later task references the same source of truth for beat start/end seconds.

**Files:**
- Create: `src/components/sections/hero-loop/types.ts`
- Create: `src/components/sections/hero-loop/timeline.ts`
- Test: `src/components/sections/hero-loop/__tests__/timeline.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/hero-loop/__tests__/timeline.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { BEATS, TOTAL_DURATION } from "../timeline";

describe("hero-loop timeline", () => {
  it("covers 0 to TOTAL_DURATION with no gaps or overlaps", () => {
    expect(BEATS[0].start).toBe(0);
    expect(BEATS[BEATS.length - 1].end).toBe(TOTAL_DURATION);
    for (let i = 1; i < BEATS.length; i += 1) {
      expect(BEATS[i].start).toBeCloseTo(BEATS[i - 1].end, 5);
    }
  });

  it("has exactly 7 beats", () => {
    expect(BEATS).toHaveLength(7);
  });

  it("totals 12 seconds", () => {
    expect(TOTAL_DURATION).toBe(12);
  });

  it("gives every beat a strictly positive duration", () => {
    for (const beat of BEATS) {
      expect(beat.end).toBeGreaterThan(beat.start);
    }
  });

  it("assigns each beat a unique id", () => {
    const ids = BEATS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- timeline`

Expected: FAIL — `Cannot find module '../timeline'`.

- [ ] **Step 3: Implement types**

Create `src/components/sections/hero-loop/types.ts`:

```ts
export type Seconds = number;

export type BeatId =
  | "sketch"
  | "math"
  | "lift"
  | "boot"
  | "drive"
  | "dashboard"
  | "return";

export interface Beat {
  id: BeatId;
  start: Seconds;
  end: Seconds;
  label: string;
}

export interface BeatProps {
  /** 0 before the beat starts, 1 after it ends, linear inside. */
  progress: number;
  /** True when this beat is the active one. */
  active: boolean;
}
```

- [ ] **Step 4: Implement the timeline**

Create `src/components/sections/hero-loop/timeline.ts`:

```ts
import type { Beat, Seconds } from "./types";

export const TOTAL_DURATION: Seconds = 12;

export const BEATS: readonly Beat[] = [
  { id: "sketch",    start: 0.0,  end: 2.0,  label: "Sketch establishes" },
  { id: "math",      start: 2.0,  end: 3.5,  label: "Math writes itself" },
  { id: "lift",      start: 3.5,  end: 5.0,  label: "Ink lifts" },
  { id: "boot",      start: 5.0,  end: 6.5,  label: "Boot sequence" },
  { id: "drive",     start: 6.5,  end: 9.0,  label: "Drive" },
  { id: "dashboard", start: 9.0,  end: 10.5, label: "Zoom out to system" },
  { id: "return",    start: 10.5, end: 12.0, label: "Return to desk" },
] as const;

/** Returns beat progress in [0,1] for a given elapsed time, or null if inactive. */
export function beatProgressAt(elapsed: Seconds, beat: Beat): number | null {
  if (elapsed < beat.start || elapsed > beat.end) return null;
  return (elapsed - beat.start) / (beat.end - beat.start);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- timeline`

Expected: all 5 tests PASS.

- [ ] **Step 6: Tell Nish to review and commit**

Surface to Nish:

> Timeline module done. Run `npm test -- timeline` yourself, then commit with:
>
> ```bash
> git add src/components/sections/hero-loop/types.ts src/components/sections/hero-loop/timeline.ts src/components/sections/hero-loop/__tests__/timeline.test.ts
> git commit -m "feat: hero-loop — timeline data + types"
> ```

---

## Task 2: Static fallback frame (SSR + reduced-motion)

Ships the `HeroLoopStatic.tsx` component on its own so the loop's reduced-motion path is in place before any animation is written. Also gives us an LCP-safe server-rendered first paint.

**Files:**
- Create: `src/components/sections/hero-loop/HeroLoopStatic.tsx`
- Test: `src/components/sections/hero-loop/__tests__/HeroLoopStatic.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/hero-loop/__tests__/HeroLoopStatic.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroLoopStatic } from "../HeroLoopStatic";

describe("HeroLoopStatic", () => {
  it("renders an SVG with role=img and a descriptive aria-label", () => {
    const { getByRole } = render(<HeroLoopStatic />);
    const img = getByRole("img");
    expect(img.tagName.toLowerCase()).toBe("svg");
    expect(img.getAttribute("aria-label")).toMatch(/kinematic|sketch/i);
  });

  it("uses currentColor or CSS variables, not hard-coded hex", () => {
    const { container } = render(<HeroLoopStatic />);
    const svg = container.querySelector("svg");
    const html = svg?.outerHTML ?? "";
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });
});
```

- [ ] **Step 2: Add @testing-library/react and adjust vitest config**

Run: `npm ls @testing-library/react`

If not installed, run: `npm install --save-dev @testing-library/react`

Expected after install: package added to `devDependencies` in `package.json`.

The current `vitest.config.ts` uses `environment: "node"` and `include: ["src/**/*.test.ts"]` — both block the tsx test. Update the file to:

```ts
import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

If `jsdom` isn't already a dev dep (it is, per current `package.json`), install it: `npm install --save-dev jsdom`.

Re-run existing tests once to confirm the env switch didn't break anything:

```bash
npm test
```

Expected: all pre-existing tests still pass under jsdom.

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- HeroLoopStatic`

Expected: FAIL — `Cannot find module '../HeroLoopStatic'`.

- [ ] **Step 4: Implement the static frame**

Create `src/components/sections/hero-loop/HeroLoopStatic.tsx`:

```tsx
// Server-safe: no "use client", no hooks, no framer-motion.
// Renders the Beat-1 end-state composition (clean kinematic sketch with
// monospace labels). This is what paints on SSR, under reduced-motion, and
// on data-saver / slow-2g clients.

export function HeroLoopStatic() {
  return (
    <svg
      role="img"
      aria-label="Hand-drawn kinematic diagram of a differential-drive robot with labelled velocity and angular velocity vectors, on a blueprint grid."
      viewBox="0 0 640 400"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Blueprint grid scaffold */}
      <g stroke="var(--blueprint-line)" strokeWidth={1}>
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 40} y1={0} x2={i * 40} y2={400} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h-${i}`} x1={0} y1={i * 40} x2={640} y2={i * 40} />
        ))}
      </g>

      {/* Chassis */}
      <rect x={220} y={170} width={200} height={80} rx={8} />

      {/* Wheels */}
      <circle cx={250} cy={270} r={24} />
      <circle cx={390} cy={270} r={24} />

      {/* Heading arrow (v) */}
      <g stroke="var(--accent)">
        <line x1={320} y1={210} x2={470} y2={210} />
        <polyline points="460,204 470,210 460,216" />
      </g>

      {/* Angular velocity (ω) curl */}
      <g stroke="var(--accent)">
        <path d="M 320 210 m -40 0 a 40 40 0 1 1 80 0" />
        <polyline points="395,216 400,206 408,212" />
      </g>

      {/* Mono labels */}
      <g
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize={14}
        fill="var(--foreground)"
        stroke="none"
      >
        <text x={478} y={214}>v</text>
        <text x={302} y={162}>ω</text>
        <text x={244} y={310}>θ</text>
      </g>
    </svg>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- HeroLoopStatic`

Expected: both tests PASS.

- [ ] **Step 6: Lint and build gate**

Run: `npm run lint && npm run build`

Expected: both succeed. Build output shows no new warnings attributable to this file.

- [ ] **Step 7: Tell Nish to review and commit**

> Static frame in place. Open `http://localhost:3000` after `npm run dev` — nothing visible yet (not mounted anywhere). The test run is the verification.
>
> ```bash
> git add src/components/sections/hero-loop/HeroLoopStatic.tsx src/components/sections/hero-loop/__tests__/HeroLoopStatic.test.tsx
> git commit -m "feat: hero-loop — static reduced-motion frame"
> ```

---

## Task 3: Container, scheduler, and empty beat shells

Wire the top-level `HeroLoop.tsx`, the seven empty beats, and the scheduler that maps elapsed seconds → active beat + progress. At end of task the loop runs for 12s and restarts, but nothing visually changes beat-to-beat (each beat currently renders nothing). This locks in the time axis so every later visual task is a pure content addition.

**Files:**
- Create: `src/components/sections/hero-loop/HeroLoop.tsx`
- Create: `src/components/sections/hero-loop/beats/BeatSketch.tsx`
- Create: `src/components/sections/hero-loop/beats/BeatMath.tsx`
- Create: `src/components/sections/hero-loop/beats/BeatLift.tsx`
- Create: `src/components/sections/hero-loop/beats/BeatBoot.tsx`
- Create: `src/components/sections/hero-loop/beats/BeatDrive.tsx`
- Create: `src/components/sections/hero-loop/beats/BeatDashboard.tsx`
- Create: `src/components/sections/hero-loop/beats/BeatReturn.tsx`

- [ ] **Step 1: Create all 7 empty beat components**

Create one file per beat. In each file, substitute `<Name>` for the component name (`BeatSketch`, `BeatMath`, `BeatLift`, `BeatBoot`, `BeatDrive`, `BeatDashboard`, `BeatReturn`):

```tsx
// src/components/sections/hero-loop/beats/<Name>.tsx
"use client";

import type { BeatProps } from "../types";

export function <Name>({ progress, active }: BeatProps) {
  if (!active) return null;
  // Progress is guaranteed [0,1] for this beat's window.
  void progress;
  return null;
}
```

So `BeatSketch.tsx` exports `BeatSketch`, `BeatMath.tsx` exports `BeatMath`, etc.

Expected: 7 files, each exporting one named function matching the file name.

- [ ] **Step 2: Implement the container**

Create `src/components/sections/hero-loop/HeroLoop.tsx`:

```tsx
"use client";

import { useAnimationFrame, useReducedMotion } from "framer-motion";
import { useRef, useState, type ComponentType } from "react";

import { BeatBoot } from "./beats/BeatBoot";
import { BeatDashboard } from "./beats/BeatDashboard";
import { BeatDrive } from "./beats/BeatDrive";
import { BeatLift } from "./beats/BeatLift";
import { BeatMath } from "./beats/BeatMath";
import { BeatReturn } from "./beats/BeatReturn";
import { BeatSketch } from "./beats/BeatSketch";
import { HeroLoopStatic } from "./HeroLoopStatic";
import { BEATS, TOTAL_DURATION, beatProgressAt } from "./timeline";
import type { BeatId } from "./types";

const BEAT_COMPONENTS: Record<BeatId, ComponentType<{ progress: number; active: boolean }>> = {
  sketch: BeatSketch,
  math: BeatMath,
  lift: BeatLift,
  boot: BeatBoot,
  drive: BeatDrive,
  dashboard: BeatDashboard,
  return: BeatReturn,
};

export default function HeroLoop() {
  const reducedMotion = useReducedMotion();
  const startRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useAnimationFrame((t) => {
    if (reducedMotion) return;
    if (startRef.current === null) startRef.current = t;
    const secs = ((t - startRef.current) / 1000) % TOTAL_DURATION;
    setElapsed(secs);
  });

  if (reducedMotion) {
    return (
      <div className="aspect-[16/10] w-full">
        <HeroLoopStatic />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[16/10] w-full"
      role="img"
      aria-label="Animated engineering sketch: a hand-drawn kinematic diagram comes alive into a robot operating in a workshop, then pulls back to a fleet dashboard and closes the loop on the desk."
    >
      {/* Always-visible blueprint substrate — the world of the loop */}
      <div className="absolute inset-0 blueprint-grid pointer-events-none" aria-hidden="true" />
      {BEATS.map((beat) => {
        const progress = beatProgressAt(elapsed, beat);
        const active = progress !== null;
        const Beat = BEAT_COMPONENTS[beat.id];
        return (
          <div key={beat.id} className="absolute inset-0" aria-hidden="true">
            <Beat progress={progress ?? 0} active={active} />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`

Expected: no type errors.

- [ ] **Step 4: Verify tests still pass**

Run: `npm test`

Expected: all existing tests PASS; nothing new to fail yet.

- [ ] **Step 5: Tell Nish to review and commit**

> Scheduler + empty shells wired. Not mounted in Hero yet, so nothing visible on-page. This is a "scaffolding green" checkpoint.
>
> ```bash
> git add src/components/sections/hero-loop/HeroLoop.tsx src/components/sections/hero-loop/beats/
> git commit -m "feat: hero-loop — scheduler + empty beat shells"
> ```

---

## Task 4: Beat 1 — Sketch establishes (0.0–2.0s) — **escape-hatch checkpoint #1**

Implements the first real beat: ink strokes animate in along a path to draw the kinematic diagram, then monospace labels typewriter-in. Temporarily mount `HeroLoop` in a scratch preview route to see it live. At the end of this task, Nish judges whether the code route feels alive enough to continue or whether to jump to the Rive fallback (Task 13).

**Files:**
- Create: `src/components/sections/hero-loop/primitives/StrokePath.tsx`
- Create: `src/components/sections/hero-loop/primitives/Typewriter.tsx`
- Modify: `src/components/sections/hero-loop/beats/BeatSketch.tsx`
- Create: `src/app/_hero-loop-preview/page.tsx` (scratch, deleted at end of milestone)

- [ ] **Step 1: Implement the StrokePath primitive**

Create `src/components/sections/hero-loop/primitives/StrokePath.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

interface StrokePathProps {
  /** The SVG path d-attribute. */
  d: string;
  /** Progress in [0,1] for this path's reveal. */
  progress: number;
  /** Stroke colour — defaults to currentColor. */
  stroke?: string;
  strokeWidth?: number;
}

/** Reveals a <path> by animating its pathLength from 0 → 1. */
export function StrokePath({ d, progress, stroke = "currentColor", strokeWidth = 1.75 }: StrokePathProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <motion.path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      pathLength={clamped}
      style={{ pathLength: clamped }}
      initial={false}
      animate={{ pathLength: clamped }}
      transition={{ duration: 0 }}
    />
  );
}
```

Note: we drive `pathLength` directly from `progress` rather than using Framer's own timing — the scheduler in `HeroLoop.tsx` is the single source of truth for time. Framer here is just the easiest way to get path-length rendering to compose correctly with theme changes.

- [ ] **Step 2: Implement the Typewriter primitive**

Create `src/components/sections/hero-loop/primitives/Typewriter.tsx`:

```tsx
"use client";

interface TypewriterProps {
  text: string;
  /** Progress in [0,1] across this typewriter window. */
  progress: number;
  x: number;
  y: number;
  fontSize?: number;
}

/** Renders a prefix of `text` whose length is (progress * text.length). */
export function Typewriter({ text, progress, x, y, fontSize = 14 }: TypewriterProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const shown = text.slice(0, Math.floor(clamped * text.length));
  return (
    <text
      x={x}
      y={y}
      fontFamily="var(--font-jetbrains-mono), monospace"
      fontSize={fontSize}
      fill="var(--foreground)"
      stroke="none"
    >
      {shown}
    </text>
  );
}
```

- [ ] **Step 3: Implement Beat 1**

Replace `src/components/sections/hero-loop/beats/BeatSketch.tsx` with:

```tsx
"use client";

import type { BeatProps } from "../types";
import { StrokePath } from "../primitives/StrokePath";
import { Typewriter } from "../primitives/Typewriter";

/**
 * Beat 1 (0.0–2.0s): kinematic diagram strokes in, then labels typewriter-in.
 * Sub-timing inside the beat:
 *   0.00–0.70  chassis + wheels stroke in (paths 0 and 1)
 *   0.60–0.90  heading arrow + curl strokes in
 *   0.85–1.00  labels typewriter in
 */
export function BeatSketch({ progress, active }: BeatProps) {
  if (!active) return null;

  const chassis = clamp01((progress - 0.0) / 0.7);
  const vectors = clamp01((progress - 0.6) / 0.3);
  const labels  = clamp01((progress - 0.85) / 0.15);

  return (
    <svg
      viewBox="0 0 640 400"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
    >
      {/* Chassis */}
      <StrokePath d="M 220 170 h 200 v 80 h -200 Z" progress={chassis} />
      {/* Wheels */}
      <StrokePath d="M 226 270 a 24 24 0 1 0 48 0 a 24 24 0 1 0 -48 0" progress={chassis} />
      <StrokePath d="M 366 270 a 24 24 0 1 0 48 0 a 24 24 0 1 0 -48 0" progress={chassis} />
      {/* Heading vector (v) */}
      <StrokePath d="M 320 210 L 470 210 M 460 204 L 470 210 L 460 216" progress={vectors} stroke="var(--accent)" />
      {/* Angular velocity curl (ω) */}
      <StrokePath d="M 280 210 a 40 40 0 1 1 80 0 M 395 216 L 400 206 L 408 212" progress={vectors} stroke="var(--accent)" />

      <Typewriter text="v" progress={labels} x={478} y={214} />
      <Typewriter text="ω" progress={labels} x={302} y={162} />
      <Typewriter text="θ" progress={labels} x={244} y={310} />
    </svg>
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
```

- [ ] **Step 4: Create the scratch preview route**

Create `src/app/_hero-loop-preview/page.tsx`:

```tsx
import HeroLoop from "@/components/sections/hero-loop/HeroLoop";

export default function HeroLoopPreviewPage() {
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="w-full max-w-3xl">
        <HeroLoop />
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verify lint + build pass**

Run: `npm run lint && npm run build`

Expected: both succeed.

- [ ] **Step 6: Boot dev server and review in browser**

Tell Nish:

> Run `npm run dev` and open `http://localhost:3000/_hero-loop-preview`. You should see the chassis ink in, then the vectors, then the `v`/`ω`/`θ` labels — all within the first 2 seconds of each 12s cycle. Beats 2–7 render nothing.
>
> **Escape-hatch checkpoint #1:** Does this feel alive enough? If it reads as "stiff SVG animation" rather than "hand-drawn ink coming to life", stop and read Task 13 (Rive fallback). If it feels like a promising start, keep going.
>
> When you're happy:
>
> ```bash
> git add src/components/sections/hero-loop/primitives/ src/components/sections/hero-loop/beats/BeatSketch.tsx src/app/_hero-loop-preview/page.tsx
> git commit -m "feat: hero-loop — beat 1 sketch + stroke/typewriter primitives"
> ```

---

## Task 5: Beat 3 — Ink lifts (3.5–5.0s) — **escape-hatch checkpoint #2**

Implemented before Beats 2 and 4 because the ink-lift is the hardest beat in the whole loop — frame-skip on-twos, subtle chromatic offset at mid-unfold, 2D→pseudo-3D silhouette transform. If the code route can't land this beat, code can't land the loop.

**Files:**
- Create: `src/components/sections/hero-loop/primitives/ChromaticShift.tsx`
- Modify: `src/components/sections/hero-loop/beats/BeatLift.tsx`

- [ ] **Step 1: Implement the ChromaticShift primitive**

Create `src/components/sections/hero-loop/primitives/ChromaticShift.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";

interface ChromaticShiftProps {
  /** Strength in [0,1]. 0 = no effect. 1 = full RGB split. */
  strength: number;
  children: ReactNode;
}

/**
 * Applies a subtle red/blue offset drop-shadow to simulate chromatic aberration
 * on motion peaks. Reserved for beats 3 and 7 per spec §2.
 */
export function ChromaticShift({ strength, children }: ChromaticShiftProps) {
  const s = Math.max(0, Math.min(1, strength));
  if (s === 0) return <>{children}</>;
  const dx = s * 2; // max 2px offset
  return (
    <g
      style={{
        filter: `drop-shadow(${-dx}px 0 0 rgba(255,0,64,0.35)) drop-shadow(${dx}px 0 0 rgba(0,128,255,0.35))`,
      }}
    >
      {children}
    </g>
  );
}
```

- [ ] **Step 2: Implement Beat 3**

Replace `src/components/sections/hero-loop/beats/BeatLift.tsx` with:

```tsx
"use client";

import type { BeatProps } from "../types";
import { ChromaticShift } from "../primitives/ChromaticShift";

/**
 * Beat 3 (3.5–5.0s): the flat kinematic sketch lifts to a 3D-tilted silhouette.
 *
 * Frame-skip on-twos at impact: we quantise `progress` to steps of 1/12 so the
 * motion lands in ~12 discrete poses across 1.5 s (= 8 fps feel) during the
 * middle of the lift; smooth at the ends so the seams aren't jarring.
 *
 * Chromatic offset peaks at progress = 0.5 and tapers off.
 */
export function BeatLift({ progress, active }: BeatProps) {
  if (!active) return null;

  const quantised = quantiseMid(progress);
  const tilt = quantised * 35;     // degrees of tilt applied to the chassis
  const yShift = quantised * -16;  // lifts slightly upward

  const chroma = triangle(progress, 0.5) * 0.9;

  return (
    <svg viewBox="0 0 640 400" width="100%" height="100%" style={{ color: "var(--foreground)" }}>
      <ChromaticShift strength={chroma}>
        <g
          transform={`translate(320 210) rotate(${tilt * 0.3}) scale(${1 + quantised * 0.05} ${1 - quantised * 0.12}) translate(-320 ${-210 + yShift})`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Chassis top face (appears as tilt increases) */}
          <path
            d="M 220 170 L 260 140 L 460 140 L 420 170 Z"
            opacity={quantised}
          />
          {/* Chassis front */}
          <path d="M 220 170 h 200 v 80 h -200 Z" />
          {/* Wheels */}
          <circle cx={250} cy={270} r={24} />
          <circle cx={390} cy={270} r={24} />
        </g>
      </ChromaticShift>
    </svg>
  );
}

/** Smooth at ends, stepped in the middle — frame-skip on-twos feel. */
function quantiseMid(p: number): number {
  const STEPS = 12;
  if (p < 0.15 || p > 0.85) return p; // smooth on the entry/exit
  return Math.round(p * STEPS) / STEPS;
}

/** Triangle wave centred at `peak` with range [0,1]. */
function triangle(p: number, peak: number): number {
  const dist = Math.abs(p - peak);
  return Math.max(0, 1 - dist / peak);
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

Expected: build succeeds.

- [ ] **Step 4: Review in browser**

Tell Nish:

> `npm run dev`, then `http://localhost:3000/_hero-loop-preview`. Wait ~3.5s into the 12s cycle — the chassis will tilt and lift with a visible frame-skip feel and a subtle red/blue fringe at mid-lift.
>
> **Escape-hatch checkpoint #2:** If Beat 3 reads as "stiff" or "the chromatic offset looks cheap", this is the point to stop and switch to Rive (Task 13). If it reads as intentional frame-skip animation with a satisfying impact feel, continue.
>
> When happy:
>
> ```bash
> git add src/components/sections/hero-loop/primitives/ChromaticShift.tsx src/components/sections/hero-loop/beats/BeatLift.tsx
> git commit -m "feat: hero-loop — beat 3 ink-lift with chromatic offset"
> ```

---

## Task 6: Beat 2 — Math writes itself (2.0–3.5s)

A control-loop block diagram draws in the bottom-right corner, with equations typewriter-ing next to it.

**Files:**
- Modify: `src/components/sections/hero-loop/beats/BeatMath.tsx`

- [ ] **Step 1: Implement Beat 2**

Replace `src/components/sections/hero-loop/beats/BeatMath.tsx` with:

```tsx
"use client";

import type { BeatProps } from "../types";
import { StrokePath } from "../primitives/StrokePath";
import { Typewriter } from "../primitives/Typewriter";

/**
 * Beat 2 (2.0–3.5s): bottom-right draws `r → Σ → C(s) → G(s) → y` with H(s)
 * feedback, and equations typewriter alongside.
 *
 * Sub-timing:
 *   0.00–0.50  block boxes stroke in
 *   0.40–0.80  arrows + feedback loop stroke in
 *   0.70–1.00  equations typewriter in
 */
export function BeatMath({ progress, active }: BeatProps) {
  if (!active) return null;

  const boxes  = c01((progress - 0.0) / 0.5);
  const arrows = c01((progress - 0.4) / 0.4);
  const eqns   = c01((progress - 0.7) / 0.3);

  return (
    <svg viewBox="0 0 640 400" width="100%" height="100%" style={{ color: "var(--foreground)" }}>
      {/* Summing junction circle */}
      <StrokePath d="M 330 330 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0" progress={boxes} />
      {/* C(s) box */}
      <StrokePath d="M 360 320 h 50 v 20 h -50 Z" progress={boxes} />
      {/* G(s) box */}
      <StrokePath d="M 430 320 h 50 v 20 h -50 Z" progress={boxes} />

      {/* Arrows */}
      <StrokePath d="M 300 330 L 320 330 M 340 330 L 360 330 M 410 330 L 430 330 M 480 330 L 510 330 M 505 325 L 510 330 L 505 335" progress={arrows} stroke="var(--accent)" />
      {/* Feedback path */}
      <StrokePath d="M 510 330 L 510 360 L 330 360 L 330 340 M 325 345 L 330 340 L 335 345" progress={arrows} stroke="var(--accent)" />

      {/* Block labels */}
      <Typewriter text="C(s)" progress={eqns} x={372} y={335} />
      <Typewriter text="G(s)" progress={eqns} x={442} y={335} />
      <Typewriter text="H(s)" progress={eqns} x={410} y={358} />
      <Typewriter text="r" progress={eqns} x={290} y={333} />
      <Typewriter text="y" progress={eqns} x={520} y={333} />
    </svg>
  );
}

function c01(n: number) {
  return Math.max(0, Math.min(1, n));
}
```

- [ ] **Step 2: Review in browser**

Tell Nish:

> Preview route again. Between ~2.0s and 3.5s the control-loop diagram should draw in lower-right. Commit when happy:
>
> ```bash
> git add src/components/sections/hero-loop/beats/BeatMath.tsx
> git commit -m "feat: hero-loop — beat 2 control-loop diagram"
> ```

---

## Task 7: Beat 4 — Boot sequence (5.0–6.5s)

Terminal card types a `ros2 launch` command; LEDs on the tilted robot tick on in sequence.

**Files:**
- Modify: `src/components/sections/hero-loop/beats/BeatBoot.tsx`

- [ ] **Step 1: Implement Beat 4**

Replace `src/components/sections/hero-loop/beats/BeatBoot.tsx` with:

```tsx
"use client";

import type { BeatProps } from "../types";
import { Typewriter } from "../primitives/Typewriter";

const CMD = "ros2 launch field_robot bringup.launch.py";
const LED_COUNT = 4;

/**
 * Beat 4 (5.0–6.5s): terminal card fades in; command types; LEDs tick on.
 *
 * Sub-timing:
 *   0.00–0.10  terminal card fades in
 *   0.10–0.80  command types (duration ~1.0s of the 1.5s beat)
 *   0.70–1.00  LED sequence (staggered across 0.3 beat-units)
 */
export function BeatBoot({ progress, active }: BeatProps) {
  if (!active) return null;

  const cardOpacity = clamp01(progress / 0.1);
  const typeProgress = clamp01((progress - 0.1) / 0.7);
  const ledOffset = (progress - 0.7) / 0.3;

  return (
    <svg viewBox="0 0 640 400" width="100%" height="100%" style={{ color: "var(--foreground)" }}>
      {/* Terminal card */}
      <g opacity={cardOpacity}>
        <rect x={40} y={310} width={360} height={60} rx={6} fill="var(--surface)" stroke="currentColor" strokeWidth={1} />
        <circle cx={56} cy={322} r={3} fill="var(--muted)" />
        <circle cx={66} cy={322} r={3} fill="var(--muted)" />
        <circle cx={76} cy={322} r={3} fill="var(--muted)" />
      </g>

      <Typewriter text={`$ ${CMD}`} progress={typeProgress} x={56} y={352} fontSize={13} />

      {/* Blinking caret */}
      <rect
        x={56 + Math.floor(typeProgress * (CMD.length + 2)) * 7.8}
        y={342}
        width={7}
        height={13}
        fill="var(--accent)"
        style={{ animation: "cursor-blink 1s steps(2) infinite" }}
      />

      {/* LEDs on the robot body */}
      {Array.from({ length: LED_COUNT }).map((_, i) => {
        const on = clamp01(ledOffset * LED_COUNT - i);
        return (
          <circle
            key={i}
            cx={260 + i * 30}
            cy={200}
            r={4}
            fill="var(--accent)"
            opacity={on}
          />
        );
      })}
    </svg>
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
```

- [ ] **Step 2: Review in browser + commit**

Tell Nish:

> Between 5.0s and 6.5s a terminal should type the ros2 command and four LEDs should tick on.
>
> ```bash
> git add src/components/sections/hero-loop/beats/BeatBoot.tsx
> git commit -m "feat: hero-loop — beat 4 boot sequence"
> ```

---

## Task 8: Beat 5 — Drive (6.5–9.0s)

Robot translates along a curved path; grid scrolls under; LIDAR arcs sweep; dashed path trace.

**Files:**
- Modify: `src/components/sections/hero-loop/beats/BeatDrive.tsx`

**Open spec question (§11):** whether to include LIDAR arcs. Default: include them (they're iconic for Nish's work). If after review they read as line-noise, delete that `<g>` block — this plan doesn't do a separate task for it.

- [ ] **Step 1: Implement Beat 5**

Replace `src/components/sections/hero-loop/beats/BeatDrive.tsx` with:

```tsx
"use client";

import type { BeatProps } from "../types";

/**
 * Beat 5 (6.5–9.0s): robot drives a curved path. Grid scrolls (faked via a
 * path offset), LIDAR arcs sweep on a slower cycle, path trace is dashed.
 */
export function BeatDrive({ progress, active }: BeatProps) {
  if (!active) return null;

  // Bezier curve the robot follows — from bottom-left upward and right.
  const t = progress;
  const x = 120 + t * 380;
  const y = 300 - Math.sin(t * Math.PI) * 80;
  const heading = Math.cos(t * Math.PI) * 30; // degrees

  const traceLength = 520 * t;
  const lidarSweep = (t * 720) % 360;

  return (
    <svg viewBox="0 0 640 400" width="100%" height="100%" style={{ color: "var(--foreground)" }}>
      {/* Scrolling grid overlay — subtle horizontal lines shifting */}
      <g stroke="var(--blueprint-line)" strokeWidth={1}>
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={i}
            x1={0}
            y1={80 + i * 60}
            x2={640}
            y2={80 + i * 60}
            transform={`translate(${(-t * 160) % 40} 0)`}
          />
        ))}
      </g>

      {/* Path trace (dashed) */}
      <path
        d="M 120 300 Q 310 180 500 300"
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeDasharray="6 4"
        fill="none"
        strokeDashoffset={-traceLength}
      />

      {/* Robot */}
      <g transform={`translate(${x} ${y}) rotate(${heading})`}>
        <rect x={-24} y={-14} width={48} height={28} rx={4} fill="var(--surface)" stroke="currentColor" strokeWidth={1.5} />
        <circle cx={-12} cy={14} r={5} stroke="currentColor" strokeWidth={1.5} fill="none" />
        <circle cx={12} cy={14} r={5} stroke="currentColor" strokeWidth={1.5} fill="none" />

        {/* LIDAR arcs */}
        <g stroke="var(--accent)" strokeWidth={1} opacity={0.5} fill="none">
          <path d={`M 0 0 L ${Math.cos((lidarSweep - 30) * Math.PI / 180) * 40} ${Math.sin((lidarSweep - 30) * Math.PI / 180) * 40}`} />
          <path d={`M 0 0 L ${Math.cos((lidarSweep) * Math.PI / 180) * 40} ${Math.sin((lidarSweep) * Math.PI / 180) * 40}`} />
          <path d={`M 0 0 L ${Math.cos((lidarSweep + 30) * Math.PI / 180) * 40} ${Math.sin((lidarSweep + 30) * Math.PI / 180) * 40}`} />
        </g>
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Review + commit**

Tell Nish:

> 6.5s–9.0s window: robot should drive the arc, dashes should extend, LIDAR lines should sweep. If LIDAR reads as visual noise, delete the inner `<g>` block and re-review.
>
> ```bash
> git add src/components/sections/hero-loop/beats/BeatDrive.tsx
> git commit -m "feat: hero-loop — beat 5 drive with LIDAR sweep"
> ```

---

## Task 9: Beat 6 — Zoom out to dashboard (9.0–10.5s)

Drive scene compresses into one tile of a schematic dashboard with sparkline cards and a warehouse floorplan.

**Files:**
- Modify: `src/components/sections/hero-loop/beats/BeatDashboard.tsx`

**Open spec question (§11):** whether dashboard tiles contain text. Default: shapes only (sparkline rectangles, marker dots). Text would be unreadable at the compressed scale and shape-only reads as "dashboard" just as clearly.

- [ ] **Step 1: Implement Beat 6**

Replace `src/components/sections/hero-loop/beats/BeatDashboard.tsx` with:

```tsx
"use client";

import type { BeatProps } from "../types";

/**
 * Beat 6 (9.0–10.5s): zoom out. The drive scene shrinks to one tile in a
 * 2×2 grid of dashboard panels — three mini-cards with sparklines + one
 * warehouse floorplan with 5 robot markers (one highlighted).
 */
export function BeatDashboard({ progress, active }: BeatProps) {
  if (!active) return null;

  const scale = 1 - progress * 0.7;     // zooms from 1 → 0.3
  const grid  = clamp01((progress - 0.3) / 0.7); // dashboard panels appear after the zoom starts

  return (
    <svg viewBox="0 0 640 400" width="100%" height="100%" style={{ color: "var(--foreground)" }}>
      <g opacity={grid}>
        {/* Four panels in a 2×2 */}
        <PanelFrame x={40} y={40} w={280} h={160} />
        <PanelFrame x={340} y={40} w={260} h={160} />
        <PanelFrame x={40} y={220} w={280} h={140} />
        <PanelFrame x={340} y={220} w={260} h={140} />

        {/* Sparklines */}
        <Sparkline x={60} y={140} />
        <Sparkline x={360} y={140} phase={1} />
        <Sparkline x={60} y={300} phase={2} />

        {/* Warehouse floorplan — bottom-right panel */}
        <g transform="translate(360 230)">
          <rect x={0} y={0} width={220} height={120} fill="none" stroke="var(--muted)" strokeDasharray="4 4" />
          {[
            { x: 30, y: 30 },
            { x: 80, y: 70 },
            { x: 130, y: 40 },
            { x: 170, y: 85 },
            { x: 60, y: 100 },
          ].map((m, i) => (
            <circle
              key={i}
              cx={m.x}
              cy={m.y}
              r={i === 2 ? 5 : 3}
              fill={i === 2 ? "var(--accent)" : "var(--muted)"}
            />
          ))}
        </g>
      </g>

      {/* Drive scene miniaturised in the top-left tile */}
      <g
        transform={`translate(180 120) scale(${scale}) translate(-320 -200)`}
        opacity={1 - grid * 0.4}
      >
        <rect x={280} y={180} width={48} height={28} rx={4} fill="var(--surface)" stroke="currentColor" strokeWidth={1.5} />
      </g>
    </svg>
  );
}

function PanelFrame({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <rect x={x} y={y} width={w} height={h} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} rx={4} />
  );
}

function Sparkline({ x, y, phase = 0 }: { x: number; y: number; phase?: number }) {
  const points = Array.from({ length: 20 }).map((_, i) => {
    const px = x + i * 12;
    const py = y - Math.sin((i + phase * 5) * 0.4) * 18;
    return `${px},${py}`;
  }).join(" ");
  return <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth={1.5} />;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
```

- [ ] **Step 2: Review + commit**

Tell Nish:

> 9.0s–10.5s: the drive scene shrinks into the top-left tile while three sparkline cards and a floorplan fade in.
>
> ```bash
> git add src/components/sections/hero-loop/beats/BeatDashboard.tsx
> git commit -m "feat: hero-loop — beat 6 dashboard zoom-out"
> ```

---

## Task 10: Beat 7 — Return to desk + loop seam (10.5–12.0s)

Dashboard tile pulls back onto the blueprint substrate and slides toward the Beat-1 composition. The last frame matches the first frame.

**Files:**
- Modify: `src/components/sections/hero-loop/beats/BeatReturn.tsx`
- (Potentially) Modify: `src/components/sections/hero-loop/beats/BeatSketch.tsx` only if seam work requires tweaking Beat-1's opening frame — expected NO.

- [ ] **Step 1: Implement Beat 7**

Replace `src/components/sections/hero-loop/beats/BeatReturn.tsx` with:

```tsx
"use client";

import type { BeatProps } from "../types";

/**
 * Beat 7 (10.5–12.0s): pull back further; the dashboard tile recomposes into
 * the Beat-1 opening composition — faint chassis ghost at the final frame.
 *
 * The loop seam: this beat's final visual state must equal Beat-1's progress=0
 * state (nothing drawn yet, blueprint visible). The scheduler hits
 * elapsed = TOTAL_DURATION and loops back to 0, so as long as Beat 7 fades to
 * nothing visible as progress → 1, the seam is invisible.
 */
export function BeatReturn({ progress, active }: BeatProps) {
  if (!active) return null;

  const opacity = 1 - progress; // fades out as we approach 12s
  const scale = 0.3 + progress * 0.7; // dashboard tile expands back out

  return (
    <svg viewBox="0 0 640 400" width="100%" height="100%" style={{ color: "var(--foreground)" }}>
      <g
        transform={`translate(320 200) scale(${scale}) translate(-320 -200)`}
        opacity={opacity}
      >
        {/* Ghosted chassis — the Beat 1 silhouette becoming implied again */}
        <rect
          x={220}
          y={170}
          width={200}
          height={80}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          opacity={0.5}
        />
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`

Expected: both succeed.

- [ ] **Step 3: Review loop seam in browser**

Tell Nish:

> Watch the full 12s cycle at `/_hero-loop-preview`. The loop should be invisible when it restarts — no flash, no jump. If there is a seam, the most likely culprit is Beat-7's final frame not fading fully to nothing; tweak the `opacity = 1 - progress` expression.
>
> ```bash
> git add src/components/sections/hero-loop/beats/BeatReturn.tsx
> git commit -m "feat: hero-loop — beat 7 return + loop seam"
> ```

---

## Task 11: Integrate into Hero (Option 6a — side panel)

Mount `HeroLoop` in `Hero.tsx` as a right-column panel at `md:`+, stacked below CTAs on mobile. Delete the scratch preview route.

**Files:**
- Modify: `src/components/sections/Hero.tsx`
- Delete: `src/app/_hero-loop-preview/page.tsx`

- [ ] **Step 1: Refactor Hero.tsx to two columns**

Replace the outer `<motion.div className="text-center max-w-3xl space-y-8">` block with a two-column layout at `md:`+. The full updated file:

```tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Eyebrow } from "@/components/ui/Eyebrow";
import HeroLoop from "@/components/sections/hero-loop/HeroLoop";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function Hero() {
  return (
    <section className="blueprint-grid min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-8 md:gap-12">
        <motion.div
          className="text-center md:text-left max-w-3xl space-y-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <Eyebrow>Design &middot; Iterate &middot; Deploy</Eyebrow>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
            variants={fadeUp}
          >
            I Solve Problems
          </motion.h1>

          <motion.div className="circuit-divider max-w-xs mx-auto md:mx-0" variants={fadeUp} />

          <motion.p
            className="text-muted text-lg max-w-xl mx-auto md:mx-0 leading-relaxed"
            variants={fadeUp}
          >
            Starting at the whiteboard, not the keyboard. I walk the floor,
            understand the process, then design modular systems that
            scale — deploying a proof of concept as fast as possible,
            then iterating. The tech stack changes; the approach doesn&apos;t.
          </motion.p>

          <motion.div className="flex items-center justify-center md:justify-start gap-4" variants={fadeUp}>
            <Link
              href="/projects"
              className="inline-flex items-center px-6 py-3 bg-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              View My Work
            </Link>
            <Link
              href="/cv"
              className="inline-flex items-center px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-surface transition-colors"
            >
              View Profile
            </Link>
          </motion.div>
        </motion.div>

        <div className="w-full max-w-xl mx-auto md:mx-0">
          <HeroLoop />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Delete the preview route**

Run: `rm -rf src/app/_hero-loop-preview`

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`

Expected: both succeed.

- [ ] **Step 4: Manual review — placement check**

Tell Nish:

> `npm run dev`, open `http://localhost:3000`. Text left, loop right on desktop; stacked on mobile. Toggle the theme in the nav — every line, fill, and label should re-skin live.
>
> **Placement checkpoint:** if the loop reads as "a widget bolted onto the side of a text hero" rather than "a natural companion to the text", switch to Option 6b (full-bleed with a `bg-background/50 backdrop-blur-sm` scrim on the text block). That's a ~10-line change; no need for a separate task.
>
> When happy:
>
> ```bash
> git add src/components/sections/Hero.tsx
> git rm -r src/app/_hero-loop-preview
> git commit -m "feat: hero — mount stylised loop as side-panel"
> ```

---

## Task 12: Accessibility, performance, and bundle gate

Verify the spec's §7 and §10 success criteria.

**Files:**
- No code changes expected unless a gate fails.

- [ ] **Step 1: Verify reduced-motion behaviour**

Run: `npm run dev`.

In Chrome DevTools → Rendering → *Emulate CSS media feature `prefers-reduced-motion`* → *reduce*.

Expected: the static SVG frame renders (the `HeroLoopStatic` composition — chassis, wheels, vectors, labels). No motion. No console warnings about dropped frames.

- [ ] **Step 2: Verify theme-toggle reactivity mid-loop**

In browser, toggle the theme while the loop is animating. Every stroke, fill, and label should swap within one frame. No asset reload. No flash.

If any element fails to theme: it's still using a hard-coded hex — grep for `#[0-9a-fA-F]` inside `src/components/sections/hero-loop/` and replace with tokens.

- [ ] **Step 3: Verify bundle size**

Run: `npm run build`.

Look for the route summary. The delta between the homepage (`/`) route size on `main` and on `feature/hero-loop-stylised` must be ≤ 30 KB gzipped (spec §7, §10).

If over budget, the likely culprit is either a primitive using too many inline motion values, or the 7-beat dynamic imports not tree-shaking. Extract `BEAT_COMPONENTS` into a dynamic `React.lazy` map.

- [ ] **Step 4: Verify Lighthouse**

Run a Lighthouse desktop audit on the homepage. Compare to `main`:
- LCP delta ≤ +0.1s
- CLS delta ≈ 0
- TBT delta ≤ +30ms

If LCP regresses: the most likely cause is the loop competing with the h1 for LCP. The loop is inside a separate grid column and is `aria-hidden`; ensure Next.js isn't treating the SVG as a priority image (it shouldn't — no `<Image>` is used).

- [ ] **Step 5: Verify on mobile Safari and Android Chrome**

Open the preview URL from the Vercel branch deploy on an iOS device and an Android device. Confirm:
- The loop renders and animates smoothly
- The theme swap works
- The layout stacks correctly

On `connection.saveData` / slow networks, the static frame should render instead. Test by throttling to "Slow 3G" in DevTools and reloading.

- [ ] **Step 6: Tell Nish to commit any fixes**

If any gate above required a fix, Nish commits with an appropriate one-line message, e.g.:

```bash
git add <files>
git commit -m "fix: hero-loop — reduce bundle via lazy beat loading"
```

---

## Task 13: Rive fallback (executed only if an escape-hatch checkpoint fires)

**Do not run this task unless Task 4 or Task 5 triggered the escape hatch.**

**Rationale:** the spec allows a pivot to Rive if code-driven linework reads as stiff. Rive gives us a proper timeline editor and runtime state machines, at the cost of learning a new tool and storing a binary `.riv` asset.

**Files:**
- Add dependency: `@rive-app/react-canvas`
- Create: `public/hero-loop.riv` (authored externally in Rive editor)
- Modify: `src/components/sections/hero-loop/HeroLoop.tsx` — replace the scheduler + beat map with a single `<Rive />` component.
- Retain: `src/components/sections/hero-loop/HeroLoopStatic.tsx` (still the reduced-motion and SSR frame).
- Retain: `src/components/sections/hero-loop/timeline.ts` + `types.ts` for reference and for static-frame documentation. Delete all `beats/` and `primitives/` files — they're superseded.

- [ ] **Step 1: Install Rive runtime**

```bash
npm install @rive-app/react-canvas
```

- [ ] **Step 2: Author the `.riv` file in Rive editor**

Use the spec's 7-beat structure as the timeline. Expose `theme` (enum: light/dark) as an input on the state machine so the runtime can swap token-mapped colours on theme change. Keep the `.riv` file under 200 KB.

Save to `public/hero-loop.riv`.

- [ ] **Step 3: Replace `HeroLoop.tsx` with a Rive-driven implementation**

```tsx
"use client";

import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";

import { HeroLoopStatic } from "./HeroLoopStatic";

export default function HeroLoop() {
  const reducedMotion = useReducedMotion();
  const { RiveComponent, rive } = useRive({
    src: "/hero-loop.riv",
    stateMachines: "Main",
    autoplay: !reducedMotion,
  });
  const themeInput = useStateMachineInput(rive, "Main", "theme");

  useEffect(() => {
    if (!themeInput) return;
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      themeInput.value = isDark ? 1 : 0;
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [themeInput]);

  if (reducedMotion) {
    return (
      <div className="aspect-[16/10] w-full">
        <HeroLoopStatic />
      </div>
    );
  }

  return (
    <div
      className="aspect-[16/10] w-full"
      role="img"
      aria-label="Animated engineering sketch: a hand-drawn kinematic diagram comes alive into a robot operating in a workshop, then pulls back to a fleet dashboard and closes the loop on the desk."
    >
      <RiveComponent />
    </div>
  );
}
```

- [ ] **Step 4: Delete the code-route files**

```bash
git rm src/components/sections/hero-loop/beats/*.tsx
git rm src/components/sections/hero-loop/primitives/*.tsx
```

- [ ] **Step 5: Verify build + bundle**

Run: `npm run build`.

Expected: `@rive-app/react-canvas` runtime is ~150 KB gzipped. With the `.riv` at ≤200 KB, total is likely over the 30 KB spec budget — reopen §7 with Nish and decide: (a) accept the larger budget given Rive gives a better animation, or (b) ship the static frame only (no loop) on slower connections.

- [ ] **Step 6: Commit**

```bash
git add public/hero-loop.riv package.json package-lock.json src/components/sections/hero-loop/HeroLoop.tsx
git rm src/components/sections/hero-loop/beats src/components/sections/hero-loop/primitives -r
git commit -m "feat: hero-loop — switch to rive runtime"
```

---

## Final: Merge to main

Per `CLAUDE.md` §"Commit Workflow" — Nish merges, not Claude.

- [ ] **Step 1: Nish reviews Vercel preview deploy**

Push the branch; Vercel builds a preview URL. Walk the full 12s loop in both themes on desktop and mobile.

- [ ] **Step 2: Nish merges to main**

```bash
git checkout main
git merge --ff-only feature/hero-loop-stylised
git push origin main
```

If the branch has diverged from main, Nish rebases first.

- [ ] **Step 3: Verify production**

Load `https://nishalangovender.com` after Vercel's production deploy. Full loop plays. Theme toggle works. Reduced-motion works (test in DevTools again).

- [ ] **Step 4: Clean up the worktree**

```bash
git worktree remove ../nishalangovender.com-hero-loop
git branch -d feature/hero-loop-stylised
```

---

## Spec Coverage Map

| Spec section | Task(s) |
| ------------ | ------- |
| §1 Why we're changing direction | — (context) |
| §2 Visual language — "Technical-anime linework" | Tasks 2, 4 (StrokePath, Typewriter), 5 (ChromaticShift) |
| §3 Narrative arc — 7 beats | Tasks 4–10 |
| §4 Route A (code) chosen; Rive as fallback | Tasks 1–12 (Route A); Task 13 (Rive fallback) |
| §5 Theme reactivity | Tasks 2, 12 (verification) |
| §6 Placement — Option 6a side panel default | Task 11 |
| §7 Reduced-motion, accessibility, performance | Tasks 2 (static), 3 (aria), 12 (verification) |
| §8 Loop seam | Task 10 |
| §9 Scope in/out | enforced across all tasks |
| §10 Success criteria | Task 12 |
| §11 Open questions | LIDAR → Task 8 default-include; dashboard text → Task 9 default-shapes-only; Rive trigger → Tasks 4, 5; motion-first/static-first → Tasks 2, 3 (static-first); placement → Task 11 |
| §12 Design-only, no code from spec | this plan is the implementation contract |
