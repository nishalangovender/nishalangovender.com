import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// nish-os `docs/design-system.md` token table — the site must match it verbatim.
const TTY = {
  bg: ["#f7f9fb", "#040405"],
  surface: ["#e8edf2", "#0e0f12"],
  rule: ["#c7d2dd", "#1d2026"],
  fg: ["#0b1017", "#eef4f9"],
  dim: ["#55667a", "#8598ab"],
  accent: ["#006f8a", "#33e1ff"],
  focus: ["#1f5fd0", "#2f81ff"],
  ok: ["#0a7d5a", "#2ee6a8"],
  warn: ["#8a5300", "#ffb339"],
  error: ["#b3132f", "#ff4d6d"],
} as const;

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function block(selector: string): string {
  const start = css.indexOf(selector);
  expect(start).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf("}", start));
}

describe("tty palette", () => {
  const blocks = {
    light: block(":root {"),
    dark: block('[data-theme="dark"] {'),
    system: block(':root:not([data-theme="light"]) {'),
  };

  it.each(Object.entries(TTY))("--tty-%s matches nish-os in every theme", (name, [light, dark]) => {
    expect(blocks.light).toContain(`--tty-${name}: ${light};`);
    expect(blocks.dark).toContain(`--tty-${name}: ${dark};`);
    expect(blocks.system).toContain(`--tty-${name}: ${dark};`);
  });

  it("leaves no old blue accent behind", () => {
    expect(css).not.toMatch(/#0066ff|rgba\(0,\s*102,\s*255/i);
  });
});
