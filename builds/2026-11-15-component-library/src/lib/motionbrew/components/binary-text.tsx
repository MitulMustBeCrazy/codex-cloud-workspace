"use client";

/**
 * BinaryText, from https://motion-brew.com/components/binary-text
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { animate, type AnimationPlaybackControls, useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// BinaryText

/**
 * BinaryText
 *
 * Trigger: hover (and in view). The text scrambles into 0s and 1s, then decodes
 * left to right back into the real characters. It plays when it first scrolls
 * into view and again on every hover or focus. A monospace face keeps widths
 * steady while it churns. Screen readers only ever get the real text.
 *
 * Engine: motion/react (one animated progress value drives the decode; letters
 * left of it are settled, the rest flicker).
 */

export interface BinaryTextProps {
  /** The text to decode. Default `"Access granted"`. */
  text?: string;
  /** Seconds for the full decode. Default `1.1`. */
  duration?: number;
  /** Characters used while scrambling. Default `"01"`. */
  charset?: string;
  /** Element to render. Default `"p"`. */
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
}

export const BinaryText = React.forwardRef<HTMLElement, BinaryTextProps>(function BinaryText(
  { text = "Access granted", duration = 1.1, charset = "01", as: Tag = "p", className },
  forwardedRef,
) {
  const ref = React.useRef<HTMLElement>(null);
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const still = useReducedMotion();
  const [shown, setShown] = React.useState(text);
  const run = React.useRef<AnimationPlaybackControls | null>(null);

  const play = React.useCallback(() => {
    if (still) return;
    run.current?.stop();
    const chars = Array.from(text);
    run.current = animate(0, chars.length, {
      duration,
      ease: "linear",
      onUpdate: (p) => {
        setShown(
          chars
            .map((ch, i) =>
              ch === " " || i < Math.floor(p) ? ch : charset[Math.floor(Math.random() * charset.length)]!,
            )
            .join(""),
        );
      },
      onComplete: () => setShown(text),
    });
  }, [text, duration, charset, still]);

  React.useEffect(() => {
    if (inView) play();
  }, [inView, play]);
  React.useEffect(() => () => run.current?.stop(), []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      aria-label={text}
      tabIndex={0}
      onPointerEnter={play}
      onFocus={play}
      className={cn("cursor-default whitespace-pre font-mono tabular-nums outline-none", className)}
    >
      <span aria-hidden>{shown}</span>
    </Tag>
  );
});