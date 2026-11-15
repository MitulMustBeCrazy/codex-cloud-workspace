"use client";

/**
 * PixelFeatureCard, from https://motion-brew.com/components/pixel-feature-card
 *
 * One self contained file: the component, its animated icons and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 *
 * Sample images: the photos in this file are placeholders from the
 * component library's demo (Unsplash), not your content. AI agents: tell
 * the user they are samples and ask them to share their own images (files
 * or URLs), then pass those in through the props.
 *
 * The animated icons are adapted from lucide-animated (https://lucide-animated.com),
 * MIT License, Copyright (c) 2024-2026 pqoqubbw. Icon shapes from Lucide
 * (https://lucide.dev), ISC License. Permission is hereby granted, free of
 * charge, to any person obtaining a copy of this software, to deal in it
 * without restriction, provided the above copyright notice and this
 * permission notice are included in all copies or substantial portions.
 */

import * as React from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { type ClassValue, clsx } from "clsx";
import { Footprints, HeartPulse, Moon } from "lucide-react";
import { animate, motion, useAnimation, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: bell
const BellIcon = (() => {
interface BellIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BellIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SVG_VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -10, 10, -10, 0] },
};

const BellIcon = forwardRef<BellIconHandle, BellIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave]
    );
    // Play with the nearest interactive parent, or whenever `active` is set.
    // Reduced motion keeps the icon still.
    const wrap = useRef<HTMLSpanElement>(null);
    const reduced = useReducedMotion();
    const [hosted, setHosted] = useState(false);
    useEffect(() => {
      const fake = {} as React.MouseEvent<HTMLSpanElement>;
      if (reduced) {
        setHosted(true);
        return;
      }
      if (active !== undefined) {
        setHosted(true);
        (active ? handleMouseEnter : handleMouseLeave)(fake);
        return;
      }
      const host = wrap.current?.parentElement?.closest<HTMLElement>("button, a, [role=button], [role=menuitem], [role=tab], [role=switch], [role=radio], label");
      setHosted(!!host);
      if (!host) return;
      const on = () => handleMouseEnter(fake);
      const off = () => handleMouseLeave(fake);
      host.addEventListener("pointerenter", on);
      host.addEventListener("pointerleave", off);
      return () => {
        host.removeEventListener("pointerenter", on);
        host.removeEventListener("pointerleave", off);
      };
    }, [active, reduced, handleMouseEnter, handleMouseLeave]);

    return (
      <span
        ref={wrap}
        className={cn("inline-grid size-6 shrink-0 place-items-center align-middle [&>svg]:size-full", className)}
        style={size ? { width: size, height: size, ...style } : style}
        onMouseEnter={hosted ? undefined : handleMouseEnter}
        onMouseLeave={hosted ? undefined : handleMouseLeave}
        {...props}
      >
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          variants={SVG_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </motion.svg>
      </span>
    );
  }
);

BellIcon.displayName = "BellIcon";
  return BellIcon;
})();

// PixelFeatureCard

/**
 * PixelFeatureCard
 *
 * Trigger: hover and press (plus in view). A product feature card: a phone
 * with a small app screen stands in front of a field of dithered pixel clouds.
 * The clouds are a few soft bodies that wander the whole card on slow looping
 * paths, their edges torn by noise, drawn through an ordered (Bayer) dither as
 * a grid of dots that grow and shrink in steps; every dot shimmers on
 * its own beat, and a perspective floor of dots rolls toward you along the
 * bottom. The pointer lights the pixels up around it, a press sends a ripple
 * ring out through the field, and while the pointer is away a ripple rises on
 * its own now and then. The phone floats in when the card scrolls into view
 * and tilts toward the pointer on springs, and the screen inside builds itself
 * up: the score counts, bars grow and rows slide in. On the way in the card
 * rises and the pixels spread out from the centre behind a bright edge. Reduced motion draws a single still
 * frame and keeps the phone flat.
 *
 * Engine: motion/react (springs for the phone tilt and entrance, staggered
 * screen reveals, a counting motion value) with a canvas 2D field on one
 * requestAnimationFrame loop that pauses off screen.
 */

export type PixelShape = "square" | "circle" | "diamond";

