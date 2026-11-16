"use client";

/**
 * GradientCard, from https://motion-brew.com/components/gradient-card
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { Minus, Plus } from "lucide-react";
import { animate, motion, type MotionValue, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// GradientCard

/**
 * GradientCard
 *
 * Trigger: drag (plus press, hover, wheel, keys and in view). A metric card on
 * a live mesh gradient: soft colour blobs drift on their own under a fine
 * grain, and one of them leans toward the pointer. The colours follow the
 * value: bright and playful below the reference, warm orange at it, deep reds
 * above it. A glass chip shows the reference. The number is set in a dot
 * matrix, and when it changes each dot fades and swells on or off on a
 * spring, so digits morph into each other. At the bottom a frosted panel holds
 * a thermostat style dial: the rim of a wheel of ticks turns under a fixed
 * needle, with a round minus and plus button either side. Drag or flick it
 * (or scroll, or use the keys) and it turns with momentum, the ticks near the
 * needle grow, the number, caption and colours follow, then it springs onto
 * the nearest whole step. When it scrolls into view the card rises in and the
 * dial turns up to the value while the number counts with it. Reduced motion
 * keeps the gradient still and swaps glides for jumps.
 *
 * Engine: motion/react (a motion value for the dial position with inertia
 * and spring snaps, colour blends driven by it, looping keyframes for the
 * blobs, springs for every dot).
 */

export interface GradientCardProps {
  /** Label at the top. Default `"Body age"`. */
  label?: string;
  /** Starting value. Default `25`. */
  value?: number;
  /** Reference the caption compares against, like a calendar age. Default `27.5`. */
  reference?: number;
  /** Lowest value on the dial. Default `18`. */
  min?: number;
  /** Highest value on the dial. Default `90`. */
  max?: number;
  /** Caption for the value; gets the gap to `reference` (negative is below). */
  caption?: (value: number, gap: number) => string;
  /**
   * Gradient colours, four each (core, glow, accent, edge), for a value well
   * below the reference, at it, and well above it. The card blends between
   * them as the value moves. Default bright and playful when younger, warm
   * at the reference, deep reds when older.
   */
  palette?: { young: Palette; even: Palette; old: Palette };
  /** Drift speed of the gradient; `2` is twice as fast. Default `1`. */
  speed?: number;
  /** Called when the value settles on a new step. */
  onChange?: (value: number) => void;
  className?: string;
}

type Palette = [string, string, string, string];

const DEFAULT_PALETTE = {
  // Younger: bright and playful.
  young: ["#ff4fa3", "#ffc93c", "#8b5cf6", "#38d6c4"] as Palette,
  // Around the reference: warm orange.
  even: ["#f07a1f", "#f3a52b", "#e98a9a", "#b9c4d4"] as Palette,
  // Older: a deep mix of reds.
  old: ["#e3262f", "#ff5a36", "#9e1238", "#4a1621"] as Palette,
};

const defaultCaption = (_: number, gap: number) => {
  const g = Math.abs(gap);
  const n = Number.isInteger(g) ? g.toFixed(0) : g.toFixed(1);
  if (g < 0.05) return "Right in step with your years";
  return `${n} ${g === 1 ? "year" : "years"} ${gap < 0 ? "ahead of the clock" : "behind the clock"}`;
};

// 5 by 7 dot glyphs for the digits, one string per row.
const GLYPHS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
};

const DOT_SPRING = { type: "spring", stiffness: 520, damping: 30 } as const;
const SNAP = { type: "spring", stiffness: 260, damping: 30 } as const;
const GLIDE = [0.22, 1, 0.36, 1] as const;
// The dial: ticks sit on a large wheel whose top edge shows through the panel.
const RADIUS = 300; // px
const STEP = 2.4; // degrees between ticks
const UNIT = (RADIUS * STEP * Math.PI) / 180; // px of drag per step

