"use client";

/**
 * MetricSplit, from https://motion-brew.com/components/metric-split
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

// MetricSplit

/**
 * MetricSplit
 *
 * Trigger: in view, then hover and press. A card that splits a total across
 * three metrics: one rounded bar of proportional segments (solid, light,
 * striped) with each metric's dot, label and odometer number under its segment.
 * When it scrolls into view the segments slide in one after another while the
 * numbers count up from zero. Switching period rolls the numbers to the new values while the
 * columns glide to their new widths. Hovering or focusing a column dims the
 * others and swaps its label for its share. Reduced motion shows final states.
 *
 * Engine: motion/react (motion values for counts and widths, odometer wheels,
 * a layoutId pill for the period switch, AnimatePresence for the labels).
 */

const GLIDE = [0.22, 1, 0.36, 1] as const;
// Count and width changes share this gentler ease-out so the bars and numbers settle together.
const FILL = [0.5, 1, 0.89, 1] as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
// Cap for the odometer's motion blur, in px.
const MAX_BLUR = 0.5;
// Floor on a column's share so tiny values still get some width; min-w on the column keeps labels readable.
const MIN_SHARE = 0.15;

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
  // End of the number is its last numeric part (whole numbers have no fraction part).
  const numeric = ["integer", "group", "decimal", "fraction"];
  const lastNum = parts.reduce((last, p, i) => (numeric.includes(p.type) ? i : last), -1);
  const after = parts
    .slice(lastNum + 1)
    .map((p) => p.value)
    .join("");
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const fractionDigits = parts.find((p) => p.type === "fraction")?.value.length ?? 0;

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
  if (fractionDigits > 0) cells.push(<span key="dec">{decimal}</span>);
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
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.25, ease: GLIDE },
} as const;

export interface MetricSplitPeriod {
  /** Label on the period switch, e.g. "Week". */
  label: string;
  /** One value per metric, in the same order as `metrics`. */
  values: number[];
}

export interface MetricSplitProps {
  /** Metric names, left to right. Default visits, page views, downloads. */
  metrics?: string[];
  /** Periods on the switch, each with a value per metric. Default week, month, year. */
  periods?: MetricSplitPeriod[];
  /** Period shown first, by label. Default the first one. */
  defaultPeriod?: string;
  /** Base color: solid for the first column, lighter for the second, striped for the third. Default `"#8b5cf6"`. */
  color?: string;
  /** Card title. Default `"Site activity"`. */
  title?: React.ReactNode;
  /** Line under the title. Default `"How people find and use your page"`. */
  subtitle?: React.ReactNode;
  /** Length of the count-up and width glide, in seconds. Default `1.4`. */
  duration?: number;
  /** Locale for number formatting. Default `"en-US"`. */
  locale?: string;
  /** Accessible label for the round header button. Default `"View report"`. */
  actionLabel?: React.ReactNode;
  /** Called when the header button is pressed. Leave out to hide it. */
  onAction?: () => void;
  className?: string;
}

const DEFAULT_METRICS = ["Total visits", "Page views", "Downloads"];
const DEFAULT_PERIODS: MetricSplitPeriod[] = [
  { label: "Week", values: [124, 87, 10] },
  { label: "Month", values: [690, 240, 61] },
  { label: "Year", values: [5200, 4100, 1300] },
];

/** Bar fill per column: solid, light, then striped so the third never relies on shade alone. */
function barStyle(index: number, color: string): React.CSSProperties {
  if (index === 0) return { background: color };
  if (index === 1) return { background: color, opacity: 0.45 };
  return {
    backgroundImage: `repeating-linear-gradient(120deg, ${color} 0 2px, transparent 2px 5px)`,
    opacity: 0.6,
  };
}

/** Legend dot matching the column's bar. */
function dotStyle(index: number, color: string): React.CSSProperties {
  if (index === 0) return { background: color };
  if (index === 1) return { background: color, opacity: 0.45 };
  return { boxShadow: `inset 0 0 0 1.5px ${color}`, opacity: 0.7 };
}

function Column({
  index,
  label,
  count,
  share,
  total,
  color,
  format,
  shown,
  dim,
  active,
  inView,
  still,
  onActive,
}: {
  index: number;
  label: string;
  count: MotionValue<number>;
  share: MotionValue<number>;
  total: number;
  color: string;
  format: Intl.NumberFormat;
  shown: number;
  dim: boolean;
  active: boolean;
  inView: boolean;
  still: boolean;
  onActive: (on: boolean) => void;
}) {
  // Width share eases with the counts; flex-grow on three columns is a cheap reflow.
  const grow = useTransform(share, (s) => Math.max(MIN_SHARE, s));
  const percent = total > 0 ? Math.round((shown / total) * 100) : 0;
  return (
    <motion.div
      tabIndex={0}
      aria-label={`${format.format(shown)} ${label}, ${percent}% of total`}
      onPointerEnter={() => onActive(true)}
      onPointerLeave={() => onActive(false)}
      onFocus={() => onActive(true)}
      onBlur={() => onActive(false)}
      style={{ flexGrow: grow, flexBasis: 0 }}
      animate={{ opacity: dim ? 0.28 : 1 }}
      transition={{ duration: 0.25, ease: GLIDE }}
      className="flex min-w-[92px] flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4"
    >
      {/* Segment of the shared bar: a rounded fill slides in from the left. */}
      <span aria-hidden className="relative h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800/60">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={barStyle(index, color)}
          initial={{ x: "-101%" }}
          animate={{ x: inView ? "0%" : "-101%" }}
          transition={still ? { duration: 0 } : { duration: 0.8, ease: GLIDE, delay: 0.1 + index * 0.12 }}
        />
      </span>
      <div className="mt-4 grid text-[12px] text-zinc-500 dark:text-zinc-400">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={active ? "share" : "label"}
            {...POP}
            className="col-start-1 row-start-1 inline-flex min-w-0 items-center gap-1.5"
          >
            <span className="size-2 shrink-0 rounded-full" style={dotStyle(index, color)} />
            <span className="truncate">{active ? `${percent}% of total` : label}</span>
          </motion.span>
        </AnimatePresence>
      </div>
      <p className="mt-1 text-[22px] font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
        <Odometer amount={count} format={format} label={format.format(shown)} />
      </p>
    </motion.div>
  );
}

