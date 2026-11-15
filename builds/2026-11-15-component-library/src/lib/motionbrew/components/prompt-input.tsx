"use client";

/**
 * PromptInput, from https://motion-brew.com/components/prompt-input
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
import { AnimatePresence, motion, type Transition, useAnimation, useReducedMotion, type Variants } from "motion/react";
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

// Animated icon: attach-file
const AttachFileIcon = (() => {
interface AttachFileIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AttachFileIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
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

const AttachFileIcon = forwardRef<AttachFileIconHandle, AttachFileIconProps>(
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
            d="M6 7.90909V16C6 19.3137 8.68629 22 12 22V22C15.3137 22 18 19.3137 18 16V6C18 3.79086 16.2091 2 14 2V2C11.7909 2 10 3.79086 10 6V15.1818C10 16.2864 10.8954 17.1818 12 17.1818V17.1818C13.1046 17.1818 14 16.2864 14 15.1818V8"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

AttachFileIcon.displayName = "AttachFileIcon";
  return AttachFileIcon;
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

// Animated icon: earth
const EarthIcon = (() => {
interface EarthIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface EarthIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const CIRCLE_TRANSITION: Transition = {
  duration: 0.3,
  delay: 0.1,
  opacity: { delay: 0.15 },
};

const CIRCLE_VARIANTS: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
  },
};

const EarthIcon = forwardRef<EarthIconHandle, EarthIconProps>(
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
            d="M21.54 15H17a2 2 0 0 0-2 2v4.54"
            transition={{ duration: 0.7, delay: 0.5, opacity: { delay: 0.5 } }}
            variants={{
              normal: {
                pathLength: 1,
                opacity: 1,
                pathOffset: 0,
              },
              animate: {
                pathLength: [0, 1],
                opacity: [0, 1],
                pathOffset: [1, 0],
              },
            }}
          />
          <motion.path
            animate={controls}
            d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"
            transition={{ duration: 0.7, delay: 0.5, opacity: { delay: 0.5 } }}
            variants={{
              normal: {
                pathLength: 1,
                opacity: 1,
                pathOffset: 0,
              },
              animate: {
                pathLength: [0, 1],
                opacity: [0, 1],
                pathOffset: [1, 0],
              },
            }}
          />
          <motion.path
            animate={controls}
            d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"
            transition={{ duration: 0.7, delay: 0.5, opacity: { delay: 0.5 } }}
            variants={{
              normal: {
                pathLength: 1,
                opacity: 1,
                pathOffset: 0,
              },
              animate: {
                pathLength: [0, 1],
                opacity: [0, 1],
                pathOffset: [1, 0],
              },
            }}
          />
          <motion.circle
            animate={controls}
            cx="12"
            cy="12"
            r="10"
            transition={CIRCLE_TRANSITION}
            variants={CIRCLE_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

EarthIcon.displayName = "EarthIcon";
  return EarthIcon;
})();

// Animated icon: mic
const MicIcon = (() => {
interface MicIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MicIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const CAPSULE_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: {
    y: [0, -3, 0, -2, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

const MicIcon = forwardRef<MicIconHandle, MicIconProps>(
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
          overflow="visible"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 19v3" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <motion.rect
            animate={controls}
            height="13"
            rx="3"
            variants={CAPSULE_VARIANTS}
            width="6"
            x="9"
            y="2"
          />
        </svg>
      </span>
    );
  }
);

MicIcon.displayName = "MicIcon";
  return MicIcon;
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

// Animated icon: x
const XIcon = (() => {
interface XIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface XIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
  },
};

const XIcon = forwardRef<XIconHandle, XIconProps>(
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
            d="M18 6 6 18"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="m6 6 12 12"
            transition={{ delay: 0.2 }}
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

XIcon.displayName = "XIcon";
  return XIcon;
})();

// PromptInput

/**
 * PromptInput
 *
 * Trigger: type (plus press). A white composer for an AI assistant. The field
 * grows smoothly as you write, and while it is empty its placeholder rolls
 * through example prompts. Underneath sits a row of tools: an attach icon that
 * plays on hover and adds file chips that pop in (and shrink away when
 * removed), a model picker that opens upward with a sliding highlight, a web
 * search toggle with an earth that turns on hover, and a mic that turns into
 * live sound bars while a ring of fine particles in the field ripples and
 * brightens with the voice beside a running timer, then types out what it
 * heard. The send
 * button stays quiet until there is something to send, then wakes into ink;
 * pressing it (or Enter) launches the arrow upward and turns the button into a
 * stop square while a soft neutral glow breathes around the card and a light
 * shimmer travels round its edge until the reply is done.
 * Shift and Enter make a new line. Reduced motion keeps every state but drops
 * the movement.
 *
 * Engine: motion/react (height glide, rolling placeholder, spring chips, a
 * layoutId menu highlight, and a breathing neutral glow with a travelling
 * edge shimmer while it works), with a GSAP ticker drawing the listening
 * particle ring.
 */

