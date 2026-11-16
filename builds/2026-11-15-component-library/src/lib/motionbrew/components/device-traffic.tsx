"use client";

/**
 * DeviceTraffic, from https://motion-brew.com/components/device-traffic
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
import { Tablet } from "lucide-react";
import { AnimatePresence, motion, type Transition, useAnimation, useInView, useReducedMotion, type Variants } from "motion/react";
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

// Animated icon: monitor-check
const MonitorCheckIcon = (() => {
interface MonitorCheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MonitorCheckIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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

const MonitorCheckIcon = forwardRef<
  MonitorCheckIconHandle,
  MonitorCheckIconProps
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
        <rect height="14" rx="2" width="20" x="2" y="3" />
        <path d="M12 17v4" />
        <path d="M8 21h8" />
        <motion.path
          animate={controls}
          d="m9 10 2 2 4-4"
          initial="normal"
          style={{ transformOrigin: "center" }}
          variants={CHECK_VARIANTS}
        />
      </svg>
    </span>
  );
});

MonitorCheckIcon.displayName = "MonitorCheckIcon";
  return MonitorCheckIcon;
})();

// Animated icon: radio
const RadioIcon = (() => {
interface RadioIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface RadioIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const VARIANTS: Variants = {
  normal: {
    opacity: 1,
    transition: {
      duration: 0.4,
    },
  },
  fadeOut: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
  fadeIn: (i: number) => ({
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: i * 0.1,
    },
  }),
};

const RadioIcon = forwardRef<RadioIconHandle, RadioIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: async () => {
          await controls.start("fadeOut");
          controls.start("fadeIn");
        },
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      async (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          await controls.start("fadeOut");
          controls.start("fadeIn");
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
            custom={1}
            d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"
            initial={{ opacity: 1 }}
            variants={VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={0}
            d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"
            initial={{ opacity: 1 }}
            variants={VARIANTS}
          />
          <circle cx="12" cy="12" r="2" />
          <motion.path
            animate={controls}
            custom={0}
            d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"
            initial={{ opacity: 1 }}
            variants={VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={1}
            d="M19.1 4.9C23 8.8 23 15.1 19.1 19"
            initial={{ opacity: 1 }}
            variants={VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

RadioIcon.displayName = "RadioIcon";
  return RadioIcon;
})();

// Animated icon: smartphone-nfc
const SmartphoneNfcIcon = (() => {
interface SmartphoneNfcIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SmartphoneNfcIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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
    transition: {
      duration: 0.4,
    },
  },
  fadeOut: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
  fadeIn: (i: number) => ({
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: i * 0.1,
    },
  }),
};

const SmartphoneNfcIcon = forwardRef<
  SmartphoneNfcIconHandle,
  SmartphoneNfcIconProps
>(({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;
    return {
      startAnimation: async () => {
        await controls.start("fadeOut");
        controls.start("fadeIn");
      },
      stopAnimation: () => controls.start("normal"),
    };
  });

  const handleMouseEnter = useCallback(
    async (e: React.MouseEvent<HTMLSpanElement>) => {
      if (isControlledRef.current) {
        onMouseEnter?.(e);
      } else {
        await controls.start("fadeOut");
        controls.start("fadeIn");
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
        <rect height="12" rx="1" width="7" x="2" y="6" />
        <motion.path
          animate={controls}
          custom={0}
          d="M13 8.32a7.43 7.43 0 0 1 0 7.36"
          initial={{ opacity: 1 }}
          variants={PATH_VARIANTS}
        />
        <motion.path
          animate={controls}
          custom={1}
          d="M16.46 6.21a11.76 11.76 0 0 1 0 11.58"
          initial={{ opacity: 1 }}
          variants={PATH_VARIANTS}
        />
        <motion.path
          animate={controls}
          custom={2}
          d="M19.91 4.1a15.91 15.91 0 0 1 .01 15.8"
          initial={{ opacity: 1 }}
          variants={PATH_VARIANTS}
        />
      </svg>
    </span>
  );
});

SmartphoneNfcIcon.displayName = "SmartphoneNfcIcon";
  return SmartphoneNfcIcon;
})();

// DeviceTraffic

/**
 * DeviceTraffic
 *
 * Trigger: in view, then hover, plus a live timeline. A white traffic card:
 * a light gray header with an icon tile, a title and a line of copy, then a
 * white panel overlapping it with the total visitors on rolling digits and a column per device
 * (desktop, tablet, mobile). Each column has a tall gauge that fills to the
 * device's share. When the card scrolls into view the gauges fill one after
 * another while the numbers roll up from zero. While live, new visits arrive
 * every few seconds: the total rolls on, a small "+n" floats up by the Live chip, the
 * shares drift and the gauges settle to their new levels on a spring.
 * Pointing at a column (or focusing it) dims the others, tilts its device
 * icon into play and swaps its change for the visitor count. Live updates
 * pause off screen and in a hidden tab. Reduced motion keeps the numbers
 * current without movement.
 *
 * Engine: motion/react (gauge fills sliding up on springs, spring digit columns,
 * AnimatePresence for the swaps and the "+n") with animated icons from
 * lucide-animated (MIT), vendored in src/icons.
 */

