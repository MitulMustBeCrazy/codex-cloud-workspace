"use client";

/**
 * PricingCard, from https://motion-brew.com/components/pricing-card
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
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, type Transition, useAnimation, useReducedMotion, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: archive
const ArchiveIcon = (() => {
interface ArchiveIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArchiveIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const RECT_VARIANTS: Variants = {
  normal: {
    translateY: 0,
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 200,
      damping: 25,
    },
  },
  animate: {
    translateY: -1.5,
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 200,
      damping: 25,
    },
  },
};

const PATH_VARIANTS: Variants = {
  normal: { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" },
  animate: { d: "M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11" },
};

const SECONDARY_PATH_VARIANTS: Variants = {
  normal: { d: "M10 12h4" },
  animate: { d: "M10 15h4" },
};

const ArchiveIcon = forwardRef<ArchiveIconHandle, ArchiveIconProps>(
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
            height="5"
            initial="normal"
            rx="1"
            variants={RECT_VARIANTS}
            width="20"
            x="2"
            y="3"
          />
          <motion.path
            animate={controls}
            d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M10 12h4"
            variants={SECONDARY_PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

ArchiveIcon.displayName = "ArchiveIcon";
  return ArchiveIcon;
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

// PricingCard

/**
 * PricingCard
 *
 * Trigger: hover (plus press and in view). One plan as a white card resting in
 * a soft grey shell, like a print in a mount, with a label strip along the top
 * of the shell. Hover or focus the card and the shell warms with a slowly
 * drifting pastel gradient, the card lifts, the strip rolls up from below to a
 * quiet "Recommended for you" with a sparkle, the plan icon plays and the
 * button turns ink; leaving lets it all settle back. A small Yearly switch sits
 * beside the price: flip it and the knob slides, a saving chip pops in, the
 * price rolls like an odometer and the billing line blurs to match. Each
 * feature's icon plays when you point at its row. When the card scrolls into
 * view the shell rises in, the white card settles into it, the plan icon plays
 * once and the features follow in a short cascade. Reduced motion keeps every
 * state without movement.
 *
 * Engine: motion/react (springs for the lift, knob and digit columns, a
 * looping gradient drift, AnimatePresence for the rolling strip and billing
 * line, staggered in view entrances).
 */

/** An icon that takes className, strokeWidth and an `active` flag, like the animated icons. */
export type PricingIcon = React.ComponentType<{
  className?: string;
  strokeWidth?: number;
  active?: boolean;
}>;

export interface PricingFeature {
  title: string;
  /** A short line under the title. */
  detail?: string;
  icon?: PricingIcon;
}

export interface PricingPlan {
  name: string;
  /** The label strip along the top of the shell. */
  label: string;
  /** One line under the name. */
  blurb: string;
  /** Price per month when billed monthly. */
  monthly: number;
  /** Price per month when billed yearly. */
  yearly: number;
  features: PricingFeature[];
  cta: string;
  /** A small line under the button. */
  footnote?: string;
  icon?: PricingIcon;
}

export interface PricingCardProps {
  plan?: PricingPlan;
  /** Billing shown first. Default `"monthly"`. */
  defaultBilling?: "monthly" | "yearly";
  /** What the strip rolls to on hover. Default `"Recommended for you"`. */
  note?: string;
  /** Called by the button. */
  onSelect?: (billing: "monthly" | "yearly") => void;
  className?: string;
}

const SPRING: Transition = { type: "spring", stiffness: 420, damping: 34 };
const KNOB: Transition = { type: "spring", stiffness: 600, damping: 34 };
const ROLL: Transition = { type: "spring", stiffness: 220, damping: 26 };
const EASE = [0.22, 1, 0.36, 1] as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const GLOW =
  "linear-gradient(120deg, #e9d5ff, #c7d7fe, #fbcfe8, #fde7c2, #e9d5ff)";

const DEFAULT_PLAN: PricingPlan = {
  name: "Personal",
  label: "Ideal for solo makers",
  blurb: "Everything you need to ship your own projects.",
  monthly: 12,
  yearly: 9,
  features: [
    {
      title: "Unlimited projects",
      detail: "Start as many as you like.",
      icon: FolderOpenIcon,
    },
    {
      title: "Simple analytics",
      detail: "Visits, sources and top pages.",
      icon: TrendingUpIcon,
    },
    {
      title: "10 GB storage",
      detail: "Room for files and builds.",
      icon: ArchiveIcon,
    },
    {
      title: "Email support",
      detail: "Answers within a working day.",
      icon: MailCheckIcon,
    },
  ],
  cta: "Get started",
  footnote: "14 day free trial, no card needed",
  icon: ZapIcon,
};

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

