"use client";

/**
 * HoldToConfirm, from https://motion-brew.com/components/hold-to-confirm
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { Trash2 } from "lucide-react";
import { animate, AnimatePresence, type AnimationPlaybackControls, type HTMLMotionProps, motion, useMotionValue, useTransform } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// HoldToConfirm

/**
 * HoldToConfirm
 *
 * Trigger: press and hold. Holding the button (pointer, or Space / Enter)
 * fills it left to right. Let go early and the fill springs back. Hold to the
 * end and the label lifts away while a check draws itself and the confirmed
 * label rises in letter by letter, at the same button size. `onConfirm` fires,
 * then it resets.
 * Built for destructive or deliberate actions where a plain click is too easy.
 *
 * Engine: motion/react (`animate` on a motion value, pathLength for the check,
 * AnimatePresence for the label swap). Transform and opacity only.
 */

// Transform and opacity only, so the swap stays on the compositor.
const SWAP = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { type: "spring", stiffness: 500, damping: 32 },
} as const;
const DRAIN = { type: "spring", stiffness: 300, damping: 30 } as const;
const DONE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.18 },
} as const;
const LETTER = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 520, damping: 34 } },
} as const;

/** A check that draws itself, stroke first. */
function DrawnCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <motion.path
        d="M20 6 9 17l-5-5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
      />
    </svg>
  );
}

/** Staggers a string in letter by letter. Other nodes render as they are. */
function Letters({ children }: { children: React.ReactNode }) {
  if (typeof children !== "string") return <>{children}</>;
  return (
    <motion.span
      aria-label={children}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.02, delayChildren: 0.1 }}
    >
      {Array.from(children).map((char, i) => (
        <motion.span key={i} aria-hidden variants={LETTER} className="inline-block whitespace-pre">
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export interface HoldToConfirmProps extends Omit<
  HTMLMotionProps<"button">,
  "children" | "onPointerDown" | "onPointerUp"
> {
  /** Label shown before and during the hold. Default `"Hold to delete"`. */
  children?: React.ReactNode;
  /** Icon before the label. Default a trash icon. Pass `null` for none. */
  icon?: React.ReactNode;
  /** Label shown after the hold completes. Default `"Deleted"`. */
  confirmedLabel?: React.ReactNode;
  /** How long the hold takes, in ms. Default `1200`. */
  duration?: number;
  /** How long the confirmed state shows before the button resets, in ms. Default `1600`. */
  resetAfter?: number;
  /** Called once when the hold completes. */
  onConfirm?: () => void;
  /** Fill color class. Default near-black (near-white in dark mode). */
  fillClassName?: string;
}

export const HoldToConfirm = React.forwardRef<HTMLButtonElement, HoldToConfirmProps>(function HoldToConfirm(
  {
    children = "Hold to delete",
    icon = <Trash2 className="size-4" />,
    confirmedLabel = "Deleted",
    duration = 1200,
    resetAfter = 1600,
    onConfirm,
    className,
    fillClassName,
    disabled,
    type = "button",
    onKeyDown,
    onKeyUp,
    onBlur,
    ...props
  },
  ref,
) {
  const progress = useMotionValue(0);
  // White copy of the label is revealed in step with the fill.
  const clipPath = useTransform(progress, (p) => `inset(0 ${(1 - p) * 100}% 0 0)`);
  const controls = React.useRef<AnimationPlaybackControls | null>(null);
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmed, setConfirmed] = React.useState(false);
  const label = (
    <>
      {icon}
      {children}
    </>
  );

  React.useEffect(
    () => () => {
      controls.current?.stop();
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const start = () => {
    if (disabled || confirmed) return;
    controls.current?.stop();
    const remaining = (1 - progress.get()) * duration;
    controls.current = animate(progress, 1, {
      duration: remaining / 1000,
      ease: "linear",
      onComplete: () => {
        setConfirmed(true);
        onConfirm?.();
        resetTimer.current = setTimeout(() => {
          setConfirmed(false);
          controls.current = animate(progress, 0, DRAIN);
        }, resetAfter);
      },
    });
  };

  const cancel = () => {
    if (confirmed || progress.get() === 0) return;
    controls.current?.stop();
    controls.current = animate(progress, 0, DRAIN);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-live="polite"
      animate={confirmed ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      whileTap={confirmed ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        start();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        onKeyUp?.(e);
        if (e.key === " " || e.key === "Enter") cancel();
      }}
      onBlur={(e) => {
        onBlur?.(e);
        cancel();
      }}
      className={cn(
        "relative isolate inline-flex h-11 cursor-pointer select-none items-center justify-center overflow-hidden rounded-full px-6 text-sm font-medium touch-none",
        "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
        "outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <motion.span
        aria-hidden
        style={{ scaleX: progress, originX: 0 }}
        className={cn("absolute inset-0 -z-10 bg-zinc-900 dark:bg-zinc-100", fillClassName)}
      />
      {/* Sizes the button from the hold label, so both states share one size. */}
      <span aria-hidden className="invisible inline-flex items-center gap-2">
        {label}
      </span>
      <AnimatePresence initial={false}>
        {confirmed ? (
          <motion.span
            key="done"
            {...DONE}
            className="absolute inset-0 flex items-center justify-center gap-2 text-white dark:text-zinc-900"
          >
            <DrawnCheck />
            <Letters>{confirmedLabel}</Letters>
          </motion.span>
        ) : (
          <motion.span key="idle" {...SWAP} className="absolute inset-0 flex items-center justify-center gap-2">
            {label}
            <motion.span
              aria-hidden
              style={{ clipPath }}
              className="absolute inset-0 flex items-center justify-center gap-2 text-white dark:text-zinc-900"
            >
              {label}
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
});