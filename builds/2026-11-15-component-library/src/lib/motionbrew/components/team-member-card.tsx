"use client";

/**
 * TeamMemberCard, from https://motion-brew.com/components/team-member-card
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
import { AnimatePresence, motion, useAnimation, useInView, useMotionTemplate, useReducedMotion, useSpring, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: dribbble
const DribbbleIcon = (() => {
interface DribbbleIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface DribbbleIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const CIRCLE_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
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
      duration: 0.6,
      ease: "linear",
      opacity: { duration: 0.1 },
    },
  },
};

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
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
      duration: 0.6,
      ease: "linear",
      opacity: { duration: 0.1 },
    },
  },
};

const DribbbleIcon = forwardRef<DribbbleIconHandle, DribbbleIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const circleControls = useAnimation();
    const path1Controls = useAnimation();
    const path2Controls = useAnimation();
    const path3Controls = useAnimation();

    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => {
          circleControls.start("animate");
          path1Controls.start("animate");
          path2Controls.start("animate");
          path3Controls.start("animate");
        },
        stopAnimation: () => {
          circleControls.start("normal");
          path1Controls.start("normal");
          path2Controls.start("normal");
          path3Controls.start("normal");
        },
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          circleControls.start("animate");
          path1Controls.start("animate");
          path2Controls.start("animate");
          path3Controls.start("animate");
        }
      },
      [
        circleControls,
        onMouseEnter,
        path1Controls,
        path2Controls,
        path3Controls,
      ]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          circleControls.start("normal");
          path1Controls.start("normal");
          path2Controls.start("normal");
          path3Controls.start("normal");
        }
      },
      [
        circleControls,
        path1Controls,
        path2Controls,
        path3Controls,
        onMouseLeave,
      ]
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
          <motion.circle
            animate={circleControls}
            cx="12"
            cy="12"
            initial="normal"
            r="10"
            variants={CIRCLE_VARIANTS}
          />
          <motion.path
            animate={path1Controls}
            d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"
            initial="normal"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={path2Controls}
            d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"
            initial="normal"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={path3Controls}
            d="M8.56 2.75c4.37 6 6 9.42 8 17.72"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

DribbbleIcon.displayName = "DribbbleIcon";
  return DribbbleIcon;
})();

// Animated icon: github
const GithubIcon = (() => {
interface GithubIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface GithubIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const BODY_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    scale: 1,
    transition: {
      duration: 0.3,
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    scale: [0.9, 1],
    transition: {
      duration: 0.4,
    },
  },
};

const TAIL_VARIANTS: Variants = {
  normal: {
    pathLength: 1,
    rotate: 0,
    transition: {
      duration: 0.3,
    },
  },
  draw: {
    pathLength: [0, 1],
    rotate: 0,
    transition: {
      duration: 0.5,
    },
  },
  wag: {
    pathLength: 1,
    rotate: [0, -15, 15, -10, 10, -5, 5],
    transition: {
      duration: 2.5,
      ease: "easeInOut",
      repeat: Number.POSITIVE_INFINITY,
    },
  },
};

const GithubIcon = forwardRef<GithubIconHandle, GithubIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const bodyControls = useAnimation();
    const tailControls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: async () => {
          bodyControls.start("animate");
          await tailControls.start("draw");
          tailControls.start("wag");
        },
        stopAnimation: () => {
          bodyControls.start("normal");
          tailControls.start("normal");
        },
      };
    });

    const handleMouseEnter = useCallback(
      async (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          bodyControls.start("animate");
          await tailControls.start("draw");
          tailControls.start("wag");
        }
      },
      [bodyControls, onMouseEnter, tailControls]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          bodyControls.start("normal");
          tailControls.start("normal");
        }
      },
      [bodyControls, tailControls, onMouseLeave]
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
            animate={bodyControls}
            d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
            initial="normal"
            variants={BODY_VARIANTS}
          />
          <motion.path
            animate={tailControls}
            d="M9 18c-4.51 2-5-2-7-2"
            initial="normal"
            variants={TAIL_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

GithubIcon.displayName = "GithubIcon";
  return GithubIcon;
})();

// Animated icon: linkedin
const LinkedinIcon = (() => {
interface LinkedinIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface LinkedinIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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
    pathOffset: 0,
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
      duration: 0.6,
      ease: "linear",
      opacity: { duration: 0.1 },
    },
  },
};

const RECT_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
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
      duration: 0.6,
      ease: "linear",
      opacity: { duration: 0.1 },
    },
  },
};

const CIRCLE_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
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
      duration: 0.6,
      ease: "linear",
      opacity: { duration: 0.1 },
    },
  },
};

const LinkedinIcon = forwardRef<LinkedinIconHandle, LinkedinIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const pathControls = useAnimation();
    const rectControls = useAnimation();
    const circleControls = useAnimation();

    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => {
          pathControls.start("animate");
          rectControls.start("animate");
          circleControls.start("animate");
        },
        stopAnimation: () => {
          pathControls.start("normal");
          rectControls.start("normal");
          circleControls.start("normal");
        },
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          pathControls.start("animate");
          rectControls.start("animate");
          circleControls.start("animate");
        }
      },
      [circleControls, onMouseEnter, pathControls, rectControls]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          pathControls.start("normal");
          rectControls.start("normal");
          circleControls.start("normal");
        }
      },
      [pathControls, rectControls, circleControls, onMouseLeave]
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
            animate={pathControls}
            d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
            initial="normal"
            variants={PATH_VARIANTS}
          />
          <motion.rect
            animate={rectControls}
            height="12"
            initial="normal"
            variants={RECT_VARIANTS}
            width="4"
            x="2"
            y="9"
          />
          <motion.circle
            animate={circleControls}
            cx="4"
            cy="4"
            initial="normal"
            r="2"
            variants={CIRCLE_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

LinkedinIcon.displayName = "LinkedinIcon";
  return LinkedinIcon;
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

// Animated icon: map-pin
const MapPinIcon = (() => {
interface MapPinIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MapPinIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SVG_VARIANTS: Variants = {
  normal: {
    y: 0,
  },
  animate: {
    y: [0, -5, -3],
    transition: {
      duration: 0.5,
      times: [0, 0.6, 1],
    },
  },
};

const CIRCLE_VARIANTS: Variants = {
  normal: {
    opacity: 1,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [0.5, 0],
    transition: {
      delay: 0.3,
      duration: 0.5,
      opacity: { duration: 0.1, delay: 0.3 },
    },
  },
};

const MapPinIcon = forwardRef<MapPinIconHandle, MapPinIconProps>(
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
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <motion.circle
            animate={controls}
            cx="12"
            cy="10"
            initial="normal"
            r="3"
            variants={CIRCLE_VARIANTS}
          />
        </motion.svg>
      </span>
    );
  }
);

MapPinIcon.displayName = "MapPinIcon";
  return MapPinIcon;
})();

// Animated icon: twitter
const TwitterIcon = (() => {
interface TwitterIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface TwitterIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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
    pathOffset: 0,
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
      duration: 0.6,
      ease: "linear",
      opacity: { duration: 0.1 },
    },
  },
};

const TwitterIcon = forwardRef<TwitterIconHandle, TwitterIconProps>(
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
            d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

TwitterIcon.displayName = "TwitterIcon";
  return TwitterIcon;
})();

// Animated icon: user-check
const UserCheckIcon = (() => {
interface UserCheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface UserCheckIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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

const UserCheckIcon = forwardRef<UserCheckIconHandle, UserCheckIconProps>(
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
            d="M16 11L18 13L22 9"
            initial="normal"
            style={{ transformOrigin: "center" }}
            variants={CHECK_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

UserCheckIcon.displayName = "UserCheckIcon";
  return UserCheckIcon;
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

// TeamMemberCard

/**
 * TeamMemberCard
 *
 * Trigger: hover and press (plus in view). A white card for a person on the
 * team. When it scrolls into view the card rises in, the photo sharpens out of
 * a soft blur and settles from a slight zoom, and the name, role and details
 * follow. White dithered pixels burn up from the bottom of the photo like
 * fire, rising in flickering tongues that thin into finer specks, and die
 * down to a softer glow while the card is hovered so the face shows more. At rest it shows the photo, name, role
 * and Connect; hovering the card
 * (or moving keyboard focus into it, or tapping it on touch) slides the
 * details out from under the header on a soft spring, the location with live
 * local time, the bio and the social links rising in one after another out of
 * a blur, and folds them away again on leave. Over the photo it tilts toward
 * the pointer with a soft shine and a little zoom. Connect rolls to Connected
 * as its icon swaps. The social links are round buttons whose animated icons
 * play on hover while a small ink label pops above them. Reduced motion keeps
 * the states without movement.
 *
 * Engine: motion/react (staggered variants for the entrance, springs for the
 * tilt and shine, AnimatePresence for the labels and the button roll) with
 * animated icons from lucide-animated (MIT), vendored in src/icons.
 */

