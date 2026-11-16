"use client";

/**
 * BellToggle, from https://motion-brew.com/components/bell-toggle
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { useGSAP } from "@gsap/react";
import { type ClassValue, clsx } from "clsx";
import gsap from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// BellToggle

/**
 * BellToggle
 *
 * Trigger: press. A pill toggle for notifications. Off, it is a soft gray
 * pill with a muted bell crossed by a slash. Pressing it turns it on: the
 * pill unfurls wider and turns white, the slash draws itself away, the
 * bell rings (it swings on its hanger while the clapper swings the other way
 * a beat behind, and two sound waves draw out on each side and fade), and the
 * label crossfades to the on text. Pressing again turns it off: the slash
 * strokes back across the bell, the bell gives a small droop, the label
 * crossfades back and the pill folds down to its gray rest. Hovering the on
 * pill gives the bell a little nudge. It is a real switch for screen readers,
 * and reduced motion keeps the changes but drops the swinging.
 *
 * Engine: gsap + @gsap/react for the bell (swing, clapper, waves and slash,
 * scoped with useGSAP), with motion/react for the pill's layout unfurl and
 * the label crossfade.
 */

gsap.registerPlugin(useGSAP);

export interface BellToggleProps {
  /** Whether it is on. Leave out to let the toggle keep its own state. */
  on?: boolean;
  /** Whether it starts on. Default `false`. */
  defaultOn?: boolean;
  /** Called with the new state. */
  onChange?: (on: boolean) => void;
  /** Label while off. Default `"Notify me"`. */
  label?: string;
  /** Label while on. Default `"Notifications on"`. */
  onLabel?: string;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const UNFURL = { type: "spring", stiffness: 420, damping: 32 } as const;

export const BellToggle = React.forwardRef<HTMLButtonElement, BellToggleProps>(
  function BellToggle(
    {
      on: controlled,
      defaultOn = false,
      onChange,
      label = "Notify me",
      onLabel = "Notifications on",
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const [inner, setInner] = React.useState(defaultOn);
    const on = controlled ?? inner;
    const bell = React.useRef<SVGSVGElement>(null);
    const first = React.useRef(true);

    const { contextSafe } = useGSAP(
      () => {
        // Rest state for whichever side we start on.
        gsap.set("[data-slash]", { strokeDashoffset: on ? 1 : 0 });
        gsap.set("[data-wave]", { strokeDashoffset: 1, opacity: 0 });
        gsap.set("[data-body], [data-clapper]", {
          rotation: 0,
          svgOrigin: "12 4",
        });
      },
      { scope: bell },
    );

    const ring = contextSafe(() => {
      if (still) {
        gsap.set("[data-slash]", { strokeDashoffset: 1 });
        return;
      }
      const tl = gsap.timeline();
      tl.to("[data-slash]", {
        strokeDashoffset: 1,
        duration: 0.25,
        ease: "power2.in",
      })
        // The bell swings on its hanger, each swing a little smaller.
        .to(
          "[data-body]",
          {
            keyframes: { rotation: [0, 22, -18, 13, -9, 5, -2, 0] },
            duration: 0.9,
            ease: "sine.inOut",
            svgOrigin: "12 4",
          },
          0.08,
        )
        // The clapper lags behind and swings the other way.
        .to(
          "[data-clapper]",
          {
            keyframes: { rotation: [0, -26, 22, -16, 10, -5, 0] },
            duration: 0.95,
            ease: "sine.inOut",
            svgOrigin: "12 4",
          },
          0.14,
        )
        // Sound waves draw out on both sides and fade.
        .fromTo(
          "[data-wave]",
          { strokeDashoffset: 1, opacity: 1, scale: 0.85, svgOrigin: "12 12" },
          {
            strokeDashoffset: 0,
            scale: 1.1,
            duration: 0.35,
            ease: "power2.out",
            stagger: 0.06,
          },
          0.15,
        )
        .to(
          "[data-wave]",
          { opacity: 0, duration: 0.35, ease: "power1.in" },
          0.6,
        );
    });

    const silence = contextSafe(() => {
      if (still) {
        gsap.set("[data-slash]", { strokeDashoffset: 0 });
        return;
      }
      gsap.killTweensOf("[data-body], [data-clapper], [data-wave]");
      gsap.set("[data-wave]", { opacity: 0 });
      gsap
        .timeline()
        // A small droop as it goes quiet, then the slash strokes across.
        .to("[data-body], [data-clapper]", {
          keyframes: { rotation: [0, -8, 0] },
          duration: 0.4,
          ease: "sine.inOut",
          svgOrigin: "12 4",
        })
        .to(
          "[data-slash]",
          { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" },
          0.05,
        );
    });

    const nudge = contextSafe(() => {
      if (!on || still) return;
      gsap.to("[data-body]", {
        keyframes: { rotation: [0, 9, -6, 0] },
        duration: 0.5,
        ease: "sine.inOut",
        svgOrigin: "12 4",
        overwrite: true,
      });
    });

    // Ring or silence whenever the state changes, but not on first render.
    React.useEffect(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      if (on) ring();
      else silence();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [on]);

    const toggle = () => {
      const next = !on;
      if (controlled === undefined) setInner(next);
      onChange?.(next);
    };

    return (
      <motion.button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={on ? onLabel : label}
        onClick={toggle}
        onPointerEnter={nudge}
        layout
        transition={still ? { duration: 0 } : UNFURL}
        style={{ borderRadius: 999 }}
        whileTap={still ? undefined : { scale: 0.96 }}
        className={cn(
          "inline-flex h-11 cursor-pointer items-center overflow-hidden whitespace-nowrap text-sm font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
          on
            ? "gap-2.5 bg-white pl-4 pr-5 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            : "gap-2 bg-[#242423]/6 pl-3.5 pr-4 text-zinc-600 hover:bg-[#242423]/10 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-white/12",
          className,
        )}
      >
        <motion.span
          layout="position"
          transition={still ? { duration: 0 } : UNFURL}
          className="grid"
        >
          <svg
            ref={bell}
            viewBox="0 0 24 24"
            className="size-[18px] overflow-visible"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {/* Sound waves, two on each side. */}
            <path
              data-wave
              d="M3.2 8.5a9 9 0 0 0 0 5"
              pathLength={1}
              strokeDasharray="1"
            />
            <path
              data-wave
              d="M20.8 8.5a9 9 0 0 1 0 5"
              pathLength={1}
              strokeDasharray="1"
            />
            <path
              data-wave
              d="M1 6.5a12.5 12.5 0 0 0 0 9"
              pathLength={1}
              strokeDasharray="1"
            />
            <path
              data-wave
              d="M23 6.5a12.5 12.5 0 0 1 0 9"
              pathLength={1}
              strokeDasharray="1"
            />
            {/* The clapper hangs below the bell and swings on its own. */}
            <g data-clapper>
              <path d="M10.2 19.4a1.9 1.9 0 0 0 3.6 0" />
            </g>
            <g data-body>
              <path d="M12 3v1" />
              <path d="M6.2 10.4a5.8 5.8 0 0 1 11.6 0c0 3.9 1.4 5.6 2.2 6.4H4c.8-.8 2.2-2.5 2.2-6.4Z" />
            </g>
            {/* The slash that silences it. */}
            <path
              data-slash
              d="M4 3.5 20 20.5"
              pathLength={1}
              strokeDasharray="1"
            />
          </svg>
        </motion.span>
        <motion.span
          layout="position"
          transition={still ? { duration: 0 } : UNFURL}
          className="relative inline-grid overflow-hidden"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={on ? "on" : "off"}
              initial={
                still
                  ? { opacity: 0 }
                  : { opacity: 0, y: "60%", filter: "blur(4px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                still
                  ? { opacity: 0 }
                  : { opacity: 0, y: "-60%", filter: "blur(4px)" }
              }
              transition={{ duration: 0.3, ease: GLIDE }}
            >
              {on ? onLabel : label}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </motion.button>
    );
  },
);