"use client";

/**
 * EventCard, from https://motion-brew.com/components/event-card
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
import { useGSAP } from "@gsap/react";
import { type ClassValue, clsx } from "clsx";
import gsap from "gsap";
import { ArrowRight, Video } from "lucide-react";
import { AnimatePresence, motion, type Transition, useAnimation, useInView, useReducedMotion, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: calendar-days
const CalendarDaysIcon = (() => {
interface CalendarDaysIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CalendarDaysIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const DOTS = [
  { cx: 8, cy: 14 },
  { cx: 12, cy: 14 },
  { cx: 16, cy: 14 },
  { cx: 8, cy: 18 },
  { cx: 12, cy: 18 },
  { cx: 16, cy: 18 },
];

const VARIANTS: Variants = {
  normal: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  animate: (i: number) => ({
    opacity: [1, 0.3, 1],
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      times: [0, 0.5, 1],
    },
  }),
};

const CalendarDaysIcon = forwardRef<
  CalendarDaysIconHandle,
  CalendarDaysIconProps
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
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect height="18" rx="2" width="18" x="3" y="4" />
        <path d="M3 10h18" />
        <AnimatePresence>
          {DOTS.map((dot, index) => (
            <motion.circle
              animate={controls}
              custom={index}
              cx={dot.cx}
              cy={dot.cy}
              fill="currentColor"
              initial="normal"
              key={`${dot.cx}-${dot.cy}`}
              r="1"
              stroke="none"
              variants={VARIANTS}
            />
          ))}
        </AnimatePresence>
      </svg>
    </span>
  );
});

CalendarDaysIcon.displayName = "CalendarDaysIcon";
  return CalendarDaysIcon;
})();

// Animated icon: check
const CheckIcon = (() => {
interface CheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CheckIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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
    scale: 1,
    transition: {
      duration: 0.3,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    scale: [0.5, 1],
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
};

const CheckIcon = forwardRef<CheckIconHandle, CheckIconProps>(
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
            d="M4 12 9 17L20 6"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

CheckIcon.displayName = "CheckIcon";
  return CheckIcon;
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

// Animated icon: plus
const PlusIcon = (() => {
interface PlusIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface PlusIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PlusIcon = forwardRef<PlusIconHandle, PlusIconProps>(
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
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          variants={{
            normal: {
              rotate: 0,
            },
            animate: {
              rotate: 180,
            },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </motion.svg>
      </span>
    );
  }
);

PlusIcon.displayName = "PlusIcon";
  return PlusIcon;
})();

// EventCard

/**
 * EventCard
 *
 * Trigger: hover and press (plus in view). A minimal white card with the
 * details of one event: a small kind line over the title, then the date and
 * a time whose clock hands sweep round to the start when the card comes into
 * view. Guests sit in a stack that fans out on hover with a name under each
 * face, and the dashed plus adds a guest who pops in while the counts roll.
 * The description fades out under its last line and Show more unfolds the
 * rest. The action row pairs an ink Join button, whose arrow slides through
 * on hover, with round tools drawn in GSAP: the copy sheets slide apart and
 * swap to a check, the pencil rocks and draws a line, and the bin lifts its
 * lid, then widens into a red Delete pill to confirm and leaves an Undo row.
 * Everything rises in one row after another when the card scrolls into view.
 * Reduced motion swaps the movement for fades.
 *
 * Engine: motion/react for the layout, stack, counts and states; gsap +
 * @gsap/react for the icon drawings (scoped with useGSAP).
 */

gsap.registerPlugin(useGSAP);

export interface EventGuest {
  name: string;
  /** Photo URL. Without one, initials on a soft disc. */
  avatar?: string;
  /** Whether they said yes. Default `true`. */
  going?: boolean;
}

