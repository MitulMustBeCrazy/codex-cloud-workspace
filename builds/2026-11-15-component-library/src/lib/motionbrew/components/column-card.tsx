"use client";

/**
 * ColumnCard, from https://motion-brew.com/components/column-card
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { animate, AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ColumnCard

/**
 * ColumnCard
 *
 * Trigger: in view, then hover, press and keys. A tall white card with a small
 * live pill, a headline, a short line of body text and a few big rounded
 * columns standing in a soft gray stage over faint guide lines, each carrying
 * its value inside at the top, with a legend and the total in a footer. When
 * it scrolls into view the columns grow up from the floor one after another,
 * springing a little past their height, and each number counts up from zero
 * inside its column, the total with them. Hovering (or focusing) a column
 * lifts it, dims the others and floats an ink tooltip with its share above
 * it; leaving settles it back. Reduced motion shows the final state at once.
 *
 * Engine: motion/react (animate on motion values for the counts, column
 * heights on springs, AnimatePresence for the share tooltip).
 */

export interface Column {
  label: string;
  value: number;
  /** Column colour. Defaults run violet, then ink. */
  color?: string;
}

export interface ColumnCardProps {
  /** Headline. Default `"Data that puts your health in motion"`. */
  title?: React.ReactNode;
  /** Body text under the headline. */
  description?: React.ReactNode;
  /** The columns, left to right. Heights are relative to the largest. */
  columns?: Column[];
  /** Small pill above the headline. Pass `null` to hide it. Default `"Last 30 days"`. */
  eyebrow?: React.ReactNode;
  /** Word after the total in the footer. Default `"readings"`. */
  unit?: string;
  /** Height of the tallest column in px. Default `220`. */
  columnHeight?: number;
  className?: string;
}

const DEFAULT_COLUMNS: Column[] = [
  { label: "Out of range", value: 19 },
  { label: "In range", value: 148 },
];

// Violet first, then ink, so the larger "good" column reads strongest.
const PALETTE = ["#8b7cf6", "#242423", "#3b9eea", "#269a5a"];

const GLIDE = [0.22, 1, 0.36, 1] as const;
const COUNT = [0.5, 1, 0.89, 1] as const;
// Columns grow on a spring with a touch of overshoot, so they land rather than stop.
const GROW = { type: "spring", stiffness: 120, damping: 16, mass: 1 } as const;
const STAGGER = 0.14;

