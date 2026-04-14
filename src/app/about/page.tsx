"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ScrollZoomTimeline = dynamic(
  () => import("@/components/sections/ScrollZoomTimeline"),
  { ssr: false },
);
const MobileTimeline = dynamic(
  () => import("@/components/sections/MobileTimeline"),
  { ssr: true },
);

/** Breakpoint matching Tailwind `md` (768px) */
const MD_BREAKPOINT = 768;

export default function AboutPage() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);

    // Seed state from the media query, then subscribe to changes. Using a
    // microtask defers the initial setState out of the effect body, avoiding
    // the react-hooks/set-state-in-effect cascading-render warning.
    queueMicrotask(() => setIsDesktop(mq.matches));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // SSR: render MobileTimeline as fallback (works without JS, correct for most visitors)
  // Client: swap to desktop if viewport is wide enough
  if (isDesktop === null) return <MobileTimeline />;

  return isDesktop ? <ScrollZoomTimeline /> : <MobileTimeline />;
}
