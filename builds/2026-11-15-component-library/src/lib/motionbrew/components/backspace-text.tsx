"use client";

/**
 * BackspaceText, from https://motion-brew.com/components/backspace-text
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// BackspaceText

/**
 * BackspaceText
 *
 * Trigger: timeline. Types a word, holds, backspaces it letter by letter and
 * types the next, on a loop, with a blinking caret. New letters pop in with a
 * tiny rise. Screen readers get the full list once. Reduced motion shows the
 * first word, still.
 *
 * Engine: motion/react (letter pop-ins and a blinking caret; plain timers pace the typing).
 */

export interface BackspaceTextProps {
  /** Fixed text before the typed word. Default `"We design for"`. */
  before?: string;
  /** Words to type in turn. Default `["people.", "speed.", "delight."]`. */
  words?: string[];
  /** Milliseconds per typed letter. Default `75`. */
  typeSpeed?: number;
  /** Milliseconds per deleted letter. Default `40`. */
  deleteSpeed?: number;
  /** Milliseconds a finished word stays before deleting. Default `1400`. */
  pause?: number;
  /** Classes for the typed word. Default a violet tone. */
  wordClassName?: string;
  className?: string;
}

export const BackspaceText = React.forwardRef<HTMLParagraphElement, BackspaceTextProps>(function BackspaceText(
  {
    before = "We design for",
    words = ["people.", "speed.", "delight."],
    typeSpeed = 75,
    deleteSpeed = 40,
    pause = 1400,
    wordClassName = "text-violet-600 dark:text-violet-400",
    className,
  },
  ref,
) {
  const still = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);
  const word = words[index % words.length] ?? "";

  React.useEffect(() => {
    if (still) return;
    let delay = deleting ? deleteSpeed : typeSpeed;
    if (!deleting && count === word.length) delay = pause;
    if (deleting && count === 0) delay = 300;
    const id = window.setTimeout(() => {
      if (!deleting && count < word.length) setCount(count + 1);
      else if (!deleting) setDeleting(true);
      else if (count > 0) setCount(count - 1);
      else {
        setDeleting(false);
        setIndex((i) => (i + 1) % words.length);
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [count, deleting, word, words.length, typeSpeed, deleteSpeed, pause, still]);

  const shown = still ? word : word.slice(0, count);

  return (
    <p ref={ref} className={cn(className)}>
      <span className="sr-only">
        {before} {words.join(" ")}
      </span>
      <span aria-hidden>
        {before}{" "}
        <span className={cn("whitespace-pre", wordClassName)}>
          {Array.from(shown).map((ch, i) => (
            <motion.span
              key={`${index}-${i}`}
              className="inline-block"
              initial={{ opacity: 0, y: "0.15em" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
        <motion.span
          className="ml-[0.06em] inline-block h-[0.95em] w-[0.08em] translate-y-[0.12em] rounded-full bg-current align-baseline"
          animate={still ? undefined : { opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        />
      </span>
    </p>
  );
});