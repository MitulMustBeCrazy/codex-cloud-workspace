"use client";

/**
 * RollingStepper, from https://motion-brew.com/components/rolling-stepper
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { Minus, Plus } from "lucide-react";
import { motion, type SpringOptions, useAnimate, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// RollingStepper

/**
 * RollingStepper
 *
 * Trigger: press. A number stepper whose digits roll like an odometer. Each
 * digit is its own column of 0 to 9 that springs to the new value, so going
 * from 19 to 20 rolls both columns. The buttons squash on press, and hitting
 * the min or max gives a small sideways shake instead of a dead click.
 * Arrow Up / Down step the value when the number is focused.
 *
 * Engine: motion/react (springs on transform, useAnimate for the shake).
 */

const ROLL: SpringOptions = { stiffness: 280, damping: 26, mass: 0.8 };
const PRESS = { scale: 0.88 } as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export interface RollingStepperProps {
  /** Controlled value. Leave out to let the stepper manage its own value. */
  value?: number;
  /** Starting value when uncontrolled. Default `0`. */
  defaultValue?: number;
  /** Called with the next value after every step. */
  onValueChange?: (value: number) => void;
  /** Lowest allowed value. Default `0`. */
  min?: number;
  /** Highest allowed value. Default `999`. */
  max?: number;
  /** Amount per step. Default `1`. */
  step?: number;
  /** Spring for the digit roll. Default `{ stiffness: 280, damping: 26, mass: 0.8 }`. */
  spring?: SpringOptions;
  /** Accessible name for the value. Default `"Quantity"`. */
  label?: string;
  className?: string;
}

function Digit({ digit, spring }: { digit: number; spring: SpringOptions }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-digit * 10}%` }}
        transition={{ type: "spring", ...spring }}
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

export function RollingStepper({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 999,
  step = 1,
  spring = ROLL,
  label = "Quantity",
  className,
}: RollingStepperProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp ?? inner;
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduceMotion = useReducedMotion() ?? false;

  const change = (direction: 1 | -1) => {
    const next = value + direction * step;
    if (next < min || next > max) {
      if (!reduceMotion) animate(scope.current, { x: [0, -5, 5, -3, 3, 0] }, { duration: 0.32 });
      return;
    }
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };

  // Pad to the widest value so the layout never jumps between 9 and 10.
  const width = String(Math.max(Math.abs(min), Math.abs(max))).length;
  const digits = String(Math.abs(value)).padStart(width, "0").split("").map(Number);
  const firstSignificant = digits.findIndex((d) => d !== 0);
  const lead = firstSignificant === -1 ? digits.length - 1 : firstSignificant;

  const buttonClass =
    "grid size-9 cursor-pointer place-items-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-900/5 disabled:opacity-35 dark:text-zinc-300 dark:hover:bg-white/10 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400";

  return (
    <motion.div
      ref={scope}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      <motion.button
        type="button"
        aria-label={`Decrease ${label}`}
        whileTap={PRESS}
        onClick={() => change(-1)}
        disabled={value - step < min && reduceMotion}
        className={buttonClass}
      >
        <Minus className="size-4" />
      </motion.button>
      <div
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") (e.preventDefault(), change(1));
          if (e.key === "ArrowDown") (e.preventDefault(), change(-1));
        }}
        className="flex min-w-14 justify-center rounded-lg px-2 text-2xl font-medium tabular-nums leading-none text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-100"
      >
        {value < 0 && <span>-</span>}
        {digits.slice(lead).map((d, i) => (
          // Key from the right so a column keeps its identity as the number grows.
          <Digit key={digits.length - lead - i} digit={d} spring={spring} />
        ))}
      </div>
      <motion.button
        type="button"
        aria-label={`Increase ${label}`}
        whileTap={PRESS}
        onClick={() => change(1)}
        disabled={value + step > max && reduceMotion}
        className={buttonClass}
      >
        <Plus className="size-4" />
      </motion.button>
    </motion.div>
  );
}