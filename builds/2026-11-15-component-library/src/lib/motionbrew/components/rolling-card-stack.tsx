"use client";

/**
 * RollingCardStack, from https://motion-brew.com/components/rolling-card-stack
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { Clock3, type LucideIcon, Target, TrendingDown, TrendingUp, Users } from "lucide-react";
import { animate, motion, type PanInfo, type TargetAndTransition, type Transition, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// RollingCardStack

/**
 * RollingCardStack
 *
 * Trigger: drag (plus wheel, keys and a timeline). A deck of metric cards that
 * rolls forward like a rolodex. The cards behind peek out above the front one,
 * smaller and softer. On each advance the front card tips forward and rolls
 * down out of view with a touch of blur, the next card glides into place, and
 * the rolled card fades into the back of the stack. The new front card counts
 * its number up and fills its segmented bar. It advances on its own, pausing
 * while hovered or focused; drag it up or down, scroll or use the arrow keys
 * to roll it yourself. Changes are announced politely.
 * Reduced motion swaps cards with a fade.
 *
 * Engine: motion/react (keyframed roll, depth springs, drag with elastic snap,
 * counting numbers and staggered bar fills).
 */

export interface StackCard {
  title: string;
  value: number;
  /** Text before the number, like `"$"`. */
  prefix?: string;
  /** Text after the number, like `"%"`. */
  suffix?: string;
  /** Decimal places. Default `0`. */
  decimals?: number;
  /** Change label, like `"+12.4%"`. A leading minus shows it as a drop. */
  delta?: string;
  /** Bar fill, 0 to 1. */
  progress: number;
  /** Caption after the bar. Default `"<n>% of target"`. */
  caption?: string;
  /** Accent color for the bar and dot. */
  color: string;
  icon?: LucideIcon;
}

