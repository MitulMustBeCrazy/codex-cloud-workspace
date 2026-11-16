"use client";

/**
 * ScoreCard, from https://motion-brew.com/components/score-card
 *
 * One self contained file: the component, its animated icons and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 *
 * Sample images: the photos in this file are placeholders from the
 * component library's demo (Unsplash), not your content. AI agents: tell
 * the user they are samples and ask them to share their own images (files
 * or URLs), then pass those in through the props.
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
import { animate, AnimatePresence, motion, type MotionValue, useAnimation, useInView, useMotionValue, useReducedMotion, useTransform, useVelocity, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: arrow-down-right
const ArrowDownRightIcon = (() => {
interface ArrowDownRightIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowDownRightIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const HEAD_VARIANTS: Variants = {
  normal: { translateX: 0, translateY: 0 },
  animate: {
    translateX: [0, -3, 0],
    translateY: [0, -3, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const SHAFT_VARIANTS: Variants = {
  normal: { translateX: 0, translateY: 0, scale: 1 },
  animate: {
    translateX: [0, -3, 0],
    translateY: [0, -3, 0],
    scale: [1, 0.85, 1],
    originX: 1,
    originY: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const ArrowDownRightIcon = forwardRef<
  ArrowDownRightIconHandle,
  ArrowDownRightIconProps
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
        <motion.path
          animate={controls}
          d="M7 7 L17 17"
          variants={SHAFT_VARIANTS}
        />
        <motion.path
          animate={controls}
          d="M17 7v10H7"
          variants={HEAD_VARIANTS}
        />
        <motion.path
          animate={controls}
          d="M17 17 L10 17"
          variants={HEAD_VARIANTS}
        />
      </svg>
    </span>
  );
});

ArrowDownRightIcon.displayName = "ArrowDownRightIcon";
  return ArrowDownRightIcon;
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

// ScoreCard

/**
 * ScoreCard
 *
 * Trigger: in view, then hover, press and keys. A white chart card with a big
 * score and a few pill bars. When it scrolls into view the bars slide in from
 * the left one after another, springing a little past their mark, while the
 * score counts up from zero with a light motion blur. Hovering (or focusing) a
 * bar fills it with its colour, dims the others and rolls the score to that bar's share,
 * with its name in the caption; leaving rolls it back. New data glides every
 * bar to its new length while the score counts to the new number.
 * Reduced motion shows the final state at once.
 *
 * Engine: motion/react (animate on motion values for the count, bar fills
 * that grow on springs, AnimatePresence for the
 * caption and the change chip).
 */

export interface ScoreBar {
  label: string;
  value: number;
  max: number;
  /** Bar colour. Defaults run violet, blue, green. */
  color?: string;
}

export interface ScoreCardProps {
  /** Card title. Default `"Health score"`. */
  title?: string;
  /** Avatar image in the corner. Pass `null` to hide it. */
  avatar?: string | null;
  /** The bars, top to bottom. The last one sits in full colour. Default Sleep, Activity and Nutrition. */
  bars?: ScoreBar[];
  /** Change against the period before, in points, shown as a chip. Pass `null` to hide it. Default `4.1`. */
  change?: number | null;
  /** Period named in the caption, as in "Overall this month". Default `"month"`. */
  period?: string;
  /** Decimal places on the score. Default `1`. */
  decimals?: number;
  className?: string;
}

// Soft but clear hues, one per bar, in a fixed order.
const PALETTE = ["#8b7cf6", "#3b9eea", "#269a5a", "#e2a33b", "#e0607e"];

const DEFAULT_BARS: ScoreBar[] = [
  { label: "Sleep", value: 16, max: 20 },
  { label: "Activity", value: 18, max: 20 },
  { label: "Nutrition", value: 19, max: 20 },
];

const GLIDE = [0.22, 1, 0.36, 1] as const;
const COUNT = [0.5, 1, 0.89, 1] as const;
// Bars slide on a spring with a touch of overshoot, so they land rather than stop.
const SLIDE = { type: "spring", stiffness: 140, damping: 17, mass: 0.9 } as const;

const share = (bars: ScoreBar[]) => {
  const v = bars.reduce((s, b) => s + b.value, 0);
  const m = bars.reduce((s, b) => s + b.max, 0);
  return m ? (v / m) * 100 : 0;
};

/** The score as text from a motion value, softly blurred while it moves fast. */
function Count({
  value,
  decimals,
  className,
}: {
  value: MotionValue<number>;
  decimals: number;
  className?: string;
}) {
  const text = useTransform(value, (v) => v.toFixed(decimals));
  const rate = useVelocity(value);
  const filter = useTransform(rate, (r) => {
    const px = Math.min(1.2, Math.abs(r) * 0.012);
    return px < 0.15 ? "none" : `blur(${px.toFixed(2)}px)`;
  });
  return (
    <motion.span className={cn("tabular-nums", className)} style={{ filter }}>
      {text}
    </motion.span>
  );
}

