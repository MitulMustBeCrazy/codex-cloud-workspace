"use client";

/**
 * CalendarAgenda, from https://motion-brew.com/components/calendar-agenda
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
import { Trash2 } from "lucide-react";
import { animate, AnimatePresence, motion, type PanInfo, useAnimation, useMotionValue, useReducedMotion, useTransform, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: calendar-check-2
const CalendarCheck2Icon = (() => {
interface CalendarCheck2IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CalendarCheck2IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const CHECK_VARIANTS: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: 0.4, ease: "easeInOut" },
      opacity: { duration: 0.4, ease: "easeInOut" },
    },
  },
};

const CalendarCheck2Icon = forwardRef<
  CalendarCheck2IconHandle,
  CalendarCheck2IconProps
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
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
        <path d="M3 10h18" />
        <motion.path
          animate={controls}
          d="m16 20 2 2 4-4"
          initial="normal"
          style={{ transformOrigin: "center" }}
          variants={CHECK_VARIANTS}
        />
      </svg>
    </span>
  );
});

CalendarCheck2Icon.displayName = "CalendarCheck2Icon";
  return CalendarCheck2Icon;
})();

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

// Animated icon: plus
const PlusIcon = (() => {
interface PlusIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface PlusIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PlusIcon = forwardRef<PlusIconHandle, PlusIconProps>(
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
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          variants={{
            normal: {
              rotate: 0,
            },
            animate: {
              rotate: 180,
            },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </motion.svg>
      </span>
    );
  }
);

PlusIcon.displayName = "PlusIcon";
  return PlusIcon;
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

// Animated icon: sparkles
const SparklesIcon = (() => {
interface SparklesIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SparklesIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SPARKLE_VARIANTS: Variants = {
  initial: {
    y: 0,
    fill: "none",
  },
  hover: {
    y: [0, -1, 0, 0],
    fill: "currentColor",
    transition: {
      duration: 1,
      bounce: 0.3,
    },
  },
};

const STAR_VARIANTS: Variants = {
  initial: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  blink: () => ({
    opacity: [0, 1, 0, 0, 0, 0, 1],
    transition: {
      duration: 2,
      type: "spring",
      stiffness: 70,
      damping: 10,
      mass: 0.4,
    },
  }),
};

const SparklesIcon = forwardRef<SparklesIconHandle, SparklesIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const starControls = useAnimation();
    const sparkleControls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => {
          sparkleControls.start("hover");
          starControls.start("blink", { delay: 1 });
        },
        stopAnimation: () => {
          sparkleControls.start("initial");
          starControls.start("initial");
        },
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          sparkleControls.start("hover");
          starControls.start("blink", { delay: 1 });
        }
      },
      [onMouseEnter, sparkleControls, starControls]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          sparkleControls.start("initial");
          starControls.start("initial");
        }
      },
      [sparkleControls, starControls, onMouseLeave]
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
            animate={sparkleControls}
            d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
            variants={SPARKLE_VARIANTS}
          />
          <motion.path
            animate={starControls}
            d="M20 3v4"
            variants={STAR_VARIANTS}
          />
          <motion.path
            animate={starControls}
            d="M22 5h-4"
            variants={STAR_VARIANTS}
          />
          <motion.path
            animate={starControls}
            d="M4 17v2"
            variants={STAR_VARIANTS}
          />
          <motion.path
            animate={starControls}
            d="M5 18H3"
            variants={STAR_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

SparklesIcon.displayName = "SparklesIcon";
  return SparklesIcon;
})();

// CalendarAgenda

/**
 * CalendarAgenda
 *
 * Trigger: drag (plus press and keys). A day planner card: a week strip on top
 * and the chosen day's events below, each with its time, length and a colored
 * bar. Swipe a row left to mark it done: a green Done grows from under its
 * right edge, only as wide as the slide; tap it or swipe far, and the title is
 * struck through while confetti rises from across the row and floats up out of
 * the card. Swiping a done row left offers Undo. Swipe a row right to delete
 * it: the row slides off a red Delete underneath, and the rows below slide up to
 * close the gap. Picking another day slides the selection pill across and swaps
 * the list with a soft blur, and the header counts what is left. Rows are real
 * list items: Enter or Space marks done, Delete or Backspace removes, and
 * changes are announced. Reduced motion keeps every action but skips the travel
 * and the confetti.
 *
 * Engine: motion/react (drag with snap points, layout and exit animations, the
 * sliding day pill) plus a small built-in canvas confetti system.
 */

