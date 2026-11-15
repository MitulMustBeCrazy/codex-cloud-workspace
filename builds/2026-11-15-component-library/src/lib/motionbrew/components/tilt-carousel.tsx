"use client";

/**
 * TiltCarousel, from https://motion-brew.com/components/tilt-carousel
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
import { animate, motion, type MotionValue, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// TiltCarousel

/**
 * TiltCarousel
 *
 * Trigger: drag (plus press and keys). A row of photo cards that moves on by
 * itself: the one in the middle faces you square on and every card beside it
 * turns away in 3D, shrinking, dimming and softening a little more the further
 * out it sits. It starts gliding on its own and loops round forever, pausing
 * while the pointer rests on it. Drag or flick the row and it follows your
 * hand, then settles on the nearest card with a spring; clicking any card on
 * the left steps one card left, on the right one card right, and the arrow
 * keys step through it too. Reduced
 * motion swaps the springs for plain moves and does not move on by itself.
 *
 * Engine: motion/react (one motion value for the position, per-card
 * transforms derived from it, springs for the settle, a layoutId pill).
 */

export interface TiltCarouselItem {
  src: string;
  title: string;
}

export interface TiltCarouselProps {
  /** Cards in the row. Default twelve photos. */
  items?: TiltCarouselItem[];
  /** Card width in px. Height follows at 4 by 5. Default `220`. */
  cardWidth?: number;
  /** How far the side cards turn away, in degrees. Default `40`. */
  tilt?: number;
  /** Perspective of the stage in px; lower is more dramatic. Default `900`. */
  perspective?: number;
  /** Size of the cards beside the middle one, 0.5 to 1. Default `0.86`. */
  inactiveScale?: number;
  /** How quickly the row glides and settles; `2` is twice as fast. Default `1`. */
  speed?: number;
  /** Move on by itself, pausing while the pointer is over it. Default `true`. */
  autoplay?: boolean;
  /** Seconds each card stays with autoplay on. Default `3`. */
  delay?: number;
  /** Accessible name. Default `"Photo carousel"`. */
  label?: string;
  className?: string;
}

