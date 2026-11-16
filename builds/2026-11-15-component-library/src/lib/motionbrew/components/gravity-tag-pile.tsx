"use client";

/**
 * GravityTagPile, from https://motion-brew.com/components/gravity-tag-pile
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
import { motion, useAnimation, useAnimationFrame, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: rotate-ccw
const RotateCCWIcon = (() => {
interface RotateCCWIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface RotateCCWIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const RotateCCWIcon = forwardRef<RotateCCWIconHandle, RotateCCWIconProps>(
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
        if (isControlledRef.current) onMouseEnter?.(e);
        else controls.start("animate");
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) onMouseLeave?.(e);
        else controls.start("normal");
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
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
          variants={{
            normal: { rotate: "0deg" },
            animate: { rotate: "-50deg" },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </motion.svg>
      </span>
    );
  }
);

RotateCCWIcon.displayName = "RotateCCWIcon";
  return RotateCCWIcon;
})();

// GravityTagPile

/**
 * GravityTagPile
 *
 * Trigger: drag. Tags drop into the box, bounce, spin and pile up under real
 * physics, right on the card's own background. Grab any tag to drag it and fling it; sweep the cursor through the
 * pile to nudge tags aside; click a tag for a little pop (or to follow its
 * link). Tags squash on hard landings and wobble back. A reset button drops
 * them again. Every tag is a real button or link, so keyboard and screen
 * reader users get the plain list. Reduced motion settles the pile instantly.
 *
 * Engine: motion/react (useAnimationFrame drives a small built-in capsule
 * physics solver: each pill is a line segment with a radius, so collisions are
 * exact and cheap, with no physics library).
 */

export type GravityTagTheme = "studio" | "pastel" | "candy" | "mono" | "earth";

export interface GravityTag {
  label: string;
  /** Background color. Default from the theme. */
  color?: string;
  /** Text color. Default from the theme. */
  textColor?: string;
  /** Small round image before the label. */
  image?: string;
  /** Turns the tag into a link. */
  href?: string;
}

export interface GravityTagPileProps {
  /** Tags, as labels or objects. Default a set of design skills. */
  tags?: (string | GravityTag)[];
  /** Tag color preset. The pile itself is transparent, so it sits on whatever card it is in. Default `"studio"`. */
  theme?: GravityTagTheme;
  /** Background pattern. Default `"none"`. */
  pattern?: "dots" | "grid" | "none";
  /** How tags arrive: `"random"`, in `"sequence"` or all `"together"`. Default `"random"`. */
  entrance?: "random" | "sequence" | "together";
  /** Downward pull, px/s². Default `2200`. */
  gravity?: number;
  /** Bounciness, 0 to 1. Default `0.3`. */
  bounce?: number;
  /** Grip between tags and walls, 0 to 1. Default `0.6`. */
  friction?: number;
  /** Multiplies the speed a tag keeps when you let go. Default `1`. */
  throwStrength?: number;
  /** How much tags squash on impact, 0 to 1. Default `0.6`. */
  squash?: number;
  /** Moving the cursor through the pile nudges tags. Default `true`. */
  cursorPush?: boolean;
  /** Hairline border on each tag. Default `true`. */
  border?: boolean;
  /** Drop shadow under each tag. Default `true`. */
  shadow?: boolean;
  /** Image size in px. Default `26`. */
  imageSize?: number;
  /** Optional heading behind the pile. None by default. */
  title?: string;
  /** Optional line under the heading. */
  description?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  /** Classes for every tag (padding, font, size). */
  tagClassName?: string;
  /** Show a drop-again button in the corner. Default `false`. */
  showReset?: boolean;
  /** Called when a tag is clicked (not dragged). */
  onTagClick?: (tag: GravityTag, index: number) => void;
  className?: string;
}

