"use client";

/**
 * PillTabs, from https://motion-brew.com/components/pill-tabs
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, useVelocity } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// PillTabs

/**
 * PillTabs
 *
 * Trigger: press. Tabs on a tinted track with a white pill that slides to the
 * active tab like a rubber band. The leading edge darts ahead; the trailing edge
 * holds back, then follows on a looser spring, so the pill stretches long and
 * thins, then settles with just a hint of give. A horizontal motion blur, scaled by its speed, smears it
 * mid-travel and clears at rest. The rounded ends never distort: the pill is two
 * caps and a flat middle that scales. Arrow keys, Home and End move between
 * tabs. Reduced motion jumps the pill with no stretch or blur.
 *
 * Engine: motion/react (two spring-driven edge motion values, transform-only
 * pill parts, useVelocity feeding an SVG horizontal blur).
 */

export interface PillTab {
  id: string;
  label: string;
  /** Small count shown after the label. */
  badge?: number;
}

export interface PillTabsProps {
  /** Tabs, left to right. Default inbox, mentions, saved. */
  tabs?: PillTab[];
  /** Active tab id when uncontrolled. Default the first. */
  defaultValue?: string;
  /** Active tab id when controlled. */
  value?: string;
  /** Called with the new tab id. */
  onValueChange?: (id: string) => void;
  /** How rubbery the slide is, 0 (rigid) to 1 (very stretchy). Default `0.45`. */
  stretch?: number;
  /** Strongest horizontal blur mid-flight, in px. `0` turns it off. Default `7.5`. */
  blur?: number;
  /** Accessible name for the tab list. Default `"Sections"`. */
  label?: string;
  className?: string;
}

const DEFAULT_TABS: PillTab[] = [
  { id: "inbox", label: "Inbox" },
  { id: "mentions", label: "Mentions", badge: 5 },
  { id: "saved", label: "Saved" },
];

