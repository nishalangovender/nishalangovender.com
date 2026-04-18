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
