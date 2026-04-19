import Link from "next/link";

import HeroLoop from "@/components/sections/hero-loop/HeroLoop";

const BEAT_LINKS = [
  {
    href: "/hero-loop-preview/beat-1",
    title: "Beat 1",
    window: "0.0–3.5s",
    label: "Sketch Establishes",
  },
  {
    href: "/hero-loop-preview/beat-2",
    title: "Beat 2",
    window: "3.5–6.5s",
    label: "Ink Becomes Robot",
  },
  {
    href: "/hero-loop-preview/beat-3",
    title: "Beat 3",
    window: "6.5–9.0s",
    label: "Boot Sequence",
  },
  {
    href: "/hero-loop-preview/beat-4",
    title: "Beat 4",
    window: "9.0–13.5s",
    label: "Drive",
  },
  {
    href: "/hero-loop-preview/beat-5",
    title: "Beat 5",
    window: "13.5–16.5s",
    label: "Dashboard",
  },
  {
    href: "/hero-loop-preview/beat-6",
    title: "Beat 6",
    window: "16.5–20.0s",
    label: "Return",
  },
];

export default function HeroLoopPreviewPage() {
  return (
    <main className="min-h-screen grid place-items-center p-8 gap-8">
      <div className="w-full max-w-3xl">
        <HeroLoop />
      </div>
      <nav className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BEAT_LINKS.map((b) => (
          <Link
            key={b.href}
            href={b.href}
            className="border border-border rounded-lg p-3 hover:bg-surface transition-colors"
          >
            <div className="font-mono text-xs text-muted">
              {b.title} · {b.window}
            </div>
            <div className="font-medium">{b.label}</div>
          </Link>
        ))}
      </nav>
    </main>
  );
}
