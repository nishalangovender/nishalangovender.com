import { describe, expect, it } from "vitest";

import { DESK } from "../desk-layout";
import { KEYBOARD, KEYBOARD_SIZE, MOUSE } from "../DeskGear";
import { MONITOR } from "../factory";
import { ROWS, ROW_UNITS, keyLayout } from "../keyboard";
import { PAGE } from "../sketch";

describe("keyboard layout", () => {
  it("fills every row to the same width", () => {
    for (const row of ROWS) expect(row.reduce((a, b) => a + b, 0)).toBe(ROW_UNITS);
  });

  it("lays keys edge to edge with no overlap", () => {
    const keys = keyLayout();
    expect(keys).toHaveLength(ROWS.flat().length);
    for (let r = 0; r < ROWS.length; r++) {
      const row = keys.filter((k) => k.row === r);
      row.slice(1).forEach((k, i) => expect(k.x - k.width / 2).toBeCloseTo(row[i].x + row[i].width / 2, 9));
    }
  });

  it("marks only the wide keys as modifiers, so the letters stay one grey", () => {
    const keys = keyLayout();
    expect(keys.filter((k) => k.width === 1).every((k) => !k.modifier)).toBe(true);
    expect(keys.find((k) => k.width === 6.25)?.modifier).toBe(true);
  });
});

describe("keyboard and mouse on the desk", () => {
  it("sit on the desk behind the notebook, clear of the monitor stand", () => {
    const { width, depth } = KEYBOARD_SIZE;
    expect(KEYBOARD.x - width / 2).toBeGreaterThan(DESK.minX);
    expect(KEYBOARD.y + depth / 2).toBeLessThan(DESK.maxY);
    // Behind the open notebook (cover margin included).
    expect(KEYBOARD.y - depth / 2).toBeGreaterThan(PAGE.depth / 2 + 0.14);
    // Left of the monitor's base, and the mouse to its right.
    expect(KEYBOARD.x + width / 2).toBeLessThan(MONITOR.x - MONITOR.width * 0.19);
    expect(MOUSE.x).toBeGreaterThan(MONITOR.x + MONITOR.width * 0.19 + 0.5);
    expect(MOUSE.x + 0.6).toBeLessThan(DESK.maxX);
  });
});