function Count({
  to,
  delay,
  run,
  still,
}: {
  to: number;
  delay: number;
  run: boolean;
  still: boolean;
}) {
  const v = useMotionValue(still ? to : 0);
  const text = useTransform(v, (n) => Math.round(n).toLocaleString());
  React.useEffect(() => {
    if (!run) return;
    if (still) return void v.set(to);
    const c = animate(v, to, { duration: 1.1, delay, ease: COUNT });
    return () => c.stop();
  }, [run, still, to, delay, v]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

export const ColumnCard = React.forwardRef<HTMLDivElement, ColumnCardProps>(
  function ColumnCard(
    {
      title = "Data that puts your health in motion",
      description = "You have seen the specialists and done the tests. Now every result finally lines up in one place.",
      columns = DEFAULT_COLUMNS,
      columnHeight = 220,
      eyebrow = "Last 30 days",
      unit = "readings",
      className,
    },
    ref,
  ) {
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const still = !!useReducedMotion();
    const inView = useInView(root, { once: true, amount: 0.35 });
    const shown = inView || still;
    const [hover, setHover] = React.useState<number | null>(null);

    const top = Math.max(1, ...columns.map((c) => c.value));
    const sum = columns.reduce((s, c) => s + c.value, 0);
    const total = sum || 1;
    const focus = hover === null ? null : columns[hover];

    return (
      <div
        ref={root}
        className={cn(
          "relative flex w-[340px] max-w-full flex-col overflow-hidden rounded-3xl bg-white text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        <motion.div
          className="px-6 pt-6"
          initial={still ? false : { opacity: 0, y: 12 }}
          animate={shown ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: GLIDE }}
        >
          {eyebrow && (
            <span className="mb-5 inline-flex h-7 items-center gap-2 rounded-full bg-[#242423]/[0.06] px-3 text-xs font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
              <span className="relative flex size-1.5">
                {!still && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#269a5a]/60" />
                )}
                <span className="relative size-1.5 rounded-full bg-[#269a5a]" />
              </span>
              {eyebrow}
            </span>
          )}
          <h3 className="text-2xl font-semibold leading-tight tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="mt-3 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </motion.div>

        {/* The columns stand on the floor of a soft gray stage, over faint guide lines. */}
        <div className="relative mx-3 mt-8 overflow-hidden rounded-[20px] bg-[#242423]/[0.04] dark:bg-white/[0.04]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-4 bottom-4"
            style={{ height: columnHeight }}
          >
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <span
                key={f}
                className="absolute inset-x-0 border-t border-dashed border-[#242423]/10 dark:border-white/10"
                style={{ bottom: `${f * 100}%` }}
              />
            ))}
          </div>
          <div
            className="relative flex items-end gap-3 p-4"
            style={{ height: columnHeight + 40 + 32 }}
            onPointerLeave={() => setHover(null)}
          >
            {columns.map((c, i) => {
              const color = c.color ?? PALETTE[i % PALETTE.length]!;
              const h = Math.max(48, (c.value / top) * columnHeight);
              const delay = 0.15 + i * STAGGER;
              const on = hover === i;
              const dim = hover !== null && !on;
              return (
                <motion.button
                  key={c.label}
                  type="button"
                  aria-label={`${c.label}, ${c.value}, ${Math.round((c.value / total) * 100)} percent`}
                  onPointerEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover((x) => (x === i ? null : x))}
                  whileTap={still ? undefined : { scale: 0.97 }}
                  animate={{ opacity: dim ? 0.4 : 1, y: on && !still ? -6 : 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="flex min-w-0 flex-1 cursor-pointer flex-col justify-end rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-zinc-900"
                >
                  {/* On hover a small ink tooltip floats above the column with its share. */}
                  <div className="relative h-10">
                    <AnimatePresence>
                      {on && (
                        <motion.span
                          initial={
                            still ? false : { opacity: 0, y: 6, scale: 0.9 }
                          }
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={
                            still
                              ? undefined
                              : { opacity: 0, y: 4, scale: 0.95 }
                          }
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 26,
                          }}
                          className="absolute bottom-2 left-1/2 inline-flex h-7 -translate-x-1/2 items-center whitespace-nowrap rounded-full bg-[#242423] px-3 text-xs font-medium tabular-nums text-white shadow-[0_6px_16px_-8px_rgba(0,0,0,0.5)] dark:bg-zinc-100 dark:text-[#242423]"
                        >
                          {Math.round((c.value / total) * 100)}% of all
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.span
                    aria-hidden
                    className="relative block w-full overflow-hidden rounded-2xl"
                    style={{ backgroundColor: color }}
                    initial={still ? false : { height: 0 }}
                    animate={shown ? { height: h } : undefined}
                    transition={still ? { duration: 0 } : { ...GROW, delay }}
                  >
                    {/* A soft top light, and a sheen that sweeps up the column on hover. */}
                    <span className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
                    {/* The value sits inside the column, at its top, and rises with it. */}
                    <motion.span
                      className="absolute left-3.5 top-3 text-xl font-medium leading-none tracking-tight text-white"
                      initial={still ? false : { opacity: 0 }}
                      animate={shown ? { opacity: 1 } : undefined}
                      transition={{ duration: 0.3, delay: delay + 0.1 }}
                    >
                      <Count
                        to={c.value}
                        delay={delay}
                        run={shown}
                        still={still}
                      />
                    </motion.span>
                    <AnimatePresence>
                      {on && !still && (
                        <motion.span
                          key="sheen"
                          className="absolute inset-x-0 h-1/3 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                          initial={{ top: "110%" }}
                          animate={{ top: "-40%" }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: GLIDE }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer: a legend for the columns, and the total counting up with them. */}
        <div className="flex items-center justify-between gap-3 px-6 pb-5 pt-4 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
            {columns.map((c, i) => (
              <motion.span
                key={c.label}
                className="inline-flex items-center gap-2"
                animate={{ opacity: hover !== null && hover !== i ? 0.4 : 1 }}
                transition={{ duration: 0.25, ease: GLIDE }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor: c.color ?? PALETTE[i % PALETTE.length],
                  }}
                />
                {c.label}
              </motion.span>
            ))}
          </span>
          <span className="shrink-0">
            <span className="font-medium text-[#242423] dark:text-zinc-100">
              <Count to={sum} delay={0.15} run={shown} still={still} />
            </span>{" "}
            {unit}
          </span>
        </div>

        <span role="status" aria-live="polite" className="sr-only">
          {focus ? `${focus.label}, ${focus.value}` : ""}
        </span>
      </div>
    );
  },
);