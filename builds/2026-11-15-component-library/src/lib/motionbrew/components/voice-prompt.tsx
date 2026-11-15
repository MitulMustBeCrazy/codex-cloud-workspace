"use client";

/**
 * VoicePrompt, from https://motion-brew.com/components/voice-prompt
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

// Animated icon: arrow-up
const ArrowUpIcon = (() => {
interface ArrowUpIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowUpIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: { d: "m5 12 7-7 7 7", translateY: 0 },
  animate: {
    d: "m5 12 7-7 7 7",
    translateY: [0, 3, 0],
    transition: {
      duration: 0.4,
    },
  },
};

const SECOND_PATH_VARIANTS: Variants = {
  normal: { d: "M12 19V5" },
  animate: {
    d: ["M12 19V5", "M12 19V10", "M12 19V5"],
    transition: {
      duration: 0.4,
    },
  },
};

const ArrowUpIcon = forwardRef<ArrowUpIconHandle, ArrowUpIconProps>(
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
            d="m5 12 7-7 7 7"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M12 19V5"
            variants={SECOND_PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

ArrowUpIcon.displayName = "ArrowUpIcon";
  return ArrowUpIcon;
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

// Animated icon: mic
const MicIcon = (() => {
interface MicIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MicIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const CAPSULE_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: {
    y: [0, -3, 0, -2, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

const MicIcon = forwardRef<MicIconHandle, MicIconProps>(
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
          overflow="visible"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 19v3" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <motion.rect
            animate={controls}
            height="13"
            rx="3"
            variants={CAPSULE_VARIANTS}
            width="6"
            x="9"
            y="2"
          />
        </svg>
      </span>
    );
  }
);

MicIcon.displayName = "MicIcon";
  return MicIcon;
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

// VoicePrompt

/**
 * VoicePrompt
 *
 * Trigger: press. A composer for an AI assistant that you can talk to. At rest
 * a low tide of colour breathes along the bottom of the card. Press the mic and
 * the card opens up while the tide rises: a soft glow that deepens from a lit
 * crest to a dark core, with slow noise swirling through it, a thin light
 * running along the crest and a light film grain. The crest is shaped by your
 * voice: a wide lobe swells with low tones, twin lobes with the middle and a
 * fine ripple with the highs. Loud moments overdrive it: rows shear, strips
 * tear and the colour channels split apart, like a signal pushed too hard.
 * With microphone access it follows your real voice; without it, a made-up
 * voice drives it. The words it hears arrive one by one at the top of the
 * card, each sharpening out of a blur, in a two line teleprompter window:
 * as you keep talking the text glides up and the oldest line fades away
 * through the top. A faint shimmer runs round the card's outline. Press the mic again (now a check) to
 * keep them, ready to send, or the cross to throw them away. A mode picker
 * opens upward with a sliding highlight, and the send button wakes once there
 * is text. Reduced motion keeps every state but holds the glow still.
 *
 * Engine: GSAP (a ticker feeding the voice into a WebGL fragment shader,
 * tweens for the listening energy, quick setters for the mic's level ring and
 * a blur in for each heard word), with motion/react for the height glide and
 * the menu.
 */

gsap.registerPlugin(useGSAP);

export interface VoicePromptMode {
  id: string;
  label: string;
  /** A short line under the name in the menu. */
  hint: string;
}

