"use client";

/**
 * GoalGauge, from https://motion-brew.com/components/goal-gauge
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

// GoalGauge

/**
 * GoalGauge
 *
 * Trigger: in view, then hover. A half-ring meter for progress toward a goal.
 * When the card scrolls into view the arc sweeps up to the value while the
 * amount counts up from zero on odometer wheels, driven by the same motion value. Hovering the arc
 * (or focusing the meter) shows the percent and what is left in a tooltip at
 * the arc's end. New values glide from the old one, and reaching the goal
 * swaps the caption for "Goal reached". Reduced motion shows the final state
 * at once.
 *
 * Engine: motion/react (animate on a motion value, pathLength for the arc,
 * transforms for the tooltip, AnimatePresence for the swaps).
 */

// Arc geometry in SVG units: a half circle, open at the bottom.
const W = 280;
const R = 120;
const STROKE = 10;
const CX = W / 2;
const CY = R + STROKE / 2 + 6;
const H = CY + STROKE / 2 + 2;
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

const GLIDE = [0.22, 1, 0.36, 1] as const;
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

/** Point on the arc at progress p (0 is the left end, 1 the right). */
function pointAt(p: number) {
  const angle = Math.PI * (1 - p);
  return { x: CX + R * Math.cos(angle), y: CY - R * Math.sin(angle) };
}

/** Arc path between two progress fractions, drawn left to right. */
function arcBetween(from: number, to: number) {
  const a = pointAt(from);
  const b = pointAt(to);
  return `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`;
}

// Gap between segments, as a fraction of the arc: room for both round caps plus 3 units.
const GAP = (STROKE + 3) / (Math.PI * R);
// Validated categorical order (dataviz checks pass on light and dark cards). Fixed, never cycled.
const PALETTE = ["#2a9fbf", "#3d66d6", "#d6498f", "#9150e0", "#269a5a"] as const;

export interface GaugeSegment {
  label: string;
  value: number;
  /** Segment color. Defaults to the next color in the built-in palette. */
  color?: string;
}

const DEFAULT_SEGMENTS: GaugeSegment[] = [
  { label: "Salary", value: 520 },
  { label: "Freelance", value: 280 },
  { label: "Side shop", value: 140 },
  { label: "Gifts", value: 70 },
  { label: "Interest", value: 42.98 },
];

/** Up to five colored segments; anything past that folds into "Other". */
function normalize(segments: GaugeSegment[]) {
  const head = segments.slice(0, PALETTE.length - 1);
  const tail = segments.slice(PALETTE.length - 1);
  const folded = tail.length > 1 ? [{ label: "Other", value: tail.reduce((sum, t) => sum + t.value, 0) }] : tail;
  return [...head, ...folded].map((seg, i) => ({ ...seg, color: seg.color ?? PALETTE[i]! }));
}

/** One colored segment that fills in as the sweep passes over it. */
function Segment({
  progress,
  from,
  to,
  color,
  dim,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  color: string;
  dim: boolean;
}) {
  const span = Math.max(1e-6, to - from);
  const length = useTransform(progress, (p) => Math.min(1, Math.max(0, (p - from) / span)));
  // Hide until the sweep reaches it, or the round cap would show as a dot.
  const opacity = useTransform(length, (l) => (l > 0.001 ? 1 : 0));
  return (
    <motion.g animate={{ opacity: dim ? 0.28 : 1 }} transition={{ duration: 0.25, ease: GLIDE }}>
      <motion.path
        d={arcBetween(from, to)}
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        style={{ pathLength: length, opacity }}
      />
    </motion.g>
  );
}

export interface GoalGaugeProps {
  /** Breakdown of the amount saved. The total is their sum. Default five sources. */
  segments?: GaugeSegment[];
  /** A single amount, used when `segments` is not set. */
  value?: number;
  /** Color for the single-amount arc. */
  color?: string;
  /** Target amount. Default `1200`. */
  goal?: number;
  /** Card title. Default `"Saving goal"`. */
  title?: React.ReactNode;
  /** Line under the title. Default `"1 to 12 Apr, 2026"`. */
  subtitle?: React.ReactNode;
  /** Currency for the amounts (ISO code). Default `"USD"`. */
  currency?: string;
  /** Locale for number formatting. Default `"en-US"`. */
  locale?: string;
  /** Length of the sweep, in seconds. Default `1.4`. */
  duration?: number;
  /** Label for the header button. Pass `null` to hide it. Default `"View report"`. */
  actionLabel?: React.ReactNode;
  /** Called when the header button is pressed. */
  onAction?: () => void;
  className?: string;
}

