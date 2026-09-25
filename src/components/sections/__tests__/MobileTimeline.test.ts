import { describe, expect, it } from "vitest";

import { buildMobileTimeline } from "../MobileTimeline";

const texts = buildMobileTimeline().flatMap((y) => y.events.map((e) => e.text));

describe("buildMobileTimeline", () => {
  it("renders every achievement as one unwrapped entry", () => {
    for (const text of texts) expect(text).not.toMatch(/\n/);
  });

  it.each(["Final-Year Project Distinction", "Delivered Website & Invoicing System"])(
    "keeps %s whole",
    (entry) => {
      expect(texts.filter((t) => t === entry)).toHaveLength(1);
    },
  );
});
