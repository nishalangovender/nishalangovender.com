import Image from "next/image";

/** Rendered widths available on disk. The smallest one that still covers a
 *  2× display is chosen, so a 32px navbar avatar never downloads the 320px
 *  asset and a 96px header avatar never renders soft. */
const SOURCES = [
  { width: 64, src: "/images/avatar/avatar-64.webp" },
  { width: 320, src: "/images/avatar/avatar-320.webp" },
] as const;

interface AvatarProps {
  /** Rendered width and height in CSS pixels. */
  size: number;
  /** Describe the person, not the image — this is a portrait, not decoration. */
  alt: string;
  /** Ring thickness in pixels. 0 removes the ring. */
  ringWidth?: number;
  className?: string;
}

/**
 * Circular portrait with a border ring. Single source of truth for the
 * ubunish avatar — do not hand-roll `<Image>` + `rounded-full` elsewhere.
 */
export function Avatar({
  size,
  alt,
  ringWidth = 1,
  className = "",
}: AvatarProps) {
  const source =
    SOURCES.find((candidate) => candidate.width >= size * 2) ??
    SOURCES[SOURCES.length - 1];

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-full border-border bg-surface ${className}`.trim()}
      style={{ width: size, height: size, borderWidth: ringWidth }}
    >
      <Image
        src={source.src}
        alt={alt}
        width={size}
        height={size}
        priority={size <= 64}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
