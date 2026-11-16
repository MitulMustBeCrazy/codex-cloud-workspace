"use client";

/**
 * AuraCard, from https://motion-brew.com/components/aura-card
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
import { AnimatePresence, motion, type Transition, useAnimation, useInView, useReducedMotion, type Variants } from "motion/react";
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

// Animated icon: credit-card
const CreditCardIcon = (() => {
interface CreditCardIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CreditCardIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const CARD_VARIANTS: Variants = {
  normal: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 18,
    },
  },
  animate: {
    x: [0, -4, 1.5, 0],
    transition: {
      duration: 0.7,
      times: [0, 0.4, 0.75, 1],
      ease: "easeInOut",
    },
  },
};

const CreditCardIcon = forwardRef<CreditCardIconHandle, CreditCardIconProps>(
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
            initial="normal"
            variants={CARD_VARIANTS}
          >
            <rect height="14" rx="2" width="20" x="2" y="5" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </motion.g>
        </svg>
      </span>
    );
  }
);

CreditCardIcon.displayName = "CreditCardIcon";
  return CreditCardIcon;
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

// Animated icon: history
const HistoryIcon = (() => {
interface HistoryIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface HistoryIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const ARROW_TRANSITION: Transition = {
  type: "spring",
  stiffness: 250,
  damping: 25,
};

const ARROW_VARIANTS: Variants = {
  normal: {
    rotate: "0deg",
  },
  animate: {
    rotate: "-50deg",
  },
};

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
    rotate: -360,
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
    originY: "0%",
  },
  animate: {
    rotate: -45,
    originX: "0%",
    originY: "0%",
  },
};

const HistoryIcon = forwardRef<HistoryIconHandle, HistoryIconProps>(
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
            transition={ARROW_TRANSITION}
            variants={ARROW_VARIANTS}
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </motion.g>
          <motion.line
            animate={controls}
            initial="normal"
            transition={HAND_TRANSITION}
            variants={HAND_VARIANTS}
            x1="12"
            x2="12"
            y1="12"
            y2="7"
          />
          <motion.line
            animate={controls}
            initial="normal"
            transition={MINUTE_HAND_TRANSITION}
            variants={MINUTE_HAND_VARIANTS}
            x1="12"
            x2="16"
            y1="12"
            y2="14"
          />
        </svg>
      </span>
    );
  }
);

HistoryIcon.displayName = "HistoryIcon";
  return HistoryIcon;
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

// Animated icon: search
const SearchIcon = (() => {
interface SearchIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SearchIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SearchIcon = forwardRef<SearchIconHandle, SearchIconProps>(
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
            duration: 1,
            bounce: 0.3,
          }}
          variants={{
            normal: { x: 0, y: 0 },
            animate: {
              x: [0, 0, -3, 0],
              y: [0, -4, 0, 0],
            },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </motion.svg>
      </span>
    );
  }
);

SearchIcon.displayName = "SearchIcon";
  return SearchIcon;
})();

// Animated icon: user-plus
const UserPlusIcon = (() => {
interface UserPlusIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface UserPlusIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PLUS_VARIANTS: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  animate: {
    scale: [0, 1.15, 1],
    rotate: [-90, 0, 0],
    opacity: [0, 1, 1],
    transition: {
      delay: 0.25,
      duration: 0.45,
      ease: "easeOut",
      times: [0, 0.7, 1],
    },
  },
};

const UserPlusIcon = forwardRef<UserPlusIconHandle, UserPlusIconProps>(
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
          <motion.g
            animate={controls}
            initial="normal"
            style={{ transformOrigin: "19px 11px" }}
            variants={PLUS_VARIANTS}
          >
            <line x1="19" x2="19" y1="8" y2="14" />
            <line x1="22" x2="16" y1="11" y2="11" />
          </motion.g>
        </svg>
      </span>
    );
  }
);

UserPlusIcon.displayName = "UserPlusIcon";
  return UserPlusIcon;
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

// Animated icon: zap
const ZapIcon = (() => {
interface ZapHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ZapProps extends React.HTMLAttributes<HTMLSpanElement> {
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
    transition: {
      duration: 0.6,
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

const ZapIcon = forwardRef<ZapHandle, ZapProps>(
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
            d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

ZapIcon.displayName = "ZapIcon";
  return ZapIcon;
})();

// AuraCard

/**
 * AuraCard
 *
 * Trigger: in view and timeline, plus hover and press. A feature card on a
 * live two colour gradient: a main pool flows in the lower left and a second
 * colour drifts in from the lower right, blending into it under a moving
 * film grain that sits on the colour only while the top stays clear for the title and copy. The pool leans
 * toward the pointer, soft rings ripple out from it, and a press anywhere on
 * the card sends a wave through the colour. Four controls shape it: grain,
 * noise (how much the flow warps), speed and ripple. In front, two glass
 * keycaps press ⌘ and K, and a frosted command palette plays a loop: a
 * command types itself, matching results blur in with the typed letters in
 * bold, a highlight glides down the rows as the arrow key flashes, and Enter
 * runs the chosen row: its icon plays, the return key turns into a check and
 * the gradient ripples out from the row. Pointing at the palette pauses the
 * loop so you can move the highlight yourself and click a row to run it.
 * Everything pauses off screen and in a hidden tab. Reduced motion keeps a
 * still frame of the gradient and the first command.
 *
 * Engine: motion/react (entrances, keycaps, the palette loop, a layoutId
 * highlight) and a WebGL fragment shader (domain warped noise, ripples and
 * grain), drawn on requestAnimationFrame only while the card is visible.
 */

