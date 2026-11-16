"use client";

/**
 * DepthCarousel, from https://motion-brew.com/components/depth-carousel
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
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// DepthCarousel

/**
 * DepthCarousel
 *
 * Trigger: hover, drag and scroll. A stack of cards receding into depth along
 * a diagonal, each turned a little toward the viewer. It drifts slowly on its
 * own; scroll, drag or the arrow keys glide it through the stack with
 * momentum, and fast moves smear with a motion blur along the diagonal.
 * Hovering a card pulls it up out of the stack and toward you: it draws in
 * front of the others fully solid, turns to face you square on and tilts
 * toward the cursor in perspective with a plastic shine (a hot spot that
 * follows the cursor, a sheen band that slides as it tilts and a bright
 * laminated edge), while every other card stays solid but
 * sinks out of focus.
 * The stack climbs up or down the frame, set by `direction`; changing it
 * eases the whole stack across.
 * The stack runs off both corners of the frame and loops forever, wrapping
 * round out of sight. Reduced
 * motion stops the drift, the blur and the tilt.
 *
 * Engine: motion/react (springs for the hover lift, tilt and shine) with one
 * requestAnimationFrame loop placing the cards and driving the SVG motion
 * blur.
 */

export interface DepthCarouselItem {
  src: string;
  title: string;
}

export interface DepthCarouselProps {
  /** Cards in the stack. Default twelve photos. */
  items?: DepthCarouselItem[];
  /** Which way the stack climbs. Default `"up"`. */
  direction?: "up" | "down";
  /** Cards per second the stack drifts on its own. `0` holds it still. Default `0.18`. */
  drift?: number;
  /** Strength of the motion blur, 0 to 2. Default `1`. */
  blur?: number;
  /** Accessible name. Default `"Photo stack"`. */
  label?: string;
  className?: string;
}

// Sample photos from Unsplash (unsplash.com/license).
const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=840&fit=crop&q=80`;
const DEFAULT_ITEMS: DepthCarouselItem[] = [
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

const CARD_W = 200;
const CARD_H = 280;
/** Spacing between neighbours along the diagonal: across, up and into the screen. */
const STEP_X = 118;
const STEP_Y = 60;
const STEP_Z = 150;
const TURN = -24;
/**
 * Cards kept in front of the anchor. The stack runs on past the bottom corner the
 * same way it runs off the top, so it reads as one endless line through the frame.
 */
const AHEAD = 4;

const wrap = (v: number, n: number) => ((v % n) + n) % n;

/** One card. Its outer box is placed by the loop; the inner face lifts and tilts on hover. */
function Card({
  item,
  index,
  hovered,
  dimmed,
  onHover,
  still,
  setRef,
}: {
  item: DepthCarouselItem;
  index: number;
  hovered: boolean;
  dimmed: boolean;
  onHover: (i: number | null) => void;
  still: boolean;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22 };
  const rx = useSpring(useTransform(py, [0, 1], [9, -9]), spring);
  const ry = useSpring(useTransform(px, [0, 1], [-11, 11]), spring);
  // Pulled out of the stack, the card also turns to face the viewer square on.
  const face = useSpring(0, { stiffness: 240, damping: 26 });
  React.useEffect(
    () => face.set(hovered && !still ? -TURN : 0),
    [hovered, still, face],
  );
  const turn = useTransform(() => face.get() + (hovered ? ry.get() : 0));
  // A laminated finish: a hot spot that follows the cursor and a long sheen band
  // that slides across as the card tilts, like light on a plastic card.
  const sx = useSpring(px, { stiffness: 180, damping: 24 });
  const sy = useSpring(py, { stiffness: 180, damping: 24 });
  const glareX = useTransform(sx, (v) => `${v * 100}%`);
  const glareY = useTransform(sy, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(240px circle at ${glareX} ${glareY}, rgba(255,255,255,0.9), rgba(255,255,255,0.28) 34%, transparent 64%)`;
  const spot = useMotionTemplate`radial-gradient(110px circle at ${glareX} ${glareY}, rgba(255,255,255,0.38), transparent 70%)`;
  const sheenPos = useTransform(sx, (v) => `${15 + (1 - v) * 70}% 50%`);

  return (
    <div
      ref={setRef}
      className="absolute left-0 top-0 will-change-transform"
      style={{ width: CARD_W, height: CARD_H, transformStyle: "preserve-3d" }}
      // Hover is read from this box, which never moves on hover. If the lifting,
      // tilting face below took the pointer, it could slide out from under it at
      // a corner, drop back, catch it again and flicker.
      onPointerEnter={() => onHover(index)}
      onPointerLeave={() => {
        onHover(null);
        px.set(0.5);
        py.set(0.5);
      }}
      onPointerMove={(e) => {
        if (still) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
        py.set(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
      }}
    >
      <motion.figure
        animate={{
          y: hovered && !still ? -40 : 0,
          z: hovered && !still ? 120 : 0,
          scale: hovered && !still ? 1.06 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          rotateX: hovered ? rx : 0,
          rotateY: turn,
          transformStyle: "preserve-3d",
        }}
        className="pointer-events-none relative m-0 size-full"
      >
        <div
          className={cn(
            "relative size-full overflow-hidden rounded-2xl bg-zinc-200 shadow-[0_2px_6px_rgba(0,0,0,0.12),0_24px_48px_-20px_rgba(0,0,0,0.45)] transition-[filter,opacity] duration-300 dark:bg-zinc-800",
            hovered &&
              "shadow-[0_4px_10px_rgba(0,0,0,0.16),0_40px_70px_-24px_rgba(0,0,0,0.55)]",
          )}
          style={{
            filter: dimmed
              ? "blur(4px) saturate(0.7) brightness(1.06) contrast(0.9)"
              : "blur(0px) saturate(1)",
            opacity: 1,
          }}
        >
          <img
            src={item.src}
            alt={item.title}
            draggable={false}
            loading="lazy"
            className="size-full select-none object-cover"
          />
          {/* Plastic finish, only while the card is held up. */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-300"
            style={{ background: glare, opacity: hovered && !still ? 1 : 0 }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-300"
            style={{ background: spot, opacity: hovered && !still ? 1 : 0 }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-300"
            style={{
              backgroundImage:
                "linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.1) 41%, rgba(255,255,255,0.5) 47%, rgba(255,255,255,0.1) 53%, transparent 62%)",
              backgroundSize: "220% 100%",
              backgroundPosition: sheenPos,
              opacity: hovered && !still ? 1 : 0,
            }}
          />
          {/* A bright laminated edge and a faint top highlight give the card some thickness. */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300",
              hovered ? "opacity-100" : "opacity-0",
            )}
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.45), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.12)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18), transparent 22%)",
            }}
          />
          <figcaption
            className={cn(
              "absolute inset-x-3 bottom-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-900 backdrop-blur transition-[opacity,transform] duration-300",
              hovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            )}
          >
            {item.title}
          </figcaption>
        </div>
      </motion.figure>
    </div>
  );
}