export const GoalGauge = React.forwardRef<HTMLDivElement, GoalGaugeProps>(function GoalGauge(
  {
    segments,
    value,
    color = "#269a5a",
    goal = 1200,
    title = "Saving goal",
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
  // Hovered or focused segment; "rest" is the gray remainder.
  const [active, setActive] = React.useState<number | "rest" | null>(null);

  const money = React.useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 }),
    [locale, currency],
  );
  const whole = React.useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }),
    [locale, currency],
  );

  const segs = React.useMemo(
    () =>
      segments
        ? normalize(segments)
        : value !== undefined
          ? [{ label: typeof title === "string" ? title : "Saved", value, color }]
          : normalize(DEFAULT_SEGMENTS),
    [segments, value, color, title],
  );
  const total = segs.reduce((sum, seg) => sum + seg.value, 0);
  const remaining = Math.max(0, goal - total);
  const done = total >= goal;

  // Arc ranges: segments sit back to back with a small gap between them.
  const ranges = React.useMemo(() => {
    let cursor = 0;
    return segs.map((seg, i) => {
      const start = Math.min(1, cursor / goal);
      cursor += seg.value;
      const end = Math.min(1, cursor / goal);
      return {
        from: start + (i > 0 ? GAP / 2 : 0),
        to: Math.max(start + (i > 0 ? GAP / 2 : 0), end - (i < segs.length - 1 || end < 1 ? GAP / 2 : 0)),
        hitFrom: start,
        hitTo: end,
      };
    });
  }, [segs, goal]);

  // `amount` sweeps the arc. `shown` is what the odometer reads: the running total, or the hovered part.
  const amount = useMotionValue(0);
  const shown = useMotionValue(0);
  const progress = useTransform(amount, (a) => Math.min(1, Math.max(0, a / goal)));
  // The gray track is drawn from the right end and shrinks back as the color arrives.
  const trackLength = useTransform(progress, (p) => Math.max(0, 1 - Math.min(1, p + GAP / 2)));
  useMotionValueEvent(amount, "change", (a) => {
    if (active === null) shown.set(a);
  });

  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      amount.set(total);
      shown.set(total);
      return;
    }
    const controls = animate(amount, total, { duration, ease: GLIDE });
    return () => controls.stop();
  }, [inView, total, duration, reduceMotion, amount, shown]);

  // Roll the odometer to the hovered part, and back to the total on leave.
  React.useEffect(() => {
    const target = active === null ? amount.get() : active === "rest" ? remaining : segs[active]!.value;
    if (reduceMotion) {
      shown.set(target);
      return;
    }
    const controls = animate(shown, target, { duration: 0.6, ease: GLIDE });
    return () => controls.stop();
  }, [active, remaining, segs, amount, shown, reduceMotion]);

  const step = (dir: 1 | -1) =>
    setActive((cur) => {
      const order: (number | "rest")[] = [...segs.map((_, i) => i), ...(remaining > 0 ? ["rest" as const] : [])];
      const at = cur === null ? (dir === 1 ? -1 : order.length) : order.indexOf(cur);
      return order[(at + dir + order.length) % order.length]!;
    });

  const caption =
    active === "rest"
      ? { dot: undefined, text: `To go · ${Math.round((remaining / goal) * 100)}% of goal` }
      : active !== null
        ? {
            dot: segs[active]!.color,
            text: `${segs[active]!.label} · ${Math.round((segs[active]!.value / total) * 100)}%`,
          }
        : null;

  return (
    <div
      ref={root}
      className={cn(
        "w-[340px] max-w-full rounded-3xl bg-white px-6 pb-5 pt-6 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
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
        aria-label={typeof title === "string" ? title : "Goal progress"}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={total}
        aria-valuetext={`${money.format(total)} of ${whole.format(goal)}: ${segs
          .map((seg) => `${seg.label} ${money.format(seg.value)}`)
          .join(", ")}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), step(1));
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), step(-1));
          if (e.key === "Escape") setActive(null);
        }}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        className="relative mt-[52px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full overflow-visible" aria-hidden>
          {/* Track: light gray, drawn from the right end so it only fills what is left. */}
          <motion.path
            d={arcBetween(1, 1)}
            fill="none"
            className="stroke-zinc-100 dark:stroke-zinc-800/60"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <motion.path
            d={`M ${pointAt(1).x} ${pointAt(1).y} A ${R} ${R} 0 0 0 ${pointAt(0).x} ${pointAt(0).y}`}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            className="stroke-zinc-100 dark:stroke-zinc-800/60"
            animate={{ opacity: active === null || active === "rest" ? 1 : 0.5 }}
            style={{ pathLength: trackLength }}
          />
          {segs.map((seg, i) => (
            <Segment
              key={seg.label}
              progress={progress}
              from={ranges[i]!.from}
              to={ranges[i]!.to}
              color={seg.color}
              dim={active !== null && active !== i}
            />
          ))}
          {/* Hit targets: wider than the marks, and they cover the gaps too. */}
          {segs.map((seg, i) => (
            <path
              key={`hit-${seg.label}`}
              d={arcBetween(ranges[i]!.hitFrom, ranges[i]!.hitTo)}
              fill="none"
              stroke="transparent"
              strokeWidth={STROKE + 26}
              pointerEvents="stroke"
              onPointerEnter={() => setActive(i)}
            />
          ))}
          {remaining > 0 && (
            <path
              d={arcBetween(Math.min(1, total / goal), 1)}
              fill="none"
              stroke="transparent"
              strokeWidth={STROKE + 26}
              pointerEvents="stroke"
              onPointerEnter={() => setActive("rest")}
            />
          )}
        </svg>

        {/* Center: the total, or the hovered part, on the same odometer. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center">
          <p className="text-[24px] font-medium tracking-tight">
            <Odometer amount={shown} format={money} label={money.format(total)} />
          </p>
          <div className="mt-1.5 grid h-5 text-sm text-zinc-500 dark:text-zinc-400">
            <AnimatePresence initial={false} mode="popLayout">
              {caption ? (
                <motion.span
                  key={caption.text}
                  {...POP}
                  className="col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5"
                >
                  {caption.dot && <span className="size-2 rounded-full" style={{ background: caption.dot }} />}
                  {caption.text}
                </motion.span>
              ) : done ? (
                <motion.span
                  key="done"
                  {...POP}
                  className="col-start-1 row-start-1 font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Goal reached
                </motion.span>
              ) : (
                <motion.span key="of" {...POP} className="col-start-1 row-start-1">
                  of <Rolling text={whole.format(goal)} still={!!reduceMotion} />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
});