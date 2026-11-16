"use client";

/**
 * AddCard, from https://motion-brew.com/components/add-card
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
import { AnimatePresence, motion, useAnimation, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

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

// Animated icon: lock
const LockIcon = (() => {
interface LockIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface LockIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const LockIcon = forwardRef<LockIconHandle, LockIconProps>(
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
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          transition={{
            duration: 1,
            ease: [0.4, 0, 0.2, 1],
          }}
          variants={{
            normal: {
              rotate: 0,
              scale: 1,
            },
            animate: {
              rotate: [-3, 1, -2, 0],
              scale: [0.95, 1.05, 0.98, 1],
            },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
          <motion.path
            animate={controls}
            d="M7 11V7a5 5 0 0 1 10 0v4"
            initial="normal"
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            variants={{
              normal: {
                pathLength: 1,
              },
              animate: {
                pathLength: 0.7,
              },
            }}
          />
        </motion.svg>
      </span>
    );
  }
);

LockIcon.displayName = "LockIcon";
  return LockIcon;
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

// Animated icon: wifi
const WifiIcon = (() => {
interface WifiIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface WifiIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const WIFI_LEVELS = [
  { d: "M12 20h.01", initialOpacity: 1, delay: 0 },
  { d: "M8.5 16.429a5 5 0 0 1 7 0", initialOpacity: 1, delay: 0.1 },
  { d: "M5 12.859a10 10 0 0 1 14 0", initialOpacity: 1, delay: 0.2 },
  { d: "M2 8.82a15 15 0 0 1 20 0", initialOpacity: 1, delay: 0.3 },
];

const WifiIcon = forwardRef<WifiIconHandle, WifiIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const controls = useAnimation();

    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: async () => {
          await controls.start("fadeOut");
          controls.start("fadeIn");
        },
        stopAnimation: () => controls.start("fadeIn"),
      };
    });

    const handleMouseEnter = useCallback(
      async (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          await controls.start("fadeOut");
          controls.start("fadeIn");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        controls.start("fadeIn");
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
          {WIFI_LEVELS.map((level, index) => (
            <motion.path
              animate={controls}
              d={level.d}
              initial={{ opacity: level.initialOpacity }}
              key={index}
              variants={{
                fadeOut: {
                  opacity: index === 0 ? 1 : 0,
                  transition: { duration: 0.2 },
                },
                fadeIn: {
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: level.delay,
                  },
                },
              }}
            />
          ))}
        </svg>
      </span>
    );
  }
);

WifiIcon.displayName = "WifiIcon";
  return WifiIcon;
})();

// AddCard

/**
 * AddCard
 *
 * Trigger: press (plus hover). An empty state for payments: a white card that
 * asks for a first payment card. Above the copy, a dark card floats over a
 * dashed slot, tipped and waiting. Hovering it tilts it toward the cursor with
 * a glare that follows, and the plus in the button turns on hover. Pressing
 * the button types the card in: the last four digits roll in one by one, the
 * name and expiry fill, then the card drops into its slot with a bounce, the
 * dashes fade, a check pops on the card and the button turns green and rolls
 * to its done label. Changes are announced, and reduced motion swaps the
 * movement for fades. When the card scrolls into view, the stage fades up,
 * the payment card swings in from above and settles into its float, the
 * title and line rise out of a soft blur, and the button follows.
 *
 * Engine: motion/react (springs for the float, tilt and drop; AnimatePresence
 * for the rolling text and icon swaps).
 */

export interface AddCardProps {
  /** Card title. Default `"Add your first card"`. */
  title?: string;
  /** Line under the title. */
  subtitle?: string;
  /** Button label. Default `"Add card"`. */
  cta?: string;
  /** Button label once the card is in. Default `"Card added"`. */
  doneLabel?: string;
  /** Small line under the button. Pass an empty string to hide it. */
  note?: string;
  /** Last four digits shown once added. Default `"4242"`. */
  last4?: string;
  /** Name shown once added. Default `"Alex Morgan"`. */
  holder?: string;
  /** Expiry shown once added. Default `"08/29"`. */
  expiry?: string;
  /** Called on press. Return a promise to hold the card until it settles; a rejection puts it back. */
  onAdd?: () => void | Promise<unknown>;
  className?: string;
}

type Phase = "idle" | "typing" | "done";

const GLIDE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 260, damping: 22 } as const;
const SUCCESS = "#269a5a";

