"use client";

/**
 * FluxCard, from https://motion-brew.com/components/flux-card
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
import { AnimatePresence, motion, useAnimation, useAnimationControls, useInView, useReducedMotion, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: bell
const BellIcon = (() => {
interface BellIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BellIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SVG_VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -10, 10, -10, 0] },
};

const BellIcon = forwardRef<BellIconHandle, BellIconProps>(
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
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          variants={SVG_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </motion.svg>
      </span>
    );
  }
);

BellIcon.displayName = "BellIcon";
  return BellIcon;
})();

// Animated icon: calendar-days
const CalendarDaysIcon = (() => {
interface CalendarDaysIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CalendarDaysIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const DOTS = [
  { cx: 8, cy: 14 },
  { cx: 12, cy: 14 },
  { cx: 16, cy: 14 },
  { cx: 8, cy: 18 },
  { cx: 12, cy: 18 },
  { cx: 16, cy: 18 },
];

const VARIANTS: Variants = {
  normal: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  animate: (i: number) => ({
    opacity: [1, 0.3, 1],
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      times: [0, 0.5, 1],
    },
  }),
};

const CalendarDaysIcon = forwardRef<
  CalendarDaysIconHandle,
  CalendarDaysIconProps
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
        <rect height="18" rx="2" width="18" x="3" y="4" />
        <path d="M3 10h18" />
        <AnimatePresence>
          {DOTS.map((dot, index) => (
            <motion.circle
              animate={controls}
              custom={index}
              cx={dot.cx}
              cy={dot.cy}
              fill="currentColor"
              initial="normal"
              key={`${dot.cx}-${dot.cy}`}
              r="1"
              stroke="none"
              variants={VARIANTS}
            />
          ))}
        </AnimatePresence>
      </svg>
    </span>
  );
});

CalendarDaysIcon.displayName = "CalendarDaysIcon";
  return CalendarDaysIcon;
})();

// Animated icon: mail-check
const MailCheckIcon = (() => {
interface MailCheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MailCheckIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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

const MailCheckIcon = forwardRef<MailCheckIconHandle, MailCheckIconProps>(
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
          <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          <motion.path
            animate={controls}
            d="m16 19 2 2 4-4"
            initial="normal"
            style={{ transformOrigin: "center" }}
            variants={CHECK_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

MailCheckIcon.displayName = "MailCheckIcon";
  return MailCheckIcon;
})();

// Animated icon: message-circle
const MessageCircleIcon = (() => {
interface MessageCircleIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MessageCircleIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const ICON_VARIANTS: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
  },
  animate: {
    scale: 1.05,
    rotate: [0, -7, 7, 0],
    transition: {
      rotate: {
        duration: 0.5,
        ease: "easeInOut",
      },
      scale: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  },
};

const MessageCircleIcon = forwardRef<
  MessageCircleIconHandle,
  MessageCircleIconProps
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
      <motion.svg
        animate={controls}
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth ?? 2}
        variants={ICON_VARIANTS}
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </motion.svg>
    </span>
  );
});

MessageCircleIcon.displayName = "MessageCircleIcon";
  return MessageCircleIcon;
})();

// Animated icon: receipt
const ReceiptIcon = (() => {
interface ReceiptIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ReceiptIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const DOLLAR_MAIN_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      duration: 0.6,
      opacity: { duration: 0.1 },
    },
  },
};

const DOLLAR_SECONDARY_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    transition: {
      delay: 0.3,
      duration: 0.3,
      opacity: { duration: 0.1, delay: 0.3 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [1, 0],
    transition: {
      delay: 0.5,
      duration: 0.4,
      opacity: { duration: 0.1, delay: 0.5 },
    },
  },
};

const ReceiptIcon = forwardRef<ReceiptIconHandle, ReceiptIconProps>(
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
            d="M12 17V7"
            initial="normal"
            variants={DOLLAR_SECONDARY_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"
            initial="normal"
            variants={DOLLAR_MAIN_VARIANTS}
          />
          <path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" />
        </motion.svg>
      </span>
    );
  }
);

ReceiptIcon.displayName = "ReceiptIcon";
  return ReceiptIcon;
})();

// FluxCard

/**
 * FluxCard
 *
 * Trigger: in view and timeline, plus hover and press. A feature card on a
 * pixelated gradient: the colour flows underneath, but it is drawn as a grid
 * of small rounded squares, stepped into a few shades and dithered between
 * them like an old screen. The pointer carries a negative magnetic field:
 * squares near it shrink away to nothing and the colour is pushed outward,
 * so a clear hole follows the pointer with a crowded, brighter rim around it.
 * A press sends a shock wave through the grid. In front, a frosted focus
 * timer counts down inside a shield, and notification pills drift in from
 * the edges, hit the shield and get pushed back out; each one that bounces
 * off makes the shield pulse, ripples the grid where it hit and adds to the
 * held back count. The pills are repelled by the pointer too. Everything
 * pauses off screen and in a hidden tab. Reduced motion keeps a still frame
 * with the pills resting around the timer.
 *
 * Engine: motion/react (entrances, the shield pulse, rolling numbers) and a
 * WebGL fragment shader (flow noise, Bayer dithering, the repelling field and
 * press waves), with a small spring simulation for the pills, all on one
 * requestAnimationFrame loop that runs only while the card is visible.
 */

