"use client";

/**
 * FileDrop, from https://motion-brew.com/components/file-drop
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
import gsap from "gsap";
import { AnimatePresence, motion, type MotionValue, type Transition, useAnimation, useAnimationControls, useMotionValue, useReducedMotion, useTransform, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: circle-check
const CircleCheckIcon = (() => {
interface CircleCheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CircleCheckIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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
    transition: {
      duration: 0.3,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
};

const CircleCheckIcon = forwardRef<CircleCheckIconHandle, CircleCheckIconProps>(
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
          <circle cx="12" cy="12" r="10" />
          <motion.path
            animate={controls}
            d="m9 12 2 2 4-4"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

CircleCheckIcon.displayName = "CircleCheckIcon";
  return CircleCheckIcon;
})();

// Animated icon: cloud-upload
const CloudUploadIcon = (() => {
interface CloudUploadIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CloudUploadIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const CLOUD_VARIANTS: Variants = {
  initial: { y: -2 },
  active: { y: 0 },
};

const CloudUploadIcon = forwardRef<CloudUploadIconHandle, CloudUploadIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("initial"),
        stopAnimation: () => controls.start("active"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("initial");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("active");
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
          <path d="M4.2 15.1A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.2" />
          <motion.g
            animate={controls}
            transition={{
              duration: 0.3,
              ease: [0.68, -0.6, 0.32, 1.6],
            }}
            variants={CLOUD_VARIANTS}
          >
            <path d="M12 13v8" />
            <path d="m8 17 4-4 4 4" />
          </motion.g>
        </svg>
      </span>
    );
  }
);

CloudUploadIcon.displayName = "CloudUploadIcon";
  return CloudUploadIcon;
})();

// Animated icon: delete
const DeleteIcon = (() => {
interface DeleteIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface DeleteIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const LID_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: { y: -1.1 },
};

const SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

const DeleteIcon = forwardRef<DeleteIconHandle, DeleteIconProps>(
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
          <motion.g
            animate={controls}
            transition={SPRING_TRANSITION}
            variants={LID_VARIANTS}
          >
            <path d="M3 6h18" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </motion.g>
          <motion.path
            animate={controls}
            d="M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8"
            transition={SPRING_TRANSITION}
            variants={{
              normal: { d: "M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8" },
              animate: { d: "M19 9v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V9" },
            }}
          />
          <motion.line
            animate={controls}
            transition={SPRING_TRANSITION}
            variants={{
              normal: { y1: 11, y2: 17 },
              animate: { y1: 11.5, y2: 17.5 },
            }}
            x1="10"
            x2="10"
            y1="11"
            y2="17"
          />
          <motion.line
            animate={controls}
            transition={SPRING_TRANSITION}
            variants={{
              normal: { y1: 11, y2: 17 },
              animate: { y1: 11.5, y2: 17.5 },
            }}
            x1="14"
            x2="14"
            y1="11"
            y2="17"
          />
        </svg>
      </span>
    );
  }
);

DeleteIcon.displayName = "DeleteIcon";
  return DeleteIcon;
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

// FileDrop

/**
 * FileDrop
 *
 * Trigger: drag (plus press). A white upload card with a drop zone. Drag files
 * over it and the dashed border starts marching, the zone swells a touch, the
 * cloud lifts and the line rolls to "Release to upload". Drop them and a ripple
 * spreads from where they fell while the cloud gulps them down; the files
 * slide into the list one after another. Each thumbnail develops like a photo,
 * blurred and grey at first and sharpening as it uploads, while a slider runs
 * along its track: an ink fill with a light sheen gliding through it and a
 * round knob riding its tip, beside a rolling percent. Meanwhile a thin arc
 * circles the cloud and the zone counts the files in flight. When a file
 * finishes the track tucks away, a soft green wash sweeps the row, a faint
 * green glow rises from the card's bottom edge to about halfway and fades, the
 * thumbnail pops and a green check draws itself. Hover a finished row and the
 * check turns into a bin; on touch screens, which have no hover, the check
 * settles into a quiet gray bin after it plays, so a file can be deleted with
 * a tap. Deleting (or cancelling) breaks the row: a hairline
 * crack draws down it and it shivers, then the two halves and a few small
 * flakes become free pieces with a little physics, pushed outward and up with
 * a spin, falling under gravity with air drag, lifting a shadow as they go and
 * fading, while the list closes the gap. Files of the wrong type or too large shake and say why. Images
 * dragged in from a web page arrive as links and are fetched into files. A
 * ref's `add` takes files from anywhere else.
 * Reduced motion keeps every state without movement.
 *
 * Engine: motion/react (springs and keyframes for the zone, ripple, glow and rows,
 * motion values driving each slider, percent and developing thumbnail,
 * AnimatePresence for the rows and the done check), with GSAP for the break:
 * a timeline for the crack and shiver, then a ticker stepping the falling pieces.
 */

