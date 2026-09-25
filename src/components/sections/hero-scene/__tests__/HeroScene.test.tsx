import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const motion = vi.hoisted(() => ({ reduce: false }));

vi.mock("framer-motion", () => ({ useReducedMotion: () => motion.reduce }));
// Stand-in for the three.js chunk: reports the `active` prop it receives.
vi.mock("next/dynamic", () => ({
  default: () => (props: { active: boolean }) => (
    <div data-testid="canvas" data-active={String(props.active)} />
  ),
}));

import HeroScene from "../HeroScene";

let intersect: (visible: boolean) => void = () => {};

beforeEach(() => {
  motion.reduce = false;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        intersect = (visible) => cb([{ isIntersecting: visible }]);
      }
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function withWebGL(available: boolean) {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    (available ? {} : null) as ReturnType<HTMLCanvasElement["getContext"]>,
  );
}

async function mount() {
  render(<HeroScene />);
  // WebGL detection runs in a microtask after mount.
  await act(async () => {});
}

describe("HeroScene", () => {
  it("shows the static frame when WebGL is unavailable", async () => {
    withWebGL(false);
    await mount();
    expect(screen.getByRole("img")).toBeTruthy();
    expect(screen.queryByTestId("canvas")).toBeNull();
  });

  it("shows the static frame when motion is reduced", async () => {
    withWebGL(true);
    motion.reduce = true;
    await mount();
    expect(screen.getByRole("img")).toBeTruthy();
    expect(screen.queryByTestId("canvas")).toBeNull();
  });

  it("runs the canvas only while on screen and the tab is visible", async () => {
    withWebGL(true);
    await mount();
    const canvas = screen.getByTestId("canvas");
    expect(canvas.dataset.active).toBe("true");

    act(() => intersect(false));
    expect(canvas.dataset.active).toBe("false");

    act(() => intersect(true));
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(canvas.dataset.active).toBe("false");
  });
});