// Sample photos from Unsplash (unsplash.com/license).
const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=750&fit=crop&q=80`;
const DEFAULT_ITEMS: TiltCarouselItem[] = [
  { src: photo("1470071459604-3b5ec3a7fe05"), title: "Soft Signal" },
  { src: photo("1505144808419-1957a94ca61e"), title: "Tide Lines" },
  { src: photo("1475924156734-496f6cac6ec1"), title: "Afterglow" },
  { src: photo("1500534314209-a25ddb2bd429"), title: "Paper Dunes" },
  { src: photo("1494500764479-0c8f2919a3d8"), title: "Night Bloom" },
  { src: photo("1490750967868-88aa4486c946"), title: "Glass Garden" },
  { src: photo("1519681393784-d120267933ba"), title: "Low Orbit" },
  { src: photo("1508739773434-c26b3d09e071"), title: "Velvet Hour" },
  { src: photo("1504893524553-b855bce32c67"), title: "River Run" },
  { src: photo("1507525428034-b723cf961d3e"), title: "Open Water" },
  { src: photo("1454496522488-7a8e488e8606"), title: "First Snow" },
  { src: photo("1433086966358-54859d0ed716"), title: "Falls" },
];

const SETTLE = { type: "spring", stiffness: 260, damping: 30 } as const;

/** Shortest signed distance from the position to card i, wrapping round the row. */
const offset = (i: number, p: number, n: number) => {
  let d = i - p;
  d = ((((d + n / 2) % n) + n) % n) - n / 2;
  return d;
};

function Card({
  item,
  index,
  count,
  pos,
  width,
  tilt,
  scale,
  still,
}: {
  item: TiltCarouselItem;
  index: number;
  count: number;
  pos: MotionValue<number>;
  width: number;
  tilt: number;
  scale: number;
  still: boolean;
}) {
  const d = useTransform(pos, (p) => offset(index, p, count));
  // Cards spread out from the middle, closer together as they turn away.
  const x = useTransform(d, (v) => {
    const s = Math.sign(v);
    const a = Math.abs(v);
    return (
      s * (Math.min(a, 1) * width * 0.86 + Math.max(0, a - 1) * width * 0.52)
    );
  });
  const rotateY = useTransform(d, (v) => -Math.max(-1, Math.min(1, v)) * tilt);
  const z = useTransform(d, (v) => -Math.min(3, Math.abs(v)) * 60);
  const s = useTransform(d, (v) => 1 - (1 - scale) * Math.min(1, Math.abs(v)));
  const brightness = useTransform(
    d,
    (v) => 1 - Math.min(0.28, Math.abs(v) * 0.14),
  );
  const blur = useTransform(d, (v) =>
    Math.max(0, Math.min(2.5, (Math.abs(v) - 0.6) * 1.6)),
  );
  const filter = useTransform([brightness, blur] as const, ([b, bl]) =>
    still ? "none" : `brightness(${b}) blur(${bl}px)`,
  );
  const opacity = useTransform(d, (v) =>
    Math.max(0, Math.min(1, 3.4 - Math.abs(v))),
  );
  const zIndex = useTransform(d, (v) => 100 - Math.round(Math.abs(v) * 10));

  return (
    <motion.div
      aria-hidden
      style={{
        x,
        z,
        rotateY,
        scale: s,
        opacity,
        zIndex,
        filter,
        width,
        height: width * 1.25,
      }}
      className="absolute left-1/2 top-1/2 -ml-[var(--hw)] -mt-[var(--hh)] overflow-hidden rounded-[22px] bg-zinc-200 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_26px_50px_-24px_rgba(0,0,0,0.45)] outline-none will-change-transform dark:bg-zinc-800"
    >
      <img
        src={item.src}
        alt={item.title}
        draggable={false}
        loading="lazy"
        className="size-full select-none object-cover"
      />
    </motion.div>
  );
}

export const TiltCarousel = React.forwardRef<HTMLDivElement, TiltCarouselProps>(
  function TiltCarousel(
    {
      items = DEFAULT_ITEMS,
      cardWidth = 220,
      tilt = 40,
      perspective = 900,
      inactiveScale = 0.86,
      speed = 1,
      autoplay = true,
      delay = 3,
      label = "Photo carousel",
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const n = items.length;
    const pos = useMotionValue(0);
    const [active, setActive] = React.useState(0);
    const [paused, setPaused] = React.useState(false);
    const drag = React.useRef<{
      x: number;
      p: number;
      t: number;
      v: number;
    } | null>(null);
    // A drag that travelled is not a click on the card under the pointer.
    const moved = React.useRef(false);
    const scale = Math.min(1, Math.max(0.5, inactiveScale));

    useMotionValueEvent(pos, "change", (p) => {
      const i = ((Math.round(p) % n) + n) % n;
      setActive((a) => (a === i ? a : i));
    });

    const go = React.useCallback(
      (target: number) => {
        const k = Math.max(0.25, speed);
        animate(
          pos,
          target,
          still
            ? { duration: 0 }
            : {
                ...SETTLE,
                stiffness: SETTLE.stiffness * k * k,
                damping: SETTLE.damping * k,
              },
        );
      },
      [pos, still, speed],
    );
    const step = (dir: number) => go(Math.round(pos.get()) + dir);

    // Autoplay moves on after each wait, unless the pointer is resting on the row.
    React.useEffect(() => {
      if (!autoplay || paused || still) return;
      const t = window.setTimeout(() => step(1), delay * 1000);
      return () => window.clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoplay, paused, active, delay, still]);

    const onDown = (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      pos.stop();
      drag.current = { x: e.clientX, p: pos.get(), t: performance.now(), v: 0 };
      moved.current = false;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };
    const onMove = (e: React.PointerEvent) => {
      const g = drag.current;
      if (!g) return;
      const unit = cardWidth * 0.86;
      const now = performance.now();
      if (Math.abs(e.clientX - g.x) > 6) moved.current = true;
      const next = g.p - (e.clientX - g.x) / unit;
      const dt = Math.max(1, now - g.t);
      g.v = g.v * 0.6 + ((next - pos.get()) / dt) * 1000 * 0.4;
      g.t = now;
      pos.set(next);
    };
    const onUp = (e: React.PointerEvent) => {
      const g = drag.current;
      if (!g) return;
      drag.current = null;
      if (!moved.current && e.type !== "pointercancel") {
        // A click, not a drag: left of the middle card steps left, right of it steps right.
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const fromMiddle = e.clientX - (r.left + r.width / 2);
        if (Math.abs(fromMiddle) > cardWidth / 2) step(Math.sign(fromMiddle));
        else go(Math.round(pos.get()));
        return;
      }
      // Flicks carry on a little, then settle on the nearest card.
      const throwTo = pos.get() + Math.max(-3, Math.min(3, g.v * 0.18));
      go(Math.round(throwTo));
    };

    const height = cardWidth * 1.25;
    const current = items[active]!;

    return (
      <div
        ref={ref}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className={cn(
          "relative w-full select-none outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4",
          className,
        )}
      >
        {/* The row */}
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="relative w-full cursor-grab touch-pan-y active:cursor-grabbing"
          style={
            {
              height: height + 48,
              perspective,
              "--hw": `${cardWidth / 2}px`,
              "--hh": `${height / 2}px`,
            } as React.CSSProperties
          }
        >
          {items.map((item, i) => (
            <Card
              key={item.src + i}
              item={item}
              index={i}
              count={n}
              pos={pos}
              width={cardWidth}
              tilt={tilt}
              scale={scale}
              still={still}
            />
          ))}
        </div>

        <span role="status" aria-live="polite" className="sr-only">
          {autoplay ? "" : `${current.title}, ${active + 1} of ${n}`}
        </span>
      </div>
    );
  },
);