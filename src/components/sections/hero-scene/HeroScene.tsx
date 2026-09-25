"use client";

import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { HeroStatic } from "./HeroStatic";

// three.js loads after the hero text paints; the static frame holds its place.
const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,
  loading: () => <HeroStatic />,
});

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** True while the element is on screen and the tab is visible. */
function useActive(ref: React.RefObject<HTMLElement | null>): boolean {
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);

  return onScreen && tabVisible;
}

/**
 * Hero visual: a three.js scene that tells the notebook-to-factory story.
 * Falls back to the static notebook frame for reduced motion or no WebGL.
 */
export default function HeroScene() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const active = useActive(ref);
  // null until mounted: the server and first client render show the static frame.
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    queueMicrotask(() => setWebgl(hasWebGL()));
  }, []);

  const live = webgl === true && !reduceMotion;

  return (
    <div ref={ref} className="relative w-full" style={{ aspectRatio: "440 / 340" }}>
      {live ? <HeroCanvas active={active} /> : <HeroStatic />}
    </div>
  );
}
