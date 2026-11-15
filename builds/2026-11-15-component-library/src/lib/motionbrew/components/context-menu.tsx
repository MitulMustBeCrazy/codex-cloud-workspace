"use client";

/**
 * ContextMenu, from https://motion-brew.com/components/context-menu
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
import { createPortal } from "react-dom";
import { type ClassValue, clsx } from "clsx";
import { AnimatePresence, motion, type Transition, useAnimation, useReducedMotion, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: bookmark
const BookmarkIcon = (() => {
interface BookmarkIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BookmarkIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const BOOKMARK_VARIANTS: Variants = {
  normal: { scaleY: 1, scaleX: 1 },
  animate: {
    scaleY: [1, 1.3, 0.9, 1.05, 1],
    scaleX: [1, 0.9, 1.1, 0.95, 1],
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const BookmarkIcon = forwardRef<BookmarkIconHandle, BookmarkIconProps>(
  ({ className, onMouseEnter, onMouseLeave, size, active, style, strokeWidth, ...props }, ref) => {
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
            d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"
            style={{ originY: 0.5, originX: 0.5 }}
            variants={BOOKMARK_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

BookmarkIcon.displayName = "BookmarkIcon";
  return BookmarkIcon;
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

// Animated icon: clipboard-check
const ClipboardCheckIcon = (() => {
interface ClipboardCheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ClipboardCheckIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: 0.3, ease: "easeInOut" },
      opacity: { duration: 0.3, ease: "easeInOut" },
    },
  },
};

const ClipboardCheckIcon = forwardRef<
  ClipboardCheckIconHandle,
  ClipboardCheckIconProps
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
        <rect height="4" rx="1" ry="1" width="8" x="8" y="2" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <motion.path
          animate={controls}
          d="m9 14 2 2 4-4"
          initial="normal"
          style={{ transformOrigin: "center" }}
          variants={CHECK_VARIANTS}
        />
      </svg>
    </span>
  );
});

ClipboardCheckIcon.displayName = "ClipboardCheckIcon";
  return ClipboardCheckIcon;
})();

// Animated icon: copy
const CopyIcon = (() => {
interface CopyIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CopyIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 17,
  mass: 1,
};

const CopyIcon = forwardRef<CopyIconHandle, CopyIconProps>(
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
          <motion.rect
            animate={controls}
            height="14"
            rx="2"
            ry="2"
            transition={DEFAULT_TRANSITION}
            variants={{
              normal: { translateY: 0, translateX: 0 },
              animate: { translateY: -3, translateX: -3 },
            }}
            width="14"
            x="8"
            y="8"
          />
          <motion.path
            animate={controls}
            d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
            transition={DEFAULT_TRANSITION}
            variants={{
              normal: { x: 0, y: 0 },
              animate: { x: 3, y: 3 },
            }}
          />
        </svg>
      </span>
    );
  }
);

CopyIcon.displayName = "CopyIcon";
  return CopyIcon;
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

// Animated icon: download
const DownloadIcon = (() => {
interface DownloadIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface DownloadIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const ARROW_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: {
    y: 2,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
      mass: 1,
    },
  },
};

const DownloadIcon = forwardRef<DownloadIconHandle, DownloadIconProps>(
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <motion.g animate={controls} variants={ARROW_VARIANTS}>
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </motion.g>
        </svg>
      </span>
    );
  }
);

DownloadIcon.displayName = "DownloadIcon";
  return DownloadIcon;
})();

// Animated icon: eye
const EyeIcon = (() => {
interface EyeIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface EyeIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const EyeIcon = forwardRef<EyeIconHandle, EyeIconProps>(
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
            d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
            style={{ originY: "50%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            variants={{
              normal: { scaleY: 1, opacity: 1 },
              animate: { scaleY: [1, 0.1, 1], opacity: [1, 0.3, 1] },
            }}
          />
          <motion.circle
            animate={controls}
            cx="12"
            cy="12"
            r="3"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            variants={{
              normal: { scale: 1, opacity: 1 },
              animate: { scale: [1, 0.3, 1], opacity: [1, 0.3, 1] },
            }}
          />
        </svg>
      </span>
    );
  }
);

EyeIcon.displayName = "EyeIcon";
  return EyeIcon;
})();

// Animated icon: folder-input
const FolderInputIcon = (() => {
interface FolderInputIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FolderInputIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const ARROW_VARIANTS: Variants = {
  normal: { x: 0 },
  animate: { x: [0, 2, 0] },
};

const ARROW_TRANSITION: Transition = {
  times: [0, 0.4, 1],
  duration: 0.5,
};

const FolderInputIcon = forwardRef<FolderInputIconHandle, FolderInputIconProps>(
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
      (event: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(event);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(event);
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
          <path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1" />
          <motion.g
            animate={controls}
            initial="normal"
            transition={ARROW_TRANSITION}
            variants={ARROW_VARIANTS}
          >
            <path d="M2 13h10" />
            <path d="m9 16 3-3-3-3" />
          </motion.g>
        </svg>
      </span>
    );
  }
);

FolderInputIcon.displayName = "FolderInputIcon";
  return FolderInputIcon;
})();

// Animated icon: folder-open
const FolderOpenIcon = (() => {
interface FolderOpenIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FolderOpenIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [0, -8, 6, -4, 0],
    transition: {
      ease: "easeInOut",
      rotate: {
        duration: 0.6,
      },
    },
  },
};

const FolderOpenIcon = forwardRef<FolderOpenIconHandle, FolderOpenIconProps>(
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
            d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"
            initial="normal"
            style={{ transformOrigin: "12px 12px" }}
            variants={VARIANTS}
          />
        </motion.svg>
      </span>
    );
  }
);

FolderOpenIcon.displayName = "FolderOpenIcon";
  return FolderOpenIcon;
})();

// Animated icon: link
const LinkIcon = (() => {
interface LinkIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface LinkIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  initial: { pathLength: 1, pathOffset: 0, rotate: 0 },
  animate: {
    pathLength: [1, 0.97, 1, 0.97, 1],
    pathOffset: [0, 0.05, 0, 0.05, 0],
    rotate: [0, -5, 0],
    transition: {
      rotate: {
        duration: 0.5,
      },
      duration: 1,
      times: [0, 0.2, 0.4, 0.6, 1],
      ease: "easeInOut",
    },
  },
};

const LinkIcon = forwardRef<LinkIconHandle, LinkIconProps>(
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
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

LinkIcon.displayName = "LinkIcon";
  return LinkIcon;
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

// Animated icon: square-pen
const SquarePenIcon = (() => {
interface SquarePenIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SquarePenIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PEN_VARIANTS: Variants = {
  normal: {
    rotate: 0,
    x: 0,
    y: 0,
  },
  animate: {
    rotate: [-0.5, 0.5, -0.5],
    x: [0, -1, 1.5, 0],
    y: [0, 1.5, -1, 0],
  },
};

const SquarePenIcon = forwardRef<SquarePenIconHandle, SquarePenIconProps>(
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
          style={{ overflow: "visible" }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <motion.path
            animate={controls}
            d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"
            variants={PEN_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

SquarePenIcon.displayName = "SquarePenIcon";
  return SquarePenIcon;
})();

// ContextMenu

/**
 * ContextMenu
 *
 * Trigger: right click (plus long press and keys). Wraps any content; right
 * clicking it (or a long press on touch, or Shift F10) opens a white menu at
 * the pointer that springs out of that corner while its rows rise in. A soft
 * gray pill glides between rows and each row's animated icon plays while it
 * is hovered. Rows can show a shortcut, open a submenu that slides out beside
 * them, roll to a done state in place (Copy link becomes Link copied with a
 * check before the menu closes), or ask twice before a destructive action
 * (Delete rolls to Click again to delete on a red tint). After a choice a
 * small pill with a check confirms what happened. The arrow keys move through
 * rows, Right and Left open and close the submenu, Enter chooses, and Escape
 * or a click outside closes it. Reduced motion keeps the states without
 * movement.
 *
 * Engine: motion/react (AnimatePresence for the menus and the toast,
 * staggered variants, a layoutId hover pill, rolling labels) with animated
 * icons from lucide-animated (MIT), vendored in src/icons.
 */

