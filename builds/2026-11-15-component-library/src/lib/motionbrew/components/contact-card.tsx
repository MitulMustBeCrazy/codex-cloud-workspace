"use client";

/**
 * ContactCard, from https://motion-brew.com/components/contact-card
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
import { type ClassValue, clsx } from "clsx";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import { AnimatePresence, motion, type Transition, useAnimation, useReducedMotion, type Variants } from "motion/react";
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

// Animated icon: copy
const CopyIcon = (() => {
interface CopyIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CopyIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 17,
  mass: 1,
};

const CopyIcon = forwardRef<CopyIconHandle, CopyIconProps>(
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
          <motion.rect
            animate={controls}
            height="14"
            rx="2"
            ry="2"
            transition={DEFAULT_TRANSITION}
            variants={{
              normal: { translateY: 0, translateX: 0 },
              animate: { translateY: -3, translateX: -3 },
            }}
            width="14"
            x="8"
            y="8"
          />
          <motion.path
            animate={controls}
            d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
            transition={DEFAULT_TRANSITION}
            variants={{
              normal: { x: 0, y: 0 },
              animate: { x: 3, y: 3 },
            }}
          />
        </svg>
      </span>
    );
  }
);

CopyIcon.displayName = "CopyIcon";
  return CopyIcon;
})();

// Animated icon: linkedin
const LinkedinIcon = (() => {
interface LinkedinIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface LinkedinIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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
    pathOffset: 0,
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [1, 0],
    transition: {
      duration: 0.6,
      ease: "linear",
      opacity: { duration: 0.1 },
    },
  },
};

const RECT_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [1, 0],
    transition: {
      duration: 0.6,
      ease: "linear",
      opacity: { duration: 0.1 },
    },
  },
};

const CIRCLE_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [1, 0],
    transition: {
      duration: 0.6,
      ease: "linear",
      opacity: { duration: 0.1 },
    },
  },
};

const LinkedinIcon = forwardRef<LinkedinIconHandle, LinkedinIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const pathControls = useAnimation();
    const rectControls = useAnimation();
    const circleControls = useAnimation();

    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => {
          pathControls.start("animate");
          rectControls.start("animate");
          circleControls.start("animate");
        },
        stopAnimation: () => {
          pathControls.start("normal");
          rectControls.start("normal");
          circleControls.start("normal");
        },
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          pathControls.start("animate");
          rectControls.start("animate");
          circleControls.start("animate");
        }
      },
      [circleControls, onMouseEnter, pathControls, rectControls]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          pathControls.start("normal");
          rectControls.start("normal");
          circleControls.start("normal");
        }
      },
      [pathControls, rectControls, circleControls, onMouseLeave]
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
            animate={pathControls}
            d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
            initial="normal"
            variants={PATH_VARIANTS}
          />
          <motion.rect
            animate={rectControls}
            height="12"
            initial="normal"
            variants={RECT_VARIANTS}
            width="4"
            x="2"
            y="9"
          />
          <motion.circle
            animate={circleControls}
            cx="4"
            cy="4"
            initial="normal"
            r="2"
            variants={CIRCLE_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

LinkedinIcon.displayName = "LinkedinIcon";
  return LinkedinIcon;
})();

// ContactCard

/**
 * ContactCard
 *
 * Trigger: hover (plus focus and press). A Contact link that lives inside a
 * sentence ("Not just a simple Contact button."), set in the sentence's own
 * size, weight and colour with just an arrow after it. Hovering draws an
 * underline under it, turns the arrow up toward the card and lifts a white
 * contact card out of it with a soft spring and a blur, its rows rising in one
 * after another: an avatar with a breathing "available" dot, the name
 * and role, the email address, a LinkedIn link and a Book a call button.
 * Pressing the email copies it, the icon flipping to a check while the label
 * rolls to Copied. The LinkedIn and Book arrows slide through on hover. The
 * card stays open while the pointer travels from the link onto it, and
 * closes a moment after it leaves, on Escape, or on a click elsewhere. Keyboard focus and a tap on
 * touch open it too. Reduced motion keeps every state but drops the movement.
 *
 * Engine: motion/react (spring pop-over with a staggered reveal, rolling
 * labels and icon swaps).
 */

export interface ContactCardProps {
  /** Pill label. Default `"Contact"`. */
  label?: string;
  /** Who you are reaching. Default `"Maya Lindqvist"`. */
  name?: string;
  /** Their role. Default `"Design lead"`. */
  role?: string;
  /** Their photo. */
  avatar?: string;
  /** Email address. Default `"maya@studio.co"`. */
  email?: string;
  /** LinkedIn profile URL. */
  linkedin?: string;
  /** Booking link. Without it the button calls `onBook`. */
  bookHref?: string;
  /** Called by the book button when there is no `bookHref`. */
  onBook?: () => void;
  /** Book button label. Default `"Book a call"`. */
  bookLabel?: string;
  /** Show the available dot. Default `true`. */
  available?: boolean;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const CLOSE_DELAY = 220;

const STAGGER = {
  shut: {},
  open: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
};
const RISE = {
  shut: { opacity: 0, y: 8, filter: "blur(4px)" },
  open: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: GLIDE },
  },
};

