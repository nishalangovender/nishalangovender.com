import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { phases } from "@/data/engineering-process";

import EngineeringProcess from "../EngineeringProcess";

describe("EngineeringProcess", () => {
  it("gives every phase a one-sentence description", () => {
    for (const phase of phases) {
      expect(phase.description.match(/[.!?](\s|$)/g)).toHaveLength(1);
    }
  });

  it("lists every phase and expands the one selected", () => {
    render(<EngineeringProcess />);
    const rows = screen.getAllByRole("button");
    expect(rows).toHaveLength(phases.length);
    expect(rows[0].getAttribute("aria-current")).toBe("step");
    expect(screen.getByText(phases[0].description)).toBeTruthy();

    fireEvent.click(rows[2]);
    expect(rows[2].getAttribute("aria-current")).toBe("step");
    expect(rows[0].getAttribute("aria-current")).toBeNull();
    expect(screen.getByText(phases[2].description)).toBeTruthy();
  });
});
