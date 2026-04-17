"use client";

import { useId, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";

import { SkillIconTile } from "@/components/ui/SkillIconTile";
import type { Skill, ZoneKey } from "@/data/skills";
import {
  profColor,
  profLabel,
  zoneAnchorId,
  zones,
} from "@/data/skills";

const TIER_LEGEND: { label: string; varName: string }[] = [
  { label: "Advanced", varName: "var(--prof-advanced)" },
  { label: "Proficient", varName: "var(--prof-proficient)" },
  { label: "Competent", varName: "var(--prof-competent)" },
  { label: "Familiar", varName: "var(--prof-familiar)" },
];

function matches(skill: Skill, zoneHaystack: string, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (zoneHaystack.includes(q)) return true;
  return skill.name.toLowerCase().includes(q);
}

export default function SkillsBrowser() {
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const searchId = useId();
  const debounceRef = useRef<number | undefined>(undefined);

  function cancelPendingDebounce() {
    if (debounceRef.current !== undefined) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = undefined;
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setRawQuery(value);
    cancelPendingDebounce();
    debounceRef.current = window.setTimeout(() => {
      setQuery(value.trim());
      debounceRef.current = undefined;
    }, 120);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      cancelPendingDebounce();
      setRawQuery("");
      setQuery("");
    }
  }

  function clear() {
    cancelPendingDebounce();
    setRawQuery("");
    setQuery("");
  }

  // Compute filtered zones + total match count
  const { filteredZones, totalMatches } = useMemo(() => {
    let total = 0;
    const result = zones.map(({ key, data }) => {
      const zoneHaystack =
        `${data.label} ${data.subtitle ?? ""}`.toLowerCase();
      const visibleSkills = data.skills.filter((s) =>
        matches(s, zoneHaystack, query),
      );
      total += visibleSkills.length;
      return { key, data, visibleSkills };
    });
    return { filteredZones: result, totalMatches: total };
  }, [query]);

  return (
    <section id="skills-browser" aria-labelledby={`${searchId}-heading`}>
      <div className="flex flex-col gap-2">
        <h2
          id={`${searchId}-heading`}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          Browse All Skills
        </h2>
        <p className="text-muted text-base leading-relaxed max-w-2xl">
          The full toolkit, grouped by discipline. Search by skill name or
          discipline (try "ROS", "embedded", "CAD").
        </p>
      </div>

      {/* Search + Legend */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            id={searchId}
            type="search"
            value={rawQuery}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search skills or disciplines…"
            aria-label="Search skills"
            aria-controls={`${searchId}-results`}
            className="w-full h-11 px-4 pr-10 rounded-md bg-surface border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded text-muted hover:text-foreground transition-colors"
            >
              <span aria-hidden className="text-lg leading-none">×</span>
            </button>
          )}
        </div>

        <ul
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
          aria-label="Proficiency legend"
        >
          {TIER_LEGEND.map((t) => (
            <li key={t.label} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: t.varName }}
              />
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted">
                {t.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* A11y live region */}
      <div className="sr-only" aria-live="polite" role="status">
        {query
          ? `${totalMatches} ${totalMatches === 1 ? "skill" : "skills"} match`
          : ""}
      </div>

      {/* Zone sections — hidden entirely when nothing matches */}
      <div id={`${searchId}-results`} className="mt-10">
        {query && totalMatches === 0 ? (
          <p className="text-center text-muted text-sm">
            No skills match “{query}”. Try “ROS”, “Linux”, or “CAD”.
          </p>
        ) : (
          <div className="space-y-12">
            {filteredZones
              .filter(({ visibleSkills }) => !query || visibleSkills.length > 0)
              .map(({ key, data, visibleSkills }) => (
                <div
                  key={key}
                  id={zoneAnchorId(key)}
                  className="scroll-mt-24"
                >
                  <h3 className="text-xl font-bold tracking-tight">
                    {data.label}
                  </h3>
                  {data.subtitle && (
                    <span className="mt-1 block font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                      {data.subtitle}
                    </span>
                  )}

                  {visibleSkills.length > 0 && (
                    <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {visibleSkills.map((skill) => (
                        <SkillListRow
                          key={skill.name}
                          skill={skill}
                          zoneKey={key}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SkillListRow({ skill, zoneKey }: { skill: Skill; zoneKey: ZoneKey }) {
  const { varName } = profColor(skill.proficiency);

  return (
    <li className="flex items-center gap-3">
      <SkillIconTile skill={skill} zoneKey={zoneKey} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-foreground font-medium truncate">
            {skill.name}
          </span>
          <span
            className="font-mono text-[10px] ml-2 flex-shrink-0"
            style={{ color: varName }}
          >
            {profLabel(skill.proficiency)}
          </span>
        </div>

        <div className="h-[3px] w-full bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${skill.proficiency}%`,
              backgroundColor: varName,
            }}
          />
        </div>
      </div>
    </li>
  );
}