export const MetricSplit = React.forwardRef<HTMLDivElement, MetricSplitProps>(function MetricSplit(
  {
    metrics = DEFAULT_METRICS,
    periods = DEFAULT_PERIODS,
    defaultPeriod,
    color = "#8b5cf6",
    title = "Site activity",
    subtitle = "How people find and use your page",
    duration = 1.4,
    locale = "en-US",
    actionLabel = "View report",
    onAction,
    className,
  },
  forwardedRef,
) {
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement);
  const inView = useInView(root, { once: true, amount: 0.4 });
  const reduceMotion = !!useReducedMotion();
  const pillId = React.useId();
  const [period, setPeriod] = React.useState(defaultPeriod ?? periods[0]?.label ?? "");
  const [active, setActive] = React.useState<number | null>(null);
  const format = React.useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

  const values = periods.find((p) => p.label === period)?.values ?? periods[0]?.values ?? [];
  const total = values.reduce((sum, v) => sum + v, 0);

  // One count and one width share per column; all ease together on the same curve.
  const c0 = useMotionValue(0);
  const c1 = useMotionValue(0);
  const c2 = useMotionValue(0);
  const s0 = useMotionValue(1 / 3);
  const s1 = useMotionValue(1 / 3);
  const s2 = useMotionValue(1 / 3);
  const counts = [c0, c1, c2];
  const shares = [s0, s1, s2];

  React.useEffect(() => {
    if (!inView) return;
    const runs = [0, 1, 2].flatMap((i) => {
      const v = values[i] ?? 0;
      const sh = total > 0 ? v / total : 1 / 3;
      if (reduceMotion) {
        counts[i]!.set(v);
        shares[i]!.set(sh);
        return [];
      }
      return [
        animate(counts[i]!, v, { duration, ease: FILL }),
        animate(shares[i]!, sh, { duration: duration * 0.8, ease: FILL }),
      ];
    });
    return () => runs.forEach((r) => r.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, period, total, duration, reduceMotion]);

  return (
    <div
      ref={root}
      className={cn(
        "w-[420px] max-w-full rounded-3xl bg-white px-5 pb-5 pt-6 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 px-1">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
        {onAction && (
          <motion.button
            type="button"
            onClick={onAction}
            aria-label={typeof actionLabel === "string" ? actionLabel : "View report"}
            initial="rest"
            whileHover="hover"
            whileTap="press"
            variants={{ rest: { scale: 1 }, hover: { scale: 1 }, press: { scale: 0.94 } }}
            transition={{ duration: 0.15, ease: GLIDE }}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-[#242423]/6 text-[#242423] transition-colors hover:bg-[#242423]/10 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/8 dark:text-zinc-100 dark:hover:bg-white/12"
          >
            <motion.span
              variants={{ rest: { x: 0, y: 0, opacity: 1 }, hover: { x: 2, y: -2, opacity: 1 } }}
              transition={{ duration: 0.25, ease: GLIDE }}
              className="flex"
            >
              <ArrowUpRightIcon className="size-4" strokeWidth={2.5} />
            </motion.span>
          </motion.button>
        )}
      </header>

      {/* Period switch: a compact pill group; a white pill slides between options. */}
      <div
        role="radiogroup"
        aria-label="Period"
        className="mt-4 inline-flex rounded-full bg-[#242423]/6 p-0.5 dark:bg-white/8"
      >
        {periods.map((p) => (
          <button
            key={p.label}
            type="button"
            role="radio"
            aria-checked={period === p.label}
            onClick={() => setPeriod(p.label)}
            className="relative cursor-pointer rounded-full px-3 py-1 text-[12px] font-medium text-zinc-500 outline-none transition-colors hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-400 aria-checked:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 dark:aria-checked:text-zinc-100"
          >
            {period === p.label && (
              <motion.span
                layoutId={`${pillId}-pill`}
                transition={{ duration: 0.35, ease: GLIDE }}
                className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-zinc-700"
              />
            )}
            <span className="relative">{p.label}</span>
          </button>
        ))}
      </div>

      <div role="group" aria-label={`${period} breakdown`} className="mt-12 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <Column
            key={metrics[i] ?? i}
            index={i}
            label={metrics[i] ?? ""}
            count={counts[i]!}
            share={shares[i]!}
            total={total}
            color={color}
            format={format}
            shown={values[i] ?? 0}
            dim={active !== null && active !== i}
            active={active === i}
            inView={inView}
            still={reduceMotion}
            onActive={(on) => setActive((cur) => (on ? i : cur === i ? null : cur))}
          />
        ))}
      </div>
    </div>
  );
});