export interface VoicePromptProps {
  /** Placeholder for the empty field. */
  placeholder?: string;
  /** Modes in the picker. Default three. */
  modes?: VoicePromptMode[];
  /** Four colours of the glow: its deep core, body, lit crest and outer bloom. Default dusk. */
  colors?: string[];
  /** Card theme. Default `"light"`. */
  theme?: "light" | "dark";
  /** Ask for the microphone so the wave follows a real voice. Default `true`. */
  microphone?: boolean;
  /** What the demo "hears", revealed word by word while listening. */
  script?: string;
  /** Called on send. */
  onSubmit?: (prompt: { text: string; mode: string }) => void;
  /** Called by the plus button. */
  onAttach?: () => void;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const POP: Transition = { type: "spring", stiffness: 520, damping: 30 };
const OPEN = 136;

const DEFAULT_MODES: VoicePromptMode[] = [
  { id: "agent", label: "Agent", hint: "Plans and does the steps" },
  { id: "chat", label: "Chat", hint: "Quick back and forth" },
  { id: "research", label: "Research", hint: "Reads widely, cites sources" },
];

const DEFAULT_COLORS = ["#3b2fd6", "#7b5cf5", "#ec6fb3", "#ffc9a8"];

const VERTEX = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

/**
 * A soft tide of colour rising from the bottom. Its crest is a breathing arch,
 * plus a wide lobe for low voices, twin lobes for the middle and a fine ripple
 * for the highs, roughened by drifting noise. Inside, the colour deepens from a
 * lit crest to a dark core with slow noise swirling through it; a thin light
 * runs along the crest, and a light film grain sits on top. Loud moments (e)
 * shear rows, tear random strips and split the colour channels apart.
 */
const FRAGMENT = `precision highp float;
uniform vec2 r;uniform float t;uniform float lvl;uniform float e;uniform vec3 bd;uniform float ink;
uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
vec4 tide(vec2 uv){
  float x=uv.x-.5;
  float arch=(.13+.03*sin(t*1.1))+e*(.2+lvl*.24);
  float crest=arch*(1.-x*x*2.)
    +e*(bd.x*.07*exp(-x*x*7.)
    +bd.y*.05*(exp(-pow(x-.27+.03*sin(t*.7),2.)*20.)+exp(-pow(x+.27-.03*sin(t*.9),2.)*20.))
    +bd.z*.015*sin(uv.x*14.-t*3.))
    +.035*sin(uv.x*5.+t*(.9+lvl))*(.4+lvl)
    +(.04+.06*lvl)*(fbm(vec2(uv.x*3.2-t*(.4+lvl*.6),t*.35))-.5);
  float d=uv.y-crest;
  float body=smoothstep(.2,-.24,d);
  float g=fbm(vec2(uv.x*2.2+t*.22,uv.y*2.4-t*.3));
  vec3 c=mix(c3,c2,smoothstep(.05,-.08,d)+g*.2);
  c=mix(c,c1,smoothstep(-.06,-.24,d)*(.65+g*.35));
  c=mix(c,c0,smoothstep(-.2,-.5,d)*(.7+g*.3));
  float rim=exp(-pow(d/(.012+.012*lvl*e),2.))*(.25+.55*e);
  float side=smoothstep(0.,.5,1.-abs(x)*1.9);
  return vec4(c,clamp(body*(.5+.5*side)*(.7+.3*e),0.,1.)+rim*side*.5);
}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  float k=max(0.,lvl-.18)*e*1.3;
  float strip=step(.84,n(vec2(floor(uv.y*34.),floor(t*10.))));
  uv.x+=(sin(uv.y*52.+t*12.)*.004+strip*(n(vec2(uv.y*90.,t*22.))-.5)*.06)*k;
  uv.y+=sin(uv.x*26.-t*6.)*.006*k;
  float ca=.003+.014*k;
  vec4 a=tide(uv+vec2(ca,0.)),b=tide(uv),z=tide(uv-vec2(ca,0.));
  vec3 col=vec3(a.r,b.g,z.b);
  float al=clamp(b.a,0.,1.);
  float gr=h(gl_FragCoord.xy+fract(t*7.3)*vec2(113.,71.))-.5;
  col+=gr*.045*al;
  col=mix(col,col*1.15,ink);
  gl_FragColor=vec4(clamp(col,0.,1.)*al,al);
}`;
const DEFAULT_SCRIPT =
  "Book a quiet table for two on Friday and remind me an hour before. Also check if they have a garden seat, and send the address to Sam so we can meet there after work.";
/** Lines the heard words show at once, and their height in px (leading-7). */
const LINES = 2;
const LINE = 28;

const rgb = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

export const VoicePrompt = React.forwardRef<HTMLDivElement, VoicePromptProps>(
  function VoicePrompt(
    {
      placeholder = "Ask me anything",
      modes = DEFAULT_MODES,
      colors = DEFAULT_COLORS,
      theme = "light",
      microphone = true,
      script = DEFAULT_SCRIPT,
      onSubmit,
      onAttach,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const dark = theme === "dark";
    const uid = React.useId();
    const root = React.useRef<HTMLDivElement>(null);
    const canvas = React.useRef<HTMLCanvasElement>(null);
    const ring = React.useRef<HTMLSpanElement>(null);
    const words = React.useRef<HTMLParagraphElement>(null);
    const [scrolled, setScrolled] = React.useState(false);
    const field = React.useRef<HTMLTextAreaElement>(null);
    const [text, setText] = React.useState("");
    const [height, setHeight] = React.useState(24);
    const [listening, setListening] = React.useState(false);
    const [heard, setHeard] = React.useState(0);
    const [mode, setMode] = React.useState(modes[0]!.id);
    const [menu, setMenu] = React.useState(false);
    const [hover, setHover] = React.useState<string | null>(null);
    const said = React.useMemo(
      () => script.split(/\s+/).filter(Boolean),
      [script],
    );
    const current = modes.find((m) => m.id === mode) ?? modes[0]!;
    const ready = text.trim().length > 0 && !listening;

    // Live values the ticker reads without re-rendering.
    const live = React.useRef({
      energy: { v: 0 },
      listening: false,
      analyser: null as AnalyserNode | null,
      stream: null as MediaStream | null,
      audio: null as AudioContext | null,
      heard: 0,
    });

    React.useImperativeHandle(ref, () => root.current!);

    // Grow the field with its text, up to three lines.
    React.useLayoutEffect(() => {
      const el = field.current;
      if (!el) return;
      el.style.height = "0px";
      const next = Math.min(72, Math.max(24, el.scrollHeight));
      el.style.height = `${next}px`;
      setHeight(next);
    }, [text]);

    // Close the mode menu on a click elsewhere or Escape.
    React.useEffect(() => {
      if (!menu) return;
      const away = (e: PointerEvent) => {
        if (!(e.target as Element).closest?.(`[data-menu="${uid}"]`))
          setMenu(false);
      };
      const esc = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        setMenu(false);
      };
      document.addEventListener("pointerdown", away);
      document.addEventListener("keydown", esc, true);
      return () => {
        document.removeEventListener("pointerdown", away);
        document.removeEventListener("keydown", esc, true);
      };
    }, [menu, uid]);

    const release = () => {
      const l = live.current;
      l.stream?.getTracks().forEach((t) => t.stop());
      void l.audio?.close().catch(() => {});
      l.stream = null;
      l.audio = null;
      l.analyser = null;
    };
    React.useEffect(() => release, []);

    const start = async () => {
      setHeard(0);
      setScrolled(false);
      live.current.heard = 0;
      live.current.listening = true;
      setListening(true);
      gsap.to(live.current.energy, {
        v: 1,
        duration: still ? 0 : 0.9,
        ease: "power3.out",
      });
      if (!microphone || !navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // The user may have stopped before the permission prompt was answered.
        if (!live.current.listening) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const audio = new AudioContext();
        const analyser = audio.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.7;
        audio.createMediaStreamSource(stream).connect(analyser);
        Object.assign(live.current, { stream, audio, analyser });
      } catch {
        // No microphone or no permission: the made-up voice keeps going.
      }
    };

    const stop = (keep: boolean) => {
      live.current.listening = false;
      release();
      setListening(false);
      gsap.to(live.current.energy, {
        v: 0,
        duration: still ? 0 : 0.7,
        ease: "power2.inOut",
      });
      if (keep && live.current.heard > 0) {
        const got = said.slice(0, live.current.heard).join(" ");
        setText((t) => (t.trim() ? `${t.trimEnd()} ${got}` : got));
      }
      requestAnimationFrame(() => field.current?.focus());
    };

    const send = () => {
      if (!ready) return;
      onSubmit?.({ text: text.trim(), mode });
      setText("");
    };

    // Each newly heard word sharpens out of a blur, and past two lines the
    // text glides up so the newest line always sits at the bottom.
    useGSAP(
      () => {
        const p = words.current;
        if (!heard || !p) return;
        const over = p.offsetHeight > LINES * LINE;
        setScrolled(over);
        gsap.to(p, {
          y: Math.min(0, LINES * LINE - p.offsetHeight),
          duration: still ? 0 : 0.7,
          ease: "power3.out",
          overwrite: true,
        });
        if (still) return;
        const last = words.current?.querySelector<HTMLElement>(
          `[data-word="${heard - 1}"]`,
        );
        if (last)
          gsap.fromTo(
            last,
            { opacity: 0, y: 8, filter: "blur(8px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.5,
              ease: "power3.out",
            },
          );
      },
      { dependencies: [heard, still] },
    );

    // The glow: a GSAP ticker feeds the voice into a WebGL shader that paints a
    // soft noisy tide with a lit crest.
    useGSAP(
      () => {
        const el = canvas.current!;
        const gl = el.getContext("webgl", {
          antialias: false,
          premultipliedAlpha: true,
          alpha: true,
        });
        const setScale = ring.current
          ? gsap.quickSetter(ring.current, "scale")
          : null;
        const setRing = ring.current
          ? gsap.quickSetter(ring.current, "opacity")
          : null;
        const tones = colors.map(rgb);
        const stop = (i: number) =>
          tones[Math.min(tones.length - 1, i)]!.map((c) => c / 255) as [
            number,
            number,
            number,
          ];
        let draw = () => {};
        if (gl) {
          const shader = (type: number, src: string) => {
            const s = gl.createShader(type)!;
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
          };
          const prog = gl.createProgram()!;
          gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERTEX));
          gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAGMENT));
          gl.linkProgram(prog);
          gl.useProgram(prog);
          gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW,
          );
          const at = gl.getAttribLocation(prog, "p");
          gl.enableVertexAttribArray(at);
          gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
          const u = (name: string) => gl.getUniformLocation(prog, name);
          const U = {
            r: u("r"),
            t: u("t"),
            lvl: u("lvl"),
            e: u("e"),
            bd: u("bd"),
            ink: u("ink"),
          };
          // Ramp: core, body, crest light, and the soft outer bloom.
          gl.uniform3fv(u("c0"), stop(0));
          gl.uniform3fv(u("c1"), stop(1));
          gl.uniform3fv(u("c2"), stop(2));
          gl.uniform3fv(u("c3"), stop(3));
          gl.uniform1f(U.ink, dark ? 1 : 0);
          draw = () => {
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.max(1, Math.round(el.clientWidth * dpr));
            const h = Math.max(1, Math.round(el.clientHeight * dpr));
            if (el.width !== w || el.height !== h) {
              el.width = w;
              el.height = h;
            }
            gl.viewport(0, 0, w, h);
            gl.uniform2f(U.r, w, h);
            gl.uniform1f(U.t, t);
            gl.uniform1f(U.lvl, level);
            gl.uniform1f(U.e, live.current.energy.v);
            gl.uniform3f(U.bd, bands[0]!, bands[1]!, bands[2]!);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          };
        } else {
          // No WebGL: a still gradient in the same colours.
          const css = (i: number) =>
            `rgb(${tones[Math.min(tones.length - 1, i)]!.join(",")})`;
          el.style.background = `radial-gradient(120% 90% at 50% 110%, ${css(0)}, ${css(1)} 35%, ${css(3)} 60%, transparent 80%)`;
        }

        const bands = new Float32Array(3);
        const targets = new Float32Array(3);
        const freq = new Uint8Array(256);
        const wave = new Uint8Array(512);
        let t = 0;
        let level = 0;
        let target = 0;
        let talk = 0;
        let pause = 0;
        let syllable = { end: 0, start: 0, peak: 0, tone: [0, 0, 0] };

        const listen = (dt: number) => {
          const l = live.current;
          if (l.analyser) {
            // Real voice: loudness from the waveform, and three pitch bands.
            l.analyser.getByteTimeDomainData(wave);
            let sq = 0;
            for (let i = 0; i < wave.length; i++)
              sq += ((wave[i]! - 128) / 128) ** 2;
            target = Math.min(1, Math.sqrt(sq / wave.length) * 7);
            l.analyser.getByteFrequencyData(freq);
            const hz = l.analyser.context.sampleRate / l.analyser.fftSize;
            const band = (lo: number, hi: number) => {
              let m = 0;
              let c = 0;
              for (
                let i = Math.floor(lo / hz);
                i <= Math.min(freq.length - 1, Math.ceil(hi / hz));
                i++, c++
              )
                m += freq[i]!;
              return c ? Math.min(1, (m / c / 255) * 1.8) : 0;
            };
            targets[0] = band(90, 300);
            targets[1] = band(300, 1500);
            targets[2] = band(1500, 5000);
          } else if (l.listening) {
            // A made-up voice: syllables that swell and fall, with short pauses.
            if (t > syllable.end) {
              const rest = Math.random() < 0.14;
              const dur = rest
                ? 0.38 + Math.random() * 0.5
                : 0.11 + Math.random() * 0.19;
              syllable = {
                start: t,
                end: t + dur,
                peak: rest ? 0.12 : 0.45 + Math.random() * 0.4,
                tone: [Math.random(), Math.random(), Math.random()],
              };
            }
            const ph = Math.min(
              1,
              (t - syllable.start) / (syllable.end - syllable.start),
            );
            target = syllable.peak * Math.sin(Math.PI * ph) ** 0.7;
            for (let i = 0; i < 3; i++)
              targets[i] =
                target * (0.45 + 0.55 * syllable.tone[i]!) * [1, 0.8, 0.55][i]!;
          } else {
            target = 0.15;
            targets.fill(0.1);
          }
          // Quick to rise, slow to fall, so the tide swells and settles.
          const ease = (from: number, to: number) =>
            from + (to - from) * Math.min(1, dt * (to > from ? 4 : 1.6));
          for (let i = 0; i < 3; i++) bands[i] = ease(bands[i]!, targets[i]!);
          level = ease(level, target);
          // Words arrive while the voice is up, so they follow real speech too.
          if (l.listening && l.heard < said.length) {
            if (level > 0.22) talk += dt;
            else pause += dt;
            if (talk > 0.28 || (!l.analyser && pause > 1.2)) {
              talk = 0;
              pause = 0;
              l.heard += 1;
              setHeard(l.heard);
            }
          }
        };

        const tick = (_time: number, ms: number) => {
          const dt = Math.min(0.05, Math.max(0, ms / 1000));
          t += dt;
          listen(dt);
          draw();
          const E = live.current.energy.v;
          setScale?.(1 + level * 0.9 * E);
          setRing?.(0.6 * E);
        };
        if (still) {
          // Reduced motion: words still arrive, the glow is redrawn without moving.
          const timer = window.setInterval(() => {
            listen(0.1);
            draw();
          }, 100);
          draw();
          return () => window.clearInterval(timer);
        }
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      },
      { dependencies: [colors.join(), dark, still, said] },
    );

    const ink = dark ? "text-white" : "text-[#242423]";
    const soft = dark
      ? "bg-white/[0.08] ring-1 ring-white/10 hover:bg-white/[0.14]"
      : "bg-white/75 ring-1 ring-[#242423]/[0.08] hover:bg-white";
    const round =
      "relative grid size-10 shrink-0 cursor-pointer place-items-center rounded-full outline-none backdrop-blur-md transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400";

    return (
      <div
        ref={root}
        className={cn("relative w-[440px] max-w-full", className)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && listening) {
            e.stopPropagation();
            stop(false);
          }
        }}
      >
        <div
          className={cn(
            "relative rounded-[28px] p-3",
            dark
              ? "bg-[#242423] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_32px_-16px_rgba(0,0,0,0.6)]"
              : "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]",
            ink,
          )}
        >
          {/*
            A faint shimmer runs round the card's outline in the glow's colours: a
            slow conic gradient spinning behind a mask cut to a 1px border. It
            brightens a little while listening.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit] p-px transition-opacity duration-700"
            style={{
              opacity: listening ? 0.9 : dark ? 0.45 : 0.55,
              mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
            }}
          >
            <motion.div
              className="absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${colors[1] ?? colors[0]} 50deg, ${colors[2] ?? colors[0]} 90deg, transparent 140deg, transparent 180deg, ${colors[3] ?? colors[0]} 230deg, transparent 280deg)`,
              }}
              animate={still ? undefined : { rotate: 360 }}
              transition={{ duration: listening ? 4 : 8, ease: "linear", repeat: Infinity }}
            />
          </div>

          {/* The glow, behind everything. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          >
            <canvas
              ref={canvas}
              className="absolute inset-x-0 bottom-0 h-[208px] w-full"
            />
          </div>

          {/* The field, or what it hears while listening. */}
          <motion.div
            className="relative px-2 pt-1"
            animate={{ height: listening ? OPEN : height + 8 }}
            transition={
              still
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 32 }
            }
          >
            <textarea
              ref={field}
              value={text}
              rows={1}
              aria-label="Message"
              placeholder={`${placeholder}..`}
              disabled={listening}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              style={{ height }}
              className={cn(
                "block w-full resize-none bg-transparent text-base leading-6 outline-none transition-opacity duration-200 disabled:opacity-0",
                dark
                  ? "placeholder:text-white/40"
                  : "placeholder:text-zinc-400",
              )}
            />
            <AnimatePresence>
              {listening && (
                <motion.div
                  className="absolute inset-0 flex items-start justify-center px-4 pt-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    filter: still ? "blur(0px)" : "blur(6px)",
                  }}
                  transition={{ duration: 0.3, ease: GLIDE }}
                  aria-live="polite"
                >
                  {heard === 0 ? (
                    <motion.p
                      className={cn(
                        "text-lg",
                        dark ? "text-white/45" : "text-zinc-400",
                      )}
                      animate={still ? undefined : { opacity: [0.45, 1, 0.45] }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      Listening
                    </motion.p>
                  ) : (
                    // A two line window, like a teleprompter: once the words pass two lines
                    // they glide up and the oldest line fades away through the top edge.
                    <div
                      className="h-14 w-full max-w-[340px] overflow-hidden"
                      style={
                        scrolled
                          ? {
                              maskImage:
                                "linear-gradient(to bottom, transparent, black 24px)",
                              WebkitMaskImage:
                                "linear-gradient(to bottom, transparent, black 24px)",
                            }
                          : undefined
                      }
                    >
                      <p
                        ref={words}
                        className={cn(
                          "text-center text-lg font-medium leading-7 tracking-tight",
                          dark ? "text-white/90" : "text-[#242423]",
                        )}
                      >
                        {said.slice(0, heard).map((w, i) => (
                          <span
                            key={i}
                            data-word={i}
                            className={cn(
                              "inline-block transition-opacity duration-500",
                              i === heard - 1 &&
                                heard < said.length &&
                                "opacity-45",
                            )}
                          >
                            {w}
                            {i < heard - 1 ? " " : ""}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Tools */}
          <div className="relative mt-3 flex items-center gap-2">
            <button
              type="button"
              aria-label="Add"
              onClick={() => onAttach?.()}
              className={cn(round, soft)}
            >
              <PlusIcon className="size-[18px]" strokeWidth={2} />
            </button>
            <div className="flex-1" />

            {/* Mode picker */}
            <div className="relative" data-menu={uid}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={menu}
                onClick={() => setMenu((m) => !m)}
                className={cn(
                  "flex h-10 cursor-pointer items-center gap-1.5 rounded-full pl-4 pr-3 text-sm font-medium outline-none backdrop-blur-md transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400",
                  soft,
                )}
              >
                <span className="relative inline-grid overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={current.id}
                      initial={
                        still ? { opacity: 0 } : { opacity: 0, y: "70%" }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={still ? { opacity: 0 } : { opacity: 0, y: "-70%" }}
                      transition={{ duration: 0.25, ease: GLIDE }}
                    >
                      {current.label}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <motion.span
                  animate={{ rotate: menu ? 180 : 0 }}
                  transition={POP}
                  className="grid"
                >
                  <ChevronDownIcon
                    className={cn(
                      "size-4",
                      dark ? "text-white/50" : "text-zinc-500",
                    )}
                    strokeWidth={2.25}
                  />
                </motion.span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    role="listbox"
                    aria-label="Mode"
                    initial={
                      still
                        ? { opacity: 0 }
                        : { opacity: 0, y: 6, scale: 0.96, filter: "blur(4px)" }
                    }
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={
                      still
                        ? { opacity: 0 }
                        : { opacity: 0, y: 4, scale: 0.98, filter: "blur(4px)" }
                    }
                    transition={{ duration: 0.2, ease: GLIDE }}
                    style={{ transformOrigin: "50% 100%" }}
                    onPointerLeave={() => setHover(null)}
                    className={cn(
                      "absolute bottom-full right-0 z-20 mb-2 w-60 rounded-2xl p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_16px_40px_-12px_rgba(0,0,0,0.28)] ring-1",
                      dark
                        ? "bg-[#2e2e2d] ring-white/10"
                        : "bg-white ring-black/5",
                    )}
                  >
                    {modes.map((m) => {
                      const on = m.id === mode;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="option"
                          aria-selected={on}
                          onPointerEnter={() => setHover(m.id)}
                          onFocus={() => setHover(m.id)}
                          onClick={() => {
                            setMode(m.id);
                            setMenu(false);
                          }}
                          className="relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-left outline-none"
                        >
                          {(hover ?? mode) === m.id && (
                            <motion.span
                              layoutId={`${uid}-hover`}
                              transition={still ? { duration: 0 } : POP}
                              className={cn(
                                "absolute inset-0 rounded-xl",
                                dark
                                  ? "bg-white/[0.08]"
                                  : "bg-[#242423]/[0.06]",
                              )}
                            />
                          )}
                          <span className="relative">
                            <span className="block text-sm font-medium">
                              {m.label}
                            </span>
                            <span
                              className={cn(
                                "block text-xs",
                                dark ? "text-white/50" : "text-zinc-500",
                              )}
                            >
                              {m.hint}
                            </span>
                          </span>
                          {on && (
                            <CheckIcon
                              className="relative size-4"
                              strokeWidth={2.25}
                              aria-hidden
                            />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mic: starts listening, and while listening keeps what it heard. */}
            <button
              type="button"
              aria-label={listening ? "Stop and keep" : "Talk"}
              aria-pressed={listening}
              onClick={() => (listening ? stop(true) : void start())}
              className={cn(
                round,
                listening
                  ? dark
                    ? "bg-white text-[#242423]"
                    : "bg-[#242423] text-white"
                  : soft,
              )}
            >
              <span
                ref={ring}
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-full opacity-0",
                  dark ? "bg-white/30" : "bg-[#242423]/20",
                )}
              />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={listening ? "keep" : "mic"}
                  className="relative grid"
                  initial={
                    still
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.5, rotate: -45 }
                  }
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={
                    still
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.5, rotate: 45 }
                  }
                  transition={POP}
                >
                  {listening ? (
                    <CheckIcon className="size-[18px]" strokeWidth={2.25} />
                  ) : (
                    <MicIcon className="size-[18px]" strokeWidth={2} />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Cancel while listening, otherwise send. */}
            <AnimatePresence mode="popLayout" initial={false}>
              {listening ? (
                <motion.button
                  key="cancel"
                  type="button"
                  aria-label="Cancel"
                  onClick={() => stop(false)}
                  initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={still ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  transition={POP}
                  className={cn(round, soft)}
                >
                  <XIcon className="size-[18px]" strokeWidth={2.25} />
                </motion.button>
              ) : (
                <motion.button
                  key="send"
                  type="button"
                  aria-label="Send"
                  disabled={!ready}
                  onClick={send}
                  initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={still ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  transition={POP}
                  className={cn(
                    round,
                    "disabled:cursor-default",
                    ready
                      ? dark
                        ? "bg-white text-[#242423]"
                        : "bg-[#242423] text-white"
                      : dark
                        ? "bg-white/[0.06] text-white/35 ring-1 ring-white/10"
                        : "bg-white/60 text-zinc-400 ring-1 ring-[#242423]/[0.06]",
                  )}
                >
                  <ArrowUpIcon className="size-[18px]" strokeWidth={2.25} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  },
);