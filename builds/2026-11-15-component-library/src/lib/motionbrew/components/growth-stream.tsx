"use client";

/**
 * GrowthStream, from https://motion-brew.com/components/growth-stream
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

// Animated icon: arrow-up
const ArrowUpIcon = (() => {
interface ArrowUpIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowUpIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: { d: "m5 12 7-7 7 7", translateY: 0 },
  animate: {
    d: "m5 12 7-7 7 7",
    translateY: [0, 3, 0],
    transition: {
      duration: 0.4,
    },
  },
};

const SECOND_PATH_VARIANTS: Variants = {
  normal: { d: "M12 19V5" },
  animate: {
    d: ["M12 19V5", "M12 19V10", "M12 19V5"],
    transition: {
      duration: 0.4,
    },
  },
};

const ArrowUpIcon = forwardRef<ArrowUpIconHandle, ArrowUpIconProps>(
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
            d="m5 12 7-7 7 7"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M12 19V5"
            variants={SECOND_PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

ArrowUpIcon.displayName = "ArrowUpIcon";
  return ArrowUpIcon;
})();

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

// GrowthStream

/**
 * GrowthStream
 *
 * Trigger: in view, then hover. A total built up over time, drawn as nested
 * bands that step wider before each checkpoint. When the card scrolls into view
 * the stream reveals left to right while the headline counts up on odometer
 * wheels, both from one motion value, and each checkpoint pill pops in exactly
 * as the reveal reaches it. Hovering or focusing a checkpoint rolls the headline
 * to the running total there, swaps the caption and hides the other pills.
 * Reduced motion shows the final state at once.
 *
 * Engine: motion/react (one motion value drives the clip-path reveal, the count
 * and the pill timing; odometer wheels; AnimatePresence for pills and captions).
 */

const GLIDE = [0.22, 1, 0.36, 1] as const;
// The reveal and the count share this gentler ease-out so they finish together.
const FILL = [0.5, 1, 0.89, 1] as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
// Cap for the odometer's motion blur, in px.
const MAX_BLUR = 0.5;

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

// Chart geometry in SVG units.
const W = 340;
const H = 188;
const MID = H / 2;
const MIN_HALF = 4; // half-thickness at the very start
const MAX_HALF = 76; // half-thickness at the final total
const RAMP = 44; // width of each widening step
// Each band's share of the full thickness, outer to inner.
const BANDS = [
  { scale: 1, alpha: 0.22 },
  { scale: 0.68, alpha: 0.45 },
  { scale: 0.36, alpha: 1 },
] as const;

const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

export interface StreamCheckpoint {
  /** Name shown in the caption on hover, e.g. "Week 2". */
  label: string;
  /** Running total at this checkpoint. */
  value: number;
}

export interface GrowthStreamProps {
  /** Running totals, left to right. The last one is the headline. Default three weeks. */
  checkpoints?: StreamCheckpoint[];
  /** Total for the previous period, for the change badge and caption. Default `31350`. */
  previous?: number;
  /** Small label above the number. Default `"Income"`. */
  title?: React.ReactNode;
  /** Name of the previous period in the caption. Default `"last month"`. */
  previousLabel?: string;
  /** Name of the whole period in the hover caption. Default `"the month"`. */
  periodLabel?: string;
  /** Band color. Default `"#8b5cf6"`. */
  color?: string;
  /** Currency for the amounts (ISO code). Default `"USD"`. */
  currency?: string;
  /** Locale for number formatting. Default `"en-US"`. */
  locale?: string;
  /** Length of the reveal and count, in seconds. Default `1.6`. */
  duration?: number;
  /** Called when the round header button is pressed. Leave out to hide it. */
  onAction?: () => void;
  /** Accessible label for the round header button. Default `"View report"`. */
  actionLabel?: string;
  className?: string;
}

const DEFAULT_CHECKPOINTS: StreamCheckpoint[] = [
  { label: "Week 1", value: 8120 },
  { label: "Week 2", value: 19480 },
  { label: "Week 3", value: 32134 },
];

