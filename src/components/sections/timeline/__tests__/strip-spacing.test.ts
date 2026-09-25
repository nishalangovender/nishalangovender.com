import { describe, expect, it } from "vitest";

import { timelineChapters } from "@/data/timeline";

import { CHAPTER_BOUNDS, FIXED_ZOOM } from "../scroll-math";
import { PRESENT_YEAR, UBUNDI_START_YEAR, yearToPosition } from "../TimelineStrip";

/** Minimum gap between neighbouring commits when a chapter is zoomed, as a share of the viewport. */
const MIN_GAP = 0.1;

describe("timeline strip", () => {
  it("maps years monotonically across the padded span", () => {
    const years = [2000, 2005, 2014, 2019, 2024, 2026, UBUNDI_START_YEAR, PRESENT_YEAR];
    const xs = years.map(yearToPosition);
    xs.slice(1).forEach((x, i) => expect(x).toBeGreaterThan(xs[i]));
    expect(xs[0]).toBeCloseTo(0.05, 6);
    expect(xs[xs.length - 1]).toBeCloseTo(0.95, 6);
  });

  it("gives every chapter room when zoomed", () => {
    for (const { from, to } of CHAPTER_BOUNDS) {
      expect((yearToPosition(to) - yearToPosition(from)) * FIXED_ZOOM).toBeGreaterThan(0.25);
    }
  });

  it.each(timelineChapters.map((c) => [c.id, c.commits]))(
    "keeps %s commits apart when zoomed",
    (_, commits) => {
      const xs = commits
        .map((c) => parseFloat(c.year ?? ""))
        .filter((y) => !Number.isNaN(y))
        .map(yearToPosition)
        .sort((a, b) => a - b);
      xs.slice(1).forEach((x, i) => expect((x - xs[i]) * FIXED_ZOOM).toBeGreaterThanOrEqual(MIN_GAP));
    },
  );
});