/** Any icon that can be told to play. The vendored animated icons all fit. */
export type MenuIcon = React.ComponentType<{
  active?: boolean;
  className?: string;
}>;

export type ContextMenuItem =
  | { separator: true }
  | {
      id: string;
      label: string;
      icon?: MenuIcon;
      /** Shown on the right, like "⌘C". */
      shortcut?: string;
      /** A nested menu that opens beside this row. */
      items?: ContextMenuItem[];
      /** Red tinted, for destructive actions. */
      danger?: boolean;
      /** Ask twice: the first press rolls the label to this. */
      confirm?: string;
      /** Roll to this label and icon in place before closing. */
      done?: { label: string; icon?: MenuIcon };
      /** Text for the small pill shown after it runs. */
      feedback?: string;
      onSelect?: () => void;
    };

type Item = Exclude<ContextMenuItem, { separator: true }>;
const isItem = (i: ContextMenuItem): i is Item => !("separator" in i);

export interface ContextMenuProps {
  /** The rows. Default a set of file actions. */
  items?: ContextMenuItem[];
  /** The area that opens the menu. Default a small file card. */
  children?: React.ReactNode;
  /** Accessible name for the area. Default `"File, right click for actions"`. */
  label?: string;
  className?: string;
}

const DEFAULT_ITEMS: ContextMenuItem[] = [
  {
    id: "ask",
    label: "Ask AI about this",
    icon: SparklesIcon,
    feedback: "Asking AI",
  },
  { separator: true },
  {
    id: "open",
    label: "Open",
    icon: EyeIcon,
    shortcut: "⌘O",
    feedback: "Opened",
  },
  {
    id: "rename",
    label: "Rename",
    icon: SquarePenIcon,
    shortcut: "F2",
    feedback: "Renaming",
  },
  {
    id: "duplicate",
    label: "Duplicate",
    icon: CopyIcon,
    shortcut: "⌘D",
    feedback: "Duplicated",
  },
  {
    id: "link",
    label: "Copy link",
    icon: LinkIcon,
    shortcut: "⌘L",
    done: { label: "Link copied", icon: ClipboardCheckIcon },
    feedback: "Link copied",
  },
  { id: "save", label: "Bookmark", icon: BookmarkIcon, feedback: "Bookmarked" },
  {
    id: "move",
    label: "Move to",
    icon: FolderInputIcon,
    items: [
      {
        id: "design",
        label: "Design",
        icon: FolderOpenIcon,
        feedback: "Moved to Design",
      },
      {
        id: "marketing",
        label: "Marketing",
        icon: FolderOpenIcon,
        feedback: "Moved to Marketing",
      },
      {
        id: "archive",
        label: "Archive",
        icon: FolderOpenIcon,
        feedback: "Moved to Archive",
      },
    ],
  },
  {
    id: "download",
    label: "Download",
    icon: DownloadIcon,
    shortcut: "⌘S",
    feedback: "Downloading",
  },
  { separator: true },
  {
    id: "delete",
    label: "Delete",
    icon: DeleteIcon,
    shortcut: "⌫",
    danger: true,
    confirm: "Click again to delete",
    feedback: "Moved to trash",
  },
];

