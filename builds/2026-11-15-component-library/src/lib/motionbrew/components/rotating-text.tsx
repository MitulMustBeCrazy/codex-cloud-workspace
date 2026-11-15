"use client";

/**
 * RotatingText, from https://motion-brew.com/components/rotating-text
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
import { motion, useAnimation, useAnimationFrame, useMotionValue, useReducedMotion, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

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

// RotatingText

/**
 * RotatingText
 *
 * Trigger: hover. Text set on a circle spins slowly around a center badge.
 * Hovering speeds the spin up and the arrow in the middle turns to point the
 * way; leaving eases the spin back down. Reduced motion keeps the ring still.
 *
 * Engine: motion/react (useAnimationFrame drives the rotation so the speed can
 * ease between rates without restarting the loop).
 */

export interface RotatingTextProps {
  /** Text on the ring; it repeats to fill the circle. Default `"Scroll to explore • "`. */
  text?: string;
  /** Diameter in px. Default `160`. */
  size?: number;
  /** Seconds per turn at rest. Default `14`. */
  duration?: number;
  /** How much faster it spins on hover. Default `4`. */
  boost?: number;
  /** Accessible label. Default the ring text. */
  label?: string;
  className?: string;
}

export const RotatingText = React.forwardRef<HTMLDivElement, RotatingTextProps>(function RotatingText(
  { text = "Scroll to explore • ", size = 160, duration = 14, boost = 4, label, className },
  ref,
) {
  const still = useReducedMotion();
  const id = `ring-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const rotate = useMotionValue(0);
  const speed = React.useRef(1);
  const [hover, setHover] = React.useState(false);

  useAnimationFrame((_, delta) => {
    if (still) return;
    // Ease the speed toward its target so hover feels like a push, not a jump.
    speed.current += ((hover ? boost : 1) - speed.current) * Math.min(1, delta / 220);
    rotate.set((rotate.get() + (360 / (duration * 1000)) * delta * speed.current) % 360);
  });

  // Repeat the text until it fills the ring reasonably.
  const ring = text.repeat(Math.max(1, Math.ceil(28 / text.length)));
  const r = 40;
  const circumference = 2 * Math.PI * r;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label ?? text.replace(/[•·]/g, "").trim()}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <motion.svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible" style={{ rotate }} aria-hidden>
        <defs>
          <path id={id} d={`M 50 ${50 - r} a ${r} ${r} 0 1 1 0 ${2 * r} a ${r} ${r} 0 1 1 0 ${-2 * r}`} />
        </defs>
        <text className="fill-current text-[10px] font-semibold uppercase tracking-[0.2em]">
          <textPath href={`#${id}`} textLength={circumference} lengthAdjust="spacing">
            {ring}
          </textPath>
        </text>
      </motion.svg>
      <motion.span
        aria-hidden
        animate={{ scale: hover ? 1.08 : 1, rotate: hover ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="grid size-[38%] place-items-center rounded-full bg-[#242423] text-white dark:bg-white dark:text-zinc-900"
      >
        <ArrowUpRightIcon className="size-[45%]" strokeWidth={2.25} />
      </motion.span>
    </div>
  );
});