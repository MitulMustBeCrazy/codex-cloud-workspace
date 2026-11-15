"use client";

/**
 * WalletCard, from https://motion-brew.com/components/wallet-card
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
import { animate, AnimatePresence, motion, type MotionValue, type Transition, useAnimate, useAnimation, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, useVelocity, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: arrow-down
const ArrowDownIcon = (() => {
interface ArrowDownIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowDownIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: { d: "m19 12-7 7-7-7", translateY: 0 },
  animate: {
    d: "m19 12-7 7-7-7",
    translateY: [0, -3, 0],
    transition: {
      duration: 0.4,
    },
  },
};

const SECOND_PATH_VARIANTS: Variants = {
  normal: { d: "M12 5v14" },
  animate: {
    d: ["M12 5v14", "M12 5v9", "M12 5v14"],
    transition: {
      duration: 0.4,
    },
  },
};

const ArrowDownIcon = forwardRef<ArrowDownIconHandle, ArrowDownIconProps>(
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
            d="m19 12-7 7-7-7"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M12 5v14"
            variants={SECOND_PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

ArrowDownIcon.displayName = "ArrowDownIcon";
  return ArrowDownIcon;
})();

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

// Animated icon: hand-coins
const HandCoinsIcon = (() => {
interface HandCoinsIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface HandCoinsIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const CIRCLE_VARIANTS: Variants = {
  normal: {
    translateY: 0,
    opacity: 1,
    transition: {
      opacity: { duration: 0.2 },
      type: "spring",
      stiffness: 150,
      damping: 15,
      bounce: 0.8,
    },
  },
  animate: {
    opacity: [0, 1],
    translateY: [-20, 0],
    transition: {
      opacity: { duration: 0.2 },
      type: "spring",
      stiffness: 150,
      damping: 15,
      bounce: 0.8,
    },
  },
};

const SECOND_CIRCLE_VARIANTS: Variants = {
  normal: {
    translateY: 0,
    opacity: 1,
    transition: {
      opacity: { duration: 0.2 },
      delay: 0.15,
      type: "spring",
      stiffness: 150,
      damping: 15,
      bounce: 0.8,
    },
  },
  animate: {
    opacity: [0, 1],
    translateY: [-20, 0],
    transition: {
      opacity: { duration: 0.2 },
      delay: 0.15,
      type: "spring",
      stiffness: 150,
      damping: 15,
      bounce: 0.8,
    },
  },
};

const HandCoinsIcon = forwardRef<HandCoinsIconHandle, HandCoinsIconProps>(
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
          <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
          <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
          <path d="m2 16 6 6" />
          <motion.circle
            animate={controls}
            cx="16"
            cy="9"
            r="2.9"
            variants={CIRCLE_VARIANTS}
          />
          <motion.circle
            animate={controls}
            cx="6"
            cy="5"
            r="3"
            variants={SECOND_CIRCLE_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

HandCoinsIcon.displayName = "HandCoinsIcon";
  return HandCoinsIcon;
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

// Animated icon: refresh-cw
const RefreshCWIcon = (() => {
interface RefreshCCWIconWIcon {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface RefreshCCWIcoWIcon extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const RefreshCWIcon = forwardRef<RefreshCCWIconWIcon, RefreshCCWIcoWIcon>(
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
            animate: { rotate: "50deg" },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </motion.svg>
      </span>
    );
  }
);

RefreshCWIcon.displayName = "RefreshCWIcon";
  return RefreshCWIcon;
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

// WalletCard

/**
 * WalletCard
 *
 * Trigger: in view, then press and hover. A balance card with a currency switch
 * and quick actions. The balance counts up from zero on odometer wheels when the
 * card comes into view (like the chart cards) while the action circles pop in.
 * Picking another currency from the pill rolls the balance on odometer
 * wheels (with a light motion blur) to the converted amount in that currency's
 * own format. Each icon enters from its action's direction, then plays its
 * own animation when its circle is hovered (animated icons from
 * lucide-animated, MIT, in src/icons).
 * Pressing squashes the circle and ripples a ring. "More features" expands to
 * reveal more actions in a cascade. Reduced motion keeps every change instant.
 *
 * Engine: motion/react (odometer wheels on a motion value, a layoutId highlight
 * in the currency list, animated icons, AnimatePresence for the list and panel).
 */