gsap.registerPlugin(useGSAP);

export interface PromptModel {
  id: string;
  label: string;
  /** A short line under the name in the menu. */
  hint: string;
}

export interface PromptSubmit {
  text: string;
  model: string;
  web: boolean;
  files: string[];
}

export interface PromptInputProps {
  /** Placeholders the empty field rolls through. */
  placeholders?: string[];
  /** Models in the picker. Default three. */
  models?: PromptModel[];
  /** Called on send. Return a promise to keep the working state until it settles. */
  onSubmit?: (prompt: PromptSubmit) => void | Promise<unknown>;
  /** Called by the attach button. Default adds a sample file chip. */
  onAttach?: () => void;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const POP: Transition = { type: "spring", stiffness: 520, damping: 30 };
const MAX_HEIGHT = 200;

const DEFAULT_PLACEHOLDERS = [
  "Ask anything",
  "Summarise this report in three lines",
  "Draft a friendly reply to this email",
  "Turn these notes into a project plan",
];

const DEFAULT_MODELS: PromptModel[] = [
  { id: "swift", label: "Swift", hint: "Quick answers" },
  { id: "balanced", label: "Balanced", hint: "Everyday work" },
  { id: "deep", label: "Deep", hint: "Hard problems, slower" },
];

const SAMPLE_FILES = ["Q3 report.pdf", "brand-notes.md", "roadmap.xlsx"];
const HEARD = "Draft a launch post for the new pricing page";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * The listening ring: two circles of fine particles turning in opposite directions.
 * With the voice level they ripple outward, swell and brighten, each dot on its own
 * wave so the ring shimmers rather than pulses. One GSAP ticker draws it on a canvas.
 */
function VoiceRing({ still }: { still: boolean }) {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  useGSAP(
    () => {
      const el = canvas.current!;
      const ctx = el.getContext("2d")!;
      const size = 44;
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      el.width = size * dpr;
      el.height = size * dpr;
      const dark = () => document.documentElement.classList.contains("dark");
      const rings = [
        { n: 48, r: 16, spin: 0.5, amp: 5, dot: 1.15 },
        { n: 28, r: 10, spin: -0.8, amp: 3, dot: 0.95 },
      ];
      const seeds = rings.map((ring) =>
        Array.from({ length: ring.n }, () => Math.random() * Math.PI * 2),
      );
      let level = 0.3;
      let target = 0.6;
      let next = 0;
      let t = 0;
      const draw = () => {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size, size);
        const ink = dark() ? "250,250,250" : "36,36,35";
        rings.forEach((ring, k) => {
          for (let i = 0; i < ring.n; i++) {
            const seed = seeds[k]![i]!;
            const a = (i / ring.n) * Math.PI * 2 + t * ring.spin;
            // Each dot rides its own wave, so the ring ripples unevenly like sound.
            const wave =
              0.5 * Math.sin(i * 0.9 + t * 5.5 + seed) +
              0.5 * Math.sin(i * 0.37 - t * 3.1);
            const push = Math.max(0, wave) * level * ring.amp;
            const r = ring.r + push;
            const x = size / 2 + Math.cos(a) * r;
            const y = size / 2 + Math.sin(a) * r;
            const alpha =
              0.25 + 0.75 * Math.min(1, Math.abs(wave) * (0.4 + level));
            ctx.fillStyle = `rgba(${ink},${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(
              x,
              y,
              ring.dot * (0.7 + push * 0.12 + level * 0.35),
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
        });
      };
      if (still) {
        draw();
        return;
      }
      const tick = (_time: number, dt: number) => {
        const s = dt / 1000;
        t += s;
        // A made-up voice level: new peaks every so often, eased toward smoothly.
        next -= s;
        if (next <= 0) {
          target = 0.2 + Math.random() * 0.8;
          next = 0.08 + Math.random() * 0.18;
        }
        level += (target - level) * Math.min(1, s * 10);
        draw();
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { dependencies: [still] },
  );
  return <canvas ref={canvas} aria-hidden className="size-11 shrink-0" />;
}

export const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  function PromptInput(
    {
      placeholders = DEFAULT_PLACEHOLDERS,
      models = DEFAULT_MODELS,
      onSubmit,
      onAttach,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const uid = React.useId();
    const field = React.useRef<HTMLTextAreaElement>(null);
    const [text, setText] = React.useState("");
    const [height, setHeight] = React.useState(24);
    const [focused, setFocused] = React.useState(false);
    const [hint, setHint] = React.useState(0);
    const [files, setFiles] = React.useState<string[]>([]);
    const [model, setModel] = React.useState(models[1]?.id ?? models[0]!.id);
    const [menu, setMenu] = React.useState(false);
    const [hover, setHover] = React.useState<string | null>(null);
    const [web, setWeb] = React.useState(false);
    const [listening, setListening] = React.useState(false);
    const [seconds, setSeconds] = React.useState(0);
    const [working, setWorking] = React.useState(false);
    const [sent, setSent] = React.useState(0);
    const typing = React.useRef(0);

    const ready = text.trim().length > 0 && !listening;
    const current = models.find((m) => m.id === model) ?? models[0]!;

    // Grow the field with its text, up to a limit.
    React.useLayoutEffect(() => {
      const el = field.current;
      if (!el) return;
      el.style.height = "0px";
      const next = Math.min(MAX_HEIGHT, Math.max(24, el.scrollHeight));
      // Put the measured height straight back, so the field never sits at its collapsed size.
      el.style.height = `${next}px`;
      setHeight(next);
    }, [text]);

    // Roll the placeholder while the field is empty.
    React.useEffect(() => {
      if (text || listening || placeholders.length < 2) return;
      const t = window.setInterval(
        () => setHint((h) => (h + 1) % placeholders.length),
        2800,
      );
      return () => window.clearInterval(t);
    }, [text, listening, placeholders.length]);

    // The mic counts up while it listens.
    React.useEffect(() => {
      if (!listening) return;
      setSeconds(0);
      const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => window.clearInterval(t);
    }, [listening]);

    // Close the model menu on a click elsewhere or Escape.
    React.useEffect(() => {
      if (!menu) return;
      const away = (e: PointerEvent) => {
        if (!(e.target as Element).closest?.(`[data-menu="${uid}"]`))
          setMenu(false);
      };
      const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
      document.addEventListener("pointerdown", away);
      document.addEventListener("keydown", esc);
      return () => {
        document.removeEventListener("pointerdown", away);
        document.removeEventListener("keydown", esc);
      };
    }, [menu, uid]);

    React.useEffect(() => () => window.clearInterval(typing.current), []);

    const attach = () => {
      if (onAttach) return onAttach();
      const next = SAMPLE_FILES.find((f) => !files.includes(f));
      if (next) setFiles((f) => [...f, next]);
    };

    // Stopping the mic types out what it heard, a few letters at a time.
    const toggleMic = () => {
      if (!listening) {
        setListening(true);
        return;
      }
      setListening(false);
      window.clearInterval(typing.current);
      const base = text ? `${text.trimEnd()} ` : "";
      let i = 0;
      typing.current = window.setInterval(() => {
        i += still ? HEARD.length : 2;
        setText(base + HEARD.slice(0, i));
        if (i >= HEARD.length) window.clearInterval(typing.current);
      }, 28);
      field.current?.focus();
    };

    const send = async () => {
      if (working) {
        setWorking(false);
        return;
      }
      if (!ready) return;
      const prompt = { text: text.trim(), model, web, files };
      setSent((n) => n + 1);
      setWorking(true);
      setText("");
      setFiles([]);
      try {
        await Promise.all([
          onSubmit?.(prompt),
          new Promise((r) => setTimeout(r, still ? 400 : 2400)),
        ]);
      } finally {
        setWorking(false);
      }
    };

    const tool =
      "flex h-9 cursor-pointer items-center gap-1.5 rounded-full text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400";

    return (
      <div ref={ref} className={cn("@container relative w-[560px] max-w-full", className)}>
        {/* While it works: a soft neutral glow breathes around the card, and a light shimmer
            travels round its edge. */}
        <AnimatePresence>
          {working && !still && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-[1.5px] rounded-[29.5px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="absolute inset-0 rounded-[inherit]"
                animate={{
                  boxShadow: [
                    "0 0 0 1px rgba(36,36,35,0.06), 0 0 18px 2px rgba(36,36,35,0.06)",
                    "0 0 0 1px rgba(36,36,35,0.1), 0 0 30px 6px rgba(36,36,35,0.12)",
                    "0 0 0 1px rgba(36,36,35,0.06), 0 0 18px 2px rgba(36,36,35,0.06)",
                  ],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
              <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                <motion.div
                  className="absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, transparent 250deg, rgba(36,36,35,0.08) 290deg, rgba(36,36,35,0.55) 335deg, rgba(255,255,255,0.9) 350deg, transparent 360deg)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2.2,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={{
            boxShadow: focused
              ? "0 0 0 4px rgba(36,36,35,0.06), 0 1px 2px rgba(0,0,0,0.05), 0 16px 36px -18px rgba(0,0,0,0.22)"
              : "0 0 0 0px rgba(36,36,35,0), 0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -16px rgba(0,0,0,0.18)",
          }}
          transition={{ duration: 0.25 }}
          className="relative rounded-[28px] bg-white p-3 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {/* Attached files */}
          <AnimatePresence initial={false}>
            {files.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: still ? 0 : 0.3, ease: GLIDE }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 px-1 pb-2">
                  <AnimatePresence initial={false} mode="popLayout">
                    {files.map((f) => (
                      <motion.span
                        key={f}
                        layout
                        initial={
                          still
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.6, y: 6 }
                        }
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={
                          still ? { opacity: 0 } : { opacity: 0, scale: 0.6 }
                        }
                        transition={POP}
                        className="flex h-9 items-center gap-2 rounded-xl bg-zinc-100 pl-2.5 pr-1.5 text-sm dark:bg-white/8"
                      >
                        <FileTextIcon
                          className="size-4 text-zinc-500"
                          strokeWidth={2}
                          aria-hidden
                        />
                        <span className="max-w-[160px] truncate">{f}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${f}`}
                          onClick={() =>
                            setFiles((all) => all.filter((x) => x !== f))
                          }
                          className="grid size-6 cursor-pointer place-items-center rounded-full text-zinc-500 outline-none transition-colors hover:bg-zinc-200 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-white/10"
                        >
                          <XIcon className="size-3.5" strokeWidth={2.25} />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The field, with a rolling placeholder or the live listening line over it. */}
          <motion.div
            className="relative px-2 pt-1"
            animate={{ height: listening ? 52 : height + 8 }}
            transition={
              still
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 36 }
            }
          >
            <textarea
              ref={field}
              value={text}
              rows={1}
              aria-label="Message"
              disabled={listening}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              style={{ height }}
              className="block w-full resize-none bg-transparent text-base leading-6 outline-none disabled:opacity-0"
            />
            {!text && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-2 top-1 overflow-hidden text-base leading-6 text-zinc-400 dark:text-zinc-500"
              >
                {listening ? (
                  <motion.span
                    className="flex items-center gap-3 text-zinc-700 dark:text-zinc-200"
                    initial={
                      still ? false : { opacity: 0, y: 6, filter: "blur(4px)" }
                    }
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.35, ease: GLIDE }}
                  >
                    <VoiceRing still={still} />
                    <span className="flex flex-col leading-5">
                      <span className="font-medium">Listening</span>
                      <span className="text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                        {fmt(seconds)}
                      </span>
                    </span>
                  </motion.span>
                ) : (
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={hint}
                      className="block truncate"
                      initial={
                        still
                          ? { opacity: 0 }
                          : { opacity: 0, y: "80%", filter: "blur(4px)" }
                      }
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={
                        still
                          ? { opacity: 0 }
                          : { opacity: 0, y: "-80%", filter: "blur(4px)" }
                      }
                      transition={{ duration: 0.4, ease: GLIDE }}
                    >
                      {placeholders[hint % placeholders.length]}
                    </motion.span>
                  </AnimatePresence>
                )}
              </span>
            )}
          </motion.div>

