"use client";

/**
 * PixelScroll, from https://motion-brew.com/components/pixel-scroll
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { useMotionValueEvent, useScroll } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// PixelScroll

/**
 * PixelScroll
 *
 * Trigger: scroll. A scroll-driven pixel transition. A tall track scrolls past
 * a sticky stage, and as it does a grid of pixels flips from state A to state
 * B. Colors mode goes from one color to another, with optional accent pixels
 * flickering in the moving band; two-layer mode goes from image A to image B.
 * Direction sets where the flip starts (top, bottom, left, right, center out or
 * in), pattern breaks up the front (random, checker, diagonal, wave, spiral,
 * radial) and intensity sets how much the pattern wins over the direction.
 * Easing shapes the timing and End At sets how far through the scroll the
 * transition finishes. Pixels that have settled fill their gaps, so the result
 * is seamless; the grid only shows along the moving front. Scrolling is the
 * user's own input, so it runs under reduced motion too.
 *
 * Engine: motion/react (useScroll for progress; one canvas redrawn only when the
 * progress changes).
 */

export type PixelDirection =
  | "top-bottom"
  | "bottom-top"
  | "left-right"
  | "right-left"
  | "center-out"
  | "center-in";
export type PixelPattern =
  "random" | "checker" | "diagonal" | "wave" | "spiral" | "radial";
export type PixelEasing =
  "linear" | "ease-in" | "ease-out" | "ease-in-out" | "expo-out";

export interface PixelScrollProps {
  /** `"colors"` flips color A to color B; `"layers"` flips image A to image B. Default `"colors"`. */
  mode?: "colors" | "layers";
  /** Start color (colors mode). Default the light card gray. */
  from?: string;
  /** End color (colors mode). Default ink. */
  to?: string;
  /** Start image (layers mode). */
  layerA?: string;
  /** End image (layers mode). */
  layerB?: string;
  /** Pixel size, px. Default `16`. */
  pixelSize?: number;
  /** Gap between pixels along the moving front, px. Default `0`. */
  gap?: number;
  /** How much of the transition already shows before any scrolling, 0 to 0.5, so there is a hint of it at rest. Default `0.08`. */
  startAt?: number;
  /** How far through the scroll the transition finishes, 0.1 to 1. Default `0.8`. */
  endAt?: number;
  /** Where the flip starts. Default `"bottom-top"`. */
  direction?: PixelDirection;
  /** How the front is broken up. Default `"random"`. */
  pattern?: PixelPattern;
  /** How strongly the pattern shifts each pixel's timing, 0 to 1. Default `0.45`. */
  intensity?: number;
  /** Timing curve. Default `"ease-in-out"`. */
  easing?: PixelEasing;
  /** Share of pixels in the moving band that flash an accent, 0 to 1. Default `0.25`. */
  accentShare?: number;
  /** Up to four accent colors. */
  accents?: string[];
  /** Scroll length in screens (or container heights). Default `3`. */
  length?: number;
  /** Scroll inside this element instead of the page. */
  container?: React.RefObject<HTMLElement | null>;
  /** Content laid over the stage. */
  children?: React.ReactNode;
  /** Describes the visual for screen readers. Leave empty if it is decorative. */
  label?: string;
  className?: string;
}

