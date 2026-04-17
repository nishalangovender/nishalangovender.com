// src/components/demos/pen-plotter/FirmwareDrawer.tsx
"use client";

import type { SimFrame } from "@/lib/pen-plotter/types";

import { AdcStripChart } from "./AdcStripChart";
import { CommandLog } from "./CommandLog";
import { StatePanel } from "./StatePanel";

interface Props {
  latest: SimFrame | null;
}

export function FirmwareDrawer({ latest }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_12rem_18rem] gap-3 h-[18rem] min-h-0">
      <CommandLog lastCommand={latest?.lastCommand} lastResponse={latest?.lastResponse} />
      <StatePanel latest={latest} />
      <AdcStripChart latest={latest} />
    </div>
  );
}
