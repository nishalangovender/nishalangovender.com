"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { TbChevronDown } from "react-icons/tb";

import { disciplineTags, technologyTags } from "@/data/projects";

export type Filter =
  | { type: "all" }
  | { type: "featured" }
  | { type: "tag"; value: string };

const ALL: Filter = { type: "all" };
const FEATURED: Filter = { type: "featured" };

function filterLabel(f: Filter): string {
  if (f.type === "all") return "Filter";
  if (f.type === "featured") return "Filter: Featured";
  return `Filter: ${f.value}`;
}

function isActive(a: Filter, b: Filter): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "tag" && b.type === "tag") return a.value === b.value;
  return true;
}

export default function FilterDropdown({
  active,
  onChange,
}: {
  active: Filter;
  onChange: (next: Filter) => void;
}) {
  const ref = useRef<HTMLDetailsElement | null>(null);

  const close = useCallback(() => {
    if (ref.current) ref.current.open = false;
  }, []);

  useEffect(() => {
    function handleMouse(e: MouseEvent) {
      if (!ref.current?.open) return;
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && ref.current?.open) {
        close();
        ref.current?.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("mousedown", handleMouse);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouse);
      document.removeEventListener("keydown", handleKey);
    };
  }, [close]);

  const select = (next: Filter) => {
    // Clicking the currently-active option (unless it's All) resets to All.
    const target = isActive(active, next) && next.type !== "all" ? ALL : next;
    onChange(target);
    close();
  };

  const isFiltered = active.type !== "all";

  return (
    <details ref={ref} className="relative">
      <summary
        className={`list-none inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] tracking-wider uppercase transition-colors ${
          isFiltered
            ? "border-accent text-accent"
            : "border-border text-muted hover:text-foreground"
        }`}
        aria-haspopup="listbox"
      >
        {filterLabel(active)}
        <TbChevronDown className="h-3 w-3" aria-hidden />
      </summary>
      <div
        role="listbox"
        className="absolute right-0 z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-3 shadow-lg"
      >
        <Section label="Status">
          <Option
            label="All"
            selected={active.type === "all"}
            onClick={() => select(ALL)}
          />
          <Option
            label="Featured"
            selected={active.type === "featured"}
            onClick={() => select(FEATURED)}
          />
        </Section>
        {disciplineTags.length > 0 && (
          <Section label="Discipline">
            {disciplineTags.map((tag) => (
              <Option
                key={tag}
                label={tag}
                selected={active.type === "tag" && active.value === tag}
                onClick={() => select({ type: "tag", value: tag })}
              />
            ))}
          </Section>
        )}
        {technologyTags.length > 0 && (
          <Section label="Technology">
            {technologyTags.map((tag) => (
              <Option
                key={tag}
                label={tag}
                selected={active.type === "tag" && active.value === tag}
                onClick={() => select({ type: "tag", value: tag })}
              />
            ))}
          </Section>
        )}
      </div>
    </details>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-2 last:mb-0">
      <p className="px-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function Option({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center justify-between rounded-md px-2 py-1 text-left text-xs transition-colors ${
        selected
          ? "bg-accent-light text-accent"
          : "text-foreground hover:bg-accent-light/50"
      }`}
    >
      <span>{label}</span>
      {selected && <span aria-hidden>✓</span>}
    </button>
  );
}
