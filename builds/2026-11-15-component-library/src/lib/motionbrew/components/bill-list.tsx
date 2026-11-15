"use client";

/**
 * BillList, from https://motion-brew.com/components/bill-list
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
import { animate, AnimatePresence, LayoutGroup, motion, type Transition, useAnimation, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, type Variants } from "motion/react";
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

// Animated icon: cloud-upload
const CloudUploadIcon = (() => {
interface CloudUploadIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CloudUploadIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const CLOUD_VARIANTS: Variants = {
  initial: { y: -2 },
  active: { y: 0 },
};

const CloudUploadIcon = forwardRef<CloudUploadIconHandle, CloudUploadIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("initial"),
        stopAnimation: () => controls.start("active"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("initial");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("active");
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
          <path d="M4.2 15.1A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.2" />
          <motion.g
            animate={controls}
            transition={{
              duration: 0.3,
              ease: [0.68, -0.6, 0.32, 1.6],
            }}
            variants={CLOUD_VARIANTS}
          >
            <path d="M12 13v8" />
            <path d="m8 17 4-4 4 4" />
          </motion.g>
        </svg>
      </span>
    );
  }
);

CloudUploadIcon.displayName = "CloudUploadIcon";
  return CloudUploadIcon;
})();

// Animated icon: heart
const HeartIcon = (() => {
interface HeartIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface HeartIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const HeartIcon = forwardRef<HeartIconHandle, HeartIconProps>(
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
            duration: 0.45,
            repeat: 2,
          }}
          variants={{
            normal: { scale: 1 },
            animate: { scale: [1, 1.08, 1] },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </motion.svg>
      </span>
    );
  }
);

HeartIcon.displayName = "HeartIcon";
  return HeartIcon;
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

// Animated icon: wifi
const WifiIcon = (() => {
interface WifiIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface WifiIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const WIFI_LEVELS = [
  { d: "M12 20h.01", initialOpacity: 1, delay: 0 },
  { d: "M8.5 16.429a5 5 0 0 1 7 0", initialOpacity: 1, delay: 0.1 },
  { d: "M5 12.859a10 10 0 0 1 14 0", initialOpacity: 1, delay: 0.2 },
  { d: "M2 8.82a15 15 0 0 1 20 0", initialOpacity: 1, delay: 0.3 },
];

const WifiIcon = forwardRef<WifiIconHandle, WifiIconProps>(
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
        stopAnimation: () => controls.start("fadeIn"),
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
        controls.start("fadeIn");
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
          {WIFI_LEVELS.map((level, index) => (
            <motion.path
              animate={controls}
              d={level.d}
              initial={{ opacity: level.initialOpacity }}
              key={index}
              variants={{
                fadeOut: {
                  opacity: index === 0 ? 1 : 0,
                  transition: { duration: 0.2 },
                },
                fadeIn: {
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: level.delay,
                  },
                },
              }}
            />
          ))}
        </svg>
      </span>
    );
  }
);

WifiIcon.displayName = "WifiIcon";
  return WifiIcon;
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

// BillList

/**
 * BillList
 *
 * Trigger: in view, then hover, press and keys. A white card of upcoming bills
 * and subscriptions. When it scrolls into view it builds one piece at a time:
 * the title, the amount due counting up, the filter pill popping in, then each
 * row on its own beat, its icon disc and amount landing just after it. Each row shows an icon in a soft
 * disc, when it is due (an amber chip with a breathing dot when it is close)
 * and its amount. Hover or focus a row and it tints, its icon plays and the
 * amount gives way to a Pay button; press it and a spinner turns into a check,
 * the row turns paid where it stands, and the total counts down. A filter
 * pill opens a small menu; picking a filter reflows the list, rows gliding to
 * their places and blurring in and out. Escape and a click outside close the
 * menu, and reduced motion shows every state at once.
 *
 * Engine: motion/react (layout animations and AnimatePresence for the rows,
 * the menu and the pay button, a motion value counting the total) with
 * animated icons from lucide-animated (MIT), vendored in src/icons.
 */