export interface EventCardProps {
  /** Event title. Default `"Product demo"`. */
  title?: string;
  /** When it starts. Default a Friday at 1:30 PM. */
  start?: Date;
  /** When it ends. Default two hours after the start. */
  end?: Date;
  /** People invited. Default six guests, one still to answer. */
  guests?: EventGuest[];
  /** What the event is about. Each string is a paragraph. */
  about?: string[];
  /** Locale for the date and time. Default `"en-US"`. */
  locale?: string;
  /** Called by the pencil. */
  onEdit?: () => void;
  /** Called once delete is confirmed. */
  onDelete?: () => void;
  /** Called by the plus. Default adds a sample guest so the stack can be tried. */
  onInvite?: () => void;
  /** What kind of event it is, shown as a tag. Default `"Video call"`. */
  kind?: string;
  /** Main button label. Default `"Join call"`. */
  cta?: string;
  /** Called by the main button. */
  onJoin?: () => void;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const POP = { type: "spring", stiffness: 520, damping: 24 } as const;
const DANGER = "#d6453d";

const headshot = (id: string) =>
  `https://images.unsplash.com/${id}?w=96&h=96&fit=crop&crop=faces`;

const DEFAULT_GUESTS: EventGuest[] = [
  { name: "Sienna Hart", avatar: headshot("photo-1494790108377-be9c29b29330") },
  { name: "Marcus Lee", avatar: headshot("photo-1507003211169-0a1dd7228f2d") },
  { name: "Priya Nair", avatar: headshot("photo-1534528741775-53994a69daeb") },
  { name: "Leo Grant", avatar: headshot("photo-1500648767791-00dcc994a43e") },
  { name: "Ava Brooks", avatar: headshot("photo-1438761681033-6461ffad8d80") },
  { name: "Omar Reyes", going: false },
];

const EXTRA_GUESTS: EventGuest[] = [
  { name: "Nina Park", going: false },
  { name: "Theo Ward", going: false },
  { name: "Maya Cole", going: false },
];

const DEFAULT_ABOUT = [
  "Sienna is inviting you to a scheduled video call.",
  "Topic: a walk through the new dashboard, followed by questions from the team.",
  "Bring anything you want us to look at. The recording and notes will be shared afterwards.",
];

function defaultStart() {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  d.setHours(13, 30, 0, 0);
  return d;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// ---------------------------------------------------------------------------
// Icons drawn and moved with GSAP

/** Two sheets that slide apart on hover. */
function CopyIcon({ hover, still }: { hover: boolean; still: boolean }) {
  const ref = React.useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      gsap.to("[data-front]", {
        x: hover && !still ? 1.5 : 0,
        y: hover && !still ? 1.5 : 0,
        duration: 0.3,
        ease: "power3.out",
      });
      gsap.to("[data-back]", {
        x: hover && !still ? -1 : 0,
        y: hover && !still ? -1 : 0,
        duration: 0.3,
        ease: "power3.out",
      });
    },
    { scope: ref, dependencies: [hover] },
  );
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path
        data-back
        d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"
      />
      <rect data-front x="8" y="8" width="13" height="13" rx="2" />
    </svg>
  );
}

/** A bin whose lid lifts and tips on hover. */
function TrashIcon({ hover, still }: { hover: boolean; still: boolean }) {
  const ref = React.useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      gsap.to("[data-lid]", {
        y: hover && !still ? -2 : 0,
        rotation: hover && !still ? -14 : 0,
        svgOrigin: "4 6",
        duration: 0.35,
        ease: hover ? "back.out(3)" : "power2.out",
      });
    },
    { scope: ref, dependencies: [hover] },
  );
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <g data-lid>
        <path d="M3 6h18" />
        <path d="M8.5 6V4.5A1.5 1.5 0 0 1 10 3h4a1.5 1.5 0 0 1 1.5 1.5V6" />
      </g>
      <path d="M5.5 6l1 13.5A1.5 1.5 0 0 0 8 21h8a1.5 1.5 0 0 0 1.5-1.5l1-13.5" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

