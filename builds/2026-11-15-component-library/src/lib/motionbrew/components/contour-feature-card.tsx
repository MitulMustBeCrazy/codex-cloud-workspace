"use client";

/**
 * ContourFeatureCard, from https://motion-brew.com/components/contour-feature-card
 *
 * One self contained file: the component, its animated icons and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
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
import { BarChart3, Home, Inbox, Settings, Users } from "lucide-react";
import { animate, motion, useAnimation, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: search
const SearchIcon = (() => {
interface SearchIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SearchIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SearchIcon = forwardRef<SearchIconHandle, SearchIconProps>(
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
            duration: 1,
            bounce: 0.3,
          }}
          variants={{
            normal: { x: 0, y: 0 },
            animate: {
              x: [0, 0, -3, 0],
              y: [0, -4, 0, 0],
            },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </motion.svg>
      </span>
    );
  }
);

SearchIcon.displayName = "SearchIcon";
  return SearchIcon;
})();

// ContourFeatureCard

/**
 * ContourFeatureCard
 *
 * Trigger: hover and press (plus in view). A product feature card: a browser
 * window with a small dashboard rises in front of a live topographic map.
 * The map is drifting noise traced into contour lines (marching squares),
 * with every fourth line a little heavier like the index lines on a real map.
 * The pointer raises a soft hill, so the lines bend and crowd around it and
 * light up near it; a press sends a ring of a wave out through the terrain,
 * and while the pointer is away one rises on its own now and then. On the way
 * in the card rises, the lines spread out from the centre and the window
 * slides up and tilts toward the pointer, while its dashboard builds itself:
 * the figures count, the chart draws its line and the rows slide in. Reduced
 * motion draws one still frame and keeps the window flat.
 *
 * Engine: motion/react (springs for the window, pathLength for the chart,
 * counting motion values) with a canvas 2D contour field on one
 * requestAnimationFrame loop that pauses off screen.
 */

