"use client";

/**
 * PixelBlast, from https://motion-brew.com/components/pixel-blast
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// PixelBlast

/**
 * PixelBlast
 *
 * Trigger: hover and press (plus in view). A background of dithered pixel
 * clouds. A few soft cloud bodies wander the whole area on slow looping
 * paths, their edges torn by noise, drawn through an ordered (Bayer) dither as
 * a grid of dots that grow and shrink in steps; every dot shimmers on its own
 * beat, and an optional perspective floor of dots rolls toward you along the
 * bottom. The pointer lights the pixels up around it, a press sends a ripple
 * ring out through the field, and while the pointer is away a ripple rises on
 * its own now and then. On the way in the pixels spread out from the centre
 * behind a bright edge. Put anything on top as children. Reduced motion draws
 * a single still frame.
 *
 * Engine: canvas 2D on one requestAnimationFrame loop that pauses off screen,
 * with motion/react's useInView for the entrance.
 */

export type PixelBlastShape = "square" | "circle" | "diamond";

export interface PixelBlastProps {
  /** Pixel colour. Default `"#252528"`. */
  color?: string;
  /** Grid cell in px; the largest dot fills most of a cell. Default `6`. */
  cellSize?: number;
  /** Dot shape. Default `"square"`. */
  shape?: PixelBlastShape;
  /** Drift and shimmer speed; `2` is twice as fast. Default `1`. */
  speed?: number;
  /** How much of the area the clouds cover; `2` makes each cloud twice as wide. Default `1.4`. */
  coverage?: number;
  /** How heavy the clouds are: higher fills them with bigger, bolder dots. Default `0.8`. */
  density?: number;
  /** Draw the perspective floor of dots along the bottom. Default `false`. */
  floor?: boolean;
  /** Light up under the pointer and ripple on press. Default `true`. */
  interactive?: boolean;
  /** Content laid over the field. */
  children?: React.ReactNode;
  className?: string;
}

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
  shape: PixelBlastShape;
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

export const PixelBlast = React.forwardRef<HTMLDivElement, PixelBlastProps>(
  function PixelBlast(
    {
      color = "#252528",
      cellSize = 6,
      shape = "square",
      speed = 1,
      coverage = 1.4,
      density = 0.8,
      floor = false,
      interactive = true,
      children,
      className,
    },
    ref,
  ) {
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const still = !!useReducedMotion();
    const inView = useInView(root, { once: true, amount: 0.2 });
    const pointer = React.useRef({ x: -999, y: -999, on: false });
    const ripples = React.useRef<Ripple[]>([]);
    const reveal = React.useRef(-1);
    React.useEffect(() => {
      if (inView || still) reveal.current = -2;
    }, [inView, still]);

    const local = (e: React.PointerEvent) => {
      const r = root.current!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    return (
      <div
        ref={root}
        onPointerMove={
          interactive
            ? (e) => void (pointer.current = { ...local(e), on: true })
            : undefined
        }
        onPointerLeave={
          interactive
            ? () => void (pointer.current = { ...pointer.current, on: false })
            : undefined
        }
        onPointerDown={
          // t < 0 marks it new; the field stamps it with its own clock.
          interactive
            ? (e) => void ripples.current.push({ ...local(e), t: -1 })
            : undefined
        }
        className={cn(
          "relative isolate min-h-[320px] w-full overflow-hidden",
          className,
        )}
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
        {children}
      </div>
    );
  },
);