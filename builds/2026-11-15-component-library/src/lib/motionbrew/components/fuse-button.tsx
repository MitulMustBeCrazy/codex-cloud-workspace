"use client";

/**
 * FuseButton, from https://motion-brew.com/components/fuse-button
 *
 * One self contained file: the component, its animated icons and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 *
 * The animated icons are adapted from lucide-animated (https://lucide-animated.com),
 * MIT License, Copyright (c) 2024-2026 pqoqubbw. Icon shapes from Lucide
 * (https://lucide.dev), ISC License. Permission is hereby granted, free of
 * charge, to any person obtaining a copy of this software, to deal in it
 * without restriction, provided the above copyright notice and this
 * permission notice are included in all copies or substantial portions.
 */

import * as React from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { type ClassValue, clsx } from "clsx";
import { Undo2 } from "lucide-react";
import { animate, AnimatePresence, type AnimationPlaybackControls, motion, type MotionValue, useAnimation, useMotionValue, useReducedMotion, useTransform, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: archive
const ArchiveIcon = (() => {
interface ArchiveIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArchiveIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const RECT_VARIANTS: Variants = {
  normal: {
    translateY: 0,
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 200,
      damping: 25,
    },
  },
  animate: {
    translateY: -1.5,
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 200,
      damping: 25,
    },
  },
};

const PATH_VARIANTS: Variants = {
  normal: { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" },
  animate: { d: "M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11" },
};

const SECONDARY_PATH_VARIANTS: Variants = {
  normal: { d: "M10 12h4" },
  animate: { d: "M10 15h4" },
};

const ArchiveIcon = forwardRef<ArchiveIconHandle, ArchiveIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave]
    );
    // Play with the nearest interactive parent, or whenever `active` is set.
    // Reduced motion keeps the icon still.
    const wrap = useRef<HTMLSpanElement>(null);
    const reduced = useReducedMotion();
    const [hosted, setHosted] = useState(false);
    useEffect(() => {
      const fake = {} as React.MouseEvent<HTMLSpanElement>;
      if (reduced) {
        setHosted(true);
        return;
      }
      if (active !== undefined) {
        setHosted(true);
        (active ? handleMouseEnter : handleMouseLeave)(fake);
        return;
      }
      const host = wrap.current?.parentElement?.closest<HTMLElement>("button, a, [role=button], [role=menuitem], [role=tab], [role=switch], [role=radio], label");
      setHosted(!!host);
      if (!host) return;
      const on = () => handleMouseEnter(fake);
      const off = () => handleMouseLeave(fake);
      host.addEventListener("pointerenter", on);
      host.addEventListener("pointerleave", off);
      return () => {
        host.removeEventListener("pointerenter", on);
        host.removeEventListener("pointerleave", off);
      };
    }, [active, reduced, handleMouseEnter, handleMouseLeave]);

    return (
      <span
        ref={wrap}
        className={cn("inline-grid size-6 shrink-0 place-items-center align-middle [&>svg]:size-full", className)}
        style={size ? { width: size, height: size, ...style } : style}
        onMouseEnter={hosted ? undefined : handleMouseEnter}
        onMouseLeave={hosted ? undefined : handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.rect
            animate={controls}
            height="5"
            initial="normal"
            rx="1"
            variants={RECT_VARIANTS}
            width="20"
            x="2"
            y="3"
          />
          <motion.path
            animate={controls}
            d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M10 12h4"
            variants={SECONDARY_PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

ArchiveIcon.displayName = "ArchiveIcon";
  return ArchiveIcon;
})();

// FuseButton

/**
 * FuseButton
 *
 * Trigger: press, then a timed undo. Pressing the action swaps the label for a
 * ghost Undo button inside the same shell, held open by a burning fuse. The
 * fuse is the button's own outline: it burns back around the edge with embers
 * drifting off the burning end. Undo before it runs out to roll back; let it
 * burn and the action sticks, shown by a brief done label with a check. The
 * fuse keeps burning under the pointer and only stops, rewinding, when Undo is
 * pressed. Focus moves to Undo, and Escape undoes. Both states share one size,
 * and only transform and opacity animate.
 *
 * Engine: motion/react (one motion value drives the outline and the embers,
 * AnimatePresence for the state swap, pathLength for the outline).
 */

type FuseState = "idle" | "armed" | "committed";

const PRESS = { scale: 0.96 } as const;
// One gentle ease-out for every part of the swap, so nothing overshoots.
const GLIDE = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;
// Undo's micro-interactions. Each part reacts to the same four labels.
const GHOST = {
  enter: { scale: 0.96 },
  rest: { scale: 1, transition: { duration: 0.5, ease: GLIDE } },
  hover: { scale: 1, transition: { duration: 0.25, ease: GLIDE } },
  press: { scale: 0.97, transition: { duration: 0.12, ease: GLIDE } },
} as const;
const GHOST_TINT = {
  enter: { opacity: 0.1 },
  rest: { opacity: 0, transition: { duration: 0.7, ease: GLIDE, delay: 0.15 } },
  hover: { opacity: 0.08, transition: { duration: 0.25, ease: GLIDE } },
  press: { opacity: 0.14, transition: { duration: 0.12, ease: GLIDE } },
} as const;
const UNDO_ICON = {
  enter: { rotate: 45, x: -4, opacity: 0 },
  rest: { rotate: 0, x: 0, opacity: 1, transition: { duration: 0.5, ease: GLIDE, delay: 0.05 } },
  hover: { rotate: -20, x: -1, opacity: 1, transition: { duration: 0.3, ease: GLIDE } },
  press: { rotate: -35, x: -2, opacity: 1, transition: { duration: 0.15, ease: GLIDE } },
} as const;
// Letters rise softly, one after another.
const LETTER = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: GLIDE } },
} as const;
const SIZES = {
  // `inset` is the even gap between the shell and the ghost Undo, in px.
  sm: { box: "h-9 text-[12px]", pad: "px-4", inset: 3 },
  md: { box: "h-11 text-sm", pad: "px-5", inset: 4 },
  lg: { box: "h-14 text-base", pad: "px-6", inset: 6 },
} as const;
// Each ember drifts out from the burning end on its own loop.
const EMBERS = [
  { x: -6, y: -9, duration: 0.6, delay: 0 },
  { x: 5, y: -11, duration: 0.7, delay: 0.18 },
  { x: -2, y: -13, duration: 0.8, delay: 0.36 },
  { x: 8, y: -7, duration: 0.55, delay: 0.1 },
] as const;

