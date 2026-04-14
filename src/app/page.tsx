import dynamic from "next/dynamic";

import Hero from "@/components/sections/Hero";

// EngineeringProcess is below-the-fold and motion-heavy. Lazy-load it so the
// hero ships with the smallest possible JS payload on first paint.
const EngineeringProcess = dynamic(
  () => import("@/components/sections/EngineeringProcess"),
  {
    loading: () => <div className="min-h-[60vh]" aria-hidden="true" />,
  },
);

export default function Home() {
  return (
    <>
      <Hero />
      <EngineeringProcess />
    </>
  );
}