const GLIDE = [0.22, 1, 0.36, 1] as const;
// Currency list open, matched to ActionMenu: a spring panel, then the rows cascade in.
const LIST = {
  hidden: { opacity: 0, scale: 0.94, y: -6 },
  shown: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 520, damping: 34, mass: 0.7, staggerChildren: 0.035, delayChildren: 0.04 },
  },
} as const;
const ROW = {
  hidden: { opacity: 0, y: 6 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.5, 1, 0.89, 1] } },
} as const;
// Gentle ease-out shared with the chart cards' count-up.
const FILL = [0.5, 1, 0.89, 1] as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
// Cap for the odometer's motion blur, in px.
const MAX_BLUR = 0.5;

/**
 * One odometer wheel for a decimal place. The lowest wheel turns continuously;
 * every higher wheel holds still and only ticks over while all the wheels below
 * it read 9 and the lowest is turning, like a mechanical counter. Eleven cells (0 to 9, then 0)
 * let 9 roll smoothly into 0.
 */
function Wheel({
  amount,
  rate,
  place,
  unit,
}: {
  amount: MotionValue<number>;
  rate: MotionValue<number>;
  place: number;
  unit: number;
}) {
  // Wheel position in digits (2.5 means halfway from 2 to 3).
  const position = useTransform(amount, (a) => {
    // Count in units of the lowest wheel to keep the math exact.
    const ticks = Math.max(0, a) / unit + 1e-6;
    const whole = Math.floor(ticks);
    const turning = ticks - whole; // how far the lowest wheel is into its next step
    const span = Math.round(place / unit); // lowest-wheel steps per step of this wheel
    const digit = Math.floor(whole / span) % 10;
    // Roll toward the next digit only while every wheel below reads 9 and the lowest is turning.
    const turn = span === 1 ? turning : whole % span === span - 1 ? turning : 0;
    return digit + turn;
  });
  const y = useTransform(position, (p) => `${(-p * 100) / 11}%`);
  // Motion blur from how fast this wheel's digit changes: the amount's rate over its place value.
  // (Reading the wheel's own position would wrap at 9 to 0 and misjudge fast wheels.)
  const filter = useTransform(rate, (v) => {
    const px = Math.min(MAX_BLUR, (Math.abs(v) / place) * 0.015);
    return px < 0.1 ? "none" : `blur(${px.toFixed(2)}px)`;
  });
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
      <motion.span className="absolute inset-x-0 top-0 flex flex-col" style={{ y, filter }}>
        {[...DIGITS, 0].map((d, i) => (
          <span key={i} className="flex h-[1em] items-center justify-center">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/**
 * The amount as an odometer that counts up through every value from zero,
 * driven by the same motion value as the arc. Whole-number wheels are added as
 * the number grows, so it starts at 0.00 rather than a row of zeros.
 */
function Odometer({
  amount,
  format,
  label,
}: {
  amount: MotionValue<number>;
  format: Intl.NumberFormat;
  label: string;
}) {
  const parts = React.useMemo(() => format.formatToParts(1234.5), [format]);
  const before = parts
    .slice(
      0,
      parts.findIndex((p) => p.type === "integer"),
    )
    .map((p) => p.value)
    .join("");
  // End of the number is its last numeric part (whole numbers have no fraction part).
  const numeric = ["integer", "group", "decimal", "fraction"];
  const lastNum = parts.reduce((last, p, i) => (numeric.includes(p.type) ? i : last), -1);
  const after = parts
    .slice(lastNum + 1)
    .map((p) => p.value)
    .join("");
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const fractionDigits = parts.find((p) => p.type === "fraction")?.value.length ?? 0;

  const rate = useVelocity(amount);
  const wholeDigits = (a: number) => Math.max(1, String(Math.floor(Math.max(0, a) + 1e-6)).length);
  const [count, setCount] = React.useState(() => wholeDigits(amount.get()));
  useMotionValueEvent(amount, "change", (a) => {
    const next = wholeDigits(a);
    if (next !== count) setCount(next);
  });

  const cells: React.ReactNode[] = [];
  for (let k = count - 1; k >= 0; k--) {
    cells.push(
      <motion.span
        key={`w${k}`}
        className="inline-flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Wheel amount={amount} rate={rate} place={10 ** k} unit={10 ** -fractionDigits} />
      </motion.span>,
    );
    if (k > 0 && k % 3 === 0) cells.push(<span key={`g${k}`}>{group}</span>);
  }
  if (fractionDigits > 0) cells.push(<span key="dec">{decimal}</span>);
  for (let f = 1; f <= fractionDigits; f++) {
    cells.push(<Wheel key={`f${f}`} amount={amount} rate={rate} place={10 ** -f} unit={10 ** -fractionDigits} />);
  }

  return (
    <span aria-label={label} className="inline-flex leading-none tabular-nums">
      <span aria-hidden className="inline-flex">
        {before}
        {cells}
        {after}
      </span>
    </span>
  );
}

export interface WalletCurrency {
  /** ISO code, e.g. "EUR". */
  code: string;
  /** Flag or symbol shown in the pill. */
  flag: string;
  /** Full name in the list. */
  name: string;
  /** Units of this currency per one unit of the base balance. */
  rate: number;
  /** Locale used to format it. Default `"en-US"`. */
  locale?: string;
  /** Decimal places to show. Default the currency's usual digits. */
  digits?: number;
}

export interface WalletAction {
  label: string;
  /** Icon from the built-in set. */
  icon: "transfer" | "topup" | "exchange" | "paylater" | "bills" | "savings" | "mobile" | "invest";
  onSelect?: () => void;
}

export interface WalletCardProps {
  /** Balance in the first currency's units. Default `3840.52`. */
  balance?: number;
  /** Currencies in the switch; the first is the base the balance is given in. */
  currencies?: WalletCurrency[];
  /** Actions always shown. Default transfer, top up, exchange, pay later. */
  actions?: WalletAction[];
  /** Extra actions revealed by "More features". Pass an empty list to hide the row. */
  moreActions?: WalletAction[];
  /** Action circle color. Default `"#2a2e3c"`. */
  color?: string;
  /** Length of the count-up and each currency roll, in seconds. Default `1.4`. */
  duration?: number;
  className?: string;
}

const DEFAULT_CURRENCIES: WalletCurrency[] = [
  { code: "USD", flag: "🇺🇸", name: "US dollar", rate: 1, locale: "en-US" },
  { code: "EUR", flag: "🇪🇺", name: "Euro", rate: 0.92, locale: "de-DE" },
  { code: "GBP", flag: "🇬🇧", name: "British pound", rate: 0.79, locale: "en-GB" },
  { code: "IDR", flag: "🇮🇩", name: "Indonesian rupiah", rate: 15947, locale: "id-ID", digits: 0 },
];
const DEFAULT_ACTIONS: WalletAction[] = [
  { label: "Transfer", icon: "transfer" },
  { label: "Top up", icon: "topup" },
  { label: "Exchange", icon: "exchange" },
  { label: "Pay later", icon: "paylater" },
];
const DEFAULT_MORE: WalletAction[] = [
  { label: "Bills", icon: "bills" },
  { label: "Savings", icon: "savings" },
  { label: "Mobile", icon: "mobile" },
  { label: "Invest", icon: "invest" },
];

// Animated icons: each plays its own move when its button is hovered.
const ICONS = {
  transfer: ArrowUpIcon,
  topup: ArrowDownIcon,
  exchange: RefreshCWIcon,
  paylater: CreditCardIcon,
  bills: ReceiptIcon,
  savings: HandCoinsIcon,
  mobile: SmartphoneNfcIcon,
  invest: TrendingUpIcon,
} as const;

// Where each icon enters from when the card appears.
const ENTER: Record<WalletAction["icon"], Record<string, number>> = {
  transfer: { y: 16 },
  topup: { y: -16 },
  exchange: { rotate: -180, scale: 0.6 },
  paylater: { x: -16 },
  bills: { y: 16 },
  savings: { scale: 0.4 },
  mobile: { rotate: -30, scale: 0.6 },
  invest: { x: -14, y: 14 },
};

function ActionButton({
  action,
  color,
  index,
  appear,
}: {
  action: WalletAction;
  color: string;
  index: number;
  /** Seconds to wait before the icon enters, or null to hold it hidden. */
  appear: number | null;
}) {
  const Icon = ICONS[action.icon];
  const [ripples, setRipples] = React.useState<number[]>([]);
  // The entrance runs imperatively so it never fights the hover variants below.
  const [well, animateWell] = useAnimate<HTMLSpanElement>();
  const reduceMotion = useReducedMotion();
  React.useEffect(() => {
    if (appear === null || !well.current) return;
    if (reduceMotion) {
      animateWell(well.current, { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }, { duration: 0 });
      return;
    }
    const from = ENTER[action.icon];
    animateWell(
      well.current,
      {
        opacity: [0, 1],
        x: [from.x ?? 0, 0],
        y: [from.y ?? 0, 0],
        rotate: [from.rotate ?? 0, 0],
        scale: [from.scale ?? 1, 1],
      },
      { duration: 0.5, ease: GLIDE, delay: appear },
    );
  }, [appear, action.icon, animateWell, well, reduceMotion]);
  return (
    <motion.button
      type="button"
      onClick={() => {
        setRipples((r) => [...r, Date.now()]);
        action.onSelect?.();
      }}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      whileTap="press"
      custom={index}
      className="group flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl py-1 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
    >
      <motion.span
        variants={{ rest: { scale: 1 }, hover: { scale: 1.06 }, press: { scale: 0.9 } }}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
        className="relative grid size-11 place-items-center rounded-full text-white"
        style={{ background: color }}
      >
        {/* Press ripple: a ring that grows and fades. */}
        <AnimatePresence>
          {ripples.map((key) => (
            <motion.span
              key={key}
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 0 2px ${color}` }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.55, ease: GLIDE }}
              onAnimationComplete={() => setRipples((r) => r.filter((k) => k !== key))}
            />
          ))}
        </AnimatePresence>
        {/* Icon well: the entrance and hover bounces play here, inside the circle. */}
        <span className="absolute inset-0 grid place-items-center rounded-full">
          <span ref={well} className="flex" style={{ opacity: 0 }}>
            <motion.span whileTap={{ scale: 0.85 }} className="flex">
              <Icon className="size-5" strokeWidth={2.25} />
            </motion.span>
          </span>
        </span>
      </motion.span>
      <span className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">{action.label}</span>
    </motion.button>
  );
}

export const WalletCard = React.forwardRef<HTMLDivElement, WalletCardProps>(function WalletCard(
  {
    balance = 3840.52,
    currencies = DEFAULT_CURRENCIES,
    actions = DEFAULT_ACTIONS,
    moreActions = DEFAULT_MORE,
    color = "#2a2e3c",
    duration = 1.4,
    className,
  },
  forwardedRef,
) {
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement);
  const reduceMotion = !!useReducedMotion();
  const uid = React.useId();
  const [code, setCode] = React.useState(currencies[0]?.code ?? "USD");
  const [listOpen, setListOpen] = React.useState(false);
  const [hoverCode, setHoverCode] = React.useState<string | null>(null);
  const [more, setMore] = React.useState(false);
  // True once the More panel has finished opening, so it can stop clipping.
  const [moreSettled, setMoreSettled] = React.useState(false);
  const pillRef = React.useRef<HTMLButtonElement>(null);

  const currency = currencies.find((c) => c.code === code) ?? currencies[0]!;
  const format = React.useMemo(
    () =>
      new Intl.NumberFormat(currency.locale ?? "en-US", {
        style: "currency",
        currency: currency.code,
        currencyDisplay: "narrowSymbol",
        ...(currency.digits !== undefined
          ? { minimumFractionDigits: currency.digits, maximumFractionDigits: currency.digits }
          : {}),
      }),
    [currency],
  );
  // Round to the digits this currency shows, or the lowest odometer wheel would rest between two numbers.
  const shownDigits = format.resolvedOptions().maximumFractionDigits ?? 2;
  const target = Math.round(balance * currency.rate * 10 ** shownDigits) / 10 ** shownDigits;

  // Counts up from zero when the card comes into view, like the chart cards, then rolls on each switch.
  const inView = useInView(root, { once: true, amount: 0.4 });
  const amount = useMotionValue(0);
  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      amount.set(target);
      return;
    }
    const controls = animate(amount, target, { duration, ease: FILL });
    return () => controls.stop();
  }, [inView, target, duration, reduceMotion, amount]);

  // Close the currency list on a click outside.
  React.useEffect(() => {
    if (!listOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setListOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [listOpen]);

  const pick = (next: string) => {
    setCode(next);
    setListOpen(false);
    pillRef.current?.focus();
  };

  return (
    <div
      ref={root}
      className={cn(
        "w-[384px] max-w-full rounded-3xl bg-white p-5 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.4, ease: GLIDE }}
            className="text-[12px] text-zinc-500 dark:text-zinc-400"
          >
            Total balance
          </motion.p>
          <p className="mt-1.5 text-[32px] font-medium leading-none tracking-tight">
            <Odometer amount={amount} format={format} label={format.format(target)} />
          </p>
        </div>
        <motion.div
          className="relative shrink-0"
          initial={{ opacity: 0, y: -4 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.4, ease: GLIDE, delay: 0.1 }}
        >
          <motion.button
            ref={pillRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={listOpen}
            aria-label={`Currency: ${currency.name}`}
            onClick={() => setListOpen((o) => !o)}
            whileTap={{ scale: 0.96 }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#242423]/6 py-1.5 pl-1.5 pr-3 text-sm font-medium text-[#242423] transition-colors hover:bg-[#242423]/10 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/8 dark:text-zinc-100 dark:hover:bg-white/12"
          >
            <span className="grid size-6 place-items-center rounded-full bg-white text-sm leading-none shadow-sm dark:bg-zinc-800">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={currency.code}
                  initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
                  transition={{ duration: 0.25, ease: GLIDE }}
                >
                  {currency.flag}
                </motion.span>
              </AnimatePresence>
            </span>
            {currency.code}
            <motion.span
              animate={{ rotate: listOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: GLIDE }}
              className="flex"
            >
              <ChevronDownIcon className="size-4" strokeWidth={2.25} />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {listOpen && (
              <motion.ul
                role="listbox"
                aria-label="Currency"
                // Same open as ActionMenu: spring panel, then rows cascade in.
                initial="hidden"
                animate="shown"
                exit={{ opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.15, ease: GLIDE } }}
                variants={LIST}
                style={{ transformOrigin: "top right" }}
                onPointerLeave={() => setHoverCode(null)}
                onKeyDown={(e) => {
                  const i = currencies.findIndex((c) => c.code === (hoverCode ?? code));
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const next =
                      currencies[(i + (e.key === "ArrowDown" ? 1 : -1) + currencies.length) % currencies.length]!;
                    setHoverCode(next.code);
                    (e.currentTarget.querySelector(`[data-code="${next.code}"]`) as HTMLElement | null)?.focus();
                  }
                  if (e.key === "Escape") (e.preventDefault(), setListOpen(false), pillRef.current?.focus());
                }}
                className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl bg-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_40px_-12px_rgba(0,0,0,0.22)] ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10"
              >
                {currencies.map((c) => (
                  <motion.li key={c.code} variants={ROW}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={c.code === code}
                      data-code={c.code}
                      onPointerEnter={() => setHoverCode(c.code)}
                      onFocus={() => setHoverCode(c.code)}
                      onClick={() => pick(c.code)}
                      className="relative flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm outline-none"
                    >
                      {hoverCode === c.code && (
                        <motion.span
                          layoutId={`${uid}-hl`}
                          transition={{ duration: 0.25, ease: GLIDE }}
                          className="absolute inset-0 rounded-xl bg-[#242423]/6 dark:bg-white/8"
                        />
                      )}
                      <span className="relative text-base leading-none">{c.flag}</span>
                      <span className="relative font-medium">{c.code}</span>
                      <span className="relative flex-1 truncate text-zinc-500 dark:text-zinc-400">{c.name}</span>
                      {c.code === code && (
                        <span className="relative size-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                      )}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
      </header>

      <div className="mt-6 rounded-[22px] bg-[#242423]/[0.035] px-3 pb-2 pt-4 dark:bg-white/5">
        <motion.div
          className="grid grid-cols-4 gap-1"
          initial="hidden"
          animate={inView ? "shown" : "hidden"}
          variants={{ shown: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
        >
          {actions.map((action, i) => (
            <motion.div
              key={action.label}
              variants={{ hidden: { opacity: 0, y: 10, scale: 0.9 }, shown: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              <ActionButton action={action} color={color} index={i} appear={inView ? 0.28 + i * 0.06 : null} />
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence initial={false}>
          {more && (
            <motion.div
              key="more"
              // Clip only while the height animates; once open, circles can grow on hover without being cut.
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: GLIDE }}
              onAnimationStart={() => setMoreSettled(false)}
              onAnimationComplete={() => setMoreSettled(more)}
              style={{ overflow: moreSettled ? "visible" : "hidden" }}
            >
              <motion.div
                className="grid grid-cols-4 gap-1 pt-3"
                initial="hidden"
                animate="shown"
                variants={{ shown: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
              >
                {moreActions.map((action, i) => (
                  <motion.div
                    key={action.label}
                    variants={{ hidden: { opacity: 0, y: 8 }, shown: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.3, ease: GLIDE }}
                  >
                    <ActionButton action={action} color={color} index={i} appear={inView ? 0.28 + i * 0.06 : null} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {moreActions.length > 0 && (
          <>
            <div className="-mx-3 mt-3 h-px bg-[#242423]/8 dark:bg-white/10" />
            <button
              type="button"
              aria-expanded={more}
              onClick={() => setMore((m) => !m)}
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-1 rounded-xl py-2 text-[12px] font-medium text-zinc-700 transition-colors hover:text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={more ? "less" : "more"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: GLIDE }}
                >
                  {more ? "Fewer features" : "More features"}
                </motion.span>
              </AnimatePresence>
              <motion.span
                animate={{ rotate: more ? 180 : 0 }}
                transition={{ duration: 0.3, ease: GLIDE }}
                className="flex"
              >
                <ChevronDownIcon className="size-3.5" strokeWidth={2.25} />
              </motion.span>
            </button>
          </>
        )}
      </div>
    </div>
  );
});