/** Text that rolls up out of a blur whenever it changes. */
function Rolling({
  text,
  still,
  delay = 0,
  className,
}: {
  text: string;
  still: boolean;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-grid overflow-hidden", className)}>
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
          transition={{ duration: 0.32, ease: GLIDE, delay }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** The dark payment card. Tilts toward the cursor with a glare that follows. */
function PaymentCard({
  phase,
  last4,
  holder,
  expiry,
  still,
}: {
  phase: Phase;
  last4: string;
  holder: string;
  expiry: string;
  still: boolean;
}) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [10, -10]), {
    stiffness: 220,
    damping: 20,
  });
  const ry = useSpring(useTransform(px, [0, 1], [-12, 12]), {
    stiffness: 220,
    damping: 20,
  });
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(180px circle at ${gx} ${gy}, rgba(255,255,255,0.18), transparent 70%)`;
  const [hover, setHover] = React.useState(false);
  const filled = phase !== "idle";
  const digits = filled ? last4.padEnd(4, "•").slice(0, 4) : "••••";

  return (
    <motion.div
      className="relative h-[152px] w-[240px]"
      style={{ perspective: 800 }}
      onPointerMove={(e) => {
        if (still) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        px.set(0.5);
        py.set(0.5);
      }}
    >
      <motion.div
        className="relative size-full overflow-hidden rounded-2xl bg-[#242423] p-4 text-white shadow-[0_2px_4px_rgba(0,0,0,0.12),0_18px_40px_-14px_rgba(0,0,0,0.45)]"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      >
        {/* A faint sheen across the card, and the glare that follows the pointer. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]"
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{ background: glare, opacity: hover && !still ? 1 : 0 }}
        />

        <div className="relative flex items-start justify-between">
          {/* Chip */}
          <span className="relative block h-6 w-8 overflow-hidden rounded-[6px] bg-gradient-to-br from-[#e8d29a] to-[#b8964f]">
            <span className="absolute inset-x-0 top-1/2 h-px bg-black/20" />
            <span className="absolute inset-y-0 left-1/2 w-px bg-black/20" />
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            {phase === "done" ? (
              <motion.span
                key="check"
                className="grid size-6 place-items-center rounded-full text-white"
                style={{ background: SUCCESS }}
                initial={still ? { opacity: 0 } : { scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 18,
                  delay: still ? 0 : 0.25,
                }}
              >
                <CheckIcon className="size-4" strokeWidth={3} aria-hidden />
              </motion.span>
            ) : (
              <motion.span
                key="wave"
                exit={{ opacity: 0, scale: 0.6 }}
                className="grid size-6 place-items-center"
              >
                <WifiIcon
                  className="size-5 rotate-90 text-white/60"
                  strokeWidth={2}
                  aria-hidden
                />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <p className="relative mt-6 flex gap-3 font-mono text-sm tracking-[0.12em] text-white/90">
          <span className="text-white/50">••••</span>
          <span className="text-white/50">••••</span>
          <span className="text-white/50">••••</span>
          <span className="flex">
            {[...digits].map((c, i) => (
              <Rolling
                key={i}
                text={c}
                still={still}
                delay={filled ? i * 0.12 : 0}
              />
            ))}
          </span>
        </p>

        <div className="relative mt-4 flex items-end justify-between text-xs">
          <span className="min-w-0">
            <span className="block text-white/40">Cardholder</span>
            <Rolling
              text={filled ? holder : "Your name"}
              still={still}
              delay={filled ? 0.5 : 0}
              className={cn("font-medium", !filled && "text-white/50")}
            />
          </span>
          <span className="text-right">
            <span className="block text-white/40">Expires</span>
            <Rolling
              text={filled ? expiry : "MM/YY"}
              still={still}
              delay={filled ? 0.62 : 0}
              className={cn(
                "font-medium tabular-nums",
                !filled && "text-white/50",
              )}
            />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const AddCard = React.forwardRef<HTMLDivElement, AddCardProps>(
  function AddCard(
    {
      title = "Add your first card",
      subtitle = "Save a card to pay for classes in one tap. You can change or remove it any time.",
      cta = "Add card",
      doneLabel = "Card added",
      note = "Encrypted end to end. We never store your full number.",
      last4 = "4242",
      holder = "Alex Morgan",
      expiry = "08/29",
      onAdd,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const [phase, setPhase] = React.useState<Phase>("idle");
    const card = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => card.current as HTMLDivElement);
    // Everything plays in once the card scrolls into view.
    const inView = useInView(card, { once: true, amount: 0.4 });
    const show = still || inView;

    const add = async () => {
      if (phase !== "idle") return;
      setPhase("typing");
      try {
        // Let the digits roll in, and wait for the caller if it is saving.
        await Promise.all([
          onAdd?.(),
          new Promise((r) => setTimeout(r, still ? 150 : 1000)),
        ]);
        setPhase("done");
      } catch {
        setPhase("idle");
      }
    };

    const done = phase === "done";

    return (
      <div
        ref={card}
        className={cn(
          "w-[400px] max-w-full rounded-3xl bg-white p-6 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        {/* The stage: a dashed slot, and the card waiting above it. */}
        <motion.div
          initial={still ? false : { opacity: 0, scale: 0.96 }}
          animate={show ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.6, ease: GLIDE }}
          className="relative grid h-[224px] place-items-center overflow-hidden rounded-2xl bg-zinc-100 dark:bg-white/6"
        >
          <motion.span
            aria-hidden
            className="absolute h-[152px] w-[240px] rounded-2xl border-2 border-dashed border-zinc-300 dark:border-white/15"
            initial={still ? false : { opacity: 0, scale: 0.9 }}
            animate={
              show
                ? { opacity: done ? 0 : 1, scale: done ? 1.04 : 1 }
                : undefined
            }
            transition={{
              duration: 0.4,
              ease: GLIDE,
              delay: done ? 0.1 : still ? 0 : 0.2,
            }}
          />
          {/* A soft shadow on the stage that tightens as the card lands. */}
          <motion.span
            aria-hidden
            className="absolute top-[calc(50%+64px)] h-6 w-[200px] rounded-[50%] bg-black/15 blur-md dark:bg-black/40"
            animate={
              done
                ? { opacity: 0.9, scaleX: 1 }
                : { opacity: 0.45, scaleX: 0.8 }
            }
            transition={SPRING}
          />
          {/* The card swings in from above, then settles into its float. */}
          <motion.div
            aria-hidden
            initial={
              still ? false : { opacity: 0, y: -120, rotate: -22, scale: 0.9 }
            }
            animate={
              show ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : undefined
            }
            transition={{
              type: "spring",
              stiffness: 170,
              damping: 18,
              delay: 0.15,
              opacity: { duration: 0.3, delay: 0.15 },
            }}
          >
            <motion.div
              initial={false}
              animate={
                done || still
                  ? { y: 0, rotate: 0, scale: 1 }
                  : { y: [-14, -20, -14], rotate: -6, scale: 0.96 }
              }
              transition={
                done
                  ? { type: "spring", stiffness: 380, damping: 16 }
                  : {
                      y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                      default: SPRING,
                    }
              }
            >
              <PaymentCard
                phase={phase}
                last4={last4}
                holder={holder}
                expiry={expiry}
                still={still}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={still ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
          transition={{ duration: 0.5, ease: GLIDE, delay: 0.35 }}
        >
          <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={still ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
          transition={{ duration: 0.5, ease: GLIDE, delay: 0.7 }}
        >
          <motion.button
            type="button"
            onClick={add}
            aria-disabled={phase !== "idle"}
            whileTap={phase === "idle" && !still ? { scale: 0.98 } : undefined}
            animate={{ backgroundColor: done ? SUCCESS : "#242423" }}
            transition={{ duration: still ? 0 : 0.3, ease: GLIDE }}
            className={cn(
              "group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
              phase === "idle" ? "cursor-pointer" : "cursor-default",
            )}
          >
            <span className="relative grid size-4 place-items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                {phase === "typing" ? (
                  <motion.span
                    key="spin"
                    className="size-4 rounded-full border-2 border-white/30 border-t-white"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1, rotate: still ? 0 : 360 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{
                      rotate: {
                        duration: 0.8,
                        ease: "linear",
                        repeat: Infinity,
                      },
                      default: { duration: 0.2 },
                    }}
                  />
                ) : done ? (
                  <motion.svg
                    key="check"
                    viewBox="0 0 16 16"
                    className="size-4"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  >
                    <motion.path
                      d="M3.5 8.5 6.5 11.5 12.5 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.25}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: still ? 1 : 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35, ease: GLIDE, delay: 0.08 }}
                    />
                  </motion.svg>
                ) : (
                  <motion.span
                    key="plus"
                    className="grid"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                  >
                    <PlusIcon
                      className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <Rolling
              text={phase === "typing" ? "Adding card" : done ? doneLabel : cta}
              still={still}
            />
          </motion.button>

          {note && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <LockIcon className="size-3" strokeWidth={2.5} aria-hidden />
              {note}
            </p>
          )}
        </motion.div>

        <span role="status" aria-live="polite" className="sr-only">
          {phase === "typing"
            ? "Adding card."
            : done
              ? `Card ending in ${last4} added.`
              : ""}
        </span>
      </div>
    );
  },
);