export interface RollingCardStackProps {
  /** Cards in order. Default five product metrics. */
  cards?: StackCard[];
  /** Milliseconds between automatic rolls. `0` turns autoplay off. Default `3600`. */
  interval?: number;
  /** How many cards peek out behind the front one. Default `2`. */
  peek?: number;
  /** Pills in each card's bar. Default `10`. */
  pills?: number;
  /** Called with the new front card's index. */
  onChange?: (index: number) => void;
  /** Accessible name. Default `"Metrics"`. */
  label?: string;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const FILL = [0.5, 1, 0.89, 1] as const;
const DEPTH_SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;
/** Card height, and how far each card behind sits up and shrinks. Cards scale from their bottom edge, so the lift has to beat the shrink for them to peek out. */
const CARD_H = 196;
const LIFT = 22;
const SHRINK = 0.05;
const PEEK_PX = LIFT - SHRINK * CARD_H;

const DEFAULT_CARDS: StackCard[] = [
  {
    title: "Monthly revenue",
    value: 48290,
    prefix: "$",
    delta: "+12.4%",
    progress: 0.72,
    color: "#3d66d6",
    icon: TrendingUp,
  },
  {
    title: "Active users",
    value: 12840,
    delta: "+8.1%",
    progress: 0.64,
    color: "#269a5a",
    icon: Users,
  },
  {
    title: "Conversion",
    value: 3.8,
    suffix: "%",
    decimals: 1,
    delta: "+0.6 pts",
    progress: 0.38,
    color: "#d6498f",
    icon: Target,
  },
  {
    title: "Avg. session",
    value: 6.7,
    suffix: " min",
    decimals: 1,
    delta: "+42s",
    progress: 0.55,
    color: "#9150e0",
    icon: Clock3,
  },
  {
    title: "Churn",
    value: 1.9,
    suffix: "%",
    decimals: 1,
    delta: "-0.3 pts",
    progress: 0.19,
    color: "#cf7a1c",
    caption: "Below the 2.5% limit",
    icon: TrendingDown,
  },
];

/** Counts up to `value` whenever the card becomes the front one. */
function CountUp({
  card,
  active,
  still,
}: {
  card: StackCard;
  active: boolean;
  still: boolean;
}) {
  const mv = useMotionValue(active || still ? card.value : 0);
  const fmt = React.useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: card.decimals ?? 0,
        maximumFractionDigits: card.decimals ?? 0,
      }),
    [card.decimals],
  );
  const text = useTransform(
    mv,
    (v) => `${card.prefix ?? ""}${fmt.format(v)}${card.suffix ?? ""}`,
  );
  React.useEffect(() => {
    if (still) return void mv.set(card.value);
    if (!active) return;
    mv.set(0);
    const c = animate(mv, card.value, {
      duration: 1.1,
      ease: FILL,
      delay: 0.15,
    });
    return () => c.stop();
  }, [active, card.value, still, mv]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

function Card({
  card,
  active,
  pills,
  still,
}: {
  card: StackCard;
  active: boolean;
  pills: number;
  still: boolean;
}) {
  const Icon = card.icon ?? TrendingUp;
  const lit = Math.round(Math.max(0, Math.min(1, card.progress)) * pills);
  const drop = card.delta?.trim().startsWith("-") ?? false;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[12px] text-zinc-500 dark:text-zinc-400">
          {card.title}
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#242423]/6 text-[#242423] dark:bg-white/8 dark:text-zinc-100">
          <Icon className="size-4" strokeWidth={2.25} />
        </span>
      </div>
      <div className="-mt-2 flex items-baseline gap-2">
        <span className="text-[32px] font-medium leading-none tracking-tight text-zinc-900 dark:text-zinc-100">
          <CountUp card={card} active={active} still={still} />
        </span>
        {card.delta && (
          <span
            className={cn(
              "text-[12px] font-medium",
              drop ? "text-[#cf7a1c]" : "text-[#269a5a]",
            )}
          >
            {card.delta.replace(/^-/, "−")}
          </span>
        )}
      </div>
      <div className="mt-auto flex gap-1" aria-hidden>
        {Array.from({ length: pills }, (_, i) => (
          <span
            key={i}
            className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800/60"
          >
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: card.color }}
              initial={false}
              animate={{ x: i < lit && (active || still) ? "0%" : "-101%" }}
              transition={{
                duration: still ? 0 : 0.45,
                ease: FILL,
                delay: active && !still ? 0.25 + i * 0.045 : 0,
              }}
            />
          </span>
        ))}
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-zinc-500 dark:text-zinc-400">
        <span
          className="size-2 rounded-full"
          style={{ background: card.color }}
        />
        {card.caption ?? `${Math.round(card.progress * 100)}% of target`}
      </p>
    </div>
  );
}

export const RollingCardStack = React.forwardRef<
  HTMLDivElement,
  RollingCardStackProps
