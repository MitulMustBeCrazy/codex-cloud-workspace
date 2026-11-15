"use client";

/**
 * InfiniteGallery, from https://motion-brew.com/components/infinite-gallery
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
import { animate, type AnimationPlaybackControls, motion, useAnimation, useAnimationFrame, useReducedMotion, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: arrow-up-right
const ArrowUpRightIcon = (() => {
interface ArrowUpRightIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowUpRightIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const ARROW_VARIANTS: Variants = {
  normal: {
    scale: 1,
    translateX: 0,
    translateY: 0,
  },
  animate: {
    scale: [1, 0.85, 1],
    translateX: [0, -4, 0],
    translateY: [0, 4, 0],
    originX: 1,
    originY: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const ArrowUpRightIcon = forwardRef<
  ArrowUpRightIconHandle,
  ArrowUpRightIconProps
>(({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
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
      if (!isControlledRef.current) controls.start("animate");
      onMouseEnter?.(e);
    },
    [controls, onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!isControlledRef.current) controls.start("normal");
      onMouseLeave?.(e);
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
      <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth ?? 2}
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.g animate={controls} variants={ARROW_VARIANTS}>
          <path d="M7 7H17" />
          <path d="M17 7V17" />
          <path d="M7 17L17 7" />
        </motion.g>
      </svg>
    </span>
  );
});

ArrowUpRightIcon.displayName = "ArrowUpRightIcon";
  return ArrowUpRightIcon;
})();

// InfiniteGallery

/**
 * InfiniteGallery
 *
 * Trigger: drag (plus wheel and touch). An endless wall of work that you can
 * move in any direction and never reach the edge of: cards wrap around
 * seamlessly, so there is no visible reset. Drag to pan with momentum, scroll
 * the wheel or trackpad to glide, or leave it alone and it drifts slowly.
 * Cards shrink a touch while the wall moves fast, cards near the edges sit
 * slightly smaller than the center for depth, and each image shifts inside its
 * frame for parallax. While you drag or flick, the cards stretch like rubber
 * along the direction of travel and smear with a matching motion blur, then
 * snap back with a little overshoot when the wall stops. Hovering a card breaks its image into big pixels that
 * resolve back to sharp in a few quick steps, zooms it in and slides up a title
 * pill on that card only. Cards can be images or muted looping videos, with alt text and links.
 * On first view the wall blooms in from the center outward: each card rises,
 * scales up and fades in while its image resolves out of pixels.
 * Reduced motion turns off drift, momentum and the depth effects.
 *
 * Engine: motion/react (useAnimationFrame runs the camera; every card's
 * transform is written straight to the DOM, so panning never re-renders React).
 */

export interface InfiniteGalleryItem {
  /** Image URL (also the poster for a video). */
  src: string;
  /** Optional video URL; plays muted and looped. */
  video?: string;
  title: string;
  /** Alt text. Default the title. */
  alt?: string;
  /** Where the card goes when clicked. */
  href?: string;
}

export interface InfiniteGalleryProps {
  /** Cards to tile endlessly. Default a set of sample photos. */
  items?: InfiniteGalleryItem[];
  /** Card width, px. Default `220`. */
  cardWidth?: number;
  /** Card height, px. Default `280`. */
  cardHeight?: number;
  /** Space between cards, px. Default `20`. */
  gap?: number;
  /** Offset every other column for a staggered wall. Default `true`. */
  stagger?: boolean;
  /** Idle drift speed, px/s. `0` stops it. Default `24`. */
  drift?: number;
  /** How far momentum carries a flick, 0 to 1. Default `0.6`. */
  momentum?: number;
  /** Cards near the edges sit smaller than the center, 0 to 1. Default `0.35`. */
  depth?: number;
  /** Images shift inside their frames as they move, 0 to 1. Default `0.5`. */
  parallax?: number;
  /** The mouse wheel and trackpad pan the gallery while the pointer is over it. Default `true`. */
  wheel?: boolean;
  /** Rubbery stretch along the direction of travel while the wall moves, 0 to 1. Default `0.6`. */
  stretch?: number;
  /** Strongest directional motion blur while the wall moves, px. `0` turns it off. Default `6`. */
  blur?: number;
  /** Bloom the cards in from the center the first time the gallery scrolls into view. Default `true`. */
  intro?: boolean;
  /** Hovering a card pixelates its image, then resolves it back to sharp. Default `true`. */
  pixelate?: boolean;
  /** Starting pixel size for the hover resolve, px. Default `12`. */
  pixelSize?: number;
  /** Show the title pill on hover. Default `true`. */
  showTitles?: boolean;
  /** Open links in a new tab. Default `false`. */
  newTab?: boolean;
  /** Accessible name. Default `"Project gallery"`. */
  label?: string;
  className?: string;
}