export type FluxPingIcon = "message" | "calendar" | "mail" | "bell" | "receipt";

export interface FluxPing {
  label: string;
  icon: FluxPingIcon;
}

export interface FluxCardProps {
  /** Card title. Default `"Keep the noise out"`. */
  title?: React.ReactNode;
  /** Line under the title. */
  description?: React.ReactNode;
  /** The label inside the timer. Default `"Deep work"`. */
  label?: string;
  /** Length of the focus block in minutes. Default `25`. */
  minutes?: number;
  /** Notifications that drift in and bounce off. Up to six are used. */
  pings?: FluxPing[];
  /** Four colours for the main flow, deepest first. Default an ember ramp. */
  colors?: [string, string, string, string];
  /** A second colour dithered into the lower right. Default `"#5b5bff"`. */
  accent?: string;
  /** Size of each square in px, 6 to 24. Default `10`. */
  pixel?: number;
  /** How much the shades are dithered into each other, 0 to 1. Default `0.6`. */
  dither?: number;
  /** Strength of the repelling field around the pointer, 0 to 1. Default `0.8`. */
  field?: number;
  /** Reach of the field in px. Default `110`. */
  radius?: number;
  /** Flow speed, 0 (still) to 2. Default `0.6`. */
  speed?: number;
  className?: string;
}

const DEFAULT_PINGS: FluxPing[] = [
  { label: "Maya: quick question?", icon: "message" },
  { label: "Standup in 5 min", icon: "calendar" },
  { label: "3 new emails", icon: "mail" },
  { label: "Invoice #2041 paid", icon: "receipt" },
  { label: "Build finished", icon: "bell" },
];

const ICONS: Record<
  FluxPingIcon,
  React.ComponentType<{ active?: boolean; className?: string }>
> = {
  message: MessageCircleIcon,
  calendar: CalendarDaysIcon,
  mail: MailCheckIcon,
  bell: BellIcon,
  receipt: ReceiptIcon,
};

const DEFAULT_COLORS: [string, string, string, string] = [
  "#ff4a12",
  "#ff8a3d",
  "#ffc48c",
  "#ffeedd",
];

const GLIDE = [0.22, 1, 0.36, 1] as const;

