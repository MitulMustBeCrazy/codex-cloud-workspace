"use client";

/**
 * MagneticButton, from https://motion-brew.com/components/magnetic-button
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { type HTMLMotionProps, motion, type SpringOptions, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// MagneticButton

/**
 * MagneticButton
 *
 * Trigger: magnetic cursor. While a mouse hovers the button, the button leans
 * toward the cursor on a spring and its label leans a little further, giving a
 * parallax pull. A soft spotlight follows the cursor across the surface.
 * Press gives a quick squash (scale 0.96). Touch and reduced-motion users get a
 * still button with press feedback only.
 *
 * Engine: motion/react (springs + motion values, no re-renders on move).
 */

const DEFAULT_SPRING: SpringOptions = {
  stiffness: 400,
  damping: 25,
  mass: 0.6,
};
const PRESS = { scale: 0.96 } as const;
const HOVER = { scale: 1.02 } as const;

const VARIANTS = {
  solid:
    "bg-zinc-900 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_8px_24px_-8px_rgba(0,0,0,0.5)] dark:bg-white dark:text-zinc-900",
  outline:
    "border border-zinc-300 bg-white/60 text-zinc-900 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100",
  ghost:
    "bg-transparent text-zinc-900 hover:bg-zinc-900/5 dark:text-zinc-100 dark:hover:bg-white/10",
} as const;

const SIZES = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
} as const;

export interface MagneticButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "children"
> {
  children?: React.ReactNode;
  /** Visual style. Default `"solid"`. */
  variant?: keyof typeof VARIANTS;
  /** Height and padding preset. Default `"md"`. */
  size?: keyof typeof SIZES;
  /** How far the button follows the cursor, as a fraction of the cursor's offset from center. Default `0.3`. */
  strength?: number;
  /** Extra pull on the label, on top of the button's own movement. Default `0.15`. */
  labelStrength?: number;
  /** Spring used for the pull and the snap back. Default `{ stiffness: 400, damping: 25, mass: 0.6 }`. */
  spring?: SpringOptions;
  /** Show the cursor spotlight on the surface. Default `true`. */
  spotlight?: boolean;
  /** Render as a link to this address instead of a button. */
  href?: string;
  /** With `href`, where the link opens, like `"_blank"`. */
  target?: string;
  /** With `href`. Defaults to `"noopener noreferrer"` for a new tab. */
  rel?: string;
}

export const MagneticButton = React.forwardRef<
  HTMLButtonElement,
  MagneticButtonProps
>(function MagneticButton(
  {
    children,
    className,
    variant = "solid",
    size = "md",
    strength = 0.3,
    labelStrength = 0.15,
    spring = DEFAULT_SPRING,
    spotlight = true,
    type = "button",
    href,
    target,
    rel,
    onPointerMove,
    onPointerLeave,
    ...props
  },
  ref,
) {
  const reduceMotion = useReducedMotion();

  // Raw cursor offset from center, in px.
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  // Cursor position inside the button, in px, for the spotlight.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const glow = useSpring(0, { stiffness: 300, damping: 30 });

  const x = useSpring(
    useTransform(dx, (v) => v * strength),
    spring,
  );
  const y = useSpring(
    useTransform(dy, (v) => v * strength),
    spring,
  );
  const labelX = useSpring(
    useTransform(dx, (v) => v * labelStrength),
    spring,
  );
  const labelY = useSpring(
    useTransform(dy, (v) => v * labelStrength),
    spring,
  );

  const background = useMotionTemplate`radial-gradient(120px circle at ${px}px ${py}px, rgba(255,255,255,0.22), transparent 70%)`;

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerMove?.(event);
    if (reduceMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    dx.set(localX - rect.width / 2);
    dy.set(localY - rect.height / 2);
    px.set(localX);
    py.set(localY);
    glow.set(1);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(event);
    dx.set(0);
    dy.set(0);
    glow.set(0);
  };

  // A real link when given an address, so browsers treat it as one (never a blocked pop-up).
  const Tag = (href ? motion.a : motion.button) as typeof motion.button;
  const linkProps = href
    ? {
        href,
        target,
        rel: rel ?? (target === "_blank" ? "noopener noreferrer" : undefined),
      }
    : { type };

  return (
    <Tag
      ref={ref}
      {...linkProps}
      style={reduceMotion ? undefined : { x, y }}
      whileHover={reduceMotion ? undefined : HOVER}
      whileTap={PRESS}
      transition={spring}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "relative isolate inline-flex cursor-pointer select-none items-center justify-center gap-2 overflow-hidden rounded-full font-medium",
        "outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {spotlight && !reduceMotion && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 mix-blend-soft-light"
          style={{ background, opacity: glow }}
        />
      )}
      <motion.span
        className="relative inline-flex items-center gap-2"
        style={reduceMotion ? undefined : { x: labelX, y: labelY }}
      >
        {children}
      </motion.span>
    </Tag>
  );
});