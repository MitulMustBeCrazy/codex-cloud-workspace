"use client";

/**
 * ActivityGrid, from https://motion-brew.com/components/activity-grid
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
import { animate, AnimatePresence, motion, useAnimation, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: activity
const ActivityIcon = (() => {
interface ActivityIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ActivityIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [1, 0],
    transition: {
      duration: 0.6,
      ease: "linear",
      opacity: { duration: 0.1 },
    },
  },
};

const ActivityIcon = forwardRef<ActivityIconHandle, ActivityIconProps>(
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
            d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"
            initial="normal"
            variants={VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

ActivityIcon.displayName = "ActivityIcon";
  return ActivityIcon;
})();

// Animated icon: flame
const FlameIcon = (() => {
interface FlameIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FlameIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
    pathOffset: 0,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      delay: 0.1,
      duration: 0.4,
      opacity: { duration: 0.1, delay: 0.1 },
    },
  },
};

const FlameIcon = forwardRef<FlameIconHandle, FlameIconProps>(
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
            d="M8.9 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
            fill="none"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

FlameIcon.displayName = "FlameIcon";
  return FlameIcon;
})();

// Animated icon: trending-up
const TrendingUpIcon = (() => {
interface TrendingUpIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface TrendingUpIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SVG_VARIANTS: Variants = {
  animate: {
    x: 0,
    y: 0,
    translateX: [0, 2, 0],
    translateY: [0, -2, 0],
    transition: {
      duration: 0.5,
    },
  },
};

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [1, 0],
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
};

const ARROW_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: {
      delay: 0.3,
      duration: 0.3,
      opacity: { duration: 0.1, delay: 0.3 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [0.5, 0],
    transition: {
      delay: 0.3,
      duration: 0.3,
      opacity: { duration: 0.1, delay: 0.3 },
    },
  },
};

const TrendingUpIcon = forwardRef<TrendingUpIconHandle, TrendingUpIconProps>(
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
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          variants={SVG_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.polyline
            animate={controls}
            initial="normal"
            points="22 7 13.5 15.5 8.5 10.5 2 17"
            variants={PATH_VARIANTS}
          />
          <motion.polyline
            animate={controls}
            initial="normal"
            points="16 7 22 7 22 13"
            variants={ARROW_VARIANTS}
          />
        </motion.svg>
      </span>
    );
  }
);

TrendingUpIcon.displayName = "TrendingUpIcon";
  return TrendingUpIcon;
})();

// Animated icon: zap
const ZapIcon = (() => {
interface ZapHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ZapProps extends React.HTMLAttributes<HTMLSpanElement> {
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
    transition: {
      duration: 0.6,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      duration: 0.6,
      opacity: { duration: 0.1 },
    },
  },
};

const ZapIcon = forwardRef<ZapHandle, ZapProps>(
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
            d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

ZapIcon.displayName = "ZapIcon";
  return ZapIcon;
})();

// ActivityGrid

/**
 * ActivityGrid
 *
 * Trigger: in view, then hover, keys and resize. A white card with a year of
 * daily activity as a heatmap: one column per week, one square per day, in
 * tints and shades of one colour, dark ink by default. When the card scrolls into view the squares sweep
 * in as a diagonal wave from the oldest week to today while the total counts
 * up beside a change chip. Hover a day and its row and column stay lit while
 * the rest dims, with a tooltip naming the day and its count; hover a step of
 * the legend and only the days at that level stay lit. The grid measures its
 * own width and shows as many recent weeks as fit, so it sits in a small card
 * and stretches to the full year on a wide one; the total, the streak tiles
 * and the period chip count to the new numbers when the width changes. The
 * arrow keys move through the days. Reduced motion shows the final state at
 * once.
 *
 * Engine: motion/react (motion values counting the numbers, AnimatePresence
 * for the tooltip) with CSS transitions staggering the squares, a
 * ResizeObserver fitting the weeks, and animated icons from lucide-animated
 * (MIT), vendored in src/icons.
 */

/**
 * Ready made ramps: one colour each, from a light tint on quiet days to a
 * deep shade on the busiest.
 */