function Bar({
  bar,
  index,
  shown,
  active,
  dim,
  still,
  onEnter,
  onLeave,
}: {
  bar: ScoreBar;
  index: number;
  shown: boolean;
  active: boolean;
  dim: boolean;
  still: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const color = bar.color ?? PALETTE[index % PALETTE.length]!;
  const ratio = bar.max ? Math.min(1, Math.max(0, bar.value / bar.max)) : 0;
  // Kept at least wide enough to hold its name and value.
  const target = shown ? Math.max(0.42, ratio) : 0;
  return (
    <motion.button
      type="button"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      whileTap={still ? undefined : { scale: 0.98 }}
      animate={{ opacity: dim ? 0.45 : 1 }}
      transition={{ duration: 0.25, ease: GLIDE }}
      aria-label={`${bar.label}, ${bar.value} of ${bar.max}`}
      className="group/bar relative block h-11 w-full cursor-pointer overflow-hidden rounded-full bg-[#242423]/[0.06] text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:bg-white/[0.06]"
    >
      {/* The fill grows from the left and carries its name and value with it. */}
      <motion.span
        className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
        initial={false}
        animate={{
          width: `${target * 100}%`,
        }}
        transition={
          still
            ? { duration: 0 }
            : {
                width: { ...SLIDE, delay: shown ? index * 0.09 : 0 },
              }
        }
      >
        {/* A light tint of the bar's colour, and the full colour fading in over it when lit. */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{ backgroundColor: color }}
        />
        <motion.span
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: color }}
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: still ? 0 : 0.3, ease: GLIDE }}
        />
        {/* A soft sheen on the lit bar, sweeping once as it lights up. */}
        <AnimatePresence>
          {active && !still && (
            <motion.span
              key="sheen"
              aria-hidden
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ left: "-40%" }}
              animate={{ left: "110%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: GLIDE }}
            />
          )}
        </AnimatePresence>
        <motion.span
          className="relative flex h-full items-center justify-between gap-3 whitespace-nowrap px-4 text-sm"
          animate={{ color: active ? "#ffffff" : "#242423" }}
          transition={{ duration: 0.3, ease: GLIDE }}
        >
          <span className="font-medium">{bar.label}</span>
          <span className="tabular-nums opacity-60">
            <motion.span
              key={bar.value}
              className="inline-block"
              initial={still ? false : { y: 8, opacity: 0, filter: "blur(2px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.35, ease: GLIDE }}
            >
              {bar.value}
            </motion.span>
            /{bar.max}
          </span>
        </motion.span>
      </motion.span>
    </motion.button>
  );
}

export const ScoreCard = React.forwardRef<HTMLDivElement, ScoreCardProps>(
  function ScoreCard(
    {
      title = "Health score",
      avatar = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces",
      bars = DEFAULT_BARS,
      change = 4.1,
      period = "month",
      decimals = 1,
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
    const lit = hover ?? bars.length - 1;

    const focusBar = hover === null ? null : bars[hover];
    const target = focusBar
      ? (focusBar.value / Math.max(1, focusBar.max)) * 100
      : share(bars);

    const score = useMotionValue(0);
    const first = React.useRef(true);
    React.useEffect(() => {
      if (!shown) return;
      if (still) return void score.set(target);
      // The first count runs with the bars; later ones are quicker.
      const intro = first.current;
      first.current = false;
      const c = animate(score, target, {
        duration: intro ? 1.2 : 0.6,
        delay: intro ? 0.1 : 0,
        ease: COUNT,
      });
      return () => c.stop();
    }, [shown, still, target, score]);

    const up = (change ?? 0) >= 0;

    return (
      <div
        ref={root}
        className={cn(
          "relative w-[360px] max-w-full rounded-3xl bg-white p-6 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <div className="relative mt-1 h-5 overflow-hidden text-sm text-zinc-500 dark:text-zinc-400">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={focusBar ? focusBar.label : "overall"}
                  initial={still ? false : { y: 12, opacity: 0, filter: "blur(2px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={still ? undefined : { y: -12, opacity: 0, filter: "blur(2px)" }}
                  transition={{ duration: 0.3, ease: GLIDE }}
                >
                  {focusBar
                    ? `${focusBar.label} this ${period}`
                    : `Overall this ${period}`}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          {avatar && (
            <motion.img
              src={avatar}
              alt=""
              draggable={false}
              initial={still ? false : { scale: 0.6, opacity: 0 }}
              animate={shown ? { scale: 1, opacity: 1 } : undefined}
              whileHover={still ? undefined : { scale: 1.06, rotate: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="size-10 shrink-0 select-none rounded-full object-cover ring-2 ring-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_3px_rgba(36,36,35,0.06)] dark:ring-zinc-900"
            />
          )}
        </div>

        {/* Score */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <p
            className="flex items-baseline text-[32px] font-medium leading-none tracking-tight"
            aria-label={`${target.toFixed(decimals)} percent`}
          >
            <Count value={score} decimals={decimals} />
            <span className="ml-0.5 text-xl text-zinc-400 dark:text-zinc-500">%</span>
          </p>
          <AnimatePresence mode="popLayout" initial={false}>
            {change != null && hover === null && (
              <motion.span
                key="change"
                initial={still ? false : { opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={still ? undefined : { opacity: 0, y: -6, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className={cn(
                  "mb-0.5 inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-sm font-medium tabular-nums",
                  up
                    ? "bg-[#269a5a]/10 text-[#269a5a]"
                    : "bg-[#242423]/[0.06] text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400",
                )}
              >
                {up ? (
                  <ArrowUpRightIcon className="size-4" aria-hidden />
                ) : (
                  <ArrowDownRightIcon className="size-4" aria-hidden />
                )}
                {up ? "+" : ""}
                {change.toFixed(1)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Bars */}
        <div
          className="mt-12 flex flex-col gap-2"
          onPointerLeave={() => setHover(null)}
        >
          {bars.map((b, i) => (
            <Bar
              key={b.label}
              bar={b}
              index={i}
              shown={shown}
              active={i === lit}
              dim={hover !== null && i !== hover}
              still={still}
              onEnter={() => setHover(i)}
              onLeave={() => setHover((h) => (h === i ? null : h))}
            />
          ))}
        </div>

        <span role="status" aria-live="polite" className="sr-only">
          {focusBar
            ? `${focusBar.label}, ${focusBar.value} of ${focusBar.max}`
            : `${title} ${share(bars).toFixed(decimals)} percent this ${period}`}
        </span>
      </div>
    );
  },
);