export interface AgendaEvent {
  id: string;
  /** Start time label, like `"10:00"`. */
  time: string;
  /** Length label, like `"1h"`. */
  length?: string;
  title: string;
  /** Second line, like `"4 people · Zoom"`. */
  meta?: string;
  /** Bar and confetti color. */
  color?: string;
  /** Small status pill, like `"in 19 min"`. */
  tag?: string;
  /** A free slot: shown muted, with no actions. */
  free?: boolean;
  done?: boolean;
}

export interface AgendaDay {
  /** Short weekday, like `"Tue"`. */
  label: string;
  /** Day of the month. */
  date: number;
  /** Heading when selected, like `"Tuesday"`. */
  title: string;
  /** Line under the heading, like `"11 November"`. */
  subtitle?: string;
  events: AgendaEvent[];
}

export interface CalendarAgendaProps {
  /** The week. Default a sample week. */
  days?: AgendaDay[];
  /** Index of the day shown first. Default `1`. */
  defaultDay?: number;
  /** Confetti when an event is marked done. Default `true`. */
  confetti?: boolean;
  /** Called when an event is marked done or reopened. */
  onToggle?: (event: AgendaEvent, done: boolean) => void;
  /** Called when an event is deleted. */
  onDelete?: (event: AgendaEvent) => void;
  /** Called by the round add button. */
  onAdd?: () => void;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const CONFETTI = [
  "#3d66d6",
  "#d6498f",
  "#269a5a",
  "#9150e0",
  "#cf7a1c",
  "#f5c542",
  "#2a9fbf",
];
/** How far a row slides to hold an action open. */
const OPEN = 104;

const ev = (
  id: string,
  time: string,
  title: string,
  rest: Partial<AgendaEvent> = {},
): AgendaEvent => ({ id, time, title, ...rest });

const DEFAULT_DAYS: AgendaDay[] = [
  {
    label: "Mon",
    date: 10,
    title: "Monday",
    subtitle: "10 November",
    events: [
      ev("m1", "09:30", "Weekly planning", {
        length: "45m",
        meta: "Product team",
        color: "#3d66d6",
      }),
      ev("m2", "14:00", "Dentist", {
        length: "1h",
        meta: "Harbour Street",
        color: "#cf7a1c",
      }),
    ],
  },
  {
    label: "Tue",
    date: 11,
    title: "Today",
    subtitle: "Tuesday, 11 November",
    events: [
      ev("t1", "10:00", "Design review", {
        length: "1h",
        meta: "4 people · Zoom",
        color: "#d6498f",
        tag: "in 19 min",
      }),
      ev("t2", "12:30", "Lunch with team", {
        length: "1h",
        meta: "Studio kitchen",
        color: "#f5c542",
      }),
      ev("t3", "16:00", "30 min walk", {
        length: "30m",
        meta: "From the office",
        color: "#242423",
      }),
      ev("t4", "17:00", "Free", {
        meta: "Nothing booked until tomorrow",
        free: true,
      }),
    ],
  },
  {
    label: "Wed",
    date: 12,
    title: "Wednesday",
    subtitle: "12 November",
    events: [
      ev("w1", "11:00", "Ship the release notes", {
        length: "2h",
        meta: "Deep work",
        color: "#9150e0",
      }),
    ],
  },
  {
    label: "Thu",
    date: 13,
    title: "Thursday",
    subtitle: "13 November",
    events: [
      ev("h1", "08:00", "Gym", {
        length: "1h",
        meta: "Before work",
        color: "#269a5a",
      }),
      ev("h2", "15:30", "1:1 with Maya", {
        length: "30m",
        meta: "Coffee corner",
        color: "#2a9fbf",
      }),
    ],
  },
  {
    label: "Fri",
    date: 14,
    title: "Friday",
    subtitle: "14 November",
    events: [
      ev("f1", "16:30", "Demo day", {
        length: "1h",
        meta: "Whole company",
        color: "#d6498f",
      }),
    ],
  },
  {
    label: "Sat",
    date: 15,
    title: "Saturday",
    subtitle: "15 November",
    events: [],
  },
  {
    label: "Sun",
    date: 16,
    title: "Sunday",
    subtitle: "16 November",
    events: [],
  },
];

// ---------------------------------------------------------------------------
// Confetti: a small particle system on one canvas laid over the card.

interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
  size: number;
  color: string;
  shape: 0 | 1 | 2;
  age: number;
  life: number;
}

