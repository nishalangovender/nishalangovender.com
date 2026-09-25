import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TERMINAL_LINES, CodeTerminal } from "../CodeTerminal";

describe("CodeTerminal", () => {
  it("prints the build-and-launch session while visible", () => {
    render(<CodeTerminal visible />);
    for (const line of TERMINAL_LINES) expect(screen.getByText(line.text, { exact: false })).toBeTruthy();
  });

  it("renders nothing outside the code beat", () => {
    const { container } = render(<CodeTerminal visible={false} />);
    expect(container.textContent).toBe("");
  });
});
