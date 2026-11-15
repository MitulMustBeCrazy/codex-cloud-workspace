"use client";

/**
 * MessageComposer, from https://motion-brew.com/components/message-composer
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
import { BellOff, Ellipsis, List, ListOrdered, Play, TextQuote, Video } from "lucide-react";
import { AnimatePresence, motion, type Transition, useAnimation, useAnimationControls, useInView, useReducedMotion, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: bold
const BoldIcon = (() => {
interface BoldIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BoldIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: {
    strokeWidth: 2,
  },
  animate: {
    strokeWidth: 3.5,
  },
};

const BoldIcon = forwardRef<BoldIconHandle, BoldIconProps>(
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
            d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"
            transition={{ duration: 0.6 }}
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

BoldIcon.displayName = "BoldIcon";
  return BoldIcon;
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

// Animated icon: delete
const DeleteIcon = (() => {
interface DeleteIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface DeleteIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const LID_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: { y: -1.1 },
};

const SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

const DeleteIcon = forwardRef<DeleteIconHandle, DeleteIconProps>(
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
          <motion.g
            animate={controls}
            transition={SPRING_TRANSITION}
            variants={LID_VARIANTS}
          >
            <path d="M3 6h18" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </motion.g>
          <motion.path
            animate={controls}
            d="M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8"
            transition={SPRING_TRANSITION}
            variants={{
              normal: { d: "M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8" },
              animate: { d: "M19 9v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V9" },
            }}
          />
          <motion.line
            animate={controls}
            transition={SPRING_TRANSITION}
            variants={{
              normal: { y1: 11, y2: 17 },
              animate: { y1: 11.5, y2: 17.5 },
            }}
            x1="10"
            x2="10"
            y1="11"
            y2="17"
          />
          <motion.line
            animate={controls}
            transition={SPRING_TRANSITION}
            variants={{
              normal: { y1: 11, y2: 17 },
              animate: { y1: 11.5, y2: 17.5 },
            }}
            x1="14"
            x2="14"
            y1="11"
            y2="17"
          />
        </svg>
      </span>
    );
  }
);

DeleteIcon.displayName = "DeleteIcon";
  return DeleteIcon;
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

// Animated icon: italic
const ItalicIcon = (() => {
interface ItalicIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ItalicIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const LINE_VARIANTS: Variants = {
  normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    pathOffset: [1, 0],
  },
};

const ItalicIcon = forwardRef<ItalicIconHandle, ItalicIconProps>(
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
          <motion.line
            animate={controls}
            transition={{ duration: 0.2 }}
            variants={LINE_VARIANTS}
            x1="19"
            x2="10"
            y1="4"
            y2="4"
          />
          <motion.line
            animate={controls}
            transition={{ duration: 0.2 }}
            variants={LINE_VARIANTS}
            x1="14"
            x2="5"
            y1="20"
            y2="20"
          />
          <motion.line
            animate={controls}
            transition={{
              delay: 0.1,
              duration: 0.4,
            }}
            variants={{
              normal: { pathLength: 1, pathOffset: 0 },
              animate: {
                pathLength: [0, 1],
                pathOffset: [1, 0],
              },
            }}
            x1="15"
            x2="9"
            y1="4"
            y2="20"
          />
        </svg>
      </span>
    );
  }
);

ItalicIcon.displayName = "ItalicIcon";
  return ItalicIcon;
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

// Animated icon: send
const SendIcon = (() => {
interface SendIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SendIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SendIcon = forwardRef<SendIconHandle, SendIconProps>(
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
          className="overflow-visible"
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
          <motion.g
            animate={controls}
            transition={{ duration: 0.5 }}
            variants={{
              normal: { x: 0, y: 0, scale: 1 },
              animate: {
                x: 3,
                y: -3,
                scale: 0.8,
              },
            }}
          >
            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
            <path d="m21.854 2.147-10.94 10.939" />
          </motion.g>
          <motion.path
            animate={controls}
            d="M -3 28 C -0.5 26.8 1.6 24.6 3.3 22 C 4.8 19.7 5.2 17.6 4.2 16.1 C 3.2 14.7 1.4 14.5 0.3 15.8 C -0.9 17.2 -0.6 19.4 1.2 20.4 C 3.4 21.5 6.4 19.4 9 15.8"
            fill="none"
            initial={{ opacity: 0, pathLength: 0 }}
            stroke="currentColor"
            strokeDasharray="2 2"
            strokeWidth="1"
            transition={{ duration: 0.55, delay: 0.1 }}
            variants={{
              normal: {
                pathLength: 0,
                opacity: 0,
                translateX: -3,
                translateY: 3,
                transition: { duration: 0.3 },
              },
              animate: {
                pathLength: 1,
                opacity: 1,
                translateX: 0,
                translateY: 0,
              },
            }}
          />
        </svg>
      </span>
    );
  }
);

SendIcon.displayName = "SendIcon";
  return SendIcon;
})();

// Animated icon: smile
const SmileIcon = (() => {
interface SmileIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SmileIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SmileIcon = forwardRef<SmileIconHandle, SmileIconProps>(
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

    const faceVariants: Variants = {
      normal: {
        scale: 1,
        rotate: 0,
        strokeWidth: 2,
        transition: { duration: 0.3, ease: "easeOut" },
      },
      animate: {
        scale: [1, 1.15, 1.05, 1.1],
        rotate: [0, -3, 3, 0],
        strokeWidth: [2, 2.5, 2.5, 2.5],
        transition: {
          duration: 0.8,
          times: [0, 0.3, 0.6, 1],
          ease: "easeInOut",
        },
      },
    };

    const mouthVariants: Variants = {
      normal: {
        d: "M8 14s1.5 2 4 2 4-2 4-2",
        pathLength: 1,
        pathOffset: 0,
        strokeWidth: 2,
        transition: { duration: 0.3, ease: "easeOut" },
      },
      animate: {
        d: "M7 13.5s2.5 3.5 5 3.5 5-3.5 5-3.5",
        pathLength: [0.3, 1, 1],
        pathOffset: [0, 0, 0],
        strokeWidth: 2.5,
        transition: {
          d: { duration: 0.4, ease: "easeOut" },
          pathLength: {
            duration: 0.5,
            times: [0, 0.5, 1],
            ease: "easeInOut",
          },
          delay: 0.1,
        },
      },
    };

    const eyeVariants: Variants = {
      normal: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3, ease: "easeOut" },
      },
      animate: {
        scale: [1, 1.5, 0.8, 1.2],
        opacity: [1, 1, 1, 1],
        transition: {
          duration: 0.5,
          times: [0, 0.3, 0.6, 1],
          ease: "easeInOut",
        },
      },
    };
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
          variants={faceVariants}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.circle cx="12" cy="12" r="10" />
          <motion.path
            animate={controls}
            d="M8 14s1.5 2 4 2 4-2 4-2"
            initial="normal"
            variants={mouthVariants}
          />
          <motion.line
            animate={controls}
            initial="normal"
            variants={eyeVariants}
            x1="9"
            x2="9.01"
            y1="9"
            y2="9"
          />
          <motion.line
            animate={controls}
            initial="normal"
            variants={eyeVariants}
            x1="15"
            x2="15.01"
            y1="9"
            y2="9"
          />
        </motion.svg>
      </span>
    );
  }
);

SmileIcon.displayName = "SmileIcon";
  return SmileIcon;
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

// Animated icon: terminal
const TerminalIcon = (() => {
interface TerminalIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface TerminalIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const LINE_VARIANTS: Variants = {
  normal: { opacity: 1 },
  animate: {
    opacity: [1, 0, 1],
    transition: {
      duration: 0.8,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  },
};

const TerminalIcon = forwardRef<TerminalIconHandle, TerminalIconProps>(
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
          <polyline points="4 17 10 11 4 5" />
          <motion.line
            animate={controls}
            initial="normal"
            variants={LINE_VARIANTS}
            x1="12"
            x2="20"
            y1="19"
            y2="19"
          />
        </svg>
      </span>
    );
  }
);

TerminalIcon.displayName = "TerminalIcon";
  return TerminalIcon;
})();

// Animated icon: underline
const UnderlineIcon = (() => {
interface UnderlineIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface UnderlineIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const VARIANTS: Variants = {
  normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    pathOffset: [1, 0],
  },
};

const UnderlineIcon = forwardRef<UnderlineIconHandle, UnderlineIconProps>(
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
            d="M6 4v6a6 6 0 0 0 12 0V4"
            transition={{ duration: 0.3 }}
            variants={VARIANTS}
          />
          <motion.line
            animate={controls}
            transition={{
              delay: 0.2,
              duration: 0.4,
            }}
            variants={VARIANTS}
            x1="4"
            x2="20"
            y1="20"
            y2="20"
          />
        </svg>
      </span>
    );
  }
);

UnderlineIcon.displayName = "UnderlineIcon";
  return UnderlineIcon;
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

// Animated icon: chevron-left
const ChevronLeftIcon = (() => {
interface ChevronLeftIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ChevronLeftIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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

const ChevronLeftIcon = forwardRef<ChevronLeftIconHandle, ChevronLeftIconProps>(
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
            d="m15 18-6-6 6-6"
            transition={DEFAULT_TRANSITION}
            variants={{
              normal: { x: 0 },
              animate: { x: [0, -2, 0] },
            }}
          />
        </svg>
      </span>
    );
  }
);

ChevronLeftIcon.displayName = "ChevronLeftIcon";
  return ChevronLeftIcon;
})();

// Animated icon: chevron-right
const ChevronRightIcon = (() => {
interface ChevronRightIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ChevronRightIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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

const ChevronRightIcon = forwardRef<
  ChevronRightIconHandle,
  ChevronRightIconProps
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
        <motion.path
          animate={controls}
          d="m9 18 6-6-6-6"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { x: 0 },
            animate: { x: [0, 2, 0] },
          }}
        />
      </svg>
    </span>
  );
});

ChevronRightIcon.displayName = "ChevronRightIcon";
  return ChevronRightIcon;
})();

// MessageComposer

/**
 * MessageComposer
 *
 * Trigger: type (plus press). A white rich text composer for a chat or a
 * comment thread. A toolbar sits on top: a text style menu that pours open
 * with its rows sliding in one after another and a pill gliding under the
 * pointer, bold, italic and underline, bullet and numbered lists, a quote and
 * a code block, each lighting up while the caret is inside that style, and a
 * red bin that clears the message through a blur. The writing area grows with
 * a spring as you write. Typing @ opens a list of people that inserts a
 * mention chip, and an emoji button opens a small picker. Attachments sit in
 * a row of thumbnails, each with an upload ring that turns into a check. The
 * bottom bar holds attach, voice (a live timer with sound bars), video, an AI
 * polish that sweeps a shimmer over the text and rewrites it, a button that
 * hides the toolbar, and a split send button: the plane flies off as the
 * message clears, and the chevron opens send now, schedule and send quietly.
 * Reduced motion keeps every state but drops the movement.
 *
 * Engine: motion/react (a spring height glide for the writing area, clip
 * path menus with staggered rows, layoutId highlights, spring chips, and a
 * blur clear), on top of a contentEditable editor driven by execCommand.
 */