/** Keep a canvas's pixel buffer the same size as its box (at up to 2x density). */
function fit(c: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.round(c.clientWidth * dpr);
  const h = Math.round(c.clientHeight * dpr);
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
}

function useConfetti(enabled: boolean) {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const bits = React.useRef<Bit[]>([]);
  const raf = React.useRef(0);

  const loop = React.useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // The card can change height mid-burst (a row collapses), so match the buffer to the box every frame and
      // clear all of it. Clearing only the old box size left a strip that was never wiped, which smeared.
      fit(c);
      const dpr = c.width / Math.max(1, c.clientWidth);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bits.current = bits.current.filter((b) => (b.age += dt) < b.life);
      for (const b of bits.current) {
        b.vy += 1500 * dt;
        b.vx *= 1 - 1.6 * dt;
        b.vy *= 1 - 0.9 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.r += b.vr * dt;
        ctx.save();
        ctx.globalAlpha = Math.min(1, (b.life - b.age) / (b.life * 0.35));
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.fillStyle = b.color;
        if (b.shape === 0)
          ctx.fillRect(-b.size, -b.size / 2.4, b.size * 2, b.size / 1.2);
        else if (b.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, b.size / 1.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // A four-point sparkle.
          const s = b.size * 1.1;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        }
        ctx.restore();
      }
      if (bits.current.length) raf.current = requestAnimationFrame(frame);
      else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, c.width, c.height);
      }
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(frame);
  }, []);

  React.useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /**
   * Confetti rises from across a whole area (a row, or the list), mostly straight up and out of the card, with only
   * a little sideways drift so it stays as wide as the card.
   */
  const burst = React.useCallback(
    (area: DOMRect, accent?: string, amount = 34) => {
      const c = canvas.current;
      if (!enabled || !c) return;
      fit(c);
      const rect = c.getBoundingClientRect();
      const left = area.left - rect.left;
      const y = area.top - rect.top + area.height / 2;
      const colors = accent ? [accent, accent, ...CONFETTI] : CONFETTI;
      for (let i = 0; i < amount; i++) {
        bits.current.push({
          x: left + 12 + Math.random() * Math.max(0, area.width - 24),
          y: y + (Math.random() - 0.5) * area.height * 0.5,
          vx: (Math.random() - 0.5) * 120,
          vy: -(820 + Math.random() * 360),
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 12,
          size: 2.5 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)]!,
          shape: (i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0) as 0 | 1 | 2,
          age: 0,
          life: 1.5 + Math.random() * 0.5,
        });
      }
      loop();
    },
    [enabled, loop],
  );

  return { canvas, burst };
}

// ---------------------------------------------------------------------------

/** Which action a row is showing: done on the right (row slid left), delete on the left (row slid right). */
type Side = "done" | "delete" | null;

interface RowProps {
  event: AgendaEvent;
  open: Side;
  onOpen: (side: Side) => void;
  onToggle: (row: HTMLElement | null) => void;
  onDelete: () => void;
  still: boolean;
}