export type SocialKind = "x" | "linkedin" | "github" | "dribbble" | "email";

export interface SocialLink {
  kind: SocialKind;
  href: string;
  /** Label shown on hover and read to screen readers. Defaults to the network name. */
  label?: string;
}

export interface TeamMemberCardProps {
  name?: string;
  role?: string;
  photo?: string;
  /** City shown with the local time. */
  location?: string;
  /** IANA time zone for the live local time, like `"Europe/Madrid"`. */
  timeZone?: string;
  /** One or two lines about them. */
  bio?: string;
  socials?: SocialLink[];
  /** Dithered pixels burning up the photo like fire, dying down on hover. Default `true`. */
  pixels?: boolean;
  /** Colour of the pixels over the photo. Default `"#ffffff"`. */
  pixelColor?: string;
  /** Pixel grid cell in px. Default `6`. */
  pixelSize?: number;
  /** Pixel shape. Default `"square"`. */
  pixelShape?: "square" | "circle" | "diamond";
  /** Drift and shimmer speed; `2` is twice as fast. Default `1`. */
  pixelSpeed?: number;
  /** How high the flames reach up the photo. Default `1`. */
  pixelArea?: number;
  /** How heavy the flames are: higher fills them with bigger, bolder dots. Default `0.85`. */
  pixelDensity?: number;
  /** Overall strength of the pixels, 0 to 1. Default `1`. */
  pixelOpacity?: number;
  /** How much of the field stays while the card is hovered, 0 to 1. Default `0.6`. */
  pixelHover?: number;
  /** Start as connected. Default `false`. */
  defaultConnected?: boolean;
  onConnect?: (connected: boolean) => void;
  className?: string;
}