export interface FileDropHandle {
  /** Add files as if they were dropped. */
  add: (files: File[]) => void;
}

export interface FileDropProps {
  /** Accepted MIME types. Default PNG, JPEG and GIF. */
  accept?: string[];
  /** Largest file in bytes. Default 10 MB. */
  maxSize?: number;
  /** Your upload. Call `progress` with 0 to 1 as it goes. Default: a simulated upload. */
  upload?: (file: File, progress: (p: number) => void) => Promise<void>;
  /** Called each time a file finishes uploading. */
  onUploaded?: (file: File) => void;
  className?: string;
}

type Status = "uploading" | "done" | "error";
interface Item {
  id: string;
  file: File;
  url: string;
  status: Status;
  error?: string;
  /** Stagger for files that arrive together. */
  delay: number;
}

const POP: Transition = { type: "spring", stiffness: 520, damping: 30 };
const SOFT: Transition = { type: "spring", stiffness: 340, damping: 32 };
const GLIDE = [0.22, 1, 0.36, 1] as const;
// A jagged crack down the middle: the two halves a deleted row breaks into.
// The crack's points as [x %, y %]. The halves reach past the row's edges so
// its outline and shadow break with it instead of being clipped off.
const CRACK: [number, number][] = [
  [52, -40],
  [52, 0],
  [47, 22],
  [55, 41],
  [46, 63],
  [53, 82],
  [49, 100],
  [49, 140],
];
const crack = CRACK.map(([x, y]) => `${x}% ${y}%`).join(", ");
const LEFT_HALF = `polygon(-10% -40%, ${crack}, -10% 140%)`;
const RIGHT_HALF = `polygon(${crack}, 110% 140%, 110% -40%)`;

const DEFAULT_ACCEPT = ["image/png", "image/jpeg", "image/gif"];

const formatSize = (b: number) => {
  const [n, unit] =
    b < 1024
      ? [b, "B"]
      : b < 1024 * 1024
        ? [b / 1024, "KB"]
        : [b / 1024 / 1024, "MB"];
  return `${unit === "B" ? n : n.toFixed(1).replace(/\.0$/, "")} ${unit}`;
};