/** Solid tag colors, as [background, text]. Cycled in order. */
const THEMES: Record<GravityTagTheme, [bg: string, fg: string][]> = {
  studio: [
    ["#3d66d6", "#ffffff"],
    ["#d6498f", "#ffffff"],
    ["#242423", "#ffffff"],
    ["#269a5a", "#ffffff"],
    ["#9150e0", "#ffffff"],
    ["#ffffff", "#242423"],
    ["#e8711a", "#ffffff"],
    ["#1f8fb0", "#ffffff"],
  ],
  pastel: [
    ["#dbe4ff", "#1e3a8a"],
    ["#ffd8e8", "#831843"],
    ["#e9dcff", "#4c1d95"],
    ["#d3f2e0", "#14532d"],
    ["#ffe4c7", "#7c2d12"],
    ["#fff1b0", "#713f12"],
  ],
  candy: [
    ["#ff5fa2", "#ffffff"],
    ["#ffd43b", "#3b2f00"],
    ["#4dabf7", "#ffffff"],
    ["#b197fc", "#ffffff"],
    ["#63e6be", "#063b2c"],
    ["#ffa94d", "#3b1d00"],
  ],
  mono: [
    ["#242423", "#ffffff"],
    ["#ffffff", "#242423"],
    ["#e4e4e2", "#242423"],
  ],
  earth: [
    ["#c7783f", "#ffffff"],
    ["#8fae7d", "#122016"],
    ["#3f5e45", "#e8f0e3"],
    ["#d9b44a", "#2a2206"],
    ["#e8dcc4", "#1d2b22"],
  ],
};

const PATTERN_INK = "color-mix(in srgb, currentColor 9%, transparent)";

const DEFAULT_TAGS = [
  "Motion design",
  "React",
  "TypeScript",
  "Brand systems",
  "Prototyping",
  "Figma",
  "Accessibility",
  "Tailwind",
  "Illustration",
  "GSAP",
  "Art direction",
];

// ---------------------------------------------------------------------------
// Physics: every tag is a capsule (a segment of half length `hw` and radius `r`).

interface Body {
  x: number;
  y: number;
  a: number;
  vx: number;
  vy: number;
  w: number;
  hw: number;
  r: number;
  width: number;
  height: number;
  im: number;
  ii: number;
  live: boolean;
  /** Squash offset and its velocity (a wobbly spring). */
  s: number;
  sv: number;
  /** Pop offset and its velocity. */
  p: number;
  pv: number;
}

interface Contact {
  a: Body;
  b: Body | null;
  px: number;
  py: number;
  nx: number;
  ny: number;
  pen: number;
}

const DT = 1 / 120;
const ITERATIONS = 8;
const MAX_SPEED = 4000;
const MAX_SPIN = 30;
/** The pile sleeps once no tag moves more than `REST_MOVE` px (or turns `REST_TURN` rad) over a `REST_WINDOW` second window. */
const REST_MOVE = 1.2;
const REST_TURN = 0.02;
const REST_WINDOW = 0.3;

function makeBody(width: number, height: number): Body {
  const m = (width * height) / 1000;
  const inertia = (m * (width * width + height * height)) / 12;
  return {
    x: 0,
    y: 0,
    a: 0,
    vx: 0,
    vy: 0,
    w: 0,
    hw: Math.max(0, (width - height) / 2),
    r: height / 2,
    width,
    height,
    im: 1 / m,
    ii: 1 / inertia,
    live: false,
    s: 0,
    sv: 0,
    p: 0,
    pv: 0,
  };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function ends(b: Body): [number, number, number, number] {
  const cx = Math.cos(b.a) * b.hw;
  const cy = Math.sin(b.a) * b.hw;
  return [b.x - cx, b.y - cy, b.x + cx, b.y + cy];
}

function closestOnSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): [number, number] {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len > 1e-9 ? clamp01(((px - ax) * dx + (py - ay) * dy) / len) : 0;
  return [ax + dx * t, ay + dy * t];
}

/** Closest points between two segments (Ericson, Real-Time Collision Detection). */
function segSeg(
  p1x: number, p1y: number, q1x: number, q1y: number,
  p2x: number, p2y: number, q2x: number, q2y: number,
): [number, number, number, number] {
  const d1x = q1x - p1x, d1y = q1y - p1y;
  const d2x = q2x - p2x, d2y = q2y - p2y;
  const rx = p1x - p2x, ry = p1y - p2y;
  const a = d1x * d1x + d1y * d1y;
  const e = d2x * d2x + d2y * d2y;
  const f = d2x * rx + d2y * ry;
  let s = 0;
  let t = 0;
  if (a <= 1e-9 && e <= 1e-9) {
    s = t = 0;
  } else if (a <= 1e-9) {
    t = clamp01(f / e);
  } else {
    const c = d1x * rx + d1y * ry;
    if (e <= 1e-9) {
      s = clamp01(-c / a);
    } else {
      const b = d1x * d2x + d1y * d2y;
      const denom = a * e - b * b;
      s = denom !== 0 ? clamp01((b * f - c * e) / denom) : 0;
      t = (b * s + f) / e;
      if (t < 0) (t = 0), (s = clamp01(-c / a));
      else if (t > 1) (t = 1), (s = clamp01((b - c) / a));
    }
  }
  return [p1x + d1x * s, p1y + d1y * s, p2x + d2x * t, p2y + d2y * t];
}