const ICONS: Record<SocialKind, React.ComponentType<{ className?: string }>> = {
  x: TwitterIcon,
  linkedin: LinkedinIcon,
  github: GithubIcon,
  dribbble: DribbbleIcon,
  email: MailCheckIcon,
};
const NAMES: Record<SocialKind, string> = {
  x: "X",
  linkedin: "LinkedIn",
  github: "GitHub",
  dribbble: "Dribbble",
  email: "Email",
};

const DEFAULT_SOCIALS: SocialLink[] = [
  { kind: "x", href: "https://x.com" },
  { kind: "linkedin", href: "https://linkedin.com" },
  { kind: "github", href: "https://github.com" },
  { kind: "dribbble", href: "https://dribbble.com" },
  { kind: "email", href: "mailto:hello@example.com" },
];

const GLIDE = [0.22, 1, 0.36, 1] as const;
const TILT = { stiffness: 220, damping: 20, mass: 0.6 };

const CARD: Variants = {
  hidden: { opacity: 0, y: 20 },
  shown: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: GLIDE,
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};
// The details panel opens on a soft spring and its rows rise in one after another.
const PANEL: Variants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { type: "spring", stiffness: 320, damping: 34 },
      opacity: { duration: 0.15 },
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { type: "spring", stiffness: 240, damping: 28 },
      opacity: { duration: 0.2 },
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};
const REVEAL: Variants = {
  closed: {
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
    transition: { duration: 0.15 },
  },
  open: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: GLIDE },
  },
};
const ITEM: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: GLIDE },
  },
};

/** The local time in a zone, ticking each minute. */
function useLocalTime(timeZone: string | undefined) {
  const fmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
        timeZone,
      }),
    [timeZone],
  );
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(t);
  }, []);
  return fmt.format(now);
}