export interface ComposerPerson {
  /** Used in the text as @id. */
  id: string;
  name: string;
  /** A short line next to the name, like a role. */
  title?: string;
  avatar?: string;
}

export type ComposerAttachmentKind = "image" | "video" | "voice" | "file";

export interface ComposerAttachment {
  id: string;
  name: string;
  kind: ComposerAttachmentKind;
  /** A preview image for images and videos. */
  src?: string;
  /** Shown on videos and voice notes, like 0:12. */
  duration?: string;
  /** The picked file, when it came from the attach button. */
  file?: File;
}

export type SendMode = "now" | "schedule" | "silent";

export interface ComposerMessage {
  /** The message as HTML, with mentions as `<span data-mention="id">`. */
  html: string;
  /** The message as plain text, with mentions as `@id`. */
  text: string;
  mentions: string[];
  attachments: ComposerAttachment[];
  mode: SendMode;
  /** When a scheduled message should go out. */
  sendAt?: Date;
}

export interface MessageComposerProps {
  /** Starting text. Lines become paragraphs and `@id` of a known person becomes a chip. */
  defaultValue?: string;
  placeholder?: string;
  /** People offered after typing @. */
  people?: ComposerPerson[];
  /** Attachments already in the message; they upload when the composer comes into view. */
  defaultAttachments?: ComposerAttachment[];
  /** Show the formatting toolbar at first. Default `true`. */
  toolbar?: boolean;
  /** The writing area grows up to this height in px, then scrolls. Default `240`. */
  maxHeight?: number;
  /** Called on send. Return a promise to hold the sending state until it settles. */
  onSend?: (message: ComposerMessage) => void | Promise<unknown>;
  /** Uploads a picked file, reporting progress from 0 to 1. Default pretends to upload. */
  onUpload?: (file: File, progress: (value: number) => void) => Promise<void>;
  /** The AI button: gets the text, returns a better one. Default tidies it, or drafts one when empty. */
  onEnhance?: (text: string) => string | Promise<string>;
  /** The video button. Default adds a sample clip. */
  onVideo?: () => void;
  onChange?: (text: string) => void;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const POP: Transition = { type: "spring", stiffness: 520, damping: 30 };
const SOFT: Transition = { type: "spring", stiffness: 380, damping: 34 };

const STYLES = [
  {
    id: "title",
    tag: "h2",
    label: "Title",
    preview: "text-[20px] font-semibold",
  },
  {
    id: "heading",
    tag: "h3",
    label: "Heading",
    preview: "text-[18px] font-semibold",
  },
  { id: "body", tag: "p", label: "Body", preview: "text-[16px]" },
  {
    id: "small",
    tag: "h6",
    label: "Small",
    preview: "text-[14px] text-[#242423]/60",
  },
] as const;
type StyleId = (typeof STYLES)[number]["id"];

const EMOJI = [
  "😀",
  "😂",
  "🥹",
  "😍",
  "😎",
  "🤔",
  "🙌",
  "👏",
  "🎉",
  "🔥",
  "✨",
  "💡",
  "✅",
  "👀",
  "❤️",
  "🚀",
  "🌄",
  "☕",
];

const face = (photo: string) =>
  `https://images.unsplash.com/${photo}?w=96&h=96&fit=crop&crop=faces`;

const DEFAULT_PEOPLE: ComposerPerson[] = [
  {
    id: "maya",
    name: "Maya Chen",
    title: "Design lead",
    avatar: face("photo-1438761681033-6461ffad8d80"),
  },
  {
    id: "leo",
    name: "Leo Park",
    title: "Engineer",
    avatar: face("photo-1500648767791-00dcc994a43e"),
  },
  {
    id: "ava",
    name: "Ava Moreno",
    title: "Marketing",
    avatar: face("photo-1494790108377-be9c29b29330"),
  },
  { id: "noah", name: "Noah Reid", title: "Product" },
  { id: "iris", name: "Iris Okafor", title: "Research" },
];

const DRAFT =
  "Hi team, the launch shots are ready for review.\nPlease pick your two favourites by Friday so we can lock the post.";

const SAMPLE_CLIP =
  "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=240&h=240&fit=crop&q=80";

const CHIP =
  "mx-px inline-block cursor-default rounded-md bg-[#242423]/[0.07] px-1 font-medium text-[#242423] transition-colors duration-200 hover:bg-[#242423]/[0.12]";

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
let uid = 0;
const nextId = () => `att-${Date.now().toString(36)}-${uid++}`;

const BLOCKS = new Set([
  "P",
  "DIV",
  "H2",
  "H3",
  "H6",
  "LI",
  "BLOCKQUOTE",
  "PRE",
  "UL",
  "OL",
]);

function mentionChip(p: ComposerPerson) {
  const el = document.createElement("span");
  el.dataset.mention = p.id;
  el.contentEditable = "false";
  el.className = CHIP;
  el.textContent = `@${p.name}`;
  return el;
}

/** Plain text into the editor: a paragraph per line, @id of a known person as a chip. */
function fill(editor: HTMLElement, text: string, people: ComposerPerson[]) {
  editor.innerHTML = "";
  if (!text) return;
  for (const line of text.split("\n")) {
    const p = document.createElement("p");
    let last = 0;
    for (const m of line.matchAll(/@([\w-]+)/g)) {
      const person = people.find((x) => x.id === m[1]);
      if (!person) continue;
      p.append(line.slice(last, m.index), mentionChip(person));
      last = m.index! + m[0].length;
    }
    p.append(line.slice(last));
    if (!p.textContent) p.append(document.createElement("br"));
    editor.append(p);
  }
}

/** The editor as plain text, mentions written back as @id. */
function readText(editor: HTMLElement) {
  let out = "";
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent;
      return;
    }
    const el = node as HTMLElement;
    if (el.dataset?.mention) {
      out += `@${el.dataset.mention}`;
      return;
    }
    if (el.tagName === "BR") {
      out += "\n";
      return;
    }
    el.childNodes.forEach(walk);
    if (BLOCKS.has(el.tagName) && !out.endsWith("\n")) out += "\n";
  };
  editor.childNodes.forEach(walk);
  return out
    .replace(/ /g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The default AI polish: sentence case, single spaces, a full stop at the end. */
function tidy(text: string) {
  if (!text.trim()) return DRAFT;
  const next = text
    .split("\n")
    .map((line) => {
      let l = line.replace(/[ \t]{2,}/g, " ").trim();
      if (!l) return l;
      l = l.replace(
        /(^|[.!?]\s+)([a-z])/g,
        (_, a: string, b: string) => a + b.toUpperCase(),
      );
      l = l.replace(/\bi\b/g, "I");
      return /[.!?:,]$/.test(l) || /\p{Extended_Pictographic}$/u.test(l)
        ? l
        : `${l}.`;
    })
    .join("\n");
  // Already tidy: round it off with a warm closing line instead.
  if (next === text.trim() && !/thank/i.test(next))
    return `${next}\nThanks so much!`;
  return next;
}

/*
 * Block styles and lists are done by hand: the browser's own list and block
 * commands nest lists inside paragraphs and drop the caret at the start.
 */
const LIST = new Set(["UL", "OL"]);

/** The editor's lines: its top level blocks, with each list item counted as one. */
function lineBlocks(ed: HTMLElement) {
  const out: HTMLElement[] = [];
  for (const c of ed.children as HTMLCollectionOf<HTMLElement>)
    out.push(
      ...(LIST.has(c.tagName) ? ([...c.children] as HTMLElement[]) : [c]),
    );
  return out;
}

/** Loose text at the top level goes into paragraphs. */
function wrapLoose(ed: HTMLElement) {
  let p: HTMLElement | null = null;
  for (const n of [...ed.childNodes]) {
    if (
      n.nodeType === Node.ELEMENT_NODE &&
      BLOCKS.has((n as HTMLElement).tagName)
    ) {
      p = null;
      continue;
    }
    if (!p) {
      p = document.createElement("p");
      n.before(p);
    }
    p.append(n);
  }
}

function moveInto(from: Node, to: Node) {
  while (from.firstChild) to.appendChild(from.firstChild);
}

/** Takes a list item out of its list as a block, splitting the list around it. */
function liftItem(li: HTMLElement, tag: string, moved: Map<Node, Node>) {
  const list = li.parentElement!;
  const el = document.createElement(tag);
  moveInto(li, el);
  moved.set(li, el);
  const rest = list.cloneNode(false) as HTMLElement;
  while (li.nextSibling) rest.appendChild(li.nextSibling);
  li.remove();
  list.after(el);
  if (rest.childNodes.length) el.after(rest);
  if (!list.children.length) list.remove();
  return el;
}

/** Runs a change to the selected lines and puts the caret (or selection) back where it was. */
function onLines(
  ed: HTMLElement,
  change: (lines: HTMLElement[], moved: Map<Node, Node>) => void,
) {
  wrapLoose(ed);
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;
  const range = sel.getRangeAt(0);
  const all = lineBlocks(ed);
  let lines = all.filter((l) => range.intersectsNode(l));
  if (!lines.length && all.length) lines = [all[all.length - 1]!];
  if (!lines.length) return;
  const at = [
    sel.anchorNode!,
    sel.anchorOffset,
    sel.focusNode!,
    sel.focusOffset,
  ] as const;
  const moved = new Map<Node, Node>();
  change(lines, moved);
  const find = (n: Node) => {
    while (moved.has(n)) n = moved.get(n)!;
    return n;
  };
  const a = find(at[0]);
  const f = find(at[2]);
  if (ed.contains(a) && ed.contains(f))
    sel.setBaseAndExtent(a, at[1], f, at[3]);
}

function setBlock(ed: HTMLElement, tag: string) {
  onLines(ed, (lines, moved) => {
    for (const line of lines) {
      if (line.tagName === "LI") liftItem(line, tag, moved);
      else if (line.tagName !== tag.toUpperCase()) {
        const el = document.createElement(tag);
        moveInto(line, el);
        line.replaceWith(el);
        moved.set(line, el);
      }
    }
  });
}

function toggleList(ed: HTMLElement, tag: "ul" | "ol") {
  onLines(ed, (lines, moved) => {
    const inside = lines.every(
      (l) =>
        l.tagName === "LI" && l.parentElement!.tagName === tag.toUpperCase(),
    );
    const flat = lines.map((l) =>
      l.tagName === "LI" ? liftItem(l, "p", moved) : l,
    );
    if (inside) return;
    const list = document.createElement(tag);
    flat[0]!.before(list);
    for (const l of flat) {
      const li = document.createElement("li");
      moveInto(l, li);
      moved.set(l, li);
      list.append(li);
      l.remove();
    }
    // Join a list of the same kind right above or below.
    const prev = list.previousElementSibling;
    if (prev?.tagName === list.tagName) {
      moveInto(list, prev);
      list.remove();
      const next = prev.nextElementSibling;
      if (next?.tagName === prev.tagName) {
        moveInto(next, prev);
        next.remove();
      }
    } else if (list.nextElementSibling?.tagName === list.tagName) {
      const next = list.nextElementSibling;
      moveInto(next, list);
      next.remove();
    }
  });
}

interface Format {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  ul: boolean;
  ol: boolean;
  quote: boolean;
  code: boolean;
  style: StyleId;
}
const NO_FORMAT: Format = {
  bold: false,
  italic: false,
  underline: false,
  ul: false,
  ol: false,
  quote: false,
  code: false,
  style: "body",
};

interface Upload extends ComposerAttachment {
  progress: number;
  failed?: boolean;
}

/** Closes a popover on a press elsewhere or Escape. */
function useDismiss(open: boolean, close: () => void, scope: string) {
  React.useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.(`[data-pop="${scope}"]`)) close();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open, close, scope]);
}

