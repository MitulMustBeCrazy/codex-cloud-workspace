"use client";

/**
 * SlideCommit, from https://motion-brew.com/components/slide-commit
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
import { animate, AnimatePresence, motion, type Transition, useAnimation, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

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

// SlideCommit

/**
 * SlideCommit
 *
 * Trigger: drag (plus keys). A slide-to-confirm pill for actions worth a
 * deliberate gesture: paying, sending, deleting. An ink handle sits at the
 * left with a row of chevrons that march toward the end, and the label in the
 * track shimmers to show which way to go. Dragging the handle stretches a
 * fill behind it and fades the label out as it travels; letting go early
 * springs it back home with a small overshoot. Past the threshold the handle
 * gives a little pulse to say it will commit, and on release it snaps to the
 * end and turns into a spinner while "Committing..." rolls in beside it
 * with a light sweeping through it. Then green floods back
 * across the track from the handle, the track gives a small settle, the
 * handle pops white and draws a check as two rings ripple out of it, and the
 * label rolls in, centred in the space beside the handle. It resets itself
 * after a moment, or on press. With the keyboard, Enter or Space commits and
 * the arrow keys nudge the handle. Reduced motion swaps the springs, sweep
 * and shimmer for plain changes.
 *
 * Engine: motion/react (drag on a motion value, springs, AnimatePresence for
 * the handle's icon and the rolling label).
 */

export interface SlideCommitProps {
  /** Label in the track. Default `"Slide to commit"`. */
  label?: string;
  /** Label while the action runs. Default `"Committing"`. */
  pendingLabel?: string;
  /** Label once committed. Default `"Committed"`. */
  doneLabel?: string;
  /** Share of the track the handle must pass to commit, 0.5 to 0.95. Default `0.82`. */
  threshold?: number;
  /** Called on commit. Return a promise to hold the spinner until it settles; a rejection springs back. */
  onCommit?: () => void | Promise<unknown>;
  /** Seconds before it resets on its own. `0` waits for a press. Default `2.4`. */
  resetAfter?: number;
  className?: string;
}

type Phase = "idle" | "loading" | "done";

const HANDLE = 48;
const PAD = 4;
const INK = "#242423";
const SUCCESS = "#269a5a";
/** The same soft tint as the search pill, so the track reads on any light surface. */
const TRACK = "rgba(36, 36, 35, 0.06)";
const GLIDE = [0.22, 1, 0.36, 1] as const;
const HOME = { type: "spring", stiffness: 520, damping: 26 } as const;