/** The animated icons a bill can carry. */
export type BillIcon = "wifi" | "power" | "phone" | "cloud" | "health";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  /** When it is due. */
  due: Date;
  icon: BillIcon;
  /** Which filter it belongs to, as in `"Bills"` or `"Subscriptions"`. */
  kind: string;
  /** Paid automatically; shown as a small tag. */
  autopay?: boolean;
  paid?: boolean;
}

export interface BillListProps {
  /** Card title. Default `"Coming up"`. */
  title?: string;
  /** The bills. Default five household bills and subscriptions, due over the next two weeks. */
  bills?: Bill[];
  /** Currency code for the amounts. Default `"USD"`. */
  currency?: string;
  /** Days ahead that count as due soon, with an amber chip. Default `3`. */
  soonDays?: number;
  /** Called after a bill is paid. */
  onPay?: (bill: Bill) => void;
  className?: string;
}

const ICONS: Record<BillIcon, React.ComponentType<{ className?: string; active?: boolean; strokeWidth?: number }>> = {
  wifi: WifiIcon,
  power: ZapIcon,
  phone: SmartphoneNfcIcon,
  cloud: CloudUploadIcon,
  health: HeartIcon,
};

const EASE = [0.22, 1, 0.36, 1] as const;
// The entrance, one piece at a time: the title, the total, the filter pill,
// then each row on its own beat.
const HEAD_AT = [0.15, 0.27, 0.39] as const;
const ROWS_AT = 0.55;
const STEP = 0.16;
// Each piece rises out of a soft blur on a lightly bouncy spring.
const ARRIVE = { type: "spring", stiffness: 260, damping: 22 } as const;
const POP = { type: "spring", stiffness: 420, damping: 18 } as const;
const ROW = { type: "spring", stiffness: 420, damping: 36 } as const;
const DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function sampleBills(): Bill[] {
  const today = new Date();
  const at = (d: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + d);
  return [
    { id: "internet", name: "Home internet", amount: 49, due: at(2), icon: "wifi", kind: "Bills" },
    { id: "power", name: "Electricity", amount: 86.3, due: at(6), icon: "power", kind: "Bills" },
    { id: "phone", name: "Phone plan", amount: 25, due: at(8), icon: "phone", kind: "Bills", autopay: true },
    { id: "backup", name: "Cloud backup", amount: 9.99, due: at(11), icon: "cloud", kind: "Subscriptions", autopay: true },
    { id: "gym", name: "Gym membership", amount: 42.19, due: at(14), icon: "health", kind: "Subscriptions" },
  ];
}

/** The amount due, counting to its value whenever it changes. */
function Total({ value, fmt, run, still }: { value: number; fmt: (n: number) => string; run: boolean; still: boolean }) {
  const mv = useMotionValue(still ? value : 0);
  const [text, setText] = React.useState(() => fmt(still ? value : 0));
  useMotionValueEvent(mv, "change", (v) => setText(fmt(v)));
  const first = React.useRef(true);
  React.useEffect(() => {
    if (!run) return;
    if (still) return mv.set(value);
    const c = animate(mv, value, { duration: first.current ? 1.1 : 0.6, delay: first.current ? HEAD_AT[1] : 0, ease: EASE });
    first.current = false;
    return () => c.stop();
  }, [value, run, still, mv]);
  return <span className="tabular-nums">{text}</span>;
}

