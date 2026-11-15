"use client";

/**
 * AmountSlider, from https://motion-brew.com/components/amount-slider
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
import { ArrowRight } from "lucide-react";
import { animate, motion, useAnimation, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: shield-check
const ShieldCheckIcon = (() => {
interface ShieldCheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ShieldCheckIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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
    scale: 1,
    transition: {
      duration: 0.3,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    scale: [0.5, 1],
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
};

const ShieldCheckIcon = forwardRef<ShieldCheckIconHandle, ShieldCheckIconProps>(
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
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <motion.path
            animate={controls}
            d="m9 12 2 2 4-4"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

ShieldCheckIcon.displayName = "ShieldCheckIcon";
  return ShieldCheckIcon;
})();

// Animated icon: users
const UsersIcon = (() => {
interface UsersIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface UsersIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: {
    translateX: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 13,
    },
  },
  animate: {
    translateX: [-6, 0],
    transition: {
      delay: 0.1,
      type: "spring",
      stiffness: 200,
      damping: 13,
    },
  },
};

const UsersIcon = forwardRef<UsersIconHandle, UsersIconProps>(
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
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <motion.path
            animate={controls}
            d="M22 21v-2a4 4 0 0 0-3-3.87"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M16 3.13a4 4 0 0 1 0 7.75"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

UsersIcon.displayName = "UsersIcon";
  return UsersIcon;
})();

// AmountSlider

/**
 * AmountSlider
 *
 * Trigger: drag (plus press and keys). A white card for picking an amount: a
 * label, a big amount whose digits roll like an odometer as it changes, a
 * slider with an ink fill and a white grip thumb, and a soft gray row that
 * works out the monthly payment as you go. Grabbing the thumb swells it and
 * spreads its grip lines; dragging past either end stretches it a little like
 * rubber before it springs back. Pressing the track glides the thumb there on
 * a spring, and the arrow, Page and Home/End keys step it. The ink button's
 * arrow slides through on hover. Reduced motion swaps the rolls and springs
 * for plain changes.
 *
 * Engine: motion/react (a motion value for the thumb position, springs for
 * track presses and the stretch, odometer digit columns).
 */

export interface AmountSliderProps {
  /** Label above the amount. Default `"How much do you need?"`. */
  label?: string;
  /** Lowest amount. Default `5000`. */
  min?: number;
  /** Highest amount. Default `500000`. */
  max?: number;
  /** Amounts snap to this step. Default `1000`. */
  step?: number;
  /** Starting amount. Default `75000`. */
  defaultValue?: number;
  /** ISO currency code. Default `"USD"`. */
  currency?: string;
  /** Yearly interest rate in percent, for the monthly estimate. Default `7.5`. */
  rate?: number;
  /** Term in months, for the monthly estimate. Default `60`. */
  months?: number;
  /** Button label. Default `"Continue"`. */
  cta?: string;
  /** Called as the amount changes. */
  onChange?: (value: number) => void;
  /** Called when the button is pressed. */
  onSubmit?: (value: number) => void;
  className?: string;
}

const ROLL = {
  type: "spring",
  stiffness: 300,
  damping: 28,
  mass: 0.7,
} as const;
const PRESS = { type: "spring", stiffness: 260, damping: 26 } as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

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

/** A formatted amount whose digits roll like an odometer. Separators and symbols stay put. */
function Rolling({ text, still }: { text: string; still: boolean }) {
  const chars = Array.from(text);
  return (
    <span aria-hidden className="inline-flex leading-none tabular-nums">
      {chars.map((ch, i) => {
        // Key from the right so a column keeps its identity as the number grows.
        const key = chars.length - i;
        return /\d/.test(ch) ? (
          <Digit key={key} digit={Number(ch)} still={still} />
        ) : (
          <span key={`${key}-${ch}`} className="inline-block h-[1em]">
            {ch}
          </span>
        );
      })}
    </span>
  );
}