export const PillTabs = React.forwardRef<HTMLDivElement, PillTabsProps>(function PillTabs(
  {
    tabs = DEFAULT_TABS,
    defaultValue,
    value: valueProp,
    onValueChange,
    stretch = 0.45,
    blur = 7.5,
    label = "Sections",
    className,
  },
  forwardedRef,
) {
  const reduceMotion = !!useReducedMotion();
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `pill-blur-${uid}`;
  const track = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => track.current as HTMLDivElement);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const blurNode = React.useRef<SVGFEGaussianBlurElement>(null);

  const [inner, setInner] = React.useState(defaultValue ?? tabs[0]?.id ?? "");
  const value = valueProp ?? inner;
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.id === value),
  );
  const placed = React.useRef(false);
  const fromWidth = React.useRef(0);
  const toWidth = React.useRef(0);
  const [height, setHeight] = React.useState(0);

  // The pill is drawn between these two edges, in px from the track's left.
  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const capX = useTransform(right, (r) => r - height);
  const midX = useTransform(left, (l) => l + height / 2);
  const midScale = useTransform([left, right], ([l, r]) => Math.max(0, (r as number) - (l as number) - height));

  // Rubber thins as it stretches: squash the pill's height by how far it outgrows both end sizes.
  const thin = useTransform([left, right], ([l, r]) => {
    if (reduceMotion) return 1;
    const w = (r as number) - (l as number);
    const rest = Math.max(fromWidth.current, toWidth.current, 1);
    const over = Math.max(0, w - rest) / rest;
    return 1 - Math.min(0.18, over * 0.35);
  });

  // Motion blur from the pill's speed, horizontal only.
  const center = useTransform([left, right], ([l, r]) => ((l as number) + (r as number)) / 2);
  const speed = useVelocity(center);
  useMotionValueEvent(speed, "change", (v) => {
    const sd = blur > 0 && !reduceMotion ? Math.min(blur, Math.abs(v) / 420) : 0;
    blurNode.current?.setAttribute("stdDeviation", `${sd.toFixed(2)} 0`);
  });

  const select = (id: string) => {
    if (valueProp === undefined) setInner(id);
    onValueChange?.(id);
  };

  // Move the pill to the active tab. The first placement (and resizes) jump without motion.
  const moveTo = React.useCallback(
    (instant: boolean) => {
      const tab = tabRefs.current[index];
      if (!tab) return;
      const l = tab.offsetLeft;
      const r = l + tab.offsetWidth;
      setHeight(tab.offsetHeight);
      if (instant || reduceMotion) {
        left.set(l);
        right.set(r);
        return;
      }
      const goingRight = l > left.get();
      // Rubber band: the leading edge darts ahead; the trailing edge holds back, then follows on a
      // looser spring, so the pill stretches. Both springs sit just under critical damping, so it
      // settles with only a hint of give instead of bouncing.
      const amount = Math.min(1, Math.max(0, stretch));
      fromWidth.current = right.get() - left.get();
      toWidth.current = r - l;
      const mass = 0.8;
      const critical = (k: number) => 2 * Math.sqrt(k * mass);
      const leadStiffness = 640;
      const trailStiffness = 700 - 540 * amount;
      const lead = { type: "spring" as const, stiffness: leadStiffness, damping: critical(leadStiffness) * 0.95, mass };
      const trail = {
        type: "spring" as const,
        stiffness: trailStiffness,
        damping: critical(trailStiffness) * 0.9,
        mass,
        delay: 0.13 * amount,
      };
      animate(left, l, goingRight ? trail : lead);
      animate(right, r, goingRight ? lead : trail);
    },
    [index, left, right, reduceMotion, stretch],
  );

  React.useLayoutEffect(() => {
    moveTo(!placed.current);
    placed.current = true;
  }, [moveTo]);

  React.useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => moveTo(true));
    ro.observe(el);
    return () => ro.disconnect();
  }, [moveTo]);

  const focusTab = (i: number) => {
    const t = tabs[(i + tabs.length) % tabs.length]!;
    select(t.id);
    tabRefs.current[(i + tabs.length) % tabs.length]?.focus();
  };

  return (
    <div
      ref={track}
      role="tablist"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") (e.preventDefault(), focusTab(index + 1));
        if (e.key === "ArrowLeft") (e.preventDefault(), focusTab(index - 1));
        if (e.key === "Home") (e.preventDefault(), focusTab(0));
        if (e.key === "End") (e.preventDefault(), focusTab(tabs.length - 1));
      }}
      className={cn(
        "relative inline-flex items-center gap-1 rounded-full bg-[#242423]/6 p-1.5 dark:bg-white/8",
        className,
      )}
    >
      <svg aria-hidden className="absolute size-0">
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur ref={blurNode} stdDeviation="0 0" />
        </filter>
      </svg>

      {/* The pill: two round caps and a flat middle, so stretching never squashes the ends; it thins as it stretches. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-y-1.5 left-0 w-full"
        style={{
          filter: `url(#${filterId}) drop-shadow(0 1px 2px rgba(0,0,0,0.08)) drop-shadow(0 4px 10px rgba(0,0,0,0.06))`,
          scaleY: thin,
        }}
      >
        <motion.span
          className="absolute left-0 top-0 rounded-full bg-white dark:bg-zinc-700"
          style={{ x: left, width: height, height }}
        />
        <motion.span
          className="absolute left-0 top-0 w-px origin-left bg-white dark:bg-zinc-700"
          style={{ x: midX, scaleX: midScale, height }}
        />
        <motion.span
          className="absolute left-0 top-0 rounded-full bg-white dark:bg-zinc-700"
          style={{ x: capX, width: height, height }}
        />
      </motion.span>

      {tabs.map((tab, i) => {
        const active = i === index;
        return (
          <motion.button
            key={tab.id}
            ref={(el) => void (tabRefs.current[i] = el)}
            type="button"
            role="tab"
            id={`${uid}-tab-${tab.id}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => select(tab.id)}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "relative z-10 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-5 text-[14px] font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-zinc-400",
              active
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <motion.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.15 }}
                aria-label={`${tab.badge} new`}
                className="grid h-5 min-w-5 place-items-center rounded-full bg-[#242423] px-1.5 text-[12px] font-semibold tabular-nums text-white dark:bg-white dark:text-zinc-900"
              >
                {tab.badge}
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
});