"use client";

/**
 * PrismCarousel, from https://motion-brew.com/components/prism-carousel
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { animate, motion, type MotionValue, useAnimationFrame, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// PrismCarousel

/**
 * PrismCarousel
 *
 * Trigger: drag (plus press, wheel and keys). An endless loop of cards (images,
 * or metric cards) circling slowly through a soft stage that fills its
 * container, with a liquid glass lens at each edge. The lenses are frosted,
 * magnifying strips that blur and over saturate whatever passes beneath them,
 * so a card's colours bloom as it slides into the glass. They behave like a
 * magnetic field: as a card nears an edge the lens swells out to meet it.
 * Inside the glass a card pivots on its inner edge so its outer top and bottom
 * corners flare out, stretched toward the edge, and it eases back to its
 * perfect flat shape before it comes out; the same on both sides. An optional
 * flip turns each card over as it leaves the right glass and enters the left. The row
 * drifts on its own at a set speed; hover slows it to a crawl, and dragging,
 * scrolling sideways, tapping a side card, the arrow keys or the dots take
 * over, snapping to a card, until it eases back in a couple of seconds later.
 * Reduced motion keeps the layout without the movement.
 *
 * Engine: motion/react (one track motion value that the drift, drag and
 * springs all move, and that every card and both lenses derive their bend,
 * stretch, colour, swell and turns from).
 */

export interface PrismCard {
  label: string;
  /** An image fills the card; without one it shows the metric below. */
  image?: string;
  /** The headline number, for metric cards. */
  value?: number;
  /** Text after the number, like "%" or " ms". */
  suffix?: string;
  /** Decimal places for the number. */
  decimals?: number;
  caption?: string;
  /** Two colours for a metric card's glowing orb. */
  hues?: [string, string];
}

export interface PrismCarouselProps {
  cards?: PrismCard[];
  /** Card shown first. Default the second. */
  defaultIndex?: number;
  /** Flip each card over as it leaves the right glass and enters the left. Default `false`. */
  flip?: boolean;
  /** Circle slowly on its own, resting after a touch. Default `true`. */
  autoplay?: boolean;
  /** How fast the row circles on its own, in px per second. Default `80`. */
  speed?: number;
  /** Blur of the edge glass in px. Default `26`. */
  blur?: number;
  /** How much the edge glass saturates what passes under it. Default `2.9`. */
  saturation?: number;
  className?: string;
}

const CARD_W = 216;
const CARD_H = 304;
const GAP = 28;
const STEP = CARD_W + GAP;
/** How far in from each edge the glass reaches, in px: where a card turns. */
const FLIP_PX = 150;
/** A card starts to bend once its middle is this close to an edge, in px. */
const GLASS_PX = 230;
/** Below this stage width the layout scales down, so a phone sees the desktop look, smaller. */
const BASE_W = 720;

/**
 * The geometry for a stage width. Cards scale down with the stage but stay
 * readable (u, never under 70%); the glass, its reach, where cards bend and
 * its blur scale fully with the stage (e), so on a phone the lenses stay
 * slim strips at the edges instead of covering everything.
 */
function geometry(width: number) {
  const r = width / BASE_W;
  const u = Math.min(1, Math.max(0.7, r));
  const e = Math.min(1, Math.max(0.4, r));
  return {
    u,
    e,
    w: CARD_W * u,
    h: CARD_H * u,
    step: STEP * u,
    glass: GLASS_PX * e,
    flipAt: FLIP_PX * e,
    edge: 40 * e,
  };
}
type Geometry = ReturnType<typeof geometry>;

const SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 32,
  mass: 0.9,
} as const;