export interface FuseButtonProps {
  /** Action label. Default `"Archive"`. */
  children?: React.ReactNode;
  /** Icon before the action label. Default an archive icon. Pass `null` for none. */
  icon?: React.ReactNode;
  /** Label shown with a check once the fuse runs out. Default `"Archived"`. */
  doneLabel?: React.ReactNode;
  /** Undo button label. Default `"Undo"`. */
  undoLabel?: React.ReactNode;
  /** Height and padding preset. Default `"md"`. */
  size?: keyof typeof SIZES;
  /** Corner radius in px. Default fully rounded. */
  radius?: number;
  /** Text color, any CSS color. Default near-black (near-white in dark mode). */
  textColor?: string;
  /** Background color, any CSS color. Default white (dark grey in dark mode). */
  background?: string;
  /** Fuse and ember color. Default `"#f5a524"`. */
  fuseColor?: string;
  /** How long the undo window (the fuse) lasts, in ms. Default `4000`. */
  duration?: number;
  /** Fuse stroke width in px. Default `2.5`. */
  fuseThickness?: number;
  /** Length of the swap between states, in ms. Default `320`. */
  crossfade?: number;
  /** Fire `onCommit` right away on `"press"` (optimistic) or when the `"fuse"` runs out. Default `"press"`. */
  commitOn?: "press" | "fuse";
  /** When the fuse runs out, `"reset"` back to the action or `"stay"` done. Default `"reset"`. */
  afterFuse?: "reset" | "stay";
  /** How long the done state shows before a reset, in ms. Default `1600`. */
  resetAfter?: number;
  /** Pause the fuse while the pointer is over the button. Off by default: the fuse only stops when Undo is pressed. */
  pauseOnHover?: boolean;
  /** Called when the action applies. Timing follows `commitOn`. */
  onCommit?: () => void;
  /** Called when Undo is pressed before the fuse runs out. */
  onUndo?: () => void;
  disabled?: boolean;
  className?: string;
}

