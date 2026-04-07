"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type KeyboardEvent } from "react";

import type { Skill, ZoneData, ZoneKey } from "@/data/skills";
import { profLabel, zones } from "@/data/skills";

// ─── Build a lookup from the shared data file ───────────────────────────────

const zoneMap: Record<ZoneKey, ZoneData> = zones.reduce(
  (acc, z) => {
    acc[z.key] = z.data;
    return acc;
  },
  {} as Record<ZoneKey, ZoneData>,
);

// ─── Circle geometry ────────────────────────────────────────────────────────

const R = 140;

type CircleId = "software" | "hardware" | "electronics";

const circles: {
  id: CircleId;
  cx: number;
  cy: number;
  label: string;
  labelY: number;
}[] = [
  { id: "software", cx: 250, cy: 155, label: "SOFTWARE", labelY: 80 },
  { id: "hardware", cx: 165, cy: 310, label: "MECHANICAL", labelY: 385 },
  { id: "electronics", cx: 335, cy: 310, label: "ELECTRONICS", labelY: 385 },
];

const circleColors: Record<CircleId, string> = {
  software: "rgba(59, 130, 246, 0.08)",
  electronics: "rgba(16, 185, 129, 0.08)",
  hardware: "rgba(245, 158, 11, 0.08)",
};

const circleStrokes: Record<CircleId, string> = {
  software: "rgba(59, 130, 246, 0.3)",
  electronics: "rgba(16, 185, 129, 0.3)",
  hardware: "rgba(245, 158, 11, 0.3)",
};

const activeStrokes: Record<CircleId, string> = {
  software: "rgba(59, 130, 246, 0.7)",
  electronics: "rgba(16, 185, 129, 0.7)",
  hardware: "rgba(245, 158, 11, 0.7)",
};

// ─── Hit regions — position/size for each clickable Venn zone ───────────────

type HitRegion = {
  key: ZoneKey;
  cx: number;
  cy: number;
  r: number;
  label: string;
};

const hitRegions: HitRegion[] = [
  { key: "software", cx: 250, cy: 110, r: 55, label: "Software Engineering" },
  { key: "hardware", cx: 125, cy: 340, r: 55, label: "Mechanical Engineering" },
  { key: "electronics", cx: 375, cy: 340, r: 55, label: "Electronics & Embedded" },
  {
    key: "software-hardware",
    cx: 195,
    cy: 215,
    r: 35,
    label: "Simulation & Digital Twins",
  },
  {
    key: "software-electronics",
    cx: 305,
    cy: 215,
    r: 35,
    label: "Embedded Software",
  },
  {
    key: "electronics-hardware",
    cx: 250,
    cy: 330,
    r: 35,
    label: "Electromechanical Systems",
  },
  { key: "center", cx: 250, cy: 260, r: 32, label: "Mechatronics & Robotics" },
];

// ─── Which base circles are "involved" in a given zone ──────────────────────

