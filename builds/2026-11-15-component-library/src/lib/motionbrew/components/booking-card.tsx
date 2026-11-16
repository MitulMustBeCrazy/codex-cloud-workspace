"use client";

/**
 * BookingCard, from https://motion-brew.com/components/booking-card
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
import { useGSAP } from "@gsap/react";
import { type ClassValue, clsx } from "clsx";
import gsap from "gsap";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, type Transition, useAnimation, useReducedMotion, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: check
const CheckIcon = (() => {
interface CheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CheckIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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

const CheckIcon = forwardRef<CheckIconHandle, CheckIconProps>(
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
            d="M4 12 9 17L20 6"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

CheckIcon.displayName = "CheckIcon";
  return CheckIcon;
})();

// Animated icon: chevron-down
const ChevronDownIcon = (() => {
interface ChevronDownIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ChevronDownIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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

const ChevronDownIcon = forwardRef<ChevronDownIconHandle, ChevronDownIconProps>(
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
            d="m6 9 6 6 6-6"
            transition={DEFAULT_TRANSITION}
            variants={{
              normal: { y: 0 },
              animate: { y: [0, 2, 0] },
            }}
          />
        </svg>
      </span>
    );
  }
);

ChevronDownIcon.displayName = "ChevronDownIcon";
  return ChevronDownIcon;
})();

// Animated icon: rotate-ccw
const RotateCCWIcon = (() => {
interface RotateCCWIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface RotateCCWIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const RotateCCWIcon = forwardRef<RotateCCWIconHandle, RotateCCWIconProps>(
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
        if (isControlledRef.current) onMouseEnter?.(e);
        else controls.start("animate");
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) onMouseLeave?.(e);
        else controls.start("normal");
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
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
          variants={{
            normal: { rotate: "0deg" },
            animate: { rotate: "-50deg" },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </motion.svg>
      </span>
    );
  }
);

RotateCCWIcon.displayName = "RotateCCWIcon";
  return RotateCCWIcon;
})();

// BookingCard

/**
 * BookingCard
 *
 * Trigger: press. A white booking card for a trial class, a demo call or any
 * slot someone reserves. A strip of upcoming days scrolls sideways; picking a
 * day glides an ink pill to it on a spring, and the times for that day unfold
 * below with their own sliding pill. The full-width button wakes up once a
 * day and a time are chosen: its label rolls to the chosen slot, the arrow
 * nudges on hover, and a press runs a short spinner before the button turns
 * green and draws a check. Then the whole card becomes the confirmation: a
 * green seal spins in, draws its check and bursts sparks (the same seal as
 * VerifyFlow), the date and time tiles rise in with a clock whose hands sweep
 * to the booked time, and the add to calendar button flips its icon to a
 * check. Change goes back to the picker with the slot kept. Days and times
 * that are taken stay visible but can't be picked. Dates and times are radio groups with arrow keys, and
 * every change is announced. Reduced motion swaps the glides for fades.
 *
 * Engine: motion/react for the sliding pills, the unfolding times, the
 * button's label, spinner and check, and the confirmation's layout; gsap +
 * @gsap/react for the confirmation's drawn icons (scoped with useGSAP).
 */

gsap.registerPlugin(useGSAP);

export interface BookingCardProps {
  /** Card title. Default `"Book a free trial"`. */
  title?: string;
  /** Line under the title. */
  subtitle?: string;
  /** First day in the strip. Default today. */
  start?: Date;
  /** How many days the strip shows. The month menu lists every month they cover. Default `45`. */
  days?: number;
  /** Times offered each day, as labels. Default five slots from 09:00 to 18:00. */
  times?: string[];
  /** Days that can't be booked. Default Sundays. */
  isUnavailable?: (date: Date) => boolean;
  /** Times taken on a given day. Default a few, varying by day. */
  takenTimes?: (date: Date) => string[];
  /** Button label before a slot is chosen. Default `"Book a trial"`. */
  cta?: string;
  /** Heading on the confirmation. Default `"You're booked"`. */
  doneTitle?: string;
  /** Line under the confirmation heading. */
  doneText?: string;
  /** Called by the confirmation's add to calendar button. */
  onAddToCalendar?: (slot: { date: Date; time: string }) => void;
  /** Called on press with the chosen slot. Return a promise to hold the spinner until it settles. */
  onBook?: (slot: { date: Date; time: string }) => void | Promise<unknown>;
  className?: string;
}

