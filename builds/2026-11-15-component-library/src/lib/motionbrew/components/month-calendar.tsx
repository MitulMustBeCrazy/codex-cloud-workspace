"use client";

/**
 * MonthCalendar, from https://motion-brew.com/components/month-calendar
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
import { AnimatePresence, LayoutGroup, motion, type Transition, useAnimation, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

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

// MonthCalendar

/**
 * MonthCalendar
 *
 * Trigger: hover and press. A white month calendar. A soft gray disc follows
 * the pointer from day to day, and picking a day springs an ink disc to it.
 * The arrows slide the month sideways in the direction you travel, with the
 * month name rolling the same way and a touch of blur on the move; the arrow
 * nudges toward its side on hover. Days with events carry a small dot, today
 * wears a thin ring, and days from the months around it sit faded at the
 * edges; picking one of those turns to its month. The grid works like a
 * calendar with the keyboard: arrows move by day and week, Page Up and Page
 * Down by month, Home and End to the ends of the week. Reduced motion swaps
 * the slides for fades.
 *
 * Engine: motion/react (layoutId discs for hover and selection, direction
 * aware AnimatePresence for the month change).
 */

export interface MonthCalendarProps {
  /** The selected day. Leave it out to let the calendar keep its own. */
  value?: Date;
  /** The day selected at first. Default today. */
  defaultValue?: Date;
  /** Called with the picked day. */
  onChange?: (date: Date) => void;
  /** Days that get an event dot. Default a few days this month. */
  events?: Date[];
  /** First day of the week, 0 for Sunday or 1 for Monday. Default `1`. */
  weekStartsOn?: 0 | 1;
  /** Locale for month and weekday names. Default `"en-US"`. */
  locale?: string;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const DISC = { type: "spring", stiffness: 480, damping: 36 } as const;

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => {
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return new Date(
    d.getFullYear(),
    d.getMonth() + n,
    Math.min(d.getDate(), last),
  );
};
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Six full weeks around the month, so the grid never changes height. */
function weeksFor(month: Date, weekStartsOn: number) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const start = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

function defaultEvents() {
  const t = new Date();
  return [3, 9, 14, 22, 28].map(
    (d) => new Date(t.getFullYear(), t.getMonth(), d),
  );
}

export const MonthCalendar = React.forwardRef<
  HTMLDivElement,
  MonthCalendarProps
>(function MonthCalendar(
  {
    value,
    defaultValue,
    onChange,
    events,
    weekStartsOn = 1,
    locale = "en-US",
    className,
  },
  ref,
) {
  const still = !!useReducedMotion();
  const id = React.useId();
  const [inner, setInner] = React.useState(() =>
    startOfDay(defaultValue ?? new Date()),
  );
  const selected = value ? startOfDay(value) : inner;
  const [month, setMonth] = React.useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1),
  );
  const [dir, setDir] = React.useState(0);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [focusDay, setFocusDay] = React.useState(selected);
  const grid = React.useRef<HTMLDivElement>(null);
  const today = React.useMemo(() => startOfDay(new Date()), []);

  const marks = React.useMemo(
    () => new Set((events ?? defaultEvents()).map((d) => keyOf(d))),
    [events],
  );
  const days = React.useMemo(
    () => weeksFor(month, weekStartsOn),
    [month, weekStartsOn],
  );
  const weekdays = React.useMemo(
    () =>
      days.slice(0, 7).map((d) => ({
        short: d.toLocaleDateString(locale, { weekday: "short" }).slice(0, 2),
        long: d.toLocaleDateString(locale, { weekday: "long" }),
      })),
    [days, locale],
  );
  const label = month.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  const go = (n: number) => {
    setDir(n);
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
    setHovered(null);
  };

  const pick = (d: Date) => {
    if (!sameMonth(d, month)) go(d < month ? -1 : 1);
    if (!value) setInner(d);
    setFocusDay(d);
    onChange?.(d);
  };