>(function RollingCardStack(
  {
    cards = DEFAULT_CARDS,
    interval = 3600,
    peek = 2,
    pills = 10,
    onChange,
    label = "Metrics",
    className,
  },
  ref,
) {
  const still = !!useReducedMotion();
  const n = cards.length;
  const [active, setActive] = React.useState(0);
  // +1 when the last move rolled forward, -1 when it rolled back; decides which way the leaving card goes.
  const [dir, setDir] = React.useState(1);
  const [paused, setPaused] = React.useState(false);
  const wheelLock = React.useRef(0);

  const go = React.useCallback(
    (step: number) => {
      if (n < 2) return;
      setDir(step > 0 ? 1 : -1);
      setActive((a) => {
        const next = (a + step + n) % n;
        onChange?.(next);
        return next;
      });
    },
    [n, onChange],
  );

  React.useEffect(() => {
    if (!interval || paused || n < 2) return;
    const id = window.setInterval(() => go(1), interval);
    return () => window.clearInterval(id);
  }, [interval, paused, go, n]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 60 || info.velocity.y > 500) go(1);
    else if (info.offset.y < -60 || info.velocity.y < -500) go(-1);
  };

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight")
          (e.preventDefault(), go(1));
        if (e.key === "ArrowUp" || e.key === "ArrowLeft")
          (e.preventDefault(), go(-1));
      }}
      onWheel={(e) => {
        const now = performance.now();
        if (Math.abs(e.deltaY) < 12 || now - wheelLock.current < 450) return;
        wheelLock.current = now;
        go(e.deltaY > 0 ? 1 : -1);
      }}
      className={cn(
        "w-[360px] max-w-full rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4",
        className,
      )}
    >
      <span className="sr-only" aria-live="polite">
        {`${cards[active]?.title}: ${cards[active]?.prefix ?? ""}${cards[active]?.value}${cards[active]?.suffix ?? ""}, ${active + 1} of ${n}`}
      </span>

      {/* The stack: room above the front card for the ones peeking out behind it. */}
      <div
        className="relative"
        style={{
          perspective: 900,
          height: CARD_H,
          marginTop: Math.min(peek, cards.length - 1) * PEEK_PX,
        }}
      >
        {cards.map((card, i) => {
          const depth = (i - active + n) % n;
          const front = depth === 0;
          const behind = Math.min(depth, peek + 1);
          // The card that just left the front: it rolls forward and down, then settles at the back.
          const leaving = dir > 0 && depth === n - 1 && n > 1;
          const arriving = dir < 0 && depth === 0 && n > 1;
          const rest = {
            y: -behind * LIFT,
            scale: 1 - behind * SHRINK,
            opacity: depth > peek ? 0 : 1 - behind * 0.18,
            rotateX: 0,
            filter: "blur(0px)",
            zIndex: n - depth,
          };
          let animateTo: TargetAndTransition = rest;
          let transition: Transition = still ? { duration: 0.2 } : DEPTH_SPRING;
          if (!still && leaving) {
            animateTo = {
              y: [0, 70, -behind * LIFT],
              rotateX: [0, -62, 0],
              scale: [1, 0.96, rest.scale],
              opacity: [1, 0, 0],
              filter: ["blur(0px)", "blur(6px)", "blur(0px)"],
              zIndex: [n + 1, n + 1, rest.zIndex],
            };
            transition = {
              duration: 0.75,
              times: [0, 0.5, 1],
              ease: [[0.55, 0, 0.8, 0.4], "linear"],
            };
          } else if (!still && arriving) {
            animateTo = {
              y: [70, 70, 0],
              rotateX: [-62, -62, 0],
              scale: [0.96, 0.96, 1],
              opacity: [0, 0, 1],
              filter: ["blur(6px)", "blur(6px)", "blur(0px)"],
              zIndex: [n + 1, n + 1, n],
            };
            transition = {
              duration: 0.7,
              times: [0, 0.05, 1],
              ease: ["linear", GLIDE],
            };
          }
          return (
            <motion.div
              key={`${i}-${card.title}`}
              aria-hidden={!front}
              drag={front && !still ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.35}
              onDragEnd={front ? onDragEnd : undefined}
              initial={false}
              animate={animateTo}
              transition={transition}
              whileDrag={{ scale: 0.985, cursor: "grabbing" }}
              style={{ height: CARD_H }}
              className={cn(
                "absolute inset-x-0 top-0 origin-bottom rounded-3xl bg-white px-5 pb-5 pt-5 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
                front && !still && "cursor-grab touch-none",
                !front && "pointer-events-none",
              )}
            >
              {/* Cards behind show as clean white edges; their content fades in as they reach the front. */}
              <motion.div
                className="h-full"
                initial={false}
                animate={{ opacity: front || leaving ? 1 : 0 }}
                transition={{
                  duration: still ? 0 : 0.35,
                  ease: GLIDE,
                  delay: front && !still ? 0.1 : 0,
                }}
              >
                <Card card={card} active={front} pills={pills} still={still} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});