export const GrowthStream = React.forwardRef<HTMLDivElement, GrowthStreamProps>(function GrowthStream(
  {
    checkpoints = DEFAULT_CHECKPOINTS,
    previous = 31350,
    title = "Income",
    previousLabel = "last month",
    periodLabel = "the month",
    color = "#8b5cf6",
    currency = "USD",
    locale = "en-US",
    duration = 1.6,
    onAction,
    actionLabel = "View report",
    className,
  },
  forwardedRef,
) {
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement);
  const inView = useInView(root, { once: true, amount: 0.4 });
  const reduceMotion = !!useReducedMotion();
  const [active, setActive] = React.useState<number | null>(null);
  const [reached, setReached] = React.useState(0);

  const money = React.useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }),
    [locale, currency],
  );
  const plain = React.useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

  const total = checkpoints[checkpoints.length - 1]?.value ?? 0;
  const change = previous > 0 ? ((total - previous) / previous) * 100 : 0;
  // Checkpoints sit evenly across the chart, away from the edges.
  const xs = checkpoints.map((_, i) => W * ((i + 0.6) / (checkpoints.length + 0.2)));
  // Each checkpoint owns the stretch where its growth happens: from the previous line up to its own,
  // and the last one runs on to the right edge.
  const segments = xs.map((x, i) => ({ from: i === 0 ? 0 : xs[i - 1]!, to: i === xs.length - 1 ? W : x }));

  // Half-thickness along x: starts thin and steps wider just before each checkpoint.
  const half = React.useCallback(
    (x: number, scale: number) => {
      let h = MIN_HALF;
      checkpoints.forEach((cp, i) => {
        const before = i === 0 ? 0 : checkpoints[i - 1]!.value;
        const grow = ((cp.value - before) / Math.max(1, total)) * (MAX_HALF - MIN_HALF);
        h += grow * smooth((x - (xs[i]! - RAMP - 8)) / RAMP);
      });
      return h * scale;
    },
    [checkpoints, total, xs],
  );

  const bandPath = React.useCallback(
    (scale: number) => {
      const top: string[] = [];
      const bottom: string[] = [];
      for (let x = 0; x <= W; x += 4) {
        const h = Math.max(1.5, half(x, scale));
        top.push(`${x} ${(MID - h).toFixed(2)}`);
        bottom.unshift(`${x} ${(MID + h).toFixed(2)}`);
      }
      return `M ${top.join(" L ")} L ${bottom.join(" L ")} Z`;
    },
    [half],
  );

  // `amount` drives the reveal and the count; `shown` is the headline, which follows a hovered checkpoint.
  const amount = useMotionValue(0);
  const shown = useMotionValue(0);
  const reveal = useTransform(amount, (a) => (total > 0 ? Math.min(1, a / total) : 1));
  // Measured against the chart's view box, not each shape, so the blurred glow keeps its soft edges.
  // Only the right edge reveals; top and bottom sit well outside so the blur fades out freely.
  const clipPath = useTransform(reveal, (r) => `inset(-60% ${((1 - r) * 100).toFixed(2)}% -60% 0) view-box`);
  // Bands reveal in layers: the outer band leads and each inner one trails a little,
  // all reaching the right edge together as the count lands.
  const lagged = (r: number, lag: number) => {
    const t = Math.min(1, Math.max(0, (r - lag) / (1 - lag)));
    return `inset(-60% ${((1 - t) * 100).toFixed(2)}% -60% 0) view-box`;
  };
  const outerClip = useTransform(reveal, (r) => lagged(r, 0));
  const middleClip = useTransform(reveal, (r) => lagged(r, 0.08));
  const coreClip = useTransform(reveal, (r) => lagged(r, 0.16));
  const bandClips = [outerClip, middleClip, coreClip];
  const glowId = `glow${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  useMotionValueEvent(amount, "change", (a) => {
    if (active === null) shown.set(a);
    // Pop each pill the moment the reveal passes its line.
    const r = total > 0 ? a / total : 1;
    const count = xs.filter((x) => x / W <= r + 1e-6).length;
    if (count !== reached) setReached(count);
  });

  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      amount.set(total);
      shown.set(total);
      setReached(checkpoints.length);
      return;
    }
    const controls = animate(amount, total, { duration, ease: FILL });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, total, duration, reduceMotion]);

  React.useEffect(() => {
    const target = active === null ? amount.get() : checkpoints[active]!.value;
    if (reduceMotion) {
      shown.set(target);
      return;
    }
    const controls = animate(shown, target, { duration: 0.6, ease: GLIDE });
    return () => controls.stop();
  }, [active, checkpoints, amount, shown, reduceMotion]);

  const caption =
    active !== null
      ? `By ${checkpoints[active]!.label} · ${Math.round((checkpoints[active]!.value / Math.max(1, total)) * 100)}% of ${periodLabel}`
      : `Compared to ${money.format(previous)} ${previousLabel}`;

  return (
    <div
      ref={root}
      className={cn(
        "w-[340px] max-w-full overflow-hidden rounded-3xl bg-white pb-6 pt-6 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 px-6">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-[32px] font-medium tracking-tight">
              <Odometer amount={shown} format={money} label={money.format(total)} />
            </p>
            {active === null && (
              <motion.span
                {...POP}
                className={cn(
                  "inline-flex items-center gap-0.5 text-sm font-medium",
                  change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                )}
              >
                <ArrowUpIcon className={cn("size-3.5", change < 0 && "rotate-180")} strokeWidth={2.5} />
                {Math.abs(change).toFixed(1)}%
              </motion.span>
            )}
          </div>
          <div className="mt-1 grid text-sm text-zinc-500 dark:text-zinc-400">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={caption} {...POP} className="col-start-1 row-start-1 truncate">
                {caption}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        {onAction && (
          <motion.button
            type="button"
            onClick={onAction}
            aria-label={actionLabel}
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

      <div
        role="img"
        aria-label={`${typeof title === "string" ? title : "Total"} over time: ${checkpoints
          .map((cp) => `${cp.label} ${money.format(cp.value)}`)
          .join(", ")}`}
        className="relative mt-6"
        onPointerLeave={() => setActive(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full overflow-visible" aria-hidden>
          <defs>
            <filter id={glowId} x="-10%" y="-100%" width="120%" height="300%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>
          {/* Soft glow: the outer band, a little larger and heavily blurred, at 15% opacity. */}
          <motion.g style={{ clipPath }}>
            <path d={bandPath(1.25)} fill={color} fillOpacity={0.15} filter={`url(#${glowId})`} />
          </motion.g>
          {/* One copy of the bands per segment, each clipped to its stretch, so a hovered
              segment stays full while the rest dim, like the GoalGauge segments. */}
          {segments.map((seg, i) => (
            <clipPath key={`clip-${i}`} id={`${glowId}-seg${i}`}>
              <rect x={seg.from} y={-H} width={seg.to - seg.from} height={H * 3} />
            </clipPath>
          ))}
          <g>
            {segments.map((_, i) => (
              <motion.g
                key={i}
                clipPath={`url(#${glowId}-seg${i})`}
                animate={{ opacity: active === null || active === i ? 1 : 0.28 }}
                transition={{ duration: 0.25, ease: GLIDE }}
              >
                {BANDS.map((band, k) => (
                  <motion.path
                    key={band.scale}
                    d={bandPath(band.scale)}
                    fill={color}
                    fillOpacity={band.alpha}
                    style={{ clipPath: bandClips[k] }}
                  />
                ))}
              </motion.g>
            ))}
          </g>
          {xs.map((x, i) => (
            <motion.line
              key={i}
              x1={x}
              x2={x}
              y1={0}
              y2={H}
              strokeWidth={1.5}
              className="stroke-white dark:stroke-zinc-900"
              initial={false}
              animate={{ opacity: i < reached ? (active === null || active === i ? 0.9 : 0.4) : 0 }}
              transition={{ duration: 0.3, ease: GLIDE }}
            />
          ))}
        </svg>

        {/* Hover strips: the whole stretch of each segment is a target. */}
        {segments.map((seg, i) => (
          <span
            key={`hit-${i}`}
            aria-hidden
            className="absolute inset-y-0"
            style={{ left: `${(seg.from / W) * 100}%`, width: `${((seg.to - seg.from) / W) * 100}%` }}
            onPointerEnter={() => setActive(i)}
          />
        ))}
        {/* Checkpoint pills: focusable buttons on the lines for keyboard users. */}
        {checkpoints.map((cp, i) => (
          <button
            key={cp.label}
            type="button"
            aria-label={`${cp.label}: ${money.format(cp.value)}`}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className="absolute inset-y-0 w-14 -translate-x-1/2 cursor-default rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            style={{ left: `${(xs[i]! / W) * 100}%` }}
          >
            <AnimatePresence>
              {i < reached && (
                <motion.span
                  key="pill"
                  initial={{ opacity: 0, scale: 0.6, y: 4 }}
                  animate={
                    active === null || active === i ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.85, y: 0 }
                  }
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.35, ease: GLIDE }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs font-medium tabular-nums text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_-4px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {plain.format(cp.value)}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
    </div>
  );
});