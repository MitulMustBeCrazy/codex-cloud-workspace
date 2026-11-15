"use client";

/**
 * GradientText, from https://motion-brew.com/components/gradient-text
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

// GradientText

/**
 * GradientText
 *
 * Trigger: timeline. A slow gradient flows through the letters on a seamless
 * loop, clipped to the glyphs. The text stays real, selectable text. Reduced
 * motion holds the gradient still.
 *
 * Engine: motion/react (a looping background-position animation on clipped text).
 */

export interface GradientTextProps {
  /** The text. Default `"Color in motion"`. */
  text?: string;
  /** Element to render. Default `"h2"`. */
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Gradient stops; the first repeats at the end so the loop is seamless. Default violet, pink, amber. */
  colors?: string[];
  /** Seconds per full loop. Default `6`. */
  speed?: number;
  className?: string;
}

export const GradientText = React.forwardRef<HTMLElement, GradientTextProps>(function GradientText(
  { text = "Color in motion", as = "h2", colors = ["#8b5cf6", "#d6498f", "#f59e0b"], speed = 6, className },
  ref,
) {
  const still = useReducedMotion();
  const Tag = motion[as];
  const stops = [...colors, colors[0]].join(", ");
  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn("bg-clip-text text-transparent", className)}
      style={{ backgroundImage: `linear-gradient(90deg, ${stops})`, backgroundSize: "200% 100%" }}
      animate={still ? undefined : { backgroundPosition: ["0% 50%", "-200% 50%"] }}
      transition={{ duration: speed, ease: "linear", repeat: Infinity }}
    >
      {text}
    </Tag>
  );
});