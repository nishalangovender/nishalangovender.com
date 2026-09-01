"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { siteConfig } from "@/lib/constants";

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
  return (
    <>
      <AboutHeader />
      {isDesktop ? <ScrollZoomTimeline /> : <MobileTimeline />}
    </>
  );
}

/** Short identity block above the timeline — who is talking, and from where. */
function AboutHeader() {
  return (
    <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8 flex items-center gap-5">
      <Avatar size={72} alt={siteConfig.name} />
      <div className="min-w-0">
        <Eyebrow size="small">Robotics Engineer · Ubundi</Eyebrow>
        <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
          {siteConfig.name}
        </p>
        <p className="mt-1 text-sm text-muted">
          AI and Physical AI, from Stellenbosch.
        </p>
      </div>
    </header>
  );
}