export type AuraCommandIcon =
  | "card"
  | "history"
  | "download"
  | "deploy"
  | "undo"
  | "file"
  | "invite"
  | "team"
  | "mail";

export interface AuraCommand {
  label: string;
  icon: AuraCommandIcon;
  /** Shortcut shown on the right while the row is not highlighted, like "G B". */
  hint?: string;
}

export interface AuraScene {
  /** What gets typed into the palette. */
  query: string;
  /** Results shown under it, up to four. */
  results: AuraCommand[];
  /** Which result the loop runs. Default the first. */
  pick?: number;
}

export interface AuraCardProps {
  /** Card title. Default `"Everything, one keystroke away"`. */
  title?: React.ReactNode;
  /** Line under the title. */
  description?: React.ReactNode;
  /** The palette plays these one after another. */
  scenes?: AuraScene[];
  /** Keys on the two keycaps. Default `["⌘", "K"]`. */
  keys?: [string, string];
  /** Four colors for the main pool in the lower left, deepest first. Default a blue to periwinkle ramp. */
  colors?: [string, string, string, string];
  /** The second pool's color, drifting in the lower right and blending into the first. Default `"#ff86c8"`. */
  accent?: string;
  /** Film grain over the gradient, 0 to 3. Default `1`. */
  grain?: number;
  /** How much the flow warps, 0 to 1. Default `0.5`. */
  noise?: number;
  /** Flow speed, 0 (still) to 2. Default `0.6`. */
  speed?: number;
  /** Strength of the rings and press waves, 0 to 1. Default `0.5`. */
  ripple?: number;
  className?: string;
}

const DEFAULT_SCENES: AuraScene[] = [
  {
    query: "billing",
    results: [
      { label: "Open billing settings", icon: "card", hint: "G B" },
      { label: "Billing history", icon: "history" },
      { label: "Download invoices", icon: "download" },
    ],
    pick: 0,
  },
  {
    query: "deploy",
    results: [
      { label: "Deploy to production", icon: "deploy", hint: "D P" },
      { label: "Roll back last deploy", icon: "undo" },
      { label: "Deploy logs", icon: "file" },
    ],
    pick: 1,
  },
  {
    query: "invite",
    results: [
      { label: "Invite a teammate", icon: "invite", hint: "I" },
      { label: "Team members", icon: "team" },
      { label: "Pending invites", icon: "mail" },
    ],
    pick: 0,
  },
];

const ICONS: Record<
  AuraCommandIcon,
  React.ComponentType<{ active?: boolean; className?: string }>
> = {
  card: CreditCardIcon,
  history: HistoryIcon,
  download: DownloadIcon,
  deploy: ZapIcon,
  undo: RotateCCWIcon,
  file: FileTextIcon,
  invite: UserPlusIcon,
  team: UsersIcon,
  mail: MailCheckIcon,
};

const DEFAULT_COLORS: [string, string, string, string] = [
  "#1f3bff",
  "#4f7cff",
  "#9db8ff",
  "#dfe7ff",
];

const GLIDE = [0.22, 1, 0.36, 1] as const;
const PILL = { type: "spring", stiffness: 520, damping: 40 } as const;