export interface ContourFeatureCardProps {
  /** Line colour. Default `"#242423"`. */
  color?: string;
  /** How many contour levels to trace; more means tighter lines. Default `14`. */
  lines?: number;
  /** Size of the hills and valleys; higher zooms out. Default `1`. */
  scale?: number;
  /** Drift speed; `2` is twice as fast. Default `1`. */
  speed?: number;
  /** How high the pointer's hill rises. Default `1`. */
  lift?: number;
  /** What the window shows. Default a small analytics dashboard. */
  children?: React.ReactNode;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const TILT = { stiffness: 150, damping: 18, mass: 0.6 };
const REVEAL = 1.5; // seconds for the lines to spread across the card
const CELL = 10; // px per marching squares cell

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

interface Wave {
  x: number;
  y: number;
  t: number;
}

function ContourField({
  color,
  lines,
  scale,
  speed,
  lift,
  still,
  pointer,
  waves,
  reveal,
}: {
  color: string;
  lines: number;
  scale: number;
  speed: number;
  lift: number;
  still: boolean;
  pointer: React.MutableRefObject<{ x: number; y: number; on: boolean }>;
  waves: React.MutableRefObject<Wave[]>;
  /** When the entrance began on the field's clock: -1 not yet, -2 on the next frame. */
  reveal: React.MutableRefObject<number>;
}) {
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let field = new Float32Array(0);
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let time = 0;
    let idle = 0;
    const glow = { x: 0, y: 0, a: 0 };

    const size = () => {
      // Layout size, not the on-screen box: the card scales in on entry.
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      field = new Float32Array(cols * rows);
    };

    // Height of the terrain at a point: drifting noise, the pointer's hill and any waves.
    const sample = () => {
      const t = time * speed;
      const z = 0.0045 / scale;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * CELL;
          const y = j * CELL;
          let v =
            noise(x * z + t * 0.04, y * z - t * 0.025) * 0.65 +
            noise(x * z * 2.2 - t * 0.03, y * z * 2.2 + 3.1) * 0.35;
          if (glow.a > 0.01) {
            const dx = x - glow.x;
            const dy = y - glow.y;
            v +=
              glow.a *
              0.28 *
              lift *
              Math.exp(-(dx * dx + dy * dy) / (2 * 70 * 70));
          }
          for (const wv of waves.current) {
            const age = time - wv.t;
            const d = Math.hypot(x - wv.x, y - wv.y) - age * 220;
            v +=
              0.12 *
              Math.max(0, 1 - age / 1.8) *
              Math.exp(-(d * d) / (2 * 22 * 22));
          }
          field[j * cols + i] = v;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const start = reveal.current;
      const pr = still
        ? 1
        : start === -1 || start === -2
          ? 0
          : Math.min(1, (time - start) / REVEAL);
      if (pr === 0) return;
      sample();

      const step = 1 / (lines + 1);
      const path = new Path2D();
      const major = new Path2D();
      const at = (i: number, j: number) => field[j * cols + i]!;
      for (let l = 1; l <= lines; l++) {
        // Levels spread over the band the terrain actually spans, so every line shows.
        const lv = 0.14 + l * step * 0.78;
        const p = l % 4 === 0 ? major : path;
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const a = at(i, j);
            const b = at(i + 1, j);
            const c = at(i + 1, j + 1);
            const d = at(i, j + 1);
            const k =
              (a > lv ? 8 : 0) |
              (b > lv ? 4 : 0) |
              (c > lv ? 2 : 0) |
              (d > lv ? 1 : 0);
            if (k === 0 || k === 15) continue;
            const x = i * CELL;
            const y = j * CELL;
            // Edge crossings, interpolated.
            const top = () => [x + ((lv - a) / (b - a)) * CELL, y] as const;
            const right = () =>
              [x + CELL, y + ((lv - b) / (c - b)) * CELL] as const;
            const bottom = () =>
              [x + ((lv - d) / (c - d)) * CELL, y + CELL] as const;
            const left = () => [x, y + ((lv - a) / (d - a)) * CELL] as const;
            const seg = (
              p1: readonly [number, number],
              p2: readonly [number, number],
            ) => {
              p.moveTo(p1[0], p1[1]);
              p.lineTo(p2[0], p2[1]);
            };
            switch (k) {
              case 1:
              case 14:
                seg(left(), bottom());
                break;
              case 2:
              case 13:
                seg(bottom(), right());
                break;
              case 3:
              case 12:
                seg(left(), right());
                break;
              case 4:
              case 11:
                seg(top(), right());
                break;
              case 5:
                seg(left(), top());
                seg(bottom(), right());
                break;
              case 6:
              case 9:
                seg(top(), bottom());
                break;
              case 7:
              case 8:
                seg(left(), top());
                break;
              case 10:
                seg(left(), bottom());
                seg(top(), right());
                break;
            }
          }
        }
      }

      // The entrance: lines spread out from the centre.
      ctx.save();
      if (pr < 1) {
        const e = 1 - Math.pow(1 - pr, 3);
        const reach = (Math.hypot(w, h) / 2 + 40) * e;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, Math.max(0.1, reach), 0, Math.PI * 2);
        ctx.clip();
      }
      ctx.lineCap = "round";
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 1;
      ctx.stroke(path);
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 1.4;
      ctx.stroke(major);
      // Lines near the pointer light up.
      if (glow.a > 0.01) {
        const g = ctx.createRadialGradient(
          glow.x,
          glow.y,
          0,
          glow.x,
          glow.y,
          150,
        );
        g.addColorStop(0, color);
        g.addColorStop(1, "transparent");
        ctx.strokeStyle = g;
        ctx.globalAlpha = 0.6 * glow.a;
        ctx.lineWidth = 1.2;
        ctx.stroke(path);
        ctx.stroke(major);
      }
      ctx.restore();
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
      const k = 1 - Math.pow(0.002, dt);
      glow.x += (p.x - glow.x) * k;
      glow.y += (p.y - glow.y) * k;
      glow.a += ((p.on ? 1 : 0) - glow.a) * (1 - Math.pow(0.03, dt));
      idle = p.on ? 0 : idle + dt;
      if (idle > 3.6) {
        idle = 0;
        waves.current.push({
          x: w * (0.15 + Math.random() * 0.7),
          y: h * (0.15 + Math.random() * 0.5),
          t: time,
        });
      }
      waves.current = waves.current
        .map((wv) => (wv.t < 0 ? { ...wv, t: time } : wv))
        .filter((wv) => time - wv.t < 1.8);
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
      time = 4;
      draw();
    } else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [color, lines, scale, speed, lift, still, pointer, waves, reveal]);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}

