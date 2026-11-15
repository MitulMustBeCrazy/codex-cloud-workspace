"use client";

/**
 * RecapCard, from https://motion-brew.com/components/recap-card
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
import { animate, motion, type Transition, useAnimation, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: arrow-right
const ArrowRightIcon = (() => {
interface ArrowRightIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowRightIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: { d: "M5 12h14" },
  animate: {
    d: ["M5 12h14", "M5 12h9", "M5 12h14"],
    transition: {
      duration: 0.4,
    },
  },
};

const SECONDARY_PATH_VARIANTS: Variants = {
  normal: { d: "m12 5 7 7-7 7", translateX: 0 },
  animate: {
    d: "m12 5 7 7-7 7",
    translateX: [0, -3, 0],
    transition: {
      duration: 0.4,
    },
  },
};

const ArrowRightIcon = forwardRef<ArrowRightIconHandle, ArrowRightIconProps>(
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
            d="M5 12h14"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="m12 5 7 7-7 7"
            variants={SECONDARY_PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

ArrowRightIcon.displayName = "ArrowRightIcon";
  return ArrowRightIcon;
})();

// Animated icon: clock
const ClockIcon = (() => {
interface ClockIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ClockIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const HAND_TRANSITION: Transition = {
  duration: 0.6,
  ease: [0.4, 0, 0.2, 1],
};

const HAND_VARIANTS: Variants = {
  normal: {
    rotate: 0,
    originX: "0%",
    originY: "100%",
  },
  animate: {
    rotate: 360,
    originX: "0%",
    originY: "100%",
  },
};

const MINUTE_HAND_TRANSITION: Transition = {
  duration: 0.5,
  ease: "easeInOut",
};

const MINUTE_HAND_VARIANTS: Variants = {
  normal: {
    rotate: 0,
    originX: "0%",
    originY: "100%",
  },
  animate: {
    rotate: 45,
    originX: "0%",
    originY: "100%",
  },
};

const ClockIcon = forwardRef<ClockIconHandle, ClockIconProps>(
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
          <circle cx="12" cy="12" r="10" />
          <motion.line
            animate={controls}
            initial="normal"
            transition={HAND_TRANSITION}
            variants={HAND_VARIANTS}
            x1="12"
            x2="12"
            y1="12"
            y2="6"
          />
          <motion.line
            animate={controls}
            initial="normal"
            transition={MINUTE_HAND_TRANSITION}
            variants={MINUTE_HAND_VARIANTS}
            x1="12"
            x2="16"
            y1="12"
            y2="12"
          />
        </svg>
      </span>
    );
  }
);

ClockIcon.displayName = "ClockIcon";
  return ClockIcon;
})();

// Animated icon: feather
const FeatherIcon = (() => {
interface FeatherIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FeatherIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const FEATHER_VARIANTS: Variants = {
  normal: {
    rotate: 0,
    y: 0,
    x: 0,
  },
  animate: {
    rotate: [0, -8, 4, -3, 0],
    y: [0, -4, -2, -1, 0],
    x: [0, 2, -2, 1, 0],
    transition: {
      duration: 1.6,
      ease: "easeInOut",
    },
  },
};

const FeatherIcon = forwardRef<FeatherIconHandle, FeatherIconProps>(
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
          variants={FEATHER_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z" />
          <path d="M16 8 2 22" />
          <path d="M17.5 15H9" />
        </motion.svg>
      </span>
    );
  }
);

FeatherIcon.displayName = "FeatherIcon";
  return FeatherIcon;
})();

// Animated icon: file-text
const FileTextIcon = (() => {
interface FileTextIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FileTextIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const FILE_TEXT = forwardRef<FileTextIconHandle, FileTextIconProps>(
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
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          variants={{
            normal: { scale: 1 },
            animate: {
              scale: 1.05,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />

          <motion.path
            d="M10 9H8"
            stroke="currentColor"
            strokeWidth={strokeWidth ?? 2}
            variants={{
              normal: {
                pathLength: 1,
                x1: 8,
                x2: 10,
              },
              animate: {
                pathLength: [1, 0, 1],
                x1: [8, 10, 8],
                x2: [10, 10, 10],
                transition: {
                  duration: 0.7,
                  delay: 0.3,
                },
              },
            }}
          />
          <motion.path
            d="M16 13H8"
            stroke="currentColor"
            strokeWidth={strokeWidth ?? 2}
            variants={{
              normal: {
                pathLength: 1,
                x1: 8,
                x2: 16,
              },
              animate: {
                pathLength: [1, 0, 1],
                x1: [8, 16, 8],
                x2: [16, 16, 16],
                transition: {
                  duration: 0.7,
                  delay: 0.5,
                },
              },
            }}
          />
          <motion.path
            d="M16 17H8"
            stroke="currentColor"
            strokeWidth={strokeWidth ?? 2}
            variants={{
              normal: {
                pathLength: 1,
                x1: 8,
                x2: 16,
              },
              animate: {
                pathLength: [1, 0, 1],
                x1: [8, 16, 8],
                x2: [16, 16, 16],
                transition: {
                  duration: 0.7,
                  delay: 0.7,
                },
              },
            }}
          />
        </motion.svg>
      </span>
    );
  }
);

FILE_TEXT.displayName = "FileTextIcon";
  return FILE_TEXT;
})();

// Animated icon: flame
const FlameIcon = (() => {
interface FlameIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FlameIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
    pathOffset: 0,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      delay: 0.1,
      duration: 0.4,
      opacity: { duration: 0.1, delay: 0.1 },
    },
  },
};

const FlameIcon = forwardRef<FlameIconHandle, FlameIconProps>(
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
            d="M8.9 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
            fill="none"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

FlameIcon.displayName = "FlameIcon";
  return FlameIcon;
})();

// Animated icon: moon
const MoonIcon = (() => {
interface MoonIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MoonIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SVG_VARIANTS: Variants = {
  normal: {
    rotate: 0,
  },
  animate: {
    rotate: [0, -10, 10, -5, 5, 0],
  },
};

const SVG_TRANSITION: Transition = {
  duration: 1.2,
  ease: "easeInOut",
};

const MoonIcon = forwardRef<MoonIconHandle, MoonIconProps>(
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
          transition={SVG_TRANSITION}
          variants={SVG_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </motion.svg>
      </span>
    );
  }
);

MoonIcon.displayName = "MoonIcon";
  return MoonIcon;
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

// Animated icon: sun
const SunIcon = (() => {
interface SunIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SunIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: { opacity: 1 },
  animate: (i: number) => ({
    opacity: [0, 1],
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

const SunIcon = forwardRef<SunIconHandle, SunIconProps>(
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
          <circle cx="12" cy="12" r="4" />
          {[
            "M12 2v2",
            "m19.07 4.93-1.41 1.41",
            "M20 12h2",
            "m17.66 17.66 1.41 1.41",
            "M12 20v2",
            "m6.34 17.66-1.41 1.41",
            "M2 12h2",
            "m4.93 4.93 1.41 1.41",
          ].map((d, index) => (
            <motion.path
              animate={controls}
              custom={index + 1}
              d={d}
              key={d}
              variants={PATH_VARIANTS}
            />
          ))}
        </svg>
      </span>
    );
  }
);

SunIcon.displayName = "SunIcon";
  return SunIcon;
})();

// Animated icon: trending-up
const TrendingUpIcon = (() => {
interface TrendingUpIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface TrendingUpIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SVG_VARIANTS: Variants = {
  animate: {
    x: 0,
    y: 0,
    translateX: [0, 2, 0],
    translateY: [0, -2, 0],
    transition: {
      duration: 0.5,
    },
  },
};

const PATH_VARIANTS: Variants = {
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
    pathOffset: [1, 0],
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
};

const ARROW_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: {
      delay: 0.3,
      duration: 0.3,
      opacity: { duration: 0.1, delay: 0.3 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [0.5, 0],
    transition: {
      delay: 0.3,
      duration: 0.3,
      opacity: { duration: 0.1, delay: 0.3 },
    },
  },
};

const TrendingUpIcon = forwardRef<TrendingUpIconHandle, TrendingUpIconProps>(
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
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          variants={SVG_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.polyline
            animate={controls}
            initial="normal"
            points="22 7 13.5 15.5 8.5 10.5 2 17"
            variants={PATH_VARIANTS}
          />
          <motion.polyline
            animate={controls}
            initial="normal"
            points="16 7 22 7 22 13"
            variants={ARROW_VARIANTS}
          />
        </motion.svg>
      </span>
    );
  }
);

TrendingUpIcon.displayName = "TrendingUpIcon";
  return TrendingUpIcon;
})();

// RecapCard

/**
 * RecapCard
 *
 * Trigger: in view, then hover, focus and press. A white summary card that
 * reads like a sentence: the period's numbers sit inline in soft gray chips,
 * each with an animated icon, and count up from zero when the card scrolls
 * into view while their icons play once. Below, a row of round milestone
 * badges pops in one after another on a spring. Earned badges carry their icon
 * in ink with a small check; a badge still in reach shows a ring filling to
 * how close it is. Hovering or focusing a badge lifts it, turns its disc to
 * ink and plays its icon, and a dark note on how it was earned grows up out of
 * the disc like liquid: a column shoots up, spreads into the note and stays
 * joined to the disc by soft inward curves, then drains back on leave. A full width button at the bottom
 * slides its arrow on hover and dips on press. Reduced motion shows the final
 * state at once.
 *
 * Engine: motion/react (useInView, animate on motion values for the counts,
 * staggered spring variants for the badges, a pathLength ring for progress,
 * and two springs feeding one SVG path for the liquid note, as in LiquidTabs).
 */