/** A pretend upload: steady progress with small stalls, about two seconds. */
const simulate = (_file: File, progress: (p: number) => void) =>
  new Promise<void>((resolve) => {
    const total = 1500 + Math.random() * 1200;
    let p = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      // Speed wobbles so the slider breathes rather than ticking evenly.
      const speed = (0.4 + Math.random() * 1.2) / total;
      p = Math.min(1, p + dt * speed);
      progress(p);
      if (p >= 1) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

function Slider({
  value,
  still,
}: {
  value: MotionValue<number>;
  still: boolean;
}) {
  const left = useTransform(value, (v) => `${v * 100}%`);
  return (
    <div className="relative mt-2 h-1.5 rounded-full bg-[#242423]/[0.07]">
      <motion.div
        className="absolute inset-y-0 left-0 overflow-hidden rounded-full bg-[#242423]"
        style={{ width: left }}
      >
        {!still && (
          <motion.span
            aria-hidden
            className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            animate={{ x: ["-120%", "420%"] }}
            transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
          />
        )}
      </motion.div>
      {/* The knob riding the tip of the fill. */}
      <motion.span
        aria-hidden
        className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] ring-1 ring-[#242423]/10"
        style={{ left }}
      />
    </div>
  );
}

/** True on screens without hover (phones, tablets), where a bin cannot wait for a hover. */
const NO_HOVER = "(hover: none)";
function useNoHover() {
  return React.useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mq = window.matchMedia(NO_HOVER);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => typeof window !== "undefined" && !!window.matchMedia?.(NO_HOVER).matches,
    () => false,
  );
}

function Row({
  item,
  still,
  upload,
  onDone,
  onRemove,
  stage,
}: {
  item: Item;
  still: boolean;
  upload: NonNullable<FileDropProps["upload"]>;
  onDone: (id: string) => void;
  onRemove: (id: string) => void;
  /** A layer over the whole card where the broken pieces fly free. */
  stage: React.RefObject<HTMLDivElement | null>;
}) {
  const value = useMotionValue(item.status === "error" ? 1 : 0);
  // The thumbnail develops like a photo: blurred and grey, sharpening as it uploads.
  const develop = useTransform(value, (v) =>
    still
      ? "none"
      : `blur(${((1 - v) * 5).toFixed(2)}px) grayscale(${(1 - v).toFixed(2)})`,
  );
  const zoom = useTransform(value, [0, 1], still ? [1, 1] : [1.18, 1]);
  const percent = useTransform(value, (v) => `${Math.round(v * 100)}%`);
  const started = React.useRef(false);
  const body = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState(false);
  const [broken, setBroken] = React.useState(false);
  const done = item.status === "done";
  const failed = item.status === "error";
  // Without hover, the check plays and then settles into a quiet gray bin, so
  // the file can be deleted with a tap; with a mouse, the bin waits for a hover.
  const noHover = useNoHover();
  const [settled, setSettled] = React.useState(false);
  React.useEffect(() => {
    if (!done || !noHover) return;
    const t = window.setTimeout(() => setSettled(true), still ? 0 : 1400);
    return () => window.clearTimeout(t);
  }, [done, noHover, still]);

  React.useEffect(() => {
    if (item.status !== "uploading" || started.current) return;
    started.current = true;
    void upload(item.file, (p) =>
      value.set(Math.max(value.get(), Math.min(1, p))),
    ).then(() => {
      value.set(1);
      onDone(item.id);
    });
  }, [item, upload, value, onDone]);

  // Deleting breaks the row in two along a jagged crack. A hairline crack
  // draws down the row and it shivers; then the two halves (and a few small
  // flakes from the crack) become free bodies on the card's stage: each gets a
  // push outward and up and a spin, then falls under gravity with a little air
  // drag, lifting a soft shadow as it goes, and fades. The row closes the gap
  // behind them straight away.
  // Not tied to the row's GSAP context: the pieces outlive the row, which
  // unmounts while they are still falling.
  const shatter = () => {
    const el = body.current;
    const layer = stage.current;
    if (!el || broken) return;
    if (still || !layer) {
      onRemove(item.id);
      return;
    }
    setBroken(true);
    const base = layer.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const left0 = box.left - base.left;
    const top0 = box.top - base.top;
    const piece = (clip: string, origin: string) => {
      const c = el.cloneNode(true) as HTMLElement;
      c.setAttribute("aria-hidden", "true");
      Object.assign(c.style, {
        position: "absolute",
        left: `${left0}px`,
        top: `${top0}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        margin: "0",
        clipPath: clip,
        transformOrigin: origin,
        background: "#fff",
        boxShadow: "0 0 0 1px rgba(36,36,35,0.09), 0 1px 2px rgba(0,0,0,0.04)",
        willChange: "transform, opacity",
      });
      layer.appendChild(c);
      return c;
    };
    // Each half turns about its own middle.
    const leftHalf = piece(LEFT_HALF, "25% 50%");
    const rightHalf = piece(RIGHT_HALF, "75% 50%");
    el.style.visibility = "hidden";

    // The crack line.
    const svgNS = "http://www.w3.org/2000/svg";
    const line = document.createElementNS(svgNS, "svg");
    line.setAttribute("aria-hidden", "true");
    Object.assign(line.style, {
      position: "absolute",
      left: `${left0}px`,
      top: `${top0}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      overflow: "visible",
      pointerEvents: "none",
    });
    const points = CRACK.slice(1, -1).map(
      ([x, y]) => [(x / 100) * box.width, (y / 100) * box.height] as const,
    );
    const path = document.createElementNS(svgNS, "polyline");
    path.setAttribute("points", points.map((p) => p.join(",")).join(" "));
    Object.assign(path.style, {
      fill: "none",
      stroke: "rgba(36,36,35,0.5)",
      strokeWidth: "1.25",
      strokeLinejoin: "round",
    });
    line.appendChild(path);
    layer.appendChild(line);
    const length = path.getTotalLength();

    // Small flakes chipped from along the crack.
    const flakes = points.slice(0, 5).map(([x, y], i) => {
      const f = document.createElement("span");
      const size = 4 + Math.random() * 4;
      Object.assign(f.style, {
        position: "absolute",
        left: `${left0 + x - size / 2}px`,
        top: `${top0 + y - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: i % 2 ? "#fff" : "rgba(36,36,35,0.18)",
        boxShadow: "0 0 0 1px rgba(36,36,35,0.12)",
        clipPath: "polygon(50% 0, 100% 80%, 0 100%)",
        opacity: "0",
      });
      layer.appendChild(f);
      return f;
    });

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    type Body = {
      el: Element;
      x: number;
      y: number;
      a: number;
      vx: number;
      vy: number;
      w: number;
      life: number;
    };
    const bodies: Body[] = [
      {
        el: leftHalf,
        x: 0,
        y: 0,
        a: 0,
        vx: -rand(45, 85),
        vy: -rand(90, 140),
        w: -rand(22, 50),
        life: 0.95,
      },
      {
        el: rightHalf,
        x: 0,
        y: 0,
        a: 0,
        vx: rand(50, 95),
        vy: -rand(100, 150),
        w: rand(26, 56),
        life: 0.95,
      },
      ...flakes.map((f) => ({
        el: f,
        x: 0,
        y: 0,
        a: rand(0, 180),
        vx: rand(-150, 150),
        vy: -rand(180, 360),
        w: rand(-720, 720),
        life: rand(0.5, 0.75),
      })),
    ];
    const G = 2100;
    const release = () => {
      gsap.set(flakes, { opacity: 1 });
      gsap.to(line, { opacity: 0, duration: 0.1 });
      // The halves lift off the card: their shadow grows as they fall.
      gsap.to([leftHalf, rightHalf], {
        boxShadow:
          "0 0 0 1px rgba(36,36,35,0.09), 0 14px 28px -12px rgba(0,0,0,0.28)",
        duration: 0.3,
        ease: "power2.out",
      });
      // Close the gap while the pieces are still in the air.
      window.setTimeout(() => onRemove(item.id), 90);
      let t = 0;
      const step = (_time: number, ms: number) => {
        const dt = Math.min(0.033, Math.max(0, ms / 1000));
        t += dt;
        let alive = false;
        for (const b of bodies) {
          b.vy += G * dt;
          b.vx *= 1 - 0.8 * dt;
          b.w *= 1 - 0.6 * dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.a += b.w * dt;
          const fade = Math.max(
            0,
            Math.min(1, 1 - (t - b.life * 0.45) / (b.life * 0.55)),
          );
          if (fade > 0) alive = true;
          gsap.set(b.el, { x: b.x, y: b.y, rotation: b.a, opacity: fade });
        }
        if (!alive) {
          gsap.ticker.remove(step);
          [leftHalf, rightHalf, line, ...flakes].forEach((n) => n.remove());
        }
      };
      gsap.ticker.add(step);
    };

    gsap
      .timeline({ onComplete: release })
      .fromTo(
        path,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 0.16, ease: "power2.in" },
      )
      // A shiver as it gives way, the halves pulling a hair apart.
      .to([leftHalf, rightHalf], {
        x: (i) => (i ? 1.5 : -1.5),
        duration: 0.04,
        repeat: 3,
        yoyo: true,
        ease: "none",
      })
      .to(leftHalf, { x: -3, rotation: -1, duration: 0.06, ease: "power2.out" })
      .to(
        rightHalf,
        { x: 3, rotation: 1, duration: 0.06, ease: "power2.out" },
        "<",
      )
      .add(() => {
        bodies[0]!.x = -3;
        bodies[0]!.a = -1;
        bodies[1]!.x = 3;
        bodies[1]!.a = 1;
      });
  };

  return (
    <motion.li
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setHovered(false);
      }}
      layout={!still}
      initial={
        still
          ? { opacity: 0 }
          : { opacity: 0, height: 0, y: 10, filter: "blur(6px)" }
      }
      animate={
        failed && !still
          ? {
              opacity: 1,
              height: "auto",
              y: 0,
              filter: "blur(0px)",
              x: [0, -6, 6, -4, 4, 0],
            }
          : { opacity: 1, height: "auto", y: 0, filter: "blur(0px)", x: 0 }
      }
      exit={
        still
          ? { opacity: 0 }
          : broken
            ? { height: 0, transition: { duration: 0.25, ease: GLIDE } }
            : { opacity: 0, height: 0, scale: 0.96, filter: "blur(4px)" }
      }
      transition={
        still
          ? { duration: 0 }
          : {
              ...SOFT,
              delay: done ? 0 : item.delay,
              x: { duration: 0.4, delay: item.delay },
            }
      }
      className="relative overflow-hidden pb-1"
    >
      <div
        ref={body}
        className="relative flex items-center gap-3 overflow-hidden rounded-2xl p-2 pr-2.5"
      >
        {/* A soft green wash sweeps across the row as it lands. */}
        <AnimatePresence>
          {done && !still && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#269a5a]/[0.09] to-transparent"
              initial={{ opacity: 0, x: "-60%" }}
              animate={{ opacity: [0, 1, 0], x: "60%" }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        <motion.div
          initial={still ? false : { scale: 0.6, rotate: -8 }}
          animate={
            done && !still
              ? { scale: [1, 1.12, 1], rotate: 0 }
              : { scale: 1, rotate: 0 }
          }
          transition={
            done
              ? { duration: 0.45, ease: GLIDE }
              : { ...POP, delay: item.delay + 0.05 }
          }
          className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-[#242423]/[0.06] ring-1 ring-[#242423]/[0.06]"
        >
          <motion.img
            src={item.url}
            alt=""
            className="size-full object-cover"
            style={{ filter: develop, scale: zoom }}
          />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-medium text-[#242423]">
              {item.file.name}
            </p>
            {item.status === "uploading" && (
              <motion.span className="shrink-0 text-xs tabular-nums text-zinc-500">
                {percent}
              </motion.span>
            )}
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            {item.status === "uploading" ? (
              <motion.div
                key="bar"
                exit={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, y: -4, filter: "blur(3px)" }
                }
                transition={{ duration: 0.2 }}
              >
                <Slider value={value} still={still} />
              </motion.div>
            ) : (
              <motion.p
                key="meta"
                initial={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, y: 6, filter: "blur(3px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.3, ease: GLIDE }}
                className={cn(
                  "mt-0.5 text-xs",
                  failed ? "text-[#d23f3f]" : "text-zinc-500",
                )}
              >
                {failed
                  ? item.error
                  : `${formatSize(item.file.size)}, uploaded`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="relative grid size-8 shrink-0 place-items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {done && noHover && settled ? (
              // Touch: after the check, a gray bin that does not shout.
              <motion.button
                key="rest"
                type="button"
                aria-label={`Delete ${item.file.name}`}
                onClick={shatter}
                initial={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.4, rotate: 30 }
                }
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={POP}
                whileTap={still ? undefined : { scale: 0.88 }}
                className="grid size-8 cursor-pointer place-items-center rounded-full bg-[#242423]/[0.05] text-zinc-400 outline-none transition-colors active:bg-[#242423]/[0.09] active:text-[#242423] focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <DeleteIcon className="size-4" strokeWidth={2.25} />
              </motion.button>
            ) : done && (noHover || !hovered) ? (
              <motion.button
                key="done"
                type="button"
                aria-label={`Delete ${item.file.name}`}
                onClick={shatter}
                initial={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.4, rotate: -30 }
                }
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
                transition={POP}
                className="grid size-8 place-items-center rounded-full bg-[#269a5a]/10 text-[#269a5a] outline-none"
              >
                <CircleCheckIcon
                  className="size-[18px]"
                  strokeWidth={2.25}
                  active={!still}
                />
              </motion.button>
            ) : done ? (
              // On hover (or focus) the check turns into a bin.
              <motion.button
                key="trash"
                type="button"
                aria-label={`Delete ${item.file.name}`}
                onClick={shatter}
                initial={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.4, rotate: 30 }
                }
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: -30 }}
                transition={POP}
                whileTap={still ? undefined : { scale: 0.88 }}
                className="grid size-8 cursor-pointer place-items-center rounded-full bg-[#d23f3f]/10 text-[#d23f3f] outline-none transition-colors hover:bg-[#d23f3f]/15 focus-visible:ring-2 focus-visible:ring-[#d23f3f]/40"
              >
                <DeleteIcon className="size-4" strokeWidth={2.25} />
              </motion.button>
            ) : (
              <motion.button
                key="remove"
                type="button"
                aria-label={
                  item.status === "uploading"
                    ? `Cancel ${item.file.name}`
                    : `Remove ${item.file.name}`
                }
                onClick={shatter}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={POP}
                className="grid size-8 cursor-pointer place-items-center rounded-full text-zinc-400 outline-none transition-colors hover:bg-[#242423]/[0.06] hover:text-[#242423] focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <XIcon className="size-3.5" strokeWidth={2.25} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.li>
  );
}

export const FileDrop = React.forwardRef<FileDropHandle, FileDropProps>(
  function FileDrop(
    {
      accept = DEFAULT_ACCEPT,
      maxSize = 10 * 1024 * 1024,
      upload = simulate,
      onUploaded,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const input = React.useRef<HTMLInputElement>(null);
    const depth = React.useRef(0);
    const seq = React.useRef(0);
    const [over, setOver] = React.useState(false);
    const [hover, setHover] = React.useState(false);
    const [items, setItems] = React.useState<Item[]>([]);
    const zone = React.useRef<HTMLDivElement>(null);
    const stage = React.useRef<HTMLDivElement>(null);
    const tile = useAnimationControls();
    const [ripples, setRipples] = React.useState<
      { id: number; x: number; y: number }[]
    >([]);
    const urls = React.useRef<string[]>([]);
    React.useEffect(
      () => () => urls.current.forEach((u) => URL.revokeObjectURL(u)),
      [],
    );

    const kinds = accept.map((t) =>
      t.split("/")[1]!.replace("jpeg", "jpg").toUpperCase(),
    );
    const add = React.useCallback(
      (files: File[], at?: { x: number; y: number }) => {
        if (!files.length) return;
        // The drop lands with a ripple from where it fell and the cloud gulps it down.
        const box = zone.current?.getBoundingClientRect();
        if (box && !still) {
          const x = at ? at.x - box.left : box.width / 2;
          const y = at ? at.y - box.top : box.height / 2;
          setRipples((r) => [...r, { id: ++seq.current, x, y }]);
          void tile.start({
            y: [0, 7, -3, 0],
            scale: [1, 0.86, 1.06, 1],
            transition: { duration: 0.5, ease: GLIDE },
          });
        }
        const next = files.map<Item>((file, i) => {
          const url = URL.createObjectURL(file);
          urls.current.push(url);
          const bad = !accept.includes(file.type)
            ? `Not supported. Use ${kinds.join(", ")}`
            : file.size > maxSize
              ? `Too large. Up to ${formatSize(maxSize)}`
              : undefined;
          return {
            id: `file-${++seq.current}`,
            file,
            url,
            status: bad ? "error" : "uploading",
            error: bad,
            delay: still ? 0 : 0.12 + i * 0.08,
          };
        });
        setItems((list) => [...next.reverse(), ...list].slice(0, 6));
      },
      [accept, maxSize, kinds, still, tile],
    );
    React.useImperativeHandle(ref, () => ({ add }), [add]);
    const [glow, setGlow] = React.useState(0);
    const finish = React.useCallback(
      (id: string) => {
        setGlow((g) => g + 1);
        setItems((list) =>
          list.map((it) => {
            if (it.id !== id) return it;
            onUploaded?.(it.file);
            return { ...it, status: "done" as const };
          }),
        );
      },
      [onUploaded],
    );
    const remove = React.useCallback(
      (id: string) => setItems((list) => list.filter((it) => it.id !== id)),
      [],
    );

    const live = over || hover;
    const busy = items.filter((i) => i.status === "uploading").length;
    const uploaded = items.filter((i) => i.status === "done").length;

    return (
      <div
        className={cn(
          "relative isolate w-[400px] max-w-full rounded-3xl bg-white p-5 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]",
          className,
        )}
      >
        {/* Each finished upload sends a faint green glow up from the bottom edge. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
        >
          {glow > 0 && !still && (
            <motion.span
              key={glow}
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 55% at 50% 100%, rgba(38,154,90,0.16), rgba(38,154,90,0.06) 55%, transparent 80%)",
              }}
              initial={{ opacity: 0, y: "55%" }}
              animate={{ opacity: [0, 1, 1, 0], y: ["55%", "8%", "0%", "0%"] }}
              transition={{
                duration: 2,
                times: [0, 0.4, 0.65, 1],
                ease: "easeOut",
              }}
            />
          )}
        </span>
        {/* Broken rows fly free on this layer, over the card and past its edges. */}
        <div
          ref={stage}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20"
        />
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-base font-semibold tracking-tight">
            Upload images
          </p>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${uploaded}/${items.length}`}
              initial={
                still
                  ? { opacity: 0 }
                  : { opacity: 0, y: 6, filter: "blur(3px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                still
                  ? { opacity: 0 }
                  : { opacity: 0, y: -6, filter: "blur(3px)" }
              }
              transition={{ duration: 0.25, ease: GLIDE }}
              className="text-xs tabular-nums text-zinc-500"
            >
              {items.length
                ? `${uploaded} of ${items.length} done`
                : `${kinds.join(", ")} up to ${formatSize(maxSize)}`}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Drop zone */}
        <motion.div
          ref={zone}
          role="button"
          tabIndex={0}
          aria-label="Upload images: drop files here or press to browse"
          onClick={() => input.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              input.current?.click();
            }
          }}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onDragEnter={(e) => {
            e.preventDefault();
            depth.current += 1;
            setOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={() => {
            depth.current = Math.max(0, depth.current - 1);
            if (!depth.current) setOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            depth.current = 0;
            setOver(false);
            const at = { x: e.clientX, y: e.clientY };
            if (e.dataTransfer.files.length) {
              add([...e.dataTransfer.files], at);
              return;
            }
            // An image dragged from a web page arrives as a link, not a file:
            // fetch it and turn it into one.
            const named = e.dataTransfer
              .getData("DownloadURL")
              .match(/^([^:]+):([^:]+):(.+)$/);
            const url =
              named?.[3] ??
              e.dataTransfer.getData("text/uri-list").split("\n")[0]?.trim();
            if (!url) return;
            // Read now: the drag data is gone once the event ends.
            const plain = e.dataTransfer.getData("text/plain").trim();
            void fetch(url)
              .then((r) => r.blob())
              .then((blob) => {
                const ext =
                  blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
                const name =
                  named?.[2] ??
                  (/^[\w .-]+\.\w{2,4}$/.test(plain)
                    ? plain
                    : url.startsWith("data:")
                      ? `image.${ext}`
                      : url.split("/").pop()!.split("?")[0]!);
                add(
                  [new File([blob], name, { type: named?.[1] ?? blob.type })],
                  at,
                );
              })
              .catch(() => {});
          }}
          animate={{
            scale: over && !still ? 1.015 : 1,
            backgroundColor: over ? "rgba(36,36,35,0.04)" : "rgba(36,36,35,0)",
          }}
          transition={SOFT}
          className="relative mt-4 flex cursor-pointer flex-col items-center rounded-[20px] px-6 py-7 text-center outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          {/* The dashed border, which marches while files hover over it. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
          >
            <motion.rect
              x="0.75"
              y="0.75"
              width="calc(100% - 1.5px)"
              height="calc(100% - 1.5px)"
              rx="19.25"
              fill="none"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              animate={{
                stroke: over
                  ? "rgba(36,36,35,0.55)"
                  : live
                    ? "rgba(36,36,35,0.28)"
                    : "rgba(36,36,35,0.16)",
                strokeDashoffset: over && !still ? [0, -24] : 0,
              }}
              transition={
                over && !still
                  ? {
                      strokeDashoffset: {
                        duration: 0.6,
                        ease: "linear",
                        repeat: Infinity,
                      },
                      stroke: { duration: 0.2 },
                    }
                  : { duration: 0.2 }
              }
            />
          </svg>
          {/* Ripples from where files land. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          >
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  className="absolute size-[560px] rounded-full bg-[radial-gradient(circle,rgba(36,36,35,0.09),rgba(36,36,35,0.04)_45%,transparent_70%)]"
                  style={{ left: r.x - 280, top: r.y - 280 }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  onAnimationComplete={() =>
                    setRipples((all) => all.filter((x) => x.id !== r.id))
                  }
                />
              ))}
            </AnimatePresence>
          </span>
          <motion.span animate={tile} className="relative grid">
            {/* While files upload, a thin arc runs round the cloud tile. */}
            <AnimatePresence>
              {busy > 0 && !over && (
                <motion.span
                  aria-hidden
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.25 }}
                  className="pointer-events-none absolute -inset-[5px] overflow-hidden rounded-[20px] p-[1.5px]"
                  style={{
                    mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
                    WebkitMask:
                      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                  }}
                >
                  <motion.span
                    className="absolute left-1/2 top-1/2 size-[200%] -translate-x-1/2 -translate-y-1/2"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 0deg, transparent 200deg, rgba(36,36,35,0.7) 330deg, transparent 360deg)",
                    }}
                    animate={still ? undefined : { rotate: 360 }}
                    transition={{
                      duration: 1,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  />
                </motion.span>
              )}
            </AnimatePresence>
            <motion.span
              animate={{
                y: over && !still ? -4 : 0,
                scale: over && !still ? 1.08 : 1,
              }}
              transition={POP}
              className={cn(
                "grid size-12 place-items-center rounded-2xl transition-colors duration-200",
                over
                  ? "bg-[#242423] text-white"
                  : "bg-[#242423]/[0.06] text-[#242423]",
              )}
            >
              <CloudUploadIcon
                className="size-[22px]"
                strokeWidth={2}
                active={live || busy > 0 || undefined}
              />
            </motion.span>
          </motion.span>
          <span className="relative mt-3 inline-grid h-6 overflow-hidden text-sm font-medium">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={over ? "drop" : busy ? `busy-${busy}` : "idle"}
                initial={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, y: "90%", filter: "blur(3px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={
                  still
                    ? { opacity: 0 }
                    : { opacity: 0, y: "-90%", filter: "blur(3px)" }
                }
                transition={{ duration: 0.25, ease: GLIDE }}
                className="leading-6"
              >
                {over ? (
                  "Release to upload"
                ) : busy ? (
                  `Uploading ${busy} ${busy === 1 ? "file" : "files"}`
                ) : (
                  <>
                    Drop images here or{" "}
                    <span className="underline decoration-[#242423]/30 underline-offset-4">
                      browse
                    </span>
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="mt-1 text-xs text-zinc-500">
            {kinds.join(", ")}, up to {formatSize(maxSize)} each
          </span>
          <input
            ref={input}
            type="file"
            multiple
            accept={accept.join(",")}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              if (e.target.files?.length) add([...e.target.files]);
              e.target.value = "";
            }}
          />
        </motion.div>

        {/* Files */}
        <AnimatePresence initial={false}>
          {items.length > 0 && (
            <motion.ul
              key="list"
              initial={still ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={still ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={still ? { duration: 0 } : SOFT}
              aria-label="Files"
              className="-mx-1.5 mt-3 overflow-hidden px-1.5 pt-1"
            >
              <AnimatePresence initial={false}>
                {items.map((it) => (
                  <Row
                    key={it.id}
                    item={it}
                    still={still}
                    upload={upload}
                    onDone={finish}
                    onRemove={remove}
                    stage={stage}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  },
);