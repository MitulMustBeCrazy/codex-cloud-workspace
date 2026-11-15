"use client";

/**
 * RangeChart, from https://motion-brew.com/components/range-chart
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// RangeChart

/**
 * RangeChart
 *
 * Trigger: hover and press (plus keys and in view). A white card that charts a
 * range for each day, like heart rate: a pill from each day's low to high on
 * a soft column track, separate bubbles for outlying readings, and a dashed
 * average line. A 7D, 15D or 30D switch picks how many days to show: an ink
 * pill slides to it, the bars slim down or widen to fit and grow back in, and
 * the labels change from weekdays to dates. When the card scrolls into view
 * it rises, the pills grow out from the average one after another and the
 * average tag slides in. Hovering a day (or focusing it, or stepping with the
 * arrow keys) widens its pills, marks their ends with white dots and fades
 * the other days, while the big range in the header rolls to that day like
 * an odometer, the caption names it, and the Lowest, Average and Peak tiles
 * roll to match; leaving rolls it all back. The Full stats button slides its
 * arrow through on hover. Reduced motion keeps the states without movement.
 *
 * Engine: motion/react (staggered springs for the bars, odometer digit
 * columns for the numbers, layoutId pills for the switch and the hovered
 * column, AnimatePresence for the captions).
 */

export interface RangeDay {
  /** The day, used for labels and the header. */
  date: Date;
  /** One or more [low, high] ranges; a short one reads as a single bubble. */
  ranges: [number, number][];
}

export interface RangeChartProps {
  title?: string;
  /** Unit after the numbers. Default `"bpm"`. */
  unit?: string;
  /** Every day you have, oldest first. The chart shows the most recent ones. Default 30 days. */
  data?: RangeDay[];
  /** Spans the switch offers, in days. Default `[7, 15, 30]`. */
  spans?: number[];
  /** Span shown first. Default `7`. */
  defaultSpan?: number;
  /** Value of the dashed average line. Default the mean of the shown readings. */
  average?: number;
  /** Range colour. Default a warm red. */
  color?: string;
  /** Called by the Full stats button. */
  onFullStats?: () => void;
  className?: string;
}

// Thirty days of believable heart rate ranges, from a fixed seed so it never jumps.
const DEFAULT_DATA: RangeDay[] = (() => {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const end = new Date(2026, 8, 17);
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (29 - i));
    const low = Math.round(46 + rand() * 22);
    const high = Math.round(108 + rand() * 80);
    const ranges: [number, number][] = [[low, high]];
    // Now and then a reading sits apart from the rest.
    if (rand() > 0.72) {
      const above = rand() > 0.5;
      const v = above
        ? Math.min(196, high + 14 + Math.round(rand() * 14))
        : Math.max(38, low - 16 - Math.round(rand() * 6));
      ranges.push([v, v + 8]);
    }
    return { date, ranges };
  });
})();

const GLIDE = [0.22, 1, 0.36, 1] as const;
const GROW = { type: "spring", stiffness: 190, damping: 21 } as const;
const PILL = { type: "spring", stiffness: 480, damping: 38 } as const;
const ROLL = {
  type: "spring",
  stiffness: 280,
  damping: 26,
  mass: 0.8,
} as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const CHART_H = 200;
const LABEL_H = 24; // space under the columns for the labels

function Digit({ digit, still }: { digit: number; still: boolean }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
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

/** A number whose digits roll like an odometer; columns are keyed from the right. */
function Rolling({ value, still }: { value: number; still: boolean }) {
  const chars = Array.from(String(Math.round(value)));
  return (
    <span aria-hidden className="inline-flex leading-none tabular-nums">
      {chars.map((ch, i) => (
        <Digit key={chars.length - i} digit={Number(ch)} still={still} />
      ))}
    </span>
  );
}

const weekday = new Intl.DateTimeFormat("en", { weekday: "short" });
const longDay = new Intl.DateTimeFormat("en", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const shortDate = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
});

