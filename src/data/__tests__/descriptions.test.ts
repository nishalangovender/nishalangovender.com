import { describe, expect, it } from "vitest";

import { profileSummary } from "../cv";
import { projects } from "../projects";
import { timelineChapters } from "../timeline";

const words = (text: string) => text.trim().split(/\s+/).length;

describe("description lengths", () => {
  it.each(projects.map((p) => [p.slug, p.description]))(
    "%s card description is one sentence of at most 25 words",
    (_, description) => {
      expect(words(description)).toBeLessThanOrEqual(25);
      expect(description.match(/[.!?](\s|$)/g)).toHaveLength(1);
    },
  );

  it.each(timelineChapters.map((c) => [c.id, c.description ?? ""]))(
    "%s chapter description is at most 40 words",
    (_, description) => {
      expect(words(description)).toBeLessThanOrEqual(40);
    },
  );

  it("profile summary is at most 70 words", () => {
    expect(words(profileSummary)).toBeLessThanOrEqual(70);
  });
});
