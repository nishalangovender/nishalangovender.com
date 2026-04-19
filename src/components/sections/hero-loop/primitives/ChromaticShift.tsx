"use client";

import type { ReactNode } from "react";

interface ChromaticShiftProps {
  /** Strength in [0,1]. 0 = no effect. 1 = full RGB split. */
  strength: number;
  children: ReactNode;
}

/**
 * Applies a subtle red/blue offset drop-shadow to simulate chromatic aberration
 * on motion peaks. Reserved for Beats 3 and 7 per spec §2.
 */
export function ChromaticShift({ strength, children }: ChromaticShiftProps) {
  const s = Math.max(0, Math.min(1, strength));
  if (s === 0) return <>{children}</>;
  const dx = s * 2; // max 2px offset
  return (
    <g
      style={{
        filter: `drop-shadow(${-dx}px 0 0 rgba(255,0,64,0.35)) drop-shadow(${dx}px 0 0 rgba(0,128,255,0.35))`,
      }}
    >
      {children}
    </g>
  );
}
