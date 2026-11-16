"use client";

/**
 * RoadmapCard, from https://motion-brew.com/components/roadmap-card
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
import { animate, AnimatePresence, motion, type MotionValue, type Transition, useAnimation, useInView, useMotionValue, useReducedMotion, useTransform, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: check
const CheckIcon = (() => {
interface CheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CheckIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    scale: [0.5, 1],
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
};

const CheckIcon = forwardRef<CheckIconHandle, CheckIconProps>(
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
          <motion.path
            animate={controls}
            d="M4 12 9 17L20 6"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

CheckIcon.displayName = "CheckIcon";
  return CheckIcon;
})();

// Animated icon: chevron-left
const ChevronLeftIcon = (() => {
interface ChevronLeftIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ChevronLeftIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const DEFAULT_TRANSITION: Transition = {
  times: [0, 0.4, 1],
  duration: 0.5,
};

const ChevronLeftIcon = forwardRef<ChevronLeftIconHandle, ChevronLeftIconProps>(
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
          <motion.path
            animate={controls}
            d="m15 18-6-6 6-6"
            transition={DEFAULT_TRANSITION}
            variants={{
              normal: { x: 0 },
              animate: { x: [0, -2, 0] },
            }}
          />
        </svg>
      </span>
    );
  }
);

ChevronLeftIcon.displayName = "ChevronLeftIcon";
  return ChevronLeftIcon;
})();

// Animated icon: chevron-right
const ChevronRightIcon = (() => {
interface ChevronRightIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ChevronRightIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const DEFAULT_TRANSITION: Transition = {
  times: [0, 0.4, 1],
  duration: 0.5,
};

const ChevronRightIcon = forwardRef<
  ChevronRightIconHandle,
  ChevronRightIconProps
>(({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
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
        <motion.path
          animate={controls}
          d="m9 18 6-6-6-6"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { x: 0 },
            animate: { x: [0, 2, 0] },
          }}
        />
      </svg>
    </span>
  );
});

ChevronRightIcon.displayName = "ChevronRightIcon";
  return ChevronRightIcon;
})();

// RoadmapCard

/**
 * RoadmapCard
 *
 * Trigger: press (plus keys and in view). A white card that walks through the
 * phases of a product roadmap like stories. A row of bars across the top has
 * one bar per phase: past ones full, the current one filling over the time
 * each phase is shown, the rest empty; any bar jumps to its phase, and a
 * small Playing chip pauses and resumes it. A big two digit phase number rolls
 * like an odometer next to the title, the title and body blur across in the
 * direction of travel, and a short list of milestones follows with each check
 * drawing in one after another. Round previous and next buttons with animated
 * chevrons step through, and so do the arrow keys. Reduced motion stops it
 * playing on its own and swaps the moves for plain changes.
 *
 * Engine: motion/react (a motion value for the story fill that pauses and
 * resumes from the chip, rolling digit columns, AnimatePresence for the text and the list)
 * with animated icons from lucide-animated (MIT), vendored in src/icons.
 */

export interface RoadmapPhase {
  /** Short name, like "Private beta". Shown as the title. */
  title: string;
  body: string;
  /** A few milestones, checked off under the body. */
  focus?: string[];
}

export interface RoadmapCardProps {
  /** Small label at the top. Default `"Product roadmap"`. */
  label?: string;
  phases?: RoadmapPhase[];
  /** Phase shown first. Default `2` (the third). */
  defaultPhase?: number;
  /** Seconds per phase while it plays on its own; `0` turns it off. Default `5`. */
  autoplay?: number;
  onChange?: (index: number) => void;
  className?: string;
}

const DEFAULT_PHASES: RoadmapPhase[] = [
  {
    title: "Discovery",
    body: "Talk to customers, map the problem and agree on what success looks like.",
    focus: ["Twelve customer calls", "Problem brief signed off"],
  },
  {
    title: "Design",
    body: "Shape the flows, test prototypes and lock the scope for the first release.",
    focus: ["Prototype tested with users", "Scope frozen"],
  },
  {
    title: "Private beta",
    body: "Ship to a small group of design partners and fix what they run into.",
    focus: ["Ten design partners live", "Weekly feedback review"],
  },
  {
    title: "Public launch",
    body: "Open the doors, announce it and watch adoption, errors and support load.",
    focus: ["Launch post and changelog", "Status page green"],
  },
  {
    title: "General availability",
    body: "Harden for scale, add enterprise controls and turn on billing for everyone.",
    focus: ["SSO and audit log", "Pricing live"],
  },
];