export interface PixelFeatureCardProps {
  /** Pixel colour, also the accent on the default screen. Default `"#252528"`. */
  color?: string;
  /** Grid cell in px; the largest dot fills most of a cell. Default `6`. */
  cellSize?: number;
  /** Dot shape. Default `"square"`. */
  shape?: PixelShape;
  /** Drift and shimmer speed; `2` is twice as fast. Default `1`. */
  speed?: number;
  /** How much of the card the clouds cover; `2` makes each cloud twice as wide. Default `1.4`. */
  coverage?: number;
  /** How heavy the clouds are: higher fills them with bigger, bolder dots. Default `0.8`. */
  density?: number;
  /** Draw the perspective floor of dots along the bottom. Default `false`. */
  floor?: boolean;
  /** What the phone shows. Default a small health app screen. */
  children?: React.ReactNode;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const TILT = { stiffness: 160, damping: 18, mass: 0.6 };

// 4 by 4 ordered dither thresholds, 0 to 1.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => (v + 0.5) / 16,
);

const hash = (x: number, y: number) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const noise = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
};
const fbm = (x: number, y: number) =>
  noise(x, y) * 0.6 +
  noise(x * 2.1, y * 2.1) * 0.3 +
  noise(x * 4.3, y * 4.3) * 0.1;
// Cloud bodies: how far each wanders from the centre (share of the card), how fast, its phase and size.
const CLOUDS = [
  { ax: 0.42, ay: 0.36, fx: 0.23, fy: 0.17, px: 0, py: 1.2, r: 0.2 },
  { ax: 0.46, ay: 0.4, fx: 0.15, fy: 0.21, px: 2.4, py: 4.1, r: 0.17 },
  { ax: 0.38, ay: 0.44, fx: 0.19, fy: 0.13, px: 4.6, py: 0.4, r: 0.15 },
];

// Seconds the entrance takes to spread across the card.
const REVEAL = 1.5;

// Dot sizes as a share of a cell, from nothing to nearly full.
const STEPS = [0, 0, 0.16, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86];
const band = (lo: number, hi: number, v: number) =>
  smooth(Math.min(1, Math.max(0, (v - lo) / (hi - lo))));

interface Ripple {
  x: number;
  y: number;
  t: number;
}

