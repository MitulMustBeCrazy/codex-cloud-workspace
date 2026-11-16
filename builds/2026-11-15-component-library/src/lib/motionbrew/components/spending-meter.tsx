"use client";

/**
 * SpendingMeter, from https://motion-brew.com/components/spending-meter
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

// Animated icon: arrow-up-right
const ArrowUpRightIcon = (() => {
interface ArrowUpRightIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowUpRightIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const ARROW_VARIANTS: Variants = {
  normal: {
    scale: 1,
    translateX: 0,
    translateY: 0,
  },
  animate: {
    scale: [1, 0.85, 1],
    translateX: [0, -4, 0],
    translateY: [0, 4, 0],
    originX: 1,
    originY: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const ArrowUpRightIcon = forwardRef<
  ArrowUpRightIconHandle,
  ArrowUpRightIconProps
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
      if (!isControlledRef.current) controls.start("animate");
      onMouseEnter?.(e);
    },
    [controls, onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!isControlledRef.current) controls.start("normal");
      onMouseLeave?.(e);
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
        <motion.g animate={controls} variants={ARROW_VARIANTS}>
          <path d="M7 7H17" />
          <path d="M17 7V17" />
          <path d="M7 17L17 7" />
        </motion.g>
      </svg>
    </span>
  );
});

ArrowUpRightIcon.displayName = "ArrowUpRightIcon";
  return ArrowUpRightIcon;
})();

// SpendingMeter

/**
 * SpendingMeter
 *
 * Trigger: in view, then hover. A spending card with a segmented bar. When it
 * scrolls into view the pills fill one after another while the amount counts
 * up from zero on odometer wheels with a light motion blur, all from one motion
 * value. Each pill is an equal slice of the limit: hovering one dims
 * the rest and rolls the number to what was spent in that slice, like the
 * GoalGauge segments; arrow keys step through them and leaving rolls it back. Reaching the limit swaps the caption.
 * Reduced motion shows the final state at once.
 *
 * Engine: motion/react (animate on a motion value, translate-only pill fills,
 * odometer wheels, AnimatePresence for the caption).
 */

const GLIDE = [0.22, 1, 0.36, 1] as const;
// The fill and count share this gentler ease-out. A steep one (like GLIDE) spends its last
// third creeping through the final few dollars: the bar looks done ~0.4s before the number.
const FILL = [0.5, 1, 0.89, 1] as const;
// Same odometer roll as RollingStepper: one 0 to 9 column per digit, sprung into place.
const ROLL = { type: "spring", stiffness: 280, damping: 26, mass: 0.8 } as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
// Cap for the odometer's motion blur, in px.
const MAX_BLUR = 0.5;

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

/** A formatted number whose digits roll like an odometer. Separators and symbols stay put. */
function Rolling({ text, still }: { text: string; still: boolean }) {
  const chars = Array.from(text);
  return (
    <span aria-label={text} className="inline-flex leading-none tabular-nums">
      {chars.map((ch, i) => {
        // Key from the right so a column keeps its identity as the number grows.
        const key = chars.length - i;
        return /\d/.test(ch) ? (
          <Digit key={key} digit={Number(ch)} still={still} />
        ) : (
          <span key={`${key}-${ch}`} aria-hidden className="inline-block h-[1em]">
            {ch}
          </span>
        );
      })}
    </span>
  );
}

/**
 * One odometer wheel for a decimal place. The lowest wheel turns continuously;
 * every higher wheel holds still and only ticks over while all the wheels below
 * it read 9 and the lowest is turning, like a mechanical counter. Eleven cells (0 to 9, then 0)
 * let 9 roll smoothly into 0.
 */
