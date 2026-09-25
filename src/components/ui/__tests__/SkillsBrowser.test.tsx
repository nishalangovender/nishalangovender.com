import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { zones } from "@/data/skills";

import SkillsBrowser from "../SkillsBrowser";

function rowFor(container: HTMLElement, name: string): HTMLElement {
  const label = within(container).getByText(name);
  const row = label.closest("li");
  if (!row) throw new Error(`no row for ${name}`);
  return row;
}

describe("SkillsBrowser", () => {
  const allSkills = zones.flatMap((z) => z.data.skills);
  const exploring = allSkills.filter((s) => s.exploring);
  const graded = allSkills.find((s) => !s.exploring)!;

  it("tags exploring skills with no proficiency label or bar", () => {
    expect(exploring.length).toBe(6);
    const { container } = render(<SkillsBrowser />);
    for (const skill of exploring) {
      const row = rowFor(container, skill.name);
      expect(row.textContent).toContain("◌ exploring");
      expect(row.querySelector("[style*='width']")).toBeNull();
    }
  });

  it("shows a proficiency label and bar for graded skills", () => {
    const { container } = render(<SkillsBrowser />);
    const row = rowFor(container, graded.name);
    expect(row.textContent).not.toContain("exploring");
    expect(row.querySelector("[style*='width']")).not.toBeNull();
  });
});
