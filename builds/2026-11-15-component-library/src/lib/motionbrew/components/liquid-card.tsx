"use client";

/**
 * LiquidCard, from https://motion-brew.com/components/liquid-card
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { useGSAP } from "@gsap/react";
import { type ClassValue, clsx } from "clsx";
import gsap from "gsap";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// LiquidCard

/**
 * LiquidCard
 *
 * Trigger: drag (plus hover, keys and in view). A tall card with a huge icon
 * bleeding off its right edge, used as a glass container: the empty part is a
 * soft tint and a coloured liquid fills it to the value, glowing. When the
 * card scrolls into view the liquid pours in from empty and settles with a
 * little spring while the number counts up. Its surface rolls with two offset
 * waves and bubbles rise through it. Moving the pointer quickly sloshes the
 * liquid, tilting its surface against the motion before it wobbles level
 * again. Drag up or down on the icon (or use the arrow keys) to set the level;
 * the number follows. A blurred copy of the icon glows behind it and a faint
 * glow rises from the bottom edge, softer on the white card. On hover a soft glow in the liquid's colour follows the
 * pointer and a thin line of the colour runs round the outline, all inside
 * the card. Four icons ship: a bolt, a
 * cloud, a shield and a drop, and LiquidCarousel shows them one at a time.
 * Reduced motion shows the level still, with no waves or bubbles.
 *
 * Engine: gsap + @gsap/react (an elastic pour, endless wave tweens, bubble
 * timelines, a counting tween, svgOrigin rotation for the slosh, quickTo for
 * dragging the level), scoped with useGSAP; motion/react springs for the
 * carousel slide.
 */

export type LiquidIcon = "bolt" | "cloud" | "shield" | "drop";