export const AmountSlider = React.forwardRef<HTMLDivElement, AmountSliderProps>(
  function AmountSlider(
    {
      label = "How much do you need?",
      min = 5000,
      max = 500000,
      step = 1000,
      defaultValue = 75000,
      currency = "USD",
      rate = 7.5,
      months = 60,
      cta = "Continue",
      onChange,
      onSubmit,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const span = Math.max(1, max - min);
    const clamp = (v: number) =>
      Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min));

    const [value, setValue] = React.useState(() => clamp(defaultValue));
    const [grab, setGrab] = React.useState(false);
    const track = React.useRef<HTMLDivElement>(null);
    // Thumb position, 0 to 1. It can run a little past the ends while dragging.
    const pos = useMotionValue((value - min) / span);
    const stretch = useMotionValue(0);

    const money = React.useMemo(
      () =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }),
      [currency],
    );
    const short = React.useMemo(
      () =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          notation: "compact",
          maximumFractionDigits: 1,
        }),
      [currency],
    );

    const commit = (v: number) => {
      const next = clamp(v);
      setValue((cur) => {
        if (cur !== next) onChange?.(next);
        return next;
      });
    };
    useMotionValueEvent(pos, "change", (p) =>
      commit(min + Math.min(1, Math.max(0, p)) * span),
    );

    // The thumb's centre runs from one half-thumb in from each end, so it never overhangs.
    const left = useTransform(pos, (p) => {
      const c = Math.min(1, Math.max(0, p));
      return `calc(${c * 100}% + ${24 - c * 48}px)`;
    });
    // Past either end the thumb stretches toward the pull, like rubber.
    const scaleX = useTransform(
      stretch,
      (s) => 1 + Math.min(0.35, Math.abs(s) * 0.004),
    );
    const originX = useTransform(stretch, (s) => (s < 0 ? 1 : 0));

    const ratioAt = (clientX: number) => {
      const r = track.current!.getBoundingClientRect();
      return (clientX - r.left - 24) / Math.max(1, r.width - 48);
    };
    const glide = (p: number) => {
      const to = Math.min(1, Math.max(0, p));
      animate(pos, to, still ? { duration: 0 } : PRESS);
    };

    const onDown = (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      // Focus for the keys, without the keyboard ring.
      (e.currentTarget as HTMLElement).focus({
        focusVisible: false,
      } as FocusOptions);
      setGrab(true);
      pos.stop();
      glide(ratioAt(e.clientX));
    };
    const onMove = (e: React.PointerEvent) => {
      if (!grab) return;
      pos.stop();
      const w = Math.max(1, track.current!.getBoundingClientRect().width - 48);
      const p = ratioAt(e.clientX);
      pos.set(Math.min(1, Math.max(0, p)));
      // How far past the end the pointer is, in px.
      stretch.set(p < 0 ? p * w : p > 1 ? (p - 1) * w : 0);
    };
    const onUp = () => {
      if (!grab) return;
      setGrab(false);
      animate(
        stretch,
        0,
        still
          ? { duration: 0 }
          : { type: "spring", stiffness: 500, damping: 18 },
      );
      // Settle exactly on the snapped amount.
      glide((value - min) / span);
    };

    const onKey = (e: React.KeyboardEvent) => {
      const big = Math.max(step, Math.round(span / 10 / step) * step);
      const by: Record<string, number> = {
        ArrowRight: step,
        ArrowUp: step,
        ArrowLeft: -step,
        ArrowDown: -step,
        PageUp: big,
        PageDown: -big,
      };
      let next: number | null = null;
      if (e.key in by) next = clamp(value + by[e.key]!);
      else if (e.key === "Home") next = min;
      else if (e.key === "End") next = max;
      if (next === null) return;
      e.preventDefault();
      glide((next - min) / span);
    };

    // Standard amortised monthly payment.
    const r = rate / 100 / 12;
    const monthly = r
      ? (value * r) / (1 - Math.pow(1 + r, -months))
      : value / months;

    return (
      <div
        ref={ref}
        className={cn(
          "w-[380px] max-w-full rounded-3xl bg-white p-6 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
        <p
          className="mt-2 text-[32px] font-medium leading-none tracking-tight"
          aria-hidden
        >
          <Rolling text={money.format(value)} still={still} />
        </p>

        {/* Slider */}
        <div className="mt-8">
          <div
            ref={track}
            role="slider"
            tabIndex={0}
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={money.format(value)}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKey}
            className="group/slider relative h-10 cursor-pointer touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-zinc-900"
          >
            {/* Track and fill. */}
            <span className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-[#242423]/[0.08] dark:bg-white/10">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-[#242423] dark:bg-zinc-100"
                style={{ width: left }}
              />
            </span>
            {/* Thumb: a white pill with grip lines that spread when grabbed. */}
            <motion.span
              className="absolute top-1/2 -ml-6 -mt-4 block h-8 w-12"
              style={{ left }}
            >
              <motion.span
                className="flex size-full items-center justify-center gap-[3px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12),0_6px_16px_-6px_rgba(0,0,0,0.3)] ring-1 ring-black/5 dark:bg-zinc-100"
                style={{ scaleX, originX }}
                animate={{ scale: grab && !still ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
              >
                {[0, 1, 2].map((k) => (
                  <motion.span
                    key={k}
                    className="h-3 w-px rounded-full bg-[#242423]/40"
                    animate={{ x: grab && !still ? (k - 1) * 2 : 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 24 }}
                  />
                ))}
              </motion.span>
            </motion.span>
          </div>
          <div className="mt-2 flex justify-between text-xs font-medium text-zinc-500 tabular-nums dark:text-zinc-400">
            <span>{short.format(min)}</span>
            <span>{short.format(max)}</span>
          </div>
        </div>

        {/* Monthly estimate */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#242423]/[0.04] px-4 py-3 dark:bg-white/[0.04]">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            About, over {months} months
          </span>
          <span className="flex items-baseline text-base font-medium">
            <Rolling text={money.format(Math.round(monthly))} still={still} />
            <span className="ml-1 text-sm font-normal text-zinc-500 dark:text-zinc-400">
              /mo
            </span>
          </span>
        </div>

        <motion.button
          type="button"
          onClick={() => onSubmit?.(value)}
          whileTap={still ? undefined : { scale: 0.97 }}
          className="group/cta mt-6 flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-[#242423] text-base font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:bg-zinc-100 dark:text-[#242423]"
        >
          {cta}
          <span className="relative size-4 overflow-hidden">
            <ArrowRight
              aria-hidden
              className="absolute inset-0 size-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-5"
            />
            <ArrowRight
              aria-hidden
              className="absolute inset-0 size-4 -translate-x-5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0"
            />
          </span>
        </motion.button>

        <div className="mt-4 flex items-center justify-center gap-5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon aria-hidden className="size-4" />
            50,000+ people
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheckIcon aria-hidden className="size-4" />
            No credit impact
          </span>
        </div>
      </div>
    );
  },
);