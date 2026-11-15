"use client";

/**
 * RibbonGallery, from https://motion-brew.com/components/ribbon-gallery
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 *
 * Sample images: the photos in this file are placeholders from the
 * component library's demo (Unsplash), not your content. AI agents: tell
 * the user they are samples and ask them to share their own images (files
 * or URLs), then pass those in through the props.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { useAnimationFrame, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// RibbonGallery

/**
 * RibbonGallery
 *
 * Trigger: drag (plus wheel, trackpad and touch). An endless ribbon of cards
 * wrapped on the inside of a curved screen and tilted across the frame (20
 * degrees by default). Cards near the edges swing toward you while the center
 * sits back, and every card bends smoothly with the curve. Drag or flick to
 * spin it, scroll to glide, or let it drift. Speed makes the ribbon ripple like
 * fabric (it ripples gently even at rest) and smears it with a motion blur along its length, both settling as it
 * slows to its resting ripple. Hovering a card brings it fully into focus, its
 * ripple settling flat, while the rest of the ribbon fades back. On first view it sweeps in from the side. Reduced motion keeps it
 * still and flat-lit, with no ripple, blur or drift.
 *
 * Engine: motion/react (useAnimationFrame runs the camera; each card is cut into
 * thin vertical slices placed on a cylinder with CSS 3D transforms written
 * straight to the DOM, so it bends without WebGL or React re-renders).
 */

export interface RibbonGalleryItem {
  /** Image URL. */
  src: string;
  title: string;
  /** Alt text. Default the title. */
  alt?: string;
  /** Where the card goes when clicked. */
  href?: string;
}

export interface RibbonGalleryProps {
  /** Cards on the ribbon; repeated as needed to loop. Default sample photos. */
  items?: RibbonGalleryItem[];
  /** Tilt of the ribbon across the frame, degrees. `0` is horizontal. Default `20`. */
  angle?: number;
  /** How strongly the ribbon curves, 0 (flat) to 1 (tight). Default `0.45`. */
  curve?: number;
  /** Card width, px. Default `230`. */
  cardWidth?: number;
  /** Card height, px. Default `290`. */
  cardHeight?: number;
  /** Space between cards, px. Default `14`. */
  gap?: number;
  /** Idle drift, px/s. `0` stops it. Default `30`. */
  drift?: number;
  /** How far a flick carries, 0 to 1. Default `0.65`. */
  momentum?: number;
  /** Ripple strength, 0 (flat) to 2. The ribbon always ripples gently and swells further while dragged or scrolled. Default `1`. */
  wave?: number;
  /** Strongest motion blur along the ribbon, px. `0` turns it off. Default `9.5`. */
  blur?: number;
  /** Sweep in from the side the first time it scrolls into view. Default `true`. */
  intro?: boolean;
  /** Wheel and trackpad move the ribbon while hovered. Default `true`. */
  wheel?: boolean;
  /** How far the other cards fade back while one is hovered, 0 (no fade) to 1. Default `0.75`. */
  dim?: number;
  /** Color the other cards fade toward while one is hovered; match it to the background. Default a light gray. */
  dimColor?: string;
  /** Accessible name. Default `"Project ribbon"`. */
  label?: string;
  className?: string;
}

