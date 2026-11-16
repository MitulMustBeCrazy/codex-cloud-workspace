"use client";

/**
 * DeployStreak, from https://motion-brew.com/components/deploy-streak
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
import { animate, AnimatePresence, motion, type MotionValue, useAnimation, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, useVelocity, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

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

// DeployStreak

/**
 * DeployStreak
 *
 * Trigger: in view, then hover. A white card for a team's shipping streak: a
 * title with an animated flame, a big count of days in a row with a deploy
 * and a grid of dots, one per day. When the card scrolls into view the dots
 * pop in as a diagonal wave, days that shipped filling in green, while the
 * count runs up on odometer wheels; today's dot breathes a soft ring.
 * Hovering a dot lifts it and names the day in a small ink tooltip; hovering
 * the card lights the flame. Reduced motion shows the final state at once.
 *
 * Engine: motion/react (a counting motion value, staggered springs for the
 * dots, AnimatePresence for the tooltip) with an animated flame from
 * lucide-animated (MIT), vendored in src/icons.
 */

export interface DeployStreakProps {
  /** Title. Default `"Deploys"`. */
  title?: string;
  /** One entry per day, oldest first; true is a day that shipped. The last day is today. Default 70 days. */
  days?: boolean[];
  /** Days per row. Default `14`. */
  columns?: number;
  /** Colour of days that shipped. Default `"#269a5a"`. */
  color?: string;
  /** Date of the last day, for the tooltips. Default today. */
  today?: Date;
  className?: string;
}

// Ten weeks: a few misses early on, then an unbroken run to today.
const DEFAULT_DAYS: boolean[] = Array.from({ length: 70 }, (_, i) =>
  i < 11 ? ![2, 5, 9].includes(i) : true,
);

const GLIDE = [0.22, 1, 0.36, 1] as const;

// Number rolls, the same as GoalGauge and SpendingMeter: one 0 to 9 column per digit.
const ROLL = {
  type: "spring",
  stiffness: 280,
  damping: 26,
  mass: 0.8,
} as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
// Cap for the odometer's motion blur, in px.
const MAX_BLUR = 0.5;

/**
 * One odometer wheel for a decimal place. The lowest wheel turns continuously;
 * every higher wheel holds still and only ticks over while all the wheels below
 * it read 9, like a mechanical counter. Eleven cells (0 to 9, then 0) let 9
 * roll smoothly into 0.
 */