function Count({
  to,
  shown,
  still,
  delay,
  format,
}: {
  to: number;
  shown: boolean;
  still: boolean;
  delay: number;
  format: (n: number) => string;
}) {
  const v = useMotionValue(still ? to : 0);
  const text = useTransform(v, (n) => format(n));
  React.useEffect(() => {
    if (!shown || still) return;
    const c = animate(v, to, { duration: 1.2, delay, ease: [0.5, 1, 0.89, 1] });
    return () => c.stop();
  }, [shown, still, to, delay, v]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

/** The default window content: a small analytics dashboard in the library's white style. */
function Dashboard({ shown, still }: { shown: boolean; still: boolean }) {
  const rise = (i: number) => ({
    initial: still ? false : { opacity: 0, y: 10 },
    animate: shown ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.5, delay: 0.45 + i * 0.08, ease: GLIDE },
  });
  const chart =
    "M0 52 C 20 48, 30 30, 50 34 S 80 50, 100 38 S 130 12, 150 18 S 185 30, 200 14 S 235 4, 260 8";
  const nav = [Home, BarChart3, Inbox, Users, Settings];
  return (
    <div className="flex h-full text-[#242423]">
      {/* Sidebar */}
      <div className="flex w-12 shrink-0 flex-col items-center gap-2 border-r border-black/5 py-3">
        {nav.map((Icon, i) => (
          <motion.span
            key={i}
            className={cn(
              "grid size-8 place-items-center rounded-full",
              i === 1 ? "bg-[#242423] text-white" : "text-zinc-400",
            )}
            initial={still ? false : { opacity: 0, scale: 0.6 }}
            animate={shown ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 22,
              delay: 0.4 + i * 0.05,
            }}
          >
            <Icon aria-hidden className="size-4" />
          </motion.span>
        ))}
      </div>
      {/* Main */}
      <div className="min-w-0 flex-1 p-4">
        <motion.div className="flex items-center justify-between" {...rise(0)}>
          <p className="text-sm font-semibold tracking-tight">Overview</p>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#242423]/[0.06] px-2.5 text-xs text-zinc-500">
            <SearchIcon aria-hidden className="size-3" />
            Search
          </span>
        </motion.div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            {
              label: "Visitors",
              to: 48210,
              f: (n: number) => Math.round(n).toLocaleString(),
            },
            {
              label: "Conversion",
              to: 3.8,
              f: (n: number) => `${n.toFixed(1)}%`,
            },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              className="rounded-2xl bg-[#242423]/[0.04] p-3"
              {...rise(1 + i)}
            >
              <p className="text-xs text-zinc-500">{k.label}</p>
              <p className="mt-1 text-xl font-medium leading-none tracking-tight">
                <Count
                  to={k.to}
                  shown={shown}
                  still={still}
                  delay={0.6 + i * 0.1}
                  format={k.f}
                />
              </p>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="mt-2 rounded-2xl bg-[#242423]/[0.04] p-3"
          {...rise(3)}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">Last 30 days</p>
            <span className="rounded-full bg-[#269a5a]/10 px-2 py-0.5 text-xs font-medium text-[#269a5a]">
              +12%
            </span>
          </div>
          <svg
            viewBox="0 0 260 60"
            className="mt-2 h-14 w-full overflow-visible"
            aria-hidden
          >
            <defs>
              <linearGradient id="contour-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#242423" stopOpacity="0.12" />
                <stop offset="1" stopColor="#242423" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d={`${chart} L 260 60 L 0 60 Z`}
              fill="url(#contour-area)"
              initial={still ? false : { opacity: 0 }}
              animate={shown ? { opacity: 1 } : undefined}
              transition={{ duration: 0.6, delay: 1.5 }}
            />
            <motion.path
              d={chart}
              fill="none"
              stroke="#242423"
              strokeWidth="2"
              strokeLinecap="round"
              initial={still ? false : { pathLength: 0 }}
              animate={shown ? { pathLength: 1 } : undefined}
              transition={{
                duration: 1.2,
                delay: 0.75,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
            <motion.circle
              cx="260"
              cy="8"
              r="4"
              fill="#242423"
              stroke="white"
              strokeWidth="2"
              initial={still ? false : { scale: 0 }}
              animate={shown ? { scale: 1 } : undefined}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 18,
                delay: 1.9,
              }}
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

export const ContourFeatureCard = React.forwardRef<
  HTMLDivElement,
  ContourFeatureCardProps
>(function ContourFeatureCard(
  {
    color = "#242423",
    lines = 14,
    scale = 1,
    speed = 1,
    lift = 1,
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
  const waves = React.useRef<Wave[]>([]);
  const reveal = React.useRef(-1);
  React.useEffect(() => {
    if (shown) reveal.current = -2;
  }, [shown]);

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

  return (
    <motion.div
      ref={root}
      onPointerMove={(e) => {
        const p = local(e);
        pointer.current = { x: p.x, y: p.y, on: true };
        if (still) return;
        ry.set((p.x / p.w - 0.5) * 12);
        rx.set(-(p.y / p.h - 0.5) * 8);
      }}
      onPointerLeave={() => {
        pointer.current = { ...pointer.current, on: false };
        rx.set(0);
        ry.set(0);
      }}
      onPointerDown={(e) => {
        const p = local(e);
        // t < 0 marks it new; the field stamps it with its own clock.
        waves.current.push({ x: p.x, y: p.y, t: -1 });
      }}
      initial={still ? false : { opacity: 0, y: 24, scale: 0.97 }}
      animate={shown ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.7, ease: GLIDE }}
      className={cn(
        "relative h-[440px] w-[560px] max-w-full overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900",
        className,
      )}
      style={{ perspective: 1400 }}
    >
      <ContourField
        color={color}
        lines={Math.max(4, Math.round(lines))}
        scale={Math.max(0.3, scale)}
        speed={speed}
        lift={lift}
        still={still}
        pointer={pointer}
        waves={waves}
        reveal={reveal}
      />

      {/* The browser window, cropped by the bottom of the card. */}
      <motion.div
        className="absolute bottom-[-40px] left-1/2 -ml-[200px] h-[330px] w-[400px]"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        initial={still ? false : { y: 90, opacity: 0 }}
        animate={shown ? { y: 0, opacity: 1 } : undefined}
        transition={{
          type: "spring",
          stiffness: 90,
          damping: 16,
          mass: 0.9,
          delay: still ? 0 : 0.25,
        }}
      >
        <div className="flex size-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.06),0_30px_60px_-28px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06]">
          {/* Title bar */}
          <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-black/5 bg-zinc-50 px-3">
            {[0, 1, 2].map((k) => (
              <span key={k} className="size-2.5 rounded-full bg-[#242423]/15" />
            ))}
            <span className="mx-auto inline-flex h-6 w-40 items-center justify-center rounded-full bg-white text-xs text-zinc-400 ring-1 ring-black/5">
              app.example.com
            </span>
            <span className="w-[42px]" />
          </div>
          <div className="min-h-0 flex-1">
            {children ?? <Dashboard shown={shown} still={still} />}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});