/** One digit as a 5 by 7 grid of dots; each dot springs on or off on its own. */
function DotDigit({ ch, still }: { ch: string; still: boolean }) {
  const rows = GLYPHS[ch] ?? GLYPHS["0"]!;
  return (
    <span className="grid grid-cols-5 gap-[3px]" aria-hidden>
      {rows.flatMap((row, r) =>
        Array.from(row).map((bit, c) => {
          const on = bit === "1";
          return (
            <motion.span
              key={`${r}-${c}`}
              className="size-[6px] rounded-full bg-white"
              initial={false}
              animate={{ opacity: on ? 1 : 0.1, scale: on ? 1 : 0.55 }}
              // A sweep from the top left, so a change reads as a morph.
              transition={
                still
                  ? { duration: 0 }
                  : { ...DOT_SPRING, delay: (r + c) * 0.008 }
              }
            />
          );
        }),
      )}
    </span>
  );
}

function Tick({
  i,
  min,
  pos,
}: {
  i: number;
  min: number;
  pos: MotionValue<number>;
}) {
  const v = min + i;
  const major = v % 5 === 0;
  // Ticks swell as they near the marker.
  const scaleY = useTransform(pos, (p) => {
    const d = v - p;
    return 1 + 0.8 * Math.exp(-(d * d) / 14);
  });
  const opacity = useTransform(pos, (p) => {
    const d = Math.abs(v - p);
    return Math.max(0.3, 0.9 - d * 0.035);
  });
  return (
    // Spun to its place on the wheel; the tick hangs inward from the rim.
    <span
      className="absolute left-0 top-0"
      style={{ transform: `rotate(${i * STEP}deg)` }}
    >
      <motion.span
        className="absolute left-[-0.75px] w-[1.5px] origin-top rounded-full bg-white"
        style={{ top: -RADIUS, height: major ? 16 : 9, scaleY, opacity }}
      />
      {/* Every tenth step is numbered inside the rim. */}
      {v % 10 === 0 && (
        <span
          className="absolute w-8 -translate-x-1/2 text-center text-xs font-medium tabular-nums text-white/75"
          style={{ top: -RADIUS + 30 }}
        >
          {v}
        </span>
      )}
    </span>
  );
}

/** A round frosted step button, in the library's round button style. */
function StepButton({
  label,
  onPress,
  still,
  children,
}: {
  label: string;
  onPress: () => void;
  still: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onPress}
      whileHover={still ? undefined : { scale: 1.06 }}
      whileTap={still ? undefined : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 26 }}
      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-white/20 text-white outline-none ring-1 ring-white/25 transition-colors hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/70"
    >
      {children}
    </motion.button>
  );
}