/** The animated icons a stat or a badge can carry. */
export type RecapIconName =
  | "words"
  | "trend"
  | "streak"
  | "time"
  | "spark"
  | "sun"
  | "moon"
  | "feather";

/** A number inside the sentence, set in a chip that counts up. */
export interface RecapStat {
  value: number;
  /** Decimal places. Default `0`. */
  decimals?: number;
  /** Text before the number, as in `"$"`. */
  prefix?: string;
  /** Text after the number, as in `" words"` or `"%"`. */
  suffix?: string;
  icon?: RecapIconName;
}

/** The sentence, as plain text and stats in reading order. */
export type RecapPart = string | RecapStat;

export interface RecapBadge {
  label: string;
  icon: RecapIconName;
  /** How it was earned, or how close it is, shown on hover and focus. */
  note: string;
  /** Share of the way there, 0 to 1. Below 1 the badge is still in reach and shows a ring. Default `1`. */
  progress?: number;
}

export interface RecapCardProps {
  /** Card title. Default `"Your month in words"`. */
  title?: string;
  /** Period shown in a chip by the title. Pass `null` to hide it. Default `"November"`. */
  period?: string | null;
  /** The summary sentence. Default a writing recap. */
  parts?: RecapPart[];
  /** The badges, left to right. Default four writing milestones. */
  badges?: RecapBadge[];
  /** Button label. Pass `null` to hide the button. Default `"View full recap"`. */
  actionLabel?: string | null;
  /** Makes the button a link. */
  href?: string;
  onAction?: () => void;
  className?: string;
}