/** A number written as rolling digit columns, keyed from the right. */
function Rolling({ value, still }: { value: number; still: boolean }) {
  const chars = Array.from(String(Math.round(value)));
  return (
    <span aria-hidden className="inline-flex leading-none tabular-nums">
      {chars.map((ch, i) => (
        <Digit key={chars.length - i} digit={Number(ch)} still={still} />
      ))}
    </span>
  );
}

function Feature({
  feature,
  delay,
  hovered,
  onHover,
  uid,
  still,
}: {
  feature: PricingFeature;
  delay: number;
  hovered: boolean;
  onHover: (on: boolean) => void;
  uid: string;
  still: boolean;
}) {
  const Icon = feature.icon;
  return (
    <motion.li
      initial={still ? { opacity: 0 } : { opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: still ? 0 : 0.45,
        delay: still ? 0 : delay,
        ease: EASE,
      }}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      className="relative -mx-2.5 flex gap-3 rounded-2xl px-2.5 py-2.5"
    >
      {/* A soft highlight glides from row to row under the pointer. */}
      {hovered && (
        <motion.span
          layoutId={`${uid}-row`}
          transition={
            still
              ? { duration: 0 }
              : { type: "spring", stiffness: 500, damping: 38 }
          }
          className="absolute inset-0 rounded-2xl bg-[#242423]/[0.045]"
        />
      )}
      <motion.span
        animate={{ scale: hovered && !still ? 1.12 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
        className="relative mt-0.5 grid size-4 shrink-0 place-items-center text-zinc-600"
      >
        {Icon ? (
          <Icon
            className="size-4"
            strokeWidth={2.25}
            active={hovered && !still ? true : undefined}
          />
        ) : (
          <span className="size-1.5 rounded-full bg-current" />
        )}
      </motion.span>
      <span className="relative min-w-0">
        <span className="block text-sm font-medium leading-5">
          {feature.title}
        </span>
        {feature.detail && (
          <span className="mt-1 block text-xs leading-4 text-zinc-500">
            {feature.detail}
          </span>
        )}
      </span>
    </motion.li>
  );
}

export const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  function PricingCard(
    {
      plan = DEFAULT_PLAN,
      defaultBilling = "monthly",
      note = "Recommended for you",
      onSelect,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const [billing, setBilling] = React.useState<"monthly" | "yearly">(
      defaultBilling,
    );
    const [lit, setLit] = React.useState(false);
    const [intro, setIntro] = React.useState(false);
    const [row, setRow] = React.useState<number | null>(null);
    const uid = React.useId();
    const yearly = billing === "yearly";
    const price = yearly ? plan.yearly : plan.monthly;
    const save =
      plan.monthly > 0 ? Math.round((1 - plan.yearly / plan.monthly) * 100) : 0;
    const Icon = plan.icon;

    return (
      <motion.div
        ref={ref}
        initial={
          still ? { opacity: 0 } : { opacity: 0, y: 32, filter: "blur(8px)" }
        }
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: still ? 0 : 0.75, ease: EASE }}
        onViewportEnter={() => {
          // The plan icon plays once as the card arrives.
          setIntro(true);
          window.setTimeout(() => setIntro(false), 1200);
        }}
        className={cn("w-[360px] max-w-full", className)}
      >
        <motion.div
          tabIndex={0}
          aria-label={`${plan.name}, $${price} a month`}
          onPointerEnter={(e) => e.pointerType === "mouse" && setLit(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setLit(false)}
          onFocus={() => setLit(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node))
              setLit(false);
          }}
          animate={{
            y: lit && !still ? -6 : 0,
            boxShadow: lit
              ? "0 1px 2px rgba(0,0,0,0.04), 0 28px 56px -28px rgba(80,60,160,0.35)"
              : "0 1px 2px rgba(0,0,0,0.03), 0 12px 32px -20px rgba(0,0,0,0.16)",
          }}
          transition={SPRING}
          className="relative overflow-hidden rounded-[30px] bg-[#f1f1ef] p-1.5 text-[#242423] outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          {/* The shell's glow: a pastel gradient drifting slowly, shown on hover. */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: GLOW, backgroundSize: "300% 300%" }}
            initial={false}
            animate={{
              opacity: lit ? 1 : 0,
              backgroundPosition: still
                ? "0% 50%"
                : ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              opacity: { duration: 0.5, ease: EASE },
              backgroundPosition: {
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />

          {/* The strip: the plan's label, rolling up to the note on hover. */}
          <div className="relative flex h-9 items-center overflow-hidden px-4">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={lit ? "note" : "label"}
                initial={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, y: 16, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, y: -16, filter: "blur(4px)" }
                }
                transition={{ duration: 0.35, ease: EASE }}
                className={cn(
                  "flex items-center gap-1.5 truncate text-xs font-medium",
                  lit ? "text-[#242423]" : "text-zinc-500",
                )}
              >
                {lit && (
                  <SparklesIcon
                    className="size-3.5"
                    strokeWidth={2}
                    active={!still}
                  />
                )}
                {lit ? note : plan.label}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* The white card, settling into its shell. */}
          <motion.div
            initial={still ? false : { y: 14, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: still ? 0 : 0.6,
              delay: still ? 0 : 0.15,
              ease: EASE,
            }}
            className="relative rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-14px_rgba(0,0,0,0.16)]"
          >
            <div className="flex items-center gap-3">
              {Icon && (
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-2xl transition-colors duration-300",
                    lit
                      ? "bg-[#242423] text-white"
                      : "bg-[#242423]/[0.06] text-[#242423]",
                  )}
                >
                  <Icon
                    className="size-[18px]"
                    strokeWidth={2}
                    active={(lit || intro) && !still ? true : undefined}
                  />
                </span>
              )}
              <p className="text-lg font-semibold tracking-tight">
                {plan.name}
              </p>
            </div>
            <p className="mt-3 text-sm leading-5 text-zinc-500">{plan.blurb}</p>

            {/* Price, with the billing switch beside it. */}
            <div className="mt-6 flex items-end justify-between gap-3">
              <div>
                <span className="flex items-baseline gap-1">
                  <span className="flex items-start text-[48px] font-semibold leading-none tracking-tight">
                    <span className="mt-1 text-2xl text-zinc-400">$</span>
                    <Rolling value={price} still={still} />
                  </span>
                  <span className="text-sm text-zinc-500">/ month</span>
                </span>
                <span className="relative mt-2 inline-grid h-4 overflow-hidden text-xs text-zinc-500">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={billing}
                      initial={
                        still
                          ? { opacity: 0 }
                          : { opacity: 0, y: 8, filter: "blur(3px)" }
                      }
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={
                        still
                          ? { opacity: 0 }
                          : { opacity: 0, y: -8, filter: "blur(3px)" }
                      }
                      transition={{ duration: 0.3, ease: EASE }}
                      className="leading-4"
                    >
                      {yearly
                        ? `$${plan.yearly * 12} billed once a year`
                        : "Billed monthly, cancel any time"}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={yearly}
                onClick={() => setBilling(yearly ? "monthly" : "yearly")}
                className="mb-5 flex shrink-0 cursor-pointer flex-col items-end gap-1.5 outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <span className="relative inline-grid h-4 overflow-hidden text-xs">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={yearly ? "save" : "plain"}
                      initial={
                        still
                          ? { opacity: 0 }
                          : { opacity: 0, y: 8, scale: 0.9 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        still
                          ? { opacity: 0 }
                          : { opacity: 0, y: -8, scale: 0.9 }
                      }
                      transition={{ duration: 0.25, ease: EASE }}
                      className={cn(
                        "leading-4 font-medium",
                        yearly ? "text-[#269a5a]" : "text-zinc-500",
                      )}
                    >
                      {yearly ? `Saving ${save}%` : "Pay yearly"}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span
                  className={cn(
                    "relative flex h-6 w-10 items-center rounded-full p-0.5 transition-colors duration-300",
                    yearly ? "bg-[#242423]" : "bg-[#242423]/[0.12]",
                  )}
                >
                  <motion.span
                    className="size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
                    animate={{ x: yearly ? 16 : 0 }}
                    transition={still ? { duration: 0 } : KNOB}
                  />
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onSelect?.(billing)}
              className={cn(
                "group/cta mt-5 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium outline-none transition-[background-color,color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-zinc-400 active:scale-[0.98]",
                lit
                  ? "bg-[#242423] text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)]"
                  : "bg-[#242423]/[0.06] text-[#242423] hover:bg-[#242423]/[0.1]",
              )}
            >
              {plan.cta}
              {/* The arrow slides out to the right and back in from the left. */}
              <span className="relative grid size-4 overflow-hidden">
                <ArrowRight
                  className="size-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-5"
                  strokeWidth={2.25}
                />
                <ArrowRight
                  className="absolute inset-0 size-4 -translate-x-5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0"
                  strokeWidth={2.25}
                />
              </span>
            </button>
            {plan.footnote && (
              <p className="mt-2.5 text-center text-xs text-zinc-500">
                {plan.footnote}
              </p>
            )}

            <div className="mb-3 mt-5 h-px bg-[#242423]/[0.06]" />
            <ul
              className="flex flex-col gap-0.5"
              onPointerLeave={() => setRow(null)}
            >
              {plan.features.map((f, k) => (
                <Feature
                  key={f.title}
                  feature={f}
                  delay={0.45 + k * 0.06}
                  hovered={row === k}
                  onHover={(on) => setRow(on ? k : null)}
                  uid={uid}
                  still={still}
                />
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  },
);