/** Contacts grouped per touching pair (or body and wall). */
function collect(list: Body[], W: number, H: number): Contact[][] {
  const groups: Contact[][] = [];
  for (let i = 0; i < list.length; i++) {
    const A = list[i]!;
    const [a0x, a0y, a1x, a1y] = ends(A);
    const aEnds = A.hw > 0 ? [[a0x, a0y], [a1x, a1y]] : [[a0x, a0y]];

    // Walls: left, right, floor. The top is open so thrown tags can fly out and fall back.
    const walls: [nx: number, ny: number, dist: (x: number, y: number) => number][] = [
      [-1, 0, (x) => x],
      [1, 0, (x) => W - x],
      [0, 1, (_x, y) => H - y],
    ];
    for (const [nx, ny, dist] of walls) {
      const group: Contact[] = [];
      for (const [ex, ey] of aEnds as [number, number][]) {
        const pen = A.r - dist(ex, ey);
        if (pen > 0) group.push({ a: A, b: null, px: ex + nx * (A.r - pen / 2), py: ey + ny * (A.r - pen / 2), nx, ny, pen });
      }
      if (group.length) groups.push(group);
    }

    for (let j = i + 1; j < list.length; j++) {
      const B = list[j]!;
      const reach = A.hw + A.r + B.hw + B.r;
      if (Math.abs(A.x - B.x) > reach || Math.abs(A.y - B.y) > reach) continue;
      const [b0x, b0y, b1x, b1y] = ends(B);
      const rs = A.r + B.r;
      const pairs: [number, number, number, number][] = [];
      // Endpoint to segment checks give two contacts when tags lie flat on each other, which stacks stably.
      for (const [ex, ey] of aEnds as [number, number][]) pairs.push([ex, ey, ...closestOnSeg(ex, ey, b0x, b0y, b1x, b1y)]);
      if (B.hw > 0) {
        for (const [ex, ey] of [[b0x, b0y], [b1x, b1y]] as [number, number][]) {
          const [qx, qy] = closestOnSeg(ex, ey, a0x, a0y, a1x, a1y);
          pairs.push([qx, qy, ex, ey]);
        }
      } else {
        const [qx, qy] = closestOnSeg(b0x, b0y, a0x, a0y, a1x, a1y);
        pairs.push([qx, qy, b0x, b0y]);
      }
      // Crossing segments: the true closest pair.
      pairs.push(segSeg(a0x, a0y, a1x, a1y, b0x, b0y, b1x, b1y));

      const group: Contact[] = [];
      for (const [pax, pay, pbx, pby] of pairs) {
        let dx = pbx - pax;
        let dy = pby - pay;
        const d = Math.hypot(dx, dy);
        if (d >= rs) continue;
        if (d > 1e-6) (dx /= d), (dy /= d);
        else {
          const cx = B.x - A.x;
          const cy = B.y - A.y;
          const cl = Math.hypot(cx, cy) || 1;
          (dx = cx / cl || 0), (dy = cy / cl || 1);
        }
        const px = (pax + dx * A.r + pbx - dx * B.r) / 2;
        const py = (pay + dy * A.r + pby - dy * B.r) / 2;
        if (group.some((c) => Math.abs(c.px - px) < 2 && Math.abs(c.py - py) < 2)) continue;
        group.push({ a: A, b: B, px, py, nx: dx, ny: dy, pen: rs - d });
      }
      if (group.length) groups.push(group);
    }
  }
  return groups;
}

interface Params {
  gravity: number;
  bounce: number;
  friction: number;
  squash: number;
}