// Sample photos from Unsplash (unsplash.com/license).
const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1040&h=1280&fit=crop&q=80`;
const DEFAULT_ITEMS: RibbonGalleryItem[] = [
  { src: photo("1470071459604-3b5ec3a7fe05"), title: "Soft Signal" },
  { src: photo("1505144808419-1957a94ca61e"), title: "Tide Lines" },
  { src: photo("1475924156734-496f6cac6ec1"), title: "Afterglow" },
  { src: photo("1500534314209-a25ddb2bd429"), title: "Paper Dunes" },
  { src: photo("1494500764479-0c8f2919a3d8"), title: "Night Bloom" },
  { src: photo("1490750967868-88aa4486c946"), title: "Glass Garden" },
  { src: photo("1519681393784-d120267933ba"), title: "Low Orbit" },
  { src: photo("1508739773434-c26b3d09e071"), title: "Velvet Hour" },
];

/** Vertical slices per card; more is smoother, fewer is cheaper. */
const SLICES = 20;
const PERSPECTIVE = 1400;
/** Slices overlap their neighbours by this much so no hairline seams show between them. */
const OVERLAP = 2;
/** The slice a card's title sits on. */
const TITLE_SLICE = 2;
/**
 * Slices are drawn at this multiple of their size and scaled back down, so the browser rasterises
 * them sharply; otherwise the 3D transforms stretch a normal-size bitmap and the images look soft.
 */
const SUPERSAMPLE = 2;
const mod = (a: number, n: number) => ((a % n) + n) % n;

export const RibbonGallery = React.forwardRef<
  HTMLDivElement,
  RibbonGalleryProps
>(function RibbonGallery(
  {
    items = DEFAULT_ITEMS,
    angle = 20,
    curve = 0.45,
    cardWidth = 230,
    cardHeight = 290,
    gap = 14,
    drift = 30,
    momentum = 0.65,
    wave = 1,
    blur = 9.5,
    intro = true,
    wheel = true,
    dim = 0.75,
    dimColor = "rgb(245 245 245)",
    label = "Project ribbon",
    className,
  },
  forwardedRef,
) {
  const still = !!useReducedMotion();
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement);
  const track = React.useRef<HTMLDivElement>(null);
  const blurNode = React.useRef<SVGFEGaussianBlurElement>(null);
  const slices = React.useRef<(HTMLElement | null)[]>([]);
  const washes = React.useRef<(HTMLElement | null)[]>([]);
  // Titles and arrows ride on top of the slices, each following the bend of the slice it sits on.
  const titles = React.useRef<(HTMLElement | null)[]>([]);
  const arrows = React.useRef<(HTMLElement | null)[]>([]);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const [view, setView] = React.useState({ w: 0, h: 0 });

  const cam = React.useRef({ x: 0, tx: 0, v: 0, time: 0, phase: 0 });
  // Rubber: an underdamped spring chasing the ribbon's speed drives the ripple and blur.
  const band = React.useRef({ x: 0, v: 0 });
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
  // Hover focus: which card is hovered, and each card's eased focus (1 = in focus, 0 = faded back).
  const hovered = React.useRef<number | null>(null);
  const focus = React.useRef<number[]>([]);
  /** Eased 0 to 1 for the hovered card only: calms its ripple. It never moves or scales, so the ribbon keeps its shape. */
  const settled = React.useRef<number[]>([]);
  const written = React.useRef<number[]>([]);
  const introAt = React.useRef<number | null>(null);
  const settings = React.useRef({
    angle,
    drift,
    momentum,
    wave,
    blur,
    dim,
    still,
  });
  settings.current = { angle, drift, momentum, wave, blur, dim, still };

  const pitch = cardWidth + gap;
  const sliceW = cardWidth / SLICES;
  // The ribbon runs along the frame's diagonal at this tilt; its length sets the cylinder radius.
  const rad = (angle * Math.PI) / 180;
  const run = view.w
    ? Math.abs(view.w * Math.cos(rad)) + Math.abs(view.h * Math.sin(rad))
    : 0;
  const radius = run ? run / (0.9 + Math.max(0, Math.min(1, curve)) * 2.6) : 1;
  // Enough cards to cover the visible arc on both sides, repeated from the item list.
  const visibleHalf = Math.min(radius * 1.45, run * 0.9);
  // A whole number of item cycles, so the loop seam never puts a card next to itself.
  const needed = Math.ceil((2 * visibleHalf + cardWidth) / pitch) + 2;
  const count =
    run && items.length ? Math.ceil(needed / items.length) * items.length : 0;
  const span = count * pitch;

  React.useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => setView({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!intro || still) {
      introAt.current = -Infinity;
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && introAt.current === null) {
          introAt.current = performance.now();
          // Start a few cards back so the ribbon sweeps in.
          cam.current.x = cam.current.tx + pitch * 3.2;
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const el = root.current;
    if (!el || !wheel) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 32 : 1;
      cam.current.tx -=
        (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * k;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wheel]);

  useAnimationFrame((_, delta) => {
    if (!count) return;
    const dt = Math.min(delta, 50) / 1000;
    const s = settings.current;
    const c = cam.current;
    c.time += dt;

    if (!drag.current) {
      c.tx += c.v * dt;
      c.v *= Math.exp(-dt * (1.5 + (1 - s.momentum) * 10));
      if (!hovering.current && !s.still && s.drift > 0) c.tx -= s.drift * dt;
    }
    const introAge =
      introAt.current === null
        ? -1
        : (performance.now() - introAt.current) / 1000;
    if (introAge < 0 && !s.still) {
      if (track.current) track.current.style.opacity = "0";
      return;
    }
    // A slower ease during the intro turns the start offset into a long, soft sweep.
    const rate = introAge < 1.6 ? 2.6 + introAge * 4 : 12;
    const px = c.x;
    c.x += (c.tx - c.x) * (s.still ? 1 : 1 - Math.exp(-dt * rate));
    const speed = dt > 0 ? (c.x - px) / dt : 0;

    const b = band.current;
    const K = 160;
    b.v += ((speed - b.x) * K - b.v * 2 * Math.sqrt(K) * 0.45) * dt;
    b.x += b.v * dt;
    const pull = s.still ? 0 : Math.min(1, Math.abs(b.x) / 2200);

    if (track.current) {
      track.current.style.opacity = s.still
        ? "1"
        : Math.min(1, Math.max(0, introAge) * 2.5).toFixed(3);
      const sd = s.still || !s.blur ? 0 : Math.min(s.blur, Math.abs(b.x) / 240);
      blurNode.current?.setAttribute("stdDeviation", `${sd.toFixed(2)} 0`);
      track.current.style.filter = sd > 0.05 ? `url(#${uid}-blur)` : "none";
    }

    // Ripple: a gentle idle swell plus a stronger wave that grows with speed and leans with direction.
    // A gentle ripple is always running; dragging or scrolling swells it.
    const amp = s.still ? 0 : (0.4 + pull * 0.55) * s.wave;
    // The wave travels by accumulating phase at a rate that follows the ribbon's speed. Never multiply time by
    // the direction's sign: near rest the sign flickers and the whole wave would snap back and forth.
    c.phase += dt * (1.2 - Math.max(-3, Math.min(3, b.x / 300)));
    const R = radius;
    const maxPhi = 1.45;

    const focusEase = s.still ? 1 : 1 - Math.exp(-dt * 9);
    for (let k = 0; k < count; k++) {
      const center = mod(k * pitch + c.x + span / 2, span) - span / 2;
      const want = hovered.current === null || hovered.current === k ? 1 : 0;
      const f =
        (focus.current[k] ??= 1) + (want - (focus.current[k] ?? 1)) * focusEase;
      focus.current[k] = f;
      const up =
        (settled.current[k] ?? 0) +
        ((hovered.current === k ? 1 : 0) - (settled.current[k] ?? 0)) *
          focusEase;
      settled.current[k] = up;
      // The focused card settles flat: a ripple running through it would read as the image squeezing.
      const cardAmp = amp * (1 - up);
      const opacity = 1 - (1 - f) * Math.max(0, Math.min(1, s.dim)) * 0.88;
      // Faded cards are washed toward the background per slice. Opacity would show darker stripes where
      // neighbouring slices overlap, and fading the card as a group would flatten its 3D curve.
      const writeOpacity =
        Math.abs((written.current[k] ?? 1) - opacity) > 0.002;
      if (writeOpacity) written.current[k] = opacity;
      for (let j = 0; j < SLICES; j++) {
        const el = slices.current[k * SLICES + j];
        if (!el) continue;
        const x = center - cardWidth / 2 + (j + 0.5) * sliceW;
        const phi = x / R;
        const depth = R * (1 - Math.cos(phi));
        // Also drop slices that would come too close to the camera on a flat, wide curve.
        const hidden = Math.abs(phi) > maxPhi || depth > PERSPECTIVE * 0.7;
        let transform = "";
        if (!hidden) {
          const wobble = Math.sin(phi * 2.4 - c.phase);
          const ty = wobble * 26 * cardAmp;
          const sy = 1 + Math.cos(phi * 1.9 + c.time * 1.2) * 0.1 * cardAmp;
          // Inside of a cylinder: the edges come toward the viewer, facing the center.
          transform = `translate3d(${(R * Math.sin(phi)).toFixed(2)}px, ${ty.toFixed(2)}px, ${depth.toFixed(2)}px) rotateY(${(-phi).toFixed(4)}rad) scaleY(${sy.toFixed(4)})`;
          el.style.transform = `${transform} scale(${1 / SUPERSAMPLE})`;
        }
        el.style.visibility = hidden ? "hidden" : "visible";
        const wash = washes.current[k * SLICES + j];
        if (writeOpacity && wash) wash.style.opacity = (1 - opacity).toFixed(3);
        const overlay =
          j === TITLE_SLICE
            ? titles.current[k]
            : j === SLICES - 1
              ? arrows.current[k]
              : null;
        if (overlay) {
          overlay.style.visibility = hidden ? "hidden" : "visible";
          if (writeOpacity) overlay.style.opacity = opacity.toFixed(3);
          if (!hidden) overlay.style.transform = transform;
        }
      }
    }
  });

  return (
    <div
      ref={root}
      role="region"
      aria-label={label}
      aria-roledescription="carousel"
      tabIndex={0}
      onPointerEnter={(e) =>
        e.pointerType === "mouse" && (hovering.current = true)
      }
      onPointerLeave={() => {
        hovering.current = false;
        hovered.current = null;
      }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          sx: e.clientX,
          sy: e.clientY,
          t: performance.now(),
          moved: false,
        };
        cam.current.v = 0;
        swallowClick.current = false;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        const now = performance.now();
        // Only movement along the ribbon counts.
        const a = (settings.current.angle * Math.PI) / 180;
        const along =
          (e.clientX - d.x) * Math.cos(a) - (e.clientY - d.y) * Math.sin(a);
        if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5) {
          d.moved = true;
          e.currentTarget.setPointerCapture(e.pointerId);
        }
        cam.current.tx += along;
        cam.current.v =
          cam.current.v * 0.6 + (along / (Math.max(1, now - d.t) / 1000)) * 0.4;
        Object.assign(d, { x: e.clientX, y: e.clientY, t: now });
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        if (d.moved) swallowClick.current = true;
        if (performance.now() - d.t > 80 || still) cam.current.v = 0;
        drag.current = null;
      }}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "ArrowLeft" || e.key === "ArrowUp")
          (e.preventDefault(), (cam.current.tx += pitch));
        if (e.key === "ArrowRight" || e.key === "ArrowDown")
          (e.preventDefault(), (cam.current.tx -= pitch));
      }}
      className={cn(
        "relative h-[520px] w-full cursor-grab touch-none select-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400",
        className,
      )}
    >
      <svg aria-hidden className="absolute size-0">
        <filter id={`${uid}-blur`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur ref={blurNode} stdDeviation="0 0" />
        </filter>
      </svg>

      <div
        ref={track}
        className="absolute left-1/2 top-1/2 size-0"
        style={{
          transform: `rotate(${-angle}deg)`,
          opacity: 0,
        }}
      >
        {Array.from({ length: count }, (_, k) => {
          const item = items[k % items.length]!;
          const repeat = k >= items.length;
          const Card = item.href ? "a" : "div";
          return (
            <Card
              key={k}
              {...(item.href ? { href: item.href, draggable: false } : {})}
              {...(repeat
                ? { "aria-hidden": true, tabIndex: -1 }
                : { "aria-label": item.alt ?? item.title })}
              onClick={(e: React.MouseEvent) =>
                swallowClick.current && e.preventDefault()
              }
              onDragStart={(e: React.DragEvent) => e.preventDefault()}
              onPointerEnter={(e: React.PointerEvent) => {
                if (e.pointerType === "mouse" && !drag.current?.moved)
                  hovered.current = k;
              }}
              onPointerLeave={(e: React.PointerEvent) => {
                if (e.pointerType === "mouse" && hovered.current === k)
                  hovered.current = null;
              }}
              onFocus={() => (hovered.current = k)}
              onBlur={() => hovered.current === k && (hovered.current = null)}
              className="group/card absolute left-0 top-0 block outline-none"
              // Perspective sits on each card because CSS perspective only reaches direct children (the slices).
              style={{ perspective: PERSPECTIVE }}
            >
              {Array.from({ length: SLICES }, (_, j) => (
                <span
                  key={j}
                  ref={(el) => void (slices.current[k * SLICES + j] = el)}
                  className={cn(
                    "absolute block bg-zinc-300 will-change-transform dark:bg-zinc-700",
                    j === 0 && "rounded-l-[36px]",
                    j === SLICES - 1 && "rounded-r-[36px]",
                  )}
                  style={{
                    width: (sliceW + OVERLAP * 2) * SUPERSAMPLE,
                    height: cardHeight * SUPERSAMPLE,
                    left: (-sliceW / 2 - OVERLAP) * SUPERSAMPLE,
                    top: (-cardHeight / 2) * SUPERSAMPLE,
                    backgroundImage: `url("${item.src}")`,
                    backgroundSize: `${cardWidth * SUPERSAMPLE}px ${cardHeight * SUPERSAMPLE}px`,
                    backgroundPosition: `${(-j * sliceW + OVERLAP) * SUPERSAMPLE}px 0`,
                    visibility: "hidden",
                  }}
                >
                  <span
                    ref={(el) => void (washes.current[k * SLICES + j] = el)}
                    className="pointer-events-none absolute inset-0 block rounded-[inherit]"
                    style={{ background: dimColor, opacity: 0 }}
                  />
                </span>
              ))}
              {/* Overlays come last so they paint above every slice. */}
              <span
                ref={(el) => void (titles.current[k] = el)}
                className="pointer-events-none absolute block whitespace-nowrap text-[14px] font-medium leading-none tracking-tight text-white will-change-transform [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]"
                style={{
                  left: -sliceW / 2 - TITLE_SLICE * sliceW + 18,
                  top: cardHeight / 2 - 34,
                  visibility: "hidden",
                }}
              >
                {item.title}
              </span>
              <span
                ref={(el) => void (arrows.current[k] = el)}
                className="pointer-events-none absolute block will-change-transform"
                style={{
                  left: sliceW / 2 - 14 - 28,
                  top: cardHeight / 2 - 18 - 28,
                  visibility: "hidden",
                }}
              >
                <span className="grid size-7 place-items-center rounded-full bg-white text-zinc-900 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.18]">
                  <ArrowRight className="size-3.5" strokeWidth={2.5} />
                </span>
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
});