/** The dithered pixel field. Draws into a canvas that fills its parent. */
function PixelField({
  color,
  cell,
  shape,
  speed,
  coverage,
  density,
  floor,
  still,
  pointer,
  ripples,
  reveal,
}: {
  color: string;
  cell: number;
  shape: PixelShape;
  speed: number;
  coverage: number;
  density: number;
  floor: boolean;
  still: boolean;
  pointer: React.MutableRefObject<{ x: number; y: number; on: boolean }>;
  ripples: React.MutableRefObject<Ripple[]>;
  /** When the entrance began on the field's clock: -1 not yet, -2 start on the next frame. */
  reveal: React.MutableRefObject<number>;
}) {
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let time = 0;
    // The glow eases toward the pointer, and fades in and out with it.
    const glow = { x: 0, y: 0, a: 0 };
    let idle = 0;
    // A shimmer phase per dot, worked out once.
    const phases = new Float32Array(4096).map(
      (_, k) => hash(k, 17) * Math.PI * 2,
    );

    const size = () => {
      // Layout size, not the on-screen box: the card scales in on entry.
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const dot = (x: number, y: number, s: number) => {
      if (s < 0.6) return;
      if (shape === "circle") {
        ctx.beginPath();
        ctx.arc(x, y, s / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape === "diamond") {
        const r = s * 0.62;
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y);
        ctx.fill();
      } else {
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    };

    // Extra light at a point from the pointer and the ripples.
    const light = (x: number, y: number) => {
      let l = 0;
      if (glow.a > 0.01) {
        const dx = x - glow.x;
        const dy = y - glow.y;
        l += glow.a * 0.55 * Math.exp(-(dx * dx + dy * dy) / (2 * 54 * 54));
      }
      for (const r of ripples.current) {
        const age = time - r.t;
        const radius = age * 240;
        const d = Math.hypot(x - r.x, y - r.y) - radius;
        const fade = Math.max(0, 1 - age / 1.6);
        l += 0.6 * fade * Math.exp(-(d * d) / (2 * 14 * 14));
      }
      return l;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      // The entrance: pixels spread out from the centre behind a bright edge.
      const start = reveal.current;
      const pr = still
        ? 1
        : start === -1 || start === -2
          ? 0
          : Math.min(1, (time - start) / REVEAL);
      if (pr === 0) return;
      const eased = 1 - Math.pow(1 - pr, 3);
      const reach = (Math.hypot(w, h) / 2 + 90) * eased;
      const cx = w / 2;
      const cy = h / 2;
      const opened = (x: number, y: number) => {
        if (pr >= 1) return { m: 1, edge: 0 };
        const d = Math.hypot(x - cx, y - cy);
        const e = d - reach;
        return {
          m: Math.min(1, Math.max(0, -e / 70)),
          edge: 0.6 * (1 - pr) * Math.exp(-(e * e) / (2 * 14 * 14)),
        };
      };
      const horizon = floor ? h * 0.66 : h * 2;
      const t = time * speed;
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      // Where each cloud body is right now: slow looping paths that cover the whole card.
      const bodies = CLOUDS.map((c) => ({
        x: w * (0.5 + c.ax * Math.sin(t * c.fx + c.px)),
        y: h * (0.5 + c.ay * Math.sin(t * c.fy + c.py)),
        r2: 2 * (c.r * coverage * Math.max(w, h)) ** 2,
      }));

      // The clouds: wandering bodies with noisy edges, through an ordered dither, in stepped dot sizes.
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * cell + cell / 2;
          const y = j * cell + cell / 2;
          const n = fbm(x * 0.0062 + t * 0.045, y * 0.0062 - t * 0.03);
          let body = 0;
          for (const b of bodies) {
            const dx = x - b.x;
            const dy = y - b.y;
            body += Math.exp(-(dx * dx + dy * dy) / b.r2);
          }
          // The bodies set where the clouds are; the noise tears their edges into wisps.
          let v = band(0.3, 0.95, body * (0.45 + 0.9 * n) * density);
          // Thinner over the floor, so the rolling rows still read.
          v *= 1 - 0.55 * band(horizon - 30, horizon + 30, y);
          // Every dot shimmers on its own beat.
          v *=
            0.82 +
            0.18 * Math.sin(t * 2.4 + phases[(j * cols + i) % phases.length]!);
          const o = opened(x, y);
          v = v * o.m + o.edge + light(x, y) * o.m;
          if (v < 0.04) continue;
          // Ordered dither, then snap to a few dot sizes: dense cores fade out to fine specks.
          const th = BAYER[(j & 3) * 4 + (i & 3)]!;
          const q = Math.min(1, v + (th - 0.5) * 0.32);
          const step =
            STEPS[Math.min(STEPS.length - 1, Math.floor(q * STEPS.length))]!;
          if (!step) continue;
          ctx.globalAlpha = 0.3 + Math.min(1, v) * 0.7;
          dot(x, y, cell * step);
        }
      }

      // The floor: rows of dots on a plane, rolling toward the viewer.
      if (floor) {
        const near = 1;
        const depth = 9;
        const roll = (t * 0.5) % 1;
        const spacing = cell * 3.2;
        const span = Math.ceil(w / spacing) * 3;
        for (let k = depth; k >= 0; k--) {
          const z = near + (k - roll) * 0.8;
          if (z < near * 0.6) continue;
          const p = near / z;
          const y = horizon + (h - horizon) * p * 0.98;
          // Rows fade out toward the horizon so the plane dissolves rather than stripes.
          const fade = Math.pow(Math.min(1, p * 1.1), 1.6);
          for (let c = -span; c <= span; c++) {
            const x = w / 2 + c * spacing * p;
            if (x < -cell || x > w + cell) continue;
            const shimmer =
              0.8 + 0.2 * Math.sin(t * 2 + hash(c, k + 99) * 6.28);
            const o = opened(x, y);
            const v = (fade * 0.75 * shimmer + light(x, y) * p) * o.m;
            ctx.globalAlpha = Math.min(1, v);
            dot(x, y, cell * 0.8 * p);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // The first frame's timestamp can predate `last`; never let the clock run backwards.
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (!visible) return;
      time += dt;
      if (reveal.current === -2) reveal.current = time;
      const p = pointer.current;
      const k = 1 - Math.pow(0.0015, dt);
      glow.x += (p.x - glow.x) * k;
      glow.y += (p.y - glow.y) * k;
      glow.a += ((p.on ? 1 : 0) - glow.a) * (1 - Math.pow(0.02, dt));
      // While the pointer is away, a ripple rises on its own now and then.
      idle = p.on ? 0 : idle + dt;
      if (idle > 3.2) {
        idle = 0;
        ripples.current.push({
          x: w * (0.15 + Math.random() * 0.7),
          y: h * (0.15 + Math.random() * 0.45),
          t: time,
        });
      }
      ripples.current = ripples.current
        .map((r) => (r.t < 0 ? { ...r, t: time } : r))
        .filter((r) => time - r.t < 1.6);
      draw();
    };

    size();
    const ro = new ResizeObserver(() => {
      size();
      if (still) draw();
    });
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => void (visible = !!e?.isIntersecting),
    );
    io.observe(el);
    if (still) {
      time = 3;
      draw();
    } else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [
    color,
    cell,
    shape,
    speed,
    coverage,
    density,
    floor,
    still,
    pointer,
    ripples,
    reveal,
  ]);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}

/** The default phone screen: a small health app in the library's white style. */
function AppScreen({
  shown,
  still,
  accent,
}: {
  shown: boolean;
  still: boolean;
  accent: string;
}) {
  const score = useMotionValue(still ? 88 : 0);
  const text = useTransform(score, (v) => Math.round(v).toString());
  React.useEffect(() => {
    if (!shown || still) return;
    const c = animate(score, 88, {
      duration: 1.2,
      delay: 0.5,
      ease: [0.5, 1, 0.89, 1],
    });
    return () => c.stop();
  }, [shown, still, score]);

  const rise = (i: number) => ({
    initial: still ? false : { opacity: 0, y: 10 },
    animate: shown ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.5, delay: 0.35 + i * 0.08, ease: GLIDE },
  });
  const bars = [0.42, 0.58, 0.5, 0.72, 0.64, 0.8, 0.92];
  const rows = [
    { icon: Moon, label: "Sleep", value: "7h 40m" },
    { icon: Footprints, label: "Steps", value: "8,214" },
    { icon: HeartPulse, label: "Resting heart", value: "62 bpm" },
  ];

  return (
    <div className="flex h-full flex-col px-4 pt-12 text-[#242423]">
      <motion.div className="flex items-center justify-between" {...rise(0)}>
        <div className="flex items-center gap-2.5">
          <img
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces"
            alt=""
            draggable={false}
            className="size-8 rounded-full object-cover"
          />
          <div className="leading-tight">
            <p className="text-xs text-zinc-500">Good morning</p>
            <p className="text-sm font-semibold tracking-tight">Alex Morgan</p>
          </div>
        </div>
        <span className="grid size-8 place-items-center rounded-full bg-[#242423]/[0.06]">
          <BellIcon aria-hidden className="size-4" />
        </span>
      </motion.div>

      <motion.div
        className="mt-4 rounded-2xl bg-[#242423]/[0.05] p-3.5"
        {...rise(1)}
      >
        <div className="flex items-start justify-between">
          <p className="text-xs text-zinc-500">Health score</p>
          <span className="rounded-full bg-[#269a5a]/10 px-2 py-0.5 text-xs font-medium text-[#269a5a]">
            +4
          </span>
        </div>
        <p className="mt-1 text-[32px] font-medium leading-none tracking-tight">
          <motion.span className="tabular-nums">{text}</motion.span>
          <span className="text-base text-zinc-400">/100</span>
        </p>
        <div className="mt-3 flex h-12 items-end gap-1.5">
          {bars.map((v, i) => (
            <motion.span
              key={i}
              className="flex-1 origin-bottom rounded-[4px]"
              style={{
                height: `${v * 100}%`,
                backgroundColor:
                  i === bars.length - 1 ? accent : "rgba(36,36,35,0.12)",
              }}
              initial={still ? false : { scaleY: 0 }}
              animate={shown ? { scaleY: 1 } : undefined}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 18,
                delay: 0.6 + i * 0.05,
              }}
            />
          ))}
        </div>
      </motion.div>

      <div className="mt-3 flex flex-col gap-2">
        {rows.map((r, i) => (
          <motion.div
            key={r.label}
            className="flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04]"
            initial={still ? false : { opacity: 0, x: 16 }}
            animate={shown ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.8 + i * 0.08, ease: GLIDE }}
          >
            <span className="grid size-8 place-items-center rounded-full bg-[#242423]/[0.06]">
              <r.icon aria-hidden className="size-4" />
            </span>
            <span className="flex-1 text-sm">{r.label}</span>
            <span className="text-sm font-medium tabular-nums">{r.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const PixelFeatureCard = React.forwardRef<
  HTMLDivElement,
  PixelFeatureCardProps
>(function PixelFeatureCard(
  {
    color = "#252528",
    cellSize = 6,
    shape = "square",
    speed = 1,
    coverage = 1.4,
    density = 0.8,
    floor = false,
    children,
    className,
  },
  ref,
) {
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => root.current!);
  const still = !!useReducedMotion();
  const inView = useInView(root, { once: true, amount: 0.3 });
  const shown = inView || still;

  const pointer = React.useRef({ x: -999, y: -999, on: false });
  const ripples = React.useRef<Ripple[]>([]);
  const reveal = React.useRef(-1);
  React.useEffect(() => {
    if (shown) reveal.current = -2;
  }, [shown]);

  // Phone tilt toward the pointer.
  const rx = useSpring(0, TILT);
  const ry = useSpring(0, TILT);

  const local = (e: React.PointerEvent) => {
    const r = root.current!.getBoundingClientRect();
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      w: r.width,
      h: r.height,
    };
  };
  const onMove = (e: React.PointerEvent) => {
    const p = local(e);
    pointer.current = { x: p.x, y: p.y, on: true };
    if (still) return;
    ry.set((p.x / p.w - 0.5) * 14);
    rx.set(-(p.y / p.h - 0.5) * 10);
  };
  const onLeave = () => {
    pointer.current = { ...pointer.current, on: false };
    rx.set(0);
    ry.set(0);
  };
  const onDown = (e: React.PointerEvent) => {
    const p = local(e);
    // t < 0 marks it new; the field stamps it with its own clock.
    ripples.current.push({ x: p.x, y: p.y, t: -1 });
  };

  return (
    <motion.div
      ref={root}
      initial={still ? false : { opacity: 0, y: 24, scale: 0.97 }}
      animate={shown ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.7, ease: GLIDE }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
      className={cn(
        "relative h-[440px] w-[560px] max-w-full overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900",
        className,
      )}
      style={{ perspective: 1200 }}
    >
      <PixelField
        color={color}
        cell={Math.max(4, cellSize)}
        shape={shape}
        speed={speed}
        coverage={Math.max(0.3, coverage)}
        density={Math.max(0.2, density)}
        floor={floor}
        still={still}
        pointer={pointer}
        ripples={ripples}
        reveal={reveal}
      />

      {/* The phone, cropped by the bottom of the card. */}
      <motion.div
        className="absolute left-1/2 top-12 -ml-[130px] h-[520px] w-[260px]"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        initial={still ? false : { y: 80, opacity: 0 }}
        animate={shown ? { y: 0, opacity: 1 } : undefined}
        transition={{
          type: "spring",
          stiffness: 90,
          damping: 16,
          mass: 0.9,
          delay: still ? 0 : 0.25,
        }}
      >
        {/* Side buttons */}
        <span
          aria-hidden
          className="absolute -left-[3px] top-28 h-8 w-[3px] rounded-l-full bg-[#242423]"
        />
        <span
          aria-hidden
          className="absolute -left-[3px] top-40 h-14 w-[3px] rounded-l-full bg-[#242423]"
        />
        <span
          aria-hidden
          className="absolute -right-[3px] top-36 h-20 w-[3px] rounded-r-full bg-[#242423]"
        />
        <div className="relative size-full rounded-[46px] bg-[#242423] p-[9px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
          <div className="relative size-full overflow-hidden rounded-[38px] bg-white">
            {/* Dynamic island */}
            <span
              aria-hidden
              className="absolute left-1/2 top-2.5 z-10 flex h-7 w-[88px] -translate-x-1/2 items-center justify-end rounded-full bg-[#242423] pr-2.5"
            >
              <span className="size-2.5 rounded-full bg-[#3a3a48] ring-2 ring-[#1b1b22]" />
            </span>
            {children ?? (
              <AppScreen shown={shown} still={still} accent={color} />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});