export type DeviceKind = "desktop" | "tablet" | "mobile";

export interface DeviceTrafficDevice {
  name: string;
  kind: DeviceKind;
  /** Share of visitors, in percent. Shares are scaled to add up to 100. */
  share: number;
  /** Change against the last period, in percent. */
  change: number;
  /** Gauge color. Defaults follow the card's palette. */
  color?: string;
}

export interface DeviceTrafficProps {
  /** Title in the shell. Default `"Traffic by device"`. */
  title?: React.ReactNode;
  /** Line under the title. */
  description?: React.ReactNode;
  /** Label over the total. Default `"Total visitors"`. */
  label?: string;
  /** Visitors at the start. Default `237456`. */
  total?: number;
  /** Change of the total against the last period, in percent. Default `-1.4`. */
  change?: number;
  devices?: DeviceTrafficDevice[];
  /** New visits arrive every few seconds. Default true. */
  live?: boolean;
  /** Seconds between live updates. Default `2.6`. */
  interval?: number;
  /** Gauge colors, one per device, used when a device has no color of its own. */
  colors?: string[];
  /** Called by the Report button. Leave out to hide it. */
  onReport?: () => void;
  /** Locale for numbers. Default `"en-US"`. */
  locale?: string;
  /** Show the gray header band with the icon, title and copy. Default true; false leaves just the chart. */
  header?: boolean;
  className?: string;
}

const PALETTE = ["#4f46e5", "#38bdf8", "#34d399"];
const GOOD = "#269a5a";
const BAD = "#d64545";
const GLIDE = [0.22, 1, 0.36, 1] as const;
const ROLL: Transition = { type: "spring", stiffness: 200, damping: 26 };
const LEVEL: Transition = { type: "spring", stiffness: 120, damping: 18 };
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const DEFAULT_DEVICES: DeviceTrafficDevice[] = [
  { name: "Desktop", kind: "desktop", share: 27, change: -3.2 },
  { name: "Tablet", kind: "tablet", share: 12, change: -6.4 },
  { name: "Mobile", kind: "mobile", share: 61, change: 0.8 },
];