type Phase = "idle" | "loading" | "done";

const PILL: Transition = { type: "spring", stiffness: 420, damping: 34 };
const GLIDE = [0.22, 1, 0.36, 1] as const;
const DEFAULT_TIMES = ["09:00", "10:30", "13:00", "15:30", "18:00"];
const SUCCESS = "#269a5a";

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  d.toLocaleDateString("en-US", opts);

/** A couple of taken times per day, stable for a given date. */
function defaultTaken(date: Date, times: string[]) {
  const seed = date.getDate() * 7 + date.getMonth() * 3;
  return times.filter(
    (_, i) => (seed + i * 5) % 7 === 0 || (seed + i) % 5 === 0,
  );
}

/** A label that rolls up out of a blur whenever its text changes. */
function Rolling({ text, still }: { text: string; still: boolean }) {
  return (
    <span className="relative inline-grid overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          className="whitespace-nowrap"
          initial={
            still
              ? { opacity: 0 }
              : { opacity: 0, y: "70%", filter: "blur(4px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            still
              ? { opacity: 0 }
              : { opacity: 0, y: "-70%", filter: "blur(4px)" }
          }
          transition={{ duration: 0.32, ease: GLIDE }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Arrow keys move through a radio group, skipping options that can't be picked. */
function roving<T>(
  e: React.KeyboardEvent,
  list: T[],
  current: number,
  enabled: (item: T) => boolean,
  pick: (i: number) => void,
) {
  const step =
    e.key === "ArrowRight" || e.key === "ArrowDown"
      ? 1
      : e.key === "ArrowLeft" || e.key === "ArrowUp"
        ? -1
        : 0;
  if (!step) return;
  e.preventDefault();
  for (let i = current + step; i >= 0 && i < list.length; i += step)
    if (enabled(list[i]!)) return pick(i);
}

interface Month {
  key: string;
  label: string;
  /** Index of the month's first day in the strip. */
  first: number;
}

/**
 * A small pill that names the month in view and opens a list of months. The menu grows out of the pill,
 * a soft highlight follows the pointer, and picking a month glides the strip to its first day.
 */
function MonthMenu({
  months,
  current,
  onPick,
  still,
}: {
  months: Month[];
  current: number;
  onPick: (i: number) => void;
  still: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [hover, setHover] = React.useState(current);
  const root = React.useRef<HTMLDivElement>(null);
  const button = React.useRef<HTMLButtonElement>(null);
  const options = React.useRef<(HTMLButtonElement | null)[]>([]);
  const id = React.useId();

  React.useEffect(() => {
    if (!open) return;
    setHover(current);
    requestAnimationFrame(() => options.current[current]?.focus());
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open, current]);

  const choose = (i: number, keyboard: boolean) => {
    onPick(i);
    setOpen(false);
    // Only hand focus back for keyboard users, so a mouse pick leaves no ring.
    if (keyboard) button.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      button.current?.focus();
      return;
    }
    const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(months.length - 1, hover + step));
    setHover(next);
    options.current[next]?.focus();
  };

  return (
    <div ref={root} className="relative shrink-0" onKeyDown={onKey}>
      <motion.button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`Month, ${months[current]?.label}`}
        onClick={() => setOpen((o) => !o)}
        whileTap={still ? undefined : { scale: 0.96 }}
        className="flex h-8 cursor-pointer items-center gap-1 rounded-full bg-zinc-100 pl-3 pr-2 text-xs font-medium outline-none transition-colors hover:bg-zinc-200/80 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/6 dark:hover:bg-white/10"
      >
        <Rolling text={months[current]?.label ?? ""} still={still} />
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={still ? { duration: 0 } : PILL}
          className="grid"
        >
          <ChevronDownIcon className="size-4 text-zinc-500" strokeWidth={2.25} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-list`}
            role="listbox"
            aria-label="Month"
            initial={
              still
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.92, y: -4, filter: "blur(4px)" }
            }
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={
              still
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: -4, filter: "blur(4px)" }
            }
            transition={{ duration: 0.22, ease: GLIDE }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-full z-20 mt-2 w-44 rounded-2xl bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_16px_40px_-12px_rgba(0,0,0,0.28)] ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10"
            onPointerLeave={() => setHover(current)}
          >
            {months.map((m, i) => (
              <button
                key={m.key}
                ref={(el) => void (options.current[i] = el)}
                type="button"
                role="option"
                aria-selected={i === current}
                tabIndex={i === hover ? 0 : -1}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={(e) => choose(i, e.detail === 0)}
                className="relative flex h-9 w-full cursor-pointer items-center justify-between rounded-xl px-3 text-left text-sm outline-none"
              >
                {i === hover && (
                  <motion.span
                    layoutId={`${id}-hover`}
                    className="absolute inset-0 rounded-xl bg-zinc-100 dark:bg-white/8"
                    transition={still ? { duration: 0 } : PILL}
                  />
                )}
                <span className="relative">{m.label}</span>
                {i === current && (
                  <CheckIcon
                    className="relative size-4"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Scalloped seal outline, centred in a 100 by 100 box. */
function sealPath(bumps = 9, depth = 0.085, r = 42) {
  const pts: string[] = [];
  for (let i = 0; i <= 180; i++) {
    const t = (i / 180) * Math.PI * 2;
    const rr = r * (1 + depth * Math.cos(bumps * t));
    pts.push(
      `${(50 + Math.cos(t) * rr).toFixed(2)} ${(50 + Math.sin(t) * rr).toFixed(2)}`,
    );
  }
  return `M${pts.join(" L")}Z`;
}
const SEAL = sealPath();

/** Green seal that spins in, draws its check and bursts sparks, then floats. One GSAP timeline on mount, the same seal as VerifyFlow. */
function SuccessSeal({ accent, still }: { accent: string; still: boolean }) {
  const ref = React.useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const q = (sel: string) => ref.current!.querySelectorAll(sel);
      if (still) {
        gsap.set(q(".seal-tick"), { strokeDashoffset: 0 });
        return;
      }
      gsap
        .timeline({ delay: 0.6 })
        .from(q(".seal"), {
          scale: 0,
          rotation: -60,
          svgOrigin: "60 60",
          duration: 0.7,
          ease: "back.out(1.9)",
        })
        .to(
          q(".seal-tick"),
          { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" },
          0.32,
        )
        .fromTo(
          q(".spark"),
          {
            autoAlpha: 1,
            attr: { "stroke-dashoffset": 1 },
            scale: 0.6,
            svgOrigin: "60 60",
          },
          {
            attr: { "stroke-dashoffset": 0 },
            scale: 1,
            duration: 0.35,
            ease: "power3.out",
            stagger: 0.02,
          },
          0.28,
        )
        .to(
          q(".spark"),
          {
            autoAlpha: 0,
            scale: 1.18,
            svgOrigin: "60 60",
            duration: 0.45,
            ease: "power2.in",
            stagger: 0.02,
          },
          0.62,
        )
        .fromTo(
          q(".dot"),
          { autoAlpha: 1, scale: 0.3, svgOrigin: "60 60" },
          {
            scale: 1.35,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power2.out",
            stagger: 0.03,
          },
          0.3,
        )
        .to(
          q(".seal-wrap"),
          { y: -3, duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true },
          1.1,
        );
    },
    { scope: ref },
  );
  const sparks = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2 + 0.2;
    return {
      x1: 60 + Math.cos(a) * 48,
      y1: 60 + Math.sin(a) * 48,
      x2: 60 + Math.cos(a) * 58,
      y2: 60 + Math.sin(a) * 58,
    };
  });
  const dots = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    return { cx: 60 + Math.cos(a) * 54, cy: 60 + Math.sin(a) * 54 };
  });
  return (
    <svg
      ref={ref}
      viewBox="0 0 120 120"
      className="size-[104px] overflow-visible"
      aria-hidden
    >
      {sparks.map((p, i) => (
        <line
          key={i}
          className="spark"
          {...p}
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ visibility: "hidden" }}
        />
      ))}
      {dots.map((p, i) => (
        <circle
          key={i}
          className="dot"
          {...p}
          r="2.4"
          fill={i % 2 ? "#f5c542" : accent}
          style={{ visibility: "hidden" }}
        />
      ))}
      <g className="seal-wrap">
        <g className="seal">
          <path d={SEAL} transform="translate(10 10)" fill={accent} />
          <path
            className="seal-tick"
            d="M44 61l11 11 22-23"
            fill="none"
            stroke="#fff"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
        </g>
      </g>
    </svg>
  );
}

/** Small clock whose hands sweep round to the booked time. */
function MiniClock({ time, still }: { time: string; still: boolean }) {
  const root = React.useRef<SVGSVGElement>(null);
  const [h, m] = time.split(":").map(Number) as [number, number];
  useGSAP(
    () => {
      const hour = ((h % 12) + (m || 0) / 60) * 30;
      const minute = (m || 0) * 6;
      const o = {
        svgOrigin: "12 12",
        ease: "power3.out",
        duration: still ? 0 : 1.2,
        delay: still ? 0 : 1.2,
      };
      gsap.fromTo("[data-hour]", { rotation: 0 }, { rotation: hour, ...o });
      gsap.fromTo(
        "[data-minute]",
        { rotation: 0 },
        { rotation: minute + (still ? 0 : 360), ...o },
      );
    },
    { scope: root, dependencies: [time] },
  );
  return (
    <svg
      ref={root}
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <line data-hour x1="12" y1="12" x2="12" y2="7.5" />
      <line data-minute x1="12" y1="12" x2="12" y2="5.5" />
    </svg>
  );
}

/** Small calendar whose page drops in and whose day dot pops. */
function MiniCalendar({ still }: { still: boolean }) {
  const root = React.useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      if (still) return;
      gsap.from("[data-page]", {
        scaleY: 0,
        svgOrigin: "12 5",
        duration: 0.45,
        delay: 1.1,
        ease: "back.out(2)",
      });
      gsap.from("[data-dot]", {
        scale: 0,
        svgOrigin: "12 15",
        duration: 0.35,
        delay: 1.45,
        ease: "back.out(4)",
      });
    },
    { scope: root },
  );
  return (
    <svg
      ref={root}
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <g data-page>
        <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
        <line x1="3.5" y1="10" x2="20.5" y2="10" />
      </g>
      <line x1="8.5" y1="3" x2="8.5" y2="6.5" />
      <line x1="15.5" y1="3" x2="15.5" y2="6.5" />
      <circle
        data-dot
        cx="12"
        cy="15"
        r="1.75"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

const STAGGER = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.75 } },
};
const RISE = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: GLIDE },
  },
};

/** The whole card turns into the confirmation once a booking lands. */
function Confirmation({
  date,
  time,
  title,
  text,
  onChange,
  onAdd,
  still,
}: {
  date: Date;
  time: string;
  title: string;
  text: string;
  onChange: () => void;
  onAdd?: () => void;
  still: boolean;
}) {
  const [added, setAdded] = React.useState(false);
  const focus = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => focus.current?.focus(), []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: still ? 0 : 0.45 }}
    >
      <motion.div
        variants={still ? undefined : STAGGER}
        initial="hidden"
        animate="shown"
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        <SuccessSeal accent={SUCCESS} still={still} />
        <motion.h3
          ref={focus}
          tabIndex={-1}
          variants={still ? undefined : RISE}
          className="mt-2 text-lg font-semibold tracking-tight outline-none"
        >
          {title}
        </motion.h3>
        <motion.p
          variants={still ? undefined : RISE}
          className="mt-1 text-sm text-zinc-500 dark:text-zinc-400"
        >
          {text}
        </motion.p>
        <motion.div
          variants={still ? undefined : RISE}
          className="mt-5 grid w-full grid-cols-2 gap-2 text-left"
        >
          {[
            {
              icon: <MiniCalendar still={still} />,
              label: "Date",
              value: fmt(date, {
                weekday: "short",
                month: "short",
                day: "numeric",
              }),
            },
            {
              icon: <MiniClock time={time} still={still} />,
              label: "Time",
              value: time,
            },
          ].map((d) => (
            <motion.div
              key={d.label}
              whileHover={still ? undefined : { y: -2 }}
              transition={PILL}
              className="flex items-center gap-3 rounded-2xl bg-zinc-100 p-3 dark:bg-white/6"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-zinc-800 dark:text-zinc-100">
                {d.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {d.label}
                </span>
                <span className="block truncate text-sm font-medium tabular-nums">
                  {d.value}
                </span>
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={still ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: GLIDE, delay: still ? 0 : 1.05 }}
        className="mt-5 flex gap-2"
      >
        <motion.button
          type="button"
          onClick={onChange}
          whileTap={still ? undefined : { scale: 0.96 }}
          className="group flex h-12 cursor-pointer items-center gap-2 rounded-full bg-zinc-100 px-5 text-sm font-medium outline-none transition-colors hover:bg-zinc-200/80 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/6 dark:hover:bg-white/10"
        >
          <RotateCCWIcon
            className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-[200deg]"
            strokeWidth={2.25}
            aria-hidden
          />
          Change
        </motion.button>
        <motion.button
          type="button"
          onClick={() => {
            if (added) return;
            setAdded(true);
            onAdd?.();
          }}
          whileTap={still || added ? undefined : { scale: 0.98 }}
          animate={{ backgroundColor: added ? SUCCESS : "#242423" }}
          transition={{ duration: still ? 0 : 0.3, ease: GLIDE }}
          className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
        >
          <span className="relative grid size-4 place-items-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={added ? "check" : "plus"}
                className="grid"
                initial={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.4, rotate: -90 }
                }
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.4, rotate: 90 }
                }
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
              >
                {added ? (
                  <CheckIcon className="size-4" strokeWidth={2.5} aria-hidden />
                ) : (
                  <CalendarPlus
                    className="size-4"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                )}
              </motion.span>
            </AnimatePresence>
          </span>
          <Rolling
            text={added ? "Added to calendar" : "Add to calendar"}
            still={still}
          />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export const BookingCard = React.forwardRef<HTMLDivElement, BookingCardProps>(
  function BookingCard(
    {
      title = "Book a free trial",
      subtitle = "Every new member gets one class on us. Pick a date below to get started.",
      start,
      days = 45,
      times = DEFAULT_TIMES,
      isUnavailable = (d) => d.getDay() === 0,
      takenTimes,
      cta = "Book a trial",
      doneTitle = "You're booked",
      doneText = "We sent the details to your inbox. See you soon.",
      onAddToCalendar,
      onBook,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const id = React.useId();
    const strip = React.useRef<HTMLDivElement>(null);
    const dayRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
    const timeRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

    const dates = React.useMemo(() => {
      const first = start ? new Date(start) : new Date();
      first.setHours(0, 0, 0, 0);
      return Array.from({ length: Math.max(1, days) }, (_, i) => {
        const d = new Date(first);
        d.setDate(first.getDate() + i);
        return d;
      });
    }, [start?.getTime(), days]);

    const months = React.useMemo(() => {
      const list: Month[] = [];
      dates.forEach((d, i) => {
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (list[list.length - 1]?.key !== key)
          list.push({
            key,
            label: fmt(d, { month: "long", year: "numeric" }),
            first: i,
          });
      });
      return list;
    }, [dates]);
    const [view, setView] = React.useState(0);

    // The month pill follows whichever day sits at the left edge of the strip.
    const onStripScroll = () => {
      const box = strip.current;
      if (!box) return;
      const edge = box.scrollLeft + 24;
      let i = dayRefs.current.findIndex(
        (el) => el && el.offsetLeft + el.offsetWidth / 2 >= edge,
      );
      if (i < 0) i = dates.length - 1;
      const key = `${dates[i]!.getFullYear()}-${dates[i]!.getMonth()}`;
      const m = months.findIndex((x) => x.key === key);
      if (m >= 0 && m !== view) setView(m);
    };

    const showMonth = (m: number) => {
      setView(m);
      const box = strip.current;
      const el = dayRefs.current[months[m]!.first];
      if (box && el)
        box.scrollTo({
          left: el.offsetLeft - 24,
          behavior: still ? "auto" : "smooth",
        });
    };

    const [day, setDay] = React.useState<Date | null>(null);
    const [time, setTime] = React.useState<string | null>(null);
    const [phase, setPhase] = React.useState<Phase>("idle");

    const taken = React.useMemo(
      () => (day ? (takenTimes?.(day) ?? defaultTaken(day, times)) : []),
      [day, takenTimes, times],
    );
    const ready = !!day && !!time;
    const locked = phase !== "idle";

    const pickDay = (i: number, focus = false) => {
      const d = dates[i]!;
      if (locked || isUnavailable(d)) return;
      setDay(d);
      setTime(null);
      const el = dayRefs.current[i];
      if (focus) el?.focus();
      // Center the chosen day in the strip without scrolling the page.
      const box = strip.current;
      if (el && box)
        box.scrollTo({
          left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2,
          behavior: still ? "auto" : "smooth",
        });
    };

    const pickTime = (i: number, focus = false) => {
      const t = times[i]!;
      if (locked || taken.includes(t)) return;
      setTime(t);
      if (focus) timeRefs.current[i]?.focus();
    };

    const book = async () => {
      if (!ready || locked) return;
      setPhase("loading");
      try {
        await Promise.all([
          onBook?.({ date: day!, time: time! }),
          new Promise((r) => setTimeout(r, still ? 200 : 900)),
        ]);
        setPhase("done");
      } catch {
        setPhase("idle");
      }
    };

    // Back to the picker with the slot still chosen, so it can be tweaked.
    const reset = () => setPhase("idle");
    const picker = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      if (picker.current) picker.current.inert = phase === "done";
    }, [phase]);

    const slot = day
      ? `${fmt(day, { weekday: "short", month: "short", day: "numeric" })}${time ? `, ${time}` : ""}`
      : "";
    const label =
      phase === "loading"
        ? "Booking"
        : phase === "done"
          ? "Booked"
          : ready
            ? `${cta} for ${slot}`
            : day
              ? "Pick a time"
              : cta;
    const status =
      phase === "done"
        ? `Booked for ${slot}.`
        : phase === "loading"
          ? "Booking."
          : time
            ? `${slot} selected.`
            : day
              ? `${fmt(day, { weekday: "long", month: "long", day: "numeric" })} selected. Pick a time.`
              : "";

    const dayIndex = day ? dates.findIndex((d) => sameDay(d, day)) : -1;
    const timeIndex = time ? times.indexOf(time) : -1;
    const firstOpenDay = dates.findIndex((d) => !isUnavailable(d));
    const firstOpenTime = times.findIndex((t) => !taken.includes(t));

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-[400px] max-w-full overflow-hidden rounded-3xl bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        <motion.div
          ref={picker}
          aria-hidden={phase === "done"}
          animate={
            phase === "done"
              ? {
                  opacity: 0,
                  scale: still ? 1 : 0.97,
                  filter: still ? "blur(0px)" : "blur(6px)",
                }
              : { opacity: 1, scale: 1, filter: "blur(0px)" }
          }
          transition={{
            duration: still ? 0 : 0.35,
            ease: GLIDE,
            delay: phase === "done" && !still ? 0.35 : 0,
          }}
          className="p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            {months.length > 0 && (
              <MonthMenu
                months={months}
                current={Math.min(view, months.length - 1)}
                onPick={showMonth}
                still={still}
              />
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>

          <LayoutGroup id={id}>
            {/* Days scroll sideways; the edges fade so the strip reads as endless. */}
            <div
              ref={strip}
              role="radiogroup"
              aria-label="Date"
              onScroll={onStripScroll}
              className="relative -mx-6 mt-5 flex snap-x scroll-px-6 gap-2 overflow-x-auto px-6 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent)",
              }}
            >
              {dates.map((d, i) => {
                const off = isUnavailable(d);
                const on = i === dayIndex;
                return (
                  <motion.button
                    key={d.toISOString()}
                    ref={(el) => void (dayRefs.current[i] = el)}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-disabled={off || locked}
                    aria-label={`${fmt(d, { weekday: "long", month: "long", day: "numeric" })}${off ? ", unavailable" : ""}`}
                    tabIndex={
                      on || (dayIndex < 0 && i === firstOpenDay) ? 0 : -1
                    }
                    onClick={() => pickDay(i)}
                    onKeyDown={(e) =>
                      roving(
                        e,
                        dates,
                        dayIndex < 0 ? i : dayIndex,
                        (x) => !isUnavailable(x),
                        (j) => pickDay(j, true),
                      )
                    }
                    whileTap={
                      off || locked || still ? undefined : { scale: 0.94 }
                    }
                    className={cn(
                      "relative flex h-[72px] w-14 shrink-0 snap-start flex-col items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                      off
                        ? "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
                        : "cursor-pointer",
                      !off &&
                        !on &&
                        "bg-zinc-100 transition-colors hover:bg-zinc-200/80 dark:bg-white/6 dark:hover:bg-white/10",
                      off && "bg-zinc-50 dark:bg-white/[0.03]",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId="day-pill"
                        className="absolute inset-0 rounded-2xl bg-[#242423] dark:bg-white"
                        transition={still ? { duration: 0 } : PILL}
                      />
                    )}
                    <span
                      className={cn(
                        "relative text-xs font-medium transition-colors duration-200",
                        on
                          ? "text-white/70 dark:text-zinc-500"
                          : !off && "text-zinc-500 dark:text-zinc-400",
                      )}
                    >
                      {fmt(d, { weekday: "short" })}
                    </span>
                    <span
                      className={cn(
                        "relative mt-0.5 text-xl font-semibold tabular-nums transition-colors duration-200",
                        on && "text-white dark:text-zinc-900",
                        off && "line-through decoration-1",
                      )}
                    >
                      {d.getDate()}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Times unfold once a day is chosen. */}
            <AnimatePresence initial={false}>
              {day && (
                <motion.div
                  key="times"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={
                    still ? { duration: 0 } : { duration: 0.4, ease: GLIDE }
                  }
                  className="overflow-hidden"
                >
                  <p id={`${id}-times`} className="mt-5 text-sm font-medium">
                    Select a time
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby={`${id}-times`}
                    className="mt-3 grid grid-cols-5 gap-2 pb-1"
                  >
                    {times.map((t, i) => {
                      const off = taken.includes(t);
                      const on = t === time;
                      return (
                        <motion.button
                          key={`${day.toDateString()}-${t}`}
                          ref={(el) => void (timeRefs.current[i] = el)}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          aria-disabled={off || locked}
                          aria-label={`${t}${off ? ", taken" : ""}`}
                          tabIndex={
                            on || (timeIndex < 0 && i === firstOpenTime)
                              ? 0
                              : -1
                          }
                          onClick={() => pickTime(i)}
                          onKeyDown={(e) =>
                            roving(
                              e,
                              times,
                              timeIndex < 0 ? i : timeIndex,
                              (x) => !taken.includes(x),
                              (j) => pickTime(j, true),
                            )
                          }
                          initial={still ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: GLIDE,
                            delay: still ? 0 : 0.06 + i * 0.035,
                          }}
                          whileTap={
                            off || locked || still ? undefined : { scale: 0.94 }
                          }
                          className={cn(
                            "relative h-10 rounded-full text-sm font-medium tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                            off
                              ? "cursor-not-allowed bg-zinc-50 text-zinc-300 line-through decoration-1 dark:bg-white/[0.03] dark:text-zinc-600"
                              : "cursor-pointer",
                            !off &&
                              !on &&
                              "bg-zinc-100 transition-colors hover:bg-zinc-200/80 dark:bg-white/6 dark:hover:bg-white/10",
                          )}
                        >
                          {on && (
                            <motion.span
                              layoutId="time-pill"
                              className="absolute inset-0 rounded-full bg-[#242423] dark:bg-white"
                              transition={still ? { duration: 0 } : PILL}
                            />
                          )}
                          <span
                            className={cn(
                              "relative transition-colors duration-200",
                              on && "text-white dark:text-zinc-900",
                            )}
                          >
                            {t}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>

          {/* The button wakes once a slot is chosen, then spins and lands on a drawn check. */}
          <motion.button
            type="button"
            onClick={book}
            aria-disabled={!ready && phase === "idle"}
            whileTap={
              ready && !still && phase === "idle" ? { scale: 0.98 } : undefined
            }
            animate={{
              backgroundColor:
                phase === "done"
                  ? SUCCESS
                  : ready || locked
                    ? "#242423"
                    : "#f4f4f5",
              color: ready || locked ? "#ffffff" : "#a1a1aa",
            }}
            transition={{ duration: still ? 0 : 0.3, ease: GLIDE }}
            className={cn(
              "group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
              ready || phase === "done" ? "cursor-pointer" : "cursor-default",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {phase === "loading" && (
                <motion.span
                  key="spin"
                  aria-hidden
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1, rotate: still ? 0 : 360 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{
                    rotate: { duration: 0.8, ease: "linear", repeat: Infinity },
                    default: { duration: 0.2 },
                  }}
                  className="size-4 rounded-full border-2 border-white/30 border-t-white"
                />
              )}
              {phase === "done" && (
                <motion.svg
                  key="check"
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="size-4"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                >
                  <motion.path
                    d="M3.5 8.5 6.5 11.5 12.5 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: still ? 1 : 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.35, ease: GLIDE, delay: 0.08 }}
                  />
                </motion.svg>
              )}
            </AnimatePresence>
            <Rolling text={label} still={still} />
            {phase === "idle" && (
              <span aria-hidden className="relative size-4 overflow-hidden">
                <ArrowRight
                  strokeWidth={2.25}
                  className={cn(
                    "absolute inset-0 size-4 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    ready && !still && "group-hover:translate-x-[140%]",
                  )}
                />
                <ArrowRight
                  strokeWidth={2.25}
                  className={cn(
                    "absolute inset-0 size-4 -translate-x-[140%] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    ready &&
                      !still &&
                      "group-hover:translate-x-0 group-hover:delay-75",
                  )}
                />
              </span>
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {phase === "done" && day && time && (
            <Confirmation
              key="done"
              date={day}
              time={time}
              title={doneTitle}
              text={doneText}
              onChange={reset}
              onAdd={() => onAddToCalendar?.({ date: day, time })}
              still={still}
            />
          )}
        </AnimatePresence>

        <span role="status" aria-live="polite" className="sr-only">
          {status}
        </span>
      </div>
    );
  },
);