const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// The flow is sampled once per square, stepped into shades with an 8x8 Bayer
// matrix, then each square is drawn rounded with a gap. The pointer's field
// shrinks squares near it and pushes the colour outward; a press sends a
// ring that swells the squares it passes.
const FRAGMENT = `precision highp float;
uniform vec2 r;uniform float t;uniform float now;uniform float cell;uniform float dith;
uniform vec3 mf;uniform float rad;uniform vec3 rp;uniform float dpr;
uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform vec3 ca;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*vnoise(p);p*=2.03;a*=.5;}return v;}
float b2(vec2 a){a=floor(a);return fract(a.x/2.+a.y*a.y*.75);}
float b4(vec2 a){return b2(.5*a)*.25+b2(a);}
float b8(vec2 a){return b4(.5*a)*.25+b2(a);}
void main(){
float cs=cell*dpr;
vec2 id=floor(gl_FragCoord.xy/cs);
vec2 c=(id+.5)*cs;
vec2 lp=gl_FragCoord.xy-c;
// The negative field: strongest at the pointer, gone by its reach.
vec2 dm=c-mf.xy;float dist=length(dm);float reach=rad*dpr;
float field=mf.z*exp(-pow(dist/reach,2.)*1.8);
float rim=mf.z*exp(-pow((dist-reach*.62)/(reach*.22),2.));
vec2 src=c-normalize(dm+1e-4)*field*reach*.55;
// A press: a ring that travels out and fades.
float age=now-rp.z;float dr=length(c-rp.xy);
float wave=rp.z<0.?0.:exp(-pow((dr-age*520.*dpr)/(46.*dpr),2.))*exp(-age*1.6);
vec2 uv=src/r;float asp=r.x/r.y;vec2 p=vec2(uv.x*asp,uv.y);
vec2 q=vec2(fbm(p*1.6+vec2(0.,t*.12)),fbm(p*1.6+vec2(5.2,1.3)-vec2(t*.1,0.)));
vec2 w=p+(q-.5)*.55;
vec2 home=vec2(.18*asp,-.1)+vec2(sin(t*.27),cos(t*.21))*.05;
float f=1.-smoothstep(.0,.95,length(w-home)+(fbm(w*2.2+t*.05)-.5)*.25);
vec2 a2=vec2(.95*asp,.02)+vec2(sin(t*.31),cos(t*.23))*.07;
float f2=1.-smoothstep(.0,.62,length(w-a2)+(fbm(w*2.6-t*.06)-.5)*.3);
float bay=(b8(id)-.5)*dith;
float lv=floor(clamp(f*4.+bay+wave*.8+rim*.6,0.,4.));
vec3 col=lv<.5?vec3(1.):lv<1.5?c3:lv<2.5?c2:lv<3.5?c1:c0;
float al=floor(clamp(f2*3.+bay,0.,3.))/3.;
// Two inks, never blended: a square is either the ramp or the accent.
if(al>0.&&al*4.>=lv)col=mix(vec3(1.),ca,.3+al*.7);
// Square size: a small gap, shrinking to nothing in the field, swelling on the rim and the wave.
float s=.84*(1.-smoothstep(.1,.85,field))+rim*.12+wave*.2;
s=clamp(s,0.,.98);
vec2 bx=abs(lp)-vec2(s*cs*.5-cs*.12);
float sd=length(max(bx,0.))+min(max(bx.x,bx.y),0.)-cs*.12;
float inside=1.-smoothstep(-.6,.6,sd);
if(lv<.5&&al<.01)inside=0.;
gl_FragColor=vec4(mix(vec3(1.),col,inside),1.);}`;

const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** The shield around the timer, in px from the stage centre. */
const SHIELD = 92;

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  wait: number;
  hit: boolean;
}