function Row({ event, open, onOpen, onToggle, onDelete, still }: RowProps) {
  const x = useMotionValue(0);
  const root = React.useRef<HTMLDivElement>(null);
  const color = event.color ?? "#242423";
  const done = !!event.done;
  // Each action sits under the whole row; the row is solid, so only the part it slides off shows. A soft shadow
  // lifts the row while it is pulled, so it reads as one card sliding over the action beneath it.
  const lift = useTransform(x, (v) => {
    const a = Math.min(1, Math.abs(v) / 40);
    return `0 1px 2px rgba(0,0,0,${(0.06 * a).toFixed(3)}), 0 8px 20px -10px rgba(0,0,0,${(0.25 * a).toFixed(3)})`;
  });
  const doneOpacity = useTransform(x, [-8, -40], [0, 1]);
  const deleteOpacity = useTransform(x, [8, 40], [0, 1]);
  // Icons show first; the words fade in once there is room for them.
  const doneLabel = useTransform(x, [-70, -100], [0, 1]);
  const deleteLabel = useTransform(x, [70, 100], [0, 1]);
  const spring = still
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 520, damping: 40 } as const);

  // While a row is looping off the left and back in from the right, nothing else may move it or show beneath it.
  const passing = React.useRef(false);
  const [hideActions, setHideActions] = React.useState(false);

  React.useEffect(() => {
    if (passing.current) return;
    animate(x, open === "done" ? -OPEN : open === "delete" ? OPEN : 0, spring);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, x, still]);

  const markDone = async (releaseSpeed = 0) => {
    // Reopening is a plain snap back.
    if (done || still) {
      onOpen(null);
      onToggle(root.current);
      animate(x, 0, spring);
      return;
    }
    // Completing is one continuous move: the row keeps going off the left, then comes back in from the right
    // already done, the strike drawing across as it settles, while the confetti rises.
    const width = root.current?.offsetWidth ?? 400;
    passing.current = true;
    setHideActions(true);
    // Carry on at the speed of the swipe (never slower than a brisk 1400px/s), at a steady pace, so there is no
    // pause between letting go and the row leaving.
    const distance = Math.abs(-(width + 24) - x.get());
    const speed = Math.max(1400, Math.abs(releaseSpeed));
    await animate(x, -(width + 24), {
      duration: distance / speed,
      ease: "linear",
    });
    // jump, not set: a set would read the teleport as a huge velocity and fling the spring far off course.
    x.jump(width + 24);
    onToggle(root.current);
    onOpen(null);
    await animate(x, 0, { type: "spring", stiffness: 320, damping: 32 });
    passing.current = false;
    setHideActions(false);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const base = open === "done" ? -OPEN : open === "delete" ? OPEN : 0;
    const dx = info.offset.x + base;
    if (dx < -200 || info.velocity.x < -900) markDone(info.velocity.x);
    else if (dx > 200 || info.velocity.x > 900)
      animate(x, 480, { duration: 0.22, ease: "easeIn" }).then(onDelete);
    else if (dx < -56) onOpen("done");
    else if (dx > 56) onOpen("delete");
    else {
      onOpen(null);
      animate(x, 0, spring);
    }
  };

  if (event.free)
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-300 px-3.5 py-3 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
        <span className="text-[14px] font-medium tabular-nums">
          {event.time}
        </span>
        <span className="truncate text-[12px]">
          {event.title}
          {event.meta ? ` · ${event.meta}` : ""}
        </span>
      </div>
    );

  return (
    <div ref={root} className="relative overflow-hidden rounded-xl">
      {/* Swipe right: delete waits under the row's left side. */}
      <motion.div
        style={{ opacity: hideActions ? 0 : deleteOpacity }}
        className="absolute inset-0 flex rounded-xl bg-[#e5484d]"
      >
        <button
          type="button"
          tabIndex={open === "delete" ? 0 : -1}
          onClick={() =>
            animate(x, 480, { duration: 0.22, ease: "easeIn" }).then(onDelete)
          }
          className="flex w-[104px] shrink-0 cursor-pointer items-center gap-2 pl-5 text-[14px] font-semibold text-white outline-none focus-visible:underline"
        >
          <Trash2 className="size-4 shrink-0" strokeWidth={2.25} />
          <motion.span style={{ opacity: deleteLabel }}>Delete</motion.span>
        </button>
      </motion.div>

      {/* Swipe left: done waits under the row's right side (Undo when it is already done). */}
      <motion.div
        style={{ opacity: hideActions ? 0 : doneOpacity }}
        className={cn(
          "absolute inset-0 flex justify-end rounded-xl",
          done ? "bg-zinc-500" : "bg-[#269a5a]",
        )}
      >
        <button
          type="button"
          tabIndex={open === "done" ? 0 : -1}
          onClick={() => markDone()}
          className="flex w-[104px] shrink-0 cursor-pointer items-center justify-end gap-2 pr-5 text-[14px] font-semibold text-white outline-none focus-visible:underline"
        >
          <motion.span style={{ opacity: doneLabel }}>
            {done ? "Undo" : "Done"}
          </motion.span>
          {done ? (
            <RotateCCWIcon className="size-4 shrink-0" strokeWidth={2.25} />
          ) : (
            <CheckIcon className="size-4 shrink-0" strokeWidth={2.5} />
          )}
        </button>
      </motion.div>

      <motion.div
        drag={still ? false : "x"}
        dragDirectionLock
        dragConstraints={{ left: -OPEN, right: OPEN }}
        dragElastic={0.5}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        style={{ x, boxShadow: lift }}
        className={cn(
          // A solid white mini card on the soft block, so nothing behind it ever shows through.
          "relative flex touch-pan-y items-center gap-3 rounded-xl bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-zinc-900",
          !still && "cursor-grab active:cursor-grabbing",
        )}
      >
        {/* Time on top, length as a caption below. */}
        <div className="w-11 shrink-0">
          <p
            className={cn(
              "text-[14px] font-medium tabular-nums transition-colors",
              done ? "text-zinc-400" : "text-zinc-900 dark:text-zinc-100",
            )}
          >
            {event.time}
          </p>
          <p className="text-[12px] text-zinc-400">{event.length ?? ""}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5">
            <motion.span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              initial={false}
              animate={{ backgroundColor: done ? "#d4d4d8" : color }}
              transition={{ duration: 0.3 }}
            />
            <span
              className={cn(
                "relative truncate text-[14px] font-medium transition-colors duration-300",
                done ? "text-zinc-400" : "text-zinc-900 dark:text-zinc-100",
              )}
            >
              {event.title}
              {/* Strike line draws across when done. */}
              <motion.span
                aria-hidden
                className="absolute inset-x-0 top-1/2 h-[1.5px] origin-left rounded-full bg-zinc-400"
                initial={false}
                animate={{ scaleX: done ? 1 : 0 }}
                transition={{
                  duration: still ? 0 : 0.45,
                  ease: GLIDE,
                  delay: done && !still ? 0.18 : 0,
                }}
              />
            </span>
          </p>
          {event.meta && (
            <p className="truncate pl-3.5 text-[12px] text-zinc-500 dark:text-zinc-400">
              {event.meta}
            </p>
          )}
        </div>
        {event.tag && !done && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#242423]/6 px-2.5 py-1 text-[12px] font-medium text-zinc-700 dark:bg-white/8 dark:text-zinc-200">
            <span
              className="size-1.5 rounded-full"
              style={{ background: color }}
            />
            {event.tag}
          </span>
        )}
      </motion.div>
    </div>
  );
}