// The pixel field over the photo burns like fire: it sits along the bottom
// edge and rises in flickering tongues of uneven height, the turbulence
// scrolling upward, thinning into finer specks as it climbs. It is drawn
// through an ordered dither as dots in stepped sizes, each shimmering on its
// own beat, the same look as PixelBlast, kept in this file so the card stays
// one file.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => (v + 0.5) / 16,
);
const STEPS = [0, 0, 0.16, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86];
const hash = (x: number, y: number) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const noise = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
};
const band = (lo: number, hi: number, v: number) =>
  smooth(Math.min(1, Math.max(0, (v - lo) / (hi - lo))));

function PhotoPixels({
  color,
  quiet,
  still,
  cell,
  shape,
  speed,
  area,
  density,
  opacity,
  rest,
}: {
  color: string;
  quiet: boolean;
  still: boolean;
  cell: number;
  shape: "square" | "circle" | "diamond";
  speed: number;
  area: number;
  density: number;
  opacity: number;
  /** What is left of the field while the card is hovered. */
  rest: number;
}) {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const quietRef = React.useRef(quiet);
  quietRef.current = quiet;

  React.useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let time = 3;
    // How much of the field shows: full at rest, a few faint specks on hover.
    let amount = quietRef.current ? rest : 1;
    const phases = new Float32Array(4096).map(
      (_, k) => hash(k, 17) * Math.PI * 2,
    );

    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (amount < 0.01) return;
      ctx.fillStyle = color;
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      const t = time * speed;
      // How high the flames reach in each column: a slow, wavering skyline.
      const reach = new Float32Array(cols);
      for (let i = 0; i < cols; i++) {
        const x = i * cell;
        const tongue =
          noise(x * 0.018 + 11, t * 0.45) * 0.7 +
          noise(x * 0.05, t * 0.9 + 4) * 0.3;
        reach[i] = Math.min(1.2, (0.32 + 0.68 * tongue) * area);
      }
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * cell + cell / 2;
          const y = j * cell + cell / 2;
          // 0 at the bottom edge, 1 at the top.
          const up = 1 - y / h;
          // Turbulence that scrolls upward, so the flames lick and rise.
          const n =
            noise(x * 0.03, y * 0.03 + t * 1.4) * 0.6 +
            noise(x * 0.07 + 3, y * 0.07 + t * 2.6) * 0.4;
          // Strongest at the base, fading out by each column's reach.
          const heat = Math.max(0, 1 - up / Math.max(0.05, reach[i]!));
          let v =
            band(0.08, 0.9, Math.pow(heat, 1.3) * (0.4 + 1.1 * n) * density) *
            amount;
          v *=
            0.8 +
            0.2 * Math.sin(t * 2.4 + phases[(j * cols + i) % phases.length]!);
          if (v < 0.04) continue;
          const q = Math.min(
            1,
            v + (BAYER[(j & 3) * 4 + (i & 3)]! - 0.5) * 0.32,
          );
          const step =
            STEPS[Math.min(STEPS.length - 1, Math.floor(q * STEPS.length))]!;
          if (!step) continue;
          ctx.globalAlpha =
            (0.35 + Math.min(1, v) * 0.55) *
            Math.min(1, amount * 1.4) *
            opacity;
          const s = cell * step;
          if (shape === "circle") {
            ctx.beginPath();
            ctx.arc(x, y, s / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (shape === "diamond") {
            const r = s * 0.62;
            ctx.beginPath();
            ctx.moveTo(x, y - r);
            ctx.lineTo(x + r, y);
            ctx.lineTo(x, y + r);
            ctx.lineTo(x - r, y);
            ctx.fill();
          } else ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // The first frame's timestamp can predate `last`; never let the clock run backwards.
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (!visible) return;
      time += dt;
      const target = quietRef.current ? rest : 1;
      amount += (target - amount) * (1 - Math.pow(0.004, dt));
      draw();
    };

    size();
    const ro = new ResizeObserver(() => {
      size();
      if (still) draw();
    });
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => void (visible = !!e?.isIntersecting),
    );
    io.observe(el);
    if (still) draw();
    else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [color, still, cell, shape, speed, area, density, opacity, rest]);

  // Reduced motion: redraw once when the hover state flips.
  React.useEffect(() => {
    if (!still) return;
    const el = canvas.current;
    if (!el) return;
    el.style.opacity = quiet ? "0.15" : "1";
  }, [quiet, still]);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full transition-opacity duration-500"
    />
  );
}