export const FluxCard = React.forwardRef<HTMLDivElement, FluxCardProps>(
  function FluxCard(
    {
      title = "Keep the noise out",
      description = "Focus mode holds pings, calls and mail at the edge until your block ends. Nothing gets lost, it just waits.",
      label = "Deep work",
      minutes = 25,
      pings = DEFAULT_PINGS,
      colors = DEFAULT_COLORS,
      accent = "#5b5bff",
      pixel = 10,
      dither = 0.6,
      field = 0.8,
      radius = 110,
      speed = 0.6,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const canvas = React.useRef<HTMLCanvasElement>(null);
    const stage = React.useRef<HTMLDivElement>(null);
    const pills = React.useRef<(HTMLDivElement | null)[]>([]);
    const seen = useInView(root, { once: true, amount: 0.3 });
    const visible = useInView(root, { amount: 0.05 });
    const shown = seen || still;
    const list = pings.slice(0, 6);

    const params = React.useRef({
      pixel,
      dither,
      field,
      radius,
      speed,
      colors,
      accent,
    });
    params.current = { pixel, dither, field, radius, speed, colors, accent };
    // Pointer in card px; `on` eases the field in and out.
    const pointer = React.useRef({ x: -999, y: -999, on: 0, target: 0 });
    const wave = React.useRef({ x: 0, y: 0, at: -1 });
    const clock = React.useRef({ t: 0, now: 0, last: 0 });
    const bodies = React.useRef<Body[]>([]);

    const [held, setHeld] = React.useState(still ? 12 : 9);
    const [pulse, setPulse] = React.useState(0);
    const [struck, setStruck] = React.useState<number | null>(null);
    const [left, setLeft] = React.useState(minutes * 60);

    React.useEffect(() => setLeft(minutes * 60), [minutes]);

    // The focus block counts down while the card is on screen.
    React.useEffect(() => {
      if (still || !seen || !visible) return;
      const t = window.setInterval(
        () => setLeft((s) => (s <= 1 ? minutes * 60 : s - 1)),
        1000,
      );
      return () => window.clearInterval(t);
    }, [still, seen, visible, minutes]);

    /** A ripple in the grid at a point in card px. */
    const ripple = React.useCallback((x: number, y: number) => {
      wave.current = { x, y, at: clock.current.now };
    }, []);

    /** A pill starts again somewhere off the edge, heading for the shield. */
    const spawn = React.useCallback((b: Body, w: number, h: number) => {
      // From the sides and below, never from over the copy.
      const a = (-0.15 + Math.random() * 1.3) * Math.PI;
      b.x = Math.cos(a) * (w * 0.62);
      b.y = Math.sin(a) * (h * 0.62);
      const sp = 70 + Math.random() * 45;
      const n = Math.hypot(b.x, b.y) || 1;
      const side = (Math.random() - 0.5) * 0.7;
      b.vx = (-b.x / n) * sp + (-b.y / n) * sp * side;
      b.vy = (-b.y / n) * sp + (b.x / n) * sp * side;
      b.age = 0;
      b.hit = false;
    }, []);

    // Pills at rest for reduced motion and before the first frame.
    const resting = React.useCallback((i: number, n: number) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2 + 0.4;
      return { x: Math.cos(a) * (SHIELD + 58), y: Math.sin(a) * (SHIELD + 22) };
    }, []);

    React.useEffect(() => {
      bodies.current = list.map((_, i) => {
        const r = resting(i, list.length);
        return {
          x: r.x,
          y: r.y,
          vx: 0,
          vy: 0,
          age: 0,
          wait: still ? 0 : 0.4 + i * 1.3,
          hit: false,
        };
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [list.length, still]);

    // One loop: the shader and the pills.
    React.useEffect(() => {
      const el = canvas.current;
      if (!el) return;
      const gl = el.getContext("webgl", {
        antialias: false,
        premultipliedAlpha: false,
      });
      let draw = () => {};
      if (!gl) {
        const c = params.current.colors;
        el.style.background = `radial-gradient(60% 50% at 95% 100%, ${params.current.accent}, transparent 70%), radial-gradient(120% 80% at 15% 105%, ${c[0]}, ${c[1]} 30%, ${c[2]} 50%, #fff 75%)`;
      } else {
        const compile = (type: number, src: string) => {
          const s = gl.createShader(type)!;
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        };
        const prog = gl.createProgram()!;
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT));
        gl.linkProgram(prog);
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW,
        );
        const loc = gl.getAttribLocation(prog, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const u = (n: string) => gl.getUniformLocation(prog, n);
        const U = {
          r: u("r"),
          t: u("t"),
          now: u("now"),
          cell: u("cell"),
          dith: u("dith"),
          mf: u("mf"),
          rad: u("rad"),
          rp: u("rp"),
          dpr: u("dpr"),
          c0: u("c0"),
          c1: u("c1"),
          c2: u("c2"),
          c3: u("c3"),
          ca: u("ca"),
        };
        draw = () => {
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          const w = Math.max(1, Math.round(el.clientWidth * dpr));
          const h = Math.max(1, Math.round(el.clientHeight * dpr));
          if (el.width !== w || el.height !== h) {
            el.width = w;
            el.height = h;
          }
          const p = params.current;
          const ptr = pointer.current;
          const wv = wave.current;
          // Card px (y down) to canvas px (y up).
          const sx = w / Math.max(1, el.clientWidth);
          gl.viewport(0, 0, w, h);
          gl.uniform2f(U.r, w, h);
          gl.uniform1f(U.t, clock.current.t);
          gl.uniform1f(U.now, clock.current.now);
          gl.uniform1f(U.cell, Math.max(6, Math.min(24, p.pixel)));
          gl.uniform1f(U.dith, p.dither);
          gl.uniform1f(U.dpr, sx);
          gl.uniform3f(U.mf, ptr.x * sx, h - ptr.y * sx, ptr.on * p.field);
          gl.uniform1f(U.rad, p.radius);
          gl.uniform3f(U.rp, wv.x * sx, h - wv.y * sx, wv.at);
          gl.uniform3fv(U.c0, rgb(p.colors[0]));
          gl.uniform3fv(U.c1, rgb(p.colors[1]));
          gl.uniform3fv(U.c2, rgb(p.colors[2]));
          gl.uniform3fv(U.c3, rgb(p.colors[3]));
          gl.uniform3fv(U.ca, rgb(p.accent));
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };
      }

      const place = () => {
        bodies.current.forEach((b, i) => {
          const node = pills.current[i];
          if (!node) return;
          const st = stage.current;
          const w = st?.clientWidth ?? 400;
          const h = st?.clientHeight ?? 300;
          const fadeIn = still ? 1 : Math.min(1, b.age * 2.5);
          const edge = Math.max(
            Math.abs(b.x) / (w * 0.6),
            Math.abs(b.y) / (h * 0.6),
          );
          // Fade out before reaching the copy above the stage.
          const top = Math.max(0, Math.min(1, (b.y + h / 2) / 36));
          const fadeOut = still
            ? 1
            : Math.max(0, Math.min(1, (1.08 - edge) * 4));
          const tilt = Math.max(-8, Math.min(8, b.vx * 0.04));
          node.style.opacity = String(
            b.wait > 0 ? 0 : fadeIn * fadeOut * (still ? 1 : top),
          );
          node.style.transform = `translate(-50%, -50%) translate(${b.x}px, ${b.y}px) rotate(${tilt}deg)`;
        });
      };

      if (still || !visible) {
        clock.current.t = 3;
        draw();
        place();
        return;
      }
      let raf = 0;
      clock.current.last = performance.now();
      const frame = (ms: number) => {
        raf = requestAnimationFrame(frame);
        if (document.hidden) return;
        const dt = Math.min(0.05, (ms - clock.current.last) / 1000);
        clock.current.last = ms;
        clock.current.now += dt;
        clock.current.t += dt * params.current.speed;
        const ptr = pointer.current;
        ptr.on += (ptr.target - ptr.on) * (1 - Math.exp(-dt * 6));

        // Pills: drift in, get pushed out by the shield and by the pointer.
        const st = stage.current;
        const card = root.current;
        if (st && card && seen) {
          const w = st.clientWidth;
          const h = st.clientHeight;
          // The pointer in stage coordinates (from the stage centre).
          const px = ptr.x - st.offsetLeft - w / 2;
          const py = ptr.y - st.offsetTop - h / 2;
          bodies.current.forEach((b, i) => {
            if (b.wait > 0) {
              b.wait -= dt;
              if (b.wait <= 0) spawn(b, w, h);
              return;
            }
            b.age += dt;
            let fx = 0;
            let fy = 0;
            const d = Math.hypot(b.x, b.y) || 1;
            const nx = b.x / d;
            const ny = b.y / d;
            // The shield is an ellipse a little wider than tall, like the pills.
            const reach = SHIELD + 18 + 40 * Math.abs(nx);
            if (d < reach) {
              const k = (reach - d) * 60;
              fx += nx * k;
              fy += ny * k;
              if (!b.hit) {
                b.hit = true;
                setHeld((n) => n + 1);
                setPulse((n) => n + 1);
                setStruck(i);
                ripple(
                  st.offsetLeft + w / 2 + nx * SHIELD,
                  st.offsetTop + h / 2 + ny * SHIELD,
                );
              }
            }
            // Pills keep a little room between each other, mostly up and down.
            bodies.current.forEach((o, j) => {
              if (j === i || o.wait > 0) return;
              const ox = b.x - o.x;
              const oy = b.y - o.y;
              if (Math.abs(ox) < 150 && Math.abs(oy) < 38) {
                fy += Math.sign(oy || i - j) * (38 - Math.abs(oy)) * 40;
                fx += Math.sign(ox || i - j) * (150 - Math.abs(ox)) * 2;
              }
            });
            const dx = b.x - px;
            const dy = b.y - py;
            const dp = Math.hypot(dx, dy);
            const pr = params.current.radius;
            if (ptr.on > 0.05 && dp < pr && dp > 0.1) {
              const k =
                Math.pow(1 - dp / pr, 2) * 2400 * ptr.on * params.current.field;
              fx += (dx / dp) * k;
              fy += (dy / dp) * k;
            }
            b.vx = (b.vx + fx * dt) * Math.exp(-dt * 0.5);
            b.vy = (b.vy + fy * dt) * Math.exp(-dt * 0.5);
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            const gone = Math.abs(b.x) > w * 0.68 || Math.abs(b.y) > h * 0.68;
            if ((gone && b.age > 1) || b.age > 12) {
              b.wait = 0.6 + Math.random() * 1.6;
            }
          });
        }
        place();
        draw();
      };
      raf = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(raf);
    }, [still, visible, seen, spawn, ripple]);

    // Each bounce knocks the shield in a little.
    const bump = useAnimationControls();
    React.useEffect(() => {
      if (!pulse || still) return;
      void bump.start({
        scale: [0.95, 1],
        transition: { type: "spring", stiffness: 500, damping: 14 },
      });
    }, [pulse, still, bump]);

    React.useEffect(() => {
      if (struck === null) return;
      const t = window.setTimeout(() => setStruck(null), 700);
      return () => window.clearTimeout(t);
    }, [struck, pulse]);

    const total = minutes * 60;
    const progress = left / total;
    const R = 66;
    const enter = (delay: number) => ({
      initial: still
        ? (false as const)
        : { opacity: 0, y: 10, filter: "blur(6px)" },
      animate: shown ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
      transition: { duration: 0.6, ease: GLIDE, delay: still ? 0 : delay },
    });

    return (
      <motion.div
        ref={root}
        initial={still ? false : { opacity: 0, y: 18 }}
        animate={shown ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: GLIDE }}
        onPointerMove={(e) => {
          const el = e.currentTarget;
          const r = el.getBoundingClientRect();
          // The card may sit inside something scaled, so measure in its own pixels.
          const scale = r.width / el.offsetWidth || 1;
          pointer.current.x = (e.clientX - r.left) / scale;
          pointer.current.y = (e.clientY - r.top) / scale;
          pointer.current.target = 1;
        }}
        onPointerLeave={() => {
          pointer.current.target = 0;
        }}
        onPointerDown={(e) => {
          const el = e.currentTarget;
          const r = el.getBoundingClientRect();
          const scale = r.width / el.offsetWidth || 1;
          const x = (e.clientX - r.left) / scale;
          const y = (e.clientY - r.top) / scale;
          ripple(x, y);
          // A press shoves every pill away from it.
          const st = stage.current;
          if (!st) return;
          const sx = x - st.offsetLeft - st.clientWidth / 2;
          const sy = y - st.offsetTop - st.clientHeight / 2;
          bodies.current.forEach((b) => {
            const dx = b.x - sx;
            const dy = b.y - sy;
            const d = Math.hypot(dx, dy) || 1;
            const k = 260 * Math.max(0.2, 1 - d / 320);
            b.vx += (dx / d) * k;
            b.vy += (dy / d) * k;
          });
        }}
        className={cn(
          "relative isolate h-[480px] w-[400px] max-w-full select-none overflow-hidden rounded-[32px] bg-white text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]",
          className,
        )}
      >
        <canvas
          ref={canvas}
          aria-hidden
          className="absolute inset-0 -z-10 size-full"
        />

        <div className="px-7 pt-7">
          <motion.h3
            {...enter(0.05)}
            className="text-[20px] font-semibold tracking-tight"
          >
            {title}
          </motion.h3>
          <motion.p
            {...enter(0.12)}
            className="mt-2 max-w-[300px] text-pretty text-[14px] leading-relaxed text-zinc-600"
          >
            {description}
          </motion.p>
        </div>

        {/* The stage: the shielded timer, with pings drifting in from the edges. */}
        <div ref={stage} className="absolute inset-x-0 bottom-0 top-[150px]">
          {/* Pings */}
          <div aria-hidden className="absolute left-1/2 top-1/2">
            {list.map((ping, i) => {
              const Icon = ICONS[ping.icon];
              const r = resting(i, list.length);
              return (
                <div
                  key={`${ping.label}-${i}`}
                  ref={(el) => {
                    pills.current[i] = el;
                  }}
                  style={{
                    transform: `translate(-50%, -50%) translate(${r.x}px, ${r.y}px)`,
                    opacity: still ? 1 : 0,
                  }}
                  className="absolute left-0 top-0 will-change-transform"
                >
                  <div className="flex h-8 items-center gap-2 whitespace-nowrap rounded-full bg-white/75 pl-1 pr-3 text-[12px] font-medium shadow-[0_6px_20px_-8px_rgba(36,36,35,0.35)] ring-1 ring-white/80 backdrop-blur-md">
                    <span className="grid size-6 place-items-center rounded-full bg-[#242423]/[0.06]">
                      <Icon className="size-3.5" active={struck === i} />
                    </span>
                    {ping.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shield and timer */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <AnimatePresence>
              {!still && pulse > 0 && (
                <motion.span
                  key={pulse}
                  aria-hidden
                  initial={{ scale: 1, opacity: 0.55 }}
                  animate={{ scale: 1.45, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: GLIDE }}
                  className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white"
                />
              )}
            </AnimatePresence>
            <motion.div
              initial={
                still ? false : { opacity: 0, scale: 0.8, filter: "blur(8px)" }
              }
              animate={
                shown
                  ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                  : undefined
              }
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 22,
                delay: still ? 0 : 0.25,
              }}
              className="relative grid size-[164px] place-items-center rounded-full bg-white/55 shadow-[0_16px_48px_-18px_rgba(36,36,35,0.45)] ring-1 ring-white/80 backdrop-blur-xl"
            >
              <motion.div animate={bump} className="absolute inset-0">
                <svg
                  viewBox="0 0 164 164"
                  className="size-full -rotate-90"
                  aria-hidden
                >
                  <circle
                    cx="82"
                    cy="82"
                    r={R}
                    fill="none"
                    stroke="rgba(36,36,35,0.08)"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="82"
                    cy="82"
                    r={R}
                    fill="none"
                    stroke="#242423"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={still ? false : { pathLength: 0 }}
                    animate={shown ? { pathLength: progress } : undefined}
                    transition={{
                      duration: seen && left < total ? 0.8 : 1.4,
                      ease: GLIDE,
                    }}
                  />
                </svg>
              </motion.div>
              <div className="relative flex flex-col items-center">
                <span className="text-[12px] font-medium text-[#242423]/55">
                  {label}
                </span>
                <span
                  className="text-[32px] font-semibold leading-10 tracking-tight tabular-nums"
                  role="timer"
                  aria-label={`${fmt(left)} left in ${label}`}
                >
                  {fmt(left)}
                </span>
                <span className="flex items-center gap-1 text-[12px] text-[#242423]/55">
                  <span className="relative inline-grid overflow-hidden font-semibold text-[#242423] tabular-nums">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={held}
                        initial={
                          still
                            ? { opacity: 0 }
                            : { y: "90%", opacity: 0, filter: "blur(2px)" }
                        }
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={
                          still
                            ? { opacity: 0 }
                            : { y: "-90%", opacity: 0, filter: "blur(2px)" }
                        }
                        transition={{ duration: 0.3, ease: GLIDE }}
                      >
                        {held}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  held back
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  },
);