const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Domain warped value noise makes the flow; rings around the pool and a
// travelling wave from each press push the warp; grain is fresh every frame.
const FRAGMENT = `precision highp float;
uniform vec2 r;uniform float t;uniform float now;uniform float warp;uniform float grain;uniform float ripple;
uniform vec2 m;uniform vec3 rp;uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform vec3 ca;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*vnoise(p);p*=2.03;a*=.5;}return v;}
void main(){
vec2 uv=gl_FragCoord.xy/r;float asp=r.x/r.y;vec2 p=vec2(uv.x*asp,uv.y);
vec2 home=vec2(.08*asp,-.06);vec2 anchor=mix(home,vec2(m.x*asp,m.y),.28);
float s=1.1+warp*1.8;
vec2 q=vec2(fbm(p*s+vec2(0.,t*.12)),fbm(p*s+vec2(5.2,1.3)-vec2(t*.1,0.)));
vec2 w=p+(q-.5)*(.18+warp*.95);
vec2 rpos=vec2(rp.x*asp,rp.y);float age=now-rp.z;float dr=length(p-rpos);
float wave=rp.z<0.?0.:exp(-pow((dr-age*.75)*9.,2.))*exp(-age*1.3)*ripple;
w+=normalize(p-rpos+1e-4)*wave*.09;
float d=length(w-anchor);
float rings=sin(d*26.-t*2.4)*ripple*.045*exp(-d*1.1);
float f=1.-smoothstep(.0,.82,d+rings+(fbm(w*2.+t*.05)-.5)*.22);
vec3 col=mix(c3,c2,smoothstep(.15,.45,f));col=mix(col,c1,smoothstep(.4,.7,f));col=mix(col,c0,smoothstep(.65,.95,f));
col=mix(vec3(1.),col,smoothstep(.06,.5,f));
vec2 a2=vec2(.92*asp,.1)+vec2(sin(t*.31),cos(t*.23))*.07+(vec2(m.x*asp,m.y)-home)*.1;
float f2=1.-smoothstep(.0,.7,length(w-a2)+(fbm(w*2.4-t*.06)-.5)*.3);
vec3 acc=mix(mix(ca,vec3(1.),.55),ca,smoothstep(.35,.9,f2));
col=mix(col,acc,smoothstep(.05,.6,f2)*(1.-.45*smoothstep(.6,.95,f)));
col+=(wave*.25+max(rings,0.)*1.2)*f;
float g=hash(gl_FragCoord.xy+fract(now*7.31)*vec2(97.,57.))-.5;
// Grain only where there is colour: the white of the card stays clean.
float cover=max(smoothstep(.06,.5,f),smoothstep(.05,.6,f2));
col+=g*grain*.22*cover;
gl_FragColor=vec4(col,1.);}`;

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

const HOME = { x: 0.12, y: 0.02 };

/** A glass keycap that presses down onto its own darker base. */
function Keycap({
  label,
  down,
  shown,
  delay,
  still,
}: {
  label: string;
  down: boolean;
  shown: boolean;
  delay: number;
  still: boolean;
}) {
  return (
    <motion.span
      initial={still ? false : { opacity: 0, y: 12, scale: 0.85 }}
      animate={shown ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 22,
        delay: still ? 0 : delay,
      }}
      className="relative block size-14"
    >
      <span className="absolute inset-0 translate-y-1 rounded-2xl bg-[#242423]/[0.12]" />
      <motion.span
        animate={{ y: down ? 4 : 0 }}
        transition={
          down
            ? { duration: 0.08 }
            : { type: "spring", stiffness: 600, damping: 18 }
        }
        className="relative grid size-14 place-items-center rounded-2xl bg-white/85 text-xl font-medium text-[#242423] shadow-[inset_0_-2px_0_rgba(36,36,35,0.06)] ring-1 ring-white/80 backdrop-blur-md"
      >
        {label}
      </motion.span>
    </motion.span>
  );
}

/** The label with the typed letters set in bold ink. */
function Match({ label, query }: { label: string; query: string }) {
  const at = query ? label.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) return <>{label}</>;
  return (
    <>
      {label.slice(0, at)}
      <span className="font-semibold text-[#242423]">
        {label.slice(at, at + query.length)}
      </span>
      {label.slice(at + query.length)}
    </>
  );
}

const Kbd = ({
  children,
  lit,
}: {
  children: React.ReactNode;
  lit?: boolean;
}) => (
  <motion.span
    animate={{
      scale: lit ? 0.88 : 1,
      backgroundColor: lit ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)",
    }}
    transition={{ type: "spring", stiffness: 600, damping: 22 }}
    className="grid h-5 min-w-5 place-items-center rounded-md px-1 text-xs font-medium text-zinc-600 shadow-[0_1px_0_rgba(36,36,35,0.08)]"
  >
    {children}
  </motion.span>
);