// Sample photos from Unsplash (unsplash.com/license).
const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=480&h=600&fit=crop&q=80`;
const DEFAULT_ITEMS: InfiniteGalleryItem[] = [
  { src: photo("1504893524553-b855bce32c67"), title: "Northwind" },
  { src: photo("1472214103451-9374bd1c798e"), title: "Field Notes" },
  { src: photo("1441974231531-c6227db76b6e"), title: "Studio Ono" },
  { src: photo("1454496522488-7a8e488e8606"), title: "Halcyon" },
  { src: photo("1465146344425-f00d5f5c8f07"), title: "Kiln" },
  { src: photo("1507525428034-b723cf961d3e"), title: "Meridian" },
  { src: photo("1513836279014-a89f7a76ae86"), title: "Paper Moon" },
  { src: photo("1476514525535-07fb3b4ae5f1"), title: "Tidal" },
  { src: photo("1500382017468-9049fed747ef"), title: "Verso" },
  { src: photo("1501785888041-af3ef285b470"), title: "Quiet Hours" },
  { src: photo("1447752875215-b2761acb3c5d"), title: "Atlas" },
  { src: photo("1433086966358-54859d0ed716"), title: "Lumen" },
];

const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * Item steps per column and per row, chosen so no card matches a neighbour: left and right,
 * up and down, the staggered diagonals, and across the seams where the wall wraps around.
 */
function spread(n: number, cols: number, rows: number): [number, number] {
  if (n < 2) return [0, 0];
  let best: [number, number] = [1, Math.min(2, n - 1)];
  let bestScore = -1;
  for (let a = 1; a < n; a++)
    for (let b = 1; b < n; b++) {
      const diffs = [a, b, a + b, a - b, a * (cols - 1), b * (rows - 1), 2 * a];
      const score = diffs.filter((d) => mod(d, n) !== 0).length;
      if (score > bestScore) ((best = [a, b]), (bestScore = score));
      if (score === diffs.length) return [a, b];
    }
  return best;
}

export const InfiniteGallery = React.forwardRef<
  HTMLDivElement,
  InfiniteGalleryProps
>(function InfiniteGallery(
  {
    items = DEFAULT_ITEMS,
    cardWidth = 220,
    cardHeight = 280,
    gap = 20,
    stagger = true,
    drift = 24,
    momentum = 0.6,
    depth = 0.35,
    parallax = 0.5,
    wheel = true,
    stretch = 0.6,
    blur = 6,
    intro = true,
    pixelate = true,
    pixelSize = 12,
    showTitles = true,
    newTab = false,
    label = "Project gallery",
    className,
  },
  forwardedRef,
) {
  const still = !!useReducedMotion();
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement);
  const [view, setView] = React.useState({ w: 0, h: 0 });
  const cards = React.useRef<(HTMLElement | null)[]>([]);
  const media = React.useRef<(HTMLElement | null)[]>([]);
  const sources = React.useRef<(HTMLImageElement | HTMLVideoElement | null)[]>(
    [],
  );
  const canvases = React.useRef<(HTMLCanvasElement | null)[]>([]);
  const resolving = React.useRef(new Map<number, AnimationPlaybackControls>());

  // Camera: `pos` eases toward `target`; `vel` is flick momentum added to the target.
  const cam = React.useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
    speed: 0,
  });
  const drag = React.useRef<{
    id: number;
    x: number;
    y: number;
    sx: number;
    sy: number;
    t: number;
    moved: boolean;
  } | null>(null);
  const swallowClick = React.useRef(false);
  const hovering = React.useRef(false);
  const settings = React.useRef({
    drift,
    momentum,
    depth,
    parallax,
    stretch,
    blur,
    still,
  });
  settings.current = { drift, momentum, depth, parallax, stretch, blur, still };
  // Rubber: an underdamped spring that chases the wall's velocity, so it stretches while moving and wobbles back on stop.
  const band = React.useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const blurNode = React.useRef<SVGFEGaussianBlurElement>(null);
  const wall = React.useRef<HTMLDivElement>(null);

  const cellW = cardWidth + gap;
  const cellH = cardHeight + gap;
  // Enough slots to cover the view plus one spare card on every side, so wrapping is never seen.
  const cols = view.w ? Math.ceil(view.w / cellW) + 2 : 0;
  const rows = view.h ? Math.ceil(view.h / cellH) + 2 : 0;
  const slots = React.useMemo(() => {
    const n = items.length;
    const [stepX, stepY] = spread(n, cols, rows);
    const out: { c: number; r: number; item: number; first: boolean }[] = [];
    const seen = new Set<number>();
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const item = mod(c * stepX + r * stepY, n);
        out.push({ c, r, item, first: !seen.has(item) });
        seen.add(item);
      }
    return out;
  }, [cols, rows, items.length]);

  // Intro: starts the first time the gallery is on screen; each card blooms in by its distance from the center.
  const introAt = React.useRef<number | null>(null);
  const introDone = React.useRef(!intro || still);
  const introStarted = React.useRef<boolean[]>([]);
  React.useEffect(() => {
    const el = root.current;
    if (!el || introDone.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && introAt.current === null) {
          introAt.current = performance.now() + 120;
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => setView({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Wheel and trackpad pan the wall; this needs a non-passive listener to keep the page still.
  React.useEffect(() => {
    const el = root.current;
    if (!el || !wheel) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 32 : 1;
      cam.current.tx -= e.deltaX * k;
      cam.current.ty -= e.deltaY * k;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wheel]);

  useAnimationFrame((_, delta) => {
    if (!cols || !rows) return;
    const dt = Math.min(delta, 50) / 1000;
    const s = settings.current;
    const c = cam.current;

    if (!drag.current) {
      // Momentum after a flick, then the idle drift when nobody is touching it.
      c.tx += c.vx * dt;
      c.ty += c.vy * dt;
      const decay = Math.exp(-dt * (1.5 + (1 - s.momentum) * 10));
      c.vx *= decay;
      c.vy *= decay;
      if (!hovering.current && !s.still && s.drift > 0) {
        c.tx -= s.drift * dt * 0.6;
        c.ty -= s.drift * dt;
      }
    }

    const px = c.x;
    const py = c.y;
    const ease = s.still ? 1 : 1 - Math.exp(-dt * 12);
    c.x += (c.tx - c.x) * ease;
    c.y += (c.ty - c.y) * ease;
    const sp = dt > 0 ? Math.hypot(c.x - px, c.y - py) / dt : 0;
    c.speed += (sp - c.speed) * Math.min(1, dt * 8);

    const spanX = cols * cellW;
    const spanY = rows * cellH;
    const cx = view.w / 2;
    const cy = view.h / 2;
    const reach = Math.hypot(cx, cy) || 1;
    const rush = s.still ? 1 : 1 - Math.min(0.08, c.speed / 9000);

    const b = band.current;
    const camVx = dt > 0 ? (c.x - px) / dt : 0;
    const camVy = dt > 0 ? (c.y - py) / dt : 0;
    const K = 190;
    const D = 2 * Math.sqrt(K) * 0.5;
    b.vx += ((camVx - b.x) * K - b.vx * D) * dt;
    b.vy += ((camVy - b.y) * K - b.vy * D) * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    const pull = Math.hypot(b.x, b.y);
    const amount = s.still ? 0 : Math.min(0.2, pull / 3800) * s.stretch;
    const angle = Math.atan2(b.y, b.x);
    // Stretch along the travel direction, thin across it, without distorting the card's own orientation.
    const rubber =
      amount > 0.0005
        ? ` rotate(${angle.toFixed(4)}rad) scale(${(1 + amount).toFixed(4)}, ${(1 - amount * 0.45).toFixed(4)}) rotate(${(-angle).toFixed(4)}rad)`
        : "";
    const sdx = s.still || !s.blur ? 0 : Math.min(s.blur, Math.abs(b.x) / 220);
    const sdy = s.still || !s.blur ? 0 : Math.min(s.blur, Math.abs(b.y) / 220);
    blurNode.current?.setAttribute(
      "stdDeviation",
      `${sdx.toFixed(2)} ${sdy.toFixed(2)}`,
    );
    if (wall.current)
      wall.current.style.filter =
        sdx + sdy > 0.08 ? `url(#${uid}-blur)` : "none";

    const INTRO_SPREAD = 0.6;
    const INTRO_DURATION = 0.9;
    const introClock = introDone.current
      ? Infinity
      : introAt.current === null
        ? -1
        : (performance.now() - introAt.current) / 1000;
    if (introClock > INTRO_SPREAD + INTRO_DURATION + 0.1) {
      introDone.current = true;
      cards.current.forEach(
        (el) => el && ((el.style.opacity = ""), (el.style.filter = "")),
      );
    }

    slots.forEach((slot, i) => {
      const el = cards.current[i];
      if (!el) return;
      const shift = stagger && slot.c % 2 ? cellH * 0.45 : 0;
      const x = mod(slot.c * cellW + c.x, spanX) - cellW;
      const y = mod(slot.r * cellH + c.y + shift, spanY) - cellH;
      const mx = x + cardWidth / 2 - cx;
      const my = y + cardHeight / 2 - cy;
      const scale = s.still
        ? 1
        : (1 - (Math.hypot(mx, my) / reach) * 0.14 * s.depth) * rush;
      let lift = 0;
      let grow = 1;
      if (!introDone.current) {
        // Center first, edges last, with a touch of per-card jitter so it feels organic.
        const delay =
          (Math.hypot(mx, my) / reach) * INTRO_SPREAD + ((i * 0.137) % 0.08);
        const p = Math.min(
          1,
          Math.max(0, (introClock - delay) / INTRO_DURATION),
        );
        const e = 1 - Math.pow(1 - p, 4);
        lift = (1 - e) * 36;
        grow = 0.78 + 0.22 * e;
        el.style.opacity = Math.min(1, p * 2.2).toFixed(3);
        if (p > 0 && !introStarted.current[i]) {
          introStarted.current[i] = true;
          // The image resolves out of pixels as it lands; without pixels it sharpens out of a blur instead.
          if (!resolvePixels(i, true) && p < 1) el.dataset.blurIn = "1";
        }
        el.style.filter =
          el.dataset.blurIn && p < 1
            ? `blur(${((1 - e) * 10).toFixed(2)}px)`
            : "";
      }
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${(y + lift).toFixed(2)}px, 0) scale(${(scale * grow).toFixed(4)})${rubber}`;
      const img = media.current[i];
      if (img && !s.still) {
        const k = s.parallax * 0.06;
        img.style.transform = `translate3d(${(-mx * k).toFixed(2)}px, ${(-my * k).toFixed(2)}px, 0)`;
      }
    });
  });

  const local = (e: React.PointerEvent) => ({ x: e.clientX, y: e.clientY });

  // Hover resolve: redraw the image at shrinking pixel sizes on a canvas over it, then fade the canvas away.
  const resolvePixels = (i: number, fromIntro = false): boolean => {
    if (!pixelate || still || (!fromIntro && drag.current?.moved)) return false;
    const src = sources.current[i];
    const canvas = canvases.current[i];
    if (!src || !canvas) return false;
    const natW =
      src instanceof HTMLVideoElement ? src.videoWidth : src.naturalWidth;
    const natH =
      src instanceof HTMLVideoElement ? src.videoHeight : src.naturalHeight;
    if (!natW || !natH) return false;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (!W || !H) return false;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    // The same crop as object-fit: cover.
    const k = Math.max(W / natW, H / natH);
    const sw = W / k;
    const sh = H / k;
    const sx = (natW - sw) / 2;
    const sy = (natH - sh) / 2;
    const small = document.createElement("canvas");
    const sctx = small.getContext("2d");
    if (!sctx) return false;
    const draw = (block: number) => {
      const w = Math.max(1, Math.ceil(W / block));
      const h = Math.max(1, Math.ceil(H / block));
      small.width = w;
      small.height = h;
      sctx.drawImage(src, sx, sy, sw, sh, 0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(small, 0, 0, w, h, 0, 0, w * block, h * block);
    };
    // Coarse to fine in visible steps, so it reads as pixels snapping into focus.
    const steps = [1, 0.72, 0.5, 0.34, 0.22, 0.13, 0.07].map((f) =>
      Math.max(2, Math.round(pixelSize * f)),
    );
    resolving.current.get(i)?.stop();
    let shown = -1;
    canvas.style.transition = "none";
    canvas.style.opacity = "1";
    draw(steps[0]!);
    resolving.current.set(
      i,
      animate(0, steps.length, {
        duration: 0.55,
        ease: "linear",
        onUpdate: (v) => {
          const at = Math.min(steps.length - 1, Math.floor(v));
          if (at !== shown) {
            shown = at;
            draw(steps[at]!);
          }
        },
        onComplete: () => {
          canvas.style.transition = "opacity 180ms ease-out";
          canvas.style.opacity = "0";
          resolving.current.delete(i);
        },
      }),
    );
    return true;
  };
  React.useEffect(() => () => resolving.current.forEach((c) => c.stop()), []);

  return (
    <div
      ref={root}
      role="region"
      aria-label={label}
      aria-roledescription="infinite gallery"
      tabIndex={0}
      onPointerEnter={(e) =>
        e.pointerType === "mouse" && (hovering.current = true)
      }
      onPointerLeave={() => (hovering.current = false)}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const p = local(e);
        drag.current = {
          id: e.pointerId,
          x: p.x,
          y: p.y,
          sx: p.x,
          sy: p.y,
          t: performance.now(),
          moved: false,
        };
        cam.current.vx = cam.current.vy = 0;
        swallowClick.current = false;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        const p = local(e);
        const now = performance.now();
        const dx = p.x - d.x;
        const dy = p.y - d.y;
        const dt = Math.max(1, now - d.t) / 1000;
        if (!d.moved && Math.hypot(p.x - d.sx, p.y - d.sy) > 5) {
          d.moved = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }
        cam.current.tx += dx;
        cam.current.ty += dy;
        // Smoothed release velocity for the flick.
        cam.current.vx = cam.current.vx * 0.6 + (dx / dt) * 0.4;
        cam.current.vy = cam.current.vy * 0.6 + (dy / dt) * 0.4;
        Object.assign(d, { x: p.x, y: p.y, t: now });
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        if (d.moved) swallowClick.current = true;
        // A pause before letting go cancels the flick.
        if (performance.now() - d.t > 80 || still)
          cam.current.vx = cam.current.vy = 0;
        drag.current = null;
      }}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        const step = {
          ArrowLeft: [cellW, 0],
          ArrowRight: [-cellW, 0],
          ArrowUp: [0, cellH],
          ArrowDown: [0, -cellH],
        }[e.key];
        if (!step || e.target !== e.currentTarget) return;
        e.preventDefault();
        cam.current.tx += step[0]!;
        cam.current.ty += step[1]!;
      }}
      className={cn(
        "relative h-[520px] w-full cursor-grab touch-none select-none overflow-hidden outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-inset",
        className,
      )}
    >
      <svg aria-hidden className="absolute size-0">
        <filter id={`${uid}-blur`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur ref={blurNode} stdDeviation="0 0" />
        </filter>
      </svg>
      <div ref={wall} className="absolute inset-0">
        {slots.map((slot, i) => {
          const item = items[slot.item]!;
          const Card = item.href ? "a" : "div";
          // Repeats are hidden from assistive tech and the tab order; each item is announced once.
          const repeat = !slot.first;
          return (
            <Card
              key={`${slot.c}-${slot.r}`}
              ref={(el: HTMLElement | null) => void (cards.current[i] = el)}
              {...(item.href
                ? {
                    href: item.href,
                    draggable: false,
                    ...(newTab ? { target: "_blank", rel: "noreferrer" } : {}),
                  }
                : {})}
              {...(repeat ? { "aria-hidden": true, tabIndex: -1 } : {})}
              onClick={(e: React.MouseEvent) => {
                if (swallowClick.current) e.preventDefault();
              }}
              onDragStart={(e: React.DragEvent) => e.preventDefault()}
              onPointerEnter={(e: React.PointerEvent) =>
                e.pointerType === "mouse" && resolvePixels(i)
              }
              onFocus={() => resolvePixels(i)}
              className="group/card absolute left-0 top-0 block origin-center overflow-hidden rounded-[20px] bg-zinc-200 outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-zinc-900 dark:bg-zinc-800"
              style={{
                width: cardWidth,
                height: cardHeight,
                opacity: introDone.current ? undefined : 0,
              }}
            >
              <span className="absolute -inset-[8%] block">
                <span
                  ref={(el: HTMLElement | null) => void (media.current[i] = el)}
                  className="block size-full will-change-transform"
                >
                  <span className="relative block size-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06]">
                    {item.video ? (
                      <video
                        src={item.video}
                        poster={item.src}
                        muted
                        loop
                        autoPlay
                        playsInline
                        aria-label={item.alt ?? item.title}
                        ref={(el: HTMLVideoElement | null) =>
                          void (sources.current[i] = el)
                        }
                        className="block size-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.src}
                        alt={repeat ? "" : (item.alt ?? item.title)}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        ref={(el: HTMLImageElement | null) =>
                          void (sources.current[i] = el)
                        }
                        className="block size-full object-cover"
                      />
                    )}
                    {pixelate && (
                      <canvas
                        aria-hidden
                        ref={(el) => void (canvases.current[i] = el)}
                        className="pointer-events-none absolute inset-0 size-full opacity-0"
                      />
                    )}
                  </span>
                </span>
              </span>
              {showTitles && (
                <span className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-between gap-2 opacity-0 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100">
                  <span className="truncate rounded-full bg-white px-3.5 py-2 text-[12px] font-medium leading-none text-zinc-900">
                    {item.title}
                  </span>
                  {item.href && (
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-zinc-900">
                      <ArrowUpRightIcon className="size-4" strokeWidth={2.25} />
                    </span>
                  )}
                </span>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
});