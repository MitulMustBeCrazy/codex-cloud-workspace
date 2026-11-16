"use client";

/**
 * WaveText, from https://motion-brew.com/components/wave-text
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { animate, type AnimationPlaybackControls, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// WaveText

/**
 * WaveText
 *
 * Trigger: hover. A heading whose words warp like liquid when touched. Each
 * word carries its own SVG filter: fractal noise drives a displacement map that
 * bends the glyphs into flowing bands. Hovering a word ramps the displacement
 * up and keeps the noise drifting, so the warp flows rather than freezing;
 * leaving eases it back to crisp type. The filter is only attached while a word
 * is warping, so idle text costs nothing. Touch taps a word to ripple it once.
 * Reduced motion leaves the type still.
 *
 * Engine: motion/react (motion values animated on enter and leave, written
 * straight into the SVG filter attributes, no re-renders per frame).
 */

const EASE_IN = [0.33, 1, 0.68, 1] as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export interface WaveTextProps {
  /** The heading text; each word warps on its own. Default `"Bend the rules"`. */
  text?: string;
  /** Element to render. Default `"h2"`. */
  as?: "h1" | "h2" | "h3" | "p" | "div";
  /** Peak displacement in px. Higher bends harder. Default `40`. */
  strength?: number;
  /** Seconds for one full drift of the wave while hovered. Default `1.8`. */
  speed?: number;
  className?: string;
}

function Word({ word, strength, speed, still }: { word: string; strength: number; speed: number; still: boolean }) {
  const id = `wave-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const turb = React.useRef<SVGFETurbulenceElement>(null);
  const disp = React.useRef<SVGFEDisplacementMapElement>(null);
  const scale = useMotionValue(0);
  const phase = useMotionValue(0);
  const drift = React.useRef<AnimationPlaybackControls | null>(null);
  const ramp = React.useRef<AnimationPlaybackControls | null>(null);
  const [live, setLive] = React.useState(false);

  // Write animation values straight into the filter.
  useMotionValueEvent(scale, "change", (v) => disp.current?.setAttribute("scale", v.toFixed(2)));
  useMotionValueEvent(phase, "change", (p) => {
    const fx = 0.006 + 0.004 * Math.sin(p);
    const fy = 0.05 + 0.025 * Math.cos(p * 0.7);
    turb.current?.setAttribute("baseFrequency", `${fx.toFixed(4)} ${fy.toFixed(4)}`);
  });

  React.useEffect(
    () => () => {
      drift.current?.stop();
      ramp.current?.stop();
    },
    [],
  );

  const enter = () => {
    if (still) return;
    setLive(true);
    ramp.current?.stop();
    ramp.current = animate(scale, strength, { duration: 0.45, ease: EASE_IN });
    if (!drift.current) {
      drift.current = animate(phase, phase.get() + Math.PI * 2, { duration: speed, ease: "linear", repeat: Infinity });
    }
  };

  const leave = () => {
    if (still) return;
    ramp.current?.stop();
    ramp.current = animate(scale, 0, {
      duration: 0.7,
      ease: EASE_OUT,
      onComplete: () => {
        drift.current?.stop();
        drift.current = null;
        setLive(false);
      },
    });
  };

  return (
    <span
      onPointerEnter={(e) => e.pointerType === "mouse" && enter()}
      onPointerLeave={(e) => e.pointerType === "mouse" && leave()}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        enter();
        window.setTimeout(leave, 650);
      }}
      className="relative inline-block cursor-default"
      style={live ? { filter: `url(#${id})` } : undefined}
    >
      <svg aria-hidden className="absolute size-0 overflow-hidden">
        <filter id={id} x="-15%" y="-40%" width="130%" height="180%" colorInterpolationFilters="sRGB">
          <feTurbulence
            ref={turb}
            type="fractalNoise"
            baseFrequency="0.006 0.05"
            numOctaves={1}
            seed={3}
            result="noise"
          />
          <feDisplacementMap
            ref={disp}
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      {word}
    </span>
  );
}

export const WaveText = React.forwardRef<HTMLElement, WaveTextProps>(function WaveText(
  { text = "Bend the rules", as: Tag = "h2", strength = 28, speed = 1.8, className },
  ref,
) {
  const still = !!useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag ref={ref as React.Ref<never>} aria-label={text} className={cn("select-none", className)}>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span aria-hidden>
            <Word word={word} strength={strength} speed={speed} still={still} />
          </span>
          {i < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </Tag>
  );
});