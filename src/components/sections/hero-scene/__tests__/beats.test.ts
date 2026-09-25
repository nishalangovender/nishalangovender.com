import { describe, expect, it } from "vitest";

import { BEATS, TOTAL_DURATION, beatAt, beatProgress, parseBeatParam, parseTimeParam } from "../beats";
import { CAMERA_KEYFRAMES, cameraAt } from "../camera";

describe("beat timeline", () => {
  it("runs six contiguous beats in story order", () => {
    expect(BEATS.map((b) => b.id)).toEqual(["sketch", "design", "code", "deploy", "system", "return"]);
    BEATS.forEach((b, i) => {
      expect(b.end).toBeGreaterThan(b.start);
      if (i > 0) expect(b.start).toBe(BEATS[i - 1].end);
    });
    expect(BEATS[0].start).toBe(0);
  });

  it("finds the beat and its progress at any time, wrapping the loop", () => {
    expect(beatAt(0)).toEqual({ id: "sketch", index: 0, progress: 0 });
    const deploy = BEATS[3];
    expect(beatAt((deploy.start + deploy.end) / 2)).toMatchObject({ id: "deploy", progress: 0.5 });
    expect(beatAt(TOTAL_DURATION + 0.1).id).toBe("sketch");
    expect(beatAt(-0.1).id).toBe("return");
  });

  it("clamps beat progress outside the beat", () => {
    expect(beatProgress(0, "deploy")).toBe(0);
    expect(beatProgress(TOTAL_DURATION - 0.01, "deploy")).toBe(1);
  });
});

describe("parseBeatParam", () => {
  it("accepts 1–6 in dev only", () => {
    expect(parseBeatParam("?beat=4", true)).toBe(3);
    expect(parseBeatParam("?beat=4", false)).toBeNull();
    expect(parseBeatParam("?beat=0", true)).toBeNull();
    expect(parseBeatParam("?beat=7", true)).toBeNull();
    expect(parseBeatParam("?beat=2x", true)).toBeNull();
    expect(parseBeatParam("", true)).toBeNull();
  });
});

describe("camera path", () => {
  it("keeps keyframes in time order across the whole loop", () => {
    const times = CAMERA_KEYFRAMES.map((k) => k.t);
    expect(times[0]).toBe(0);
    expect(times[times.length - 1]).toBe(TOTAL_DURATION);
    times.slice(1).forEach((t, i) => expect(t).toBeGreaterThanOrEqual(times[i]));
  });

  it("has no seam at the loop point", () => {
    const a = cameraAt(0);
    const b = cameraAt(TOTAL_DURATION - 1e-6);
    a.position.forEach((v, i) => expect(b.position[i]).toBeCloseTo(v, 4));
    a.target.forEach((v, i) => expect(b.target[i]).toBeCloseTo(v, 4));
  });
});

describe("parseTimeParam", () => {
  it("freezes at a loop time in development only", () => {
    expect(parseTimeParam("?t=12.5", true)).toBe(12.5);
    expect(parseTimeParam("?t=12.5", false)).toBeNull();
    expect(parseTimeParam(`?t=${TOTAL_DURATION + 1}`, true)).toBeCloseTo(1);
    expect(parseTimeParam("?t=-1", true)).toBeNull();
    expect(parseTimeParam("?t=abc", true)).toBeNull();
  });
});