const ICONS: Record<
  RecapIconName,
  React.ComponentType<{ className?: string; active?: boolean; strokeWidth?: number }>
> = {
  words: FileTextIcon,
  trend: TrendingUpIcon,
  streak: FlameIcon,
  time: ClockIcon,
  spark: SparklesIcon,
  sun: SunIcon,
  moon: MoonIcon,
  feather: FeatherIcon,
};

const DEFAULT_PARTS: RecapPart[] = [
  "This month you wrote ",
  { value: 12480, suffix: " words", icon: "words" },
  ", ",
  { value: 18, suffix: "% more", icon: "trend" },
  " than in October. You finished ",
  { value: 9, suffix: " drafts" },
  " and kept a ",
  { value: 14, suffix: " day streak", icon: "streak" },
  " going.",
];

const DEFAULT_BADGES: RecapBadge[] = [
  { label: "Early riser", icon: "sun", note: "Wrote before 8 am on 10 mornings" },
  { label: "Streak keeper", icon: "streak", note: "14 days in a row, your best yet" },
  { label: "Wordsmith", icon: "feather", note: "Passed 10,000 words in a month" },
  { label: "Night owl", icon: "moon", note: "4 of 7 late sessions, 3 to go", progress: 4 / 7 },
];

const EASE = [0.22, 1, 0.36, 1] as const;
const POP = { type: "spring", stiffness: 420, damping: 22 } as const;

