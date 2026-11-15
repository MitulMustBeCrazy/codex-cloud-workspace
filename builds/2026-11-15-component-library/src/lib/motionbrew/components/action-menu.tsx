"use client";

/**
 * ActionMenu, from https://motion-brew.com/components/action-menu
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
import { useGSAP } from "@gsap/react";
import { type ClassValue, clsx } from "clsx";
import gsap from "gsap";
import { AnimatePresence, motion, type Transition, useAnimation, useReducedMotion, type Variants } from "motion/react";
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

// Animated icon: chevron-down
const ChevronDownIcon = (() => {
interface ChevronDownIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ChevronDownIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const DEFAULT_TRANSITION: Transition = {
  times: [0, 0.4, 1],
  duration: 0.5,
};

const ChevronDownIcon = forwardRef<ChevronDownIconHandle, ChevronDownIconProps>(
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
          <motion.path
            animate={controls}
            d="m6 9 6 6 6-6"
            transition={DEFAULT_TRANSITION}
            variants={{
              normal: { y: 0 },
              animate: { y: [0, 2, 0] },
            }}
          />
        </svg>
      </span>
    );
  }
);

ChevronDownIcon.displayName = "ChevronDownIcon";
  return ChevronDownIcon;
})();

// ActionMenu

/**
 * ActionMenu
 *
 * Trigger: press, then hover. A dropdown of actions and links. Opening springs
 * the panel out of its trigger while the items cascade in. A soft highlight
 * slides between items as you hover or arrow through them. Copy actions shrink
 * their icon away and draw a check while the label swaps to "Copied"; download
 * actions bounce their arrow while a light gray water fill washes across the
 * row, then draw the check. Link items nudge their arrow. Escape or a click outside closes it and
 * focus returns to the trigger.
 *
 * Engine: motion/react + gsap (Motion for the panel spring, sliding highlight,
 * label swaps and arrow nudges; gsap + @gsap/react for the item cascade and
 * the icon timelines).
 */

gsap.registerPlugin(useGSAP);

const GLIDE = [0.22, 1, 0.36, 1] as const;
const PANEL = { type: "spring", stiffness: 520, damping: 34, mass: 0.7 } as const;
const SWAP = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.2, ease: GLIDE },
} as const;

// Wavy leading edge for the download fill, the same water edge as ReceiptButton.
const WAVE_W = 20;
/** Two periods of a vertical sine, filled to its left, in a 20 x 96 box; scrolled by half, it loops. */
function wavePath(amplitude: number, phase: number) {
  const pts: string[] = [];
  for (let y = 0; y <= 96; y += 4) {
    const x = WAVE_W / 2 + amplitude * Math.sin((y / 48) * Math.PI * 2 + phase);
    pts.push(`${x.toFixed(2)} ${y}`);
  }
  return `M0 0 L${pts.join(" L")} L0 96 Z`;
}
const WAVE_FRONT = wavePath(6, 0);
const WAVE_BACK = wavePath(7.5, Math.PI / 1.5);

export type ActionMenuItem =
  | {
      kind: "copy" | "download";
      label: string;
      /** Label while the action confirms. Default "Copied" or "Downloaded". */
      doneLabel?: string;
      /** Text written to the clipboard for copy items. */
      copyText?: string;
      /** Runs when chosen. Download items wait for it before showing the check. */
      onSelect?: () => void | Promise<void>;
    }
  | { kind: "link"; label: string; href?: string; onSelect?: () => void }
  | { kind: "separator" };

export interface ActionMenuProps {
  /** Trigger button label. Default `"Brand assets"`. */
  label?: React.ReactNode;
  /** Menu items, top to bottom. Default a brand-asset menu. */
  items?: ActionMenuItem[];
  /** Start open. Default `false`. */
  defaultOpen?: boolean;
  /** How long a confirmed action shows its check, in ms. Default `1400`. */
  confirmFor?: number;
  className?: string;
}