const GLIDE = [0.22, 1, 0.36, 1] as const;
const PILL = { type: "spring", stiffness: 520, damping: 38 } as const;
const MENU_W = 232;

const MENU: Variants = {
  closed: { opacity: 0, scale: 0.9, filter: "blur(6px)" },
  open: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 460,
      damping: 32,
      staggerChildren: 0.025,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    filter: "blur(4px)",
    transition: { duration: 0.14, ease: GLIDE },
  },
};
const ROW: Variants = {
  closed: { opacity: 0, y: 4 },
  open: { opacity: 1, y: 0, transition: { duration: 0.25, ease: GLIDE } },
};

/** The default trigger: a small file card. */
function FileCard() {
  return (
    <div className="flex w-[280px] items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#242423]/[0.06] text-xs font-semibold text-zinc-500 dark:bg-white/[0.08]">
        PDF
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#242423] dark:text-zinc-100">
          Q3 report.pdf
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          2.4 MB · Edited 2h ago
        </p>
      </div>
    </div>
  );
}

/** One menu panel: rows, the gliding hover pill and keyboard handling. */
function Panel({
  items,
  hover,
  setHover,
  armed,
  doneId,
  openSub,
  onPick,
  onSub,
  still,
  pillId,
  style,
  origin,
  onKey,
  panelRef,
}: {
  items: ContextMenuItem[];
  hover: string | null;
  setHover: (id: string | null) => void;
  armed: string | null;
  doneId: string | null;
  openSub: string | null;
  onPick: (it: Item, rowEl: HTMLElement) => void;
  onSub: (it: Item, rowEl: HTMLElement) => void;
  still: boolean;
  pillId: string;
  style: React.CSSProperties;
  origin: string;
  onKey: (e: React.KeyboardEvent) => void;
  panelRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <motion.div
      ref={panelRef}
      role="menu"
      tabIndex={-1}
      onKeyDown={onKey}
      variants={still ? undefined : MENU}
      initial={still ? false : "closed"}
      animate="open"
      exit={still ? undefined : "exit"}
      style={{ ...style, transformOrigin: origin, width: MENU_W }}
      onPointerLeave={() => setHover(null)}
      className="fixed z-[1000] rounded-2xl bg-white p-1.5 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_16px_40px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5 outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10"
    >
      {items.map((it, i) => {
        if (!isItem(it)) {
          return (
            <motion.div
              key={`sep-${i}`}
              variants={ROW}
              aria-hidden
              className="mx-2.5 my-1 h-px bg-[#242423]/[0.07] dark:bg-white/10"
            />
          );
        }
        const on = hover === it.id || openSub === it.id;
        const isArmed = armed === it.id;
        const isDone = doneId === it.id;
        const Icon = isDone && it.done?.icon ? it.done.icon : it.icon;
        const text =
          isDone && it.done
            ? it.done.label
            : isArmed && it.confirm
              ? it.confirm
              : it.label;
        return (
          <motion.button
            key={it.id}
            type="button"
            role="menuitem"
            data-id={it.id}
            aria-haspopup={it.items ? "menu" : undefined}
            aria-expanded={it.items ? openSub === it.id : undefined}
            variants={ROW}
            onPointerEnter={(e) => {
              setHover(it.id);
              if (it.items) onSub(it, e.currentTarget);
            }}
            onFocus={() => setHover(it.id)}
            onClick={(e) =>
              it.items
                ? onSub(it, e.currentTarget)
                : onPick(it, e.currentTarget)
            }
            whileTap={still ? undefined : { scale: 0.98 }}
            className={cn(
              "relative flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-left text-sm font-medium outline-none",
              it.danger && "text-[#d23f3f] dark:text-[#f07070]",
            )}
          >
            {on && (
              <motion.span
                layoutId={pillId}
                className={cn(
                  "absolute inset-0 rounded-xl",
                  it.danger
                    ? "bg-[#d23f3f]/[0.08]"
                    : "bg-[#242423]/[0.05] dark:bg-white/[0.06]",
                )}
                transition={still ? { duration: 0 } : PILL}
              />
            )}
            {/* The armed state: a red wash that fills in from the left. */}
            {isArmed && (
              <motion.span
                aria-hidden
                className="absolute inset-0 origin-left rounded-xl bg-[#d23f3f]/[0.1]"
                initial={still ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.35, ease: GLIDE }}
              />
            )}
            <span
              className={cn(
                "relative grid size-4 shrink-0 place-items-center transition-colors",
                it.danger
                  ? ""
                  : on
                    ? "text-[#242423] dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400",
                isDone && "text-[#269a5a]",
              )}
            >
              {Icon && (
                <Icon
                  key={isDone ? "done" : "icon"}
                  className="size-4"
                  active={on || isDone || isArmed}
                />
              )}
            </span>
            {/* Labels roll when a row changes state. */}
            <span className="relative h-5 flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={text}
                  className="block truncate leading-5"
                  initial={still ? false : { y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={still ? undefined : { y: -14, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                >
                  {text}
                </motion.span>
              </AnimatePresence>
            </span>
            {it.items ? (
              <span className="relative grid size-4 place-items-center text-zinc-400">
                <ChevronRightIcon className="size-4" active={on} />
              </span>
            ) : it.shortcut ? (
              <kbd className="relative font-sans text-xs text-zinc-400">
                {it.shortcut}
              </kbd>
            ) : null}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  function ContextMenu(
    {
      items = DEFAULT_ITEMS,
      children,
      label = "File, right click for actions",
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const id = React.useId();
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const subRef = React.useRef<HTMLDivElement>(null);

    const [at, setAt] = React.useState<{
      x: number;
      y: number;
      flipX: boolean;
      flipY: boolean;
    } | null>(null);
    const [hover, setHover] = React.useState<string | null>(null);
    const [subHover, setSubHover] = React.useState<string | null>(null);
    const [sub, setSub] = React.useState<{
      id: string;
      top: number;
      x: number;
      left: boolean;
    } | null>(null);
    const [armed, setArmed] = React.useState<string | null>(null);
    const [doneId, setDoneId] = React.useState<string | null>(null);
    const [toast, setToast] = React.useState<{
      key: number;
      text: string;
    } | null>(null);
    const press = React.useRef(0);

    const close = React.useCallback(() => {
      setAt(null);
      setHover(null);
      setSub(null);
      setSubHover(null);
      setArmed(null);
      setDoneId(null);
    }, []);

    const openAt = (clientX: number, clientY: number) => {
      // The menu is fixed to the viewport (in a portal), so nothing can clip it.
      const x = clientX;
      const y = clientY;
      // Open toward the side with room.
      const h =
        items.filter(isItem).length * 36 +
        (items.length - items.filter(isItem).length) * 9 +
        16;
      setAt({
        x,
        y,
        flipX: clientX + MENU_W + 8 > window.innerWidth,
        flipY: clientY + h + 8 > window.innerHeight,
      });
      setHover(null);
      setSub(null);
      setArmed(null);
      setDoneId(null);
      requestAnimationFrame(() => menuRef.current?.focus());
    };

    // Close on a click outside or when the page scrolls.
    React.useEffect(() => {
      if (!at) return;
      const down = (e: PointerEvent) => {
        if (
          !menuRef.current?.contains(e.target as Node) &&
          !subRef.current?.contains(e.target as Node)
        )
          close();
      };
      document.addEventListener("pointerdown", down);
      window.addEventListener("scroll", close, {
        passive: true,
        capture: true,
      });
      return () => {
        document.removeEventListener("pointerdown", down);
        window.removeEventListener("scroll", close, { capture: true });
      };
    }, [at, close]);

    // The confirmation pill fades after a moment.
    React.useEffect(() => {
      if (!toast) return;
      const t = window.setTimeout(() => setToast(null), 2200);
      return () => window.clearTimeout(t);
    }, [toast]);

    const run = (it: Item) => {
      it.onSelect?.();
      if (it.feedback) setToast({ key: Date.now(), text: it.feedback });
    };

    const pick = (it: Item) => {
      if (it.confirm && armed !== it.id) {
        setArmed(it.id);
        return;
      }
      if (it.done) {
        setDoneId(it.id);
        window.setTimeout(
          () => {
            run(it);
            close();
          },
          still ? 0 : 750,
        );
        return;
      }
      run(it);
      close();
    };

    const openSub = (it: Item, row: HTMLElement) => {
      const m = menuRef.current!.getBoundingClientRect();
      const r = row.getBoundingClientRect();
      const left = m.right + MENU_W + 8 > window.innerWidth;
      const subH = (it.items?.length ?? 0) * 36 + 16;
      const top = Math.max(
        8,
        Math.min(r.top - 6, window.innerHeight - subH - 8),
      );
      setSub({
        id: it.id,
        top,
        x: left ? m.left - MENU_W + 6 : m.right - 6,
        left,
      });
    };

    // Arrow keys move through the rows of whichever panel has focus.
    const keys = (inSub: boolean) => (e: React.KeyboardEvent) => {
      const panel = (inSub ? subRef : menuRef).current;
      if (!panel) return;
      const rows = Array.from(
        panel.querySelectorAll<HTMLElement>("[role=menuitem]"),
      );
      const at = rows.indexOf(document.activeElement as HTMLElement);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const n =
          e.key === "ArrowDown"
            ? (at + 1) % rows.length
            : (at - 1 + rows.length) % rows.length;
        rows[at < 0 ? 0 : n]?.focus();
      } else if (e.key === "ArrowRight" && !inSub && at >= 0) {
        const it = items
          .filter(isItem)
          .find((x) => x.id === rows[at]!.dataset.id);
        if (it?.items) {
          e.preventDefault();
          openSub(it, rows[at]!);
          requestAnimationFrame(() =>
            subRef.current
              ?.querySelector<HTMLElement>("[role=menuitem]")
              ?.focus(),
          );
        }
      } else if ((e.key === "ArrowLeft" || e.key === "Escape") && inSub) {
        e.preventDefault();
        e.stopPropagation();
        const owner = sub?.id;
        setSub(null);
        requestAnimationFrame(() =>
          menuRef.current
            ?.querySelector<HTMLElement>(`[data-id="${owner}"]`)
            ?.focus(),
        );
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
        root.current?.focus();
      } else if (e.key === "Tab") {
        e.preventDefault();
      }
    };

    const subItems = sub
      ? (items.filter(isItem).find((x) => x.id === sub.id)?.items ?? [])
      : [];
    const pos: React.CSSProperties = at
      ? {
          left: Math.max(8, at.flipX ? at.x - MENU_W : at.x),
          ...(at.flipY ? { bottom: window.innerHeight - at.y } : { top: at.y }),
        }
      : {};
    const origin = at
      ? `${at.flipY ? "bottom" : "top"} ${at.flipX ? "right" : "left"}`
      : "top left";

    return (
      <div
        ref={root}
        tabIndex={0}
        role="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={!!at}
        onContextMenu={(e) => {
          e.preventDefault();
          openAt(e.clientX, e.clientY);
        }}
        onKeyDown={(e) => {
          if (at) return;
          if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") {
            e.preventDefault();
            const r = root.current!.getBoundingClientRect();
            openAt(r.left + r.width / 2, r.top + r.height / 2);
          }
        }}
        onPointerDown={(e) => {
          // A long press opens it on touch.
          if (e.pointerType !== "touch") return;
          const { clientX, clientY } = e;
          window.clearTimeout(press.current);
          press.current = window.setTimeout(
            () => openAt(clientX, clientY),
            500,
          );
        }}
        onPointerUp={() => window.clearTimeout(press.current)}
        onPointerCancel={() => window.clearTimeout(press.current)}
        className={cn(
          "relative inline-block select-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4",
          className,
        )}
      >
        {children ?? <FileCard />}

        {typeof document !== "undefined" &&
          createPortal(
            <>
              <AnimatePresence>
                {at && (
                  <Panel
                    key="menu"
                    panelRef={menuRef}
                    items={items}
                    hover={hover}
                    setHover={(h) => {
                      setHover(h);
                      const it = items.filter(isItem).find((x) => x.id === h);
                      if (h && !it?.items) setSub(null);
                      if (h !== armed) setArmed(null);
                    }}
                    armed={armed}
                    doneId={doneId}
                    openSub={sub?.id ?? null}
                    onPick={(it) => pick(it)}
                    onSub={(it, el) => openSub(it, el)}
                    still={still}
                    pillId={`${id}-pill`}
                    style={pos}
                    origin={origin}
                    onKey={keys(false)}
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {at && sub && (
                  <Panel
                    key={`sub-${sub.id}`}
                    panelRef={subRef}
                    items={subItems}
                    hover={subHover}
                    setHover={setSubHover}
                    armed={null}
                    doneId={null}
                    openSub={null}
                    onPick={(it) => pick(it)}
                    onSub={() => {}}
                    still={still}
                    pillId={`${id}-subpill`}
                    style={{ left: sub.x, top: sub.top }}
                    origin={sub.left ? "top right" : "top left"}
                    onKey={keys(true)}
                  />
                )}
              </AnimatePresence>
            </>,
            document.body,
          )}

        {/* A small pill confirms what happened. */}
        <div className="pointer-events-none absolute inset-x-0 top-full mt-4 flex justify-center">
          <AnimatePresence mode="popLayout">
            {toast && (
              <motion.span
                key={toast.key}
                role="status"
                initial={still ? false : { opacity: 0, y: 8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={still ? undefined : { opacity: 0, y: -4, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full bg-[#242423] pl-3 pr-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-[#242423]"
              >
                <CheckIcon className="size-4" active />
                {toast.text}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);