function Wheel({
  value,
  rate,
  place,
}: {
  value: MotionValue<number>;
  rate: MotionValue<number>;
  place: number;
}) {
  const position = useTransform(value, (a) => {
    const ticks = Math.max(0, a) + 1e-6;
    const whole = Math.floor(ticks);
    const turning = ticks - whole;
    const digit = Math.floor(whole / place) % 10;
    const turn =
      place === 1 ? turning : whole % place === place - 1 ? turning : 0;
    return digit + turn;
  });
  const y = useTransform(position, (p) => `${(-p * 100) / 11}%`);
  // Motion blur from how fast this wheel's digit changes.
  const filter = useTransform(rate, (v) => {
    const px = Math.min(MAX_BLUR, (Math.abs(v) / place) * 0.015);
    return px < 0.1 ? "none" : `blur(${px.toFixed(2)}px)`;
  });
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        style={{ y, filter }}
      >
        {[...DIGITS, 0].map((d, i) => (
          <span key={i} className="flex h-[1em] items-center justify-center">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/**
 * A whole number as an odometer that counts through every value, driven by a
 * motion value. Wheels are added as the number grows, with a separator every
 * three places.
 */
function Odometer({
  value,
  label,
  group = ",",
}: {
  value: MotionValue<number>;
  label: string;
  group?: string;
}) {
  const rate = useVelocity(value);
  const places = (a: number) =>
    Math.max(1, String(Math.floor(Math.max(0, a) + 1e-6)).length);
  const [count, setCount] = React.useState(() => places(value.get()));
  useMotionValueEvent(value, "change", (a) => {
    const n = places(a);
    if (n !== count) setCount(n);
  });
  const cells: React.ReactNode[] = [];
  for (let k = count - 1; k >= 0; k--) {
    cells.push(
      <motion.span
        key={`w${k}`}
        className="inline-flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Wheel value={value} rate={rate} place={10 ** k} />
      </motion.span>,
    );
    if (k > 0 && k % 3 === 0 && group)
      cells.push(<span key={`g${k}`}>{group}</span>);
  }
  return (
    <span aria-label={label} className="inline-flex leading-none tabular-nums">
      {/* An invisible digit gives the row a text baseline, so it lines up with words beside it. */}
      <span aria-hidden className="invisible w-0">
        0
      </span>
      <span aria-hidden className="inline-flex">
        {cells}
      </span>
    </span>
  );
}
const COUNT = [0.5, 1, 0.89, 1] as const;

/** The current run: days that shipped, counted back from today. */
const streakOf = (days: boolean[]) => {
  let n = 0;
  for (let i = days.length - 1; i >= 0 && days[i]; i--) n++;
  return n;
};

export const DeployStreak = React.forwardRef<HTMLDivElement, DeployStreakProps>(
  function DeployStreak(
    {
      title = "Deploys",
      days = DEFAULT_DAYS,
      columns = 14,
      color = "#269a5a",
      today,
      className,
    },
    ref,
  ) {
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const still = !!useReducedMotion();
    const inView = useInView(root, { once: true, amount: 0.4 });
    const shown = inView || still;
    const [hover, setHover] = React.useState<number | null>(null);
    const [cardHover, setCardHover] = React.useState(false);

    const streak = streakOf(days);
    const count = useMotionValue(still ? streak : 0);
    React.useEffect(() => {
      if (!shown || still) return;
      const c = animate(count, streak, {
        duration: 1.3,
        delay: 0.2,
        ease: COUNT,
      });
      return () => c.stop();
    }, [shown, still, streak, count]);

    const end = today ?? new Date();
    const fmt = React.useMemo(
      () =>
        new Intl.DateTimeFormat("en", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      [],
    );
    const dateOf = (i: number) => {
      const d = new Date(end);
      d.setDate(d.getDate() - (days.length - 1 - i));
      return fmt.format(d);
    };

    return (
      <motion.div
        ref={root}
        onPointerEnter={() => setCardHover(true)}
        onPointerLeave={() => {
          setCardHover(false);
          setHover(null);
        }}
        initial={still ? false : { opacity: 0, y: 16 }}
        animate={shown ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: GLIDE }}
        className={cn(
          "w-[340px] max-w-full rounded-3xl bg-white p-6 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-[#242423]/[0.06] dark:bg-white/[0.08]">
            <FlameIcon className="size-4" active={cardHover} />
          </span>
          <p className="text-base font-semibold tracking-tight">{title}</p>
        </div>

        <div className="mt-6 flex items-end gap-2">
          <span className="text-[48px] font-semibold leading-[0.85] tracking-tight tabular-nums">
            <Odometer value={count} label={`${streak}`} />
          </span>
          <span className="pb-0.5 text-sm leading-tight text-zinc-500 dark:text-zinc-400">
            days
            <br />
            in a row
          </span>
        </div>

        {/* One dot per day; done days fill in a diagonal wave. */}
        <div
          role="img"
          aria-label={`Shipped ${streak} days in a row. ${days.filter(Boolean).length} of the last ${days.length} days had a deploy.`}
          className="relative mt-5 grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {days.map((done, i) => {
            const r = Math.floor(i / columns);
            const c = i % columns;
            const isToday = i === days.length - 1;
            const on = hover === i;
            return (
              <span
                key={i}
                className="relative grid aspect-square place-items-center"
                onPointerEnter={() => setHover(i)}
              >
                {isToday && !still && shown && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: `0 0 0 2px ${color}` }}
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: 1.4,
                    }}
                  />
                )}
                {/* Absolute, not size-full: Safari gives a percentage height
                    inside an aspect-ratio grid cell no height at all. */}
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundColor: done ? color : "rgba(36,36,35,0.08)",
                  }}
                  initial={still ? false : { scale: 0, opacity: 0 }}
                  animate={
                    shown
                      ? {
                          scale: on ? 1.35 : 1,
                          opacity: done ? 1 : 1,
                          y: on ? -2 : 0,
                        }
                      : undefined
                  }
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 20,
                    delay:
                      on || hover !== null
                        ? 0
                        : still
                          ? 0
                          : 0.15 + (r + c) * 0.025,
                  }}
                />
                <AnimatePresence>
                  {on && (
                    <motion.span
                      initial={{ opacity: 0, y: 4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 2, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className={cn(
                        "pointer-events-none absolute bottom-full z-10 mb-2 inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#242423] px-2.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-[#242423]",
                        c < 3
                          ? "left-0"
                          : c > columns - 4
                            ? "right-0"
                            : "left-1/2 -translate-x-1/2",
                      )}
                    >
                      <span
                        className="size-1.5 rounded-full"
                        style={{
                          backgroundColor: done
                            ? color
                            : "rgba(255,255,255,0.4)",
                        }}
                      />
                      {isToday ? "Today" : dateOf(i)}
                      <span className="text-white/60 dark:text-[#242423]/60">
                        {done ? "Shipped" : "No deploy"}
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            );
          })}
        </div>
      </motion.div>
    );
  },
);