import type { IconType } from "react-icons";

import type { Skill, ZoneKey } from "@/data/skills";
import { zoneRingColor } from "@/data/skills";

type Size = "sm" | "md";

interface SkillIconTileProps {
  skill: Skill;
  zoneKey: ZoneKey;
  size?: Size;
}

const sizeStyles: Record<Size, { tile: string; icon: string }> = {
  sm: { tile: "w-7 h-7", icon: "w-3.5 h-3.5" },
  md: { tile: "w-9 h-9", icon: "w-[18px] h-[18px]" },
};

/** Neutral tile with a zone-tinted ring.
 *  - Tile background: --surface (white / near-black) so blue-brand logos pop.
 *  - Ring: 1.5px, colour derived from the skill's zone.
 *  - Brand-coloured icons render at full saturation; others inherit --foreground.
 */
export function SkillIconTile({
  skill,
  zoneKey,
  size = "md",
}: SkillIconTileProps) {
  const Icon: IconType = skill.icon;
  const { tile, icon } = sizeStyles[size];
  const ring = zoneRingColor(zoneKey);

  return (
    <div
      className={`flex items-center justify-center rounded-md bg-surface flex-shrink-0 ${tile}`}
      style={{
        boxShadow: `inset 0 0 0 1.5px ${ring}`,
      }}
    >
      <Icon
        className={icon}
        style={{ color: skill.color ?? "var(--foreground)" }}
      />
    </div>
  );
}
