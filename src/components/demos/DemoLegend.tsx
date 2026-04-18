"use client";

import type { ReactNode } from "react";

export type LegendSwatchKind =
  | "solid"
  | "dashed"
  | "dot"
  | "cross"
  | "chip"
  | "ring";

export interface LegendItem {
  label: string;
  color: string;
  kind: LegendSwatchKind;
}

export function DemoLegend({ items }: { items: LegendItem[] }) {
  return (
    <div
      aria-hidden
      className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border border-border/60 bg-surface/60 px-3 py-2"
    >
      {items.map((item) => (
        <LegendEntry key={item.label} item={item} />
      ))}
    </div>
  );
}

function LegendEntry({ item }: { item: LegendItem }) {
  return (
    <div className="flex items-center gap-1.5">
      <Swatch kind={item.kind} color={item.color} />
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
        {item.label}
      </span>
    </div>
  );
}

function Swatch({ kind, color }: { kind: LegendSwatchKind; color: string }) {
  const style = { color };
  const box = "inline-flex items-center justify-center w-5 h-3";
  const nodes: Record<LegendSwatchKind, ReactNode> = {
    solid: (
      <span className={box}>
        <span
          className="block w-5 h-[2px] rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>
    ),
    dashed: (
      <span className={box}>
        <svg
          width="20"
          height="4"
          viewBox="0 0 20 4"
          style={style}
        >
          <line
            x1="0"
            y1="2"
            x2="20"
            y2="2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeDasharray="4 3"
          />
        </svg>
      </span>
    ),
    dot: (
      <span className={box}>
        <span
          className="block w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>
    ),
    cross: (
      <span className={box}>
        <svg width="12" height="12" viewBox="0 0 12 12" style={style}>
          <line
            x1="2"
            y1="2"
            x2="10"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <line
            x1="10"
            y1="2"
            x2="2"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </span>
    ),
    chip: (
      <span className={box}>
        <span
          className="block w-3.5 h-2 rounded-[2px]"
          style={{ backgroundColor: color }}
        />
      </span>
    ),
    ring: (
      <span className={box}>
        <span
          className="block w-3 h-3 rounded-full border-[1.5px]"
          style={{ borderColor: color }}
        />
      </span>
    ),
  };
  return nodes[kind];
}