function Row({
  bill,
  index,
  shown,
  intro,
  still,
  soonDays,
  money,
  onPay,
}: {
  bill: Bill;
  index: number;
  shown: boolean;
  /** True only while the card first appears, so later moves are not staggered. */
  intro: boolean;
  still: boolean;
  soonDays: number;
  money: (n: number) => string;
  onPay: (b: Bill) => void;
}) {
  const [hover, setHover] = React.useState(false);
  const [paying, setPaying] = React.useState(false);
  const Icon = ICONS[bill.icon];
  const today = new Date();
  const days = Math.round(
    (new Date(bill.due.getFullYear(), bill.due.getMonth(), bill.due.getDate()).getTime() -
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      DAY,
  );
  const soon = !bill.paid && days <= soonDays;
  const dueText =
    days <= 0 ? "Due today" : days === 1 ? "Due tomorrow" : soon ? `In ${days} days` : `Due ${MONTHS[bill.due.getMonth()]} ${bill.due.getDate()}`;
  const showPay = (hover || paying) && !bill.paid;
  // This row's beat in the entrance; later rows (after a filter) arrive at once.
  const delay = intro ? ROWS_AT + index * STEP : 0;

  const pay = () => {
    if (paying || bill.paid) return;
    if (still) return onPay(bill);
    setPaying(true);
    window.setTimeout(() => {
      setPaying(false);
      onPay(bill);
    }, 700);
  };

  return (
    <motion.li
      layout={still ? false : "position"}
      initial={still ? false : { opacity: 0, y: 18, scale: 0.96, filter: "blur(6px)" }}
      animate={
        shown
          ? {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              scale: 1,
            }
          : undefined
      }
      exit={still ? undefined : { opacity: 0, scale: 0.97, filter: "blur(4px)", transition: { duration: 0.18 } }}
      transition={{
        ...ROW,
        layout: ROW,
        opacity: { duration: 0.35, delay },
        filter: { duration: 0.4, delay },
        y: { ...ARRIVE, delay },
        scale: { ...ARRIVE, delay },
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHover(false);
      }}
      className={cn(
        "-mx-2 flex items-center gap-3 rounded-2xl bg-white px-2 py-2.5 transition-colors duration-200 dark:bg-zinc-900",
        !bill.paid && "cursor-pointer",
        hover && !bill.paid && "bg-[#f6f6f6] dark:bg-[#232326]",
      )}
    >
      <motion.span
        initial={still ? false : { scale: 0.5, opacity: 0 }}
        animate={shown ? { scale: 1, opacity: 1 } : undefined}
        transition={{ ...POP, opacity: { duration: 0.2, delay: delay + 0.08 }, delay: delay + 0.08 }}
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full transition-colors duration-200",
          bill.paid
            ? "bg-[#242423]/[0.04] text-zinc-400 dark:bg-white/[0.05] dark:text-zinc-500"
            : "bg-[#242423]/[0.06] text-[#242423] dark:bg-white/[0.08] dark:text-zinc-100",
        )}
      >
        <Icon className="size-5" active={hover && !bill.paid} strokeWidth={1.9} />
      </motion.span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium transition-colors",
            bill.paid ? "text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500" : "text-[#242423] dark:text-zinc-100",
          )}
        >
          {bill.name}
        </p>
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-zinc-500 dark:text-zinc-400">
          {bill.paid ? (
            <span>Paid</span>
          ) : soon ? (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f5a524]/15 px-2 py-0.5 font-medium text-[#b26b00] dark:text-[#f5b94a]">
              <span className="relative grid size-1.5 place-items-center">
                {!still && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[#f5a524]"
                    animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <span className="relative size-1.5 rounded-full bg-[#f5a524]" />
              </span>
              {dueText}
            </span>
          ) : (
            <span className="whitespace-nowrap">{dueText}</span>
          )}
          {/* The Autopay tag shows when the card has room for it. */}
          {bill.autopay && !bill.paid && (
            <span className="hidden whitespace-nowrap rounded-full bg-[#242423]/[0.05] px-1.5 py-0.5 text-[12px] @[22rem]:inline text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
              Autopay
            </span>
          )}
        </div>
      </div>

      {/* The amount, or the Pay button on hover and focus, in one slot. */}
      <motion.div
        initial={still ? false : { opacity: 0, x: 10, filter: "blur(4px)" }}
        animate={shown ? { opacity: 1, x: 0, filter: "blur(0px)" } : undefined}
        transition={{ ...ARRIVE, opacity: { duration: 0.3, delay: delay + 0.14 }, filter: { duration: 0.3, delay: delay + 0.14 }, delay: delay + 0.14 }}
        className="relative grid h-8 min-w-[76px] shrink-0 place-items-end"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {showPay ? (
            <motion.button
              key="pay"
              type="button"
              onClick={pay}
              aria-label={`Pay ${bill.name}, ${money(bill.amount)}`}
              initial={still ? false : { opacity: 0, x: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={still ? undefined : { opacity: 0, x: 8, filter: "blur(4px)" }}
              whileTap={still ? undefined : { scale: 0.94 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="inline-flex h-8 min-w-[76px] cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#242423] px-3.5 text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:focus-visible:ring-offset-zinc-900"
            >
              {paying ? (
                <motion.span
                  aria-label="Paying"
                  className="size-3.5 rounded-full border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                "Pay"
              )}
            </motion.button>
          ) : (
            <motion.span
              key="amount"
              initial={still ? false : { opacity: 0, x: -8, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={still ? undefined : { opacity: 0, x: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.18, ease: EASE }}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded-full px-3 text-sm font-semibold tabular-nums",
                bill.paid
                  ? "bg-[#16a36a]/10 text-[#16a36a]"
                  : "bg-[#242423]/[0.06] text-[#242423] dark:bg-white/[0.08] dark:text-zinc-100",
              )}
            >
              {bill.paid && <CheckIcon className="size-3.5" active strokeWidth={2.5} />}
              {money(bill.amount)}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.li>
  );
}

export const BillList = React.forwardRef<HTMLDivElement, BillListProps>(function BillList(
  { title = "Coming up", bills: billsProp, currency = "USD", soonDays = 3, onPay, className },
  forwardedRef,
) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const still = !!useReducedMotion();
  const shown = still || inView;

  const [bills, setBills] = React.useState<Bill[]>(() => billsProp ?? sampleBills());
  // The rows stagger in once; after that, moves and new rows play right away.
  const [intro, setIntro] = React.useState(true);
  const introRows = React.useRef(bills.length);
  React.useEffect(() => {
    if (!shown) return;
    const t = window.setTimeout(() => setIntro(false), (ROWS_AT + introRows.current * STEP + 0.8) * 1000);
    return () => window.clearTimeout(t);
  }, [shown]);
  React.useEffect(() => {
    if (billsProp) setBills(billsProp);
  }, [billsProp]);

  const money = React.useMemo(() => {
    const f = new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 });
    return (n: number) => f.format(n);
  }, [currency]);

  // Filters: everything, each kind, and what is due soon.
  const kinds = React.useMemo(() => Array.from(new Set(bills.map((b) => b.kind))), [bills]);
  const filters = ["All", ...kinds, "Due soon"];
  const [filter, setFilter] = React.useState("All");
  const soonCut = Date.now() + (soonDays + 1) * DAY;
  const visible = bills
    .filter((b) =>
      filter === "All" ? true : filter === "Due soon" ? !b.paid && b.due.getTime() < soonCut : b.kind === filter,
    )
    // By due date; a paid bill keeps its place.
    .sort((a, b) => a.due.getTime() - b.due.getTime());
  const due = visible.filter((b) => !b.paid).reduce((a, b) => a + b.amount, 0);

  const pay = (bill: Bill) => {
    setBills((list) => list.map((b) => (b.id === bill.id ? { ...b, paid: true } : b)));
    onPay?.({ ...bill, paid: true });
  };

  // The filter menu.
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const items = React.useRef<(HTMLButtonElement | null)[]>([]);
  React.useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    requestAnimationFrame(() => items.current[Math.max(0, filters.indexOf(filter))]?.focus());
    return () => document.removeEventListener("pointerdown", close);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const onMenuKey = (e: React.KeyboardEvent) => {
    const at = items.current.findIndex((el) => el === document.activeElement);
    if (e.key === "Escape") {
      setOpen(false);
      (menuRef.current?.querySelector("button[aria-haspopup]") as HTMLButtonElement | null)?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = (at + (e.key === "ArrowDown" ? 1 : -1) + filters.length) % filters.length;
      items.current[n]?.focus();
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={still ? false : { opacity: 0, y: 16 }}
      animate={shown ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: EASE }}
      className={cn(
        "@container relative w-[400px] max-w-full rounded-3xl bg-white p-5 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] sm:p-6 dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <motion.h3
            initial={still ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={shown ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
            transition={{ ...ARRIVE, opacity: { duration: 0.35, delay: HEAD_AT[0] }, filter: { duration: 0.35, delay: HEAD_AT[0] }, delay: HEAD_AT[0] }}
            className="text-base font-semibold tracking-tight"
          >
            {title}
          </motion.h3>
          <motion.p
            initial={still ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={shown ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
            transition={{ ...ARRIVE, opacity: { duration: 0.35, delay: HEAD_AT[1] }, filter: { duration: 0.35, delay: HEAD_AT[1] }, delay: HEAD_AT[1] }}
            className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400"
          >
            <span className="font-semibold text-[#242423] dark:text-zinc-100">
              <Total value={due} fmt={money} run={shown} still={still} />
            </span>{" "}
            {due > 0 ? "still to pay" : "all paid"}
          </motion.p>
        </div>

        {/* Filter pill and its menu. */}
        <motion.div
          ref={menuRef}
          initial={still ? false : { opacity: 0, scale: 0.6, filter: "blur(4px)" }}
          animate={shown ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
          transition={{ ...POP, opacity: { duration: 0.25, delay: HEAD_AT[2] }, filter: { duration: 0.3, delay: HEAD_AT[2] }, delay: HEAD_AT[2] }}
          style={{ transformOrigin: "right center" }}
          // Its entrance (scale, blur) makes it a layer of its own, so the
          // menu's z-index only counts inside it: lift the whole pill above
          // the rows, which are layers too, or the menu opens behind them.
          className="relative z-20 shrink-0"
          onKeyDown={onMenuKey}
        >
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full bg-[#242423]/[0.06] pl-3 pr-2 text-sm font-medium outline-none transition-colors hover:bg-[#242423]/[0.1] focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/[0.08] dark:hover:bg-white/[0.12]"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={filter}
                initial={still ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={still ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
              >
                {filter}
              </motion.span>
            </AnimatePresence>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
              <ChevronDownIcon className="size-4" strokeWidth={2.25} />
            </motion.span>
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                role="menu"
                aria-label="Filter"
                initial={still ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.96, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={still ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98, filter: "blur(4px)" }}
                transition={{ duration: 0.18, ease: EASE }}
                style={{ transformOrigin: "top right" }}
                className="absolute right-0 top-full z-20 mt-2 w-44 rounded-2xl bg-white p-1.5 shadow-[0_2px_6px_rgba(0,0,0,0.06),0_16px_36px_-12px_rgba(0,0,0,0.25)] dark:bg-zinc-800"
              >
                {filters.map((f, i) => (
                  <button
                    key={f}
                    ref={(el) => {
                      items.current[i] = el;
                    }}
                    type="button"
                    role="menuitemradio"
                    aria-checked={f === filter}
                    onClick={() => {
                      setFilter(f);
                      setOpen(false);
                    }}
                    className="flex h-9 w-full cursor-pointer items-center justify-between rounded-xl px-3 text-left text-sm outline-none transition-colors hover:bg-[#242423]/[0.05] focus-visible:bg-[#242423]/[0.05] dark:hover:bg-white/[0.06] dark:focus-visible:bg-white/[0.06]"
                  >
                    {f}
                    {f === filter && <CheckIcon className="size-4" active strokeWidth={2.25} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <LayoutGroup>
        <ul className="mt-3">
          {/* No initial={false} here: it would skip the rows' entrance. */}
          <AnimatePresence mode="popLayout">
            {visible.map((b, i) => (
              <Row key={b.id} bill={b} index={i} shown={shown} intro={intro} still={still} soonDays={soonDays} money={money} onPay={pay} />
            ))}
          </AnimatePresence>
          {visible.length === 0 && (
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500"
            >
              Nothing here right now.
            </motion.li>
          )}
        </ul>
      </LayoutGroup>
    </motion.div>
  );
});