function Wheel({
  amount,
  rate,
  place,
  unit,
}: {
  amount: MotionValue<number>;
  rate: MotionValue<number>;
  place: number;
  unit: number;
}) {
  // Wheel position in digits (2.5 means halfway from 2 to 3).
  const position = useTransform(amount, (a) => {
    // Count in units of the lowest wheel to keep the math exact.
    const ticks = Math.max(0, a) / unit + 1e-6;
    const whole = Math.floor(ticks);
    const turning = ticks - whole; // how far the lowest wheel is into its next step
    const span = Math.round(place / unit); // lowest-wheel steps per step of this wheel
    const digit = Math.floor(whole / span) % 10;
    // Roll toward the next digit only while every wheel below reads 9 and the lowest is turning.
    const turn = span === 1 ? turning : whole % span === span - 1 ? turning : 0;
    return digit + turn;
  });
  const y = useTransform(position, (p) => `${(-p * 100) / 11}%`);
  // Motion blur from how fast this wheel's digit changes: the amount's rate over its place value.
  // (Reading the wheel's own position would wrap at 9 to 0 and misjudge fast wheels.)
  const filter = useTransform(rate, (v) => {
    const px = Math.min(MAX_BLUR, (Math.abs(v) / place) * 0.015);
    return px < 0.1 ? "none" : `blur(${px.toFixed(2)}px)`;
  });
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
      <motion.span className="absolute inset-x-0 top-0 flex flex-col" style={{ y, filter }}>
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
 * The amount as an odometer that counts up through every value from zero,
 * driven by the same motion value as the arc. Whole-number wheels are added as
 * the number grows, so it starts at 0.00 rather than a row of zeros.
 */
function Odometer({
  amount,
  format,
  label,
}: {
  amount: MotionValue<number>;
  format: Intl.NumberFormat;
  label: string;
}) {
  const parts = React.useMemo(() => format.formatToParts(1234.5), [format]);
  const before = parts
    .slice(
      0,
      parts.findIndex((p) => p.type === "integer"),
    )
    .map((p) => p.value)
    .join("");
  const lastNum = parts.map((p) => p.type).lastIndexOf("fraction");
  const after = parts
    .slice(lastNum + 1)
    .map((p) => p.value)
    .join("");
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const fractionDigits = parts.find((p) => p.type === "fraction")?.value.length ?? 2;

  const rate = useVelocity(amount);
  const wholeDigits = (a: number) => Math.max(1, String(Math.floor(Math.max(0, a) + 1e-6)).length);
  const [count, setCount] = React.useState(() => wholeDigits(amount.get()));
  useMotionValueEvent(amount, "change", (a) => {
    const next = wholeDigits(a);
    if (next !== count) setCount(next);
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
        <Wheel amount={amount} rate={rate} place={10 ** k} unit={10 ** -fractionDigits} />
      </motion.span>,
    );
    if (k > 0 && k % 3 === 0) cells.push(<span key={`g${k}`}>{group}</span>);
  }
  cells.push(<span key="dec">{decimal}</span>);
  for (let f = 1; f <= fractionDigits; f++) {
    cells.push(<Wheel key={`f${f}`} amount={amount} rate={rate} place={10 ** -f} unit={10 ** -fractionDigits} />);
  }

  return (
    <span aria-label={label} className="inline-flex leading-none tabular-nums">
      <span aria-hidden className="inline-flex">
        {before}
        {cells}
        {after}
      </span>
    </span>
  );
}

const POP = {
  initial: { opacity: 0, y: 6, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 4, scale: 0.98 },
  transition: { duration: 0.25, ease: GLIDE },
} as const;

/** One pill. Its fill is a rounded bar slid in from the left, so the tip stays round at any amount. */
function Pill({
  progress,
  index,
  count,
  color,
  dim,
  onEnter,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  color: string;
  dim: boolean;
  onEnter: () => void;
}) {
  const fill = useTransform(progress, (p) => Math.min(1, Math.max(0, p * count - index)));
  const x = useTransform(fill, (f) => `${(f - 1) * 100}%`);
  // Hidden until the fill reaches this pill; otherwise its anti-aliased edge peeks in.
  const opacity = useTransform(fill, (f) => (f > 0.002 ? 1 : 0));
  return (
    // The padded wrapper is the hit target, taller than the 8px pill.
    <span className="flex flex-1 py-3" onPointerEnter={onEnter}>
      <motion.span
        className="relative h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800/60"
        animate={{ opacity: dim ? 0.28 : 1 }}
        transition={{ duration: 0.25, ease: GLIDE }}
      >
        <motion.span className="absolute inset-0 rounded-full" style={{ x, opacity, background: color }} />
      </motion.span>
    </span>
  );
}

export interface SpendingMeterProps {
  /** Amount spent so far. Default `1010`. */
  value?: number;
  /** Spending limit. Default `1800`. */
  limit?: number;
  /** Number of pills in the bar. Default `6`. */
  pills?: number;
  /** Fill color. Default `"#ff8f0f"`. */
  color?: string;
  /** Card title. Default `"Spending limit"`. */
  title?: React.ReactNode;
  /** Line under the title. Default `"1 to 12 Apr, 2026"`. */
  subtitle?: React.ReactNode;
  /** Currency for the amounts (ISO code). Default `"USD"`. */
  currency?: string;
  /** Locale for number formatting. Default `"en-US"`. */
  locale?: string;
  /** Length of the fill, in seconds. Default `1.4`. */
  duration?: number;
  /** Label for the header button. Pass `null` to hide it. Default `"View report"`. */
  actionLabel?: React.ReactNode;
  /** Called when the header button is pressed. */
  onAction?: () => void;
  className?: string;
}

export const SpendingMeter = React.forwardRef<HTMLDivElement, SpendingMeterProps>(function SpendingMeter(
  {
    value = 1010,
    limit = 1800,
    pills = 6,
    color = "#ff8f0f",
    title = "Spending limit",
    subtitle = "1 to 12 Apr, 2026",
    currency = "USD",
    locale = "en-US",
    duration = 1.4,
    actionLabel = "View report",
    onAction,
    className,
  },
  forwardedRef,
) {
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement);
  const inView = useInView(root, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();
  // Hovered or focused pill.
  const [active, setActive] = React.useState<number | null>(null);

  const money = React.useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 }),
    [locale, currency],
  );
  const whole = React.useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }),
    [locale, currency],
  );

  const left = Math.max(0, limit - value);
  const reached = value >= limit;
  // Each pill is an equal slice of the limit.
  const step = limit / pills;
  const spentIn = (i: number) => Math.min(step, Math.max(0, value - i * step));

  // `amount` fills the bar. `shown` is what the odometer reads: the total spend, or the hovered pill's share.
  const amount = useMotionValue(0);
  const shown = useMotionValue(0);
  const progress = useTransform(amount, (a) => Math.min(1, Math.max(0, a / limit)));
  useMotionValueEvent(amount, "change", (a) => {
    if (active === null) shown.set(a);
  });

  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      amount.set(value);
      shown.set(value);
      return;
    }
    const controls = animate(amount, value, { duration, ease: FILL });
    return () => controls.stop();
  }, [inView, value, duration, reduceMotion, amount, shown]);

  React.useEffect(() => {
    const target = active === null ? amount.get() : spentIn(active);
    if (reduceMotion) {
      shown.set(target);
      return;
    }
    const controls = animate(shown, target, { duration: 0.6, ease: GLIDE });
    return () => controls.stop();
  }, [active, amount, shown, reduceMotion]);

  return (
    <div
      ref={root}
      className={cn(
        "w-[340px] max-w-full rounded-3xl bg-white px-6 pb-7 pt-6 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
        {actionLabel !== null && (
          <motion.button
            type="button"
            onClick={onAction}
            initial="rest"
            whileHover="hover"
            whileTap="press"
            variants={{ rest: { scale: 1 }, hover: { scale: 1 }, press: { scale: 0.96 } }}
            transition={{ duration: 0.15, ease: GLIDE }}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-[#242423]/6 px-3.5 py-1.5 text-sm font-medium text-[#242423] transition-colors hover:bg-[#242423]/10 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/8 dark:text-zinc-100 dark:hover:bg-white/12"
          >
            {actionLabel}
            <motion.span
              variants={{ rest: { x: 0, y: 0, opacity: 1 }, hover: { x: 2, y: -2, opacity: 1 } }}
              transition={{ duration: 0.25, ease: GLIDE }}
              className="flex"
            >
              <ArrowUpRightIcon className="size-3.5" strokeWidth={2.5} />
            </motion.span>
          </motion.button>
        )}
      </header>

      <div
        role="meter"
        tabIndex={0}
        aria-label={typeof title === "string" ? title : "Spending"}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={value}
        aria-valuetext={`${money.format(value)} spent of ${whole.format(limit)}, ${money.format(left)} left`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown")
            (e.preventDefault(), setActive((c) => (c === null ? 0 : (c + 1) % pills)));
          if (e.key === "ArrowLeft" || e.key === "ArrowUp")
            (e.preventDefault(), setActive((c) => (c === null ? pills - 1 : (c - 1 + pills) % pills)));
          if (e.key === "Escape") setActive(null);
        }}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        className="mt-10 -mx-2 rounded-2xl px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      >
        <div className="flex items-baseline gap-2">
          <p className="text-[32px] font-medium tracking-tight">
            <Odometer amount={shown} format={money} label={money.format(value)} />
          </p>
          <div className="grid text-base text-zinc-500 dark:text-zinc-400">
            <AnimatePresence initial={false} mode="popLayout">
              {active !== null ? (
                <motion.span
                  key={`pill-${active}`}
                  {...POP}
                  className="col-start-1 row-start-1 inline-flex items-center gap-1.5 whitespace-nowrap text-sm"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: spentIn(active) > 0 ? color : "var(--color-zinc-300, #d4d4d8)" }}
                  />
                  {Math.round((spentIn(active) / step) * 100)}% used
                </motion.span>
              ) : reached ? (
                <motion.span
                  key="reached"
                  {...POP}
                  className="col-start-1 row-start-1 whitespace-nowrap font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Limit reached
                </motion.span>
              ) : (
                <motion.span key="of" {...POP} className="col-start-1 row-start-1 whitespace-nowrap">
                  of <Rolling text={whole.format(limit)} still={!!reduceMotion} />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div aria-hidden className="mt-2 flex gap-1.5">
          {Array.from({ length: pills }, (_, i) => (
            <Pill
              key={i}
              progress={progress}
              index={i}
              count={pills}
              color={color}
              dim={active !== null && active !== i}
              onEnter={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});