function involvedCircles(zone: ZoneKey | null): CircleId[] {
  if (!zone) return [];
  if (zone === "center") return ["software", "electronics", "hardware"];
  if (zone.includes("-")) return zone.split("-") as CircleId[];
  return [zone as CircleId];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function SkillsVenn() {
  // Start with no zone selected so the empty-state copy is visible — it
  // explains the diagram and invites interaction, which prevents visitors
  // from assuming the centre zone's skills are the full picture.
  const [active, setActive] = useState<ZoneKey | null>(null);

  const involved = involvedCircles(active);

  function activate(zone: ZoneKey) {
    setActive(zone);
  }

  function toggle(zone: ZoneKey) {
    setActive((current) => (current === zone ? null : zone));
  }

  function handleKey(event: KeyboardEvent<SVGCircleElement>, zone: ZoneKey) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle(zone);
    }
  }

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:gap-8 lg:items-start">
      {/* ── Diagram ────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:max-w-lg flex-shrink-0">
        <svg
          viewBox="0 0 500 460"
          className="w-full h-auto"
          role="img"
          aria-label="Interactive Venn diagram of engineering disciplines. Use Tab to move between zones and Enter or Space to select."
        >
          {/* Base circle fills */}
          {circles.map((c) => (
            <circle
              key={c.id}
              cx={c.cx}
              cy={c.cy}
              r={R}
              fill={circleColors[c.id]}
              stroke={
                involved.includes(c.id)
                  ? activeStrokes[c.id]
                  : circleStrokes[c.id]
              }
              strokeWidth={involved.includes(c.id) ? 2 : 1}
              className="transition-all duration-300"
            />
          ))}

          {/* Hit regions — one per zone, keyboard-accessible */}
          {hitRegions.map((region) => {
            const isActive = active === region.key;
            return (
              <circle
                key={region.key}
                cx={region.cx}
                cy={region.cy}
                r={region.r}
                fill={
                  region.key === "center" && isActive
                    ? "rgba(59, 130, 246, 0.12)"
                    : "transparent"
                }
                role="button"
                tabIndex={0}
                aria-label={region.label}
                aria-pressed={isActive}
                focusable="true"
                className="cursor-pointer outline-none transition-colors duration-300 focus-visible:stroke-accent"
                style={{
                  strokeWidth: 2,
                }}
                onMouseEnter={() => activate(region.key)}
                onFocus={() => activate(region.key)}
                onClick={() => toggle(region.key)}
                onKeyDown={(e) => handleKey(e, region.key)}
              />
            );
          })}

          {/* Circle labels */}
          {circles.map((c) => (
            <text
              key={`label-${c.id}`}
              x={c.cx}
              y={c.labelY}
              textAnchor="middle"
              className="transition-colors duration-300 pointer-events-none select-none"
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono), monospace",
                letterSpacing: "0.15em",
                fontWeight: involved.includes(c.id) ? 600 : 400,
                fill: involved.includes(c.id)
                  ? activeStrokes[c.id].replace("0.7", "1")
                  : "var(--muted)",
              }}
            >
              {c.label}
            </text>
          ))}

          {/* Centre label — two lines */}
          <text
            x={250}
            y={253}
            textAnchor="middle"
            className="fill-accent pointer-events-none select-none"
            style={{
              fontSize: "8px",
              fontFamily: "var(--font-mono), monospace",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            MECHATRONICS
          </text>
          <text
            x={250}
            y={265}
            textAnchor="middle"
            className="fill-accent pointer-events-none select-none"
            style={{
              fontSize: "8px",
              fontFamily: "var(--font-mono), monospace",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            &amp; ROBOTICS
          </text>
        </svg>
      </div>

      {/* ── Skill Detail Panel ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-[280px] flex items-start w-full">
        <AnimatePresence mode="wait">
          {active && zoneMap[active] ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {zoneMap[active].subtitle && (
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                  {zoneMap[active].subtitle}
                </span>
              )}
              <h2 className="mt-1 text-xl font-bold text-foreground tracking-tight">
                {zoneMap[active].label}
              </h2>

              <div className="mt-5 space-y-4">
                {zoneMap[active].skills.map((skill, i) => (
                  <SkillRow key={skill.name} skill={skill} index={i} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                Start Here
              </span>
              <p className="mt-3 text-base text-foreground leading-relaxed">
                Hover or tap a region to explore. The overlaps are where
                disciplines converge — and the centre, where all three meet,
                is mechatronics.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Skill Row ──────────────────────────────────────────────────────────────

function SkillRow({ skill, index }: { skill: Skill; index: number }) {
  const Icon = skill.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="flex items-center gap-3"
    >
      {/* Icon tile */}
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-accent-light flex-shrink-0">
        <Icon
          className={`w-3.5 h-3.5 ${skill.color ? "" : "text-accent"}`}
          style={skill.color ? { color: skill.color } : undefined}
        />
      </div>

      {/* Name + animated proficiency bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-foreground font-medium truncate">
            {skill.name}
          </span>
          <span className="font-mono text-[10px] text-muted ml-2 flex-shrink-0">
            {profLabel(skill.proficiency)}
          </span>
        </div>

        <div className="h-[3px] w-full bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${skill.proficiency}%` }}
            transition={{
              delay: index * 0.05 + 0.15,
              duration: 0.5,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