export const TeamMemberCard = React.forwardRef<
  HTMLDivElement,
  TeamMemberCardProps
>(function TeamMemberCard(
  {
    name = "Maya Lindqvist",
    role = "Head of Design",
    photo = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&h=640&fit=crop&crop=faces",
    location = "Stockholm",
    timeZone = "Europe/Stockholm",
    bio = "Leads product design and the design system. Happiest when a prototype finally feels right.",
    socials = DEFAULT_SOCIALS,
    pixels = true,
    pixelColor = "#ffffff",
    pixelSize = 6,
    pixelShape = "square",
    pixelSpeed = 1,
    pixelArea = 1,
    pixelDensity = 0.85,
    pixelOpacity = 1,
    pixelHover = 0.6,
    defaultConnected = false,
    onConnect,
    className,
  },
  ref,
) {
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => root.current!);
  const still = !!useReducedMotion();
  const inView = useInView(root, { once: true, amount: 0.3 });
  const shown = inView || still;
  const time = useLocalTime(timeZone);
  const [connected, setConnected] = React.useState(defaultConnected);
  const [hoverLink, setHoverLink] = React.useState<number | null>(null);
  const [pinHover, setPinHover] = React.useState(false);

  // Photo tilt and shine follow the pointer.
  const rx = useSpring(0, TILT);
  const ry = useSpring(0, TILT);
  const zoom = useSpring(1, TILT);
  const gx = useSpring(50, TILT);
  const gy = useSpring(50, TILT);
  const shine = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.35), transparent 55%)`;
  const onPhotoMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (still) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 12);
    rx.set(-(py - 0.5) * 10);
    gx.set(px * 100);
    gy.set(py * 100);
    zoom.set(1.04);
  };
  const onPhotoLeave = () => {
    rx.set(0);
    ry.set(0);
    zoom.set(1);
    gx.set(50);
    gy.set(50);
  };

  // The details open while the card is hovered or has keyboard focus inside it.
  // Touch has no hover, so a tap on the card toggles them instead.
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [tapped, setTapped] = React.useState(false);
  const open = hovered || focused || tapped;
  const lastPointer = React.useRef("mouse");

  const toggle = () => {
    setConnected((c) => {
      onConnect?.(!c);
      return !c;
    });
  };

  return (
    <motion.div
      ref={root}
      variants={still ? undefined : CARD}
      initial={still ? false : "hidden"}
      animate={shown ? "shown" : "hidden"}
      onPointerEnter={(e) => {
        lastPointer.current = e.pointerType;
        if (e.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") setHovered(false);
      }}
      onPointerDown={(e) => void (lastPointer.current = e.pointerType)}
      onClick={(e) => {
        if (lastPointer.current !== "touch") return;
        if ((e.target as HTMLElement).closest("a, button")) return;
        setTapped((t) => !t);
      }}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node)) setFocused(false);
      }}
      className={cn(
        "w-[320px] max-w-full rounded-3xl bg-white p-3 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      {/* Photo: sharpens in, then tilts toward the pointer with a soft shine. */}
      <div
        style={{ perspective: 800 }}
        onPointerMove={onPhotoMove}
        onPointerLeave={onPhotoLeave}
      >
        <motion.div
          className="relative aspect-square overflow-hidden rounded-[20px] bg-zinc-100 dark:bg-zinc-800"
          style={{ rotateX: rx, rotateY: ry }}
          initial={
            still ? false : { opacity: 0, scale: 1.08, filter: "blur(10px)" }
          }
          animate={
            shown ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined
          }
          transition={{ duration: 0.9, ease: GLIDE }}
        >
          <motion.img
            src={photo}
            alt={name}
            draggable={false}
            className="size-full select-none object-cover"
            style={{ scale: zoom }}
          />
          {pixels && (
            <PhotoPixels
              color={pixelColor}
              quiet={open}
              still={still}
              cell={Math.max(3, pixelSize)}
              shape={pixelShape}
              speed={pixelSpeed}
              area={Math.max(0.3, pixelArea)}
              density={Math.max(0.2, pixelDensity)}
              opacity={Math.min(1, Math.max(0, pixelOpacity))}
              rest={Math.min(1, Math.max(0, pixelHover))}
            />
          )}
          {!still && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: shine }}
            />
          )}
        </motion.div>
      </div>

      <div className="px-2 pb-1 pt-4">
        <motion.div
          variants={ITEM}
          className="flex items-start justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight">
              {name}
            </p>
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
              {role}
            </p>
          </div>
          {/* Connect rolls to Connected as its icon swaps. */}
          <motion.button
            type="button"
            aria-pressed={connected}
            onClick={toggle}
            whileTap={still ? undefined : { scale: 0.95 }}
            className={cn(
              "relative flex h-9 shrink-0 cursor-pointer items-center gap-1.5 overflow-hidden rounded-full pl-3 pr-3.5 text-sm font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
              connected
                ? "bg-[#242423]/[0.06] text-[#242423] dark:bg-white/[0.08] dark:text-zinc-100"
                : "bg-[#242423] text-white dark:bg-zinc-100 dark:text-[#242423]",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={connected ? "on" : "off"}
                className="flex items-center gap-1.5"
                initial={still ? false : { y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={still ? undefined : { y: -16, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
              >
                {connected ? (
                  <UserCheckIcon className="size-4" active={!still} />
                ) : (
                  <UserPlusIcon className="size-4" />
                )}
                {connected ? "Connected" : "Connect"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* The details slide out from under the header while the card is hovered or focused. */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="details"
              variants={still ? undefined : PANEL}
              initial={still ? false : "closed"}
              animate="open"
              exit={still ? undefined : "closed"}
              // Spans the card edge to edge so the divider can too; the padding keeps the text in line.
              className="-mx-5 overflow-hidden px-5"
            >
              {/* Where they are, with their local time ticking live. */}
              <motion.p
                variants={REVEAL}
                onPointerEnter={() => setPinHover(true)}
                onPointerLeave={() => setPinHover(false)}
                className="mt-3 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400"
              >
                <MapPinIcon className="size-4" active={pinHover} />
                {location}
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={time}
                    className="tabular-nums"
                    initial={still ? false : { y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={still ? undefined : { y: -8, opacity: 0 }}
                    transition={{ duration: 0.3, ease: GLIDE }}
                  >
                    {time}
                  </motion.span>
                </AnimatePresence>
                <span>local time</span>
              </motion.p>

              {bio && (
                <motion.p
                  variants={REVEAL}
                  className="mt-3 text-base leading-relaxed text-zinc-500 dark:text-zinc-400"
                >
                  {bio}
                </motion.p>
              )}

              {/* Social links: each icon plays on hover and names itself above. */}
              <motion.div
                variants={REVEAL}
                className="-mx-5 mt-4 flex items-center justify-center gap-2 border-t border-[#242423]/[0.07] px-5 pb-1 pt-4 dark:border-white/10"
              >
                {socials.map((s, i) => {
                  const Icon = ICONS[s.kind];
                  const label = s.label ?? NAMES[s.kind];
                  return (
                    <motion.a
                      key={s.kind + i}
                      href={s.href}
                      target={s.kind === "email" ? undefined : "_blank"}
                      rel="noreferrer"
                      aria-label={label}
                      onPointerEnter={() => setHoverLink(i)}
                      onPointerLeave={() =>
                        setHoverLink((h) => (h === i ? null : h))
                      }
                      onFocus={() => setHoverLink(i)}
                      onBlur={() => setHoverLink((h) => (h === i ? null : h))}
                      whileHover={still ? undefined : { y: -2 }}
                      whileTap={still ? undefined : { scale: 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 22,
                      }}
                      className="relative grid size-10 place-items-center rounded-full bg-[#242423]/[0.06] text-[#242423] outline-none transition-colors hover:bg-[#242423] hover:text-white focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/[0.08] dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-[#242423]"
                    >
                      <Icon className="size-[18px]" />
                      <AnimatePresence>
                        {hoverLink === i && (
                          <motion.span
                            initial={{ opacity: 0, y: 4, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 2, scale: 0.95 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                            className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#242423] px-2.5 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-[#242423]"
                          >
                            {label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.a>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});