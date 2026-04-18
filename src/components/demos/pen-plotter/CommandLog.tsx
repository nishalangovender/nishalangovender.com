// src/components/demos/pen-plotter/CommandLog.tsx
"use client";

import { useEffect, useRef, useState } from "react";

import type { Command, Response } from "@/lib/pen-plotter/types";

interface Entry {
  id: number;
  dir: "out" | "in";
  text: string;
  kind: string;
}

interface Props {
  lastCommand: Command | undefined;
  lastResponse: Response | undefined;
}

const MAX_ENTRIES = 120;

export function CommandLog({ lastCommand, lastResponse }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastCmdRef = useRef<Command | undefined>(undefined);
  const lastRespRef = useRef<Response | undefined>(undefined);

  useEffect(() => {
    if (lastCommand && lastCommand !== lastCmdRef.current) {
      lastCmdRef.current = lastCommand;
      const text = formatCommand(lastCommand);
      queueMicrotask(() =>
        setEntries((prev) => bound([...prev, { id: idRef.current++, dir: "out", text, kind: lastCommand.kind }])),
      );
    }
  }, [lastCommand]);

  useEffect(() => {
    if (lastResponse && lastResponse !== lastRespRef.current) {
      lastRespRef.current = lastResponse;
      const text = formatResponse(lastResponse);
      queueMicrotask(() =>
        setEntries((prev) => bound([...prev, { id: idRef.current++, dir: "in", text, kind: lastResponse.kind }])),
      );
    }
  }, [lastResponse]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const clearLog = () => {
    queueMicrotask(() => setEntries([]));
  };

  return (
    <div className="flex flex-col border border-border rounded bg-surface h-full min-h-0">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Command Log
        </span>
        <button
          type="button"
          onClick={clearLog}
          disabled={entries.length === 0}
          className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-accent disabled:opacity-40 disabled:hover:text-muted"
          aria-label="Clear command log"
        >
          Clear
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-auto font-mono text-[11px] leading-5 px-3 py-2 text-foreground"
      >
        {entries.map((e) => (
          <div key={e.id} className={colorFor(e.dir, e.kind)}>
            {e.dir === "out" ? "→ " : "← "}
            {e.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function bound(arr: Entry[]): Entry[] {
  return arr.length > MAX_ENTRIES ? arr.slice(arr.length - MAX_ENTRIES) : arr;
}

function formatCommand(c: Command): string {
  switch (c.kind) {
    case "HOME":
      return "HOME";
    case "ROTATE":
      return `ROTATE ${c.steps}`;
    case "LINEAR":
      return `LINEAR ${c.adcTarget}`;
    case "PEN":
      return `PEN ${c.state}`;
    case "GET_POS":
      return "GET_POS";
  }
}

function formatResponse(r: Response): string {
  switch (r.kind) {
    case "OK":
      return `OK t=${r.at.toFixed(2)}s`;
    case "BUSY":
      return "BUSY";
    case "ERR":
      return `ERR ${r.reason}`;
  }
}

function colorFor(dir: "out" | "in", kind: string): string {
  if (dir === "out") return "text-muted";
  if (kind === "OK") return "text-emerald-600 dark:text-emerald-400";
  if (kind === "BUSY") return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}
