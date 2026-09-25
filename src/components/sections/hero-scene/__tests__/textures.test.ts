import { RepeatWrapping, SRGBColorSpace } from "three";
import { afterEach, describe, expect, it, vi } from "vitest";

import { cardboardTexture, concreteTexture } from "../textures";

/** jsdom has no 2D canvas: record every draw call instead, so patterns can be compared. */
function recordCanvas(): string[] {
  const calls: string[] = [];
  const ctx = new Proxy(
    {},
    {
      get: (_, key: string) => (key === "createRadialGradient" ? () => ({ addColorStop: () => {} }) : (...args: unknown[]) => calls.push(`${key}(${args.join(",")})`)),
      set: (_, key: string, value) => (calls.push(`${key}=${String(value)}`), true),
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  return calls;
}

afterEach(() => vi.restoreAllMocks());

describe("procedural textures", () => {
  for (const [name, make] of [
    ["concrete", concreteTexture],
    ["cardboard", cardboardTexture],
  ] as const) {
    it(`draws ${name} as a tiling sRGB texture`, () => {
      recordCanvas();
      const texture = make();
      expect(texture.colorSpace).toBe(SRGBColorSpace);
      expect(texture.wrapS).toBe(RepeatWrapping);
      expect(texture.wrapT).toBe(RepeatWrapping);
    });

    it(`draws the same ${name} every time (seeded), with plenty of detail`, () => {
      const first = recordCanvas();
      make();
      vi.restoreAllMocks();
      const second = recordCanvas();
      make();
      expect(second).toEqual(first);
      expect(first.filter((c) => c.startsWith("fillRect")).length).toBeGreaterThan(500);
    });
  }

  it("cuts concrete joints along two edges, so tiles meet in a grid", () => {
    const calls = recordCanvas();
    concreteTexture();
    expect(calls.slice(-2)).toEqual(["fillRect(0,0,512,2)", "fillRect(0,0,2,512)"]);
  });
});