const DEFAULT_CARDS: PrismCard[] = [
  {
    label: "Uptime",
    value: 99.98,
    decimals: 2,
    suffix: "%",
    caption: "No incidents in the last 30 days.",
    hues: ["#5ee7c4", "#3b82f6"],
  },
  {
    label: "Health score",
    value: 853,
    caption: "Up 41 points since you turned on alerts.",
    hues: ["#c084fc", "#fb7185"],
  },
  {
    label: "Conversion",
    value: 6.4,
    decimals: 1,
    suffix: "%",
    caption: "Checkout changes are paying off.",
    hues: ["#a3e635", "#14b8a6"],
  },
  {
    label: "Latency",
    value: 38,
    suffix: " ms",
    caption: "p95 across all regions this week.",
    hues: ["#60a5fa", "#818cf8"],
  },
  {
    label: "New signups",
    value: 1204,
    caption: "Best week since launch, mostly organic.",
    hues: ["#fbbf24", "#f472b6"],
  },
  {
    label: "NPS",
    value: 72,
    caption: "Teams love the new dashboard.",
    hues: ["#f472b6", "#8b5cf6"],
  },
];

/** Wrap any whole number into 0..n-1, for the endless loop. */
const wrap = (k: number, n: number) => ((k % n) + n) % n;

const format = (n: number, decimals = 0) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

