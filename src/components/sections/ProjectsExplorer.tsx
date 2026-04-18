"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { TbLayoutGrid, TbList } from "react-icons/tb";

import FilterDropdown, { type Filter } from "@/components/ui/FilterDropdown";
import ProjectCard from "@/components/ui/ProjectCard";
import ProjectListRow from "@/components/ui/ProjectListRow";
import { projects } from "@/data/projects";

// ─── Filter + view model ────────────────────────────────────────────────────

type ViewMode = "cards" | "list";

const ALL: Filter = { type: "all" };

function filterFromSearch(params: URLSearchParams): Filter {
  if (params.get("filter") === "featured") return { type: "featured" };
  const tag = params.get("tag");
  if (tag) return { type: "tag", value: tag };
  return ALL;
}

function viewFromSearch(params: URLSearchParams): ViewMode {
  return params.get("view") === "list" ? "list" : "cards";
}

function buildQueryString(filter: Filter, view: ViewMode): string {
  const params = new URLSearchParams();
  if (filter.type === "featured") params.set("filter", "featured");
  else if (filter.type === "tag") params.set("tag", filter.value);
  if (view === "list") params.set("view", "list");
  const q = params.toString();
  return q ? `?${q}` : "";
}

function filterLabel(filter: Filter): string {
  if (filter.type === "all") return "All";
  if (filter.type === "featured") return "Featured";
  return filter.value;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ProjectsExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mutableParams = new URLSearchParams(searchParams.toString());
  const active = filterFromSearch(mutableParams);
  const view = viewFromSearch(mutableParams);

  const filtered = useMemo(() => {
    if (active.type === "all") return projects;
    if (active.type === "featured") return projects.filter((p) => p.featured);
    return projects.filter((p) => p.tags.includes(active.value));
  }, [active]);

  const updateUrl = useCallback(
    (nextFilter: Filter, nextView: ViewMode) => {
      router.replace(`/projects${buildQueryString(nextFilter, nextView)}`, {
        scroll: false,
      });
    },
    [router],
  );

  const setFilter = useCallback(
    (next: Filter) => {
      updateUrl(next, view);
    },
    [view, updateUrl],
  );

  const setView = useCallback(
    (next: ViewMode) => {
      if (next === view) return;
      updateUrl(active, next);
    },
    [active, view, updateUrl],
  );

  const isDefault = active.type === "all";

  return (
    <div>
      {/* ── Toolbar: count + clear + filter + view toggle ──────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <p className="font-mono text-xs text-muted">
            Showing {filtered.length} of {projects.length} project
            {projects.length === 1 ? "" : "s"}
            {!isDefault && (
              <>
                {" "}
                <span className="text-foreground">· {filterLabel(active)}</span>
              </>
            )}
          </p>
          {!isDefault && (
            <button
              type="button"
              onClick={() => setFilter(ALL)}
              className="font-mono text-xs text-accent hover:text-accent-dark transition-colors"
            >
              Clear ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <FilterDropdown active={active} onChange={setFilter} />

          {/* View toggle — segmented control */}
          <div
            className="inline-flex items-center rounded-full border border-border bg-surface p-0.5"
            role="radiogroup"
            aria-label="Projects view mode"
          >
            <ViewToggleButton
              active={view === "cards"}
              onClick={() => setView("cards")}
              label="Cards"
              Icon={TbLayoutGrid}
            />
            <ViewToggleButton
              active={view === "list"}
              onClick={() => setView("list")}
              label="List"
              Icon={TbList}
            />
          </div>
        </div>
      </div>

      {/* ── Grid or list ──────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        view === "cards" ? (
          <motion.div
            key="cards"
            layout
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <ProjectCard key={project.slug} project={project} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.ul
            key="list"
            layout
            className="mt-8 rounded-xl border border-border/60 bg-surface px-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <ProjectListRow
                  key={project.slug}
                  project={project}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </motion.ul>
        )
      ) : (
        <div className="mt-16 rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">
            No Matches
          </p>
          <p className="mt-3 text-foreground">
            No projects match the current filter.
          </p>
          <button
            type="button"
            onClick={() => setFilter(ALL)}
            className="mt-5 inline-flex items-center rounded-lg border border-border px-4 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
}

// ─── View toggle button ─────────────────────────────────────────────────────

function ViewToggleButton({
  active,
  onClick,
  label,
  Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={active}
      aria-label={`${label} view`}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] tracking-wider uppercase transition-colors ${
        active
          ? "bg-accent text-white"
          : "text-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}
