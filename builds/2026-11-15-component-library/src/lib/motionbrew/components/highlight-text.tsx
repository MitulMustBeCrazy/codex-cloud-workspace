"use client";

/**
 * HighlightText, from https://motion-brew.com/components/highlight-text
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

// HighlightText

/**
 * HighlightText
 *
 * Trigger: in view. A marker sweeps behind chosen phrases one after another as
 * the paragraph scrolls into view, with a slight hand-held skew. The text stays
 * plain and readable. Reduced motion shows the highlights already drawn.
 *
 * Engine: motion/react (useInView plus a staggered scaleX sweep behind each phrase).
 */

export interface HighlightTextProps {
  /** The paragraph. Default a short line about motion. */
  text?: string;
  /** Phrases to highlight, in reading order. Each must appear in `text`. */
  highlights?: string[];
  /** Marker color. Default a soft yellow. */
  color?: string;
  /** Seconds each sweep takes. Default `0.6`. */
  duration?: number;
  className?: string;
}

export const HighlightText = React.forwardRef<HTMLParagraphElement, HighlightTextProps>(function HighlightText(
  {
    text = "Good motion is quiet. It guides the eye, explains what changed and gets out of the way.",
    highlights = ["guides the eye", "explains what changed"],
    color = "rgba(250, 204, 21, 0.45)",
    duration = 0.6,
    className,
  },
  forwardedRef,
) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLParagraphElement);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const still = useReducedMotion();

  // Split the text into plain runs and highlighted phrases, in order.
  const parts: { text: string; mark: number | null }[] = [];
  let rest = text;
  highlights.forEach((phrase, k) => {
    const at = rest.indexOf(phrase);
    if (at < 0) return;
    if (at > 0) parts.push({ text: rest.slice(0, at), mark: null });
    parts.push({ text: phrase, mark: k });
    rest = rest.slice(at + phrase.length);
  });
  if (rest) parts.push({ text: rest, mark: null });

  return (
    <p ref={ref} className={cn("text-balance", className)}>
      {parts.map((part, i) =>
        part.mark === null ? (
          <React.Fragment key={i}>{part.text}</React.Fragment>
        ) : (
          <mark key={i} className="relative isolate whitespace-nowrap bg-transparent text-inherit">
            <motion.span
              aria-hidden
              className="absolute -inset-x-[0.12em] bottom-[0.08em] top-[0.18em] -z-10 origin-left rounded-[0.15em]"
              style={{ background: color, skewX: -8 }}
              initial={still ? false : { scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : undefined}
              transition={{ duration, ease: [0.65, 0, 0.35, 1], delay: 0.2 + part.mark * (duration + 0.15) }}
            />
            <span className="relative">{part.text}</span>
          </mark>
        ),
      )}
    </p>
  );
});