const EASE: Record<PixelEasing, (t: number) => number> = {
  linear: (t) => t,
  "ease-in": (t) => t * t * t,
  "ease-out": (t) => 1 - (1 - t) ** 3,
  "ease-in-out": (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  "expo-out": (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
};

/** Stable pseudo-random value per cell. */
const hash = (c: number, r: number) => {
  const x = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const frac = (v: number) => v - Math.floor(v);

/** Draw an image covering the box, like object-fit: cover. */
function cover(img: HTMLImageElement, W: number, H: number) {
  const k = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const w = img.naturalWidth * k;
  const h = img.naturalHeight * k;
  return [(W - w) / 2, (H - h) / 2, w, h] as const;
}

function useImage(src?: string) {
  const [img, setImg] = React.useState<HTMLImageElement | null>(null);
  React.useEffect(() => {
    if (!src) return setImg(null);
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = src;
  }, [src]);
  return img;
}

export const PixelScroll = React.forwardRef<HTMLDivElement, PixelScrollProps>(
  function PixelScroll(
    {
      mode = "colors",
      from = "#f5f5f5",
      to = "#242423",
      layerA,
      layerB,
      pixelSize = 16,
      gap = 0,
      endAt = 0.8,
      startAt = 0.08,
      direction = "bottom-top",
      pattern = "random",
      intensity = 0.45,
      easing = "ease-in-out",
      accentShare = 0.25,
      accents = ["#3d66d6", "#d6498f", "#9150e0", "#269a5a"],
      length = 3,
      container,
      children,
      label,
      className,
    },
    ref,
  ) {
    const track = React.useRef<HTMLDivElement>(null);
    const stage = React.useRef<HTMLDivElement>(null);
    const canvas = React.useRef<HTMLCanvasElement>(null);
    const [size, setSize] = React.useState({ w: 0, h: 0 });
    const imgA = useImage(mode === "layers" ? layerA : undefined);
    const imgB = useImage(mode === "layers" ? layerB : undefined);

    const { scrollYProgress } = useScroll({
      target: track,
      container,
      offset: ["start start", "end end"],
    });

    React.useLayoutEffect(() => {
      const el = stage.current;
      if (!el) return;
      const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    // Each cell's threshold: when (0 to 1 of the eased progress) it flips. Rebuilt only when the grid or pattern changes.
    const grid = React.useMemo(() => {
      const step = Math.max(2, pixelSize + gap);
      const cols = Math.ceil(size.w / step) || 0;
      const rows = Math.ceil(size.h / step) || 0;
      const th = new Float32Array(cols * rows);
      const pick = new Float32Array(cols * rows);
      const cx = (cols - 1) / 2;
      const cy = (rows - 1) / 2;
      const maxD = Math.hypot(cx, cy) || 1;
      const k = Math.max(0, Math.min(1, intensity));
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const d = Math.hypot(c - cx, r - cy) / maxD;
          const base =
            direction === "top-bottom"
              ? r / Math.max(1, rows - 1)
              : direction === "bottom-top"
                ? 1 - r / Math.max(1, rows - 1)
                : direction === "left-right"
                  ? c / Math.max(1, cols - 1)
                  : direction === "right-left"
                    ? 1 - c / Math.max(1, cols - 1)
                    : direction === "center-out"
                      ? d
                      : 1 - d;
          const h = hash(c, r);
          const pv =
            pattern === "random"
              ? h
              : pattern === "checker"
                ? ((c + r) % 2) * 0.7 + h * 0.3
                : pattern === "diagonal"
                  ? frac((c + r) / 9) * 0.85 + h * 0.15
                  : pattern === "wave"
                    ? 0.5 +
                      0.42 * Math.sin(c * 0.45 + r * 0.18) +
                      (h - 0.5) * 0.16
                    : pattern === "spiral"
                      ? frac(
                          Math.atan2(r - cy, c - cx) / (Math.PI * 2) +
                            0.5 +
                            d * 2.2,
                        ) *
                          0.9 +
                        h * 0.1
                      : frac(d * 4) * 0.85 + h * 0.15;
          th[r * cols + c] = (1 - k) * base + k * pv;
          pick[r * cols + c] = hash(c + 91, r + 17);
        }
      return { step, cols, rows, th, pick };
    }, [size, pixelSize, gap, direction, pattern, intensity]);

    const draw = React.useCallback(
      (raw: number) => {
        const c = canvas.current;
        if (!c || !size.w || !grid.cols) return;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if (c.width !== Math.round(size.w * dpr)) {
          c.width = Math.round(size.w * dpr);
          c.height = Math.round(size.h * dpr);
        }
        const ctx = c.getContext("2d")!;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const W = size.w;
        const H = size.h;
        // A little of the transition shows at rest (startAt); scrolling carries it the rest of the way by endAt.
        const head = Math.max(0, Math.min(0.5, startAt));
        const t =
          head +
          (1 - head) *
            EASE[easing](Math.max(0, Math.min(1, raw / Math.max(0.05, endAt))));
        // The band: pixels within this much of their threshold are mid-flip (gapped, maybe an accent).
        const band = 0.07;
        // Stretch progress so the last pixel (threshold 1) is fully settled at t = 1.
        const p = t * (1 + band * 2) - band;
        const { step, cols, rows, th, pick } = grid;

        const fillA = () => {
          if (mode === "layers" && imgA)
            ctx.drawImage(imgA, ...cover(imgA, W, H));
          else {
            ctx.fillStyle = from;
            ctx.fillRect(0, 0, W, H);
          }
        };
        const drawB = () => {
          if (mode === "layers" && imgB)
            ctx.drawImage(imgB, ...cover(imgB, W, H));
          else {
            ctx.fillStyle = to;
            ctx.fillRect(0, 0, W, H);
          }
        };

        ctx.clearRect(0, 0, W, H);
        fillA();
        if (t <= 0) return;

        // Settled pixels cover their whole cell; pixels in the band leave the gap showing.
        const settled = new Path2D();
        const moving = new Path2D();
        const accentCells: [number, number, string][] = [];
        const inset = gap / 2;
        for (let r = 0; r < rows; r++)
          for (let q = 0; q < cols; q++) {
            const i = r * cols + q;
            const lead = p - th[i]!;
            if (lead < -band) continue;
            const x = q * step;
            const y = r * step;
            if (lead >= band) settled.rect(x, y, step, step);
            else {
              const s = pick[i]!;
              if (s < accentShare && accents.length)
                accentCells.push([
                  x + inset,
                  y + inset,
                  accents[
                    Math.floor(
                      (s / Math.max(0.0001, accentShare)) * accents.length,
                    ) % accents.length
                  ]!,
                ]);
              else moving.rect(x + inset, y + inset, step - gap, step - gap);
            }
          }
        ctx.save();
        ctx.clip(settled);
        drawB();
        ctx.restore();
        ctx.save();
        ctx.clip(moving);
        drawB();
        ctx.restore();
        for (const [x, y, col] of accentCells) {
          ctx.fillStyle = col;
          ctx.fillRect(x, y, step - gap, step - gap);
        }
      },
      [
        size,
        grid,
        easing,
        endAt,
        startAt,
        mode,
        imgA,
        imgB,
        from,
        to,
        gap,
        accentShare,
        accents,
      ],
    );

    useMotionValueEvent(scrollYProgress, "change", draw);
    React.useEffect(() => draw(scrollYProgress.get()), [draw, scrollYProgress]);

    const inContainer = !!container;
    return (
      <div
        ref={(el) => {
          track.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        className={cn("relative w-full", className)}
        style={{
          height: inContainer ? `${length * 100}%` : `${length * 100}vh`,
        }}
      >
        <div
          ref={stage}
          className="sticky top-0 w-full overflow-hidden"
          style={{ height: inContainer ? `${100 / length}%` : "100vh" }}
          {...(label ? { role: "img", "aria-label": label } : {})}
        >
          <canvas
            ref={canvas}
            aria-hidden
            className="absolute inset-0 size-full"
          />
          {children && <div className="relative h-full">{children}</div>}
        </div>
      </div>
    );
  },
);