/** Moves focus between a menu's rows with the arrow keys. */
function arrowKeys(e: React.KeyboardEvent<HTMLElement>) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  const rows = [...e.currentTarget.querySelectorAll<HTMLElement>("[data-row]")];
  const at = rows.indexOf(document.activeElement as HTMLElement);
  const next = e.key === "ArrowDown" ? at + 1 : at - 1;
  rows[(next + rows.length) % rows.length]?.focus();
}

/** A menu that pours open from its edge, its rows following one after another. */
function Pour({
  from,
  still,
  className,
  children,
  ...rest
}: {
  from: "top" | "bottom";
  still: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"
>) {
  const shut =
    from === "top"
      ? "inset(-40% -40% 100% -40% round 18px)"
      : "inset(100% -40% -40% -40% round 18px)";
  return (
    <motion.div
      {...rest}
      initial={
        still
          ? { opacity: 0 }
          : { opacity: 0, clipPath: shut, y: from === "top" ? -4 : 4 }
      }
      animate={{
        opacity: 1,
        clipPath: "inset(-40% -40% -40% -40% round 18px)",
        y: 0,
        transition: still ? { duration: 0 } : { duration: 0.38, ease: GLIDE },
      }}
      exit={
        still
          ? { opacity: 0 }
          : {
              opacity: 0,
              clipPath: shut,
              transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
            }
      }
      className={cn(
        "absolute z-30 rounded-[18px] bg-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_18px_44px_-14px_rgba(0,0,0,0.3)] ring-1 ring-black/5",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

/** A row in a menu that slides in after the one above it. */
function Row({
  i,
  still,
  className,
  children,
  ...rest
}: {
  i: number;
  still: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"
>) {
  return (
    <motion.button
      type="button"
      data-row=""
      {...rest}
      initial={still ? false : { opacity: 0, y: -6, filter: "blur(3px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.3,
        ease: GLIDE,
        delay: still ? 0 : 0.05 + i * 0.035,
      }}
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-[#242423] outline-none disabled:cursor-default disabled:opacity-40",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

/* Scheduling: quick times, and a small calendar with time slots. */
const DAY_MS = 86_400_000;
const HOURS = [8, 9, 10, 12, 14, 16, 18, 20];
const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

/** A copy of `base`, `days` later, at the given hour. */
const at = (base: Date, days: number, hour: number, minute = 0) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
};
const hourText = (h: number) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
const timeText = (d: Date) =>
  d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

/** Today, 6:00 PM / Tomorrow, 9:00 AM / Monday, 9:00 AM / Thu, Nov 20, 9:00 AM */
function whenText(d: Date, now = new Date()) {
  const days = Math.round(
    (at(d, 0, 0).getTime() - at(now, 0, 0).getTime()) / DAY_MS,
  );
  const day =
    days === 0
      ? "Today"
      : days === 1
        ? "Tomorrow"
        : days < 7
          ? d.toLocaleDateString("en-US", { weekday: "long" })
          : d.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
  return `${day}, ${timeText(d)}`;
}

function quickTimes(now: Date) {
  const out: { id: string; label: string; when: Date }[] = [];
  // An hour from now, rounded up to the next five minutes.
  const soon = new Date(
    Math.ceil((now.getTime() + 3_600_000) / 300_000) * 300_000,
  );
  out.push({ id: "hour", label: "In an hour", when: soon });
  if (now.getHours() < 17)
    out.push({ id: "evening", label: "This evening", when: at(now, 0, 18) });
  out.push({ id: "tomorrow", label: "Tomorrow morning", when: at(now, 1, 9) });
  const toMonday = (8 - now.getDay()) % 7 || 7;
  if (toMonday > 1)
    out.push({
      id: "monday",
      label: "Monday morning",
      when: at(now, toMonday, 9),
    });
  return out;
}

const zoneText = () =>
  new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName")?.value ?? "";

type SendView = "main" | "schedule" | "pick";

const roundIcon =
  "grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-[#242423]/60 outline-none transition-colors hover:bg-[#242423]/[0.05] hover:text-[#242423] focus-visible:ring-2 focus-visible:ring-[#242423]/30 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent";

/**
 * The send menu: send now, schedule and send quietly. Schedule slides over to
 * quick times, and from there to a calendar with time slots; the menu's height
 * glides to fit each view.
 */
function SendMenu({
  uid,
  still,
  ready,
  sendAt,
  startView,
  onSend,
  onSchedule,
}: {
  uid: string;
  still: boolean;
  ready: boolean;
  sendAt: Date | null;
  startView: SendView;
  onSend: (mode: SendMode) => void;
  onSchedule: (when: Date) => void;
}) {
  const now = React.useMemo(() => new Date(), []);
  const [view, setView] = React.useState<SendView>(startView);
  const [dir, setDir] = React.useState(1);
  const [hover, setHover] = React.useState<string | null>(null);
  const go = (next: SendView, d: 1 | -1) => {
    setDir(d);
    setHover(null);
    setView(next);
  };
  const start = sendAt ?? at(now, 1, 9);
  const [month, setMonth] = React.useState(
    () => new Date(start.getFullYear(), start.getMonth(), 1),
  );
  const [day, setDay] = React.useState(() => at(start, 0, 0));
  const [hour, setHour] = React.useState(() =>
    HOURS.includes(start.getHours()) ? start.getHours() : 9,
  );
  const times = React.useMemo(() => quickTimes(now), [now]);
  const zone = React.useMemo(zoneText, []);
  const today = at(now, 0, 0);
  const chosen = at(day, 0, hour);
  const slotGone = (h: number) => at(day, 0, h) <= now;
  // Picking today with a slot already gone moves to the next open one.
  React.useEffect(() => {
    if (!slotGone(hour)) return;
    const open = HOURS.find((h) => !slotGone(h));
    if (open !== undefined) setHour(open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  // The menu's height follows the view, so moving between them glides.
  const inner = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | "auto">("auto");
  React.useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    setHeight(el.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const slide = {
    enter: (d: number) =>
      still ? { opacity: 0 } : { opacity: 0, x: d * 48, filter: "blur(4px)" },
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (d: number) =>
      still ? { opacity: 0 } : { opacity: 0, x: d * -48, filter: "blur(4px)" },
  };

  const first = month.getDay();
  const count = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cells = [
    ...Array.from({ length: first }, () => null),
    ...Array.from(
      { length: count },
      (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
    ),
  ];
  const thisMonth =
    month.getFullYear() === now.getFullYear() &&
    month.getMonth() === now.getMonth();

  const header = (title: string, back: SendView) => (
    <div className="flex items-center gap-1 px-1 pb-1">
      <button
        type="button"
        aria-label="Back"
        onClick={() => go(back, -1)}
        className={roundIcon}
      >
        <ChevronLeftIcon className="size-4" strokeWidth={2.25} />
      </button>
      <span className="text-[14px] font-medium">{title}</span>
    </div>
  );

  return (
    <Pour
      from="bottom"
      still={still}
      role="dialog"
      aria-label="Send options"
      onKeyDown={arrowKeys}
      onPointerLeave={() => setHover(null)}
      className="bottom-full right-0 mb-2 w-[296px] overflow-hidden"
    >
      <motion.div
        animate={{ height }}
        transition={still ? { duration: 0 } : SOFT}
        className="relative"
      >
        <div ref={inner}>
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div
              key={view}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: GLIDE }}
            >
              {view === "main" && (
                <div role="menu" aria-label="Send options">
                  {(
                    [
                      {
                        id: "now",
                        label: "Send now",
                        hint: "Everyone gets it right away",
                        icon: <SendIcon className="size-4" strokeWidth={2} />,
                      },
                      {
                        id: "schedule",
                        label: "Schedule",
                        hint: sendAt
                          ? whenText(sendAt, now)
                          : "Pick a time to send",
                        icon: <ClockIcon className="size-4" strokeWidth={2} />,
                      },
                      {
                        id: "silent",
                        label: "Send quietly",
                        hint: "No notification sound",
                        icon: (
                          <Nudge>
                            <BellOff className="size-4" strokeWidth={2} />
                          </Nudge>
                        ),
                      },
                    ] as const
                  ).map((o, i, all) => (
                    <Row
                      key={o.id}
                      i={all.length - 1 - i}
                      still={still}
                      role="menuitem"
                      disabled={o.id !== "schedule" && !ready}
                      onPointerEnter={() => setHover(o.id)}
                      onFocus={() => setHover(o.id)}
                      onClick={() =>
                        o.id === "schedule" ? go("schedule", 1) : onSend(o.id)
                      }
                      className="py-2"
                    >
                      {hover === o.id && (
                        <Glide id={`${uid}-send-glide`} still={still} />
                      )}
                      <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-[#242423]/[0.05] text-[#242423]/80">
                        {o.icon}
                      </span>
                      <span className="relative min-w-0 flex-1">
                        <span className="block text-[14px] font-medium leading-5">
                          {o.label}
                        </span>
                        <span className="block truncate text-[12px] leading-4 text-[#242423]/50">
                          {o.hint}
                        </span>
                      </span>
                      {o.id === "schedule" && (
                        <ChevronRightIcon
                          className="relative size-4 text-[#242423]/40"
                          strokeWidth={2.25}
                        />
                      )}
                    </Row>
                  ))}
                </div>
              )}

              {view === "schedule" && (
                <div>
                  {header("Schedule send", "main")}
                  <div role="menu" aria-label="Quick times">
                    {times.map((q, i) => {
                      const on = sendAt?.getTime() === q.when.getTime();
                      return (
                        <Row
                          key={q.id}
                          i={i}
                          still={still}
                          role="menuitemradio"
                          aria-checked={on}
                          onPointerEnter={() => setHover(q.id)}
                          onFocus={() => setHover(q.id)}
                          onClick={() => onSchedule(q.when)}
                          className="h-11 justify-between"
                        >
                          {hover === q.id && (
                            <Glide id={`${uid}-send-glide`} still={still} />
                          )}
                          <span className="relative text-[14px] font-medium">
                            {q.label}
                          </span>
                          <span className="relative flex items-center gap-2 text-[12px] text-[#242423]/50">
                            {whenText(q.when, now)}
                            {on && (
                              <CheckIcon
                                className="size-4 text-[#242423]"
                                strokeWidth={2.5}
                                active
                              />
                            )}
                          </span>
                        </Row>
                      );
                    })}
                    <div
                      aria-hidden
                      className="mx-3 my-1 h-px bg-[#242423]/[0.07]"
                    />
                    <Row
                      i={times.length}
                      still={still}
                      role="menuitem"
                      onPointerEnter={() => setHover("pick")}
                      onFocus={() => setHover("pick")}
                      onClick={() => go("pick", 1)}
                      className="h-11"
                    >
                      {hover === "pick" && (
                        <Glide id={`${uid}-send-glide`} still={still} />
                      )}
                      <CalendarDaysIcon
                        className="relative size-4 text-[#242423]/70"
                        strokeWidth={2}
                      />
                      <span className="relative flex-1 text-[14px] font-medium">
                        Pick a date and time
                      </span>
                      <ChevronRightIcon
                        className="relative size-4 text-[#242423]/40"
                        strokeWidth={2.25}
                      />
                    </Row>
                  </div>
                  <p className="px-3 pb-1 pt-2 text-[12px] text-[#242423]/45">
                    Times are in your time zone{zone ? ` (${zone})` : ""}
                  </p>
                </div>
              )}

              {view === "pick" && (
                <div className="px-1 pb-1">
                  <div className="flex items-center gap-1 pb-1">
                    <button
                      type="button"
                      aria-label="Back"
                      onClick={() => go("schedule", -1)}
                      className={roundIcon}
                    >
                      <ChevronLeftIcon className="size-4" strokeWidth={2.25} />
                    </button>
                    <span className="relative flex-1 overflow-hidden text-[14px] font-medium">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={month.getTime()}
                          className="block"
                          initial={
                            still
                              ? { opacity: 0 }
                              : { opacity: 0, y: 10, filter: "blur(3px)" }
                          }
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={
                            still
                              ? { opacity: 0 }
                              : { opacity: 0, y: -10, filter: "blur(3px)" }
                          }
                          transition={{ duration: 0.28, ease: GLIDE }}
                        >
                          {month.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <button
                      type="button"
                      aria-label="Previous month"
                      disabled={thisMonth}
                      onClick={() =>
                        setMonth(
                          new Date(
                            month.getFullYear(),
                            month.getMonth() - 1,
                            1,
                          ),
                        )
                      }
                      className={roundIcon}
                    >
                      <ChevronLeftIcon className="size-4" strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next month"
                      onClick={() =>
                        setMonth(
                          new Date(
                            month.getFullYear(),
                            month.getMonth() + 1,
                            1,
                          ),
                        )
                      }
                      className={roundIcon}
                    >
                      <ChevronRightIcon className="size-4" strokeWidth={2.25} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 px-1 text-center text-[12px] font-medium leading-6 text-[#242423]/40">
                    {WEEK.map((w, i) => (
                      <span key={i} aria-hidden>
                        {w}
                      </span>
                    ))}
                  </div>
                  <div
                    role="grid"
                    aria-label="Day"
                    className="grid grid-cols-7 gap-y-0.5 px-1"
                  >
                    {cells.map((d, i) =>
                      d ? (
                        <button
                          key={i}
                          type="button"
                          aria-label={d.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                          aria-pressed={d.getTime() === day.getTime()}
                          disabled={d < today}
                          onClick={() => setDay(d)}
                          className={cn(
                            "relative mx-auto grid size-9 cursor-pointer place-items-center rounded-full text-[14px] tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#242423]/30 disabled:cursor-default disabled:text-[#242423]/25",
                            d.getTime() === day.getTime()
                              ? "text-white"
                              : "hover:bg-[#242423]/[0.05]",
                          )}
                        >
                          {d.getTime() === day.getTime() && (
                            <motion.span
                              layoutId={`${uid}-day`}
                              transition={still ? { duration: 0 } : POP}
                              className="absolute inset-0 rounded-full bg-[#242423]"
                            />
                          )}
                          <span className="relative">{d.getDate()}</span>
                          {d.getTime() === today.getTime() && (
                            <span
                              aria-hidden
                              className={cn(
                                "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full",
                                d.getTime() === day.getTime()
                                  ? "bg-white"
                                  : "bg-[#242423]/50",
                              )}
                            />
                          )}
                        </button>
                      ) : (
                        <span key={i} />
                      ),
                    )}
                  </div>

                  <div
                    aria-hidden
                    className="mx-2 my-2 h-px bg-[#242423]/[0.07]"
                  />
                  <div
                    role="radiogroup"
                    aria-label="Time"
                    className="grid grid-cols-4 gap-1 px-1"
                  >
                    {HOURS.map((h) => {
                      const on = h === hour;
                      return (
                        <button
                          key={h}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          disabled={slotGone(h)}
                          onClick={() => setHour(h)}
                          className={cn(
                            "relative h-8 cursor-pointer rounded-full text-[12px] font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#242423]/30 disabled:cursor-default disabled:text-[#242423]/25",
                            on
                              ? "text-white"
                              : "bg-[#242423]/[0.04] hover:bg-[#242423]/[0.08]",
                          )}
                        >
                          {on && (
                            <motion.span
                              layoutId={`${uid}-hour`}
                              transition={still ? { duration: 0 } : POP}
                              className="absolute inset-0 rounded-full bg-[#242423]"
                            />
                          )}
                          <span className="relative">{hourText(h)}</span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="px-2 pb-2 pt-3 text-[12px] text-[#242423]/50">
                    Sends {whenText(chosen, now)}
                    {zone ? ` ${zone}` : ""}
                  </p>
                  <motion.button
                    type="button"
                    disabled={chosen <= now}
                    onClick={() => onSchedule(chosen)}
                    whileTap={still ? undefined : { scale: 0.97 }}
                    transition={POP}
                    className="group flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#242423] text-[14px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#242423]/30 focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-40"
                  >
                    <ClockIcon className="size-4" strokeWidth={2.25} />
                    Set time
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </Pour>
  );
}

/** A soft pill that glides to the row under the pointer. */
function Glide({ id, still }: { id: string; still: boolean }) {
  return (
    <motion.span
      layoutId={id}
      transition={still ? { duration: 0 } : POP}
      className="absolute inset-0 rounded-xl bg-[#242423]/[0.05]"
    />
  );
}

/** A square icon button: a soft wash on hover, a press dip, a filled state while on. */
const Tool = React.forwardRef<
  HTMLButtonElement,
  {
    label: string;
    on?: boolean;
    toggle?: boolean;
    danger?: boolean;
    keepFocus?: boolean;
    still: boolean;
    className?: string;
    children: React.ReactNode;
  } & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"
  >
>(function Tool(
  {
    label,
    on = false,
    toggle = false,
    danger = false,
    keepFocus = true,
    still,
    className,
    children,
    onMouseDown,
    ...rest
  },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={toggle ? on : undefined}
      onMouseDown={(e) => {
        // Keep the caret in the message, so formatting lands where you were writing.
        if (keepFocus) e.preventDefault();
        onMouseDown?.(e);
      }}
      whileTap={still || rest.disabled ? undefined : { scale: 0.86 }}
      transition={POP}
      {...rest}
      className={cn(
        "group relative grid size-8 shrink-0 cursor-pointer place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#242423]/30 disabled:cursor-default",
        danger
          ? "text-[#d64545] disabled:text-[#d64545]/35"
          : on
            ? "text-[#242423]"
            : "text-[#242423]/55 hover:text-[#242423] disabled:text-[#242423]/25",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0",
          danger ? "bg-[#d64545]/[0.09]" : "bg-[#242423]/[0.05]",
        )}
      />
      <AnimatePresence initial={false}>
        {on && (
          <motion.span
            aria-hidden
            initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={still ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
            transition={POP}
            className="absolute inset-0 rounded-[inherit] bg-[#242423]/[0.09]"
          />
        )}
      </AnimatePresence>
      <span className="relative grid">{children}</span>
    </motion.button>
  );
});

/** A static lucide icon with a small lift on hover and a dip on press. */
function Nudge({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-px group-hover:scale-110 group-active:scale-90">
      {children}
    </span>
  );
}

/** A thumbnail with an upload ring that becomes a check, and a remove button. */
function Thumb({
  item,
  still,
  onRemove,
}: {
  item: Upload;
  still: boolean;
  onRemove: () => void;
}) {
  const done = item.progress >= 1 && !item.failed;
  const [settled, setSettled] = React.useState(done);
  React.useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setSettled(true), still ? 0 : 750);
    return () => window.clearTimeout(t);
  }, [done, still]);
  const ext = item.name.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE";

  return (
    <motion.div
      layout
      initial={
        still ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: "blur(6px)" }
      }
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={
        still
          ? { opacity: 0 }
          : {
              opacity: 0,
              scale: 0.6,
              filter: "blur(6px)",
              transition: { duration: 0.22 },
            }
      }
      transition={POP}
      className="group/thumb relative size-16 shrink-0"
    >
      <div
        className={cn(
          "relative size-full overflow-hidden rounded-2xl bg-[#242423]/[0.05]",
          item.failed && "ring-[1.5px] ring-[#d64545]",
        )}
      >
        {(item.kind === "image" || item.kind === "video") && item.src ? (
          <img
            src={item.src}
            alt={item.name}
            draggable={false}
            className="size-full object-cover transition-transform duration-500 group-hover/thumb:scale-[1.06]"
          />
        ) : item.kind === "voice" ? (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 text-[#242423]">
            <span aria-hidden className="flex h-4 items-center gap-[2px]">
              {[6, 12, 8, 14, 7, 10].map((h, i) => (
                <span
                  key={i}
                  className="w-[2px] rounded-full bg-current"
                  style={{ height: h }}
                />
              ))}
            </span>
            <span className="text-[12px] font-medium tabular-nums">
              {item.duration}
            </span>
          </div>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 text-[#242423]/70">
            <FileTextIcon className="size-5" strokeWidth={1.75} aria-hidden />
            <span className="text-[12px] font-semibold tracking-wide">
              {ext}
            </span>
          </div>
        )}
        {item.kind === "video" && settled && (
          <>
            <span className="absolute left-1/2 top-1/2 grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#242423] shadow-sm">
              <Play
                className="size-3 translate-x-px fill-current"
                aria-hidden
              />
            </span>
            {item.duration && (
              <span className="absolute bottom-1 left-1 rounded-md bg-black/45 px-1 text-[12px] font-medium leading-4 tabular-nums text-white">
                {item.duration}
              </span>
            )}
          </>
        )}

        {/* Uploading: a dim veil with a ring that fills, then a check that pops before it clears. */}
        <AnimatePresence>
          {!settled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.35 } }}
              className="absolute inset-0 grid place-items-center bg-[#242423]/40 backdrop-blur-[2px]"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {done ? (
                  <motion.span
                    key="done"
                    initial={still ? { opacity: 0 } : { scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={POP}
                    className="grid size-7 place-items-center rounded-full bg-white text-[#269a5a]"
                  >
                    <CheckIcon className="size-4" strokeWidth={2.75} active />
                  </motion.span>
                ) : (
                  <motion.svg
                    key="ring"
                    viewBox="0 0 28 28"
                    className="size-7 -rotate-90"
                    exit={still ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    aria-hidden
                  >
                    <circle
                      cx="14"
                      cy="14"
                      r="11"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2.5"
                    />
                    <motion.circle
                      cx="14"
                      cy="14"
                      r="11"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: Math.max(0.04, item.progress) }}
                      transition={still ? { duration: 0 } : SOFT}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        onClick={onRemove}
        className="absolute -right-1.5 -top-1.5 grid size-5 scale-75 cursor-pointer place-items-center rounded-full bg-[#242423] text-white opacity-0 shadow-[0_0_0_2px_white] outline-none transition-[opacity,transform] duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 focus-visible:scale-100 focus-visible:opacity-100 group-hover/thumb:scale-100 group-hover/thumb:opacity-100"
      >
        <XIcon className="size-3" strokeWidth={2.75} />
      </button>
      <span role="status" className="sr-only">
        {item.failed
          ? `${item.name} failed to upload.`
          : done
            ? `${item.name} uploaded.`
            : ""}
      </span>
    </motion.div>
  );
}

export const MessageComposer = React.forwardRef<
  HTMLDivElement,
  MessageComposerProps
>(function MessageComposer(
  {
    defaultValue = "",
    placeholder = "Write a message, type @ to mention someone",
    people = DEFAULT_PEOPLE,
    defaultAttachments = [],
    toolbar: toolbarProp = true,
    maxHeight = 240,
    onSend,
    onUpload,
    onEnhance,
    onVideo,
    onChange,
    className,
  },
  ref,
) {
  const still = !!useReducedMotion();
  const id = React.useId();
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => root.current!);
  const editor = React.useRef<HTMLDivElement>(null);
  const scroller = React.useRef<HTMLDivElement>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const saved = React.useRef<Range | null>(null);
  const seen = useInView(root, { once: true, amount: 0.3 });
  const appear = seen || still;
  const wipe = useAnimationControls();

  const [format, setFormat] = React.useState<Format>(NO_FORMAT);
  const [empty, setEmpty] = React.useState(!defaultValue);
  const [focused, setFocused] = React.useState(false);
  const [toolbar, setToolbar] = React.useState(toolbarProp);
  const [height, setHeight] = React.useState(24);
  const [files, setFiles] = React.useState<Upload[]>(() =>
    defaultAttachments.map((a) => ({ ...a, progress: 0 })),
  );
  const [styleMenu, setStyleMenu] = React.useState(false);
  const [emojiMenu, setEmojiMenu] = React.useState(false);
  const [sendMenu, setSendMenu] = React.useState(false);
  const [hover, setHover] = React.useState<string | null>(null);
  const [peek, setPeek] = React.useState<{
    person: ComposerPerson;
    x: number;
    y: number;
  } | null>(null);
  const peekTimer = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(peekTimer.current), []);

  /** Hovering a mention chip shows who it is in a small card above it. */
  const peekAt = (e: React.PointerEvent) => {
    const chip = (e.target as Element).closest?.<HTMLElement>("[data-mention]");
    if (!chip) return;
    const person = people.find((p) => p.id === chip.dataset.mention);
    if (!person) return;
    window.clearTimeout(peekTimer.current);
    const at = chip.getBoundingClientRect();
    const box = root.current!.getBoundingClientRect();
    const scale = box.width / root.current!.offsetWidth || 1;
    const half = 110;
    const x = (at.left + at.width / 2 - box.left) / scale;
    setPeek({
      person,
      x: Math.min(Math.max(x, half), root.current!.offsetWidth - half),
      y: (at.top - box.top) / scale - 8,
    });
  };
  const unpeek = (e: React.PointerEvent) => {
    const chip = (e.target as Element).closest?.("[data-mention]");
    if (!chip || chip.contains(e.relatedTarget as Node)) return;
    window.clearTimeout(peekTimer.current);
    peekTimer.current = window.setTimeout(() => setPeek(null), 120);
  };
  const [mention, setMention] = React.useState<{
    query: string;
    node: Text;
    start: number;
    end: number;
    x: number;
    y: number;
  } | null>(null);
  const [pick, setPick] = React.useState(0);
  const [recording, setRecording] = React.useState<number | null>(null);
  const [thinking, setThinking] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [flights, setFlights] = React.useState(0);
  const [result, setResult] = React.useState<SendMode | null>(null);
  const [sendAt, setSendAt] = React.useState<Date | null>(null);
  const [sentAt, setSentAt] = React.useState<Date | null>(null);
  const [sendView, setSendView] = React.useState<SendView>("main");

  React.useEffect(() => setToolbar(toolbarProp), [toolbarProp]);

  const matches = React.useMemo(() => {
    if (!mention) return [];
    const q = mention.query.toLowerCase();
    return people
      .filter(
        (p) =>
          p.name
            .toLowerCase()
            .split(" ")
            .some((w) => w.startsWith(q)) || p.id.startsWith(q),
      )
      .slice(0, 5);
  }, [mention, people]);

  // Starting text, once.
  React.useLayoutEffect(() => {
    if (editor.current && defaultValue)
      fill(editor.current, defaultValue, people);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The writing area's height follows its text, so each new line glides in.
  React.useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    setHeight(el.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const refresh = React.useCallback(() => {
    const ed = editor.current;
    if (!ed) return;
    setEmpty(!ed.textContent?.trim() && !ed.querySelector("[data-mention],li"));
    const sel = window.getSelection();
    const node = sel?.anchorNode;
    if (!node || !ed.contains(node)) return;
    saved.current = sel!.getRangeAt(0).cloneRange();
    const next: Format = {
      ...NO_FORMAT,
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    };
    let el: HTMLElement | null =
      node.nodeType === Node.TEXT_NODE
        ? node.parentElement
        : (node as HTMLElement);
    while (el && el !== ed) {
      const tag = el.tagName;
      if (tag === "UL") next.ul = true;
      if (tag === "OL") next.ol = true;
      if (tag === "BLOCKQUOTE") next.quote = true;
      if (tag === "PRE") next.code = true;
      const style = STYLES.find((s) => s.tag.toUpperCase() === tag);
      if (style && next.style === "body") next.style = style.id;
      el = el.parentElement;
    }
    setFormat(next);
  }, []);

  React.useEffect(() => {
    document.addEventListener("selectionchange", refresh);
    return () => document.removeEventListener("selectionchange", refresh);
  }, [refresh]);

  // Pretend uploads for files without an uploader: each ring fills at its own pace.
  const uploading = files.some((f) => f.progress < 1 && !f.failed && !f.file);
  React.useEffect(() => {
    if (!appear || !uploading) return;
    const t = window.setInterval(() => {
      setFiles((all) =>
        all.map((f) =>
          f.progress < 1 && !f.file
            ? {
                ...f,
                progress: still
                  ? 1
                  : Math.min(1, f.progress + 0.05 + Math.random() * 0.11),
              }
            : f,
        ),
      );
    }, 140);
    return () => window.clearInterval(t);
  }, [appear, uploading, still]);

  // The voice note counts up while it records.
  const isRecording = recording !== null;
  React.useEffect(() => {
    if (!isRecording) return;
    const t = window.setInterval(
      () => setRecording((s) => (s === null ? s : s + 1)),
      1000,
    );
    return () => window.clearInterval(t);
  }, [isRecording]);

  const closeStyle = React.useCallback(() => setStyleMenu(false), []);
  const closeEmoji = React.useCallback(() => setEmojiMenu(false), []);
  const closeSend = React.useCallback(() => setSendMenu(false), []);
  useDismiss(styleMenu, closeStyle, `${id}-style`);
  useDismiss(emojiMenu, closeEmoji, `${id}-emoji`);
  useDismiss(sendMenu, closeSend, `${id}-send`);

  const ready =
    (!empty || files.length > 0) &&
    files.every((f) => f.progress >= 1 && !f.failed) &&
    !isRecording &&
    !sending &&
    !thinking;

  /** Put the caret back where it was (or at the end) before a command. */
  const restore = () => {
    const ed = editor.current!;
    const sel = window.getSelection()!;
    // The caret is still in the message: use it as it is.
    if (
      document.activeElement === ed &&
      sel.rangeCount &&
      ed.contains(sel.anchorNode)
    )
      return;
    ed.focus({ preventScroll: true });
    const r = saved.current;
    if (r && ed.contains(r.startContainer)) {
      sel.removeAllRanges();
      sel.addRange(r);
    } else {
      const end = document.createRange();
      end.selectNodeContents(ed);
      end.collapse(false);
      sel.removeAllRanges();
      sel.addRange(end);
    }
  };

  /** An empty message gets a paragraph to write in, so lists and styles wrap the right text. */
  const seed = () => {
    const ed = editor.current;
    if (!ed || ed.childNodes.length > 0 || document.activeElement !== ed)
      return;
    const p = document.createElement("p");
    p.append(document.createElement("br"));
    ed.append(p);
    const r = document.createRange();
    r.setStart(p, 0);
    r.collapse(true);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(r);
  };

  const changed = () => {
    refresh();
    if (onChange && editor.current) onChange(readText(editor.current));
  };

  const exec = (command: string, value?: string) => {
    restore();
    document.execCommand(command, false, value);
    changed();
  };

  /** A block style or list change on the lines under the caret. */
  const lines = (change: (ed: HTMLElement) => void) => {
    restore();
    change(editor.current!);
    changed();
  };

  const setStyle = (style: StyleId) => {
    setStyleMenu(false);
    const tag = STYLES.find((s) => s.id === style)!.tag;
    lines((ed) => setBlock(ed, tag));
  };

  // @ opens the people list under the caret; the list follows what you type after it.
  const findMention = () => {
    const sel = window.getSelection();
    const node = sel?.anchorNode;
    if (
      !sel?.isCollapsed ||
      !node ||
      node.nodeType !== Node.TEXT_NODE ||
      !editor.current?.contains(node)
    ) {
      setMention(null);
      return;
    }
    const before = node.textContent!.slice(0, sel.anchorOffset);
    const m = before.match(/(^|\s)@([\w-]{0,20})$/);
    if (!m) {
      setMention(null);
      return;
    }
    const start = sel.anchorOffset - m[2]!.length - 1;
    const r = document.createRange();
    r.setStart(node, start);
    r.setEnd(node, start + 1);
    const at = r.getBoundingClientRect();
    const box = root.current!.getBoundingClientRect();
    // The card may sit inside something scaled, so measure in its own pixels.
    const scale = box.width / root.current!.offsetWidth || 1;
    const x = Math.min(
      (at.left - box.left) / scale - 8,
      root.current!.offsetWidth - 252,
    );
    setMention({
      query: m[2]!,
      node: node as Text,
      start,
      end: sel.anchorOffset,
      x: Math.max(8, x),
      y: (at.bottom - box.top) / scale + 8,
    });
    setPick(0);
  };

  const insertMention = (p: ComposerPerson) => {
    if (!mention) return;
    const { node, start, end } = mention;
    const r = document.createRange();
    r.setStart(node, start);
    r.setEnd(node, Math.min(end, node.length));
    r.deleteContents();
    const chip = mentionChip(p);
    const space = document.createTextNode(" ");
    r.insertNode(space);
    r.insertNode(chip);
    const sel = window.getSelection()!;
    const after = document.createRange();
    after.setStart(space, 1);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);
    if (!still)
      chip.animate(
        [
          { transform: "scale(0.6)", opacity: 0, filter: "blur(3px)" },
          {
            transform: "scale(1.08)",
            opacity: 1,
            filter: "blur(0px)",
            offset: 0.6,
          },
          { transform: "scale(1)" },
        ],
        { duration: 360, easing: "cubic-bezier(0.22,1,0.36,1)" },
      );
    setMention(null);
    editor.current?.focus({ preventScroll: true });
    changed();
  };

  const insertEmoji = (emoji: string) => {
    restore();
    document.execCommand("insertText", false, emoji);
    changed();
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const added: Upload[] = [...list].map((file) => ({
      id: nextId(),
      name: file.name,
      kind: file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "file",
      src: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
      file: onUpload ? file : undefined,
      progress: 0,
    }));
    setFiles((all) => [...all, ...added]);
    if (!onUpload) return;
    for (const a of added) {
      const set = (patch: Partial<Upload>) =>
        setFiles((all) =>
          all.map((f) => (f.id === a.id ? { ...f, ...patch } : f)),
        );
      onUpload(a.file!, (v) =>
        set({ progress: Math.min(0.99, Math.max(0, v)) }),
      ).then(
        () => set({ progress: 1 }),
        () => set({ failed: true }),
      );
    }
  };

  const remove = (item: Upload) => {
    if (item.src?.startsWith("blob:")) URL.revokeObjectURL(item.src);
    setFiles((all) => all.filter((f) => f.id !== item.id));
  };

  const toggleMic = () => {
    if (recording === null) {
      setRecording(0);
      return;
    }
    const seconds = Math.max(1, recording);
    setRecording(null);
    setFiles((all) => [
      ...all,
      {
        id: nextId(),
        name: "Voice note",
        kind: "voice",
        duration: fmt(seconds),
        progress: 0,
      },
    ]);
  };

  const video = () => {
    if (onVideo) return onVideo();
    setFiles((all) => [
      ...all,
      {
        id: nextId(),
        name: "Clip.mp4",
        kind: "video",
        src: SAMPLE_CLIP,
        duration: "0:12",
        progress: 0,
      },
    ]);
  };

  /** Blur the text away, swap it, and bring the new text in through the blur. */
  const swapText = async (next: string) => {
    const ed = editor.current!;
    if (!still)
      await wipe.start({
        opacity: 0,
        y: -8,
        filter: "blur(6px)",
        transition: { duration: 0.22, ease: "easeIn" },
      });
    fill(ed, next, people);
    seed();
    saved.current = null;
    changed();
    setMention(null);
    if (!still) {
      wipe.set({ opacity: 0, y: 8, filter: "blur(6px)" });
      await wipe.start({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.38, ease: GLIDE },
      });
    }
  };

  const enhance = async () => {
    if (thinking) return;
    const ed = editor.current!;
    setThinking(true);
    try {
      const [next] = await Promise.all([
        Promise.resolve(
          onEnhance ? onEnhance(readText(ed)) : tidy(readText(ed)),
        ),
        wait(still ? 0 : 1100),
      ]);
      await swapText(next);
    } finally {
      setThinking(false);
    }
  };

  const clear = () => {
    files.forEach(
      (f) => f.src?.startsWith("blob:") && URL.revokeObjectURL(f.src),
    );
    setFiles([]);
    void swapText("");
  };

  const send = async (mode: SendMode) => {
    setSendMenu(false);
    if (!ready) return;
    const ed = editor.current!;
    const message: ComposerMessage = {
      html: ed.innerHTML,
      text: readText(ed),
      mentions: [...ed.querySelectorAll<HTMLElement>("[data-mention]")].map(
        (m) => m.dataset.mention!,
      ),
      attachments: files.map(({ progress: _p, failed: _f, ...a }) => a),
      mode,
      sendAt:
        mode === "schedule" ? (sendAt ?? at(new Date(), 1, 9)) : undefined,
    };
    setSentAt(message.sendAt ?? null);
    setSendAt(null);
    setSending(true);
    setFlights((n) => n + 1);
    setResult(null);
    setFiles([]);
    try {
      await Promise.all([onSend?.(message), swapText("")]);
      setResult(mode);
      await wait(still ? 1200 : 1800);
    } finally {
      setSending(false);
      setResult(null);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    seed();
    if (mention && matches.length) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setPick(
          (i) =>
            (i + (e.key === "ArrowDown" ? 1 : matches.length - 1)) %
            matches.length,
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(matches[pick] ?? matches[0]!);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setMention(null);
        return;
      }
    }
    if (e.key !== "Enter" || e.shiftKey) return;
    // Enter sends; inside a list, a quote or code it makes a new line, and Cmd or Ctrl with Enter sends.
    const inBlock = format.ul || format.ol || format.quote || format.code;
    if (e.metaKey || e.ctrlKey || !inBlock) {
      e.preventDefault();
      void send(sendAt ? "schedule" : "now");
    }
  };

  const current = STYLES.find((s) => s.id === format.style)!;
  const enter = (delay: number) => ({
    initial: still
      ? (false as const)
      : { opacity: 0, y: 8, filter: "blur(4px)" },
    animate: appear ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 0.45, ease: GLIDE, delay: still ? 0 : delay },
  });
  const sendLabel =
    result === "schedule"
      ? "Scheduled"
      : result === "silent"
        ? "Sent quietly"
        : result === "now"
          ? "Sent"
          : sendAt
            ? "Schedule"
            : "Send";

  const divider = (
    <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-[#242423]/10" />
  );

  return (
    <motion.div
      ref={root}
      onKeyDown={(e) => {
        // Escape closes this composer's own menu and stops there, so a dialog around it stays open.
        if (e.key !== "Escape" || !(styleMenu || emojiMenu || sendMenu)) return;
        e.stopPropagation();
        setStyleMenu(false);
        setEmojiMenu(false);
        setSendMenu(false);
      }}
      initial={still ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={appear ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.6, ease: GLIDE }}
      className={cn("@container relative w-[600px] max-w-full text-[#242423]", className)}
    >
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 4px rgba(36,36,35,0.06), 0 1px 2px rgba(0,0,0,0.05), 0 16px 36px -18px rgba(0,0,0,0.22)"
            : "0 0 0 0px rgba(36,36,35,0), 0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -16px rgba(0,0,0,0.18)",
        }}
        transition={{ duration: 0.25 }}
        className="relative rounded-[28px] bg-white p-2.5 max-sm:p-2"
      >
        {/* Toolbar */}
        <AnimatePresence initial={false}>
          {toolbar && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                transitionEnd: { overflow: "visible" },
              }}
              exit={{ height: 0, opacity: 0, overflow: "hidden" }}
              transition={
                still ? { duration: 0 } : { duration: 0.32, ease: GLIDE }
              }
              className={cn("relative overflow-hidden", styleMenu && "z-30")}
            >
              <motion.div
                role="toolbar"
                aria-label="Formatting"
                {...enter(0.08)}
                className="mb-1 flex items-center gap-0.5 rounded-[18px] bg-[#f1f1ef] p-1"
              >
                {/* Text style */}
                <div className="relative" data-pop={`${id}-style`}>
                  <motion.button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={styleMenu}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setStyleMenu((m) => !m)}
                    whileTap={still ? undefined : { scale: 0.95 }}
                    transition={POP}
                    className={cn(
                      "flex h-8 w-[112px] cursor-pointer items-center justify-between gap-2 rounded-full pl-3.5 pr-2.5 text-[14px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#242423]/30",
                      styleMenu
                        ? "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                        : "hover:bg-white/70",
                    )}
                  >
                    <span className="relative inline-grid overflow-hidden">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={current.id}
                          initial={
                            still
                              ? { opacity: 0 }
                              : { opacity: 0, y: "80%", filter: "blur(3px)" }
                          }
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={
                            still
                              ? { opacity: 0 }
                              : { opacity: 0, y: "-80%", filter: "blur(3px)" }
                          }
                          transition={{ duration: 0.28, ease: GLIDE }}
                        >
                          {current.label}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <motion.span
                      animate={{ rotate: styleMenu ? 180 : 0 }}
                      transition={POP}
                      className="grid"
                    >
                      <ChevronDownIcon
                        className="size-4 text-[#242423]/50"
                        strokeWidth={2.25}
                      />
                    </motion.span>
                  </motion.button>
                  <AnimatePresence>
                    {styleMenu && (
                      <Pour
                        from="top"
                        still={still}
                        role="listbox"
                        aria-label="Text style"
                        onKeyDown={arrowKeys}
                        onPointerLeave={() => setHover(null)}
                        className="left-0 top-full mt-2 w-52"
                      >
                        {STYLES.map((s, i) => (
                          <Row
                            key={s.id}
                            i={i}
                            still={still}
                            role="option"
                            aria-selected={s.id === format.style}
                            onMouseDown={(e) => e.preventDefault()}
                            onPointerEnter={() => setHover(`style-${s.id}`)}
                            onFocus={() => setHover(`style-${s.id}`)}
                            onClick={() => setStyle(s.id)}
                            className="h-11 justify-between"
                          >
                            {(hover ?? `style-${format.style}`) ===
                              `style-${s.id}` && (
                              <Glide id={`${id}-style-glide`} still={still} />
                            )}
                            <span className={cn("relative", s.preview)}>
                              {s.label}
                            </span>
                            <AnimatePresence>
                              {s.id === format.style && (
                                <motion.span
                                  className="relative grid"
                                  initial={
                                    still ? false : { scale: 0, opacity: 0 }
                                  }
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={POP}
                                >
                                  <CheckIcon
                                    className="size-4"
                                    strokeWidth={2.5}
                                    active
                                  />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </Row>
                        ))}
                      </Pour>
                    )}
                  </AnimatePresence>
                </div>

                {/* The formatting tools: one row that scrolls sideways (fading at
                    its edge) when the card is narrow, so the bar never wraps. The
                    style menu stays outside it, or the scroll would clip the menu. */}
                <div className="-my-1 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden @max-[34rem]:[mask-image:linear-gradient(to_right,black_80%,transparent)]">
                {divider}
                <Tool
                  label="Bold"
                  toggle
                  on={format.bold}
                  still={still}
                  onClick={() => exec("bold")}
                >
                  <BoldIcon className="size-4" strokeWidth={2.5} />
                </Tool>
                <Tool
                  label="Italic"
                  toggle
                  on={format.italic}
                  still={still}
                  onClick={() => exec("italic")}
                >
                  <ItalicIcon className="size-4" strokeWidth={2.25} />
                </Tool>
                <Tool
                  label="Underline"
                  toggle
                  on={format.underline}
                  still={still}
                  onClick={() => exec("underline")}
                >
                  <UnderlineIcon className="size-4" strokeWidth={2.25} />
                </Tool>
                {divider}
                <Tool
                  label="Bulleted list"
                  toggle
                  on={format.ul}
                  still={still}
                  onClick={() => lines((ed) => toggleList(ed, "ul"))}
                >
                  <Nudge>
                    <List className="size-4" strokeWidth={2.25} />
                  </Nudge>
                </Tool>
                <Tool
                  label="Numbered list"
                  toggle
                  on={format.ol}
                  still={still}
                  onClick={() => lines((ed) => toggleList(ed, "ol"))}
                >
                  <Nudge>
                    <ListOrdered className="size-4" strokeWidth={2.25} />
                  </Nudge>
                </Tool>
                <Tool
                  label="Quote"
                  toggle
                  on={format.quote}
                  still={still}
                  onClick={() =>
                    lines((ed) =>
                      setBlock(ed, format.quote ? "p" : "blockquote"),
                    )
                  }
                >
                  <Nudge>
                    <TextQuote className="size-4" strokeWidth={2.25} />
                  </Nudge>
                </Tool>
                <Tool
                  label="Code block"
                  toggle
                  on={format.code}
                  still={still}
                  onClick={() =>
                    lines((ed) => setBlock(ed, format.code ? "p" : "pre"))
                  }
                >
                  <TerminalIcon className="size-4" strokeWidth={2.25} />
                </Tool>
                <span className="w-4 shrink-0 @min-[34rem]:hidden" aria-hidden />
                </div>
                {/* The bin only shows once there is something to clear. */}
                <AnimatePresence initial={false}>
                  {(!empty || files.length > 0) && (
                    <motion.span
                      key="clear"
                      className="grid"
                      initial={
                        still
                          ? { opacity: 0 }
                          : {
                              opacity: 0,
                              scale: 0.5,
                              rotate: -20,
                              filter: "blur(4px)",
                            }
                      }
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                        filter: "blur(0px)",
                      }}
                      exit={
                        still
                          ? { opacity: 0 }
                          : {
                              opacity: 0,
                              scale: 0.5,
                              filter: "blur(4px)",
                              transition: { duration: 0.18 },
                            }
                      }
                      transition={POP}
                    >
                      <Tool
                        label="Clear message"
                        danger
                        still={still}
                        onClick={clear}
                      >
                        <DeleteIcon className="size-4" strokeWidth={2.25} />
                      </Tool>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Writing area */}
        <motion.div
          {...enter(0.16)}
          className={cn(
            "relative flex items-start gap-1 pl-3 pr-1 pt-2",
            emojiMenu && "z-30",
          )}
        >
          <motion.div
            initial={false}
            animate={{ height }}
            transition={
              still
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 30 }
            }
            className="relative min-w-0 flex-1 overflow-hidden"
          >
            <div
              ref={scroller}
              className="overflow-y-auto overscroll-contain py-1.5"
              style={{ maxHeight }}
            >
              <motion.div animate={wipe}>
                <div
                  ref={editor}
                  contentEditable
                  suppressContentEditableWarning
                  role="textbox"
                  aria-multiline
                  aria-label="Message"
                  aria-autocomplete="list"
                  aria-expanded={!!mention && matches.length > 0}
                  aria-controls={`${id}-people`}
                  spellCheck
                  onFocus={() => {
                    setFocused(true);
                    // Enter starts a new paragraph rather than a div.
                    document.execCommand(
                      "defaultParagraphSeparator",
                      false,
                      "p",
                    );
                    seed();
                  }}
                  onBlur={() => {
                    setFocused(false);
                    setMention(null);
                  }}
                  onPointerOver={peekAt}
                  onPointerOut={unpeek}
                  onInput={() => {
                    setPeek(null);
                    changed();
                    findMention();
                  }}
                  onKeyDown={onKeyDown}
                  onPaste={(e) => {
                    // Paste as plain text, so outside styles never leak in.
                    e.preventDefault();
                    document.execCommand(
                      "insertText",
                      false,
                      e.clipboardData.getData("text/plain"),
                    );
                  }}
                  className={cn(
                    "min-h-6 break-words text-[16px] leading-6 outline-none",
                    "[&_h2]:text-[24px] [&_h2]:font-semibold [&_h2]:leading-8 [&_h2]:tracking-tight",
                    "[&_h3]:text-[18px] [&_h3]:font-semibold [&_h3]:leading-7",
                    "[&_h6]:text-[14px] [&_h6]:font-normal [&_h6]:leading-6 [&_h6]:text-[#242423]/60",
                    "[&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:pl-0.5",
                    "[&_blockquote]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-[#242423]/20 [&_blockquote]:pl-3 [&_blockquote]:text-[#242423]/70",
                    "[&_pre]:my-1 [&_pre]:whitespace-pre-wrap [&_pre]:rounded-xl [&_pre]:bg-[#242423]/[0.05] [&_pre]:px-3 [&_pre]:py-2 [&_pre]:font-mono [&_pre]:text-[14px]",
                  )}
                />
              </motion.div>
            </div>
            <AnimatePresence>
              {empty && (
                <motion.span
                  aria-hidden
                  initial={still ? { opacity: 0 } : { opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ duration: 0.3, ease: GLIDE }}
                  className="pointer-events-none absolute inset-x-0 top-1.5 truncate text-[16px] leading-6 text-[#242423]/40"
                >
                  {placeholder}
                </motion.span>
              )}
            </AnimatePresence>
            {/* While the AI works, a light band sweeps across the text. */}
            <AnimatePresence>
              {thinking && !still && (
                <motion.span
                  aria-hidden
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                  <motion.span
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/90 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "250%" }}
                    transition={{
                      duration: 1.1,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Emoji */}
          <div className="relative" data-pop={`${id}-emoji`}>
            <Tool
              label="Add emoji"
              on={emojiMenu}
              still={still}
              aria-haspopup="dialog"
              aria-expanded={emojiMenu}
              onClick={() => setEmojiMenu((m) => !m)}
            >
              <SmileIcon className="size-[18px]" strokeWidth={2} />
            </Tool>
            <AnimatePresence>
              {emojiMenu && (
                <Pour
                  from="top"
                  still={still}
                  role="dialog"
                  aria-label="Emoji"
                  className="right-0 top-full mt-2 w-[248px] p-2"
                >
                  <p className="px-1.5 pb-1.5 pt-0.5 text-[12px] font-medium text-[#242423]/45">
                    Quick reactions
                  </p>
                  <div className="grid grid-cols-6 gap-1">
                    {EMOJI.map((e, i) => (
                      <motion.button
                        key={e}
                        type="button"
                        aria-label={`Insert ${e}`}
                        onMouseDown={(ev) => ev.preventDefault()}
                        onClick={() => insertEmoji(e)}
                        initial={still ? false : { opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={still ? undefined : { scale: 0.85 }}
                        transition={{
                          ...POP,
                          delay: still
                            ? 0
                            : 0.04 + (i % 6) * 0.02 + Math.floor(i / 6) * 0.04,
                        }}
                        className="group/emoji grid aspect-square w-full cursor-pointer place-items-center rounded-full outline-none transition-colors duration-200 hover:bg-[#242423]/[0.05] focus-visible:ring-2 focus-visible:ring-[#242423]/30"
                      >
                        <span
                          className={cn(
                            "block text-[20px] leading-none transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover/emoji:scale-125 group-active/emoji:scale-90",
                            i % 2
                              ? "group-hover/emoji:rotate-[8deg]"
                              : "group-hover/emoji:-rotate-[8deg]",
                          )}
                        >
                          {e}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </Pour>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Attachments */}
        <AnimatePresence initial={false}>
          {files.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={
                still ? { duration: 0 } : { duration: 0.32, ease: GLIDE }
              }
              className="overflow-hidden"
            >
              <motion.div
                {...enter(0.22)}
                className="flex flex-wrap gap-2.5 px-3 pb-1 pt-3"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {files.map((f) => (
                    <Thumb
                      key={f.id}
                      item={f}
                      still={still}
                      onRemove={() => remove(f)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* When a scheduled message will go, with change and cancel */}
        <AnimatePresence initial={false}>
          {sendAt && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={
                still ? { duration: 0 } : { duration: 0.32, ease: GLIDE }
              }
              className="overflow-hidden"
            >
              <div className="px-1.5 pt-3">
                <motion.div
                  initial={
                    still
                      ? false
                      : { opacity: 0, scale: 0.9, filter: "blur(4px)" }
                  }
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={POP}
                  style={{ transformOrigin: "0% 50%" }}
                  className="inline-flex h-8 max-w-full items-center rounded-full bg-[#242423]/[0.05] text-[14px]"
                >
                  <button
                    type="button"
                    aria-label="Change when it sends"
                    data-pop={`${id}-send`}
                    onClick={() => {
                      setSendView("schedule");
                      setSendMenu(true);
                    }}
                    className="group flex h-8 min-w-0 cursor-pointer items-center gap-2 rounded-full pl-2.5 pr-2 outline-none transition-colors hover:bg-[#242423]/[0.05] focus-visible:ring-2 focus-visible:ring-[#242423]/30"
                  >
                    <ClockIcon
                      className="size-4 text-[#242423]/70"
                      strokeWidth={2.25}
                    />
                    <span className="text-[#242423]/55">Sends</span>
                    <span className="relative inline-grid overflow-hidden font-medium">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={sendAt.getTime()}
                          className="truncate"
                          initial={
                            still
                              ? { opacity: 0 }
                              : { opacity: 0, y: "80%", filter: "blur(3px)" }
                          }
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={
                            still
                              ? { opacity: 0 }
                              : { opacity: 0, y: "-80%", filter: "blur(3px)" }
                          }
                          transition={{ duration: 0.3, ease: GLIDE }}
                        >
                          {whenText(sendAt)}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="Cancel schedule"
                    onClick={() => setSendAt(null)}
                    className="mr-0.5 grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-[#242423]/55 outline-none transition-colors hover:bg-[#242423]/[0.08] hover:text-[#242423] focus-visible:ring-2 focus-visible:ring-[#242423]/30"
                  >
                    <XIcon className="size-3.5" strokeWidth={2.5} />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom bar */}
        <motion.div
          {...enter(0.26)}
          className={cn(
            "relative mt-2 flex items-center gap-0.5 max-sm:gap-0",
            sendMenu && "z-30",
          )}
        >
          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <Tool
            label="Attach files"
            still={still}
            keepFocus={false}
            onClick={() => fileInput.current?.click()}
          >
            <PlusIcon className="size-[18px]" strokeWidth={2.25} />
          </Tool>

          {/* Voice: the mic turns into a live timer while it records. */}
          <motion.button
            type="button"
            layout
            aria-label={isRecording ? "Stop recording" : "Record a voice note"}
            title={isRecording ? "Stop recording" : "Record a voice note"}
            aria-pressed={isRecording}
            onClick={toggleMic}
            whileTap={still ? undefined : { scale: 0.92 }}
            transition={still ? { duration: 0 } : POP}
            style={{ borderRadius: 999 }}
            className={cn(
              "group relative flex h-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#242423]/30",
              isRecording
                ? "gap-2 bg-[#d64545]/[0.08] pl-2.5 pr-2 text-[#d64545]"
                : "w-8 text-[#242423]/55 transition-colors hover:bg-[#242423]/[0.05] hover:text-[#242423]",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {isRecording ? (
                <motion.span
                  key="rec"
                  layout="position"
                  className="flex items-center gap-2"
                  initial={
                    still
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.7, filter: "blur(3px)" }
                  }
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={POP}
                >
                  <motion.span
                    className="size-2 rounded-full bg-current"
                    animate={still ? undefined : { opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <span className="text-[14px] font-medium tabular-nums">
                    {fmt(recording ?? 0)}
                  </span>
                  <span aria-hidden className="flex h-4 items-center gap-[2px]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.span
                        key={i}
                        className="w-[2px] rounded-full bg-current"
                        animate={
                          still ? { height: 8 } : { height: [4, 14, 6, 12, 4] }
                        }
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </span>
                  <span className="size-2.5 rounded-[3px] bg-current" />
                </motion.span>
              ) : (
                <motion.span
                  key="mic"
                  className="grid"
                  initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={POP}
                >
                  <MicIcon className="size-[18px]" strokeWidth={2} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.div
            layout="position"
            transition={still ? { duration: 0 } : POP}
            className="flex items-center gap-0.5 max-sm:gap-0"
          >
            <Tool label="Record a video" still={still} onClick={video}>
              <Nudge>
                <Video className="size-[18px]" strokeWidth={2} />
              </Nudge>
            </Tool>
            <Tool
              label={thinking ? "Polishing" : "Polish with AI"}
              on={thinking}
              still={still}
              disabled={sending}
              onClick={() => void enhance()}
            >
              <SparklesIcon
                className="size-[18px]"
                strokeWidth={2}
                active={thinking || undefined}
              />
            </Tool>
            <Tool
              label={toolbar ? "Hide formatting" : "Show formatting"}
              toggle
              on={!toolbar}
              still={still}
              onClick={() => setToolbar((t) => !t)}
            >
              <motion.span
                animate={{ rotate: toolbar ? 0 : 90 }}
                transition={POP}
                className="grid"
              >
                <Ellipsis className="size-[18px]" strokeWidth={2.25} />
              </motion.span>
            </Tool>
          </motion.div>

          {/* Send, with a chevron for more ways to send */}
          <div className="relative ml-auto flex" data-pop={`${id}-send`}>
            <motion.div
              animate={{
                backgroundColor:
                  ready || sending ? "#242423" : "rgba(36,36,35,0.07)",
                color: ready || sending ? "#ffffff" : "rgba(36,36,35,0.35)",
              }}
              transition={{ duration: 0.25 }}
              className="flex h-9 items-center overflow-hidden rounded-full"
            >
              <motion.button
                type="button"
                layout
                aria-disabled={!ready}
                onClick={() => void send(sendAt ? "schedule" : "now")}
                whileTap={ready && !still ? { scale: 0.94 } : undefined}
                transition={still ? { duration: 0 } : POP}
                className={cn(
                  "group flex h-9 items-center gap-2 pl-4 pr-3 max-sm:pl-3.5 max-sm:pr-2.5 text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/40",
                  ready ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span className="relative inline-grid overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={sendLabel}
                      initial={
                        still
                          ? { opacity: 0 }
                          : { opacity: 0, y: "90%", filter: "blur(3px)" }
                      }
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={
                        still
                          ? { opacity: 0 }
                          : { opacity: 0, y: "-90%", filter: "blur(3px)" }
                      }
                      transition={{ duration: 0.3, ease: GLIDE }}
                      className="whitespace-nowrap"
                    >
                      {sendLabel}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="relative grid size-4 place-items-center">
                  <AnimatePresence mode="popLayout">
                    {result ? (
                      <motion.span
                        key="done"
                        className="grid"
                        initial={
                          still ? { opacity: 0 } : { scale: 0, rotate: -40 }
                        }
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={POP}
                      >
                        <CheckIcon
                          className="size-4"
                          strokeWidth={2.75}
                          active
                        />
                      </motion.span>
                    ) : sendAt ? (
                      <motion.span
                        key={`clock-${flights}`}
                        className="grid"
                        initial={
                          still
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.4, rotate: -90 }
                        }
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        // Scheduling winds the clock round as it goes.
                        exit={
                          still
                            ? { opacity: 0 }
                            : {
                                opacity: 0,
                                scale: 0.5,
                                rotate: 270,
                                transition: { duration: 0.35, ease: "easeIn" },
                              }
                        }
                        transition={POP}
                      >
                        <ClockIcon className="size-4" strokeWidth={2.25} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key={`plane-${flights}`}
                        className="grid"
                        initial={
                          still
                            ? { opacity: 0 }
                            : { opacity: 0, x: -12, y: 12, scale: 0.6 }
                        }
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        // Sending launches the plane up and away.
                        exit={
                          still
                            ? { opacity: 0 }
                            : {
                                opacity: 0,
                                x: 26,
                                y: -26,
                                scale: 0.8,
                                transition: {
                                  duration: 0.32,
                                  ease: [0.5, 0, 0.75, 0],
                                },
                              }
                        }
                        transition={POP}
                      >
                        <SendIcon className="size-4" strokeWidth={2.25} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>
              <span
                aria-hidden
                className={cn(
                  "h-4 w-px",
                  ready || sending ? "bg-white/20" : "bg-[#242423]/10",
                )}
              />
              <motion.button
                type="button"
                aria-label="More ways to send"
                aria-haspopup="menu"
                aria-expanded={sendMenu}
                onClick={() => {
                  setSendView("main");
                  setSendMenu((m) => !m);
                }}
                whileTap={still ? undefined : { scale: 0.88 }}
                transition={POP}
                className={cn(
                  "grid h-9 w-9 place-items-center max-sm:w-8 pr-0.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/40",
                  ready || sending
                    ? "cursor-pointer hover:bg-white/10"
                    : "cursor-pointer hover:bg-[#242423]/[0.06]",
                )}
              >
                <motion.span
                  animate={{ rotate: sendMenu ? 180 : 0 }}
                  transition={POP}
                  className="grid"
                >
                  <ChevronDownIcon className="size-4" strokeWidth={2.25} />
                </motion.span>
              </motion.button>
            </motion.div>
            <AnimatePresence>
              {sendMenu && (
                <SendMenu
                  uid={id}
                  still={still}
                  ready={ready}
                  sendAt={sendAt}
                  startView={sendView}
                  onSend={(mode) => void send(mode)}
                  onSchedule={(when) => {
                    setSendAt(when);
                    setSendMenu(false);
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Who a mention is, on hover */}
      <AnimatePresence>
        {peek && (
          <div
            key={peek.person.id}
            className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-full"
            style={{ left: peek.x, top: peek.y }}
          >
            <motion.div
              role="tooltip"
              initial={
                still
                  ? { opacity: 0 }
                  : { opacity: 0, y: 6, scale: 0.94, filter: "blur(4px)" }
              }
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={
                still
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      y: 4,
                      scale: 0.97,
                      filter: "blur(3px)",
                      transition: { duration: 0.15 },
                    }
              }
              transition={{ duration: 0.25, ease: GLIDE }}
              style={{ transformOrigin: "50% 100%" }}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_28px_-10px_rgba(0,0,0,0.25)] ring-1 ring-black/5"
            >
              {peek.person.avatar ? (
                <img
                  src={peek.person.avatar}
                  alt=""
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-8 place-items-center rounded-full bg-[#242423]/[0.07] text-[12px] font-semibold">
                  {initials(peek.person.name)}
                </span>
              )}
              <span>
                <span className="block text-[14px] font-medium leading-5">
                  {peek.person.name}
                </span>
                {peek.person.title && (
                  <span className="block text-[12px] leading-4 text-[#242423]/50">
                    {peek.person.title}
                  </span>
                )}
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* People list for @ mentions */}
      <AnimatePresence>
        {mention && matches.length > 0 && (
          <Pour
            from="top"
            still={still}
            id={`${id}-people`}
            role="listbox"
            aria-label="People"
            onPointerLeave={() => setHover(null)}
            className="w-60"
            style={{ left: mention.x, top: mention.y }}
          >
            {matches.map((p, i) => (
              <Row
                key={p.id}
                i={i}
                still={still}
                role="option"
                aria-selected={i === pick}
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onPointerEnter={() => setPick(i)}
                onClick={() => insertMention(p)}
                className="py-1.5"
              >
                {i === pick && (
                  <Glide id={`${id}-people-glide`} still={still} />
                )}
                {p.avatar ? (
                  <img
                    src={p.avatar}
                    alt=""
                    className="relative size-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="relative grid size-7 place-items-center rounded-full bg-[#242423]/[0.07] text-[12px] font-semibold">
                    {initials(p.name)}
                  </span>
                )}
                <span className="relative min-w-0">
                  <span className="block truncate text-[14px] font-medium leading-5">
                    {p.name}
                  </span>
                  {p.title && (
                    <span className="block truncate text-[12px] leading-4 text-[#242423]/50">
                      {p.title}
                    </span>
                  )}
                </span>
              </Row>
            ))}
          </Pour>
        )}
      </AnimatePresence>

      <span role="status" aria-live="polite" className="sr-only">
        {isRecording
          ? "Recording a voice note."
          : thinking
            ? "Polishing your message."
            : result === "schedule"
              ? `Message scheduled for ${sentAt ? whenText(sentAt) : "later"}.`
              : result
                ? "Message sent."
                : ""}
      </span>
    </motion.div>
  );
});