export const AuraCard = React.forwardRef<HTMLDivElement, AuraCardProps>(
  function AuraCard(
    {
      title = "Everything, one keystroke away",
      description = "Press ⌘K from anywhere, type a few letters and run any action without leaving the keyboard.",
      scenes = DEFAULT_SCENES,
      keys = ["⌘", "K"],
      colors = DEFAULT_COLORS,
      accent = "#ff86c8",
      grain = 1,
      noise = 0.5,
      speed = 0.6,
      ripple = 0.5,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const id = React.useId();
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const canvas = React.useRef<HTMLCanvasElement>(null);
    const rows = React.useRef<(HTMLDivElement | null)[]>([]);
    const seen = useInView(root, { once: true, amount: 0.3 });
    const visible = useInView(root, { amount: 0.05 });
    const shown = seen || still;

    // The draw loop reads the latest settings without restarting.
    const params = React.useRef({
      grain,
      noise,
      speed,
      ripple,
      colors,
      accent,
    });
    params.current = { grain, noise, speed, ripple, colors, accent };
    const pointer = React.useRef({
      x: HOME.x,
      y: HOME.y,
      tx: HOME.x,
      ty: HOME.y,
    });
    const wave = React.useRef({ x: 0, y: 0, at: -1 });
    const clock = React.useRef({ t: 0, now: 0, last: 0 });

    /** Start a wave at a point in the card, in pixels from its top left. */
    const pulse = React.useCallback((x: number, y: number) => {
      const el = root.current;
      if (!el) return;
      wave.current = {
        x: x / el.clientWidth,
        y: 1 - y / el.clientHeight,
        at: clock.current.now,
      };
    }, []);
    const pulseFrom = React.useCallback(
      (el: HTMLElement | null | undefined) => {
        const box = root.current?.getBoundingClientRect();
        if (!el || !box) return;
        const r = el.getBoundingClientRect();
        pulse(r.left - box.left + r.width / 2, r.top - box.top + r.height / 2);
      },
      [pulse],
    );

    // The shader. One loop, only while the card is on screen and the tab is visible.
    React.useEffect(() => {
      const el = canvas.current;
      if (!el) return;
      const gl = el.getContext("webgl", {
        antialias: false,
        premultipliedAlpha: false,
      });
      if (!gl) {
        const c = params.current.colors;
        el.style.background = `radial-gradient(70% 55% at 95% 95%, ${params.current.accent}, transparent 70%), radial-gradient(120% 90% at 10% 100%, ${c[0]}, ${c[1]} 30%, ${c[2]} 50%, #fff 75%)`;
        return;
      }
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
      const at = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(at);
      gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
      const u = (n: string) => gl.getUniformLocation(prog, n);
      const U = {
        r: u("r"),
        t: u("t"),
        now: u("now"),
        warp: u("warp"),
        grain: u("grain"),
        ripple: u("ripple"),
        m: u("m"),
        rp: u("rp"),
        c0: u("c0"),
        c1: u("c1"),
        c2: u("c2"),
        c3: u("c3"),
        ca: u("ca"),
      };

      const draw = () => {
        const dpr = Math.min(1.5, window.devicePixelRatio || 1);
        const w = Math.max(1, Math.round(el.clientWidth * dpr));
        const h = Math.max(1, Math.round(el.clientHeight * dpr));
        if (el.width !== w || el.height !== h) {
          el.width = w;
          el.height = h;
        }
        const p = params.current;
        const ptr = pointer.current;
        const wv = wave.current;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(U.r, w, h);
        gl.uniform1f(U.t, clock.current.t);
        gl.uniform1f(U.now, clock.current.now);
        gl.uniform1f(U.warp, p.noise);
        gl.uniform1f(U.grain, p.grain);
        gl.uniform1f(U.ripple, p.ripple);
        gl.uniform2f(U.m, ptr.x, ptr.y);
        gl.uniform3f(U.rp, wv.x, wv.y, wv.at);
        gl.uniform3fv(U.c0, rgb(p.colors[0]));
        gl.uniform3fv(U.c1, rgb(p.colors[1]));
        gl.uniform3fv(U.c2, rgb(p.colors[2]));
        gl.uniform3fv(U.c3, rgb(p.colors[3]));
        gl.uniform3fv(U.ca, rgb(p.accent));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };

      if (still) {
        clock.current.t = 3;
        draw();
        return;
      }
      if (!visible) {
        draw();
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
        // The pool eases toward the pointer.
        const ptr = pointer.current;
        const k = 1 - Math.exp(-dt * 3);
        ptr.x += (ptr.tx - ptr.x) * k;
        ptr.y += (ptr.ty - ptr.y) * k;
        draw();
      };
      raf = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(raf);
    }, [still, visible]);

    // The palette loop: keycaps, typing, results, arrow down to the pick, run, clear.
    const [scene, setScene] = React.useState(0);
    const [typed, setTyped] = React.useState(
      still ? (scenes[0]?.query ?? "") : "",
    );
    const [listed, setListed] = React.useState(still);
    const [active, setActive] = React.useState(
      still ? (scenes[0]?.pick ?? 0) : 0,
    );
    const [ran, setRan] = React.useState(false);
    const [key, setKey] = React.useState<"cmd" | "k" | "down" | "enter" | null>(
      null,
    );
    const [paused, setPaused] = React.useState(false);
    const current = scenes[scene % Math.max(1, scenes.length)];

    const run = React.useCallback(
      (i: number) => {
        setActive(i);
        setRan(true);
        pulseFrom(rows.current[i]);
      },
      [pulseFrom],
    );

    React.useEffect(() => {
      if (still || !seen || !visible || paused || !current) return;
      const timers: number[] = [];
      let at = 0;
      const after = (ms: number, fn: () => void) => {
        at += ms;
        timers.push(window.setTimeout(fn, at));
      };
      setTyped("");
      setListed(false);
      setRan(false);
      setActive(0);
      after(400, () => setKey("cmd"));
      after(140, () => setKey("k"));
      after(160, () => setKey(null));
      for (let i = 1; i <= current.query.length; i++)
        after(i === 1 ? 300 : 70 + Math.random() * 60, () => {
          setTyped(current.query.slice(0, i));
          if (i === 2) setListed(true);
        });
      after(10, () => setListed(true));
      const pick = Math.min(current.pick ?? 0, current.results.length - 1);
      for (let i = 1; i <= pick; i++) {
        after(i === 1 ? 650 : 420, () => {
          setKey("down");
          setActive(i);
        });
        after(120, () => setKey(null));
      }
      after(700, () => {
        setKey("enter");
        run(pick);
      });
      after(140, () => setKey(null));
      after(1300, () => setListed(false));
      after(450, () => setScene((n) => (n + 1) % scenes.length));
      return () => timers.forEach((t) => window.clearTimeout(t));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scene, seen, visible, still, paused]);

    return (
      <motion.div
        ref={root}
        initial={still ? false : { opacity: 0, y: 18 }}
        animate={shown ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: GLIDE }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          pointer.current.tx = (e.clientX - r.left) / r.width;
          pointer.current.ty = 1 - (e.clientY - r.top) / r.height;
        }}
        onPointerLeave={() => {
          pointer.current.tx = HOME.x;
          pointer.current.ty = HOME.y;
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[data-palette]")) return;
          const r = e.currentTarget.getBoundingClientRect();
          pulse(e.clientX - r.left, e.clientY - r.top);
        }}
        className={cn(
          "relative isolate h-[480px] w-[400px] max-w-full overflow-hidden rounded-[32px] bg-white text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]",
          className,
        )}
      >
        <canvas
          ref={canvas}
          aria-hidden
          className="absolute inset-0 -z-10 size-full"
        />

        <div className="px-7 pt-7">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-2 max-w-[300px] text-pretty text-sm leading-relaxed text-zinc-600">
            {description}
          </p>
        </div>

        {/* Two keycaps that press at the start of every command. */}
        <div aria-hidden className="mt-7 flex justify-center gap-2.5">
          <Keycap
            label={keys[0]}
            down={key === "cmd" || key === "k"}
            shown={shown}
            delay={0.35}
            still={still}
          />
          <Keycap
            label={keys[1]}
            down={key === "k"}
            shown={shown}
            delay={0.43}
            still={still}
          />
        </div>

        {/* The frosted command palette. */}
        <motion.div
          data-palette
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          initial={still ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={
            shown
              ? {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  scale: key === "k" ? 0.985 : 1,
                }
              : undefined
          }
          transition={{
            duration: 0.6,
            ease: GLIDE,
            delay: still || seen ? 0 : 0.2,
            scale: { type: "spring", stiffness: 500, damping: 20 },
          }}
          className="absolute inset-x-5 bottom-5 rounded-3xl bg-white/60 p-2 shadow-[0_12px_40px_-16px_rgba(20,30,90,0.35)] ring-1 ring-white/70 backdrop-blur-xl"
        >
          <span className="sr-only" aria-live="polite">
            {current ? `Command palette: ${current.query}` : ""}
          </span>
          {/* Search row */}
          <div
            aria-hidden
            className="flex h-12 items-center gap-2.5 rounded-2xl bg-white/85 px-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          >
            <SearchIcon
              className="size-4 text-zinc-400"
              active={typed.length > 0 && typed.length < 3}
            />
            <span className="flex min-w-0 flex-1 items-center text-sm text-[#242423]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={typed ? `q-${scene}` : "empty"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.2 }}
                  className={cn("truncate", !typed && "text-zinc-400")}
                >
                  {typed || "Type a command or search"}
                </motion.span>
              </AnimatePresence>
              {!still && typed && !ran && (
                <motion.span
                  className="ml-px inline-block h-4 w-px bg-[#242423]"
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    times: [0, 0.5, 0.5, 1],
                  }}
                />
              )}
            </span>
            <span className="flex gap-1">
              <Kbd lit={key === "cmd" || key === "k"}>{keys[0]}</Kbd>
              <Kbd lit={key === "k"}>{keys[1]}</Kbd>
            </span>
          </div>

          {/* Results */}
          <div className="relative mt-1.5 h-[132px]">
            <AnimatePresence>
              {listed && current && (
                <motion.div
                  key={`list-${scene}`}
                  className="absolute inset-0 flex flex-col gap-0.5"
                  exit={{
                    opacity: 0,
                    filter: "blur(6px)",
                    y: -4,
                    transition: { duration: 0.3 },
                  }}
                >
                  {current.results.slice(0, 3).map((res, i) => {
                    const Icon = ICONS[res.icon];
                    const on = active === i;
                    return (
                      <motion.div
                        key={res.label}
                        ref={(el) => {
                          rows.current[i] = el;
                        }}
                        role="button"
                        tabIndex={-1}
                        onPointerEnter={() => {
                          setActive(i);
                          setRan(false);
                        }}
                        onClick={() => run(i)}
                        initial={
                          still
                            ? false
                            : { opacity: 0, y: 6, filter: "blur(4px)" }
                        }
                        animate={{
                          opacity: 1,
                          y: 0,
                          filter: "blur(0px)",
                          scale: on && ran ? [1, 0.97, 1] : 1,
                        }}
                        transition={{
                          duration: 0.3,
                          ease: GLIDE,
                          delay: still ? 0 : i * 0.05,
                        }}
                        className="relative flex h-10 cursor-pointer items-center gap-3 rounded-xl px-2 text-sm"
                      >
                        {on && (
                          <motion.span
                            layoutId={`${id}-row`}
                            className="absolute inset-0 rounded-xl bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                            transition={still ? { duration: 0 } : PILL}
                          />
                        )}
                        <span
                          className={cn(
                            "relative grid size-7 place-items-center rounded-lg transition-colors",
                            on ? "bg-white" : "bg-white/60 text-zinc-500",
                          )}
                          style={on ? { color: colors[0] } : undefined}
                        >
                          <Icon className="size-4" active={on && ran} />
                        </span>
                        <span
                          className={cn(
                            "relative min-w-0 flex-1 truncate",
                            on ? "text-[#242423]" : "text-zinc-600",
                          )}
                        >
                          <Match label={res.label} query={typed} />
                        </span>
                        <span className="relative">
                          {on ? (
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span
                                key={ran ? "done" : "enter"}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 600,
                                  damping: 26,
                                }}
                                className="grid"
                              >
                                {ran ? (
                                  <span className="grid size-5 place-items-center rounded-md bg-[#269a5a] text-white">
                                    <CheckIcon className="size-3.5" active />
                                  </span>
                                ) : (
                                  <Kbd lit={key === "enter"}>↵</Kbd>
                                )}
                              </motion.span>
                            </AnimatePresence>
                          ) : res.hint ? (
                            <span className="text-xs tracking-wide text-zinc-400">
                              {res.hint}
                            </span>
                          ) : null}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div
            aria-hidden
            className="mt-1 flex items-center justify-between px-2 pb-1 pt-1 text-xs text-zinc-500"
          >
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd lit={key === "down"}>↓</Kbd>
              to move
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd lit={key === "enter"}>↵</Kbd>
              to run
            </span>
          </div>
        </motion.div>
      </motion.div>
    );
  },
);