          {/* Tools */}
          <div className="mt-2 flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Attach a file"
              onClick={attach}
              className={cn(
                tool,
                "group w-9 justify-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/8",
              )}
            >
              <AttachFileIcon
                className="size-[18px] transition-transform duration-200 group-active:scale-90"
                strokeWidth={2}
              />
            </button>

            {/* Model picker */}
            <div className="relative" data-menu={uid}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={menu}
                onClick={() => setMenu((m) => !m)}
                className={cn(
                  tool,
                  "px-3 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/8",
                  menu && "bg-zinc-100 dark:bg-white/8",
                )}
              >
                <span className="relative inline-grid overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={current.id}
                      initial={
                        still ? { opacity: 0 } : { opacity: 0, y: "70%" }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={still ? { opacity: 0 } : { opacity: 0, y: "-70%" }}
                      transition={{ duration: 0.25, ease: GLIDE }}
                    >
                      {current.label}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <motion.span
                  animate={{ rotate: menu ? 180 : 0 }}
                  transition={POP}
                  className="grid"
                >
                  <ChevronDownIcon
                    className="size-4 text-zinc-500"
                    strokeWidth={2.25}
                  />
                </motion.span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    role="listbox"
                    aria-label="Model"
                    initial={
                      still
                        ? { opacity: 0 }
                        : { opacity: 0, y: 6, scale: 0.96, filter: "blur(4px)" }
                    }
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={
                      still
                        ? { opacity: 0 }
                        : { opacity: 0, y: 4, scale: 0.98, filter: "blur(4px)" }
                    }
                    transition={{ duration: 0.2, ease: GLIDE }}
                    style={{ transformOrigin: "0% 100%" }}
                    onPointerLeave={() => setHover(null)}
                    className="absolute bottom-full left-0 z-20 mb-2 w-60 rounded-2xl bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_16px_40px_-12px_rgba(0,0,0,0.28)] ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10"
                  >
                    {models.map((m) => {
                      const on = m.id === model;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="option"
                          aria-selected={on}
                          onPointerEnter={() => setHover(m.id)}
                          onFocus={() => setHover(m.id)}
                          onClick={() => {
                            setModel(m.id);
                            setMenu(false);
                          }}
                          className="relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-left outline-none"
                        >
                          {(hover ?? model) === m.id && (
                            <motion.span
                              layoutId={`${uid}-hover`}
                              transition={still ? { duration: 0 } : POP}
                              className="absolute inset-0 rounded-xl bg-zinc-100 dark:bg-white/8"
                            />
                          )}
                          <span className="relative">
                            <span className="block text-sm font-medium">
                              {m.label}
                            </span>
                            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                              {m.hint}
                            </span>
                          </span>
                          {on && (
                            <CheckIcon
                              className="relative size-4"
                              strokeWidth={2.25}
                              aria-hidden
                            />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Web search */}
            <button
              type="button"
              aria-pressed={web}
              aria-label="Web search"
              onClick={() => setWeb((w) => !w)}
              className={cn(
                tool,
                // Icon only on a narrow card, so the send button stays inside.
                "w-9 justify-center @[28rem]:w-auto @[28rem]:px-3",
                web
                  ? "bg-[#242423] text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/8",
              )}
            >
              <EarthIcon className="size-4" strokeWidth={2} />
              <span className="hidden @[28rem]:inline">Search</span>
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              {/* Mic, which becomes live bars while it listens */}
              <button
                type="button"
                aria-label={listening ? "Stop listening" : "Speak"}
                aria-pressed={listening}
                onClick={toggleMic}
                disabled={working}
                className={cn(
                  tool,
                  "w-9 justify-center",
                  listening
                    ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-white/8",
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {listening ? (
                    <motion.span
                      key="bars"
                      className="flex h-4 items-center gap-[2px]"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <motion.span
                          key={i}
                          className="w-[3px] rounded-full bg-current"
                          animate={
                            still
                              ? { height: 8 }
                              : { height: [5, 14, 7, 12, 5] }
                          }
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: i * 0.12,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="mic"
                      className="grid"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                    >
                      <MicIcon className="size-[18px]" strokeWidth={2} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Send, which becomes stop while it works */}
              <motion.button
                type="button"
                aria-label={working ? "Stop" : "Send"}
                aria-disabled={!ready && !working}
                onClick={() => void send()}
                whileTap={
                  (ready || working) && !still ? { scale: 0.9 } : undefined
                }
                animate={{
                  backgroundColor:
                    ready || working ? "#242423" : "rgba(36,36,35,0.08)",
                  color: ready || working ? "#ffffff" : "rgba(36,36,35,0.35)",
                }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "relative grid size-9 place-items-center overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
                  ready || working ? "cursor-pointer" : "cursor-default",
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {working ? (
                    <motion.span
                      key="stop"
                      className="size-3 rounded-[3px] bg-current"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={POP}
                    />
                  ) : (
                    <motion.span
                      key={`arrow-${sent}`}
                      className="grid"
                      initial={still ? { opacity: 0 } : { y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      // Sending launches the arrow up and out of the button.
                      exit={
                        still
                          ? { opacity: 0 }
                          : {
                              y: -22,
                              opacity: 0,
                              transition: { duration: 0.22, ease: "easeIn" },
                            }
                      }
                      transition={POP}
                    >
                      <ArrowUpIcon className="size-[18px]" strokeWidth={2.4} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <span role="status" aria-live="polite" className="sr-only">
          {working ? "Working on it." : listening ? "Listening." : ""}
        </span>
      </div>
    );
  },
);