const row: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
};
const pop: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -10, y: 8 },
  shown: { opacity: 1, scale: 1, rotate: 0, y: 0, transition: POP },
};

const format = (n: number, decimals: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** One stat chip: the number counts up on a motion value once `run` turns on. */
function StatChip({
  stat,
  run,
  still,
  delay,
}: {
  stat: RecapStat;
  run: boolean;
  still: boolean;
  delay: number;
}) {
  const decimals = stat.decimals ?? 0;
  const value = useMotionValue(still ? stat.value : 0);
  const [text, setText] = React.useState(() =>
    format(still ? stat.value : 0, decimals),
  );
  const [playing, setPlaying] = React.useState(false);
  useMotionValueEvent(value, "change", (v) => setText(format(v, decimals)));

  React.useEffect(() => {
    if (!run) return;
    if (still) {
      value.set(stat.value);
      return;
    }
    const controls = animate(value, stat.value, {
      duration: 1.2,
      delay,
      ease: EASE,
    });
    const on = window.setTimeout(() => setPlaying(true), delay * 1000);
    const off = window.setTimeout(() => setPlaying(false), delay * 1000 + 1100);
    return () => {
      controls.stop();
      window.clearTimeout(on);
      window.clearTimeout(off);
    };
  }, [run, still, stat.value, delay, value]);

  const Icon = stat.icon ? ICONS[stat.icon] : null;
  return (
    <span className="inline-flex h-7 translate-y-[-1px] items-center gap-1.5 rounded-full bg-[#242423]/[0.06] px-2.5 align-middle text-sm font-semibold text-[#242423] dark:bg-white/[0.08] dark:text-zinc-100">
      {Icon && <Icon className="size-3.5" active={playing} strokeWidth={2.25} />}
      <span className="tabular-nums">
        {stat.prefix}
        {text}
        {stat.suffix}
      </span>
    </span>
  );
}

// The liquid note, built like LiquidTabs upside down: one path holds the dark
// note on top and a bump hanging from its bottom edge whose round end is the
// badge's disc, joined by inward curves. Two springs grow it: a quick one
// shoots a column up out of the disc, a looser one spreads it into the note.
const NOTE_GAP = 5; // from the disc's top to the note's bottom edge, at rest
const NOTE_NECK = 12; // how far the curves reach out along the note's edge
const NOTE_R = 14; // the note's corners
const NOTE_MAX = 220; // the note's widest
const RISE = { type: "spring", stiffness: 560, damping: 26 } as const;
const SPREAD = { type: "spring", stiffness: 300, damping: 21, delay: 0.05 } as const;

// Where the necks leave the disc, measured from its top: around its upper sides.
const NOTE_ANGLE = (58 * Math.PI) / 180;

/**
 * The outline: a round disc of radius r centred on 0,0 and a note w x h above
 * it. Two curves leave the disc's upper sides and bend out to meet the note's
 * bottom edge. `rise` lifts a column out of the disc; `spread` widens it into
 * the note and opens the curves.
 */
function noteShape(r: number, w: number, h: number, rise: number, spread: number) {
  const xt = r * Math.sin(NOTE_ANGLE);
  const yt = -r * Math.cos(NOTE_ANGLE);
  const pb = -r - NOTE_GAP * rise; // the note's bottom edge
  const W = 2 * xt + (w - 2 * xt) * spread;
  const H = h * rise;
  const top = pb - H;
  const x = W / 2;
  const R = Math.max(0, Math.min(NOTE_R, H / 2, x));
  const n = Math.max(0, Math.min(NOTE_NECK * spread, x - xt - 1));
  const xe = xt + n;
  // While the note is still a column, its bottom corners give way to the neck.
  const Rb = Math.max(0, Math.min(R, x - xe));
  const dy = Math.max(0, yt - pb);
  // Leave the disc along its own curve, then bend out to the note's edge.
  const c1x = xt - Math.cos(NOTE_ANGLE) * dy * 0.45;
  const c1y = yt - Math.sin(NOTE_ANGLE) * dy * 0.45;
  const c2x = xe - n * 0.6;
  return [
    `M${-xt} ${yt}`,
    `A${r} ${r} 0 1 0 ${xt} ${yt}`,
    `C${c1x} ${c1y} ${c2x} ${pb} ${xe} ${pb}`,
    `L${x - Rb} ${pb}`,
    `A${Rb} ${Rb} 0 0 0 ${x} ${pb - Rb}`,
    `L${x} ${top + R}`,
    `A${R} ${R} 0 0 0 ${x - R} ${top}`,
    `L${-x + R} ${top}`,
    `A${R} ${R} 0 0 0 ${-x} ${top + R}`,
    `L${-x} ${pb - Rb}`,
    `A${Rb} ${Rb} 0 0 0 ${-x + Rb} ${pb}`,
    `L${-xe} ${pb}`,
    `C${-c2x} ${pb} ${-c1x} ${c1y} ${-xt} ${yt}`,
    "Z",
  ].join(" ");
}

/** The note on hover: grows out of the disc like liquid and drains back into it. */
function LiquidNote({
  open,
  note,
  id,
  radius,
  still,
}: {
  open: boolean;
  note: string;
  id: string;
  radius: number;
  still: boolean;
}) {
  const rise = useMotionValue(0);
  const spread = useMotionValue(0);
  const measure = React.useRef<HTMLSpanElement>(null);
  const [size, setSize] = React.useState({ w: 160, h: 36 });
  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    const m = measure.current;
    if (m) setSize({ w: Math.min(NOTE_MAX, m.offsetWidth), h: m.offsetHeight });
  }, [note]);

  React.useEffect(() => {
    if (open) setMounted(true);
    if (still) {
      rise.set(open ? 1 : 0);
      spread.set(open ? 1 : 0);
      if (!open) setMounted(false);
      return;
    }
    if (open) {
      const a = animate(rise, 1, RISE);
      const b = animate(spread, 1, SPREAD);
      return () => {
        a.stop();
        b.stop();
      };
    }
    // Leaving: the note pulls in first, then the column drains into the disc.
    // Firm springs that count as done once they are visually still, so the
    // shape is gone as soon as it has drained, not after a long settle.
    const b = animate(spread, 0, { type: "spring", stiffness: 640, damping: 42, restDelta: 0.01 });
    const a = animate(rise, 0, {
      type: "spring",
      stiffness: 560,
      damping: 40,
      delay: 0.04,
      restDelta: 0.01,
      restSpeed: 0.05,
    });
    a.then(() => setMounted(false));
    return () => {
      a.stop();
      b.stop();
    };
  }, [open, still, rise, spread]);

  const d = useTransform(() =>
    noteShape(radius, Math.max(size.w, radius * 2), size.h, rise.get(), spread.get()),
  );
  const textOpacity = useTransform(spread, [0.55, 0.95], [0, 1]);
  // The shape also draws the disc, so it fades as the column drains back:
  // the disc then shows its own colour again instead of staying dark.
  const shapeOpacity = useTransform(rise, [0, 0.35], [0, 1]);
  // The text sits in the middle of the note as it grows.
  const textY = useTransform(rise, (p) => -radius - NOTE_GAP * p - (size.h * p) / 2 - size.h / 2);

  return (
    <>
      {/* Sizes the note before it shows. */}
      <span
        ref={measure}
        aria-hidden
        className="pointer-events-none invisible absolute w-max max-w-[220px] text-balance px-3.5 py-2 text-center text-xs font-medium leading-snug"
      >
        {note}
      </span>
      {mounted && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 text-[#242423] dark:text-zinc-100">
          {/* A 1px box: an SVG of zero size is not drawn at all, overflow or not. */}
          <svg aria-hidden width="1" height="1" className="absolute left-0 top-0 overflow-visible">
            <motion.path d={d} fill="currentColor" style={{ opacity: shapeOpacity }} />
          </svg>
          <motion.span
            role="tooltip"
            id={id}
            style={{ y: textY, opacity: textOpacity, x: "-50%" }}
            className="absolute left-0 top-0 block w-max max-w-[220px] text-balance px-3.5 py-2 text-center text-xs font-medium leading-snug text-white dark:text-zinc-900"
          >
            {note}
          </motion.span>
        </span>
      )}
    </>
  );
}