/** A check that draws itself, stroke first. */
function DrawnCheck({ draw }: { draw: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <motion.path
        d="M20 6 9 17l-5-5"
        initial={draw ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
      />
    </svg>
  );
}

/** Staggers a string in letter by letter. Other nodes render as they are. */
function Letters({ children }: { children: React.ReactNode }) {
  if (typeof children !== "string") return <>{children}</>;
  return (
    <motion.span
      aria-label={children}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.035, delayChildren: 0.12 }}
    >
      {Array.from(children).map((char, i) => (
        <motion.span key={i} aria-hidden variants={LETTER} className="inline-block whitespace-pre">
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

/** Embers drifting off the burning end, centered on its own origin. */
function Spark({ color, still }: { color: string; still: boolean }) {
  return (
    <span className="absolute left-0 top-0 block size-0">
      {!still &&
        EMBERS.map((e, i) => (
          <motion.span
            key={i}
            className="absolute -left-px -top-px size-[3px] rounded-full"
            style={{ background: color }}
            initial={{ opacity: 0 }}
            animate={{ x: [0, e.x], y: [0, e.y], opacity: [1, 0], scale: [1, 0.3] }}
            transition={{ duration: e.duration, delay: e.delay, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
    </span>
  );
}

/**
 * Rounded-rect path from top center, running counterclockwise. The fuse burns
 * back from the path's end, so the burning end travels the other way: right along
 * the top, down the right side, right to left across the bottom, and home.
 */
function outlinePath(w: number, h: number, radius: number, inset: number) {
  const l = inset;
  const t = inset;
  const r = w - inset;
  const b = h - inset;
  const rad = Math.max(0, Math.min(radius - inset, (b - t) / 2, (r - l) / 2));
  return [
    `M ${w / 2} ${t}`,
    `H ${l + rad}`,
    `A ${rad} ${rad} 0 0 0 ${l} ${t + rad}`,
    `V ${b - rad}`,
    `A ${rad} ${rad} 0 0 0 ${l + rad} ${b}`,
    `H ${r - rad}`,
    `A ${rad} ${rad} 0 0 0 ${r} ${b - rad}`,
    `V ${t + rad}`,
    `A ${rad} ${rad} 0 0 0 ${r - rad} ${t}`,
    "Z",
  ].join(" ");
}

/** The outline burns back toward top center while the embers ride its end. */
function OutlineFuse({
  remaining,
  size,
  radius,
  thickness,
  color,
  still,
}: {
  remaining: MotionValue<number>;
  size: { w: number; h: number };
  radius: number;
  thickness: number;
  color: string;
  still: boolean;
}) {
  const pathRef = React.useRef<SVGPathElement>(null);
  const length = React.useRef(0);
  const d = outlinePath(size.w, size.h, radius, thickness / 2);

  React.useLayoutEffect(() => {
    length.current = pathRef.current?.getTotalLength() ?? 0;
  }, [d]);

  const point = (r: number) => pathRef.current?.getPointAtLength(r * length.current) ?? { x: size.w / 2, y: 0 };
  const x = useTransform(remaining, (r) => point(r).x);
  const y = useTransform(remaining, (r) => point(r).y);

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <svg width={size.w} height={size.h} className="absolute inset-0 overflow-visible">
        <motion.path
          ref={pathRef}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          style={{ pathLength: remaining }}
        />
      </svg>
      <motion.span className="absolute left-0 top-0" style={{ x, y }}>
        <Spark color={color} still={still} />
      </motion.span>
    </span>
  );
}

export const FuseButton = React.forwardRef<HTMLDivElement, FuseButtonProps>(function FuseButton(
  {
    children = "Archive",
    icon = <ArchiveIcon className="size-4" />,
    doneLabel = "Archived",
    undoLabel = "Undo",
    size = "md",
    radius = 9999,
    textColor,
    background,
    fuseColor = "#f5a524",
    duration = 4000,
    fuseThickness = 2.5,
    crossfade = 320,
    commitOn = "press",
    afterFuse = "reset",
    resetAfter = 1600,
    pauseOnHover = false,
    onCommit,
    onUndo,
    disabled,
    className,
  },
  ref,
) {
  const reduceMotion = useReducedMotion() ?? false;
  const [state, setState] = React.useState<FuseState>("idle");
  const [box, setBox] = React.useState({ w: 0, h: 0 });
  // Share of the fuse left to burn, 1 to 0.
  const remaining = useMotionValue(1);
  const burn = React.useRef<AnimationPlaybackControls | null>(null);
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pillRef = React.useRef<HTMLDivElement>(null);
  const actionRef = React.useRef<HTMLButtonElement>(null);
  const undoRef = React.useRef<HTMLButtonElement>(null);
  const returnFocus = React.useRef(false);
  const hovering = React.useRef(false);
  // The pointer is already over the button when it is pressed; only a later hover pauses.
  const ignoreHover = React.useRef(false);
  const s = SIZES[size];

  const swap = React.useMemo(
    () => ({
      // The outgoing face leaves quickly; the incoming one starts a beat later, so they never crowd.
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0, transition: { duration: crossfade / 1000, ease: GLIDE, delay: crossfade / 4000 } },
      exit: { opacity: 0, y: -6, transition: { duration: (crossfade * 0.6) / 1000, ease: EASE_IN } },
    }),
    [crossfade],
  );

  React.useLayoutEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(
    () => () => {
      burn.current?.stop();
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  // Hand focus to Undo while it is live, and back to the action after an undo.
  // preventScroll matters: the incoming face starts 6px low, and a plain focus()
  // makes the browser scroll the clipped pill to reveal it, shifting everything.
  React.useEffect(() => {
    if (state === "armed") undoRef.current?.focus({ preventScroll: true });
    if (state === "idle" && returnFocus.current) {
      returnFocus.current = false;
      actionRef.current?.focus({ preventScroll: true });
    }
  }, [state]);

  const finish = () => {
    setState("committed");
    if (commitOn === "fuse") onCommit?.();
    if (afterFuse === "reset") {
      resetTimer.current = setTimeout(() => {
        remaining.set(1);
        setState("idle");
      }, resetAfter);
    }
  };

  const ignite = () => {
    burn.current?.stop();
    burn.current = animate(remaining, 0, {
      duration: (remaining.get() * duration) / 1000,
      ease: "linear",
      onComplete: finish,
    });
  };

  const fire = () => {
    if (disabled) return;
    remaining.set(1);
    ignoreHover.current = hovering.current;
    setState("armed");
    if (commitOn === "press") onCommit?.();
    ignite();
  };

  const undo = () => {
    burn.current?.stop();
    // Rewind: the fuse eases back to full length while it fades, mirroring the press.
    burn.current = animate(remaining, 1, { duration: (crossfade * 1.4) / 1000, ease: GLIDE });
    returnFocus.current = true;
    setState("idle");
    onUndo?.();
  };

  const colors = { background, color: textColor };
  const rounded = { borderRadius: radius };

  return (
    <motion.div
      ref={ref}
      onKeyDown={(e) => {
        if (state === "armed" && e.key === "Escape") undo();
      }}
      onPointerEnter={() => {
        hovering.current = true;
        if (state === "armed" && pauseOnHover && !ignoreHover.current) burn.current?.stop();
      }}
      onPointerLeave={() => {
        hovering.current = false;
        if (ignoreHover.current) ignoreHover.current = false;
        else if (state === "armed" && pauseOnHover) ignite();
      }}
      animate={state === "committed" ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      style={rounded}
      className={cn("relative inline-flex", disabled && "pointer-events-none opacity-50", className)}
    >
      <div
        ref={pillRef}
        style={{ ...rounded, ...colors }}
        className={cn(
          "relative isolate inline-grid select-none overflow-hidden font-medium",
          !background && "bg-white dark:bg-zinc-800",
          !textColor && "text-zinc-900 dark:text-zinc-100",
          s.box,
        )}
      >
        {/* All three faces share one grid cell, so the control takes the widest and never resizes. */}
        <span aria-hidden className={cn("invisible col-start-1 row-start-1 flex items-center gap-2", s.pad)}>
          {icon}
          {children}
        </span>
        <span aria-hidden className={cn("invisible col-start-1 row-start-1 flex items-center gap-2", s.pad)}>
          <span className="size-4" />
          {undoLabel}
        </span>
        <span aria-hidden className={cn("invisible col-start-1 row-start-1 flex items-center gap-2", s.pad)}>
          <span className="size-4" />
          {doneLabel}
        </span>

        <AnimatePresence initial={false}>
          {state === "idle" && (
            <motion.button
              key="idle"
              ref={actionRef}
              type="button"
              disabled={disabled}
              onClick={fire}
              whileTap={PRESS}
              {...swap}
              style={rounded}
              className={cn(
                "col-start-1 row-start-1 flex cursor-pointer items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-current/40",
                s.pad,
              )}
            >
              {icon}
              {children}
            </motion.button>
          )}

          {state === "armed" && (
            <motion.div
              key="armed"
              {...swap}
              style={{ padding: s.inset }}
              className="col-start-1 row-start-1 flex"
            >
              {/* Ghost button filling the shell with an even inset. It lands with a tint flash,
                  the arrow swings back like a rewind, and the label follows a beat later. */}
              <motion.button
                ref={undoRef}
                type="button"
                onClick={undo}
                initial="enter"
                animate="rest"
                whileHover="hover"
                whileTap="press"
                variants={GHOST}
                style={{ borderRadius: Math.max(0, radius - s.inset) }}
                className="relative isolate flex flex-1 cursor-pointer items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-current/40"
              >
                <motion.span
                  aria-hidden
                  variants={GHOST_TINT}
                  style={{ borderRadius: Math.max(0, radius - s.inset) }}
                  className="absolute inset-0 -z-10 bg-current"
                />
                <motion.span variants={UNDO_ICON} className="flex">
                  <Undo2 className="size-4" />
                </motion.span>
                <Letters>{undoLabel}</Letters>
              </motion.button>
            </motion.div>
          )}

          {state === "committed" && (
            <motion.span
              key="committed"
              {...swap}
              className={cn("col-start-1 row-start-1 flex items-center justify-center gap-2", s.pad)}
            >
              <DrawnCheck draw />
              <Letters>{doneLabel}</Letters>
            </motion.span>
          )}
        </AnimatePresence>

      </div>

      {/* Outside the clipped pill so the embers can drift past the edge. */}
      <AnimatePresence>
        {state === "armed" && box.w > 0 && (
          <motion.span
            key="fuse"
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: crossfade / 1000, ease: GLIDE } }}
            exit={{ opacity: 0, transition: { duration: (crossfade * 1.4) / 1000, ease: GLIDE } }}
          >
            <OutlineFuse
              remaining={remaining}
              size={box}
              radius={radius}
              thickness={fuseThickness}
              color={fuseColor}
              still={reduceMotion}
            />
          </motion.span>
        )}
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {state === "armed" ? `${typeof doneLabel === "string" ? doneLabel : "Done"}. Undo available.` : ""}
      </span>
    </motion.div>
  );
});