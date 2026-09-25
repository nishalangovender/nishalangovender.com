import { describe, expect, it } from "vitest";

import { BEATS } from "../beats";
import { TERMINAL_LINES, TYPING_START, terminalLinesAt } from "../terminal";

const code = BEATS.find((b) => b.id === "code")!;

describe("build terminal", () => {
  it("shows only in the code beat", () => {
    expect(terminalLinesAt(code.start - 0.01)).toBeNull();
    expect(terminalLinesAt(code.end + 0.01)).toBeNull();
    expect(terminalLinesAt(code.start)).toBe(0);
  });

  it("types a line at a time and finishes before the beat ends", () => {
    expect(terminalLinesAt(code.start + TYPING_START + 0.01)).toBe(1);
    expect(terminalLinesAt(code.end - 0.01)).toBe(TERMINAL_LINES.length);
  });
});