/** A round milestone badge; below full progress a ring shows how close it is. */
function Badge({
  badge,
  index,
  still,
  shown,
}: {
  badge: RecapBadge;
  index: number;
  still: boolean;
  shown: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const progress = Math.min(1, Math.max(0, badge.progress ?? 1));
  const earned = progress >= 1;
  const Icon = ICONS[badge.icon];
  const noteId = React.useId();
  // The disc's radius, which the note's bump wraps around.
  const disc = React.useRef<HTMLSpanElement>(null);
  const [discRadius, setDiscRadius] = React.useState(26);
  React.useLayoutEffect(() => {
    const el = disc.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setDiscRadius(el.offsetWidth / 2));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const R = 30;

  return (
    <motion.li variants={pop} className={cn("relative flex min-w-0 flex-1 justify-center", open && "z-20")}>
      <motion.button
        type="button"
        aria-describedby={noteId}
        aria-label={`${badge.label}${earned ? ", earned" : `, ${Math.round(progress * 100)}% there`}`}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        whileHover={still ? undefined : { y: -4 }}
        whileTap={still ? undefined : { scale: 0.94 }}
        transition={POP}
        className="group/badge flex w-full cursor-pointer flex-col items-center gap-2.5 rounded-2xl pb-1 pt-2 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      >
        <span className="relative grid size-14 place-items-center sm:size-16">
          <LiquidNote open={open} note={badge.note} id={noteId} radius={discRadius} still={still} />
          <span
            ref={disc}
            className={cn(
              "absolute inset-1.5 rounded-full transition-colors duration-200",
              open
                ? "bg-[#242423] dark:bg-zinc-100"
                : earned
                  ? "bg-[#242423]/[0.06] dark:bg-white/[0.08]"
                  : "bg-[#242423]/[0.03] dark:bg-white/[0.04]",
            )}
          />
          {!earned && (
            <svg viewBox="0 0 64 64" aria-hidden className="absolute inset-0 -rotate-90">
              <circle cx="32" cy="32" r={R} fill="none" strokeWidth="3" className="stroke-[#242423]/[0.08] dark:stroke-white/10" />
              <motion.circle
                cx="32"
                cy="32"
                r={R}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                className="stroke-[#242423] dark:stroke-zinc-100"
                initial={{ pathLength: still ? progress : 0 }}
                animate={{ pathLength: shown ? progress : 0 }}
                transition={{ duration: 1.1, delay: still ? 0 : 0.6 + index * 0.08, ease: EASE }}
              />
            </svg>
          )}
          <Icon
            className={cn(
              "relative z-20 size-6 transition-colors duration-300",
              open
                ? "text-white dark:text-zinc-900"
                : earned
                  ? "text-[#242423] dark:text-zinc-100"
                  : "text-zinc-400 dark:text-zinc-500",
            )}
            strokeWidth={1.75}
          />
          {earned && (
            <motion.span
              aria-hidden
              initial={still ? false : { scale: 0 }}
              animate={{ scale: shown ? 1 : 0 }}
              transition={{ ...POP, delay: still ? 0 : 0.75 + index * 0.08 }}
              className="absolute bottom-1 right-1 z-20 grid size-4 place-items-center rounded-full bg-[#242423] text-white ring-2 ring-white dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-900"
            >
              <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6.2 5 8l4-4.2" />
              </svg>
            </motion.span>
          )}
        </span>
        <span className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-medium leading-tight text-[#242423] sm:text-sm dark:text-zinc-100">
            {badge.label}
          </span>
          <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            {earned ? "Earned" : `${Math.round(progress * 100)}%`}
          </span>
        </span>
      </motion.button>

      {/* Keeps the note readable by screen readers while it is closed. */}
      {!open && (
        <span id={noteId} className="sr-only">
          {badge.note}
        </span>
      )}
    </motion.li>
  );
}

export const RecapCard = React.forwardRef<HTMLDivElement, RecapCardProps>(
  function RecapCard(
    {
      title = "Your month in words",
      period = "November",
      parts = DEFAULT_PARTS,
      badges = DEFAULT_BADGES,
      actionLabel = "View full recap",
      href,
      onAction,
      className,
    },
    forwardedRef,
  ) {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);
    const inView = useInView(ref, { once: true, amount: 0.35 });
    const still = !!useReducedMotion();
    const shown = still || inView;
    const [hoverAction, setHoverAction] = React.useState(false);

    let statIndex = 0;
    const sentence = parts.map((p, i) => {
      if (typeof p === "string") return <React.Fragment key={i}>{p}</React.Fragment>;
      const delay = 0.15 + statIndex++ * 0.12;
      return <StatChip key={i} stat={p} run={shown} still={still} delay={delay} />;
    });
    // The plain sentence with final numbers, for screen readers.
    const spoken = parts
      .map((p) =>
        typeof p === "string" ? p : `${p.prefix ?? ""}${format(p.value, p.decimals ?? 0)}${p.suffix ?? ""}`,
      )
      .join("");

    const ActionTag = href ? motion.a : motion.button;

    return (
      <motion.div
        ref={ref}
        initial={still ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={shown ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ duration: 0.6, ease: EASE }}
        className={cn(
          "relative w-[440px] max-w-full rounded-3xl bg-white p-6 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {period && (
            <span className="shrink-0 rounded-full bg-[#242423]/[0.06] px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-white/[0.08] dark:text-zinc-400">
              {period}
            </span>
          )}
        </div>

        <p aria-label={spoken} className="mt-3 text-base leading-[2] text-zinc-500 dark:text-zinc-400">
          <span aria-hidden>{sentence}</span>
        </p>

        <motion.ul
          variants={row}
          initial={still ? "shown" : "hidden"}
          animate={shown ? "shown" : "hidden"}
          className="mt-5 flex items-start gap-1"
        >
          {badges.map((b, i) => (
            <Badge key={b.label} badge={b} index={i} still={still} shown={shown} />
          ))}
        </motion.ul>

        {actionLabel && (
          <ActionTag
            {...(href ? { href } : { type: "button" as const })}
            onClick={onAction}
            onPointerEnter={() => setHoverAction(true)}
            onPointerLeave={() => setHoverAction(false)}
            onFocus={() => setHoverAction(true)}
            onBlur={() => setHoverAction(false)}
            whileTap={still ? undefined : { scale: 0.98 }}
            initial={still ? false : { opacity: 0, y: 8 }}
            animate={shown ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: still ? 0 : 0.8, ease: EASE }}
            className="mt-5 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#242423]/[0.06] text-sm font-medium text-[#242423] outline-none transition-colors hover:bg-[#242423]/[0.1] focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/[0.08] dark:text-zinc-100 dark:hover:bg-white/[0.12]"
          >
            {actionLabel}
            <ArrowRightIcon className="size-4" active={hoverAction} />
          </ActionTag>
        )}
      </motion.div>
    );
  },
);