export const ACTIVITY_PALETTES = {
  ink: ["#dcdcda", "#a6a6a3", "#6e6e6b", "#242423"],
  green: ["#c9f2d5", "#7ddc96", "#2fbf5c", "#17803a"],
  violet: ["#ddd6ff", "#ad9bff", "#7b61ff", "#4a2fd1"],
  mint: ["#c6f4e3", "#6fe0b8", "#16c79a", "#0b8a6a"],
  amber: ["#ffe7b3", "#ffc85c", "#ffad1f", "#d98200"],
  sky: ["#cbeaff", "#7cc8ff", "#2aa8f2", "#0a72b8"],
} as const satisfies Record<string, readonly [string, string, string, string]>;

export interface ActivityGridProps {
  /** Card title. Default `"Focus sessions"`. */
  title?: string;
  /** One value per day, oldest first, the last one is today. Default a year of sample sessions. */
  data?: number[];
  /** The last day in `data`. Default today. */
  endDate?: Date;
  /** What is counted, singular. Default `"session"`. */
  unit?: string;
  /** A ready made colour, in tints and shades. Default `"ink"`, which turns light in dark mode. */
  palette?: keyof typeof ACTIVITY_PALETTES;
  /** Four colours for the activity levels, quietest to busiest; overrides `palette`. */
  colors?: readonly [string, string, string, string];
  /** Preferred square size in px; squares grow up to 16px when the whole year fits. Default `11`. */
  cellSize?: number;
  /** Show the three streak tiles. Default `true`. */
  showStats?: boolean;
  className?: string;
}

