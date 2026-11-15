"use client";

/**
 * TeamMorph, from https://motion-brew.com/components/team-morph
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
import { AnimatePresence, LayoutGroup, motion, type Transition, useAnimation, useReducedMotion, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: chevron-right
const ChevronRightIcon = (() => {
interface ChevronRightIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ChevronRightIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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

const ChevronRightIcon = forwardRef<
  ChevronRightIconHandle,
  ChevronRightIconProps
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
          d="m9 18 6-6-6-6"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { x: 0 },
            animate: { x: [0, 2, 0] },
          }}
        />
      </svg>
    </span>
  );
});

ChevronRightIcon.displayName = "ChevronRightIcon";
  return ChevronRightIcon;
})();

// Animated icon: user-plus
const UserPlusIcon = (() => {
interface UserPlusIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface UserPlusIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PLUS_VARIANTS: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  animate: {
    scale: [0, 1.15, 1],
    rotate: [-90, 0, 0],
    opacity: [0, 1, 1],
    transition: {
      delay: 0.25,
      duration: 0.45,
      ease: "easeOut",
      times: [0, 0.7, 1],
    },
  },
};

const UserPlusIcon = forwardRef<UserPlusIconHandle, UserPlusIconProps>(
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
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <motion.g
            animate={controls}
            initial="normal"
            style={{ transformOrigin: "19px 11px" }}
            variants={PLUS_VARIANTS}
          >
            <line x1="19" x2="19" y1="8" y2="14" />
            <line x1="22" x2="16" y1="11" y2="11" />
          </motion.g>
        </svg>
      </span>
    );
  }
);

UserPlusIcon.displayName = "UserPlusIcon";
  return UserPlusIcon;
})();

// Animated icon: x
const XIcon = (() => {
interface XIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface XIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
  },
};

const XIcon = forwardRef<XIconHandle, XIconProps>(
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
            d="M18 6 6 18"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="m6 6 12 12"
            transition={{ delay: 0.2 }}
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

XIcon.displayName = "XIcon";
  return XIcon;
})();

// TeamMorph

/**
 * TeamMorph
 *
 * Trigger: press, then hover. A presence pill that morphs into a team card. At
 * rest it shows an overlapping stack of avatars, a "+n" chip and who is online;
 * hovering lifts the pill, ripples the stack and sends the chevron through its circle. Pressing morphs the pill itself into a card: the
 * shell flows from pill to rounded card while every avatar flies from its spot
 * in the stack to its row in a calm two-group list (Online, Away), then names
 * and roles cascade in. Close, Escape or a click outside morphs it back. Focus moves to
 * the close button on open and returns to the pill on close.
 *
 * Engine: motion/react (one shell that stays mounted and resizes with a
 * layout animation while its contents swap, shared layoutId avatars scoped by
 * LayoutGroup, and staggered variants for the rows).
 */

const GLIDE = [0.22, 1, 0.36, 1] as const;
const MORPH = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.9,
} as const;
// Card contents vanish at once on close, so nothing is left behind while the shell morphs back.
const LEAVE = { opacity: 0, transition: { duration: 0.08 } } as const;

export interface TeamMember {
  name: string;
  role: string;
  /** Avatar color. Defaults through a soft built-in palette. */
  color?: string;
  /** Minutes since last seen; leave out when online. */
  awayFor?: number;
}

export interface TeamMorphProps {
  /** Team name. Default `"Design team"`. */
  team?: string;
  /** People, first ones are shown in the collapsed stack. Default five teammates. */
  members?: TeamMember[];
  /** Avatars shown in the collapsed stack. Default `3`. */
  stack?: number;
  /** Start expanded. Default `false`. */
  defaultOpen?: boolean;
  /** Called by the Invite button. Leave out to hide it. */
  onInvite?: () => void;
  className?: string;
}

const PALETTE = [
  "#2a9fbf",
  "#3d66d6",
  "#d6498f",
  "#9150e0",
  "#269a5a",
  "#cf7a1c",
  "#5b6472",
  "#c0435e",
];