const GLIDE = [0.22, 1, 0.36, 1] as const;
// Number rolls, the same as GoalGauge and SpendingMeter: one 0 to 9 column per digit.
const ROLL = {
  type: "spring",
  stiffness: 280,
  damping: 26,
  mass: 0.8,
} as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function Digit({ digit, still }: { digit: number; still: boolean }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={{ y: "0%" }}
        animate={{ y: `${-digit * 10}%` }}
        transition={still ? { duration: 0 } : ROLL}
      >
        {DIGITS.map((d) => (
          <span key={d} className="flex h-[1em] items-center justify-center">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** One story bar: full when past, filling from a motion value when current, empty when ahead. */
function Bar({
  state,
  fill,
  label,
  onPick,
}: {
  state: "past" | "now" | "next";
  fill: MotionValue<number>;
  label: string;
  onPick: () => void;
}) {
  const width = useTransform(fill, (f) => `${f * 100}%`);
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={state === "now" ? "step" : undefined}
      onClick={onPick}
      className="group/bar relative flex h-5 flex-1 cursor-pointer items-center outline-none focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-zinc-400"
    >
      <span
        className={cn(
          "relative w-full overflow-hidden rounded-full transition-[height,background-color] duration-300 group-hover/bar:h-1.5",
          // The current bar reads as current even before it starts to fill.
          state === "now"
            ? "h-1.5 bg-[#242423]/25 dark:bg-white/30"
            : "h-1 bg-[#242423]/10 dark:bg-white/15",
        )}
      >
        {/* Past and future bars hold a plain full or empty fill. */}
        <motion.span
          className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-[#242423] dark:bg-zinc-100"
          initial={false}
          animate={{ scaleX: state === "past" ? 1 : 0 }}
          transition={{ duration: 0.3, ease: GLIDE }}
        />
        {/* Only the current bar follows the live fill; it mounts fresh on each phase. */}
        {state === "now" && (
          <motion.span
            className="absolute inset-y-0 left-0 rounded-full bg-[#242423] dark:bg-zinc-100"
            style={{ width }}
          />
        )}
      </span>
    </button>
  );
}

export const RoadmapCard = React.forwardRef<HTMLDivElement, RoadmapCardProps>(
  function RoadmapCard(
    {
      label = "Product roadmap",
      phases = DEFAULT_PHASES,
      defaultPhase = 2,
      autoplay = 5,
      onChange,
      className,
    },
    ref,
  ) {
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const still = !!useReducedMotion();
    const inView = useInView(root, { amount: 0.4 });
    const n = phases.length;
    const [at, setAt] = React.useState(
      Math.min(n - 1, Math.max(0, defaultPhase)),
    );
    const [dir, setDir] = React.useState(1);
    const [paused, setPaused] = React.useState(false);
    const fill = useMotionValue(0);

    const go = React.useCallback(
      (to: number) => {
        const next = ((to % n) + n) % n;
        setDir(next >= at ? 1 : -1);
        setAt(next);
        fill.set(0);
        onChange?.(next);
      },
      [at, n, onChange, fill],
    );

    // The current bar fills over the phase's time, pauses on hover, then steps on.
    const playing = !!autoplay && !still && inView && !paused;
    React.useEffect(() => {
      if (!playing) return;
      const left = (1 - fill.get()) * autoplay;
      const c = animate(fill, 1, {
        duration: Math.max(0.05, left),
        ease: "linear",
        onComplete: () => go(at + 1),
      });
      return () => c.stop();
    }, [playing, at, autoplay, fill, go]);

    const phase = phases[at]!;
    const slide = still ? 0 : 24;
    const num = String(at + 1).padStart(2, "0");

    return (
      <motion.div
        ref={root}
        role="group"
        aria-roledescription="stepper"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(at + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(at - 1);
          }
        }}
        initial={still ? false : { opacity: 0, y: 16 }}
        animate={inView || still ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: GLIDE }}
        className={cn(
          "w-[360px] max-w-full rounded-3xl bg-white p-6 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        {/* Story bars */}
        <div className="flex gap-1.5">
          {phases.map((p, i) => (
            <Bar
              key={p.title}
              state={i < at ? "past" : i === at ? "now" : "next"}
              fill={fill}
              label={`Phase ${i + 1}, ${p.title}`}
              onPick={() => go(i)}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <motion.button
            type="button"
            aria-pressed={paused}
            aria-label={paused ? "Resume" : "Pause"}
            onClick={() => setPaused((x) => !x)}
            whileTap={still ? undefined : { scale: 0.94 }}
            className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full bg-[#242423]/[0.06] px-2.5 text-xs font-medium text-zinc-500 outline-none transition-colors hover:bg-[#242423]/[0.1] hover:text-[#242423] focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/[0.08] dark:text-zinc-400"
          >
            <motion.span
              className="size-1.5 rounded-full bg-[#269a5a]"
              animate={playing ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
              transition={{ duration: 1.4, repeat: playing ? Infinity : 0 }}
            />
            {playing ? "Playing" : "Paused"}
          </motion.button>
        </div>

        {/* Number and title */}
        <div className="mt-5 flex items-end gap-4">
          <span
            aria-hidden
            className="inline-flex text-[48px] font-semibold leading-none tracking-tight text-[#242423]/15 tabular-nums dark:text-white/20"
          >
            {Array.from(num).map((ch, i) => (
              <Digit key={num.length - i} digit={Number(ch)} still={still} />
            ))}
          </span>
          <div className="relative min-w-0 flex-1 pb-1">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={at}
                className="text-xl font-semibold leading-tight tracking-tight"
                initial={
                  still
                    ? false
                    : { x: slide * dir, opacity: 0, filter: "blur(4px)" }
                }
                animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                exit={
                  still
                    ? undefined
                    : { x: -slide * dir, opacity: 0, filter: "blur(4px)" }
                }
                transition={{ duration: 0.4, ease: GLIDE }}
              >
                {phase.title}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Body and focus points */}
        <div className="relative mt-4 min-h-[148px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={at}
              initial={
                still
                  ? false
                  : { x: slide * dir, opacity: 0, filter: "blur(4px)" }
              }
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              exit={
                still
                  ? undefined
                  : { x: -slide * dir, opacity: 0, filter: "blur(4px)" }
              }
              transition={{
                duration: 0.4,
                ease: GLIDE,
                delay: still ? 0 : 0.04,
              }}
            >
              <p className="text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
                {phase.body}
              </p>
              {phase.focus?.length ? (
                <ul className="mt-4 space-y-2">
                  {phase.focus.map((f, i) => (
                    <motion.li
                      key={f}
                      className="flex items-center gap-2.5 text-sm font-medium"
                      initial={still ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: still ? 0 : 0.18 + i * 0.1,
                        ease: GLIDE,
                      }}
                    >
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#269a5a]/10 text-[#269a5a]">
                        <CheckIcon
                          className="size-3"
                          strokeWidth={2.5}
                          active
                        />
                      </span>
                      {f}
                    </motion.li>
                  ))}
                </ul>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span
            className="text-sm tabular-nums text-zinc-500 dark:text-zinc-400"
            aria-live="polite"
          >
            Phase {at + 1} of {n}
          </span>
          <div className="flex gap-2">
            {[
              { label: "Previous phase", to: at - 1, Icon: ChevronLeftIcon },
              { label: "Next phase", to: at + 1, Icon: ChevronRightIcon },
            ].map(({ label: l, to, Icon }) => (
              <motion.button
                key={l}
                type="button"
                aria-label={l}
                onClick={() => go(to)}
                whileTap={still ? undefined : { scale: 0.9 }}
                className={cn(
                  "grid size-10 cursor-pointer place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400",
                  l === "Next phase"
                    ? "bg-[#242423] text-white hover:bg-[#242423]/90 dark:bg-zinc-100 dark:text-[#242423]"
                    : "bg-[#242423]/[0.06] text-[#242423] hover:bg-[#242423]/[0.1] dark:bg-white/[0.08] dark:text-zinc-100",
                )}
              >
                <Icon className="size-4" />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  },
);