/** An arrow that slides out to the right while a fresh one slides in, on the parent's hover. */
function Through({ still, className }: { still: boolean; className?: string }) {
  const arrow =
    "absolute inset-0 size-4 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <span
      aria-hidden
      className={cn("relative size-4 shrink-0 overflow-hidden", className)}
    >
      <ArrowRight
        className={cn(arrow, !still && "group-hover/row:translate-x-[140%]")}
        strokeWidth={2.25}
      />
      <ArrowRight
        className={cn(
          arrow,
          "-translate-x-[140%]",
          !still && "group-hover/row:translate-x-0 group-hover/row:delay-75",
        )}
        strokeWidth={2.25}
      />
    </span>
  );
}

export const ContactCard = React.forwardRef<HTMLDivElement, ContactCardProps>(
  function ContactCard(
    {
      label = "Contact",
      name = "Maya Lindqvist",
      role = "Design lead",
      avatar = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces",
      email = "maya@studio.co",
      linkedin = "https://www.linkedin.com/",
      bookHref,
      onBook,
      bookLabel = "Book a call",
      available = true,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const id = React.useId();
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current as HTMLDivElement);
    const [open, setOpen] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const timer = React.useRef(0);
    const first = React.useRef<HTMLButtonElement>(null);
    // When the pill had keyboard focus, hand focus to the card's first row once it opens.
    const fromKeys = React.useRef(false);
    React.useEffect(() => {
      if (!open || !fromKeys.current) return;
      fromKeys.current = false;
      requestAnimationFrame(() => first.current?.focus());
    }, [open]);

    const show = () => {
      window.clearTimeout(timer.current);
      setOpen(true);
    };
    const hideSoon = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY);
    };

    React.useEffect(() => {
      if (!open) return;
      const away = (e: PointerEvent) => {
        if (!root.current?.contains(e.target as Node)) setOpen(false);
      };
      const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      document.addEventListener("pointerdown", away);
      document.addEventListener("keydown", esc);
      return () => {
        document.removeEventListener("pointerdown", away);
        document.removeEventListener("keydown", esc);
      };
    }, [open]);

    React.useEffect(() => () => window.clearTimeout(timer.current), []);

    const copy = async () => {
      try {
        await navigator.clipboard?.writeText(email);
      } catch {
        /* the swap still confirms the press */
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    };

    // A row in the soft contact block: icon disc, a small label over the value, a round action.
    const tile =
      "group/row flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-white/6";
    const disc =
      "grid size-9 shrink-0 place-items-center rounded-full bg-white text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-zinc-800 dark:text-zinc-200";
    const action =
      "grid size-8 shrink-0 place-items-center rounded-full text-zinc-500 transition-colors group-hover/row:bg-white group-hover/row:text-zinc-900 dark:group-hover/row:bg-zinc-800 dark:group-hover/row:text-zinc-100";

    const Book = bookHref ? "a" : "button";

    const dot = (size: string) =>
      available && (
        <span
          className={cn(
            "absolute bottom-0 right-0 grid place-items-center rounded-full bg-white dark:bg-zinc-900",
            size,
          )}
        >
          {!still && (
            <motion.span
              className="absolute size-[70%] rounded-full bg-[#269a5a]"
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <span className="relative size-[70%] rounded-full bg-[#269a5a]" />
        </span>
      );

    return (
      <div
        ref={root}
        className={cn("relative inline-flex", className)}
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e) => e.pointerType === "mouse" && hideSoon()}
        onBlur={(e) => {
          const to = e.relatedTarget as Node | null;
          if (to && !root.current?.contains(to)) hideSoon();
        }}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              id={`${id}-card`}
              role="dialog"
              aria-label={`Contact ${name}`}
              initial={
                still
                  ? { opacity: 0 }
                  : { opacity: 0, y: 10, scale: 0.94, filter: "blur(6px)" }
              }
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={
                still
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8, scale: 0.97, filter: "blur(4px)" }
              }
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{ transformOrigin: "50% 100%" }}
              className="absolute bottom-full left-1/2 z-30 w-[340px] -translate-x-1/2 pb-3"
            >
              {/* The padding under the card is a bridge, so the pointer can cross from the link to the card. */}
              <motion.div
                variants={still ? undefined : STAGGER}
                initial="shut"
                animate="open"
                className="rounded-3xl bg-white p-5 text-left text-base font-normal leading-normal tracking-normal text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_20px_44px_-16px_rgba(0,0,0,0.3)] ring-1 ring-black/5 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10"
              >
                {/* Header: who, what they do, and whether they are free. */}
                <motion.div
                  variants={still ? undefined : RISE}
                  className="flex items-center gap-3"
                >
                  <span className="relative shrink-0">
                    <img
                      src={avatar}
                      alt=""
                      draggable={false}
                      className="size-12 rounded-full bg-zinc-200 object-cover"
                    />
                    {dot("size-3.5")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-semibold leading-6 tracking-tight">
                      {name}
                    </span>
                    <span className="block truncate text-sm text-zinc-500 dark:text-zinc-400">
                      {role}
                    </span>
                  </span>
                  {available && (
                    <span className="shrink-0 rounded-full bg-[#269a5a]/10 px-2.5 py-1 text-xs font-medium text-[#1f7a48] dark:text-[#5fd394]">
                      Available
                    </span>
                  )}
                </motion.div>

                {/* Ways to reach them, in one soft block. */}
                <motion.div
                  variants={still ? undefined : RISE}
                  className="mt-4 rounded-2xl bg-zinc-100 p-1 dark:bg-white/6"
                >
                  <button
                    ref={first}
                    type="button"
                    onClick={copy}
                    aria-label={copied ? "Email copied" : `Copy ${email}`}
                    className={tile}
                  >
                    <span className={disc}>
                      <Mail className="size-4" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                        Email
                      </span>
                      <span className="relative block h-5 overflow-hidden">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={copied ? "copied" : "email"}
                            className="block truncate text-sm font-medium leading-5"
                            initial={
                              still ? { opacity: 0 } : { opacity: 0, y: "70%" }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={
                              still ? { opacity: 0 } : { opacity: 0, y: "-70%" }
                            }
                            transition={{ duration: 0.25, ease: GLIDE }}
                          >
                            {copied ? "Copied to clipboard" : email}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                    </span>
                    <span className={action}>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={copied ? "ok" : "copy"}
                          className={cn("grid", copied && "text-[#269a5a]")}
                          initial={
                            still
                              ? { opacity: 0 }
                              : { opacity: 0, scale: 0.4, rotate: -45 }
                          }
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={
                            still ? { opacity: 0 } : { opacity: 0, scale: 0.4 }
                          }
                          transition={{
                            type: "spring",
                            stiffness: 520,
                            damping: 24,
                          }}
                        >
                          {copied ? (
                            <CheckIcon className="size-4" strokeWidth={2.5} />
                          ) : (
                            <CopyIcon className="size-4" strokeWidth={2} />
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </button>
                  <div className="mx-3 h-px bg-zinc-200/80 dark:bg-white/8" />
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className={tile}
                  >
                    <span className={disc}>
                      <LinkedinIcon
                        className="size-4"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                        LinkedIn
                      </span>
                      <span className="block truncate text-sm font-medium leading-5">
                        {linkedin
                          .replace(/^https?:\/\/(www\.)?/, "")
                          .replace(/\/$/, "")}
                      </span>
                    </span>
                    <span className={action}>
                      <ArrowUpRight
                        className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/row:rotate-45"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </span>
                  </a>
                </motion.div>

                <motion.div
                  variants={still ? undefined : RISE}
                  className="mt-4"
                >
                  <Book
                    {...(bookHref
                      ? { href: bookHref }
                      : { type: "button" as const, onClick: onBook })}
                    className="group/row flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#242423] text-sm font-medium text-white outline-none transition-transform focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:focus-visible:ring-offset-zinc-900"
                  >
                    <CalendarDaysIcon
                      className="size-4"
                      strokeWidth={2}
                      aria-hidden
                    />
                    {bookLabel}
                    <Through still={still} />
                  </Book>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* An inline link in the sentence's own type: same size, weight and colour, with just an
            arrow after it and an underline that draws in on hover or while the card is open. */}
        <motion.button
          type="button"
          aria-expanded={open}
          aria-controls={open ? `${id}-card` : undefined}
          onClick={() => (open ? setOpen(false) : show())}
          onFocus={() => {
            fromKeys.current = true;
            show();
          }}
          whileTap={still ? undefined : { scale: 0.97 }}
          className="group relative inline-flex cursor-pointer items-baseline gap-[0.12em] rounded-md text-inherit outline-none [font:inherit] [letter-spacing:inherit] focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-zinc-900"
        >
          <span className="relative">
            {label}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 -bottom-[0.06em] h-[0.07em] origin-left rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                open ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
              )}
            />
          </span>
          <motion.span
            className="grid self-center"
            animate={{ rotate: open && !still ? -45 : 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            <ArrowUpRight className="size-[0.8em]" strokeWidth={2.5} />
          </motion.span>
        </motion.button>
      </div>
    );
  },
);