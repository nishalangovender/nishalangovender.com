import { describe, expect, it } from "vitest";

import { commitStemHeights } from "../ChapterOverlay";

describe("commitStemHeights", () => {
  it("gives lone commits the short stem", () => {
    expect(commitStemHeights([20, 50, 80], [])).toEqual([44, 44, 44]);
  });

  it("alternates stems within a cluster", () => {
    expect(commitStemHeights([40, 45, 50], [])).toEqual([44, 124, 44]);
  });

  it("drops a commit just right of a branch merge below the branch labels", () => {
    // Stellenbosch: the Dec 2023 commit sits just after the internships branch merges.
    expect(commitStemHeights([30, 75], [70])).toEqual([44, 124]);
  });

  it("leaves commits left of, or well clear of, a merge alone", () => {
    expect(commitStemHeights([65, 90], [70])).toEqual([44, 44]);
  });
});