export const DepthCarousel = React.forwardRef<
  HTMLDivElement,
  DepthCarouselProps
>(function DepthCarousel(
  {
    items = DEFAULT_ITEMS,
    direction: directionProp = "up",
    drift = 0.18,
    blur = 1,
    label = "Photo stack",
    className,
  },
  ref,
) {
  const still = !!useReducedMotion();
  const uid = React.useId().replace(/:/g, "");
  const stage = React.useRef<HTMLDivElement>(null);
  const blurNode = React.useRef<SVGFEGaussianBlurElement>(null);
  const cards = React.useRef<(HTMLDivElement | null)[]>([]);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const direction = directionProp;
  const [current, setCurrent] = React.useState(0);
  // Only announce the card in front once someone steers with the keys, not while it drifts.
  const [steered, setSteered] = React.useState(false);

  const settings = React.useRef({ drift, blur, still, hovered, direction });
  settings.current = { drift, blur, still, hovered, direction };
  const motionState = React.useRef({
    s: 0,
    target: 0,
    v: 0,
    dir: directionProp === "up" ? 1 : -1,
    drag: null as null | { x: number; t: number; v: number },
  });

  React.useEffect(() => {
    const host = stage.current;
    if (!host) return;
    const m = motionState.current;
    const n = items.length;
    let raf = 0;
    let last = performance.now();
    let shown = -1;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const set = settings.current;

      // Drift on its own unless someone is holding, hovering or the user prefers stillness.
      if (!set.still && !m.drag && set.hovered === null)
        m.target += set.drift * dt;
      // Glide toward the target on a critically damped spring.
      const k = set.still ? 1 : 1 - Math.exp(-dt * 7);
      const prev = m.s;
      m.s += (m.target - m.s) * k;
      const v = (m.s - prev) / Math.max(dt, 0.001);
      m.v += (v - m.v) * Math.min(1, dt * 12);
      // The stack's climb eases between up and down when `direction` changes.
      const want = set.direction === "up" ? 1 : -1;
      m.dir += (want - m.dir) * Math.min(1, dt * 6);

      // Motion blur along the diagonal, in proportion to speed.
      const amount = set.still ? 0 : Math.min(12, Math.abs(m.v) * 8) * set.blur;
      blurNode.current?.setAttribute(
        "stdDeviation",
        `${amount.toFixed(2)} ${(amount * 0.38).toFixed(2)}`,
      );

      const w = host.clientWidth;
      const h = host.clientHeight;
      // The anchor sits a little left of centre; cards ahead of it run off the bottom
      // corner (top corner when the stack climbs down) and cards behind it off the far one.
      const ax = w * 0.4 - CARD_W / 2;
      const ay = h * (0.5 + 0.04 * m.dir) - CARD_H / 2;
      for (let i = 0; i < n; i++) {
        const el = cards.current[i];
        if (!el) continue;
        // Position along the stack: 0 is the anchor, negative is nearer, higher is deeper.
        const t = wrap(i - m.s + AHEAD, n) - AHEAD;
        const x = ax + t * STEP_X;
        const y = ay - t * STEP_Y * m.dir;
        const z = -t * STEP_Z;
        // Cards only fade at the two seams where they wrap round, both well outside the frame.
        const front = Math.min(1, Math.max(0, (t + AHEAD) / 0.6));
        const back = Math.min(1, Math.max(0, (n - AHEAD - 0.4 - t) / 0.8));
        el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${TURN}deg)`;
        // The card pulled out of the stack draws in front of the rest, solid, so nothing shows through it.
        const lifted = set.hovered === i;
        el.style.opacity = String(lifted ? 1 : front * back);
        el.style.zIndex = String(lifted ? 1500 : Math.round(1000 - t * 10));
        el.style.pointerEvents = front * back > 0.6 ? "auto" : "none";
      }

      const nearest = wrap(Math.round(m.s), n);
      if (nearest !== shown) {
        shown = nearest;
        setCurrent(nearest);
      }
    };
    frame();

    // Wheel and trackpad: either axis moves through the stack.
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 1) return;
      e.preventDefault();
      m.target += d / 260;
    };
    // Drag: follow the pointer, then coast on the release speed.
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      m.drag = { x: e.clientX, t: performance.now(), v: 0 };
      host.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!m.drag) return;
      const now = performance.now();
      const dx = e.clientX - m.drag.x;
      const step = -dx / 150;
      m.target += step;
      m.drag.v =
        m.drag.v * 0.6 + (step / Math.max(1, now - m.drag.t)) * 1000 * 0.4;
      m.drag.x = e.clientX;
      m.drag.t = now;
    };
    const onUp = () => {
      if (!m.drag) return;
      m.target += Math.max(-4, Math.min(4, m.drag.v * 0.35));
      m.drag = null;
    };
    host.addEventListener("wheel", onWheel, { passive: false });
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("wheel", onWheel);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
    };
  }, [items.length]);

  const onKey = (e: React.KeyboardEvent) => {
    const m = motionState.current;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      m.target = Math.round(m.target) + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      m.target = Math.round(m.target) - 1;
    else return;
    e.preventDefault();
    setSteered(true);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-[520px] w-full rounded-3xl bg-zinc-100 dark:bg-zinc-950",
        className,
      )}
    >
      <svg aria-hidden className="absolute size-0">
        <filter id={`${uid}-mb`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur ref={blurNode} stdDeviation="0 0" />
        </filter>
      </svg>

      <div
        ref={stage}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        onKeyDown={onKey}
        className="absolute inset-0 cursor-grab touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400 active:cursor-grabbing"
      >
        {/* The blur filter flattens its own box, so the perspective lives here too: the cards are its direct children. */}
        <div
          className="absolute inset-0"
          style={{
            perspective: 1400,
            perspectiveOrigin: "40% 50%",
            filter: `url(#${uid}-mb)`,
          }}
        >
          {items.map((item, i) => (
            <Card
              key={item.src + i}
              item={item}
              index={i}
              hovered={hovered === i}
              dimmed={hovered !== null && hovered !== i}
              onHover={setHovered}
              still={still}
              setRef={(el) => void (cards.current[i] = el)}
            />
          ))}
        </div>
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {steered
          ? `${items[current]?.title ?? ""}, ${current + 1} of ${items.length}`
          : ""}
      </span>
    </div>
  );
});