export interface LiquidCardProps {
  /** Which icon holds the liquid. Default `"bolt"`. */
  icon?: LiquidIcon;
  /** Fill level, 0 to 100. Default per icon. */
  value?: number;
  /** Small label at the top. Default per icon. */
  label?: string;
  /** Word under the number. Default per icon. */
  caption?: string;
  /** Two line message at the bottom. Default per icon. */
  message?: [string, string];
  /** Liquid colour. Default per icon. */
  color?: string;
  /** Light (white card) or dark. Default `"light"`. */
  theme?: "light" | "dark";
  /** Let people drag the level. Default `true`. */
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

/** Mix a hex colour toward white by `k` (0 to 1). */
const lighten = (hex: string, k: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  const ch = (shift: number) =>
    Math.round(((n >> shift) & 255) + (255 - ((n >> shift) & 255)) * k);
  return `#${[16, 8, 0].map((sh) => ch(sh).toString(16).padStart(2, "0")).join("")}`;
};

// The icons are drawn in a 200 by 300 box; the liquid fills that box from the bottom.
const W = 200;
const H = 300;
/** A closed path through the points with every corner rounded off. */
const rounded = (pts: [number, number][], r: number) => {
  const n = pts.length;
  let d = "";
  pts.forEach(([x, y], i) => {
    const [px, py] = pts[(i - 1 + n) % n]!;
    const [nx, ny] = pts[(i + 1) % n]!;
    const toward = (tx: number, ty: number) => {
      const len = Math.hypot(tx - x, ty - y) || 1;
      const k = Math.min(r, len / 2) / len;
      return [x + (tx - x) * k, y + (ty - y) * k] as const;
    };
    const [ax, ay] = toward(px, py);
    const [bx, by] = toward(nx, ny);
    d += `${i ? " L" : "M"} ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${x} ${y} ${bx.toFixed(1)} ${by.toFixed(1)}`;
  });
  return `${d} Z`;
};

const ICONS: Record<LiquidIcon, string> = {
  bolt: rounded(
    [
      [128, 2],
      [14, 180],
      [94, 180],
      [62, 298],
      [190, 108],
      [112, 108],
      [154, 2],
    ],
    14,
  ),
  cloud:
    "M58 250 C24 250 6 224 6 196 C6 166 30 144 58 144 C62 98 98 66 142 70 C176 74 196 104 194 140 C194 142 194 144 194 146 C196 148 198 150 198 152 L198 200 C198 230 176 250 148 250 Z",
  shield:
    "M100 8 L188 42 L188 140 C188 214 146 266 100 292 C54 266 12 214 12 140 L12 42 Z",
  drop: "M100 6 C100 6 22 118 22 186 C22 238 58 274 100 274 C142 274 178 238 178 186 C178 118 100 6 100 6 Z",
};
const PRESETS: Record<
  LiquidIcon,
  {
    value: number;
    label: string;
    caption: string;
    message: [string, string];
    color: string;
    /** A brighter, more saturated take for the dark card, where the base looks dull. */
    glow: string;
  }
> = {
  bolt: {
    value: 85,
    label: "Battery",
    caption: "charged",
    message: ["Almost there,", "full in 12 min"],
    color: "#3cc97a",
    glow: "#5ff0a0",
  },
  cloud: {
    value: 62,
    label: "Cloud storage",
    caption: "used",
    message: ["Room to grow,", "38 GB free"],
    color: "#5b8def",
    glow: "#3dcbff",
  },
  shield: {
    value: 94,
    label: "Security score",
    caption: "protected",
    message: ["All clear,", "scanned today"],
    color: "#8b6cf6",
    glow: "#9d6bff",
  },
  drop: {
    value: 70,
    label: "Hydration",
    caption: "of daily goal",
    message: ["Keep sipping,", "three to go"],
    color: "#25b6d2",
    glow: "#14d8f5",
  },
};

// One wave period across the icon box; the surface path repeats it so it can scroll seamlessly.
const PERIOD = 200;
// Some icons sit a little further in from the right edge, in px.
const SHIFT: Partial<Record<LiquidIcon, number>> = { bolt: 18 };
const wave = (amp: number, phase: number) => {
  let d = "";
  for (let x = -PERIOD * 2; x <= W + PERIOD * 2; x += 8) {
    const y = amp * Math.sin((x / PERIOD) * Math.PI * 2 + phase);
    d += `${d ? " L" : "M"} ${x} ${y.toFixed(2)}`;
  }
  return `${d} L ${W + PERIOD * 2} ${H + 40} L ${-PERIOD * 2} ${H + 40} Z`;
};

export const LiquidCard = React.forwardRef<HTMLDivElement, LiquidCardProps>(
  function LiquidCard(
    {
      icon = "bolt",
      value,
      label,
      caption,
      message,
      color,
      theme = "light",
      interactive = true,
      onChange,
      className,
    },
    ref,
  ) {
    const preset = PRESETS[icon];
    // On the dark card the colours go a step lighter and brighter so they do not look dull.
    const fill = color
      ? theme === "dark"
        ? lighten(color, 0.22)
        : color
      : theme === "dark"
        ? preset.glow
        : preset.color;
    const start = Math.min(100, Math.max(0, value ?? preset.value));
    const dark = theme === "dark";
    const still = !!useReducedMotion();
    const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");

    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const svg = React.useRef<SVGSVGElement>(null);
    const liquid = React.useRef<SVGGElement>(null);
    const front = React.useRef<SVGPathElement>(null);
    const back = React.useRef<SVGPathElement>(null);
    const num = React.useRef<HTMLSpanElement>(null);
    const bubbles = React.useRef<(SVGCircleElement | null)[]>([]);
    const ring = React.useRef<HTMLDivElement>(null);

    // The level lives in a plain object so GSAP can tween it and every part reads it.
    const level = React.useRef({ v: still ? start : 0 });
    const [shown, setShown] = React.useState(start);
    const [hover, setHover] = React.useState(false);
    const surfaceY = (v: number) => H - (v / 100) * (H + 12) + 6;

    const paint = React.useCallback(() => {
      const v = level.current.v;
      if (liquid.current) gsap.set(liquid.current, { y: surfaceY(v) });
      if (num.current) num.current.textContent = String(Math.round(v));
    }, []);

    const { contextSafe } = useGSAP(
      () => {
        paint();
        if (still) return;
        // The outline shimmer turns slowly round the card.
        gsap.to(ring.current, {
          rotation: 360,
          duration: 3.2,
          ease: "none",
          repeat: -1,
        });
        // Endless rolling waves, the back one slower and the other way.
        gsap.to(front.current, {
          x: PERIOD,
          duration: 2.4,
          ease: "none",
          repeat: -1,
        });
        gsap.fromTo(
          back.current,
          { x: PERIOD },
          { x: 0, duration: 3.6, ease: "none", repeat: -1 },
        );
        // Bubbles rise from the bottom to the surface and pop.
        bubbles.current.forEach((b, i) => {
          if (!b) return;
          const tl = gsap.timeline({
            repeat: -1,
            delay: i * 0.55,
            repeatDelay: gsap.utils.random(0.2, 1.6),
          });
          const x0 = gsap.utils.random(40, 170);
          tl.fromTo(
            b,
            {
              attr: { cx: x0, cy: H - surfaceY(level.current.v) + 20 },
              opacity: 0,
              scale: 0.6,
            },
            {
              attr: { cy: 14, cx: x0 + gsap.utils.random(-14, 14) },
              opacity: 0.9,
              scale: 1,
              duration: gsap.utils.random(1.8, 2.8),
              ease: "sine.in",
            },
          ).to(b, { opacity: 0, scale: 1.6, duration: 0.18 }, ">-0.18");
        });
      },
      { scope: root, dependencies: [still] },
    );

    // Pour in when the card scrolls into view.
    const poured = React.useRef(still);
    React.useEffect(() => {
      if (still) return;
      const el = root.current!;
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e?.isIntersecting || poured.current) return;
          poured.current = true;
          gsap.to(level.current, {
            v: start,
            duration: 1.8,
            ease: "elastic.out(1, 0.55)",
            onUpdate: paint,
            onComplete: () => setShown(start),
          });
        },
        { threshold: 0.35 },
      );
      io.observe(el);
      return () => io.disconnect();
    }, [still, start, paint]);

    // A quick pointer sloshes the liquid against the motion, then it wobbles level.
    const lastX = React.useRef<{ x: number; t: number } | null>(null);
    const slosh = contextSafe((e: React.PointerEvent) => {
      if (still || !liquid.current) return;
      const now = performance.now();
      const prev = lastX.current;
      lastX.current = { x: e.clientX, t: now };
      if (!prev) return;
      const vx = (e.clientX - prev.x) / Math.max(1, now - prev.t);
      const tilt = gsap.utils.clamp(-14, 14, -vx * 9);
      if (Math.abs(tilt) < 1.5) return;
      const origin = `${W / 2} 0`;
      gsap.to(liquid.current, {
        rotation: tilt,
        svgOrigin: origin,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(liquid.current, {
        rotation: 0,
        svgOrigin: origin,
        duration: 1.6,
        ease: "elastic.out(1, 0.3)",
        delay: 0.25,
      });
    });

    // Dragging on the icon sets the level.
    const dragging = React.useRef(false);
    const setFrom = contextSafe((clientY: number) => {
      const r = svg.current!.getBoundingClientRect();
      const v = Math.round(
        gsap.utils.clamp(0, 100, (1 - (clientY - r.top) / r.height) * 100),
      );
      gsap.to(level.current, {
        v,
        duration: 0.5,
        ease: "power3.out",
        overwrite: true,
        onUpdate: paint,
      });
      setShown(v);
      onChange?.(v);
    });
    const nudge = contextSafe((by: number) => {
      const v = gsap.utils.clamp(0, 100, Math.round(level.current.v) + by);
      gsap.to(level.current, {
        v,
        duration: still ? 0 : 0.5,
        ease: "back.out(2)",
        overwrite: true,
        onUpdate: paint,
      });
      setShown(v);
      onChange?.(v);
    });

    const msg = message ?? preset.message;
    const ink = dark ? "text-white" : "text-[#242423]";
    const muted = dark ? "text-white/55" : "text-zinc-500";

    return (
      <div
        ref={root}
        onPointerEnter={() => setHover(true)}
        onPointerMove={(e) => {
          // The glow follows the pointer.
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--gx", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--gy", `${e.clientY - r.top}px`);
          slosh(e);
        }}
        onPointerLeave={() => {
          lastX.current = null;
          setHover(false);
        }}
        className={cn(
          "relative isolate h-[340px] w-[256px] max-w-full select-none overflow-hidden rounded-[28px] p-6",
          dark
            ? "bg-[#111111] shadow-[0_2px_6px_rgba(0,0,0,0.2),0_24px_48px_-20px_rgba(0,0,0,0.55)]"
            : "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]",
          className,
        )}
      >
        {/* A faint glow of the liquid's colour rising from the bottom edge. */}
        {
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 70% at 50% 115%, ${fill}${dark ? "26" : "1a"}, transparent 70%)`,
            }}
          />
        }
        {/* A touch of cool blue light from the bottom left corner. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20"
          style={{
            background: `radial-gradient(circle at 0% 100%, #5b8def${dark ? "2e" : "1c"}, transparent 45%)`,
          }}
        />
        {/* On hover a soft glow in the liquid's colour follows the pointer. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 transition-opacity duration-500"
          style={{
            opacity: hover ? 1 : 0,
            background: `radial-gradient(260px circle at var(--gx, 70%) var(--gy, 60%), ${fill}${dark ? "1e" : "12"}, transparent 70%)`,
          }}
        />
        {/*
          On hover a thin line of the liquid's colour runs round the card's outline.
          The ring is masked to a 1px border inside the card, so nothing spills out;
          a large conic gradient spins behind the mask to make the line travel.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[28px] p-px transition-opacity duration-500"
          style={{
            opacity: hover ? 0.55 : 0,
            mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
          }}
        >
          <div
            ref={ring}
            className="absolute left-1/2 top-1/2 size-[220%] -translate-x-1/2 -translate-y-1/2"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, ${fill} 40deg, transparent 90deg, transparent 180deg, ${fill} 220deg, transparent 270deg)`,
            }}
          />
        </div>
        {/* The icon as a container, bleeding off the right edge. */}
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          style={{ translate: `${-(SHIFT[icon] ?? 0)}px 0` }}
          role={interactive ? "slider" : "img"}
          tabIndex={interactive ? 0 : undefined}
          aria-label={`${label ?? preset.label}, ${shown} percent`}
          aria-valuemin={interactive ? 0 : undefined}
          aria-valuemax={interactive ? 100 : undefined}
          aria-valuenow={interactive ? shown : undefined}
          onPointerDown={(e) => {
            if (!interactive) return;
            // Setting the level is its own drag, not a swipe of a carousel around it.
            e.stopPropagation();
            dragging.current = true;
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
            setFrom(e.clientY);
          }}
          onPointerMove={(e) => dragging.current && setFrom(e.clientY)}
          onPointerUp={() => void (dragging.current = false)}
          onPointerCancel={() => void (dragging.current = false)}
          onKeyDown={(e) => {
            if (!interactive) return;
            const by = e.key === "ArrowUp" ? 5 : e.key === "ArrowDown" ? -5 : 0;
            if (!by) return;
            e.preventDefault();
            nudge(by);
          }}
          className={cn(
            "absolute -right-[72px] top-4 -z-10 h-[315px] w-[210px] overflow-visible outline-none",
            interactive && "cursor-ns-resize touch-none",
          )}
        >
          <defs>
            <clipPath id={`lc-${uid}`}>
              <path d={ICONS[icon]} />
            </clipPath>
          </defs>
          {/*
            A blurred copy of the whole icon, liquid and all, sits behind it as a
            soft halo (gentler on the white card). It is a <use> of the live icon, so the halo rises,
            falls and waves with the liquid.
          */}
          {
            <use
              href={`#lc-icon-${uid}`}
              aria-hidden
              style={{
                // Spread a little past the icon, so the halo reaches into the card.
                transform: "scale(1.08)",
                transformOrigin: "50% 60%",
                transformBox: "fill-box",
                filter: `blur(${hover ? 34 : 30}px)`,
                opacity: dark ? (hover ? 0.9 : 0.8) : hover ? 0.55 : 0.45,
                transition: "filter 0.5s ease, opacity 0.5s ease",
              }}
            />
          }
          <g
            style={{
              filter: `drop-shadow(0 0 ${hover ? 25 : 22}px ${fill}${hover ? "70" : "66"})`,
              transition: "filter 0.5s ease",
            }}
          >
            <g id={`lc-icon-${uid}`} clipPath={`url(#lc-${uid})`}>
              <rect
                width={W}
                height={H}
                fill={dark ? "rgba(255,255,255,0.14)" : "rgba(36,36,35,0.06)"}
              />
              <g ref={liquid}>
                <path
                  ref={back}
                  d={wave(7, Math.PI * 0.7)}
                  fill={fill}
                  opacity={0.45}
                />
                <path ref={front} d={wave(9, 0)} fill={fill} />
                {Array.from({ length: 6 }, (_, i) => (
                  <circle
                    key={i}
                    ref={(el) => void (bubbles.current[i] = el)}
                    r={2 + (i % 3)}
                    cx={60 + i * 18}
                    cy={H}
                    fill="white"
                    opacity={0}
                  />
                ))}
              </g>
            </g>
          </g>
        </svg>

        <div className="pointer-events-none flex h-full flex-col">
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.12em]",
              dark ? "text-white/70" : "text-zinc-500",
            )}
          >
            {label ?? preset.label}
          </p>
          <p
            className="mt-3 flex items-start leading-none"
            style={{ color: fill }}
          >
            <span
              ref={num}
              className="text-[48px] font-semibold tracking-tight tabular-nums"
            >
              {still ? start : 0}
            </span>
            <span className="mt-1 text-2xl font-semibold">%</span>
          </p>
          <p className={cn("mt-1 text-sm", muted)}>
            {caption ?? preset.caption}
          </p>
          <div className="mt-auto max-w-[128px]">
            <p className={cn("text-base font-semibold leading-tight", ink)}>
              {msg[0]}
            </p>
            <p className={cn("text-base leading-tight", muted)}>{msg[1]}</p>
          </div>
        </div>
      </div>
    );
  },
);

