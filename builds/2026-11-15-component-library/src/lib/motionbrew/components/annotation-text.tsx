"use client";

/**
 * AnnotationText, from https://motion-brew.com/components/annotation-text
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

// AnnotationText

/**
 * AnnotationText
 *
 * Trigger: in view. Hand-drawn pen marks draw themselves around words when they
 * scroll into view: an underline, a circle, a box or a strike-through, each with
 * a slightly wobbly stroke so it reads as drawn, not ruled. Chain several with
 * `delay`. Reduced motion shows the marks already drawn.
 *
 * Engine: motion/react (pathLength on SVG paths sized to the measured word).
 */

export type AnnotationType = "underline" | "circle" | "box" | "strike";

export interface AnnotationTextProps {
  children: React.ReactNode;
  /** Mark to draw. Default `"underline"`. */
  type?: AnnotationType;
  /** Pen color. Default a warm red. */
  color?: string;
  /** Stroke width, px. Default `2.5`. */
  strokeWidth?: number;
  /** Seconds to wait before drawing, for chaining marks. Default `0`. */
  delay?: number;
  /** Seconds the stroke takes. Default `0.7`. */
  duration?: number;
  className?: string;
}

/** Small deterministic wobble so the stroke looks hand drawn but never changes between renders. */
const jitter = (n: number) => Math.sin(n * 12.9898) * 1.6;

function markPath(type: AnnotationType, w: number, h: number) {
  switch (type) {
    case "underline":
      return `M -2 ${h + 2 + jitter(1)} Q ${w / 2} ${h + 5 + jitter(2)} ${w + 3} ${h + 1 + jitter(3)}`;
    case "strike":
      return `M -3 ${h * 0.55 + jitter(4)} Q ${w / 2} ${h * 0.5 + jitter(5)} ${w + 3} ${h * 0.52 + jitter(6)}`;
    case "box":
      return `M -5 ${-3 + jitter(7)} L ${w + 5} ${-4 + jitter(8)} L ${w + 4 + jitter(9)} ${h + 4} L ${-4} ${h + 3 + jitter(10)} Z`;
    case "circle": {
      // Slightly more than one turn, so the ends overlap like a quick pen loop.
      const cx = w / 2;
      const cy = h / 2;
      const rx = w / 2 + 7;
      const ry = h / 2 + 4;
      const pts: string[] = [];
      for (let k = 0; k <= 26; k++) {
        const t = (k / 24) * Math.PI * 2 - Math.PI / 1.6;
        const wob = 1 + jitter(k + 11) * 0.02;
        pts.push(`${(cx + Math.cos(t) * rx * wob).toFixed(1)} ${(cy + Math.sin(t) * ry * wob).toFixed(1)}`);
      }
      return `M ${pts.join(" L ")}`;
    }
  }
}

export function AnnotationText({
  children,
  type = "underline",
  color = "#e5484d",
  strokeWidth = 2.5,
  delay = 0,
  duration = 0.7,
  className,
}: AnnotationTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const still = useReducedMotion();
  const [box, setBox] = React.useState({ w: 0, h: 0 });

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <span ref={ref} className={cn("relative inline-block whitespace-nowrap", className)}>
      {box.w > 0 && (
        <svg
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width={box.w}
          height={box.h}
        >
          <motion.path
            d={markPath(type, box.w, box.h)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={still ? false : { pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : undefined}
            transition={{ pathLength: { duration, ease: [0.65, 0, 0.35, 1], delay }, opacity: { duration: 0.01, delay } }}
          />
        </svg>
      )}
      <span className="relative">{children}</span>
    </span>
  );
}