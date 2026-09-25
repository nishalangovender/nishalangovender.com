import { describe, expect, it } from "vitest";

import { timelineChapters, timelineYears } from "../timeline";

const commitItems = timelineChapters.flatMap((c) =>
  c.commits.flatMap((commit) => commit.message),
);
const branchItems = [
  ...timelineChapters.flatMap((c) => c.branches ?? []),
  ...timelineYears.flatMap((y) => (y.branch ? [y.branch] : [])),
].flatMap((b) => b.events.flatMap((e) => e.text));

describe("timeline entries", () => {
  it.each([...commitItems, ...branchItems])(
    "%s is one trimmed, unwrapped entry",
    (item) => {
      expect(item).not.toMatch(/\n/);
      expect(item).toBe(item.trim());
      expect(item.length).toBeGreaterThan(0);
    },
  );
});