const DEFAULT_MEMBERS: TeamMember[] = [
  { name: "Alex Rivera", role: "Design lead" },
  { name: "Elaine Park", role: "Product designer" },
  { name: "Breno Costa", role: "Motion designer", awayFor: 12 },
  { name: "Taitina Ellis", role: "Researcher" },
  { name: "Raman Gill", role: "Design engineer", awayFor: 40 },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Initials on a soft tinted disc, ringed in the card color so stacked avatars read apart. */
function Avatar({
  member,
  color,
  size,
  layoutId,
  className,
}: {
  member: TeamMember;
  color: string;
  size: number;
  layoutId?: string;
  className?: string;
}) {
  return (
    <motion.span
      layoutId={layoutId}
      transition={MORPH}
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: color,
        fontSize: Math.round((size * 0.34) / 2) * 2,
      }}
      className={cn(
        "relative grid shrink-0 place-items-center font-semibold tracking-tight text-white ring-[2.5px] ring-white dark:ring-zinc-900",
        className,
      )}
    >
      <motion.span layout="position" transition={MORPH}>
        {initials(member.name)}
      </motion.span>
    </motion.span>
  );
}

export const TeamMorph = React.forwardRef<HTMLDivElement, TeamMorphProps>(
  function TeamMorph(
    {
      team = "Design team",
      members = DEFAULT_MEMBERS,
      stack = 3,
      defaultOpen = false,
      onInvite,
      className,
    },
    forwardedRef,
  ) {
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(
      forwardedRef,
      () => root.current as HTMLDivElement,
    );
    const pillRef = React.useRef<HTMLButtonElement>(null);
    const closeRef = React.useRef<HTMLButtonElement>(null);
    const reduceMotion = useReducedMotion();
    const uid = React.useId();
    const [open, setOpen] = React.useState(defaultOpen);
    const [hover, setHover] = React.useState(false);
    const wasOpen = React.useRef(defaultOpen);

    const people = members.map((m, i) => ({
      ...m,
      color: m.color ?? PALETTE[i % PALETTE.length]!,
    }));
    const online = people.filter((m) => m.awayFor === undefined).length;
    const extra = Math.max(0, people.length - stack);
    const t = reduceMotion ? { duration: 0 } : MORPH;

    // Hand focus across the morph, and close on Escape or a click outside.
    React.useEffect(() => {
      if (open) closeRef.current?.focus({ preventScroll: true });
      else if (wasOpen.current) pillRef.current?.focus({ preventScroll: true });
      wasOpen.current = open;
      if (!open) return;
      const onDown = (e: PointerEvent) => {
        if (!root.current?.contains(e.target as Node)) setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      document.addEventListener("pointerdown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("pointerdown", onDown);
        document.removeEventListener("keydown", onKey);
      };
    }, [open]);

    return (
      <div ref={root} className={cn("relative inline-flex", className)}>
        <LayoutGroup id={uid}>
          {/* One shell stays mounted and resizes between pill and card, so nothing is swapped or
              crossfaded on the way back; only its contents change, and the avatars fly between them. */}
          <motion.div
            layout
            transition={t}
            style={{ borderRadius: 28 }}
            animate={{
              y: !open && hover ? -1 : 0,
              boxShadow: open
                ? "0 1px 2px rgba(0,0,0,0.05), 0 16px 40px -16px rgba(0,0,0,0.25)"
                : hover
                  ? "0 2px 4px rgba(0,0,0,0.06), 0 16px 34px -14px rgba(0,0,0,0.32)"
                  : "0 1px 2px rgba(0,0,0,0.05), 0 10px 28px -14px rgba(0,0,0,0.25)",
            }}
            className="relative overflow-hidden bg-white dark:bg-zinc-900"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {!open ? (
                <motion.button
                  key="pill"
                  ref={pillRef}
                  type="button"
                  layout="position"
                  transition={t}
                  exit={LEAVE}
                  aria-expanded={false}
                  aria-label={`${team}: ${online} of ${people.length} online. Show everyone.`}
                  onClick={() => setOpen(true)}
                  onPointerEnter={() => setHover(true)}
                  onPointerLeave={() => setHover(false)}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  style={{ borderRadius: 28 }}
                  className="flex cursor-pointer items-center gap-3 p-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400"
                >
                  <span className="flex items-center">
                    {people.slice(0, stack).map((m, i) => (
                      <motion.span
                        key={m.name}
                        animate={{ y: hover ? -3 : 0 }}
                        // A gentle lift wave: each avatar rises a beat after the one before, then settles.
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 18,
                          delay: hover ? i * 0.04 : 0,
                        }}
                        className={cn("relative", i > 0 && "-ml-2")}
                        style={{ zIndex: stack - i }}
                      >
                        <Avatar
                          member={m}
                          color={m.color}
                          size={38}
                          layoutId={`avatar-${m.name}`}
                        />
                      </motion.span>
                    ))}
                    {extra > 0 && (
                      // The chip has nothing to fly from, so it waits out the morph and fades in once the pill settles.
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1, y: hover ? -2 : 0 }}
                        transition={{
                          opacity: { duration: 0.2, delay: 0.28 },
                          scale: {
                            type: "spring",
                            stiffness: 420,
                            damping: 22,
                            delay: 0.28,
                          },
                          y: { type: "spring", stiffness: 420, damping: 26 },
                        }}
                        className="relative -ml-2 grid size-[38px] place-items-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 ring-[2.5px] ring-white dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-900"
                      >
                        +{extra}
                      </motion.span>
                    )}
                  </span>
                  <motion.span
                    layout="position"
                    transition={t}
                    className="flex flex-col items-start text-left"
                  >
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {team}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="relative flex size-1.5">
                        {!reduceMotion && (
                          <motion.span
                            className="absolute inset-0 rounded-full bg-emerald-500"
                            animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
                            transition={{
                              duration: 1.6,
                              repeat: Infinity,
                              ease: "easeOut",
                            }}
                          />
                        )}
                        <span className="relative size-1.5 rounded-full bg-emerald-500" />
                      </span>
                      {online} online
                    </span>
                  </motion.span>
                  {/* Expand hint: nudges toward the card on hover. */}
                  {/* Expand hint: same size as an avatar and inset like the first one, so the pill reads balanced.
                  On hover the tint deepens a shade and the chevron slides out and back in, clipped by the circle. */}
                  <motion.span
                    aria-hidden
                    // Like the "+n" chip, it waits out the morph (so the shrinking shell can't stretch it) and fades in.
                    layout="position"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      opacity: { duration: 0.2, delay: 0.28 },
                      scale: {
                        type: "spring",
                        stiffness: 420,
                        damping: 22,
                        delay: 0.28,
                      },
                      layout: t,
                    }}
                    className={cn(
                      "ml-2 grid size-[38px] shrink-0 place-items-center overflow-hidden rounded-full transition-colors duration-200",
                      hover
                        ? "bg-[#242423]/11 text-zinc-900 dark:bg-white/14 dark:text-zinc-100"
                        : "bg-[#242423]/6 text-zinc-500 dark:bg-white/8 dark:text-zinc-300",
                    )}
                  >
                    {/* Rests 1px right: a right-pointing chevron looks left-heavy when centered by its box. */}
                    <motion.span
                      initial={false}
                      animate={hover ? { x: [1, 22, -20, 1] } : { x: 1 }}
                      transition={
                        hover
                          ? {
                              duration: 0.55,
                              times: [0, 0.4, 0.401, 1],
                              ease: ["easeIn", "linear", "easeOut"],
                            }
                          : { duration: 0.2 }
                      }
                      className="flex"
                    >
                      <ChevronRightIcon className="size-[18px]" strokeWidth={2.5} />
                    </motion.span>
                  </motion.span>
                </motion.button>
              ) : (
                <motion.div
                  key="card"
                  layout="position"
                  transition={t}
                  exit={LEAVE}
                  role="region"
                  aria-label={`${team} members`}
                  className="w-[320px] max-w-full px-2 pb-3 pt-2"
                >
                  <motion.header
                    layout="position"
                    transition={t}
                    exit={LEAVE}
                    className="flex items-center justify-between gap-3 px-3 pb-1 pt-2"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: 0.12, duration: 0.3, ease: GLIDE },
                      }}
                      className="flex items-baseline gap-2"
                    >
                      <p className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
                        {team}
                      </p>
                      <p className="text-[12px] text-zinc-400">
                        {people.length}
                      </p>
                    </motion.div>
                    <div className="flex items-center gap-1">
                      <motion.button
                        ref={closeRef}
                        type="button"
                        aria-label="Collapse"
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          rotate: 0,
                          transition: {
                            delay: 0.1,
                            duration: 0.3,
                            ease: GLIDE,
                          },
                        }}
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="grid size-8 cursor-pointer place-items-center rounded-full text-zinc-500 transition-colors hover:bg-[#242423]/6 hover:text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-white/8 dark:hover:text-zinc-100"
                      >
                        <XIcon className="size-4" strokeWidth={2} />
                      </motion.button>
                    </div>
                  </motion.header>

                  {/* Two quiet groups instead of a badge on every row. */}
                  {[
                    {
                      label: "Online",
                      rows: people.filter((m) => m.awayFor === undefined),
                    },
                    {
                      label: "Away",
                      rows: people.filter((m) => m.awayFor !== undefined),
                    },
                  ]
                    .filter((g) => g.rows.length > 0)
                    .map((group, g) => (
                      <motion.section
                        key={group.label}
                        exit={LEAVE}
                        aria-label={`${group.label}, ${group.rows.length}`}
                        className="mt-2"
                      >
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: 1,
                            transition: {
                              delay: 0.14 + g * 0.08,
                              duration: 0.3,
                            },
                          }}
                          className="px-3 pb-1 text-[12px] font-medium text-zinc-400"
                        >
                          {group.label} · {group.rows.length}
                        </motion.p>
                        <ul>
                          {group.rows.map((m) => {
                            const i = people.indexOf(m);
                            const away = m.awayFor !== undefined;
                            return (
                              <li
                                key={m.name}
                                className="flex items-center gap-3 px-3 py-1.5"
                              >
                                <span
                                  className={cn("flex", away && "opacity-50")}
                                >
                                  {i < stack ? (
                                    <Avatar
                                      member={m}
                                      color={m.color}
                                      size={34}
                                      layoutId={`avatar-${m.name}`}
                                    />
                                  ) : (
                                    // People hidden behind the "+n" chip have no stack avatar to fly from, so they pop in.
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{
                                        opacity: 1,
                                        scale: 1,
                                        transition: {
                                          type: "spring",
                                          stiffness: 420,
                                          damping: 24,
                                          delay: 0.1 + i * 0.03,
                                        },
                                      }}
                                      className="flex"
                                    >
                                      <Avatar
                                        member={m}
                                        color={m.color}
                                        size={34}
                                      />
                                    </motion.span>
                                  )}
                                </span>
                                <motion.div
                                  initial={{ opacity: 0, x: -6 }}
                                  animate={{
                                    opacity: 1,
                                    x: 0,
                                    transition: {
                                      delay: 0.16 + i * 0.03,
                                      duration: 0.3,
                                      ease: GLIDE,
                                    },
                                  }}
                                  className="min-w-0 flex-1"
                                >
                                  <p
                                    className={cn(
                                      "truncate text-sm font-medium",
                                      away
                                        ? "text-zinc-500 dark:text-zinc-400"
                                        : "text-zinc-900 dark:text-zinc-100",
                                    )}
                                  >
                                    {m.name}
                                  </p>
                                  <p className="truncate text-[12px] text-zinc-500 dark:text-zinc-400">
                                    {m.role}
                                  </p>
                                </motion.div>
                                {away && (
                                  <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{
                                      opacity: 1,
                                      transition: {
                                        delay: 0.22 + i * 0.03,
                                        duration: 0.25,
                                      },
                                    }}
                                    className="text-[12px] tabular-nums text-zinc-400"
                                  >
                                    {m.awayFor}m
                                  </motion.span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </motion.section>
                    ))}

                  {onInvite && (
                    <motion.button
                      type="button"
                      onClick={onInvite}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          delay: 0.22 + people.length * 0.03,
                          duration: 0.3,
                          ease: GLIDE,
                        },
                      }}
                      exit={LEAVE}
                      whileTap={{ scale: 0.97 }}
                      className="mx-1 mt-3 flex w-[calc(100%-0.5rem)] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#242423]/5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-[#242423]/8 hover:text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/6 dark:text-zinc-200 dark:hover:bg-white/10"
                    >
                      <UserPlusIcon className="size-4" strokeWidth={2} />
                      Invite
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </div>
    );
  },
);