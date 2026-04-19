import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "outline";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center font-medium rounded-lg transition-opacity transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const sizeClasses: Record<Size, string> = {
  md: "px-6 py-3",
  sm: "px-5 py-2.5 text-sm",
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-white hover:opacity-90",
  outline:
    "border border-border text-foreground hover:bg-surface",
};

function classes(variant: Variant, size: Size, className?: string) {
  return [base, sizeClasses[size], variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes(variant, size, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = CommonProps & {
  href: string;
  /** External link — use a raw anchor with target + rel. */
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">;

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  external,
  ...rest
}: LinkButtonProps) {
  const finalClass = classes(variant, size, className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={finalClass}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={finalClass} {...rest}>
      {children}
    </Link>
  );
}