const DEFAULT_ITEMS: ActionMenuItem[] = [
  { kind: "copy", label: "Copy logo SVG", copyText: "<svg><!-- logo --></svg>" },
  { kind: "copy", label: "Copy wordmark SVG", copyText: "<svg><!-- wordmark --></svg>" },
  { kind: "download", label: "Download SVGs" },
  { kind: "separator" },
  { kind: "link", label: "Usage guidelines" },
  { kind: "link", label: "Download press kit" },
];

/** Two offset rounded squares. */
function CopyIcon() {
  return (
    <g data-face="copy">
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
    </g>
  );
}

/** Cloud with a separate arrow group, so the arrow can bounce on its own. */
function DownloadIcon() {
  return (
    <g data-face="download">
      <path d="M7 17.5H6a4 4 0 0 1-.7-7.94A6 6 0 0 1 17 8.2a4.5 4.5 0 0 1 1 8.8" />
      <g data-arrow>
        <path d="M12 11v9" />
        <path d="m8.5 16.5 3.5 3.5 3.5-3.5" />
      </g>
    </g>
  );
}

function ActionRow({
  item,
  index,
  active,
  highlightId,
  confirmFor,
  onHover,
}: {
  item: Extract<ActionMenuItem, { kind: "copy" | "download" }>;
  index: number;
  active: boolean;
  highlightId: string;
  confirmFor: number;
  onHover: () => void;
}) {
  const row = React.useRef<HTMLButtonElement>(null);
  const [done, setDone] = React.useState(false);
  const busy = React.useRef(false);
  const { contextSafe } = useGSAP({ scope: row });
  // Look parts up inside this row only. A selector string can match other rows' icons.
  const $ = (sel: string) => (row.current ? Array.from(row.current.querySelectorAll(sel)) : []);

  const run = contextSafe(async () => {
    if (busy.current) return;
    busy.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline();
    if (item.kind === "download") {
      // Water fill: a light gray wash slides across the row while its wavy edge ripples.
      const ripples = [
        gsap.fromTo(
          $("[data-wave=front]"),
          { yPercent: 0 },
          { yPercent: -50, duration: 0.55, ease: "none", repeat: -1 },
        ),
        gsap.fromTo($("[data-wave=back]"), { yPercent: -50 }, { yPercent: 0, duration: 0.85, ease: "none", repeat: -1 }),
      ];
      tl.to($("[data-arrow]"), { y: 3, duration: 0.18, ease: "power2.in", yoyo: true, repeat: 3 }).fromTo(
        $("[data-progress]"),
        { xPercent: -100, x: -WAVE_W, opacity: 1 },
        {
          xPercent: 0,
          x: 0,
          duration: 0.9,
          ease: "power2.inOut",
          onComplete: () => ripples.forEach((r) => r.kill()),
        },
        0,
      );
    }
    try {
      if (item.kind === "copy" && item.copyText) await navigator.clipboard?.writeText(item.copyText);
      await item.onSelect?.();
    } catch {
      /* the action failed or the clipboard is blocked; still finish the animation */
    }
    // Swap the icon for a check that draws itself.
    tl.to($("[data-face]"), { scale: 0.5, opacity: 0, duration: 0.15, ease: "power2.in", transformOrigin: "50% 50%" })
      .set($("[data-check]"), { opacity: 1 })
      .fromTo($("[data-check]"), { strokeDashoffset: 24 }, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" })
      .to($("[data-progress]"), { opacity: 0, duration: 0.35, ease: "power2.out" }, "<")
      .add(() => setDone(true), "<");
    if (reduce) tl.progress(1);
    await tl.then();
    window.setTimeout(
      contextSafe(() => {
        setDone(false);
        gsap
          .timeline({ onComplete: () => void (busy.current = false) })
          .to($("[data-check]"), { opacity: 0, duration: 0.15 })
          .fromTo(
            $("[data-face]"),
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)", transformOrigin: "50% 50%" },
          )
          .set($("[data-progress]"), { xPercent: -100, x: -WAVE_W });
      }),
      confirmFor,
    );
  });

  const doneLabel = item.doneLabel ?? (item.kind === "copy" ? "Copied" : "Downloaded");

  return (
    <button
      ref={row}
      type="button"
      role="menuitem"
      data-item={index}
      tabIndex={active ? 0 : -1}
      onPointerEnter={onHover}
      onFocus={onHover}
      onClick={run}
      className="relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm outline-none"
    >
      {active && (
        <motion.span
          layoutId={highlightId}
          transition={{ duration: 0.25, ease: GLIDE }}
          className="absolute inset-0 rounded-xl bg-[#242423]/6 dark:bg-white/8"
        />
      )}
      {item.kind === "download" && (
        // Same rounded shape as the hover highlight; starts parked off the left edge. Solid grays,
        // not translucent ones, so the fill and its two wave layers never double up where they overlap.
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
          <span
            data-progress
            className="absolute inset-0 bg-[#e6e6e5] text-[#e6e6e5] dark:bg-zinc-700 dark:text-zinc-700"
            style={{ transform: `translateX(calc(-100% - ${WAVE_W}px))` }}
          >
            <span className="absolute left-full top-0 h-full overflow-hidden" style={{ width: WAVE_W }}>
              <svg
                data-wave="back"
                viewBox={`0 0 ${WAVE_W} 96`}
                preserveAspectRatio="none"
                className="absolute left-0 top-0 h-[200%] w-full text-[#ececeb] dark:text-zinc-800"
              >
                <path d={WAVE_BACK} fill="currentColor" />
              </svg>
              <svg
                data-wave="front"
                viewBox={`0 0 ${WAVE_W} 96`}
                preserveAspectRatio="none"
                className="absolute left-0 top-0 h-[200%] w-full"
              >
                <path d={WAVE_FRONT} fill="currentColor" />
              </svg>
            </span>
          </span>
        </span>
      )}
      <svg
        viewBox="0 0 24 24"
        className={cn(
          "relative size-[18px] shrink-0 fill-none stroke-current transition-colors",
          active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400",
        )}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {item.kind === "copy" ? <CopyIcon /> : <DownloadIcon />}
        <path data-check d="M20 6 9 17l-5-5" strokeWidth={2.25} strokeDasharray={24} opacity={0} />
      </svg>
      <span
        className={cn(
          "relative grid flex-1 font-medium transition-colors",
          active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-300",
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={done ? "done" : "idle"} {...SWAP} className="col-start-1 row-start-1">
            {done ? doneLabel : item.label}
          </motion.span>
        </AnimatePresence>
      </span>
      <span aria-live="polite" className="sr-only">
        {done ? doneLabel : ""}
      </span>
    </button>
  );
}

function LinkRow({
  item,
  index,
  active,
  highlightId,
  onHover,
  onPick,
}: {
  item: Extract<ActionMenuItem, { kind: "link" }>;
  index: number;
  active: boolean;
  highlightId: string;
  onHover: () => void;
  onPick: () => void;
}) {
  const Tag = item.href ? motion.a : motion.button;
  return (
    <Tag
      {...(item.href ? { href: item.href } : { type: "button" as const })}
      role="menuitem"
      data-item={index}
      tabIndex={active ? 0 : -1}
      onPointerEnter={onHover}
      onFocus={onHover}
      onClick={() => {
        item.onSelect?.();
        onPick();
      }}
      initial="rest"
      animate={active ? "hover" : "rest"}
      className={cn(
        "relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium outline-none transition-colors",
        active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400",
      )}
    >
      {active && (
        <motion.span
          layoutId={highlightId}
          transition={{ duration: 0.25, ease: GLIDE }}
          className="absolute inset-0 rounded-xl bg-[#242423]/6 dark:bg-white/8"
        />
      )}
      <span className="relative">{item.label}</span>
      <motion.span
        variants={{ rest: { x: 0, y: 0, opacity: 0.5 }, hover: { x: 2, y: -2, opacity: 1 } }}
        transition={{ duration: 0.25, ease: GLIDE }}
        className="relative flex"
      >
        <ArrowUpRightIcon className="size-4" strokeWidth={2} />
      </motion.span>
    </Tag>
  );
}

export const ActionMenu = React.forwardRef<HTMLDivElement, ActionMenuProps>(function ActionMenu(
  { label = "Brand assets", items = DEFAULT_ITEMS, defaultOpen = false, confirmFor = 1400, className },
  forwardedRef,
) {
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(defaultOpen);
  const [active, setActive] = React.useState<number | null>(null);
  const uid = React.useId();
  const highlightId = `${uid}-highlight`;
  const menuId = `${uid}-menu`;
  const selectable = items.flatMap((it, i) => (it.kind === "separator" ? [] : [i]));

  // Items cascade in each time the panel opens.
  useGSAP(
    () => {
      if (!open) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rows = panelRef.current?.querySelectorAll("[data-row]");
      if (!rows?.length) return;
      gsap.fromTo(
        rows,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.32, ease: "power2.out", stagger: 0.035, delay: 0.04 },
      );
    },
    { scope: panelRef, dependencies: [open] },
  );

  // Close on a click outside.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Move focus with the highlight so keyboard users and screen readers follow it.
  React.useEffect(() => {
    if (!open || active === null) return;
    const el = panelRef.current?.querySelector<HTMLElement>(`[data-item="${active}"]`);
    if (el && document.activeElement !== el && panelRef.current?.contains(document.activeElement)) el.focus();
  }, [active, open]);

  const close = (refocus = true) => {
    setOpen(false);
    setActive(null);
    if (refocus) triggerRef.current?.focus();
  };

  const move = (dir: 1 | -1 | "first" | "last") => {
    const at = active === null ? -1 : selectable.indexOf(active);
    const next =
      dir === "first" ? 0 : dir === "last" ? selectable.length - 1 : (at + dir + selectable.length) % selectable.length;
    const target = selectable[next]!;
    setActive(target);
    panelRef.current?.querySelector<HTMLElement>(`[data-item="${target}"]`)?.focus();
  };

  return (
    <div ref={root} className={cn("relative inline-flex flex-col items-start", className)}>
      <motion.button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => move(e.key === "ArrowDown" ? "first" : "last"));
          }
        }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#242423]/6 px-4 py-2 text-sm font-medium text-[#242423] transition-colors hover:bg-[#242423]/10 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/8 dark:text-zinc-100 dark:hover:bg-white/12"
      >
        {label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: GLIDE }} className="flex">
          <ChevronDownIcon className="size-4" strokeWidth={2.25} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-label={typeof label === "string" ? label : "Menu"}
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.15, ease: GLIDE } }}
            transition={PANEL}
            style={{ transformOrigin: "top left" }}
            onPointerLeave={() => setActive(null)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") (e.preventDefault(), move(1));
              if (e.key === "ArrowUp") (e.preventDefault(), move(-1));
              if (e.key === "Home") (e.preventDefault(), move("first"));
              if (e.key === "End") (e.preventDefault(), move("last"));
              if (e.key === "Escape") (e.preventDefault(), close());
              if (e.key === "Tab") close(false);
            }}
            className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl bg-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_40px_-12px_rgba(0,0,0,0.22)] ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10"
          >
            {items.map((item, i) =>
              item.kind === "separator" ? (
                <div
                  key={`sep-${i}`}
                  data-row
                  role="separator"
                  className="mx-3 my-1.5 h-px bg-zinc-100 dark:bg-zinc-800"
                />
              ) : (
                <div key={item.label} data-row>
                  {item.kind === "link" ? (
                    <LinkRow
                      item={item}
                      index={i}
                      active={active === i}
                      highlightId={highlightId}
                      onHover={() => setActive(i)}
                      onPick={() => close()}
                    />
                  ) : (
                    <ActionRow
                      item={item}
                      index={i}
                      active={active === i}
                      highlightId={highlightId}
                      confirmFor={confirmFor}
                      onHover={() => setActive(i)}
                    />
                  )}
                </div>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});