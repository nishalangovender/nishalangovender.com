import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroStatic } from "../HeroStatic";

describe("HeroStatic", () => {
  it("is a labelled image of the notebook sketch", () => {
    const { getByRole } = render(<HeroStatic />);
    const img = getByRole("img");
    expect(img.tagName.toLowerCase()).toBe("svg");
    expect(img.getAttribute("aria-label")).toMatch(/notebook|sketch/i);
  });

  it("draws only in theme variables", () => {
    const { container } = render(<HeroStatic />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });
});