  // Keep the roving focus inside the month on view.
  React.useEffect(() => {
    if (!sameMonth(focusDay, month))
      setFocusDay(
        sameMonth(selected, month)
          ? selected
          : sameMonth(today, month)
            ? today
            : month,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const moveFocus = (d: Date) => {
    if (!sameMonth(d, month)) go(d < month ? -1 : 1);
    setFocusDay(d);
    requestAnimationFrame(() =>
      grid.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${keyOf(d)}"]`)
        ?.focus(),
    );
  };

  const onKey = (e: React.KeyboardEvent) => {
    const d = focusDay;
    const dow = (d.getDay() - weekStartsOn + 7) % 7;
    const next: Record<string, () => Date> = {
      ArrowLeft: () => addDays(d, -1),
      ArrowRight: () => addDays(d, 1),
      ArrowUp: () => addDays(d, -7),
      ArrowDown: () => addDays(d, 7),
      PageUp: () => addMonths(d, -1),
      PageDown: () => addMonths(d, 1),
      Home: () => addDays(d, -dow),
      End: () => addDays(d, 6 - dow),
    };
    const f = next[e.key];
    if (!f) return;
    e.preventDefault();
    moveFocus(f());
  };

  const slide = {
    enter: (d: number) =>
      still ? { opacity: 0 } : { opacity: 0, x: d * 28, filter: "blur(4px)" },
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (d: number) =>
      still ? { opacity: 0 } : { opacity: 0, x: d * -28, filter: "blur(4px)" },
  };

  const arrow =
    "group grid size-9 cursor-pointer place-items-center rounded-full text-zinc-500 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-zinc-100";

  return (
    <div
      ref={ref}
      className={cn(
        "w-[340px] max-w-full rounded-3xl bg-white p-5 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <motion.button
          type="button"
          aria-label="Previous month"
          onClick={() => go(-1)}
          whileTap={still ? undefined : { scale: 0.9 }}
          className={arrow}
        >
          <ChevronLeftIcon
            className="size-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-0.5"
            strokeWidth={2}
          />
        </motion.button>
        <h3
          id={`${id}-label`}
          aria-live="polite"
          className="relative grid flex-1 place-items-center overflow-hidden text-base font-semibold tracking-tight"
        >
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.span
              key={label}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: GLIDE }}
              className="whitespace-nowrap"
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </h3>
        <motion.button
          type="button"
          aria-label="Next month"
          onClick={() => go(1)}
          whileTap={still ? undefined : { scale: 0.9 }}
          className={arrow}
        >
          <ChevronRightIcon
            className="size-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </motion.button>
      </div>

      <div
        role="grid"
        aria-labelledby={`${id}-label`}
        className="mt-4"
        onKeyDown={onKey}
      >
        <div role="row" className="grid grid-cols-7">
          {weekdays.map((w) => (
            <span
              key={w.long}
              role="columnheader"
              aria-label={w.long}
              className="grid h-8 place-items-center text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              {w.short}
            </span>
          ))}
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div
              key={label}
              ref={grid}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: GLIDE }}
              onPointerLeave={() => setHovered(null)}
            >
              <LayoutGroup id={`${id}-${label}`}>
                {Array.from({ length: 6 }, (_, w) => (
                  <div key={w} role="row" className="grid grid-cols-7">
                    {days.slice(w * 7, w * 7 + 7).map((d) => {
                      const k = keyOf(d);
                      const inMonth = sameMonth(d, month);
                      const on = sameDay(d, selected);
                      const isToday = sameDay(d, today);
                      const focusable = sameDay(d, focusDay);
                      return (
                        <div
                          key={k}
                          role="gridcell"
                          className="grid h-11 place-items-center"
                        >
                          <motion.button
                            type="button"
                            data-day={k}
                            aria-selected={on}
                            aria-current={isToday ? "date" : undefined}
                            aria-label={`${d.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}${marks.has(k) ? ", has events" : ""}`}
                            tabIndex={focusable ? 0 : -1}
                            onClick={() => pick(d)}
                            onFocus={() => setFocusDay(d)}
                            onPointerEnter={() => setHovered(k)}
                            whileTap={still ? undefined : { scale: 0.9 }}
                            className={cn(
                              "relative grid size-10 cursor-pointer place-items-center rounded-full text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                              !inMonth && "text-zinc-300 dark:text-zinc-600",
                            )}
                          >
                            {hovered === k && !on && (
                              <motion.span
                                layoutId="hover"
                                className="absolute inset-0 rounded-full bg-zinc-100 dark:bg-white/8"
                                transition={still ? { duration: 0 } : DISC}
                              />
                            )}
                            {on && (
                              <motion.span
                                layoutId="selected"
                                className="absolute inset-0 rounded-full bg-[#242423] dark:bg-white"
                                transition={still ? { duration: 0 } : DISC}
                              />
                            )}
                            {isToday && !on && (
                              <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-zinc-300 dark:ring-white/20" />
                            )}
                            <span
                              className={cn(
                                "relative transition-colors duration-200",
                                on &&
                                  "font-medium text-white dark:text-zinc-900",
                              )}
                            >
                              {d.getDate()}
                            </span>
                            {marks.has(k) && (
                              <motion.span
                                className={cn(
                                  "absolute bottom-1 size-1 rounded-full",
                                  on
                                    ? "bg-white dark:bg-zinc-900"
                                    : inMonth
                                      ? "bg-[#242423] dark:bg-white"
                                      : "bg-zinc-300 dark:bg-zinc-600",
                                )}
                                animate={{ y: on && !still ? -1 : 0 }}
                                transition={DISC}
                              />
                            )}
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </LayoutGroup>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});