const WEEKS = 53;
const GAP = 3;
const DAY_LABEL_W = 26;
const MAX_CELL = 16;
const LEVELS = [0, 1, 2, 3, 4] as const;

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_CSS = "cubic-bezier(0.22,1,0.36,1)";
const DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A year of believable sample sessions: busier on weekdays, waves of busy weeks, two quiet spells, a run at the end. */
function sampleData(days: number) {
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const out: number[] = [];
  for (let i = 0; i < days; i++) {
    const weekday = (i + 2) % 7 < 5;
    // Slow waves of busier and calmer weeks across the year.
    const wave = 0.5 + 0.3 * Math.sin((i / days) * Math.PI * 6) + 0.2 * Math.sin((i / days) * Math.PI * 2 + 1.2);
    const quiet = (i > 96 && i < 106) || (i > 236 && i < 242);
    const run = i > days - 16;
    const r = rand();
    let v = 0;
    if (run) v = 2 + Math.round(r * 6);
    else if (!quiet && r < (weekday ? 0.86 : 0.45)) v = Math.max(1, Math.round((0.25 + rand()) * 8 * wave));
    out.push(v);
  }
  return out;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const shortDate = (d: Date) => `${WEEKDAYS[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
const longDate = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;

/** A number that counts to its value on a motion value whenever the value changes. */
function Count({ value, run, still, delay = 0 }: { value: number; run: boolean; still: boolean; delay?: number }) {
  const mv = useMotionValue(still ? value : 0);
  const [text, setText] = React.useState(() => Math.round(still ? value : 0).toLocaleString("en-US"));
  useMotionValueEvent(mv, "change", (v) => setText(Math.round(v).toLocaleString("en-US")));
  const first = React.useRef(true);
  React.useEffect(() => {
    if (!run) return;
    if (still) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration: first.current ? 1.3 : 0.7, delay: first.current ? delay : 0, ease: EASE });
    first.current = false;
    return () => c.stop();
  }, [run, still, value, delay, mv]);
  return <span className="tabular-nums">{text}</span>;
}

export const ActivityGrid = React.forwardRef<HTMLDivElement, ActivityGridProps>(function ActivityGrid(
  {
    title = "Focus sessions",
    data: dataProp,
    endDate,
    unit = "session",
    palette = "ink",
    colors: colorsProp,
    cellSize = 11,
    showStats = true,
    className,
  },
  forwardedRef,
) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);
  const colors = colorsProp ?? ACTIVITY_PALETTES[palette] ?? ACTIVITY_PALETTES.ink;
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const still = !!useReducedMotion();
  const shown = still || inView;

  // The calendar: WEEKS columns of Monday to Sunday, the last column holding today.
  const [today] = React.useState(() => startOfDay(endDate ?? new Date()));
  const todayRow = (today.getDay() + 6) % 7;
  const totalDays = (WEEKS - 1) * 7 + todayRow + 1;
  const data = React.useMemo(() => {
    const src = dataProp ?? sampleData(totalDays);
    const tail = src.slice(-totalDays);
    return [...Array(Math.max(0, totalDays - tail.length)).fill(0), ...tail] as number[];
  }, [dataProp, totalDays]);
  const firstDay = new Date(today.getTime() - (totalDays - 1) * DAY);

  // Steps by quartiles of the active days, so any scale of data reads well.
  const thresholds = React.useMemo(() => {
    const active = data.filter((v) => v > 0).sort((a, b) => a - b);
    if (!active.length) return [1, 1, 1];
    const q = (p: number) => active[Math.min(active.length - 1, Math.floor(p * active.length))]!;
    return [q(0.25), q(0.5), q(0.75)];
  }, [data]);
  const levelOf = (v: number) => (v <= 0 ? 0 : v <= thresholds[0]! ? 1 : v <= thresholds[1]! ? 2 : v <= thresholds[2]! ? 3 : 4);

  // Fit as many recent weeks as the width allows; when the whole year fits, grow the squares.
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setWidth(e!.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  const area = Math.max(0, width - DAY_LABEL_W);
  const fit = Math.max(8, Math.floor((area + GAP) / (cellSize + GAP)));
  const cols = Math.min(WEEKS, fit);
  const cell = cols === WEEKS ? Math.max(cellSize, Math.min(MAX_CELL, Math.floor((area + GAP) / WEEKS) - GAP)) : cellSize;
  const firstCol = WEEKS - cols;

  // The visible window, and the same length just before it for the change chip.
  const dayIndex = (col: number, row: number) => col * 7 + row;
  const windowStart = firstCol * 7;
  const windowValues = data.slice(windowStart);
  const total = windowValues.reduce((a, b) => a + b, 0);
  const prevStart = windowStart - windowValues.length;
  const prevTotal = prevStart >= 0 ? data.slice(prevStart, windowStart).reduce((a, b) => a + b, 0) : null;
  const change = prevTotal ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;

  // Streaks inside the visible window: the longest run of active days, and the one ending today.
  const streaks = React.useMemo(() => {
    let best = 0, bestEnd = -1, run = 0;
    windowValues.forEach((v, i) => {
      run = v > 0 ? run + 1 : 0;
      if (run > best) {
        best = run;
        bestEnd = i;
      }
    });
    let current = 0;
    for (let i = windowValues.length - 1; i >= 0 && windowValues[i]! > 0; i--) current++;
    const at = (i: number) => new Date(firstDay.getTime() + (windowStart + i) * DAY);
    return {
      best,
      bestRange: best ? `${longDate(at(bestEnd - best + 1))} to ${longDate(at(bestEnd))}` : "No streak yet",
      current,
      currentRange: current ? `Since ${longDate(at(windowValues.length - current))}` : "Start one today",
    };
  }, [windowValues, firstDay, windowStart]);

  const weeksLabel = cols >= 52 ? "Last 12 months" : `Last ${cols} weeks`;
  const plural = (n: number) => `${n.toLocaleString("en-US")} ${unit}${n === 1 ? "" : "s"}`;

  // Month labels where a new month starts, kept apart so they never collide.
  const months = React.useMemo(() => {
    const out: { col: number; label: string }[] = [];
    let last = -1, lastCol = -10;
    for (let c = 0; c < cols; c++) {
      const d = new Date(firstDay.getTime() + dayIndex(firstCol + c, 0) * DAY);
      if (d.getMonth() !== last) {
        if (c - lastCol >= 3 && !(c === 0 && d.getDate() > 20)) {
          out.push({ col: c, label: MONTHS[d.getMonth()]! });
          lastCol = c;
        }
        last = d.getMonth();
      }
    }
    return out;
  }, [cols, firstCol, firstDay]);

  // Hover and keys: one active day, or one legend level.
  const [active, setActive] = React.useState<{ col: number; row: number } | null>(null);
  const [level, setLevel] = React.useState<number | null>(null);
  const activeIdx = active ? dayIndex(firstCol + active.col, active.row) : -1;
  const activeDate = active ? new Date(firstDay.getTime() + activeIdx * DAY) : null;
  const tip = active && activeIdx < totalDays ? `${plural(data[activeIdx]!)}, ${shortDate(activeDate!)}` : "";

  const onKey = (e: React.KeyboardEvent) => {
    const moves: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowDown: [0, 1],
      ArrowUp: [0, -1],
    };
    const m = moves[e.key];
    if (e.key === "Escape") return setActive(null);
    if (!m) return;
    e.preventDefault();
    setActive((a) => {
      const from = a ?? { col: cols - 1, row: todayRow };
      let col = Math.max(0, Math.min(cols - 1, from.col + m[0]));
      let row = Math.max(0, Math.min(6, from.row + m[1]));
      if (col === cols - 1 && row > todayRow) row = todayRow;
      return { col, row };
    });
  };

  const [hoverStat, setHoverStat] = React.useState<number | null>(null);
  const stats = [
    { label: `Total ${unit}s`, value: total, suffix: "", note: weeksLabel, Icon: ActivityIcon },
    { label: "Longest streak", value: streaks.best, suffix: streaks.best === 1 ? " day" : " days", note: streaks.bestRange, Icon: FlameIcon },
    { label: "Current streak", value: streaks.current, suffix: streaks.current === 1 ? " day" : " days", note: streaks.currentRange, Icon: ZapIcon },
  ];

  const gridH = 7 * cell + 6 * GAP;

  return (
    <motion.div
      ref={ref}
      initial={still ? false : { opacity: 0, y: 16 }}
      animate={shown ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: EASE }}
      style={
        {
          "--ag": colors[3],
          "--l1": colors[0],
          "--l2": colors[1],
          "--l3": colors[2],
          "--l4": colors[3],
        } as React.CSSProperties
      }
      className={cn(
        // Ink would vanish on a dark card, so it turns into a light ramp there.
        !colorsProp &&
          palette === "ink" &&
          "dark:[--ag:#e4e4e7] dark:[--l1:#3f3f46] dark:[--l2:#71717a] dark:[--l3:#a1a1aa] dark:[--l4:#e4e4e7]",
        "relative w-full min-w-[260px] rounded-3xl bg-white p-5 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] sm:p-6 dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      {/* Header: the title, the period, and the total with its change. */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[32px] font-semibold leading-none tracking-[-0.03em]">
              <Count value={total} run={shown} still={still} delay={0.2} />
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{unit}s</span>
            {change !== null && (
              <span
                className={cn(
                  "inline-flex h-6 items-center gap-1 self-center rounded-full px-2 text-xs font-medium tabular-nums",
                  change >= 0
                    ? "bg-[#269a5a]/10 text-[#269a5a]"
                    : "bg-[#242423]/[0.06] text-zinc-500 dark:bg-white/[0.08] dark:text-zinc-400",
                )}
              >
                <TrendingUpIcon className={cn("size-3", change < 0 && "-scale-y-100")} active={shown} strokeWidth={2.5} />
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
            )}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#242423]/[0.06] px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-white/[0.08] dark:text-zinc-400">
          {weeksLabel}
        </span>
      </div>

      {/* The grid: month labels, day labels and one square per day. */}
      <div ref={gridRef} className="relative mt-5 w-full">
        {width > 0 && (
          <>
            <div className="relative h-4 text-xs text-zinc-400 dark:text-zinc-500" style={{ marginLeft: DAY_LABEL_W }}>
              {months.map((m) => (
                <span key={`${m.col}-${m.label}`} className="absolute top-0" style={{ left: m.col * (cell + GAP) }}>
                  {m.label}
                </span>
              ))}
            </div>
            <div className="mt-1.5 flex">
              <div className="relative shrink-0 text-xs text-zinc-400 dark:text-zinc-500" style={{ width: DAY_LABEL_W, height: gridH }}>
                {[0, 2, 4].map((r) => (
                  <span key={r} className="absolute left-0 leading-none" style={{ top: r * (cell + GAP) + cell / 2 - 6 }}>
                    {WEEKDAYS[r]}
                  </span>
                ))}
              </div>
              <div
                role="grid"
                tabIndex={0}
                aria-label={`${title}: ${plural(total)} in the ${weeksLabel.toLowerCase()}. Use the arrow keys to read each day.`}
                onKeyDown={onKey}
                onBlur={() => setActive(null)}
                onPointerLeave={() => setActive(null)}
                className="relative grid rounded-md outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-zinc-900"
                style={{
                  gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
                  gridTemplateRows: `repeat(7, ${cell}px)`,
                  gridAutoFlow: "column",
                  gap: GAP,
                }}
              >
                {Array.from({ length: cols * 7 }, (_, i) => {
                  const col = Math.floor(i / 7);
                  const row = i % 7;
                  const idx = dayIndex(firstCol + col, row);
                  if (idx >= totalDays) return <span key={i} aria-hidden />;
                  const v = data[idx]!;
                  const lv = levelOf(v);
                  const lit =
                    level !== null
                      ? lv === level
                      : active
                        ? active.col === col || active.row === row
                        : true;
                  const isActive = active?.col === col && active.row === row;
                  const isToday = idx === totalDays - 1;
                  return (
                    <span
                      key={i}
                      aria-hidden
                      onPointerEnter={() => setActive({ col, row })}
                      className="relative transition-opacity duration-150"
                      style={{ opacity: lit ? 1 : 0.35 }}
                    >
                      <span
                        className={cn(
                          "absolute inset-0 rounded-[3px] bg-[#242423]/[0.06] dark:bg-white/[0.07]",
                          isToday && "ring-1 ring-[var(--ag)] ring-offset-1 ring-offset-white dark:ring-offset-zinc-900",
                        )}
                        style={{
                          opacity: shown ? 1 : 0,
                          transform: shown ? (isActive ? "scale(1.35)" : "scale(1)") : "scale(0.3)",
                          transition: still
                            ? "none"
                            : `opacity 0.4s ${EASE_CSS} ${shown && !active ? (col * 0.014 + row * 0.02).toFixed(3) : 0}s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${shown && !active ? (col * 0.014 + row * 0.02).toFixed(3) : 0}s`,
                          zIndex: isActive ? 2 : undefined,
                        }}
                      >
                        {lv > 0 && (
                          <span className="absolute inset-0 rounded-[3px]" style={{ backgroundColor: `var(--l${lv})` }} />
                        )}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Tooltip over the active day. */}
            <AnimatePresence>
              {active && tip && (
                <motion.span
                  key="tip"
                  role="status"
                  initial={{ opacity: 0, y: 4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 2, scale: 0.98, transition: { duration: 0.1 } }}
                  transition={{ duration: 0.16, ease: EASE }}
                  className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#242423] px-2.5 py-1.5 text-xs font-medium text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)] dark:bg-zinc-100 dark:text-zinc-900"
                  style={{
                    left: Math.min(
                      Math.max(DAY_LABEL_W + active.col * (cell + GAP) + cell / 2, 70),
                      Math.max(70, width - 70),
                    ),
                    top: 16 + 6 + active.row * (cell + GAP) - 34,
                  }}
                >
                  {tip}
                </motion.span>
              )}
            </AnimatePresence>
          </>
        )}
        {width === 0 && <div style={{ height: gridH + 22 }} />}
      </div>

      {/* Legend: hover a step to light only the days at that level. */}
      <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
        <span className="mr-0.5">Less</span>
        {LEVELS.map((lv) => (
          <button
            key={lv}
            type="button"
            aria-label={lv === 0 ? "Show days with none" : `Show level ${lv} of 4`}
            onPointerEnter={() => setLevel(lv)}
            onPointerLeave={() => setLevel(null)}
            onFocus={() => setLevel(lv)}
            onBlur={() => setLevel(null)}
            className={cn(
              "relative size-3 rounded-[3px] bg-[#242423]/[0.06] outline-none transition-transform duration-150 hover:scale-125 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/[0.07]",
              level === lv && "scale-125",
            )}
          >
            {lv > 0 && <span className="absolute inset-0 rounded-[3px]" style={{ backgroundColor: `var(--l${lv})` }} />}
          </button>
        ))}
        <span className="ml-0.5">More</span>
      </div>

      {/* The streak tiles, counting to their numbers. */}
      {showStats && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              onPointerEnter={() => setHoverStat(i)}
              onPointerLeave={() => setHoverStat(null)}
              initial={still ? false : { opacity: 0, y: 10 }}
              animate={shown ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay: still ? 0 : 0.5 + i * 0.08, ease: EASE }}
              className="min-w-0 rounded-2xl bg-[#242423]/[0.04] p-3 transition-colors duration-200 hover:bg-[#242423]/[0.07] dark:bg-white/[0.05] dark:hover:bg-white/[0.08]"
            >
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <s.Icon className="size-3.5 shrink-0" active={hoverStat === i} strokeWidth={2.25} />
                <span className="truncate">{s.label}</span>
              </div>
              <div className="mt-1.5 truncate text-base font-semibold tracking-tight">
                <Count value={s.value} run={shown} still={still} delay={0.55 + i * 0.08} />
                <span className="font-normal text-zinc-500 dark:text-zinc-400">{s.suffix}</span>
              </div>
              <div className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">{s.note}</div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
});