function Card({
  card,
  i,
  slot,
  boost,
  flip,
  x,
  half,
  g,
  active,
  still,
  onPick,
}: {
  card: PrismCard;
  /** Which of the cards this is. */
  i: number;
  /** Its place on the endless track. */
  slot: number;
  /** How far a card's colours bloom near the edges. */
  boost: number;
  /** Half turn on the way out of the right glass and into the left. */
  flip: boolean;
  x: MotionValue<number>;
  half: number;
  /** Sizes for this stage width. */
  g: Geometry;
  active: boolean;
  still: boolean;
  onPick: () => void;
}) {
  // Where the card sits relative to the middle of the stage: 0 in the middle,
  // 1 at an edge, more past it.
  const n = useTransform(
    x,
    (v) => (slot * g.step + g.w / 2 + v - half) / Math.max(1, half),
  );
  // How deep the card is in the glass: 0 while it is clear of both lenses,
  // rising to 1 as its middle nears an edge. Out of the glass a card is its
  // perfect flat self; in it, it bends.
  const depth = useTransform(n, (v) => {
    const fromEdge = half * (1 - Math.abs(v));
    const t = Math.max(0, Math.min(1, (g.glass - fromEdge) / (g.glass - g.edge)));
    return still ? 0 : t * t * (3 - 2 * t);
  });
  // A card does a half turn as it comes out of the right glass, and another as
  // it goes into the left glass, whichever way it is travelling. Each is a
  // timed spin, so it always plays whole and never freezes half way.
  const spin = useMotionValue(0);
  const spinning = React.useRef(false);
  const lastN = React.useRef<number | null>(null);
  useMotionValueEvent(n, "change", (v) => {
    const was = lastN.current;
    lastN.current = v;
    if (!flip || still || spinning.current || was === null) return;
    // The line is the inner rim of each lens, a fixed distance from the edge.
    const at = Math.max(0.2, 1 - g.flipAt / Math.max(1, half));
    const crossed = (line: number) => (was - line) * (v - line) < 0;
    if (crossed(at) || crossed(-at)) {
      spinning.current = true;
      // Turn the way it is moving: leftward cards spin one way, rightward the other.
      const dir = v < was ? 1 : -1;
      void animate(spin, spin.get() + 180 * dir, {
        duration: 0.9,
        ease: [0.65, 0, 0.35, 1],
      }).then(() => {
        spinning.current = false;
      });
    }
  });
  // In the glass the card pivots on its inner edge so its outer top and bottom
  // corners flare out, stretched taller toward the edge, as if the lens were
  // pulling them. It eases back to flat before it leaves the glass.
  const rotateY = useTransform(
    [n, depth, spin] as MotionValue<number>[],
    ([v, d, t]: number[]) => -Math.sign(v!) * d! * 38 + t!,
  );
  const origin = useTransform(n, (v) => (v >= 0 ? "0% 50%" : "100% 50%"));
  // While its face points away, the back shows instead of a mirror image.
  const back = useTransform(rotateY, (r) =>
    Math.cos((r * Math.PI) / 180) < 0 ? 1 : 0,
  );
  // A small lift mid turn.
  const lift = useTransform(
    spin,
    (t) => 1 + 0.08 * Math.abs(Math.sin((Math.PI * t) / 180)),
  );
  const scaleY = useTransform(depth, (d) => 1 + 0.16 * d);
  const pull = useTransform(
    [n, depth] as MotionValue<number>[],
    ([v, d]: number[]) => Math.sign(v!) * d! * 14,
  );
  const scale = lift;
  const scaleX = useTransform(depth, (d) => 1 + 0.04 * d);
  const filter = useTransform(depth, (d) =>
    still || d <= 0
      ? "none"
      : `saturate(${(1 + d * boost).toFixed(2)}) brightness(${(1 + d * 0.06).toFixed(3)}) blur(${(d * 2.5).toFixed(2)}px)`,
  );
  const a = depth;
  const face = useTransform(a, (d) => 1 - d * 0.45);

  // The number counts up each time the card arrives in the middle.
  const value = card.value ?? 0;
  const count = useMotionValue(value);
  const shown = useTransform(count, (v) => format(v, card.decimals));
  React.useEffect(() => {
    if (!active || card.image) return;
    if (still) {
      count.set(value);
      return;
    }
    count.set(value * 0.6);
    const c = animate(count, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => c.stop();
  }, [active, value, card.image, count, still]);

  return (
    <motion.button
      type="button"
      aria-label={
        card.image
          ? card.label
          : `${card.label}: ${format(value, card.decimals)}${card.suffix ?? ""}`
      }
      aria-current={active || undefined}
      tabIndex={-1}
      onClick={onPick}
      style={{
        width: CARD_W,
        height: CARD_H,
        rotateY,
        x: pull,
        scale,
        scaleX,
        scaleY,
        filter,
        transformPerspective: 760,
        transformOrigin: origin,
      }}
      className="relative shrink-0 cursor-pointer overflow-hidden rounded-[18px] bg-white text-left text-[#242423] outline-none shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-20px_rgba(0,0,0,0.28)]"
    >
      {card.image ? (
        <>
          <img
            src={card.image}
            alt={card.label}
            draggable={false}
            className="absolute inset-0 size-full object-cover"
          />
          {/* A soft inner edge, like a print behind glass. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/25"
          />
          <motion.div
            style={{ opacity: face }}
            className="absolute inset-x-2.5 bottom-2.5 rounded-xl bg-white/70 px-3 py-2 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.3)] ring-1 ring-white/60 backdrop-blur-md"
          >
            <p className="truncate text-sm font-semibold tracking-tight">
              {card.label}
            </p>
            {card.caption && (
              <p className="truncate text-xs text-zinc-600">{card.caption}</p>
            )}
          </motion.div>
        </>
      ) : (
        <>
          {/* The glowing orb, breathing slowly. */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-[44%] size-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[22px]"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${card.hues?.[0] ?? "#c084fc"}, ${card.hues?.[1] ?? "#60a5fa"} 70%)`,
            }}
            animate={
              still ? undefined : { scale: [1, 1.12, 1], rotate: [0, 40, 0] }
            }
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-[44%] size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70"
            style={{
              transform: "translate(-50%, -50%) rotateX(62deg) rotateZ(-18deg)",
            }}
          />
          <motion.div
            style={{ opacity: face }}
            className="relative flex h-full flex-col p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-tight">
                {card.label}
              </span>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-zinc-500 ring-1 ring-[#242423]/[0.06]">
                Weekly
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center pb-2">
              <span className="flex items-baseline text-[32px] font-semibold leading-none tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.18)]">
                <motion.span className="tabular-nums">{shown}</motion.span>
                {card.suffix && (
                  <span className="ml-0.5 text-lg">{card.suffix.trim()}</span>
                )}
              </span>
            </div>
            <p className="text-center text-xs leading-4 text-zinc-500">
              {card.caption}
            </p>
          </motion.div>
        </>
      )}
      {/* The back of the card, shown while its face points away: the same card,
          mirrored back so it reads the right way round. */}
      <motion.span
        aria-hidden
        style={{ opacity: back }}
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] bg-white"
      >
        <span className="absolute inset-0 block -scale-x-100">
          {card.image ? (
            <>
              <img
                src={card.image}
                alt=""
                draggable={false}
                className="absolute inset-0 size-full object-cover"
              />
              <span className="absolute inset-x-2.5 bottom-2.5 rounded-xl bg-white/70 px-3 py-2 ring-1 ring-white/60 backdrop-blur-md">
                <span className="block truncate text-sm font-semibold tracking-tight">
                  {card.label}
                </span>
                {card.caption && (
                  <span className="block truncate text-xs text-zinc-600">
                    {card.caption}
                  </span>
                )}
              </span>
            </>
          ) : (
            <>
              <span
                className="absolute left-1/2 top-[44%] size-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[22px]"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${card.hues?.[0] ?? "#c084fc"}, ${card.hues?.[1] ?? "#60a5fa"} 70%)`,
                }}
              />
              <span className="absolute left-4 top-4 text-sm font-semibold tracking-tight">
                {card.label}
              </span>
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[32px] font-semibold leading-none tracking-tight text-white">
                {format(value, card.decimals)}
                {card.suffix?.trim()}
              </span>
            </>
          )}
        </span>
      </motion.span>
    </motion.button>
  );
}

/**
 * How the glass fades out: an eased fall from full to nothing, so the lens
 * has no edge you can see, only a strength that dies away.
 */
const FADE =
  "#000 0%, rgba(0,0,0,0.94) 18%, rgba(0,0,0,0.8) 34%, rgba(0,0,0,0.6) 48%, rgba(0,0,0,0.4) 61%, rgba(0,0,0,0.22) 73%, rgba(0,0,0,0.1) 84%, rgba(0,0,0,0.03) 93%, transparent 100%";

/** One edge lens: frosted glass that swells toward the nearest card. */
function Lens({
  side,
  x,
  slots,
  width,
  g,
  blur,
  saturation,
  still,
}: {
  side: "left" | "right";
  x: MotionValue<number>;
  slots: number[];
  width: number;
  g: Geometry;
  blur: number;
  saturation: number;
  still: boolean;
}) {
  // How close any card is to this edge, 0 to 1.
  const near = useTransform(x, (v) => {
    let best = 0;
    for (const k of slots) {
      const c = k * g.step + g.w / 2 + v;
      const d = side === "left" ? c - g.edge : width - g.edge - c;
      best = Math.max(best, Math.exp(-((d / (150 * g.e)) ** 2)));
    }
    return still ? 0.3 : best;
  });
  const reach = useTransform(near, (p) => (130 + p * 110) * g.e);
  // Taller than the track, so the lens has no top or bottom curve to see.
  const tall = useTransform(near, (p) => 120 + p * 30);
  const at = side === "left" ? "0%" : "100%";
  const mask = useTransform(
    [reach, tall] as MotionValue<number>[],
    ([r, t]: number[]) =>
      `radial-gradient(ellipse ${r}px ${t}% at ${at} 50%, ${FADE})`,
  );
  // Two layers of glass: a soft outer frost and a deep inner lens.
  const soft = useTransform(
    [reach, tall] as MotionValue<number>[],
    ([r, t]: number[]) =>
      `radial-gradient(ellipse ${r! * 1.3}px ${t! + 14}% at ${at} 50%, ${FADE})`,
  );
  const sat = saturation;
  // The blur shrinks with the glass, or a small lens turns everything to fog.
  blur = blur * g.e;
  const softBlur = blur * 0.35;
  const softSat = 1 + (saturation - 1) * 0.4;
  const dir = side === "left" ? "90deg" : "270deg";
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 z-10"
        style={{
          [side]: 0,
          width: 420 * g.e,
          WebkitMaskImage: soft,
          maskImage: soft,
          backdropFilter: `blur(${softBlur}px) saturate(${softSat})`,
          WebkitBackdropFilter: `blur(${softBlur}px) saturate(${softSat})`,
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 z-10"
        style={{
          [side]: 0,
          width: 340 * g.e,
          WebkitMaskImage: mask,
          maskImage: mask,
          backdropFilter: `blur(${blur}px) saturate(${sat}) brightness(1.05) contrast(1.04)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(${sat}) brightness(1.05) contrast(1.04)`,
          // A sheen across the glass, brightest at the edge.
          background: `linear-gradient(${dir}, rgba(255,255,255,0.42), rgba(255,255,255,0.12) 38%, rgba(255,255,255,0) 70%)`,
        }}
      />
    </>
  );
}

export const PrismCarousel = React.forwardRef<
  HTMLDivElement,
  PrismCarouselProps
>(function PrismCarousel(
  {
    cards = DEFAULT_CARDS,
    defaultIndex = 1,
    autoplay = true,
    speed = 80,
    flip = false,
    blur = 26,
    saturation = 2.9,
    className,
  },
  ref,
) {
  const still = !!useReducedMotion();
  const stage = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(720);
  // The track is endless: `pos` counts cards travelled and keeps growing either
  // way; the card shown is that position wrapped into the list.
  const n = cards.length;
  const [pos, setPos] = React.useState(wrap(defaultIndex, n));
  const index = wrap(pos, n);
  const [touched, setTouched] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const dragged = React.useRef(false);
  const half = width / 2;
  const g = React.useMemo(() => geometry(width), [width]);
  const target = (k: number) => half - (k * g.step + g.w / 2);
  const x = useMotionValue(target(pos));
  const wheel = React.useRef(0);

  React.useImperativeHandle(ref, () => stage.current!);
  React.useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // `pos` always follows the track: it is the card nearest the middle.
  const posRef = React.useRef(pos);
  posRef.current = pos;
  useMotionValueEvent(x, "change", (v) => {
    const k = Math.round((half - g.w / 2 - v) / g.step);
    if (k !== posRef.current) setPos(k);
  });
  // Keep the same card centred when the stage changes size.
  const lastHalf = React.useRef(half);
  React.useEffect(() => {
    x.set(x.get() + (half - lastHalf.current));
    lastHalf.current = half;
  }, [half, x]);

  // Glide to a card on a spring.
  const glide = React.useRef<ReturnType<typeof animate> | null>(null);
  const snap = (k: number) => {
    glide.current?.stop();
    if (still) {
      x.set(target(k));
      return Promise.resolve();
    }
    glide.current = animate(x, target(k), SPRING);
    return glide.current.then(() => {});
  };

  // On its own the row circles slowly and endlessly; hover eases it to a slow
  // crawl. A throw carries on with its own momentum, which fades straight
  // into the drift, so there is never a stop.
  const flow = useMotionValue(0);
  const pace = !autoplay || still || touched ? 0 : hover ? 0.3 : 1;
  React.useEffect(() => {
    const c = animate(flow, pace, { duration: 0.6, ease: "easeOut" });
    return () => c.stop();
  }, [pace, flow]);
  const fling = React.useRef(0);
  useAnimationFrame((_, delta) => {
    if (dragged.current) return;
    const dt = Math.min(delta, 100) / 1000;
    const f = flow.get();
    // Momentum from a throw dies away over about a third of a second.
    fling.current *= Math.exp(-dt / 0.35);
    if (Math.abs(fling.current) < 1) fling.current = 0;
    const move = fling.current - speed * f;
    if (move !== 0) x.set(x.get() + move * dt);
  });

  // Keys, dots and taps glide to a card, then the drift picks up at once.
  const turn = React.useRef(0);
  const go = (k: number) => {
    const me = ++turn.current;
    fling.current = 0;
    flow.set(0);
    setTouched(true);
    setPos(k);
    void snap(k).then(() => {
      if (turn.current === me) setTouched(false);
    });
  };
  // Show a card by its place in the list, taking the short way round.
  const show = (i: number) => {
    let d = wrap(i - index, n);
    if (d > n / 2) d -= n;
    go(pos + d);
  };
  // Only the cards near the view are drawn, enough to fill both edges.
  const reachSlots = Math.ceil(half / g.step) + 2;
  const slots = Array.from(
    { length: reachSlots * 2 + 1 },
    (_, j) => pos - reachSlots + j,
  );

  return (
    <div
      ref={stage}
      role="region"
      aria-roledescription="carousel"
      aria-label="Cards"
      tabIndex={0}
      // Only a mouse pauses on hover: a finger never "leaves", which would stop
      // the drift for good on touch screens.
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(pos + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(pos - 1);
        }
      }}
      onWheel={(e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        wheel.current += e.deltaX;
        if (Math.abs(wheel.current) > 60) {
          go(pos + Math.sign(wheel.current));
          wheel.current = 0;
        }
      }}
      className={cn(
        "relative isolate h-full min-h-[400px] w-full select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400",
        "bg-[linear-gradient(180deg,#f3f3f1_0%,#ececea_55%,#e4e4e1_100%)]",
        className,
      )}
    >
      {/* A soft floor of light under the cards. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.65))]"
      />
      <motion.div
        drag={still ? false : "x"}
        dragElastic={0.14}
        dragMomentum={false}
        onDragStart={() => {
          dragged.current = true;
          turn.current++;
          glide.current?.stop();
          fling.current = 0;
          flow.set(0);
          setTouched(true);
        }}
        onDragEnd={(_, info) => {
          window.setTimeout(() => (dragged.current = false), 0);
          // A drag holds the pointer, so a leave during it can be missed:
          // check where the pointer really is now.
          requestAnimationFrame(() =>
            setHover(!!stage.current?.matches(":hover")),
          );
          if (autoplay && !still) {
            // Keep the throw's momentum and blend straight back into the drift.
            fling.current = Math.max(-2400, Math.min(2400, info.velocity.x));
            setTouched(false);
            return;
          }
          // Without the drift, land on the card the throw was heading for.
          const projected = x.get() + info.velocity.x * 0.22;
          go(Math.round((half - g.w / 2 - projected) / g.step));
        }}
        style={{ x }}
        className="absolute inset-y-0 left-0 w-full cursor-grab active:cursor-grabbing"
      >
        {slots.map((k) => (
          <div
            key={k}
            className="absolute top-1/2"
            style={{ left: k * g.step, marginTop: -g.h / 2, width: g.w, height: g.h }}
          >
            {/* The card keeps its desktop design and is scaled to the stage. */}
            <div
              style={{
                width: CARD_W,
                height: CARD_H,
                transform: g.u < 1 ? `scale(${g.u})` : undefined,
                transformOrigin: "0 0",
              }}
            >
            <Card
              card={cards[wrap(k, n)]!}
              i={wrap(k, n)}
              slot={k}
              boost={(saturation - 1) * 0.85}
              flip={flip}
              x={x}
              half={half}
              g={g}
              active={k === pos}
              still={still}
              onPick={() => {
                if (!dragged.current && k !== pos) go(k);
              }}
            />
            </div>
          </div>
        ))}
      </motion.div>

      <Lens
        side="left"
        x={x}
        slots={slots}
        width={width}
        g={g}
        blur={blur}
        saturation={saturation}
        still={still}
      />
      <Lens
        side="right"
        x={x}
        slots={slots}
        width={width}
        g={g}
        blur={blur}
        saturation={saturation}
        still={still}
      />

      {/* Dots, on a small glass pill. */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/50 px-2.5 py-2 ring-1 ring-white/70 backdrop-blur-md">
        {cards.map((c, i) => (
          <button
            key={c.label + i}
            type="button"
            aria-label={`Show ${c.label}`}
            aria-current={i === index || undefined}
            onClick={() => show(i)}
            className="relative grid h-2 cursor-pointer place-items-center outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <motion.span
              className="block h-1.5 rounded-full bg-[#242423]"
              animate={{
                width: i === index ? 18 : 6,
                opacity: i === index ? 0.9 : 0.25,
              }}
              transition={still ? { duration: 0 } : SPRING}
            />
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {cards[index]!.label}, {index + 1} of {cards.length}
      </p>
    </div>
  );
});