export const RangeChart = React.forwardRef<HTMLDivElement, RangeChartProps>(
  function RangeChart(
    {
      title = "Heart rate",
      unit = "bpm",
      data = DEFAULT_DATA,
      spans = [7, 15, 30],
      defaultSpan = 7,
      average,
      color = "#e5484d",
      onFullStats,
      className,
    },
    ref,
  ) {
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const still = !!useReducedMotion();
    const inView = useInView(root, { once: true, amount: 0.3 });
    const shown = inView || still;
    const id = React.useId();
    const [span, setSpan] = React.useState(
      spans.includes(defaultSpan) ? defaultSpan : spans[0]!,
    );
    const [hover, setHover] = React.useState<number | null>(null);

    const days = data.slice(-span);
    const n = days.length;
    const all = days.flatMap((d) => d.ranges.flat());
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const avg = Math.round(
      average ?? all.reduce((s, v) => s + v, 0) / Math.max(1, all.length),
    );
    const floor = Math.max(0, lo - 12);
    const ceil = hi + 12;
    const y = (v: number) => ((v - floor) / (ceil - floor)) * CHART_H; // from the bottom
    const avgY = y(avg);

    const day = hover === null ? null : days[hover]!;
    const vals = day ? day.ranges.flat() : all;
    const showLo = Math.min(...vals);
    const showHi = Math.max(...vals);
    const showAvg = day
      ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
      : avg;
    const period = `${shortDate.format(days[0]!.date)} to ${shortDate.format(days[n - 1]!.date)}`;

    // Bars slim down as more days share the width.
    const barW = n <= 7 ? 22 : n <= 15 ? 12 : 6;
    const label = (d: Date, i: number) =>
      n <= 7
        ? weekday.format(d).slice(0, 2)
        : n <= 15
          ? String(d.getDate())
          : (n - 1 - i) % 5 === 0
            ? String(d.getDate())
            : "";

    const move = (to: number) => {
      const next = (to + n) % n;
      setHover(next);
      root.current?.querySelectorAll<HTMLElement>("[data-day]")[next]?.focus();
    };

    return (
      <motion.div
        ref={root}
        initial={still ? false : { opacity: 0, y: 20 }}
        animate={shown ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: GLIDE }}
        className={cn(
          "w-[380px] max-w-full rounded-3xl bg-white p-6 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        {/* Header: title and the span switch */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold tracking-tight">
            {title}
          </p>
          <div
            role="tablist"
            aria-label="Days shown"
            className="flex rounded-full bg-[#242423]/[0.06] p-0.5 dark:bg-white/[0.08]"
          >
            {spans.map((s) => {
              const on = s === span;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setHover(null);
                    setSpan(s);
                  }}
                  className={cn(
                    "relative h-7 cursor-pointer rounded-full px-2.5 text-xs font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400",
                    on
                      ? "text-white dark:text-[#242423]"
                      : "text-zinc-500 hover:text-[#242423] dark:text-zinc-400 dark:hover:text-zinc-100",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId={`${id}-span`}
                      className="absolute inset-0 rounded-full bg-[#242423] dark:bg-zinc-100"
                      transition={still ? { duration: 0 } : PILL}
                    />
                  )}
                  <span className="relative">{s}D</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* The range rolls to the hovered day. */}
        <p
          className="mt-5 flex items-end gap-2 font-semibold tracking-tight"
          aria-live="polite"
          aria-label={`${showLo} to ${showHi} ${unit}, ${day ? longDay.format(day.date) : period}`}
        >
          <span className="text-[48px] leading-none">
            <Rolling value={showLo} still={still} />
          </span>
          <span className="pb-1 text-xl font-medium text-zinc-400">to</span>
          <span className="text-[48px] leading-none">
            <Rolling value={showHi} still={still} />
          </span>
          <span className="pb-1 text-xl font-medium text-zinc-400">{unit}</span>
        </p>
        <div className="relative mt-2 h-5 overflow-hidden text-sm text-zinc-500 dark:text-zinc-400">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={day ? day.date.toISOString() : `span-${span}`}
              initial={
                still ? false : { y: 12, opacity: 0, filter: "blur(2px)" }
              }
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={
                still ? undefined : { y: -12, opacity: 0, filter: "blur(2px)" }
              }
              transition={{ duration: 0.25, ease: GLIDE }}
            >
              {day ? longDay.format(day.date) : `${period}, last ${span} days`}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Chart */}
        <div
          className="relative mt-5"
          onPointerLeave={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight")
              (e.preventDefault(), move((hover ?? -1) + 1));
            else if (e.key === "ArrowLeft")
              (e.preventDefault(), move((hover ?? n) - 1));
          }}
        >
          <div
            className="relative grid gap-x-0.5"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
          >
            {days.map((d, i) => {
              const on = hover === i;
              const dim = hover !== null && !on;
              const flat = d.ranges.flat();
              return (
                <button
                  key={`${span}-${i}`}
                  type="button"
                  data-day
                  aria-label={`${longDay.format(d.date)}: ${Math.min(...flat)} to ${Math.max(...flat)} ${unit}`}
                  onPointerEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  className="relative flex cursor-pointer flex-col items-center outline-none"
                >
                  <div className="relative w-full" style={{ height: CHART_H }}>
                    {/* A soft track behind each column, darker on the hovered one. */}
                    <span
                      className={cn(
                        "absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full transition-colors duration-300",
                        on
                          ? "bg-[#242423]/[0.07] dark:bg-white/[0.1]"
                          : "bg-[#242423]/[0.03] dark:bg-white/[0.04]",
                      )}
                      style={{ width: barW + 8 }}
                    />
                    {d.ranges.map(([a, b], k) => {
                      const bottom = y(a);
                      const top = y(b);
                      const tall = Math.max(barW, top - bottom);
                      const bubble = tall === barW;
                      return (
                        <motion.span
                          key={k}
                          className="absolute left-1/2 rounded-full"
                          style={{
                            width: barW,
                            marginLeft: -barW / 2,
                            bottom: bubble
                              ? (bottom + top) / 2 - barW / 2
                              : bottom,
                            height: tall,
                            background: `linear-gradient(to bottom, ${color}, ${color}b3)`,
                            // Grow out from the average line.
                            originY: Math.min(
                              1,
                              Math.max(0, (top - avgY) / tall),
                            ),
                          }}
                          initial={still ? false : { scaleY: 0, opacity: 0 }}
                          animate={
                            shown
                              ? {
                                  scaleY: 1,
                                  opacity: dim ? 0.28 : 1,
                                  scaleX: on && !still ? 1.18 : 1,
                                }
                              : undefined
                          }
                          transition={{
                            scaleY: {
                              ...GROW,
                              delay: still
                                ? 0
                                : 0.2 + i * (0.42 / n) + k * 0.04,
                            },
                            opacity: { duration: 0.25 },
                            scaleX: {
                              type: "spring",
                              stiffness: 500,
                              damping: 26,
                            },
                          }}
                        >
                          <AnimatePresence>
                            {on && tall > barW + 12 && barW >= 10 && (
                              <>
                                <motion.span
                                  key="top"
                                  className="absolute left-1/2 top-1 size-1.5 -translate-x-1/2 rounded-full bg-white"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 22,
                                  }}
                                />
                                <motion.span
                                  key="bottom"
                                  className="absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-white"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 22,
                                    delay: 0.04,
                                  }}
                                />
                              </>
                            )}
                          </AnimatePresence>
                        </motion.span>
                      );
                    })}
                  </div>
                  <span
                    className={cn(
                      "mt-2 h-4 text-xs leading-4 tabular-nums transition-colors",
                      on
                        ? "font-medium text-[#242423] dark:text-zinc-100"
                        : "text-zinc-400",
                    )}
                  >
                    {on && n > 7 ? d.date.getDate() : label(d.date, i)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* The dashed average line, with an outline tag on the right. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-px border-t border-dashed border-[#242423]/25 dark:border-white/25"
            style={{ bottom: avgY + LABEL_H, originX: 0 }}
            initial={still ? false : { scaleX: 0 }}
            animate={shown ? { scaleX: 1 } : undefined}
            transition={{ duration: 0.8, delay: 0.15, ease: GLIDE }}
          />
          <motion.span
            className="pointer-events-none absolute -right-2 inline-flex h-6 items-center rounded-full bg-white px-2 text-xs font-medium tabular-nums text-[#242423] ring-1 ring-[#242423]/15 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/20"
            style={{ bottom: avgY + LABEL_H - 12 }}
            initial={still ? false : { opacity: 0, x: 10 }}
            animate={shown ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.5, ease: GLIDE }}
          >
            Avg {avg}
          </motion.span>
        </div>

        {/* Lowest, average and peak, for the span or the hovered day. */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: "Lowest", value: showLo },
            { label: "Average", value: showAvg },
            { label: "Peak", value: showHi },
          ].map((t) => (
            <div
              key={t.label}
              className="rounded-2xl bg-[#242423]/[0.04] px-3 py-2.5 dark:bg-white/[0.05]"
            >
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.label}
              </p>
              <p className="mt-1 flex items-center text-base font-semibold">
                <Rolling value={t.value} still={still} />
                <span className="ml-1 text-xs font-normal text-zinc-400">
                  {unit}
                </span>
              </p>
            </div>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={onFullStats}
          whileTap={still ? undefined : { scale: 0.98 }}
          className="group/stats mt-3 flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#242423]/[0.06] text-sm font-medium outline-none transition-colors hover:bg-[#242423]/[0.1] focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/[0.08] dark:hover:bg-white/[0.12]"
        >
          Full stats
          <span className="relative size-4 overflow-hidden">
            <ArrowRight
              aria-hidden
              className="absolute inset-0 size-4 transition-transform duration-300 ease-out group-hover/stats:translate-x-5"
            />
            <ArrowRight
              aria-hidden
              className="absolute inset-0 size-4 -translate-x-5 transition-transform duration-300 ease-out group-hover/stats:translate-x-0"
            />
          </span>
        </motion.button>
      </motion.div>
    );
  },
);