export interface LiquidCarouselProps {
  /** The cards, in order. Default one of each icon. */
  cards?: LiquidCardProps[];
  /** Theme for every card. Default `"light"`. */
  theme?: "light" | "dark";
  /** Card shown, when you control it. */
  index?: number;
  /** Card shown first, when it keeps its own. Default `0`. */
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
}

const DEFAULT_CARDS: LiquidCardProps[] = [
  { icon: "bolt" },
  { icon: "cloud" },
  { icon: "shield" },
  { icon: "drop" },
];
const SLIDE = { type: "spring", stiffness: 260, damping: 32 } as const;
const CARD_W = 256;
const GAP = 16;

/**
 * A carousel of LiquidCards laid out side by side in one row. Drag or swipe
 * the row left and right (it carries on a little and eases to a stop, with a
 * soft give at the ends), or use the Left and Right keys to move one card at
 * a time. The row is not clipped, so the cards run on past its edges. Dragging inside a card's icon still sets
 * its level rather than moving the row.
 */
export const LiquidCarousel = React.forwardRef<
  HTMLDivElement,
  LiquidCarouselProps
>(function LiquidCarousel(
  {
    cards = DEFAULT_CARDS,
    theme = "light",
    index,
    defaultIndex = 0,
    onIndexChange,
    className,
  },
  ref,
) {
  const still = !!useReducedMotion();
  const n = cards.length;
  const view = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [room, setRoom] = React.useState(0); // how far the row can travel
  const [at, setAt] = React.useState(
    Math.min(n - 1, Math.max(0, index ?? defaultIndex)),
  );
  const step = CARD_W + GAP;
  const track = n * CARD_W + (n - 1) * GAP;

  // How far the row can slide depends on how wide the view is.
  React.useLayoutEffect(() => {
    const el = view.current!;
    const measure = () => setRoom(Math.max(0, track - el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [track]);

  const slideTo = (i: number) => {
    const k = Math.min(n - 1, Math.max(0, i));
    setAt(k);
    onIndexChange?.(k);
    animate(x, -Math.min(room, k * step), still ? { duration: 0 } : SLIDE);
  };
  // A controlled index slides the row to that card.
  React.useEffect(() => {
    if (index !== undefined) slideTo(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, room]);

  // Keep track of which card is leftmost as the row is dragged.
  useMotionValueEvent(x, "change", (v) => {
    const k = Math.min(n - 1, Math.max(0, Math.round(-v / step)));
    setAt((cur) => (cur === k ? cur : k));
  });

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label="Cards"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "ArrowRight") (e.preventDefault(), slideTo(at + 1));
        else if (e.key === "ArrowLeft") (e.preventDefault(), slideTo(at - 1));
      }}
      className={cn("w-full outline-none", className)}
    >
      <div ref={view} className="px-1 py-3">
        <motion.div
          className="flex w-max cursor-grab touch-pan-y active:cursor-grabbing"
          style={{ x, gap: GAP }}
          drag={still ? false : "x"}
          dragConstraints={{ left: -room, right: 0 }}
          dragElastic={0.12}
          dragTransition={{ power: 0.3, timeConstant: 260 }}
        >
          {cards.map((card, i) => (
            <div key={i} className="shrink-0" style={{ width: CARD_W }}>
              <LiquidCard theme={theme} {...card} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
});