export const SlideCommit = React.forwardRef<HTMLDivElement, SlideCommitProps>(
  function SlideCommit(
    {
      label = "Slide to commit",
      pendingLabel = "Committing",
      doneLabel = "Committed",
      threshold = 0.82,
      onCommit,
      resetAfter = 2.4,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const track = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => track.current as HTMLDivElement);
    const [phase, setPhase] = React.useState<Phase>("idle");
    const [armed, setArmed] = React.useState(false);
    const [max, setMax] = React.useState(0);
    const x = useMotionValue(0);
    const pass = Math.min(0.95, Math.max(0.5, threshold));

    // How far along the handle is, 0 to 1, drives the fill and the label.
    const progress = useTransform(x, (v) => (max > 0 ? v / max : 0));
    const fill = useTransform(x, (v) => v + HANDLE + PAD * 2);
    const labelOpacity = useTransform(progress, [0, 0.55], [1, 0]);
    const labelShift = useTransform(progress, [0, 1], [0, 18]);

    React.useLayoutEffect(() => {
      const el = track.current;
      if (!el) return;
      const measure = () => setMax(el.clientWidth - HANDLE - PAD * 2);
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    // A small pulse when the handle crosses the line, so the commit is felt before release.
    React.useEffect(
      () =>
        progress.on("change", (p) => {
          if (phase !== "idle") return;
          const on = p >= pass;
          setArmed((a) => (a === on ? a : on));
        }),
      [progress, pass, phase],
    );

    const reset = React.useCallback(() => {
      setPhase("idle");
      setArmed(false);
      animate(x, 0, still ? { duration: 0 } : HOME);
    }, [still, x]);

    // Done resets itself after a while unless asked to wait.
    React.useEffect(() => {
      if (phase !== "done" || resetAfter <= 0) return;
      const t = window.setTimeout(reset, resetAfter * 1000);
      return () => window.clearTimeout(t);
    }, [phase, resetAfter, reset]);

    const commit = async () => {
      if (phase !== "idle") return;
      setPhase("loading");
      await animate(
        x,
        max,
        still
          ? { duration: 0 }
          : { type: "spring", stiffness: 600, damping: 34 },
      );
      try {
        await Promise.all([
          onCommit?.(),
          new Promise((r) => setTimeout(r, still ? 150 : 900)),
        ]);
        setPhase("done");
      } catch {
        reset();
      }
    };

    const release = () => {
      if (phase !== "idle") return;
      if (x.get() >= max * pass) void commit();
      else animate(x, 0, still ? { duration: 0 } : HOME);
    };

    const onKey = (e: React.KeyboardEvent) => {
      if (phase === "done" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        return reset();
      }
      if (phase !== "idle") return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        void commit();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const next = Math.max(
          0,
          Math.min(
            max,
            x.get() + (e.key === "ArrowRight" ? 1 : -1) * max * 0.2,
          ),
        );
        animate(
          x,
          next,
          still
            ? { duration: 0 }
            : { type: "spring", stiffness: 500, damping: 32 },
        );
        if (next >= max * pass) void commit();
      }
    };

    const done = phase === "done";

    return (
      <motion.div
        ref={track}
        role="button"
        tabIndex={0}
        aria-label={done ? doneLabel : `${label}. Press Enter to confirm.`}
        aria-busy={phase === "loading"}
        onKeyDown={onKey}
        onClick={() => done && reset()}
        style={{ backgroundColor: TRACK }}
        animate={done && !still ? { scaleX: [1, 1.025, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.45, ease: GLIDE }}
        className={cn(
          "relative h-14 w-[320px] max-w-full select-none overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
          done ? "cursor-pointer" : "cursor-default",
          className,
        )}
      >
        {/* The fill stretches behind the handle as it travels. */}
        <motion.span
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: fill }}
          animate={{
            backgroundColor: armed
              ? "rgba(36, 36, 35, 0.12)"
              : "rgba(36, 36, 35, 0.07)",
          }}
          transition={{ duration: 0.25 }}
        />

        {/* Success floods back across the track from the handle, right to left. */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: SUCCESS }}
          initial={false}
          animate={{
            clipPath: done
              ? "inset(0% 0% 0% 0% round 999px)"
              : "inset(0% 0% 0% 100% round 999px)",
          }}
          transition={{ duration: still ? 0 : done ? 0.55 : 0.35, ease: GLIDE }}
        />

        {/* The label, shimmering toward the end until the handle starts to move. Once the handle
            reaches the end, the pending and done labels sit centred in the space before it. */}
        <motion.span
          className={cn(
            "pointer-events-none absolute inset-0 grid place-items-center text-sm font-medium",
            phase === "idle" ? "pl-[60px] pr-6" : "pl-6 pr-[60px]",
          )}
          style={
            phase === "idle"
              ? { opacity: labelOpacity, x: labelShift }
              : { opacity: 1, x: 0 }
          }
        >
          {phase === "idle" ? (
            <span
              className={cn(
                "bg-clip-text text-transparent",
                !still && "animate-[slide-commit-shine_2.2s_linear_infinite]",
              )}
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #71717a 0%, #71717a 40%, #18181b 50%, #71717a 60%, #71717a 100%)",
                backgroundSize: "250% 100%",
              }}
            >
              {label}
            </span>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {done ? (
                <motion.span
                  key="done"
                  className="text-white"
                  initial={
                    still
                      ? { opacity: 0 }
                      : { opacity: 0, y: "70%", filter: "blur(4px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.32, ease: GLIDE }}
                >
                  {doneLabel}
                </motion.span>
              ) : (
                // While it works, a light sweeps through the label and its dots, like the idle shimmer.
                <motion.span
                  key="pending"
                  className={cn(
                    "bg-clip-text text-transparent",
                    !still &&
                      "animate-[slide-commit-shine_1.6s_linear_infinite]",
                  )}
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #52525b 0%, #52525b 38%, #d4d4d8 50%, #52525b 62%, #52525b 100%)",
                    backgroundSize: "250% 100%",
                  }}
                  initial={
                    still
                      ? { opacity: 0 }
                      : { opacity: 0, y: "70%", filter: "blur(4px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={
                    still
                      ? { opacity: 0 }
                      : { opacity: 0, y: "-70%", filter: "blur(4px)" }
                  }
                  transition={{ duration: 0.32, ease: GLIDE }}
                >
                  {pendingLabel}...
                </motion.span>
              )}
            </AnimatePresence>
          )}
        </motion.span>

        {/* Two rings ripple out of the handle the moment it commits. */}
        <AnimatePresence>
          {done &&
            !still &&
            [0, 0.12].map((d) => (
              <motion.span
                key={d}
                aria-hidden
                className="pointer-events-none absolute right-1 top-1 size-12 rounded-full border-2 border-white"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 + d }}
              />
            ))}
        </AnimatePresence>

        {/* The handle. */}
        <motion.button
          type="button"
          tabIndex={-1}
          aria-hidden
          drag={phase === "idle" ? "x" : false}
          dragConstraints={{ left: 0, right: max }}
          dragElastic={0.06}
          dragMomentum={false}
          onDragEnd={release}
          style={{ x }}
          animate={{
            // On commit the handle pops, then settles, as the check lands.
            scale:
              done && !still
                ? [1, 1.16, 1]
                : armed && phase === "idle" && !still
                  ? 1.06
                  : 1,
            backgroundColor: done ? "#ffffff" : INK,
          }}
          whileTap={phase === "idle" && !still ? { scale: 0.96 } : undefined}
          transition={{
            scale: done
              ? { duration: 0.5, ease: GLIDE, times: [0, 0.35, 1] }
              : { type: "spring", stiffness: 500, damping: 22 },
            backgroundColor: { duration: 0.3, ease: GLIDE },
          }}
          className={cn(
            "absolute left-1 top-1 grid size-12 place-items-center rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.12),0_6px_16px_-6px_rgba(0,0,0,0.35)] outline-none",
            phase === "idle"
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-default",
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {phase === "idle" && (
              <motion.span
                key="go"
                className="flex translate-x-px text-white"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
              >
                {/* Three chevrons light up in turn, marching toward the end. */}
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className={cn("flex", i > 0 && "-ml-2.5")}
                    animate={
                      still ? { opacity: 1 } : { opacity: [0.35, 1, 0.35] }
                    }
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.18,
                      ease: "easeInOut",
                    }}
                  >
                    <ChevronRightIcon className="size-4" strokeWidth={2.5} />
                  </motion.span>
                ))}
              </motion.span>
            )}
            {phase === "loading" && (
              <motion.span
                key="spin"
                className="size-5 rounded-full border-2 border-white/30 border-t-white"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1, rotate: still ? 0 : 360 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{
                  rotate: { duration: 0.8, ease: "linear", repeat: Infinity },
                  default: { duration: 0.2 },
                }}
              />
            )}
            {done && (
              <motion.svg
                key="check"
                viewBox="0 0 16 16"
                className="size-5"
                style={{ color: SUCCESS }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <motion.path
                  d="M3.5 8.5 6.5 11.5 12.5 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: still ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35, ease: GLIDE, delay: 0.08 }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        <span role="status" aria-live="polite" className="sr-only">
          {phase === "loading"
            ? `${pendingLabel}.`
            : done
              ? `${doneLabel}.`
              : ""}
        </span>

        <style>{`@keyframes slide-commit-shine { from { background-position: 100% 0 } to { background-position: -150% 0 } }`}</style>
      </motion.div>
    );
  },
);