export const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  function GradientCard(
    {
      label = "Body age",
      value: initial = 25,
      reference = 27.5,
      min = 18,
      max = 90,
      caption = defaultCaption,
      palette = DEFAULT_PALETTE,
      speed = 1,
      onChange,
      className,
    },
    ref,
  ) {
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const still = !!useReducedMotion();
    const inView = useInView(root, { once: true, amount: 0.4 });
    const shown = inView || still;
    const clamp = (v: number) => Math.min(max, Math.max(min, v));
    const target = clamp(Math.round(initial));

    // The dial position, in value units. It starts low and runs up on the way in.
    const pos = useMotionValue(still ? target : clamp(target - 12));
    const [shownValue, setShownValue] = React.useState(Math.round(pos.get()));
    useMotionValueEvent(pos, "change", (p) => {
      const r = Math.round(clamp(p));
      setShownValue((cur) => (cur === r ? cur : r));
    });
    const settled = React.useRef(target);
    const settle = (v: number) => {
      if (settled.current !== v) {
        settled.current = v;
        onChange?.(v);
      }
    };

    React.useEffect(() => {
      if (!shown || still) return;
      const c = animate(pos, target, {
        duration: 1.4,
        delay: 0.25,
        ease: GLIDE,
      });
      return () => c.stop();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shown]);

    const snapTo = (v: number, velocity = 0) => {
      const to = clamp(Math.round(v));
      animate(pos, to, still ? { duration: 0 } : { ...SNAP, velocity });
      settle(to);
    };

    // Drag with momentum: follow the hand, then coast and land on a whole step.
    const drag = React.useRef<{
      x: number;
      p: number;
      t: number;
      v: number;
    } | null>(null);
    const onDown = (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      pos.stop();
      drag.current = { x: e.clientX, p: pos.get(), t: performance.now(), v: 0 };
    };
    const onMove = (e: React.PointerEvent) => {
      const g = drag.current;
      if (!g) return;
      const now = performance.now();
      let next = g.p - (e.clientX - g.x) / UNIT;
      // Rubber band past either end.
      if (next < min) next = min - (min - next) * 0.3;
      if (next > max) next = max + (next - max) * 0.3;
      const dt = Math.max(1, now - g.t);
      g.v = g.v * 0.6 + ((next - pos.get()) / dt) * 1000 * 0.4;
      g.t = now;
      pos.set(next);
    };
    const onUp = () => {
      const g = drag.current;
      if (!g) return;
      drag.current = null;
      snapTo(pos.get() + Math.max(-12, Math.min(12, g.v * 0.22)), g.v);
    };
    const wheelEnd = React.useRef(0);
    const onWheel = (e: React.WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      pos.stop();
      pos.set(clamp(pos.get() + d / UNIT / 2));
      window.clearTimeout(wheelEnd.current);
      wheelEnd.current = window.setTimeout(() => snapTo(pos.get()), 140);
    };

    // The marker gives a tiny knock each time a whole step passes under it.
    const knock = useSpring(0, { stiffness: 900, damping: 18 });
    const last = React.useRef(shownValue);
    React.useEffect(() => {
      if (last.current !== shownValue && !still) {
        knock.set(shownValue > last.current ? -2 : 2);
        window.setTimeout(() => knock.set(0), 40);
      }
      last.current = shownValue;
    }, [shownValue, knock, still]);

    // The dial turns so the current value sits under the marker.
    const dialRotate = useTransform(pos, (p) => -(p - min) * STEP);
    // The gradient blends from bright and playful (younger) through warm
    // orange (at the reference) to deep reds (older) as the dial turns.
    const stops = [reference - 10, reference, reference + 14];
    const blend = (k: number) => [
      palette.young[k]!,
      palette.even[k]!,
      palette.old[k]!,
    ];
    const c0 = useTransform(pos, stops, blend(0));
    const c1 = useTransform(pos, stops, blend(1));
    const c2 = useTransform(pos, stops, blend(2));
    const c3 = useTransform(pos, stops, blend(3));

    // One blob leans toward the pointer.
    const px = useSpring(0, { stiffness: 60, damping: 18 });
    const py = useSpring(0, { stiffness: 60, damping: 18 });
    const onHover = (e: React.PointerEvent) => {
      if (still) return;
      const r = root.current!.getBoundingClientRect();
      px.set(((e.clientX - r.left) / r.width - 0.5) * 120);
      py.set(((e.clientY - r.top) / r.height - 0.5) * 90);
    };

    const gap = Math.round((shownValue - reference) * 10) / 10;
    const digits = String(shownValue).split("");
    const k = 1 / Math.max(0.1, speed);

    return (
      <motion.div
        ref={root}
        onPointerMove={onHover}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        initial={still ? false : { opacity: 0, y: 24, scale: 0.97 }}
        animate={shown ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ duration: 0.7, ease: GLIDE }}
        className={cn(
          "relative isolate h-[300px] w-[400px] max-w-full overflow-hidden rounded-[28px] text-white shadow-[0_2px_6px_rgba(0,0,0,0.06),0_24px_48px_-24px_rgba(0,0,0,0.35)]",
          className,
        )}
        style={{ backgroundColor: c3 }}
      >
        {/* The live gradient: soft blobs drifting under one blur. It spills
            past the card so its soft edge never shows, and Safari on iPhone
            does not always clip a blurred, moving layer to rounded corners,
            so a clip-path holds it to the card's shape. */}
        <div aria-hidden className="absolute inset-0 -z-10 [clip-path:inset(0_round_28px)]">
        <div className="absolute -inset-16">
          <div className="absolute inset-0 blur-[48px]">
            <motion.span
              className="absolute left-[30%] top-[25%] size-[70%] rounded-full"
              style={{ backgroundColor: c0 }}
              animate={
                still
                  ? undefined
                  : {
                      x: [0, 40, -20, 0],
                      y: [0, -20, 30, 0],
                      scale: [1, 1.1, 0.95, 1],
                    }
              }
              transition={{
                duration: 14 * k,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.span
              className="absolute left-[10%] top-[30%] size-[55%] rounded-full"
              style={{ backgroundColor: c1 }}
              animate={
                still ? undefined : { x: [0, -30, 30, 0], y: [0, 30, -10, 0] }
              }
              transition={{
                duration: 17 * k,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.span
              className="absolute right-[0%] top-[0%] size-[50%] rounded-full"
              style={{ backgroundColor: c2 }}
              animate={
                still ? undefined : { x: [0, -40, 10, 0], y: [0, 20, 40, 0] }
              }
              transition={{
                duration: 19 * k,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.span
              className="absolute left-[35%] top-[35%] size-[40%] rounded-full"
              style={{ backgroundColor: c0, x: px, y: py, opacity: 0.85 }}
            />
          </div>
        </div>
        </div>
        {/* A fine grain over the colour, and a soft light at the top. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/10 to-transparent"
        />

        <div className="flex h-full flex-col px-6 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium tracking-tight text-white">
              {label}
            </p>
            {/* A glass chip with the reference the caption compares against. */}
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/20 px-3 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-white" />
              Your years {reference}
            </span>
          </div>

          <p className="mt-6 flex gap-[10px]" aria-hidden>
            {digits.map((d, i) => (
              <DotDigit key={digits.length - i} ch={d} still={still} />
            ))}
          </p>
          <motion.p
            key={caption(shownValue, gap)}
            className="mt-3 text-sm text-white/90"
            initial={still ? false : { opacity: 0, y: 4, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: GLIDE }}
          >
            {caption(shownValue, gap)}
          </motion.p>

          {/* The dial, in a frosted panel with a round step button each side. */}
          <div className="relative -mx-2 mb-4 mt-auto flex h-[88px] items-center gap-1 rounded-[22px] bg-white/15 px-2 ring-1 ring-white/25 backdrop-blur-md">
            <StepButton
              label="Step down"
              onPress={() => snapTo(settled.current - 1)}
              still={still}
            >
              <Minus aria-hidden className="size-4" />
            </StepButton>
            {/* Drag, flick, scroll or use the arrow keys. */}
            <div
              role="slider"
              tabIndex={0}
              aria-label={label}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={shownValue}
              aria-valuetext={`${shownValue}, ${caption(shownValue, gap)}`}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onWheel={onWheel}
              onKeyDown={(e) => {
                const by: Record<string, number> = {
                  ArrowLeft: -1,
                  ArrowDown: -1,
                  ArrowRight: 1,
                  ArrowUp: 1,
                  PageDown: -5,
                  PageUp: 5,
                };
                let to: number | null = null;
                if (e.key in by) to = settled.current + by[e.key]!;
                else if (e.key === "Home") to = min;
                else if (e.key === "End") to = max;
                if (to === null) return;
                e.preventDefault();
                snapTo(to);
              }}
              className="relative h-full min-w-0 flex-1 cursor-grab touch-none select-none overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:cursor-grabbing"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 26%, black 74%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 26%, black 74%, transparent)",
              }}
            >
              {/* The wheel's centre sits far below; only its rim shows. */}
              <motion.div
                className="absolute left-1/2 size-0"
                style={{ top: 16 + RADIUS, rotate: dialRotate }}
              >
                {Array.from({ length: max - min + 1 }, (_, i) => (
                  <Tick key={i} i={i} min={min} pos={pos} />
                ))}
              </motion.div>
              {/* The fixed marker: a glowing needle with a small cap. */}
              <motion.span
                aria-hidden
                className="absolute left-1/2 top-2 flex -translate-x-1/2 flex-col items-center"
                style={{ x: knock }}
              >
                <span className="size-1.5 rounded-full bg-white" />
                <span className="mt-0.5 h-6 w-[3px] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
              </motion.span>
            </div>
            <StepButton
              label="Step up"
              onPress={() => snapTo(settled.current + 1)}
              still={still}
            >
              <Plus aria-hidden className="size-4" />
            </StepButton>
          </div>
        </div>
      </motion.div>
    );
  },
);