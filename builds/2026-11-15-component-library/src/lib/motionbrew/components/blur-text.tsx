"use client";

/**
 * BlurText, from https://motion-brew.com/components/blur-text
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { motion, useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// BlurText

/**
 * BlurText
 *
 * Trigger: in view (or on mount). Words (or letters) rise out of a blur one
 * after another when the text scrolls into view, settling sharp and in place. Screen readers
 * get the plain sentence once. Reduced motion shows the text at once.
 *
 * Engine: motion/react (useInView plus staggered variants on transform, opacity
 * and filter).
 */

export interface BlurTextProps {
  /** The text to reveal. Default `"Every word drifts out of the blur and settles into sharp focus"`. */
  text?: string;
  /** Element to render. Default `"p"`. */
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Animate each `"word"` or each `"letter"`. Default `"word"`. */
  by?: "word" | "letter";
  /** Seconds between pieces. Default `0.08`. */
  stagger?: number;
  /** Seconds each piece takes. Default `0.7`. */
  duration?: number;
  /** Starting blur, px. Default `12`. */
  blur?: number;
  /** Pieces rise `"up"` or drop `"down"` into place. Default `"up"`. */
  direction?: "up" | "down";
  /** Seconds to wait before starting. Default `0`. */
  delay?: number;
  /** Start when it scrolls into view (`"inView"`) or right away (`"mount"`). Default `"inView"`. */
  trigger?: "inView" | "mount";
  className?: string;
}

export const BlurText = React.forwardRef<HTMLElement, BlurTextProps>(function BlurText(
  {
    text = "Every word drifts out of the blur and settles into sharp focus",
    as: Tag = "p",
    by = "word",
    stagger = 0.08,
    duration = 0.7,
    blur = 12,
    direction = "up",
    delay = 0,
    trigger = "inView",
    className,
  },
  forwardedRef,
) {
  const ref = React.useRef<HTMLElement>(null);
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const inView = trigger === "mount" || seen;
  const still = useReducedMotion();
  const pieces = by === "word" ? text.split(" ") : Array.from(text);
  const offset = direction === "up" ? "0.35em" : "-0.35em";

  return (
    <Tag ref={ref as React.Ref<never>} aria-label={text} className={cn("text-balance", className)}>
      {pieces.map((piece, i) => (
        <React.Fragment key={i}>
          <motion.span
            aria-hidden
            className="inline-block whitespace-pre will-change-transform"
            initial={still ? false : { opacity: 0, y: offset, filter: `blur(${blur}px)` }}
            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
            transition={{ duration, ease: [0.22, 1, 0.36, 1], delay: delay + i * stagger }}
          >
            {piece}
          </motion.span>
          {by === "word" && i < pieces.length - 1 && " "}
        </React.Fragment>
      ))}
    </Tag>
  );
});