/** A pencil that rocks and draws a short line on hover. */
function PencilIcon({ hover, still }: { hover: boolean; still: boolean }) {
  const ref = React.useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      gsap.set("[data-line]", { strokeDasharray: 1, strokeDashoffset: 1 });
      if (!hover || still) {
        gsap.to("[data-pencil]", {
          rotation: 0,
          x: 0,
          duration: 0.25,
          svgOrigin: "4 20",
        });
        gsap.to("[data-line]", { strokeDashoffset: 1, duration: 0.2 });
        return;
      }
      gsap
        .timeline()
        .to("[data-pencil]", {
          keyframes: { rotation: [0, -8, 6, 0], x: [0, 1, 2, 2.5] },
          duration: 0.5,
          ease: "sine.inOut",
          svgOrigin: "4 20",
        })
        .to(
          "[data-line]",
          { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" },
          0.05,
        );
    },
    { scope: ref, dependencies: [hover] },
  );
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      className="size-[18px] overflow-visible"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path data-line d="M13 21h8" pathLength={1} />
      <g data-pencil>
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        <path d="m15 5 3 3" />
      </g>
    </svg>
  );
}

/** A clock whose hands sweep round to the start time once it is in view. */
function SweepClock({
  time,
  play,
  still,
}: {
  time: Date;
  play: boolean;
  still: boolean;
}) {
  const ref = React.useRef<SVGSVGElement>(null);
  const h = time.getHours();
  const m = time.getMinutes();
  useGSAP(
    () => {
      const hour = ((h % 12) + m / 60) * 30;
      const minute = m * 6;
      const o = {
        svgOrigin: "12 12",
        ease: "power3.out",
        duration: still ? 0 : 1.3,
      };
      if (!play && !still) {
        gsap.set("[data-hour], [data-minute]", {
          rotation: 0,
          svgOrigin: "12 12",
        });
        return;
      }
      gsap.to("[data-hour]", { rotation: hour, ...o });
      gsap.to("[data-minute]", { rotation: minute + (still ? 0 : 360), ...o });
    },
    { scope: ref, dependencies: [play, h, m] },
  );
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <line data-hour x1="12" y1="12" x2="12" y2="7.5" />
      <line data-minute x1="12" y1="12" x2="12" y2="5.5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Pieces

/** A number that rolls up out of a blur when it changes. */
function Rolling({ text, still }: { text: string; still: boolean }) {
  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          className="whitespace-nowrap"
          initial={
            still
              ? { opacity: 0 }
              : { opacity: 0, y: "70%", filter: "blur(4px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            still
              ? { opacity: 0 }
              : { opacity: 0, y: "-70%", filter: "blur(4px)" }
          }
          transition={{ duration: 0.32, ease: GLIDE }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function ToolButton({
  label,
  onClick,
  children,
  className,
  still,
}: {
  label: string;
  onClick: () => void;
  children: (hover: boolean) => React.ReactNode;
  className?: string;
  still: boolean;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      whileTap={still ? undefined : { scale: 0.9 }}
      className={cn(
        "grid size-12 shrink-0 cursor-pointer place-items-center rounded-full bg-zinc-100 text-zinc-700 outline-none transition-colors hover:bg-zinc-200/80 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/6 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-zinc-100",
        className,
      )}
    >
      {children(hover)}
    </motion.button>
  );
}

const ROWS = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const ROW = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: GLIDE },
  },
};

export const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  function EventCard(
    {
      title = "Product demo",
      start: startProp,
      end: endProp,
      guests: guestsProp,
      about = DEFAULT_ABOUT,
      locale = "en-US",
      onEdit,
      onDelete,
      onInvite,
      kind = "Video call",
      cta = "Join call",
      onJoin,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const card = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => card.current as HTMLDivElement);
    const inView = useInView(card, { once: true, amount: 0.3 });
    const show = still || inView;

    const start = React.useMemo(() => startProp ?? defaultStart(), [startProp]);
    const end = React.useMemo(
      () => endProp ?? new Date(start.getTime() + 2 * 3600_000),
      [endProp, start],
    );

    const [added, setAdded] = React.useState<EventGuest[]>([]);
    const guests = [...(guestsProp ?? DEFAULT_GUESTS), ...added];
    const yes = guests.filter((g) => g.going !== false).length;
    const [fanned, setFanned] = React.useState(false);
    const [hoverGuest, setHoverGuest] = React.useState<number | null>(null);
    const [copied, setCopied] = React.useState(false);
    const [confirming, setConfirming] = React.useState(false);
    const [binHover, setBinHover] = React.useState(false);
    const [deleted, setDeleted] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [status, setStatus] = React.useState("");

    const date = start.toLocaleDateString(locale, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const t = (d: Date) =>
      d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
    const time = `${t(start)} to ${t(end)}`;

    const copy = async () => {
      const text = `${title}\n${date}\n${time}`;
      try {
        await navigator.clipboard?.writeText(text);
      } catch {
        /* The swap still confirms the press. */
      }
      setCopied(true);
      setStatus("Event details copied.");
      window.setTimeout(() => setCopied(false), 1400);
    };

    // Delete asks first; the question times out on its own.
    React.useEffect(() => {
      if (!confirming) return;
      const id = window.setTimeout(() => setConfirming(false), 3000);
      return () => window.clearTimeout(id);
    }, [confirming]);

    const remove = () => {
      if (!confirming) return setConfirming(true);
      setConfirming(false);
      setDeleted(true);
      setStatus("Event deleted.");
      onDelete?.();
    };

    const invite = () => {
      if (onInvite) return onInvite();
      const next = EXTRA_GUESTS[added.length % EXTRA_GUESTS.length]!;
      setAdded((a) => [...a, { ...next }]);
      setStatus(`${next.name} invited.`);
    };

    const STEP = fanned ? 34 : 24;
    const month = start.toLocaleDateString(locale, { month: "short" });
    const weekday = start.toLocaleDateString(locale, { weekday: "short" });
    const arrow =
      "absolute inset-0 size-4 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

    return (
      <div
        ref={card}
        className={cn(
          "relative w-[360px] max-w-full overflow-hidden rounded-3xl bg-white p-6 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        <motion.div
          variants={still ? undefined : ROWS}
          initial={still ? false : "hidden"}
          animate={show ? "shown" : "hidden"}
        >
          {/* Header: a small kind line, the title, then date and time rows. */}
          <motion.div variants={still ? undefined : ROW}>
            <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <Video className="size-3.5" strokeWidth={2} aria-hidden />
              {kind}
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              {title}
            </h3>
          </motion.div>
          <motion.div
            variants={still ? undefined : ROW}
            className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300"
          >
            <p className="flex items-center gap-2.5">
              <CalendarDaysIcon
                className="size-[18px] text-zinc-400"
                strokeWidth={1.75}
                aria-hidden
              />
              {date}
            </p>
            <p className="flex items-center gap-2.5">
              <span className="text-zinc-400">
                <SweepClock time={start} play={show} still={still} />
              </span>
              {time}
            </p>
          </motion.div>

          <AnimatePresence initial={false} mode="popLayout">
            {deleted ? (
              <motion.div
                key="gone"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: GLIDE }}
                className="mt-4 flex items-center justify-between rounded-full bg-zinc-100 py-2 pl-5 pr-2 text-sm dark:bg-white/6"
              >
                <span className="text-zinc-500 dark:text-zinc-400">
                  This event was deleted.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDeleted(false);
                    setStatus("Event restored.");
                  }}
                  className="h-8 cursor-pointer rounded-full bg-white px-4 text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.06)] outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-800"
                >
                  Undo
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="body"
                initial={false}
                exit={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, y: -8, filter: "blur(6px)" }
                }
                transition={{ duration: 0.3, ease: GLIDE }}
              >
                {/* Guests: the stack fans out on hover with a name under each face. */}
                <motion.div variants={still ? undefined : ROW} className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold">
                      <Rolling text={String(guests.length)} still={still} />{" "}
                      guests
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <Rolling text={String(yes)} still={still} /> going,{" "}
                      <Rolling
                        text={String(guests.length - yes)}
                        still={still}
                      />{" "}
                      awaiting
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className="relative h-9"
                      style={{ width: (guests.length - 1) * STEP + 36 }}
                      onPointerEnter={() => setFanned(true)}
                      onPointerLeave={() => {
                        setFanned(false);
                        setHoverGuest(null);
                      }}
                    >
                      <AnimatePresence initial={false}>
                        {guests.map((g, i) => (
                          <motion.span
                            key={g.name}
                            className="absolute left-0 top-0"
                            style={{ zIndex: hoverGuest === i ? 50 : i }}
                            initial={
                              still
                                ? { opacity: 0 }
                                : { scale: 0, opacity: 0, x: i * STEP }
                            }
                            animate={{
                              x: i * STEP,
                              scale: hoverGuest === i ? 1.12 : 1,
                              opacity: 1,
                              y: hoverGuest === i ? -2 : 0,
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={
                              still
                                ? { duration: 0 }
                                : {
                                    type: "spring",
                                    stiffness: 420,
                                    damping: 26,
                                  }
                            }
                            onPointerEnter={() => setHoverGuest(i)}
                          >
                            <span
                              className={cn(
                                "grid size-9 place-items-center overflow-hidden rounded-full text-xs font-semibold ring-2 ring-white dark:ring-zinc-900",
                                g.avatar
                                  ? "bg-zinc-200"
                                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
                              )}
                            >
                              {g.avatar ? (
                                <img
                                  src={g.avatar}
                                  alt={g.name}
                                  draggable={false}
                                  className="size-full object-cover"
                                />
                              ) : (
                                initials(g.name)
                              )}
                            </span>
                            {g.going === false && (
                              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-amber-400 ring-2 ring-white dark:ring-zinc-900" />
                            )}
                            <AnimatePresence>
                              {hoverGuest === i && (
                                <motion.span
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  transition={{ duration: 0.18 }}
                                  className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#242423] px-2.5 py-1 text-xs text-white dark:bg-white dark:text-zinc-900"
                                >
                                  {g.name}
                                  {g.going === false ? ", awaiting" : ""}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                    <motion.button
                      type="button"
                      aria-label="Invite a guest"
                      onClick={invite}
                      whileTap={still ? undefined : { scale: 0.9 }}
                      className="group grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-dashed border-zinc-300 text-zinc-500 outline-none transition-colors hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-white/20 dark:text-zinc-400 dark:hover:bg-white/8"
                    >
                      <PlusIcon
                        className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90"
                        strokeWidth={2}
                      />
                    </motion.button>
                  </div>
                </motion.div>

                {/* About: fades out under its last line until Show more unfolds the rest. */}
                <motion.div variants={still ? undefined : ROW} className="mt-5">
                  <motion.div
                    initial={false}
                    animate={{ height: open ? "auto" : 68 }}
                    transition={
                      still ? { duration: 0 } : { duration: 0.45, ease: GLIDE }
                    }
                    className="relative overflow-hidden"
                  >
                    <div className="space-y-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {about.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                    <motion.span
                      aria-hidden
                      initial={false}
                      animate={{ opacity: open ? 0 : 1 }}
                      transition={{ duration: 0.3 }}
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-zinc-900"
                    />
                  </motion.div>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpen((o) => !o)}
                    className="mt-1 flex cursor-pointer items-center gap-1 rounded-full text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    <Rolling
                      text={open ? "Show less" : "Show more"}
                      still={still}
                    />
                    <motion.span
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={still ? { duration: 0 } : POP}
                      className="grid"
                    >
                      <ChevronDownIcon className="size-4" strokeWidth={2} />
                    </motion.span>
                  </button>
                </motion.div>

                {/* Actions: the main button, then round tools whose drawings move on hover. */}
                <motion.div
                  variants={still ? undefined : ROW}
                  className="mt-5 flex items-center gap-2"
                >
                  <motion.button
                    layout
                    type="button"
                    onClick={() => onJoin?.()}
                    whileTap={still ? undefined : { scale: 0.98 }}
                    transition={
                      still
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 500, damping: 36 }
                    }
                    style={{ borderRadius: 999 }}
                    className="group flex h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap bg-[#242423] px-5 text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:bg-white dark:text-zinc-900 dark:focus-visible:ring-offset-zinc-900"
                  >
                    {cta}
                    <span
                      aria-hidden
                      className="relative size-4 shrink-0 overflow-hidden"
                    >
                      <ArrowRight
                        className={cn(
                          arrow,
                          !still && "group-hover:translate-x-[140%]",
                        )}
                        strokeWidth={2.25}
                      />
                      <ArrowRight
                        className={cn(
                          arrow,
                          "-translate-x-[140%]",
                          !still &&
                            "group-hover:translate-x-0 group-hover:delay-75",
                        )}
                        strokeWidth={2.25}
                      />
                    </span>
                  </motion.button>
                  {!confirming && (
                    <ToolButton
                      label={copied ? "Copied" : "Copy event details"}
                      onClick={copy}
                      still={still}
                    >
                      {(hover) => (
                        <AnimatePresence mode="popLayout" initial={false}>
                          {copied ? (
                            <motion.span
                              key="ok"
                              className="grid text-[#269a5a]"
                              initial={
                                still
                                  ? { opacity: 0 }
                                  : { scale: 0.4, opacity: 0, rotate: -45 }
                              }
                              animate={{ scale: 1, opacity: 1, rotate: 0 }}
                              exit={{ scale: 0.4, opacity: 0 }}
                              transition={POP}
                            >
                              <CheckIcon
                                className="size-[18px]"
                                strokeWidth={2.25}
                              />
                            </motion.span>
                          ) : (
                            <motion.span
                              key="copy"
                              className="grid"
                              initial={{ scale: 0.4, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.4, opacity: 0 }}
                              transition={POP}
                            >
                              <CopyIcon hover={hover} still={still} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      )}
                    </ToolButton>
                  )}
                  {!confirming && (
                    <ToolButton
                      label="Edit event"
                      onClick={() => onEdit?.()}
                      still={still}
                    >
                      {(hover) => <PencilIcon hover={hover} still={still} />}
                    </ToolButton>
                  )}
                  <motion.button
                    layout
                    type="button"
                    aria-label={confirming ? "Confirm delete" : "Delete event"}
                    onClick={remove}
                    whileTap={still ? undefined : { scale: 0.92 }}
                    onPointerEnter={() => setBinHover(true)}
                    onPointerLeave={() => setBinHover(false)}
                    transition={
                      still
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 500, damping: 34 }
                    }
                    style={{ borderRadius: 999 }}
                    animate={{
                      backgroundColor: confirming
                        ? DANGER
                        : binHover
                          ? "rgba(120,120,120,0.18)"
                          : "rgba(120,120,120,0.1)",
                    }}
                    className={cn(
                      "flex h-12 shrink-0 cursor-pointer items-center justify-center gap-1.5 overflow-hidden text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                      confirming
                        ? "px-5 text-white"
                        : "w-12 text-zinc-700 dark:text-zinc-300",
                    )}
                  >
                    <motion.span layout className="grid">
                      <TrashIcon hover={binHover || confirming} still={still} />
                    </motion.span>
                    <AnimatePresence initial={false}>
                      {confirming && (
                        <motion.span
                          layout
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          Delete
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <span role="status" aria-live="polite" className="sr-only">
          {status}
        </span>
      </div>
    );
  },
);