function resolve(c: Contact, P: Params, first: boolean) {
  const { a: A, b: B, nx, ny } = c;
  const rax = c.px - A.x, ray = c.py - A.y;
  const rbx = B ? c.px - B.x : 0, rby = B ? c.py - B.y : 0;
  const imB = B ? B.im : 0, iiB = B ? B.ii : 0;
  const relV = () => {
    const vax = A.vx - A.w * ray, vay = A.vy + A.w * rax;
    const vbx = B ? B.vx - B.w * rby : 0, vby = B ? B.vy + B.w * rbx : 0;
    return [vax - vbx, vay - vby] as const;
  };
  let [rvx, rvy] = relV();
  const vn = rvx * nx + rvy * ny;
  if (vn <= 0) return;
  const rnA = rax * ny - ray * nx;
  const rnB = rbx * ny - rby * nx;
  const k = A.im + rnA * rnA * A.ii + imB + rnB * rnB * iiB;
  const e = vn > 90 ? P.bounce : 0;
  const j = ((1 + e) * vn) / k;
  A.vx -= j * nx * A.im;
  A.vy -= j * ny * A.im;
  A.w -= rnA * j * A.ii;
  if (B) {
    B.vx += j * nx * B.im;
    B.vy += j * ny * B.im;
    B.w += rnB * j * B.ii;
  }
  if (first && vn > 140 && P.squash > 0) {
    const kick = Math.min(vn, 1600) * 0.00032 * P.squash;
    A.sv += kick;
    if (B) B.sv += kick;
  }

  // Coulomb friction along the sliding direction.
  [rvx, rvy] = relV();
  const vnn = rvx * nx + rvy * ny;
  let tx = rvx - vnn * nx;
  let ty = rvy - vnn * ny;
  const vt = Math.hypot(tx, ty);
  if (vt < 1e-6) return;
  (tx /= vt), (ty /= vt);
  const rtA = rax * ty - ray * tx;
  const rtB = rbx * ty - rby * tx;
  const kt = A.im + rtA * rtA * A.ii + imB + rtB * rtB * iiB;
  const jt = Math.min(vt / kt, P.friction * j);
  A.vx -= jt * tx * A.im;
  A.vy -= jt * ty * A.im;
  A.w -= rtA * jt * A.ii;
  if (B) {
    B.vx += jt * tx * B.im;
    B.vy += jt * ty * B.im;
    B.w += rtB * jt * B.ii;
  }
}