function Digit({ digit, still }: { digit: number; still: boolean }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
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

/** Text whose digits roll on their own columns, keyed from the right; other characters stay put. */
function RollText({ text, still }: { text: string; still: boolean }) {
  const chars = Array.from(text);
  return (
    <span aria-hidden className="inline-flex leading-none tabular-nums">
      {chars.map((ch, i) => {
        const key = chars.length - i;
        return /\d/.test(ch) ? (
          <Digit key={key} digit={Number(ch)} still={still} />
        ) : (
          <span key={`${key}${ch}`} className="whitespace-pre">
            {ch}
          </span>
        );
      })}
    </span>
  );
}

const zeroed = (text: string) => text.replace(/\d/g, "0");

/** Tablet has no animated icon upstream, so it turns a quarter like a device being rotated. */
function TabletIcon({
  active,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  const still = !!useReducedMotion();
  return (
    <motion.span
      className={cn("inline-grid place-items-center", className)}
      animate={active && !still ? { rotate: [0, -90, -90, 0] } : { rotate: 0 }}
      transition={{ duration: 1.1, times: [0, 0.35, 0.7, 1], ease: GLIDE }}
    >
      <Tablet className="size-full" />
    </motion.span>
  );
}

const ICONS: Record<
  DeviceKind,
  React.ComponentType<{ active?: boolean; className?: string }>
> = {
  desktop: MonitorCheckIcon,
  tablet: TabletIcon,
  mobile: SmartphoneNfcIcon,
};

function Change({
  change,
  nudge,
  chip,
}: {
  change: number;
  nudge: boolean;
  chip?: boolean;
}) {
  const up = change >= 0;
  const color = up ? GOOD : BAD;
  const Arrow = up ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium tabular-nums",
        chip && "h-7 rounded-full px-2.5",
      )}
      style={{ color, background: chip ? `${color}14` : undefined }}
    >
      {up ? "+" : "−"}
      {Math.abs(change).toFixed(1)}%
      <motion.span
        className="grid"
        animate={nudge ? { x: 2, y: up ? -2 : 2 } : { x: 0, y: 0 }}
        transition={{ duration: 0.25, ease: GLIDE }}
      >
        <Arrow className="size-3.5" strokeWidth={2.5} />
      </motion.span>
    </span>
  );
}

/** Shares scaled to 100. */
function normalize(shares: number[]) {
  const sum = shares.reduce((a, b) => a + b, 0) || 1;
  return shares.map((s) => (s / sum) * 100);
}

/** Rounded percentages that still add up to 100 (largest remainders get the spare points). */
function wholePercents(shares: number[]) {
  const floors = shares.map(Math.floor);
  let spare = 100 - floors.reduce((a, b) => a + b, 0);
  const order = shares
    .map((s, i) => ({ i, r: s - Math.floor(s) }))
    .sort((a, b) => b.r - a.r);
  for (const { i } of order) {
    if (spare <= 0) break;
    floors[i]!++;
    spare--;
  }
  return floors;
}

export const DeviceTraffic = React.forwardRef<
  HTMLDivElement,
  DeviceTrafficProps
