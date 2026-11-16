"use client";

/**
 * FlipWords, from https://motion-brew.com/components/flip-words
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// FlipWords

/**
 * FlipWords
 *
 * Trigger: timeline. One word in a sentence flips to the next on a loop. The
 * outgoing word tips away while the incoming one flips up letter by letter in
 * 3D, and the sentence reflows smoothly as the word's width changes. Screen
 * readers hear the whole list once. Reduced motion swaps words without motion.
 *
 * Engine: motion/react (AnimatePresence with per-letter stagger, layout on the
 * word slot for the width change).
 */

export interface FlipWordsProps {
  /** Text before the changing word. Default `"Build"`. */
  before?: string;
  /** Words to cycle through. Default `["playful", "precise", "fearless"]`. */
  words?: string[];
  /** Text after the changing word. Default `"interfaces"`. */
  after?: string;
  /** Milliseconds each word stays. Default `2400`. */
  interval?: number;
  /** Classes for the changing word. Default a violet tone. */
  wordClassName?: string;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export const FlipWords = React.forwardRef<HTMLParagraphElement, FlipWordsProps>(function FlipWords(
  {
    before = "Build",
    words = ["playful", "precise", "fearless"],
    after = "interfaces",
    interval = 2400,
    wordClassName = "text-violet-600 dark:text-violet-400",
    className,
  },
  ref,
) {
  const still = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    if (words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);
  const word = words[index] ?? "";

  return (
    <p ref={ref} className={cn("text-balance", className)}>
      <span className="sr-only">
        {before} {words.join(", ")} {after}
      </span>
      <span aria-hidden>
        {before}{" "}
        <motion.span layout={!still} transition={{ duration: 0.4, ease: EASE }} className="relative inline-flex" style={{ perspective: 600 }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={word}
              className={cn("inline-flex whitespace-pre", wordClassName)}
              exit={still ? { opacity: 0 } : { opacity: 0, y: "-0.4em", rotateX: 70, filter: "blur(6px)" }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {Array.from(word).map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  style={{ transformOrigin: "50% 100%" }}
                  initial={still ? false : { opacity: 0, y: "0.4em", rotateX: -80, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.45, ease: EASE, delay: i * 0.03 }}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </motion.span>{" "}
        {after}
      </span>
    </p>
  );
});