function shuffle<T>(list: T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// ---------------------------------------------------------------------------

interface Drag {
  i: number;
  lx: number;
  ly: number;
  px: number;
  py: number;
  sx: number;
  sy: number;
  moved: boolean;
}

export const GravityTagPile = React.forwardRef<HTMLDivElement, GravityTagPileProps>(function GravityTagPile(
  {
    tags = DEFAULT_TAGS,
    theme = "studio",
    pattern = "none",
    entrance = "random",
    gravity = 2200,
    bounce = 0.3,
    friction = 0.6,
    throwStrength = 1,
    squash = 0.6,
    cursorPush = true,
    border = true,
    shadow = true,
    imageSize = 26,
    title,
    description,
    titleClassName,
    descriptionClassName,
    tagClassName,
    showReset = false,
    onTagClick,
    className,
  },
  forwardedRef,
) {
  const still = !!useReducedMotion();
  const palette = THEMES[theme];
  const items = React.useMemo(() => tags.map((tag) => (typeof tag === "string" ? { label: tag } : tag)), [tags]);
  const tagsKey = items.map((x) => x.label).join("\u0000");

  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement);
  const els = React.useRef<(HTMLElement | null)[]>([]);
  const bodies = React.useRef<Body[]>([]);
  const box = React.useRef({ w: 0, h: 0 });
  const params = React.useRef<Params & { throwStrength: number; cursorPush: boolean; entrance: string }>({
    gravity, bounce, friction, squash, throwStrength, cursorPush, entrance,
  });
  params.current = { gravity, bounce, friction, squash, throwStrength, cursorPush, entrance };
  React.useEffect(() => {
    asleep.current = false;
    idle.current = 0;
  }, [gravity, bounce, friction, squash]);
  const drag = React.useRef<Drag | null>(null);
  const swallowClick = React.useRef(false);
  const cursor = React.useRef({ x: 0, y: 0, t: 0 });
  const onScreen = React.useRef(true);
  const timers = React.useRef<number[]>([]);
  const acc = React.useRef(0);
  const asleep = React.useRef(false);
  const idle = React.useRef(0);
  const snapshot = React.useRef<number[]>([]);
  const wake = React.useCallback(() => {
    asleep.current = false;
    idle.current = 0;
    snapshot.current = [];
  }, []);
  const [spins, setSpins] = React.useState(0);

  const step = React.useCallback((dt: number) => {
    const P = params.current;
    const { w: W, h: H } = box.current;
    const list = bodies.current.filter((b) => b.live);
    for (const b of list) {
      b.vy += P.gravity * dt;
      const lin = 1 - 0.12 * dt;
      b.vx *= lin;
      b.vy *= lin;
      b.w *= 1 - 1.4 * dt;
    }

    // Grab: a stiff spring pulls the grabbed point toward the pointer, so tags swing naturally from where you hold them.
    const d = drag.current;
    const held = d ? bodies.current[d.i] : undefined;
    if (d && held?.live) {
      const c = Math.cos(held.a), s = Math.sin(held.a);
      const rx = d.lx * c - d.ly * s;
      const ry = d.lx * s + d.ly * c;
      const vpx = held.vx - held.w * ry;
      const vpy = held.vy + held.w * rx;
      const dvx = (d.px - (held.x + rx)) * 28 - vpx;
      const dvy = (d.py - (held.y + ry)) * 28 - vpy;
      const kx = held.im + ry * ry * held.ii;
      const jx = (dvx / kx) * 0.6;
      held.vx += jx * held.im;
      held.w += -ry * jx * held.ii;
      const ky = held.im + rx * rx * held.ii;
      const jy = (dvy / ky) * 0.6;
      held.vy += jy * held.im;
      held.w += rx * jy * held.ii;
      held.w *= 0.96;
    }

    const contacts = collect(list, W, H).flat();
    for (let it = 0; it < ITERATIONS; it++) for (const c of contacts) resolve(c, P, it === 0);

    for (const b of list) {
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > MAX_SPEED) (b.vx *= MAX_SPEED / sp), (b.vy *= MAX_SPEED / sp);
      b.w = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, b.w));
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.a += b.w * dt;
      // Squash and pop are wobbly springs, purely visual.
      b.sv += (-700 * b.s - 14 * b.sv) * dt;
      b.s = Math.max(-0.3, Math.min(0.3, b.s + b.sv * dt));
      b.pv += (-520 * b.p - 15 * b.pv) * dt;
      b.p += b.pv * dt;
    }

    // Push overlapping shapes apart directly, so piles do not sink or jitter.
    for (const group of collect(list, W, H)) {
      let c = group[0]!;
      for (const g of group) if (g.pen > c.pen) c = g;
      const pen = c.pen - 0.25;
      if (pen <= 0) continue;
      const imB = c.b ? c.b.im : 0;
      const corr = (pen * 0.7) / (c.a.im + imB);
      c.a.x -= c.nx * corr * c.a.im;
      c.a.y -= c.ny * corr * c.a.im;
      if (c.b) {
        c.b.x += c.nx * corr * imB;
        c.b.y += c.ny * corr * imB;
      }
    }
  }, []);

  const paint = React.useCallback(() => {
    bodies.current.forEach((b, i) => {
      const el = els.current[i];
      if (!el) return;
      if (!b.live) {
        el.style.visibility = "hidden";
        return;
      }
      el.style.visibility = "visible";
      const k = 1 + b.p;
      el.style.transform = `translate(${(b.x - b.width / 2).toFixed(2)}px, ${(b.y - b.height / 2).toFixed(2)}px) rotate(${b.a.toFixed(4)}rad) scale(${((1 + b.s * 0.55) * k).toFixed(4)}, ${((1 - b.s) * k).toFixed(4)})`;
    });
  }, []);

  const drop = React.useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    drag.current = null;
    wake();
    const { w: W } = box.current;
    if (!W) return;
    const list = els.current.slice(0, items.length).map((el) => makeBody(el?.offsetWidth ?? 80, el?.offsetHeight ?? 34));
    bodies.current = list;
    const mode = still ? "together" : params.current.entrance;
    const spawn = (b: Body) => {
      const span = Math.max(0, W - b.width - 8);
      b.x = 4 + b.width / 2 + Math.random() * span;
      b.y = -b.height;
      b.a = (Math.random() - 0.5) * 0.6;
      b.w = (Math.random() - 0.5) * 3;
      b.live = true;
      wake();
    };

    if (mode === "together") {
      // Pack the tags into rows just above the box and let them all fall at once.
      let x = 6;
      let rowY = -10;
      let rowH = 0;
      for (const b of shuffle(list)) {
        if (x + b.width > W - 6 && x > 6) {
          x = 6;
          rowY -= rowH + 12;
          rowH = 0;
        }
        b.x = x + b.width / 2;
        b.y = rowY - b.height / 2;
        b.a = (Math.random() - 0.5) * 0.25;
        b.live = true;
        x += b.width + 6 + Math.random() * 14;
        rowH = Math.max(rowH, b.height);
      }
    } else {
      const order = mode === "sequence" ? list : shuffle(list);
      order.forEach((b, k) => {
        const delay = mode === "sequence" ? k * 90 : Math.random() * 1100;
        timers.current.push(window.setTimeout(() => spawn(b), delay));
      });
    }

    if (still) {
      for (let i = 0; i < 1200; i++) step(DT);
      for (const b of list) (b.vx = b.vy = b.w = b.s = b.sv = b.p = b.pv = 0);
      asleep.current = true;
    }
    paint();
  }, [items.length, still, step, paint, wake]);

  // Size the box, and drop the tags once it has a size.
  React.useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const first = box.current.w === 0;
      box.current = { w: el.clientWidth, h: el.clientHeight };
      wake();
      if (first && box.current.w > 0) drop();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [drop]);

  // New tags: drop again. Web fonts arriving late: refit each body to its real size.
  React.useEffect(() => {
    if (box.current.w > 0) drop();
    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive) return;
      bodies.current.forEach((b, i) => {
        const el = els.current[i];
        if (!el) return;
        const fresh = makeBody(el.offsetWidth, el.offsetHeight);
        Object.assign(b, { hw: fresh.hw, r: fresh.r, width: fresh.width, height: fresh.height, im: fresh.im, ii: fresh.ii });
      });
      wake();
    });
    return () => {
      alive = false;
      timers.current.forEach((id) => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsKey]);

  // Skip the simulation while the pile is off screen.
  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => void (onScreen.current = !!entry?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (!onScreen.current || !bodies.current.length || asleep.current) return;
    acc.current += Math.min(delta, 50) / 1000;
    while (acc.current >= DT) {
      step(DT);
      acc.current -= DT;
    }
    paint();

    // Sleep once the whole pile has stopped moving, so it rests perfectly still and costs nothing.
    idle.current += Math.min(delta, 50) / 1000;
    if (idle.current < REST_WINDOW) return;
    idle.current = 0;
    const list = bodies.current;
    const prev = snapshot.current;
    const calm =
      !drag.current &&
      prev.length === list.length * 3 &&
      list.every(
        (b, i) =>
          b.live &&
          Math.hypot(b.x - prev[i * 3]!, b.y - prev[i * 3 + 1]!) < REST_MOVE &&
          Math.abs(b.a - prev[i * 3 + 2]!) < REST_TURN,
      );
    if (calm) {
      for (const b of list) (b.vx = b.vy = b.w = b.s = b.sv = b.p = b.pv = 0);
      asleep.current = true;
      paint();
    } else {
      snapshot.current = list.flatMap((b) => [b.x, b.y, b.a]);
    }
  });

  const local = (e: React.PointerEvent) => {
    const r = root.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const pop = (i: number) => {
    const b = bodies.current[i];
    if (!b?.live) return;
    wake();
    b.pv += still ? 0 : 4;
    if (!still) {
      b.vy -= 380;
      b.w += (Math.random() - 0.5) * 6;
    }
  };

  const tagHandlers = (i: number) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      const b = bodies.current[i];
      if (!b?.live) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      wake();
      const { x, y } = local(e);
      const dx = x - b.x;
      const dy = y - b.y;
      const c = Math.cos(-b.a), s = Math.sin(-b.a);
      drag.current = { i, lx: dx * c - dy * s, ly: dx * s + dy * c, px: x, py: y, sx: x, sy: y, moved: false };
      swallowClick.current = false;
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.i !== i) return;
      const { x, y } = local(e);
      d.px = x;
      d.py = y;
      if (Math.hypot(x - d.sx, y - d.sy) > 5) d.moved = true;
    },
    onPointerUp: () => release(i),
    onPointerCancel: () => release(i),
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      if (swallowClick.current) {
        e.preventDefault();
        swallowClick.current = false;
        return;
      }
      pop(i);
      onTagClick?.(items[i]!, i);
    },
    onDragStart: (e: React.DragEvent) => e.preventDefault(),
  });

  const release = (i: number) => {
    const d = drag.current;
    if (!d || d.i !== i) return;
    const b = bodies.current[i];
    if (d.moved && b) {
      swallowClick.current = true;
      const k = params.current.throwStrength;
      b.vx *= k;
      b.vy *= k;
      b.w *= Math.min(k, 1.5);
    }
    drag.current = null;
  };

  // Sweeping the cursor through the pile nudges whatever it brushes.
  const onRootPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { x, y } = local(e);
    const now = performance.now();
    const prev = cursor.current;
    const dt = Math.max(8, now - prev.t) / 1000;
    cursor.current = { x, y, t: now };
    if (drag.current || e.pointerType !== "mouse" || !params.current.cursorPush || still || dt > 0.1) return;
    const cvx = Math.max(-1500, Math.min(1500, (x - prev.x) / dt));
    const cvy = Math.max(-1500, Math.min(1500, (y - prev.y) / dt));
    for (const b of bodies.current) {
      if (!b.live) continue;
      const [a0x, a0y, a1x, a1y] = ends(b);
      const [qx, qy] = closestOnSeg(x, y, a0x, a0y, a1x, a1y);
      if (Math.hypot(x - qx, y - qy) > b.r + 10) continue;
      wake();
      const dvx = cvx * 0.14;
      const dvy = cvy * 0.14;
      b.vx += dvx;
      b.vy += dvy;
      b.w += ((x - b.x) * dvy - (y - b.y) * dvx) * 0.0012;
    }
  };

  const patternStyle: React.CSSProperties =
    pattern === "dots"
      ? { backgroundImage: `radial-gradient(${PATTERN_INK} 1.2px, transparent 1.7px)`, backgroundSize: "18px 18px" }
      : pattern === "grid"
        ? {
            backgroundImage: `linear-gradient(${PATTERN_INK} 1px, transparent 1px), linear-gradient(90deg, ${PATTERN_INK} 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }
        : {};

  const shadows = [
    border ? "inset 0 0 0 1px rgba(0,0,0,0.07)" : "",
    shadow ? "0 1px 1px rgba(0,0,0,0.06), 0 6px 14px -8px rgba(0,0,0,0.3)" : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      ref={root}
      role="group"
      aria-label={title || "Tags"}
      onPointerMove={onRootPointerMove}
      className={cn("relative isolate h-[420px] w-full overflow-hidden text-[#242423] dark:text-zinc-100", className)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={patternStyle} />

      {(title || description) && (
        <div className="pointer-events-none absolute inset-x-16 top-8 text-center">
          {title && <h3 className={cn("text-[24px] font-semibold leading-tight tracking-tight", titleClassName)}>{title}</h3>}
          {description && (
            <p className={cn("mt-1.5 text-[14px] opacity-60", descriptionClassName)}>
              {description}
            </p>
          )}
        </div>
      )}

      {showReset && (
        <motion.button
          type="button"
          aria-label="Drop the tags again"
          onClick={() => {
            setSpins((s) => s + 1);
            drop();
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          className="absolute right-4 top-4 z-20 grid size-9 cursor-pointer place-items-center rounded-full bg-[#242423]/6 outline-none transition-colors hover:bg-[#242423]/11 focus-visible:ring-2 focus-visible:ring-current dark:bg-white/10"
        >
          <motion.span animate={{ rotate: -360 * spins }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <RotateCCWIcon className="size-4" strokeWidth={2.25} />
          </motion.span>
        </motion.button>
      )}

      {items.map((tag, i) => {
        const [bg, fg] = palette[i % palette.length]!;
        const Tag = tag.href ? "a" : "button";
        return (
          <Tag
            key={`${tag.label}-${i}`}
            ref={(el: HTMLElement | null) => void (els.current[i] = el)}
            {...(tag.href ? { href: tag.href, draggable: false } : { type: "button" as const })}
            {...tagHandlers(i)}
            className={cn(
              "absolute left-0 top-0 z-10 inline-flex cursor-grab touch-none select-none items-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-[16px] font-medium leading-none outline-none will-change-transform active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-offset-2",
              tag.image && "pl-2",
              tagClassName,
            )}
            style={{ visibility: "hidden", background: tag.color ?? bg, color: tag.textColor ?? fg, boxShadow: shadows || undefined }}
          >
            {tag.image && (
              <img
                src={tag.image}
                alt=""
                draggable={false}
                className="relative shrink-0 rounded-full object-cover"
                style={{ width: imageSize, height: imageSize, marginBlock: -4 }}
              />
            )}
            <span className="relative">{tag.label}</span>
          </Tag>
        );
      })}
    </div>
  );
});