/** A clear day: a floating calendar icon with a sparkle, a short line and a way to add something. */
function EmptyDay({
  day,
  onAdd,
  still,
}: {
  day: AgendaDay;
  onAdd?: () => void;
  still: boolean;
}) {
  const name = day.title === "Today" ? "day" : day.title;
  const rise = (delay: number) => ({
    initial: still ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.4, ease: GLIDE, delay: still ? 0 : delay },
  });
  return (
    <li className="flex flex-col items-center px-4 pb-6 pt-7 text-center">
      <motion.span
        initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          still
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 420, damping: 18 }
        }
        className="relative"
      >
        {/* A gentle float, so the empty day still feels alive. */}
        <motion.span
          animate={still ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="grid size-12 place-items-center rounded-2xl bg-white text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.05),0_6px_16px_-8px_rgba(0,0,0,0.2)] dark:bg-zinc-800 dark:text-zinc-100"
        >
          <CalendarCheck2Icon className="size-5" strokeWidth={2} />
        </motion.span>
        <motion.span
          initial={still ? false : { opacity: 0, scale: 0, rotate: -45 }}
          animate={
            still
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, rotate: [0, 12, 0] }
          }
          transition={
            still
              ? { duration: 0.2 }
              : {
                  opacity: { delay: 0.25 },
                  scale: {
                    delay: 0.25,
                    type: "spring",
                    stiffness: 500,
                    damping: 14,
                  },
                  rotate: {
                    delay: 0.6,
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
          }
          className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-[#f5c542] text-[#3b2f00] ring-2 ring-[#f6f6f5] dark:ring-zinc-900"
        >
          <SparklesIcon className="size-3" strokeWidth={2.5} />
        </motion.span>
      </motion.span>
      <motion.p
        {...rise(0.12)}
        className="mt-4 text-[14px] font-medium text-zinc-900 dark:text-zinc-100"
      >
        Your {name} is clear
      </motion.p>
      <motion.p
        {...rise(0.18)}
        className="mt-1 max-w-[240px] text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400"
      >
        Nothing planned yet. Add something, or keep the time for yourself.
      </motion.p>
      <motion.button
        {...rise(0.24)}
        type="button"
        onClick={onAdd}
        whileTap={still ? undefined : { scale: 0.95 }}
        className="group mt-4 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#242423] px-3.5 text-[12px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:bg-white dark:text-zinc-900"
      >
        <PlusIcon
          className="size-3.5 transition-transform duration-300 group-hover:rotate-90"
          strokeWidth={2.5}
        />
        Add event
      </motion.button>
    </li>
  );
}

export const CalendarAgenda = React.forwardRef<
  HTMLDivElement,
  CalendarAgendaProps
>(function CalendarAgenda(
  {
    days = DEFAULT_DAYS,
    defaultDay = 1,
    confetti = true,
    onToggle,
    onDelete,
    onAdd,
    className,
  },
  ref,
) {
  const still = !!useReducedMotion();
  const uid = React.useId();
  const [week, setWeek] = React.useState(days);
  const [dayIndex, setDayIndex] = React.useState(
    Math.min(defaultDay, days.length - 1),
  );
  const [opened, setOpened] = React.useState<{ id: string; side: Side } | null>(
    null,
  );
  const [announce, setAnnounce] = React.useState("");
  const { canvas, burst } = useConfetti(confetti && !still);
  const day = week[dayIndex]!;
  const left = day.events.filter((e) => !e.free && !e.done).length;

  const update = (fn: (events: AgendaEvent[]) => AgendaEvent[]) =>
    setWeek((w) =>
      w.map((d, i) => (i === dayIndex ? { ...d, events: fn(d.events) } : d)),
    );

  const toggle = (event: AgendaEvent, row?: HTMLElement | null) => {
    const done = !event.done;
    update((events) =>
      events.map((e) => (e.id === event.id ? { ...e, done } : e)),
    );
    setOpened(null);
    onToggle?.(event, done);
    setAnnounce(`${event.title} ${done ? "done" : "reopened"}`);
    // Confetti rises from across the row as it is marked done; the last one of the day gets a second wave.
    if (done && row) {
      burst(row.getBoundingClientRect(), event.color);
      const list = row.closest("ul")?.getBoundingClientRect();
      if (left === 1 && list)
        window.setTimeout(() => burst(list, undefined, 40), 220);
    }
  };

  const remove = (event: AgendaEvent) => {
    update((events) => events.filter((e) => e.id !== event.id));
    setOpened(null);
    onDelete?.(event);
    setAnnounce(`${event.title} deleted`);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-[400px] max-w-full rounded-3xl bg-white px-4 pb-4 pt-5 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>

      <header className="flex items-start justify-between gap-4 px-2">
        <div className="min-w-0">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h3
              key={day.title}
              initial={
                still
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8, filter: "blur(4px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                still
                  ? { opacity: 0 }
                  : { opacity: 0, y: -6, filter: "blur(4px)" }
              }
              transition={{ duration: 0.35, ease: GLIDE }}
              className="text-lg font-semibold tracking-tight"
            >
              {day.title}
            </motion.h3>
          </AnimatePresence>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {day.subtitle ? `${day.subtitle} · ` : ""}
            {left ? `${left} left` : "All clear"}
          </p>
        </div>
        <motion.button
          type="button"
          aria-label="Add event"
          onClick={onAdd}
          whileTap={still ? undefined : { scale: 0.9 }}
          className="group grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-[#242423]/6 text-[#242423] outline-none transition-colors hover:bg-[#242423]/10 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/8 dark:text-zinc-100"
        >
          <PlusIcon
            className="size-4 transition-transform duration-300 group-hover:rotate-90"
            strokeWidth={2.5}
          />
        </motion.button>
      </header>

      {/* Week strip: an ink pill slides to the chosen day; dots mark days with plans. */}
      <div
        role="tablist"
        aria-label="Day"
        className="mt-4 grid grid-cols-7 gap-1 rounded-2xl bg-[#242423]/[0.035] p-1 dark:bg-white/5"
      >
        {week.map((d, i) => {
          const on = i === dayIndex;
          const busy = d.events.some((e) => !e.free && !e.done);
          return (
            <button
              key={d.label}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={`${d.title}, ${d.date}`}
              onClick={() => {
                setDayIndex(i);
                setOpened(null);
              }}
              className={cn(
                "relative flex h-14 cursor-pointer flex-col items-center justify-center rounded-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400",
                on
                  ? "text-white dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              {on && (
                <motion.span
                  layoutId={`${uid}-day`}
                  transition={
                    still
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                  className="absolute inset-0 rounded-xl bg-[#242423] dark:bg-white"
                />
              )}
              <span className="relative text-[12px]">{d.label}</span>
              <span className="relative text-[16px] font-semibold tabular-nums">
                {d.date}
              </span>
              <span
                className={cn(
                  "relative mt-0.5 size-1 rounded-full transition-opacity",
                  on ? "bg-current" : "bg-zinc-400",
                  busy ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
          );
        })}
      </div>

      {/* The day's list. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={dayIndex}
          initial={
            still ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(6px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            still ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }
          }
          transition={{ duration: 0.3, ease: GLIDE }}
          className="mt-3 flex flex-col gap-1.5 rounded-[22px] bg-[#242423]/[0.035] p-1.5 dark:bg-white/5"
          aria-label={`${day.title} events`}
        >
          <AnimatePresence initial={false}>
            {day.events.map((e) => (
              <motion.li
                key={e.id}
                layout={!still}
                exit={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, height: 0, marginTop: -4 }
                }
                transition={{ duration: 0.3, ease: GLIDE }}
                tabIndex={e.free ? -1 : 0}
                onKeyDown={(k) => {
                  if (e.free || k.target !== k.currentTarget) return;
                  if (k.key === "Enter" || k.key === " ") {
                    k.preventDefault();
                    toggle(e, k.currentTarget as HTMLElement);
                  }
                  if (k.key === "Delete" || k.key === "Backspace") {
                    k.preventDefault();
                    remove(e);
                  }
                }}
                className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <Row
                  event={e}
                  open={opened?.id === e.id ? opened.side : null}
                  onOpen={(side) => setOpened(side ? { id: e.id, side } : null)}
                  onToggle={(row) => toggle(e, row)}
                  onDelete={() => remove(e)}
                  still={still}
                />
              </motion.li>
            ))}
          </AnimatePresence>
          {!day.events.some((e) => !e.free) && (
            <EmptyDay day={day} onAdd={onAdd} still={still} />
          )}
        </motion.ul>
      </AnimatePresence>

      {/* Confetti: as wide as the card, with room above it so pieces fly up and out of the card. */}
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none absolute -left-4 -top-60 z-20 h-[calc(100%+264px)] w-[calc(100%+32px)]"
      />
    </div>
  );
});