>(function DeviceTraffic(
  {
    title = "Traffic by device",
    description = "Watch where visitors arrive from, and spot shifts between screens as they happen.",
    label = "Total visitors",
    total: startTotal = 237456,
    change = -1.4,
    devices = DEFAULT_DEVICES,
    live = true,
    interval = 2.6,
    colors = PALETTE,
    onReport,
    locale = "en-US",
    header = true,
    className,
  },
  ref,
) {
  const still = !!useReducedMotion();
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => root.current!);
  const seen = useInView(root, { once: true, amount: 0.35 });
  const visible = useInView(root, { amount: 0.1 });
  const shown = seen || still;
  const format = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const [total, setTotal] = React.useState(startTotal);
  const [shares, setShares] = React.useState(() =>
    normalize(devices.map((d) => d.share)),
  );
  const [bump, setBump] = React.useState<{ n: number; key: number } | null>(
    null,
  );
  const [hover, setHover] = React.useState<number | null>(null);
  const [headHover, setHeadHover] = React.useState(false);

  // New numbers start the card over (compared by content, so inline arrays are fine).
  const shareKey = devices.map((d) => d.share).join(",");
  React.useEffect(() => {
    setTotal(startTotal);
    setShares(normalize(shareKey.split(",").map(Number)));
  }, [startTotal, shareKey]);

  // Live: a few visits every tick, and the shares drift a little.
  React.useEffect(() => {
    if (!live || !seen || !visible) return;
    const t = window.setInterval(() => {
      if (document.hidden) return;
      const n = 4 + Math.floor(Math.random() * 32);
      setTotal((v) => v + n);
      setBump((b) => ({ n, key: (b?.key ?? 0) + 1 }));
      setShares((s) =>
        normalize(s.map((x) => Math.max(1, x + (Math.random() - 0.5) * 1.2))),
      );
    }, interval * 1000);
    return () => window.clearInterval(t);
  }, [live, seen, visible, interval]);

  // The "+n" fades away on its own.
  React.useEffect(() => {
    if (!bump) return;
    const t = window.setTimeout(() => setBump(null), 1400);
    return () => window.clearTimeout(t);
  }, [bump]);

  const percents = wholePercents(shares);
  const totalText = format.format(total);

  return (
    <motion.div
      ref={root}
      initial={still ? false : { opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={shown ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.6, ease: GLIDE }}
      className={cn(
        "w-[400px] max-w-full overflow-hidden rounded-[32px] bg-white text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]",
        className,
      )}
    >
      {/* Header band: icon, title and copy. Leave it out with header={false}. */}
      {header && (
        <div
          className="bg-[#f1f1ef] px-6 pb-14 pt-6"
          onPointerEnter={() => setHeadHover(true)}
          onPointerLeave={() => setHeadHover(false)}
        >
          <span
            className="grid size-11 place-items-center rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            style={{ color: colors[0] ?? PALETTE[0] }}
          >
            <RadioIcon
              className="size-5"
              active={headHover || (live && bump !== null)}
            />
          </span>
          <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-1.5 text-pretty text-sm leading-relaxed text-zinc-500">
            {description}
          </p>
        </div>
      )}

      <motion.div
        initial={still ? false : { opacity: 0, y: 12 }}
        animate={shown ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.55, ease: GLIDE, delay: still ? 0 : 0.12 }}
        className={cn(
          "relative bg-white px-6 pb-6 pt-6",
          header && "-mt-8 rounded-t-[28px]",
        )}
      >
        {/* Headline */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              {label}
              {live && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#269a5a]/10 px-2 py-0.5 text-xs font-medium text-[#269a5a]">
                  <span className="relative grid size-1.5 place-items-center">
                    {!still && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-[#269a5a]"
                        animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                    )}
                    <span className="relative size-1.5 rounded-full bg-[#269a5a]" />
                  </span>
                  Live
                </span>
              )}
              {/* New visits float up beside the Live chip and fade. */}
              <span className="relative h-5 w-10">
                <AnimatePresence>
                  {bump && !still && (
                    <motion.span
                      key={bump.key}
                      aria-hidden
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.5, ease: GLIDE }}
                      className="pointer-events-none absolute left-0 top-0 text-xs font-semibold leading-5 tabular-nums text-[#269a5a]"
                    >
                      +{bump.n}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[32px] font-semibold leading-none tracking-tight">
                <span className="sr-only">{totalText}</span>
                <RollText
                  text={shown ? totalText : zeroed(totalText)}
                  still={still}
                />
              </span>
              <Change change={change} nudge={false} chip />
            </div>
          </div>
          {onReport && (
            <motion.button
              type="button"
              onClick={onReport}
              whileTap={still ? undefined : { scale: 0.95 }}
              className="group/btn flex h-9 shrink-0 cursor-pointer items-center gap-1 overflow-hidden rounded-full bg-[#242423]/[0.05] pl-3.5 pr-2.5 text-sm font-medium outline-none transition-colors hover:bg-[#242423]/[0.09] focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              Report
              <span className="relative grid size-4 place-items-center overflow-hidden">
                <ArrowUpRightIcon
                  className="size-3.5 transition-transform duration-300 ease-out group-hover/btn:-translate-y-4 group-hover/btn:translate-x-4"
                  strokeWidth={2.5}
                />
                <ArrowUpRightIcon
                  className="absolute size-3.5 -translate-x-4 translate-y-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-0 group-hover/btn:translate-y-0"
                  strokeWidth={2.5}
                />
              </span>
            </motion.button>
          )}
        </div>

        <div aria-hidden className="-mx-6 my-5 h-px bg-[#242423]/[0.07]" />

        {/* One column per device */}
        <div className="grid grid-cols-3" onPointerLeave={() => setHover(null)}>
          {devices.map((d, i) => {
            const Icon = ICONS[d.kind];
            const color =
              d.color ??
              colors[i % colors.length] ??
              PALETTE[i % PALETTE.length]!;
            const on = hover === i;
            const dim = hover !== null && !on;
            const visitors = format.format(
              Math.round((total * (shares[i] ?? 0)) / 100),
            );
            const pct = `${percents[i] ?? 0}%`;
            return (
              <motion.div
                key={d.name}
                tabIndex={0}
                aria-label={`${d.name}: ${pct} of visitors, ${visitors} visitors, ${d.change >= 0 ? "up" : "down"} ${Math.abs(d.change)}%`}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                animate={{ opacity: dim ? 0.45 : 1 }}
                transition={{ duration: 0.25, ease: GLIDE }}
                className="relative flex min-w-0 flex-col px-3 outline-none focus-visible:bg-[#242423]/[0.02]"
              >
                {i > 0 && (
                  <span
                    aria-hidden
                    className="absolute -bottom-6 -top-5 left-0 w-px bg-[#242423]/[0.07]"
                  />
                )}
                <span
                  className={cn(
                    "flex items-center gap-2 text-sm transition-colors",
                    on ? "text-[#242423]" : "text-zinc-500",
                  )}
                >
                  <span
                    className="grid transition-colors"
                    style={on ? { color } : undefined}
                  >
                    <Icon className="size-4" active={on} />
                  </span>
                  <span className="truncate">{d.name}</span>
                </span>
                <span className="mt-2 text-2xl font-semibold leading-none tracking-tight">
                  <RollText text={shown ? pct : zeroed(pct)} still={still} />
                </span>

                {/* The gauge: a tall track that fills to the device's share. */}
                <span
                  aria-hidden
                  className="relative mt-4 block h-28 overflow-hidden rounded-xl bg-[#242423]/[0.04]"
                >
                  {[25, 50, 75].map((g) => (
                    <span
                      key={g}
                      className="absolute inset-x-2 h-px bg-[#242423]/[0.05]"
                      style={{ bottom: `${g}%` }}
                    />
                  ))}
                  <motion.span
                    className="absolute inset-0 origin-bottom rounded-xl"
                    style={{
                      background: `linear-gradient(to top, ${color}, ${color}b3)`,
                    }}
                    initial={still ? false : { scaleY: 0 }}
                    animate={{
                      scaleY: shown ? (shares[i] ?? 0) / 100 : 0,
                      opacity: on || hover === null ? 1 : 0.55,
                    }}
                    transition={
                      still
                        ? { duration: 0 }
                        : {
                            scaleY: {
                              ...LEVEL,
                              delay:
                                seen && total === startTotal
                                  ? 0.35 + i * 0.12
                                  : 0,
                            },
                            opacity: { duration: 0.25 },
                          }
                    }
                  />
                </span>

                <span className="relative mt-3 flex h-5 items-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={on ? "count" : "change"}
                      initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                      transition={{ duration: still ? 0 : 0.2, ease: GLIDE }}
                      className="flex items-center whitespace-nowrap"
                    >
                      {on ? (
                        <span className="text-sm font-medium tabular-nums text-zinc-600">
                          {visitors}
                        </span>
                      ) : (
                        <Change change={d.change} nudge={false} />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
});